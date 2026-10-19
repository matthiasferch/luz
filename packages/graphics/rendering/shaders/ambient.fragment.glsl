in vec2 v_coordinates;
in vec3 v_normal;
in vec3 v_tangent;
in vec3 v_bitangent;
in vec4 v_cameraPosition;
in vec4 v_worldPosition;
in vec3 v_objectPosition;
in float v_clipDistance;

out vec4 outColor;

uniform float ambientBrightness;
uniform sampler2D environmentDiffuseTexture;
uniform float environmentDiffuseStrength;
uniform sampler2D environmentSpecularTexture;
uniform sampler2D reflectanceLookupTexture;
uniform float environmentSpecularMaximumLevelOfDetail;
uniform float environmentSpecularStrength;
uniform float environmentRotation;
uniform bool isCubeEnvironmentEnabled;
uniform samplerCube environmentDiffuseCube;
uniform samplerCube environmentSpecularCube;
uniform bool isPlanarReflectionEnabled;
uniform sampler2D planarReflectionTexture;
uniform sampler2D blurredPlanarReflectionTexture;
uniform vec2 planarReflectionViewportSize;
uniform float planarReflectionIntensity;
uniform float planarReflectionMaximumRoughness;
uniform sampler2D ambientOcclusionTexture;
uniform bool isScreenOcclusionEnabled;
uniform bool isAmbientOcclusionVisualized;

