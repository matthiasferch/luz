uniform sampler2D baseTexture;
uniform sampler2D depthTexture;
uniform sampler2D normalTexture;
uniform float ambientOcclusionDepthSharpness;
uniform float ambientOcclusionNormalSharpness;
uniform vec2 direction;
uniform int radius;

out vec4 outColor;

void main() {
  ivec2 integerTextureSize = textureSize(baseTexture, 0);
  vec2 textureDimensions = vec2(integerTextureSize);
  vec2 textureCoordinates = gl_FragCoord.xy / textureDimensions;

  float centerDepth = texture(depthTexture, textureCoordinates).r;

  if (centerDepth >= 1.0 - 1e-6) {
    outColor = vec4(1.0);

    return;
  }

  float centerLinear = reconstructDepth(centerDepth, camera.clipPlanes);
  vec3 centerNormal = decodeOctahedralNormal(texture(normalTexture, textureCoordinates).rg);

  float weightSum = 0.0;
  float ambientOcclusionSum = 0.0;

  for (int sampleIndex = -radius; sampleIndex <= radius; ++sampleIndex) {
    vec2 offset = float(sampleIndex) * direction;
    vec2 sampleCoordinates = textureCoordinates + offset / textureDimensions;

    float sampleDepth = texture(depthTexture, sampleCoordinates).r;

    if (sampleDepth >= 1.0 - 1e-6) {
      continue;
    }

    float sampleLinearDepth = reconstructDepth(sampleDepth, camera.clipPlanes);
    vec3 sampleNormal = decodeOctahedralNormal(texture(normalTexture, sampleCoordinates).rg);

    float squaredDistance = dot(offset, offset);
    float spatialWeight = exp(-squaredDistance / max(float(radius * radius), 1.0));

    float relativeDepth = abs(sampleLinearDepth - centerLinear) / max(min(sampleLinearDepth, centerLinear), 0.1);
    float depthWeight = exp(-relativeDepth * max(ambientOcclusionDepthSharpness, 0.0));

    float normalWeight = pow(max(dot(sampleNormal, centerNormal), 0.0), max(ambientOcclusionNormalSharpness, 0.0));

    float weight = spatialWeight * depthWeight * normalWeight;
    float ambientOcclusion = texture(baseTexture, sampleCoordinates).r;

    weightSum += weight;
    ambientOcclusionSum += ambientOcclusion * weight;
  }

  float blurredAmbientOcclusion =
    weightSum > 0.0
      ? ambientOcclusionSum / weightSum
      : texture(baseTexture, textureCoordinates).r;

  outColor = vec4(vec3(blurredAmbientOcclusion), 1.0);
}
