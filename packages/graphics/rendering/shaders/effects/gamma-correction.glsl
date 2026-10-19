vec3 calculateGammaCorrection(vec3 color) {
  float exponent = 1.0 / 2.2;

  return vec3(pow(color.r, exponent), pow(color.g, exponent), pow(color.b, exponent));
}
