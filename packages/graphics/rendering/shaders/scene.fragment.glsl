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

uniform sampler2D depthTexture;
uniform sampler2D shadowTexture;

out vec4 outColor;

void main() {
  if (v_clipDistance < 0.0) {
    discard;
  }

  vec2 textureCoordinates = vec2(v_coordinates.x, 1.0 - v_coordinates.y);
  MaterialContext materialContext = MaterialContext(textureCoordinates, v_cameraPosition.xyz, v_worldPosition.xyz, v_objectPosition, v_normal, v_tangent, v_bitangent);
  MaterialSample materialSample = evaluateMaterial(materialContext);

  float faceSign = luzCalculateMaterialFaceSign();
  vec3 surfaceNormal = normalize(v_normal) * faceSign;
  mat3 viewRotation = mat3(camera.viewMatrix);
  vec3 lightDirection = normalize(v_lightDirection);
  float frontLight = max(dot(surfaceNormal, lightDirection), 0.0);

  // Normalize Blender's scene-unit scattering distance against one centimeter.
  float backLight = sqrt(max(dot(-surfaceNormal, lightDirection), 0.0))
    * (isSubsurfaceLightingEnabled ? 1.0 : 0.0)
    * materialSample.subsurfaceWeight

    * clamp(materialSample.subsurfaceScale * 100.0, 0.0, 1.0);
  float diffuse = frontLight + backLight;

  float attenuation = light.isDirectional ? 1.0
    : (light.range > 0.0 ? 1.0 - smoothstep(0.0, light.range, length(v_lightDirection)) : 0.0);

  float outerConeCosine = cos(radians(light.coneAngle * 0.5));
  float innerConeCosine = cos(radians((light.coneAngle - light.coneFalloff) * 0.5));
  float directionCosine = dot(lightDirection, normalize(light.direction));

  attenuation *= light.isDirectional || light.isPoint ? 1.0
    : innerConeCosine > outerConeCosine ? smoothstep(outerConeCosine, innerConeCosine, directionCosine) : step(outerConeCosine, directionCosine);

#ifdef SHADOWS
  if (areShadowsEnabled) {
    vec3 shadowNormal = backLight > frontLight ? -surfaceNormal : surfaceNormal;

    attenuation *= calculateShadow(shadowTexture, v_lightProjection, shadowNormal, lightDirection, v_worldPosition.xyz);
  }
#endif

  vec3 baseColor = materialSample.baseColor;
  vec3 color = materialSample.principledWeight * baseColor * diffuse;

  vec3 cameraLight = normalize(viewRotation * v_lightDirection);
  vec3 viewDirection = normalize(-v_cameraPosition.xyz);
  vec3 halfDirection = normalize(cameraLight + viewDirection);

  for (int closureIndex = 0; closureIndex < 4; ++closureIndex) {
    if (closureIndex >= materialSample.glossyCount) {
      break;
    }

    MaterialGlossyClosure glossy = materialSample.glossy[closureIndex];

    if (glossy.weight <= 0.0) {
      continue;
    }

    vec3 glossyNormal = normalize(
      viewRotation * luzCalculateMaterialWorldNormal(materialContext, glossy.tangentNormal)
    );
    float normalLightDot = max(dot(glossyNormal, cameraLight), 0.0);
    float normalViewDot = max(dot(glossyNormal, viewDirection), 0.0);
    float normalHalfwayDot = max(dot(glossyNormal, halfDirection), 0.0);
    float viewHalfwayDot = max(dot(viewDirection, halfDirection), 0.0);
    float roughness = calculateSpecularAntialiasingRoughness(glossyNormal, glossy.roughness);
    vec3 fresnel = calculateSchlickFresnel(viewHalfwayDot, clamp(glossy.color, 0.0, 1.0));
    vec3 specular = calculateGgxDistribution(normalHalfwayDot, roughness) * calculateSmithGeometry(normalViewDot, normalLightDot, roughness) * fresnel
      / max(4.0 * normalLightDot * normalViewDot, 0.001);

    color += glossy.weight * specular * normalLightDot;
  }

  vec3 emissive = materialSample.emission;

  if (isMaterialAlphaMasked && materialSample.alpha < materialAlphaCutoff) {
    discard;
  }

  outColor = vec4(color * attenuation * light.color * light.intensity + emissive, materialSample.alpha);
}
