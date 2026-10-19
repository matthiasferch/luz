# Generated engine textures

The generator and its PNG outputs are part of luz and licensed under the root
[MIT License](../../LICENSE). They are generated from numerical formulas and a
fixed seed. No downloaded texture, old image pixels, or third-party implementation
is used as an input.

Run from the repository root:

```sh
npm run generate:textures
npm run validate:textures
```

Validation regenerates both images in memory and checks the committed bytes
without writing files. It runs in `npm run check` and CI.
Only Node.js built-ins are required. PNG output uses fixed-Huffman DEFLATE,
contains no timestamps, and has no color-profile or gamma chunks.

## Environment reflectance lookup

`brdfLUT.png` is a 256 × 256 RGB image with linear 8-bit channels. Its red and
green channels store the scale and bias in `F0 * scale + bias`; blue is zero.
Horizontal texel centers represent the normal/view cosine and vertical texel
centers represent perceptual roughness, both increasing from zero to one.
The first encoded row contains the lowest roughness. The existing WebGL upload
does not flip rows, so that row is sampled at texture coordinate `v = 0`.

The integral uses GGX with `alpha = roughness²`, Schlick Fresnel, and separable
Schlick geometry with the environment-lighting factor `k = roughness² / 2`.
The direct-light shader's `(roughness + 1)² / 8` remapping is intentionally not
used for image-based lighting. Each texel integrates 16,384 halfway directions
with a Hammersley sequence and GGX importance sampling. Sampling at texel centers
avoids the singular grazing boundary; texture filtering handles interpolation.

Mathematical background: Brian Karis, _Real Shading in Unreal Engine 4_,
[SIGGRAPH 2013 course notes](https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf).
This is a reference for the equations, not a source of copied code or image data.
Tests compare the result with independent light-hemisphere quadrature, the smooth
surface limit, and the rough normal-incidence integral `1 − ln(2)`.

## Volumetric sampling noise

`noise.png` is a 512 × 512 grayscale image. The renderer samples its red channel
as a ray-march offset. Generation uses an unsigned 32-bit xorshift sequence with
seed `0x6c757a31`, subtracts a separable binomial blur with weights
`[1, 4, 6, 4, 1] / 16`, then ranks the residuals into 256 equally populated bins.
All filtering wraps around the image in both directions, matching repeat tiling.
Each byte value occurs exactly 1,024 times, giving an unbiased mean of 0.5.

This is deterministic high-pass noise, not a claim of an optimized blue-noise
distribution. Tests verify the uniform histogram, repeatability, and suppression
of low spatial frequencies relative to the seeded white-noise input. The 512-pixel
period, dimensions, and shader sampling coordinates remain unchanged.
