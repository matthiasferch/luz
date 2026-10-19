uniform sampler2D skyTexture;
uniform samplerCube skyCube;
uniform float environmentRotation;
uniform bool isCubeSkyEnabled;
uniform vec2 skyViewportSize;

out vec4 outColor;

void main() {
  vec2 coordinates = gl_FragCoord.xy / max(skyViewportSize, vec2(1.0));
  vec4 worldFar = reconstructPosition(camera.reconstructionMatrix, coordinates, 1.0);
  mat4 inverseView = camera.reconstructionMatrix * camera.projectionMatrix;
  vec4 cameraWorld = inverseView * vec4(0.0, 0.0, 0.0, 1.0);
  vec3 direction = normalize(worldFar.xyz - cameraWorld.xyz);

  float cosine = cos(environmentRotation);
  float sine = sin(environmentRotation);
  vec3 rotatedDirection = vec3(
    cosine * direction.x - sine * direction.z,
    direction.y,
    sine * direction.x + cosine * direction.z
  );

  vec3 sky;

  if (isCubeSkyEnabled) {
    sky = texture(skyCube, rotatedDirection).rgb;
  } else {
    float u = atan(rotatedDirection.z, rotatedDirection.x) / (2.0 * PI) + 0.5;
    float v = 0.5 - asin(clamp(rotatedDirection.y, -1.0, 1.0)) / PI;

    sky = pow(texture(skyTexture, vec2(u, v)).rgb, vec3(2.2));
  }

  outColor = vec4(sky, 1.0);
}
