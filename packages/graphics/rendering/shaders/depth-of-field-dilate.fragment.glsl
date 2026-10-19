uniform sampler2D depthTexture;
uniform sampler2D foregroundRadiusTexture;
uniform vec2 destinationSize;
uniform vec2 dilationDirection;
uniform bool isSourceDepth;

uniform bool isDepthOfFieldOverridden;
uniform float depthOfFieldFocusDistance;
uniform float depthOfFieldFocalLength;
uniform float depthOfFieldSensorHeight;
uniform float depthOfFieldFStop;
uniform float depthOfFieldMaximumBlurRadius;
uniform float depthOfFieldViewportHeight;

out vec4 fragmentColor;

const int DEPTH_OF_FIELD_DILATION_SAMPLES = 25;

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

float calculateForegroundRadiusAt(vec2 textureCoordinates) {
  if (!isSourceDepth) {
    return texture(foregroundRadiusTexture, textureCoordinates).r;
  }

  float depth = texture(depthTexture, textureCoordinates).r;

  if (depth >= 1.0 - 1e-6) {
    return 0.0;
  }

  float linearDepth = reconstructDepth(depth, camera.clipPlanes);
  float focalLength = max(calculateEffectiveFocalLength() * 0.001, 1e-6);
  float sensorHeight = max(calculateEffectiveSensorHeight() * 0.001, 1e-6);
  float focusDistance = max(calculateEffectiveFocusDistance(), focalLength + 1e-4);

  if (linearDepth >= focusDistance) {
    return 0.0;
  }

  float fStop = max(calculateEffectiveFStop(), 0.1);
  float subjectDistance = max(linearDepth, focalLength + 1e-4);
  float circleDiameter =
    focalLength *
    focalLength *
    abs(subjectDistance - focusDistance) /
    (fStop * (focusDistance - focalLength) * subjectDistance);

  return clamp(
    0.5 * circleDiameter / sensorHeight * depthOfFieldViewportHeight,
    0.0,
    max(depthOfFieldMaximumBlurRadius, 0.0)
  );
}

void main() {
  vec2 textureCoordinates = gl_FragCoord.xy / destinationSize;
  vec2 inverseSize = 1.0 / destinationSize;
  float dilationRadius = 0.5 * max(depthOfFieldMaximumBlurRadius, 0.0);
  float maximumRadius = 0.0;

  for (int index = 0; index < DEPTH_OF_FIELD_DILATION_SAMPLES; ++index) {
    float offset = mix(-dilationRadius, dilationRadius, float(index) / float(DEPTH_OF_FIELD_DILATION_SAMPLES - 1));
    vec2 sampleTextureCoordinates = clamp(
      textureCoordinates + dilationDirection * offset * inverseSize,
      vec2(0.0),
      vec2(1.0)
    );

    maximumRadius = max(maximumRadius, calculateForegroundRadiusAt(sampleTextureCoordinates));
  }

  fragmentColor = vec4(maximumRadius, 0.0, 0.0, 1.0);
}
