uniform sampler2D baseTexture;
uniform sampler2D depthTexture;
uniform sampler2D normalTexture;

out vec4 outColor;

void main() {
  vec2 destinationSize = vec2(textureSize(depthTexture, 0));
  vec2 sourceSize = vec2(textureSize(baseTexture, 0));
  vec2 textureCoordinates = gl_FragCoord.xy / destinationSize;
  float centerDepth = texture(depthTexture, textureCoordinates).r;

  if (centerDepth >= 1.0 - 1e-6) {
    outColor = vec4(1.0);

    return;
  }

  float centerLinear = reconstructDepth(centerDepth, camera.clipPlanes);
  vec3 centerNormal = decodeOctahedralNormal(texture(normalTexture, textureCoordinates).rg);
  vec2 sourcePosition = textureCoordinates * sourceSize - 0.5;
  ivec2 baseCoordinate = ivec2(floor(sourcePosition));
  vec2 fraction = fract(sourcePosition);
  float visibilitySum = 0.0;
  float weightSum = 0.0;

  for (int y = 0; y < 2; ++y) {
    for (int x = 0; x < 2; ++x) {
      ivec2 coordinate = clamp(baseCoordinate + ivec2(x, y), ivec2(0), ivec2(sourceSize) - 1);
      vec2 sampleTextureCoordinates = (vec2(coordinate) + 0.5) / sourceSize;
      float sampleDepth = texture(depthTexture, sampleTextureCoordinates).r;

      if (sampleDepth >= 1.0 - 1e-6) {
        continue;
      }

      float sampleLinear = reconstructDepth(sampleDepth, camera.clipPlanes);
      vec3 sampleNormal = decodeOctahedralNormal(texture(normalTexture, sampleTextureCoordinates).rg);
      vec2 axisWeight = mix(1.0 - fraction, fraction, vec2(float(x), float(y)));
      float bilinearWeight = axisWeight.x * axisWeight.y;
      float relativeDepth = abs(sampleLinear - centerLinear) / max(min(sampleLinear, centerLinear), 0.1);
      float guideWeight = exp(-32.0 * relativeDepth) * pow(max(dot(sampleNormal, centerNormal), 0.0), 16.0);
      float weight = bilinearWeight * guideWeight;

      visibilitySum += texelFetch(baseTexture, coordinate, 0).r * weight;
      weightSum += weight;
    }
  }

  float fallback = texture(baseTexture, textureCoordinates).r;
  float visibility = weightSum > 1e-5 ? visibilitySum / weightSum : fallback;

  outColor = vec4(visibility, 0.0, 0.0, 1.0);
}
