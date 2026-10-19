vec4 reconstructPosition(mat4 inverseProjectionViewMatrix, vec2 screenCoordinates, float depth) {
  vec2 normalizedDeviceCoordinates = screenCoordinates * 2.0 - 1.0;
  float normalizedDepth = depth * 2.0 - 1.0;

  vec4 clipPosition = vec4(normalizedDeviceCoordinates, normalizedDepth, 1.0);
  vec4 position = inverseProjectionViewMatrix * clipPosition;

  return vec4(position.xyz / position.w, position.w);
}
