uniform sampler2D depthTexture;
uniform sampler2D normalTexture;

uniform float ambientOcclusionRadius;
uniform float ambientOcclusionIntensity;
uniform float ambientOcclusionFalloff;
uniform float ambientOcclusionThickness;
uniform int ambientOcclusionDirectionCount;
uniform int ambientOcclusionStepCount;
uniform int ambientOcclusionFrameIndex;
uniform vec2 ambientOcclusionResolution;

out vec4 outColor;

vec3 reconstructViewPosition(vec2 textureCoordinates, float depth) {
  vec4 worldPosition = reconstructPosition(camera.reconstructionMatrix, textureCoordinates, depth);

  return (camera.viewMatrix * vec4(worldPosition.xyz, 1.0)).xyz;
}

float generateInterleavedGradientNoise(vec2 pixel, int frameIndex) {
  vec2 animatedPixel = pixel + vec2(47.0, 17.0) * float(frameIndex);

  return fract(52.9829189 * fract(dot(animatedPixel, vec2(0.06711056, 0.00583715))));
}

float calculateHorizonOcclusion(
  vec2 textureCoordinates,
  vec2 screenDirection,
  float side,
  vec3 centerPosition,
  vec3 centerNormal,
  float projectedRadius,
  float randomOffset
) {
  vec2 depthSize = vec2(textureSize(depthTexture, 0));
  float maximumHorizon = 0.0;

  for (int stepIndex = 0; stepIndex < 6; ++stepIndex) {
    if (stepIndex >= ambientOcclusionStepCount) {
      break;
    }

    float stepFraction = (float(stepIndex) + 0.5 + 0.5 * randomOffset)
      / max(float(ambientOcclusionStepCount), 1.0);
    vec2 sampleTextureCoordinates = textureCoordinates
      + side * screenDirection * projectedRadius * stepFraction / depthSize;

    if (any(lessThanEqual(sampleTextureCoordinates, vec2(0.0))) ||
        any(greaterThanEqual(sampleTextureCoordinates, vec2(1.0)))) {
      continue;
    }

    float sampleDepth = texture(depthTexture, sampleTextureCoordinates).r;

    if (sampleDepth >= 1.0 - 1e-6) {
      continue;
    }

    vec3 samplePosition = reconstructViewPosition(sampleTextureCoordinates, sampleDepth);
    vec3 difference = samplePosition - centerPosition;
    float distanceToSample = length(difference);

    if (distanceToSample <= 1e-5 || distanceToSample >= ambientOcclusionRadius) {
      continue;
    }

    float normalDistance = dot(centerNormal, difference);
    float elevation = max((normalDistance - ambientOcclusionThickness) / distanceToSample, 0.0);
    float range = pow(
      clamp(1.0 - distanceToSample / max(ambientOcclusionRadius, 1e-4), 0.0, 1.0),
      max(ambientOcclusionFalloff, 0.01)
    );

    maximumHorizon = max(maximumHorizon, elevation * range);
  }

  return maximumHorizon;
}

void main() {
  vec2 textureCoordinates = gl_FragCoord.xy / max(ambientOcclusionResolution, vec2(1.0));
  float depth = texture(depthTexture, textureCoordinates).r;

  if (depth >= 1.0 - 1e-6 || ambientOcclusionRadius <= 0.0 || ambientOcclusionIntensity <= 0.0) {
    outColor = vec4(1.0);

    return;
  }

  vec3 centerPosition = reconstructViewPosition(textureCoordinates, depth);
  vec3 centerNormalWorld = decodeOctahedralNormal(texture(normalTexture, textureCoordinates).rg);
  vec3 centerNormal = normalize(mat3(camera.viewMatrix) * centerNormalWorld);
  vec2 depthSize = vec2(textureSize(depthTexture, 0));
  float projectionScale = 0.5 * depthSize.y * camera.projectionMatrix[1][1];
  float projectedRadius = max(
    ambientOcclusionRadius * projectionScale / max(-centerPosition.z, 1e-3),
    1.0
  );
  float randomRotation = generateInterleavedGradientNoise(gl_FragCoord.xy, ambientOcclusionFrameIndex);
  float occlusion = 0.0;

  for (int directionIndex = 0; directionIndex < 6; ++directionIndex) {
    if (directionIndex >= ambientOcclusionDirectionCount) {
      break;
    }

    float angle = PI * (float(directionIndex) + randomRotation)
      / max(float(ambientOcclusionDirectionCount), 1.0);
    vec2 screenDirection = vec2(cos(angle), sin(angle));

    occlusion += calculateHorizonOcclusion(
      textureCoordinates,
      screenDirection,
      -1.0,
      centerPosition,
      centerNormal,
      projectedRadius,
      randomRotation
    );
    occlusion += calculateHorizonOcclusion(
      textureCoordinates,
      screenDirection,
      1.0,
      centerPosition,
      centerNormal,
      projectedRadius,
      randomRotation
    );
  }

  float sampleCount = max(float(ambientOcclusionDirectionCount * 2), 1.0);
  float visibility = clamp(1.0 - occlusion / sampleCount, 0.0, 1.0);

  visibility = pow(visibility, max(ambientOcclusionIntensity, 0.01));
  outColor = vec4(visibility, 0.0, 0.0, 1.0);
}
