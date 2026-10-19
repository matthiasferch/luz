in vec2 v_coordinates;
in vec3 v_normal;
in vec3 v_tangent;
in vec3 v_bitangent;
in vec4 v_cameraPosition;
in vec4 v_worldPosition;
in vec3 v_objectPosition;
in float v_clipDistance;

out vec4 outColor;

void main() {
  if (v_clipDistance < 0.0) {
    discard;
  }

  vec2 textureCoordinates = vec2(v_coordinates.x, 1.0 - v_coordinates.y);
  MaterialContext materialContext = MaterialContext(
    textureCoordinates,
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

  float faceSign = gl_FrontFacing ? 1.0 : -1.0;

  // Keep the history normal in world space so it remains comparable when the
  // camera rotates. The AO search converts it to view space only while tracing.
  vec3 worldNormal = normalize(v_normal) * faceSign;

  outColor = vec4(encodeOctahedralNormal(worldNormal), 0.0, 1.0);
}
