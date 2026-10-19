uniform sampler2D baseTexture;
uniform vec2 destinationSize;
uniform float scatter;

out vec4 outColor;

void main() {
  vec2 sourceSize = vec2(textureSize(baseTexture, 0));
  vec2 textureCoordinates = gl_FragCoord.xy / destinationSize;

  // 3x3 tent filter. Bilinear source filtering fills the gaps between the
  // lower-resolution samples and keeps mip transitions smooth.
  vec2 texel = 1.0 / sourceSize;
  vec3 filteredColor = texture(baseTexture, textureCoordinates).rgb * 4.0;

  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(-1.0, 0.0)).rgb * 2.0;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(1.0, 0.0)).rgb * 2.0;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(0.0, -1.0)).rgb * 2.0;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(0.0, 1.0)).rgb * 2.0;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(-1.0, -1.0)).rgb;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(1.0, -1.0)).rgb;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(-1.0, 1.0)).rgb;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(1.0, 1.0)).rgb;
  filteredColor *= 1.0 / 16.0;
  outColor = vec4(filteredColor * clamp(scatter, 0.0, 1.0), 1.0);
}
