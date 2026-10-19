const vec2 SHADOW_POISSON[16] = vec2[](
  vec2(-0.94201624, -0.39906216),
  vec2(0.94558609, -0.76890725),
  vec2(-0.0941841, -0.9293887),
  vec2(0.34495938, 0.2938776),
  vec2(-0.91588581, 0.45771432),
  vec2(-0.81544232, -0.87912464),
  vec2(-0.38277543, 0.27676845),
  vec2(0.97484398, 0.75648379),
  vec2(0.44323325, -0.97511554),
  vec2(0.53742981, -0.4737342),
  vec2(-0.26496911, -0.41893023),
  vec2(0.79197514, 0.19090188),
  vec2(-0.2418884, 0.99706507),
  vec2(-0.81409955, 0.9143759),
  vec2(0.19984126, 0.78641367),
  vec2(0.14383161, -0.1410079)
);

uniform float shadowGrain;

float calculateShadowHash(vec2 coordinates) {
  vec3 value = fract(vec3(coordinates.xyx) * 0.1031);

  value += dot(value, value.yzx + 33.33);

  return fract((value.x + value.y) * value.z);
}

vec2 rotateShadowSample(vec2 sampleOffset, float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);

  return vec2(cosine * sampleOffset.x - sine * sampleOffset.y, sine * sampleOffset.x + cosine * sampleOffset.y);
}

float linearizeShadowDepth(float depth) {
  float normalizedDeviceDepth = depth * 2.0 - 1.0;
  float nearPlane = light.clipPlanes.x;
  float farPlane = light.clipPlanes.y;

  if (light.isDirectional) {
    return mix(nearPlane, farPlane, depth);
  }

  return 2.0 * nearPlane * farPlane / (farPlane + nearPlane - normalizedDeviceDepth * (farPlane - nearPlane));
}

vec2 calculatePointShadowCoordinates(vec3 lightToPosition, vec2 atlasSize, out float depth) {
  vec3 magnitude = abs(lightToPosition);
  vec2 coordinates;
  float face;
  float faceDistance;

  if (magnitude.x >= magnitude.y && magnitude.x >= magnitude.z) {
    face = lightToPosition.x >= 0.0 ? 0.0 : 1.0;
    coordinates = vec2(lightToPosition.x >= 0.0 ? -lightToPosition.z : lightToPosition.z, -lightToPosition.y);
    faceDistance = magnitude.x;
  } else if (magnitude.y >= magnitude.z) {
    face = lightToPosition.y >= 0.0 ? 2.0 : 3.0;
    coordinates = vec2(lightToPosition.x, lightToPosition.y >= 0.0 ? lightToPosition.z : -lightToPosition.z);
    faceDistance = magnitude.y;
  } else {
    face = lightToPosition.z >= 0.0 ? 4.0 : 5.0;
    coordinates = vec2(lightToPosition.z >= 0.0 ? lightToPosition.x : -lightToPosition.x, -lightToPosition.y);
    faceDistance = magnitude.z;
  }

  float nearDistance = light.clipPlanes.x;
  float farDistance = light.clipPlanes.y;
  float faceSize = floor(min(atlasSize.x / 3.0, atlasSize.y / 2.0));
  vec2 faceOrigin = vec2(mod(face, 3.0), floor(face / 3.0)) * faceSize;

  depth =
    farDistance / (farDistance - nearDistance) -
    farDistance * nearDistance / ((farDistance - nearDistance) * max(faceDistance, 0.000001));
  coordinates = (coordinates / max(faceDistance, 0.000001) * 0.5 + 0.5) * faceSize;

  return (faceOrigin + clamp(coordinates, vec2(0.5), vec2(faceSize - 0.5))) / atlasSize;
}

float calculatePointShadow(sampler2D shadowMap, vec3 lightToPosition, float normalLightDot) {
  vec2 atlasSize = vec2(textureSize(shadowMap, 0));
  float faceSize = floor(min(atlasSize.x / 3.0, atlasSize.y / 2.0));
  float distanceToLight = length(lightToPosition);

  if (faceSize < 1.0 || distanceToLight < 0.000001) {
    return 1.0;
  }

  vec3 direction = lightToPosition / distanceToLight;
  vec3 tangent = normalize(cross(direction, abs(direction.z) < 0.99 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0)));
  vec3 bitangent = cross(direction, tangent);
  float radius = 2.0 * distanceToLight / faceSize * max(1.0, 10.0 * faceSize / 1024.0 * max(light.softness, 0.0));
  float bias = 0.00035 + 0.0025 * (1.0 - normalLightDot);
  float visibility = 0.0;

  for (int sampleIndex = 0; sampleIndex < 16; ++sampleIndex) {
    vec2 offset = SHADOW_POISSON[sampleIndex] * radius;
    float depth;
    vec2 coordinates = calculatePointShadowCoordinates(
      lightToPosition + tangent * offset.x + bitangent * offset.y,
      atlasSize,
      depth
    );

    visibility += depth < 0.0 || depth > 1.0 ? 1.0 : step(depth - bias, texture(shadowMap, coordinates).r);
  }

  return visibility / 16.0;
}

