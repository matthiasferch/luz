uniform sampler2D motionVectorTexture;

out vec4 fragmentColor;

const int MOTION_BLUR_TILE_SIZE = 16;

void main() {
  ivec2 sourceSize = textureSize(motionVectorTexture, 0);
  ivec2 tileOrigin = ivec2(gl_FragCoord.xy) * MOTION_BLUR_TILE_SIZE;
  vec4 maximumMotion = vec4(0.0);
  float maximumSpeedSquared = 0.0;

  for (int y = 0; y < MOTION_BLUR_TILE_SIZE; ++y) {
    for (int x = 0; x < MOTION_BLUR_TILE_SIZE; ++x) {
      ivec2 sourceCoordinate = tileOrigin + ivec2(x, y);

      if (any(greaterThanEqual(sourceCoordinate, sourceSize))) {
        continue;
      }

      vec4 motion = texelFetch(motionVectorTexture, sourceCoordinate, 0);
      vec2 velocityPixels = motion.rg * vec2(sourceSize);
      float speedSquared = motion.a > 0.5 ? dot(velocityPixels, velocityPixels) : 0.0;

      if (speedSquared > maximumSpeedSquared) {
        maximumMotion = motion;
        maximumSpeedSquared = speedSquared;
      }
    }
  }

  fragmentColor = maximumMotion;
}
