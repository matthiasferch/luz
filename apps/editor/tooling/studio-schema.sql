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
