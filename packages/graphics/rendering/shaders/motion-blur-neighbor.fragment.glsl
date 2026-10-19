uniform sampler2D tileVelocityTexture;
uniform vec2 motionResolution;
uniform float maximumRadius;

out vec4 fragmentColor;

void main() {
  ivec2 sourceSize = textureSize(tileVelocityTexture, 0);
  ivec2 tileCoordinate = ivec2(gl_FragCoord.xy);
  vec4 maximumMotion = vec4(0.0);
  float maximumSpeedSquared = 0.0;

  // The resolve samples half the exposure vector on each side. The supported
  // 64-pixel vector therefore needs up to two 16-pixel tiles in each direction.
  int tileRadius = clamp(int(ceil(0.5 * maximumRadius / 16.0)), 1, 2);

  for (int y = -2; y <= 2; ++y) {
    for (int x = -2; x <= 2; ++x) {
      if (abs(x) > tileRadius || abs(y) > tileRadius) {
        continue;
      }

      ivec2 sampleCoordinate = clamp(tileCoordinate + ivec2(x, y), ivec2(0), sourceSize - ivec2(1));
      vec4 motion = texelFetch(tileVelocityTexture, sampleCoordinate, 0);
      vec2 velocityPixels = motion.rg * motionResolution;
      float speedSquared = motion.a > 0.5 ? dot(velocityPixels, velocityPixels) : 0.0;

      if (speedSquared > maximumSpeedSquared) {
        maximumMotion = motion;
        maximumSpeedSquared = speedSquared;
      }
    }
  }

  fragmentColor = maximumMotion;
}