float calculateShadow(
  sampler2D shadowMap,
  vec4 lightProjection,
  vec3 surfaceNormal,
  vec3 surfaceToLight,
  vec3 worldPosition
) {
  float normalLightDot = max(dot(normalize(surfaceNormal), normalize(surfaceToLight)), 0.0);

  if (light.isPoint) {
    return calculatePointShadow(shadowMap, worldPosition - light.translation, normalLightDot);
  }

  if (lightProjection.w <= 0.0) {
    return 1.0;
  }

  vec3 projectedCoordinates = lightProjection.xyz / lightProjection.w;
  bool isInRange =
    projectedCoordinates.x >= 0.0 &&
    projectedCoordinates.x <= 1.0 &&
    projectedCoordinates.y >= 0.0 &&
    projectedCoordinates.y <= 1.0 &&
    projectedCoordinates.z >= 0.0 &&
    projectedCoordinates.z <= 1.0;

  if (!isInRange) {
    return 1.0;
  }

  vec2 shadowResolution = vec2(textureSize(shadowMap, 0));
  float bias = 0.00035 + 0.0025 * (1.0 - normalLightDot);

  if (light.isDirectional) {
    vec2 worldTexelSize = light.shadowSize / shadowResolution;
    float worldBias = max(worldTexelSize.x, worldTexelSize.y) * (0.1 + 0.75 * (1.0 - normalLightDot));

    bias = worldBias / (light.clipPlanes.y - light.clipPlanes.x);
  }

  float receiverDepth = projectedCoordinates.z - bias;
  vec2 texelSize = 1.0 / shadowResolution;

  // Always cover at least one texel so hard shadows still receive spatial antialiasing.
  float resolutionScale = max(shadowResolution.x, shadowResolution.y) / 1024.0;
  float lightRadiusTexels = 10.0 * resolutionScale * max(light.softness, 0.0);
  vec2 shadowCoordinates = projectedCoordinates.xy * shadowResolution;
  float rotation = calculateShadowHash(shadowCoordinates) * 2.0 * PI * clamp(shadowGrain, 0.0, 1.0);

  float receiverLinearDepth = linearizeShadowDepth(receiverDepth);
  float perspectiveScale = light.isDirectional
    ? 1.0
    : max((receiverLinearDepth - light.clipPlanes.x) / max(receiverLinearDepth, 0.0001), 0.0);
  float searchRadiusTexels = max(1.0, lightRadiusTexels * perspectiveScale);
  vec2 searchRadius = texelSize * searchRadiusTexels;

  float blockerDepthSum = 0.0;
  float blockerCount = 0.0;

  for (int sampleIndex = 0; sampleIndex < 16; ++sampleIndex) {
    vec2 sampleOffset = rotateShadowSample(SHADOW_POISSON[sampleIndex], rotation);
    vec2 sampleCoordinates = clamp(projectedCoordinates.xy + sampleOffset * searchRadius, vec2(0.0), vec2(1.0));
    float sampledDepth = texture(shadowMap, sampleCoordinates).r;

    if (sampledDepth < receiverDepth) {
      blockerDepthSum += linearizeShadowDepth(sampledDepth);
      blockerCount += 1.0;
    }
  }

  if (blockerCount == 0.0) {
    return 1.0;
  }

  float averageBlockerDepth = blockerDepthSum / blockerCount;
  float penumbraRatio = max((receiverLinearDepth - averageBlockerDepth) / max(averageBlockerDepth, 0.0001), 0.0);
  float filterRadiusTexels = clamp(
    lightRadiusTexels * (light.isDirectional ? 1.0 : penumbraRatio),
    1.0,
    max(1.0, 32.0 * resolutionScale)
  );
  vec2 filterRadius = texelSize * filterRadiusTexels;

  float visibility = 0.0;

  for (int sampleIndex = 0; sampleIndex < 16; ++sampleIndex) {
    vec2 sampleOffset = rotateShadowSample(SHADOW_POISSON[sampleIndex], rotation);
    vec2 sampleCoordinates = clamp(projectedCoordinates.xy + sampleOffset * filterRadius, vec2(0.0), vec2(1.0));

    visibility += step(receiverDepth, texture(shadowMap, sampleCoordinates).r);
  }

  return visibility / 16.0;
}
