in vec2 v_coordinates;
in vec3 v_normal;
in vec3 v_tangent;
in vec3 v_bitangent;
in vec4 v_worldPosition;
in vec4 v_cameraPosition;
in vec3 v_objectPosition;
in vec4 v_currentClipPosition;
in vec4 v_previousClipPosition;

out vec4 fragmentColor;

uniform float temporalSurfaceId;

float encodeLogarithmicDepth(float rawDepth) {
  float nearPlane = max(camera.clipPlanes.x, 1e-6);
  float farPlane = max(camera.clipPlanes.y, nearPlane + 1e-6);
  float linearDepth = rawDepth >= 1.0 - 1e-6 ? farPlane : reconstructDepth(rawDepth, camera.clipPlanes);

  return log(max(linearDepth / nearPlane, 1.0)) / log(farPlane / nearPlane);
}

void main() {
  MaterialContext materialContext = MaterialContext(
    vec2(v_coordinates.x, 1.0 - v_coordinates.y),
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

  if (isMaterialAlphaBlended && materialSample.alpha <= 1.0 / 255.0) {
    discard;
  }

  vec2 currentNormalizedDeviceCoordinates = v_currentClipPosition.xy / max(v_currentClipPosition.w, 1e-6);
  bool isPreviousPositionValid = v_previousClipPosition.w > 1e-6;
  vec3 previousNormalizedDeviceCoordinates = v_previousClipPosition.xyz / max(v_previousClipPosition.w, 1e-6);
  vec2 velocity = isPreviousPositionValid
    ? (currentNormalizedDeviceCoordinates - previousNormalizedDeviceCoordinates.xy) * 0.5
    : vec2(0.0);
  float previousRawDepth = previousNormalizedDeviceCoordinates.z * 0.5 + 0.5;
  bool isPreviousDepthValid = isPreviousPositionValid && previousRawDepth >= 0.0 && previousRawDepth <= 1.0;

  float emissionResponse = smoothstep(
    0.25,
    2.0,
    dot(max(materialSample.emission, vec3(0.0)), vec3(0.2126, 0.7152, 0.0722))
  );

  // Glossy surfaces need accumulation to smooth jittered specular samples.
  // Reserve material reactivity for explicit flags and emissive content.
  float temporalReactive = clamp(max(materialTemporalReactive, emissionResponse), 0.0, 1.0);

  // The integer part carries a stable surface owner. The fractional half
  // stores reactivity without sacrificing exact integer IDs in RGBA32F.
  float encodedSurfaceAndReactivity = isPreviousDepthValid ? temporalSurfaceId + 0.5 * temporalReactive : 0.0;

  fragmentColor = vec4(
    velocity,
    isPreviousDepthValid
      ? encodeLogarithmicDepth(previousRawDepth)
      : 1.0,
    encodedSurfaceAndReactivity
  );
}
