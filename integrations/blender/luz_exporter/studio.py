"""Private, immutable export snapshots and their loopback-only browser transport."""

import hashlib
import hmac
import json
import os
import secrets
import subprocess
import sys
import tempfile
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from uuid import uuid4

STUDIO_ORIGIN = 'https://studio.luzjs.dev'
SIZE_LIMIT = 250 * 1024 * 1024
DOCUMENT_TYPES = ('.scene.json', '.entity.json', '.model.json', '.animation.json')
IMAGE_TYPES = ('.png', '.jpg', '.jpeg', '.webp', '.hdr', '.ktx')
session = None


def collect_snapshot(scene, directory, project):
    root = scene.parent.parent if scene.parent.name.lower() == 'scenes' else scene.parent
    files = {}
    total = 0

    def add(base, reference, extensions):
        nonlocal total
        if not isinstance(reference, str) or not reference or any(character in reference for character in ':?#%\\'):
            raise ValueError(f'Invalid scene dependency: {reference}')
        if Path(reference).is_absolute() or not reference.lower().endswith(extensions):
            raise ValueError(f'Unsupported scene dependency: {reference}')
        path = (base / reference).resolve()
        name = path.relative_to(root).as_posix()
        if name in files:
            return
        if not path.is_file():
            raise ValueError(f'Missing scene dependency: {name}')
        size = path.stat().st_size
        total += size
        if total > SIZE_LIMIT or len(files) >= 4096:
            raise ValueError('Scene exceeds 250 MiB or 4096 files')
        contents = path.read_bytes()
        digest = hashlib.sha256(contents).hexdigest()
        files[name] = {'path': name, 'size': len(contents), 'digest': digest}
        target = directory / digest
        if not target.exists():
            temporary = directory / f'{digest}.tmp'
            temporary.write_bytes(contents)
            temporary.replace(target)
        if name.lower().endswith(DOCUMENT_TYPES):
            document = json.loads(contents)
            if name.lower().endswith('.scene.json'):
                for key in ('sky', 'radiance', 'irradiance'):
                    reference = (document.get('environment') or {}).get(key)
                    if reference:
                        add(path.parent, reference, IMAGE_TYPES)
                for entity in document.get('entities', {}).values():
                    visit_entity(entity, path.parent)
            elif name.lower().endswith('.entity.json'):
                visit_entity(document, path.parent)
            elif name.lower().endswith('.model.json'):
                visit_model(document, path.parent)

    def visit_entity(entity, base):
        if 'entity' in entity:
            add(base, entity['entity'], ('.entity.json',))
        for component in entity.get('components', {}).values():
            if isinstance(component, str):
                add(base, component, ('.model.json',))
            elif component.get('type') == 'model':
                visit_model(component, base)
        for child in entity.get('children', {}).values():
            visit_entity(child, base)

    def visit_model(model, base):
        if 'geometry' in model:
            add(base, model['geometry']['uri'], ('.geometry',))
        for animation in model.get('animations', {}).values():
            add(base, animation, ('.animation.json',))
        for material in model.get('materials', {}).values():
            for node in material.get('graph', {}).get('nodes', {}).values():
                if node.get('type') == 'imageTexture' and node.get('surface', {}).get('path'):
                    add(root, node['surface']['path'], IMAGE_TYPES)

    add(scene.parent, scene.name, ('.scene.json',))
    return {
        'project': project,
        'revision': uuid4().hex,
        'entry': scene.relative_to(root).as_posix(),
        'files': list(files.values()),
    }


def refresh_snapshot(filepath, error=None):
    if not session or Path(filepath).resolve() != session['scene']:
        return
    directory = Path(session['directory'].name)
    try:
        state = {'error': error} if error else collect_snapshot(session['scene'], directory, session['project'])
    except (OSError, ValueError, KeyError, TypeError, RecursionError) as failure:
        state = {'error': str(failure)}
    temporary = directory / 'state.tmp'
    temporary.write_text(json.dumps(state), encoding='utf-8')
    temporary.replace(directory / 'state.json')
    if 'files' in state:
        active = {file['digest'] for file in state['files']}
        for file in directory.iterdir():
            if len(file.name) == 64 and file.name not in active:
                try:
                    file.unlink()
                except OSError:
                    pass