void main() {
  if (v_clipDistance < 0.0) {
    discard;
  }

  vec2 textureCoordinates = vec2(v_coordinates.x, 1.0 - v_coordinates.y);
  MaterialContext materialContext = MaterialContext(textureCoordinates, v_cameraPosition.xyz, v_worldPosition.xyz, v_objectPosition, v_normal, v_tangent, v_bitangent);
  MaterialSample materialSample = evaluateMaterial(materialContext);

  if (isMaterialAlphaMasked && materialSample.alpha < materialAlphaCutoff) {
    discard;
  }

  if (isAmbientOcclusionVisualized) {
    outColor = vec4(vec3(materialSample.occlusion), 1.0);

    return;
  }

  vec3 baseColor = materialSample.baseColor;
  vec2 screenCoordinates = gl_FragCoord.xy / vec2(textureSize(ambientOcclusionTexture, 0));
  float screenVisibility = isScreenOcclusionEnabled
    ? texture(ambientOcclusionTexture, screenCoordinates).r
    : 1.0;
  float materialVisibility = clamp(materialSample.occlusion, 0.0, 1.0);
  float diffuseVisibility = materialVisibility * screenVisibility;
  vec3 base = diffuseVisibility * ambientBrightness * baseColor * materialSample.principledWeight;

  mat3 tangentBasis = luzCalculateMaterialTangentBasis(materialContext);
  vec3 worldTangent = tangentBasis[0];
  vec3 worldBitangent = tangentBasis[1];
  vec3 worldNormal = tangentBasis[2];
  float faceSign = luzCalculateMaterialFaceSign();

  worldNormal *= faceSign;
  worldBitangent *= faceSign;

  vec3 mappedNormal = materialSample.tangentNormal;

  worldNormal = normalize(mat3(worldTangent, worldBitangent, worldNormal) * mappedNormal);

  vec3 cameraViewDirection = normalize(-v_cameraPosition.xyz);
  mat3 viewRotation = mat3(camera.viewMatrix);
  mat3 inverseViewRotation = transpose(viewRotation);
  vec3 worldViewDirection = normalize(inverseViewRotation * cameraViewDirection);
  float normalViewDot = max(dot(worldNormal, worldViewDirection), 0.0);

  float metallic = materialSample.metallic;
  float roughness = calculateSpecularAntialiasingRoughness(worldNormal, clamp(materialSample.roughness, 0.04, 1.0));
  float dielectricF0 = clamp(
    calculateDielectricF0(materialSample.indexOfRefraction) * materialSample.specularLevel * 2.0,
    0.0,
    1.0
  );
  vec3 baseReflectance = mix(vec3(dielectricF0), baseColor, metallic);
  vec3 fresnel = calculateSchlickFresnel(normalViewDot, baseReflectance);
  vec3 diffuseWeight = (1.0 - fresnel) * (1.0 - metallic);

  float rotationCosine = cos(environmentRotation);
  float rotationSine = sin(environmentRotation);
  vec3 rotatedWorldNormal = vec3(
    rotationCosine * worldNormal.x - rotationSine * worldNormal.z,
    worldNormal.y,
    rotationSine * worldNormal.x + rotationCosine * worldNormal.z
  );

  float u = atan(rotatedWorldNormal.z, rotatedWorldNormal.x) / (2.0 * PI) + 0.5;
  float v = 0.5 - asin(clamp(rotatedWorldNormal.y, -1.0, 1.0)) / PI;
  vec3 environmentDiffuse = isCubeEnvironmentEnabled
    ? textureLod(environmentDiffuseCube, rotatedWorldNormal, 0.0).rgb
    : pow(texture(environmentDiffuseTexture, vec2(u, v)).rgb, vec3(2.2));

  base += diffuseVisibility * materialSample.principledWeight
    * environmentDiffuseStrength * environmentDiffuse * calculateLambertDiffuse(baseColor) * diffuseWeight;

  vec3 worldReflectionDirection = normalize(reflect(-worldViewDirection, worldNormal));
  vec3 rotatedWorldReflection = vec3(
    rotationCosine * worldReflectionDirection.x - rotationSine * worldReflectionDirection.z,
    worldReflectionDirection.y,
    rotationSine * worldReflectionDirection.x + rotationCosine * worldReflectionDirection.z
  );
  float reflectionU = atan(rotatedWorldReflection.z, rotatedWorldReflection.x) / (2.0 * PI) + 0.5;
  float reflectionV = 0.5 - asin(clamp(rotatedWorldReflection.y, -1.0, 1.0)) / PI;
  float levelOfDetail = roughness * environmentSpecularMaximumLevelOfDetail;
  vec3 prefilteredColor = isCubeEnvironmentEnabled
    ? textureLod(environmentSpecularCube, rotatedWorldReflection, levelOfDetail).rgb
    : pow(textureLod(environmentSpecularTexture, vec2(reflectionU, reflectionV), levelOfDetail).rgb, vec3(2.2));
  vec2 reflectanceLookup = texture(reflectanceLookupTexture, vec2(normalViewDot, roughness)).rg;
  vec3 specularResponse = baseReflectance * reflectanceLookup.x + reflectanceLookup.y;
  vec3 environmentSpecular = environmentSpecularStrength * prefilteredColor * specularResponse;

  if (isPlanarReflectionEnabled) {
    vec2 reflectionCoordinates = gl_FragCoord.xy / max(planarReflectionViewportSize, vec2(1.0));
    vec4 sharpReflection = texture(planarReflectionTexture, reflectionCoordinates);
    vec4 blurredReflection = texture(blurredPlanarReflectionTexture, reflectionCoordinates);
    float blurAmount = smoothstep(0.04, max(planarReflectionMaximumRoughness, 0.05), roughness);
    vec4 planarReflection = mix(sharpReflection, blurredReflection, blurAmount);
    float roughnessFade = 1.0 - smoothstep(planarReflectionMaximumRoughness, 1.0, roughness);

    // A planar capture is a high-frequency local reflection source. Rough
    // surfaces should predominantly use the prefilteredColor environment instead
    // of displaying a recognizable copy of that capture.
    float planarVisibility = pow(1.0 - roughness, 4.0);
    float reflectionWeight = clamp(
      planarReflectionIntensity * planarReflection.a * roughnessFade * planarVisibility,
      0.0,
      1.0
    );
    vec3 planarSpecular = planarReflection.rgb * specularResponse;

    environmentSpecular = mix(environmentSpecular, planarSpecular, reflectionWeight);
  }

  // Screen-space AO describes diffuse hemisphere visibility. Applying it to a
  // sharp planar reflection makes mirrors darken even though no reflected ray
  // is actually blocked. Keep material-authored specular occlusion, but leave
  // screen AO out of this term until bent-normal specular occlusion exists.
  float specularVisibility = clamp(pow(materialVisibility, 4.0) + normalViewDot - 1.0, 0.0, 1.0);

  base += materialSample.principledWeight * specularVisibility * environmentSpecular;

  for (int closureIndex = 0; closureIndex < 4; ++closureIndex) {
    if (closureIndex >= materialSample.glossyCount) {
      break;
    }

    MaterialGlossyClosure glossy = materialSample.glossy[closureIndex];

    if (glossy.weight <= 0.0) {
      continue;
    }

    vec3 glossyNormal = luzCalculateMaterialWorldNormal(materialContext, glossy.tangentNormal);
    float glossyNormalViewDot = max(dot(glossyNormal, worldViewDirection), 0.0);
    float glossyRoughness = calculateSpecularAntialiasingRoughness(
      glossyNormal,
      clamp(glossy.roughness, 0.04, 1.0)
    );
    vec3 glossyReflection = normalize(reflect(-worldViewDirection, glossyNormal));
    vec3 rotatedGlossyReflection = vec3(
      rotationCosine * glossyReflection.x - rotationSine * glossyReflection.z,
      glossyReflection.y,
      rotationSine * glossyReflection.x + rotationCosine * glossyReflection.z
    );
    float glossyLongitude = atan(rotatedGlossyReflection.z, rotatedGlossyReflection.x) / (2.0 * PI) + 0.5;
    float glossyLatitude = 0.5 - asin(clamp(rotatedGlossyReflection.y, -1.0, 1.0)) / PI;
    float glossyLevelOfDetail = glossyRoughness * environmentSpecularMaximumLevelOfDetail;
    vec3 glossyPrefiltered = isCubeEnvironmentEnabled
      ? textureLod(environmentSpecularCube, rotatedGlossyReflection, glossyLevelOfDetail).rgb
      : pow(textureLod(environmentSpecularTexture, vec2(glossyLongitude, glossyLatitude), glossyLevelOfDetail).rgb, vec3(2.2));
    vec2 glossyReflectanceLookup = texture(reflectanceLookupTexture, vec2(glossyNormalViewDot, glossyRoughness)).rg;
    vec3 glossyResponse = clamp(glossy.color, 0.0, 1.0) * glossyReflectanceLookup.x + glossyReflectanceLookup.y;
    vec3 glossyEnvironmentLighting = environmentSpecularStrength * glossyPrefiltered * glossyResponse;

    if (isPlanarReflectionEnabled) {
      vec2 reflectionCoordinates = gl_FragCoord.xy / max(planarReflectionViewportSize, vec2(1.0));
      vec4 sharpReflection = texture(planarReflectionTexture, reflectionCoordinates);
      vec4 blurredReflection = texture(blurredPlanarReflectionTexture, reflectionCoordinates);
      float blurAmount = smoothstep(0.04, max(planarReflectionMaximumRoughness, 0.05), glossyRoughness);
      vec4 planarReflection = mix(sharpReflection, blurredReflection, blurAmount);
      float roughnessFade = 1.0 - smoothstep(planarReflectionMaximumRoughness, 1.0, glossyRoughness);
      float planarVisibility = pow(1.0 - glossyRoughness, 4.0);
      float reflectionWeight = clamp(
        planarReflectionIntensity * planarReflection.a * roughnessFade * planarVisibility,
        0.0,
        1.0
      );

      glossyEnvironmentLighting = mix(glossyEnvironmentLighting, planarReflection.rgb * glossyResponse, reflectionWeight);
    }

    float glossyVisibility = clamp(
      pow(materialVisibility, 4.0) + glossyNormalViewDot - 1.0,
      0.0,
      1.0
    );

    base += glossy.weight * glossyVisibility * glossyEnvironmentLighting;
  }

  vec3 emissive = materialSample.emission;

  outColor = vec4(base + emissive, 1.0);
}
