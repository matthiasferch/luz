vec2 encodeOctahedralNormal(vec3 value) {
  vec3 normal = value / max(abs(value.x) + abs(value.y) + abs(value.z), 1e-6);
  vec2 encoded = normal.xy;

  if (normal.z < 0.0) {
    encoded = (1.0 - abs(encoded.yx)) * sign(encoded.xy);
  }

  return encoded * 0.5 + 0.5;
}

vec3 decodeOctahedralNormal(vec2 value) {
  vec2 encoded = value * 2.0 - 1.0;
  vec3 normal = vec3(encoded, 1.0 - abs(encoded.x) - abs(encoded.y));

  if (normal.z < 0.0) {
    normal.xy = (1.0 - abs(normal.yx)) * sign(normal.xy);
  }

  return normalize(normal);
}
