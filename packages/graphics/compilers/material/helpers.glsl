struct MaterialContext {
  vec2 textureCoordinates;
  vec3 position;
  vec3 worldPosition;
  vec3 objectPosition;
  vec3 geometricNormal;
  vec3 tangent;
  vec3 bitangent;
};

struct MaterialGlossyClosure {
  vec3 color;
  float roughness;
  vec3 tangentNormal;
  float weight;
};

struct MaterialSample {
  vec3 baseColor;
  float alpha;
  vec3 tangentNormal;
  float metallic;
  float roughness;
  float occlusion;
  vec3 emission;
  float transmission;
  float indexOfRefraction;
  float specularLevel;
  float transmissionDepth;
  float subsurfaceWeight;
  float subsurfaceScale;
  vec3 absorptionColor;
  float absorptionDensity;
  float principledWeight;
  int glossyCount;
  MaterialGlossyClosure glossy[4];
};

uniform bool isMaterialAlphaMasked;
uniform float materialAlphaCutoff;
uniform float materialTransmissionDepth;
uniform float materialTransmissionEdgeFade;
uniform bool isMaterialDoubleSided;
uniform bool isMaterialAlphaBlended;
uniform float materialTemporalReactive;
uniform bool isFrontFaceReversed;
uniform vec3 generatedCoordinateMinimum;
uniform vec3 generatedCoordinateExtent;

float luzCalculateMaterialFaceSign() {
  bool isLogicalFrontFacing = isFrontFaceReversed ? !gl_FrontFacing : gl_FrontFacing;

  return isMaterialDoubleSided && !isLogicalFrontFacing
    ? -1.0
    : 1.0;
}

float luzCalculateHash(vec3 samplePosition) {
  samplePosition = fract(samplePosition * 0.3183099 + 0.1);
  samplePosition *= 17.0;

  return fract(
    samplePosition.x * samplePosition.y * samplePosition.z * (samplePosition.x + samplePosition.y + samplePosition.z)
  );
}

vec3 luzCalculateHash3(vec3 samplePosition) {
  return vec3(
    luzCalculateHash(samplePosition + vec3(17.0, 59.4, 15.0)),
    luzCalculateHash(samplePosition + vec3(31.0, 11.7, 47.0)),
    luzCalculateHash(samplePosition + vec3(73.0, 23.0, 29.0))
  );
}

vec4 luzCalculateHash4(vec4 samplePosition) {
  vec4 hashSeed = vec4(
    dot(samplePosition, vec4(127.1, 311.7, 74.7, 269.5)),
    dot(samplePosition, vec4(269.5, 183.3, 246.1, 113.5)),
    dot(samplePosition, vec4(113.5, 271.9, 124.6, 199.7)),
    dot(samplePosition, vec4(419.2, 371.9, 128.4, 183.1))
  );

  return fract(sin(hashSeed) * 43758.5453123);
}

float luzCalculateVoronoiMetric3D(vec3 delta, int metric, float exponent) {
  vec3 distance = abs(delta);

  if (metric == 0) {
    return length(distance);
  }

  if (metric == 1) {
    return distance.x + distance.y + distance.z;
  }

  if (metric == 2) {
    return max(distance.x, max(distance.y, distance.z));
  }

  float power = max(exponent, 1e-4);

  return pow(pow(distance.x, power) + pow(distance.y, power) + pow(distance.z, power), 1.0 / power);
}

float luzCalculateVoronoiDistance3D(vec3 coordinate, float randomness, int metric, float exponent) {
  vec3 cell = floor(coordinate);
  vec3 localCoordinates = fract(coordinate);
  float nearestDistance = 1e9;

  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      for (int z = -1; z <= 1; ++z) {
        vec3 offset = vec3(float(x), float(y), float(z));
        vec3 point = offset + luzCalculateHash3(cell + offset) * randomness;

        nearestDistance = min(nearestDistance, luzCalculateVoronoiMetric3D(point - localCoordinates, metric, exponent));
      }
    }
  }

  return nearestDistance;
}

