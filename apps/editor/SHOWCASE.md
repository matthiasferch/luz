# luz showcase assets

This scene, its meshes and material setup are original assets created for luz, distributed
under the project's MIT license (see `../LICENSE` in the built demo).
The boxes use the **Metal 038** textures from [ambientCG](https://ambientcg.com/view?id=Metal038),
released under [CC0 1.0](https://docs.ambientcg.com/license/). The unmodified 1K base-color,
OpenGL normal, metallic and roughness maps are bundled locally; see
`textures/galvanizedMetal/LICENSE.txt` in the built demo for source filenames and license details.
No BlendKit or Poliigon assets are included.

The source recipe is `apps/editor/tooling/demo-assets.cjs`. The demo build generates
its JSON assets afresh and copies only the approved, checksum-verified textures from
`apps/editor/demo-assets/`. Builds and runtime loading do not download external assets.

The **rigid body playground** is the only bundled scene and loads at startup. It contains
a stack of cubes and three falling balls. When the Simulation panel is hidden, use the
Start, Pause and Reset buttons at the bottom of the scene. Open the panel through View
for the full simulation settings. Reset restores
the initial arrangement. While running, WASD applies force to the first ball and TFGH to
the first cube. Expand lights in the Entities panel to toggle them, or Settings to explore
shadows and rendering effects.

On phones, narrow screens and devices with a coarse primary pointer, panels start hidden.
Use View to open a panel, then drag its title bar to move it. Panel contents still scroll
normally. Mobile and desktop layouts are saved separately; View → Reset layout restores
the defaults for the current viewport.

Drag the canvas with one finger to turn the camera. Drag with two fingers to pan, and
pinch apart or together to move forward or backward. Panning and pinching can be combined.
With a mouse, use left-button drag to turn, middle- or right-button drag to pan, and the
wheel to move forward and backward.
View → Reset camera restores the authored view without resetting the simulation or panels.
Stop camera animations before navigating or resetting the camera.
The editor stores settings and thumbnails locally in the browser.
