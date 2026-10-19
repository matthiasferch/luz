out vec2 v_coordinates;
out vec3 v_normal;
out vec3 v_tangent;
out vec3 v_bitangent;
out vec4 v_worldPosition;
out vec4 v_cameraPosition;
out vec3 v_objectPosition;
out vec4 v_currentClipPosition;
out vec4 v_previousClipPosition;

uniform mat4 currentViewProjectionMatrix;
uniform mat4 previousViewProjectionMatrix;
uniform mat4 previousModelMatrix;
uniform highp sampler2D previousBoneTexture;

void main() {
  vec4 currentPosition = a_position;
  vec4 previousPosition = a_position;
  vec3 normal = a_normal;
  vec3 tangent = a_tangent;
  vec3 bitangent = a_bitangent;

  if (model.isAnimated && dot(a_boneWeights, vec4(1.0)) > 0.0) {
    mat4 currentSkinMatrix = mat4(0.0);
    mat4 previousSkinMatrix = mat4(0.0);

    for (int index = 0; index < WEIGHT_COUNT; ++index) {
      int boneIndex = int(a_boneIndices[index]);

      currentSkinMatrix += a_boneWeights[index] * getBoneMatrix(boneTexture, boneIndex);
      previousSkinMatrix += a_boneWeights[index] * getBoneMatrix(previousBoneTexture, boneIndex);
    }

    currentPosition = currentSkinMatrix * a_position;
    previousPosition = previousSkinMatrix * a_position;
    normal = mat3(currentSkinMatrix) * a_normal;
    tangent = mat3(currentSkinMatrix) * a_tangent;
    bitangent = mat3(currentSkinMatrix) * a_bitangent;
  }

  v_worldPosition = transform.modelMatrix * currentPosition;
  v_cameraPosition = camera.viewMatrix * v_worldPosition;
  v_objectPosition = currentPosition.xyz;
  v_normal = transform.normalMatrix * normal;
  v_tangent = transform.normalMatrix * tangent;
  v_bitangent = transform.normalMatrix * bitangent;
  v_coordinates = a_coordinates;
  v_currentClipPosition = currentViewProjectionMatrix * v_worldPosition;
  v_previousClipPosition = previousViewProjectionMatrix * previousModelMatrix * previousPosition;
  gl_Position = camera.projectionMatrix * v_cameraPosition;
}
