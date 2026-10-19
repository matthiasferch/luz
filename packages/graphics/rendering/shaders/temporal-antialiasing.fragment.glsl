uniform sampler2D currentTexture;
uniform sampler2D historyTexture;
uniform sampler2D historyMetadataTexture;
uniform sampler2D historyLuminanceTexture;
uniform sampler2D motionVectorTexture;
uniform sampler2D depthTexture;
uniform mat4 currentViewProjectionMatrix;
uniform mat4 previousViewProjectionMatrix;
uniform bool isHistoryValid;
uniform int historyLength;
uniform bool areMotionVectorsVisualized;

layout(location = 0) out vec4 fragmentColor;
layout(location = 1) out vec4 fragmentMetadata;
layout(location = 2) out vec4 fragmentLuminance;

float encodeLogarithmicDepth(float rawDepth) {
  float nearPlane = max(camera.clipPlanes.x, 1e-6);
  float farPlane = max(camera.clipPlanes.y, nearPlane + 1e-6);
  float linearDepth = rawDepth >= 1.0 - 1e-6 ? farPlane : reconstructDepth(rawDepth, camera.clipPlanes);

  return log(max(linearDepth / nearPlane, 1.0)) / log(farPlane / nearPlane);
}

vec3 clipHistoryToNeighborhood(
  vec3 historyColor,
  vec2 textureCoordinates,
  vec2 texelSize,
  float luminanceInstability,
  out vec3 standardDeviation
) {
  vec3 minimumColor = vec3(1e20);
  vec3 maximumColor = vec3(-1e20);
  vec3 mean = vec3(0.0);
  vec3 secondMoment = vec3(0.0);

  for (int y = -1; y <= 1; ++y) {
    for (int x = -1; x <= 1; ++x) {
      vec3 sampleColor = texture(currentTexture, textureCoordinates + vec2(x, y) * texelSize).rgb;

      minimumColor = min(minimumColor, sampleColor);
      maximumColor = max(maximumColor, sampleColor);
      mean += sampleColor;
      secondMoment += sampleColor * sampleColor;
    }
  }

  mean /= 9.0;
  standardDeviation = sqrt(max(secondMoment / 9.0 - mean * mean, vec3(0.0)));

  vec3 varianceMinimum = mean - 1.25 * standardDeviation;
  vec3 varianceMaximum = mean + 1.25 * standardDeviation;
  vec3 strictHistory = clamp(historyColor, max(minimumColor, varianceMinimum), min(maximumColor, varianceMaximum));

  // Recurring jitter samples may exceed the variance box, but must still be
  // supported by the current neighborhood. A vanished highlight cannot linger.
  return mix(strictHistory, clamp(historyColor, minimumColor, maximumColor), luminanceInstability);
}

