uniform sampler2D depthTexture;
uniform sampler2D shadowTexture;
uniform sampler2D noiseTexture;
uniform vec2 volumetricResolution;
uniform float elapsedTime;
uniform float volumetricIntensityMultiplier;
uniform int volumetricSampleCount;
uniform bool areShadowsEnabled;
uniform vec4 clipPlane;

out vec4 outColor;

const int MAXIMUM_VOLUMETRIC_SAMPLES = 48;
const vec2 VOLUMETRIC_SHADOW_OFFSETS[4] = vec2[](
  vec2(-0.7071, -0.7071),
  vec2(0.7071, -0.7071),
  vec2(-0.7071, 0.7071),
  vec2(0.7071, 0.7071)
);

float calculateVolumetricHash(vec3 position) {
  position = fract(position * 0.1031);
  position += dot(position, position.yzx + 33.33);

  return fract((position.x + position.y) * position.z);
}

float generateVolumetricNoise(vec3 position) {
  vec3 cell = floor(position);
  vec3 fraction = fract(position);

  fraction = fraction * fraction * (3.0 - 2.0 * fraction);

  float n000 = calculateVolumetricHash(cell + vec3(0.0, 0.0, 0.0));
  float n100 = calculateVolumetricHash(cell + vec3(1.0, 0.0, 0.0));
  float n010 = calculateVolumetricHash(cell + vec3(0.0, 1.0, 0.0));
  float n110 = calculateVolumetricHash(cell + vec3(1.0, 1.0, 0.0));
  float n001 = calculateVolumetricHash(cell + vec3(0.0, 0.0, 1.0));
  float n101 = calculateVolumetricHash(cell + vec3(1.0, 0.0, 1.0));
  float n011 = calculateVolumetricHash(cell + vec3(0.0, 1.0, 1.0));
  float n111 = calculateVolumetricHash(cell + vec3(1.0, 1.0, 1.0));

  float nearY0 = mix(n000, n100, fraction.x);
  float nearY1 = mix(n010, n110, fraction.x);
  float farY0 = mix(n001, n101, fraction.x);
  float farY1 = mix(n011, n111, fraction.x);

  return mix(mix(nearY0, nearY1, fraction.y), mix(farY0, farY1, fraction.y), fraction.z);
}

float calculateVolumetricPhase(float cosineTheta, float anisotropy) {
  float clampedAnisotropy = clamp(anisotropy, -0.9, 0.9);
  float denominator = max(1.0 + clampedAnisotropy * clampedAnisotropy - 2.0 * clampedAnisotropy * cosineTheta, 0.001);

  return (1.0 - clampedAnisotropy * clampedAnisotropy) / pow(denominator, 1.5);
}

float calculateVolumetricShadow(vec3 projectedCoordinates) {
  if (!areShadowsEnabled) {
    return 1.0;
  }

  if (any(lessThan(projectedCoordinates, vec3(0.0))) || any(greaterThan(projectedCoordinates, vec3(1.0)))) {
    return 1.0;
  }

  vec2 texel = 1.0 / vec2(textureSize(shadowTexture, 0));
  float filterRadius = 1.0 + max(light.softness, 0.0) * 1.5;
  float receiverDepth = projectedCoordinates.z - 0.0008;
  float visibility = 0.0;

  for (int sampleIndex = 0; sampleIndex < 4; ++sampleIndex) {
    vec2 coordinates = clamp(
      projectedCoordinates.xy + VOLUMETRIC_SHADOW_OFFSETS[sampleIndex] * texel * filterRadius,
      vec2(0.0),
      vec2(1.0)
    );

    visibility += step(receiverDepth, texture(shadowTexture, coordinates).r);
  }

  return visibility * 0.25;
}

