(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["collision"] = factory();
	else
		root["collision"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/collider.ts":
/*!*************************!*\
  !*** ./src/collider.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Collider = void 0;
class Collider {
}
exports.Collider = Collider;


/***/ }),

/***/ "./src/colliders/cuboid.ts":
/*!*********************************!*\
  !*** ./src/colliders/cuboid.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Cuboid = void 0;
const cuboid_1 = __webpack_require__(/*! ../collisions/cuboid */ "./src/collisions/cuboid.ts");
const plane_1 = __webpack_require__(/*! ../collisions/plane */ "./src/collisions/plane.ts");
const collider_1 = __webpack_require__(/*! ../collider */ "./src/collider.ts");
const ray_1 = __webpack_require__(/*! ../collisions/ray */ "./src/collisions/ray.ts");
const sphere_1 = __webpack_require__(/*! ../collisions/sphere */ "./src/collisions/sphere.ts");
const plane_2 = __webpack_require__(/*! ./plane */ "./src/colliders/plane.ts");
const ray_2 = __webpack_require__(/*! ./ray */ "./src/colliders/ray.ts");
const sphere_2 = __webpack_require__(/*! ./sphere */ "./src/colliders/sphere.ts");
const vec3_1 = __webpack_require__(/*! ../../../vectors/src/vec3 */ "../vectors/src/vec3.ts");
const { min, max } = Math;
class Cuboid extends collider_1.Collider {
    constructor({ minimum = vec3_1.vec3.one, maximum = vec3_1.vec3.one } = {}) {
        super();
        this.minimum = minimum.copy();
        this.maximum = maximum.copy();
    }
    collide(collider, t1, t2) {
        if (collider instanceof ray_2.Ray) {
            return (0, ray_1.collideRayWithCuboid)(collider, this, t1, t2);
        }
        if (collider instanceof plane_2.Plane) {
            return (0, plane_1.collidePlaneWithCuboid)(collider, this, t1, t2);
        }
        if (collider instanceof sphere_2.Sphere) {
            return (0, sphere_1.collideSphereWithCuboid)(collider, this, t1, t2);
        }
        if (collider instanceof Cuboid) {
            return (0, cuboid_1.collideCuboidWithCuboid)(this, collider, t1, t2);
        }
        return null;
    }
    transform(transform) {
        const { modelMatrix } = transform;
        const minimum = modelMatrix.transformVec3(this.minimum);
        const maximum = modelMatrix.transformVec3(this.maximum);
        return new Cuboid({
            minimum: new vec3_1.vec3([
                min(minimum.x, maximum.x),
                min(minimum.y, maximum.y),
                min(minimum.z, maximum.z)
            ]),
            maximum: new vec3_1.vec3([
                max(minimum.x, maximum.x),
                max(minimum.y, maximum.y),
                max(minimum.z, maximum.z)
            ])
        });
    }
}
exports.Cuboid = Cuboid;


/***/ }),

/***/ "./src/colliders/plane.ts":
/*!********************************!*\
  !*** ./src/colliders/plane.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Plane = void 0;
const plane_1 = __webpack_require__(/*! ../collisions/plane */ "./src/collisions/plane.ts");
const collider_1 = __webpack_require__(/*! ../collider */ "./src/collider.ts");
const ray_1 = __webpack_require__(/*! ../collisions/ray */ "./src/collisions/ray.ts");
const cuboid_1 = __webpack_require__(/*! ./cuboid */ "./src/colliders/cuboid.ts");
const ray_2 = __webpack_require__(/*! ./ray */ "./src/colliders/ray.ts");
const sphere_1 = __webpack_require__(/*! ./sphere */ "./src/colliders/sphere.ts");
const vec4_1 = __webpack_require__(/*! ../../../vectors/src/vec4 */ "../vectors/src/vec4.ts");
class Plane extends collider_1.Collider {
    constructor({ equation = vec4_1.vec4.up } = {}) {
        super();
        this.equation = equation.copy();
    }
    collide(collider, t1, t2) {
        if (collider instanceof ray_2.Ray) {
            return (0, ray_1.collideRayWithPlane)(collider, this, t1, t2);
        }
        if (collider instanceof sphere_1.Sphere) {
            return (0, plane_1.collidePlaneWithSphere)(this, collider, t1, t2);
        }
        if (collider instanceof cuboid_1.Cuboid) {
            return (0, plane_1.collidePlaneWithCuboid)(this, collider, t1, t2);
        }
        return null;
    }
    transform(transform) {
        const { inverseTransposeMatrix } = transform;
        return new Plane({
            equation: inverseTransposeMatrix.transform(this.equation)
        });
    }
}
exports.Plane = Plane;


/***/ }),

/***/ "./src/colliders/ray.ts":
/*!******************************!*\
  !*** ./src/colliders/ray.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Ray = void 0;
const collider_1 = __webpack_require__(/*! ../collider */ "./src/collider.ts");
const vec3_1 = __webpack_require__(/*! ../../../vectors/src/vec3 */ "../vectors/src/vec3.ts");
const sphere_1 = __webpack_require__(/*! ./sphere */ "./src/colliders/sphere.ts");
const ray_1 = __webpack_require__(/*! ../collisions/ray */ "./src/collisions/ray.ts");
const plane_1 = __webpack_require__(/*! ./plane */ "./src/colliders/plane.ts");
const cuboid_1 = __webpack_require__(/*! ./cuboid */ "./src/colliders/cuboid.ts");
class Ray extends collider_1.Collider {
    constructor({ origin = vec3_1.vec3.zero, direction = vec3_1.vec3.up }) {
        super();
        this.origin = origin.copy();
        this.direction = direction.copy().normalize();
    }
    collide(collider, t1, t2) {
        if (collider instanceof Ray) {
            return (0, ray_1.collideRayWithRay)(this, collider, t1, t2);
        }
        if (collider instanceof plane_1.Plane) {
            return (0, ray_1.collideRayWithPlane)(this, collider, t1, t2);
        }
        if (collider instanceof sphere_1.Sphere) {
            return (0, ray_1.collideRayWithSphere)(this, collider, t1, t2);
        }
        if (collider instanceof cuboid_1.Cuboid) {
            return (0, ray_1.collideRayWithCuboid)(this, collider, t1, t2);
        }
        return null;
    }
    transform(transform) {
        const { modelMatrix, rotationMatrix } = transform;
        const origin = modelMatrix.transformVec3(this.origin);
        const direction = rotationMatrix.transform(this.direction);
        return new Ray({ origin, direction });
    }
}
exports.Ray = Ray;


/***/ }),

/***/ "./src/colliders/sphere.ts":
/*!*********************************!*\
  !*** ./src/colliders/sphere.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sphere = void 0;
const collider_1 = __webpack_require__(/*! ../collider */ "./src/collider.ts");
const vec3_1 = __webpack_require__(/*! ../../../vectors/src/vec3 */ "../vectors/src/vec3.ts");
const ray_1 = __webpack_require__(/*! ../collisions/ray */ "./src/collisions/ray.ts");
const ray_2 = __webpack_require__(/*! ./ray */ "./src/colliders/ray.ts");
const plane_1 = __webpack_require__(/*! ../collisions/plane */ "./src/collisions/plane.ts");
const plane_2 = __webpack_require__(/*! ./plane */ "./src/colliders/plane.ts");
const cuboid_1 = __webpack_require__(/*! ./cuboid */ "./src/colliders/cuboid.ts");
const sphere_1 = __webpack_require__(/*! ../collisions/sphere */ "./src/collisions/sphere.ts");
class Sphere extends collider_1.Collider {
    constructor({ center = vec3_1.vec3.zero, radius = 1.0 }) {
        super();
        this.center = center.copy();
        this.radius = radius;
    }
    collide(collider, t1, t2) {
        if (collider instanceof ray_2.Ray) {
            return (0, ray_1.collideRayWithSphere)(collider, this, t1, t2);
        }
        if (collider instanceof plane_2.Plane) {
            return (0, plane_1.collidePlaneWithSphere)(collider, this, t1, t2);
        }
        if (collider instanceof Sphere) {
            return (0, sphere_1.collideSphereWithSphere)(this, collider, t1, t2);
        }
        if (collider instanceof cuboid_1.Cuboid) {
            return (0, sphere_1.collideSphereWithCuboid)(this, collider, t1, t2);
        }
        return null;
    }
    transform(transform) {
        const { modelMatrix } = transform;
        const center = modelMatrix.transformVec3(this.center);
        return new Sphere({ center, radius: this.radius });
    }
}
exports.Sphere = Sphere;


/***/ }),

/***/ "./src/collisions/cuboid.ts":
/*!**********************************!*\
  !*** ./src/collisions/cuboid.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collideCuboidWithCuboid = void 0;
const vec3_1 = __webpack_require__(/*! ../../../vectors/src/vec3 */ "../vectors/src/vec3.ts");
const { min } = Math;
const collideCuboidWithCuboid = (c1, c2, t1, t2) => {
    if (c1.maximum.x < c2.minimum.x ||
        c1.minimum.x > c2.maximum.x ||
        c1.maximum.y < c2.minimum.y ||
        c1.minimum.y > c2.maximum.y ||
        c1.maximum.z < c2.minimum.z ||
        c1.minimum.z > c2.maximum.z) {
        return null;
    }
    const x = min(c1.maximum.x - c2.minimum.x, c2.maximum.x - c1.minimum.x);
    const y = min(c1.maximum.y - c2.minimum.y, c2.maximum.y - c1.minimum.y);
    const z = min(c1.maximum.z - c2.minimum.z, c2.maximum.z - c1.minimum.z);
    const center1 = vec3_1.vec3.add(c1.minimum, c1.maximum).scale(0.5);
    const center2 = vec3_1.vec3.add(c2.minimum, c2.maximum).scale(0.5);
    let normal;
    const contact = center1.copy();
    if (x < y && x < z) {
        normal = vec3_1.vec3.right.copy();
        if (center1.x < center2.x) {
            contact.x = c1.maximum.x;
        }
        else {
            contact.x = c1.minimum.x;
        }
    }
    else if (y < z) {
        normal = vec3_1.vec3.up.copy();
        if (center1.y < center2.y) {
            contact.y = c1.maximum.y;
        }
        else {
            contact.y = c1.minimum.y;
        }
    }
    else {
        normal = vec3_1.vec3.forward.copy();
        if (center1.z < center2.z) {
            contact.z = c1.maximum.z;
        }
        else {
            contact.z = c1.minimum.z;
        }
    }
    const distance = -(min(x, y, z));
    return { normal, contact, distance };
};
exports.collideCuboidWithCuboid = collideCuboidWithCuboid;


/***/ }),

/***/ "./src/collisions/plane.ts":
/*!*********************************!*\
  !*** ./src/collisions/plane.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collidePlaneWithCuboid = exports.collidePlaneWithSphere = void 0;
const vec3_1 = __webpack_require__(/*! ../../../vectors/src/vec3 */ "../vectors/src/vec3.ts");
const { abs } = Math;
const collidePlaneWithSphere = (plane, sphere, t1, t2) => {
    const { equation } = plane;
    const planeNormal = new vec3_1.vec3([equation.x, equation.y, equation.z]);
    const distance = vec3_1.vec3.dot(planeNormal, sphere.center) - equation.w;
    if (distance < 0) {
        return null;
    }
    const depth = sphere.radius - distance;
    const normal = planeNormal.copy().negate();
    const contact = vec3_1.vec3.subtract(sphere.center, vec3_1.vec3.scale(normal, depth));
    return { contact, normal, distance };
};
exports.collidePlaneWithSphere = collidePlaneWithSphere;
const collidePlaneWithCuboid = (plane, cuboid, t1, t2) => {
    const { equation } = plane;
    const { maximum, minimum } = cuboid;
    const center = vec3_1.vec3.add(minimum, maximum).scale(0.5);
    const extents = vec3_1.vec3.subtract(maximum, minimum).scale(0.5);
    const planeNormal = new vec3_1.vec3([equation.x, equation.y, equation.z]);
    const projection = vec3_1.vec3.dot(planeNormal, extents);
    const distance = vec3_1.vec3.dot(center, planeNormal) + equation.w - projection;
    if (distance > 0) {
        return null;
    }
    const contact = vec3_1.vec3.subtract(center, vec3_1.vec3.scale(planeNormal, projection));
    return { contact, normal: planeNormal, distance: abs(distance) };
};
exports.collidePlaneWithCuboid = collidePlaneWithCuboid;


/***/ }),

/***/ "./src/collisions/ray.ts":
/*!*******************************!*\
  !*** ./src/collisions/ray.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collideRayWithCuboid = exports.collideRayWithSphere = exports.collideRayWithPlane = exports.collideRayWithRay = void 0;
const vec3_1 = __webpack_require__(/*! ../../../vectors/src/vec3 */ "../vectors/src/vec3.ts");
const { sqrt, min, max } = Math;
const collideRayWithRay = (ray1, ray2, t1, t2) => {
    const { direction: d1, origin: o1 } = ray1;
    const { direction: d2, origin: o2 } = ray2;
    const c = vec3_1.vec3.cross(d1, d2);
    const d = vec3_1.vec3.dot(c, c);
    if (d === 0) {
        return null;
    }
    const f = vec3_1.vec3.subtract(o2, o1);
    const u = vec3_1.vec3.cross(c, f).scale(1 / d);
    const t = vec3_1.vec3.dot(vec3_1.vec3.cross(f, d2), c) / d;
    if (t < 0 || t > 1) {
        return null;
    }
    const c1 = vec3_1.vec3.add(o1, vec3_1.vec3.scale(d1, t));
    const c2 = vec3_1.vec3.add(o2, vec3_1.vec3.scale(d2, u.z));
    const normal = vec3_1.vec3.subtract(c1, c2).normalize();
    const distance = vec3_1.vec3.dot(vec3_1.vec3.subtract(c1, o1), d1);
    return { contact: c1, normal, distance };
};
exports.collideRayWithRay = collideRayWithRay;
const collideRayWithPlane = (ray, plane, t1, t2) => {
    const { equation } = plane;
    const { direction, origin } = ray;
    const normal = new vec3_1.vec3([equation.x, equation.y, equation.z]);
    const d = vec3_1.vec3.dot(direction, normal);
    if (d === 0) {
        return null;
    }
    const distance = (equation.w - vec3_1.vec3.dot(origin, normal)) / d;
    if (distance < 0) {
        return null;
    }
    const contact = vec3_1.vec3.add(origin, vec3_1.vec3.scale(direction, distance));
    return { contact, normal, distance };
};
exports.collideRayWithPlane = collideRayWithPlane;
const collideRayWithSphere = (ray, sphere, t1, t2) => {
    const { direction, origin } = ray;
    const { center, radius } = sphere;
    const r2 = radius * radius;
    const c = vec3_1.vec3.subtract(center, origin);
    const d = vec3_1.vec3.dot(direction, c);
    if (d < 0) {
        return null;
    }
    const d2 = c.squaredLength - (d * d);
    if (d2 > r2) {
        return null;
    }
    const distance = d - sqrt(r2 - d2);
    const contact = vec3_1.vec3.add(origin, vec3_1.vec3.scale(direction, distance));
    const normal = vec3_1.vec3.subtract(contact, center).normalize();
    return { contact, normal, distance };
};
exports.collideRayWithSphere = collideRayWithSphere;
const collideRayWithCuboid = (ray, cuboid, t1, t2) => {
    const { origin, direction } = ray;
    const { maximum, minimum } = cuboid;
    const s1 = vec3_1.vec3.subtract(minimum, origin).divide(direction);
    const s2 = vec3_1.vec3.subtract(maximum, origin).divide(direction);
    const m1 = max(min(s1.x, s2.x), min(s1.y, s2.y), min(s1.z, s2.z));
    const m2 = min(max(s1.x, s2.x), max(s1.y, s2.y), max(s1.z, s2.z));
    if (m2 < 0 || m1 > m2) {
        return null;
    }
    const distance = (m1 < 0) ? m2 : m1;
    const contact = vec3_1.vec3.add(origin, direction).scale(distance);
    return { contact, normal: direction, distance };
};
exports.collideRayWithCuboid = collideRayWithCuboid;


/***/ }),

/***/ "./src/collisions/sphere.ts":
/*!**********************************!*\
  !*** ./src/collisions/sphere.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collideSphereWithCuboid = exports.collideSphereWithSphere = void 0;
const vec3_1 = __webpack_require__(/*! ../../../vectors/src/vec3 */ "../vectors/src/vec3.ts");
const { sqrt, min, max } = Math;
const collideSphereWithSphere = (s1, s2, t1, t2) => {
    const d = vec3_1.vec3.subtract(s2.center, s1.center);
    const d2 = d.squaredLength;
    const s = s1.radius + s2.radius;
    if (d2 > s * s) {
        return null;
    }
    const t = Math.sqrt(d2);
    const normal = d.normalize();
    const contact = vec3_1.vec3.add(s1.center, vec3_1.vec3.scale(normal, s1.radius));
    return { contact, normal, distance: t - s };
};
exports.collideSphereWithSphere = collideSphereWithSphere;
const collideSphereWithCuboid = (sphere, cuboid, t1, t2) => {
    const { center, radius } = sphere;
    const { maximum, minimum } = cuboid;
    const r2 = radius * radius;
    const p = new vec3_1.vec3([
        max(minimum.x, min(center.x, maximum.x)),
        max(minimum.y, min(center.y, maximum.y)),
        max(minimum.z, min(center.z, maximum.z))
    ]);
    const d = vec3_1.vec3.subtract(p, center);
    const d2 = vec3_1.vec3.dot(d, d);
    if (d2 > r2) {
        return null;
    }
    const normal = vec3_1.vec3.normalize(d);
    const contact = vec3_1.vec3.add(center, vec3_1.vec3.scale(normal, radius));
    return { contact, normal, distance: sqrt(r2 - d2) };
};
exports.collideSphereWithCuboid = collideSphereWithCuboid;


/***/ }),

/***/ "./src/transform.ts":
/*!**************************!*\
  !*** ./src/transform.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Transform = void 0;
const mat4_1 = __webpack_require__(/*! ../../vectors/src/mat4 */ "../vectors/src/mat4.ts");
const quat_1 = __webpack_require__(/*! ../../vectors/src/quat */ "../vectors/src/quat.ts");
const vec3_1 = __webpack_require__(/*! ../../vectors/src/vec3 */ "../vectors/src/vec3.ts");
class Transform {
    constructor({ translation = vec3_1.vec3.zero, rotation = quat_1.quat.identity } = {}) {
        this.translation = translation.copy();
        this.rotation = rotation.copy();
        this.update();
    }
    update() {
        mat4_1.mat4.construct(this.rotation, this.translation, this.modelMatrix);
        this.modelMatrix.toMat3(this.rotationMatrix);
        this.modelMatrix.invert(this.inverseTransposeMatrix).transpose();
    }
}
exports.Transform = Transform;
Transform.origin = new Transform();


/***/ }),

/***/ "./src/world.ts":
/*!**********************!*\
  !*** ./src/world.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.World = void 0;
const vec3_1 = __webpack_require__(/*! ../../vectors/src/vec3 */ "../vectors/src/vec3.ts");
class World {
    constructor() {
        this.bodies = [];
        this.collisions = [];
        this.gravity = new vec3_1.vec3([0, -9.81, 0]);
    }
    update(deltaTime) {
        this.applyGravity();
        this.detectCollisions();
        this.resolveCollisions();
        this.updateBodies(deltaTime);
    }
    applyGravity() {
        this.bodies.forEach((body) => {
            body.force.add(vec3_1.vec3.scale(this.gravity, body.mass));
        });
    }
    detectCollisions() {
        this.collisions.length = 0;
        this.bodies.forEach((a) => {
            this.bodies.forEach((b) => {
                if (a === b) {
                    return;
                }
                const collision = a.collider.collide(b.collider, a.transform, b.transform);
                if (collision) {
                    this.collisions.push(Object.assign(Object.assign({}, collision), { bodies: [a, b] }));
                }
            });
        });
    }
    resolveCollisions() {
        this.collisions.forEach((collision) => {
            const a = collision.bodies[0];
            const b = collision.bodies[1];
            const d = vec3_1.vec3.subtract(b.velocity, a.velocity);
            const n = vec3_1.vec3.dot(d, collision.normal);
            const m1 = 1.0 / a.mass;
            const m2 = 1.0 / b.mass;
            if (n >= 0) {
                return;
            }
            const j = -1.0 * n / (m1 + m2);
            const impulse = vec3_1.vec3.scale(collision.normal, j);
            a.velocity.subtract(vec3_1.vec3.scale(impulse, m1));
            b.velocity.add(vec3_1.vec3.scale(impulse, m2));
        });
    }
    updateBodies(deltaTime) {
        this.bodies.forEach((body) => {
            body.velocity.add(vec3_1.vec3.scale(body.force, body.mass).scale(deltaTime));
            body.transform.translation.add(vec3_1.vec3.scale(body.velocity, deltaTime));
            body.force.reset();
        });
    }
}
exports.World = World;


/***/ }),

/***/ "../vectors/src/constants.ts":
/*!***********************************!*\
  !*** ../vectors/src/constants.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Epsilon = void 0;
exports.Epsilon = 0.00001;


/***/ }),

/***/ "../vectors/src/mat3.ts":
/*!******************************!*\
  !*** ../vectors/src/mat3.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mat3 = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../vectors/src/constants.ts");
const mat4_1 = __webpack_require__(/*! ./mat4 */ "../vectors/src/mat4.ts");
const quat_1 = __webpack_require__(/*! ./quat */ "../vectors/src/quat.ts");
const vec3_1 = __webpack_require__(/*! ./vec3 */ "../vectors/src/vec3.ts");
class mat3 extends Float32Array {
    constructor(values = [
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    ]) {
        super(values.slice(0, 9));
    }
    get determinant() {
        const v00 = this[0];
        const v01 = this[1];
        const v02 = this[2];
        const v10 = this[3];
        const v11 = this[4];
        const v12 = this[5];
        const v20 = this[6];
        const v21 = this[7];
        const v22 = this[8];
        const det01 = v22 * v11 - v12 * v21;
        const det11 = -v22 * v10 + v12 * v20;
        const det21 = v21 * v10 - v11 * v20;
        return v00 * det01 + v01 * det11 + v02 * det21;
    }
    copy(dest = null) {
        if (!dest) {
            dest = new mat3();
        }
        for (let i = 0; i < 9; i++) {
            dest[i] = this[i];
        }
        return dest;
    }
    row(index, dest = null) {
        if (!dest) {
            dest = new vec3_1.vec3();
        }
        dest.x = this[index * 3];
        dest.y = this[index * 3 + 1];
        dest.z = this[index * 3 + 2];
        return dest;
    }
    column(index, dest = null) {
        if (!dest) {
            dest = new vec3_1.vec3();
        }
        dest.x = this[index];
        dest.y = this[index + 3];
        dest.z = this[index + 6];
        return dest;
    }
    equals(other, threshold = constants_1.Epsilon) {
        for (let i = 0; i < 9; i++) {
            if (Math.abs(this[i] - other[i]) > threshold) {
                return false;
            }
        }
        return true;
    }
    reset() {
        this[0] = 1.0;
        this[1] = 0.0;
        this[2] = 0.0;
        this[3] = 0.0;
        this[4] = 1.0;
        this[5] = 0.0;
        this[6] = 0.0;
        this[7] = 0.0;
        this[8] = 1.0;
        return this;
    }
    transpose(dest = null) {
        if (!dest) {
            dest = this;
        }
        const t00 = this[0];
        const t01 = this[1];
        const t02 = this[2];
        const t10 = this[3];
        const t11 = this[4];
        const t12 = this[5];
        const t20 = this[6];
        const t21 = this[7];
        const t22 = this[8];
        dest[0] = t00;
        dest[1] = t10;
        dest[2] = t20;
        dest[3] = t01;
        dest[4] = t11;
        dest[5] = t21;
        dest[6] = t02;
        dest[7] = t12;
        dest[8] = t22;
        return dest;
    }
    invert(dest = null) {
        if (!dest) {
            dest = this;
        }
        const v00 = this[0];
        const v01 = this[1];
        const v02 = this[2];
        const v10 = this[3];
        const v11 = this[4];
        const v12 = this[5];
        const v20 = this[6];
        const v21 = this[7];
        const v22 = this[8];
        const det01 = v22 * v11 - v12 * v21;
        const det11 = -v22 * v10 + v12 * v20;
        const det21 = v21 * v10 - v11 * v20;
        let det = v00 * det01 + v01 * det11 + v02 * det21;
        if (det === 0.0) {
            return null;
        }
        det = 1.0 / det;
        dest[0] = det01 * det;
        dest[1] = (-v22 * v01 + v02 * v21) * det;
        dest[2] = (v12 * v01 - v02 * v11) * det;
        dest[3] = det11 * det;
        dest[4] = (v22 * v00 - v02 * v20) * det;
        dest[5] = (-v12 * v00 + v02 * v10) * det;
        dest[6] = det21 * det;
        dest[7] = (-v21 * v00 + v01 * v20) * det;
        dest[8] = (v11 * v00 - v01 * v10) * det;
        return dest;
    }
    multiply(other, dest = null) {
        if (!dest) {
            dest = this;
        }
        const a00 = this[0];
        const a01 = this[1];
        const a02 = this[2];
        const a10 = this[3];
        const a11 = this[4];
        const a12 = this[5];
        const a20 = this[6];
        const a21 = this[7];
        const a22 = this[8];
        const b00 = other[0];
        const b01 = other[1];
        const b02 = other[2];
        const b10 = other[3];
        const b11 = other[4];
        const b12 = other[5];
        const b20 = other[6];
        const b21 = other[7];
        const b22 = other[8];
        dest[0] = b00 * a00 + b01 * a10 + b02 * a20;
        dest[1] = b00 * a01 + b01 * a11 + b02 * a21;
        dest[2] = b00 * a02 + b01 * a12 + b02 * a22;
        dest[3] = b10 * a00 + b11 * a10 + b12 * a20;
        dest[4] = b10 * a01 + b11 * a11 + b12 * a21;
        dest[5] = b10 * a02 + b11 * a12 + b12 * a22;
        dest[6] = b20 * a00 + b21 * a10 + b22 * a20;
        dest[7] = b20 * a01 + b21 * a11 + b22 * a21;
        dest[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return dest;
    }
    transform(vector, dest = null) {
        if (!dest) {
            dest = new vec3_1.vec3();
        }
        const { x, y, z } = vector;
        dest.x = x * this[0] + y * this[3] + z * this[6];
        dest.y = x * this[1] + y * this[4] + z * this[7];
        dest.z = x * this[2] + y * this[5] + z * this[8];
        return dest;
    }
    rotate(angle, axis, dest = null) {
        if (!dest) {
            dest = this;
        }
        let { x, y, z } = axis;
        let length = Math.sqrt(x * x + y * y + z * z);
        if (!length) {
            return null;
        }
        if (length !== 1) {
            length = 1 / length;
            x *= length;
            y *= length;
            z *= length;
        }
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const t = 1.0 - c;
        const a00 = this[0];
        const a01 = this[1];
        const a02 = this[2];
        const a10 = this[3];
        const a11 = this[4];
        const a12 = this[5];
        const a20 = this[6];
        const a21 = this[7];
        const a22 = this[8];
        const b00 = x * x * t + c;
        const b01 = y * x * t + z * s;
        const b02 = z * x * t - y * s;
        const b10 = x * y * t - z * s;
        const b11 = y * y * t + c;
        const b12 = z * y * t + x * s;
        const b20 = x * z * t + y * s;
        const b21 = y * z * t - x * s;
        const b22 = z * z * t + c;
        dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
        dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
        dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
        dest[3] = a00 * b10 + a10 * b11 + a20 * b12;
        dest[4] = a01 * b10 + a11 * b11 + a21 * b12;
        dest[5] = a02 * b10 + a12 * b11 + a22 * b12;
        dest[6] = a00 * b20 + a10 * b21 + a20 * b22;
        dest[7] = a01 * b20 + a11 * b21 + a21 * b22;
        dest[8] = a02 * b20 + a12 * b21 + a22 * b22;
        return dest;
    }
    toMat4(dest = null) {
        if (!dest) {
            dest = new mat4_1.mat4();
        }
        dest.set([
            this[0],
            this[1],
            this[2],
            0.0,
            this[3],
            this[4],
            this[5],
            0.0,
            this[6],
            this[7],
            this[8],
            0.0,
            0.0,
            0.0,
            0.0,
            1.0
        ]);
        return dest;
    }
    toQuat(dest = null) {
        if (!dest) {
            dest = new quat_1.quat();
        }
        const v00 = this[0];
        const v01 = this[1];
        const v02 = this[2];
        const v10 = this[3];
        const v11 = this[4];
        const v12 = this[5];
        const v20 = this[6];
        const v21 = this[7];
        const v22 = this[8];
        const x = v00 - v11 - v22;
        const y = v11 - v00 - v22;
        const z = v22 - v00 - v11;
        const w = v00 + v11 + v22;
        let i = 0;
        let f = w;
        if (x > f) {
            f = x;
            i = 1;
        }
        if (y > f) {
            f = y;
            i = 2;
        }
        if (z > f) {
            f = z;
            i = 3;
        }
        const b = Math.sqrt(f + 1) * 0.5;
        const m = 0.25 / b;
        switch (i) {
            case 0:
                dest.w = b;
                dest.x = (v12 - v21) * m;
                dest.y = (v20 - v02) * m;
                dest.z = (v01 - v10) * m;
                break;
            case 1:
                dest.w = (v12 - v21) * m;
                dest.x = b;
                dest.y = (v01 + v10) * m;
                dest.z = (v20 + v02) * m;
                break;
            case 2:
                dest.w = (v20 - v02) * m;
                dest.x = (v01 + v10) * m;
                dest.y = b;
                dest.z = (v12 + v21) * m;
                break;
            case 3:
                dest.w = (v01 - v10) * m;
                dest.x = (v20 + v02) * m;
                dest.y = (v12 + v21) * m;
                dest.z = b;
                break;
        }
        return dest;
    }
    static multiply(m1, m2, dest = null) {
        if (!dest) {
            dest = new mat3();
        }
        const a00 = m1[0];
        const a01 = m1[1];
        const a02 = m1[2];
        const a10 = m1[3];
        const a11 = m1[4];
        const a12 = m1[5];
        const a20 = m1[6];
        const a21 = m1[7];
        const a22 = m1[8];
        const b00 = m2[0];
        const b01 = m2[1];
        const b02 = m2[2];
        const b10 = m2[3];
        const b11 = m2[4];
        const b12 = m2[5];
        const b20 = m2[6];
        const b21 = m2[7];
        const b22 = m2[8];
        dest.set([
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22
        ]);
        return dest;
    }
    static lookAt(eye, target, up = vec3_1.vec3.up, dest = null) {
        if (!dest) {
            dest = new mat3();
        }
        if (eye.equals(target)) {
            return this.identity.copy(dest);
        }
        const z = vec3_1.vec3.subtract(eye, target).normalize();
        const x = vec3_1.vec3.cross(up, z).normalize();
        const y = vec3_1.vec3.cross(z, x).normalize();
        dest.set([
            x.x,
            x.y,
            x.z,
            y.x,
            y.y,
            y.z,
            z.x,
            z.y,
            z.z
        ]);
        return dest;
    }
}
exports.mat3 = mat3;
mat3.identity = new mat3();


/***/ }),

