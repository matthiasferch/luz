# luz showcase assets

These scenes, meshes and materials are original procedural assets created for luz.
They are distributed under the project's MIT license (see `../LICENSE` in the built demo).
No downloaded models, photographs, HDR environments, BlendKit or Poliigon assets are included.

The source recipe is `apps/editor/tooling/demo-assets.cjs`. The demo build generates
its JSON assets afresh; generated files do not need to be checked into Git.

- **Lighting and materials:** six spheres compare three roughness levels across
  ceramic and metallic surfaces. Expand lights in the Entities panel to toggle them,
  or Settings to explore shadows and rendering effects.
- **Rigid body playground:** a stack of cubes and three falling balls. Open Simulation
  and press Start. Reset restores the initial arrangement. While running, WASD applies
  force to the first ball and TFGH to the first cube.

Use Scene → Load scene… to switch scenes. Drag the canvas with the left mouse button
to turn the camera; the mouse wheel moves it forward and backward. The editor stores
settings and thumbnails locally in the browser.
