vec3 reconstructNormal(vec3 position) {
  return normalize(cross(dFdx(position), dFdy(position)));
}
