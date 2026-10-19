in vec2 v_coordinates;
in vec3 v_normal;
in vec3 v_tangent;
in vec3 v_bitangent;
in vec4 v_cameraPosition;
in vec4 v_worldPosition;
in vec3 v_objectPosition;
in float v_clipDistance;

out vec4 outColor;

uniform vec3 depthOfFieldSurfaceId;

void main() {
  if (v_clipDistance < 0.0) {
    discard;
  }

  MaterialContext materialContext = MaterialContext(
    vec2(v_coordinates.x, 1.0 - v_coordinates.y),
    v_cameraPosition.xyz,
    v_worldPosition.xyz,
    v_objectPosition,
    v_normal,
    v_tangent,
    v_bitangent
  );
  MaterialSample materialSample = evaluateMaterial(materialContext);

  if (isMaterialAlphaMasked && materialSample.alpha < materialAlphaCutoff) {
    discard;
  }

  outColor = vec4(depthOfFieldSurfaceId, 1.0);
}
