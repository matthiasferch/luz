"""Run with Python --blender <executable> --archive <built extension ZIP>."""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from types import SimpleNamespace
from zipfile import ZipFile

PACKAGE_PATH = Path(__file__).resolve().parents[1] / 'luz_exporter'
PACKAGE_FILES = {'__init__.py', 'exporter.py', 'blender_manifest.toml', 'LICENSE'}


def create_source_link(link):
    if os.name == 'nt':
        environment = os.environ.copy()
        environment['LUZ_EXTENSION_LINK'] = str(link)
        environment['LUZ_EXTENSION_SOURCE'] = str(PACKAGE_PATH)
        subprocess.run(
            [
                'powershell.exe',
                '-NoProfile',
                '-NonInteractive',
                '-Command',
                "$ErrorActionPreference = 'Stop'; New-Item -ItemType Junction "
                '-Path $env:LUZ_EXTENSION_LINK -Target $env:LUZ_EXTENSION_SOURCE | Out-Null',
            ],
            env=environment,
            check=True,
        )
    else:
        link.symlink_to(PACKAGE_PATH, target_is_directory=True)


def get_export_callbacks(module_name):
    import bpy

    return [
        callback
        for callback in getattr(bpy.types.TOPBAR_MT_file_export.draw, '_draw_funcs', ())
        if callback.__module__.startswith(module_name + '.')
    ]


def assert_registered(module_name, expected_path):
    import addon_utils
    import bpy

    module = sys.modules[module_name]
    assert addon_utils.check_extension(module_name)
    assert addon_utils.check(module_name) == (True, True)
    assert Path(module.__file__).resolve() == expected_path / '__init__.py'
    assert 'bl_info' not in vars(module.exporter)
    assert all(operator_class.is_registered for operator_class in module.exporter.classes)
    for operator in (bpy.ops.export_scene.luz_model, bpy.ops.export_scene.luz_entity):
        option = operator.get_rna_type().properties['bake_animation']
        assert option.name == 'Export animation'
        assert option.default is False
        assert operator.get_rna_type().properties['in_place'].default is False
        assert operator.get_rna_type().properties['in_place'].name == 'Animate in place'
        source = operator.get_rna_type().properties['animation_source']
        assert source.default == 'timeline'
        assert {item.identifier for item in source.enum_items} == {'timeline', 'actions'}
        assert 'animation_playback' not in operator.get_rna_type().properties
        assert 'export_actions' not in operator.get_rna_type().properties
    callbacks = get_export_callbacks(module_name)
    assert callbacks == [module.exporter.menu_func_export], callbacks
    menu_entries = []
    menu = SimpleNamespace(
        layout=SimpleNamespace(
            operator=lambda identifier, **options: menu_entries.append((identifier, options['text']))
        )
    )
    callbacks[0](menu, bpy.context)
    assert menu_entries == [
        ('export_scene.luz_entity', 'luz Entity (.entity.json)'),
        ('export_scene.luz_model', 'luz Scene (.scene.json)'),
    ]
    return module


def assert_exports(output):
    import bpy

    scene_path = output / 'scenes' / 'fixture.scene.json'
    entity_path = output / 'entities' / 'fixture.entity.json'
    assert bpy.ops.export_scene.luz_model(filepath=str(scene_path)) == {'FINISHED'}
    assert bpy.ops.export_scene.luz_entity(filepath=str(entity_path)) == {'FINISHED'}
    for path in (scene_path, entity_path):
        assert json.loads(path.read_text(encoding='utf-8'))
    assert list((output / 'models').glob('*.geometry'))


