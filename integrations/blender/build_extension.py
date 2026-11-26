from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

source = Path(__file__).resolve().parent / 'luz_exporter'
destination = source.parents[2] / 'dist' / 'luz-exporter.zip'
destination.parent.mkdir(exist_ok=True)
with ZipFile(destination, 'w') as archive:
    for filename in ('blender_manifest.toml', '__init__.py', 'exporter.py', 'studio.py', 'connection.js', 'LICENSE'):
        entry = ZipInfo(filename)
        entry.create_system = 3
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, (source / filename).read_bytes().replace(b'\r\n', b'\n'), compress_type=ZIP_DEFLATED)
