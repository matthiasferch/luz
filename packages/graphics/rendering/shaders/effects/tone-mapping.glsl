vec3 applyToneMapping(vec3 color) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;

  vec3 nonnegativeColor = max(color, vec3(0.0));

  return clamp(
    nonnegativeColor * (a * nonnegativeColor + b) / (nonnegativeColor * (c * nonnegativeColor + d) + e),
    0.0,
    1.0
  );
}
