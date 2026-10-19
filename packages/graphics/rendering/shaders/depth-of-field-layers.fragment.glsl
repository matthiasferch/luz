uniform sampler2D prefilteredSceneTexture;
uniform sampler2D sceneTexture;
uniform sampler2D skyTexture;
uniform samplerCube skyCube;
uniform bool isCubeSkyEnabled;
uniform float environmentRotation;
uniform sampler2D depthTexture;
uniform sampler2D backingSceneTexture;
uniform sampler2D backingDepthTexture;
uniform sampler2D foregroundRadiusTexture;
uniform sampler2D surfaceOwnershipTexture;

uniform bool isDepthOfFieldOverridden;
uniform float depthOfFieldFocusDistance;
uniform float depthOfFieldFocalLength;
uniform float depthOfFieldSensorHeight;
uniform float depthOfFieldFStop;
uniform float depthOfFieldMaximumBlurRadius;
uniform int depthOfFieldMaximumSamples;

layout(location = 0) out vec4 backgroundLayer;
layout(location = 1) out vec4 foregroundLayer;

const int DEPTH_OF_FIELD_MAXIMUM_SAMPLES = 64;
const vec2 DEPTH_OF_FIELD_GOLDEN_ROTATION = vec2(-0.7373688781, 0.6754902943);

vec3 sampleScene(vec2 textureCoordinates);
vec3 sampleBackingScene(vec2 textureCoordinates);

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

float reconstructLinearDepth(vec2 textureCoordinates) {
  float depth = texture(depthTexture, textureCoordinates).r;

  return depth >= 1.0 - 1e-6
    ? camera.clipPlanes.y
    : reconstructDepth(depth, camera.clipPlanes);
}

float calculateSignedCircleOfConfusionRadius(float subjectDepth, float viewportHeight) {
  float focalLength = max(calculateEffectiveFocalLength() * 0.001, 1e-6);
  float sensorHeight = max(calculateEffectiveSensorHeight() * 0.001, 1e-6);
  float focusDistance = max(calculateEffectiveFocusDistance(), focalLength + 1e-4);
  float safeSubjectDepth = max(subjectDepth, focalLength + 1e-4);
  float fStop = max(calculateEffectiveFStop(), 0.1);
  float circleDiameter =
    focalLength *
    focalLength *
    abs(safeSubjectDepth - focusDistance) /
    (fStop * (focusDistance - focalLength) * safeSubjectDepth);
  float radius = clamp(
    0.5 * circleDiameter / sensorHeight * viewportHeight,
    0.0,
    max(depthOfFieldMaximumBlurRadius, 0.0)
  );

  return subjectDepth < focusDistance
    ? -radius
    : radius;
}

int calculateSampleCountForRadius(float radius) {
  int desired = int(ceil(clamp(12.0 + radius * 1.3, 12.0, 64.0)));

  return min(desired, clamp(depthOfFieldMaximumSamples, 12, DEPTH_OF_FIELD_MAXIMUM_SAMPLES));
}

float calculateSampleRotation(vec2 pixel) {
  return 2.0 * PI * fract(52.9829189 * fract(dot(pixel, vec2(0.06711056, 0.00583715))));
}

bool hasSurfaceOwnership(vec4 surface) {
  return surface.a > 0.5;
}

bool isSameSurface(vec4 firstOwnership, vec4 secondOwnership) {
  return hasSurfaceOwnership(firstOwnership) &&
  hasSurfaceOwnership(secondOwnership) &&
  all(lessThan(abs(firstOwnership.rgb - secondOwnership.rgb), vec3(0.5 / 255.0)));
}

bool isLayerDepthCompatible(float firstDepth, float secondDepth) {
  if (firstDepth >= 1.0 - 1e-6 || secondDepth >= 1.0 - 1e-6) {
    return firstDepth >= 1.0 - 1e-6 == secondDepth >= 1.0 - 1e-6;
  }

  float firstLinear = reconstructDepth(firstDepth, camera.clipPlanes);
  float secondLinear = reconstructDepth(secondDepth, camera.clipPlanes);

  return abs(firstLinear - secondLinear) <= 0.05 * max(min(firstLinear, secondLinear), 0.1);
}

