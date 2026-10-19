# luz Blender extension

Export Blender scenes and reusable entities for luz. Requires **Blender 5.0 or later**.

## Installation

These steps work on Windows, macOS, and Linux without a terminal. If you already
have the extension ZIP, skip to step 2.

1. Open `integrations/blender/luz_exporter` in your file manager. Select `blender_manifest.toml`, `__init__.py`, `exporter.py`, and `LICENSE`, then use your file manager or archive utility to compress them into a ZIP file. The four files must be at the top level of the ZIP, without an enclosing folder.
2. In Blender, open **Edit > Preferences > Get Extensions**, open the menu, and choose **Install from Disk**.
3. Select the ZIP file and enable **luz Scene and Entity Exporter**.

Disable any older installation of the exporter before enabling the new one.

## Basic usage

- **Export a scene:** Choose **File > Export > luz Scene (.scene.json)**.
- **Export an entity:** Select the root object, then choose **File > Export > luz Entity (.entity.json)**.

Choose an output location and export. Keep the generated files together with their
asset folders. To use a scene in the luz editor, export it into
`apps/editor/public/assets/scenes/`.

Spot, sun, and point lights are supported; area lights are not yet supported.

## Animation

Enable **Export animation** in the export dialog, then choose an **Animation Source**:

- **Timeline:** Export the animation over the scene's frame range.
- **Action clips:** Export separate clips from assigned actions and actions in NLA tracks.

Enable **Animate in place** to remove horizontal travel, for example for a walking
or running character. Leave **Export animation** disabled to export a static
snapshot at the current frame.

In the editor, open **View > Animations**, select the animation target, and choose
an animation to play.

The extension is licensed under [GPL-3.0-or-later](luz_exporter/LICENSE).
