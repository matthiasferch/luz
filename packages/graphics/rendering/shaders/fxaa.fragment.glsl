uniform sampler2D baseTexture;

out vec4 fragmentColor;

float calculateLuminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
  vec2 textureSizePx = vec2(textureSize(baseTexture, 0));
  vec2 inverseResolution = 1.0 / textureSizePx;
  vec2 textureCoordinates = gl_FragCoord.xy * inverseResolution;

  vec3 rgbNorthWest = texture(baseTexture, textureCoordinates + inverseResolution * vec2(-1.0, 1.0)).rgb;
  vec3 rgbNorthEast = texture(baseTexture, textureCoordinates + inverseResolution * vec2(1.0, 1.0)).rgb;
  vec3 rgbSouthWest = texture(baseTexture, textureCoordinates + inverseResolution * vec2(-1.0, -1.0)).rgb;
  vec3 rgbSouthEast = texture(baseTexture, textureCoordinates + inverseResolution * vec2(1.0, -1.0)).rgb;
  vec3 rgbCenter = texture(baseTexture, textureCoordinates).rgb;

  float lumaNorthWest = calculateLuminance(rgbNorthWest);
  float lumaNorthEast = calculateLuminance(rgbNorthEast);
  float lumaSouthWest = calculateLuminance(rgbSouthWest);
  float lumaSouthEast = calculateLuminance(rgbSouthEast);
  float lumaCenter = calculateLuminance(rgbCenter);
  float lumaMinimum = min(lumaCenter, min(min(lumaNorthWest, lumaNorthEast), min(lumaSouthWest, lumaSouthEast)));
  float lumaMaximum = max(lumaCenter, max(max(lumaNorthWest, lumaNorthEast), max(lumaSouthWest, lumaSouthEast)));

  vec2 direction;

  direction.x = -(lumaNorthWest + lumaNorthEast - (lumaSouthWest + lumaSouthEast));
  direction.y = lumaNorthWest + lumaSouthWest - (lumaNorthEast + lumaSouthEast);

  float directionReduce = max(
    (lumaNorthWest + lumaNorthEast + lumaSouthWest + lumaSouthEast) * (0.25 / 8.0),
    1.0 / 128.0
  );
  float reciprocalDirectionMinimum = 1.0 / (min(abs(direction.x), abs(direction.y)) + directionReduce);

  direction = clamp(direction * reciprocalDirectionMinimum, vec2(-8.0), vec2(8.0)) * inverseResolution;

  vec3 rgbA =
    0.5 *
    (texture(baseTexture, textureCoordinates + direction * (1.0 / 3.0 - 0.5)).rgb +
      texture(baseTexture, textureCoordinates + direction * (2.0 / 3.0 - 0.5)).rgb);
  vec3 rgbB =
    rgbA * 0.5 +
    0.25 *
      (texture(baseTexture, textureCoordinates + direction * -0.5).rgb +
        texture(baseTexture, textureCoordinates + direction * 0.5).rgb);

  float lumaB = calculateLuminance(rgbB);

  fragmentColor = vec4(lumaB < lumaMinimum || lumaB > lumaMaximum ? rgbA : rgbB, 1.0);
}