vec3 luzCalculateVoronoiColor3D(vec3 coordinate, float randomness, int metric, float exponent) {
  vec3 cell = floor(coordinate);
  vec3 localCoordinates = fract(coordinate);
  float nearestDistance = 1e9;
  vec3 nearestCell = cell;

  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      for (int z = -1; z <= 1; ++z) {
        vec3 offset = vec3(float(x), float(y), float(z));
        vec3 point = offset + luzCalculateHash3(cell + offset) * randomness;
        float distanceToPoint = luzCalculateVoronoiMetric3D(point - localCoordinates, metric, exponent);

        if (distanceToPoint < nearestDistance) {
          nearestDistance = distanceToPoint;
          nearestCell = cell + offset;
        }
      }
    }
  }

  return luzCalculateHash3(nearestCell);
}

float luzCalculateVoronoiEdgeDistance3D(vec3 coordinate, float randomness) {
  vec3 cell = floor(coordinate);
  vec3 localCoordinates = fract(coordinate);
  float nearestDistance = 1e9;
  vec3 nearestPoint = vec3(0.0);

  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      for (int z = -1; z <= 1; ++z) {
        vec3 offset = vec3(float(x), float(y), float(z));
        vec3 point = offset + luzCalculateHash3(cell + offset) * randomness;
        float distanceToPoint = length(point - localCoordinates);

        if (distanceToPoint < nearestDistance) {
          nearestDistance = distanceToPoint;
          nearestPoint = point;
        }
      }
    }
  }

  float edgeDistance = 1e9;

  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      for (int z = -1; z <= 1; ++z) {
        vec3 offset = vec3(float(x), float(y), float(z));
        vec3 point = offset + luzCalculateHash3(cell + offset) * randomness;
        vec3 separation = point - nearestPoint;
        float separationLength = length(separation);

        if (separationLength > 1e-5) {
          edgeDistance = min(
            edgeDistance,
            dot((nearestPoint + point) * 0.5 - localCoordinates, separation / separationLength)
          );
        }
      }
    }
  }

  return max(edgeDistance, 0.0);
}

float luzCalculateVoronoiDistance4D(vec4 coordinate, float randomness) {
  vec4 cell = floor(coordinate);
  vec4 localCoordinates = fract(coordinate);
  float nearestDistance = 1e9;

  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      for (int z = -1; z <= 1; ++z) {
        for (int w = -1; w <= 1; ++w) {
          vec4 offset = vec4(float(x), float(y), float(z), float(w));
          vec4 point = offset + luzCalculateHash4(cell + offset) * randomness;

          nearestDistance = min(nearestDistance, length(point - localCoordinates));
        }
      }
    }
  }

  return nearestDistance;
}

vec3 luzCalculateVoronoiColor4D(vec4 coordinate, float randomness) {
  vec4 cell = floor(coordinate);
  vec4 localCoordinates = fract(coordinate);
  float nearestDistance = 1e9;
  vec4 nearestCell = cell;

  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      for (int z = -1; z <= 1; ++z) {
        for (int w = -1; w <= 1; ++w) {
          vec4 offset = vec4(float(x), float(y), float(z), float(w));
          vec4 point = offset + luzCalculateHash4(cell + offset) * randomness;
          float distanceToPoint = length(point - localCoordinates);

          if (distanceToPoint < nearestDistance) {
            nearestDistance = distanceToPoint;
            nearestCell = cell + offset;
          }
        }
      }
    }
  }

  return luzCalculateHash4(nearestCell).xyz;
}

float luzCalculateVoronoiEdgeDistance4D(vec4 coordinate, float randomness) {
  vec4 cell = floor(coordinate);
  vec4 localCoordinates = fract(coordinate);
  float nearestDistance = 1e9;
  vec4 nearestPoint = vec4(0.0);

  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      for (int z = -1; z <= 1; ++z) {
        for (int w = -1; w <= 1; ++w) {
          vec4 offset = vec4(float(x), float(y), float(z), float(w));
          vec4 point = offset + luzCalculateHash4(cell + offset) * randomness;
          float distanceToPoint = length(point - localCoordinates);

          if (distanceToPoint < nearestDistance) {
            nearestDistance = distanceToPoint;
            nearestPoint = point;
          }
        }
      }
    }
  }

  float edgeDistance = 1e9;

  for (int x = -1; x <= 1; ++x) {
    for (int y = -1; y <= 1; ++y) {
      for (int z = -1; z <= 1; ++z) {
        for (int w = -1; w <= 1; ++w) {
          vec4 offset = vec4(float(x), float(y), float(z), float(w));
          vec4 point = offset + luzCalculateHash4(cell + offset) * randomness;
          vec4 separation = point - nearestPoint;
          float separationLength = length(separation);

          if (separationLength > 1e-5) {
            edgeDistance = min(
              edgeDistance,
              dot((nearestPoint + point) * 0.5 - localCoordinates, separation / separationLength)
            );
          }
        }
      }
    }
  }

  return max(edgeDistance, 0.0);
}

