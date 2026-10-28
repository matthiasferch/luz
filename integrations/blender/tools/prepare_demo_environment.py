import hashlib
import importlib.util
from pathlib import Path

import bpy
import numpy


def prepare_environment():
    repository_directory = Path(__file__).resolve().parents[3]
    asset_directory = repository_directory / 'apps/editor/demo-assets/environments/studio'
    source_path = asset_directory / 'source.hdr'
    source_hash = hashlib.sha256(source_path.read_bytes()).hexdigest()
    if source_hash != 'f6a989f89432eb4eee3191364a9c1ceed195c4ec3544173a3c04fd96cb91d0ba':
        raise RuntimeError('The studio environment does not match the approved CC0 source')

    exporter_path = Path(__file__).resolve().parents[1] / 'luz_exporter/exporter.py'
    specification = importlib.util.spec_from_file_location('luz_environment_exporter', exporter_path)
    exporter = importlib.util.module_from_spec(specification)
    specification.loader.exec_module(exporter)
    source_image = bpy.data.images.load(str(source_path), check_existing=False)
    try:
        width, height = source_image.size
        channel_count = source_image.channels
        source_pixels = numpy.empty(width * height * channel_count, dtype=numpy.float32)
        source_image.pixels.foreach_get(source_pixels)
        pixels = source_pixels.reshape((height, width, channel_count))[..., :3]
        radiance = exporter.prefilter_radiance(numpy, pixels, 128, 256)
        irradiance = exporter.convolve_irradiance(numpy, pixels, 32, 256)
        black_sky = numpy.zeros((6, 1, 1, 3), dtype=numpy.float32)
        exporter.write_environment_ktx(str(asset_directory / 'radiance.ktx'), radiance)
        exporter.write_environment_ktx(str(asset_directory / 'irradiance.ktx'), [irradiance])
        exporter.write_environment_ktx(str(asset_directory / 'sky.ktx'), [black_sky])
    finally:
        bpy.data.images.remove(source_image)

    print(f'luz studio environment prepared in {asset_directory}')


prepare_environment()
