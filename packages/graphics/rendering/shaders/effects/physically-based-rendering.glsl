float calculateDielectricF0(float indexOfRefraction) {
  float ratio = (indexOfRefraction - 1.0) / (indexOfRefraction + 1.0);

  return ratio * ratio;
}

vec3 calculateSchlickFresnel(float angleCosine, vec3 baseReflectance) {
  return baseReflectance + (1.0 - baseReflectance) * pow(1.0 - angleCosine, 5.0);
}

float calculateGgxDistribution(float normalHalfwayDot, float roughness) {
  float squaredRoughness = roughness * roughness;
  float fourthPowerRoughness = squaredRoughness * squaredRoughness;
  float denominator = normalHalfwayDot * normalHalfwayDot * (fourthPowerRoughness - 1.0) + 1.0;

  return fourthPowerRoughness / (3.14159265 * denominator * denominator);
}

float calculateSchlickGgxGeometry(float normalViewDot, float roughness) {
  float shiftedRoughness = roughness + 1.0;
  float geometryFactor = shiftedRoughness * shiftedRoughness / 8.0;

  return normalViewDot / (normalViewDot * (1.0 - geometryFactor) + geometryFactor);
}

float calculateSmithGeometry(float normalViewDot, float normalLightDot, float roughness) {
  return calculateSchlickGgxGeometry(normalViewDot, roughness) * calculateSchlickGgxGeometry(normalLightDot, roughness);
}

// Increase the microfacet width when the shading normal changes faster than squaredRoughness
// pixel can resolve. This suppresses sparkling and triangle-to-triangle bands
// on smooth, low-poly surfaces without blurring stable highlights.
float calculateSpecularAntialiasingRoughness(vec3 normal, float roughness) {
  vec3 horizontalNormalDerivative = dFdx(normal);
  vec3 verticalNormalDerivative = dFdy(normal);
  float variance =
    0.25 *
    (dot(horizontalNormalDerivative, horizontalNormalDerivative) +
      dot(verticalNormalDerivative, verticalNormalDerivative));
  float kernelVariance = min(2.0 * variance, 0.18);

  // GGX uses alpha = perceptual roughness squared. Add the filter in
  // alpha-squared space, then convert back to perceptual roughness.
  float alpha = clamp(roughness, 0.04, 1.0);

  alpha *= alpha;

  return clamp(sqrt(sqrt(alpha * alpha + kernelVariance)), 0.04, 1.0);
}

vec3 calculateLambertDiffuse(vec3 albedo) {
  return albedo / 3.14159265;
}
