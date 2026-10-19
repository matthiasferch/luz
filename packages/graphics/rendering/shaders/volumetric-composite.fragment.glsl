uniform sampler2D depthTexture;
uniform vec2 destinationSize;

out vec4 outColor;

void main() {
  vec2 textureCoordinates = gl_FragCoord.xy / destinationSize;

  outColor = vec4(sampleVolumetricLighting(textureCoordinates, depthTexture), 1.0);
}
