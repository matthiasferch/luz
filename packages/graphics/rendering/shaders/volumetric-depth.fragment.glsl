uniform sampler2D depthTexture;
uniform vec2 destinationSize;

out vec4 fragmentColor;

void main() {
  ivec2 size = textureSize(depthTexture, 0);
  vec2 textureCoordinates = gl_FragCoord.xy / destinationSize;
  ivec2 pixel = clamp(ivec2(textureCoordinates * vec2(size)), ivec2(0), size - 1);

  fragmentColor = vec4(texelFetch(depthTexture, pixel, 0).r, 0.0, 0.0, 1.0);
}
