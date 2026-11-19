CREATE TABLE IF NOT EXISTS scenes (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  project TEXT NOT NULL,
  title TEXT NOT NULL,
  version INTEGER NOT NULL,
  publication TEXT,
  UNIQUE(owner, project)
);
CREATE TABLE IF NOT EXISTS blocks (
  owner TEXT NOT NULL,
  digest TEXT NOT NULL,
  size INTEGER NOT NULL,
  PRIMARY KEY(owner, digest)
);

CREATE TABLE IF NOT EXISTS studioCapacity (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  bytes INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 900000000,
  CONSTRAINT freeStorage CHECK (bytes BETWEEN 0 AND capacity)
);

CREATE TABLE IF NOT EXISTS assets (
  storageKey TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  owner TEXT NOT NULL,
  digest TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size > 0),
  state TEXT NOT NULL DEFAULT 'reserved' CHECK (state IN ('reserved','writing','ready','retired')),
  writeTime INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS activeAssets ON assets(owner,digest) WHERE state <> 'retired';
CREATE INDEX IF NOT EXISTS assetCleanup ON assets(state,writeTime);
CREATE TRIGGER IF NOT EXISTS reserveBytes AFTER INSERT ON assets BEGIN
  UPDATE studioCapacity SET bytes = bytes + NEW.size WHERE id = 1;
END;
CREATE TRIGGER IF NOT EXISTS releaseBytes AFTER DELETE ON assets BEGIN
  UPDATE studioCapacity SET bytes = bytes - OLD.size WHERE id = 1;
END;

CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  project TEXT NOT NULL,
  scene TEXT NOT NULL,
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  publication TEXT NOT NULL,
  expires INTEGER NOT NULL DEFAULT (unixepoch() + 3600),
  committed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS uploadExpiration ON uploads(expires);
CREATE TABLE IF NOT EXISTS uploadAssets (
  upload TEXT NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  asset TEXT NOT NULL REFERENCES assets(storageKey),
  PRIMARY KEY(upload,asset)
);
CREATE INDEX IF NOT EXISTS assetUploads ON uploadAssets(asset);
CREATE TABLE IF NOT EXISTS sceneAssets (
  scene TEXT NOT NULL REFERENCES scenes(id),
  asset TEXT NOT NULL REFERENCES assets(storageKey),
  PRIMARY KEY(scene,asset)
);
CREATE INDEX IF NOT EXISTS assetScenes ON sceneAssets(asset);
CREATE TRIGGER IF NOT EXISTS finishPublication AFTER UPDATE OF committed ON uploads WHEN NEW.committed=1 BEGIN
  INSERT INTO scenes(id,owner,project,title,version,publication)
    VALUES(NEW.scene,NEW.owner,NEW.project,NEW.title,NEW.version+1,NEW.publication)
    ON CONFLICT(owner,project) DO UPDATE SET title=excluded.title,version=excluded.version,publication=excluded.publication;
  DELETE FROM sceneAssets WHERE scene=NEW.scene;
  INSERT INTO sceneAssets SELECT NEW.scene,asset FROM uploadAssets WHERE upload=NEW.id;
  DELETE FROM uploads WHERE id=NEW.id;
END;
CREATE TRIGGER IF NOT EXISTS withdrawAssets AFTER UPDATE OF publication ON scenes WHEN NEW.publication IS NULL BEGIN
  DELETE FROM sceneAssets WHERE scene=NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS verifyStorageMigration BEFORE INSERT ON studioCapacity
WHEN EXISTS (
  SELECT 1 FROM scenes s,json_each(s.publication,'$.files') f,json_each(f.value,'$.blocks') b
  WHERE NOT EXISTS (
    SELECT 1 FROM sceneAssets r JOIN assets a ON r.asset=a.storageKey
    WHERE r.scene=s.id AND a.owner=s.owner AND a.digest=b.value AND a.state='ready'
      AND a.size=min(8388608,(f.value->>'$.size')-b.key*8388608)
  )
) BEGIN
  SELECT RAISE(ABORT,'Live scene files must be migrated before enabling KV');
END;
INSERT INTO studioCapacity(id,bytes) SELECT 1,(SELECT coalesce(sum(size),0) FROM assets)
  WHERE NOT EXISTS (SELECT 1 FROM studioCapacity);

CREATE TRIGGER IF NOT EXISTS requireReservedInsert BEFORE INSERT ON scenes
WHEN NEW.publication IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM uploads WHERE scene=NEW.id AND owner=NEW.owner AND committed=1 AND version+1=NEW.version
) BEGIN
  SELECT RAISE(ABORT,'Publication requires a completed upload');
END;
CREATE TRIGGER IF NOT EXISTS requireReservedUpdate BEFORE UPDATE OF publication ON scenes
WHEN NEW.publication IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM uploads WHERE scene=NEW.id AND owner=NEW.owner AND committed=1 AND version+1=NEW.version
) BEGIN
  SELECT RAISE(ABORT,'Publication requires a completed upload');
END;
