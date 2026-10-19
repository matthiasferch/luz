out vec2 v_shadowCoordinates;
out vec3 v_objectPosition;
out float v_clipDistance;

uniform vec4 clipPlane;

void main() {
  vec4 position = a_position;

  if (model.isAnimated && dot(a_boneWeights, vec4(1.0)) > 0.0) {
    mat4 skinMatrix = mat4(0.0);

    for (int sampleIndex = 0; sampleIndex < WEIGHT_COUNT; sampleIndex++) {
      int boneIndex = int(a_boneIndices[sampleIndex]);

      skinMatrix += a_boneWeights[sampleIndex] * getBoneMatrix(boneTexture, boneIndex);
    }

    position = skinMatrix * position;
  }

  vec4 worldPosition = transform.modelMatrix * position;
  vec4 cameraPosition = camera.viewMatrix * worldPosition;

  gl_Position = camera.projectionMatrix * cameraPosition;
  v_shadowCoordinates = vec2(a_coordinates.x, 1.0 - a_coordinates.y);
  v_objectPosition = position.xyz;
  v_clipDistance = dot(worldPosition, clipPlane);
}
