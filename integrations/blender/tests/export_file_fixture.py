"""Run with Blender --background --factory-startup --python-exit-code 1 --python this_file."""

import contextlib
import errno
import hashlib
import importlib.util
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import bpy

spec = importlib.util.spec_from_file_location(
    'luz_exporter_fixture', Path(__file__).resolve().parents[1] / 'luz_exporter' / 'exporter.py'
)
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


def create_lock_error(code=5):
    error = PermissionError(errno.EACCES, 'File is locked')
    error.winerror = code
    return error


class ExportFileTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='luz-export-files-')
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / 'fixture.scene.json'
        self.path.write_text('{"original": true}', encoding='utf-8')

    def create_animation_clip(self, distance=2):
        return {
            'duration': 1,
            'isAutoplayEnabled': False,
            'keyframes': {
                'Root': {
                    'translation': [{'time': 0, 'value': [0, 0, 0]}, {'time': 1, 'value': [distance, 0, 0]}],
                    'rotation': [{'time': 0, 'value': [0, 0, 0, 1]}],
                    'scale': [{'time': 0, 'value': [1, 1, 1]}],
                }
            },
        }

    def test_animation_documents_share_content_across_aliases_and_keep_distinct_clips(self):
        root = Path(self.directory.name)
        models = root / 'models'
        models.mkdir()
        first_path, second_path = models / 'first.model.json', models / 'second.model.json'
        first = {'animations': {'Walk': self.create_animation_clip()}}
        second = {'animations': {'March': self.create_animation_clip(), 'Run': self.create_animation_clip(4)}}
        exporter.write_animation_files(str(first_path), first)
        exporter.write_animation_files(str(second_path), second)
        self.assertEqual(first['animations']['Walk'], second['animations']['March'])
        self.assertNotEqual(second['animations']['Run'], second['animations']['March'])
        self.assertEqual(len(list((root / 'animations').glob('*.animation.json'))), 2)
        document = json.loads((models / first['animations']['Walk']).read_text())
        self.assertEqual(document['type'], 'skeletalAnimation')
        self.assertEqual(document['schemaVersion'], 1)
        self.assertEqual(document['keyframes'], self.create_animation_clip()['keyframes'])
        del document['$schema']
        digest = hashlib.sha256(json.dumps(document, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        self.assertEqual(Path(first['animations']['Walk']).name, digest + '.animation.json')

    def test_animation_cleanup_preserves_shared_and_manual_files_and_fails_safe(self):
        root = Path(self.directory.name)
        models, entities = root / 'models', root / 'entities'
        models.mkdir()
        entities.mkdir()
        first_path, second_path = models / 'first-0123456789ab.model.json', models / 'second-abcdef012345.model.json'
        first = {'animations': {'Walk': self.create_animation_clip()}}
        second = {'animations': {'March': self.create_animation_clip()}}
        exporter.write_animation_files(str(first_path), first)
        exporter.write_animation_files(str(second_path), second)
        first_path.write_text(json.dumps(first))
        second_path.write_text(json.dumps(second))
        entity = entities / 'character.entity.json'
        entity.write_text(json.dumps({'models': ['../models/' + second_path.name]}))
        shared_path = (models / second['animations']['March']).resolve()
        manual_path = root / 'animations' / 'manual.animation.json'
        manual_path.write_text('{}')
        removed = exporter.cleanup_obsolete_model_exports(str(root))
        self.assertIn(str(first_path), removed)
        self.assertTrue(shared_path.exists())
        self.assertTrue(manual_path.exists())
        stale_path = root / 'animations' / ('0' * 64 + '.animation.json')
        stale_path.write_text('{}')
        invalid_clip = {'type': 'skeletalAnimation', 'schemaVersion': 1, **self.create_animation_clip()}
        invalid_clip['keyframes']['Root']['scale'] = []
        for invalid in ('{', '[]', '{"type":"skeletalAnimation","schemaVersion":2}', json.dumps(invalid_clip)):
            shared_path.write_text(invalid)
            self.assertEqual(exporter.cleanup_obsolete_model_exports(str(root)), [])
            self.assertTrue(stale_path.exists())
        shared_path.unlink()
        self.assertEqual(exporter.cleanup_obsolete_model_exports(str(root)), [])
        self.assertTrue(stale_path.exists())
        entity.write_text('{}')
        removed = exporter.cleanup_obsolete_model_exports(str(root))
        self.assertIn(str(stale_path), removed)
        self.assertTrue(manual_path.exists())

    def test_animation_cleanup_follows_external_entities_and_inline_models(self):
        root = Path(self.directory.name)
        models, entities = root / 'models', root / 'entities'
        models.mkdir()
        entities.mkdir()
        external = root / 'character.entity.json'
        model = {'type': 'model', 'animations': {'Walk': self.create_animation_clip()}}
        exporter.write_animation_files(str(models / 'temporary.model.json'), model)
        reference = model['animations']['Walk']
        model['animations']['Walk'] = reference.removeprefix('../')
        external.write_text(json.dumps({'components': {'Visual': model}}))
        (entities / 'reference.entity.json').write_text(json.dumps({'entity': '../character.entity.json'}))
        shared_path = (models / reference).resolve()
        self.assertEqual(exporter.cleanup_obsolete_model_exports(str(root)), [])
        self.assertTrue(shared_path.exists())

    def test_animation_cleanup_preserves_dependencies_of_manually_named_models(self):
        root = Path(self.directory.name)
        models = root / 'models'
        models.mkdir()
        model_path = models / 'manual.model.json'
        model = {'animations': {'Walk': self.create_animation_clip()}}
        exporter.write_animation_files(str(model_path), model)
        model_path.write_text(json.dumps(model))
        animation_path = (models / model['animations']['Walk']).resolve()
        self.assertEqual(exporter.cleanup_obsolete_model_exports(str(root)), [])
        self.assertTrue(animation_path.exists())
        self.assertTrue(model_path.exists())

    def test_failed_animation_publication_does_not_publish_models_or_entities(self):
        root = Path(self.directory.name)
        models = root / 'models'
        models.mkdir()
        writer = exporter.EntityHierarchyExporter.__new__(exporter.EntityHierarchyExporter)
        writer.bake_animation = False
        writer.validate_instances = lambda _objects: None
        writer.pending_models = [
            (str(models / 'fixture.model.json'), {'animations': {'Walk': self.create_animation_clip()}})
        ]
        writer.pending_documents = [(str(self.path), {'updated': True})]
        with (
            patch.object(exporter, 'write_text_atomic', side_effect=OSError('injected clip failure')),
            patch.object(exporter, 'write_geometry_file') as geometry,
            patch.object(exporter, 'write_model_file') as model,
            patch.object(writer, 'publish') as publish,
        ):
            with self.assertRaisesRegex(OSError, 'injected clip failure'):
                writer.finish([])
        geometry.assert_not_called()
        model.assert_not_called()
        publish.assert_not_called()
        self.assertEqual(json.loads(self.path.read_text()), {'original': True})

    def test_transient_locks_preserve_document_until_atomic_replacement(self):
        replace_file = os.replace
        attempts = []

        def replace_after_lock(source, destination):
            self.assertEqual(json.loads(self.path.read_text()), {'original': True})
            self.assertEqual(Path(source).parent, self.path.parent)
            attempts.append(source)
            if len(attempts) < 3:
                raise create_lock_error(32)
            return replace_file(source, destination)

        with patch.object(exporter.os, 'replace', side_effect=replace_after_lock):
            with patch.object(exporter.time, 'sleep') as sleep:
                exporter.write_text_atomic(str(self.path), '{"updated": true}')
        self.assertEqual(len(attempts), 3)
        self.assertEqual(sleep.call_count, 2)
        self.assertEqual(json.loads(self.path.read_text()), {'updated': True})
        self.assertEqual(list(self.path.parent.glob('*.tmp')), [])

    def test_permanent_document_lock_propagates_after_bounded_retries(self):
        error = create_lock_error()
        with patch.object(exporter.os, 'replace', side_effect=error) as replace:
            with patch.object(exporter.time, 'sleep') as sleep:
                with self.assertRaises(PermissionError) as raised:
                    exporter.write_text_atomic(str(self.path), '{"updated": true}')
        self.assertIs(raised.exception, error)
        self.assertEqual(replace.call_count, len(exporter.FILE_RETRY_DELAYS) + 1)
        self.assertEqual(sleep.call_count, len(exporter.FILE_RETRY_DELAYS))
        self.assertEqual(json.loads(self.path.read_text()), {'original': True})
        self.assertEqual(list(self.path.parent.glob('*.tmp')), [])

    def test_other_io_errors_are_not_retried_or_hidden(self):
        for error in (OSError(errno.ENOSPC, 'Disk full'), PermissionError(errno.EACCES, 'Permission denied')):
            with self.subTest(error=error):
                with patch.object(exporter.os, 'replace', side_effect=error):
                    with patch.object(exporter.time, 'sleep') as sleep:
                        with self.assertRaises(OSError) as raised:
                            exporter.write_text_atomic(str(self.path), 'new content')
                self.assertIs(raised.exception, error)
                sleep.assert_not_called()
                self.assertEqual(json.loads(self.path.read_text()), {'original': True})

    def test_each_write_uses_its_own_temporary_file(self):
        temporary_paths = []
        replace_file = os.replace

        def record_temporary_path(source, destination):
            temporary_paths.append(source)
            return replace_file(source, destination)

        with patch.object(exporter.os, 'replace', side_effect=record_temporary_path):
            exporter.write_text_atomic(str(self.path), 'first')
            exporter.write_text_atomic(str(self.path), 'second')
        self.assertEqual(len(set(temporary_paths)), 2)
        self.assertEqual(self.path.read_text(), 'second')

    def test_status_locks_do_not_abort_animation_export(self):
        replace_file = os.replace
        previous_frame_end = bpy.context.scene.frame_end
        bpy.context.scene.frame_end = bpy.context.scene.frame_start + 2
        self.addCleanup(setattr, bpy.context.scene, 'frame_end', previous_frame_end)

        def replace_except_status(source, destination):
            if str(destination).endswith('.export.json'):
                raise create_lock_error()
            return replace_file(source, destination)

        with contextlib.redirect_stdout(io.StringIO()) as output:
            with patch.object(exporter.os, 'replace', side_effect=replace_except_status):
                with patch.object(exporter.time, 'sleep'):
                    exporter.export_luz_scene(bpy.context, str(self.path), bake_animation=True)
        self.assertIn('Could not update export progress', output.getvalue())
        self.assertTrue(json.loads(self.path.read_text())['entities'])
        self.assertFalse(Path(exporter.export_status_path(str(self.path))).exists())

    def test_cleanup_retries_transient_locks(self):
        remove_file = os.remove
        attempts = []

        def remove_after_lock(path):
            attempts.append(path)
            if len(attempts) == 1:
                raise create_lock_error(33)
            return remove_file(path)

        with patch.object(exporter.os, 'remove', side_effect=remove_after_lock):
            with patch.object(exporter.time, 'sleep'):
                exporter.remove_auxiliary_file(str(self.path))
        self.assertEqual(len(attempts), 2)
        self.assertFalse(self.path.exists())

    def test_cleanup_does_not_hide_original_scene_or_entity_error(self):
        for export_type in ('scene', 'entity'):
            with self.subTest(export_type=export_type):
                error = RuntimeError('Original export failure')
                with contextlib.redirect_stdout(io.StringIO()) as output:
                    with patch.object(exporter, f'_export_luz_{export_type}', side_effect=error):
                        with patch.object(exporter.os, 'remove', side_effect=create_lock_error()):
                            with patch.object(exporter.time, 'sleep'):
                                with self.assertRaises(RuntimeError) as raised:
                                    getattr(exporter, f'export_luz_{export_type}')(bpy.context, str(self.path))
                self.assertIs(raised.exception, error)
                self.assertIn('Could not remove temporary export file', output.getvalue())

    @unittest.skipUnless(os.name == 'nt', 'Windows file sharing semantics')
    def test_real_windows_read_handle_temporarily_blocks_replacement(self):
        import ctypes
        from ctypes import wintypes

        kernel = ctypes.WinDLL('kernel32', use_last_error=True)
        kernel.CreateFileW.argtypes = [
            wintypes.LPCWSTR,
            wintypes.DWORD,
            wintypes.DWORD,
            wintypes.LPVOID,
            wintypes.DWORD,
            wintypes.DWORD,
            wintypes.HANDLE,
        ]
        kernel.CreateFileW.restype = wintypes.HANDLE
        kernel.CloseHandle.argtypes = [wintypes.HANDLE]
        kernel.CloseHandle.restype = wintypes.BOOL

        # Allow readers and writers, but deny deletion while this handle is open.
        handle = kernel.CreateFileW(str(self.path), 0x80000000, 3, None, 3, 0x80, None)
        self.assertNotEqual(handle, wintypes.HANDLE(-1).value)

        def release_lock(_delay):
            nonlocal handle
            self.assertTrue(kernel.CloseHandle(handle))
            handle = None

        try:
            with patch.object(exporter.time, 'sleep', side_effect=release_lock) as sleep:
                exporter.write_text_atomic(str(self.path), '{"updated": true}')
            sleep.assert_called_once()
            self.assertEqual(json.loads(self.path.read_text()), {'updated': True})
        finally:
            if handle is not None:
                kernel.CloseHandle(handle)


if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(ExportFileTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    if not result.wasSuccessful():
        raise RuntimeError('luz export file fixture failed')
