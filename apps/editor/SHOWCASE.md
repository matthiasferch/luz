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

Use Scene → Load scene to switch to the **rigid body playground**. It contains
two metal boxes stacked on a moving platform and two orange spheres.
The platform travels nearly the full floor width in four seconds each way, easing into each reversal.
It stays fully over the floor and starts its eight-second loop as soon as the scene loads;
its kinematic body carries the dynamic boxes through friction and contact. Physics starts automatically
whenever a scene loads. Use the bottom animation buttons or View → Animations to pause and resume the platform.
Open View → Simulation to pause, restart or reset physics and adjust its settings. Reset restores
the initial arrangement and pauses physics. While running, WASD applies force to the first ball and TFGH to
the first cube. Expand lights in the Entities panel to toggle them, or Settings to explore
shadows and rendering effects.

**Skeletal Animation** loads at first startup. Walking plays automatically on a loop;
use the bottom Previous, Play, Pause, Next and Loop buttons when the Animations panel is hidden.
Previous and Next cycle through each target's clips, wrapping at either end and preserving pause.
Loop toggles repetition for the active clips; the crossed-out repeat icon means looping is disabled.
Open View → Animations to play walking, running, jumping, strafing and turning clips,
adjust speed, pause playback or blend animations. Both skinned meshes share the same
controls. Animation controls do not pause or reset physics. Scenes without animations hide these buttons.
The editor remembers the last selected scene.

Rendering defaults enable volumetric lighting and bloom. Planar reflections, ambient occlusion,
subsurface lighting, motion blur and depth of field start disabled. Saved settings for each scene
take precedence over these defaults.

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
