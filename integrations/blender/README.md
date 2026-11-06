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

Run `npm run preview:local` from the repository root to view local exports at
`http://127.0.0.1:4173/`; the active scene reloads automatically after exporting. Stop `preview:demo`
first if it is running on that port; the demo preview serves the packaged showcase.

Spot, sun, and point lights are supported; area lights are not yet supported.

Mesh shading preserves Blender's face-corner normals, including smooth and flat
faces, sharp edges, and custom normals. For rounded boxes, use **Shade Smooth**
and the Bevel modifier's **Harden Normals** option; add a **Weighted Normal**
modifier after Bevel when needed. Enable **Apply Modifiers** when exporting to
include the modifier result. Triangulation preserves these normals and UV seams.

Set an object's Boolean custom property `luz_preview_only` to true to exclude its
components from exports, even when **Only visible objects** is disabled. This is
useful for Blender-only preview volumes. If exported children need the object's
transform, it remains as an empty parent.

## Saved export settings

After the first successful scene export, the destination and options appear under
**Scene Properties > luz Export**. Use **Export Again**, or press **F3** and search
for **luz Export Again**, to repeat it without opening a file dialog. Right-click
the command to assign a shortcut. Save the `.blend` file to retain these settings;
destinations are stored relative to the Blender file where possible.

The same exporter handles the editable demo scenes. Choose **Export animation >
Action clips** for their platform, spotlight and character animations. The source
generators save these options and the destination as scene data; they do not embed
Python scripts. Existing embedded export texts remain compatible through a small
repository wrapper, but are no longer needed. See the [showcase guide](../../apps/editor/SHOWCASE.md)
for destination filenames.

**Object Properties > luz Export** controls exclusion, continuous collision detection,
the startup animation, default looping and the active action's playback override.
**Light Data Properties > luz Lighting** controls the light power multiplier and
shadow softness. Existing `luz_*` custom properties populate these controls directly.
Gravity, mass, friction, restitution and animated rigid bodies come from Blender's
native scene and rigid-body settings.

## Environments and assets

Use an HDR/EXR Environment Texture connected to the World Background, optionally
through a Mapping node with Z rotation. Packed environment images are supported.
**World Properties > luz Environment** independently controls the camera background
and diffuse environment lighting. Choose **Black** to keep reflections with a black
backdrop. **From World nodes** also understands the demos' Mix Color/Light Path
setups for camera-black and glossy-only environments; unsupported graphs report an error.
The image, strength and rotation remain authored in the World nodes.

Referenced material images, including packed files and images inside material groups,
are collected into the exported asset directory with content-based filenames.
Supported non-color data images are converted to PNG when needed. Missing textures
fail the export rather than silently changing the material. Source image paths and
Blender lighting are not modified. Adjacent texture/environment license notices are copied.

Exports prepare models, animation, textures and environments before publishing the
scene JSON once. Preparation failures preserve the previous export; publication
failures roll back replaced dependencies. Compiled environments are cached by content
and settings, so new lighting does not overwrite maps used by an earlier export.

## Animation

Enable **Export animation** in the export dialog, then choose an **Animation Source**:

- **Timeline:** Export the animation over the scene's frame range.
- **Action clips:** Export separate clips from assigned actions and actions in NLA tracks.

Enable **Animate in place** to remove horizontal travel, for example for a walking
or running character. Leave **Export animation** disabled to export a static
snapshot at the current frame.

In the editor, open **View > Animations**, select the animation target, and choose
an animation to play.

An object with exactly one exported transform animation plays it automatically on
load. This applies to both Timeline and Action clips, including nested objects and
entity exports. Objects with multiple clips wait for a selection unless **Startup
animation** names an exported clip. Use **Loop animations by default** on the object
or the active action's **Loop/Once** override to control repetition. Without an
override, playback remains once; autoplay does not imply looping.

The extension is licensed under [GPL-3.0-or-later](luz_exporter/LICENSE).