float luzCalculateFresnelDielectric(float indexOfRefraction, vec3 normal, vec3 viewDirection) {
  float ratio = (max(indexOfRefraction, 1.0001) - 1.0) / (max(indexOfRefraction, 1.0001) + 1.0);
  float reflectance = ratio * ratio;
  float facing = clamp(abs(dot(normalize(normal), normalize(viewDirection))), 0.0, 1.0);

  return reflectance + (1.0 - reflectance) * pow(1.0 - facing, 5.0);
}

vec3 luzConvertRgbToHsv(vec3 color) {
  vec4 hueOffsets = vec4(0.0, -0.3333333333, 0.6666666667, -1.0);
  vec4 orderedGreenBlue = mix(vec4(color.bg, hueOffsets.wz), vec4(color.gb, hueOffsets.xy), step(color.b, color.g));
  vec4 orderedChannels = mix(
    vec4(orderedGreenBlue.xyw, color.r),
    vec4(color.r, orderedGreenBlue.yzx),
    step(orderedGreenBlue.x, color.r)
  );
  float chroma = orderedChannels.x - min(orderedChannels.w, orderedChannels.y);
  float epsilon = 1e-10;

  return vec3(
    abs(orderedChannels.z + (orderedChannels.w - orderedChannels.y) / (6.0 * chroma + epsilon)),
    chroma / (orderedChannels.x + epsilon),
    orderedChannels.x
  );
}

vec3 luzConvertHsvToRgb(vec3 color) {
  vec3 channelWeights = abs(fract(color.xxx + vec3(0.0, 0.6666666667, 0.3333333333)) * 6.0 - 3.0);

  return color.z * mix(vec3(1.0), clamp(channelWeights - 1.0, 0.0, 1.0), color.y);
}

vec4 luzApplyColorBurn(vec4 base, vec4 blend) {
  vec3 denominator = max(blend.rgb, vec3(1e-8));
  vec3 color = max(vec3(1.0) - (vec3(1.0) - base.rgb) / denominator, vec3(0.0));

  return vec4(color, base.a);
}

float luzGenerateNoise(vec3 samplePosition) {
  vec3 cell = floor(samplePosition);
  vec3 interpolationWeight = fract(samplePosition);

  interpolationWeight = interpolationWeight * interpolationWeight * (3.0 - 2.0 * interpolationWeight);

  return mix(
    mix(
      mix(luzCalculateHash(cell), luzCalculateHash(cell + vec3(1, 0, 0)), interpolationWeight.x),
      mix(luzCalculateHash(cell + vec3(0, 1, 0)), luzCalculateHash(cell + vec3(1, 1, 0)), interpolationWeight.x),
      interpolationWeight.y
    ),
    mix(
      mix(luzCalculateHash(cell + vec3(0, 0, 1)), luzCalculateHash(cell + vec3(1, 0, 1)), interpolationWeight.x),
      mix(luzCalculateHash(cell + vec3(0, 1, 1)), luzCalculateHash(cell + vec3(1, 1, 1)), interpolationWeight.x),
      interpolationWeight.y
    ),
    interpolationWeight.z
  );
}

float luzGenerateFractalNoise(vec3 samplePosition, float detail, float roughness, float lacunarity) {
  float value = 0.0;
  float amplitude = 0.5;
  float totalAmplitude = 0.0;

  for (int octave = 0; octave < 8; ++octave) {
    if (float(octave) > detail) {
      break;
    }

    value += luzGenerateNoise(samplePosition) * amplitude;
    totalAmplitude += amplitude;
    samplePosition *= max(lacunarity, 1e-4);
    amplitude *= clamp(roughness, 0.0, 1.0);
  }

  return totalAmplitude > 0.0
    ? value / totalAmplitude
    : 0.0;
}

