in vec2 v_coordinates;
in vec3 v_normal;
in vec3 v_tangent;
in vec3 v_bitangent;
in vec4 v_cameraPosition;
in vec4 v_worldPosition;
in vec3 v_objectPosition;
in float v_clipDistance;

uniform sampler2D transmissionBackgroundTexture;
uniform sampler2D transmissionSurfaceTexture;
uniform sampler2D depthTexture;
uniform sampler2D skyTexture;
uniform samplerCube skyCube;
uniform sampler2D reflectanceLookupTexture;
uniform sampler2D planarReflectionTexture;
uniform sampler2D blurredPlanarReflectionTexture;
uniform vec2 planarReflectionViewportSize;
uniform float planarReflectionIntensity;
uniform float planarReflectionMaximumRoughness;
uniform float maximumTransmissionLevelOfDetail;
uniform float environmentSpecularStrength;
uniform float environmentRotation;
uniform bool isTransmissionVisualized;
uniform bool isCubeSkyEnabled;
uniform bool isPlanarReflectionEnabled;

out vec4 outColor;

vec3 sampleTransmissionSky(vec3 direction, float skyLevelOfDetail) {
  float rotationCosine = cos(environmentRotation);
  float rotationSine = sin(environmentRotation);
  vec3 rotatedDirection = vec3(
    rotationCosine * direction.x - rotationSine * direction.z,
    direction.y,
    rotationSine * direction.x + rotationCosine * direction.z
  );

  if (isCubeSkyEnabled) {
    return textureLod(skyCube, rotatedDirection, skyLevelOfDetail).rgb;
  }

  float u = atan(rotatedDirection.z, rotatedDirection.x) / (2.0 * PI) + 0.5;
  float v = 0.5 - asin(clamp(rotatedDirection.y, -1.0, 1.0)) / PI;

  return pow(textureLod(skyTexture, vec2(u, v), skyLevelOfDetail).rgb, vec3(2.2));
}

vec3 calculateTransmissionSkyDirection(vec2 coordinates) {
  vec4 worldFar = reconstructPosition(camera.reconstructionMatrix, coordinates, 1.0);
  mat4 inverseView = camera.reconstructionMatrix * camera.projectionMatrix;
  vec4 cameraWorld = inverseView * vec4(0.0, 0.0, 0.0, 1.0);

  return normalize(worldFar.xyz - cameraWorld.xyz);
}

vec3 sampleTransmissionLayer(vec2 coordinates, float skyLevelOfDetail) {
  coordinates = clamp(coordinates, vec2(0.001), vec2(0.999));

  vec4 capturedScene = texture(transmissionBackgroundTexture, coordinates);
  float capturedCoverage = capturedScene.a;

  if (texture(depthTexture, coordinates).r < 1.0 - 1e-6 || capturedCoverage > 1e-6) {
    return capturedScene.rgb;
  }

  return sampleTransmissionSky(calculateTransmissionSkyDirection(coordinates), skyLevelOfDetail);
}

vec3 sampleTransmissionBackground(vec2 coordinates, float roughness) {
  float skyLevelOfDetail = roughness * maximumTransmissionLevelOfDetail;

  if (roughness <= 0.02) {
    return sampleTransmissionLayer(coordinates, skyLevelOfDetail);
  }

  vec2 texelSize = 1.0 / vec2(textureSize(transmissionBackgroundTexture, 0));
  vec2 radius = texelSize * (roughness * roughness * 12.0);

  const vec2 OFFSETS[16] = vec2[](
    vec2(0.0, 0.0),
    vec2(0.286, 0.088),
    vec2(-0.177, 0.243),
    vec2(-0.177, -0.243),
    vec2(0.286, -0.088),
    vec2(0.548, 0.445),
    vec2(-0.253, 0.66),
    vec2(-0.704, -0.044),
    vec2(-0.183, -0.682),
    vec2(0.591, -0.388),
    vec2(0.913, 0.174),
    vec2(0.448, 0.814),
    vec2(-0.635, 0.678),
    vec2(-0.928, -0.087),
    vec2(-0.501, -0.786),
    vec2(0.619, -0.697)
  );

  vec3 color = vec3(0.0);
  float totalWeight = 0.0;

  for (int sampleIndex = 0; sampleIndex < 16; ++sampleIndex) {
    float weight = exp(-dot(OFFSETS[sampleIndex], OFFSETS[sampleIndex]) * 1.5);

    color += sampleTransmissionLayer(coordinates + OFFSETS[sampleIndex] * radius, skyLevelOfDetail) * weight;
    totalWeight += weight;
  }

  return color / totalWeight;
}

