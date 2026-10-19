uniform sampler2D baseTexture;
uniform vec2 destinationSize;

out vec4 outColor;

void main() {
  vec2 sourceSize = vec2(textureSize(baseTexture, 0));
  vec2 textureCoordinates = gl_FragCoord.xy / destinationSize;
  vec2 texel = 1.0 / sourceSize;

  // Energy-preserving 13-tap low-pass filter. This produces a smooth mip
  // chain without a separate blur pass at every level.
  vec3 filteredColor = texture(baseTexture, textureCoordinates).rgb * 0.125;

  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(-2.0, 0.0)).rgb * 0.0625;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(2.0, 0.0)).rgb * 0.0625;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(0.0, -2.0)).rgb * 0.0625;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(0.0, 2.0)).rgb * 0.0625;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(-1.0, -1.0)).rgb * 0.125;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(1.0, -1.0)).rgb * 0.125;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(-1.0, 1.0)).rgb * 0.125;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(1.0, 1.0)).rgb * 0.125;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(-2.0, -2.0)).rgb * 0.03125;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(2.0, -2.0)).rgb * 0.03125;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(-2.0, 2.0)).rgb * 0.03125;
  filteredColor += texture(baseTexture, textureCoordinates + texel * vec2(2.0, 2.0)).rgb * 0.03125;
  outColor = vec4(filteredColor, 1.0);
}
