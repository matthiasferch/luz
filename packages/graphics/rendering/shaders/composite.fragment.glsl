uniform sampler2D sceneTexture;
uniform sampler2D depthTexture;
uniform sampler2D ambientOcclusionTexture;
uniform sampler2D skyTexture;
uniform samplerCube skyCube;
uniform sampler2D bloomTexture;
uniform float environmentRotation;

uniform float elapsedTime;

uniform bool isDepthVisualized;
uniform bool isScreenOcclusionVisualized;
uniform bool isGammaCorrectionEnabled;
uniform bool isToneMappingEnabled;
uniform bool isBloomEnabled;
uniform bool isDepthOfFieldEnabled;
uniform bool isDepthOfFieldOverridden;
uniform bool isDepthOfFieldVisualized;
uniform float depthOfFieldFocusDistance;
uniform float depthOfFieldFocalLength;
uniform float depthOfFieldSensorHeight;
uniform float depthOfFieldFStop;
uniform float depthOfFieldMaximumBlurRadius;
uniform sampler2D depthOfFieldBackgroundTexture;
uniform sampler2D depthOfFieldForegroundTexture;
uniform sampler2D depthOfFieldBackingDepthTexture;
uniform float bloomIntensity;
uniform bool isCubeSkyEnabled;
uniform bool isVolumetricLightVisualized;

out vec4 fragmentColor;

vec3 sampleSky(vec2 textureCoordinates) {
  vec4 worldFar = reconstructPosition(camera.reconstructionMatrix, textureCoordinates, 1.0);
  mat4 inverseView = camera.reconstructionMatrix * camera.projectionMatrix;
  vec4 cameraWorld = inverseView * vec4(0.0, 0.0, 0.0, 1.0);
  vec3 direction = normalize(worldFar.xyz - cameraWorld.xyz);
  float rotationCosine = cos(environmentRotation);
  float rotationSine = sin(environmentRotation);
  vec3 rotatedDirection = vec3(
    rotationCosine * direction.x - rotationSine * direction.z,
    direction.y,
    rotationSine * direction.x + rotationCosine * direction.z
  );

  if (isCubeSkyEnabled) {
    return texture(skyCube, rotatedDirection).rgb;
  }

  float u = atan(rotatedDirection.z, rotatedDirection.x) / (2.0 * PI) + 0.5;
  float v = 0.5 - asin(clamp(rotatedDirection.y, -1.0, 1.0)) / PI;

  return pow(texture(skyTexture, vec2(u, v)).rgb, vec3(2.2));
}

vec3 sampleScene(vec2 textureCoordinates) {
  vec4 sceneSample = texture(sceneTexture, textureCoordinates);
  float depth = texture(depthTexture, textureCoordinates).r;
  vec3 color = depth >= 1.0 - 1e-6 && sceneSample.a <= 1e-6 ? sampleSky(textureCoordinates) : sceneSample.rgb;

  return color;
}

float reconstructDepthOfFieldLinearDepth(vec2 textureCoordinates) {
  float depth = texture(depthTexture, textureCoordinates).r;

  return depth >= 1.0 - 1e-6
    ? camera.clipPlanes.y
    : reconstructDepth(depth, camera.clipPlanes);
}

float calculateEffectiveFocusDistance() {
  return isDepthOfFieldOverridden
    ? depthOfFieldFocusDistance
    : camera.focusDistance;
}

float calculateEffectiveFocalLength() {
  return isDepthOfFieldOverridden
    ? depthOfFieldFocalLength
    : camera.focalLength;
}

float calculateEffectiveSensorHeight() {
  return isDepthOfFieldOverridden
    ? depthOfFieldSensorHeight
    : camera.sensorHeight;
}

float calculateEffectiveFStop() {
  return isDepthOfFieldOverridden
    ? depthOfFieldFStop
    : camera.fStop;
}