void main() {
  if (v_clipDistance < 0.0) {
    discard;
  }

  vec2 textureCoordinates = vec2(v_coordinates.x, 1.0 - v_coordinates.y);
  MaterialContext materialContext = MaterialContext(
    textureCoordinates,
    v_cameraPosition.xyz,
    v_worldPosition.xyz,
    v_objectPosition,
    v_normal,
    v_tangent,
    v_bitangent
  );
  MaterialSample materialSample = evaluateMaterial(materialContext);

  if (isMaterialAlphaMasked && materialSample.alpha < materialAlphaCutoff) {
    discard;
  }

  mat3 viewRotation = mat3(camera.viewMatrix);
  mat3 tangentBasis = luzCalculateMaterialTangentBasis(materialContext);
  vec3 cameraTangent = normalize(viewRotation * tangentBasis[0]);
  vec3 cameraBitangent = normalize(viewRotation * tangentBasis[1]);
  vec3 cameraNormal = normalize(viewRotation * tangentBasis[2]);
  float faceSign = luzCalculateMaterialFaceSign();

  cameraNormal *= faceSign;
  cameraBitangent *= faceSign;

  vec3 mappedNormal = materialSample.tangentNormal;

  cameraNormal = normalize(mat3(cameraTangent, cameraBitangent, cameraNormal) * mappedNormal);

  float transmission = materialSample.transmission * materialSample.principledWeight;
  vec3 viewDirection = normalize(-v_cameraPosition.xyz);
  float viewDepth = max(-v_cameraPosition.z, 0.1);
  vec2 screenSize = vec2(textureSize(transmissionBackgroundTexture, 0));
  vec2 screenTextureCoordinates = gl_FragCoord.xy / screenSize;

  // Soft intersections use the opaque depth directly behind the surface.
  // View-space depth keeps the setting in scene units instead of pixels.
  float opaqueDepth = texture(depthTexture, screenTextureCoordinates).r;
  float opaqueViewDepth = reconstructDepth(opaqueDepth, camera.clipPlanes);
  float depthGap = max(opaqueViewDepth - viewDepth, 0.0);
  float edgeWidth = max(materialTransmissionEdgeFade, max(fwidth(depthGap), 1e-4));
  float intersectionFade =
    materialTransmissionEdgeFade > 0.0 && opaqueDepth < 1.0 - 1e-6
      ? smoothstep(0.0, edgeWidth, depthGap)
      : 1.0;

  if (isTransmissionVisualized) {
    outColor = vec4(vec3(transmission * intersectionFade), 1.0);

    return;
  }

  float eta = 1.0 / materialSample.indexOfRefraction;
  vec3 refractedDirection = refract(-viewDirection, cameraNormal, eta);
  vec2 refractedTextureCoordinates =
    screenTextureCoordinates +
    refractedDirection.xy / max(abs(refractedDirection.z), 0.1) * materialSample.transmissionDepth / viewDepth;

  refractedTextureCoordinates = clamp(refractedTextureCoordinates, vec2(0.001), vec2(0.999));

  // Screen-space refraction must never sample opaque geometry in front of the
  // transmissive surface. Fade continuously to the undistorted ray near
  // silhouettes instead of snapping and exposing a hard boundary.
  float refractedDepth = texture(depthTexture, refractedTextureCoordinates).r;
  float refractedViewDepth = reconstructDepth(refractedDepth, camera.clipPlanes);
  float refractedClearance = refractedDepth < 1.0 - 1e-6 ? refractedViewDepth - viewDepth - 0.001 : camera.clipPlanes.y;
  float validityWidth = max(materialTransmissionEdgeFade, max(fwidth(refractedClearance), 1e-4));
  float refractionValidity =
    materialTransmissionEdgeFade > 0.0
      ? smoothstep(0.0, validityWidth, refractedClearance)
      : refractedClearance > 0.0
        ? 1.0
        : 0.0;

  refractedTextureCoordinates = mix(
    screenTextureCoordinates,
    refractedTextureCoordinates,
    intersectionFade * refractionValidity
  );
  refractedDepth = texture(depthTexture, refractedTextureCoordinates).r;

  float roughness = calculateSpecularAntialiasingRoughness(cameraNormal, materialSample.roughness);
  vec3 background = sampleTransmissionBackground(refractedTextureCoordinates, roughness);

  // Captures contain scene radiance minus the volume contribution that the
  // final composite adds. Resolve that contribution at the refracted UV first.
  background += sampleVolumetricLighting(refractedTextureCoordinates, depthTexture);

  vec3 tint = materialSample.baseColor;
  float pathLength = 0.0;

  if (refractedDepth < 1.0 - 1e-6) {
    vec4 backgroundPosition = reconstructPosition(
      camera.reconstructionMatrix,
      refractedTextureCoordinates,
      refractedDepth
    );

    pathLength = distance(backgroundPosition.xyz, v_worldPosition.xyz);
  }

  vec3 extinction = max(vec3(1.0) - materialSample.absorptionColor, vec3(0.0)) * materialSample.absorptionDensity;
  vec3 transmitted = background * tint * exp(-extinction * max(pathLength, 0.0));

  float f0Scalar = clamp(
    calculateDielectricF0(materialSample.indexOfRefraction) * materialSample.specularLevel * 2.0,
    0.0,
    1.0
  );
  float normalViewDot = max(dot(cameraNormal, viewDirection), 0.0);
  vec2 reflectanceLookup = texture(reflectanceLookupTexture, vec2(normalViewDot, roughness)).rg;
  float reflectionResponse = clamp(f0Scalar * reflectanceLookup.x + reflectanceLookup.y, 0.0, 1.0);

  mat3 inverseViewRotation = transpose(viewRotation);
  vec3 reflectedWorldDirection = normalize(inverseViewRotation * reflect(-viewDirection, cameraNormal));
  vec3 reflected =
    environmentSpecularStrength *
    sampleTransmissionSky(reflectedWorldDirection, roughness * maximumTransmissionLevelOfDetail);

  if (isPlanarReflectionEnabled) {
    vec2 reflectionCoordinates = gl_FragCoord.xy / max(planarReflectionViewportSize, vec2(1.0));
    vec4 sharpReflection = texture(planarReflectionTexture, reflectionCoordinates);
    vec4 blurredReflection = texture(blurredPlanarReflectionTexture, reflectionCoordinates);
    float blurAmount = smoothstep(0.04, max(planarReflectionMaximumRoughness, 0.05), roughness);
    vec4 planarReflection = mix(sharpReflection, blurredReflection, blurAmount);
    float roughnessFade = 1.0 - smoothstep(planarReflectionMaximumRoughness, 1.0, roughness);

    // Match the ordinary PBR pass: rough planar captures are only a local,
    // high-frequency replacement for the prefiltered environment. Without
    // this visibility term, switching a material to Transmissive exposes raw
    // HDR capture values and causes a large discontinuous brightness jump.
    float planarVisibility = pow(1.0 - roughness, 4.0);
    float captureWeight = clamp(
      planarReflectionIntensity * planarReflection.a * roughnessFade * planarVisibility,
      0.0,
      1.0
    );

    reflected = mix(reflected, planarReflection.rgb, captureWeight);
  }

  // Use the same split-sum response as luz's opaque PBR pass. This preserves
  // energy and makes transmission=0 continuous with the ordinary material
  // path while retaining the angle-dependent dielectric reflection.
  vec3 glass = mix(transmitted, reflected, reflectionResponse);

  // The same material has already been evaluated through luz's ambient and
  // per-light PBR passes into a layer-local target. Remove emission here so it
  // can be added once below, independently of the transmission weight.
  vec3 litSurface = max(
    texture(transmissionSurfaceTexture, screenTextureCoordinates).rgb - materialSample.emission,
    vec3(0.0)
  );
  vec3 color = mix(litSurface, glass, transmission);
  vec3 undistortedBackground = sampleTransmissionLayer(screenTextureCoordinates, 0.0);

  // Replace (rather than duplicate) the transmitted fraction of the screen-ray
  // volume. Keep signed HDR values: subsequent glass layers resolve them again.
  // This remains screen-space refraction, not a separate foreground dust layer.
  color -= transmission * (1.0 - reflectionResponse) * sampleVolumetricLighting(screenTextureCoordinates, depthTexture);

  // The transmission pass replaces the surface color, so it must preserve
  // emissive radiance itself. This also keeps emissive glass above the bloom
  // threshold instead of silently discarding its glow contribution.
  color += materialSample.emission;

  // The transmission stage replaces the framebuffer rather than using alpha
  // blending. Fade the complete surface result into the captured background
  // so tint, reflection, refraction, and emission all disappear cleanly at
  // shallow intersections.
  color = mix(undistortedBackground, color, intersectionFade);
  outColor = vec4(color, 1.0);
}
