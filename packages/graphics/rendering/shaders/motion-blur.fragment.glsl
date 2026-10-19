uniform sampler2D currentTexture;
uniform sampler2D motionVectorTexture;
uniform sampler2D neighborVelocityTexture;
uniform sampler2D depthTexture;
uniform mat4 currentViewProjectionMatrix;
uniform mat4 previousViewProjectionMatrix;
uniform float shutterAngle;
uniform float maximumRadius;
uniform int maximumSamples;
uniform bool isCameraBlurEnabled;

out vec4 fragmentColor;

float encodeLogarithmicDepth(float rawDepth) {
  float nearPlane = max(camera.clipPlanes.x, 1e-6);
  float farPlane = max(camera.clipPlanes.y, nearPlane + 1e-6);
  float linearDepth = rawDepth >= 1.0 - 1e-6 ? farPlane : reconstructDepth(rawDepth, camera.clipPlanes);

  return log(max(linearDepth / nearPlane, 1.0)) / log(farPlane / nearPlane);
}

vec2 calculateFallbackVelocity(vec2 textureCoordinates, float rawDepth, out bool isValid) {
  isValid = false;

  if (!isCameraBlurEnabled) {
    return vec2(0.0);
  }

  bool isSky = rawDepth >= 1.0 - 1e-6;
  vec4 worldPosition = reconstructPosition(camera.reconstructionMatrix, textureCoordinates, isSky ? 1.0 : rawDepth);
  vec4 currentClipPosition;
  vec4 previousClipPosition;

  if (isSky) {
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

  isValid = currentClipPosition.w > 1e-6 && previousClipPosition.w > 1e-6;

  vec2 currentNormalizedDeviceCoordinates = currentClipPosition.xy / max(currentClipPosition.w, 1e-6);
  vec2 previousNormalizedDeviceCoordinates = previousClipPosition.xy / max(previousClipPosition.w, 1e-6);

  return isValid
    ? (currentNormalizedDeviceCoordinates - previousNormalizedDeviceCoordinates) * 0.5
    : vec2(0.0);
}

float calculateVelocitySimilarity(vec2 firstVelocity, vec2 secondVelocity, vec2 resolution) {
  vec2 firstPixels = firstVelocity * resolution;
  vec2 secondPixels = secondVelocity * resolution;
  float firstSpeed = length(firstPixels);
  float secondSpeed = length(secondPixels);

  if (firstSpeed < 0.25 || secondSpeed < 0.25) {
    return 0.0;
  }

  float directionalAgreement = max(dot(firstPixels / firstSpeed, secondPixels / secondSpeed), 0.0);
  float magnitudeAgreement = min(firstSpeed, secondSpeed) / max(firstSpeed, secondSpeed);

  return smoothstep(0.25, 0.8, directionalAgreement * magnitudeAgreement);
}

void main() {
  vec2 resolution = vec2(textureSize(currentTexture, 0));
  vec2 textureCoordinates = gl_FragCoord.xy / resolution;
  vec3 currentColor = texture(currentTexture, textureCoordinates).rgb;
  float currentRawDepth = texture(depthTexture, textureCoordinates).r;
  bool isCurrentSky = currentRawDepth >= 1.0 - 1e-6;

  vec4 surfaceMotion = texture(motionVectorTexture, textureCoordinates);
  bool isFallbackValid = false;
  vec2 ownVelocity =
    surfaceMotion.a > 0.5
      ? surfaceMotion.rg
      : calculateFallbackVelocity(textureCoordinates, currentRawDepth, isFallbackValid);
  bool isOwnVelocityValid = surfaceMotion.a > 0.5 || isFallbackValid;

  ivec2 neighborSize = textureSize(neighborVelocityTexture, 0);
  ivec2 neighborCoordinate = clamp(ivec2(gl_FragCoord.xy) / 16, ivec2(0), neighborSize - ivec2(1));
  vec4 neighborMotion = texelFetch(neighborVelocityTexture, neighborCoordinate, 0);
  vec2 ownVelocityPixels = ownVelocity * resolution;
  vec2 neighborVelocityPixels = neighborMotion.rg * resolution;
  float ownSpeedSquared = isOwnVelocityValid ? dot(ownVelocityPixels, ownVelocityPixels) : 0.0;
  float neighborSpeedSquared = neighborMotion.a > 0.5 ? dot(neighborVelocityPixels, neighborVelocityPixels) : 0.0;
  bool usesDilatedVelocity = neighborSpeedSquared > ownSpeedSquared * 1.21 + 1e-12;
  vec2 velocity = usesDilatedVelocity ? neighborMotion.rg : ownVelocity;

  float exposure = clamp(shutterAngle / 360.0, 0.0, 1.0);
  vec2 blurVector = velocity * exposure;
  float blurRadius = length(blurVector * resolution);

  if (blurRadius < 0.5 || maximumRadius <= 0.0 || maximumSamples < 2) {
    fragmentColor = vec4(currentColor, 1.0);

    return;
  }

  if (blurRadius > maximumRadius) {
    blurVector *= maximumRadius / blurRadius;
    blurRadius = maximumRadius;
  }

  int sampleCount = clamp(int(ceil(blurRadius * 0.75)) + 1, 2, clamp(maximumSamples, 2, 32));
  float currentLogDepth = encodeLogarithmicDepth(currentRawDepth);
  float depthTolerance = 2.0 / 255.0 + 0.001 * blurRadius;
  vec3 accumulatedColor = currentColor;
  float accumulatedWeight = 1.0;

  for (int index = 0; index < 32; ++index) {
    if (index >= sampleCount) {
      break;
    }

    float samplePosition = (float(index) + 0.5) / float(sampleCount) - 0.5;
    vec2 sampleTextureCoordinates = textureCoordinates + blurVector * samplePosition;

    if (any(lessThan(sampleTextureCoordinates, vec2(0.0))) || any(greaterThan(sampleTextureCoordinates, vec2(1.0)))) {
      continue;
    }

    float sampleRawDepth = texture(depthTexture, sampleTextureCoordinates).r;
    bool isSampleSky = sampleRawDepth >= 1.0 - 1e-6;
    vec4 sampleMotion = texture(motionVectorTexture, sampleTextureCoordinates);
    float motionWeight = 0.0;

    if (sampleMotion.a > 0.5) {
      motionWeight = calculateVelocitySimilarity(sampleMotion.rg, velocity, resolution);
    } else if (!usesDilatedVelocity && isCurrentSky && isSampleSky) {
      bool isSampleFallbackValid = false;
      vec2 sampleVelocity = calculateFallbackVelocity(sampleTextureCoordinates, sampleRawDepth, isSampleFallbackValid);

      motionWeight = isSampleFallbackValid ? calculateVelocitySimilarity(sampleVelocity, velocity, resolution) : 0.0;
    }

    if (motionWeight <= 0.0) {
      continue;
    }

    float sampleLogDepth = encodeLogarithmicDepth(sampleRawDepth);
    float depthWeight;

    if (usesDilatedVelocity) {
      depthWeight = sampleLogDepth <= currentLogDepth + depthTolerance ? 1.0 : 0.0;
    } else {
      depthWeight = 1.0 - smoothstep(0.25 * depthTolerance, depthTolerance, abs(sampleLogDepth - currentLogDepth));
    }

    float edgeWeight = 1.0 - abs(samplePosition) * 0.35;
    float weight = motionWeight * depthWeight * edgeWeight;

    accumulatedColor += texture(currentTexture, sampleTextureCoordinates).rgb * weight;
    accumulatedWeight += weight;
  }

  fragmentColor = vec4(accumulatedColor / max(accumulatedWeight, 1e-6), 1.0);
}
