uniform sampler2D baseTexture;
uniform vec2 direction;
uniform int radius;
uniform float separation;

out vec4 outColor;

void main() {
  vec2 textureDimensions = vec2(textureSize(baseTexture, 0));
  vec2 textureCoordinates = gl_FragCoord.xy / textureDimensions;

  vec4 sum = vec4(0.0);
  float count = 0.0;

  // Some drivers fail when the sample separation is zero.
  float sampleSeparation = max(separation, 0.001);

  for (int sampleIndex = -radius; sampleIndex <= radius; ++sampleIndex) {
    vec2 offset = float(sampleIndex) * sampleSeparation * direction;

    sum += texture(baseTexture, textureCoordinates + offset / textureDimensions);
    count += 1.0;
  }

  outColor = sum / max(count, 1.0);
}