def run_blender_fixture(arguments):
    import addon_utils
    import bpy

    repository_path = Path(arguments.repository)
    repository_path.mkdir(parents=True)
    package_path = repository_path / 'luz_exporter'
    repository = bpy.context.preferences.extensions.repos.new(
        name='luz fixture', module='luz_fixture', custom_directory=str(repository_path)
    )
    repository.use_remote_url = False
    module_name = f'bl_ext.{repository.module}.luz_exporter'
    is_source_link = arguments.mode == 'source'
    try:
        if is_source_link:
            create_source_link(package_path)
        else:
            assert bpy.ops.extensions.package_install_files(
                filepath=arguments.archive, repo=repository.module, enable_on_install=False
            ) == {'FINISHED'}
        available_modules = {module.__name__: module for module in addon_utils.modules(refresh=True)}
        assert module_name in available_modules
        assert 'exporter' not in available_modules
        metadata = addon_utils.module_bl_info(available_modules[module_name])
        assert metadata['name'] == 'luz Scene and Entity Exporter'
        assert metadata['version'] == (0, 9, 1)
        expected_path = PACKAGE_PATH if is_source_link else package_path.resolve()
        assert addon_utils.enable(module_name, default_set=True) is not None
        module = assert_registered(module_name, expected_path)
        assert_exports(repository_path.parent / 'exports')
        registered_classes = module.exporter.classes
        addon_utils.disable(module_name, default_set=True)
        assert not get_export_callbacks(module_name)
        assert all(not operator_class.is_registered for operator_class in registered_classes)
        assert addon_utils.enable(module_name, default_set=True) is not None
        module = assert_registered(module_name, expected_path)
        previous_operator = module.exporter.EXPORT_OT_luz_model

        # The Reload Scripts operator is deferred; run its loader synchronously in background mode.
        bpy.utils.load_scripts(reload_scripts=True)
        module = assert_registered(module_name, expected_path)
        assert module.exporter.EXPORT_OT_luz_model is not previous_operator
        assert not previous_operator.is_registered
        assert_exports(repository_path.parent / 'exports')
        addon_utils.disable(module_name, default_set=True)
        assert not get_export_callbacks(module_name)
        assert all(not operator_class.is_registered for operator_class in module.exporter.classes)
        print(f'luz extension {arguments.mode} installation, export and reload fixture passed', flush=True)
    finally:
        if addon_utils.check(module_name)[1]:
            addon_utils.disable(module_name, default_set=True)
        if is_source_link and package_path.exists():
            if os.name == 'nt':
                os.rmdir(package_path)
            else:
                package_path.unlink()
        bpy.context.preferences.extensions.repos.remove(repository)


def run_isolated_fixtures(arguments):
    archive_path = Path(arguments.archive).resolve()
    with ZipFile(archive_path) as archive:
        assert set(archive.namelist()) == PACKAGE_FILES, archive.namelist()
    with tempfile.TemporaryDirectory(prefix='luz-extension-fixture-') as temporary_directory:
        for mode in ('zip', 'source'):
            fixture_path = Path(temporary_directory) / mode
            environment = os.environ.copy()
            for resource, folder in (
                ('RESOURCES', 'resources'),
                ('CONFIG', 'config'),
                ('SCRIPTS', 'scripts'),
                ('EXTENSIONS', 'extensions'),
            ):
                directory = fixture_path / folder
                directory.mkdir(parents=True)
                environment[f'BLENDER_USER_{resource}'] = str(directory)
            subprocess.run(
                [
                    arguments.blender,
                    '--background',
                    '--factory-startup',
                    '--offline-mode',
                    '--python-exit-code',
                    '1',
                    '--python',
                    str(Path(__file__).resolve()),
                    '--',
                    '--archive',
                    str(archive_path),
                    '--repository',
                    str(fixture_path / 'repository'),
                    '--mode',
                    mode,
                ],
                env=environment,
                check=True,
            )


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--blender', default='blender')
    parser.add_argument('--archive', required=True)
    parser.add_argument('--repository', help=argparse.SUPPRESS)
    parser.add_argument('--mode', choices=('zip', 'source'), help=argparse.SUPPRESS)
    arguments = parser.parse_args(sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else sys.argv[1:])
    if arguments.repository:
        run_blender_fixture(arguments)
    else:
        run_isolated_fixtures(arguments)
