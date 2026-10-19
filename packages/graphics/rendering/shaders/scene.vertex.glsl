out vec2 v_coordinates;
out vec3 v_normal;
out vec3 v_tangent;
out vec3 v_bitangent;

out vec4 v_worldPosition;
out vec4 v_cameraPosition;
out vec3 v_objectPosition;

out vec3 v_lightDirection;
out vec4 v_lightProjection;

out float v_clipDistance;

uniform vec4 clipPlane;

void main() {
  vec4 position;
  vec3 normal;
  vec3 tangent;
  vec3 bitangent;

  if (model.isAnimated && dot(a_boneWeights, vec4(1.0)) > 0.0) {
    mat4 skinMatrix = mat4(0.0);

    for (int sampleIndex = 0; sampleIndex < WEIGHT_COUNT; sampleIndex++) {
      int boneIndex = int(a_boneIndices[sampleIndex]);

      skinMatrix += a_boneWeights[sampleIndex] * getBoneMatrix(boneTexture, boneIndex);
    }

    position = skinMatrix * vec4(a_position.xyz, 1.0);
    normal = mat3(skinMatrix) * a_normal;
    tangent = mat3(skinMatrix) * a_tangent;
    bitangent = mat3(skinMatrix) * a_bitangent;
  } else {
    position = a_position;
    normal = a_normal;
    tangent = a_tangent;
    bitangent = a_bitangent;
  }

  v_worldPosition = transform.modelMatrix * position;
  v_objectPosition = position.xyz;
  v_normal = transform.normalMatrix * normal;
  v_tangent = transform.normalMatrix * tangent;
  v_bitangent = transform.normalMatrix * bitangent;
  v_cameraPosition = camera.viewMatrix * v_worldPosition;
  gl_Position = camera.projectionMatrix * v_cameraPosition;
  v_clipDistance = dot(v_worldPosition, clipPlane);
  v_coordinates = a_coordinates;
  v_lightDirection = light.isDirectional ? light.direction : light.translation - v_worldPosition.xyz;
  v_lightProjection = light.textureMatrix * v_worldPosition;
}
