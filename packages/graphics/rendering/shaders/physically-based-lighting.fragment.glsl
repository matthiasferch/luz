#define SHADOWS

in vec2 v_coordinates;
in vec3 v_normal;
in vec3 v_tangent;
in vec3 v_bitangent;

in vec3 v_lightDirection;
in vec4 v_lightProjection;

in vec4 v_worldPosition;
in vec4 v_cameraPosition;
in vec3 v_objectPosition;

in float v_clipDistance;

uniform bool areShadowsEnabled;
uniform bool isSubsurfaceLightingEnabled;
uniform bool isEmissionSuppressed;

uniform sampler2D shadowTexture;
uniform sampler2D ambientOcclusionTexture;
uniform bool isScreenOcclusionEnabled;

uniform bool areWorldNormalsVisualized;
uniform bool areCameraNormalsVisualized;
uniform bool isRoughnessVisualized;
uniform bool isMetallicVisualized;
uniform bool isAmbientOcclusionVisualized;
uniform bool isNormalLightDotVisualized;
uniform bool areShadowsVisualized;

out vec4 outColor;


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

    // Material AO is visualized once by the ambient pass. Lighting is additive
    // and may be clipped to a light scissor, so drawing it here would create
    // overlapping brightness and camera-dependent debug artifacts.
    outColor = vec4(0.0);

    return;
  }

  mat3 viewRotation = mat3(camera.viewMatrix);
  mat3 tangentBasis = luzCalculateMaterialTangentBasis(materialContext);
  vec3 cameraTangent = normalize(viewRotation * tangentBasis[0]);
  vec3 cameraBitangent = normalize(viewRotation * tangentBasis[1]);
  vec3 cameraNormal = normalize(viewRotation * tangentBasis[2]);
  float faceSign = luzCalculateMaterialFaceSign();

  cameraNormal *= faceSign;
  cameraBitangent *= faceSign;

  vec3 geometricNormal = cameraNormal;

  vec3 lightDirection = normalize(viewRotation * v_lightDirection);
  vec3 viewDirection = normalize(-v_cameraPosition.xyz);

  vec3 mappedNormal = materialSample.tangentNormal;

  cameraNormal = normalize(mat3(cameraTangent, cameraBitangent, cameraNormal) * mappedNormal);

  vec3 halfwayDirection = normalize(lightDirection + viewDirection);

  float normalLightDot = max(dot(cameraNormal, lightDirection), 0.0);
  float backNormalLightDot = sqrt(max(dot(-geometricNormal, lightDirection), 0.0));
  float normalViewDot = max(dot(cameraNormal, viewDirection), 0.0);
  float normalHalfwayDot = max(dot(cameraNormal, halfwayDirection), 0.0);
  float viewHalfwayDot = max(dot(viewDirection, halfwayDirection), 0.0);

  vec3 baseColor = materialSample.baseColor;

  float metallic = materialSample.metallic;
  float roughness = calculateSpecularAntialiasingRoughness(cameraNormal, clamp(materialSample.roughness, 0.04, 1.0));

  float dielectricF0 = clamp(
    calculateDielectricF0(materialSample.indexOfRefraction) * materialSample.specularLevel * 2.0,
    0.0,
    1.0
  );
  vec3 baseReflectance = mix(vec3(dielectricF0), baseColor, metallic);
  vec3 fresnel = calculateSchlickFresnel(viewHalfwayDot, baseReflectance);
  float normalDistribution = calculateGgxDistribution(normalHalfwayDot, roughness);
  float geometryVisibility = calculateSmithGeometry(normalViewDot, normalLightDot, roughness);

  vec3 numerator = normalDistribution * geometryVisibility * fresnel;
  float denominator = max(4.0 * normalLightDot * normalViewDot, 0.001);
  vec3 specular = numerator / denominator;

  vec3 diffuseWeight = (1.0 - fresnel) * (1.0 - metallic);
  vec3 diffuse = calculateLambertDiffuse(baseColor) * diffuseWeight;

  vec2 screenCoordinates = gl_FragCoord.xy / vec2(textureSize(ambientOcclusionTexture, 0));
  float directDiffuseVisibility = isScreenOcclusionEnabled
    ? texture(ambientOcclusionTexture, screenCoordinates).r
    : 1.0;

  float distanceAttenuation = light.range > 0.0 ? 1.0 - smoothstep(0.0, light.range, length(v_lightDirection)) : 0.0;
  float outerConeCosine = cos(radians(light.coneAngle * 0.5));
  float innerConeCosine = cos(radians((light.coneAngle - light.coneFalloff) * 0.5));
  vec3 cameraLightDirection = normalize(viewRotation * normalize(light.direction));
  float directionCosine = dot(lightDirection, cameraLightDirection);
  float spotAttenuation = light.isPoint ? 1.0
    : innerConeCosine > outerConeCosine ? smoothstep(outerConeCosine, innerConeCosine, directionCosine) : step(outerConeCosine, directionCosine);
  float attenuation = light.isDirectional ? 1.0 : distanceAttenuation * spotAttenuation;

  float shadow = 1.0;

  if (areShadowsEnabled) {
    vec3 shadowNormal = backNormalLightDot > normalLightDot ? -geometricNormal : cameraNormal;

    shadow = calculateShadow(shadowTexture, v_lightProjection, shadowNormal, lightDirection, v_worldPosition.xyz);
  }

  vec3 lightColor = light.color * light.intensity;

  // Blender expresses the scattering distance in scene units. For this
  // thin-surface approximation, one centimeter reaches full transmission.
  vec3 subsurface = calculateLambertDiffuse(baseColor)
    * (1.0 - metallic)
    * (isSubsurfaceLightingEnabled ? 1.0 : 0.0)
    * materialSample.subsurfaceWeight

    * clamp(materialSample.subsurfaceScale * 100.0, 0.0, 1.0)
    * backNormalLightDot;

  // AO supplies the short-range contact visibility missing from the finite
  // shadow map. It affects diffuse illumination, not directional specular.
  vec3 color = materialSample.principledWeight

    * ((diffuse * directDiffuseVisibility + specular) * normalLightDot
      + subsurface * directDiffuseVisibility)
    * attenuation * shadow * lightColor;

  for (int closureIndex = 0; closureIndex < 4; ++closureIndex) {
    if (closureIndex >= materialSample.glossyCount) {
      break;
    }

    MaterialGlossyClosure glossy = materialSample.glossy[closureIndex];

    if (glossy.weight <= 0.0) {
      continue;
    }

    vec3 glossyNormalWorld = luzCalculateMaterialWorldNormal(materialContext, glossy.tangentNormal);
    vec3 glossyNormal = normalize(viewRotation * glossyNormalWorld);
    float glossyNormalLightDot = max(dot(glossyNormal, lightDirection), 0.0);
    float glossyNormalViewDot = max(dot(glossyNormal, viewDirection), 0.0);
    float glossyNdotH = max(dot(glossyNormal, halfwayDirection), 0.0);
    float glossyRoughness = calculateSpecularAntialiasingRoughness(
      glossyNormal,
      clamp(glossy.roughness, 0.04, 1.0)
    );
    vec3 glossyFresnel = calculateSchlickFresnel(viewHalfwayDot, clamp(glossy.color, 0.0, 1.0));
    float glossyDistribution = calculateGgxDistribution(glossyNdotH, glossyRoughness);
    float glossyGeometry = calculateSmithGeometry(glossyNormalViewDot, glossyNormalLightDot, glossyRoughness);
    vec3 glossySpecular = glossyDistribution * glossyGeometry * glossyFresnel
      / max(4.0 * glossyNormalLightDot * glossyNormalViewDot, 0.001);

    color += glossy.weight * glossySpecular * glossyNormalLightDot
      * attenuation * shadow * lightColor;
  }

  if (areWorldNormalsVisualized) {
    vec3 nWorld = normalize(v_normal);

    outColor = vec4(nWorld * 0.5 + 0.5, 1.0);

    return;
  }

  if (areCameraNormalsVisualized) {
    outColor = vec4(cameraNormal * 0.5 + 0.5, 1.0);

    return;
  }

  if (isRoughnessVisualized) {
    outColor = vec4(vec3(roughness), 1.0);

    return;
  }

  if (isMetallicVisualized) {
    outColor = vec4(vec3(metallic), 1.0);

    return;
  }

  if (isNormalLightDotVisualized) {
    outColor = vec4(vec3(normalLightDot), 1.0);

    return;
  }

  if (areShadowsVisualized) {
    outColor = vec4(vec3(shadow), 1.0);

    return;
  }

  vec3 emissive = isEmissionSuppressed ? vec3(0.0) : materialSample.emission;

  outColor = vec4(color + emissive, 1.0);
}