void main() {
  if (
    light.volumetricIntensity <= 0.0 ||
    volumetricIntensityMultiplier <= 0.0 ||
    light.volumetricDensity <= 0.0 ||
    light.intensity <= 0.0 ||
    !light.isDirectional && light.range <= 0.0
  ) {
    outColor = vec4(0.0);

    return;
  }

  vec2 textureCoordinates = gl_FragCoord.xy / volumetricResolution;
  float sceneDepth = texture(depthTexture, textureCoordinates).r;

  vec3 nearPosition = reconstructPosition(camera.reconstructionMatrix, textureCoordinates, 0.0).xyz;
  vec3 endPosition = reconstructPosition(camera.reconstructionMatrix, textureCoordinates, sceneDepth).xyz;
  vec3 ray = endPosition - nearPosition;
  float rayLength = length(ray);

  if (rayLength <= 0.0001) {
    outColor = vec4(0.0);

    return;
  }

  vec3 rayDirection = ray / rayLength;
  vec3 sphereOrigin = nearPosition - light.translation;
  float segmentStart = 0.0;
  float segmentEnd = rayLength;

  if (!light.isDirectional) {
    float sphereProjection = dot(rayDirection, sphereOrigin);
    float sphereDiscriminant =
      sphereProjection * sphereProjection - (dot(sphereOrigin, sphereOrigin) - light.range * light.range);

    if (sphereDiscriminant <= 0.0) {
      outColor = vec4(0.0);

      return;
    }

    float sphereRoot = sqrt(sphereDiscriminant);

    segmentStart = max(-sphereProjection - sphereRoot, 0.0);
    segmentEnd = min(-sphereProjection + sphereRoot, rayLength);
  }

  if (!clipVolumetricPlane(nearPosition, rayDirection, clipPlane, segmentStart, segmentEnd)) {
    outColor = vec4(0.0);

    return;
  }

  vec3 lightDirection = normalize(light.direction);
  float outerCone = cos(radians(light.coneAngle * 0.5));

  if (
    !light.isDirectional &&
    !light.isPoint &&
    !clipVolumetricCone(sphereOrigin, rayDirection, -lightDirection, outerCone, segmentStart, segmentEnd)
  ) {
    outColor = vec4(0.0);

    return;
  }

  float segmentLength = segmentEnd - segmentStart;

  if (segmentLength <= 0.0001) {
    outColor = vec4(0.0);

    return;
  }

  int sampleCount = clamp(volumetricSampleCount, 1, MAXIMUM_VOLUMETRIC_SAMPLES);
  float stepLength = segmentLength / float(sampleCount);
  float jitter = texture(noiseTexture, gl_FragCoord.xy / 512.0).r;
  float transmittance = 1.0;
  vec3 scatteredLight = vec3(0.0);

  float innerCone = cos(radians(max(light.coneAngle - light.coneFalloff, 0.0) * 0.5));
  float lightEnergy = log2(1.0 + max(light.intensity, 0.0));
  vec3 lightScattering = light.color * lightEnergy * light.volumetricIntensity * volumetricIntensityMultiplier;
  float noiseStrength = clamp(light.volumetricNoiseStrength, 0.0, 1.0);
  vec3 noiseOffset = normalize(vec3(1.0, 0.35, -0.7)) * elapsedTime * max(light.volumetricNoiseSpeed, 0.0);

  for (int sampleIndex = 0; sampleIndex < MAXIMUM_VOLUMETRIC_SAMPLES; ++sampleIndex) {
    if (sampleIndex >= sampleCount || transmittance < 0.001) {
      break;
    }

    float distanceAlongRay = segmentStart + (float(sampleIndex) + jitter) * stepLength;
    vec3 worldPosition = nearPosition + rayDirection * distanceAlongRay;
    vec3 sampleToLight = light.isDirectional ? lightDirection : light.translation - worldPosition;
    float distanceToLight = length(sampleToLight);

    if (!light.isDirectional && (distanceToLight <= 0.0001 || distanceToLight >= light.range)) {
      continue;
    }

    vec3 directionToLight = sampleToLight / distanceToLight;
    float coneAngle = dot(directionToLight, lightDirection);
    float spotAttenuation =
      light.isDirectional || light.isPoint
        ? 1.0
        : innerCone > outerCone + 0.000001
          ? smoothstep(outerCone, innerCone, coneAngle)
          : step(outerCone, coneAngle);

    if (spotAttenuation <= 0.0001) {
      continue;
    }

    float distanceAttenuation = light.isDirectional ? 1.0 : 1.0 - smoothstep(0.0, light.range, distanceToLight);
    float densityVariation = 1.0;

    if (noiseStrength > 0.0) {
      vec3 noisePosition = worldPosition * max(light.volumetricNoiseScale, 0.0001) + noiseOffset;
      float dust = smoothstep(0.25, 0.85, generateVolumetricNoise(noisePosition));

      densityVariation = mix(1.0, dust * 1.5, noiseStrength);
    }

    float density = max(light.volumetricDensity, 0.0) * densityVariation;
    float opticalDepth = density * stepLength;
    float stepTransmittance = exp(-opticalDepth);
    float scattering = 1.0 - stepTransmittance;
    float phase = calculateVolumetricPhase(dot(-directionToLight, -rayDirection), light.volumetricAnisotropy);
    vec4 lightProjection = light.textureMatrix * vec4(worldPosition, 1.0);
    float visibility = light.isPoint
      ? areShadowsEnabled
        ? calculatePointShadow(shadowTexture, worldPosition - light.translation, 1.0)
        : 1.0
      : lightProjection.w > 0.0
        ? calculateVolumetricShadow(lightProjection.xyz / lightProjection.w)
        : 1.0;

    scatteredLight +=
      transmittance * scattering * phase * spotAttenuation * distanceAttenuation * visibility * lightScattering;
    transmittance *= stepTransmittance;
  }

  // The additive pipeline uses SRC_ALPHA, ONE, so alpha must be one for the
  // computed scattering contribution to reach the volume target.
  outColor = vec4(scatteredLight, 1.0);
}