/***/ "../vectors/src/mat4.ts":
/*!******************************!*\
  !*** ../vectors/src/mat4.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mat4 = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../vectors/src/constants.ts");
const mat3_1 = __webpack_require__(/*! ./mat3 */ "../vectors/src/mat3.ts");
const vec3_1 = __webpack_require__(/*! ./vec3 */ "../vectors/src/vec3.ts");
const vec4_1 = __webpack_require__(/*! ./vec4 */ "../vectors/src/vec4.ts");
class mat4 extends Float32Array {
    constructor(values = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]) {
        super(values.slice(0, 16));
    }
    get determinant() {
        const v00 = this[0];
        const v01 = this[1];
        const v02 = this[2];
        const v03 = this[3];
        const v10 = this[4];
        const v11 = this[5];
        const v12 = this[6];
        const v13 = this[7];
        const v20 = this[8];
        const v21 = this[9];
        const v22 = this[10];
        const v23 = this[11];
        const v30 = this[12];
        const v31 = this[13];
        const v32 = this[14];
        const v33 = this[15];
        const det00 = v00 * v11 - v01 * v10;
        const det01 = v00 * v12 - v02 * v10;
        const det02 = v00 * v13 - v03 * v10;
        const det03 = v01 * v12 - v02 * v11;
        const det04 = v01 * v13 - v03 * v11;
        const det05 = v02 * v13 - v03 * v12;
        const det06 = v20 * v31 - v21 * v30;
        const det07 = v20 * v32 - v22 * v30;
        const det08 = v20 * v33 - v23 * v30;
        const det09 = v21 * v32 - v22 * v31;
        const det10 = v21 * v33 - v23 * v31;
        const det11 = v22 * v33 - v23 * v32;
        return det00 * det11 - det01 * det10 + det02 * det09 + det03 * det08 - det04 * det07 + det05 * det06;
    }
    copy(dest = null) {
        if (!dest) {
            dest = new mat4();
        }
        for (let i = 0; i < 16; i++) {
            dest[i] = this[i];
        }
        return dest;
    }
    column(index, dest = null) {
        if (!dest) {
            dest = new vec4_1.vec4();
        }
        dest.x = this[index];
        dest.y = this[index + 4];
        dest.z = this[index + 8];
        dest.w = this[index + 12];
        return dest;
    }
    equals(other, threshold = constants_1.Epsilon) {
        for (let i = 0; i < 16; i++) {
            if (Math.abs(this[i] - other[i]) > threshold) {
                return false;
            }
        }
        return true;
    }
    reset() {
        this[0] = 1.0;
        this[1] = 0.0;
        this[2] = 0.0;
        this[3] = 0.0;
        this[4] = 0.0;
        this[5] = 1.0;
        this[6] = 0.0;
        this[7] = 0.0;
        this[8] = 0.0;
        this[9] = 0.0;
        this[10] = 1.0;
        this[11] = 0.0;
        this[12] = 0.0;
        this[13] = 0.0;
        this[14] = 0.0;
        this[15] = 1.0;
        return this;
    }
    transpose(dest = null) {
        if (!dest) {
            dest = this;
        }
        const t01 = this[1];
        const t02 = this[2];
        const t03 = this[3];
        const t12 = this[6];
        const t13 = this[7];
        const t23 = this[11];
        dest[1] = this[4];
        dest[2] = this[8];
        dest[3] = this[12];
        dest[4] = t01;
        dest[6] = this[9];
        dest[7] = this[13];
        dest[8] = t02;
        dest[9] = t12;
        dest[11] = this[14];
        dest[12] = t03;
        dest[13] = t13;
        dest[14] = t23;
        if (dest !== this) {
            dest[0] = this[0];
            dest[5] = this[5];
            dest[10] = this[10];
            dest[15] = this[15];
        }
        return dest;
    }
    invert(dest = null) {
        if (!dest) {
            dest = this;
        }
        const v00 = this[0];
        const v01 = this[1];
        const v02 = this[2];
        const v03 = this[3];
        const v10 = this[4];
        const v11 = this[5];
        const v12 = this[6];
        const v13 = this[7];
        const v20 = this[8];
        const v21 = this[9];
        const v22 = this[10];
        const v23 = this[11];
        const v30 = this[12];
        const v31 = this[13];
        const v32 = this[14];
        const v33 = this[15];
        const d00 = v00 * v11 - v01 * v10;
        const d01 = v00 * v12 - v02 * v10;
        const d02 = v00 * v13 - v03 * v10;
        const d03 = v01 * v12 - v02 * v11;
        const d04 = v01 * v13 - v03 * v11;
        const d05 = v02 * v13 - v03 * v12;
        const d06 = v20 * v31 - v21 * v30;
        const d07 = v20 * v32 - v22 * v30;
        const d08 = v20 * v33 - v23 * v30;
        const d09 = v21 * v32 - v22 * v31;
        const d10 = v21 * v33 - v23 * v31;
        const d11 = v22 * v33 - v23 * v32;
        let d = d00 * d11 - d01 * d10 + d02 * d09 + d03 * d08 - d04 * d07 + d05 * d06;
        if (d === 0.0) {
            return null;
        }
        d = 1.0 / d;
        dest[0] = (v11 * d11 - v12 * d10 + v13 * d09) * d;
        dest[1] = (-v01 * d11 + v02 * d10 - v03 * d09) * d;
        dest[2] = (v31 * d05 - v32 * d04 + v33 * d03) * d;
        dest[3] = (-v21 * d05 + v22 * d04 - v23 * d03) * d;
        dest[4] = (-v10 * d11 + v12 * d08 - v13 * d07) * d;
        dest[5] = (v00 * d11 - v02 * d08 + v03 * d07) * d;
        dest[6] = (-v30 * d05 + v32 * d02 - v33 * d01) * d;
        dest[7] = (v20 * d05 - v22 * d02 + v23 * d01) * d;
        dest[8] = (v10 * d10 - v11 * d08 + v13 * d06) * d;
        dest[9] = (-v00 * d10 + v01 * d08 - v03 * d06) * d;
        dest[10] = (v30 * d04 - v31 * d02 + v33 * d00) * d;
        dest[11] = (-v20 * d04 + v21 * d02 - v23 * d00) * d;
        dest[12] = (-v10 * d09 + v11 * d07 - v12 * d06) * d;
        dest[13] = (v00 * d09 - v01 * d07 + v02 * d06) * d;
        dest[14] = (-v30 * d03 + v31 * d01 - v32 * d00) * d;
        dest[15] = (v20 * d03 - v21 * d01 + v22 * d00) * d;
        return dest;
    }
    multiply(other, dest = null) {
        if (!dest) {
            dest = this;
        }
        const a00 = this[0];
        const a01 = this[1];
        const a02 = this[2];
        const a03 = this[3];
        const a10 = this[4];
        const a11 = this[5];
        const a12 = this[6];
        const a13 = this[7];
        const a20 = this[8];
        const a21 = this[9];
        const a22 = this[10];
        const a23 = this[11];
        const a30 = this[12];
        const a31 = this[13];
        const a32 = this[14];
        const a33 = this[15];
        const b00 = other[0];
        const b01 = other[1];
        const b02 = other[2];
        const b03 = other[3];
        const b10 = other[4];
        const b11 = other[5];
        const b12 = other[6];
        const b13 = other[7];
        const b20 = other[8];
        const b21 = other[9];
        const b22 = other[10];
        const b23 = other[11];
        const b30 = other[12];
        const b31 = other[13];
        const b32 = other[14];
        const b33 = other[15];
        dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
        return dest;
    }
    transform(vector, dest = null) {
        if (!dest) {
            dest = new vec4_1.vec4();
        }
        const { x, y, z, w } = vector;
        dest.x = this[0] * x + this[4] * y + this[8] * z + this[12] * w;
        dest.y = this[1] * x + this[5] * y + this[9] * z + this[13] * w;
        dest.z = this[2] * x + this[6] * y + this[10] * z + this[14] * w;
        dest.w = this[3] * x + this[7] * y + this[11] * z + this[15] * w;
        return dest;
    }
    transformVec3(vector, dest = null) {
        if (!dest) {
            dest = new vec3_1.vec3();
        }
        const { x, y, z } = vector;
        dest.x = this[0] * x + this[4] * y + this[8] * z + this[12];
        dest.y = this[1] * x + this[5] * y + this[9] * z + this[13];
        dest.z = this[2] * x + this[6] * y + this[10] * z + this[14];
        return dest;
    }
    toMat3(dest = null) {
        if (!dest) {
            dest = new mat3_1.mat3();
        }
        dest.set([
            this[0],
            this[1],
            this[2],
            this[4],
            this[5],
            this[6],
            this[8],
            this[9],
            this[10]
        ]);
        return dest;
    }
    scale(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        const { x, y, z } = vector;
        dest[0] = this[0] * x;
        dest[1] = this[1] * x;
        dest[2] = this[2] * x;
        dest[3] = this[3] * x;
        dest[4] = this[4] * y;
        dest[5] = this[5] * y;
        dest[6] = this[6] * y;
        dest[7] = this[7] * y;
        dest[8] = this[8] * z;
        dest[9] = this[9] * z;
        dest[10] = this[10] * z;
        dest[11] = this[11] * z;
        if (dest !== this) {
            dest[12] = this[12];
            dest[13] = this[13];
            dest[14] = this[14];
            dest[15] = this[15];
        }
        return dest;
    }
    rotate(angle, axis, dest = null) {
        if (!dest) {
            dest = this;
        }
        let { x, y, z } = axis;
        let length = Math.sqrt(x * x + y * y + z * z);
        if (!length) {
            return null;
        }
        if (length !== 1) {
            length = 1 / length;
            x *= length;
            y *= length;
            z *= length;
        }
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const t = 1.0 - c;
        const a00 = this[0];
        const a01 = this[1];
        const a02 = this[2];
        const a03 = this[3];
        const a10 = this[4];
        const a11 = this[5];
        const a12 = this[6];
        const a13 = this[7];
        const a20 = this[8];
        const a21 = this[9];
        const a22 = this[10];
        const a23 = this[11];
        const b00 = x * x * t + c;
        const b01 = y * x * t + z * s;
        const b02 = z * x * t - y * s;
        const b10 = x * y * t - z * s;
        const b11 = y * y * t + c;
        const b12 = z * y * t + x * s;
        const b20 = x * z * t + y * s;
        const b21 = y * z * t - x * s;
        const b22 = z * z * t + c;
        dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
        dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
        dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
        dest[3] = a03 * b00 + a13 * b01 + a23 * b02;
        dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
        dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
        dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
        dest[7] = a03 * b10 + a13 * b11 + a23 * b12;
        dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
        dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
        dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
        dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
        if (dest !== this) {
            dest[12] = this[12];
            dest[13] = this[13];
            dest[14] = this[14];
            dest[15] = this[15];
        }
        return dest;
    }
    translate(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;
        if (dest !== this) {
            for (let it = 0; it < 12; it++) {
                dest[it] = this[it];
            }
        }
        dest[12] = this[12] + this[0] * x + this[4] * y + this[8] * z;
        dest[13] = this[13] + this[1] * x + this[5] * y + this[9] * z;
        dest[14] = this[14] + this[2] * x + this[6] * y + this[10] * z;
        dest[15] = this[15] + this[3] * x + this[7] * y + this[11] * z;
        return dest;
    }
    decompose(translation, rotation, scaling = null) {
        const v00 = this[0];
        const v01 = this[1];
        const v02 = this[2];
        const v10 = this[4];
        const v11 = this[5];
        const v12 = this[6];
        const v20 = this[8];
        const v21 = this[9];
        const v22 = this[10];
        const v30 = this[12];
        const v31 = this[13];
        const v32 = this[14];
        if (scaling !== null) {
            scaling.x = Math.sqrt(v00 * v00 + v01 * v01 + v02 * v02);
            scaling.y = Math.sqrt(v10 * v10 + v11 * v11 + v12 * v12);
            scaling.z = Math.sqrt(v20 * v20 + v21 * v21 + v22 * v22);
        }
        rotation.set([v00, v01, v02, v10, v11, v12, v20, v21, v22]);
        translation.xyz = [v30, v31, v32];
    }
    static construct(rotation, translation, dest = null) {
        if (!dest) {
            dest = new mat4();
        }
        const qx = rotation.x;
        const qy = rotation.y;
        const qz = rotation.z;
        const qw = rotation.w;
        const vx = translation.x;
        const vy = translation.y;
        const vz = translation.z;
        const x2 = qx + qx;
        const y2 = qy + qy;
        const z2 = qz + qz;
        const xx = qx * x2;
        const xy = qx * y2;
        const xz = qx * z2;
        const yy = qy * y2;
        const yz = qy * z2;
        const zz = qz * z2;
        const wx = qw * x2;
        const wy = qw * y2;
        const wz = qw * z2;
        dest.set([
            1.0 - (yy + zz),
            xy + wz,
            xz - wy,
            0.0,
            xy - wz,
            1.0 - (xx + zz),
            yz + wx,
            0.0,
            xz + wy,
            yz - wx,
            1.0 - (xx + yy),
            0.0,
            vx,
            vy,
            vz,
            1.0
        ]);
        return dest;
    }
    static multiply(m1, m2, dest = null) {
        if (!dest) {
            dest = new mat4();
        }
        const a00 = m1[0];
        const a01 = m1[1];
        const a02 = m1[2];
        const a03 = m1[3];
        const a10 = m1[4];
        const a11 = m1[5];
        const a12 = m1[6];
        const a13 = m1[7];
        const a20 = m1[8];
        const a21 = m1[9];
        const a22 = m1[10];
        const a23 = m1[11];
        const a30 = m1[12];
        const a31 = m1[13];
        const a32 = m1[14];
        const a33 = m1[15];
        const b00 = m2[0];
        const b01 = m2[1];
        const b02 = m2[2];
        const b03 = m2[3];
        const b10 = m2[4];
        const b11 = m2[5];
        const b12 = m2[6];
        const b13 = m2[7];
        const b20 = m2[8];
        const b21 = m2[9];
        const b22 = m2[10];
        const b23 = m2[11];
        const b30 = m2[12];
        const b31 = m2[13];
        const b32 = m2[14];
        const b33 = m2[15];
        dest.set([
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
        ]);
        return dest;
    }
    static frustum(left, right, bottom, top, near, far, dest = null) {
        if (!dest) {
            dest = new mat4();
        }
        const rl = right - left;
        const tb = top - bottom;
        const fn = far - near;
        dest.set([
            (near * 2.0) / rl,
            0.0,
            0.0,
            0.0,
            0.0,
            (near * 2.0) / tb,
            0.0,
            0.0,
            (right + left) / rl,
            (top + bottom) / tb,
            -(far + near) / fn,
            -1.0,
            0.0,
            0.0,
            -(far * near * 2.0) / fn,
            0.0
        ]);
        return dest;
    }
    static perspective(fov, aspect, near, far, dest = null) {
        if (!dest) {
            dest = new mat4();
        }
        const top = near * Math.tan((fov * Math.PI) / 360.0);
        const right = top * aspect;
        return mat4.frustum(-right, right, -top, top, near, far, dest);
    }
    static orthographic(left, right, bottom, top, near, far, dest = null) {
        if (!dest) {
            dest = new mat4();
        }
        const rl = right - left;
        const tb = top - bottom;
        const fn = far - near;
        dest.set([
            2.0 / rl,
            0.0,
            0.0,
            0.0,
            0.0,
            2 / tb,
            0.0,
            0.0,
            0.0,
            0.0,
            -2.0 / fn,
            0.0,
            -(left + right) / rl,
            -(top + bottom) / tb,
            -(far + near) / fn,
            1.0
        ]);
        return dest;
    }
    static reflection(plane, dest) {
        if (!dest) {
            dest = new mat4();
        }
        const xx = plane.x * plane.x;
        const xy = plane.x * plane.y;
        const xz = plane.x * plane.z;
        const xw = plane.x * plane.w;
        const yy = plane.y * plane.y;
        const yz = plane.y * plane.z;
        const yw = plane.y * plane.w;
        const zz = plane.z * plane.z;
        const zw = plane.z * plane.w;
        dest.set([
            1.0 - 2.0 * xx,
            -2.0 * xy,
            -2.0 * xz,
            -2.0 * xw,
            -2.0 * xy,
            1.0 - 2.0 * yy,
            -2.0 * yz,
            -2.0 * yw,
            -2.0 * xz,
            -2.0 * yz,
            1.0 - 2.0 * zz,
            -2.0 * zw,
            0.0,
            0.0,
            0.0,
            1.0
        ]);
        return dest;
    }
    static lookAt(eye, target, up = vec3_1.vec3.up, dest = null) {
        if (!dest) {
            dest = new mat4();
        }
        if (eye.equals(target)) {
            return this.identity.copy(dest);
        }
        const z = vec3_1.vec3.subtract(eye, target).normalize();
        const x = vec3_1.vec3.cross(up, z).normalize();
        const y = vec3_1.vec3.cross(z, x).normalize();
        dest.set([
            x.x,
            x.y,
            x.z,
            0.0,
            y.x,
            y.y,
            y.z,
            0.0,
            z.x,
            z.y,
            z.z,
            0.0,
            eye.x,
            eye.y,
            eye.z,
            1.0
        ]);
        return dest;
    }
}
exports.mat4 = mat4;
mat4.identity = new mat4();


/***/ }),

/***/ "../vectors/src/quat.ts":
/*!******************************!*\
  !*** ../vectors/src/quat.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.quat = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../vectors/src/constants.ts");
const mat3_1 = __webpack_require__(/*! ./mat3 */ "../vectors/src/mat3.ts");
const mat4_1 = __webpack_require__(/*! ./mat4 */ "../vectors/src/mat4.ts");
class quat extends Float32Array {
    constructor(values = [0.0, 0.0, 0.0, 1.0]) {
        super(values.slice(0, 4));
    }
    get x() {
        return this[0];
    }
    set x(x) {
        this[0] = x;
    }
    get y() {
        return this[1];
    }
    set y(y) {
        this[1] = y;
    }
    get z() {
        return this[2];
    }
    set z(z) {
        this[2] = z;
    }
    get w() {
        return this[3];
    }
    set w(w) {
        this[3] = w;
    }
    get yaw() {
        return Math.asin(2.0 * (this.x * this.z - this.w * this.y));
    }
    set yaw(yaw) {
        quat.fromEulerAngles(yaw, this.pitch, this.roll, this);
    }
    get pitch() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return Math.atan2(2.0 * (y * z + w * x), w * w - x * x - y * y + z * z);
    }
    set pitch(pitch) {
        quat.fromEulerAngles(this.yaw, pitch, this.roll, this);
    }
    get roll() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return Math.atan2(2.0 * (x * y + w * z), w * w + x * x - y * y - z * z);
    }
    set roll(roll) {
        quat.fromEulerAngles(this.yaw, this.pitch, roll, this);
    }
    get length() {
        return Math.sqrt(this.squaredLength);
    }
    get squaredLength() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return x * x + y * y + z * z + w * w;
    }
    copy(dest = null) {
        if (!dest) {
            dest = new quat();
        }
        for (let i = 0; i < 4; i++) {
            dest[i] = this[i];
        }
        return dest;
    }
    reset() {
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
        this.w = 1.0;
        return this;
    }
    calculateW() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        this.w = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
        return this;
    }
    invert(dest = null) {
        if (!dest) {
            dest = this;
        }
        const dot = quat.dot(this, this);
        if (!dot) {
            dest.set([0.0, 0.0, 0.0, 0.0]);
            return dest;
        }
        const invDot = dot ? 1.0 / dot : 0.0;
        dest.x = this.x * -invDot;
        dest.y = this.y * -invDot;
        dest.z = this.z * -invDot;
        dest.w = this.w * invDot;
        return dest;
    }
    conjugate(dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x * -1;
        dest.y = this.y * -1;
        dest.z = this.z * -1;
        dest.w = this.w;
        return dest;
    }
    normalize(dest = null) {
        if (!dest) {
            dest = this;
        }
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        let length = Math.sqrt(x * x + y * y + z * z + w * w);
        if (!length) {
            dest.x = 0;
            dest.y = 0;
            dest.z = 0;
            dest.w = 0;
            return dest;
        }
        length = 1 / length;
        dest.x = x * length;
        dest.y = y * length;
        dest.z = z * length;
        dest.w = w * length;
        return dest;
    }
    equals(q, threshold = constants_1.Epsilon) {
        if (Math.abs(this.x - q.x) > threshold) {
            return false;
        }
        if (Math.abs(this.y - q.y) > threshold) {
            return false;
        }
        if (Math.abs(this.z - q.z) > threshold) {
            return false;
        }
        if (Math.abs(this.w - q.w) > threshold) {
            return false;
        }
        return true;
    }
    add(other, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x + other.x;
        dest.y = this.y + other.y;
        dest.z = this.z + other.z;
        dest.w = this.w + other.w;
        return dest;
    }
    multiply(other, dest = null) {
        if (!dest) {
            dest = this;
        }
        const q1x = this.x;
        const q1y = this.y;
        const q1z = this.z;
        const q1w = this.w;
        const q2x = other.x;
        const q2y = other.y;
        const q2z = other.z;
        const q2w = other.w;
        dest.x = q1x * q2w + q1w * q2x + q1y * q2z - q1z * q2y;
        dest.y = q1y * q2w + q1w * q2y + q1z * q2x - q1x * q2z;
        dest.z = q1z * q2w + q1w * q2z + q1x * q2y - q1y * q2x;
        dest.w = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z;
        return dest;
    }
    toMat3(dest = null) {
        if (!dest) {
            dest = new mat3_1.mat3();
        }
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        dest.set([
            1.0 - (yy + zz),
            xy + wz,
            xz - wy,
            xy - wz,
            1.0 - (xx + zz),
            yz + wx,
            xz + wy,
            yz - wx,
            1.0 - (xx + yy)
        ]);
        return dest;
    }
    toMat4(dest = null) {
        if (!dest) {
            dest = new mat4_1.mat4();
        }
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;
        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        dest.set([
            1.0 - (yy + zz),
            xy + wz,
            xz - wy,
            0.0,
            xy - wz,
            1.0 - (xx + zz),
            yz + wx,
            0.0,
            xz + wy,
            yz - wx,
            1.0 - (xx + yy),
            0.0,
            0.0,
            0.0,
            0.0,
            1.0
        ]);
        return dest;
    }
    static dot(q1, q2) {
        return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    }
    static add(q1, q2, dest = null) {
        if (!dest) {
            dest = new quat();
        }
        dest.x = q1.x + q2.x;
        dest.y = q1.y + q2.y;
        dest.z = q1.z + q2.z;
        dest.w = q1.w + q2.w;
        return dest;
    }
    static multiply(q1, q2, dest = null) {
        if (!dest) {
            dest = new quat();
        }
        const q1x = q1.x;
        const q1y = q1.y;
        const q1z = q1.z;
        const q1w = q1.w;
        const q2x = q2.x;
        const q2y = q2.y;
        const q2z = q2.z;
        const q2w = q2.w;
        dest.x = q1x * q2w + q1w * q2x + q1y * q2z - q1z * q2y;
        dest.y = q1y * q2w + q1w * q2y + q1z * q2x - q1x * q2z;
        dest.z = q1z * q2w + q1w * q2z + q1x * q2y - q1y * q2x;
        dest.w = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z;
        return dest;
    }
    static cross(q1, q2, dest = null) {
        if (!dest) {
            dest = new quat();
        }
        const q1x = q1.x;
        const q1y = q1.y;
        const q1z = q1.z;
        const q1w = q1.w;
        const q2x = q2.x;
        const q2y = q2.y;
        const q2z = q2.z;
        const q2w = q2.w;
        dest.x = q1w * q2z + q1z * q2w + q1x * q2y - q1y * q2x;
        dest.y = q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z;
        dest.z = q1w * q2x + q1x * q2w + q1y * q2z - q1z * q2y;
        dest.w = q1w * q2y + q1y * q2w + q1z * q2x - q1x * q2z;
        return dest;
    }
    static mix(q1, q2, time, dest = null) {
        if (!dest) {
            dest = new quat();
        }
        if (time <= 0.0) {
            q1.copy(dest);
            return dest;
        }
        else if (time >= 1.0) {
            q2.copy(dest);
            return dest;
        }
        let cos = quat.dot(q1, q2);
        const q2a = q2.copy(dest);
        if (cos < 0.0) {
            q2a.invert();
            cos = -cos;
        }
        let k0;
        let k1;
        if (cos > 1 - constants_1.Epsilon) {
            k0 = 1 - time;
            k1 = 0 + time;
        }
        else {
            const sin = Math.sqrt(1 - cos * cos);
            const angle = Math.atan2(sin, cos);
            const oneOverSin = 1 / sin;
            k0 = Math.sin((1 - time) * angle) * oneOverSin;
            k1 = Math.sin((0 + time) * angle) * oneOverSin;
        }
        dest.x = k0 * q1.x + k1 * q2a.x;
        dest.y = k0 * q1.y + k1 * q2a.y;
        dest.z = k0 * q1.z + k1 * q2a.z;
        dest.w = k0 * q1.w + k1 * q2a.w;
        return dest;
    }
    static fromAxisAngle(axis, angle, dest = null) {
        if (!dest) {
            dest = new quat();
        }
        const a = angle * 0.5;
        const sin = Math.sin(a);
        dest.x = axis.x * sin;
        dest.y = axis.y * sin;
        dest.z = axis.z * sin;
        dest.w = Math.cos(a);
        return dest;
    }
    static fromEulerAngles(yaw, pitch, roll, dest = null) {
        if (!dest) {
            dest = new quat();
        }
        const y = yaw * 0.5;
        const r = roll * 0.5;
        const p = pitch * 0.5;
        const c1 = Math.cos(y);
        const s1 = Math.sin(y);
        const c2 = Math.cos(r);
        const s2 = Math.sin(r);
        const c3 = Math.cos(p);
        const s3 = Math.sin(p);
        const c1c2 = c1 * c2;
        const s1s2 = s1 * s2;
        dest.x = c1c2 * s3 + s1s2 * c3;
        dest.y = s1 * c2 * c3 + c1 * s2 * s3;
        dest.z = c1 * s2 * c3 - s1 * c2 * s3;
        dest.w = c1c2 * c3 - s1s2 * s3;
        return dest;
    }
}
exports.quat = quat;
quat.identity = new quat();


/***/ }),

