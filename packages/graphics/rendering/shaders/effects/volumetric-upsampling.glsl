uniform sampler2D volumetricTexture;
uniform sampler2D volumetricDepthTexture;
uniform sampler2D volumetricSceneDepthTexture;
uniform bool isVolumetricLightingEnabled;

vec3 sampleVolumetricLighting(vec2 textureCoordinates, sampler2D depthTexture) {
  if (!isVolumetricLightingEnabled) {
    return vec3(0.0);
  }

  ivec2 size = textureSize(volumetricTexture, 0);
  vec2 position = textureCoordinates * vec2(size) - 0.5;
  ivec2 base = ivec2(floor(position));
  vec2 fraction = fract(position);
  float centerDepth = texture(depthTexture, textureCoordinates).r;
  float centerLinearDepth =
    centerDepth >= 1.0 - 1e-6
      ? camera.clipPlanes.y
      : reconstructDepth(centerDepth, camera.clipPlanes);
  vec3 color = vec3(0.0);
  float weightSum = 0.0;

  for (int y = 0; y < 2; ++y) {
    for (int x = 0; x < 2; ++x) {
      ivec2 pixel = clamp(base + ivec2(x, y), ivec2(0), size - 1);

      // This snapshot is the exact endpoint used by the integration pass,
      // even after transmission or another stage changes the scene depth.
      float sampleDepth = texelFetch(volumetricDepthTexture, pixel, 0).r;

      if (sampleDepth >= 1.0 - 1e-6 != centerDepth >= 1.0 - 1e-6) {
        continue;
      }

      float sampleLinearDepth =
        sampleDepth >= 1.0 - 1e-6
          ? camera.clipPlanes.y
          : reconstructDepth(sampleDepth, camera.clipPlanes);
      float relativeDifference =
        abs(sampleLinearDepth - centerLinearDepth) / max(min(sampleLinearDepth, centerLinearDepth), 0.1);

      if (relativeDifference > 0.05) {
        continue;
      }

      float depthWeight = exp(-32.0 * relativeDifference);
      vec2 axisWeight = mix(1.0 - fraction, fraction, vec2(x, y));
      float weight = depthWeight * axisWeight.x * axisWeight.y;

      color += texelFetch(volumetricTexture, pixel, 0).rgb * weight;
      weightSum += weight;
    }
  }

  return weightSum > 1e-6
    ? color / weightSum
    : vec3(0.0);
}
