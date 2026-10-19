float reconstructDepth(float depth, vec2 clipPlanes) {
  depth = 2.0 * depth - 1.0;

  return 2.0 * clipPlanes.x * clipPlanes.y / (clipPlanes.y + clipPlanes.x - depth * (clipPlanes.y - clipPlanes.x));
}