/***/ "../vectors/src/vec3.ts":
/*!******************************!*\
  !*** ../vectors/src/vec3.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.vec3 = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../vectors/src/constants.ts");
const { abs, sqrt } = Math;
class vec3 extends Float32Array {
    constructor(values = [0.0, 0.0, 0.0]) {
        super(values.slice(0, 3));
    }
    get x() {
        return this[0];
    }
    set x(x) {
        this[0] = x;
    }
    get y() {
        return this[1];
    }
    set y(y) {
        this[1] = y;
    }
    get z() {
        return this[2];
    }
    set z(z) {
        this[2] = z;
    }
    get xyz() {
        return Array.from(this);
    }
    set xyz(xyz) {
        this.set(xyz);
    }
    get r() {
        return this[0];
    }
    set r(r) {
        this[0] = r;
    }
    get g() {
        return this[1];
    }
    set g(g) {
        this[1] = g;
    }
    get b() {
        return this[2];
    }
    set b(b) {
        this[2] = b;
    }
    get rgb() {
        return Array.from(this);
    }
    set rgb(xyz) {
        this.set(xyz);
    }
    get length() {
        return sqrt(this.squaredLength);
    }
    get squaredLength() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return x * x + y * y + z * z;
    }
    reset() {
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
        return this;
    }
    copy(dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = this.x;
        dest.y = this.y;
        dest.z = this.z;
        return dest;
    }
    negate(dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = -this.x;
        dest.y = -this.y;
        dest.z = -this.z;
        return dest;
    }
    equals(vector, threshold = constants_1.Epsilon) {
        if (abs(this.x - vector.x) > threshold) {
            return false;
        }
        if (abs(this.y - vector.y) > threshold) {
            return false;
        }
        if (abs(this.z - vector.z) > threshold) {
            return false;
        }
        return true;
    }
    add(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x + vector.x;
        dest.y = this.y + vector.y;
        dest.z = this.z + vector.z;
        return dest;
    }
    subtract(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x - vector.x;
        dest.y = this.y - vector.y;
        dest.z = this.z - vector.z;
        return dest;
    }
    multiply(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x * vector.x;
        dest.y = this.y * vector.y;
        dest.z = this.z * vector.z;
        return dest;
    }
    divide(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x / vector.x;
        dest.y = this.y / vector.y;
        dest.z = this.z / vector.z;
        return dest;
    }
    scale(scalar, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x * scalar;
        dest.y = this.y * scalar;
        dest.z = this.z * scalar;
        return dest;
    }
    normalize(dest = null) {
        if (!dest) {
            dest = this;
        }
        let length = this.length;
        if (length === 1) {
            return this;
        }
        if (length === 0) {
            dest.x = 0;
            dest.y = 0;
            dest.z = 0;
            return dest;
        }
        length = 1.0 / length;
        dest.x = this.x * length;
        dest.y = this.y * length;
        dest.z = this.z * length;
        return dest;
    }
    reflect(normal, dest = null) {
        if (!dest) {
            dest = this;
        }
        return normal.copy(dest).scale(-2.0 * vec3.dot(this, normal)).add(this);
    }
    transform(matrix, dest = null) {
        if (!dest) {
            dest = this;
        }
        return matrix.transform(this, dest);
    }
    static cross(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;
        const x2 = vector2.x;
        const y2 = vector2.y;
        const z2 = vector2.z;
        dest.x = y * z2 - z * y2;
        dest.y = z * x2 - x * z2;
        dest.z = x * y2 - y * x2;
        return dest;
    }
    static dot(vector, vector2) {
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;
        const x2 = vector2.x;
        const y2 = vector2.y;
        const z2 = vector2.z;
        return x * x2 + y * y2 + z * z2;
    }
    static distance(vector, vector2) {
        return sqrt(this.squaredDistance(vector, vector2));
    }
    static squaredDistance(vector, vector2) {
        const x = vector2.x - vector.x;
        const y = vector2.y - vector.y;
        const z = vector2.z - vector.z;
        return x * x + y * y + z * z;
    }
    static direction(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        const x = vector.x - vector2.x;
        const y = vector.y - vector2.y;
        const z = vector.z - vector2.z;
        let length = sqrt(x * x + y * y + z * z);
        if (length === 0) {
            dest.x = 0;
            dest.y = 0;
            dest.z = 0;
            return dest;
        }
        length = 1 / length;
        dest.x = x * length;
        dest.y = y * length;
        dest.z = z * length;
        return dest;
    }
    static mix(vector, vector2, time, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = vector.x + time * (vector2.x - vector.x);
        dest.y = vector.y + time * (vector2.y - vector.y);
        dest.z = vector.z + time * (vector2.z - vector.z);
        return dest;
    }
    static add(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = vector.x + vector2.x;
        dest.y = vector.y + vector2.y;
        dest.z = vector.z + vector2.z;
        return dest;
    }
    static subtract(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = vector.x - vector2.x;
        dest.y = vector.y - vector2.y;
        dest.z = vector.z - vector2.z;
        return dest;
    }
    static multiply(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = vector.x * vector2.x;
        dest.y = vector.y * vector2.y;
        dest.z = vector.z * vector2.z;
        return dest;
    }
    static divide(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = vector.x / vector2.x;
        dest.y = vector.y / vector2.y;
        dest.z = vector.z / vector2.z;
        return dest;
    }
    static scale(vector, scalar, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        return vector.scale(scalar, dest);
    }
    static normalize(vector, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        return vector.normalize(dest);
    }
}
exports.vec3 = vec3;
vec3.zero = new vec3([0.0, 0.0, 0.0]);
vec3.one = new vec3([1.0, 1.0, 1.0]);
vec3.up = new vec3([0.0, 1.0, 0.0]);
vec3.right = new vec3([1.0, 0.0, 0.0]);
vec3.forward = new vec3([0.0, 0.0, 1.0]);


/***/ }),

