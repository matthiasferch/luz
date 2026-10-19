uniform sampler2D baseTexture;
uniform bool isToneMappingEnabled;
uniform bool isGammaCorrectionEnabled;

out vec4 fragmentColor;

void main() {
  vec2 resolution = vec2(textureSize(baseTexture, 0));
  vec2 textureCoordinates = gl_FragCoord.xy / resolution;
  vec3 color = texture(baseTexture, textureCoordinates).rgb;

  if (isToneMappingEnabled) {
    color = applyToneMapping(max(color, vec3(0.0)));
  }

  if (isGammaCorrectionEnabled) {
    color = calculateGammaCorrection(max(color, vec3(0.0)));
  }

  fragmentColor = vec4(color, 1.0);
}
