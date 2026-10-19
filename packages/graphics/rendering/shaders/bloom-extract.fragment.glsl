uniform sampler2D baseTexture;
uniform sampler2D depthTexture;
uniform sampler2D skyTexture;
uniform samplerCube skyCube;
uniform bool isCubeSkyEnabled;
uniform float environmentRotation;
uniform vec2 destinationSize;
uniform float threshold;
uniform float knee;

out vec4 outColor;

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

vec3 sampleResolvedScene(vec2 textureCoordinates) {
  vec4 scene = texture(baseTexture, textureCoordinates);
  float depth = texture(depthTexture, textureCoordinates).r;

  return depth >= 1.0 - 1e-6 && scene.a <= 1e-6
    ? sampleSky(textureCoordinates)
    : scene.rgb;
}

void main() {
  vec2 sourceSize = vec2(textureSize(baseTexture, 0));
  vec2 texel = 1.0 / sourceSize;
  vec2 textureCoordinates = gl_FragCoord.xy / destinationSize;

  vec3 color = vec3(0.0);

  color += sampleResolvedScene(textureCoordinates + texel * vec2(-0.5, -0.5));
  color += sampleResolvedScene(textureCoordinates + texel * vec2(0.5, -0.5));
  color += sampleResolvedScene(textureCoordinates + texel * vec2(-0.5, 0.5));
  color += sampleResolvedScene(textureCoordinates + texel * vec2(0.5, 0.5));
  color *= 0.25;
  color += sampleVolumetricLighting(textureCoordinates, volumetricSceneDepthTexture);

  float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float kneeWidth = max(threshold * knee, 1e-5);
  float soft = clamp(brightness - threshold + kneeWidth, 0.0, 2.0 * kneeWidth);

  soft = soft * soft / (4.0 * kneeWidth);

  float contribution = max(brightness - threshold, soft) / max(brightness, 1e-5);

  outColor = vec4(color * max(contribution, 0.0), 1.0);
}