/***/ "../vectors/src/vec4.ts":
/*!******************************!*\
  !*** ../vectors/src/vec4.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.vec4 = void 0;
const constants_1 = __webpack_require__(/*! ./constants */ "../vectors/src/constants.ts");
class vec4 extends Float32Array {
    constructor(values = [0.0, 0.0, 0.0, 1.0]) {
        super(values.slice(0, 4));
    }
    get x() {
        return this[0];
    }
    set x(x) {
        this[0] = x;
    }
    get y() {
        return this[1];
    }
    set y(y) {
        this[1] = y;
    }
    get z() {
        return this[2];
    }
    set z(z) {
        this[2] = z;
    }
    get w() {
        return this[3];
    }
    set w(w) {
        this[3] = w;
    }
    get xyzw() {
        return Array.from(this);
    }
    set xyzw(xyzw) {
        this.set(xyzw);
    }
    get r() {
        return this[0];
    }
    set r(r) {
        this[0] = r;
    }
    get g() {
        return this[1];
    }
    set g(g) {
        this[1] = g;
    }
    get b() {
        return this[2];
    }
    set b(b) {
        this[2] = b;
    }
    get a() {
        return this[3];
    }
    set a(a) {
        this[3] = a;
    }
    get rgba() {
        return Array.from(this);
    }
    set rgba(rgba) {
        this.set(rgba);
    }
    get length() {
        return Math.sqrt(this.squaredLength);
    }
    get squaredLength() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        const w = this.w;
        return x * x + y * y + z * z + w * w;
    }
    reset() {
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
        this.w = 1.0;
        return this;
    }
    copy(dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        dest.x = this.x;
        dest.y = this.y;
        dest.z = this.z;
        dest.w = this.w;
        return dest;
    }
    negate(dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = -this.x;
        dest.y = -this.y;
        dest.z = -this.z;
        dest.w = -this.w;
        return dest;
    }
    equals(vector, threshold = constants_1.Epsilon) {
        if (Math.abs(this.x - vector.x) > threshold) {
            return false;
        }
        if (Math.abs(this.y - vector.y) > threshold) {
            return false;
        }
        if (Math.abs(this.z - vector.z) > threshold) {
            return false;
        }
        if (Math.abs(this.w - vector.w) > threshold) {
            return false;
        }
        return true;
    }
    add(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x + vector.x;
        dest.y = this.y + vector.y;
        dest.z = this.z + vector.z;
        dest.w = this.w + vector.w;
        return dest;
    }
    subtract(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x - vector.x;
        dest.y = this.y - vector.y;
        dest.z = this.z - vector.z;
        dest.w = this.w - vector.w;
        return dest;
    }
    multiply(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x * vector.x;
        dest.y = this.y * vector.y;
        dest.z = this.z * vector.z;
        dest.w = this.w * vector.w;
        return dest;
    }
    divide(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x / vector.x;
        dest.y = this.y / vector.y;
        dest.z = this.z / vector.z;
        dest.w = this.w / vector.w;
        return dest;
    }
    scale(scalar, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x * scalar;
        dest.y = this.y * scalar;
        dest.z = this.z * scalar;
        dest.w = this.w * scalar;
        return dest;
    }
    normalize(dest = null) {
        if (!dest) {
            dest = this;
        }
        let length = this.length;
        if (length === 1) {
            return this;
        }
        if (length === 0) {
            dest.x = 0;
            dest.y = 0;
            dest.z = 0;
            dest.w = 0;
            return dest;
        }
        length = 1.0 / length;
        dest.x = this.x * length;
        dest.y = this.y * length;
        dest.z = this.z * length;
        dest.w = this.w * length;
        return dest;
    }
    transform(matrix, dest = null) {
        if (!dest) {
            dest = this;
        }
        return matrix.transform(this, dest);
    }
    static mix(vector, vector2, time, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        dest.x = vector.x + time * (vector2.x - vector.x);
        dest.y = vector.y + time * (vector2.y - vector.y);
        dest.z = vector.z + time * (vector2.z - vector.z);
        dest.w = vector.w + time * (vector2.w - vector.w);
        return dest;
    }
    static add(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        dest.x = vector.x + vector2.x;
        dest.y = vector.y + vector2.y;
        dest.z = vector.z + vector2.z;
        dest.w = vector.w + vector2.w;
        return dest;
    }
    static subtract(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        dest.x = vector.x - vector2.x;
        dest.y = vector.y - vector2.y;
        dest.z = vector.z - vector2.z;
        dest.w = vector.w - vector2.w;
        return dest;
    }
    static multiply(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        dest.x = vector.x * vector2.x;
        dest.y = vector.y * vector2.y;
        dest.z = vector.z * vector2.z;
        dest.w = vector.w * vector2.w;
        return dest;
    }
    static divide(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        dest.x = vector.x / vector2.x;
        dest.y = vector.y / vector2.y;
        dest.z = vector.z / vector2.z;
        dest.w = vector.w / vector2.w;
        return dest;
    }
    static scale(vector, scalar, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        return vector.scale(scalar, dest);
    }
    static normalize(vector, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        return vector.normalize(dest);
    }
}
exports.vec4 = vec4;
vec4.zero = new vec4([0.0, 0.0, 0.0, 1.0]);
vec4.one = new vec4([1.0, 1.0, 1.0, 1.0]);
vec4.up = new vec4([0.0, 1.0, 0.0, 0.0]);
vec4.right = new vec4([1.0, 0.0, 0.0, 0.0]);
vec4.forward = new vec4([0.0, 0.0, 1.0, 0.0]);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Cuboid = exports.Sphere = exports.Plane = exports.Ray = exports.Collider = exports.Transform = exports.World = void 0;
var world_1 = __webpack_require__(/*! ./world */ "./src/world.ts");
Object.defineProperty(exports, "World", ({ enumerable: true, get: function () { return world_1.World; } }));
var transform_1 = __webpack_require__(/*! ./transform */ "./src/transform.ts");
Object.defineProperty(exports, "Transform", ({ enumerable: true, get: function () { return transform_1.Transform; } }));
var collider_1 = __webpack_require__(/*! ./collider */ "./src/collider.ts");
Object.defineProperty(exports, "Collider", ({ enumerable: true, get: function () { return collider_1.Collider; } }));
var ray_1 = __webpack_require__(/*! ./colliders/ray */ "./src/colliders/ray.ts");
Object.defineProperty(exports, "Ray", ({ enumerable: true, get: function () { return ray_1.Ray; } }));
var plane_1 = __webpack_require__(/*! ./colliders/plane */ "./src/colliders/plane.ts");
Object.defineProperty(exports, "Plane", ({ enumerable: true, get: function () { return plane_1.Plane; } }));
var sphere_1 = __webpack_require__(/*! ./colliders/sphere */ "./src/colliders/sphere.ts");
Object.defineProperty(exports, "Sphere", ({ enumerable: true, get: function () { return sphere_1.Sphere; } }));
var cuboid_1 = __webpack_require__(/*! ./colliders/cuboid */ "./src/colliders/cuboid.ts");
Object.defineProperty(exports, "Cuboid", ({ enumerable: true, get: function () { return cuboid_1.Cuboid; } }));

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUVwQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUUzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUUzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcs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QUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQzdCLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQzdCLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQzdCLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDekIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDN0IsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDN0IsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDN0IsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUV6QixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUUzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFH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QyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUlELElBQUksV0FBVztRQUNiLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFFcEIsTUFBTSxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNuQyxNQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ25DLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDbkMsTUFBTSxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNuQyxNQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ25DLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDbkMsTUFBTSxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNuQyxNQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ25DLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDbkMsTUFBTSxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNuQyxNQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ25DLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFbkMsT0FBTyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUs7SUFDdEcsQ0FBQztJQUVELElBQUksQ0FBQyxPQUFvQixJQUFJO1FBQzNCLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7U0FDbEI7UUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzNCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxJQUFJO0lBQ2IsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFhLEVBQUUsT0FBb0IsSUFBSTtRQUM1QyxJ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Q25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFFcEIsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNqQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDakMsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNqQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDakMsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNqQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDakMsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNqQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFakMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBRTdFLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUNiLE9BQU8sSUFBSTtTQUNaO1FBRUQsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBRVgsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ2pELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ2xELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNqRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUVsRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNsRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDakQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDbEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBRWpELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNqRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNsRCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDbEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFFbkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDbkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ2xELElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ25ELElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUVsRCxPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsUUFBUSxDQUFDLEtBQVcsRUFBRSxPQUFvQixJQUFJO1FBQzVDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSTtTQUNaO1FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUVwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBRXJCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN2RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDdkQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ3ZELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUV2RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDdkQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ3ZELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN2RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFdkQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ3ZELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN2RCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDeEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBRXhELElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN4RCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDeEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ3hELElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUV4RCxPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsU0FBUyxDQUFDLE1BQVksRUFBRSxPQUFvQixJQUFJO1FBQzlDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSSxXQUFJLEVBQUU7U0FDbEI7UUFFRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsTUFBTTtRQUU3QixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO1FBQy9ELElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDL0QsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztRQUNoRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO1FBRWhFLE9BQU8sSUFBSTtJQUNiLENBQUM7SUFFRCxhQUFhLENBQUMsTUFBWSxFQUFFLE9BQW9CLElBQUk7UUFDbEQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULElBQUksR0FBRyxJQUFJLFdBQUksRUFBRTtTQUNsQjtRQUVELE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLE1BQU07UUFFMUIsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQzNELElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUMzRCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFFNUQsT0FBTyxJQUFJO0lBQ2IsQ0FBQztJQUVELE1BQU0sQ0FBQyxPQUFvQixJQUFJO1FBQzdCLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSSxXQUFJLEVBQUU7U0FDbEI7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDUCxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRVAsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDUCxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRVAsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDUCxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQ1QsQ0FBQztRQUVGLE9BQU8sSUFBSTtJQUNiLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBWSxFQUFFLE9BQW9CLElBQUk7UUFDMUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULElBQUksR0FBRyxJQUFJO1NBQ1o7UUFFRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxNQUFNO1FBRTFCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNyQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUVyQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNyQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFFckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUNyQixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDdkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO1FBRXZCLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUNqQixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FB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QUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBRTNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDNUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUU1QyxJQUFJLElBQUks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QUFFO1lBQ1QsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1NBQ2xCO1FBRUQsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUVsQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBRWxCLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDUCxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUU3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUU3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUU3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztTQUM5QyxDQUFDO1FBRUYsT0FBTyxJQUFJO0lB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LElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtTQUNsQjtRQUVELE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDNUIsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUM1QixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDNUIsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUM1QixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQzVCLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDNUIsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUM1QixNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBRTVCLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDUCxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUU7WUFDZCxDQUFDLEdBQUcsR0FBRyxFQUFFO1lBQ1QsQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUNULENBQUMsR0FBRyxHQUFHLEVBQUU7WUFFVCxDQUFDLEdBQUcsR0FBRyxFQUFFO1lBQ1QsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFO1lBQ2QsQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUNULENBQUMsR0FBRyxHQUFHLEVBQUU7WUFFVCxDQUFDLEdBQUcsR0FBRyxFQUFFO1lBQ1QsQ0FBQyxHQUFHLEdBQUcsRUFBRTtZQUNULEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRTtZQUNkLENBQUMsR0FBRyxHQUFHLEVBQUU7WUFFVCxHQUFHO1lBQ0gsR0FBRztZQUNI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LENBQUMsR0FBVztRQUNqQixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQ3hELENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDUCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUVoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsS0FBYTtRQUNyQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQ3hELENBQUM7SUFFRCxJQUFJLElBQUk7UUFDTixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUVoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJ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SUFBSTtRQUM3QixJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsSUFBSSxHQUFHLElBQUksV0FBSSxFQUFFO1NBQ2xCO1FBRUQsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFFaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFFaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDakIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDakIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDakIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDakIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDakIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDakIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDakIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDakIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFFakIsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNQLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDZixFQUFFLEdBQUcsRUFBRTtZQUNQLEVBQUUsR0FBRyxFQUFFO1lBQ1AsR0FBRztZQUVILEVBQUUsR0FBRyxFQUFFO1lBQ1AsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNmLEVBQUUsR0FBRyxFQUFFO1lBQ1AsR0FBRztZQUVILEVBQUUsR0FBRyxFQUFFO1lBQ1AsRUFBRSxHQUFHLEVBQUU7WUFDUCxHQUFHLEdB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T0FBRSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbkMsVUFBSyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEMsWUFBTyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7VUNmMUQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7Ozs7Ozs7OztBQ3RCQSxtRUFBK0I7QUFBdEIsb0dBQUs7QUFFZCwrRUFBdUM7QUFBOUIsZ0hBQVM7QUFHbEIsNEVBQXFDO0FBQTVCLDZHQUFRO0FBR2pCLGlGQUFxQztBQUE1Qiw4RkFBRztBQUNaLHVGQUF5QztBQUFoQyxvR0FBSztBQUNkLDBGQUEyQztBQUFsQyx1R0FBTTtBQUNmLDBGQUEyQztBQUFsQyx1R0FBTSIsInNvdXJjZXMiOlsid2VicGFjazovL2NvbGxpc2lvbi93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vY29sbGlzaW9uLy4vc3JjL2NvbGxpZGVyLnRzIiwid2VicGFjazovL2NvbGxpc2lvbi8uL3NyYy9jb2xsaWRlcnMvY3Vib2lkLnRzIiwid2VicGFjazovL2NvbGxpc2lvbi8uL3NyYy9jb2xsaWRlcnMvcGxhbmUudHMiLCJ3ZWJwYWNrOi8vY29sbGlzaW9uLy4vc3JjL2NvbGxpZGVycy9yYXkudHMiLCJ3ZWJwYWNrOi8vY29sbGlzaW9uLy4vc3JjL2NvbGxpZGVycy9zcGhlcmUudHMiLCJ3ZWJwYWNrOi8vY29sbGlzaW9uLy4vc3JjL2NvbGxpc2lvbnMvY3Vib2lkLnRzIiwid2VicGFjazovL2NvbGxpc2lvbi8uL3NyYy9jb2xsaXNpb25zL3BsYW5lLnRzIiwid2VicGFjazovL2NvbGxpc2lvbi8uL3NyYy9jb2xsaXNpb25zL3JheS50cyIsIndlYnBhY2s6Ly9jb2xsaXNpb24vLi9zcmMvY29sbGlzaW9ucy9zcGhlcmUudHMiLCJ3ZWJwYWNrOi8vY29sbGlzaW9uLy4vc3JjL3RyYW5zZm9ybS50cyIsIndlYnBhY2s6Ly9jb2xsaXNpb24vLi9zcmMvd29ybGQudHMiLCJ3ZWJwYWNrOi8vY29sbGlzaW9uLy4uL3ZlY3RvcnMvc3JjL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9jb2xsaXNpb24vLi4vdmVjdG9ycy9zcmMvbWF0My50cyIsIndlYnBhY2s6Ly9jb2xsaXNpb24vLi4vdmVjdG9ycy9zcmMvbWF0NC50cyIsIndlYnBhY2s6Ly9jb2xsaXNpb24vLi4vdmVjdG9ycy9zcmMvcXVhdC50cyIsIndlYnBhY2s6Ly9jb2xsaXNpb24vLi4vdmVjdG9ycy9zcmMvdmVjMy50cyIsIndlYnBhY2s6Ly9jb2xsaXNpb24vLi4vdmVjdG9ycy9zcmMvdmVjNC50cyIsIndlYnBhY2s6Ly9jb2xsaXNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vY29sbGlzaW9uLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImNvbGxpc2lvblwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJjb2xsaXNpb25cIl0gPSBmYWN0b3J5KCk7XG59KShzZWxmLCBmdW5jdGlvbigpIHtcbnJldHVybiAiLCJpbXBvcnQgeyBDb2xsaXNpb24gfSBmcm9tICcuL2NvbGxpc2lvbidcclxuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi90cmFuc2Zvcm0nXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29sbGlkZXIge1xyXG5cclxuICBhYnN0cmFjdCBjb2xsaWRlKGNvbGxpZGVyOiBDb2xsaWRlciwgdDE6IFRyYW5zZm9ybSwgdDI6IFRyYW5zZm9ybSk6IENvbGxpc2lvbiB8IG51bGxcclxuXHJcbiAgYWJzdHJhY3QgdHJhbnNmb3JtKHRyYW5zZm9ybTogVHJhbnNmb3JtKTogQ29sbGlkZXJcclxuXHJcbn1cclxuIiwiaW1wb3J0IHsgY29sbGlkZUN1Ym9pZFdpdGhDdWJvaWQgfSBmcm9tICcuLi9jb2xsaXNpb25zL2N1Ym9pZCdcclxuaW1wb3J0IHsgY29sbGlkZVBsYW5lV2l0aEN1Ym9pZCB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcGxhbmUnXHJcbmltcG9ydCB7IENvbGxpZGVyIH0gZnJvbSAnLi4vY29sbGlkZXInXHJcbmltcG9ydCB7IGNvbGxpZGVSYXlXaXRoQ3Vib2lkIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9yYXknXHJcbmltcG9ydCB7IGNvbGxpZGVTcGhlcmVXaXRoQ3Vib2lkIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9zcGhlcmUnXHJcbmltcG9ydCB7IENvbGxpc2lvbiB9IGZyb20gJy4uL2NvbGxpc2lvbidcclxuaW1wb3J0IHsgUGxhbmUgfSBmcm9tICcuL3BsYW5lJ1xyXG5pbXBvcnQgeyBSYXkgfSBmcm9tICcuL3JheSdcclxuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSAnLi9zcGhlcmUnXHJcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL3RyYW5zZm9ybSdcclxuaW1wb3J0IHsgdmVjMyB9IGZyb20gJy4uLy4uLy4uL3ZlY3RvcnMvc3JjL3ZlYzMnXHJcblxyXG5jb25zdCB7IG1pbiwgbWF4IH0gPSBNYXRoXHJcblxyXG5leHBvcnQgY2xhc3MgQ3Vib2lkIGV4dGVuZHMgQ29sbGlkZXIge1xyXG5cclxuICByZWFkb25seSBtaW5pbXVtOiB2ZWMzXHJcbiAgcmVhZG9ubHkgbWF4aW11bTogdmVjM1xyXG5cclxuICBjb25zdHJ1Y3Rvcih7XHJcbiAgICBtaW5pbXVtID0gdmVjMy5vbmUsXHJcbiAgICBtYXhpbXVtID0gdmVjMy5vbmVcclxuICB9ID0ge30pIHtcclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLm1pbmltdW0gPSBtaW5pbXVtLmNvcHkoKVxyXG4gICAgdGhpcy5tYXhpbXVtID0gbWF4aW11bS5jb3B5KClcclxuICB9XHJcblxyXG4gIGNvbGxpZGUoY29sbGlkZXI6IENvbGxpZGVyLCB0MTogVHJhbnNmb3JtLCB0MjogVHJhbnNmb3JtKTogQ29sbGlzaW9uIHwgbnVsbCB7XHJcbiAgICBpZiAoY29sbGlkZXIgaW5zdGFuY2VvZiBSYXkpIHtcclxuICAgICAgcmV0dXJuIGNvbGxpZGVSYXlXaXRoQ3Vib2lkKGNvbGxpZGVyLCB0aGlzLCB0MSwgdDIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbGxpZGVyIGluc3RhbmNlb2YgUGxhbmUpIHtcclxuICAgICAgcmV0dXJuIGNvbGxpZGVQbGFuZVdpdGhDdWJvaWQoY29sbGlkZXIsIHRoaXMsIHQxLCB0MilcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY29sbGlkZXIgaW5zdGFuY2VvZiBTcGhlcmUpIHtcclxuICAgICAgcmV0dXJuIGNvbGxpZGVTcGhlcmVXaXRoQ3Vib2lkKGNvbGxpZGVyLCB0aGlzLCB0MSwgdDIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbGxpZGVyIGluc3RhbmNlb2YgQ3Vib2lkKSB7XHJcbiAgICAgIHJldHVybiBjb2xsaWRlQ3Vib2lkV2l0aEN1Ym9pZCh0aGlzLCBjb2xsaWRlciwgdDEsIHQyKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm0odHJhbnNmb3JtOiBUcmFuc2Zvcm0pIHtcclxuICAgIGNvbnN0IHsgbW9kZWxNYXRyaXggfSA9IHRyYW5zZm9ybVxyXG5cclxuICAgIGNvbnN0IG1pbmltdW0gPSBtb2RlbE1hdHJpeC50cmFuc2Zvcm1WZWMzKHRoaXMubWluaW11bSlcclxuICAgIGNvbnN0IG1heGltdW0gPSBtb2RlbE1hdHJpeC50cmFuc2Zvcm1WZWMzKHRoaXMubWF4aW11bSlcclxuXHJcbiAgICByZXR1cm4gbmV3IEN1Ym9pZCh7XHJcbiAgICAgIG1pbmltdW06IG5ldyB2ZWMzKFtcclxuICAgICAgICBtaW4obWluaW11bS54LCBtYXhpbXVtLngpLFxyXG4gICAgICAgIG1pbihtaW5pbXVtLnksIG1heGltdW0ueSksXHJcbiAgICAgICAgbWluKG1pbmltdW0ueiwgbWF4aW11bS56KVxyXG4gICAgICBdKSxcclxuICAgICAgbWF4aW11bTogbmV3IHZlYzMoW1xyXG4gICAgICAgIG1heChtaW5pbXVtLngsIG1heGltdW0ueCksXHJcbiAgICAgICAgbWF4KG1pbmltdW0ueSwgbWF4aW11bS55KSxcclxuICAgICAgICBtYXgobWluaW11bS56LCBtYXhpbXVtLnopXHJcbiAgICAgIF0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IHsgY29sbGlkZVBsYW5lV2l0aEN1Ym9pZCwgY29sbGlkZVBsYW5lV2l0aFNwaGVyZSB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcGxhbmUnXHJcbmltcG9ydCB7IENvbGxpZGVyIH0gZnJvbSAnLi4vY29sbGlkZXInXHJcbmltcG9ydCB7IGNvbGxpZGVSYXlXaXRoUGxhbmUgfSBmcm9tICcuLi9jb2xsaXNpb25zL3JheSdcclxuaW1wb3J0IHsgQ29sbGlzaW9uIH0gZnJvbSAnLi4vY29sbGlzaW9uJ1xyXG5pbXBvcnQgeyBDdWJvaWQgfSBmcm9tICcuL2N1Ym9pZCdcclxuaW1wb3J0IHsgUmF5IH0gZnJvbSAnLi9yYXknXHJcbmltcG9ydCB7IFNwaGVyZSB9IGZyb20gJy4vc3BoZXJlJ1xyXG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuLi90cmFuc2Zvcm0nXHJcbmltcG9ydCB7IHZlYzQgfSBmcm9tICcuLi8uLi8uLi92ZWN0b3JzL3NyYy92ZWM0J1xyXG5cclxuZXhwb3J0IGNsYXNzIFBsYW5lIGV4dGVuZHMgQ29sbGlkZXIge1xyXG5cclxuICByZWFkb25seSBlcXVhdGlvbjogdmVjNFxyXG5cclxuICBjb25zdHJ1Y3Rvcih7XHJcbiAgICBlcXVhdGlvbiA9IHZlYzQudXBcclxuICB9ID0ge30pIHtcclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLmVxdWF0aW9uID0gZXF1YXRpb24uY29weSgpXHJcbiAgfVxyXG5cclxuICBjb2xsaWRlKGNvbGxpZGVyOiBDb2xsaWRlciwgdDE6IFRyYW5zZm9ybSwgdDI6IFRyYW5zZm9ybSk6IENvbGxpc2lvbiB8IG51bGwge1xyXG4gICAgaWYgKGNvbGxpZGVyIGluc3RhbmNlb2YgUmF5KSB7XHJcbiAgICAgIHJldHVybiBjb2xsaWRlUmF5V2l0aFBsYW5lKGNvbGxpZGVyLCB0aGlzLCB0MSwgdDIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbGxpZGVyIGluc3RhbmNlb2YgU3BoZXJlKSB7XHJcbiAgICAgIHJldHVybiBjb2xsaWRlUGxhbmVXaXRoU3BoZXJlKHRoaXMsIGNvbGxpZGVyLCB0MSwgdDIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbGxpZGVyIGluc3RhbmNlb2YgQ3Vib2lkKSB7XHJcbiAgICAgIHJldHVybiBjb2xsaWRlUGxhbmVXaXRoQ3Vib2lkKHRoaXMsIGNvbGxpZGVyLCB0MSwgdDIpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIHRyYW5zZm9ybSh0cmFuc2Zvcm06IFRyYW5zZm9ybSkge1xyXG4gICAgY29uc3QgeyBpbnZlcnNlVHJhbnNwb3NlTWF0cml4IH0gPSB0cmFuc2Zvcm1cclxuXHJcbiAgICByZXR1cm4gbmV3IFBsYW5lKHsgXHJcbiAgICAgIGVxdWF0aW9uOiBpbnZlcnNlVHJhbnNwb3NlTWF0cml4LnRyYW5zZm9ybSh0aGlzLmVxdWF0aW9uKSBcclxuICAgIH0pXHJcbiAgfVxyXG5cclxufVxyXG4iLCJpbXBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4uL2NvbGxpZGVyJ1xyXG5pbXBvcnQgeyBDb2xsaXNpb24gfSBmcm9tICcuLi9jb2xsaXNpb24nXHJcblxyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vLi4vLi4vdmVjdG9ycy9zcmMvdmVjMydcclxuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi4vdHJhbnNmb3JtJ1xyXG5pbXBvcnQgeyBTcGhlcmUgfSBmcm9tICcuL3NwaGVyZSdcclxuaW1wb3J0IHsgY29sbGlkZVJheVdpdGhDdWJvaWQsIGNvbGxpZGVSYXlXaXRoUGxhbmUsIGNvbGxpZGVSYXlXaXRoUmF5LCBjb2xsaWRlUmF5V2l0aFNwaGVyZSB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcmF5J1xyXG5pbXBvcnQgeyBQbGFuZSB9IGZyb20gJy4vcGxhbmUnXHJcbmltcG9ydCB7IEN1Ym9pZCB9IGZyb20gJy4vY3Vib2lkJ1xyXG5cclxuZXhwb3J0IGNsYXNzIFJheSBleHRlbmRzIENvbGxpZGVyIHtcclxuXHJcbiAgcmVhZG9ubHkgb3JpZ2luOiB2ZWMzXHJcbiAgcmVhZG9ubHkgZGlyZWN0aW9uOiB2ZWMzXHJcblxyXG4gIGNvbnN0cnVjdG9yKHtcclxuICAgIG9yaWdpbiA9IHZlYzMuemVybyxcclxuICAgIGRpcmVjdGlvbiA9IHZlYzMudXBcclxuICB9KSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5vcmlnaW4gPSBvcmlnaW4uY29weSgpXHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbi5jb3B5KCkubm9ybWFsaXplKClcclxuICB9XHJcblxyXG4gIGNvbGxpZGUoY29sbGlkZXI6IENvbGxpZGVyLCB0MTogVHJhbnNmb3JtLCB0MjogVHJhbnNmb3JtKTogQ29sbGlzaW9uIHwgbnVsbCB7XHJcbiAgICBpZiAoY29sbGlkZXIgaW5zdGFuY2VvZiBSYXkpIHtcclxuICAgICAgcmV0dXJuIGNvbGxpZGVSYXlXaXRoUmF5KHRoaXMsIGNvbGxpZGVyLCB0MSwgdDIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbGxpZGVyIGluc3RhbmNlb2YgUGxhbmUpIHtcclxuICAgICAgcmV0dXJuIGNvbGxpZGVSYXlXaXRoUGxhbmUodGhpcywgY29sbGlkZXIsIHQxLCB0MilcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY29sbGlkZXIgaW5zdGFuY2VvZiBTcGhlcmUpIHtcclxuICAgICAgcmV0dXJuIGNvbGxpZGVSYXlXaXRoU3BoZXJlKHRoaXMsIGNvbGxpZGVyLCB0MSwgdDIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbGxpZGVyIGluc3RhbmNlb2YgQ3Vib2lkKSB7XHJcbiAgICAgIHJldHVybiBjb2xsaWRlUmF5V2l0aEN1Ym9pZCh0aGlzLCBjb2xsaWRlciwgdDEsIHQyKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm0odHJhbnNmb3JtOiBUcmFuc2Zvcm0pIHtcclxuICAgIGNvbnN0IHsgbW9kZWxNYXRyaXgsIHJvdGF0aW9uTWF0cml4IH0gPSB0cmFuc2Zvcm1cclxuXHJcbiAgICBjb25zdCBvcmlnaW4gPSBtb2RlbE1hdHJpeC50cmFuc2Zvcm1WZWMzKHRoaXMub3JpZ2luKVxyXG4gICAgY29uc3QgZGlyZWN0aW9uID0gcm90YXRpb25NYXRyaXgudHJhbnNmb3JtKHRoaXMuZGlyZWN0aW9uKVxyXG5cclxuICAgIHJldHVybiBuZXcgUmF5KHsgb3JpZ2luLCBkaXJlY3Rpb24gfSlcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IENvbGxpZGVyIH0gZnJvbSAnLi4vY29sbGlkZXInXHJcbmltcG9ydCB7IENvbGxpc2lvbiB9IGZyb20gJy4uL2NvbGxpc2lvbidcclxuXHJcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuLi8uLi8uLi92ZWN0b3JzL3NyYy92ZWMzJ1xyXG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuLi90cmFuc2Zvcm0nXHJcbmltcG9ydCB7IGNvbGxpZGVSYXlXaXRoU3BoZXJlIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9yYXknXHJcbmltcG9ydCB7IFJheSB9IGZyb20gJy4vcmF5J1xyXG5pbXBvcnQgeyBjb2xsaWRlUGxhbmVXaXRoU3BoZXJlIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9wbGFuZSdcclxuaW1wb3J0IHsgUGxhbmUgfSBmcm9tICcuL3BsYW5lJ1xyXG5pbXBvcnQgeyBDdWJvaWQgfSBmcm9tICcuL2N1Ym9pZCdcclxuaW1wb3J0IHsgY29sbGlkZVNwaGVyZVdpdGhDdWJvaWQsIGNvbGxpZGVTcGhlcmVXaXRoU3BoZXJlIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9zcGhlcmUnXHJcblxyXG5leHBvcnQgY2xhc3MgU3BoZXJlIGV4dGVuZHMgQ29sbGlkZXIge1xyXG5cclxuICByZWFkb25seSBjZW50ZXI6IHZlYzNcclxuXHJcbiAgcmFkaXVzOiBudW1iZXJcclxuXHJcbiAgY29uc3RydWN0b3Ioe1xyXG4gICAgY2VudGVyID0gdmVjMy56ZXJvLFxyXG4gICAgcmFkaXVzID0gMS4wXHJcbiAgfSkge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIHRoaXMuY2VudGVyID0gY2VudGVyLmNvcHkoKVxyXG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXNcclxuICB9XHJcblxyXG4gIGNvbGxpZGUoY29sbGlkZXI6IENvbGxpZGVyLCB0MTogVHJhbnNmb3JtLCB0MjogVHJhbnNmb3JtKTogQ29sbGlzaW9uIHwgbnVsbCB7XHJcbiAgICBpZiAoY29sbGlkZXIgaW5zdGFuY2VvZiBSYXkpIHtcclxuICAgICAgcmV0dXJuIGNvbGxpZGVSYXlXaXRoU3BoZXJlKGNvbGxpZGVyLCB0aGlzLCB0MSwgdDIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbGxpZGVyIGluc3RhbmNlb2YgUGxhbmUpIHtcclxuICAgICAgcmV0dXJuIGNvbGxpZGVQbGFuZVdpdGhTcGhlcmUoY29sbGlkZXIsIHRoaXMsIHQxLCB0MilcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY29sbGlkZXIgaW5zdGFuY2VvZiBTcGhlcmUpIHtcclxuICAgICAgcmV0dXJuIGNvbGxpZGVTcGhlcmVXaXRoU3BoZXJlKHRoaXMsIGNvbGxpZGVyLCB0MSwgdDIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbGxpZGVyIGluc3RhbmNlb2YgQ3Vib2lkKSB7XHJcbiAgICAgIHJldHVybiBjb2xsaWRlU3BoZXJlV2l0aEN1Ym9pZCh0aGlzLCBjb2xsaWRlciwgdDEsIHQyKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm0odHJhbnNmb3JtOiBUcmFuc2Zvcm0pIHtcclxuICAgIGNvbnN0IHsgbW9kZWxNYXRyaXggfSA9IHRyYW5zZm9ybVxyXG5cclxuICAgIGNvbnN0IGNlbnRlciA9IG1vZGVsTWF0cml4LnRyYW5zZm9ybVZlYzModGhpcy5jZW50ZXIpXHJcblxyXG4gICAgcmV0dXJuIG5ldyBTcGhlcmUoeyBjZW50ZXIsIHJhZGl1czogdGhpcy5yYWRpdXMgfSlcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IENvbGxpc2lvbiB9IGZyb20gJy4uL2NvbGxpc2lvbidcclxuaW1wb3J0IHsgQ3Vib2lkIH0gZnJvbSAnLi4vY29sbGlkZXJzL2N1Ym9pZCdcclxuaW1wb3J0IHsgdmVjMyB9IGZyb20gJy4uLy4uLy4uL3ZlY3RvcnMvc3JjL3ZlYzMnXHJcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL3RyYW5zZm9ybSdcclxuXHJcbmNvbnN0IHsgbWluIH0gPSBNYXRoXHJcblxyXG5leHBvcnQgY29uc3QgY29sbGlkZUN1Ym9pZFdpdGhDdWJvaWQgPSAoYzE6IEN1Ym9pZCwgYzI6IEN1Ym9pZCwgdDE6IFRyYW5zZm9ybSwgdDI6IFRyYW5zZm9ybSk6IENvbGxpc2lvbiB8IG51bGwgPT4ge1xyXG4gIGlmIChcclxuICAgIGMxLm1heGltdW0ueCA8IGMyLm1pbmltdW0ueCB8fFxyXG4gICAgYzEubWluaW11bS54ID4gYzIubWF4aW11bS54IHx8XHJcbiAgICBjMS5tYXhpbXVtLnkgPCBjMi5taW5pbXVtLnkgfHxcclxuICAgIGMxLm1pbmltdW0ueSA+IGMyLm1heGltdW0ueSB8fFxyXG4gICAgYzEubWF4aW11bS56IDwgYzIubWluaW11bS56IHx8XHJcbiAgICBjMS5taW5pbXVtLnogPiBjMi5tYXhpbXVtLnpcclxuICApIHtcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICBjb25zdCB4ID0gbWluKGMxLm1heGltdW0ueCAtIGMyLm1pbmltdW0ueCwgYzIubWF4aW11bS54IC0gYzEubWluaW11bS54KVxyXG4gIGNvbnN0IHkgPSBtaW4oYzEubWF4aW11bS55IC0gYzIubWluaW11bS55LCBjMi5tYXhpbXVtLnkgLSBjMS5taW5pbXVtLnkpXHJcbiAgY29uc3QgeiA9IG1pbihjMS5tYXhpbXVtLnogLSBjMi5taW5pbXVtLnosIGMyLm1heGltdW0ueiAtIGMxLm1pbmltdW0ueilcclxuXHJcbiAgY29uc3QgY2VudGVyMSA9IHZlYzMuYWRkKGMxLm1pbmltdW0sIGMxLm1heGltdW0pLnNjYWxlKDAuNSlcclxuICBjb25zdCBjZW50ZXIyID0gdmVjMy5hZGQoYzIubWluaW11bSwgYzIubWF4aW11bSkuc2NhbGUoMC41KVxyXG5cclxuICBsZXQgbm9ybWFsOiB2ZWMzXHJcblxyXG4gIGNvbnN0IGNvbnRhY3QgPSBjZW50ZXIxLmNvcHkoKVxyXG5cclxuICBpZiAoeCA8IHkgJiYgeCA8IHopIHtcclxuICAgIG5vcm1hbCA9IHZlYzMucmlnaHQuY29weSgpXHJcblxyXG4gICAgaWYgKGNlbnRlcjEueCA8IGNlbnRlcjIueCkge1xyXG4gICAgICBjb250YWN0LnggPSBjMS5tYXhpbXVtLnhcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRhY3QueCA9IGMxLm1pbmltdW0ueFxyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAoeSA8IHopIHtcclxuICAgIG5vcm1hbCA9IHZlYzMudXAuY29weSgpXHJcblxyXG4gICAgaWYgKGNlbnRlcjEueSA8IGNlbnRlcjIueSkge1xyXG4gICAgICBjb250YWN0LnkgPSBjMS5tYXhpbXVtLnlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRhY3QueSA9IGMxLm1pbmltdW0ueVxyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBub3JtYWwgPSB2ZWMzLmZvcndhcmQuY29weSgpXHJcblxyXG4gICAgaWYgKGNlbnRlcjEueiA8IGNlbnRlcjIueikge1xyXG4gICAgICBjb250YWN0LnogPSBjMS5tYXhpbXVtLnpcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnRhY3QueiA9IGMxLm1pbmltdW0uelxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgZGlzdGFuY2UgPSAtKG1pbih4LCB5LCB6KSlcclxuXHJcbiAgcmV0dXJuIHsgbm9ybWFsLCBjb250YWN0LCBkaXN0YW5jZSB9XHJcbn0iLCJpbXBvcnQgeyBDb2xsaXNpb24gfSBmcm9tICcuLi9jb2xsaXNpb24nXHJcbmltcG9ydCB7IEN1Ym9pZCB9IGZyb20gJy4uL2NvbGxpZGVycy9jdWJvaWQnXHJcbmltcG9ydCB7IFBsYW5lIH0gZnJvbSAnLi4vY29sbGlkZXJzL3BsYW5lJ1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vLi4vLi4vdmVjdG9ycy9zcmMvdmVjMydcclxuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSAnLi4vY29sbGlkZXJzL3NwaGVyZSdcclxuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi4vdHJhbnNmb3JtJ1xyXG5cclxuY29uc3QgeyBhYnMgfSA9IE1hdGhcclxuXHJcbmV4cG9ydCBjb25zdCBjb2xsaWRlUGxhbmVXaXRoU3BoZXJlID0gKHBsYW5lOiBQbGFuZSwgc3BoZXJlOiBTcGhlcmUsIHQxOiBUcmFuc2Zvcm0sIHQyOiBUcmFuc2Zvcm0pOiBDb2xsaXNpb24gfCBudWxsID0+IHtcclxuICBjb25zdCB7IGVxdWF0aW9uIH0gPSBwbGFuZVxyXG5cclxuICBjb25zdCBwbGFuZU5vcm1hbCA9IG5ldyB2ZWMzKFtlcXVhdGlvbi54LCBlcXVhdGlvbi55LCBlcXVhdGlvbi56XSlcclxuICBjb25zdCBkaXN0YW5jZSA9IHZlYzMuZG90KHBsYW5lTm9ybWFsLCBzcGhlcmUuY2VudGVyKSAtIGVxdWF0aW9uLndcclxuXHJcbiAgaWYgKGRpc3RhbmNlIDwgMCkge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IGRlcHRoID0gc3BoZXJlLnJhZGl1cyAtIGRpc3RhbmNlXHJcbiAgY29uc3Qgbm9ybWFsID0gcGxhbmVOb3JtYWwuY29weSgpLm5lZ2F0ZSgpXHJcblxyXG4gIGNvbnN0IGNvbnRhY3QgPSB2ZWMzLnN1YnRyYWN0KHNwaGVyZS5jZW50ZXIsIHZlYzMuc2NhbGUobm9ybWFsLCBkZXB0aCkpXHJcblxyXG4gIHJldHVybiB7IGNvbnRhY3QsIG5vcm1hbCwgZGlzdGFuY2UgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29sbGlkZVBsYW5lV2l0aEN1Ym9pZCA9IChwbGFuZTogUGxhbmUsIGN1Ym9pZDogQ3Vib2lkLCB0MTogVHJhbnNmb3JtLCB0MjogVHJhbnNmb3JtKTogQ29sbGlzaW9uIHwgbnVsbCA9PiB7XHJcbiAgY29uc3QgeyBlcXVhdGlvbiB9ID0gcGxhbmVcclxuICBjb25zdCB7IG1heGltdW0sIG1pbmltdW0gfSA9IGN1Ym9pZFxyXG5cclxuICBjb25zdCBjZW50ZXIgPSB2ZWMzLmFkZChtaW5pbXVtLCBtYXhpbXVtKS5zY2FsZSgwLjUpXHJcbiAgY29uc3QgZXh0ZW50cyA9IHZlYzMuc3VidHJhY3QobWF4aW11bSwgbWluaW11bSkuc2NhbGUoMC41KVxyXG5cclxuICBjb25zdCBwbGFuZU5vcm1hbCA9IG5ldyB2ZWMzKFtlcXVhdGlvbi54LCBlcXVhdGlvbi55LCBlcXVhdGlvbi56XSlcclxuXHJcbiAgY29uc3QgcHJvamVjdGlvbiA9IHZlYzMuZG90KHBsYW5lTm9ybWFsLCBleHRlbnRzKVxyXG4gIGNvbnN0IGRpc3RhbmNlID0gdmVjMy5kb3QoY2VudGVyLCBwbGFuZU5vcm1hbCkgKyBlcXVhdGlvbi53IC0gcHJvamVjdGlvblxyXG5cclxuICBpZiAoZGlzdGFuY2UgPiAwKSB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxuXHJcbiAgY29uc3QgY29udGFjdCA9IHZlYzMuc3VidHJhY3QoY2VudGVyLCB2ZWMzLnNjYWxlKHBsYW5lTm9ybWFsLCBwcm9qZWN0aW9uKSlcclxuXHJcbiAgcmV0dXJuIHsgY29udGFjdCwgbm9ybWFsOiBwbGFuZU5vcm1hbCwgZGlzdGFuY2U6IGFicyhkaXN0YW5jZSkgfVxyXG59IiwiaW1wb3J0IHsgQ29sbGlzaW9uIH0gZnJvbSAnLi4vY29sbGlzaW9uJ1xyXG5pbXBvcnQgeyBDdWJvaWQgfSBmcm9tICcuLi9jb2xsaWRlcnMvY3Vib2lkJ1xyXG5pbXBvcnQgeyBSYXkgfSBmcm9tICcuLi9jb2xsaWRlcnMvcmF5J1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vLi4vLi4vdmVjdG9ycy9zcmMvdmVjMydcclxuaW1wb3J0IHsgUGxhbmUgfSBmcm9tICcuLi9jb2xsaWRlcnMvcGxhbmUnXHJcbmltcG9ydCB7IFNwaGVyZSB9IGZyb20gJy4uL2NvbGxpZGVycy9zcGhlcmUnXHJcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL3RyYW5zZm9ybSdcclxuXHJcbmNvbnN0IHsgc3FydCwgbWluLCBtYXggfSA9IE1hdGhcclxuXHJcbmV4cG9ydCBjb25zdCBjb2xsaWRlUmF5V2l0aFJheSA9IChyYXkxOiBSYXksIHJheTI6IFJheSwgdDE6IFRyYW5zZm9ybSwgdDI6IFRyYW5zZm9ybSk6IENvbGxpc2lvbiB8IG51bGwgPT4ge1xyXG4gIGNvbnN0IHsgZGlyZWN0aW9uOiBkMSwgb3JpZ2luOiBvMSB9ID0gcmF5MVxyXG4gIGNvbnN0IHsgZGlyZWN0aW9uOiBkMiwgb3JpZ2luOiBvMiB9ID0gcmF5MlxyXG5cclxuICBjb25zdCBjID0gdmVjMy5jcm9zcyhkMSwgZDIpXHJcbiAgY29uc3QgZCA9IHZlYzMuZG90KGMsIGMpXHJcblxyXG4gIGlmIChkID09PSAwKSB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxuXHJcbiAgY29uc3QgZiA9IHZlYzMuc3VidHJhY3QobzIsIG8xKVxyXG5cclxuICBjb25zdCB1ID0gdmVjMy5jcm9zcyhjLCBmKS5zY2FsZSgxIC8gZClcclxuICBjb25zdCB0ID0gdmVjMy5kb3QodmVjMy5jcm9zcyhmLCBkMiksIGMpIC8gZFxyXG5cclxuICBpZiAodCA8IDAgfHwgdCA+IDEpIHtcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICBjb25zdCBjMSA9IHZlYzMuYWRkKG8xLCB2ZWMzLnNjYWxlKGQxLCB0KSlcclxuICBjb25zdCBjMiA9IHZlYzMuYWRkKG8yLCB2ZWMzLnNjYWxlKGQyLCB1LnopKVxyXG5cclxuICBjb25zdCBub3JtYWwgPSB2ZWMzLnN1YnRyYWN0KGMxLCBjMikubm9ybWFsaXplKClcclxuICBjb25zdCBkaXN0YW5jZSA9IHZlYzMuZG90KHZlYzMuc3VidHJhY3QoYzEsIG8xKSwgZDEpXHJcblxyXG4gIHJldHVybiB7IGNvbnRhY3Q6IGMxLCBub3JtYWwsIGRpc3RhbmNlIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbGxpZGVSYXlXaXRoUGxhbmUgPSAocmF5OiBSYXksIHBsYW5lOiBQbGFuZSwgdDE6IFRyYW5zZm9ybSwgdDI6IFRyYW5zZm9ybSk6IENvbGxpc2lvbiB8IG51bGwgPT4ge1xyXG4gIGNvbnN0IHsgZXF1YXRpb24gfSA9IHBsYW5lXHJcbiAgY29uc3QgeyBkaXJlY3Rpb24sIG9yaWdpbiB9ID0gcmF5XHJcblxyXG4gIGNvbnN0IG5vcm1hbCA9IG5ldyB2ZWMzKFtlcXVhdGlvbi54LCBlcXVhdGlvbi55LCBlcXVhdGlvbi56XSlcclxuXHJcbiAgY29uc3QgZCA9IHZlYzMuZG90KGRpcmVjdGlvbiwgbm9ybWFsKVxyXG5cclxuICBpZiAoZCA9PT0gMCkge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IGRpc3RhbmNlID0gKGVxdWF0aW9uLncgLSB2ZWMzLmRvdChvcmlnaW4sIG5vcm1hbCkpIC8gZFxyXG5cclxuICBpZiAoZGlzdGFuY2UgPCAwKSB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxuXHJcbiAgY29uc3QgY29udGFjdCA9IHZlYzMuYWRkKG9yaWdpbiwgdmVjMy5zY2FsZShkaXJlY3Rpb24sIGRpc3RhbmNlKSlcclxuXHJcbiAgcmV0dXJuIHsgY29udGFjdCwgbm9ybWFsLCBkaXN0YW5jZSB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb2xsaWRlUmF5V2l0aFNwaGVyZSA9IChyYXk6IFJheSwgc3BoZXJlOiBTcGhlcmUsIHQxOiBUcmFuc2Zvcm0sIHQyOiBUcmFuc2Zvcm0pOiBDb2xsaXNpb24gfCBudWxsID0+IHtcclxuICBjb25zdCB7IGRpcmVjdGlvbiwgb3JpZ2luIH0gPSByYXlcclxuICBjb25zdCB7IGNlbnRlciwgcmFkaXVzIH0gPSBzcGhlcmVcclxuXHJcbiAgY29uc3QgcjIgPSByYWRpdXMgKiByYWRpdXNcclxuXHJcbiAgY29uc3QgYyA9IHZlYzMuc3VidHJhY3QoY2VudGVyLCBvcmlnaW4pXHJcbiAgY29uc3QgZCA9IHZlYzMuZG90KGRpcmVjdGlvbiwgYylcclxuXHJcbiAgaWYgKGQgPCAwKSB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxuXHJcbiAgY29uc3QgZDIgPSBjLnNxdWFyZWRMZW5ndGggLSAoZCAqIGQpXHJcblxyXG4gIGlmIChkMiA+IHIyKSB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxuXHJcbiAgY29uc3QgZGlzdGFuY2UgPSBkIC0gc3FydChyMiAtIGQyKVxyXG5cclxuICBjb25zdCBjb250YWN0ID0gdmVjMy5hZGQob3JpZ2luLCB2ZWMzLnNjYWxlKGRpcmVjdGlvbiwgZGlzdGFuY2UpKVxyXG4gIGNvbnN0IG5vcm1hbCA9IHZlYzMuc3VidHJhY3QoY29udGFjdCwgY2VudGVyKS5ub3JtYWxpemUoKVxyXG5cclxuICByZXR1cm4geyBjb250YWN0LCBub3JtYWwsIGRpc3RhbmNlIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbGxpZGVSYXlXaXRoQ3Vib2lkID0gKHJheTogUmF5LCBjdWJvaWQ6IEN1Ym9pZCwgdDE6IFRyYW5zZm9ybSwgdDI6IFRyYW5zZm9ybSk6IENvbGxpc2lvbiB8IG51bGwgPT4ge1xyXG4gIGNvbnN0IHsgb3JpZ2luLCBkaXJlY3Rpb24gfSA9IHJheVxyXG4gIGNvbnN0IHsgbWF4aW11bSwgbWluaW11bSB9ID0gY3Vib2lkXHJcblxyXG4gIGNvbnN0IHMxID0gdmVjMy5zdWJ0cmFjdChtaW5pbXVtLCBvcmlnaW4pLmRpdmlkZShkaXJlY3Rpb24pXHJcbiAgY29uc3QgczIgPSB2ZWMzLnN1YnRyYWN0KG1heGltdW0sIG9yaWdpbikuZGl2aWRlKGRpcmVjdGlvbilcclxuXHJcbiAgY29uc3QgbTEgPSBtYXgobWluKHMxLngsIHMyLngpLCBtaW4oczEueSwgczIueSksIG1pbihzMS56LCBzMi56KSlcclxuICBjb25zdCBtMiA9IG1pbihtYXgoczEueCwgczIueCksIG1heChzMS55LCBzMi55KSwgbWF4KHMxLnosIHMyLnopKVxyXG5cclxuICBpZiAobTIgPCAwIHx8IG0xID4gbTIpIHtcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICBjb25zdCBkaXN0YW5jZSA9IChtMSA8IDApID8gbTIgOiBtMVxyXG5cclxuICBjb25zdCBjb250YWN0ID0gdmVjMy5hZGQob3JpZ2luLCBkaXJlY3Rpb24pLnNjYWxlKGRpc3RhbmNlKVxyXG5cclxuICByZXR1cm4geyBjb250YWN0LCBub3JtYWw6IGRpcmVjdGlvbiwgZGlzdGFuY2UgfVxyXG59IiwiaW1wb3J0IHsgQ29sbGlzaW9uIH0gZnJvbSAnLi4vY29sbGlzaW9uJ1xyXG5pbXBvcnQgeyBDdWJvaWQgfSBmcm9tICcuLi9jb2xsaWRlcnMvY3Vib2lkJ1xyXG5pbXBvcnQgeyBTcGhlcmUgfSBmcm9tICcuLi9jb2xsaWRlcnMvc3BoZXJlJ1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vLi4vLi4vdmVjdG9ycy9zcmMvdmVjMydcclxuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi4vdHJhbnNmb3JtJ1xyXG5cclxuY29uc3QgeyBzcXJ0LCBtaW4sIG1heCB9ID0gTWF0aFxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbGxpZGVTcGhlcmVXaXRoU3BoZXJlID0gKHMxOiBTcGhlcmUsIHMyOiBTcGhlcmUsIHQxOiBUcmFuc2Zvcm0sIHQyOiBUcmFuc2Zvcm0pOiBDb2xsaXNpb24gfCBudWxsID0+IHtcclxuICBjb25zdCBkID0gdmVjMy5zdWJ0cmFjdChzMi5jZW50ZXIsIHMxLmNlbnRlcilcclxuXHJcbiAgY29uc3QgZDIgPSBkLnNxdWFyZWRMZW5ndGhcclxuXHJcbiAgY29uc3QgcyA9IHMxLnJhZGl1cyArIHMyLnJhZGl1c1xyXG5cclxuICBpZiAoZDIgPiBzICogcykge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IHQgPSBNYXRoLnNxcnQoZDIpXHJcblxyXG4gIGNvbnN0IG5vcm1hbCA9IGQubm9ybWFsaXplKClcclxuICBjb25zdCBjb250YWN0ID0gdmVjMy5hZGQoczEuY2VudGVyLCB2ZWMzLnNjYWxlKG5vcm1hbCwgczEucmFkaXVzKSlcclxuXHJcbiAgcmV0dXJuIHsgY29udGFjdCwgbm9ybWFsLCBkaXN0YW5jZTogdCAtIHMgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29sbGlkZVNwaGVyZVdpdGhDdWJvaWQgPSAoc3BoZXJlOiBTcGhlcmUsIGN1Ym9pZDogQ3Vib2lkLCB0MTogVHJhbnNmb3JtLCB0MjogVHJhbnNmb3JtKTogQ29sbGlzaW9uIHwgbnVsbCA9PiB7XHJcbiAgY29uc3QgeyBjZW50ZXIsIHJhZGl1cyB9ID0gc3BoZXJlXHJcbiAgY29uc3QgeyBtYXhpbXVtLCBtaW5pbXVtIH0gPSBjdWJvaWRcclxuXHJcbiAgY29uc3QgcjIgPSByYWRpdXMgKiByYWRpdXNcclxuXHJcbiAgY29uc3QgcCA9IG5ldyB2ZWMzKFtcclxuICAgIG1heChtaW5pbXVtLngsIG1pbihjZW50ZXIueCwgbWF4aW11bS54KSksXHJcbiAgICBtYXgobWluaW11bS55LCBtaW4oY2VudGVyLnksIG1heGltdW0ueSkpLFxyXG4gICAgbWF4KG1pbmltdW0ueiwgbWluKGNlbnRlci56LCBtYXhpbXVtLnopKVxyXG4gIF0pXHJcblxyXG4gIGNvbnN0IGQgPSB2ZWMzLnN1YnRyYWN0KHAsIGNlbnRlcilcclxuICBjb25zdCBkMiA9IHZlYzMuZG90KGQsIGQpXHJcblxyXG4gIGlmIChkMiA+IHIyKSB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxuXHJcbiAgY29uc3Qgbm9ybWFsID0gdmVjMy5ub3JtYWxpemUoZClcclxuICBjb25zdCBjb250YWN0ID0gdmVjMy5hZGQoY2VudGVyLCB2ZWMzLnNjYWxlKG5vcm1hbCwgcmFkaXVzKSlcclxuXHJcbiAgcmV0dXJuIHsgY29udGFjdCwgbm9ybWFsLCBkaXN0YW5jZTogc3FydChyMiAtIGQyKSB9XHJcbn0iLCJpbXBvcnQgeyBtYXQzIH0gZnJvbSAnLi4vLi4vdmVjdG9ycy9zcmMvbWF0MydcclxuaW1wb3J0IHsgbWF0NCB9IGZyb20gJy4uLy4uL3ZlY3RvcnMvc3JjL21hdDQnXHJcbmltcG9ydCB7IHF1YXQgfSBmcm9tICcuLi8uLi92ZWN0b3JzL3NyYy9xdWF0J1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vLi4vdmVjdG9ycy9zcmMvdmVjMydcclxuXHJcbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm0ge1xyXG5cclxuICByZWFkb25seSByb3RhdGlvbjogcXVhdFxyXG4gIHJlYWRvbmx5IHRyYW5zbGF0aW9uOiB2ZWMzXHJcblxyXG4gIHJlYWRvbmx5IG1vZGVsTWF0cml4OiBtYXQ0XHJcbiAgcmVhZG9ubHkgcm90YXRpb25NYXRyaXg6IG1hdDNcclxuICByZWFkb25seSBpbnZlcnNlVHJhbnNwb3NlTWF0cml4OiBtYXQ0XHJcblxyXG4gIGNvbnN0cnVjdG9yKHtcclxuICAgIHRyYW5zbGF0aW9uID0gdmVjMy56ZXJvLFxyXG4gICAgcm90YXRpb24gPSBxdWF0LmlkZW50aXR5XHJcbiAgfSA9IHt9KSB7XHJcbiAgICB0aGlzLnRyYW5zbGF0aW9uID0gdHJhbnNsYXRpb24uY29weSgpXHJcbiAgICB0aGlzLnJvdGF0aW9uID0gcm90YXRpb24uY29weSgpXHJcblxyXG4gICAgdGhpcy51cGRhdGUoKVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgbWF0NC5jb25zdHJ1Y3QodGhpcy5yb3RhdGlvbiwgdGhpcy50cmFuc2xhdGlvbiwgdGhpcy5tb2RlbE1hdHJpeClcclxuXHJcbiAgICB0aGlzLm1vZGVsTWF0cml4LnRvTWF0Myh0aGlzLnJvdGF0aW9uTWF0cml4KVxyXG4gICAgdGhpcy5tb2RlbE1hdHJpeC5pbnZlcnQodGhpcy5pbnZlcnNlVHJhbnNwb3NlTWF0cml4KS50cmFuc3Bvc2UoKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IG9yaWdpbiA9IG5ldyBUcmFuc2Zvcm0oKVxyXG5cclxufSIsImltcG9ydCB7IHZlYzMgfSBmcm9tICcuLi8uLi92ZWN0b3JzL3NyYy92ZWMzJ1xyXG5cclxuaW1wb3J0IHsgUmlnaWRCb2R5IH0gZnJvbSAnLi9yaWdpZC1ib2R5J1xyXG5pbXBvcnQgeyBDb2xsaXNpb24gfSBmcm9tICcuL2NvbGxpc2lvbidcclxuXHJcbmV4cG9ydCBjbGFzcyBXb3JsZCB7XHJcblxyXG4gIHByaXZhdGUgYm9kaWVzOiBSaWdpZEJvZHlbXSA9IFtdXHJcblxyXG4gIHByaXZhdGUgY29sbGlzaW9uczogUmVxdWlyZWQ8Q29sbGlzaW9uPltdID0gW11cclxuXHJcbiAgcHJpdmF0ZSBncmF2aXR5ID0gbmV3IHZlYzMoWzAsIC05LjgxLCAwXSlcclxuXHJcbiAgdXBkYXRlKGRlbHRhVGltZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLmFwcGx5R3Jhdml0eSgpXHJcblxyXG4gICAgdGhpcy5kZXRlY3RDb2xsaXNpb25zKClcclxuICAgIHRoaXMucmVzb2x2ZUNvbGxpc2lvbnMoKVxyXG5cclxuICAgIHRoaXMudXBkYXRlQm9kaWVzKGRlbHRhVGltZSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgYXBwbHlHcmF2aXR5KCkge1xyXG4gICAgdGhpcy5ib2RpZXMuZm9yRWFjaCgoYm9keSkgPT4ge1xyXG4gICAgICBib2R5LmZvcmNlLmFkZCh2ZWMzLnNjYWxlKHRoaXMuZ3Jhdml0eSwgYm9keS5tYXNzKSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRldGVjdENvbGxpc2lvbnMoKSB7XHJcbiAgICB0aGlzLmNvbGxpc2lvbnMubGVuZ3RoID0gMFxyXG5cclxuXHRcdHRoaXMuYm9kaWVzLmZvckVhY2goKGEpID0+IHtcclxuICAgICAgdGhpcy5ib2RpZXMuZm9yRWFjaCgoYikgPT4ge1xyXG5cdFx0XHRcdGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcblxyXG5cdFx0XHRcdGNvbnN0IGNvbGxpc2lvbiA9IGEuY29sbGlkZXIuY29sbGlkZShiLmNvbGxpZGVyLCBhLnRyYW5zZm9ybSwgYi50cmFuc2Zvcm0pXHJcblxyXG4gICAgICAgIGlmIChjb2xsaXNpb24pIHtcclxuICAgICAgICAgIHRoaXMuY29sbGlzaW9ucy5wdXNoKHsgXHJcbiAgICAgICAgICAgIC4uLmNvbGxpc2lvbiwgXHJcbiAgICAgICAgICAgIGJvZGllczogW2EsIGJdIFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblx0XHRcdH0pXHJcblx0XHR9KVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNvbHZlQ29sbGlzaW9ucygpIHtcclxuICAgIHRoaXMuY29sbGlzaW9ucy5mb3JFYWNoKChjb2xsaXNpb24pID0+IHtcclxuICAgICAgY29uc3QgYSA9IGNvbGxpc2lvbi5ib2RpZXNbMF1cclxuICAgICAgY29uc3QgYiA9IGNvbGxpc2lvbi5ib2RpZXNbMV1cclxuXHJcblx0XHRcdGNvbnN0IGQgPSB2ZWMzLnN1YnRyYWN0KGIudmVsb2NpdHksIGEudmVsb2NpdHkpXHJcblx0XHRcdGNvbnN0IG4gPSB2ZWMzLmRvdChkLCBjb2xsaXNpb24ubm9ybWFsKVxyXG5cclxuXHRcdFx0Y29uc3QgbTEgPSAxLjAgLyBhLm1hc3NcclxuXHRcdFx0Y29uc3QgbTIgPSAxLjAgLyBiLm1hc3NcclxuXHJcbiAgICAgIGlmIChuID49IDApIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuXHRcdFx0Y29uc3QgaiA9IC0xLjAgKiBuIC8gKG0xICsgbTIpXHJcblx0XHRcdGNvbnN0IGltcHVsc2UgPSB2ZWMzLnNjYWxlKGNvbGxpc2lvbi5ub3JtYWwsIGopXHJcblxyXG5cdFx0XHRhLnZlbG9jaXR5LnN1YnRyYWN0KHZlYzMuc2NhbGUoaW1wdWxzZSwgbTEpKVxyXG5cdFx0XHRiLnZlbG9jaXR5LmFkZCh2ZWMzLnNjYWxlKGltcHVsc2UsIG0yKSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUJvZGllcyhkZWx0YVRpbWU6IG51bWJlcikge1xyXG4gICAgdGhpcy5ib2RpZXMuZm9yRWFjaCgoYm9keSkgPT4ge1xyXG4gICAgICBib2R5LnZlbG9jaXR5LmFkZCh2ZWMzLnNjYWxlKGJvZHkuZm9yY2UsIGJvZHkubWFzcykuc2NhbGUoZGVsdGFUaW1lKSlcclxuICAgICAgYm9keS50cmFuc2Zvcm0udHJhbnNsYXRpb24uYWRkKHZlYzMuc2NhbGUoYm9keS52ZWxvY2l0eSwgZGVsdGFUaW1lKSlcclxuXHJcbiAgICAgIGJvZHkuZm9yY2UucmVzZXQoKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG59IiwiZXhwb3J0IGNvbnN0IEVwc2lsb24gPSAwLjAwMDAxXHJcbiIsImltcG9ydCB7IEVwc2lsb24gfSBmcm9tICcuL2NvbnN0YW50cydcclxuXHJcbmltcG9ydCB7IG1hdDQgfSBmcm9tICcuL21hdDQnXHJcbmltcG9ydCB7IHF1YXQgfSBmcm9tICcuL3F1YXQnXHJcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuL3ZlYzMnXHJcblxyXG5leHBvcnQgY2xhc3MgbWF0MyBleHRlbmRzIEZsb2F0MzJBcnJheSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHZhbHVlczogbnVtYmVyW10gPSBbXHJcbiAgICAxLjAsIDAuMCwgMC4wLFxyXG4gICAgMC4wLCAxLjAsIDAuMCxcclxuICAgIDAuMCwgMC4wLCAxLjBcclxuICBdKSB7XHJcbiAgICBzdXBlcih2YWx1ZXMuc2xpY2UoMCwgOSkpXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcmVhZG9ubHkgaWRlbnRpdHkgPSBuZXcgbWF0MygpXHJcblxyXG4gIGdldCBkZXRlcm1pbmFudCgpOiBudW1iZXIge1xyXG4gICAgY29uc3QgdjAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgdjAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdjAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgdjEwID0gdGhpc1szXVxyXG4gICAgY29uc3QgdjExID0gdGhpc1s0XVxyXG4gICAgY29uc3QgdjEyID0gdGhpc1s1XVxyXG4gICAgY29uc3QgdjIwID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdjIxID0gdGhpc1s3XVxyXG4gICAgY29uc3QgdjIyID0gdGhpc1s4XVxyXG5cclxuICAgIGNvbnN0IGRldDAxID0gdjIyICogdjExIC0gdjEyICogdjIxXHJcbiAgICBjb25zdCBkZXQxMSA9IC12MjIgKiB2MTAgKyB2MTIgKiB2MjBcclxuICAgIGNvbnN0IGRldDIxID0gdjIxICogdjEwIC0gdjExICogdjIwXHJcblxyXG4gICAgcmV0dXJuIHYwMCAqIGRldDAxICsgdjAxICogZGV0MTEgKyB2MDIgKiBkZXQyMVxyXG4gIH1cclxuXHJcbiAgY29weShkZXN0OiBudWxsIHwgbWF0MyA9IG51bGwpOiBtYXQzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDMoKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOTsgaSsrKSB7XHJcbiAgICAgIGRlc3RbaV0gPSB0aGlzW2ldXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHJvdyhpbmRleDogbnVtYmVyLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXNbaW5kZXggKiAzXVxyXG4gICAgZGVzdC55ID0gdGhpc1tpbmRleCAqIDMgKyAxXVxyXG4gICAgZGVzdC56ID0gdGhpc1tpbmRleCAqIDMgKyAyXVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBjb2x1bW4oaW5kZXg6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzW2luZGV4XVxyXG4gICAgZGVzdC55ID0gdGhpc1tpbmRleCArIDNdXHJcbiAgICBkZXN0LnogPSB0aGlzW2luZGV4ICsgNl1cclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgZXF1YWxzKG90aGVyOiBtYXQzLCB0aHJlc2hvbGQgPSBFcHNpbG9uKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDk7IGkrKykge1xyXG4gICAgICBpZiAoTWF0aC5hYnModGhpc1tpXSAtIG90aGVyW2ldKSA+IHRocmVzaG9sZCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWVcclxuICB9XHJcblxyXG4gIHJlc2V0KCk6IG1hdDMge1xyXG4gICAgdGhpc1swXSA9IDEuMFxyXG4gICAgdGhpc1sxXSA9IDAuMFxyXG4gICAgdGhpc1syXSA9IDAuMFxyXG5cclxuICAgIHRoaXNbM10gPSAwLjBcclxuICAgIHRoaXNbNF0gPSAxLjBcclxuICAgIHRoaXNbNV0gPSAwLjBcclxuXHJcbiAgICB0aGlzWzZdID0gMC4wXHJcbiAgICB0aGlzWzddID0gMC4wXHJcbiAgICB0aGlzWzhdID0gMS4wXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIHRyYW5zcG9zZShkZXN0OiBudWxsIHwgbWF0MyA9IG51bGwpOiBtYXQzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHQwMCA9IHRoaXNbMF1cclxuICAgIGNvbnN0IHQwMSA9IHRoaXNbMV1cclxuICAgIGNvbnN0IHQwMiA9IHRoaXNbMl1cclxuXHJcbiAgICBjb25zdCB0MTAgPSB0aGlzWzNdXHJcbiAgICBjb25zdCB0MTEgPSB0aGlzWzRdXHJcbiAgICBjb25zdCB0MTIgPSB0aGlzWzVdXHJcblxyXG4gICAgY29uc3QgdDIwID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdDIxID0gdGhpc1s3XVxyXG4gICAgY29uc3QgdDIyID0gdGhpc1s4XVxyXG5cclxuICAgIGRlc3RbMF0gPSB0MDBcclxuICAgIGRlc3RbMV0gPSB0MTBcclxuICAgIGRlc3RbMl0gPSB0MjBcclxuXHJcbiAgICBkZXN0WzNdID0gdDAxXHJcbiAgICBkZXN0WzRdID0gdDExXHJcbiAgICBkZXN0WzVdID0gdDIxXHJcblxyXG4gICAgZGVzdFs2XSA9IHQwMlxyXG4gICAgZGVzdFs3XSA9IHQxMlxyXG4gICAgZGVzdFs4XSA9IHQyMlxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBpbnZlcnQoZGVzdDogbnVsbCB8IG1hdDMgPSBudWxsKTogbWF0MyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB2MDAgPSB0aGlzWzBdXHJcbiAgICBjb25zdCB2MDEgPSB0aGlzWzFdXHJcbiAgICBjb25zdCB2MDIgPSB0aGlzWzJdXHJcbiAgICBjb25zdCB2MTAgPSB0aGlzWzNdXHJcbiAgICBjb25zdCB2MTEgPSB0aGlzWzRdXHJcbiAgICBjb25zdCB2MTIgPSB0aGlzWzVdXHJcbiAgICBjb25zdCB2MjAgPSB0aGlzWzZdXHJcbiAgICBjb25zdCB2MjEgPSB0aGlzWzddXHJcbiAgICBjb25zdCB2MjIgPSB0aGlzWzhdXHJcblxyXG4gICAgY29uc3QgZGV0MDEgPSB2MjIgKiB2MTEgLSB2MTIgKiB2MjFcclxuICAgIGNvbnN0IGRldDExID0gLXYyMiAqIHYxMCArIHYxMiAqIHYyMFxyXG4gICAgY29uc3QgZGV0MjEgPSB2MjEgKiB2MTAgLSB2MTEgKiB2MjBcclxuXHJcbiAgICBsZXQgZGV0ID0gdjAwICogZGV0MDEgKyB2MDEgKiBkZXQxMSArIHYwMiAqIGRldDIxXHJcblxyXG4gICAgaWYgKGRldCA9PT0gMC4wKSB7XHJcbiAgICAgIHJldHVybiBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgZGV0ID0gMS4wIC8gZGV0XHJcblxyXG4gICAgZGVzdFswXSA9IGRldDAxICogZGV0XHJcbiAgICBkZXN0WzFdID0gKC12MjIgKiB2MDEgKyB2MDIgKiB2MjEpICogZGV0XHJcbiAgICBkZXN0WzJdID0gKHYxMiAqIHYwMSAtIHYwMiAqIHYxMSkgKiBkZXRcclxuXHJcbiAgICBkZXN0WzNdID0gZGV0MTEgKiBkZXRcclxuICAgIGRlc3RbNF0gPSAodjIyICogdjAwIC0gdjAyICogdjIwKSAqIGRldFxyXG4gICAgZGVzdFs1XSA9ICgtdjEyICogdjAwICsgdjAyICogdjEwKSAqIGRldFxyXG5cclxuICAgIGRlc3RbNl0gPSBkZXQyMSAqIGRldFxyXG4gICAgZGVzdFs3XSA9ICgtdjIxICogdjAwICsgdjAxICogdjIwKSAqIGRldFxyXG4gICAgZGVzdFs4XSA9ICh2MTEgKiB2MDAgLSB2MDEgKiB2MTApICogZGV0XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIG11bHRpcGx5KG90aGVyOiBtYXQzLCBkZXN0OiBudWxsIHwgbWF0MyA9IG51bGwpOiBtYXQzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGEwMCA9IHRoaXNbMF1cclxuICAgIGNvbnN0IGEwMSA9IHRoaXNbMV1cclxuICAgIGNvbnN0IGEwMiA9IHRoaXNbMl1cclxuICAgIGNvbnN0IGExMCA9IHRoaXNbM11cclxuICAgIGNvbnN0IGExMSA9IHRoaXNbNF1cclxuICAgIGNvbnN0IGExMiA9IHRoaXNbNV1cclxuICAgIGNvbnN0IGEyMCA9IHRoaXNbNl1cclxuICAgIGNvbnN0IGEyMSA9IHRoaXNbN11cclxuICAgIGNvbnN0IGEyMiA9IHRoaXNbOF1cclxuXHJcbiAgICBjb25zdCBiMDAgPSBvdGhlclswXVxyXG4gICAgY29uc3QgYjAxID0gb3RoZXJbMV1cclxuICAgIGNvbnN0IGIwMiA9IG90aGVyWzJdXHJcbiAgICBjb25zdCBiMTAgPSBvdGhlclszXVxyXG4gICAgY29uc3QgYjExID0gb3RoZXJbNF1cclxuICAgIGNvbnN0IGIxMiA9IG90aGVyWzVdXHJcbiAgICBjb25zdCBiMjAgPSBvdGhlcls2XVxyXG4gICAgY29uc3QgYjIxID0gb3RoZXJbN11cclxuICAgIGNvbnN0IGIyMiA9IG90aGVyWzhdXHJcblxyXG4gICAgZGVzdFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMFxyXG4gICAgZGVzdFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMVxyXG4gICAgZGVzdFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMlxyXG5cclxuICAgIGRlc3RbM10gPSBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjBcclxuICAgIGRlc3RbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjFcclxuICAgIGRlc3RbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjJcclxuXHJcbiAgICBkZXN0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwXHJcbiAgICBkZXN0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxXHJcbiAgICBkZXN0WzhdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHRyYW5zZm9ybSh2ZWN0b3I6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyB4LCB5LCB6IH0gPSB2ZWN0b3JcclxuXHJcbiAgICBkZXN0LnggPSB4ICogdGhpc1swXSArIHkgKiB0aGlzWzNdICsgeiAqIHRoaXNbNl1cclxuICAgIGRlc3QueSA9IHggKiB0aGlzWzFdICsgeSAqIHRoaXNbNF0gKyB6ICogdGhpc1s3XVxyXG4gICAgZGVzdC56ID0geCAqIHRoaXNbMl0gKyB5ICogdGhpc1s1XSArIHogKiB0aGlzWzhdXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHJvdGF0ZShhbmdsZTogbnVtYmVyLCBheGlzOiB2ZWMzLCBkZXN0OiBudWxsIHwgbWF0MyA9IG51bGwpOiBudWxsIHwgbWF0MyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBsZXQgeyB4LCB5LCB6IH0gPSBheGlzXHJcblxyXG4gICAgbGV0IGxlbmd0aCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopXHJcblxyXG4gICAgaWYgKCFsZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIG51bGxcclxuICAgIH1cclxuXHJcbiAgICBpZiAobGVuZ3RoICE9PSAxKSB7XHJcbiAgICAgIGxlbmd0aCA9IDEgLyBsZW5ndGhcclxuICAgICAgeCAqPSBsZW5ndGhcclxuICAgICAgeSAqPSBsZW5ndGhcclxuICAgICAgeiAqPSBsZW5ndGhcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzID0gTWF0aC5zaW4oYW5nbGUpXHJcbiAgICBjb25zdCBjID0gTWF0aC5jb3MoYW5nbGUpXHJcblxyXG4gICAgY29uc3QgdCA9IDEuMCAtIGNcclxuXHJcbiAgICBjb25zdCBhMDAgPSB0aGlzWzBdXHJcbiAgICBjb25zdCBhMDEgPSB0aGlzWzFdXHJcbiAgICBjb25zdCBhMDIgPSB0aGlzWzJdXHJcbiAgICBjb25zdCBhMTAgPSB0aGlzWzNdXHJcbiAgICBjb25zdCBhMTEgPSB0aGlzWzRdXHJcbiAgICBjb25zdCBhMTIgPSB0aGlzWzVdXHJcbiAgICBjb25zdCBhMjAgPSB0aGlzWzZdXHJcbiAgICBjb25zdCBhMjEgPSB0aGlzWzddXHJcbiAgICBjb25zdCBhMjIgPSB0aGlzWzhdXHJcblxyXG4gICAgY29uc3QgYjAwID0geCAqIHggKiB0ICsgY1xyXG4gICAgY29uc3QgYjAxID0geSAqIHggKiB0ICsgeiAqIHNcclxuICAgIGNvbnN0IGIwMiA9IHogKiB4ICogdCAtIHkgKiBzXHJcbiAgICBjb25zdCBiMTAgPSB4ICogeSAqIHQgLSB6ICogc1xyXG4gICAgY29uc3QgYjExID0geSAqIHkgKiB0ICsgY1xyXG4gICAgY29uc3QgYjEyID0geiAqIHkgKiB0ICsgeCAqIHNcclxuICAgIGNvbnN0IGIyMCA9IHggKiB6ICogdCArIHkgKiBzXHJcbiAgICBjb25zdCBiMjEgPSB5ICogeiAqIHQgLSB4ICogc1xyXG4gICAgY29uc3QgYjIyID0geiAqIHogKiB0ICsgY1xyXG5cclxuICAgIGRlc3RbMF0gPSBhMDAgKiBiMDAgKyBhMTAgKiBiMDEgKyBhMjAgKiBiMDJcclxuICAgIGRlc3RbMV0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDJcclxuICAgIGRlc3RbMl0gPSBhMDIgKiBiMDAgKyBhMTIgKiBiMDEgKyBhMjIgKiBiMDJcclxuXHJcbiAgICBkZXN0WzNdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyXHJcbiAgICBkZXN0WzRdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyXHJcbiAgICBkZXN0WzVdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyXHJcblxyXG4gICAgZGVzdFs2XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMlxyXG4gICAgZGVzdFs3XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMlxyXG4gICAgZGVzdFs4XSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMlxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICB0b01hdDQoZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKTogbWF0NCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBtYXQ0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIHRoaXNbMF0sXHJcbiAgICAgIHRoaXNbMV0sXHJcbiAgICAgIHRoaXNbMl0sXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIHRoaXNbM10sXHJcbiAgICAgIHRoaXNbNF0sXHJcbiAgICAgIHRoaXNbNV0sXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIHRoaXNbNl0sXHJcbiAgICAgIHRoaXNbN10sXHJcbiAgICAgIHRoaXNbOF0sXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcbiAgICAgIDEuMFxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgdG9RdWF0KGRlc3Q6IG51bGwgfCBxdWF0ID0gbnVsbCk6IHF1YXQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgcXVhdCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdjAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgdjAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdjAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgdjEwID0gdGhpc1szXVxyXG4gICAgY29uc3QgdjExID0gdGhpc1s0XVxyXG4gICAgY29uc3QgdjEyID0gdGhpc1s1XVxyXG4gICAgY29uc3QgdjIwID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdjIxID0gdGhpc1s3XVxyXG4gICAgY29uc3QgdjIyID0gdGhpc1s4XVxyXG5cclxuICAgIGNvbnN0IHggPSB2MDAgLSB2MTEgLSB2MjJcclxuICAgIGNvbnN0IHkgPSB2MTEgLSB2MDAgLSB2MjJcclxuICAgIGNvbnN0IHogPSB2MjIgLSB2MDAgLSB2MTFcclxuICAgIGNvbnN0IHcgPSB2MDAgKyB2MTEgKyB2MjJcclxuXHJcbiAgICBsZXQgaSA9IDBcclxuICAgIGxldCBmID0gd1xyXG5cclxuICAgIGlmICh4ID4gZikge1xyXG4gICAgICBmID0geFxyXG4gICAgICBpID0gMVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh5ID4gZikge1xyXG4gICAgICBmID0geVxyXG4gICAgICBpID0gMlxyXG4gICAgfVxyXG5cclxuICAgIGlmICh6ID4gZikge1xyXG4gICAgICBmID0gelxyXG4gICAgICBpID0gM1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGIgPSBNYXRoLnNxcnQoZiArIDEpICogMC41XHJcbiAgICBjb25zdCBtID0gMC4yNSAvIGJcclxuXHJcbiAgICBzd2l0Y2ggKGkpIHtcclxuICAgICAgY2FzZSAwOlxyXG4gICAgICAgIGRlc3QudyA9IGJcclxuICAgICAgICBkZXN0LnggPSAodjEyIC0gdjIxKSAqIG1cclxuICAgICAgICBkZXN0LnkgPSAodjIwIC0gdjAyKSAqIG1cclxuICAgICAgICBkZXN0LnogPSAodjAxIC0gdjEwKSAqIG1cclxuXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBkZXN0LncgPSAodjEyIC0gdjIxKSAqIG1cclxuICAgICAgICBkZXN0LnggPSBiXHJcbiAgICAgICAgZGVzdC55ID0gKHYwMSArIHYxMCkgKiBtXHJcbiAgICAgICAgZGVzdC56ID0gKHYyMCArIHYwMikgKiBtXHJcblxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgZGVzdC53ID0gKHYyMCAtIHYwMikgKiBtXHJcbiAgICAgICAgZGVzdC54ID0gKHYwMSArIHYxMCkgKiBtXHJcbiAgICAgICAgZGVzdC55ID0gYlxyXG4gICAgICAgIGRlc3QueiA9ICh2MTIgKyB2MjEpICogbVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSAzOlxyXG4gICAgICAgIGRlc3QudyA9ICh2MDEgLSB2MTApICogbVxyXG4gICAgICAgIGRlc3QueCA9ICh2MjAgKyB2MDIpICogbVxyXG4gICAgICAgIGRlc3QueSA9ICh2MTIgKyB2MjEpICogbVxyXG4gICAgICAgIGRlc3QueiA9IGJcclxuXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG11bHRpcGx5KG0xOiBtYXQzLCBtMjogbWF0MywgZGVzdDogbnVsbCB8IG1hdDMgPSBudWxsKTogbWF0MyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBtYXQzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhMDAgPSBtMVswXVxyXG4gICAgY29uc3QgYTAxID0gbTFbMV1cclxuICAgIGNvbnN0IGEwMiA9IG0xWzJdXHJcbiAgICBjb25zdCBhMTAgPSBtMVszXVxyXG4gICAgY29uc3QgYTExID0gbTFbNF1cclxuICAgIGNvbnN0IGExMiA9IG0xWzVdXHJcbiAgICBjb25zdCBhMjAgPSBtMVs2XVxyXG4gICAgY29uc3QgYTIxID0gbTFbN11cclxuICAgIGNvbnN0IGEyMiA9IG0xWzhdXHJcblxyXG4gICAgY29uc3QgYjAwID0gbTJbMF1cclxuICAgIGNvbnN0IGIwMSA9IG0yWzFdXHJcbiAgICBjb25zdCBiMDIgPSBtMlsyXVxyXG4gICAgY29uc3QgYjEwID0gbTJbM11cclxuICAgIGNvbnN0IGIxMSA9IG0yWzRdXHJcbiAgICBjb25zdCBiMTIgPSBtMls1XVxyXG4gICAgY29uc3QgYjIwID0gbTJbNl1cclxuICAgIGNvbnN0IGIyMSA9IG0yWzddXHJcbiAgICBjb25zdCBiMjIgPSBtMls4XVxyXG5cclxuICAgIGRlc3Quc2V0KFtcclxuICAgICAgYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwLFxyXG4gICAgICBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjEsXHJcbiAgICAgIGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMixcclxuXHJcbiAgICAgIGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCxcclxuICAgICAgYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxLFxyXG4gICAgICBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjIsXHJcblxyXG4gICAgICBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjAsXHJcbiAgICAgIGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMSxcclxuICAgICAgYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyXHJcbiAgICBdKVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbG9va0F0KGV5ZTogdmVjMywgdGFyZ2V0OiB2ZWMzLCB1cDogdmVjMyA9IHZlYzMudXAsIGRlc3Q6IG51bGwgfCBtYXQzID0gbnVsbCk6IG1hdDMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0MygpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGV5ZS5lcXVhbHModGFyZ2V0KSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5pZGVudGl0eS5jb3B5KGRlc3QpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeiA9IHZlYzMuc3VidHJhY3QoZXllLCB0YXJnZXQpLm5vcm1hbGl6ZSgpXHJcblxyXG4gICAgY29uc3QgeCA9IHZlYzMuY3Jvc3ModXAsIHopLm5vcm1hbGl6ZSgpXHJcbiAgICBjb25zdCB5ID0gdmVjMy5jcm9zcyh6LCB4KS5ub3JtYWxpemUoKVxyXG5cclxuICAgIGRlc3Quc2V0KFtcclxuICAgICAgeC54LFxyXG4gICAgICB4LnksXHJcbiAgICAgIHgueixcclxuXHJcbiAgICAgIHkueCxcclxuICAgICAgeS55LFxyXG4gICAgICB5LnosXHJcblxyXG4gICAgICB6LngsXHJcbiAgICAgIHoueSxcclxuICAgICAgei56XHJcbiAgICBdKVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IEVwc2lsb24gfSBmcm9tICcuL2NvbnN0YW50cydcclxuXHJcbmltcG9ydCB7IG1hdDMgfSBmcm9tICcuL21hdDMnXHJcbmltcG9ydCB7IHF1YXQgfSBmcm9tICcuL3F1YXQnXHJcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuL3ZlYzMnXHJcbmltcG9ydCB7IHZlYzQgfSBmcm9tICcuL3ZlYzQnXHJcblxyXG5leHBvcnQgY2xhc3MgbWF0NCBleHRlbmRzIEZsb2F0MzJBcnJheSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHZhbHVlczogbnVtYmVyW10gPSBbXHJcbiAgICAxLjAsIDAuMCwgMC4wLCAwLjAsXHJcbiAgICAwLjAsIDEuMCwgMC4wLCAwLjAsXHJcbiAgICAwLjAsIDAuMCwgMS4wLCAwLjAsXHJcbiAgICAwLjAsIDAuMCwgMC4wLCAxLjBcclxuICBdKSB7XHJcbiAgICBzdXBlcih2YWx1ZXMuc2xpY2UoMCwgMTYpKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IGlkZW50aXR5ID0gbmV3IG1hdDQoKVxyXG5cclxuICBnZXQgZGV0ZXJtaW5hbnQoKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHYwMCA9IHRoaXNbMF1cclxuICAgIGNvbnN0IHYwMSA9IHRoaXNbMV1cclxuICAgIGNvbnN0IHYwMiA9IHRoaXNbMl1cclxuICAgIGNvbnN0IHYwMyA9IHRoaXNbM11cclxuICAgIGNvbnN0IHYxMCA9IHRoaXNbNF1cclxuICAgIGNvbnN0IHYxMSA9IHRoaXNbNV1cclxuICAgIGNvbnN0IHYxMiA9IHRoaXNbNl1cclxuICAgIGNvbnN0IHYxMyA9IHRoaXNbN11cclxuICAgIGNvbnN0IHYyMCA9IHRoaXNbOF1cclxuICAgIGNvbnN0IHYyMSA9IHRoaXNbOV1cclxuICAgIGNvbnN0IHYyMiA9IHRoaXNbMTBdXHJcbiAgICBjb25zdCB2MjMgPSB0aGlzWzExXVxyXG4gICAgY29uc3QgdjMwID0gdGhpc1sxMl1cclxuICAgIGNvbnN0IHYzMSA9IHRoaXNbMTNdXHJcbiAgICBjb25zdCB2MzIgPSB0aGlzWzE0XVxyXG4gICAgY29uc3QgdjMzID0gdGhpc1sxNV1cclxuXHJcbiAgICBjb25zdCBkZXQwMCA9IHYwMCAqIHYxMSAtIHYwMSAqIHYxMFxyXG4gICAgY29uc3QgZGV0MDEgPSB2MDAgKiB2MTIgLSB2MDIgKiB2MTBcclxuICAgIGNvbnN0IGRldDAyID0gdjAwICogdjEzIC0gdjAzICogdjEwXHJcbiAgICBjb25zdCBkZXQwMyA9IHYwMSAqIHYxMiAtIHYwMiAqIHYxMVxyXG4gICAgY29uc3QgZGV0MDQgPSB2MDEgKiB2MTMgLSB2MDMgKiB2MTFcclxuICAgIGNvbnN0IGRldDA1ID0gdjAyICogdjEzIC0gdjAzICogdjEyXHJcbiAgICBjb25zdCBkZXQwNiA9IHYyMCAqIHYzMSAtIHYyMSAqIHYzMFxyXG4gICAgY29uc3QgZGV0MDcgPSB2MjAgKiB2MzIgLSB2MjIgKiB2MzBcclxuICAgIGNvbnN0IGRldDA4ID0gdjIwICogdjMzIC0gdjIzICogdjMwXHJcbiAgICBjb25zdCBkZXQwOSA9IHYyMSAqIHYzMiAtIHYyMiAqIHYzMVxyXG4gICAgY29uc3QgZGV0MTAgPSB2MjEgKiB2MzMgLSB2MjMgKiB2MzFcclxuICAgIGNvbnN0IGRldDExID0gdjIyICogdjMzIC0gdjIzICogdjMyXHJcblxyXG4gICAgcmV0dXJuIGRldDAwICogZGV0MTEgLSBkZXQwMSAqIGRldDEwICsgZGV0MDIgKiBkZXQwOSArIGRldDAzICogZGV0MDggLSBkZXQwNCAqIGRldDA3ICsgZGV0MDUgKiBkZXQwNlxyXG4gIH1cclxuXHJcbiAgY29weShkZXN0OiBudWxsIHwgbWF0NCA9IG51bGwpOiBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDQoKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKykge1xyXG4gICAgICBkZXN0W2ldID0gdGhpc1tpXVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBjb2x1bW4oaW5kZXg6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzW2luZGV4XVxyXG4gICAgZGVzdC55ID0gdGhpc1tpbmRleCArIDRdXHJcbiAgICBkZXN0LnogPSB0aGlzW2luZGV4ICsgOF1cclxuICAgIGRlc3QudyA9IHRoaXNbaW5kZXggKyAxMl1cclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgZXF1YWxzKG90aGVyOiBtYXQ0LCB0aHJlc2hvbGQgPSBFcHNpbG9uKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyspIHtcclxuICAgICAgaWYgKE1hdGguYWJzKHRoaXNbaV0gLSBvdGhlcltpXSkgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlXHJcbiAgfVxyXG5cclxuICByZXNldCgpOiBtYXQ0IHtcclxuICAgIHRoaXNbMF0gPSAxLjBcclxuICAgIHRoaXNbMV0gPSAwLjBcclxuICAgIHRoaXNbMl0gPSAwLjBcclxuICAgIHRoaXNbM10gPSAwLjBcclxuXHJcbiAgICB0aGlzWzRdID0gMC4wXHJcbiAgICB0aGlzWzVdID0gMS4wXHJcbiAgICB0aGlzWzZdID0gMC4wXHJcbiAgICB0aGlzWzddID0gMC4wXHJcblxyXG4gICAgdGhpc1s4XSA9IDAuMFxyXG4gICAgdGhpc1s5XSA9IDAuMFxyXG4gICAgdGhpc1sxMF0gPSAxLjBcclxuICAgIHRoaXNbMTFdID0gMC4wXHJcblxyXG4gICAgdGhpc1sxMl0gPSAwLjBcclxuICAgIHRoaXNbMTNdID0gMC4wXHJcbiAgICB0aGlzWzE0XSA9IDAuMFxyXG4gICAgdGhpc1sxNV0gPSAxLjBcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgdHJhbnNwb3NlKGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdDAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdDAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgdDAzID0gdGhpc1szXVxyXG4gICAgY29uc3QgdDEyID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdDEzID0gdGhpc1s3XVxyXG4gICAgY29uc3QgdDIzID0gdGhpc1sxMV1cclxuXHJcbiAgICBkZXN0WzFdID0gdGhpc1s0XVxyXG4gICAgZGVzdFsyXSA9IHRoaXNbOF1cclxuICAgIGRlc3RbM10gPSB0aGlzWzEyXVxyXG5cclxuICAgIGRlc3RbNF0gPSB0MDFcclxuICAgIGRlc3RbNl0gPSB0aGlzWzldXHJcbiAgICBkZXN0WzddID0gdGhpc1sxM11cclxuXHJcbiAgICBkZXN0WzhdID0gdDAyXHJcbiAgICBkZXN0WzldID0gdDEyXHJcbiAgICBkZXN0WzExXSA9IHRoaXNbMTRdXHJcblxyXG4gICAgZGVzdFsxMl0gPSB0MDNcclxuICAgIGRlc3RbMTNdID0gdDEzXHJcbiAgICBkZXN0WzE0XSA9IHQyM1xyXG5cclxuICAgIGlmIChkZXN0ICE9PSB0aGlzKSB7XHJcbiAgICAgIGRlc3RbMF0gPSB0aGlzWzBdXHJcbiAgICAgIGRlc3RbNV0gPSB0aGlzWzVdXHJcbiAgICAgIGRlc3RbMTBdID0gdGhpc1sxMF1cclxuICAgICAgZGVzdFsxNV0gPSB0aGlzWzE1XVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBpbnZlcnQoZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKTogbnVsbCB8IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdjAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgdjAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdjAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgdjAzID0gdGhpc1szXVxyXG4gICAgY29uc3QgdjEwID0gdGhpc1s0XVxyXG4gICAgY29uc3QgdjExID0gdGhpc1s1XVxyXG4gICAgY29uc3QgdjEyID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdjEzID0gdGhpc1s3XVxyXG4gICAgY29uc3QgdjIwID0gdGhpc1s4XVxyXG4gICAgY29uc3QgdjIxID0gdGhpc1s5XVxyXG4gICAgY29uc3QgdjIyID0gdGhpc1sxMF1cclxuICAgIGNvbnN0IHYyMyA9IHRoaXNbMTFdXHJcbiAgICBjb25zdCB2MzAgPSB0aGlzWzEyXVxyXG4gICAgY29uc3QgdjMxID0gdGhpc1sxM11cclxuICAgIGNvbnN0IHYzMiA9IHRoaXNbMTRdXHJcbiAgICBjb25zdCB2MzMgPSB0aGlzWzE1XVxyXG5cclxuICAgIGNvbnN0IGQwMCA9IHYwMCAqIHYxMSAtIHYwMSAqIHYxMFxyXG4gICAgY29uc3QgZDAxID0gdjAwICogdjEyIC0gdjAyICogdjEwXHJcbiAgICBjb25zdCBkMDIgPSB2MDAgKiB2MTMgLSB2MDMgKiB2MTBcclxuICAgIGNvbnN0IGQwMyA9IHYwMSAqIHYxMiAtIHYwMiAqIHYxMVxyXG4gICAgY29uc3QgZDA0ID0gdjAxICogdjEzIC0gdjAzICogdjExXHJcbiAgICBjb25zdCBkMDUgPSB2MDIgKiB2MTMgLSB2MDMgKiB2MTJcclxuICAgIGNvbnN0IGQwNiA9IHYyMCAqIHYzMSAtIHYyMSAqIHYzMFxyXG4gICAgY29uc3QgZDA3ID0gdjIwICogdjMyIC0gdjIyICogdjMwXHJcbiAgICBjb25zdCBkMDggPSB2MjAgKiB2MzMgLSB2MjMgKiB2MzBcclxuICAgIGNvbnN0IGQwOSA9IHYyMSAqIHYzMiAtIHYyMiAqIHYzMVxyXG4gICAgY29uc3QgZDEwID0gdjIxICogdjMzIC0gdjIzICogdjMxXHJcbiAgICBjb25zdCBkMTEgPSB2MjIgKiB2MzMgLSB2MjMgKiB2MzJcclxuXHJcbiAgICBsZXQgZCA9IGQwMCAqIGQxMSAtIGQwMSAqIGQxMCArIGQwMiAqIGQwOSArIGQwMyAqIGQwOCAtIGQwNCAqIGQwNyArIGQwNSAqIGQwNlxyXG5cclxuICAgIGlmIChkID09PSAwLjApIHtcclxuICAgICAgcmV0dXJuIG51bGxcclxuICAgIH1cclxuXHJcbiAgICBkID0gMS4wIC8gZFxyXG5cclxuICAgIGRlc3RbMF0gPSAodjExICogZDExIC0gdjEyICogZDEwICsgdjEzICogZDA5KSAqIGRcclxuICAgIGRlc3RbMV0gPSAoLXYwMSAqIGQxMSArIHYwMiAqIGQxMCAtIHYwMyAqIGQwOSkgKiBkXHJcbiAgICBkZXN0WzJdID0gKHYzMSAqIGQwNSAtIHYzMiAqIGQwNCArIHYzMyAqIGQwMykgKiBkXHJcbiAgICBkZXN0WzNdID0gKC12MjEgKiBkMDUgKyB2MjIgKiBkMDQgLSB2MjMgKiBkMDMpICogZFxyXG5cclxuICAgIGRlc3RbNF0gPSAoLXYxMCAqIGQxMSArIHYxMiAqIGQwOCAtIHYxMyAqIGQwNykgKiBkXHJcbiAgICBkZXN0WzVdID0gKHYwMCAqIGQxMSAtIHYwMiAqIGQwOCArIHYwMyAqIGQwNykgKiBkXHJcbiAgICBkZXN0WzZdID0gKC12MzAgKiBkMDUgKyB2MzIgKiBkMDIgLSB2MzMgKiBkMDEpICogZFxyXG4gICAgZGVzdFs3XSA9ICh2MjAgKiBkMDUgLSB2MjIgKiBkMDIgKyB2MjMgKiBkMDEpICogZFxyXG5cclxuICAgIGRlc3RbOF0gPSAodjEwICogZDEwIC0gdjExICogZDA4ICsgdjEzICogZDA2KSAqIGRcclxuICAgIGRlc3RbOV0gPSAoLXYwMCAqIGQxMCArIHYwMSAqIGQwOCAtIHYwMyAqIGQwNikgKiBkXHJcbiAgICBkZXN0WzEwXSA9ICh2MzAgKiBkMDQgLSB2MzEgKiBkMDIgKyB2MzMgKiBkMDApICogZFxyXG4gICAgZGVzdFsxMV0gPSAoLXYyMCAqIGQwNCArIHYyMSAqIGQwMiAtIHYyMyAqIGQwMCkgKiBkXHJcblxyXG4gICAgZGVzdFsxMl0gPSAoLXYxMCAqIGQwOSArIHYxMSAqIGQwNyAtIHYxMiAqIGQwNikgKiBkXHJcbiAgICBkZXN0WzEzXSA9ICh2MDAgKiBkMDkgLSB2MDEgKiBkMDcgKyB2MDIgKiBkMDYpICogZFxyXG4gICAgZGVzdFsxNF0gPSAoLXYzMCAqIGQwMyArIHYzMSAqIGQwMSAtIHYzMiAqIGQwMCkgKiBkXHJcbiAgICBkZXN0WzE1XSA9ICh2MjAgKiBkMDMgLSB2MjEgKiBkMDEgKyB2MjIgKiBkMDApICogZFxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBtdWx0aXBseShvdGhlcjogbWF0NCwgZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKTogbWF0NCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhMDAgPSB0aGlzWzBdXHJcbiAgICBjb25zdCBhMDEgPSB0aGlzWzFdXHJcbiAgICBjb25zdCBhMDIgPSB0aGlzWzJdXHJcbiAgICBjb25zdCBhMDMgPSB0aGlzWzNdXHJcbiAgICBjb25zdCBhMTAgPSB0aGlzWzRdXHJcbiAgICBjb25zdCBhMTEgPSB0aGlzWzVdXHJcbiAgICBjb25zdCBhMTIgPSB0aGlzWzZdXHJcbiAgICBjb25zdCBhMTMgPSB0aGlzWzddXHJcbiAgICBjb25zdCBhMjAgPSB0aGlzWzhdXHJcbiAgICBjb25zdCBhMjEgPSB0aGlzWzldXHJcbiAgICBjb25zdCBhMjIgPSB0aGlzWzEwXVxyXG4gICAgY29uc3QgYTIzID0gdGhpc1sxMV1cclxuICAgIGNvbnN0IGEzMCA9IHRoaXNbMTJdXHJcbiAgICBjb25zdCBhMzEgPSB0aGlzWzEzXVxyXG4gICAgY29uc3QgYTMyID0gdGhpc1sxNF1cclxuICAgIGNvbnN0IGEzMyA9IHRoaXNbMTVdXHJcblxyXG4gICAgY29uc3QgYjAwID0gb3RoZXJbMF1cclxuICAgIGNvbnN0IGIwMSA9IG90aGVyWzFdXHJcbiAgICBjb25zdCBiMDIgPSBvdGhlclsyXVxyXG4gICAgY29uc3QgYjAzID0gb3RoZXJbM11cclxuICAgIGNvbnN0IGIxMCA9IG90aGVyWzRdXHJcbiAgICBjb25zdCBiMTEgPSBvdGhlcls1XVxyXG4gICAgY29uc3QgYjEyID0gb3RoZXJbNl1cclxuICAgIGNvbnN0IGIxMyA9IG90aGVyWzddXHJcbiAgICBjb25zdCBiMjAgPSBvdGhlcls4XVxyXG4gICAgY29uc3QgYjIxID0gb3RoZXJbOV1cclxuICAgIGNvbnN0IGIyMiA9IG90aGVyWzEwXVxyXG4gICAgY29uc3QgYjIzID0gb3RoZXJbMTFdXHJcbiAgICBjb25zdCBiMzAgPSBvdGhlclsxMl1cclxuICAgIGNvbnN0IGIzMSA9IG90aGVyWzEzXVxyXG4gICAgY29uc3QgYjMyID0gb3RoZXJbMTRdXHJcbiAgICBjb25zdCBiMzMgPSBvdGhlclsxNV1cclxuXHJcbiAgICBkZXN0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwICsgYjAzICogYTMwXHJcbiAgICBkZXN0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxICsgYjAzICogYTMxXHJcbiAgICBkZXN0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyICsgYjAzICogYTMyXHJcbiAgICBkZXN0WzNdID0gYjAwICogYTAzICsgYjAxICogYTEzICsgYjAyICogYTIzICsgYjAzICogYTMzXHJcblxyXG4gICAgZGVzdFs0XSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCArIGIxMyAqIGEzMFxyXG4gICAgZGVzdFs1XSA9IGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMSArIGIxMyAqIGEzMVxyXG4gICAgZGVzdFs2XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMiArIGIxMyAqIGEzMlxyXG4gICAgZGVzdFs3XSA9IGIxMCAqIGEwMyArIGIxMSAqIGExMyArIGIxMiAqIGEyMyArIGIxMyAqIGEzM1xyXG5cclxuICAgIGRlc3RbOF0gPSBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjAgKyBiMjMgKiBhMzBcclxuICAgIGRlc3RbOV0gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjEgKyBiMjMgKiBhMzFcclxuICAgIGRlc3RbMTBdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyICsgYjIzICogYTMyXHJcbiAgICBkZXN0WzExXSA9IGIyMCAqIGEwMyArIGIyMSAqIGExMyArIGIyMiAqIGEyMyArIGIyMyAqIGEzM1xyXG5cclxuICAgIGRlc3RbMTJdID0gYjMwICogYTAwICsgYjMxICogYTEwICsgYjMyICogYTIwICsgYjMzICogYTMwXHJcbiAgICBkZXN0WzEzXSA9IGIzMCAqIGEwMSArIGIzMSAqIGExMSArIGIzMiAqIGEyMSArIGIzMyAqIGEzMVxyXG4gICAgZGVzdFsxNF0gPSBiMzAgKiBhMDIgKyBiMzEgKiBhMTIgKyBiMzIgKiBhMjIgKyBiMzMgKiBhMzJcclxuICAgIGRlc3RbMTVdID0gYjMwICogYTAzICsgYjMxICogYTEzICsgYjMyICogYTIzICsgYjMzICogYTMzXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHRyYW5zZm9ybSh2ZWN0b3I6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB2ZWN0b3JcclxuXHJcbiAgICBkZXN0LnggPSB0aGlzWzBdICogeCArIHRoaXNbNF0gKiB5ICsgdGhpc1s4XSAqIHogKyB0aGlzWzEyXSAqIHdcclxuICAgIGRlc3QueSA9IHRoaXNbMV0gKiB4ICsgdGhpc1s1XSAqIHkgKyB0aGlzWzldICogeiArIHRoaXNbMTNdICogd1xyXG4gICAgZGVzdC56ID0gdGhpc1syXSAqIHggKyB0aGlzWzZdICogeSArIHRoaXNbMTBdICogeiArIHRoaXNbMTRdICogd1xyXG4gICAgZGVzdC53ID0gdGhpc1szXSAqIHggKyB0aGlzWzddICogeSArIHRoaXNbMTFdICogeiArIHRoaXNbMTVdICogd1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm1WZWMzKHZlY3RvcjogdmVjMywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IHgsIHksIHogfSA9IHZlY3RvclxyXG5cclxuICAgIGRlc3QueCA9IHRoaXNbMF0gKiB4ICsgdGhpc1s0XSAqIHkgKyB0aGlzWzhdICogeiArIHRoaXNbMTJdXHJcbiAgICBkZXN0LnkgPSB0aGlzWzFdICogeCArIHRoaXNbNV0gKiB5ICsgdGhpc1s5XSAqIHogKyB0aGlzWzEzXVxyXG4gICAgZGVzdC56ID0gdGhpc1syXSAqIHggKyB0aGlzWzZdICogeSArIHRoaXNbMTBdICogeiArIHRoaXNbMTRdXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHRvTWF0MyhkZXN0OiBudWxsIHwgbWF0MyA9IG51bGwpOiBtYXQzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDMoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3Quc2V0KFtcclxuICAgICAgdGhpc1swXSxcclxuICAgICAgdGhpc1sxXSxcclxuICAgICAgdGhpc1syXSxcclxuXHJcbiAgICAgIHRoaXNbNF0sXHJcbiAgICAgIHRoaXNbNV0sXHJcbiAgICAgIHRoaXNbNl0sXHJcblxyXG4gICAgICB0aGlzWzhdLFxyXG4gICAgICB0aGlzWzldLFxyXG4gICAgICB0aGlzWzEwXVxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc2NhbGUodmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgbWF0NCA9IG51bGwpOiBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdmVjdG9yXHJcblxyXG4gICAgZGVzdFswXSA9IHRoaXNbMF0gKiB4XHJcbiAgICBkZXN0WzFdID0gdGhpc1sxXSAqIHhcclxuICAgIGRlc3RbMl0gPSB0aGlzWzJdICogeFxyXG4gICAgZGVzdFszXSA9IHRoaXNbM10gKiB4XHJcblxyXG4gICAgZGVzdFs0XSA9IHRoaXNbNF0gKiB5XHJcbiAgICBkZXN0WzVdID0gdGhpc1s1XSAqIHlcclxuICAgIGRlc3RbNl0gPSB0aGlzWzZdICogeVxyXG4gICAgZGVzdFs3XSA9IHRoaXNbN10gKiB5XHJcblxyXG4gICAgZGVzdFs4XSA9IHRoaXNbOF0gKiB6XHJcbiAgICBkZXN0WzldID0gdGhpc1s5XSAqIHpcclxuICAgIGRlc3RbMTBdID0gdGhpc1sxMF0gKiB6XHJcbiAgICBkZXN0WzExXSA9IHRoaXNbMTFdICogelxyXG5cclxuICAgIGlmIChkZXN0ICE9PSB0aGlzKSB7XHJcbiAgICAgIGRlc3RbMTJdID0gdGhpc1sxMl1cclxuICAgICAgZGVzdFsxM10gPSB0aGlzWzEzXVxyXG4gICAgICBkZXN0WzE0XSA9IHRoaXNbMTRdXHJcbiAgICAgIGRlc3RbMTVdID0gdGhpc1sxNV1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgcm90YXRlKGFuZ2xlOiBudW1iZXIsIGF4aXM6IHZlYzMsIGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG51bGwgfCBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB7IHgsIHksIHogfSA9IGF4aXNcclxuXHJcbiAgICBsZXQgbGVuZ3RoID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHJcbiAgICBpZiAoIWxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGlmIChsZW5ndGggIT09IDEpIHtcclxuICAgICAgbGVuZ3RoID0gMSAvIGxlbmd0aFxyXG4gICAgICB4ICo9IGxlbmd0aFxyXG4gICAgICB5ICo9IGxlbmd0aFxyXG4gICAgICB6ICo9IGxlbmd0aFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHMgPSBNYXRoLnNpbihhbmdsZSlcclxuICAgIGNvbnN0IGMgPSBNYXRoLmNvcyhhbmdsZSlcclxuXHJcbiAgICBjb25zdCB0ID0gMS4wIC0gY1xyXG5cclxuICAgIGNvbnN0IGEwMCA9IHRoaXNbMF1cclxuICAgIGNvbnN0IGEwMSA9IHRoaXNbMV1cclxuICAgIGNvbnN0IGEwMiA9IHRoaXNbMl1cclxuICAgIGNvbnN0IGEwMyA9IHRoaXNbM11cclxuICAgIGNvbnN0IGExMCA9IHRoaXNbNF1cclxuICAgIGNvbnN0IGExMSA9IHRoaXNbNV1cclxuICAgIGNvbnN0IGExMiA9IHRoaXNbNl1cclxuICAgIGNvbnN0IGExMyA9IHRoaXNbN11cclxuICAgIGNvbnN0IGEyMCA9IHRoaXNbOF1cclxuICAgIGNvbnN0IGEyMSA9IHRoaXNbOV1cclxuICAgIGNvbnN0IGEyMiA9IHRoaXNbMTBdXHJcbiAgICBjb25zdCBhMjMgPSB0aGlzWzExXVxyXG5cclxuICAgIGNvbnN0IGIwMCA9IHggKiB4ICogdCArIGNcclxuICAgIGNvbnN0IGIwMSA9IHkgKiB4ICogdCArIHogKiBzXHJcbiAgICBjb25zdCBiMDIgPSB6ICogeCAqIHQgLSB5ICogc1xyXG4gICAgY29uc3QgYjEwID0geCAqIHkgKiB0IC0geiAqIHNcclxuICAgIGNvbnN0IGIxMSA9IHkgKiB5ICogdCArIGNcclxuICAgIGNvbnN0IGIxMiA9IHogKiB5ICogdCArIHggKiBzXHJcbiAgICBjb25zdCBiMjAgPSB4ICogeiAqIHQgKyB5ICogc1xyXG4gICAgY29uc3QgYjIxID0geSAqIHogKiB0IC0geCAqIHNcclxuICAgIGNvbnN0IGIyMiA9IHogKiB6ICogdCArIGNcclxuXHJcbiAgICBkZXN0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyXHJcbiAgICBkZXN0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyXHJcbiAgICBkZXN0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyXHJcbiAgICBkZXN0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyXHJcblxyXG4gICAgZGVzdFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMlxyXG4gICAgZGVzdFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMlxyXG4gICAgZGVzdFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMlxyXG4gICAgZGVzdFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMlxyXG5cclxuICAgIGRlc3RbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjJcclxuICAgIGRlc3RbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjJcclxuICAgIGRlc3RbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyXHJcbiAgICBkZXN0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMlxyXG5cclxuICAgIGlmIChkZXN0ICE9PSB0aGlzKSB7XHJcbiAgICAgIGRlc3RbMTJdID0gdGhpc1sxMl1cclxuICAgICAgZGVzdFsxM10gPSB0aGlzWzEzXVxyXG4gICAgICBkZXN0WzE0XSA9IHRoaXNbMTRdXHJcbiAgICAgIGRlc3RbMTVdID0gdGhpc1sxNV1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgdHJhbnNsYXRlKHZlY3RvcjogdmVjMywgZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKTogbWF0NCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB4ID0gdmVjdG9yLnhcclxuICAgIGNvbnN0IHkgPSB2ZWN0b3IueVxyXG4gICAgY29uc3QgeiA9IHZlY3Rvci56XHJcblxyXG4gICAgaWYgKGRlc3QgIT09IHRoaXMpIHtcclxuICAgICAgZm9yIChsZXQgaXQgPSAwOyBpdCA8IDEyOyBpdCsrKSB7XHJcbiAgICAgICAgZGVzdFtpdF0gPSB0aGlzW2l0XVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdFsxMl0gPSB0aGlzWzEyXSArIHRoaXNbMF0gKiB4ICsgdGhpc1s0XSAqIHkgKyB0aGlzWzhdICogelxyXG4gICAgZGVzdFsxM10gPSB0aGlzWzEzXSArIHRoaXNbMV0gKiB4ICsgdGhpc1s1XSAqIHkgKyB0aGlzWzldICogelxyXG4gICAgZGVzdFsxNF0gPSB0aGlzWzE0XSArIHRoaXNbMl0gKiB4ICsgdGhpc1s2XSAqIHkgKyB0aGlzWzEwXSAqIHpcclxuICAgIGRlc3RbMTVdID0gdGhpc1sxNV0gKyB0aGlzWzNdICogeCArIHRoaXNbN10gKiB5ICsgdGhpc1sxMV0gKiB6XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGRlY29tcG9zZSh0cmFuc2xhdGlvbjogdmVjMywgcm90YXRpb246IG1hdDMsIHNjYWxpbmc6IG51bGwgfCB2ZWMzID0gbnVsbCkge1xyXG4gICAgY29uc3QgdjAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgdjAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdjAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgdjEwID0gdGhpc1s0XVxyXG4gICAgY29uc3QgdjExID0gdGhpc1s1XVxyXG4gICAgY29uc3QgdjEyID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdjIwID0gdGhpc1s4XVxyXG4gICAgY29uc3QgdjIxID0gdGhpc1s5XVxyXG4gICAgY29uc3QgdjIyID0gdGhpc1sxMF1cclxuICAgIGNvbnN0IHYzMCA9IHRoaXNbMTJdXHJcbiAgICBjb25zdCB2MzEgPSB0aGlzWzEzXVxyXG4gICAgY29uc3QgdjMyID0gdGhpc1sxNF1cclxuXHJcbiAgICBpZiAoc2NhbGluZyAhPT0gbnVsbCkge1xyXG4gICAgICBzY2FsaW5nLnggPSBNYXRoLnNxcnQodjAwICogdjAwICsgdjAxICogdjAxICsgdjAyICogdjAyKVxyXG4gICAgICBzY2FsaW5nLnkgPSBNYXRoLnNxcnQodjEwICogdjEwICsgdjExICogdjExICsgdjEyICogdjEyKVxyXG4gICAgICBzY2FsaW5nLnogPSBNYXRoLnNxcnQodjIwICogdjIwICsgdjIxICogdjIxICsgdjIyICogdjIyKVxyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0aW9uLnNldChbdjAwLCB2MDEsIHYwMiwgdjEwLCB2MTEsIHYxMiwgdjIwLCB2MjEsIHYyMl0pXHJcblxyXG4gICAgdHJhbnNsYXRpb24ueHl6ID0gW3YzMCwgdjMxLCB2MzJdXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY29uc3RydWN0KHJvdGF0aW9uOiBxdWF0LCB0cmFuc2xhdGlvbjogdmVjMywgZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKSB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBtYXQ0KClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBxeCA9IHJvdGF0aW9uLnhcclxuICAgIGNvbnN0IHF5ID0gcm90YXRpb24ueVxyXG4gICAgY29uc3QgcXogPSByb3RhdGlvbi56XHJcbiAgICBjb25zdCBxdyA9IHJvdGF0aW9uLndcclxuXHJcbiAgICBjb25zdCB2eCA9IHRyYW5zbGF0aW9uLnhcclxuICAgIGNvbnN0IHZ5ID0gdHJhbnNsYXRpb24ueVxyXG4gICAgY29uc3QgdnogPSB0cmFuc2xhdGlvbi56XHJcblxyXG4gICAgY29uc3QgeDIgPSBxeCArIHF4XHJcbiAgICBjb25zdCB5MiA9IHF5ICsgcXlcclxuICAgIGNvbnN0IHoyID0gcXogKyBxelxyXG4gICAgY29uc3QgeHggPSBxeCAqIHgyXHJcbiAgICBjb25zdCB4eSA9IHF4ICogeTJcclxuICAgIGNvbnN0IHh6ID0gcXggKiB6MlxyXG4gICAgY29uc3QgeXkgPSBxeSAqIHkyXHJcbiAgICBjb25zdCB5eiA9IHF5ICogejJcclxuICAgIGNvbnN0IHp6ID0gcXogKiB6MlxyXG4gICAgY29uc3Qgd3ggPSBxdyAqIHgyXHJcbiAgICBjb25zdCB3eSA9IHF3ICogeTJcclxuICAgIGNvbnN0IHd6ID0gcXcgKiB6MlxyXG5cclxuICAgIGRlc3Quc2V0KFtcclxuICAgICAgMS4wIC0gKHl5ICsgenopLFxyXG4gICAgICB4eSArIHd6LFxyXG4gICAgICB4eiAtIHd5LFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICB4eSAtIHd6LFxyXG4gICAgICAxLjAgLSAoeHggKyB6eiksXHJcbiAgICAgIHl6ICsgd3gsXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIHh6ICsgd3ksXHJcbiAgICAgIHl6IC0gd3gsXHJcbiAgICAgIDEuMCAtICh4eCArIHl5KSxcclxuICAgICAgMC4wLFxyXG5cclxuICAgICAgdngsXHJcbiAgICAgIHZ5LFxyXG4gICAgICB2eixcclxuICAgICAgMS4wXHJcbiAgICBdKVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbXVsdGlwbHkobTE6IG1hdDQsIG0yOiBtYXQ0LCBkZXN0OiBudWxsIHwgbWF0NCA9IG51bGwpOiBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDQoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGEwMCA9IG0xWzBdXHJcbiAgICBjb25zdCBhMDEgPSBtMVsxXVxyXG4gICAgY29uc3QgYTAyID0gbTFbMl1cclxuICAgIGNvbnN0IGEwMyA9IG0xWzNdXHJcbiAgICBjb25zdCBhMTAgPSBtMVs0XVxyXG4gICAgY29uc3QgYTExID0gbTFbNV1cclxuICAgIGNvbnN0IGExMiA9IG0xWzZdXHJcbiAgICBjb25zdCBhMTMgPSBtMVs3XVxyXG4gICAgY29uc3QgYTIwID0gbTFbOF1cclxuICAgIGNvbnN0IGEyMSA9IG0xWzldXHJcbiAgICBjb25zdCBhMjIgPSBtMVsxMF1cclxuICAgIGNvbnN0IGEyMyA9IG0xWzExXVxyXG4gICAgY29uc3QgYTMwID0gbTFbMTJdXHJcbiAgICBjb25zdCBhMzEgPSBtMVsxM11cclxuICAgIGNvbnN0IGEzMiA9IG0xWzE0XVxyXG4gICAgY29uc3QgYTMzID0gbTFbMTVdXHJcblxyXG4gICAgY29uc3QgYjAwID0gbTJbMF1cclxuICAgIGNvbnN0IGIwMSA9IG0yWzFdXHJcbiAgICBjb25zdCBiMDIgPSBtMlsyXVxyXG4gICAgY29uc3QgYjAzID0gbTJbM11cclxuICAgIGNvbnN0IGIxMCA9IG0yWzRdXHJcbiAgICBjb25zdCBiMTEgPSBtMls1XVxyXG4gICAgY29uc3QgYjEyID0gbTJbNl1cclxuICAgIGNvbnN0IGIxMyA9IG0yWzddXHJcbiAgICBjb25zdCBiMjAgPSBtMls4XVxyXG4gICAgY29uc3QgYjIxID0gbTJbOV1cclxuICAgIGNvbnN0IGIyMiA9IG0yWzEwXVxyXG4gICAgY29uc3QgYjIzID0gbTJbMTFdXHJcbiAgICBjb25zdCBiMzAgPSBtMlsxMl1cclxuICAgIGNvbnN0IGIzMSA9IG0yWzEzXVxyXG4gICAgY29uc3QgYjMyID0gbTJbMTRdXHJcbiAgICBjb25zdCBiMzMgPSBtMlsxNV1cclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMCArIGIwMyAqIGEzMCxcclxuICAgICAgYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxICsgYjAzICogYTMxLFxyXG4gICAgICBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjIgKyBiMDMgKiBhMzIsXHJcbiAgICAgIGIwMCAqIGEwMyArIGIwMSAqIGExMyArIGIwMiAqIGEyMyArIGIwMyAqIGEzMyxcclxuXHJcbiAgICAgIGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCArIGIxMyAqIGEzMCxcclxuICAgICAgYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxICsgYjEzICogYTMxLFxyXG4gICAgICBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjIgKyBiMTMgKiBhMzIsXHJcbiAgICAgIGIxMCAqIGEwMyArIGIxMSAqIGExMyArIGIxMiAqIGEyMyArIGIxMyAqIGEzMyxcclxuXHJcbiAgICAgIGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMCArIGIyMyAqIGEzMCxcclxuICAgICAgYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxICsgYjIzICogYTMxLFxyXG4gICAgICBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjIgKyBiMjMgKiBhMzIsXHJcbiAgICAgIGIyMCAqIGEwMyArIGIyMSAqIGExMyArIGIyMiAqIGEyMyArIGIyMyAqIGEzMyxcclxuXHJcbiAgICAgIGIzMCAqIGEwMCArIGIzMSAqIGExMCArIGIzMiAqIGEyMCArIGIzMyAqIGEzMCxcclxuICAgICAgYjMwICogYTAxICsgYjMxICogYTExICsgYjMyICogYTIxICsgYjMzICogYTMxLFxyXG4gICAgICBiMzAgKiBhMDIgKyBiMzEgKiBhMTIgKyBiMzIgKiBhMjIgKyBiMzMgKiBhMzIsXHJcbiAgICAgIGIzMCAqIGEwMyArIGIzMSAqIGExMyArIGIzMiAqIGEyMyArIGIzMyAqIGEzM1xyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZydXN0dW0obGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyLCBib3R0b206IG51bWJlciwgdG9wOiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIsIGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0NCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmwgPSByaWdodCAtIGxlZnRcclxuICAgIGNvbnN0IHRiID0gdG9wIC0gYm90dG9tXHJcbiAgICBjb25zdCBmbiA9IGZhciAtIG5lYXJcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIChuZWFyICogMi4wKSAvIHJsLFxyXG4gICAgICAwLjAsXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG5cclxuICAgICAgMC4wLFxyXG4gICAgICAobmVhciAqIDIuMCkgLyB0YixcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAocmlnaHQgKyBsZWZ0KSAvIHJsLFxyXG4gICAgICAodG9wICsgYm90dG9tKSAvIHRiLFxyXG4gICAgICAtKGZhciArIG5lYXIpIC8gZm4sXHJcbiAgICAgIC0xLjAsXHJcblxyXG4gICAgICAwLjAsXHJcbiAgICAgIDAuMCxcclxuICAgICAgLShmYXIgKiBuZWFyICogMi4wKSAvIGZuLFxyXG4gICAgICAwLjBcclxuICAgIF0pXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBwZXJzcGVjdGl2ZShmb3Y6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIsIGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0NCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdG9wID0gbmVhciAqIE1hdGgudGFuKChmb3YgKiBNYXRoLlBJKSAvIDM2MC4wKVxyXG4gICAgY29uc3QgcmlnaHQgPSB0b3AgKiBhc3BlY3RcclxuXHJcbiAgICByZXR1cm4gbWF0NC5mcnVzdHVtKC1yaWdodCwgcmlnaHQsIC10b3AsIHRvcCwgbmVhciwgZmFyLCBkZXN0KVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG9ydGhvZ3JhcGhpYyhsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIsIGJvdHRvbTogbnVtYmVyLCB0b3A6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlciwgZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKTogbWF0NCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBtYXQ0KClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBybCA9IHJpZ2h0IC0gbGVmdFxyXG4gICAgY29uc3QgdGIgPSB0b3AgLSBib3R0b21cclxuICAgIGNvbnN0IGZuID0gZmFyIC0gbmVhclxyXG5cclxuICAgIGRlc3Quc2V0KFtcclxuICAgICAgMi4wIC8gcmwsXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAwLjAsXHJcbiAgICAgIDIgLyB0YixcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAwLjAsXHJcbiAgICAgIDAuMCxcclxuICAgICAgLTIuMCAvIGZuLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAtKGxlZnQgKyByaWdodCkgLyBybCxcclxuICAgICAgLSh0b3AgKyBib3R0b20pIC8gdGIsXHJcbiAgICAgIC0oZmFyICsgbmVhcikgLyBmbixcclxuICAgICAgMS4wXHJcbiAgICBdKVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcmVmbGVjdGlvbihwbGFuZTogdmVjNCwgZGVzdD86IG1hdDQpIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDQoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHh4ID0gcGxhbmUueCAqIHBsYW5lLnhcclxuICAgIGNvbnN0IHh5ID0gcGxhbmUueCAqIHBsYW5lLnlcclxuICAgIGNvbnN0IHh6ID0gcGxhbmUueCAqIHBsYW5lLnpcclxuICAgIGNvbnN0IHh3ID0gcGxhbmUueCAqIHBsYW5lLndcclxuICAgIGNvbnN0IHl5ID0gcGxhbmUueSAqIHBsYW5lLnlcclxuICAgIGNvbnN0IHl6ID0gcGxhbmUueSAqIHBsYW5lLnpcclxuICAgIGNvbnN0IHl3ID0gcGxhbmUueSAqIHBsYW5lLndcclxuICAgIGNvbnN0IHp6ID0gcGxhbmUueiAqIHBsYW5lLnpcclxuICAgIGNvbnN0IHp3ID0gcGxhbmUueiAqIHBsYW5lLndcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIDEuMCAtIDIuMCAqIHh4LFxyXG4gICAgICAtMi4wICogeHksXHJcbiAgICAgIC0yLjAgKiB4eixcclxuICAgICAgLTIuMCAqIHh3LFxyXG5cclxuICAgICAgLTIuMCAqIHh5LFxyXG4gICAgICAxLjAgLSAyLjAgKiB5eSxcclxuICAgICAgLTIuMCAqIHl6LFxyXG4gICAgICAtMi4wICogeXcsXHJcblxyXG4gICAgICAtMi4wICogeHosXHJcbiAgICAgIC0yLjAgKiB5eixcclxuICAgICAgMS4wIC0gMi4wICogenosXHJcbiAgICAgIC0yLjAgKiB6dyxcclxuXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcbiAgICAgIDEuMFxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGxvb2tBdChleWU6IHZlYzMsIHRhcmdldDogdmVjMywgdXA6IHZlYzMgPSB2ZWMzLnVwLCBkZXN0OiBudWxsIHwgbWF0NCA9IG51bGwpOiBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDQoKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChleWUuZXF1YWxzKHRhcmdldCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkuY29weShkZXN0KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHogPSB2ZWMzLnN1YnRyYWN0KGV5ZSwgdGFyZ2V0KS5ub3JtYWxpemUoKVxyXG5cclxuICAgIGNvbnN0IHggPSB2ZWMzLmNyb3NzKHVwLCB6KS5ub3JtYWxpemUoKVxyXG4gICAgY29uc3QgeSA9IHZlYzMuY3Jvc3MoeiwgeCkubm9ybWFsaXplKClcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIHgueCxcclxuICAgICAgeC55LFxyXG4gICAgICB4LnosXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIHkueCxcclxuICAgICAgeS55LFxyXG4gICAgICB5LnosXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIHoueCxcclxuICAgICAgei55LFxyXG4gICAgICB6LnosXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIGV5ZS54LFxyXG4gICAgICBleWUueSxcclxuICAgICAgZXllLnosXHJcbiAgICAgIDEuMFxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnXHJcblxyXG5pbXBvcnQgeyBtYXQzIH0gZnJvbSAnLi9tYXQzJ1xyXG5pbXBvcnQgeyBtYXQ0IH0gZnJvbSAnLi9tYXQ0J1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi92ZWMzJ1xyXG5cclxuZXhwb3J0IGNsYXNzIHF1YXQgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih2YWx1ZXM6IG51bWJlcltdID0gWzAuMCwgMC4wLCAwLjAsIDEuMF0pIHtcclxuICAgIHN1cGVyKHZhbHVlcy5zbGljZSgwLCA0KSlcclxuICB9XHJcblxyXG4gIHN0YXRpYyByZWFkb25seSBpZGVudGl0eSA9IG5ldyBxdWF0KClcclxuXHJcbiAgZ2V0IHgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzBdXHJcbiAgfVxyXG5cclxuICBzZXQgeCh4OiBudW1iZXIpIHtcclxuICAgIHRoaXNbMF0gPSB4XHJcbiAgfVxyXG5cclxuICBnZXQgeSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbMV1cclxuICB9XHJcblxyXG4gIHNldCB5KHk6IG51bWJlcikge1xyXG4gICAgdGhpc1sxXSA9IHlcclxuICB9XHJcblxyXG4gIGdldCB6KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1syXVxyXG4gIH1cclxuXHJcbiAgc2V0IHooejogbnVtYmVyKSB7XHJcbiAgICB0aGlzWzJdID0gelxyXG4gIH1cclxuXHJcbiAgZ2V0IHcoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzNdXHJcbiAgfVxyXG5cclxuICBzZXQgdyh3OiBudW1iZXIpIHtcclxuICAgIHRoaXNbM10gPSB3XHJcbiAgfVxyXG5cclxuICBnZXQgeWF3KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5hc2luKDIuMCAqICh0aGlzLnggKiB0aGlzLnogLSB0aGlzLncgKiB0aGlzLnkpKVxyXG4gIH1cclxuXHJcbiAgc2V0IHlhdyh5YXc6IG51bWJlcikge1xyXG4gICAgcXVhdC5mcm9tRXVsZXJBbmdsZXMoeWF3LCB0aGlzLnBpdGNoLCB0aGlzLnJvbGwsIHRoaXMpXHJcbiAgfVxyXG5cclxuICBnZXQgcGl0Y2goKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHggPSB0aGlzLnhcclxuICAgIGNvbnN0IHkgPSB0aGlzLnlcclxuICAgIGNvbnN0IHogPSB0aGlzLnpcclxuICAgIGNvbnN0IHcgPSB0aGlzLndcclxuXHJcbiAgICByZXR1cm4gTWF0aC5hdGFuMigyLjAgKiAoeSAqIHogKyB3ICogeCksIHcgKiB3IC0geCAqIHggLSB5ICogeSArIHogKiB6KVxyXG4gIH1cclxuXHJcbiAgc2V0IHBpdGNoKHBpdGNoOiBudW1iZXIpIHtcclxuICAgIHF1YXQuZnJvbUV1bGVyQW5nbGVzKHRoaXMueWF3LCBwaXRjaCwgdGhpcy5yb2xsLCB0aGlzKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHJvbGwoKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHggPSB0aGlzLnhcclxuICAgIGNvbnN0IHkgPSB0aGlzLnlcclxuICAgIGNvbnN0IHogPSB0aGlzLnpcclxuICAgIGNvbnN0IHcgPSB0aGlzLndcclxuXHJcbiAgICByZXR1cm4gTWF0aC5hdGFuMigyLjAgKiAoeCAqIHkgKyB3ICogeiksIHcgKiB3ICsgeCAqIHggLSB5ICogeSAtIHogKiB6KVxyXG4gIH1cclxuXHJcbiAgc2V0IHJvbGwocm9sbDogbnVtYmVyKSB7XHJcbiAgICBxdWF0LmZyb21FdWxlckFuZ2xlcyh0aGlzLnlhdywgdGhpcy5waXRjaCwgcm9sbCwgdGhpcylcclxuICB9XHJcblxyXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5zcXVhcmVkTGVuZ3RoKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHNxdWFyZWRMZW5ndGgoKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHggPSB0aGlzLnhcclxuICAgIGNvbnN0IHkgPSB0aGlzLnlcclxuICAgIGNvbnN0IHogPSB0aGlzLnpcclxuICAgIGNvbnN0IHcgPSB0aGlzLndcclxuXHJcbiAgICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHdcclxuICB9XHJcblxyXG4gIGNvcHkoZGVzdDogbnVsbCB8IHF1YXQgPSBudWxsKTogcXVhdCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBxdWF0KClcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICBkZXN0W2ldID0gdGhpc1tpXVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICByZXNldCgpOiBxdWF0IHtcclxuICAgIHRoaXMueCA9IDAuMFxyXG4gICAgdGhpcy55ID0gMC4wXHJcbiAgICB0aGlzLnogPSAwLjBcclxuICAgIHRoaXMudyA9IDEuMFxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBjYWxjdWxhdGVXKCk6IHF1YXQge1xyXG4gICAgY29uc3QgeCA9IHRoaXMueFxyXG4gICAgY29uc3QgeSA9IHRoaXMueVxyXG4gICAgY29uc3QgeiA9IHRoaXMuelxyXG5cclxuICAgIHRoaXMudyA9IC1NYXRoLnNxcnQoTWF0aC5hYnMoMS4wIC0geCAqIHggLSB5ICogeSAtIHogKiB6KSlcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgaW52ZXJ0KGRlc3Q6IG51bGwgfCBxdWF0ID0gbnVsbCk6IHF1YXQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZG90ID0gcXVhdC5kb3QodGhpcywgdGhpcylcclxuXHJcbiAgICBpZiAoIWRvdCkge1xyXG4gICAgICBkZXN0LnNldChbMC4wLCAwLjAsIDAuMCwgMC4wXSlcclxuXHJcbiAgICAgIHJldHVybiBkZXN0XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW52RG90ID0gZG90ID8gMS4wIC8gZG90IDogMC4wXHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICogLWludkRvdFxyXG4gICAgZGVzdC55ID0gdGhpcy55ICogLWludkRvdFxyXG4gICAgZGVzdC56ID0gdGhpcy56ICogLWludkRvdFxyXG4gICAgZGVzdC53ID0gdGhpcy53ICogaW52RG90XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGNvbmp1Z2F0ZShkZXN0OiBudWxsIHwgcXVhdCA9IG51bGwpOiBxdWF0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAqIC0xXHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiAtMVxyXG4gICAgZGVzdC56ID0gdGhpcy56ICogLTFcclxuICAgIGRlc3QudyA9IHRoaXMud1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBub3JtYWxpemUoZGVzdDogbnVsbCB8IHF1YXQgPSBudWxsKTogcXVhdCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB4ID0gdGhpcy54XHJcbiAgICBjb25zdCB5ID0gdGhpcy55XHJcbiAgICBjb25zdCB6ID0gdGhpcy56XHJcbiAgICBjb25zdCB3ID0gdGhpcy53XHJcblxyXG4gICAgbGV0IGxlbmd0aCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdylcclxuXHJcbiAgICBpZiAoIWxlbmd0aCkge1xyXG4gICAgICBkZXN0LnggPSAwXHJcbiAgICAgIGRlc3QueSA9IDBcclxuICAgICAgZGVzdC56ID0gMFxyXG4gICAgICBkZXN0LncgPSAwXHJcblxyXG4gICAgICByZXR1cm4gZGVzdFxyXG4gICAgfVxyXG5cclxuICAgIGxlbmd0aCA9IDEgLyBsZW5ndGhcclxuXHJcbiAgICBkZXN0LnggPSB4ICogbGVuZ3RoXHJcbiAgICBkZXN0LnkgPSB5ICogbGVuZ3RoXHJcbiAgICBkZXN0LnogPSB6ICogbGVuZ3RoXHJcbiAgICBkZXN0LncgPSB3ICogbGVuZ3RoXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGVxdWFscyhxOiBxdWF0LCB0aHJlc2hvbGQgPSBFcHNpbG9uKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoTWF0aC5hYnModGhpcy54IC0gcS54KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoTWF0aC5hYnModGhpcy55IC0gcS55KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoTWF0aC5hYnModGhpcy56IC0gcS56KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoTWF0aC5hYnModGhpcy53IC0gcS53KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYWRkKG90aGVyOiBxdWF0LCBkZXN0OiBudWxsIHwgcXVhdCA9IG51bGwpOiBxdWF0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCArIG90aGVyLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSArIG90aGVyLnlcclxuICAgIGRlc3QueiA9IHRoaXMueiArIG90aGVyLnpcclxuICAgIGRlc3QudyA9IHRoaXMudyArIG90aGVyLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbXVsdGlwbHkob3RoZXI6IHF1YXQsIGRlc3Q6IG51bGwgfCBxdWF0ID0gbnVsbCk6IHF1YXQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcTF4ID0gdGhpcy54XHJcbiAgICBjb25zdCBxMXkgPSB0aGlzLnlcclxuICAgIGNvbnN0IHExeiA9IHRoaXMuelxyXG4gICAgY29uc3QgcTF3ID0gdGhpcy53XHJcblxyXG4gICAgY29uc3QgcTJ4ID0gb3RoZXIueFxyXG4gICAgY29uc3QgcTJ5ID0gb3RoZXIueVxyXG4gICAgY29uc3QgcTJ6ID0gb3RoZXIuelxyXG4gICAgY29uc3QgcTJ3ID0gb3RoZXIud1xyXG5cclxuICAgIGRlc3QueCA9IHExeCAqIHEydyArIHExdyAqIHEyeCArIHExeSAqIHEyeiAtIHExeiAqIHEyeVxyXG4gICAgZGVzdC55ID0gcTF5ICogcTJ3ICsgcTF3ICogcTJ5ICsgcTF6ICogcTJ4IC0gcTF4ICogcTJ6XHJcbiAgICBkZXN0LnogPSBxMXogKiBxMncgKyBxMXcgKiBxMnogKyBxMXggKiBxMnkgLSBxMXkgKiBxMnhcclxuICAgIGRlc3QudyA9IHExdyAqIHEydyAtIHExeCAqIHEyeCAtIHExeSAqIHEyeSAtIHExeiAqIHEyelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICB0b01hdDMoZGVzdDogbnVsbCB8IG1hdDMgPSBudWxsKTogbWF0MyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBtYXQzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB4ID0gdGhpcy54XHJcbiAgICBjb25zdCB5ID0gdGhpcy55XHJcbiAgICBjb25zdCB6ID0gdGhpcy56XHJcbiAgICBjb25zdCB3ID0gdGhpcy53XHJcblxyXG4gICAgY29uc3QgeDIgPSB4ICsgeFxyXG4gICAgY29uc3QgeTIgPSB5ICsgeVxyXG4gICAgY29uc3QgejIgPSB6ICsgelxyXG5cclxuICAgIGNvbnN0IHh4ID0geCAqIHgyXHJcbiAgICBjb25zdCB4eSA9IHggKiB5MlxyXG4gICAgY29uc3QgeHogPSB4ICogejJcclxuICAgIGNvbnN0IHl5ID0geSAqIHkyXHJcbiAgICBjb25zdCB5eiA9IHkgKiB6MlxyXG4gICAgY29uc3QgenogPSB6ICogejJcclxuICAgIGNvbnN0IHd4ID0gdyAqIHgyXHJcbiAgICBjb25zdCB3eSA9IHcgKiB5MlxyXG4gICAgY29uc3Qgd3ogPSB3ICogejJcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIDEuMCAtICh5eSArIHp6KSxcclxuICAgICAgeHkgKyB3eixcclxuICAgICAgeHogLSB3eSxcclxuXHJcbiAgICAgIHh5IC0gd3osXHJcbiAgICAgIDEuMCAtICh4eCArIHp6KSxcclxuICAgICAgeXogKyB3eCxcclxuXHJcbiAgICAgIHh6ICsgd3ksXHJcbiAgICAgIHl6IC0gd3gsXHJcbiAgICAgIDEuMCAtICh4eCArIHl5KVxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgdG9NYXQ0KGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0NCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeCA9IHRoaXMueFxyXG4gICAgY29uc3QgeSA9IHRoaXMueVxyXG4gICAgY29uc3QgeiA9IHRoaXMuelxyXG4gICAgY29uc3QgdyA9IHRoaXMud1xyXG5cclxuICAgIGNvbnN0IHgyID0geCArIHhcclxuICAgIGNvbnN0IHkyID0geSArIHlcclxuICAgIGNvbnN0IHoyID0geiArIHpcclxuXHJcbiAgICBjb25zdCB4eCA9IHggKiB4MlxyXG4gICAgY29uc3QgeHkgPSB4ICogeTJcclxuICAgIGNvbnN0IHh6ID0geCAqIHoyXHJcbiAgICBjb25zdCB5eSA9IHkgKiB5MlxyXG4gICAgY29uc3QgeXogPSB5ICogejJcclxuICAgIGNvbnN0IHp6ID0geiAqIHoyXHJcbiAgICBjb25zdCB3eCA9IHcgKiB4MlxyXG4gICAgY29uc3Qgd3kgPSB3ICogeTJcclxuICAgIGNvbnN0IHd6ID0gdyAqIHoyXHJcblxyXG4gICAgZGVzdC5zZXQoW1xyXG4gICAgICAxLjAgLSAoeXkgKyB6eiksXHJcbiAgICAgIHh5ICsgd3osXHJcbiAgICAgIHh6IC0gd3ksXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIHh5IC0gd3osXHJcbiAgICAgIDEuMCAtICh4eCArIHp6KSxcclxuICAgICAgeXogKyB3eCxcclxuICAgICAgMC4wLFxyXG5cclxuICAgICAgeHogKyB3eSxcclxuICAgICAgeXogLSB3eCxcclxuICAgICAgMS4wIC0gKHh4ICsgeXkpLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAwLjAsXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG4gICAgICAxLjBcclxuICAgIF0pXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBkb3QocTE6IHF1YXQsIHEyOiBxdWF0KTogbnVtYmVyIHtcclxuICAgIHJldHVybiBxMS54ICogcTIueCArIHExLnkgKiBxMi55ICsgcTEueiAqIHEyLnogKyBxMS53ICogcTIud1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGFkZChxMTogcXVhdCwgcTI6IHF1YXQsIGRlc3Q6IG51bGwgfCBxdWF0ID0gbnVsbCk6IHF1YXQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgcXVhdCgpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gcTEueCArIHEyLnhcclxuICAgIGRlc3QueSA9IHExLnkgKyBxMi55XHJcbiAgICBkZXN0LnogPSBxMS56ICsgcTIuelxyXG4gICAgZGVzdC53ID0gcTEudyArIHEyLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG11bHRpcGx5KHExOiBxdWF0LCBxMjogcXVhdCwgZGVzdDogbnVsbCB8IHF1YXQgPSBudWxsKTogcXVhdCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBxdWF0KClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBxMXggPSBxMS54XHJcbiAgICBjb25zdCBxMXkgPSBxMS55XHJcbiAgICBjb25zdCBxMXogPSBxMS56XHJcbiAgICBjb25zdCBxMXcgPSBxMS53XHJcblxyXG4gICAgY29uc3QgcTJ4ID0gcTIueFxyXG4gICAgY29uc3QgcTJ5ID0gcTIueVxyXG4gICAgY29uc3QgcTJ6ID0gcTIuelxyXG4gICAgY29uc3QgcTJ3ID0gcTIud1xyXG5cclxuICAgIGRlc3QueCA9IHExeCAqIHEydyArIHExdyAqIHEyeCArIHExeSAqIHEyeiAtIHExeiAqIHEyeVxyXG4gICAgZGVzdC55ID0gcTF5ICogcTJ3ICsgcTF3ICogcTJ5ICsgcTF6ICogcTJ4IC0gcTF4ICogcTJ6XHJcbiAgICBkZXN0LnogPSBxMXogKiBxMncgKyBxMXcgKiBxMnogKyBxMXggKiBxMnkgLSBxMXkgKiBxMnhcclxuICAgIGRlc3QudyA9IHExdyAqIHEydyAtIHExeCAqIHEyeCAtIHExeSAqIHEyeSAtIHExeiAqIHEyelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY3Jvc3MocTE6IHF1YXQsIHEyOiBxdWF0LCBkZXN0OiBudWxsIHwgcXVhdCA9IG51bGwpOiBxdWF0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHF1YXQoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHExeCA9IHExLnhcclxuICAgIGNvbnN0IHExeSA9IHExLnlcclxuICAgIGNvbnN0IHExeiA9IHExLnpcclxuICAgIGNvbnN0IHExdyA9IHExLndcclxuXHJcbiAgICBjb25zdCBxMnggPSBxMi54XHJcbiAgICBjb25zdCBxMnkgPSBxMi55XHJcbiAgICBjb25zdCBxMnogPSBxMi56XHJcbiAgICBjb25zdCBxMncgPSBxMi53XHJcblxyXG4gICAgZGVzdC54ID0gcTF3ICogcTJ6ICsgcTF6ICogcTJ3ICsgcTF4ICogcTJ5IC0gcTF5ICogcTJ4XHJcbiAgICBkZXN0LnkgPSBxMXcgKiBxMncgLSBxMXggKiBxMnggLSBxMXkgKiBxMnkgLSBxMXogKiBxMnpcclxuICAgIGRlc3QueiA9IHExdyAqIHEyeCArIHExeCAqIHEydyArIHExeSAqIHEyeiAtIHExeiAqIHEyeVxyXG4gICAgZGVzdC53ID0gcTF3ICogcTJ5ICsgcTF5ICogcTJ3ICsgcTF6ICogcTJ4IC0gcTF4ICogcTJ6XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtaXgocTE6IHF1YXQsIHEyOiBxdWF0LCB0aW1lOiBudW1iZXIsIGRlc3Q6IG51bGwgfCBxdWF0ID0gbnVsbCk6IHF1YXQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgcXVhdCgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRpbWUgPD0gMC4wKSB7XHJcbiAgICAgIHExLmNvcHkoZGVzdClcclxuXHJcbiAgICAgIHJldHVybiBkZXN0XHJcbiAgICB9IGVsc2UgaWYgKHRpbWUgPj0gMS4wKSB7XHJcbiAgICAgIHEyLmNvcHkoZGVzdClcclxuXHJcbiAgICAgIHJldHVybiBkZXN0XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGNvcyA9IHF1YXQuZG90KHExLCBxMilcclxuICAgIGNvbnN0IHEyYSA9IHEyLmNvcHkoZGVzdClcclxuXHJcbiAgICBpZiAoY29zIDwgMC4wKSB7XHJcbiAgICAgIHEyYS5pbnZlcnQoKVxyXG4gICAgICBjb3MgPSAtY29zXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGswOiBudW1iZXJcclxuICAgIGxldCBrMTogbnVtYmVyXHJcblxyXG4gICAgaWYgKGNvcyA+IDEgLSBFcHNpbG9uKSB7XHJcbiAgICAgIGswID0gMSAtIHRpbWVcclxuICAgICAgazEgPSAwICsgdGltZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3Qgc2luOiBudW1iZXIgPSBNYXRoLnNxcnQoMSAtIGNvcyAqIGNvcylcclxuICAgICAgY29uc3QgYW5nbGU6IG51bWJlciA9IE1hdGguYXRhbjIoc2luLCBjb3MpXHJcblxyXG4gICAgICBjb25zdCBvbmVPdmVyU2luOiBudW1iZXIgPSAxIC8gc2luXHJcblxyXG4gICAgICBrMCA9IE1hdGguc2luKCgxIC0gdGltZSkgKiBhbmdsZSkgKiBvbmVPdmVyU2luXHJcbiAgICAgIGsxID0gTWF0aC5zaW4oKDAgKyB0aW1lKSAqIGFuZ2xlKSAqIG9uZU92ZXJTaW5cclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSBrMCAqIHExLnggKyBrMSAqIHEyYS54XHJcbiAgICBkZXN0LnkgPSBrMCAqIHExLnkgKyBrMSAqIHEyYS55XHJcbiAgICBkZXN0LnogPSBrMCAqIHExLnogKyBrMSAqIHEyYS56XHJcbiAgICBkZXN0LncgPSBrMCAqIHExLncgKyBrMSAqIHEyYS53XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBmcm9tQXhpc0FuZ2xlKGF4aXM6IHZlYzMsIGFuZ2xlOiBudW1iZXIsIGRlc3Q6IG51bGwgfCBxdWF0ID0gbnVsbCk6IHF1YXQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgcXVhdCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYSA9IGFuZ2xlICogMC41XHJcbiAgICBjb25zdCBzaW4gPSBNYXRoLnNpbihhKVxyXG5cclxuICAgIGRlc3QueCA9IGF4aXMueCAqIHNpblxyXG4gICAgZGVzdC55ID0gYXhpcy55ICogc2luXHJcbiAgICBkZXN0LnogPSBheGlzLnogKiBzaW5cclxuICAgIGRlc3QudyA9IE1hdGguY29zKGEpXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBmcm9tRXVsZXJBbmdsZXMoeWF3OiBudW1iZXIsIHBpdGNoOiBudW1iZXIsIHJvbGw6IG51bWJlciwgZGVzdDogbnVsbCB8IHF1YXQgPSBudWxsKTogcXVhdCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBxdWF0KClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB5ID0geWF3ICogMC41XHJcbiAgICBjb25zdCByID0gcm9sbCAqIDAuNVxyXG4gICAgY29uc3QgcCA9IHBpdGNoICogMC41XHJcblxyXG4gICAgY29uc3QgYzEgPSBNYXRoLmNvcyh5KVxyXG4gICAgY29uc3QgczEgPSBNYXRoLnNpbih5KVxyXG4gICAgY29uc3QgYzIgPSBNYXRoLmNvcyhyKVxyXG4gICAgY29uc3QgczIgPSBNYXRoLnNpbihyKVxyXG4gICAgY29uc3QgYzMgPSBNYXRoLmNvcyhwKVxyXG4gICAgY29uc3QgczMgPSBNYXRoLnNpbihwKVxyXG5cclxuICAgIGNvbnN0IGMxYzIgPSBjMSAqIGMyXHJcbiAgICBjb25zdCBzMXMyID0gczEgKiBzMlxyXG5cclxuICAgIGRlc3QueCA9IGMxYzIgKiBzMyArIHMxczIgKiBjM1xyXG4gICAgZGVzdC55ID0gczEgKiBjMiAqIGMzICsgYzEgKiBzMiAqIHMzXHJcbiAgICBkZXN0LnogPSBjMSAqIHMyICogYzMgLSBzMSAqIGMyICogczNcclxuICAgIGRlc3QudyA9IGMxYzIgKiBjMyAtIHMxczIgKiBzM1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IEVwc2lsb24gfSBmcm9tICcuL2NvbnN0YW50cydcclxuaW1wb3J0IHsgbWF0MyB9IGZyb20gJy4vbWF0MydcclxuXHJcbmNvbnN0IHsgYWJzLCBzcXJ0IH0gPSBNYXRoXHJcblxyXG5leHBvcnQgY2xhc3MgdmVjMyBleHRlbmRzIEZsb2F0MzJBcnJheSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHZhbHVlczogbnVtYmVyW10gPSBbMC4wLCAwLjAsIDAuMF0pIHtcclxuICAgIHN1cGVyKHZhbHVlcy5zbGljZSgwLCAzKSlcclxuICB9XHJcblxyXG4gIHN0YXRpYyByZWFkb25seSB6ZXJvID0gbmV3IHZlYzMoWzAuMCwgMC4wLCAwLjBdKVxyXG4gIHN0YXRpYyByZWFkb25seSBvbmUgPSBuZXcgdmVjMyhbMS4wLCAxLjAsIDEuMF0pXHJcblxyXG4gIHN0YXRpYyByZWFkb25seSB1cCA9IG5ldyB2ZWMzKFswLjAsIDEuMCwgMC4wXSlcclxuICBzdGF0aWMgcmVhZG9ubHkgcmlnaHQgPSBuZXcgdmVjMyhbMS4wLCAwLjAsIDAuMF0pXHJcbiAgc3RhdGljIHJlYWRvbmx5IGZvcndhcmQgPSBuZXcgdmVjMyhbMC4wLCAwLjAsIDEuMF0pXHJcblxyXG4gIGdldCB4KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1swXVxyXG4gIH1cclxuXHJcbiAgc2V0IHgoeDogbnVtYmVyKSB7XHJcbiAgICB0aGlzWzBdID0geFxyXG4gIH1cclxuXHJcbiAgZ2V0IHkoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzFdXHJcbiAgfVxyXG5cclxuICBzZXQgeSh5OiBudW1iZXIpIHtcclxuICAgIHRoaXNbMV0gPSB5XHJcbiAgfVxyXG5cclxuICBnZXQgeigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbMl1cclxuICB9XHJcblxyXG4gIHNldCB6KHo6IG51bWJlcikge1xyXG4gICAgdGhpc1syXSA9IHpcclxuICB9XHJcblxyXG4gIGdldCB4eXooKTogbnVtYmVyW10ge1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcylcclxuICB9XHJcblxyXG4gIHNldCB4eXooeHl6OiBudW1iZXJbXSkge1xyXG4gICAgdGhpcy5zZXQoeHl6KVxyXG4gIH1cclxuXHJcbiAgZ2V0IHIoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzBdXHJcbiAgfVxyXG5cclxuICBzZXQgcihyOiBudW1iZXIpIHtcclxuICAgIHRoaXNbMF0gPSByXHJcbiAgfVxyXG5cclxuICBnZXQgZygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbMV1cclxuICB9XHJcblxyXG4gIHNldCBnKGc6IG51bWJlcikge1xyXG4gICAgdGhpc1sxXSA9IGdcclxuICB9XHJcblxyXG4gIGdldCBiKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1syXVxyXG4gIH1cclxuXHJcbiAgc2V0IGIoYjogbnVtYmVyKSB7XHJcbiAgICB0aGlzWzJdID0gYlxyXG4gIH1cclxuXHJcbiAgZ2V0IHJnYigpOiBudW1iZXJbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKVxyXG4gIH1cclxuXHJcbiAgc2V0IHJnYih4eXo6IG51bWJlcltdKSB7XHJcbiAgICB0aGlzLnNldCh4eXopXHJcbiAgfVxyXG5cclxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gc3FydCh0aGlzLnNxdWFyZWRMZW5ndGgpXHJcbiAgfVxyXG5cclxuICBnZXQgc3F1YXJlZExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgY29uc3QgeCA9IHRoaXMueFxyXG4gICAgY29uc3QgeSA9IHRoaXMueVxyXG4gICAgY29uc3QgeiA9IHRoaXMuelxyXG5cclxuICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHpcclxuICB9XHJcblxyXG4gIHJlc2V0KCk6IHZlYzMge1xyXG4gICAgdGhpcy54ID0gMC4wXHJcbiAgICB0aGlzLnkgPSAwLjBcclxuICAgIHRoaXMueiA9IDAuMFxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBjb3B5KGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnlcclxuICAgIGRlc3QueiA9IHRoaXMuelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBuZWdhdGUoZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSAtdGhpcy54XHJcbiAgICBkZXN0LnkgPSAtdGhpcy55XHJcbiAgICBkZXN0LnogPSAtdGhpcy56XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGVxdWFscyh2ZWN0b3I6IHZlYzMsIHRocmVzaG9sZCA9IEVwc2lsb24pOiBib29sZWFuIHtcclxuICAgIGlmIChhYnModGhpcy54IC0gdmVjdG9yLngpID4gdGhyZXNob2xkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhYnModGhpcy55IC0gdmVjdG9yLnkpID4gdGhyZXNob2xkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhYnModGhpcy56IC0gdmVjdG9yLnopID4gdGhyZXNob2xkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlXHJcbiAgfVxyXG5cclxuICBhZGQodmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCArIHZlY3Rvci54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKyB2ZWN0b3IueVxyXG4gICAgZGVzdC56ID0gdGhpcy56ICsgdmVjdG9yLnpcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3VidHJhY3QodmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAtIHZlY3Rvci54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgLSB2ZWN0b3IueVxyXG4gICAgZGVzdC56ID0gdGhpcy56IC0gdmVjdG9yLnpcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbXVsdGlwbHkodmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAqIHZlY3Rvci54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiB2ZWN0b3IueVxyXG4gICAgZGVzdC56ID0gdGhpcy56ICogdmVjdG9yLnpcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgZGl2aWRlKHZlY3RvcjogdmVjMywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzLnggLyB2ZWN0b3IueFxyXG4gICAgZGVzdC55ID0gdGhpcy55IC8gdmVjdG9yLnlcclxuICAgIGRlc3QueiA9IHRoaXMueiAvIHZlY3Rvci56XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHNjYWxlKHNjYWxhcjogbnVtYmVyLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAqIHNjYWxhclxyXG4gICAgZGVzdC55ID0gdGhpcy55ICogc2NhbGFyXHJcbiAgICBkZXN0LnogPSB0aGlzLnogKiBzY2FsYXJcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbm9ybWFsaXplKGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGxlbmd0aCA9IHRoaXMubGVuZ3RoXHJcblxyXG4gICAgaWYgKGxlbmd0aCA9PT0gMSkge1xyXG4gICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChsZW5ndGggPT09IDApIHtcclxuICAgICAgZGVzdC54ID0gMFxyXG4gICAgICBkZXN0LnkgPSAwXHJcbiAgICAgIGRlc3QueiA9IDBcclxuXHJcbiAgICAgIHJldHVybiBkZXN0XHJcbiAgICB9XHJcblxyXG4gICAgbGVuZ3RoID0gMS4wIC8gbGVuZ3RoXHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICogbGVuZ3RoXHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiBsZW5ndGhcclxuICAgIGRlc3QueiA9IHRoaXMueiAqIGxlbmd0aFxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICByZWZsZWN0KG5vcm1hbDogdmVjMywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbm9ybWFsLmNvcHkoZGVzdCkuc2NhbGUoLTIuMCAqIHZlYzMuZG90KHRoaXMsIG5vcm1hbCkpLmFkZCh0aGlzKVxyXG4gIH1cclxuXHJcbiAgdHJhbnNmb3JtKG1hdHJpeDogbWF0MywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWF0cml4LnRyYW5zZm9ybSh0aGlzLCBkZXN0KVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNyb3NzKHZlY3RvcjogdmVjMywgdmVjdG9yMjogdmVjMywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB4ID0gdmVjdG9yLnhcclxuICAgIGNvbnN0IHkgPSB2ZWN0b3IueVxyXG4gICAgY29uc3QgeiA9IHZlY3Rvci56XHJcblxyXG4gICAgY29uc3QgeDIgPSB2ZWN0b3IyLnhcclxuICAgIGNvbnN0IHkyID0gdmVjdG9yMi55XHJcbiAgICBjb25zdCB6MiA9IHZlY3RvcjIuelxyXG5cclxuICAgIGRlc3QueCA9IHkgKiB6MiAtIHogKiB5MlxyXG4gICAgZGVzdC55ID0geiAqIHgyIC0geCAqIHoyXHJcbiAgICBkZXN0LnogPSB4ICogeTIgLSB5ICogeDJcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRvdCh2ZWN0b3I6IHZlYzMsIHZlY3RvcjI6IHZlYzMpOiBudW1iZXIge1xyXG4gICAgY29uc3QgeCA9IHZlY3Rvci54XHJcbiAgICBjb25zdCB5ID0gdmVjdG9yLnlcclxuICAgIGNvbnN0IHogPSB2ZWN0b3IuelxyXG5cclxuICAgIGNvbnN0IHgyID0gdmVjdG9yMi54XHJcbiAgICBjb25zdCB5MiA9IHZlY3RvcjIueVxyXG4gICAgY29uc3QgejIgPSB2ZWN0b3IyLnpcclxuXHJcbiAgICByZXR1cm4geCAqIHgyICsgeSAqIHkyICsgeiAqIHoyXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZGlzdGFuY2UodmVjdG9yOiB2ZWMzLCB2ZWN0b3IyOiB2ZWMzKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBzcXJ0KHRoaXMuc3F1YXJlZERpc3RhbmNlKHZlY3RvciwgdmVjdG9yMikpXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc3F1YXJlZERpc3RhbmNlKHZlY3RvcjogdmVjMywgdmVjdG9yMjogdmVjMyk6IG51bWJlciB7XHJcbiAgICBjb25zdCB4ID0gdmVjdG9yMi54IC0gdmVjdG9yLnhcclxuICAgIGNvbnN0IHkgPSB2ZWN0b3IyLnkgLSB2ZWN0b3IueVxyXG4gICAgY29uc3QgeiA9IHZlY3RvcjIueiAtIHZlY3Rvci56XHJcblxyXG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogelxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRpcmVjdGlvbih2ZWN0b3I6IHZlYzMsIHZlY3RvcjI6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeCA9IHZlY3Rvci54IC0gdmVjdG9yMi54XHJcbiAgICBjb25zdCB5ID0gdmVjdG9yLnkgLSB2ZWN0b3IyLnlcclxuICAgIGNvbnN0IHogPSB2ZWN0b3IueiAtIHZlY3RvcjIuelxyXG5cclxuICAgIGxldCBsZW5ndGggPSBzcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHJcbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGRlc3QueCA9IDBcclxuICAgICAgZGVzdC55ID0gMFxyXG4gICAgICBkZXN0LnogPSAwXHJcblxyXG4gICAgICByZXR1cm4gZGVzdFxyXG4gICAgfVxyXG5cclxuICAgIGxlbmd0aCA9IDEgLyBsZW5ndGhcclxuXHJcbiAgICBkZXN0LnggPSB4ICogbGVuZ3RoXHJcbiAgICBkZXN0LnkgPSB5ICogbGVuZ3RoXHJcbiAgICBkZXN0LnogPSB6ICogbGVuZ3RoXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtaXgodmVjdG9yOiB2ZWMzLCB2ZWN0b3IyOiB2ZWMzLCB0aW1lOiBudW1iZXIsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggKyB0aW1lICogKHZlY3RvcjIueCAtIHZlY3Rvci54KVxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKyB0aW1lICogKHZlY3RvcjIueSAtIHZlY3Rvci55KVxyXG4gICAgZGVzdC56ID0gdmVjdG9yLnogKyB0aW1lICogKHZlY3RvcjIueiAtIHZlY3Rvci56KVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgYWRkKHZlY3RvcjogdmVjMywgdmVjdG9yMjogdmVjMywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCArIHZlY3RvcjIueFxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKyB2ZWN0b3IyLnlcclxuICAgIGRlc3QueiA9IHZlY3Rvci56ICsgdmVjdG9yMi56XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzdWJ0cmFjdCh2ZWN0b3I6IHZlYzMsIHZlY3RvcjI6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggLSB2ZWN0b3IyLnhcclxuICAgIGRlc3QueSA9IHZlY3Rvci55IC0gdmVjdG9yMi55XHJcbiAgICBkZXN0LnogPSB2ZWN0b3IueiAtIHZlY3RvcjIuelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbXVsdGlwbHkodmVjdG9yOiB2ZWMzLCB2ZWN0b3IyOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHZlY3Rvci54ICogdmVjdG9yMi54XHJcbiAgICBkZXN0LnkgPSB2ZWN0b3IueSAqIHZlY3RvcjIueVxyXG4gICAgZGVzdC56ID0gdmVjdG9yLnogKiB2ZWN0b3IyLnpcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRpdmlkZSh2ZWN0b3I6IHZlYzMsIHZlY3RvcjI6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggLyB2ZWN0b3IyLnhcclxuICAgIGRlc3QueSA9IHZlY3Rvci55IC8gdmVjdG9yMi55XHJcbiAgICBkZXN0LnogPSB2ZWN0b3IueiAvIHZlY3RvcjIuelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc2NhbGUodmVjdG9yOiB2ZWMzLCBzY2FsYXI6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmVjdG9yLnNjYWxlKHNjYWxhciwgZGVzdClcclxuICB9XHJcblxyXG4gIHN0YXRpYyBub3JtYWxpemUodmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2ZWN0b3Iubm9ybWFsaXplKGRlc3QpXHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IEVwc2lsb24gfSBmcm9tICcuL2NvbnN0YW50cydcclxuXHJcbmltcG9ydCB7IG1hdDQgfSBmcm9tICcuL21hdDQnXHJcblxyXG5leHBvcnQgY2xhc3MgdmVjNCBleHRlbmRzIEZsb2F0MzJBcnJheSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHZhbHVlczogbnVtYmVyW10gPSBbMC4wLCAwLjAsIDAuMCwgMS4wXSkge1xyXG4gICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDQpKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IHplcm8gPSBuZXcgdmVjNChbMC4wLCAwLjAsIDAuMCwgMS4wXSlcclxuICBzdGF0aWMgcmVhZG9ubHkgb25lID0gbmV3IHZlYzQoWzEuMCwgMS4wLCAxLjAsIDEuMF0pXHJcblxyXG4gIHN0YXRpYyByZWFkb25seSB1cCA9IG5ldyB2ZWM0KFswLjAsIDEuMCwgMC4wLCAwLjBdKVxyXG4gIHN0YXRpYyByZWFkb25seSByaWdodCA9IG5ldyB2ZWM0KFsxLjAsIDAuMCwgMC4wLCAwLjBdKVxyXG4gIHN0YXRpYyByZWFkb25seSBmb3J3YXJkID0gbmV3IHZlYzQoWzAuMCwgMC4wLCAxLjAsIDAuMF0pXHJcblxyXG4gIGdldCB4KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1swXVxyXG4gIH1cclxuXHJcbiAgc2V0IHgoeDogbnVtYmVyKSB7XHJcbiAgICB0aGlzWzBdID0geFxyXG4gIH1cclxuXHJcbiAgZ2V0IHkoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzFdXHJcbiAgfVxyXG5cclxuICBzZXQgeSh5OiBudW1iZXIpIHtcclxuICAgIHRoaXNbMV0gPSB5XHJcbiAgfVxyXG5cclxuICBnZXQgeigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbMl1cclxuICB9XHJcblxyXG4gIHNldCB6KHo6IG51bWJlcikge1xyXG4gICAgdGhpc1syXSA9IHpcclxuICB9XHJcblxyXG4gIGdldCB3KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1szXVxyXG4gIH1cclxuXHJcbiAgc2V0IHcodzogbnVtYmVyKSB7XHJcbiAgICB0aGlzWzNdID0gd1xyXG4gIH1cclxuXHJcbiAgZ2V0IHh5encoKTogbnVtYmVyW10ge1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcylcclxuICB9XHJcblxyXG4gIHNldCB4eXp3KHh5enc6IG51bWJlcltdKSB7XHJcbiAgICB0aGlzLnNldCh4eXp3KVxyXG4gIH1cclxuXHJcbiAgZ2V0IHIoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzBdXHJcbiAgfVxyXG5cclxuICBzZXQgcihyOiBudW1iZXIpIHtcclxuICAgIHRoaXNbMF0gPSByXHJcbiAgfVxyXG5cclxuICBnZXQgZygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbMV1cclxuICB9XHJcblxyXG4gIHNldCBnKGc6IG51bWJlcikge1xyXG4gICAgdGhpc1sxXSA9IGdcclxuICB9XHJcblxyXG4gIGdldCBiKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1syXVxyXG4gIH1cclxuXHJcbiAgc2V0IGIoYjogbnVtYmVyKSB7XHJcbiAgICB0aGlzWzJdID0gYlxyXG4gIH1cclxuXHJcbiAgZ2V0IGEoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzNdXHJcbiAgfVxyXG5cclxuICBzZXQgYShhOiBudW1iZXIpIHtcclxuICAgIHRoaXNbM10gPSBhXHJcbiAgfVxyXG5cclxuICBnZXQgcmdiYSgpOiBudW1iZXJbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKVxyXG4gIH1cclxuXHJcbiAgc2V0IHJnYmEocmdiYTogbnVtYmVyW10pIHtcclxuICAgIHRoaXMuc2V0KHJnYmEpXHJcbiAgfVxyXG5cclxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMuc3F1YXJlZExlbmd0aClcclxuICB9XHJcblxyXG4gIGdldCBzcXVhcmVkTGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICBjb25zdCB4ID0gdGhpcy54XHJcbiAgICBjb25zdCB5ID0gdGhpcy55XHJcbiAgICBjb25zdCB6ID0gdGhpcy56XHJcbiAgICBjb25zdCB3ID0gdGhpcy53XHJcblxyXG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3XHJcbiAgfVxyXG5cclxuICByZXNldCgpOiB2ZWM0IHtcclxuICAgIHRoaXMueCA9IDAuMFxyXG4gICAgdGhpcy55ID0gMC4wXHJcbiAgICB0aGlzLnogPSAwLjBcclxuICAgIHRoaXMudyA9IDEuMFxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBjb3B5KGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnlcclxuICAgIGRlc3QueiA9IHRoaXMuelxyXG4gICAgZGVzdC53ID0gdGhpcy53XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIG5lZ2F0ZShkZXN0OiBudWxsIHwgdmVjNCA9IG51bGwpOiB2ZWM0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IC10aGlzLnhcclxuICAgIGRlc3QueSA9IC10aGlzLnlcclxuICAgIGRlc3QueiA9IC10aGlzLnpcclxuICAgIGRlc3QudyA9IC10aGlzLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgZXF1YWxzKHZlY3RvcjogdmVjNCwgdGhyZXNob2xkID0gRXBzaWxvbik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKE1hdGguYWJzKHRoaXMueCAtIHZlY3Rvci54KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoTWF0aC5hYnModGhpcy55IC0gdmVjdG9yLnkpID4gdGhyZXNob2xkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChNYXRoLmFicyh0aGlzLnogLSB2ZWN0b3IueikgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKE1hdGguYWJzKHRoaXMudyAtIHZlY3Rvci53KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYWRkKHZlY3RvcjogdmVjNCwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzLnggKyB2ZWN0b3IueFxyXG4gICAgZGVzdC55ID0gdGhpcy55ICsgdmVjdG9yLnlcclxuICAgIGRlc3QueiA9IHRoaXMueiArIHZlY3Rvci56XHJcbiAgICBkZXN0LncgPSB0aGlzLncgKyB2ZWN0b3Iud1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdWJ0cmFjdCh2ZWN0b3I6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54IC0gdmVjdG9yLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSAtIHZlY3Rvci55XHJcbiAgICBkZXN0LnogPSB0aGlzLnogLSB2ZWN0b3IuelxyXG4gICAgZGVzdC53ID0gdGhpcy53IC0gdmVjdG9yLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbXVsdGlwbHkodmVjdG9yOiB2ZWM0LCBkZXN0OiBudWxsIHwgdmVjNCA9IG51bGwpOiB2ZWM0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAqIHZlY3Rvci54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiB2ZWN0b3IueVxyXG4gICAgZGVzdC56ID0gdGhpcy56ICogdmVjdG9yLnpcclxuICAgIGRlc3QudyA9IHRoaXMudyAqIHZlY3Rvci53XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGRpdmlkZSh2ZWN0b3I6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54IC8gdmVjdG9yLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSAvIHZlY3Rvci55XHJcbiAgICBkZXN0LnogPSB0aGlzLnogLyB2ZWN0b3IuelxyXG4gICAgZGVzdC53ID0gdGhpcy53IC8gdmVjdG9yLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc2NhbGUoc2NhbGFyOiBudW1iZXIsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICogc2NhbGFyXHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiBzY2FsYXJcclxuICAgIGRlc3QueiA9IHRoaXMueiAqIHNjYWxhclxyXG4gICAgZGVzdC53ID0gdGhpcy53ICogc2NhbGFyXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIG5vcm1hbGl6ZShkZXN0OiBudWxsIHwgdmVjNCA9IG51bGwpOiB2ZWM0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBsZW5ndGggPSB0aGlzLmxlbmd0aFxyXG5cclxuICAgIGlmIChsZW5ndGggPT09IDEpIHtcclxuICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGRlc3QueCA9IDBcclxuICAgICAgZGVzdC55ID0gMFxyXG4gICAgICBkZXN0LnogPSAwXHJcbiAgICAgIGRlc3QudyA9IDBcclxuXHJcbiAgICAgIHJldHVybiBkZXN0XHJcbiAgICB9XHJcblxyXG4gICAgbGVuZ3RoID0gMS4wIC8gbGVuZ3RoXHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICogbGVuZ3RoXHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiBsZW5ndGhcclxuICAgIGRlc3QueiA9IHRoaXMueiAqIGxlbmd0aFxyXG4gICAgZGVzdC53ID0gdGhpcy53ICogbGVuZ3RoXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHRyYW5zZm9ybShtYXRyaXg6IG1hdDQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1hdHJpeC50cmFuc2Zvcm0odGhpcywgZGVzdClcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtaXgodmVjdG9yOiB2ZWM0LCB2ZWN0b3IyOiB2ZWM0LCB0aW1lOiBudW1iZXIsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggKyB0aW1lICogKHZlY3RvcjIueCAtIHZlY3Rvci54KVxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKyB0aW1lICogKHZlY3RvcjIueSAtIHZlY3Rvci55KVxyXG4gICAgZGVzdC56ID0gdmVjdG9yLnogKyB0aW1lICogKHZlY3RvcjIueiAtIHZlY3Rvci56KVxyXG4gICAgZGVzdC53ID0gdmVjdG9yLncgKyB0aW1lICogKHZlY3RvcjIudyAtIHZlY3Rvci53KVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgYWRkKHZlY3RvcjogdmVjNCwgdmVjdG9yMjogdmVjNCwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCArIHZlY3RvcjIueFxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKyB2ZWN0b3IyLnlcclxuICAgIGRlc3QueiA9IHZlY3Rvci56ICsgdmVjdG9yMi56XHJcbiAgICBkZXN0LncgPSB2ZWN0b3IudyArIHZlY3RvcjIud1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc3VidHJhY3QodmVjdG9yOiB2ZWM0LCB2ZWN0b3IyOiB2ZWM0LCBkZXN0OiBudWxsIHwgdmVjNCA9IG51bGwpOiB2ZWM0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzQoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHZlY3Rvci54IC0gdmVjdG9yMi54XHJcbiAgICBkZXN0LnkgPSB2ZWN0b3IueSAtIHZlY3RvcjIueVxyXG4gICAgZGVzdC56ID0gdmVjdG9yLnogLSB2ZWN0b3IyLnpcclxuICAgIGRlc3QudyA9IHZlY3Rvci53IC0gdmVjdG9yMi53XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtdWx0aXBseSh2ZWN0b3I6IHZlYzQsIHZlY3RvcjI6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggKiB2ZWN0b3IyLnhcclxuICAgIGRlc3QueSA9IHZlY3Rvci55ICogdmVjdG9yMi55XHJcbiAgICBkZXN0LnogPSB2ZWN0b3IueiAqIHZlY3RvcjIuelxyXG4gICAgZGVzdC53ID0gdmVjdG9yLncgKiB2ZWN0b3IyLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRpdmlkZSh2ZWN0b3I6IHZlYzQsIHZlY3RvcjI6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggLyB2ZWN0b3IyLnhcclxuICAgIGRlc3QueSA9IHZlY3Rvci55IC8gdmVjdG9yMi55XHJcbiAgICBkZXN0LnogPSB2ZWN0b3IueiAvIHZlY3RvcjIuelxyXG4gICAgZGVzdC53ID0gdmVjdG9yLncgLyB2ZWN0b3IyLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHNjYWxlKHZlY3RvcjogdmVjNCwgc2NhbGFyOiBudW1iZXIsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHZlY3Rvci5zY2FsZShzY2FsYXIsIGRlc3QpXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbm9ybWFsaXplKHZlY3RvcjogdmVjNCwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmVjdG9yLm5vcm1hbGl6ZShkZXN0KVxyXG4gIH1cclxuXHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiZXhwb3J0IHsgV29ybGQgfSBmcm9tICcuL3dvcmxkJ1xyXG5cclxuZXhwb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi90cmFuc2Zvcm0nXHJcbmV4cG9ydCB7IFJpZ2lkQm9keSB9IGZyb20gJy4vcmlnaWQtYm9keSdcclxuXHJcbmV4cG9ydCB7IENvbGxpZGVyIH0gZnJvbSAnLi9jb2xsaWRlcidcclxuZXhwb3J0IHsgQ29sbGlzaW9uIH0gZnJvbSAnLi9jb2xsaXNpb24nXHJcblxyXG5leHBvcnQgeyBSYXkgfSBmcm9tICcuL2NvbGxpZGVycy9yYXknXHJcbmV4cG9ydCB7IFBsYW5lIH0gZnJvbSAnLi9jb2xsaWRlcnMvcGxhbmUnXHJcbmV4cG9ydCB7IFNwaGVyZSB9IGZyb20gJy4vY29sbGlkZXJzL3NwaGVyZSdcclxuZXhwb3J0IHsgQ3Vib2lkIH0gZnJvbSAnLi9jb2xsaWRlcnMvY3Vib2lkJ1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=