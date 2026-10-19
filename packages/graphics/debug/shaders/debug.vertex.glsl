layout(location = 7) in vec3 lineStart;
layout(location = 8) in vec3 lineEnd;

uniform vec2 viewportSize;
uniform float lineWidth;
uniform float pixelRatio;
uniform bool isScreenSpace;
uniform bool isCone;

out vec2 lineCoordinates;
flat out float segmentLength;
flat out vec2 segmentDepth;
out vec3 coneNormal;

void drawCone() {
  vec3 displacement = lineEnd - lineStart;
  float arrowLength = length(displacement);

  if (arrowLength <= 0.000001) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);

    return;
  }

  vec3 direction = displacement / arrowLength;
  vec3 reference = abs(direction.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 horizontal = normalize(cross(direction, reference));
  vec3 vertical = cross(direction, horizontal);
  int face = gl_VertexID / 6;
  int corner = gl_VertexID % 6;
  bool isCap = corner >= 3;
  bool isCenter = corner == 0 || corner == 3;
  float angle = float(face + (corner == 2 || corner == 4 ? 1 : 0)) * 6.28318530718 / 16.0;
  vec3 radial = horizontal * cos(angle) + vertical * sin(angle);
  vec3 base = lineEnd - displacement * 0.04;
  vec3 position = isCenter ? isCap ? base : lineEnd : base + radial * arrowLength * 0.016;
  vec3 normal = isCap ? -direction : normalize(radial + direction * 0.4);

  coneNormal = mat3(camera.viewMatrix) * normal;
  gl_Position = camera.projectionMatrix * camera.viewMatrix * vec4(position, 1.0);
}

bool clipSegment(inout vec4 startPoint, inout vec4 endPoint, float startDistance, float endDistance) {
  if (startDistance < 0.0 && endDistance < 0.0) {
    return false;
  }

  if (startDistance < 0.0) {
    startPoint = mix(startPoint, endPoint, startDistance / (startDistance - endDistance));
  } else if (endDistance < 0.0) {
    endPoint = mix(startPoint, endPoint, startDistance / (startDistance - endDistance));
  }

  return true;
}

void main() {
  lineCoordinates = vec2(0.0);
  segmentLength = 0.0;
  segmentDepth = vec2(0.0);
  coneNormal = vec3(0.0, 0.0, 1.0);

  if (isCone) {
    drawCone();

    return;
  }

  vec4 startPoint = vec4(lineStart, 1.0);
  vec4 endPoint = vec4(lineEnd, 1.0);

  if (!isScreenSpace) {
    startPoint = camera.projectionMatrix * camera.viewMatrix * startPoint;
    endPoint = camera.projectionMatrix * camera.viewMatrix * endPoint;
  }

  bool isNearVisible = clipSegment(startPoint, endPoint, startPoint.w + startPoint.z, endPoint.w + endPoint.z);
  bool isFarVisible = clipSegment(startPoint, endPoint, startPoint.w - startPoint.z, endPoint.w - endPoint.z);

  lineCoordinates = vec2(0.0);
  segmentLength = 0.0;
  segmentDepth = vec2(0.0);

  if (!isNearVisible || !isFarVisible || startPoint.w <= 0.0 || endPoint.w <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);

    return;
  }

  vec3 startCoordinates = startPoint.xyz / startPoint.w;
  vec3 endCoordinates = endPoint.xyz / endPoint.w;
  vec2 difference = (endCoordinates.xy - startCoordinates.xy) * viewportSize * 0.5;
  float lengthPixels = length(difference);
  vec2 direction = lengthPixels > 0.0001 ? difference / lengthPixels : vec2(1.0, 0.0);
  vec2 perpendicular = vec2(-direction.y, direction.x);
  vec2 corners[6] = vec2[6](
    vec2(0.0, -1.0),
    vec2(1.0, -1.0),
    vec2(1.0, 1.0),
    vec2(0.0, -1.0),
    vec2(1.0, 1.0),
    vec2(0.0, 1.0)
  );
  vec2 corner = corners[gl_VertexID];
  float radius = lineWidth * pixelRatio * 0.5 + 1.0;
  vec2 offset = (direction * (corner.x * 2.0 - 1.0) + perpendicular * corner.y) * radius;
  vec3 position = mix(startCoordinates, endCoordinates, corner.x);

  position.xy += offset * 2.0 / viewportSize;
  lineCoordinates = vec2(mix(-radius, lengthPixels + radius, corner.x), corner.y * radius);
  segmentLength = lengthPixels;
  segmentDepth = vec2(startCoordinates.z, endCoordinates.z) * 0.5 + 0.5;
  gl_Position = vec4(position, 1.0);
}
