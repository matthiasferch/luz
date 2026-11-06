"""Compatibility entry point for export texts in older local showcase files."""

import argparse
import importlib.util
import sys
from pathlib import Path

import bpy


def export_showcase(output):
    specification = importlib.util.spec_from_file_location(
        'luz_showcase_exporter', Path(__file__).resolve().parents[1] / 'luz_exporter/exporter.py'
    )
    exporter = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(exporter)
    exporter.export_luz_scene(
        bpy.context, str(output), only_visible=True, bake_animation=True, animation_source='actions'
    )


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    export_showcase(parser.parse_args(sys.argv[sys.argv.index('--') + 1 :]).output)
