out vec4 outColor;

in vec2 v_shadowCoordinates;
in vec3 v_objectPosition;
in float v_clipDistance;

uniform bool isDepthPeelingEnabled;
uniform sampler2D depthPeelTexture;
uniform vec2 depthPeelViewportSize;

void applyDepthPeeling() {
  if (!isDepthPeelingEnabled) {
    return;
  }

  vec2 coordinates = gl_FragCoord.xy / max(depthPeelViewportSize, vec2(1.0));
  float frontDepth = texture(depthPeelTexture, coordinates).r;

  // Retain only the nearest rasterized surface behind the visible one. A
  // cleared source depth means that no front surface exists to peel.
  if (frontDepth >= 1.0 - 1e-6 || gl_FragCoord.z <= frontDepth + 1e-6) {
    discard;
  }
}

void main() {
  if (v_clipDistance < 0.0) {
    discard;
  }

  applyDepthPeeling();

  MaterialContext materialContext = MaterialContext(
    v_shadowCoordinates,
    vec3(0.0),
    vec3(0.0),
    v_objectPosition,
    vec3(0.0, 0.0, 1.0),
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0)
  );
  MaterialSample materialSample = evaluateMaterial(materialContext);

  if (isMaterialAlphaMasked && materialSample.alpha < materialAlphaCutoff) {
    discard;
  }

  outColor = vec4(vec3(gl_FragCoord.z), 1.0);
}