float luzGenerateNoise(vec4 samplePosition) {
  vec4 cell = floor(samplePosition);
  vec4 blend = fract(samplePosition);

  blend = blend * blend * (3.0 - 2.0 * blend);

  float value = 0.0;

  for (int x = 0; x <= 1; ++x) {
    for (int y = 0; y <= 1; ++y) {
      for (int z = 0; z <= 1; ++z) {
        for (int w = 0; w <= 1; ++w) {
          vec4 offset = vec4(float(x), float(y), float(z), float(w));
          vec4 weight = mix(vec4(1.0) - blend, blend, offset);

          value += luzCalculateHash4(cell + offset).x * weight.x * weight.y * weight.z * weight.w;
        }
      }
    }
  }

  return value;
}

float luzGenerateFractalNoise(vec4 samplePosition, float detail, float roughness, float lacunarity) {
  float value = 0.0;
  float amplitude = 0.5;
  float totalAmplitude = 0.0;

  for (int octave = 0; octave < 8; ++octave) {
    if (float(octave) > detail) {
      break;
    }

    value += luzGenerateNoise(samplePosition) * amplitude;
    totalAmplitude += amplitude;
    samplePosition *= max(lacunarity, 1e-4);
    amplitude *= clamp(roughness, 0.0, 1.0);
  }

  return totalAmplitude > 0.0
    ? value / totalAmplitude
    : 0.0;
}

vec3 luzApplyHueSaturation(vec3 color, float hue, float saturation, float value) {
  float angle = (hue - 0.5) * 6.28318530718;
  vec3 axis = normalize(vec3(1.0));
  vec3 shifted = color * cos(angle) + cross(axis, color) * sin(angle) + axis * dot(axis, color) * (1.0 - cos(angle));
  float luminance = dot(shifted, vec3(0.2126, 0.7152, 0.0722));

  return mix(vec3(luminance), shifted, saturation) * value;
}

vec3 luzApplyMapping(vec3 vector, vec3 location, vec3 rotation, vec3 scale) {
  vec3 result = vector * scale;
  float rotationCosineX = cos(rotation.x),
    rotationSineX = sin(rotation.x);
  float rotationCosineY = cos(rotation.y),
    rotationSineY = sin(rotation.y);
  float rotationCosineZ = cos(rotation.z),
    rotationSineZ = sin(rotation.z);

  result = mat3(1, 0, 0, 0, rotationCosineX, rotationSineX, 0, -rotationSineX, rotationCosineX) * result;
  result = mat3(rotationCosineY, 0, -rotationSineY, 0, 1, 0, rotationSineY, 0, rotationCosineY) * result;
  result = mat3(rotationCosineZ, rotationSineZ, 0, -rotationSineZ, rotationCosineZ, 0, 0, 0, 1) * result;

  return result + location;
}

vec3 luzApplyTextureMapping(vec3 vector, vec3 location, vec3 rotation, vec3 scale) {
  vec3 result = vector - location;
  float rotationCosineX = cos(-rotation.x),
    rotationSineX = sin(-rotation.x);
  float rotationCosineY = cos(-rotation.y),
    rotationSineY = sin(-rotation.y);
  float rotationCosineZ = cos(-rotation.z),
    rotationSineZ = sin(-rotation.z);

  result = mat3(rotationCosineZ, rotationSineZ, 0, -rotationSineZ, rotationCosineZ, 0, 0, 0, 1) * result;
  result = mat3(rotationCosineY, 0, -rotationSineY, 0, 1, 0, rotationSineY, 0, rotationCosineY) * result;
  result = mat3(1, 0, 0, 0, rotationCosineX, rotationSineX, 0, -rotationSineX, rotationCosineX) * result;

  return result / max(abs(scale), vec3(1e-5));
}

vec3 luzRotateAxisAngle(vec3 vector, vec3 center, vec3 axis, float angle) {
  vec3 direction = vector - center;
  vec3 unitAxis = normalize(axis);

  return center +
  direction * cos(angle) +
  cross(unitAxis, direction) * sin(angle) +
  unitAxis * dot(unitAxis, direction) * (1.0 - cos(angle));
}

