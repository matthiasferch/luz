uniform vec3 baseColor;
uniform sampler2D depthTexture;
uniform vec2 viewportSize;
uniform vec2 depthJitter;
uniform float lineWidth;
uniform float pixelRatio;
uniform float opacity;
uniform int depthMode;
uniform bool isScreenSpace;
uniform bool isDashed;
uniform bool isCone;

in vec2 lineCoordinates;
flat in float segmentLength;
flat in vec2 segmentDepth;
in vec3 coneNormal;

out vec4 outColor;

void main() {
  if (isCone && !gl_FrontFacing) {
    discard;
  }

  float axialDistance = max(-lineCoordinates.x, lineCoordinates.x - segmentLength);
  float distancePixels = length(vec2(max(axialDistance, 0.0), lineCoordinates.y));
  float radius = lineWidth * pixelRatio * 0.5;
  float coverage = isCone ? 1.0 : 1.0 - smoothstep(radius - 0.5, radius + 0.5, distancePixels);
  vec2 depthCoordinates = gl_FragCoord.xy / viewportSize + depthJitter;
  float surfaceDepth = texture(depthTexture, depthCoordinates).r;
  float segmentProgress = segmentLength > 0.0001 ? clamp(lineCoordinates.x / segmentLength, 0.0, 1.0) : 0.0;
  float fragmentDepth = isCone ? gl_FragCoord.z : mix(segmentDepth.x, segmentDepth.y, segmentProgress);
  float depthTolerance = max(0.000002, fwidth(fragmentDepth) * 2.0);
  bool isOccluded = !isScreenSpace && depthMode != 2 && fragmentDepth > surfaceDepth + depthTolerance;

  if (isOccluded && depthMode == 1) {
    discard;
  }

  if (!isCone && (isOccluded || isDashed) && mod(max(lineCoordinates.x, 0.0) / pixelRatio, 10.0) > 6.0) {
    discard;
  }

  float alpha = opacity * coverage * (isOccluded ? 0.25 : 1.0);

  if (alpha <= 0.0) {
    discard;
  }

  float shading = isCone ? 0.65 + 0.35 * abs(normalize(coneNormal).z) : 1.0;

  outColor = vec4(baseColor * shading, alpha);
}
