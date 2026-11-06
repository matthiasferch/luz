"""Keep the export entry point embedded in existing Light Chamber Blender files."""

import argparse
import runpy
import sys
from pathlib import Path


def export_chamber(output):
    module = runpy.run_path(str(Path(__file__).with_name('export_showcase.py')))
    module['export_showcase'](output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    export_chamber(parser.parse_args(sys.argv[sys.argv.index('--') + 1 :]).output)