vec3 sampleFullResolutionScene(vec2 textureCoordinates) {
  vec4 scene = texture(sceneTexture, textureCoordinates);

  if (texture(depthTexture, textureCoordinates).r < 1.0 - 1e-6 || scene.a > 1e-6) {
    return scene.rgb;
  }

  vec3 worldFar = reconstructPosition(camera.reconstructionMatrix, textureCoordinates, 1.0).xyz;
  mat4 inverseView = camera.reconstructionMatrix * camera.projectionMatrix;
  vec3 direction = normalize(worldFar - (inverseView * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
  float cosine = cos(environmentRotation),
    sine = sin(environmentRotation);

  direction = vec3(cosine * direction.x - sine * direction.z, direction.y, sine * direction.x + cosine * direction.z);

  if (isCubeSkyEnabled) {
    return texture(skyCube, direction).rgb;
  }

  vec2 coordinates = vec2(
    atan(direction.z, direction.x) / (2.0 * PI) + 0.5,
    0.5 - asin(clamp(direction.y, -1.0, 1.0)) / PI
  );

  return pow(texture(skyTexture, coordinates).rgb, vec3(2.2));
}

vec3 sampleDepthLayer(sampler2D colors, sampler2D depths, vec2 textureCoordinates, bool isOwnershipRequired) {
  ivec2 size = textureSize(colors, 0);
  ivec2 pixel = clamp(ivec2(textureCoordinates * vec2(size)), ivec2(0), size - 1);
  vec2 sampleTextureCoordinates = (vec2(pixel) + 0.5) / vec2(size);
  float expectedDepth = texture(depths, textureCoordinates).r;
  float sampleDepth = texture(depths, sampleTextureCoordinates).r;
  bool isCompatible = isLayerDepthCompatible(expectedDepth, sampleDepth);

  if (isOwnershipRequired && expectedDepth < 1.0 - 1e-6) {
    isCompatible =
      isCompatible &&
      isSameSurface(
        texture(surfaceOwnershipTexture, textureCoordinates),
        texture(surfaceOwnershipTexture, sampleTextureCoordinates)
      );
  }

  // The disk integrates prefiltered texels directly. Thin surfaces without a
  // compatible coarse texel retain their own full-resolution color.
  return isCompatible || !isOwnershipRequired
    ? texelFetch(colors, pixel, 0).rgb
    : sampleFullResolutionScene(textureCoordinates);
}

vec3 sampleScene(vec2 textureCoordinates) {
  return sampleDepthLayer(prefilteredSceneTexture, depthTexture, textureCoordinates, true);
}

vec3 sampleBackingScene(vec2 textureCoordinates) {
  return sampleDepthLayer(backingSceneTexture, backingDepthTexture, textureCoordinates, false);
}

vec2 rotateSampleDirection(vec2 direction) {
  return vec2(
    direction.x * DEPTH_OF_FIELD_GOLDEN_ROTATION.x - direction.y * DEPTH_OF_FIELD_GOLDEN_ROTATION.y,
    direction.x * DEPTH_OF_FIELD_GOLDEN_ROTATION.y + direction.y * DEPTH_OF_FIELD_GOLDEN_ROTATION.x
  );
}

void main() {
  vec2 viewportSize = vec2(textureSize(depthTexture, 0));
  vec2 layerSize = vec2(textureSize(prefilteredSceneTexture, 0));
  vec2 textureCoordinates = gl_FragCoord.xy / layerSize;
  vec2 inverseViewport = 1.0 / viewportSize;
  vec3 centerColor = sampleScene(textureCoordinates);
  float centerRawDepth = texture(depthTexture, textureCoordinates).r;
  bool hasCenterGeometry = centerRawDepth < 1.0 - 1e-6;
  float centerDepth = hasCenterGeometry ? reconstructDepth(centerRawDepth, camera.clipPlanes) : camera.clipPlanes.y;
  float centerCircle = calculateSignedCircleOfConfusionRadius(centerDepth, viewportSize.y);
  bool isCenterForeground = hasCenterGeometry && centerCircle < -0.25;
  vec4 centerSurface = texture(surfaceOwnershipTexture, textureCoordinates);

  float baseRadius = isCenterForeground ? max(-centerCircle, 0.0) : 0.0;
  float overlayRadius = texture(foregroundRadiusTexture, textureCoordinates).r;
  float backgroundRadius = isCenterForeground ? max(baseRadius, depthOfFieldMaximumBlurRadius) : max(centerCircle, 0.0);
  int baseSampleCount = baseRadius >= 0.5 ? calculateSampleCountForRadius(baseRadius) : 0;
  int overlaySampleCount = overlayRadius >= 0.5 ? calculateSampleCountForRadius(overlayRadius) : 0;
  int backgroundSampleCount = backgroundRadius >= 0.5 ? calculateSampleCountForRadius(backgroundRadius) : 0;
  int sampleCount = max(backgroundSampleCount, max(baseSampleCount, overlaySampleCount));

  vec3 backgroundColor = isCenterForeground ? vec3(0.0) : centerColor;
  float backgroundWeight = isCenterForeground ? 0.0 : 1.0;
  vec3 backingGeometryColor = vec3(0.0);
  float backingGeometryWeight = 0.0;
  float nearestBackingDepth = camera.clipPlanes.y;
  vec3 backingSkyColor = vec3(0.0);
  float backingSkyWeight = 0.0;
  float depthEpsilon = max(0.005 * centerDepth, 0.002);

  // The peeled target supplies a real plate behind an opaque foreground
  // silhouette. It is never used as transmission through the center surface.
  float centerBackingRawDepth = texture(backingDepthTexture, textureCoordinates).r;

  if (isCenterForeground && centerBackingRawDepth < 1.0 - 1e-6) {
    float centerBackingDepth = reconstructDepth(centerBackingRawDepth, camera.clipPlanes);

    if (centerBackingDepth > centerDepth + depthEpsilon) {
      nearestBackingDepth = centerBackingDepth;
      backingGeometryColor = sampleBackingScene(textureCoordinates);
      backingGeometryWeight = 1.0;
    }
  }

  float rotation = calculateSampleRotation(gl_FragCoord.xy);
  vec2 initialDirection = vec2(cos(rotation), sin(rotation));

  // Select a foreground overlay independently from the center surface. This
  // restores bokeh spill across silhouettes while requiring the contributor
  // to be a different, strictly closer scene object.
  vec4 overlaySurface = vec4(0.0);
  float overlayDepth = camera.clipPlanes.y;
  vec2 searchDirection = initialDirection;

  for (int index = 0; index < DEPTH_OF_FIELD_MAXIMUM_SAMPLES; ++index) {
    if (index >= overlaySampleCount) {
      break;
    }

    float diskRadius = sqrt((float(index) + 0.5) / float(overlaySampleCount));
    vec2 offset = searchDirection * diskRadius * overlayRadius;
    vec2 sampleTextureCoordinates = clamp(textureCoordinates + offset * inverseViewport, vec2(0.0), vec2(1.0));
    float sampleRawDepth = texture(depthTexture, sampleTextureCoordinates).r;
    vec4 sampleSurface = texture(surfaceOwnershipTexture, sampleTextureCoordinates);

    if (sampleRawDepth < 1.0 - 1e-6 && hasSurfaceOwnership(sampleSurface)) {
      float sampleDepth = reconstructDepth(sampleRawDepth, camera.clipPlanes);
      float sampleCircle = calculateSignedCircleOfConfusionRadius(sampleDepth, viewportSize.y);
      float sourceRadius = max(-sampleCircle, 0.0);
      float footprint = 1.0 - smoothstep(sourceRadius - 1.0, sourceRadius + 1.0, length(offset));
      float separation = max(0.001 * min(sampleDepth, centerDepth), 0.001);
      bool isDifferentSurface = !isSameSurface(sampleSurface, centerSurface);
      bool isInFront = !hasCenterGeometry || sampleDepth < centerDepth - separation;

      if (sampleCircle < -0.25 && footprint > 1e-4 && isDifferentSurface && isInFront && sampleDepth < overlayDepth) {
        overlayDepth = sampleDepth;
        overlaySurface = sampleSurface;
      }
    }

    searchDirection = rotateSampleDirection(searchDirection);
  }

  float centerForegroundWeight = smoothstep(0.25, 1.25, -centerCircle);
  vec3 baseColorSum = isCenterForeground ? centerColor * max(centerForegroundWeight, 1e-4) : vec3(0.0);
  float baseColorWeight = isCenterForeground ? max(centerForegroundWeight, 1e-4) : 0.0;
  vec3 overlayColorSum = vec3(0.0);
  float overlayColorWeight = 0.0;
  float overlayCoverageSum = 0.0;

  vec2 direction = initialDirection;

  for (int index = 0; index < DEPTH_OF_FIELD_MAXIMUM_SAMPLES; ++index) {
    if (index >= sampleCount) {
      break;
    }

    if (index < backgroundSampleCount) {
      float diskRadius = sqrt((float(index) + 0.5) / float(backgroundSampleCount));
      vec2 offset = direction * diskRadius * backgroundRadius;
      vec2 sampleTextureCoordinates = clamp(textureCoordinates + offset * inverseViewport, vec2(0.0), vec2(1.0));
      float sampleRawDepth = texture(depthTexture, sampleTextureCoordinates).r;
      bool isSampleSky = sampleRawDepth >= 1.0 - 1e-6;
      float sampleDepth = isSampleSky ? camera.clipPlanes.y : reconstructDepth(sampleRawDepth, camera.clipPlanes);
      float sampleCircle = calculateSignedCircleOfConfusionRadius(sampleDepth, viewportSize.y);

      if (isCenterForeground) {
        float spatialWeight = 1.0 - 0.5 * diskRadius;
        bool isCandidateGeometry = !isSampleSky && sampleDepth > centerDepth + depthEpsilon;
        float candidateDepth = sampleDepth;
        bool isPeeledCandidate = false;

        float peeledRawDepth = texture(backingDepthTexture, sampleTextureCoordinates).r;

        if (peeledRawDepth < 1.0 - 1e-6) {
          float peeledDepth = reconstructDepth(peeledRawDepth, camera.clipPlanes);

          if (peeledDepth > centerDepth + depthEpsilon && (!isCandidateGeometry || peeledDepth < candidateDepth)) {
            isCandidateGeometry = true;
            candidateDepth = peeledDepth;
            isPeeledCandidate = true;
          }
        }

        if (isCandidateGeometry) {
          float newDepthBand = max(0.05 * candidateDepth, 0.02);

          if (candidateDepth + newDepthBand < nearestBackingDepth) {
            nearestBackingDepth = candidateDepth;
            backingGeometryColor = vec3(0.0);
            backingGeometryWeight = 0.0;
          } else {
            nearestBackingDepth = min(nearestBackingDepth, candidateDepth);
          }

          float nearestDepthBand = max(0.05 * nearestBackingDepth, 0.02);

          if (candidateDepth <= nearestBackingDepth + nearestDepthBand) {
            vec3 candidateColor = isPeeledCandidate
              ? sampleBackingScene(sampleTextureCoordinates)
              : sampleScene(sampleTextureCoordinates);

            backingGeometryColor += candidateColor * spatialWeight;
            backingGeometryWeight += spatialWeight;
          }
        } else if (isSampleSky) {
          backingSkyColor += sampleScene(sampleTextureCoordinates) * spatialWeight;
          backingSkyWeight += spatialWeight;
        }
      } else if (sampleCircle >= 0.0) {
        backgroundColor += sampleScene(sampleTextureCoordinates);
        backgroundWeight += 1.0;
      }
    }

    if (index < baseSampleCount) {
      float diskRadius = sqrt((float(index) + 0.5) / float(baseSampleCount));
      vec2 offset = direction * diskRadius * baseRadius;
      vec2 sampleTextureCoordinates = clamp(textureCoordinates + offset * inverseViewport, vec2(0.0), vec2(1.0));
      vec4 sampleSurface = texture(surfaceOwnershipTexture, sampleTextureCoordinates);
      float sampleCircle = calculateSignedCircleOfConfusionRadius(
        reconstructLinearDepth(sampleTextureCoordinates),
        viewportSize.y
      );
      float sourceRadius = max(-sampleCircle, 0.0);
      float coverage = 1.0 - smoothstep(sourceRadius - 1.0, sourceRadius + 1.0, length(offset));
      float weight = coverage * smoothstep(0.25, 1.25, -sampleCircle);

      if (weight > 0.0 && isSameSurface(sampleSurface, centerSurface)) {
        baseColorSum += sampleScene(sampleTextureCoordinates) * weight;
        baseColorWeight += weight;
      }
    }

    if (index < overlaySampleCount && hasSurfaceOwnership(overlaySurface)) {
      float diskRadius = sqrt((float(index) + 0.5) / float(overlaySampleCount));
      vec2 offset = direction * diskRadius * overlayRadius;
      vec2 sampleTextureCoordinates = clamp(textureCoordinates + offset * inverseViewport, vec2(0.0), vec2(1.0));
      vec4 sampleSurface = texture(surfaceOwnershipTexture, sampleTextureCoordinates);
      float sampleDepth = reconstructLinearDepth(sampleTextureCoordinates);
      float sampleCircle = calculateSignedCircleOfConfusionRadius(sampleDepth, viewportSize.y);
      float sourceRadius = max(-sampleCircle, 0.0);
      float coverage = 1.0 - smoothstep(sourceRadius - 1.0, sourceRadius + 1.0, length(offset));
      float separation = max(0.001 * min(sampleDepth, centerDepth), 0.001);
      bool isInFront = !hasCenterGeometry || sampleDepth < centerDepth - separation;
      float weight = coverage * smoothstep(0.25, 1.25, -sampleCircle);

      if (weight > 0.0 && isInFront && isSameSurface(sampleSurface, overlaySurface)) {
        overlayColorSum += sampleScene(sampleTextureCoordinates) * weight;
        overlayColorWeight += weight;
        overlayCoverageSum += weight;
      }
    }

    direction = rotateSampleDirection(direction);
  }

  bool hasBackingGeometry = backingGeometryWeight > 1e-4;
  bool hasBackingSky = backingSkyWeight > 1e-4;
  vec3 resolvedBackground;
  float resolvedBackgroundDepth;

  if (isCenterForeground) {
    resolvedBackground = hasBackingGeometry
      ? backingGeometryColor / backingGeometryWeight
      : hasBackingSky
        ? backingSkyColor / backingSkyWeight
        : centerColor;
    resolvedBackgroundDepth = hasBackingGeometry
      ? nearestBackingDepth
      : hasBackingSky
        ? camera.clipPlanes.y
        : centerDepth;
  } else {
    resolvedBackground = backgroundWeight > 1e-4 ? backgroundColor / backgroundWeight : centerColor;

    // Reconstruction metadata describes the receiving surface, not the mean
    // depth of the colors inside its blur footprint.
    resolvedBackgroundDepth = centerDepth;
  }

  vec3 resolvedBaseColor = baseColorWeight > 1e-4 ? baseColorSum / baseColorWeight : centerColor;
  vec3 resolvedOverlayColor = overlayColorWeight > 1e-4 ? overlayColorSum / overlayColorWeight : vec3(0.0);
  float overlayCoverage = clamp(overlayCoverageSum / max(float(overlaySampleCount), 1.0), 0.0, 1.0);

  // The center surface stays opaque, while a different object that is truly
  // closer may spread over it. Outside foreground silhouettes, the same
  // overlay becomes the ordinary premultiplied foreground bokeh layer.
  vec3 resolvedForeground = isCenterForeground
    ? mix(resolvedBaseColor, resolvedOverlayColor, overlayCoverage)
    : resolvedOverlayColor * overlayCoverage;
  float resolvedCoverage = isCenterForeground ? 1.0 : overlayCoverage;

  backgroundLayer = vec4(resolvedBackground, clamp(resolvedBackgroundDepth / max(camera.clipPlanes.y, 1e-4), 0.0, 1.0));
  foregroundLayer = vec4(resolvedForeground, resolvedCoverage);
}
