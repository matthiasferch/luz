uniform sampler2D sceneTexture;
uniform sampler2D depthTexture;
uniform sampler2D surfaceOwnershipTexture;
uniform sampler2D skyTexture;
uniform samplerCube skyCube;

uniform vec2 destinationSize;
uniform bool isCubeSkyEnabled;
uniform float environmentRotation;

out vec4 fragmentColor;

vec3 sampleSky(vec2 textureCoordinates) {
  vec4 worldFar = reconstructPosition(camera.reconstructionMatrix, textureCoordinates, 1.0);
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

  if (isCubeSkyEnabled) {
    return texture(skyCube, rotatedDirection).rgb;
  }

  float u = atan(rotatedDirection.z, rotatedDirection.x) / (2.0 * PI) + 0.5;
  float v = 0.5 - asin(clamp(rotatedDirection.y, -1.0, 1.0)) / PI;

  return pow(texture(skyTexture, vec2(u, v)).rgb, vec3(2.2));
}

vec3 sampleScene(vec2 textureCoordinates) {
  vec4 sceneSample = texture(sceneTexture, textureCoordinates);
  float depth = texture(depthTexture, textureCoordinates).r;
  vec3 color = depth >= 1.0 - 1e-6 && sceneSample.a <= 1e-6 ? sampleSky(textureCoordinates) : sceneSample.rgb;

  return color;
}

bool isDepthCompatible(float anchorDepth, float sampleDepth) {
  bool isAnchorSky = anchorDepth >= 1.0 - 1e-6;
  bool isSampleSky = sampleDepth >= 1.0 - 1e-6;

  if (isAnchorSky || isSampleSky) {
    return isAnchorSky == isSampleSky;
  }

  float anchorLinearDepth = reconstructDepth(anchorDepth, camera.clipPlanes);
  float sampleLinearDepth = reconstructDepth(sampleDepth, camera.clipPlanes);
  float relativeDifference =
    abs(sampleLinearDepth - anchorLinearDepth) / max(min(sampleLinearDepth, anchorLinearDepth), 0.1);

  return relativeDifference <= 0.05;
}

void accumulateSceneSample(
  vec2 sampleTextureCoordinates,
  vec2 anchorTextureCoordinates,
  float anchorDepth,
  inout vec3 color,
  inout float weight
) {
  float sampleDepth = texture(depthTexture, sampleTextureCoordinates).r;

  if (!isDepthCompatible(anchorDepth, sampleDepth)) {
    return;
  }

  if (
    anchorDepth < 1.0 - 1e-6 &&
    any(
      greaterThanEqual(
        abs(
          texture(surfaceOwnershipTexture, anchorTextureCoordinates) -
            texture(surfaceOwnershipTexture, sampleTextureCoordinates)
        ),
        vec4(0.5 / 255.0)
      )
    )
  ) {
    return;
  }

  color += sampleScene(sampleTextureCoordinates);
  weight += 1.0;
}

void main() {
  vec2 sourceSize = vec2(textureSize(sceneTexture, 0));
  vec2 textureCoordinates = gl_FragCoord.xy / destinationSize;
  vec2 halfSourceTexel = 0.5 / sourceSize;

  // Integrate the covered full-resolution pixels only when they represent the
  // same depth layer as the half-resolution pixel. This retains HDR energy on
  // a surface without baking sky or a different silhouette into its color.
  float anchorDepth = texture(depthTexture, textureCoordinates).r;
  vec3 color = vec3(0.0);
  float weight = 0.0;

  accumulateSceneSample(
    textureCoordinates + halfSourceTexel * vec2(-1.0, -1.0),
    textureCoordinates,
    anchorDepth,
    color,
    weight
  );
  accumulateSceneSample(
    textureCoordinates + halfSourceTexel * vec2(1.0, -1.0),
    textureCoordinates,
    anchorDepth,
    color,
    weight
  );
  accumulateSceneSample(
    textureCoordinates + halfSourceTexel * vec2(-1.0, 1.0),
    textureCoordinates,
    anchorDepth,
    color,
    weight
  );
  accumulateSceneSample(
    textureCoordinates + halfSourceTexel * vec2(1.0, 1.0),
    textureCoordinates,
    anchorDepth,
    color,
    weight
  );

  fragmentColor = vec4(weight > 0.0 ? color / weight : sampleScene(textureCoordinates), 1.0);
}
