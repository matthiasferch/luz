uniform struct Camera {
  vec2 clipPlanes;

  bool isDepthOfFieldEnabled;
  float focusDistance;
  float focalLength;
  float sensorHeight;
  float fStop;

  mat4 viewMatrix;
  mat4 modelViewMatrix;
  mat4 projectionMatrix;
  mat4 reconstructionMatrix;
} camera;

uniform struct Transform {
  vec3 direction;

  mat4 modelMatrix;
  mat3 normalMatrix;
  mat3 rotationMatrix;
} transform;

uniform struct Model {
  bool isAnimated;
} model;

uniform struct Light {
  bool isDirectional;
  bool isPoint;
  vec3 color;

  // World units.
  float range;

  // Degrees.
  float coneFalloff;
  float coneAngle;
  float softness;
  float intensity;
  float volumetricIntensity;
  float volumetricDensity;
  float volumetricAnisotropy;
  float volumetricNoiseScale;
  float volumetricNoiseSpeed;
  float volumetricNoiseStrength;

  vec3 translation;
  vec3 direction;

  mat4 textureMatrix;
  vec2 shadowSize;
  vec2 clipPlanes;
} light;

uniform highp sampler2D boneTexture;

mat4 getBoneMatrix(highp sampler2D palette, int boneIndex) {
  return mat4(
    texelFetch(palette, ivec2(0, boneIndex), 0),
    texelFetch(palette, ivec2(1, boneIndex), 0),
    texelFetch(palette, ivec2(2, boneIndex), 0),
    texelFetch(palette, ivec2(3, boneIndex), 0)
  );
}