mat3 luzCalculateMaterialTangentBasis(MaterialContext context) {
  vec3 normal = normalize(context.geometricNormal);
  vec3 tangent = context.tangent - normal * dot(normal, context.tangent);

  if (dot(tangent, tangent) < 1e-10) {
    tangent = abs(normal.z) < 0.999 ? normalize(cross(vec3(0.0, 0.0, 1.0), normal)) : vec3(1.0, 0.0, 0.0);
  } else {
    tangent = normalize(tangent);
  }

  float handedness = dot(cross(normal, tangent), context.bitangent) < 0.0 ? -1.0 : 1.0;
  vec3 bitangent = normalize(cross(normal, tangent)) * handedness;

  return mat3(tangent, bitangent, normal);
}

vec3 luzCalculateSafeTangentNormal(vec3 tangentNormal) {
  float lengthSquared = dot(tangentNormal, tangentNormal);

  return lengthSquared < 1e-10
    ? vec3(0.0, 0.0, 1.0)
    : tangentNormal * inversesqrt(lengthSquared);
}

vec3 luzApplyNormalMap(MaterialContext context, vec3 encodedNormal, float strength, int space) {
  vec3 decodedNormal = luzCalculateSafeTangentNormal(encodedNormal * 2.0 - 1.0);

  if (space == 0) {
    return luzCalculateSafeTangentNormal(mix(vec3(0.0, 0.0, 1.0), decodedNormal, strength));
  }

  // Object/world normal maps are encoded in Blender's X-right, Y-forward,
  // Z-up basis. Match the geometry export's X, Z, -Y conversion first.
  vec3 engineNormal = vec3(decodedNormal.x, decodedNormal.z, -decodedNormal.y);
  vec3 mappedWorldNormal = space == 1 ? normalize(transform.normalMatrix * engineNormal) : engineNormal;
  vec3 geometricWorldNormal = normalize(context.geometricNormal);
  vec3 blendedWorldNormal = normalize(mix(geometricWorldNormal, mappedWorldNormal, strength));

  return luzCalculateSafeTangentNormal(transpose(luzCalculateMaterialTangentBasis(context)) * blendedWorldNormal);
}

vec3 luzCalculateBumpNormal(
  MaterialContext context,
  vec3 tangentNormal,
  float height,
  float strength,
  float distance,
  float direction
) {
  mat3 tangentBasis = luzCalculateMaterialTangentBasis(context);
  vec3 surfaceNormal = normalize(tangentBasis * luzCalculateSafeTangentNormal(tangentNormal));
  vec3 positionDx = dFdx(context.worldPosition);
  vec3 positionDy = dFdy(context.worldPosition);
  vec3 gradientX = cross(positionDy, surfaceNormal);
  vec3 gradientY = cross(surfaceNormal, positionDx);
  float determinant = dot(positionDx, gradientX);

  if (abs(determinant) < 1e-12) {
    return tangentNormal;
  }

  vec3 heightGradient = sign(determinant) * (dFdx(height) * gradientX + dFdy(height) * gradientY);
  vec3 bumpedNormal = normalize(abs(determinant) * surfaceNormal - direction * strength * distance * heightGradient);

  return normalize(transpose(tangentBasis) * bumpedNormal);
}

vec3 luzCalculateMaterialWorldViewDirection(MaterialContext context) {
  vec3 cameraDirection = -context.position;

  if (dot(cameraDirection, cameraDirection) < 1e-10) {
    return vec3(0.0, 0.0, 1.0);
  }

  return normalize(transpose(mat3(camera.viewMatrix)) * cameraDirection);
}

vec3 luzCalculateMaterialWorldNormal(MaterialContext context, vec3 tangentNormal) {
  vec3 fallbackNormal = normalize(context.geometricNormal) * luzCalculateMaterialFaceSign();

  if (dot(tangentNormal, tangentNormal) < 1e-10) {
    return fallbackNormal;
  }

  mat3 basis = luzCalculateMaterialTangentBasis(context);
  vec3 tangent = basis[0];
  vec3 bitangent = basis[1] * luzCalculateMaterialFaceSign();
  vec3 normal = basis[2] * luzCalculateMaterialFaceSign();

  return normalize(mat3(tangent, bitangent, normal) * luzCalculateSafeTangentNormal(tangentNormal));
}
