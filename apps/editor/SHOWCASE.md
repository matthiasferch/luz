# luz showcase assets

The rigid body playground, stage meshes and material setup are original assets created for luz, distributed
under the project's MIT license (see `../LICENSE` in the built demo).
The boxes use the **Metal 038** textures from [ambientCG](https://ambientcg.com/view?id=Metal038),
released under [CC0 1.0](https://docs.ambientcg.com/license/). The unmodified 1K base-color,
OpenGL normal, metallic and roughness maps are bundled locally; see
`textures/galvanizedMetal/LICENSE.txt` in the built demo for source filenames and license details.
No BlendKit or Poliigon assets are included.

Lighting and reflections use [Studio Small 08](https://polyhaven.com/a/studio_small_08)
by Sergej Majboroda / Poly Haven, also [CC0](https://polyhaven.com/license). Its HDR light
is stored in prefiltered radiance and diffuse irradiance cubemaps, totaling about 1.05 MiB.
A separate black sky cubemap preserves the simple backdrop. The Environment panel adjusts
the lighting rotation and diffuse/specular strengths. Source and conversion details are in
`environments/studio/LICENSE.txt` in the built demo.

The **Skeletal Animation** scene uses the existing Adobe / Mixamo character and its 12
animation clips. This third-party content is separate from the MIT-licensed luz code
and the CC0 textures; its licensing review remains pending. See `character/NOTICE.txt`
in the built demo for provenance and preparation details.

The source recipe is `apps/editor/tooling/demo-assets.cjs`. The demo build generates
its scenes afresh and loads the selected, checksum-verified character assets and textures from
`apps/editor/demo-assets/`. Builds and runtime loading do not download external assets.

The **rigid body playground** loads at first startup. It contains
a stack of cubes and three falling balls. When the Simulation panel is hidden, use the
Start, Pause and Reset buttons at the bottom of the scene. Open the panel through View
for the full simulation settings. Reset restores
the initial arrangement. While running, WASD applies force to the first ball and TFGH to
the first cube. Expand lights in the Entities panel to toggle them, or Settings to explore
shadows and rendering effects.

Use Scene → Load scene to switch to **Skeletal Animation**. Walking plays automatically on a loop;
open View → Animations to play walking, running, jumping, strafing and turning clips,
adjust speed, pause playback or blend animations. Both skinned meshes share the same
controls. Character animation runs independently of the physics simulation buttons.
The editor remembers the last selected scene.

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