float calculateCircleOfConfusionRadius(float linearDepth, float viewportHeight) {
  // Blender stores lens and sensor dimensions in millimeters. luz world units
  // follow Blender's default meter scale, so convert the optical values to meters.
  float focalLength = max(calculateEffectiveFocalLength() * 0.001, 1e-6);
  float sensorHeight = max(calculateEffectiveSensorHeight() * 0.001, 1e-6);
  float focusDistance = max(calculateEffectiveFocusDistance(), focalLength + 1e-4);
  float fStop = max(calculateEffectiveFStop(), 0.1);
  float subjectDistance = max(linearDepth, focalLength + 1e-4);
  float circleDiameter =
    focalLength *
    focalLength *
    abs(subjectDistance - focusDistance) /
    (fStop * (focusDistance - focalLength) * subjectDistance);

  return clamp(0.5 * circleDiameter / sensorHeight * viewportHeight, 0.0, max(depthOfFieldMaximumBlurRadius, 0.0));
}

float calculateSignedCircleOfConfusionRadius(float linearDepth, float viewportHeight) {
  float radius = calculateCircleOfConfusionRadius(linearDepth, viewportHeight);

  return linearDepth < calculateEffectiveFocusDistance()
    ? -radius
    : radius;
}

vec3 visualizeCircleOfConfusion(vec2 textureCoordinates, float viewportHeight) {
  float linearDepth = reconstructDepthOfFieldLinearDepth(textureCoordinates);
  float focusDistance = calculateEffectiveFocusDistance();
  float radius = calculateCircleOfConfusionRadius(linearDepth, viewportHeight);
  float blurAmount = radius / max(depthOfFieldMaximumBlurRadius, 1.0);
  vec3 regionColor = linearDepth < focusDistance ? vec3(0.1, 0.4, 1.0) : vec3(1.0, 0.3, 0.05);

  // Green marks the focused band. Blue is foreground blur; orange is background blur.
  return mix(vec3(0.1, 1.0, 0.2), regionColor, clamp(blurAmount, 0.0, 1.0));
}

vec3 visualizeSceneDepth(float depth, vec2 clipPlanes) {
  // The depth buffer's clear value represents sky/background rather than a
  // measurable surface. Keep it distinct from geometry at the far clip plane.
  if (depth >= 1.0 - 1e-6) {
    return vec3(0.18, 0.04, 0.28);
  }

  float linearDepth = reconstructDepth(depth, clipPlanes);
  float nearPlane = max(clipPlanes.x, 1e-4);
  float farPlane = max(clipPlanes.y, nearPlane + 1e-4);

  // Perspective depth spans orders of magnitude. A logarithmic scale gives
  // nearby scene geometry enough of the color range even with a distant far plane.
  float normalizedDepth = clamp(
    log2(max(linearDepth, nearPlane) / nearPlane) / max(log2(farPlane / nearPlane), 1e-4),
    0.0,
    1.0
  );

  vec3 nearColor = vec3(0.1, 0.4, 1.0);
  vec3 middleColor = vec3(0.1, 1.0, 0.2);
  vec3 farColor = vec3(1.0, 0.3, 0.05);

  return normalizedDepth < 0.5
    ? mix(nearColor, middleColor, normalizedDepth * 2.0)
    : mix(middleColor, farColor, (normalizedDepth - 0.5) * 2.0);
}

