import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

specification = importlib.util.spec_from_file_location('studio', Path(__file__).parents[1] / 'luz_exporter/studio.py')
studio = importlib.util.module_from_spec(specification)
specification.loader.exec_module(studio)


class SnapshotTest(unittest.TestCase):
    def test_nested_and_texture_only_exports(self):
        with tempfile.TemporaryDirectory() as workspace, tempfile.TemporaryDirectory() as storage:
            root = Path(workspace).resolve()
            for name in ['scenes', 'entities', 'models', 'textures']:
                (root / name).mkdir()
            scene = root / 'scenes/example.scene.json'
            scene.write_text(json.dumps({'entities': {'box': {'entity': '../entities/box.entity.json'}}}))
            (root / 'entities/box.entity.json').write_text(
                json.dumps({'components': {'mesh': '../models/box.model.json'}})
            )
            texture = root / 'textures/metal.png'
            texture.write_bytes(b'first')
            model = {
                'materials': {
                    'metal': {
                        'graph': {
                            'nodes': {'color': {'type': 'imageTexture', 'surface': {'path': 'textures/metal.png'}}}
                        }
                    }
                }
            }
            (root / 'models/box.model.json').write_text(json.dumps(model))
            (root / 'unrelated.blend').write_bytes(b'private')
            first = studio.collect_snapshot(scene, Path(storage), 'project')
            self.assertEqual(len(first['files']), 4)
            texture.write_bytes(b'second')
            second = studio.collect_snapshot(scene, Path(storage), 'project')
            self.assertNotEqual(first['files'][-1]['digest'], second['files'][-1]['digest'])
            texture.unlink()
            with self.assertRaisesRegex(ValueError, 'Missing scene dependency: textures/metal.png'):
                studio.collect_snapshot(scene, Path(storage), 'project')


if __name__ == '__main__':
    unittest.main()
