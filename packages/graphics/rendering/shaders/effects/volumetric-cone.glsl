// Clip a ray segment to the forward half of a circular cone. The sphere/range
// and scene-depth intersection have already bounded the segment. Direction and
// axis must be unit vectors; axis points away from the light into the cone.
bool clipVolumetricCone(vec3 origin, vec3 direction, vec3 axis, float cosine, inout float start, inout float end) {
  // Very wide cones retain the conservative sphere interval and are tested
  // per sample. This also avoids the degenerate quadratic at 180 degrees.
  if (cosine <= 0.0001) {
    return end > start;
  }

  float height = dot(origin, axis);
  float slope = dot(direction, axis);

  if (abs(slope) < 0.000001) {
    if (height < 0.0) {
      return false;
    }
  } else if (slope > 0.0) {
    start = max(start, -height / slope);
  } else {
    end = min(end, -height / slope);
  }

  if (end <= start) {
    return false;
  }

  float cosineSquared = cosine * cosine;
  float a = slope * slope - cosineSquared;
  float b = height * slope - cosineSquared * dot(origin, direction);
  float c = height * height - cosineSquared * dot(origin, origin);

  if (abs(a) < 0.000001) {
    if (abs(b) < 0.000001) {
      return c >= 0.0;
    }

    float root = -c / (2.0 * b);

    if (b > 0.0) {
      start = max(start, root);
    } else {
      end = min(end, root);
    }
  } else {
    float discriminant = b * b - a * c;

    if (discriminant < 0.0) {
      return a > 0.0;
    }

    float root = sqrt(max(discriminant, 0.0));

    // Stable quadratic roots when b and sqrt(discriminant) almost cancel.
    float q = -b - (b >= 0.0 ? root : -root);
    float firstRoot = abs(q) > 0.000001 ? q / a : -b / a;
    float secondRoot = abs(q) > 0.000001 ? c / q : firstRoot;
    float lowerRoot = min(firstRoot, secondRoot);
    float upperRoot = max(firstRoot, secondRoot);

    if (a < 0.0) {
      start = max(start, lowerRoot);
      end = min(end, upperRoot);
    } else if (slope > 0.0) {
      start = max(start, upperRoot);
    } else {
      end = min(end, lowerRoot);
    }
  }

  return end > start;
}

// Keep only the positive half-space. A zero plane disables reflection clipping.
bool clipVolumetricPlane(vec3 origin, vec3 direction, vec4 plane, inout float start, inout float end) {
  float distance = dot(plane, vec4(origin, 1.0));
  float slope = dot(plane.xyz, direction);

  if (abs(slope) < 0.000001) {
    return distance >= 0.0 && end > start;
  }

  float intersection = -distance / slope;

  if (slope > 0.0) {
    start = max(start, intersection);
  } else {
    end = min(end, intersection);
  }

  return end > start;
}