def close_connection():
    global session
    if session:
        process = session.get('process')
        if process:
            process.stdin.close()
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()
        session['directory'].cleanup()
        session = None


def open_connection(filepath, project):
    global session
    close_connection()
    directory = tempfile.TemporaryDirectory(prefix='luz-studio-')
    session = {'directory': directory, 'scene': Path(filepath).resolve(), 'project': project}
    try:
        refresh_snapshot(filepath)
        interpreter = (
            Path(sys.prefix)
            / 'bin'
            / ('python.exe' if os.name == 'nt' else f'python{sys.version_info.major}.{sys.version_info.minor}')
        )
        if not interpreter.is_file():
            interpreter = Path(sys.executable)
        if 'blender' in interpreter.stem.lower():
            raise RuntimeError('The bundled Python interpreter could not be found')
        process = subprocess.Popen(
            [str(interpreter), '-I', __file__, directory.name],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            text=True,
            creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0),
        )
        session['process'] = process
        connection = json.loads(process.stdout.readline())
        webbrowser.open(f'{STUDIO_ORIGIN}/#connect={connection["port"]}.{connection["ticket"]}')
    except Exception:
        close_connection()
        raise


def serve_connection(directory):
    ticket = secrets.token_urlsafe(32)
    credential = secrets.token_urlsafe(32)
    lock = threading.Lock()

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_args):
            pass

        def reply(self, status, contents=b'', media_type='application/octet-stream'):
            self.send_response(status)
            self.send_header('Content-Type', media_type)
            self.send_header('Content-Length', str(len(contents)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.send_header(
                'Content-Security-Policy',
                "default-src 'none'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'",
            )
            self.end_headers()
            self.wfile.write(contents)

        def has_local_host(self):
            return self.headers.get('Host') == f'127.0.0.1:{self.server.server_port}'

        def do_POST(self):
            nonlocal ticket, credential
            with lock:
                if (
                    not self.has_local_host()
                    or self.path != '/pair'
                    or self.headers.get('Origin') != f'http://127.0.0.1:{self.server.server_port}'
                    or not hmac.compare_digest(self.headers.get('Authorization', ''), f'Bearer {ticket}')
                ):
                    return self.reply(403)
                ticket = secrets.token_urlsafe(32)
                credential = secrets.token_urlsafe(32)
                self.reply(200, json.dumps({'credential': credential, 'ticket': ticket}).encode(), 'application/json')

        def do_GET(self):
            if not self.has_local_host():
                return self.reply(403)
            if self.path == '/':
                return self.reply(
                    200,
                    b'<!doctype html><meta charset="utf-8"><title>luz Blender connection</title><p>Keep this tab open while previewing Blender exports in luz studio.</p><script src="/connection.js"></script>',
                    'text/html',
                )
            if self.path == '/connection.js':
                return self.reply(200, Path(__file__).with_name('connection.js').read_bytes(), 'text/javascript')
            if not hmac.compare_digest(self.headers.get('Authorization', ''), f'Bearer {credential}'):
                return self.reply(403)
            name = self.path[1:]
            if name != 'state.json' and (
                len(name) != 64 or any(character not in '0123456789abcdef' for character in name)
            ):
                return self.reply(404)
            try:
                contents = (directory / name).read_bytes()
            except FileNotFoundError:
                return self.reply(404)
            self.reply(200, contents)

    with ThreadingHTTPServer(('127.0.0.1', 0), Handler) as server:
        print(json.dumps({'port': server.server_port, 'ticket': ticket}), flush=True)

        def wait_for_blender():
            sys.stdin.buffer.read()
            server.shutdown()

        threading.Thread(target=wait_for_blender, daemon=True).start()
        server.serve_forever()


if __name__ == '__main__':
    serve_connection(Path(sys.argv[1]))
