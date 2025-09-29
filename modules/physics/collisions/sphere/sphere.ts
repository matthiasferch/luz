import { vec3 } from '@luz/vectors';
import { Collision } from '../../collision';
import { Sphere } from '../../volumes/sphere';

export const collideSphereWithSphere = (s1: Sphere, s2: Sphere): Collision | null => {
  const { center: c1, radius: r1 } = s1;
  const { center: c2, radius: r2 } = s2;

  const delta = vec3.subtract(c2, c1);
  const distanceSquared = delta.squaredLength;
  const radiiSum = r1 + r2;

  if (distanceSquared > radiiSum * radiiSum) {
    return null;
  }

  const distance = Math.sqrt(distanceSquared);

  const normal = distance > 0 ? vec3.scale(delta, 1 / distance, new vec3()) : vec3.right.copy();
  const contactOffset = vec3.scale(normal, r1, new vec3());
  const contact = vec3.add(c1, contactOffset, new vec3());

  return { contact, normal, distance: distance - radiiSum };
};