vec3 sampleDepthOfFieldBackground(vec2 textureCoordinates) {
  ivec2 layerSize = textureSize(depthOfFieldBackgroundTexture, 0);
  vec2 layerPosition = textureCoordinates * vec2(layerSize) - 0.5;
  ivec2 baseCoordinate = ivec2(floor(layerPosition));
  vec2 fraction = fract(layerPosition);
  float centerDepth = reconstructDepthOfFieldLinearDepth(textureCoordinates);
  bool isForeground =
    calculateSignedCircleOfConfusionRadius(centerDepth, float(textureSize(depthTexture, 0).y)) < -0.25;

  if (isForeground) {
    float backingDepth = texture(depthOfFieldBackingDepthTexture, textureCoordinates).r;

    centerDepth = backingDepth >= 1.0 - 1e-6 ? camera.clipPlanes.y : reconstructDepth(backingDepth, camera.clipPlanes);
  }

  vec3 color = vec3(0.0);
  float weightSum = 0.0;
  float closestDifference = 1e20;
  vec3 closestColor = vec3(0.0);

  // Depth-guided reconstruction prevents half-resolution far colors from
  // crossing a sharp focused boundary. The foreground layer is intentionally
  // upsampled without this rejection because it must bleed across silhouettes.
  for (int y = 0; y < 2; ++y) {
    for (int x = 0; x < 2; ++x) {
      ivec2 coordinate = clamp(baseCoordinate + ivec2(x, y), ivec2(0), layerSize - 1);
      vec2 sampleTextureCoordinates = (vec2(coordinate) + 0.5) / vec2(layerSize);
      vec2 axisWeight = mix(1.0 - fraction, fraction, vec2(float(x), float(y)));
      float bilinearWeight = axisWeight.x * axisWeight.y;
      vec4 sampleLayer = texelFetch(depthOfFieldBackgroundTexture, coordinate, 0);
      float sampleDepth = sampleLayer.a * camera.clipPlanes.y;
      float relativeDepthDifference = abs(sampleDepth - centerDepth) / max(min(sampleDepth, centerDepth), 0.1);

      if (relativeDepthDifference < closestDifference) {
        closestDifference = relativeDepthDifference;
        closestColor = sampleLayer.rgb;
      }

      if (relativeDepthDifference > 0.05) {
        continue;
      }

      float depthWeight = exp(-6.0 * relativeDepthDifference);
      float weight = bilinearWeight * depthWeight;

      color += sampleLayer.rgb * weight;
      weightSum += weight;
    }
  }

  return weightSum > 1e-4
    ? color / weightSum
    : closestDifference <= 0.05
      ? closestColor
      : sampleScene(textureCoordinates);
}

vec3 sampleDepthOfField(vec2 textureCoordinates) {
  vec3 background = sampleDepthOfFieldBackground(textureCoordinates);
  vec4 foregroundColor = texture(depthOfFieldForegroundTexture, textureCoordinates);

  return background * (1.0 - foregroundColor.a) + foregroundColor.rgb;
}

void main() {
  vec2 clipPlanes = camera.clipPlanes;

  if (isDepthVisualized && !isVolumetricLightVisualized) {
    vec2 textureSize = vec2(textureSize(depthTexture, 0).xy);
    vec2 screenSpaceCoordinates = gl_FragCoord.xy / textureSize;

    float depth = texture(depthTexture, screenSpaceCoordinates).r;

    fragmentColor = vec4(visualizeSceneDepth(depth, clipPlanes), 1.0);

    return;
  }

  if (isScreenOcclusionVisualized && !isVolumetricLightVisualized) {
    vec2 ambientOcclusionSize = vec2(textureSize(ambientOcclusionTexture, 0));
    vec2 ambientOcclusionCoordinates = gl_FragCoord.xy / ambientOcclusionSize;

    fragmentColor = vec4(vec3(texture(ambientOcclusionTexture, ambientOcclusionCoordinates).r), 1.0);

    return;
  }

  vec2 textureSize = vec2(textureSize(sceneTexture, 0).xy);
  vec2 screenSpaceCoordinates = gl_FragCoord.xy / textureSize;
  bool isDepthOfFieldActive = isDepthOfFieldEnabled && camera.isDepthOfFieldEnabled;

  if (isDepthOfFieldVisualized && !isVolumetricLightVisualized) {
    fragmentColor = vec4(visualizeCircleOfConfusion(screenSpaceCoordinates, textureSize.y), 1.0);

    return;
  }

  vec3 color = sampleVolumetricLighting(screenSpaceCoordinates, volumetricSceneDepthTexture);

  if (!isVolumetricLightVisualized) {
    color += isDepthOfFieldActive ? sampleDepthOfField(screenSpaceCoordinates) : sampleScene(screenSpaceCoordinates);
  }

  if (isBloomEnabled && !isVolumetricLightVisualized) {
    color += bloomIntensity * texture(bloomTexture, screenSpaceCoordinates).rgb;
  }

  if (isToneMappingEnabled) {
    color = applyToneMapping(color);
  }

  if (isGammaCorrectionEnabled) {
    color = calculateGammaCorrection(color);
  }

  fragmentColor = vec4(clamp(color, vec3(-65504.0), vec3(65504.0)), 1.0);
}
