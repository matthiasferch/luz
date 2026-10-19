uniform sampler2D currentAmbientOcclusionTexture;
uniform sampler2D historyTexture;
uniform sampler2D historyMetadataTexture;
uniform sampler2D motionVectorTexture;
uniform sampler2D depthTexture;
uniform sampler2D normalTexture;
uniform bool isHistoryValid;
uniform float temporalStability;
uniform vec2 ambientOcclusionResolution;

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outMetadata;

vec2 encodeAmbientOcclusionUnsigned16(float value) {
  value = floor(clamp(value, 0.0, 65535.0) + 0.5);

  return vec2(mod(value, 256.0), floor(value / 256.0)) / 255.0;
}

float decodeAmbientOcclusionUnsigned16(vec2 value) {
  vec2 bytes = floor(value * 255.0 + 0.5);

  return bytes.x + 256.0 * bytes.y;
}

float encodeAmbientOcclusionDepth(float depth) {
  float linearDepth = reconstructDepth(depth, camera.clipPlanes);
  float nearPlane = max(camera.clipPlanes.x, 1e-6);
  float farPlane = max(camera.clipPlanes.y, nearPlane + 1e-6);

  return clamp(log2(max(linearDepth, nearPlane) / nearPlane) / log2(farPlane / nearPlane), 0.0, 1.0);
}

void main() {
  vec2 textureCoordinates = gl_FragCoord.xy / max(ambientOcclusionResolution, vec2(1.0));
  float depth = texture(depthTexture, textureCoordinates).r;
  vec2 encodedNormal = texture(normalTexture, textureCoordinates).rg;
  vec4 motion = texture(motionVectorTexture, textureCoordinates);
  float surfaceId = motion.a >= 1.0 ? floor(motion.a) : 0.0;
  float currentDepth = depth >= 1.0 - 1e-6 ? 1.0 : encodeAmbientOcclusionDepth(depth);

  outMetadata = vec4(
    encodeAmbientOcclusionUnsigned16(surfaceId),
    encodeAmbientOcclusionUnsigned16(currentDepth * 65535.0)
  );

  if (depth >= 1.0 - 1e-6) {
    outColor = vec4(1.0, 1.0, encodedNormal);

    return;
  }

  float currentVisibility = texture(currentAmbientOcclusionTexture, textureCoordinates).r;
  vec2 velocity = motion.rg;
  vec2 previousTextureCoordinates = textureCoordinates - velocity;

  float neighborhoodMinimum = currentVisibility;
  float neighborhoodMaximum = currentVisibility;
  float mean = 0.0;
  float secondMoment = 0.0;
  vec2 texel = 1.0 / max(ambientOcclusionResolution, vec2(1.0));

  for (int y = -1; y <= 1; ++y) {
    for (int x = -1; x <= 1; ++x) {
      float sampleVisibility = texture(currentAmbientOcclusionTexture, textureCoordinates + vec2(x, y) * texel).r;

      neighborhoodMinimum = min(neighborhoodMinimum, sampleVisibility);
      neighborhoodMaximum = max(neighborhoodMaximum, sampleVisibility);
      mean += sampleVisibility;
      secondMoment += sampleVisibility * sampleVisibility;
    }
  }

  bool isInsideHistory =
    all(greaterThan(previousTextureCoordinates, vec2(0.0))) && all(lessThan(previousTextureCoordinates, vec2(1.0)));
  vec3 currentNormal = decodeOctahedralNormal(encodedNormal);
  float depthTolerance = clamp(2.0 / 65535.0 + 2.0 * fwidth(currentDepth), 2.0 / 65535.0, 0.04);
  float historySum = 0.0;
  float weightSum = 0.0;

  if (isHistoryValid && motion.a >= 1.0 && isInsideHistory) {
    ivec2 size = textureSize(historyTexture, 0);
    vec2 position = previousTextureCoordinates * vec2(size) - 0.5;
    ivec2 base = ivec2(floor(position));
    vec2 fraction = fract(position);

    for (int y = 0; y < 2; ++y) {
      for (int x = 0; x < 2; ++x) {
        ivec2 pixel = base + ivec2(x, y);

        if (any(lessThan(pixel, ivec2(0))) || any(greaterThanEqual(pixel, size))) {
          continue;
        }

        vec4 metadata = texelFetch(historyMetadataTexture, pixel, 0);

        if (abs(decodeAmbientOcclusionUnsigned16(metadata.rg) - surfaceId) >= 0.5) {
          continue;
        }

        float depthDifference = abs(decodeAmbientOcclusionUnsigned16(metadata.ba) / 65535.0 - motion.b);

        if (depthDifference >= depthTolerance) {
          continue;
        }

        vec4 history = texelFetch(historyTexture, pixel, 0);
        vec3 historyNormal = decodeOctahedralNormal(history.ba);

        if (dot(currentNormal, historyNormal) <= 0.85) {
          continue;
        }

        vec2 weights = mix(1.0 - fraction, fraction, vec2(x, y));
        float weight = weights.x * weights.y;

        historySum += history.r * weight;
        weightSum += weight;
      }
    }
  }

  float rawHistory = weightSum > 1e-6 ? historySum / weightSum : currentVisibility;
  float historyVisibility = clamp(rawHistory, neighborhoodMinimum, neighborhoodMaximum);

  mean /= 9.0;

  float deviation = sqrt(max(secondMoment / 9.0 - mean * mean, 0.0));

  // A moving occluder can change AO on a stationary receiving surface. Keep
  // local sampling noise stable, while responding to unexplained changes.
  float appearanceChange = max(
    abs(rawHistory - historyVisibility),
    max(abs(currentVisibility - historyVisibility) - 1.25 * deviation, 0.0)
  );
  float reactive = smoothstep(0.03, 0.2, appearanceChange);
  float historyWeight = weightSum > 1e-6 ? clamp(temporalStability, 0.0, 0.98) * pow(1.0 - reactive, 2.0) : 0.0;
  float resolvedVisibility = mix(currentVisibility, historyVisibility, historyWeight);

  outColor = vec4(resolvedVisibility, currentDepth, encodedNormal);
}