float calculateLuminance(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

vec2 encodeUnsigned16(float value) {
  float integerValue = floor(clamp(value, 0.0, 65535.0) + 0.5);

  return vec2(mod(integerValue, 256.0), floor(integerValue / 256.0)) / 255.0;
}

float decodeUnsigned16(vec2 encoded) {
  vec2 bytes = floor(encoded * 255.0 + 0.5);

  return bytes.x + 256.0 * bytes.y;
}

vec4 encodeHistoryMetadata(float surfaceId, float logarithmicDepth) {
  return vec4(encodeUnsigned16(surfaceId), encodeUnsigned16(clamp(logarithmicDepth, 0.0, 1.0) * 65535.0));
}

float decodeHistorySurfaceId(vec4 metadata) {
  return decodeUnsigned16(metadata.rg);
}

float decodeHistoryDepth(vec4 metadata) {
  return decodeUnsigned16(metadata.ba) / 65535.0;
}

bool isSameSurface(float firstOwner, float secondOwner) {
  return abs(firstOwner - secondOwner) < 0.5;
}

bool isHistoryTexelValid(
  ivec2 pixel,
  float expectedSurfaceId,
  float expectedDepth,
  float depthTolerance,
  out float depthDifference
) {
  vec4 metadata = texelFetch(historyMetadataTexture, pixel, 0);

  depthDifference = abs(decodeHistoryDepth(metadata) - expectedDepth);

  return isSameSurface(decodeHistorySurfaceId(metadata), expectedSurfaceId) && depthDifference < depthTolerance;
}

bool sampleSurfaceHistory(
  vec2 previousTextureCoordinates,
  float expectedSurfaceId,
  float expectedDepth,
  float depthTolerance,
  out vec4 historySample,
  out float depthDifference
) {
  ivec2 size = textureSize(historyTexture, 0);
  vec2 position = previousTextureCoordinates * vec2(size) - 0.5;
  ivec2 base = ivec2(floor(position));
  vec2 fraction = fract(position);

  historySample = vec4(0.0);
  depthDifference = 0.0;

  float totalWeight = 0.0;

  // Validate the exact texels contributing color, before filtering. A single
  // nearest metadata lookup cannot validate a bilinear mixture of surfaces.
  for (int y = 0; y <= 1; ++y) {
    for (int x = 0; x <= 1; ++x) {
      ivec2 pixel = base + ivec2(x, y);

      if (any(lessThan(pixel, ivec2(0))) || any(greaterThanEqual(pixel, size))) {
        continue;
      }

      float weight = (x == 0 ? 1.0 - fraction.x : fraction.x) * (y == 0 ? 1.0 - fraction.y : fraction.y);

      if (weight <= 0.0) {
        continue;
      }

      float candidateDepthDifference;

      if (!isHistoryTexelValid(pixel, expectedSurfaceId, expectedDepth, depthTolerance, candidateDepthDifference)) {
        continue;
      }

      historySample += texelFetch(historyTexture, pixel, 0) * weight;
      depthDifference += candidateDepthDifference * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight <= 1e-6) {
    return false;
  }

  historySample /= totalWeight;
  depthDifference /= totalWeight;

  return true;
}

bool findClosestSurfaceHistory(
  vec2 previousTextureCoordinates,
  float expectedSurfaceId,
  float expectedDepth,
  float depthTolerance,
  out vec4 closestSample,
  out float closestDepthDifference
) {
  ivec2 size = textureSize(historyTexture, 0);
  vec2 position = previousTextureCoordinates * vec2(size) - 0.5;
  ivec2 center = ivec2(floor(position + 0.5));

  closestSample = vec4(0.0);
  closestDepthDifference = 1e20;

  float closestDistance = 1e20;
  bool hasFoundHistory = false;

  for (int y = -1; y <= 1; ++y) {
    for (int x = -1; x <= 1; ++x) {
      ivec2 pixel = center + ivec2(x, y);

      if (any(lessThan(pixel, ivec2(0))) || any(greaterThanEqual(pixel, size))) {
        continue;
      }

      float candidateDepthDifference;

      if (!isHistoryTexelValid(pixel, expectedSurfaceId, expectedDepth, depthTolerance, candidateDepthDifference)) {
        continue;
      }

      float distance = length(vec2(pixel) - position);

      if (
        candidateDepthDifference < closestDepthDifference ||
        candidateDepthDifference == closestDepthDifference && distance < closestDistance
      ) {
        closestSample = texelFetch(historyTexture, pixel, 0);
        closestDepthDifference = candidateDepthDifference;
        closestDistance = distance;
        hasFoundHistory = true;
      }
    }
  }

  return hasFoundHistory;
}

float calculateMotionBoundaryResponse(vec2 textureCoordinates, vec4 centerMotion, vec2 texelSize, vec2 resolution) {
  bool hasCenterMotion = centerMotion.a > 0.25;
  float centerSpeed = hasCenterMotion ? length(centerMotion.rg * resolution) : 0.0;
  float response = 0.0;

  for (int y = -1; y <= 1; ++y) {
    for (int x = -1; x <= 1; ++x) {
      if (x == 0 && y == 0) {
        continue;
      }

      vec4 neighborMotion = texture(
        motionVectorTexture,
        clamp(textureCoordinates + vec2(x, y) * texelSize, vec2(0.0), vec2(1.0))
      );
      bool hasNeighborMotion = neighborMotion.a > 0.25;
      float neighborSpeed = hasNeighborMotion ? length(neighborMotion.rg * resolution) : 0.0;
      float edgeSpeed = max(centerSpeed, neighborSpeed);

      if (hasCenterMotion != hasNeighborMotion) {
        response = max(response, smoothstep(0.05, 1.0, edgeSpeed));
      } else if (hasCenterMotion) {
        float velocityDifference = length((neighborMotion.rg - centerMotion.rg) * resolution);

        response = max(response, smoothstep(0.25, 2.0, velocityDifference));
      }
    }
  }

  return response;
}

void main() {
  vec2 resolution = vec2(textureSize(currentTexture, 0));
  vec2 texelSize = 1.0 / resolution;
  vec2 textureCoordinates = gl_FragCoord.xy * texelSize;
  vec3 currentColor = texture(currentTexture, textureCoordinates).rgb;
  float currentRawDepth = texture(depthTexture, textureCoordinates).r;
  float currentLogDepth = encodeLogarithmicDepth(currentRawDepth);
  vec4 motionSample = texture(motionVectorTexture, textureCoordinates);
  bool hasSurfaceMotion = motionSample.a >= 1.0;
  float currentSurfaceId = hasSurfaceMotion ? floor(motionSample.a + 1e-4) : 0.0;
  float materialReactive = hasSurfaceMotion ? clamp(fract(motionSample.a) * 2.0, 0.0, 1.0) : 0.0;

  fragmentMetadata = encodeHistoryMetadata(currentSurfaceId, currentLogDepth);

  vec2 velocity;
  float expectedPreviousLogDepth;
  bool isVelocityValid;

  if (hasSurfaceMotion) {
    velocity = motionSample.rg;
    expectedPreviousLogDepth = motionSample.b;
    isVelocityValid = true;
  } else {
    bool isSky = currentRawDepth >= 1.0 - 1e-6;
    vec4 worldPosition = reconstructPosition(
      camera.reconstructionMatrix,
      textureCoordinates,
      isSky
        ? 1.0
        : currentRawDepth
    );
    vec4 currentClipPosition;
    vec4 previousClipPosition;

    if (isSky) {
      // A sky sample represents a direction at infinity, not a point on the
      // finite far plane. Reprojecting it with w = 0 removes camera translation
      // while retaining rotational motion, preventing translated sky trails.
      mat4 inverseViewMatrix = camera.reconstructionMatrix * camera.projectionMatrix;
      vec4 cameraWorldPosition = inverseViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      vec3 worldDirection = normalize(
        worldPosition.xyz / worldPosition.w - cameraWorldPosition.xyz / cameraWorldPosition.w
      );
      vec4 worldDirectionAtInfinity = vec4(worldDirection, 0.0);

      currentClipPosition = currentViewProjectionMatrix * worldDirectionAtInfinity;
      previousClipPosition = previousViewProjectionMatrix * worldDirectionAtInfinity;
    } else {
      currentClipPosition = currentViewProjectionMatrix * worldPosition;
      previousClipPosition = previousViewProjectionMatrix * worldPosition;
    }

    isVelocityValid = currentClipPosition.w > 1e-6 && previousClipPosition.w > 1e-6;

    vec3 currentNormalizedDeviceCoordinates = currentClipPosition.xyz / max(currentClipPosition.w, 1e-6);
    vec3 previousNormalizedDeviceCoordinates = previousClipPosition.xyz / max(previousClipPosition.w, 1e-6);

    velocity = isVelocityValid
      ? (currentNormalizedDeviceCoordinates.xy - previousNormalizedDeviceCoordinates.xy) * 0.5
      : vec2(0.0);
    expectedPreviousLogDepth = isSky ? 1.0 : encodeLogarithmicDepth(previousNormalizedDeviceCoordinates.z * 0.5 + 0.5);
  }

  vec2 previousTextureCoordinates = textureCoordinates - velocity;
  float velocityPixels = length(velocity * resolution);
  bool isStationarySample = velocityPixels < 0.01;
  bool isStationarySurface = hasSurfaceMotion && isStationarySample;
  bool isWithinHistory =
    all(greaterThanEqual(previousTextureCoordinates, vec2(0.0))) &&
    all(lessThanEqual(previousTextureCoordinates, vec2(1.0)));
  float depthTolerance = clamp(2.0 / 65535.0 + 2.0 * fwidth(currentLogDepth), 2.0 / 65535.0, 0.04);
  vec4 historySample = vec4(0.0);
  float depthDifference = 0.0;
  bool isHistorySampleValid = false;

  if (isHistoryValid && isVelocityValid && isWithinHistory) {
    isHistorySampleValid = sampleSurfaceHistory(
      previousTextureCoordinates,
      currentSurfaceId,
      expectedPreviousLogDepth,
      depthTolerance,
      historySample,
      depthDifference
    );
  }

  if (isHistoryValid && isVelocityValid && isWithinHistory && isStationarySurface && !isHistorySampleValid) {
    // Projection jitter can shift a static silhouette by a subpixel. Recover
    // history from the nearest sample that belongs to the same depth instead
    // of accepting whatever happened to occupy the current pixel last frame.
    // This preserves stationary stability without retaining a moving object
    // over newly exposed geometry.
    isHistorySampleValid = findClosestSurfaceHistory(
      previousTextureCoordinates,
      currentSurfaceId,
      expectedPreviousLogDepth,
      depthTolerance,
      historySample,
      depthDifference
    );
  }

  // Store four *unresolved* log-luminance samples in RGBA8. Resolved color would
  // hide oscillations. Fetch a single metadata-validated texel: interpolating
  // these samples could manufacture a recurrence between unrelated sequences.
  float currentLuminance = log2(1.0 + clamp(calculateLuminance(currentColor), 0.0, 65504.0)) / 16.0;
  vec4 pastLuminance = vec4(currentLuminance);
  bool isLuminanceHistoryValid = false;

  if (isHistorySampleValid) {
    ivec2 size = textureSize(historyLuminanceTexture, 0);
    ivec2 pixel = ivec2(floor(previousTextureCoordinates * vec2(size)));
    float difference;

    if (
      all(greaterThanEqual(pixel, ivec2(0))) &&
      all(lessThan(pixel, size)) &&
      isHistoryTexelValid(pixel, currentSurfaceId, expectedPreviousLogDepth, depthTolerance, difference)
    ) {
      pastLuminance = texelFetch(historyLuminanceTexture, pixel, 0);
      isLuminanceHistoryValid = true;
    }
  }

  fragmentLuminance = vec4(currentLuminance, pastLuminance.rgb);

  float boundaryReactive = calculateMotionBoundaryResponse(textureCoordinates, motionSample, texelSize, resolution);
  float luminanceInstability = 0.0;

  if (isLuminanceHistoryValid && hasSurfaceMotion && materialReactive < 0.1 && boundaryReactive < 0.1) {
    float previousDifference = abs(currentLuminance - pastLuminance.r);
    vec3 olderDifference = abs(vec3(currentLuminance) - pastLuminance.gba);
    float recurringDifference = min(olderDifference.x, min(olderDifference.y, olderDifference.z));

    // Require a substantial change from last frame and a closer match to an
    // older sample. The absolute tolerance accounts for RGBA8 quantization.
    bool isRecurringHighlight =
      previousDifference > 4.0 / 255.0 &&
      recurringDifference < max(1.5 / 255.0, 0.15 * previousDifference) &&
      recurringDifference < 0.25 * previousDifference;

    if (isRecurringHighlight) {
      luminanceInstability = 1.0 - smoothstep(0.25, 2.0, velocityPixels);
    }
  }

  if (areMotionVectorsVisualized) {
    float speed = clamp(length(velocity * resolution) / 24.0, 0.0, 1.0);
    vec2 direction = velocity / max(length(velocity), 1e-6);
    vec3 velocityColor = vec3(direction * 0.5 + 0.5, speed);

    fragmentColor = vec4(
      isHistorySampleValid
        ? velocityColor
        : mix(velocityColor, vec3(1.0, 0.0, 1.0), 0.8),
      currentLogDepth
    );

    return;
  }

  vec3 resolvedColor = currentColor;

  if (isHistorySampleValid) {
    vec3 neighborhoodDeviation;
    vec3 historyColor = clipHistoryToNeighborhood(
      historySample.rgb,
      textureCoordinates,
      texelSize,
      luminanceInstability,
      neighborhoodDeviation
    );
    float motionConfidence = exp(-0.08 * velocityPixels);
    float colorDifference = length(currentColor - historyColor);

    // Relative radiance keeps history confidence stable across HDR brightness.
    float colorScale = max(max(length(currentColor), length(historyColor)), 0.1);
    float relativeColorDifference = colorDifference / colorScale;
    float luminanceDifference =
      abs(calculateLuminance(currentColor) - calculateLuminance(historyColor)) /
      max(max(calculateLuminance(currentColor), calculateLuminance(historyColor)), 0.05);

    // Static geometry can still have changing shadows or reflections. Allow
    // differences explained by local subpixel detail, but react to history
    // outside the neighborhood and to changes larger than that detail.
    float stationaryAppearanceDifference =
      max(length(historySample.rgb - historyColor), max(colorDifference - 1.25 * length(neighborhoodDeviation), 0.0)) /
      max(max(length(currentColor), length(historySample.rgb)), 0.1);
    float colorReactive = isStationarySample
      ? smoothstep(0.08, 0.45, stationaryAppearanceDifference)
      : smoothstep(0.08, 0.45, max(luminanceDifference, relativeColorDifference));

    colorReactive *= 1.0 - luminanceInstability;

    float movingSurface = smoothstep(0.05, 1.5, velocityPixels);
    float reactive = max(colorReactive, max(boundaryReactive, materialReactive * movingSurface));
    float colorConfidence = exp(-4.0 * relativeColorDifference);
    float depthConfidence = isStationarySample
      ? 1.0
      : 1.0 - smoothstep(0.25 * depthTolerance, depthTolerance, depthDifference);
    float accumulatedFrames = float(max(historyLength, 1));
    float accumulationWeight = min(0.97, accumulatedFrames / (accumulatedFrames + 1.0));
    float colorWeight = isStationarySample ? mix(0.98, 1.0, colorConfidence) : mix(0.55, 1.0, colorConfidence);

    // The aggressive cap is useful while moving, but applying it to a static
    // image leaves too much of the jittered current frame visible forever.
    float motionHistoryCap = isStationarySample ? 1.0 : mix(0.9, 0.35, smoothstep(0.25, 12.0, velocityPixels));
    float historyWeight =
      min(accumulationWeight * mix(0.4, 1.0, motionConfidence), motionHistoryCap) *
      colorWeight *
      depthConfidence *
      pow(1.0 - reactive, 2.0);

    // A bounded response converges promptly when a recurring highlight is first
    // recognized, even if the global history has already accumulated 32 frames.
    historyWeight = mix(historyWeight, min(accumulationWeight, 0.9) * depthConfidence, luminanceInstability);

    float maximumHistoryWeight = isStationarySample ? 0.97 : 0.95;

    resolvedColor = mix(currentColor, historyColor, clamp(historyWeight, 0.0, maximumHistoryWeight));
  }

  fragmentColor = vec4(clamp(resolvedColor, vec3(-65504.0), vec3(65504.0)), currentLogDepth);
}
