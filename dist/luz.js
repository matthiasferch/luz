(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["luz"] = factory();
	else
		root["luz"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/core/component.ts":
/*!*******************************!*\
  !*** ./src/core/component.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Component: () => (/* binding */ Component)
/* harmony export */ });
class Component {
    toJSON() {
        const { type } = this;
        return { type };
    }
}
(function (Component) {
    let Type;
    (function (Type) {
        Type["Body"] = "body";
        Type["Model"] = "model";
        Type["Camera"] = "camera";
        Type["Light"] = "light";
    })(Type = Component.Type || (Component.Type = {}));
    let Timestep;
    (function (Timestep) {
        Timestep["Fixed"] = "fixed";
        Timestep["Variable"] = "variable";
    })(Timestep = Component.Timestep || (Component.Timestep = {}));
})(Component || (Component = {}));


/***/ }),

/***/ "./src/core/components/body.ts":
/*!*************************************!*\
  !*** ./src/core/components/body.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Body: () => (/* binding */ Body)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../vectors */ "./src/vectors/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./src/core/component.ts");


class Body extends _component__WEBPACK_IMPORTED_MODULE_1__.Component {
    constructor({ mass = 1.0 } = {}) {
        super();
        this.type = _component__WEBPACK_IMPORTED_MODULE_1__.Component.Type.Body;
        this.timestep = _component__WEBPACK_IMPORTED_MODULE_1__.Component.Timestep.Fixed;
        this.mass = mass;
        this.force = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero.copy();
        this.torque = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero.copy();
        this.linearVelocity = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero.copy();
        this.angularVelocity = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero.copy();
    }
    prepare(transform) {
        const { volume } = this;
        volume.transform(transform);
    }
    update(transform, deltaTime) {
        const { mass, volume } = this;
        volume.calculateInertia(mass, transform);
        this.integrateLinearVelocity(transform, deltaTime);
        this.integrateAngularVelocity(transform, deltaTime);
    }
    toJSON() {
        const { mass, volume, force, torque, linearVelocity, angularVelocity } = this;
        return Object.assign(Object.assign({}, super.toJSON()), { mass, volume, force, torque, linearVelocity, angularVelocity });
    }
    integrateLinearVelocity(transform, deltaTime) {
        const acceleration = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(this.force, this.mass);
        this.linearVelocity.add(acceleration.scale(deltaTime));
        transform.translation.add(_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(this.linearVelocity, deltaTime));
        this.force.reset();
    }
    integrateAngularVelocity(transform, deltaTime) {
        const { inertia } = this.volume;
        const acceleration = inertia.transform(this.torque);
        this.angularVelocity.add(acceleration.scale(deltaTime));
        const axis = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.normalize(this.angularVelocity);
        const angle = this.angularVelocity.length * deltaTime;
        transform.rotation.multiply(_vectors__WEBPACK_IMPORTED_MODULE_0__.quat.fromAxisAngle(axis, angle));
        this.torque.reset();
    }
}


/***/ }),

/***/ "./src/core/components/camera.ts":
/*!***************************************!*\
  !*** ./src/core/components/camera.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Camera: () => (/* binding */ Camera)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../vectors */ "./src/vectors/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./src/core/component.ts");


class Camera extends _component__WEBPACK_IMPORTED_MODULE_1__.Component {
    constructor() {
        super(...arguments);
        this.type = _component__WEBPACK_IMPORTED_MODULE_1__.Component.Type.Camera;
        this.timestep = _component__WEBPACK_IMPORTED_MODULE_1__.Component.Timestep.Variable;
        this.aspect = 1.0;
        this.aperture = 90.0;
        this.clipPlanes = new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec2([1.0, 100.0]);
        this.viewMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4();
        this.normalMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat3();
        this.modelViewMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4();
        this.projectionMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4();
        this.reconstructionMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4();
    }
    update(transform, deltaTime) {
        const { modelMatrix } = transform;
        // view matrix
        modelMatrix.invert(this.viewMatrix);
        // model view matrix
        _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4.multiply(this.viewMatrix, modelMatrix, this.modelViewMatrix);
        // normal matrix (to transform normals)
        this.modelViewMatrix.toMat3(this.normalMatrix).transpose().invert();
        // perspective matrix
        _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4.perspective(this.aperture, this.aspect, this.clipPlanes.x, this.clipPlanes.y, this.projectionMatrix);
        // reconstruction matrix (to reconstruct fragment positions)
        _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4.multiply(this.projectionMatrix, this.viewMatrix, this.reconstructionMatrix).invert();
    }
    toJSON() {
        const { aspect, aperture, clipPlanes } = this;
        return Object.assign(Object.assign({}, super.toJSON()), { aspect, aperture, clipPlanes });
    }
}


/***/ }),

/***/ "./src/core/components/light.ts":
/*!**************************************!*\
  !*** ./src/core/components/light.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Light: () => (/* binding */ Light)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../vectors */ "./src/vectors/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./src/core/component.ts");
/* harmony import */ var _camera__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./camera */ "./src/core/components/camera.ts");



class Light extends _camera__WEBPACK_IMPORTED_MODULE_2__.Camera {
    constructor() {
        super();
        this.type = _component__WEBPACK_IMPORTED_MODULE_1__.Component.Type.Light;
        this.radius = 6.0;
        this.falloff = 10.0;
        this.intensity = 1.0;
        this.color = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.one.copy();
        this.translation = new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3();
        this.direction = new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3();
        this.textureMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4();
        this.biasMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4();
        this.translation = new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3();
        this.direction = new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3();
        this.biasMatrix.translate(new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3([0.5, 0.5, 0.5]));
        this.biasMatrix.scale(new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3([0.5, 0.5, 0.5]));
    }
    update(transform, deltaTime) {
        super.update(transform, deltaTime);
        transform.translation.copy(this.translation);
        transform.direction.copy(this.direction);
        this.biasMatrix.copy(this.textureMatrix);
        this.textureMatrix.multiply(this.projectionMatrix);
        this.textureMatrix.multiply(this.viewMatrix);
    }
    toJSON() {
        const { radius, falloff, intensity } = this;
        return Object.assign(Object.assign({}, super.toJSON()), { radius, falloff, intensity });
    }
}


/***/ }),

/***/ "./src/core/components/model.ts":
/*!**************************************!*\
  !*** ./src/core/components/model.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Model: () => (/* binding */ Model)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../vectors */ "./src/vectors/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./src/core/component.ts");


class Model extends _component__WEBPACK_IMPORTED_MODULE_1__.Component {
    constructor() {
        super(...arguments);
        this.type = _component__WEBPACK_IMPORTED_MODULE_1__.Component.Type.Model;
        this.timestep = _component__WEBPACK_IMPORTED_MODULE_1__.Component.Timestep.Variable;
        this.baseColor = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.one;
    }
    update(transform, deltaTime) { }
    toJSON() {
        const { baseColor } = this;
        return Object.assign(Object.assign({}, super.toJSON()), { baseColor });
    }
}


/***/ }),

/***/ "./src/core/entity.ts":
/*!****************************!*\
  !*** ./src/core/entity.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Entity: () => (/* binding */ Entity)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./component */ "./src/core/component.ts");
/* harmony import */ var _transform__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./transform */ "./src/core/transform.ts");


const { Type, Timestep } = _component__WEBPACK_IMPORTED_MODULE_0__.Component;
class Entity extends _transform__WEBPACK_IMPORTED_MODULE_1__.Transform {
    constructor() {
        super(...arguments);
        this.components = {};
    }
    // volume: Volume -- TODO: for visibility determination
    get bodies() {
        return this.withType(Type.Body);
    }
    get models() {
        return this.withType(Type.Model);
    }
    get cameras() {
        return this.withType(Type.Camera);
    }
    get lights() {
        return this.withType(Type.Light);
    }
    get fixedTimestep() {
        return this.withTimestep(Timestep.Fixed);
    }
    get variableTimestep() {
        return this.withTimestep(Timestep.Variable);
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.variableTimestep.forEach((component) => {
            component.update(this, deltaTime);
        });
    }
    fixedUpdate(deltaTime) {
        this.fixedTimestep.forEach((component) => {
            component.update(this, deltaTime);
        });
    }
    toJSON() {
        const { components } = this;
        return Object.assign(Object.assign({}, super.toJSON()), { components });
    }
    withType(type) {
        const components = Object.values(this.components);
        return components.filter((component) => {
            return component.type === type;
        });
    }
    withTimestep(timestep) {
        const components = Object.values(this.components);
        return components.filter((component) => {
            return component.timestep === timestep;
        });
    }
}


/***/ }),

/***/ "./src/core/index.ts":
/*!***************************!*\
  !*** ./src/core/index.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Body: () => (/* reexport safe */ _components_body__WEBPACK_IMPORTED_MODULE_4__.Body),
/* harmony export */   Camera: () => (/* reexport safe */ _components_camera__WEBPACK_IMPORTED_MODULE_7__.Camera),
/* harmony export */   Component: () => (/* reexport safe */ _component__WEBPACK_IMPORTED_MODULE_3__.Component),
/* harmony export */   Entity: () => (/* reexport safe */ _entity__WEBPACK_IMPORTED_MODULE_1__.Entity),
/* harmony export */   Light: () => (/* reexport safe */ _components_light__WEBPACK_IMPORTED_MODULE_6__.Light),
/* harmony export */   Model: () => (/* reexport safe */ _components_model__WEBPACK_IMPORTED_MODULE_5__.Model),
/* harmony export */   Scene: () => (/* reexport safe */ _scene__WEBPACK_IMPORTED_MODULE_0__.Scene),
/* harmony export */   Transform: () => (/* reexport safe */ _transform__WEBPACK_IMPORTED_MODULE_2__.Transform)
/* harmony export */ });
/* harmony import */ var _scene__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scene */ "./src/core/scene.ts");
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./entity */ "./src/core/entity.ts");
/* harmony import */ var _transform__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transform */ "./src/core/transform.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./component */ "./src/core/component.ts");
/* harmony import */ var _components_body__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/body */ "./src/core/components/body.ts");
/* harmony import */ var _components_model__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/model */ "./src/core/components/model.ts");
/* harmony import */ var _components_light__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/light */ "./src/core/components/light.ts");
/* harmony import */ var _components_camera__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/camera */ "./src/core/components/camera.ts");










/***/ }),

/***/ "./src/core/scene.ts":
/*!***************************!*\
  !*** ./src/core/scene.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scene: () => (/* binding */ Scene)
/* harmony export */ });
/* harmony import */ var _physics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../physics */ "./src/physics/index.ts");
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../vectors */ "./src/vectors/index.ts");


class Scene {
    constructor() {
        this.entities = {};
        this.collisions = [];
        this.elapsedTime = 0;
        this.timestep = 1000 / 60;
        this.gravity = new _vectors__WEBPACK_IMPORTED_MODULE_1__.vec3([0, -9.81, 0]);
        this.collisionDispatcher = new _physics__WEBPACK_IMPORTED_MODULE_0__.CollisionDispatcher();
    }
    update(deltaTime) {
        const entities = Object.values(this.entities);
        this.elapsedTime += deltaTime;
        // prepare bodies
        entities.forEach((entity) => {
            entity.bodies.forEach((body) => {
                body.prepare(entity);
            });
        });
        while (this.elapsedTime >= this.timestep) {
            const bodies = entities.reduce((bodies, entity) => {
                return [...bodies, ...entity.bodies];
            }, []);
            this.updatePhysics(bodies);
            // fixed update
            entities.forEach((entity) => {
                entity.fixedUpdate(this.timestep);
            });
            this.elapsedTime -= this.timestep;
        }
        // variable update
        entities.forEach((entity) => {
            entity.update(deltaTime);
        });
    }
    updatePhysics(bodies) {
        this.applyGravity(bodies);
        this.detectCollisions(bodies);
        this.resolveCollisions(0.9, 0.2);
    }
    applyGravity(bodies) {
        bodies.forEach((body) => {
            body.force.add(_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(this.gravity, body.mass));
        });
    }
    detectCollisions(bodies) {
        this.collisions.length = 0;
        bodies.forEach((b1) => {
            bodies.forEach((b2) => {
                if (b1 === b2) {
                    return;
                }
                const collision = this.collide(b1, b2);
                if (collision) {
                    this.collisions.push(Object.assign(Object.assign({}, collision), { bodies: [b1, b2] }));
                }
            });
        });
    }
    resolveCollisions(friction, restitution) {
        this.collisions.forEach(({ bodies, contact, normal }) => {
            const [b1, b2] = bodies;
            const v = _vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.subtract(b2.linearVelocity, b1.linearVelocity);
            const n = _vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.dot(v, normal);
            if (n >= 0) {
                return;
            }
            const r = -(1.0 + restitution) * n;
            const m1 = 1.0 / b1.mass;
            const m2 = 1.0 / b2.mass;
            const m = m1 + m2;
            const i = _vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(normal, r / m);
            b1.linearVelocity.subtract(_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(i, m1));
            b2.linearVelocity.add(_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(i, m2));
            const t = _vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.subtract(v, _vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(normal, n));
            const f = _vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(t, -(m1 + m2) * friction);
            b1.linearVelocity.subtract(_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(f, m1));
            b2.linearVelocity.add(_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(f, m2));
            bodies.forEach((body) => {
                const { volume } = body;
                const { center } = volume;
                const d = _vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.subtract(contact, center);
                body.angularVelocity.add(_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.cross(d, i));
            });
        });
    }
    collide(b1, b2) {
        const { volume: c1 } = b1;
        const { volume: c2 } = b2;
        return this.collisionDispatcher.dispatch(c1, c2);
    }
    toJSON() {
        const { gravity, entities } = this;
        return { gravity, entities };
    }
}


/***/ }),

/***/ "./src/core/transform.ts":
/*!*******************************!*\
  !*** ./src/core/transform.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Transform: () => (/* binding */ Transform)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vectors */ "./src/vectors/index.ts");

class Transform {
    constructor({ translation = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero, rotation = _vectors__WEBPACK_IMPORTED_MODULE_0__.quat.identity } = {}) {
        this.rotation = new _vectors__WEBPACK_IMPORTED_MODULE_0__.quat();
        this.translation = new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3();
        this.direction = new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3();
        this.modelMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4();
        this.rotationMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat3();
        this.inverseTransposeMatrix = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4();
        this.translation = translation.copy();
        this.rotation = rotation.copy();
    }
    update(deltaTime) {
        // model matrix
        _vectors__WEBPACK_IMPORTED_MODULE_0__.mat4.construct(this.rotation, this.translation, this.modelMatrix);
        // rotation matrix
        this.modelMatrix.toMat3(this.rotationMatrix);
        // direction vector (for lighting calculations)
        this.rotationMatrix.row(2, this.direction).normalize();
        // inverse transpose matrix (to transform plane equations)
        this.modelMatrix.invert(this.inverseTransposeMatrix).transpose();
    }
    toJSON() {
        const { rotation, translation } = this;
        return { rotation, translation };
    }
}
Transform.origin = new Transform();


/***/ }),

/***/ "./src/graphics/index.ts":
/*!*******************************!*\
  !*** ./src/graphics/index.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Buffer: () => (/* reexport safe */ _types_buffer__WEBPACK_IMPORTED_MODULE_9__.Buffer),
/* harmony export */   Buffers: () => (/* reexport safe */ _managers_buffers__WEBPACK_IMPORTED_MODULE_4__.Buffers),
/* harmony export */   Display: () => (/* reexport safe */ _renderer_display__WEBPACK_IMPORTED_MODULE_1__.Display),
/* harmony export */   Mesh: () => (/* reexport safe */ _renderer_mesh__WEBPACK_IMPORTED_MODULE_12__.Mesh),
/* harmony export */   Meshes: () => (/* reexport safe */ _managers_meshes__WEBPACK_IMPORTED_MODULE_3__.Meshes),
/* harmony export */   Programs: () => (/* reexport safe */ _managers_programs__WEBPACK_IMPORTED_MODULE_6__.Programs),
/* harmony export */   Renderer: () => (/* reexport safe */ _renderer_renderer__WEBPACK_IMPORTED_MODULE_2__.Renderer),
/* harmony export */   Samplers: () => (/* reexport safe */ _managers_samplers__WEBPACK_IMPORTED_MODULE_7__.Samplers),
/* harmony export */   Shader: () => (/* reexport safe */ _types_shader__WEBPACK_IMPORTED_MODULE_10__.Shader),
/* harmony export */   Shaders: () => (/* reexport safe */ _managers_shaders__WEBPACK_IMPORTED_MODULE_5__.Shaders),
/* harmony export */   State: () => (/* reexport safe */ _renderer_state__WEBPACK_IMPORTED_MODULE_0__.State),
/* harmony export */   Texture: () => (/* reexport safe */ _types_texture__WEBPACK_IMPORTED_MODULE_11__.Texture),
/* harmony export */   Textures: () => (/* reexport safe */ _managers_textures__WEBPACK_IMPORTED_MODULE_8__.Textures)
/* harmony export */ });
/* harmony import */ var _renderer_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./renderer/state */ "./src/graphics/renderer/state.ts");
/* harmony import */ var _renderer_display__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./renderer/display */ "./src/graphics/renderer/display.ts");
/* harmony import */ var _renderer_renderer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./renderer/renderer */ "./src/graphics/renderer/renderer.ts");
/* harmony import */ var _managers_meshes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./managers/meshes */ "./src/graphics/managers/meshes.ts");
/* harmony import */ var _managers_buffers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./managers/buffers */ "./src/graphics/managers/buffers.ts");
/* harmony import */ var _managers_shaders__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./managers/shaders */ "./src/graphics/managers/shaders.ts");
/* harmony import */ var _managers_programs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./managers/programs */ "./src/graphics/managers/programs.ts");
/* harmony import */ var _managers_samplers__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./managers/samplers */ "./src/graphics/managers/samplers.ts");
/* harmony import */ var _managers_textures__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./managers/textures */ "./src/graphics/managers/textures.ts");
/* harmony import */ var _types_buffer__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./types/buffer */ "./src/graphics/types/buffer.ts");
/* harmony import */ var _types_shader__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./types/shader */ "./src/graphics/types/shader.ts");
/* harmony import */ var _types_texture__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./types/texture */ "./src/graphics/types/texture.ts");
/* harmony import */ var _renderer_mesh__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./renderer/mesh */ "./src/graphics/renderer/mesh.ts");















/***/ }),

/***/ "./src/graphics/managers/buffers.ts":
/*!******************************************!*\
  !*** ./src/graphics/managers/buffers.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Buffers: () => (/* binding */ Buffers)
/* harmony export */ });
/* harmony import */ var _types_buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/buffer */ "./src/graphics/types/buffer.ts");

class Buffers {
    constructor(gl) {
        this.gl = gl;
        this.buffers = [];
        this.boundBuffers = {};
    }
    create(target) {
        switch (target) {
            case _types_buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.Target.FrameBuffer:
                const frameBuffer = this.gl.createFramebuffer();
                frameBuffer.target = this.gl.FRAMEBUFFER;
                frameBuffer.attachments = {};
                this.buffers.push(frameBuffer);
                return frameBuffer;
            case _types_buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.Target.RenderBuffer:
                const renderBuffer = this.gl.createRenderbuffer();
                renderBuffer.target = this.gl.RENDERBUFFER;
                this.buffers.push(renderBuffer);
                return renderBuffer;
            case _types_buffer__WEBPACK_IMPORTED_MODULE_0__.Buffer.Target.UniformBuffer:
                const buffer = this.gl.createBuffer();
                buffer.target = this.gl.UNIFORM_BUFFER;
                buffer.usage = this.gl.DYNAMIC_DRAW;
                this.buffers.push(buffer);
                return buffer;
        }
    }
    update(buffer, source, offset) {
        this.bind(buffer);
        if (offset !== undefined) {
            this.gl.bufferSubData(buffer.target, offset, source);
        }
        else {
            this.gl.bufferData(buffer.target, source, buffer.usage);
        }
    }
    format(buffer, format, width, height) {
        this.bind(buffer);
        this.gl.renderbufferStorage(buffer.target, format, width, height);
    }
    attach(framebuffer, buffer, attachment) {
        this.bind(framebuffer);
        switch (buffer.target) {
            case this.gl.TEXTURE_2D:
                this.gl.framebufferTexture2D(framebuffer.target, attachment, buffer.target, buffer, 0);
                break;
            case this.gl.RENDERBUFFER:
                this.gl.framebufferRenderbuffer(framebuffer.target, attachment, this.gl.RENDERBUFFER, buffer);
                break;
        }
        framebuffer.attachments[attachment] = buffer;
    }
    use(framebuffer) {
        this.bind(framebuffer);
    }
    bind(buffer) {
        const boundBuffer = buffer ? this.boundBuffers[buffer.target] : null;
        if (boundBuffer === buffer) {
            // return
        }
        switch (buffer.target) {
            case this.gl.FRAMEBUFFER:
                const frameBuffer = boundBuffer;
                if (frameBuffer) {
                    Object.values(frameBuffer.attachments).forEach(attachment => {
                        const texture = attachment;
                        if (texture.useMipmaps) {
                            this.gl.bindTexture(texture.target, texture);
                            this.gl.generateMipmap(texture.target);
                        }
                    });
                }
                this.gl.bindFramebuffer(buffer.target, buffer);
                break;
            case this.gl.RENDERBUFFER:
                this.gl.bindRenderbuffer(buffer.target, buffer);
                break;
            default:
                this.gl.bindBuffer(buffer.target, buffer);
                break;
        }
        this.boundBuffers[buffer.target] = buffer;
    }
}


/***/ }),

/***/ "./src/graphics/managers/meshes.ts":
/*!*****************************************!*\
  !*** ./src/graphics/managers/meshes.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Meshes: () => (/* binding */ Meshes)
/* harmony export */ });
/* harmony import */ var _renderer_mesh__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../renderer/mesh */ "./src/graphics/renderer/mesh.ts");

const vertexSize = 8; // position (xyz) + normal (xyz) + texture coordinates (uv)
class Meshes {
    constructor(gl) {
        this.gl = gl;
    }
    create(data) {
        const { topology, vertices } = data;
        let vertexArray = this.gl.createVertexArray();
        let vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        vertexArray.vertexCount = vertices.length / vertexSize;
        let indexBuffer = null;
        if (data.indices && data.indices.length > 0) {
            const { indices } = data;
            indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
            vertexArray.indexCount = indices.length;
        }
        else {
            vertexArray.indexCount = 0;
        }
        this.gl.bindVertexArray(vertexArray);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        if (indexBuffer) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        }
        const stride = vertexSize * Float32Array.BYTES_PER_ELEMENT;
        // position
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, stride, 0);
        // normal
        this.gl.enableVertexAttribArray(1);
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, true, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
        // texture coordinates
        this.gl.enableVertexAttribArray(2);
        this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.bindVertexArray(null);
        return new _renderer_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh(topology, vertexArray);
    }
    render(mesh) {
        let mode;
        switch (mesh.topology) {
            case _renderer_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh.Topology.Points:
                mode = this.gl.POINTS;
                break;
            case _renderer_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh.Topology.Lines:
                mode = this.gl.LINES;
                break;
            case _renderer_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh.Topology.LineLoop:
                mode = this.gl.LINE_LOOP;
                break;
            case _renderer_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh.Topology.LineStrip:
                mode = this.gl.LINE_STRIP;
                break;
            case _renderer_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh.Topology.Triangles:
                mode = this.gl.TRIANGLES;
                break;
            case _renderer_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh.Topology.TriangleFan:
                mode = this.gl.TRIANGLE_FAN;
                break;
            case _renderer_mesh__WEBPACK_IMPORTED_MODULE_0__.Mesh.Topology.TriangleStrip:
                mode = this.gl.TRIANGLE_STRIP;
                break;
        }
        this.gl.bindVertexArray(mesh.vertexArray);
        if (mesh.vertexArray.indexCount > 0) {
            this.gl.drawElements(mode, mesh.vertexArray.indexCount, this.gl.UNSIGNED_SHORT, 0);
        }
        else {
            this.gl.drawArrays(mode, 0, mesh.vertexArray.vertexCount);
        }
        this.gl.bindVertexArray(null);
    }
}


/***/ }),

/***/ "./src/graphics/managers/programs.ts":
/*!*******************************************!*\
  !*** ./src/graphics/managers/programs.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Programs: () => (/* binding */ Programs)
/* harmony export */ });
class Programs {
    constructor(gl) {
        this.gl = gl;
        this.programs = [];
    }
    create(vertexShader, fragmentShader) {
        let program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        const linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (!linked || !this.gl.isProgram(program)) {
            // tslint:disable-next-line: no-console
            console.error(this.gl.getProgramInfoLog(program));
            return null;
        }
        this.setupAttributes(program);
        this.setupUniforms(program);
        this.setupUniformBlocks(program);
        this.setupTexureSlots(program);
        this.programs.push(program);
        return program;
    }
    update(program, data) {
        this.use(program);
        if (data === null || data === void 0 ? void 0 : data.uniforms) {
            Object.keys(data.uniforms).forEach(name => {
                const value = data.uniforms[name];
                if (value === undefined) {
                    // tslint:disable-next-line: no-console
                    console.warn('Skipping undefined uniform value:', name);
                    return;
                }
                const uniform = program.uniforms[name];
                if (uniform) {
                    switch (uniform.type) {
                        case this.gl.SAMPLER_2D:
                            const slot = program.textureSlots[name];
                            const texture = value;
                            this.gl.activeTexture(this.gl.TEXTURE0 + slot);
                            this.gl.bindTexture(texture.target, texture);
                            break;
                        case this.gl.INT: {
                            this.gl.uniform1i(uniform.location, value);
                            break;
                        }
                        case this.gl.FLOAT: {
                            this.gl.uniform1f(uniform.location, value);
                            break;
                        }
                        case this.gl.FLOAT_VEC2: {
                            this.gl.uniform2fv(uniform.location, value);
                            break;
                        }
                        case this.gl.FLOAT_VEC3: {
                            this.gl.uniform3fv(uniform.location, value);
                            break;
                        }
                        case this.gl.FLOAT_VEC4: {
                            this.gl.uniform4fv(uniform.location, value);
                            break;
                        }
                        case this.gl.FLOAT_MAT2: {
                            this.gl.uniformMatrix2fv(uniform.location, false, value);
                            break;
                        }
                        case this.gl.FLOAT_MAT3: {
                            const matrix = value;
                            this.gl.uniformMatrix3fv(uniform.location, false, matrix);
                            break;
                        }
                        case this.gl.FLOAT_MAT4: {
                            const matrix = value;
                            this.gl.uniformMatrix4fv(uniform.location, false, matrix);
                            break;
                        }
                        default:
                            // tslint:disable-next-line: no-console
                            console.error('Failed to set uniform value:', name, value);
                            break;
                    }
                }
                else {
                    // tslint:disable-next-line: no-console
                    console.warn('Attempting to update non-existent uniform:', name);
                }
            });
        }
        if (data === null || data === void 0 ? void 0 : data.uniformBuffers) {
            Object.keys(data.uniformBuffers).forEach((name) => {
                const uniformBlock = program.uniformBlocks[name];
                if (uniformBlock) {
                    this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, uniformBlock.index, data.uniformBuffers[name]);
                }
            });
        }
    }
    use(program) {
        if (this.usedProgram === program) {
            return;
        }
        this.gl.useProgram(program);
        this.usedProgram = program;
    }
    setupAttributes(program) {
        program.attributes = {};
        const activeAttributes = this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES);
        for (let index = 0; index < activeAttributes; index++) {
            const attribute = this.gl.getActiveAttrib(program, index);
            const location = this.gl.getAttribLocation(program, attribute.name);
            attribute.location = location;
            program.attributes[attribute.name] = attribute;
        }
    }
    setupUniforms(program) {
        program.uniforms = {};
        const activeUniforms = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);
        for (let uniformIndex = 0; uniformIndex < activeUniforms; uniformIndex++) {
            const uniform = this.gl.getActiveUniform(program, uniformIndex);
            if (this.isUniformArray(uniform)) {
                const nameWithoutIndex = uniform.name.slice(0, -3);
                for (let arrayIndex = 0; arrayIndex < uniform.size; arrayIndex++) {
                    const nameWithIndex = `${nameWithoutIndex}[${arrayIndex}]`;
                    const location = this.gl.getUniformLocation(program, nameWithIndex);
                    if (location != null) {
                        uniform.location = location;
                        program.uniforms[nameWithIndex] = uniform;
                    }
                }
            }
            else {
                const location = this.gl.getUniformLocation(program, uniform.name);
                if (location != null) {
                    uniform.location = location;
                    program.uniforms[uniform.name] = uniform;
                }
            }
        }
    }
    setupUniformBlocks(program) {
        program.uniformBlocks = {};
        const activeUniformBlocks = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORM_BLOCKS);
        for (let blockIndex = 0; blockIndex < activeUniformBlocks; blockIndex++) {
            const uniformBlockName = this.gl.getActiveUniformBlockName(program, blockIndex);
            const uniformBlockIndex = this.gl.getUniformBlockIndex(program, uniformBlockName);
            const uniformBlockBinding = uniformBlockIndex;
            this.gl.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding);
            const uniformIndices = this.gl.getActiveUniformBlockParameter(program, blockIndex, this.gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);
            const uniformOffsets = this.gl.getActiveUniforms(program, uniformIndices, this.gl.UNIFORM_OFFSET);
            const uniformOffsetsByName = uniformIndices.reduce((offsets, uniformIndex, index) => {
                const uniform = this.gl.getActiveUniform(program, uniformIndex);
                offsets[uniform.name] = uniformOffsets[index];
                return offsets;
            }, {});
            program.uniformBlocks[uniformBlockName] = {
                name: uniformBlockName,
                index: uniformBlockIndex,
                binding: uniformBlockBinding,
                offsets: uniformOffsetsByName
            };
        }
    }
    setupTexureSlots(program) {
        program.textureSlots = {};
        let slot = 0;
        this.update(program);
        Object.keys(program.uniforms).forEach((name) => {
            const uniform = program.uniforms[name];
            if (uniform.type === this.gl.SAMPLER_2D) {
                this.gl.uniform1i(uniform.location, slot);
                program.textureSlots[name] = slot;
                slot = slot + 1;
            }
        });
    }
    isUniformArray(uniform) {
        return uniform.size > 1;
    }
}


/***/ }),

/***/ "./src/graphics/managers/samplers.ts":
/*!*******************************************!*\
  !*** ./src/graphics/managers/samplers.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Samplers: () => (/* binding */ Samplers)
/* harmony export */ });
/* harmony import */ var _types_texture__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/texture */ "./src/graphics/types/texture.ts");

class Samplers {
    constructor(gl) {
        this.gl = gl;
        this.samplers = [];
        this.boundSamplers = {};
    }
    create() {
        let sampler = this.gl.createSampler();
        this.update(sampler, _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Filtering.None, _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Tiling.None);
        this.samplers.push(sampler);
        return sampler;
    }
    update(sampler, filtering, tiling) {
        switch (filtering) {
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Filtering.None:
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Filtering.Linear:
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Filtering.Bilinear:
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Filtering.Trilinear:
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
                break;
        }
        switch (tiling) {
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Tiling.None:
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Tiling.Both:
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Tiling.Horizontal:
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Tiling.Vertical:
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
                break;
        }
        sampler.filtering = filtering;
        sampler.tiling = tiling;
    }
    bind(sampler, unit) {
        if (this.boundSamplers[unit] === sampler) {
            return;
        }
        this.gl.bindSampler(this.gl.TEXTURE0 + unit, sampler);
        this.boundSamplers[unit] = sampler;
    }
}


/***/ }),

/***/ "./src/graphics/managers/shaders.ts":
/*!******************************************!*\
  !*** ./src/graphics/managers/shaders.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Shaders: () => (/* binding */ Shaders)
/* harmony export */ });
/* harmony import */ var _types_shader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/shader */ "./src/graphics/types/shader.ts");

class Shaders {
    constructor(gl) {
        this.gl = gl;
        this.shaders = [];
    }
    create(stage, source, headers) {
        let type;
        switch (stage) {
            case _types_shader__WEBPACK_IMPORTED_MODULE_0__.Shader.Stage.VertexShader:
                type = this.gl.VERTEX_SHADER;
                break;
            case _types_shader__WEBPACK_IMPORTED_MODULE_0__.Shader.Stage.FragmentShader:
                type = this.gl.FRAGMENT_SHADER;
                break;
        }
        if ((headers === null || headers === void 0 ? void 0 : headers.length) > 0) {
            headers.reverse().forEach((header) => {
                source = `${header}\n\n${source}`;
            });
        }
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        shader.compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!shader.compiled || !this.gl.isShader(shader)) {
            // tslint:disable-next-line: no-console
            console.error(this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        this.shaders.push(shader);
        return shader;
    }
}


/***/ }),

/***/ "./src/graphics/managers/textures.ts":
/*!*******************************************!*\
  !*** ./src/graphics/managers/textures.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Textures: () => (/* binding */ Textures)
/* harmony export */ });
/* harmony import */ var _types_texture__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/texture */ "./src/graphics/types/texture.ts");

class Textures {
    constructor(gl) {
        this.gl = gl;
        this.textures = [];
        this.boundTextures = {};
    }
    create(target, format, width, height, filtering, tiling, mipmaps) {
        let texture = this.gl.createTexture();
        texture.target = target;
        texture.format = format;
        texture.width = width;
        texture.height = height;
        texture.tiling = tiling;
        texture.filtering = filtering;
        texture.useMipmaps = mipmaps;
        let sourceFormat;
        switch (texture.format) {
            case this.gl.RGBA:
            case this.gl.RGBA32F:
                sourceFormat = this.gl.RGBA;
                break;
            case this.gl.LUMINANCE:
                sourceFormat = this.gl.LUMINANCE;
                break;
            case this.gl.DEPTH_COMPONENT32F:
                sourceFormat = this.gl.DEPTH_COMPONENT;
                break;
        }
        switch (texture.format) {
            case this.gl.RGBA32F:
            case this.gl.DEPTH_COMPONENT32F:
                texture.type = this.gl.FLOAT;
                break;
            default:
                texture.type = this.gl.UNSIGNED_BYTE;
                break;
        }
        this.bind(texture, 0);
        this.gl.texImage2D(texture.target, 0, texture.format, width, height, 0, sourceFormat, texture.type, null);
        switch (texture.tiling) {
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Tiling.None:
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Tiling.Both:
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Tiling.Horizontal:
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Tiling.Vertical:
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
                break;
        }
        switch (texture.filtering) {
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Filtering.None:
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Filtering.Linear:
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_MIN_FILTER, mipmaps ? this.gl.LINEAR_MIPMAP_NEAREST : this.gl.LINEAR);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Filtering.Bilinear:
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_MIN_FILTER, mipmaps ? this.gl.LINEAR_MIPMAP_NEAREST : this.gl.LINEAR);
                break;
            case _types_texture__WEBPACK_IMPORTED_MODULE_0__.Texture.Filtering.Trilinear:
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(texture.target, this.gl.TEXTURE_MIN_FILTER, mipmaps ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.LINEAR);
                break;
        }
        this.textures.push(texture);
        return texture;
    }
    update(texture, source, x = 0, y = 0, width, height) {
        if (width === undefined) {
            width = texture.width;
        }
        if (height === undefined) {
            height = texture.width;
        }
        this.bind(texture, 0);
        this.gl.texSubImage2D(texture.target, 0, x, y, width, height, texture.format, texture.type, source);
        if (texture.useMipmaps) {
            this.gl.generateMipmap(texture.target);
        }
    }
    bind(texture, unit) {
        if (this.boundTextures[unit] === texture) {
            return;
        }
        this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        this.gl.bindTexture(texture.target, texture);
        this.boundTextures[unit] = texture;
    }
}


/***/ }),

/***/ "./src/graphics/renderer/display.ts":
/*!******************************************!*\
  !*** ./src/graphics/renderer/display.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Display: () => (/* binding */ Display)
/* harmony export */ });
class Display {
    constructor(gl) {
        this.gl = gl;
    }
    set viewport(viewport) {
        const [x, y, z, w] = viewport;
        this.gl.viewport(x, y, z, w);
    }
    clear(color, depth, stencil) {
        let clearMask = 0;
        if (color != null) {
            this.gl.clearColor(color.x, color.y, color.z, color.w);
            clearMask |= this.gl.COLOR_BUFFER_BIT;
        }
        if (depth != null) {
            this.gl.clearDepth(depth);
            clearMask |= this.gl.DEPTH_BUFFER_BIT;
        }
        if (stencil != null) {
            this.gl.clearStencil(stencil);
            clearMask |= this.gl.STENCIL_BUFFER_BIT;
        }
        this.gl.clear(clearMask);
    }
}


/***/ }),

/***/ "./src/graphics/renderer/mesh.ts":
/*!***************************************!*\
  !*** ./src/graphics/renderer/mesh.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mesh: () => (/* binding */ Mesh)
/* harmony export */ });
class Mesh {
    constructor(topology, vertexArray) {
        this.topology = topology;
        this.vertexArray = vertexArray;
    }
}
(function (Mesh) {
    let Topology;
    (function (Topology) {
        Topology["Points"] = "points";
        Topology["Lines"] = "lines";
        Topology["LineLoop"] = "line-loop";
        Topology["LineStrip"] = "line-strip";
        Topology["Triangles"] = "triangles";
        Topology["TriangleFan"] = "triangle-fan";
        Topology["TriangleStrip"] = "triangle-strip";
    })(Topology = Mesh.Topology || (Mesh.Topology = {}));
})(Mesh || (Mesh = {}));


/***/ }),

/***/ "./src/graphics/renderer/renderer.ts":
/*!*******************************************!*\
  !*** ./src/graphics/renderer/renderer.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Renderer: () => (/* binding */ Renderer)
/* harmony export */ });
/* harmony import */ var _managers_buffers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../managers/buffers */ "./src/graphics/managers/buffers.ts");
/* harmony import */ var _managers_meshes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../managers/meshes */ "./src/graphics/managers/meshes.ts");
/* harmony import */ var _managers_programs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../managers/programs */ "./src/graphics/managers/programs.ts");
/* harmony import */ var _managers_samplers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../managers/samplers */ "./src/graphics/managers/samplers.ts");
/* harmony import */ var _managers_shaders__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../managers/shaders */ "./src/graphics/managers/shaders.ts");
/* harmony import */ var _managers_textures__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../managers/textures */ "./src/graphics/managers/textures.ts");
/* harmony import */ var _display__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./display */ "./src/graphics/renderer/display.ts");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./state */ "./src/graphics/renderer/state.ts");








class Renderer {
    constructor(gl) {
        this.gl = gl;
        this.shaders = new _managers_shaders__WEBPACK_IMPORTED_MODULE_4__.Shaders(this.gl);
        this.programs = new _managers_programs__WEBPACK_IMPORTED_MODULE_2__.Programs(this.gl);
        this.buffers = new _managers_buffers__WEBPACK_IMPORTED_MODULE_0__.Buffers(this.gl);
        this.textures = new _managers_textures__WEBPACK_IMPORTED_MODULE_5__.Textures(this.gl);
        this.samplers = new _managers_samplers__WEBPACK_IMPORTED_MODULE_3__.Samplers(this.gl);
        this.display = new _display__WEBPACK_IMPORTED_MODULE_6__.Display(this.gl);
        this.state = new _state__WEBPACK_IMPORTED_MODULE_7__.State(this.gl);
        this.meshes = new _managers_meshes__WEBPACK_IMPORTED_MODULE_1__.Meshes(this.gl);
    }
    render(camera, transform, model, lights, program, uniforms) {
        if (camera) {
            // camera uniforms
            this.programs.update((program), {
                uniforms: this.collectUniformValues(program, { camera })
            });
        }
        if (transform) {
            // transform uniforms
            this.programs.update((program), {
                uniforms: this.collectUniformValues(program, { transform })
            });
        }
        // model uniforms
        this.programs.update((program), {
            uniforms: this.collectUniformValues(program, { model })
        });
        if (lights) {
            // light uniforms
            this.programs.update((program), {
                uniforms: this.collectUniformValues(program, { lights })
            });
        }
        if (uniforms) {
            // additional uniforms
            this.programs.update((program), {
                uniforms: this.collectUniformValues(program, uniforms)
            });
        }
        this.meshes.render(model.mesh);
    }
    collectUniformValues(program, uniformValues) {
        const collectedUniformValues = {};
        const collectRecursively = (values, prefix) => {
            if (typeof values !== 'object') {
                return;
            }
            Object.entries(values).forEach(([name, value]) => {
                const uniformName = (prefix) ? `${prefix}.${name}` : name;
                if (program.uniforms.hasOwnProperty(uniformName)) {
                    collectedUniformValues[uniformName] = value;
                }
                else if (Array.isArray(value)) {
                    value.forEach((element, index) => {
                        collectRecursively(element, `${uniformName}[${index}]`);
                    });
                }
                else {
                    collectRecursively(value, name);
                }
            });
        };
        collectRecursively(uniformValues);
        return collectedUniformValues;
    }
}


/***/ }),

/***/ "./src/graphics/renderer/state.ts":
/*!****************************************!*\
  !*** ./src/graphics/renderer/state.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   State: () => (/* binding */ State)
/* harmony export */ });
class State {
    constructor(gl) {
        this.gl = gl;
        this.activeCullMode = State.CullMode.None;
        this.activeBlendMode = State.BlendMode.None;
        this.activeDepthTest = State.DepthTest.None;
    }
    set cullMode(cullMode) {
        if (cullMode === this.activeCullMode) {
            return;
        }
        if (cullMode === State.CullMode.None) {
            this.gl.disable(this.gl.CULL_FACE);
        }
        else {
            this.gl.enable(this.gl.CULL_FACE);
            switch (cullMode) {
                case State.CullMode.Front:
                    this.gl.cullFace(this.gl.FRONT);
                    break;
                case State.CullMode.Back:
                    this.gl.cullFace(this.gl.BACK);
                    break;
            }
        }
        this.activeCullMode = cullMode;
    }
    set blendMode(blendMode) {
        if (blendMode === this.activeBlendMode) {
            return;
        }
        if (blendMode === State.BlendMode.None) {
            this.gl.disable(this.gl.BLEND);
        }
        else {
            this.gl.enable(this.gl.BLEND);
            switch (blendMode) {
                case State.BlendMode.Additive:
                    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
                    break;
                case State.BlendMode.Transparent:
                    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
                    break;
            }
        }
        this.activeBlendMode = blendMode;
    }
    set depthTest(depthTest) {
        if (depthTest === this.activeDepthTest) {
            return;
        }
        if (depthTest === State.DepthTest.None) {
            this.gl.disable(this.gl.DEPTH_TEST);
        }
        else {
            this.gl.enable(this.gl.DEPTH_TEST);
            switch (depthTest) {
                case State.DepthTest.Never:
                    this.gl.depthFunc(this.gl.NEVER);
                    break;
                case State.DepthTest.Always:
                    this.gl.depthFunc(this.gl.ALWAYS);
                    break;
                case State.DepthTest.Equal:
                    this.gl.depthFunc(this.gl.EQUAL);
                    break;
                case State.DepthTest.NotEqual:
                    this.gl.depthFunc(this.gl.NOTEQUAL);
                    break;
                case State.DepthTest.Less:
                    this.gl.depthFunc(this.gl.LESS);
                    break;
                case State.DepthTest.LessEqual:
                    this.gl.depthFunc(this.gl.LEQUAL);
                    break;
                case State.DepthTest.Greater:
                    this.gl.depthFunc(this.gl.GREATER);
                    break;
                case State.DepthTest.GreaterEqual:
                    this.gl.depthFunc(this.gl.GEQUAL);
                    break;
            }
        }
        this.activeDepthTest = depthTest;
    }
}
(function (State) {
    let CullMode;
    (function (CullMode) {
        CullMode[CullMode["None"] = 0] = "None";
        CullMode[CullMode["Front"] = 1] = "Front";
        CullMode[CullMode["Back"] = 2] = "Back";
    })(CullMode = State.CullMode || (State.CullMode = {}));
    let BlendMode;
    (function (BlendMode) {
        BlendMode[BlendMode["None"] = 0] = "None";
        BlendMode[BlendMode["Additive"] = 1] = "Additive";
        BlendMode[BlendMode["Transparent"] = 2] = "Transparent";
    })(BlendMode = State.BlendMode || (State.BlendMode = {}));
    let DepthTest;
    (function (DepthTest) {
        DepthTest[DepthTest["None"] = 0] = "None";
        DepthTest[DepthTest["Never"] = 1] = "Never";
        DepthTest[DepthTest["Always"] = 2] = "Always";
        DepthTest[DepthTest["Equal"] = 3] = "Equal";
        DepthTest[DepthTest["NotEqual"] = 4] = "NotEqual";
        DepthTest[DepthTest["Less"] = 5] = "Less";
        DepthTest[DepthTest["LessEqual"] = 6] = "LessEqual";
        DepthTest[DepthTest["Greater"] = 7] = "Greater";
        DepthTest[DepthTest["GreaterEqual"] = 8] = "GreaterEqual";
    })(DepthTest = State.DepthTest || (State.DepthTest = {}));
})(State || (State = {}));


/***/ }),

/***/ "./src/graphics/types/buffer.ts":
/*!**************************************!*\
  !*** ./src/graphics/types/buffer.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Buffer: () => (/* binding */ Buffer)
/* harmony export */ });
var Buffer;
(function (Buffer) {
    let Target;
    (function (Target) {
        Target[Target["FrameBuffer"] = 0] = "FrameBuffer";
        Target[Target["RenderBuffer"] = 1] = "RenderBuffer";
        Target[Target["UniformBuffer"] = 2] = "UniformBuffer";
    })(Target = Buffer.Target || (Buffer.Target = {}));
})(Buffer || (Buffer = {}));


/***/ }),

/***/ "./src/graphics/types/shader.ts":
/*!**************************************!*\
  !*** ./src/graphics/types/shader.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Shader: () => (/* binding */ Shader)
/* harmony export */ });
var Shader;
(function (Shader) {
    let Stage;
    (function (Stage) {
        Stage[Stage["VertexShader"] = 0] = "VertexShader";
        Stage[Stage["FragmentShader"] = 1] = "FragmentShader";
    })(Stage = Shader.Stage || (Shader.Stage = {}));
})(Shader || (Shader = {}));


/***/ }),

/***/ "./src/graphics/types/texture.ts":
/*!***************************************!*\
  !*** ./src/graphics/types/texture.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Texture: () => (/* binding */ Texture)
/* harmony export */ });
var Texture;
(function (Texture) {
    let Tiling;
    (function (Tiling) {
        Tiling[Tiling["None"] = 0] = "None";
        Tiling[Tiling["Both"] = 1] = "Both";
        Tiling[Tiling["Horizontal"] = 2] = "Horizontal";
        Tiling[Tiling["Vertical"] = 3] = "Vertical";
    })(Tiling = Texture.Tiling || (Texture.Tiling = {}));
    let Filtering;
    (function (Filtering) {
        Filtering[Filtering["None"] = 0] = "None";
        Filtering[Filtering["Linear"] = 1] = "Linear";
        Filtering[Filtering["Bilinear"] = 2] = "Bilinear";
        Filtering[Filtering["Trilinear"] = 3] = "Trilinear";
    })(Filtering = Texture.Filtering || (Texture.Filtering = {}));
})(Texture || (Texture = {}));


/***/ }),

/***/ "./src/physics/collider.ts":
/*!*********************************!*\
  !*** ./src/physics/collider.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Collider: () => (/* binding */ Collider)
/* harmony export */ });
class Collider {
}
(function (Collider) {
    let Type;
    (function (Type) {
        Type["Ray"] = "ray";
        Type["Plane"] = "plane";
        Type["Sphere"] = "sphere";
        Type["Cuboid"] = "cuboid";
    })(Type = Collider.Type || (Collider.Type = {}));
})(Collider || (Collider = {}));


/***/ }),

/***/ "./src/physics/colliders/plane.ts":
/*!****************************************!*\
  !*** ./src/physics/colliders/plane.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Plane: () => (/* binding */ Plane)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../vectors */ "./src/vectors/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../collider */ "./src/physics/collider.ts");


class Plane extends _collider__WEBPACK_IMPORTED_MODULE_1__.Collider {
    constructor({ normal = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.up, distance = 0 } = {}) {
        super();
        this.type = _collider__WEBPACK_IMPORTED_MODULE_1__.Collider.Type.Plane;
        this.normal = normal.copy();
        this.distance = distance;
    }
    toJSON() {
        const { normal, distance } = this;
        return { normal, distance };
    }
}


/***/ }),

/***/ "./src/physics/colliders/ray.ts":
/*!**************************************!*\
  !*** ./src/physics/colliders/ray.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ray: () => (/* binding */ Ray)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../vectors */ "./src/vectors/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../collider */ "./src/physics/collider.ts");


class Ray extends _collider__WEBPACK_IMPORTED_MODULE_1__.Collider {
    constructor({ origin = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero, direction = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.up }) {
        super();
        this.type = _collider__WEBPACK_IMPORTED_MODULE_1__.Collider.Type.Ray;
        this.origin = origin.copy();
        this.direction = direction.copy().normalize();
    }
    toJSON() {
        const { origin, direction } = this;
        return { origin, direction };
    }
}


/***/ }),

/***/ "./src/physics/collisions/cuboid/cuboid.ts":
/*!*************************************************!*\
  !*** ./src/physics/collisions/cuboid/cuboid.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideCuboidWithCuboid: () => (/* binding */ collideCuboidWithCuboid)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../vectors */ "./src/vectors/index.ts");

const { min, max } = Math;
const collideCuboidWithCuboid = (cuboid1, cuboid2) => {
    const { center: c1, extents: e1 } = cuboid1;
    const { center: c2, extents: e2 } = cuboid2;
    let n = null;
    let d = Infinity;
    const testAxis = (axis) => {
        if (axis.length < _vectors__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
            return true;
        }
        const x = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.absolute(axis);
        const m1 = [
            _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(c1, axis) - _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e1, x),
            _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(c1, axis) + _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e1, x)
        ];
        const m2 = [
            _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(c2, axis) - _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e2, x),
            _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(c2, axis) + _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e2, x)
        ];
        if (m1[1] < m2[0] || m2[1] < m1[0]) {
            return false;
        }
        const o = min(m1[1], m2[1]) - max(m1[0], m2[0]);
        if (o < d) {
            d = o;
            n = axis;
        }
        return true;
    };
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const axis = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(cuboid1.axes[i], cuboid2.axes[j]);
            if (!testAxis(axis)) {
                return null;
            }
        }
    }
    for (let i = 0; i < 3; i++) {
        if (!testAxis(cuboid1.axes[i])) {
            return null;
        }
        if (!testAxis(cuboid2.axes[i])) {
            return null;
        }
    }
    const p = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c1, c2).scale(0.5);
    return { normal: n, contact: p, distance: d };
};


/***/ }),

/***/ "./src/physics/collisions/plane/cuboid.ts":
/*!************************************************!*\
  !*** ./src/physics/collisions/plane/cuboid.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collidePlaneWithCuboid: () => (/* binding */ collidePlaneWithCuboid)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../vectors */ "./src/vectors/index.ts");

const { abs } = Math;
const collidePlaneWithCuboid = (plane, cuboid) => {
    const { normal: n, distance: d } = plane;
    const { center: c, extents: e } = cuboid;
    const s = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(n, c) - d;
    const t = abs(s);
    const f = abs(n.x * e.x) + abs(n.y * e.y) + abs(n.z * e.z);
    if (t > f) {
        return null;
    }
    const p = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(n, f));
    return { contact: p, normal: n, distance: t - f };
};


/***/ }),

/***/ "./src/physics/collisions/plane/sphere.ts":
/*!************************************************!*\
  !*** ./src/physics/collisions/plane/sphere.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collidePlaneWithSphere: () => (/* binding */ collidePlaneWithSphere)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../vectors */ "./src/vectors/index.ts");

const { abs } = Math;
const collidePlaneWithSphere = (plane, sphere) => {
    const { normal: n, distance: d } = plane;
    const { center: c, radius: r } = sphere;
    const s = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(n, c) + d;
    const t = abs(s);
    if (t > r) {
        return null;
    }
    const e = r - t;
    const f = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(n, e);
    const p = (s < 0) ? _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, f) : _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c, f);
    return { contact: p, normal: n, distance: t };
};


/***/ }),

/***/ "./src/physics/collisions/ray/cuboid.ts":
/*!**********************************************!*\
  !*** ./src/physics/collisions/ray/cuboid.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideRayWithCuboid: () => (/* binding */ collideRayWithCuboid)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../vectors */ "./src/vectors/index.ts");

const { min, max } = Math;
const collideRayWithCuboid = (ray, cuboid) => {
    const { origin: o, direction: n } = ray;
    const { center: c, extents: e } = cuboid;
    const maximum = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c, e);
    const minimum = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, e);
    const s1 = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(minimum, o).divide(n);
    const s2 = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(maximum, o).divide(n);
    const m1 = max(min(s1.x, s2.x), min(s1.y, s2.y), min(s1.z, s2.z));
    const m2 = min(max(s1.x, s2.x), max(s1.y, s2.y), max(s1.z, s2.z));
    if (m2 < 0 || m1 > m2) {
        return null;
    }
    const d = (m1 < 0) ? m2 : m1;
    const p = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(o, n).scale(d);
    return { contact: p, normal: n, distance: d };
};


/***/ }),

/***/ "./src/physics/collisions/ray/plane.ts":
/*!*********************************************!*\
  !*** ./src/physics/collisions/ray/plane.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideRayWithPlane: () => (/* binding */ collideRayWithPlane)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../vectors */ "./src/vectors/index.ts");

const collideRayWithPlane = (ray, plane) => {
    const { normal: n, distance: d } = plane;
    const { origin: o, direction: e } = ray;
    const s = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e, n);
    if (s === 0) {
        return null;
    }
    const t = (d - _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(o, n)) / s;
    if (t < 0) {
        return null;
    }
    const p = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(o, _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(e, t));
    return { contact: p, normal: n, distance: t };
};


/***/ }),

/***/ "./src/physics/collisions/ray/ray.ts":
/*!*******************************************!*\
  !*** ./src/physics/collisions/ray/ray.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideRayWithRay: () => (/* binding */ collideRayWithRay)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../vectors */ "./src/vectors/index.ts");

const collideRayWithRay = (ray1, ray2) => {
    const { direction: d1, origin: o1 } = ray1;
    const { direction: d2, origin: o2 } = ray2;
    const c = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(d1, d2);
    const d = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(c, c);
    if (d === 0) {
        return null;
    }
    const f = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(o2, o1);
    const u = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(c, f).scale(1 / d);
    const t = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(f, d2), c) / d;
    if (t < 0 || t > 1) {
        return null;
    }
    const c1 = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(o1, _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(d1, t));
    const c2 = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(o2, _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(d2, u.z));
    const normal = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c1, c2).normalize();
    const distance = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c1, o1), d1);
    return { contact: c1, normal, distance };
};


/***/ }),

/***/ "./src/physics/collisions/ray/sphere.ts":
/*!**********************************************!*\
  !*** ./src/physics/collisions/ray/sphere.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideRayWithSphere: () => (/* binding */ collideRayWithSphere)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../vectors */ "./src/vectors/index.ts");

const { sqrt } = Math;
const collideRayWithSphere = (ray, sphere) => {
    const { origin: o, direction: e } = ray;
    const { center: c, radius: r } = sphere;
    const r2 = r * r;
    const s = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, o);
    const t = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e, s);
    if (t < 0) {
        return null;
    }
    const d2 = s.squaredLength - (t * t);
    if (d2 > r2) {
        return null;
    }
    const d = t - sqrt(r2 - d2);
    const p = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(o, _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(e, d));
    const n = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, c).normalize();
    return { contact: p, normal: n, distance: d };
};


/***/ }),

/***/ "./src/physics/collisions/sphere/cuboid.ts":
/*!*************************************************!*\
  !*** ./src/physics/collisions/sphere/cuboid.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideSphereWithCuboid: () => (/* binding */ collideSphereWithCuboid)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../vectors */ "./src/vectors/index.ts");

const { sqrt, min, max } = Math;
const collideSphereWithCuboid = (sphere, cuboid) => {
    const { center: c1, radius: r } = sphere;
    const { center: c2, extents: e } = cuboid;
    const r2 = r * r;
    const m1 = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c2, e);
    const m2 = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c2, e);
    const m = new _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3([
        max(m2.x, min(c1.x, m1.x)),
        max(m2.y, min(c1.y, m1.y)),
        max(m2.z, min(c1.z, m1.z))
    ]);
    const d1 = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(m, c1);
    const d2 = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(d1, d1);
    if (d2 > r2) {
        return null;
    }
    const n = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.normalize(d1);
    const p = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c1, _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(n, r));
    return { contact: p, normal: n, distance: sqrt(r2 - d2) };
};


/***/ }),

/***/ "./src/physics/collisions/sphere/sphere.ts":
/*!*************************************************!*\
  !*** ./src/physics/collisions/sphere/sphere.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideSphereWithSphere: () => (/* binding */ collideSphereWithSphere)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../vectors */ "./src/vectors/index.ts");

const collideSphereWithSphere = (s1, s2) => {
    const { center: c1, radius: r1 } = s1;
    const { center: c2, radius: r2 } = s2;
    const d = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c2, c1);
    const d2 = d.squaredLength;
    const s = r1 + r2;
    if (d2 > s * s) {
        return null;
    }
    const t = Math.sqrt(d2);
    const n = d.normalize();
    const p = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c1, _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(n, r1));
    return { contact: p, normal: n, distance: t - s };
};


/***/ }),

/***/ "./src/physics/dispatchers/collision.ts":
/*!**********************************************!*\
  !*** ./src/physics/dispatchers/collision.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CollisionDispatcher: () => (/* binding */ CollisionDispatcher)
/* harmony export */ });
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utilities */ "./src/utilities/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../collider */ "./src/physics/collider.ts");
/* harmony import */ var _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../collisions/cuboid/cuboid */ "./src/physics/collisions/cuboid/cuboid.ts");
/* harmony import */ var _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../collisions/plane/cuboid */ "./src/physics/collisions/plane/cuboid.ts");
/* harmony import */ var _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../collisions/plane/sphere */ "./src/physics/collisions/plane/sphere.ts");
/* harmony import */ var _collisions_ray_cuboid__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../collisions/ray/cuboid */ "./src/physics/collisions/ray/cuboid.ts");
/* harmony import */ var _collisions_ray_plane__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../collisions/ray/plane */ "./src/physics/collisions/ray/plane.ts");
/* harmony import */ var _collisions_ray_ray__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../collisions/ray/ray */ "./src/physics/collisions/ray/ray.ts");
/* harmony import */ var _collisions_ray_sphere__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../collisions/ray/sphere */ "./src/physics/collisions/ray/sphere.ts");
/* harmony import */ var _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../collisions/sphere/cuboid */ "./src/physics/collisions/sphere/cuboid.ts");
/* harmony import */ var _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../collisions/sphere/sphere */ "./src/physics/collisions/sphere/sphere.ts");











const { Type } = _collider__WEBPACK_IMPORTED_MODULE_1__.Collider;
class CollisionDispatcher extends _utilities__WEBPACK_IMPORTED_MODULE_0__.Dispatcher {
    constructor() {
        super();
        // ray
        this.register(Type.Ray, Type.Ray, _collisions_ray_ray__WEBPACK_IMPORTED_MODULE_7__.collideRayWithRay);
        this.register(Type.Ray, Type.Plane, _collisions_ray_plane__WEBPACK_IMPORTED_MODULE_6__.collideRayWithPlane);
        this.register(Type.Ray, Type.Sphere, _collisions_ray_sphere__WEBPACK_IMPORTED_MODULE_8__.collideRayWithSphere);
        this.register(Type.Ray, Type.Cuboid, _collisions_ray_cuboid__WEBPACK_IMPORTED_MODULE_5__.collideRayWithCuboid);
        // plane
        this.register(Type.Plane, Type.Sphere, _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_4__.collidePlaneWithSphere);
        this.register(Type.Plane, Type.Cuboid, _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_3__.collidePlaneWithCuboid);
        // sphere
        this.register(Type.Sphere, Type.Sphere, _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_10__.collideSphereWithSphere);
        this.register(Type.Sphere, Type.Cuboid, _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_9__.collideSphereWithCuboid);
        // cuboid
        this.register(Type.Cuboid, Type.Cuboid, _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_2__.collideCuboidWithCuboid);
    }
}


/***/ }),

/***/ "./src/physics/index.ts":
/*!******************************!*\
  !*** ./src/physics/index.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Collider: () => (/* reexport safe */ _collider__WEBPACK_IMPORTED_MODULE_1__.Collider),
/* harmony export */   CollisionDispatcher: () => (/* reexport safe */ _dispatchers_collision__WEBPACK_IMPORTED_MODULE_6__.CollisionDispatcher),
/* harmony export */   Cuboid: () => (/* reexport safe */ _volumes_cuboid__WEBPACK_IMPORTED_MODULE_5__.Cuboid),
/* harmony export */   Plane: () => (/* reexport safe */ _colliders_plane__WEBPACK_IMPORTED_MODULE_3__.Plane),
/* harmony export */   Ray: () => (/* reexport safe */ _colliders_ray__WEBPACK_IMPORTED_MODULE_2__.Ray),
/* harmony export */   Sphere: () => (/* reexport safe */ _volumes_sphere__WEBPACK_IMPORTED_MODULE_4__.Sphere),
/* harmony export */   Volume: () => (/* reexport safe */ _volume__WEBPACK_IMPORTED_MODULE_0__.Volume),
/* harmony export */   collideCuboidWithCuboid: () => (/* reexport safe */ _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_15__.collideCuboidWithCuboid),
/* harmony export */   collidePlaneWithCuboid: () => (/* reexport safe */ _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_12__.collidePlaneWithCuboid),
/* harmony export */   collidePlaneWithSphere: () => (/* reexport safe */ _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_11__.collidePlaneWithSphere),
/* harmony export */   collideRayWithCuboid: () => (/* reexport safe */ _collisions_ray_cuboid__WEBPACK_IMPORTED_MODULE_10__.collideRayWithCuboid),
/* harmony export */   collideRayWithPlane: () => (/* reexport safe */ _collisions_ray_plane__WEBPACK_IMPORTED_MODULE_8__.collideRayWithPlane),
/* harmony export */   collideRayWithRay: () => (/* reexport safe */ _collisions_ray_ray__WEBPACK_IMPORTED_MODULE_7__.collideRayWithRay),
/* harmony export */   collideRayWithSphere: () => (/* reexport safe */ _collisions_ray_sphere__WEBPACK_IMPORTED_MODULE_9__.collideRayWithSphere),
/* harmony export */   collideSphereWithCuboid: () => (/* reexport safe */ _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_14__.collideSphereWithCuboid),
/* harmony export */   collideSphereWithSphere: () => (/* reexport safe */ _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_13__.collideSphereWithSphere)
/* harmony export */ });
/* harmony import */ var _volume__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./volume */ "./src/physics/volume.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collider */ "./src/physics/collider.ts");
/* harmony import */ var _colliders_ray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./colliders/ray */ "./src/physics/colliders/ray.ts");
/* harmony import */ var _colliders_plane__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./colliders/plane */ "./src/physics/colliders/plane.ts");
/* harmony import */ var _volumes_sphere__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./volumes/sphere */ "./src/physics/volumes/sphere.ts");
/* harmony import */ var _volumes_cuboid__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./volumes/cuboid */ "./src/physics/volumes/cuboid.ts");
/* harmony import */ var _dispatchers_collision__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./dispatchers/collision */ "./src/physics/dispatchers/collision.ts");
/* harmony import */ var _collisions_ray_ray__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./collisions/ray/ray */ "./src/physics/collisions/ray/ray.ts");
/* harmony import */ var _collisions_ray_plane__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./collisions/ray/plane */ "./src/physics/collisions/ray/plane.ts");
/* harmony import */ var _collisions_ray_sphere__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./collisions/ray/sphere */ "./src/physics/collisions/ray/sphere.ts");
/* harmony import */ var _collisions_ray_cuboid__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./collisions/ray/cuboid */ "./src/physics/collisions/ray/cuboid.ts");
/* harmony import */ var _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./collisions/plane/sphere */ "./src/physics/collisions/plane/sphere.ts");
/* harmony import */ var _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./collisions/plane/cuboid */ "./src/physics/collisions/plane/cuboid.ts");
/* harmony import */ var _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./collisions/sphere/sphere */ "./src/physics/collisions/sphere/sphere.ts");
/* harmony import */ var _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./collisions/sphere/cuboid */ "./src/physics/collisions/sphere/cuboid.ts");
/* harmony import */ var _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./collisions/cuboid/cuboid */ "./src/physics/collisions/cuboid/cuboid.ts");


















/***/ }),

/***/ "./src/physics/volume.ts":
/*!*******************************!*\
  !*** ./src/physics/volume.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Volume: () => (/* binding */ Volume)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../vectors */ "./src/vectors/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collider */ "./src/physics/collider.ts");


class Volume extends _collider__WEBPACK_IMPORTED_MODULE_1__.Collider {
    constructor({ origin = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero } = {}) {
        super();
        this.origin = origin.copy();
        this.center = origin.copy();
        this.inertia = new _vectors__WEBPACK_IMPORTED_MODULE_0__.mat3();
    }
    toJSON() {
        const { origin } = this;
        return { origin };
    }
}


/***/ }),

/***/ "./src/physics/volumes/cuboid.ts":
/*!***************************************!*\
  !*** ./src/physics/volumes/cuboid.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Cuboid: () => (/* binding */ Cuboid)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../vectors */ "./src/vectors/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../collider */ "./src/physics/collider.ts");
/* harmony import */ var _volume__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../volume */ "./src/physics/volume.ts");



class Cuboid extends _volume__WEBPACK_IMPORTED_MODULE_2__.Volume {
    constructor({ origin = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero, extents = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.one } = {}) {
        super({ origin });
        this.type = _collider__WEBPACK_IMPORTED_MODULE_1__.Collider.Type.Cuboid;
        this.extents = extents.copy();
        this.axes = [];
        _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.axes.forEach((axis) => {
            this.axes.push(axis.copy());
        });
    }
    transform(transform) {
        const { translation, rotation } = transform;
        _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(this.origin, translation, this.center);
        _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.axes.forEach((axis, index) => {
            rotation.transformVec3(axis, this.axes[index]);
        });
    }
    calculateInertia(mass, transform) {
        const { rotationMatrix } = transform;
        const { x, y, z } = this.extents;
        const t1 = (1 / 12) * mass * (y * y + z * z);
        const t2 = (1 / 12) * mass * (x * x + z * z);
        const t3 = (1 / 12) * mass * (x * x + y * y);
        this.inertia.set([
            t1, 0, 0,
            0, t2, 0,
            0, 0, t3
        ]);
        this.inertia.multiply(rotationMatrix).invert();
    }
    toJSON() {
        const { extents } = this;
        return Object.assign(Object.assign({}, super.toJSON()), { extents });
    }
}


/***/ }),

/***/ "./src/physics/volumes/sphere.ts":
/*!***************************************!*\
  !*** ./src/physics/volumes/sphere.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Sphere: () => (/* binding */ Sphere)
/* harmony export */ });
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../vectors */ "./src/vectors/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../collider */ "./src/physics/collider.ts");
/* harmony import */ var _volume__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../volume */ "./src/physics/volume.ts");



class Sphere extends _volume__WEBPACK_IMPORTED_MODULE_2__.Volume {
    constructor({ origin = _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero, radius = 1.0 }) {
        super({ origin });
        this.type = _collider__WEBPACK_IMPORTED_MODULE_1__.Collider.Type.Sphere;
        this.radius = radius;
    }
    transform(transform) {
        const { translation } = transform;
        _vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(this.origin, translation, this.center);
    }
    calculateInertia(mass, transform) {
        const { radius } = this;
        const t = (2 / 5) * mass * radius * radius;
        this.inertia.set([
            t, 0, 0,
            0, t, 0,
            0, 0, t
        ]);
        this.inertia.invert();
    }
    toJSON() {
        const { radius } = this;
        return Object.assign(Object.assign({}, super.toJSON()), { radius });
    }
}


/***/ }),

/***/ "./src/utilities/dispatcher.ts":
/*!*************************************!*\
  !*** ./src/utilities/dispatcher.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Dispatcher: () => (/* binding */ Dispatcher)
/* harmony export */ });
class Dispatcher {
    constructor() {
        this.callbacks = new Map();
    }
    register(firstType, otherType, callback) {
        this.callbacks.set(`${firstType}-${otherType}`, callback);
    }
    dispatch(first, other) {
        let key = `${first.type}-${other.type}`;
        let callback = this.callbacks.get(key);
        if (!callback) {
            key = `${other.type}-${first.type}`;
            callback = this.callbacks.get(key);
            if (callback) {
                return callback(other, first);
            }
        }
        return (callback) ? callback(first, other) : null;
    }
}


/***/ }),

/***/ "./src/utilities/index.ts":
/*!********************************!*\
  !*** ./src/utilities/index.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Dispatcher: () => (/* reexport safe */ _dispatcher__WEBPACK_IMPORTED_MODULE_1__.Dispatcher),
/* harmony export */   Pool: () => (/* reexport safe */ _pool__WEBPACK_IMPORTED_MODULE_0__.Pool)
/* harmony export */ });
/* harmony import */ var _pool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pool */ "./src/utilities/pool.ts");
/* harmony import */ var _dispatcher__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dispatcher */ "./src/utilities/dispatcher.ts");




/***/ }),

/***/ "./src/utilities/pool.ts":
/*!*******************************!*\
  !*** ./src/utilities/pool.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pool: () => (/* binding */ Pool)
/* harmony export */ });
const { ceil } = Math;
class Pool {
    constructor(create, reset, initialSize, // number of objects to allocate on pool creation
    batchSize = 0 // number of objects to create whenever pool needs to grow
    ) {
        this.create = create;
        this.reset = reset;
        this.initialSize = initialSize;
        this.batchSize = batchSize;
        this.pool = new Array();
        this.maximumSize = initialSize;
        this.allocate(this.initialSize);
    }
    get length() {
        return this.pool.length;
    }
    acquire() {
        if (this.pool.length > 0) {
            // if number of available objects is less than 10% of maximum size,
            // double maximum size and fill up pool with newly allocated objects
            if (this.pool.length <= ceil(this.maximumSize * 0.1)) {
                this.maximumSize *= 2;
                this.allocate(this.maximumSize - this.pool.length);
            }
        }
        else {
            // if there are none available, 
            // allocate new batch of objects
            this.allocate(this.batchSize);
        }
        return this.pool.pop(); // return last object in pool
    }
    release(object) {
        this.pool.push(this.reset(object));
    }
    allocate(size) {
        for (let i = 0; i < size; i++) {
            this.pool.push(this.create());
        }
    }
}


/***/ }),

/***/ "./src/vectors/constants.ts":
/*!**********************************!*\
  !*** ./src/vectors/constants.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Epsilon: () => (/* binding */ Epsilon)
/* harmony export */ });
const Epsilon = 0.00001;


/***/ }),

/***/ "./src/vectors/index.ts":
/*!******************************!*\
  !*** ./src/vectors/index.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Epsilon: () => (/* reexport safe */ _constants__WEBPACK_IMPORTED_MODULE_7__.Epsilon),
/* harmony export */   mat2: () => (/* reexport safe */ _mat2__WEBPACK_IMPORTED_MODULE_0__.mat2),
/* harmony export */   mat3: () => (/* reexport safe */ _mat3__WEBPACK_IMPORTED_MODULE_1__.mat3),
/* harmony export */   mat4: () => (/* reexport safe */ _mat4__WEBPACK_IMPORTED_MODULE_2__.mat4),
/* harmony export */   quat: () => (/* reexport safe */ _quat__WEBPACK_IMPORTED_MODULE_6__.quat),
/* harmony export */   vec2: () => (/* reexport safe */ _vec2__WEBPACK_IMPORTED_MODULE_3__.vec2),
/* harmony export */   vec3: () => (/* reexport safe */ _vec3__WEBPACK_IMPORTED_MODULE_4__.vec3),
/* harmony export */   vec4: () => (/* reexport safe */ _vec4__WEBPACK_IMPORTED_MODULE_5__.vec4)
/* harmony export */ });
/* harmony import */ var _mat2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mat2 */ "./src/vectors/mat2.ts");
/* harmony import */ var _mat3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat3 */ "./src/vectors/mat3.ts");
/* harmony import */ var _mat4__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mat4 */ "./src/vectors/mat4.ts");
/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec2 */ "./src/vectors/vec2.ts");
/* harmony import */ var _vec3__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vec3 */ "./src/vectors/vec3.ts");
/* harmony import */ var _vec4__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./vec4 */ "./src/vectors/vec4.ts");
/* harmony import */ var _quat__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./quat */ "./src/vectors/quat.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants */ "./src/vectors/constants.ts");










/***/ }),

/***/ "./src/vectors/mat2.ts":
/*!*****************************!*\
  !*** ./src/vectors/mat2.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mat2: () => (/* binding */ mat2)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/vectors/constants.ts");
/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vec2 */ "./src/vectors/vec2.ts");


class mat2 extends Float32Array {
    constructor(values = [
        1.0, 0.0,
        0.0, 1.0
    ]) {
        super(values.slice(0, 4));
    }
    get determinant() {
        return this[0] * this[3] - this[2] * this[1];
    }
    copy(dest = null) {
        if (!dest) {
            dest = new mat2();
        }
        dest.set(this);
        return dest;
    }
    row(index, dest = null) {
        if (!dest) {
            dest = new _vec2__WEBPACK_IMPORTED_MODULE_1__.vec2();
        }
        dest.x = this[index * 2];
        dest.y = this[index * 2 + 1];
        return dest;
    }
    column(index, dest = null) {
        if (!dest) {
            dest = new _vec2__WEBPACK_IMPORTED_MODULE_1__.vec2();
        }
        dest.x = this[index];
        dest.y = this[index + 2];
        return dest;
    }
    equals(other, threshold = _constants__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
        for (let i = 0; i < 4; i++) {
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
        this[3] = 1.0;
        return this;
    }
    transpose(dest = null) {
        if (!dest) {
            dest = this;
        }
        const t = this[1];
        dest[1] = dest[2];
        dest[2] = t;
        return dest;
    }
    invert(dest = null) {
        if (!dest) {
            dest = this;
        }
        let det = this.determinant;
        if (det === 0.0) {
            return null;
        }
        det = 1.0 / det;
        const t00 = this[0];
        const t01 = this[1];
        const t10 = this[2];
        const t11 = this[3];
        dest[0] = det * t11;
        dest[1] = det * -t01;
        dest[2] = det * -t10;
        dest[3] = det * t00;
        return dest;
    }
    multiply(other, dest = null) {
        if (!dest) {
            dest = this;
        }
        const a00 = this[0];
        const a01 = this[1];
        const a10 = this[2];
        const a11 = this[3];
        const b00 = other[0];
        const b01 = other[1];
        const b10 = other[2];
        const b11 = other[3];
        dest[0] = a00 * b00 + a01 * b10;
        dest[1] = a00 * b01 + a01 * b11;
        dest[2] = a10 * b00 + a11 * b10;
        dest[3] = a10 * b01 + a11 * b11;
        return dest;
    }
    transform(vector, dest = null) {
        if (!dest) {
            dest = new _vec2__WEBPACK_IMPORTED_MODULE_1__.vec2();
        }
        const x = vector.x;
        const y = vector.y;
        dest.x = x * this[0] + y * this[1];
        dest.y = x * this[2] + y * this[3];
        return dest;
    }
    scale(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        const v00 = this[0];
        const v01 = this[1];
        const v10 = this[2];
        const v11 = this[3];
        const x = vector.x;
        const y = vector.y;
        dest[0] = v00 * x;
        dest[1] = v01 * y;
        dest[2] = v10 * x;
        dest[3] = v11 * y;
        return dest;
    }
    rotate(angle, dest = null) {
        if (!dest) {
            dest = this;
        }
        const v00 = this[0];
        const v01 = this[1];
        const v10 = this[2];
        const v11 = this[3];
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        dest[0] = v00 * cos + v01 * sin;
        dest[1] = v00 * -sin + v01 * cos;
        dest[2] = v10 * cos + v11 * sin;
        dest[3] = v10 * -sin + v11 * cos;
        return dest;
    }
    static multiply(m1, m2, dest = null) {
        if (!dest) {
            dest = new mat2();
        }
        const a00 = m1[0];
        const a01 = m1[1];
        const a10 = m1[2];
        const a11 = m1[3];
        const b00 = m2[0];
        const b01 = m2[1];
        const b10 = m2[2];
        const b11 = m2[3];
        dest[0] = a00 * b00 + a01 * b10;
        dest[1] = a00 * b01 + a01 * b11;
        dest[2] = a10 * b00 + a11 * b10;
        dest[3] = a10 * b01 + a11 * b11;
        return dest;
    }
}
mat2.identity = new mat2();


/***/ }),

/***/ "./src/vectors/mat3.ts":
/*!*****************************!*\
  !*** ./src/vectors/mat3.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mat3: () => (/* binding */ mat3)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/vectors/constants.ts");
/* harmony import */ var _mat4__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat4 */ "./src/vectors/mat4.ts");
/* harmony import */ var _quat__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./quat */ "./src/vectors/quat.ts");
/* harmony import */ var _vec3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec3 */ "./src/vectors/vec3.ts");




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
            dest = new _vec3__WEBPACK_IMPORTED_MODULE_3__.vec3();
        }
        dest.x = this[index * 3];
        dest.y = this[index * 3 + 1];
        dest.z = this[index * 3 + 2];
        return dest;
    }
    column(index, dest = null) {
        if (!dest) {
            dest = new _vec3__WEBPACK_IMPORTED_MODULE_3__.vec3();
        }
        dest.x = this[index];
        dest.y = this[index + 3];
        dest.z = this[index + 6];
        return dest;
    }
    equals(other, threshold = _constants__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
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
            dest = new _vec3__WEBPACK_IMPORTED_MODULE_3__.vec3();
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
            dest = new _mat4__WEBPACK_IMPORTED_MODULE_1__.mat4();
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
            dest = new _quat__WEBPACK_IMPORTED_MODULE_2__.quat();
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
    static transform(matrix, vector, dest = null) {
        if (!dest) {
            dest = new _vec3__WEBPACK_IMPORTED_MODULE_3__.vec3();
        }
        const { x, y, z } = vector;
        dest.x = x * matrix[0] + y * matrix[3] + z * matrix[6];
        dest.y = x * matrix[1] + y * matrix[4] + z * matrix[7];
        dest.z = x * matrix[2] + y * matrix[5] + z * matrix[8];
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
    static lookAt(eye, target, up = _vec3__WEBPACK_IMPORTED_MODULE_3__.vec3.up, dest = null) {
        if (!dest) {
            dest = new mat3();
        }
        if (eye.equals(target)) {
            return this.identity.copy(dest);
        }
        const z = _vec3__WEBPACK_IMPORTED_MODULE_3__.vec3.subtract(eye, target).normalize();
        const x = _vec3__WEBPACK_IMPORTED_MODULE_3__.vec3.cross(up, z).normalize();
        const y = _vec3__WEBPACK_IMPORTED_MODULE_3__.vec3.cross(z, x).normalize();
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
mat3.identity = new mat3();


/***/ }),

/***/ "./src/vectors/mat4.ts":
/*!*****************************!*\
  !*** ./src/vectors/mat4.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mat4: () => (/* binding */ mat4)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/vectors/constants.ts");
/* harmony import */ var _mat3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat3 */ "./src/vectors/mat3.ts");
/* harmony import */ var _vec3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vec3 */ "./src/vectors/vec3.ts");
/* harmony import */ var _vec4__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec4 */ "./src/vectors/vec4.ts");




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
            dest = new _vec4__WEBPACK_IMPORTED_MODULE_3__.vec4();
        }
        dest.x = this[index];
        dest.y = this[index + 4];
        dest.z = this[index + 8];
        dest.w = this[index + 12];
        return dest;
    }
    equals(other, threshold = _constants__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
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
            dest = new _vec4__WEBPACK_IMPORTED_MODULE_3__.vec4();
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
            dest = new _vec3__WEBPACK_IMPORTED_MODULE_2__.vec3();
        }
        const { x, y, z } = vector;
        dest.x = this[0] * x + this[4] * y + this[8] * z + this[12];
        dest.y = this[1] * x + this[5] * y + this[9] * z + this[13];
        dest.z = this[2] * x + this[6] * y + this[10] * z + this[14];
        return dest;
    }
    toMat3(dest = null) {
        if (!dest) {
            dest = new _mat3__WEBPACK_IMPORTED_MODULE_1__.mat3();
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
    static lookAt(eye, target, up = _vec3__WEBPACK_IMPORTED_MODULE_2__.vec3.up, dest = null) {
        if (!dest) {
            dest = new mat4();
        }
        if (eye.equals(target)) {
            return this.identity.copy(dest);
        }
        const z = _vec3__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(eye, target).normalize();
        const x = _vec3__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(up, z).normalize();
        const y = _vec3__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(z, x).normalize();
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
mat4.identity = new mat4();


/***/ }),

/***/ "./src/vectors/quat.ts":
/*!*****************************!*\
  !*** ./src/vectors/quat.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   quat: () => (/* binding */ quat)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/vectors/constants.ts");
/* harmony import */ var _mat3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat3 */ "./src/vectors/mat3.ts");
/* harmony import */ var _mat4__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mat4 */ "./src/vectors/mat4.ts");
/* harmony import */ var _vec3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec3 */ "./src/vectors/vec3.ts");




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
        const { x, y, z, w } = this;
        return Math.atan2(2.0 * (y * z + w * x), w * w - x * x - y * y + z * z);
    }
    set pitch(pitch) {
        quat.fromEulerAngles(this.yaw, pitch, this.roll, this);
    }
    get roll() {
        const { x, y, z, w } = this;
        return Math.atan2(2.0 * (x * y + w * z), w * w + x * x - y * y - z * z);
    }
    set roll(roll) {
        quat.fromEulerAngles(this.yaw, this.pitch, roll, this);
    }
    get length() {
        return Math.sqrt(this.squaredLength);
    }
    get squaredLength() {
        const { x, y, z, w } = this;
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
        const { x, y, z } = this;
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
        const { x, y, z, w } = this;
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
    equals(q, threshold = _constants__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
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
    transformVec3(vector, dest = null) {
        if (!dest) {
            dest = new _vec3__WEBPACK_IMPORTED_MODULE_3__.vec3();
        }
        const { x, y, z } = vector;
        const q1 = new quat([x, y, z, 0]);
        const q2 = this.copy().invert();
        const q3 = this.copy().multiply(q1);
        const q4 = q3.copy().multiply(q2);
        dest.xyz = [q4.x, q4.y, q4.z];
        return dest;
    }
    toMat3(dest = null) {
        if (!dest) {
            dest = new _mat3__WEBPACK_IMPORTED_MODULE_1__.mat3();
        }
        const { x, y, z, w } = this;
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
            dest = new _mat4__WEBPACK_IMPORTED_MODULE_2__.mat4();
        }
        const { x, y, z, w } = this;
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
    toJSON() {
        const { x, y, z, w } = this;
        return [x, y, z, w];
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
        if (cos > 1 - _constants__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
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
quat.identity = new quat();


/***/ }),

/***/ "./src/vectors/vec2.ts":
/*!*****************************!*\
  !*** ./src/vectors/vec2.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   vec2: () => (/* binding */ vec2)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/vectors/constants.ts");

const { min, max, abs, sqrt } = Math;
class vec2 extends Float32Array {
    constructor(values = [0.0, 0.0]) {
        super(values.slice(0, 2));
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
    get xy() {
        return Array.from(this);
    }
    set xy(xy) {
        this.set(xy);
    }
    get length() {
        return sqrt(this.squaredLength);
    }
    get squaredLength() {
        const { x, y } = this;
        return x * x + y * y;
    }
    reset() {
        this.x = 0.0;
        this.y = 0.0;
        return this;
    }
    copy(dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        dest.x = this.x;
        dest.y = this.y;
        return dest;
    }
    negate(dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = -this.x;
        dest.y = -this.y;
        return dest;
    }
    equals(vector, threshold = _constants__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
        if (abs(this.x - vector.x) > threshold) {
            return false;
        }
        if (abs(this.y - vector.y) > threshold) {
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
        return dest;
    }
    subtract(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x - vector.x;
        dest.y = this.y - vector.y;
        return dest;
    }
    multiply(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x * vector.x;
        dest.y = this.y * vector.y;
        return dest;
    }
    divide(vector, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x / vector.x;
        dest.y = this.y / vector.y;
        return dest;
    }
    scale(scalar, dest = null) {
        if (!dest) {
            dest = this;
        }
        dest.x = this.x * scalar;
        dest.y = this.y * scalar;
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
            return dest;
        }
        length = 1.0 / length;
        dest.x = this.x * length;
        dest.y = this.y * length;
        return dest;
    }
    transform(matrix, dest = null) {
        if (!dest) {
            dest = this;
        }
        return matrix.transform(this, dest);
    }
    toJSON() {
        const { x, y } = this;
        return [x, y];
    }
    static absolute(vector, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        dest.x = abs(vector.x);
        dest.y = abs(vector.y);
        return dest;
    }
    static minimum(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        dest.x = min(vector.x, vector2.x);
        dest.y = min(vector.y, vector2.y);
        return dest;
    }
    static maximum(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        dest.x = max(vector.x, vector2.x);
        dest.y = max(vector.y, vector2.y);
        return dest;
    }
    static cross(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        dest.x = vector.x * vector2.y;
        dest.y = vector.y * vector2.x;
        return dest;
    }
    static dot(vector, vector2) {
        return vector.x * vector2.x + vector.y * vector2.y;
    }
    static distance(vector, vector2) {
        return sqrt(this.squaredDistance(vector, vector2));
    }
    static squaredDistance(vector, vector2) {
        const x = vector2.x - vector.x;
        const y = vector2.y - vector.y;
        return x * x + y * y;
    }
    static direction(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        const x = vector.x - vector2.x;
        const y = vector.y - vector2.y;
        let length = sqrt(x * x + y * y);
        if (length === 0) {
            dest.x = 0;
            dest.y = 0;
            return dest;
        }
        length = 1 / length;
        dest.x = x * length;
        dest.y = y * length;
        return dest;
    }
    static mix(vector, vector2, time, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        const x = vector.x;
        const y = vector.y;
        const x2 = vector2.x;
        const y2 = vector2.y;
        dest.x = x + time * (x2 - x);
        dest.y = y + time * (y2 - y);
        return dest;
    }
    static add(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        dest.x = vector.x + vector2.x;
        dest.y = vector.y + vector2.y;
        return dest;
    }
    static subtract(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        dest.x = vector.x - vector2.x;
        dest.y = vector.y - vector2.y;
        return dest;
    }
    static multiply(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        dest.x = vector.x * vector2.x;
        dest.y = vector.y * vector2.y;
        return dest;
    }
    static divide(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        dest.x = vector.x / vector2.x;
        dest.y = vector.y / vector2.y;
        return dest;
    }
    static scale(vector, scalar, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        return vector.scale(scalar, dest);
    }
    static normalize(vector, dest = null) {
        if (!dest) {
            dest = new vec2();
        }
        return vector.normalize(dest);
    }
    static sum(...vectors) {
        const dest = new vec2();
        for (const vector of vectors) {
            dest.x += vector.x;
            dest.y += vector.y;
        }
        return dest;
    }
    static difference(...vectors) {
        const dest = new vec2();
        for (const vector of vectors) {
            dest.x -= vector.x;
            dest.y -= vector.y;
        }
        return dest;
    }
    static product(...vectors) {
        const dest = new vec2();
        for (const vector of vectors) {
            dest.x *= vector.x;
            dest.y *= vector.y;
        }
        return dest;
    }
    static division(...vectors) {
        const dest = new vec2();
        for (const vector of vectors) {
            dest.x /= vector.x;
            dest.y /= vector.y;
        }
        return dest;
    }
}
vec2.zero = new vec2([0.0, 0.0]);
vec2.one = new vec2([1.0, 1.0]);
vec2.right = new vec2([1.0, 0.0]);
vec2.up = new vec2([0.0, 1.0]);
vec2.axes = [vec2.right, vec2.up];
vec2.infinity = new vec2([Infinity, Infinity]);


/***/ }),

/***/ "./src/vectors/vec3.ts":
/*!*****************************!*\
  !*** ./src/vectors/vec3.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   vec3: () => (/* binding */ vec3)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/vectors/constants.ts");

const { min, max, abs, sqrt } = Math;
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
    get length() {
        return sqrt(this.squaredLength);
    }
    get squaredLength() {
        const { x, y, z } = this;
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
    equals(vector, threshold = _constants__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
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
    toJSON() {
        const { x, y, z } = this;
        return [x, y, z];
    }
    static absolute(vector, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = abs(vector.x);
        dest.y = abs(vector.y);
        dest.z = abs(vector.z);
        return dest;
    }
    static minimum(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = min(vector.x, vector2.x);
        dest.y = min(vector.y, vector2.y);
        dest.z = min(vector.z, vector2.z);
        return dest;
    }
    static maximum(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = max(vector.x, vector2.x);
        dest.y = max(vector.y, vector2.y);
        dest.z = max(vector.z, vector2.z);
        return dest;
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
    static sum(...vectors) {
        const dest = new vec3();
        for (const vector of vectors) {
            dest.x += vector.x;
            dest.y += vector.y;
            dest.z += vector.z;
        }
        return dest;
    }
    static difference(...vectors) {
        const dest = new vec3();
        for (const vector of vectors) {
            dest.x -= vector.x;
            dest.y -= vector.y;
            dest.z -= vector.z;
        }
        return dest;
    }
    static product(...vectors) {
        const dest = new vec3();
        for (const vector of vectors) {
            dest.x *= vector.x;
            dest.y *= vector.y;
            dest.z *= vector.z;
        }
        return dest;
    }
    static division(...vectors) {
        const dest = new vec3();
        for (const vector of vectors) {
            dest.x /= vector.x;
            dest.y /= vector.y;
            dest.z /= vector.z;
        }
        return dest;
    }
}
vec3.zero = new vec3([0.0, 0.0, 0.0]);
vec3.one = new vec3([1.0, 1.0, 1.0]);
vec3.right = new vec3([1.0, 0.0, 0.0]);
vec3.up = new vec3([0.0, 1.0, 0.0]);
vec3.forward = new vec3([0.0, 0.0, 1.0]);
vec3.axes = [vec3.right, vec3.up, vec3.forward];
vec3.infinity = new vec3([Infinity, Infinity, Infinity]);


/***/ }),

/***/ "./src/vectors/vec4.ts":
/*!*****************************!*\
  !*** ./src/vectors/vec4.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   vec4: () => (/* binding */ vec4)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/vectors/constants.ts");

const { min, max, abs, sqrt } = Math;
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
    get length() {
        return sqrt(this.squaredLength);
    }
    get squaredLength() {
        const { x, y, z, w } = this;
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
    equals(vector, threshold = _constants__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
        if (abs(this.x - vector.x) > threshold) {
            return false;
        }
        if (abs(this.y - vector.y) > threshold) {
            return false;
        }
        if (abs(this.z - vector.z) > threshold) {
            return false;
        }
        if (abs(this.w - vector.w) > threshold) {
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
    toJSON() {
        const { x, y, z, w } = this;
        return [x, y, z, w];
    }
    static absolute(vector, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        dest.x = abs(vector.x);
        dest.y = abs(vector.y);
        dest.z = abs(vector.z);
        dest.w = abs(vector.w);
        return dest;
    }
    static minimum(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        dest.x = min(vector.x, vector2.x);
        dest.y = min(vector.y, vector2.y);
        dest.z = min(vector.z, vector2.z);
        dest.z = min(vector.w, vector2.w);
        return dest;
    }
    static maximum(vector, vector2, dest = null) {
        if (!dest) {
            dest = new vec4();
        }
        dest.x = max(vector.x, vector2.x);
        dest.y = max(vector.y, vector2.y);
        dest.z = max(vector.z, vector2.z);
        dest.z = max(vector.w, vector2.w);
        return dest;
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
    static sum(...vectors) {
        const dest = new vec4();
        for (const vector of vectors) {
            dest.x += vector.x;
            dest.y += vector.y;
            dest.z += vector.z;
            dest.w += vector.w;
        }
        return dest;
    }
    static difference(...vectors) {
        const dest = new vec4();
        for (const vector of vectors) {
            dest.x -= vector.x;
            dest.y -= vector.y;
            dest.z -= vector.z;
            dest.w -= vector.w;
        }
        return dest;
    }
    static product(...vectors) {
        const dest = new vec4();
        for (const vector of vectors) {
            dest.x *= vector.x;
            dest.y *= vector.y;
            dest.z *= vector.z;
            dest.w *= vector.w;
        }
        return dest;
    }
    static division(...vectors) {
        const dest = new vec4();
        for (const vector of vectors) {
            dest.x /= vector.x;
            dest.y /= vector.y;
            dest.z /= vector.z;
            dest.w /= vector.w;
        }
        return dest;
    }
}
vec4.zero = new vec4([0.0, 0.0, 0.0, 1.0]);
vec4.one = new vec4([1.0, 1.0, 1.0, 1.0]);


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
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Body: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Body),
/* harmony export */   Buffer: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Buffer),
/* harmony export */   Buffers: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Buffers),
/* harmony export */   Camera: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Camera),
/* harmony export */   Collider: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Collider),
/* harmony export */   CollisionDispatcher: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.CollisionDispatcher),
/* harmony export */   Component: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Component),
/* harmony export */   Cuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Cuboid),
/* harmony export */   Dispatcher: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.Dispatcher),
/* harmony export */   Display: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Display),
/* harmony export */   Entity: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Entity),
/* harmony export */   Epsilon: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.Epsilon),
/* harmony export */   Light: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Light),
/* harmony export */   Mesh: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Mesh),
/* harmony export */   Meshes: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Meshes),
/* harmony export */   Model: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Model),
/* harmony export */   Plane: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Plane),
/* harmony export */   Pool: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.Pool),
/* harmony export */   Programs: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Programs),
/* harmony export */   Ray: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Ray),
/* harmony export */   Renderer: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Renderer),
/* harmony export */   Samplers: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Samplers),
/* harmony export */   Scene: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Scene),
/* harmony export */   Shader: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Shader),
/* harmony export */   Shaders: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Shaders),
/* harmony export */   Sphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Sphere),
/* harmony export */   State: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.State),
/* harmony export */   Texture: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Texture),
/* harmony export */   Textures: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Textures),
/* harmony export */   Transform: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Transform),
/* harmony export */   Volume: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Volume),
/* harmony export */   collideCuboidWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideCuboidWithCuboid),
/* harmony export */   collidePlaneWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePlaneWithCuboid),
/* harmony export */   collidePlaneWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePlaneWithSphere),
/* harmony export */   collideRayWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithCuboid),
/* harmony export */   collideRayWithPlane: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithPlane),
/* harmony export */   collideRayWithRay: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithRay),
/* harmony export */   collideRayWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithSphere),
/* harmony export */   collideSphereWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideSphereWithCuboid),
/* harmony export */   collideSphereWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideSphereWithSphere),
/* harmony export */   mat2: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.mat2),
/* harmony export */   mat3: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.mat3),
/* harmony export */   mat4: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.mat4),
/* harmony export */   quat: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.quat),
/* harmony export */   vec2: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.vec2),
/* harmony export */   vec3: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.vec3),
/* harmony export */   vec4: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.vec4)
/* harmony export */ });
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core */ "./src/core/index.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./graphics */ "./src/graphics/index.ts");
/* harmony import */ var _physics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./physics */ "./src/physics/index.ts");
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vectors */ "./src/vectors/index.ts");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utilities */ "./src/utilities/index.ts");






})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxDQUFDLENBQUM7UUFFbkIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUVwQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMvQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMvQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMvQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUUvQixPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsU0FBUyxDQUFDLE1BQVksRUFBRSxPQUFvQixJQUFJO1FBQzlDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSSx1Q0FBSSxFQUFFO1NBQ2xCO1FBRUQsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDbEIsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFFbEIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVsQyxPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQVksRUFBRSxPQUFvQixJQUFJO1FBQzFDLElBQUksQ0FBQyxJ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S0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFcEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFM0MsT0FBTyxJQUFJO0lBQ2IsQ0FB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QztRQUN6QixNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUM3QixNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUM3QixNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUM3QixNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBRXpCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBRTNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBRTNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxH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QUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVqQixJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFFakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztZQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7WUFFakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFH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QUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUVwQixNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDakMsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNqQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDakMsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNqQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDakMsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUNqQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDakMsTUFBTSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUVqQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFN0UsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1lBQ2IsT0FBTyxJQUFJO1NBQ1o7UUFFRCxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFFWCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDakQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDbEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ2pELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBRWxELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ2xELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNqRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNsRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFFakQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ2pELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ2xELElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNsRCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUVuRCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUNuRCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDbEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDbkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBRWxELE9BQU8sSUFBSTtJQUNiLENBQUM7SUFFRCxRQUFRLENBQUMsS0FBVyxFQUFFLE9BQW9CLElBQUk7UUFDNUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULElBQUksR0FBRyxJQUFJO1NBQ1o7UUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBRXBCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDckIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ3ZELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN2RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDdkQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBRXZELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN2RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDdkQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ3ZELElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUV2RCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDdkQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ3ZELElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN4RCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFeEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ3hELElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN4RCxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDeEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FB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LEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUM3QixNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUM3QixNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBRXpCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFFM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUMzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQzNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUUzQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FB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UUFBYyxFQUFFLFdBQWlCLEVBQUUsT0FBb0IsSUFBSTtRQUMxRSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1NBQ2xCO1FBRUQsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDckIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDckIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFDckIsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUM7UUFFckIsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUM7UUFDeEIsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUM7UUFDeEIsTUFBTSxFQUFFLEdBQUcsV0FBVyxDQUFDLENBQUM7UUFFeEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFDbEIsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7UUFFbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNQLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDZixFQUFFLEdBQUcsRUFBRTtZQUNQLEVBQUUsR0FBRyxFQUFFO1lBQ1AsR0FBRztZQUVILEVBQUUsR0FBRyxFQUFFO1lBQ1AsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNmLEVBQUUsR0FBRyxFQUFFO1lBQ1AsR0FBRztZQUVILEVBQUUsR0FBRyxFQUFFO1lBQ1AsRUFBRSxHQUFHLEVBQUU7WUFDUCxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ2YsR0FBRztZQUVILEVBQUU7WUFDRixFQUFFO1lBQ0YsRUFBRTtZQUNGLEdBQUc7U0FDSixDQUFDO1FBRUYsT0FBTyxJQUFJO0lBQ2IsQ0FBQztJQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBUSxFQUFFLEVBQVEsRUFBRSxPQUFvQixJQUFJO1FBQzFELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7U0FDbEI7UUFFRCxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBRWxCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFFbEIsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNQLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBRTdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBRTdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1lBRTdDLEdBQUcsR0FBRyxHQUFHLEdBQUcs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LENBQUMsSUFBSSxFQUFFO1lBQ1QsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1NBQ2xCO1FBRUQsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRXBCLE9BQU8sSUFBSTtJQUNiLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQVEsRUFBRSxFQUFRLEVBQUUsT0FBb0IsSUFBSTtRQUMxRCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1NBQ2xCO1FBRUQsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDaEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDaEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDaEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFaEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDaEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDaEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDaEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFaEIsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN0RCxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO1FBQ3RELElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDdEQsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUV0RCxPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFRLEVBQUUsRUFBUSxFQUFFLE9BQW9CLElBQUk7UUFDdkQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtTQUNsQjtRQUVELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRWhCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRWhCLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7UUFDdEQsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztRQUN0RCxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxH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QUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSTtTQUNaO1FBRUQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUUxQixPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsUUFBUSxDQUFDLE1BQVksRUFBRSxPQUFvQixJQUFJO1FBQzdDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSTtTQUNaO1FBRUQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUUxQixPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsUUFBUSxDQUFDLE1BQVksRUFBRSxPQUFvQixJQUFJO1FBQzdDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSTtTQUNaO1FBRUQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUUxQixPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQVksRUFBRSxPQUFvQixJQUFJO1FBQzNDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLEdBQUcsSUFBSTtTQUNaO1FBRUQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUUxQixPQUFPLElBQUk7SUFDYixDQUFDO0lBRUQsS0FB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QUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3JELFFBQUcsR0FBbUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs7Ozs7OztVQ1J0RTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOc0I7QUFDSTtBQUNEO0FBQ0E7QUFDRSIsInNvdXJjZXMiOlsid2VicGFjazovL2x1ei93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL2NvcmUvY29tcG9uZW50LnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9jb3JlL2NvbXBvbmVudHMvYm9keS50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvY29yZS9jb21wb25lbnRzL2NhbWVyYS50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvY29yZS9jb21wb25lbnRzL2xpZ2h0LnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9jb3JlL2NvbXBvbmVudHMvbW9kZWwudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL2NvcmUvZW50aXR5LnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9jb3JlL2luZGV4LnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9jb3JlL3NjZW5lLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9jb3JlL3RyYW5zZm9ybS50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvZ3JhcGhpY3MvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL2dyYXBoaWNzL21hbmFnZXJzL2J1ZmZlcnMudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL2dyYXBoaWNzL21hbmFnZXJzL21lc2hlcy50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvZ3JhcGhpY3MvbWFuYWdlcnMvcHJvZ3JhbXMudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL2dyYXBoaWNzL21hbmFnZXJzL3NhbXBsZXJzLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9ncmFwaGljcy9tYW5hZ2Vycy9zaGFkZXJzLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9ncmFwaGljcy9tYW5hZ2Vycy90ZXh0dXJlcy50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvZ3JhcGhpY3MvcmVuZGVyZXIvZGlzcGxheS50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvZ3JhcGhpY3MvcmVuZGVyZXIvbWVzaC50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvZ3JhcGhpY3MvcmVuZGVyZXIvcmVuZGVyZXIudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL2dyYXBoaWNzL3JlbmRlcmVyL3N0YXRlLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9ncmFwaGljcy90eXBlcy9idWZmZXIudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL2dyYXBoaWNzL3R5cGVzL3NoYWRlci50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvZ3JhcGhpY3MvdHlwZXMvdGV4dHVyZS50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvcGh5c2ljcy9jb2xsaWRlci50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvcGh5c2ljcy9jb2xsaWRlcnMvcGxhbmUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3BoeXNpY3MvY29sbGlkZXJzL3JheS50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvcGh5c2ljcy9jb2xsaXNpb25zL2N1Ym9pZC9jdWJvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3BoeXNpY3MvY29sbGlzaW9ucy9wbGFuZS9jdWJvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3BoeXNpY3MvY29sbGlzaW9ucy9wbGFuZS9zcGhlcmUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3BoeXNpY3MvY29sbGlzaW9ucy9yYXkvY3Vib2lkLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9waHlzaWNzL2NvbGxpc2lvbnMvcmF5L3BsYW5lLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9waHlzaWNzL2NvbGxpc2lvbnMvcmF5L3JheS50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvcGh5c2ljcy9jb2xsaXNpb25zL3JheS9zcGhlcmUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3BoeXNpY3MvY29sbGlzaW9ucy9zcGhlcmUvY3Vib2lkLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9waHlzaWNzL2NvbGxpc2lvbnMvc3BoZXJlL3NwaGVyZS50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvcGh5c2ljcy9kaXNwYXRjaGVycy9jb2xsaXNpb24udHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3BoeXNpY3MvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3BoeXNpY3Mvdm9sdW1lLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9waHlzaWNzL3ZvbHVtZXMvY3Vib2lkLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy9waHlzaWNzL3ZvbHVtZXMvc3BoZXJlLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy91dGlsaXRpZXMvZGlzcGF0Y2hlci50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvdXRpbGl0aWVzL2luZGV4LnRzIiwid2VicGFjazovL2x1ei8uL3NyYy91dGlsaXRpZXMvcG9vbC50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvdmVjdG9ycy9jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3ZlY3RvcnMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3ZlY3RvcnMvbWF0Mi50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvdmVjdG9ycy9tYXQzLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy92ZWN0b3JzL21hdDQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3ZlY3RvcnMvcXVhdC50cyIsIndlYnBhY2s6Ly9sdXovLi9zcmMvdmVjdG9ycy92ZWMyLnRzIiwid2VicGFjazovL2x1ei8uL3NyYy92ZWN0b3JzL3ZlYzMudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vc3JjL3ZlY3RvcnMvdmVjNC50cyIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbHV6L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9sdXovLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wibHV6XCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImx1elwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsICgpID0+IHtcbnJldHVybiAiLCJpbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL3RyYW5zZm9ybSdcclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnQge1xyXG5cclxuICBhYnN0cmFjdCByZWFkb25seSB0eXBlOiBDb21wb25lbnQuVHlwZVxyXG5cclxuICBhYnN0cmFjdCByZWFkb25seSB0aW1lc3RlcDogQ29tcG9uZW50LlRpbWVzdGVwXHJcblxyXG4gIGFic3RyYWN0IHVwZGF0ZSh0cmFuc2Zvcm06IFRyYW5zZm9ybSwgZGVsdGFUaW1lOiBudW1iZXIpOiB2b2lkXHJcblxyXG4gIHRvSlNPTigpIHtcclxuICAgIGNvbnN0IHsgdHlwZSB9ID0gdGhpc1xyXG5cclxuICAgIHJldHVybiB7IHR5cGUgfVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBtb2R1bGUgQ29tcG9uZW50IHtcclxuXHJcbiAgZXhwb3J0IGVudW0gVHlwZSB7XHJcbiAgICBCb2R5ID0gJ2JvZHknLFxyXG4gICAgTW9kZWwgPSAnbW9kZWwnLFxyXG4gICAgQ2FtZXJhID0gJ2NhbWVyYScsXHJcbiAgICBMaWdodCA9ICdsaWdodCdcclxuICB9XHJcblxyXG4gIGV4cG9ydCBlbnVtIFRpbWVzdGVwIHtcclxuICAgIEZpeGVkID0gJ2ZpeGVkJyxcclxuICAgIFZhcmlhYmxlID0gJ3ZhcmlhYmxlJ1xyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBWb2x1bWUgfSBmcm9tICcuLi8uLi9waHlzaWNzJ1xyXG5pbXBvcnQgeyB2ZWMzLCBxdWF0IH0gZnJvbSAnLi4vLi4vdmVjdG9ycydcclxuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50J1xyXG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuLi90cmFuc2Zvcm0nXHJcblxyXG5leHBvcnQgY2xhc3MgQm9keSBleHRlbmRzIENvbXBvbmVudCB7XHJcblxyXG4gIHJlYWRvbmx5IHR5cGUgPSBDb21wb25lbnQuVHlwZS5Cb2R5XHJcblxyXG4gIHJlYWRvbmx5IHRpbWVzdGVwID0gQ29tcG9uZW50LlRpbWVzdGVwLkZpeGVkXHJcblxyXG4gIG1hc3M6IG51bWJlclxyXG5cclxuICB2b2x1bWU6IFZvbHVtZVxyXG5cclxuICByZWFkb25seSBmb3JjZTogdmVjM1xyXG4gIHJlYWRvbmx5IHRvcnF1ZTogdmVjM1xyXG5cclxuICByZWFkb25seSBsaW5lYXJWZWxvY2l0eTogdmVjM1xyXG4gIHJlYWRvbmx5IGFuZ3VsYXJWZWxvY2l0eTogdmVjM1xyXG5cclxuICBjb25zdHJ1Y3Rvcih7XHJcbiAgICBtYXNzID0gMS4wXHJcbiAgfSA9IHt9KSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5tYXNzID0gbWFzc1xyXG5cclxuICAgIHRoaXMuZm9yY2UgPSB2ZWMzLnplcm8uY29weSgpXHJcbiAgICB0aGlzLnRvcnF1ZSA9IHZlYzMuemVyby5jb3B5KClcclxuXHJcbiAgICB0aGlzLmxpbmVhclZlbG9jaXR5ID0gdmVjMy56ZXJvLmNvcHkoKVxyXG4gICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkgPSB2ZWMzLnplcm8uY29weSgpXHJcbiAgfVxyXG5cclxuICBwcmVwYXJlKHRyYW5zZm9ybTogVHJhbnNmb3JtKSB7XHJcbiAgICBjb25zdCB7IHZvbHVtZSB9ID0gdGhpc1xyXG5cclxuICAgIHZvbHVtZS50cmFuc2Zvcm0odHJhbnNmb3JtKVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlKHRyYW5zZm9ybTogVHJhbnNmb3JtLCBkZWx0YVRpbWU6IG51bWJlcikge1xyXG4gICAgY29uc3QgeyBtYXNzLCB2b2x1bWUgfSA9IHRoaXNcclxuXHJcbiAgICB2b2x1bWUuY2FsY3VsYXRlSW5lcnRpYShtYXNzLCB0cmFuc2Zvcm0pXHJcblxyXG4gICAgdGhpcy5pbnRlZ3JhdGVMaW5lYXJWZWxvY2l0eSh0cmFuc2Zvcm0sIGRlbHRhVGltZSlcclxuICAgIHRoaXMuaW50ZWdyYXRlQW5ndWxhclZlbG9jaXR5KHRyYW5zZm9ybSwgZGVsdGFUaW1lKVxyXG4gIH1cclxuXHJcbiAgdG9KU09OKCkge1xyXG4gICAgY29uc3QgeyBtYXNzLCB2b2x1bWUsIGZvcmNlLCB0b3JxdWUsIGxpbmVhclZlbG9jaXR5LCBhbmd1bGFyVmVsb2NpdHkgfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4geyAuLi5zdXBlci50b0pTT04oKSwgbWFzcywgdm9sdW1lLCBmb3JjZSwgdG9ycXVlLCBsaW5lYXJWZWxvY2l0eSwgYW5ndWxhclZlbG9jaXR5IH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW50ZWdyYXRlTGluZWFyVmVsb2NpdHkodHJhbnNmb3JtOiBUcmFuc2Zvcm0sIGRlbHRhVGltZTogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBhY2NlbGVyYXRpb24gPSB2ZWMzLnNjYWxlKHRoaXMuZm9yY2UsIHRoaXMubWFzcylcclxuXHJcbiAgICB0aGlzLmxpbmVhclZlbG9jaXR5LmFkZChhY2NlbGVyYXRpb24uc2NhbGUoZGVsdGFUaW1lKSlcclxuXHJcbiAgICB0cmFuc2Zvcm0udHJhbnNsYXRpb24uYWRkKHZlYzMuc2NhbGUodGhpcy5saW5lYXJWZWxvY2l0eSwgZGVsdGFUaW1lKSlcclxuXHJcbiAgICB0aGlzLmZvcmNlLnJlc2V0KClcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaW50ZWdyYXRlQW5ndWxhclZlbG9jaXR5KHRyYW5zZm9ybTogVHJhbnNmb3JtLCBkZWx0YVRpbWU6IG51bWJlcikge1xyXG4gICAgY29uc3QgeyBpbmVydGlhIH0gPSB0aGlzLnZvbHVtZVxyXG5cclxuICAgIGNvbnN0IGFjY2VsZXJhdGlvbiA9IGluZXJ0aWEudHJhbnNmb3JtKHRoaXMudG9ycXVlKVxyXG5cclxuICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LmFkZChhY2NlbGVyYXRpb24uc2NhbGUoZGVsdGFUaW1lKSk7XHJcblxyXG4gICAgY29uc3QgYXhpcyA9IHZlYzMubm9ybWFsaXplKHRoaXMuYW5ndWxhclZlbG9jaXR5KVxyXG4gICAgY29uc3QgYW5nbGUgPSB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5sZW5ndGggKiBkZWx0YVRpbWVcclxuXHJcbiAgICB0cmFuc2Zvcm0ucm90YXRpb24ubXVsdGlwbHkocXVhdC5mcm9tQXhpc0FuZ2xlKGF4aXMsIGFuZ2xlKSlcclxuXHJcbiAgICB0aGlzLnRvcnF1ZS5yZXNldCgpXHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IG1hdDMsIG1hdDQsIHZlYzIgfSBmcm9tICcuLi8uLi92ZWN0b3JzJ1xyXG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnXHJcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL3RyYW5zZm9ybSdcclxuXHJcbmV4cG9ydCBjbGFzcyBDYW1lcmEgZXh0ZW5kcyBDb21wb25lbnQge1xyXG5cclxuICByZWFkb25seSB0eXBlOiBDb21wb25lbnQuVHlwZSA9IENvbXBvbmVudC5UeXBlLkNhbWVyYVxyXG5cclxuICByZWFkb25seSB0aW1lc3RlcCA9IENvbXBvbmVudC5UaW1lc3RlcC5WYXJpYWJsZVxyXG5cclxuICBhc3BlY3QgPSAxLjBcclxuXHJcbiAgYXBlcnR1cmUgPSA5MC4wXHJcblxyXG4gIHJlYWRvbmx5IGNsaXBQbGFuZXMgPSBuZXcgdmVjMihbMS4wLCAxMDAuMF0pXHJcblxyXG4gIHJlYWRvbmx5IHZpZXdNYXRyaXggPSBuZXcgbWF0NCgpXHJcblxyXG4gIHJlYWRvbmx5IG5vcm1hbE1hdHJpeCA9IG5ldyBtYXQzKClcclxuXHJcbiAgcmVhZG9ubHkgbW9kZWxWaWV3TWF0cml4ID0gbmV3IG1hdDQoKVxyXG5cclxuICByZWFkb25seSBwcm9qZWN0aW9uTWF0cml4ID0gbmV3IG1hdDQoKVxyXG5cclxuICByZWFkb25seSByZWNvbnN0cnVjdGlvbk1hdHJpeCA9IG5ldyBtYXQ0KClcclxuXHJcbiAgdXBkYXRlKHRyYW5zZm9ybTogVHJhbnNmb3JtLCBkZWx0YVRpbWU6IG51bWJlcikge1xyXG4gICAgY29uc3QgeyBtb2RlbE1hdHJpeCB9ID0gdHJhbnNmb3JtXHJcblxyXG4gICAgLy8gdmlldyBtYXRyaXhcclxuICAgIG1vZGVsTWF0cml4LmludmVydCh0aGlzLnZpZXdNYXRyaXgpXHJcblxyXG4gICAgLy8gbW9kZWwgdmlldyBtYXRyaXhcclxuICAgIG1hdDQubXVsdGlwbHkodGhpcy52aWV3TWF0cml4LCBtb2RlbE1hdHJpeCwgdGhpcy5tb2RlbFZpZXdNYXRyaXgpXHJcblxyXG4gICAgLy8gbm9ybWFsIG1hdHJpeCAodG8gdHJhbnNmb3JtIG5vcm1hbHMpXHJcbiAgICB0aGlzLm1vZGVsVmlld01hdHJpeC50b01hdDModGhpcy5ub3JtYWxNYXRyaXgpLnRyYW5zcG9zZSgpLmludmVydCgpXHJcblxyXG4gICAgLy8gcGVyc3BlY3RpdmUgbWF0cml4XHJcbiAgICBtYXQ0LnBlcnNwZWN0aXZlKHRoaXMuYXBlcnR1cmUsIHRoaXMuYXNwZWN0LCB0aGlzLmNsaXBQbGFuZXMueCwgdGhpcy5jbGlwUGxhbmVzLnksIHRoaXMucHJvamVjdGlvbk1hdHJpeClcclxuXHJcbiAgICAvLyByZWNvbnN0cnVjdGlvbiBtYXRyaXggKHRvIHJlY29uc3RydWN0IGZyYWdtZW50IHBvc2l0aW9ucylcclxuICAgIG1hdDQubXVsdGlwbHkodGhpcy5wcm9qZWN0aW9uTWF0cml4LCB0aGlzLnZpZXdNYXRyaXgsIHRoaXMucmVjb25zdHJ1Y3Rpb25NYXRyaXgpLmludmVydCgpXHJcbiAgfVxyXG5cclxuICB0b0pTT04oKSB7XHJcbiAgICBjb25zdCB7IGFzcGVjdCwgYXBlcnR1cmUsIGNsaXBQbGFuZXMgfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4geyAuLi5zdXBlci50b0pTT04oKSwgYXNwZWN0LCBhcGVydHVyZSwgY2xpcFBsYW5lcyB9XHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IG1hdDQsIHZlYzMgfSBmcm9tICcuLi8uLi92ZWN0b3JzJ1xyXG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnXHJcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL3RyYW5zZm9ybSdcclxuaW1wb3J0IHsgQ2FtZXJhIH0gZnJvbSAnLi9jYW1lcmEnXHJcblxyXG5leHBvcnQgY2xhc3MgTGlnaHQgZXh0ZW5kcyBDYW1lcmEge1xyXG5cclxuICByZWFkb25seSB0eXBlID0gQ29tcG9uZW50LlR5cGUuTGlnaHRcclxuXHJcbiAgcmFkaXVzID0gNi4wXHJcblxyXG4gIGZhbGxvZmYgPSAxMC4wXHJcblxyXG4gIGludGVuc2l0eSA9IDEuMFxyXG5cclxuICByZWFkb25seSBjb2xvciA9IHZlYzMub25lLmNvcHkoKVxyXG5cclxuICByZWFkb25seSB0cmFuc2xhdGlvbiA9IG5ldyB2ZWMzKClcclxuXHJcbiAgcmVhZG9ubHkgZGlyZWN0aW9uID0gbmV3IHZlYzMoKVxyXG5cclxuICByZWFkb25seSB0ZXh0dXJlTWF0cml4ID0gbmV3IG1hdDQoKVxyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGJpYXNNYXRyaXggPSBuZXcgbWF0NCgpXHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIHRoaXMudHJhbnNsYXRpb24gPSBuZXcgdmVjMygpXHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IG5ldyB2ZWMzKClcclxuXHJcbiAgICB0aGlzLmJpYXNNYXRyaXgudHJhbnNsYXRlKG5ldyB2ZWMzKFswLjUsIDAuNSwgMC41XSkpXHJcbiAgICB0aGlzLmJpYXNNYXRyaXguc2NhbGUobmV3IHZlYzMoWzAuNSwgMC41LCAwLjVdKSlcclxuICB9XHJcblxyXG4gIHVwZGF0ZSh0cmFuc2Zvcm06IFRyYW5zZm9ybSwgZGVsdGFUaW1lOiBudW1iZXIpIHtcclxuICAgIHN1cGVyLnVwZGF0ZSh0cmFuc2Zvcm0sIGRlbHRhVGltZSlcclxuXHJcbiAgICB0cmFuc2Zvcm0udHJhbnNsYXRpb24uY29weSh0aGlzLnRyYW5zbGF0aW9uKVxyXG4gICAgdHJhbnNmb3JtLmRpcmVjdGlvbi5jb3B5KHRoaXMuZGlyZWN0aW9uKVxyXG5cclxuICAgIHRoaXMuYmlhc01hdHJpeC5jb3B5KHRoaXMudGV4dHVyZU1hdHJpeClcclxuXHJcbiAgICB0aGlzLnRleHR1cmVNYXRyaXgubXVsdGlwbHkodGhpcy5wcm9qZWN0aW9uTWF0cml4KVxyXG4gICAgdGhpcy50ZXh0dXJlTWF0cml4Lm11bHRpcGx5KHRoaXMudmlld01hdHJpeClcclxuICB9XHJcblxyXG4gIHRvSlNPTigpIHtcclxuICAgIGNvbnN0IHsgcmFkaXVzLCBmYWxsb2ZmLCBpbnRlbnNpdHkgfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4geyAuLi5zdXBlci50b0pTT04oKSwgcmFkaXVzLCBmYWxsb2ZmLCBpbnRlbnNpdHkgfVxyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBNZXNoLCBUZXh0dXJlIH0gZnJvbSAnLi4vLi4vZ3JhcGhpY3MnXHJcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuLi8uLi92ZWN0b3JzJ1xyXG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnXHJcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL3RyYW5zZm9ybSdcclxuXHJcbmV4cG9ydCBjbGFzcyBNb2RlbCBleHRlbmRzIENvbXBvbmVudCB7XHJcblxyXG4gIHJlYWRvbmx5IHR5cGUgPSBDb21wb25lbnQuVHlwZS5Nb2RlbFxyXG5cclxuICByZWFkb25seSB0aW1lc3RlcCA9IENvbXBvbmVudC5UaW1lc3RlcC5WYXJpYWJsZVxyXG5cclxuICBiYXNlQ29sb3IgPSB2ZWMzLm9uZVxyXG5cclxuICBiYXNlVGV4dHVyZTogVGV4dHVyZVxyXG5cclxuICBtZXNoOiBNZXNoXHJcblxyXG4gIHVwZGF0ZSh0cmFuc2Zvcm06IFRyYW5zZm9ybSwgZGVsdGFUaW1lOiBudW1iZXIpIHt9XHJcblxyXG4gIHRvSlNPTigpIHtcclxuICAgIGNvbnN0IHsgYmFzZUNvbG9yIH0gPSB0aGlzXHJcblxyXG4gICAgcmV0dXJuIHsgLi4uc3VwZXIudG9KU09OKCksIGJhc2VDb2xvciB9XHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50J1xyXG5pbXBvcnQgeyBCb2R5IH0gZnJvbSAnLi9jb21wb25lbnRzL2JvZHknXHJcbmltcG9ydCB7IENhbWVyYSB9IGZyb20gJy4vY29tcG9uZW50cy9jYW1lcmEnXHJcbmltcG9ydCB7IExpZ2h0IH0gZnJvbSAnLi9jb21wb25lbnRzL2xpZ2h0J1xyXG5pbXBvcnQgeyBNb2RlbCB9IGZyb20gJy4vY29tcG9uZW50cy9tb2RlbCdcclxuaW1wb3J0IHsgVHJhbnNmb3JtIH0gZnJvbSAnLi90cmFuc2Zvcm0nXHJcblxyXG5jb25zdCB7IFR5cGUsIFRpbWVzdGVwIH0gPSBDb21wb25lbnRcclxuXHJcbmV4cG9ydCBjbGFzcyBFbnRpdHkgZXh0ZW5kcyBUcmFuc2Zvcm0ge1xyXG5cclxuICByZWFkb25seSBjb21wb25lbnRzOiBSZWNvcmQ8c3RyaW5nLCBDb21wb25lbnQ+ID0ge31cclxuXHJcbiAgLy8gdm9sdW1lOiBWb2x1bWUgLS0gVE9ETzogZm9yIHZpc2liaWxpdHkgZGV0ZXJtaW5hdGlvblxyXG5cclxuICBnZXQgYm9kaWVzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMud2l0aFR5cGU8Qm9keT4oVHlwZS5Cb2R5KVxyXG4gIH1cclxuXHJcbiAgZ2V0IG1vZGVscygpIHtcclxuICAgIHJldHVybiB0aGlzLndpdGhUeXBlPE1vZGVsPihUeXBlLk1vZGVsKVxyXG4gIH1cclxuXHJcbiAgZ2V0IGNhbWVyYXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy53aXRoVHlwZTxDYW1lcmE+KFR5cGUuQ2FtZXJhKVxyXG4gIH1cclxuXHJcbiAgZ2V0IGxpZ2h0cygpIHtcclxuICAgIHJldHVybiB0aGlzLndpdGhUeXBlPExpZ2h0PihUeXBlLkxpZ2h0KVxyXG4gIH1cclxuXHJcbiAgZ2V0IGZpeGVkVGltZXN0ZXAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy53aXRoVGltZXN0ZXAoVGltZXN0ZXAuRml4ZWQpXHJcbiAgfVxyXG5cclxuICBnZXQgdmFyaWFibGVUaW1lc3RlcCgpIHtcclxuICAgIHJldHVybiB0aGlzLndpdGhUaW1lc3RlcChUaW1lc3RlcC5WYXJpYWJsZSlcclxuICB9XHJcblxyXG4gIHVwZGF0ZShkZWx0YVRpbWU6IG51bWJlcikge1xyXG4gICAgc3VwZXIudXBkYXRlKGRlbHRhVGltZSlcclxuXHJcbiAgICB0aGlzLnZhcmlhYmxlVGltZXN0ZXAuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgIGNvbXBvbmVudC51cGRhdGUodGhpcywgZGVsdGFUaW1lKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZpeGVkVXBkYXRlKGRlbHRhVGltZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLmZpeGVkVGltZXN0ZXAuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgIGNvbXBvbmVudC51cGRhdGUodGhpcywgZGVsdGFUaW1lKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHRvSlNPTigpIHtcclxuICAgIGNvbnN0IHsgY29tcG9uZW50cyB9ID0gdGhpc1xyXG5cclxuICAgIHJldHVybiB7IC4uLnN1cGVyLnRvSlNPTigpLCBjb21wb25lbnRzIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgd2l0aFR5cGU8VD4odHlwZTogQ29tcG9uZW50LlR5cGUpIHtcclxuICAgIGNvbnN0IGNvbXBvbmVudHMgPSBPYmplY3QudmFsdWVzKHRoaXMuY29tcG9uZW50cylcclxuXHJcbiAgICByZXR1cm4gY29tcG9uZW50cy5maWx0ZXIoKGNvbXBvbmVudCkgPT4ge1xyXG4gICAgICByZXR1cm4gY29tcG9uZW50LnR5cGUgPT09IHR5cGVcclxuICAgIH0pIGFzIFRbXVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB3aXRoVGltZXN0ZXAodGltZXN0ZXA6IENvbXBvbmVudC5UaW1lc3RlcCkge1xyXG4gICAgY29uc3QgY29tcG9uZW50cyA9IE9iamVjdC52YWx1ZXModGhpcy5jb21wb25lbnRzKVxyXG5cclxuICAgIHJldHVybiBjb21wb25lbnRzLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgIHJldHVybiBjb21wb25lbnQudGltZXN0ZXAgPT09IHRpbWVzdGVwXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbn0iLCJleHBvcnQgeyBTY2VuZSB9IGZyb20gJy4vc2NlbmUnXHJcbmV4cG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5J1xyXG5leHBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL3RyYW5zZm9ybSdcclxuZXhwb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnQnXHJcblxyXG5leHBvcnQgeyBCb2R5IH0gZnJvbSAnLi9jb21wb25lbnRzL2JvZHknXHJcbmV4cG9ydCB7IE1vZGVsIH0gZnJvbSAnLi9jb21wb25lbnRzL21vZGVsJ1xyXG5leHBvcnQgeyBMaWdodCB9IGZyb20gJy4vY29tcG9uZW50cy9saWdodCdcclxuZXhwb3J0IHsgQ2FtZXJhIH0gZnJvbSAnLi9jb21wb25lbnRzL2NhbWVyYSdcclxuXHJcblxyXG4iLCJpbXBvcnQgeyBDb2xsaXNpb24sIENvbGxpc2lvbkRpc3BhdGNoZXIgfSBmcm9tICcuLi9waHlzaWNzJ1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vdmVjdG9ycydcclxuaW1wb3J0IHsgQm9keSB9IGZyb20gJy4vY29tcG9uZW50cy9ib2R5J1xyXG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSdcclxuXHJcbmV4cG9ydCBjbGFzcyBTY2VuZSB7XHJcblxyXG4gIHJlYWRvbmx5IGdyYXZpdHk6IHZlYzNcclxuXHJcbiAgcmVhZG9ubHkgZW50aXRpZXM6IFJlY29yZDxzdHJpbmcsIEVudGl0eT4gPSB7fVxyXG5cclxuICByZWFkb25seSBjb2xsaXNpb25zOiBSZXF1aXJlZDxDb2xsaXNpb24+W10gPSBbXVxyXG5cclxuICBwcml2YXRlIGNvbGxpc2lvbkRpc3BhdGNoZXI6IENvbGxpc2lvbkRpc3BhdGNoZXJcclxuXHJcbiAgcHJpdmF0ZSBlbGFwc2VkVGltZTogbnVtYmVyID0gMFxyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHRpbWVzdGVwOiBudW1iZXIgPSAxMDAwIC8gNjBcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLmdyYXZpdHkgPSBuZXcgdmVjMyhbMCwgLTkuODEsIDBdKVxyXG5cclxuICAgIHRoaXMuY29sbGlzaW9uRGlzcGF0Y2hlciA9IG5ldyBDb2xsaXNpb25EaXNwYXRjaGVyKClcclxuICB9XHJcblxyXG4gIHVwZGF0ZShkZWx0YVRpbWU6IG51bWJlcikge1xyXG4gICAgY29uc3QgZW50aXRpZXMgPSBPYmplY3QudmFsdWVzKHRoaXMuZW50aXRpZXMpXHJcblxyXG4gICAgdGhpcy5lbGFwc2VkVGltZSArPSBkZWx0YVRpbWVcclxuXHJcbiAgICAvLyBwcmVwYXJlIGJvZGllc1xyXG4gICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XHJcbiAgICAgIGVudGl0eS5ib2RpZXMuZm9yRWFjaCgoYm9keSkgPT4ge1xyXG4gICAgICAgIGJvZHkucHJlcGFyZShlbnRpdHkpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG5cclxuICAgIHdoaWxlICh0aGlzLmVsYXBzZWRUaW1lID49IHRoaXMudGltZXN0ZXApIHtcclxuICAgICAgY29uc3QgYm9kaWVzID0gZW50aXRpZXMucmVkdWNlKChib2RpZXM6IEJvZHlbXSwgZW50aXR5KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIFsuLi5ib2RpZXMsIC4uLmVudGl0eS5ib2RpZXNdXHJcbiAgICAgIH0sIFtdKVxyXG5cclxuICAgICAgdGhpcy51cGRhdGVQaHlzaWNzKGJvZGllcylcclxuXHJcbiAgICAgIC8vIGZpeGVkIHVwZGF0ZVxyXG4gICAgICBlbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcclxuICAgICAgICBlbnRpdHkuZml4ZWRVcGRhdGUodGhpcy50aW1lc3RlcClcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuZWxhcHNlZFRpbWUgLT0gdGhpcy50aW1lc3RlcFxyXG4gICAgfVxyXG5cclxuICAgIC8vIHZhcmlhYmxlIHVwZGF0ZVxyXG4gICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XHJcbiAgICAgIGVudGl0eS51cGRhdGUoZGVsdGFUaW1lKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdXBkYXRlUGh5c2ljcyhib2RpZXM6IEJvZHlbXSkge1xyXG4gICAgdGhpcy5hcHBseUdyYXZpdHkoYm9kaWVzKVxyXG4gICAgdGhpcy5kZXRlY3RDb2xsaXNpb25zKGJvZGllcylcclxuXHJcbiAgICB0aGlzLnJlc29sdmVDb2xsaXNpb25zKDAuOSwgMC4yKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhcHBseUdyYXZpdHkoYm9kaWVzOiBCb2R5W10pIHtcclxuICAgIGJvZGllcy5mb3JFYWNoKChib2R5KSA9PiB7XHJcbiAgICAgIGJvZHkuZm9yY2UuYWRkKHZlYzMuc2NhbGUodGhpcy5ncmF2aXR5LCBib2R5Lm1hc3MpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGV0ZWN0Q29sbGlzaW9ucyhib2RpZXM6IEJvZHlbXSkge1xyXG4gICAgdGhpcy5jb2xsaXNpb25zLmxlbmd0aCA9IDBcclxuXHJcbiAgICBib2RpZXMuZm9yRWFjaCgoYjEpID0+IHtcclxuICAgICAgYm9kaWVzLmZvckVhY2goKGIyKSA9PiB7XHJcbiAgICAgICAgaWYgKGIxID09PSBiMikge1xyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb2xsaXNpb24gPSB0aGlzLmNvbGxpZGUoYjEsIGIyKVxyXG5cclxuICAgICAgICBpZiAoY29sbGlzaW9uKSB7XHJcbiAgICAgICAgICB0aGlzLmNvbGxpc2lvbnMucHVzaCh7XHJcbiAgICAgICAgICAgIC4uLmNvbGxpc2lvbixcclxuICAgICAgICAgICAgYm9kaWVzOiBbYjEsIGIyXVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZXNvbHZlQ29sbGlzaW9ucyhmcmljdGlvbjogbnVtYmVyLCByZXN0aXR1dGlvbjogbnVtYmVyKSB7XHJcbiAgICB0aGlzLmNvbGxpc2lvbnMuZm9yRWFjaCgoeyBib2RpZXMsIGNvbnRhY3QsIG5vcm1hbCB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IFtiMSwgYjJdID0gYm9kaWVzXHJcblxyXG4gICAgICBjb25zdCB2ID0gdmVjMy5zdWJ0cmFjdChiMi5saW5lYXJWZWxvY2l0eSwgYjEubGluZWFyVmVsb2NpdHkpXHJcblxyXG4gICAgICBjb25zdCBuID0gdmVjMy5kb3Qodiwgbm9ybWFsKVxyXG5cclxuICAgICAgaWYgKG4gPj0gMCkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByID0gLSgxLjAgKyByZXN0aXR1dGlvbikgKiBuXHJcblxyXG4gICAgICBjb25zdCBtMSA9IDEuMCAvIGIxLm1hc3NcclxuICAgICAgY29uc3QgbTIgPSAxLjAgLyBiMi5tYXNzXHJcblxyXG4gICAgICBjb25zdCBtID0gbTEgKyBtMlxyXG5cclxuICAgICAgY29uc3QgaSA9IHZlYzMuc2NhbGUobm9ybWFsLCByIC8gbSlcclxuXHJcbiAgICAgIGIxLmxpbmVhclZlbG9jaXR5LnN1YnRyYWN0KHZlYzMuc2NhbGUoaSwgbTEpKVxyXG4gICAgICBiMi5saW5lYXJWZWxvY2l0eS5hZGQodmVjMy5zY2FsZShpLCBtMikpXHJcblxyXG4gICAgICBjb25zdCB0ID0gdmVjMy5zdWJ0cmFjdCh2LCB2ZWMzLnNjYWxlKG5vcm1hbCwgbikpXHJcbiAgICAgIGNvbnN0IGYgPSB2ZWMzLnNjYWxlKHQsIC0obTEgKyBtMikgKiBmcmljdGlvbilcclxuXHJcbiAgICAgIGIxLmxpbmVhclZlbG9jaXR5LnN1YnRyYWN0KHZlYzMuc2NhbGUoZiwgbTEpKVxyXG4gICAgICBiMi5saW5lYXJWZWxvY2l0eS5hZGQodmVjMy5zY2FsZShmLCBtMikpXHJcblxyXG4gICAgICBib2RpZXMuZm9yRWFjaCgoYm9keSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHsgdm9sdW1lIH0gPSBib2R5XHJcbiAgICAgICAgY29uc3QgeyBjZW50ZXIgfSA9IHZvbHVtZVxyXG5cclxuICAgICAgICBjb25zdCBkID0gdmVjMy5zdWJ0cmFjdChjb250YWN0LCBjZW50ZXIpXHJcblxyXG4gICAgICAgIGJvZHkuYW5ndWxhclZlbG9jaXR5LmFkZCh2ZWMzLmNyb3NzKGQsIGkpKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY29sbGlkZShiMTogQm9keSwgYjI6IEJvZHkpIHtcclxuICAgIGNvbnN0IHsgdm9sdW1lOiBjMSB9ID0gYjFcclxuICAgIGNvbnN0IHsgdm9sdW1lOiBjMiB9ID0gYjJcclxuXHJcbiAgICByZXR1cm4gdGhpcy5jb2xsaXNpb25EaXNwYXRjaGVyLmRpc3BhdGNoKGMxLCBjMilcclxuICB9XHJcblxyXG4gIHRvSlNPTigpIHtcclxuICAgIGNvbnN0IHsgZ3Jhdml0eSwgZW50aXRpZXMgfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4geyBncmF2aXR5LCBlbnRpdGllcyB9XHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IG1hdDMsIG1hdDQsIHF1YXQsIHZlYzMgfSBmcm9tICcuLi92ZWN0b3JzJ1xyXG5cclxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybSB7XHJcblxyXG4gIHJlYWRvbmx5IHJvdGF0aW9uID0gbmV3IHF1YXQoKVxyXG5cclxuICByZWFkb25seSB0cmFuc2xhdGlvbiA9IG5ldyB2ZWMzKClcclxuXHJcbiAgcmVhZG9ubHkgZGlyZWN0aW9uID0gbmV3IHZlYzMoKVxyXG5cclxuICByZWFkb25seSBtb2RlbE1hdHJpeCA9IG5ldyBtYXQ0KClcclxuXHJcbiAgcmVhZG9ubHkgcm90YXRpb25NYXRyaXggPSBuZXcgbWF0MygpXHJcblxyXG4gIHJlYWRvbmx5IGludmVyc2VUcmFuc3Bvc2VNYXRyaXggPSBuZXcgbWF0NCgpXHJcblxyXG4gIHN0YXRpYyByZWFkb25seSBvcmlnaW4gPSBuZXcgVHJhbnNmb3JtKClcclxuXHJcbiAgY29uc3RydWN0b3Ioe1xyXG4gICAgdHJhbnNsYXRpb24gPSB2ZWMzLnplcm8sXHJcbiAgICByb3RhdGlvbiA9IHF1YXQuaWRlbnRpdHlcclxuICB9ID0ge30pIHtcclxuICAgIHRoaXMudHJhbnNsYXRpb24gPSB0cmFuc2xhdGlvbi5jb3B5KClcclxuICAgIHRoaXMucm90YXRpb24gPSByb3RhdGlvbi5jb3B5KClcclxuICB9XHJcblxyXG4gIHVwZGF0ZShkZWx0YVRpbWU6IG51bWJlcikge1xyXG4gICAgLy8gbW9kZWwgbWF0cml4XHJcbiAgICBtYXQ0LmNvbnN0cnVjdCh0aGlzLnJvdGF0aW9uLCB0aGlzLnRyYW5zbGF0aW9uLCB0aGlzLm1vZGVsTWF0cml4KVxyXG5cclxuICAgIC8vIHJvdGF0aW9uIG1hdHJpeFxyXG4gICAgdGhpcy5tb2RlbE1hdHJpeC50b01hdDModGhpcy5yb3RhdGlvbk1hdHJpeClcclxuXHJcbiAgICAvLyBkaXJlY3Rpb24gdmVjdG9yIChmb3IgbGlnaHRpbmcgY2FsY3VsYXRpb25zKVxyXG4gICAgdGhpcy5yb3RhdGlvbk1hdHJpeC5yb3coMiwgdGhpcy5kaXJlY3Rpb24pLm5vcm1hbGl6ZSgpXHJcblxyXG4gICAgLy8gaW52ZXJzZSB0cmFuc3Bvc2UgbWF0cml4ICh0byB0cmFuc2Zvcm0gcGxhbmUgZXF1YXRpb25zKVxyXG4gICAgdGhpcy5tb2RlbE1hdHJpeC5pbnZlcnQodGhpcy5pbnZlcnNlVHJhbnNwb3NlTWF0cml4KS50cmFuc3Bvc2UoKVxyXG4gIH1cclxuXHJcbiAgdG9KU09OKCkge1xyXG4gICAgY29uc3QgeyByb3RhdGlvbiwgdHJhbnNsYXRpb24gfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4geyByb3RhdGlvbiwgdHJhbnNsYXRpb24gfVxyXG4gIH1cclxuXHJcbn0iLCJleHBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vcmVuZGVyZXIvc3RhdGUnXHJcbmV4cG9ydCB7IERpc3BsYXkgfSBmcm9tICcuL3JlbmRlcmVyL2Rpc3BsYXknXHJcbmV4cG9ydCB7IFJlbmRlcmVyIH0gZnJvbSAnLi9yZW5kZXJlci9yZW5kZXJlcidcclxuXHJcbmV4cG9ydCB7IE1lc2hlcyB9IGZyb20gJy4vbWFuYWdlcnMvbWVzaGVzJ1xyXG5leHBvcnQgeyBCdWZmZXJzIH0gZnJvbSAnLi9tYW5hZ2Vycy9idWZmZXJzJ1xyXG5leHBvcnQgeyBTaGFkZXJzIH0gZnJvbSAnLi9tYW5hZ2Vycy9zaGFkZXJzJ1xyXG5leHBvcnQgeyBQcm9ncmFtcyB9IGZyb20gJy4vbWFuYWdlcnMvcHJvZ3JhbXMnXHJcbmV4cG9ydCB7IFNhbXBsZXJzIH0gZnJvbSAnLi9tYW5hZ2Vycy9zYW1wbGVycydcclxuZXhwb3J0IHsgVGV4dHVyZXMgfSBmcm9tICcuL21hbmFnZXJzL3RleHR1cmVzJ1xyXG5cclxuZXhwb3J0IHsgQnVmZmVyIH0gZnJvbSAnLi90eXBlcy9idWZmZXInXHJcbmV4cG9ydCB7IFNoYWRlciB9IGZyb20gJy4vdHlwZXMvc2hhZGVyJ1xyXG5leHBvcnQgeyBUZXh0dXJlIH0gZnJvbSAnLi90eXBlcy90ZXh0dXJlJ1xyXG5leHBvcnQgeyBTYW1wbGVyIH0gZnJvbSAnLi90eXBlcy9zYW1wbGVyJ1xyXG5leHBvcnQgeyBVbmlmb3JtIH0gZnJvbSAnLi90eXBlcy91bmlmb3JtJ1xyXG5leHBvcnQgeyBQcm9ncmFtIH0gZnJvbSAnLi90eXBlcy9wcm9ncmFtJ1xyXG5leHBvcnQgeyBBdHRyaWJ1dGUgfSBmcm9tICcuL3R5cGVzL2F0dHJpYnV0ZSdcclxuZXhwb3J0IHsgVmVydGV4QXJyYXkgfSBmcm9tICcuL3R5cGVzL3ZlcnRleC1hcnJheSdcclxuXHJcbmV4cG9ydCB7IEZyYW1lQnVmZmVyIH0gZnJvbSAnLi9idWZmZXJzL2ZyYW1lLWJ1ZmZlcidcclxuZXhwb3J0IHsgUmVuZGVyQnVmZmVyIH0gZnJvbSAnLi9idWZmZXJzL3JlbmRlci1idWZmZXInXHJcbmV4cG9ydCB7IEluZGV4QnVmZmVyIH0gZnJvbSAnLi9idWZmZXJzL2luZGV4LWJ1ZmZlcidcclxuZXhwb3J0IHsgVmVydGV4QnVmZmVyIH0gZnJvbSAnLi9idWZmZXJzL3ZlcnRleC1idWZmZXInXHJcbmV4cG9ydCB7IFVuaWZvcm1CdWZmZXIgfSBmcm9tICcuL2J1ZmZlcnMvdW5pZm9ybS1idWZmZXInXHJcblxyXG5leHBvcnQgeyBNZXNoIH0gZnJvbSAnLi9yZW5kZXJlci9tZXNoJ1xyXG5cclxuXHJcbiIsImltcG9ydCB7IEZyYW1lQnVmZmVyIH0gZnJvbSAnLi4vYnVmZmVycy9mcmFtZS1idWZmZXInXHJcbmltcG9ydCB7IFJlbmRlckJ1ZmZlciB9IGZyb20gJy4uL2J1ZmZlcnMvcmVuZGVyLWJ1ZmZlcidcclxuaW1wb3J0IHsgVW5pZm9ybUJ1ZmZlciB9IGZyb20gJy4uL2J1ZmZlcnMvdW5pZm9ybS1idWZmZXInXHJcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJy4uL3R5cGVzL2J1ZmZlcidcclxuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gJy4uL3R5cGVzL3RleHR1cmUnXHJcblxyXG5leHBvcnQgY2xhc3MgQnVmZmVycyB7XHJcblxyXG4gIHByaXZhdGUgYnVmZmVyczogQnVmZmVyW10gPSBbXVxyXG5cclxuICBwcml2YXRlIGJvdW5kQnVmZmVyczogUmVjb3JkPG51bWJlciwgQnVmZmVyPiA9IHt9XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHsgfVxyXG5cclxuICBjcmVhdGUodGFyZ2V0OiBCdWZmZXIuVGFyZ2V0LkZyYW1lQnVmZmVyKTogRnJhbWVCdWZmZXJcclxuICBjcmVhdGUodGFyZ2V0OiBCdWZmZXIuVGFyZ2V0LlJlbmRlckJ1ZmZlcik6IFJlbmRlckJ1ZmZlclxyXG4gIGNyZWF0ZSh0YXJnZXQ6IEJ1ZmZlci5UYXJnZXQuVW5pZm9ybUJ1ZmZlcik6IFVuaWZvcm1CdWZmZXJcclxuXHJcbiAgY3JlYXRlKHRhcmdldDogQnVmZmVyLlRhcmdldCkge1xyXG4gICAgc3dpdGNoICh0YXJnZXQpIHtcclxuICAgICAgY2FzZSBCdWZmZXIuVGFyZ2V0LkZyYW1lQnVmZmVyOlxyXG5cclxuICAgICAgICBjb25zdCBmcmFtZUJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlRnJhbWVidWZmZXIoKSBhcyBGcmFtZUJ1ZmZlclxyXG5cclxuICAgICAgICBmcmFtZUJ1ZmZlci50YXJnZXQgPSB0aGlzLmdsLkZSQU1FQlVGRkVSXHJcblxyXG4gICAgICAgIGZyYW1lQnVmZmVyLmF0dGFjaG1lbnRzID0ge31cclxuXHJcbiAgICAgICAgdGhpcy5idWZmZXJzLnB1c2goZnJhbWVCdWZmZXIpXHJcblxyXG4gICAgICAgIHJldHVybiBmcmFtZUJ1ZmZlclxyXG5cclxuICAgICAgY2FzZSBCdWZmZXIuVGFyZ2V0LlJlbmRlckJ1ZmZlcjpcclxuXHJcbiAgICAgICAgY29uc3QgcmVuZGVyQnVmZmVyID0gdGhpcy5nbC5jcmVhdGVSZW5kZXJidWZmZXIoKSBhcyBSZW5kZXJCdWZmZXJcclxuXHJcbiAgICAgICAgcmVuZGVyQnVmZmVyLnRhcmdldCA9IHRoaXMuZ2wuUkVOREVSQlVGRkVSXHJcblxyXG4gICAgICAgIHRoaXMuYnVmZmVycy5wdXNoKHJlbmRlckJ1ZmZlcilcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlbmRlckJ1ZmZlclxyXG5cclxuICAgICAgY2FzZSBCdWZmZXIuVGFyZ2V0LlVuaWZvcm1CdWZmZXI6XHJcblxyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCkgYXMgVW5pZm9ybUJ1ZmZlclxyXG5cclxuICAgICAgICBidWZmZXIudGFyZ2V0ID0gdGhpcy5nbC5VTklGT1JNX0JVRkZFUlxyXG4gICAgICAgIGJ1ZmZlci51c2FnZSA9IHRoaXMuZ2wuRFlOQU1JQ19EUkFXXHJcblxyXG4gICAgICAgIHRoaXMuYnVmZmVycy5wdXNoKGJ1ZmZlcilcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1ZmZlclxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlKGJ1ZmZlcjogVW5pZm9ybUJ1ZmZlciwgc291cmNlOiBhbnksIG9mZnNldD86IG51bWJlcikge1xyXG4gICAgdGhpcy5iaW5kKGJ1ZmZlcilcclxuXHJcbiAgICBpZiAob2Zmc2V0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgdGhpcy5nbC5idWZmZXJTdWJEYXRhKGJ1ZmZlci50YXJnZXQsIG9mZnNldCwgc291cmNlKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5nbC5idWZmZXJEYXRhKGJ1ZmZlci50YXJnZXQsIHNvdXJjZSwgYnVmZmVyLnVzYWdlKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZm9ybWF0KGJ1ZmZlcjogUmVuZGVyQnVmZmVyLCBmb3JtYXQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcclxuICAgIHRoaXMuYmluZChidWZmZXIpXHJcblxyXG4gICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKGJ1ZmZlci50YXJnZXQsIGZvcm1hdCwgd2lkdGgsIGhlaWdodClcclxuICB9XHJcblxyXG4gIGF0dGFjaChmcmFtZWJ1ZmZlcjogRnJhbWVCdWZmZXIsIHRleHR1cmU6IFRleHR1cmUsIGF0dGFjaG1lbnQ6IG51bWJlcik6IHZvaWRcclxuICBhdHRhY2goZnJhbWVCdWZmZXI6IEZyYW1lQnVmZmVyLCByZW5kZXJCdWZmZXI6IFJlbmRlckJ1ZmZlciwgYXR0YWNobWVudDogbnVtYmVyKTogdm9pZFxyXG5cclxuICBhdHRhY2goZnJhbWVidWZmZXI6IEZyYW1lQnVmZmVyLCBidWZmZXI6IFRleHR1cmUgfCBSZW5kZXJCdWZmZXIsIGF0dGFjaG1lbnQ6IG51bWJlcikge1xyXG4gICAgdGhpcy5iaW5kKGZyYW1lYnVmZmVyKVxyXG5cclxuICAgIHN3aXRjaCAoYnVmZmVyLnRhcmdldCkge1xyXG4gICAgICBjYXNlIHRoaXMuZ2wuVEVYVFVSRV8yRDpcclxuICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGZyYW1lYnVmZmVyLnRhcmdldCwgYXR0YWNobWVudCwgYnVmZmVyLnRhcmdldCwgYnVmZmVyLCAwKVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSB0aGlzLmdsLlJFTkRFUkJVRkZFUjpcclxuICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGZyYW1lYnVmZmVyLnRhcmdldCwgYXR0YWNobWVudCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIGJ1ZmZlcilcclxuXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuXHJcbiAgICBmcmFtZWJ1ZmZlci5hdHRhY2htZW50c1thdHRhY2htZW50XSA9IGJ1ZmZlclxyXG4gIH1cclxuXHJcbiAgdXNlKGZyYW1lYnVmZmVyOiBGcmFtZUJ1ZmZlcikge1xyXG4gICAgdGhpcy5iaW5kKGZyYW1lYnVmZmVyKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBiaW5kKGJ1ZmZlcjogQnVmZmVyKSB7XHJcbiAgICBjb25zdCBib3VuZEJ1ZmZlciA9IGJ1ZmZlciA/IHRoaXMuYm91bmRCdWZmZXJzW2J1ZmZlci50YXJnZXRdIDogbnVsbFxyXG5cclxuICAgIGlmIChib3VuZEJ1ZmZlciA9PT0gYnVmZmVyKSB7XHJcbiAgICAgIC8vIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaCAoYnVmZmVyLnRhcmdldCkge1xyXG4gICAgICBjYXNlIHRoaXMuZ2wuRlJBTUVCVUZGRVI6XHJcbiAgICAgICAgY29uc3QgZnJhbWVCdWZmZXIgPSBib3VuZEJ1ZmZlciBhcyBGcmFtZUJ1ZmZlclxyXG5cclxuICAgICAgICBpZiAoZnJhbWVCdWZmZXIpIHtcclxuICAgICAgICAgIE9iamVjdC52YWx1ZXMoZnJhbWVCdWZmZXIuYXR0YWNobWVudHMpLmZvckVhY2goYXR0YWNobWVudCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHR1cmUgPSBhdHRhY2htZW50IGFzIFRleHR1cmVcclxuXHJcbiAgICAgICAgICAgIGlmICh0ZXh0dXJlLnVzZU1pcG1hcHMpIHtcclxuICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRleHR1cmUudGFyZ2V0LCB0ZXh0dXJlKVxyXG4gICAgICAgICAgICAgIHRoaXMuZ2wuZ2VuZXJhdGVNaXBtYXAodGV4dHVyZS50YXJnZXQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcihidWZmZXIudGFyZ2V0LCBidWZmZXIpXHJcblxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBjYXNlIHRoaXMuZ2wuUkVOREVSQlVGRkVSOlxyXG4gICAgICAgIHRoaXMuZ2wuYmluZFJlbmRlcmJ1ZmZlcihidWZmZXIudGFyZ2V0LCBidWZmZXIpXHJcblxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcihidWZmZXIudGFyZ2V0LCBidWZmZXIpXHJcblxyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5ib3VuZEJ1ZmZlcnNbYnVmZmVyLnRhcmdldF0gPSBidWZmZXJcclxuICB9XHJcblxyXG59IiwiaW1wb3J0IHsgSW5kZXhCdWZmZXIgfSBmcm9tICcuLi9idWZmZXJzL2luZGV4LWJ1ZmZlcidcclxuaW1wb3J0IHsgVmVydGV4QnVmZmVyIH0gZnJvbSAnLi4vYnVmZmVycy92ZXJ0ZXgtYnVmZmVyJ1xyXG5pbXBvcnQgeyBNZXNoIH0gZnJvbSAnLi4vcmVuZGVyZXIvbWVzaCdcclxuaW1wb3J0IHsgVmVydGV4QXJyYXkgfSBmcm9tICcuLi90eXBlcy92ZXJ0ZXgtYXJyYXknXHJcblxyXG5jb25zdCB2ZXJ0ZXhTaXplID0gOCAvLyBwb3NpdGlvbiAoeHl6KSArIG5vcm1hbCAoeHl6KSArIHRleHR1cmUgY29vcmRpbmF0ZXMgKHV2KVxyXG5cclxuZXhwb3J0IGNsYXNzIE1lc2hlcyB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHsgfVxyXG5cclxuICBjcmVhdGUoZGF0YTogeyBcclxuICAgIHRvcG9sb2d5OiBzdHJpbmcsIFxyXG4gICAgdmVydGljZXM6IG51bWJlcltdLCBcclxuICAgIGluZGljZXM/OiBudW1iZXJbXSBcclxuICB9KTogTWVzaCB8IG51bGwge1xyXG4gICAgY29uc3QgeyB0b3BvbG9neSwgdmVydGljZXMgfSA9IGRhdGFcclxuXHJcbiAgICBsZXQgdmVydGV4QXJyYXkgPSB0aGlzLmdsLmNyZWF0ZVZlcnRleEFycmF5KCkgYXMgVmVydGV4QXJyYXlcclxuICAgIGxldCB2ZXJ0ZXhCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpIGFzIFZlcnRleEJ1ZmZlclxyXG5cclxuICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKVxyXG4gICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKSwgdGhpcy5nbC5TVEFUSUNfRFJBVylcclxuXHJcbiAgICB2ZXJ0ZXhBcnJheS52ZXJ0ZXhDb3VudCA9IHZlcnRpY2VzLmxlbmd0aCAvIHZlcnRleFNpemVcclxuXHJcbiAgICBsZXQgaW5kZXhCdWZmZXI6IEluZGV4QnVmZmVyID0gbnVsbFxyXG5cclxuICAgIGlmIChkYXRhLmluZGljZXMgJiYgZGF0YS5pbmRpY2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgY29uc3QgeyBpbmRpY2VzIH0gPSBkYXRhXHJcblxyXG4gICAgICBpbmRleEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCkgYXMgSW5kZXhCdWZmZXJcclxuXHJcbiAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcilcclxuICAgICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG5ldyBVaW50MTZBcnJheShpbmRpY2VzKSwgdGhpcy5nbC5TVEFUSUNfRFJBVylcclxuXHJcbiAgICAgIHZlcnRleEFycmF5LmluZGV4Q291bnQgPSBpbmRpY2VzLmxlbmd0aFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmVydGV4QXJyYXkuaW5kZXhDb3VudCA9IDBcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdsLmJpbmRWZXJ0ZXhBcnJheSh2ZXJ0ZXhBcnJheSlcclxuXHJcbiAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHZlcnRleEJ1ZmZlcilcclxuXHJcbiAgICBpZiAoaW5kZXhCdWZmZXIpIHtcclxuICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGV4QnVmZmVyKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0cmlkZSA9IHZlcnRleFNpemUgKiBGbG9hdDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlRcclxuXHJcbiAgICAvLyBwb3NpdGlvblxyXG4gICAgdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgwKVxyXG4gICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDAsIDMsIHRoaXMuZ2wuRkxPQVQsIGZhbHNlLCBzdHJpZGUsIDApXHJcblxyXG4gICAgLy8gbm9ybWFsXHJcbiAgICB0aGlzLmdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KDEpXHJcbiAgICB0aGlzLmdsLnZlcnRleEF0dHJpYlBvaW50ZXIoMSwgMywgdGhpcy5nbC5GTE9BVCwgdHJ1ZSwgc3RyaWRlLCAzICogRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKVxyXG5cclxuICAgIC8vIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuICAgIHRoaXMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoMilcclxuICAgIHRoaXMuZ2wudmVydGV4QXR0cmliUG9pbnRlcigyLCAyLCB0aGlzLmdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLCA2ICogRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKVxyXG5cclxuICAgIHRoaXMuZ2wuYmluZFZlcnRleEFycmF5KG51bGwpXHJcblxyXG4gICAgcmV0dXJuIG5ldyBNZXNoKFxyXG4gICAgICB0b3BvbG9neSBhcyBNZXNoLlRvcG9sb2d5LFxyXG4gICAgICB2ZXJ0ZXhBcnJheVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgcmVuZGVyKG1lc2g6IE1lc2gpIHtcclxuICAgIGxldCBtb2RlOiBudW1iZXJcclxuXHJcbiAgICBzd2l0Y2ggKG1lc2gudG9wb2xvZ3kpIHtcclxuICAgICAgY2FzZSBNZXNoLlRvcG9sb2d5LlBvaW50czpcclxuICAgICAgICBtb2RlID0gdGhpcy5nbC5QT0lOVFNcclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBNZXNoLlRvcG9sb2d5LkxpbmVzOlxyXG4gICAgICAgIG1vZGUgPSB0aGlzLmdsLkxJTkVTXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgTWVzaC5Ub3BvbG9neS5MaW5lTG9vcDpcclxuICAgICAgICBtb2RlID0gdGhpcy5nbC5MSU5FX0xPT1BcclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBNZXNoLlRvcG9sb2d5LkxpbmVTdHJpcDpcclxuICAgICAgICBtb2RlID0gdGhpcy5nbC5MSU5FX1NUUklQXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgTWVzaC5Ub3BvbG9neS5UcmlhbmdsZXM6XHJcbiAgICAgICAgbW9kZSA9IHRoaXMuZ2wuVFJJQU5HTEVTXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgTWVzaC5Ub3BvbG9neS5UcmlhbmdsZUZhbjpcclxuICAgICAgICBtb2RlID0gdGhpcy5nbC5UUklBTkdMRV9GQU5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBNZXNoLlRvcG9sb2d5LlRyaWFuZ2xlU3RyaXA6XHJcbiAgICAgICAgbW9kZSA9IHRoaXMuZ2wuVFJJQU5HTEVfU1RSSVBcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2wuYmluZFZlcnRleEFycmF5KG1lc2gudmVydGV4QXJyYXkpXHJcblxyXG4gICAgaWYgKG1lc2gudmVydGV4QXJyYXkuaW5kZXhDb3VudCA+IDApIHtcclxuICAgICAgdGhpcy5nbC5kcmF3RWxlbWVudHMobW9kZSwgbWVzaC52ZXJ0ZXhBcnJheS5pbmRleENvdW50LCB0aGlzLmdsLlVOU0lHTkVEX1NIT1JULCAwKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5nbC5kcmF3QXJyYXlzKG1vZGUsIDAsIG1lc2gudmVydGV4QXJyYXkudmVydGV4Q291bnQpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5nbC5iaW5kVmVydGV4QXJyYXkobnVsbClcclxuICB9XHJcblxyXG59IiwiaW1wb3J0IHsgbWF0MiwgbWF0MywgbWF0NCwgdmVjMiwgdmVjMywgdmVjNCB9IGZyb20gJy4uLy4uL3ZlY3RvcnMnXHJcbmltcG9ydCB7IFVuaWZvcm1CdWZmZXIgfSBmcm9tICcuLi9idWZmZXJzL3VuaWZvcm0tYnVmZmVyJ1xyXG5pbXBvcnQgeyBBdHRyaWJ1dGUgfSBmcm9tICcuLi90eXBlcy9hdHRyaWJ1dGUnXHJcbmltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi90eXBlcy9wcm9ncmFtJ1xyXG5pbXBvcnQgeyBTaGFkZXIgfSBmcm9tICcuLi90eXBlcy9zaGFkZXInXHJcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi90eXBlcy90ZXh0dXJlJ1xyXG5pbXBvcnQgeyBVbmlmb3JtIH0gZnJvbSAnLi4vdHlwZXMvdW5pZm9ybSdcclxuXHJcbmV4cG9ydCBjbGFzcyBQcm9ncmFtcyB7XHJcblxyXG4gIHByaXZhdGUgcHJvZ3JhbXM6IFByb2dyYW1bXSA9IFtdXHJcblxyXG4gIHByaXZhdGUgdXNlZFByb2dyYW06IFByb2dyYW1cclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkgeyB9XHJcblxyXG4gIGNyZWF0ZSh2ZXJ0ZXhTaGFkZXI6IFNoYWRlciwgZnJhZ21lbnRTaGFkZXI6IFNoYWRlcik6IFByb2dyYW0gfCBudWxsIHtcclxuICAgIGxldCBwcm9ncmFtID0gdGhpcy5nbC5jcmVhdGVQcm9ncmFtKCkgYXMgUHJvZ3JhbVxyXG5cclxuICAgIHRoaXMuZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRleFNoYWRlcilcclxuICAgIHRoaXMuZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50U2hhZGVyKVxyXG5cclxuICAgIHRoaXMuZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSlcclxuXHJcbiAgICBjb25zdCBsaW5rZWQgPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgdGhpcy5nbC5MSU5LX1NUQVRVUykgYXMgYm9vbGVhblxyXG5cclxuICAgIGlmICghbGlua2VkIHx8ICF0aGlzLmdsLmlzUHJvZ3JhbShwcm9ncmFtKSkge1xyXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcclxuICAgICAgY29uc29sZS5lcnJvcih0aGlzLmdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pKVxyXG5cclxuICAgICAgcmV0dXJuIG51bGxcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNldHVwQXR0cmlidXRlcyhwcm9ncmFtKVxyXG5cclxuICAgIHRoaXMuc2V0dXBVbmlmb3Jtcyhwcm9ncmFtKVxyXG4gICAgdGhpcy5zZXR1cFVuaWZvcm1CbG9ja3MocHJvZ3JhbSlcclxuXHJcbiAgICB0aGlzLnNldHVwVGV4dXJlU2xvdHMocHJvZ3JhbSlcclxuXHJcbiAgICB0aGlzLnByb2dyYW1zLnB1c2gocHJvZ3JhbSlcclxuXHJcbiAgICByZXR1cm4gcHJvZ3JhbVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlKHByb2dyYW06IFByb2dyYW0sIGRhdGE/OiB7XHJcbiAgICB1bmlmb3Jtcz86IFJlY29yZDxzdHJpbmcsIFVuaWZvcm0uVmFsdWU+LFxyXG4gICAgdW5pZm9ybUJ1ZmZlcnM/OiBSZWNvcmQ8c3RyaW5nLCBVbmlmb3JtQnVmZmVyPlxyXG4gIH0pIHtcclxuICAgIHRoaXMudXNlKHByb2dyYW0pXHJcblxyXG4gICAgaWYgKGRhdGE/LnVuaWZvcm1zKSB7XHJcbiAgICAgIE9iamVjdC5rZXlzKGRhdGEudW5pZm9ybXMpLmZvckVhY2gobmFtZSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBkYXRhLnVuaWZvcm1zW25hbWVdXHJcblxyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcclxuICAgICAgICAgIGNvbnNvbGUud2FybignU2tpcHBpbmcgdW5kZWZpbmVkIHVuaWZvcm0gdmFsdWU6JywgbmFtZSlcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdW5pZm9ybSA9IHByb2dyYW0udW5pZm9ybXNbbmFtZV1cclxuXHJcbiAgICAgICAgaWYgKHVuaWZvcm0pIHtcclxuICAgICAgICAgIHN3aXRjaCAodW5pZm9ybS50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5TQU1QTEVSXzJEOlxyXG4gICAgICAgICAgICAgIGNvbnN0IHNsb3QgPSBwcm9ncmFtLnRleHR1cmVTbG90c1tuYW1lXVxyXG4gICAgICAgICAgICAgIGNvbnN0IHRleHR1cmUgPSB2YWx1ZSBhcyBUZXh0dXJlXHJcblxyXG4gICAgICAgICAgICAgIHRoaXMuZ2wuYWN0aXZlVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkUwICsgc2xvdClcclxuICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRUZXh0dXJlKHRleHR1cmUudGFyZ2V0LCB0ZXh0dXJlKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuSU5UOiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtMWkodW5pZm9ybS5sb2NhdGlvbiwgdmFsdWUgYXMgbnVtYmVyKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVDoge1xyXG4gICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTFmKHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlIGFzIG51bWJlcilcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRkxPQVRfVkVDMjoge1xyXG4gICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTJmdih1bmlmb3JtLmxvY2F0aW9uLCB2YWx1ZSBhcyB2ZWMyKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9WRUMzOiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtM2Z2KHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlIGFzIHZlYzMpXHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2FzZSB0aGlzLmdsLkZMT0FUX1ZFQzQ6IHtcclxuICAgICAgICAgICAgICB0aGlzLmdsLnVuaWZvcm00ZnYodW5pZm9ybS5sb2NhdGlvbiwgdmFsdWUgYXMgdmVjNClcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRkxPQVRfTUFUMjoge1xyXG4gICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybU1hdHJpeDJmdih1bmlmb3JtLmxvY2F0aW9uLCBmYWxzZSwgdmFsdWUgYXMgbWF0MilcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRkxPQVRfTUFUMzoge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1hdHJpeCA9IHZhbHVlIGFzIG1hdDNcclxuICAgICAgICAgICAgICB0aGlzLmdsLnVuaWZvcm1NYXRyaXgzZnYodW5pZm9ybS5sb2NhdGlvbiwgZmFsc2UsIG1hdHJpeClcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRkxPQVRfTUFUNDoge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1hdHJpeCA9IHZhbHVlIGFzIG1hdDRcclxuICAgICAgICAgICAgICB0aGlzLmdsLnVuaWZvcm1NYXRyaXg0ZnYodW5pZm9ybS5sb2NhdGlvbiwgZmFsc2UsIG1hdHJpeClcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uc29sZVxyXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzZXQgdW5pZm9ybSB2YWx1ZTonLCBuYW1lLCB2YWx1ZSlcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcclxuICAgICAgICAgIGNvbnNvbGUud2FybignQXR0ZW1wdGluZyB0byB1cGRhdGUgbm9uLWV4aXN0ZW50IHVuaWZvcm06JywgbmFtZSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRhdGE/LnVuaWZvcm1CdWZmZXJzKSB7XHJcbiAgICAgIE9iamVjdC5rZXlzKGRhdGEudW5pZm9ybUJ1ZmZlcnMpLmZvckVhY2goKG5hbWUpID0+IHtcclxuICAgICAgICBjb25zdCB1bmlmb3JtQmxvY2sgPSBwcm9ncmFtLnVuaWZvcm1CbG9ja3NbbmFtZV1cclxuXHJcbiAgICAgICAgaWYgKHVuaWZvcm1CbG9jaykge1xyXG4gICAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyQmFzZSh0aGlzLmdsLlVOSUZPUk1fQlVGRkVSLCB1bmlmb3JtQmxvY2suaW5kZXgsIGRhdGEudW5pZm9ybUJ1ZmZlcnNbbmFtZV0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdXNlKHByb2dyYW06IFByb2dyYW0pIHtcclxuICAgIGlmICh0aGlzLnVzZWRQcm9ncmFtID09PSBwcm9ncmFtKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2wudXNlUHJvZ3JhbShwcm9ncmFtKVxyXG5cclxuICAgIHRoaXMudXNlZFByb2dyYW0gPSBwcm9ncmFtXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldHVwQXR0cmlidXRlcyhwcm9ncmFtOiBQcm9ncmFtKSB7XHJcbiAgICBwcm9ncmFtLmF0dHJpYnV0ZXMgPSB7fVxyXG5cclxuICAgIGNvbnN0IGFjdGl2ZUF0dHJpYnV0ZXMgPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgdGhpcy5nbC5BQ1RJVkVfQVRUUklCVVRFUykgYXMgbnVtYmVyXHJcblxyXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGFjdGl2ZUF0dHJpYnV0ZXM7IGluZGV4KyspIHtcclxuICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5nbC5nZXRBY3RpdmVBdHRyaWIocHJvZ3JhbSwgaW5kZXgpIGFzIEF0dHJpYnV0ZVxyXG4gICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgYXR0cmlidXRlLm5hbWUpXHJcblxyXG4gICAgICBhdHRyaWJ1dGUubG9jYXRpb24gPSBsb2NhdGlvblxyXG4gICAgICBwcm9ncmFtLmF0dHJpYnV0ZXNbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldHVwVW5pZm9ybXMocHJvZ3JhbTogUHJvZ3JhbSkge1xyXG4gICAgcHJvZ3JhbS51bmlmb3JtcyA9IHt9XHJcblxyXG4gICAgY29uc3QgYWN0aXZlVW5pZm9ybXMgPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgdGhpcy5nbC5BQ1RJVkVfVU5JRk9STVMpXHJcblxyXG4gICAgZm9yIChsZXQgdW5pZm9ybUluZGV4ID0gMDsgdW5pZm9ybUluZGV4IDwgYWN0aXZlVW5pZm9ybXM7IHVuaWZvcm1JbmRleCsrKSB7XHJcbiAgICAgIGNvbnN0IHVuaWZvcm0gPSB0aGlzLmdsLmdldEFjdGl2ZVVuaWZvcm0ocHJvZ3JhbSwgdW5pZm9ybUluZGV4KSBhcyBVbmlmb3JtXHJcblxyXG4gICAgICBpZiAodGhpcy5pc1VuaWZvcm1BcnJheSh1bmlmb3JtKSkge1xyXG4gICAgICAgIGNvbnN0IG5hbWVXaXRob3V0SW5kZXggPSB1bmlmb3JtLm5hbWUuc2xpY2UoMCwgLTMpXHJcblxyXG4gICAgICAgIGZvciAobGV0IGFycmF5SW5kZXggPSAwOyBhcnJheUluZGV4IDwgdW5pZm9ybS5zaXplOyBhcnJheUluZGV4KyspIHtcclxuICAgICAgICAgIGNvbnN0IG5hbWVXaXRoSW5kZXggPSBgJHtuYW1lV2l0aG91dEluZGV4fVske2FycmF5SW5kZXh9XWBcclxuICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgbmFtZVdpdGhJbmRleClcclxuXHJcbiAgICAgICAgICBpZiAobG9jYXRpb24gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB1bmlmb3JtLmxvY2F0aW9uID0gbG9jYXRpb25cclxuICAgICAgICAgICAgcHJvZ3JhbS51bmlmb3Jtc1tuYW1lV2l0aEluZGV4XSA9IHVuaWZvcm1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLmdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCB1bmlmb3JtLm5hbWUpXHJcblxyXG4gICAgICAgIGlmIChsb2NhdGlvbiAhPSBudWxsKSB7XHJcbiAgICAgICAgICB1bmlmb3JtLmxvY2F0aW9uID0gbG9jYXRpb25cclxuICAgICAgICAgIHByb2dyYW0udW5pZm9ybXNbdW5pZm9ybS5uYW1lXSA9IHVuaWZvcm1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0dXBVbmlmb3JtQmxvY2tzKHByb2dyYW06IFByb2dyYW0pIHtcclxuICAgIHByb2dyYW0udW5pZm9ybUJsb2NrcyA9IHt9XHJcblxyXG4gICAgY29uc3QgYWN0aXZlVW5pZm9ybUJsb2NrcyA9IHRoaXMuZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9VTklGT1JNX0JMT0NLUykgYXMgbnVtYmVyXHJcblxyXG4gICAgZm9yIChsZXQgYmxvY2tJbmRleCA9IDA7IGJsb2NrSW5kZXggPCBhY3RpdmVVbmlmb3JtQmxvY2tzOyBibG9ja0luZGV4KyspIHtcclxuICAgICAgY29uc3QgdW5pZm9ybUJsb2NrTmFtZSA9IHRoaXMuZ2wuZ2V0QWN0aXZlVW5pZm9ybUJsb2NrTmFtZShwcm9ncmFtLCBibG9ja0luZGV4KVxyXG4gICAgICBjb25zdCB1bmlmb3JtQmxvY2tJbmRleCA9IHRoaXMuZ2wuZ2V0VW5pZm9ybUJsb2NrSW5kZXgocHJvZ3JhbSwgdW5pZm9ybUJsb2NrTmFtZSlcclxuXHJcbiAgICAgIGNvbnN0IHVuaWZvcm1CbG9ja0JpbmRpbmcgPSB1bmlmb3JtQmxvY2tJbmRleFxyXG4gICAgICB0aGlzLmdsLnVuaWZvcm1CbG9ja0JpbmRpbmcocHJvZ3JhbSwgdW5pZm9ybUJsb2NrSW5kZXgsIHVuaWZvcm1CbG9ja0JpbmRpbmcpXHJcblxyXG4gICAgICBjb25zdCB1bmlmb3JtSW5kaWNlcyA9IHRoaXMuZ2wuZ2V0QWN0aXZlVW5pZm9ybUJsb2NrUGFyYW1ldGVyKHByb2dyYW0sIGJsb2NrSW5kZXgsIHRoaXMuZ2wuVU5JRk9STV9CTE9DS19BQ1RJVkVfVU5JRk9STV9JTkRJQ0VTKSBhcyBudW1iZXJbXVxyXG4gICAgICBjb25zdCB1bmlmb3JtT2Zmc2V0cyA9IHRoaXMuZ2wuZ2V0QWN0aXZlVW5pZm9ybXMocHJvZ3JhbSwgdW5pZm9ybUluZGljZXMsIHRoaXMuZ2wuVU5JRk9STV9PRkZTRVQpIGFzIG51bWJlcltdXHJcblxyXG4gICAgICBjb25zdCB1bmlmb3JtT2Zmc2V0c0J5TmFtZSA9IHVuaWZvcm1JbmRpY2VzLnJlZHVjZSgob2Zmc2V0czogUmVjb3JkPHN0cmluZywgbnVtYmVyPiwgdW5pZm9ybUluZGV4LCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHVuaWZvcm0gPSB0aGlzLmdsLmdldEFjdGl2ZVVuaWZvcm0ocHJvZ3JhbSwgdW5pZm9ybUluZGV4KVxyXG4gICAgICAgIG9mZnNldHNbdW5pZm9ybS5uYW1lXSA9IHVuaWZvcm1PZmZzZXRzW2luZGV4XVxyXG5cclxuICAgICAgICByZXR1cm4gb2Zmc2V0c1xyXG4gICAgICB9LCB7fSlcclxuXHJcbiAgICAgIHByb2dyYW0udW5pZm9ybUJsb2Nrc1t1bmlmb3JtQmxvY2tOYW1lXSA9IHtcclxuICAgICAgICBuYW1lOiB1bmlmb3JtQmxvY2tOYW1lLFxyXG4gICAgICAgIGluZGV4OiB1bmlmb3JtQmxvY2tJbmRleCxcclxuICAgICAgICBiaW5kaW5nOiB1bmlmb3JtQmxvY2tCaW5kaW5nLFxyXG4gICAgICAgIG9mZnNldHM6IHVuaWZvcm1PZmZzZXRzQnlOYW1lXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0dXBUZXh1cmVTbG90cyhwcm9ncmFtOiBQcm9ncmFtKSB7XHJcbiAgICBwcm9ncmFtLnRleHR1cmVTbG90cyA9IHt9XHJcblxyXG4gICAgbGV0IHNsb3QgPSAwXHJcblxyXG4gICAgdGhpcy51cGRhdGUocHJvZ3JhbSlcclxuXHJcbiAgICBPYmplY3Qua2V5cyhwcm9ncmFtLnVuaWZvcm1zKS5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVuaWZvcm0gPSBwcm9ncmFtLnVuaWZvcm1zW25hbWVdXHJcblxyXG4gICAgICBpZiAodW5pZm9ybS50eXBlID09PSB0aGlzLmdsLlNBTVBMRVJfMkQpIHtcclxuICAgICAgICB0aGlzLmdsLnVuaWZvcm0xaSh1bmlmb3JtLmxvY2F0aW9uLCBzbG90KVxyXG5cclxuICAgICAgICBwcm9ncmFtLnRleHR1cmVTbG90c1tuYW1lXSA9IHNsb3RcclxuXHJcbiAgICAgICAgc2xvdCA9IHNsb3QgKyAxXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzVW5pZm9ybUFycmF5KHVuaWZvcm06IFdlYkdMQWN0aXZlSW5mbykge1xyXG4gICAgcmV0dXJuIHVuaWZvcm0uc2l6ZSA+IDFcclxuICB9XHJcblxyXG59IiwiaW1wb3J0IHsgU2FtcGxlciB9IGZyb20gJy4uL3R5cGVzL3NhbXBsZXInXHJcbmltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi90eXBlcy90ZXh0dXJlJ1xyXG5cclxuZXhwb3J0IGNsYXNzIFNhbXBsZXJzIHtcclxuXHJcbiAgcHJpdmF0ZSBzYW1wbGVyczogU2FtcGxlcltdID0gW11cclxuXHJcbiAgcHJpdmF0ZSBib3VuZFNhbXBsZXJzOiB7IFtpbmRleDogbnVtYmVyXTogU2FtcGxlciB9ID0ge31cclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge31cclxuXHJcbiAgY3JlYXRlKCk6IFNhbXBsZXIge1xyXG4gICAgbGV0IHNhbXBsZXIgPSB0aGlzLmdsLmNyZWF0ZVNhbXBsZXIoKSBhcyBTYW1wbGVyXHJcblxyXG4gICAgdGhpcy51cGRhdGUoc2FtcGxlciwgVGV4dHVyZS5GaWx0ZXJpbmcuTm9uZSwgVGV4dHVyZS5UaWxpbmcuTm9uZSlcclxuXHJcbiAgICB0aGlzLnNhbXBsZXJzLnB1c2goc2FtcGxlcilcclxuXHJcbiAgICByZXR1cm4gc2FtcGxlclxyXG4gIH1cclxuXHJcbiAgdXBkYXRlKHNhbXBsZXI6IFNhbXBsZXIsIGZpbHRlcmluZzogVGV4dHVyZS5GaWx0ZXJpbmcsIHRpbGluZzogVGV4dHVyZS5UaWxpbmcpIHtcclxuICAgIHN3aXRjaCAoZmlsdGVyaW5nKSB7XHJcbiAgICAgIGNhc2UgVGV4dHVyZS5GaWx0ZXJpbmcuTm9uZTpcclxuICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCB0aGlzLmdsLk5FQVJFU1QpXHJcbiAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy5nbC5ORUFSRVNUKVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBUZXh0dXJlLkZpbHRlcmluZy5MaW5lYXI6XHJcbiAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5nbC5ORUFSRVNUKVxyXG4gICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMuZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUKVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBUZXh0dXJlLkZpbHRlcmluZy5CaWxpbmVhcjpcclxuICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCB0aGlzLmdsLkxJTkVBUilcclxuICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCB0aGlzLmdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVClcclxuXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgVGV4dHVyZS5GaWx0ZXJpbmcuVHJpbGluZWFyOlxyXG4gICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX01BR19GSUxURVIsIHRoaXMuZ2wuTElORUFSKVxyXG4gICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMuZ2wuTElORUFSX01JUE1BUF9MSU5FQVIpXHJcblxyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoICh0aWxpbmcpIHtcclxuICAgICAgY2FzZSBUZXh0dXJlLlRpbGluZy5Ob25lOlxyXG4gICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfUywgdGhpcy5nbC5DTEFNUF9UT19FREdFKVxyXG4gICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfVCwgdGhpcy5nbC5DTEFNUF9UT19FREdFKVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBUZXh0dXJlLlRpbGluZy5Cb3RoOlxyXG4gICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfUywgdGhpcy5nbC5SRVBFQVQpXHJcbiAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfV1JBUF9ULCB0aGlzLmdsLlJFUEVBVClcclxuXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgVGV4dHVyZS5UaWxpbmcuSG9yaXpvbnRhbDpcclxuICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1MsIHRoaXMuZ2wuUkVQRUFUKVxyXG4gICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfVCwgdGhpcy5nbC5DTEFNUF9UT19FREdFKVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBUZXh0dXJlLlRpbGluZy5WZXJ0aWNhbDpcclxuICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1MsIHRoaXMuZ2wuQ0xBTVBfVE9fRURHRSlcclxuICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1QsIHRoaXMuZ2wuUkVQRUFUKVxyXG5cclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG5cclxuICAgIHNhbXBsZXIuZmlsdGVyaW5nID0gZmlsdGVyaW5nXHJcbiAgICBzYW1wbGVyLnRpbGluZyA9IHRpbGluZ1xyXG4gIH1cclxuXHJcbiAgYmluZChzYW1wbGVyOiBTYW1wbGVyLCB1bml0OiBudW1iZXIpIHtcclxuICAgIGlmICh0aGlzLmJvdW5kU2FtcGxlcnNbdW5pdF0gPT09IHNhbXBsZXIpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5nbC5iaW5kU2FtcGxlcih0aGlzLmdsLlRFWFRVUkUwICsgdW5pdCwgc2FtcGxlcilcclxuXHJcbiAgICB0aGlzLmJvdW5kU2FtcGxlcnNbdW5pdF0gPSBzYW1wbGVyXHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IFNoYWRlciB9IGZyb20gJy4uL3R5cGVzL3NoYWRlcidcclxuXHJcbmV4cG9ydCBjbGFzcyBTaGFkZXJzIHtcclxuXHJcbiAgcHJpdmF0ZSBzaGFkZXJzOiBTaGFkZXJbXSA9IFtdXHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHsgfVxyXG5cclxuICBjcmVhdGUoc3RhZ2U6IFNoYWRlci5TdGFnZSwgc291cmNlOiBzdHJpbmcsIGhlYWRlcnM/OiBzdHJpbmdbXSk6IFNoYWRlciB8IG51bGwge1xyXG4gICAgbGV0IHR5cGU6IG51bWJlclxyXG5cclxuICAgIHN3aXRjaCAoc3RhZ2UpIHtcclxuICAgICAgY2FzZSBTaGFkZXIuU3RhZ2UuVmVydGV4U2hhZGVyOlxyXG4gICAgICAgIHR5cGUgPSB0aGlzLmdsLlZFUlRFWF9TSEFERVJcclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBTaGFkZXIuU3RhZ2UuRnJhZ21lbnRTaGFkZXI6XHJcbiAgICAgICAgdHlwZSA9IHRoaXMuZ2wuRlJBR01FTlRfU0hBREVSXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaGVhZGVycz8ubGVuZ3RoID4gMCkge1xyXG4gICAgICBoZWFkZXJzLnJldmVyc2UoKS5mb3JFYWNoKChoZWFkZXIpID0+IHtcclxuICAgICAgICBzb3VyY2UgPSBgJHtoZWFkZXJ9XFxuXFxuJHtzb3VyY2V9YFxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBzaGFkZXIgPSB0aGlzLmdsLmNyZWF0ZVNoYWRlcih0eXBlKSBhcyBTaGFkZXJcclxuXHJcbiAgICB0aGlzLmdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSlcclxuICAgIHRoaXMuZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpXHJcblxyXG4gICAgc2hhZGVyLmNvbXBpbGVkID0gdGhpcy5nbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCB0aGlzLmdsLkNPTVBJTEVfU1RBVFVTKVxyXG5cclxuICAgIGlmICghc2hhZGVyLmNvbXBpbGVkIHx8ICF0aGlzLmdsLmlzU2hhZGVyKHNoYWRlcikpIHtcclxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25zb2xlXHJcbiAgICAgIGNvbnNvbGUuZXJyb3IodGhpcy5nbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikpXHJcblxyXG4gICAgICB0aGlzLmdsLmRlbGV0ZVNoYWRlcihzaGFkZXIpXHJcblxyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2hhZGVycy5wdXNoKHNoYWRlcilcclxuXHJcbiAgICByZXR1cm4gc2hhZGVyXHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IFRleHR1cmUgfSBmcm9tICcuLi90eXBlcy90ZXh0dXJlJ1xyXG5cclxuZXhwb3J0IGNsYXNzIFRleHR1cmVzIHtcclxuXHJcbiAgcHJpdmF0ZSB0ZXh0dXJlczogVGV4dHVyZVtdID0gW11cclxuXHJcbiAgcHJpdmF0ZSBib3VuZFRleHR1cmVzOiB7IFtpbmRleDogbnVtYmVyXTogVGV4dHVyZSB9ID0ge31cclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkgeyB9XHJcblxyXG4gIGNyZWF0ZSh0YXJnZXQ6IG51bWJlciwgZm9ybWF0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBmaWx0ZXJpbmc6IFRleHR1cmUuRmlsdGVyaW5nLCB0aWxpbmc6IFRleHR1cmUuVGlsaW5nLCBtaXBtYXBzOiBib29sZWFuKTogVGV4dHVyZSB7XHJcbiAgICBsZXQgdGV4dHVyZSA9IHRoaXMuZ2wuY3JlYXRlVGV4dHVyZSgpIGFzIFRleHR1cmVcclxuXHJcbiAgICB0ZXh0dXJlLnRhcmdldCA9IHRhcmdldFxyXG4gICAgdGV4dHVyZS5mb3JtYXQgPSBmb3JtYXRcclxuXHJcbiAgICB0ZXh0dXJlLndpZHRoID0gd2lkdGhcclxuICAgIHRleHR1cmUuaGVpZ2h0ID0gaGVpZ2h0XHJcblxyXG4gICAgdGV4dHVyZS50aWxpbmcgPSB0aWxpbmdcclxuICAgIHRleHR1cmUuZmlsdGVyaW5nID0gZmlsdGVyaW5nXHJcblxyXG4gICAgdGV4dHVyZS51c2VNaXBtYXBzID0gbWlwbWFwc1xyXG5cclxuICAgIGxldCBzb3VyY2VGb3JtYXQ6IG51bWJlclxyXG5cclxuICAgIHN3aXRjaCAodGV4dHVyZS5mb3JtYXQpIHtcclxuICAgICAgY2FzZSB0aGlzLmdsLlJHQkE6XHJcbiAgICAgIGNhc2UgdGhpcy5nbC5SR0JBMzJGOlxyXG4gICAgICAgIHNvdXJjZUZvcm1hdCA9IHRoaXMuZ2wuUkdCQVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSB0aGlzLmdsLkxVTUlOQU5DRTpcclxuICAgICAgICBzb3VyY2VGb3JtYXQgPSB0aGlzLmdsLkxVTUlOQU5DRVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVDMyRjpcclxuICAgICAgICBzb3VyY2VGb3JtYXQgPSB0aGlzLmdsLkRFUFRIX0NPTVBPTkVOVFxyXG5cclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG5cclxuICAgIHN3aXRjaCAodGV4dHVyZS5mb3JtYXQpIHtcclxuICAgICAgY2FzZSB0aGlzLmdsLlJHQkEzMkY6XHJcbiAgICAgIGNhc2UgdGhpcy5nbC5ERVBUSF9DT01QT05FTlQzMkY6XHJcbiAgICAgICAgdGV4dHVyZS50eXBlID0gdGhpcy5nbC5GTE9BVFxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0ZXh0dXJlLnR5cGUgPSB0aGlzLmdsLlVOU0lHTkVEX0JZVEVcclxuXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmJpbmQodGV4dHVyZSwgMClcclxuXHJcbiAgICB0aGlzLmdsLnRleEltYWdlMkQodGV4dHVyZS50YXJnZXQsIDAsIHRleHR1cmUuZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCAwLCBzb3VyY2VGb3JtYXQsIHRleHR1cmUudHlwZSwgbnVsbClcclxuXHJcbiAgICBzd2l0Y2ggKHRleHR1cmUudGlsaW5nKSB7XHJcbiAgICAgIGNhc2UgVGV4dHVyZS5UaWxpbmcuTm9uZTpcclxuICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGV4dHVyZS50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1MsIHRoaXMuZ2wuQ0xBTVBfVE9fRURHRSlcclxuICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGV4dHVyZS50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1QsIHRoaXMuZ2wuQ0xBTVBfVE9fRURHRSlcclxuXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgVGV4dHVyZS5UaWxpbmcuQm90aDpcclxuICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGV4dHVyZS50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1MsIHRoaXMuZ2wuUkVQRUFUKVxyXG4gICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0ZXh0dXJlLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX1dSQVBfVCwgdGhpcy5nbC5SRVBFQVQpXHJcblxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBjYXNlIFRleHR1cmUuVGlsaW5nLkhvcml6b250YWw6XHJcbiAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRleHR1cmUudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLmdsLlJFUEVBVClcclxuICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGV4dHVyZS50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1QsIHRoaXMuZ2wuQ0xBTVBfVE9fRURHRSlcclxuXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgVGV4dHVyZS5UaWxpbmcuVmVydGljYWw6XHJcbiAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRleHR1cmUudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLmdsLkNMQU1QX1RPX0VER0UpXHJcbiAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRleHR1cmUudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfV1JBUF9ULCB0aGlzLmdsLlJFUEVBVClcclxuXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuXHJcbiAgICBzd2l0Y2ggKHRleHR1cmUuZmlsdGVyaW5nKSB7XHJcbiAgICAgIGNhc2UgVGV4dHVyZS5GaWx0ZXJpbmcuTm9uZTpcclxuICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGV4dHVyZS50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCB0aGlzLmdsLk5FQVJFU1QpXHJcbiAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRleHR1cmUudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy5nbC5ORUFSRVNUKVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBUZXh0dXJlLkZpbHRlcmluZy5MaW5lYXI6XHJcbiAgICAgICAgdGhpcy5nbC50ZXhQYXJhbWV0ZXJpKHRleHR1cmUudGFyZ2V0LCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5nbC5ORUFSRVNUKVxyXG4gICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0ZXh0dXJlLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIG1pcG1hcHMgPyB0aGlzLmdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCA6IHRoaXMuZ2wuTElORUFSKVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSBUZXh0dXJlLkZpbHRlcmluZy5CaWxpbmVhcjpcclxuICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGV4dHVyZS50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCB0aGlzLmdsLkxJTkVBUilcclxuICAgICAgICB0aGlzLmdsLnRleFBhcmFtZXRlcmkodGV4dHVyZS50YXJnZXQsIHRoaXMuZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBtaXBtYXBzID8gdGhpcy5nbC5MSU5FQVJfTUlQTUFQX05FQVJFU1QgOiB0aGlzLmdsLkxJTkVBUilcclxuXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgVGV4dHVyZS5GaWx0ZXJpbmcuVHJpbGluZWFyOlxyXG4gICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0ZXh0dXJlLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX01BR19GSUxURVIsIHRoaXMuZ2wuTElORUFSKVxyXG4gICAgICAgIHRoaXMuZ2wudGV4UGFyYW1ldGVyaSh0ZXh0dXJlLnRhcmdldCwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIG1pcG1hcHMgPyB0aGlzLmdsLkxJTkVBUl9NSVBNQVBfTElORUFSIDogdGhpcy5nbC5MSU5FQVIpXHJcblxyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50ZXh0dXJlcy5wdXNoKHRleHR1cmUpXHJcblxyXG4gICAgcmV0dXJuIHRleHR1cmVcclxuICB9XHJcblxyXG4gIHVwZGF0ZSh0ZXh0dXJlOiBUZXh0dXJlLCBzb3VyY2U6IGFueSwgeCA9IDAsIHkgPSAwLCB3aWR0aD86IG51bWJlciwgaGVpZ2h0PzogbnVtYmVyKSB7XHJcbiAgICBpZiAod2lkdGggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICB3aWR0aCA9IHRleHR1cmUud2lkdGhcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaGVpZ2h0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgaGVpZ2h0ID0gdGV4dHVyZS53aWR0aFxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYmluZCh0ZXh0dXJlLCAwKVxyXG5cclxuICAgIHRoaXMuZ2wudGV4U3ViSW1hZ2UyRCh0ZXh0dXJlLnRhcmdldCwgMCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dHVyZS5mb3JtYXQsIHRleHR1cmUudHlwZSwgc291cmNlKVxyXG5cclxuICAgIGlmICh0ZXh0dXJlLnVzZU1pcG1hcHMpIHtcclxuICAgICAgdGhpcy5nbC5nZW5lcmF0ZU1pcG1hcCh0ZXh0dXJlLnRhcmdldClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgYmluZCh0ZXh0dXJlOiBUZXh0dXJlLCB1bml0OiBudW1iZXIpIHtcclxuICAgIGlmICh0aGlzLmJvdW5kVGV4dHVyZXNbdW5pdF0gPT09IHRleHR1cmUpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5nbC5hY3RpdmVUZXh0dXJlKHRoaXMuZ2wuVEVYVFVSRTAgKyB1bml0KVxyXG4gICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0ZXh0dXJlLnRhcmdldCwgdGV4dHVyZSlcclxuXHJcbiAgICB0aGlzLmJvdW5kVGV4dHVyZXNbdW5pdF0gPSB0ZXh0dXJlXHJcbiAgfVxyXG5cclxufSIsImltcG9ydCB7IHZlYzQgfSBmcm9tICcuLi8uLi92ZWN0b3JzJ1xyXG5cclxuZXhwb3J0IGNsYXNzIERpc3BsYXkge1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7fVxyXG5cclxuICBzZXQgdmlld3BvcnQodmlld3BvcnQ6IFJlYWRvbmx5PHZlYzQ+KSB7XHJcbiAgICBjb25zdCBbeCwgeSwgeiwgd10gPSB2aWV3cG9ydFxyXG4gICAgdGhpcy5nbC52aWV3cG9ydCh4LCB5LCB6LCB3KVxyXG4gIH1cclxuXHJcbiAgY2xlYXIoY29sb3I6IFJlYWRvbmx5PHZlYzQ+LCBkZXB0aDogbnVtYmVyLCBzdGVuY2lsPzogbnVtYmVyKSB7XHJcbiAgICBsZXQgY2xlYXJNYXNrID0gMFxyXG5cclxuICAgIGlmIChjb2xvciAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMuZ2wuY2xlYXJDb2xvcihjb2xvci54LCBjb2xvci55LCBjb2xvci56LCBjb2xvci53KVxyXG5cclxuICAgICAgY2xlYXJNYXNrIHw9IHRoaXMuZ2wuQ09MT1JfQlVGRkVSX0JJVFxyXG4gICAgfVxyXG5cclxuICAgIGlmIChkZXB0aCAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMuZ2wuY2xlYXJEZXB0aChkZXB0aClcclxuXHJcbiAgICAgIGNsZWFyTWFzayB8PSB0aGlzLmdsLkRFUFRIX0JVRkZFUl9CSVRcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc3RlbmNpbCAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMuZ2wuY2xlYXJTdGVuY2lsKHN0ZW5jaWwpXHJcblxyXG4gICAgICBjbGVhck1hc2sgfD0gdGhpcy5nbC5TVEVOQ0lMX0JVRkZFUl9CSVRcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdsLmNsZWFyKGNsZWFyTWFzaylcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IFZlcnRleEFycmF5IH0gZnJvbSAnLi4vdHlwZXMvdmVydGV4LWFycmF5J1xyXG5cclxuZXhwb3J0IGNsYXNzIE1lc2gge1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHJlYWRvbmx5IHRvcG9sb2d5OiBNZXNoLlRvcG9sb2d5LFxyXG4gICAgcmVhZG9ubHkgdmVydGV4QXJyYXk6IFZlcnRleEFycmF5XHJcbiAgKSB7fVxyXG5cclxufVxyXG5cclxuZXhwb3J0IG1vZHVsZSBNZXNoIHtcclxuXHJcbiAgZXhwb3J0IGVudW0gVG9wb2xvZ3kge1xyXG4gICAgUG9pbnRzID0gJ3BvaW50cycsXHJcblxyXG4gICAgTGluZXMgPSAnbGluZXMnLFxyXG4gICAgTGluZUxvb3AgPSAnbGluZS1sb29wJyxcclxuICAgIExpbmVTdHJpcCA9ICdsaW5lLXN0cmlwJyxcclxuXHJcbiAgICBUcmlhbmdsZXMgPSAndHJpYW5nbGVzJyxcclxuICAgIFRyaWFuZ2xlRmFuID0gJ3RyaWFuZ2xlLWZhbicsXHJcbiAgICBUcmlhbmdsZVN0cmlwID0gJ3RyaWFuZ2xlLXN0cmlwJ1xyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBDYW1lcmEsIExpZ2h0LCBNb2RlbCwgVHJhbnNmb3JtIH0gZnJvbSAnLi4vLi4vY29yZSdcclxuaW1wb3J0IHsgQnVmZmVycyB9IGZyb20gJy4uL21hbmFnZXJzL2J1ZmZlcnMnXHJcbmltcG9ydCB7IE1lc2hlcyB9IGZyb20gJy4uL21hbmFnZXJzL21lc2hlcydcclxuaW1wb3J0IHsgUHJvZ3JhbXMgfSBmcm9tICcuLi9tYW5hZ2Vycy9wcm9ncmFtcydcclxuaW1wb3J0IHsgU2FtcGxlcnMgfSBmcm9tICcuLi9tYW5hZ2Vycy9zYW1wbGVycydcclxuaW1wb3J0IHsgU2hhZGVycyB9IGZyb20gJy4uL21hbmFnZXJzL3NoYWRlcnMnXHJcbmltcG9ydCB7IFRleHR1cmVzIH0gZnJvbSAnLi4vbWFuYWdlcnMvdGV4dHVyZXMnXHJcbmltcG9ydCB7IFByb2dyYW0gfSBmcm9tICcuLi90eXBlcy9wcm9ncmFtJ1xyXG5pbXBvcnQgeyBVbmlmb3JtIH0gZnJvbSAnLi4vdHlwZXMvdW5pZm9ybSdcclxuaW1wb3J0IHsgRGlzcGxheSB9IGZyb20gJy4vZGlzcGxheSdcclxuaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xyXG5cclxuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcclxuXHJcbiAgcmVhZG9ubHkgc2hhZGVyczogU2hhZGVyc1xyXG4gIHJlYWRvbmx5IHByb2dyYW1zOiBQcm9ncmFtc1xyXG5cclxuICByZWFkb25seSBidWZmZXJzOiBCdWZmZXJzXHJcbiAgcmVhZG9ubHkgdGV4dHVyZXM6IFRleHR1cmVzXHJcbiAgcmVhZG9ubHkgc2FtcGxlcnM6IFNhbXBsZXJzXHJcblxyXG4gIHJlYWRvbmx5IHN0YXRlOiBTdGF0ZVxyXG4gIHJlYWRvbmx5IGRpc3BsYXk6IERpc3BsYXlcclxuXHJcbiAgcmVhZG9ubHkgbWVzaGVzOiBNZXNoZXNcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xyXG4gICAgdGhpcy5zaGFkZXJzID0gbmV3IFNoYWRlcnModGhpcy5nbClcclxuICAgIHRoaXMucHJvZ3JhbXMgPSBuZXcgUHJvZ3JhbXModGhpcy5nbClcclxuXHJcbiAgICB0aGlzLmJ1ZmZlcnMgPSBuZXcgQnVmZmVycyh0aGlzLmdsKVxyXG4gICAgdGhpcy50ZXh0dXJlcyA9IG5ldyBUZXh0dXJlcyh0aGlzLmdsKVxyXG4gICAgdGhpcy5zYW1wbGVycyA9IG5ldyBTYW1wbGVycyh0aGlzLmdsKVxyXG5cclxuICAgIHRoaXMuZGlzcGxheSA9IG5ldyBEaXNwbGF5KHRoaXMuZ2wpXHJcbiAgICB0aGlzLnN0YXRlID0gbmV3IFN0YXRlKHRoaXMuZ2wpXHJcblxyXG4gICAgdGhpcy5tZXNoZXMgPSBuZXcgTWVzaGVzKHRoaXMuZ2wpXHJcbiAgfVxyXG5cclxuICByZW5kZXI8VCBleHRlbmRzIHt9PihjYW1lcmE6IENhbWVyYSwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0sIG1vZGVsOiBNb2RlbCwgbGlnaHRzOiBMaWdodFtdLCBwcm9ncmFtOiBQcm9ncmFtLCB1bmlmb3Jtcz86IFQpIHtcclxuICAgIGlmIChjYW1lcmEpIHtcclxuICAgICAgLy8gY2FtZXJhIHVuaWZvcm1zXHJcbiAgICAgIHRoaXMucHJvZ3JhbXMudXBkYXRlKChwcm9ncmFtKSwge1xyXG4gICAgICAgIHVuaWZvcm1zOiB0aGlzLmNvbGxlY3RVbmlmb3JtVmFsdWVzKHByb2dyYW0sIHsgY2FtZXJhIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRyYW5zZm9ybSkge1xyXG4gICAgICAvLyB0cmFuc2Zvcm0gdW5pZm9ybXNcclxuICAgICAgdGhpcy5wcm9ncmFtcy51cGRhdGUoKHByb2dyYW0pLCB7XHJcbiAgICAgICAgdW5pZm9ybXM6IHRoaXMuY29sbGVjdFVuaWZvcm1WYWx1ZXMocHJvZ3JhbSwgeyB0cmFuc2Zvcm0gfSlcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICAvLyBtb2RlbCB1bmlmb3Jtc1xyXG4gICAgdGhpcy5wcm9ncmFtcy51cGRhdGUoKHByb2dyYW0pLCB7XHJcbiAgICAgIHVuaWZvcm1zOiB0aGlzLmNvbGxlY3RVbmlmb3JtVmFsdWVzKHByb2dyYW0sIHsgbW9kZWwgfSlcclxuICAgIH0pXHJcblxyXG4gICAgaWYgKGxpZ2h0cykge1xyXG4gICAgICAvLyBsaWdodCB1bmlmb3Jtc1xyXG4gICAgICB0aGlzLnByb2dyYW1zLnVwZGF0ZSgocHJvZ3JhbSksIHtcclxuICAgICAgICB1bmlmb3JtczogdGhpcy5jb2xsZWN0VW5pZm9ybVZhbHVlcyhwcm9ncmFtLCB7IGxpZ2h0cyB9KVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh1bmlmb3Jtcykge1xyXG4gICAgICAvLyBhZGRpdGlvbmFsIHVuaWZvcm1zXHJcbiAgICAgIHRoaXMucHJvZ3JhbXMudXBkYXRlKChwcm9ncmFtKSwge1xyXG4gICAgICAgIHVuaWZvcm1zOiB0aGlzLmNvbGxlY3RVbmlmb3JtVmFsdWVzKHByb2dyYW0sIHVuaWZvcm1zKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubWVzaGVzLnJlbmRlcihtb2RlbC5tZXNoKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjb2xsZWN0VW5pZm9ybVZhbHVlcyhwcm9ncmFtOiBQcm9ncmFtLCB1bmlmb3JtVmFsdWVzOiBhbnkpIHtcclxuICAgIGNvbnN0IGNvbGxlY3RlZFVuaWZvcm1WYWx1ZXM6IFJlY29yZDxzdHJpbmcsIFVuaWZvcm0uVmFsdWU+ID0ge31cclxuXHJcbiAgICBjb25zdCBjb2xsZWN0UmVjdXJzaXZlbHkgPSAodmFsdWVzOiBhbnksIHByZWZpeD86IHN0cmluZykgPT4ge1xyXG4gICAgICBpZiAodHlwZW9mIHZhbHVlcyAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgT2JqZWN0LmVudHJpZXModmFsdWVzKS5mb3JFYWNoKChbbmFtZSwgdmFsdWVdOiBbc3RyaW5nLCBhbnldKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdW5pZm9ybU5hbWUgPSAocHJlZml4KSA/IGAke3ByZWZpeH0uJHtuYW1lfWAgOiBuYW1lXHJcblxyXG4gICAgICAgIGlmIChwcm9ncmFtLnVuaWZvcm1zLmhhc093blByb3BlcnR5KHVuaWZvcm1OYW1lKSkge1xyXG4gICAgICAgICAgY29sbGVjdGVkVW5pZm9ybVZhbHVlc1t1bmlmb3JtTmFtZV0gPSB2YWx1ZVxyXG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgIHZhbHVlLmZvckVhY2goKGVsZW1lbnQsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbGxlY3RSZWN1cnNpdmVseShlbGVtZW50LCBgJHt1bmlmb3JtTmFtZX1bJHtpbmRleH1dYClcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbGxlY3RSZWN1cnNpdmVseSh2YWx1ZSwgbmFtZSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgY29sbGVjdFJlY3Vyc2l2ZWx5KHVuaWZvcm1WYWx1ZXMpXHJcblxyXG4gICAgcmV0dXJuIGNvbGxlY3RlZFVuaWZvcm1WYWx1ZXNcclxuICB9XHJcblxyXG59IiwiZXhwb3J0IGNsYXNzIFN0YXRlIHtcclxuXHJcbiAgcHJpdmF0ZSBhY3RpdmVDdWxsTW9kZSA9IFN0YXRlLkN1bGxNb2RlLk5vbmVcclxuICBwcml2YXRlIGFjdGl2ZUJsZW5kTW9kZSA9IFN0YXRlLkJsZW5kTW9kZS5Ob25lXHJcbiAgcHJpdmF0ZSBhY3RpdmVEZXB0aFRlc3QgPSBTdGF0ZS5EZXB0aFRlc3QuTm9uZVxyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7fVxyXG5cclxuICBzZXQgY3VsbE1vZGUoY3VsbE1vZGU6IFN0YXRlLkN1bGxNb2RlKSB7XHJcbiAgICBpZiAoY3VsbE1vZGUgPT09IHRoaXMuYWN0aXZlQ3VsbE1vZGUpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGN1bGxNb2RlID09PSBTdGF0ZS5DdWxsTW9kZS5Ob25lKSB7XHJcbiAgICAgIHRoaXMuZ2wuZGlzYWJsZSh0aGlzLmdsLkNVTExfRkFDRSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZ2wuZW5hYmxlKHRoaXMuZ2wuQ1VMTF9GQUNFKVxyXG5cclxuICAgICAgc3dpdGNoIChjdWxsTW9kZSkge1xyXG4gICAgICAgIGNhc2UgU3RhdGUuQ3VsbE1vZGUuRnJvbnQ6XHJcbiAgICAgICAgICB0aGlzLmdsLmN1bGxGYWNlKHRoaXMuZ2wuRlJPTlQpXHJcbiAgICAgICAgICBicmVha1xyXG5cclxuICAgICAgICBjYXNlIFN0YXRlLkN1bGxNb2RlLkJhY2s6XHJcbiAgICAgICAgICB0aGlzLmdsLmN1bGxGYWNlKHRoaXMuZ2wuQkFDSylcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmFjdGl2ZUN1bGxNb2RlID0gY3VsbE1vZGVcclxuICB9XHJcblxyXG4gIHNldCBibGVuZE1vZGUoYmxlbmRNb2RlOiBTdGF0ZS5CbGVuZE1vZGUpIHtcclxuICAgIGlmIChibGVuZE1vZGUgPT09IHRoaXMuYWN0aXZlQmxlbmRNb2RlKSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChibGVuZE1vZGUgPT09IFN0YXRlLkJsZW5kTW9kZS5Ob25lKSB7XHJcbiAgICAgIHRoaXMuZ2wuZGlzYWJsZSh0aGlzLmdsLkJMRU5EKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5nbC5lbmFibGUodGhpcy5nbC5CTEVORClcclxuXHJcbiAgICAgIHN3aXRjaCAoYmxlbmRNb2RlKSB7XHJcbiAgICAgICAgY2FzZSBTdGF0ZS5CbGVuZE1vZGUuQWRkaXRpdmU6XHJcbiAgICAgICAgICB0aGlzLmdsLmJsZW5kRnVuYyh0aGlzLmdsLlNSQ19BTFBIQSwgdGhpcy5nbC5PTkUpXHJcbiAgICAgICAgICBicmVha1xyXG5cclxuICAgICAgICBjYXNlIFN0YXRlLkJsZW5kTW9kZS5UcmFuc3BhcmVudDpcclxuICAgICAgICAgIHRoaXMuZ2wuYmxlbmRGdW5jKHRoaXMuZ2wuU1JDX0FMUEhBLCB0aGlzLmdsLk9ORV9NSU5VU19TUkNfQUxQSEEpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hY3RpdmVCbGVuZE1vZGUgPSBibGVuZE1vZGVcclxuICB9XHJcblxyXG4gIHNldCBkZXB0aFRlc3QoZGVwdGhUZXN0OiBTdGF0ZS5EZXB0aFRlc3QpIHtcclxuICAgIGlmIChkZXB0aFRlc3QgPT09IHRoaXMuYWN0aXZlRGVwdGhUZXN0KSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChkZXB0aFRlc3QgPT09IFN0YXRlLkRlcHRoVGVzdC5Ob25lKSB7XHJcbiAgICAgIHRoaXMuZ2wuZGlzYWJsZSh0aGlzLmdsLkRFUFRIX1RFU1QpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmdsLmVuYWJsZSh0aGlzLmdsLkRFUFRIX1RFU1QpXHJcblxyXG4gICAgICBzd2l0Y2ggKGRlcHRoVGVzdCkge1xyXG4gICAgICAgIGNhc2UgU3RhdGUuRGVwdGhUZXN0Lk5ldmVyOlxyXG4gICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5ORVZFUilcclxuICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgIGNhc2UgU3RhdGUuRGVwdGhUZXN0LkFsd2F5czpcclxuICAgICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHRoaXMuZ2wuQUxXQVlTKVxyXG4gICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgY2FzZSBTdGF0ZS5EZXB0aFRlc3QuRXF1YWw6XHJcbiAgICAgICAgICB0aGlzLmdsLmRlcHRoRnVuYyh0aGlzLmdsLkVRVUFMKVxyXG4gICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgY2FzZSBTdGF0ZS5EZXB0aFRlc3QuTm90RXF1YWw6XHJcbiAgICAgICAgICB0aGlzLmdsLmRlcHRoRnVuYyh0aGlzLmdsLk5PVEVRVUFMKVxyXG4gICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgY2FzZSBTdGF0ZS5EZXB0aFRlc3QuTGVzczpcclxuICAgICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHRoaXMuZ2wuTEVTUylcclxuICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgIGNhc2UgU3RhdGUuRGVwdGhUZXN0Lkxlc3NFcXVhbDpcclxuICAgICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHRoaXMuZ2wuTEVRVUFMKVxyXG4gICAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgICAgY2FzZSBTdGF0ZS5EZXB0aFRlc3QuR3JlYXRlcjpcclxuICAgICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHRoaXMuZ2wuR1JFQVRFUilcclxuICAgICAgICAgIGJyZWFrXHJcblxyXG4gICAgICAgIGNhc2UgU3RhdGUuRGVwdGhUZXN0LkdyZWF0ZXJFcXVhbDpcclxuICAgICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHRoaXMuZ2wuR0VRVUFMKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWN0aXZlRGVwdGhUZXN0ID0gZGVwdGhUZXN0XHJcbiAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IG1vZHVsZSBTdGF0ZSB7XHJcblxyXG4gIGV4cG9ydCBlbnVtIEN1bGxNb2RlIHtcclxuICAgIE5vbmUsXHJcbiAgXHJcbiAgICBGcm9udCxcclxuICAgIEJhY2tcclxuICB9XHJcblxyXG4gIGV4cG9ydCBlbnVtIEJsZW5kTW9kZSB7XHJcbiAgICBOb25lLFxyXG4gIFxyXG4gICAgQWRkaXRpdmUsXHJcbiAgICBUcmFuc3BhcmVudFxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGVudW0gRGVwdGhUZXN0IHtcclxuICAgIE5vbmUsXHJcbiAgXHJcbiAgICBOZXZlcixcclxuICAgIEFsd2F5cyxcclxuICBcclxuICAgIEVxdWFsLFxyXG4gICAgTm90RXF1YWwsXHJcbiAgXHJcbiAgICBMZXNzLFxyXG4gICAgTGVzc0VxdWFsLFxyXG4gIFxyXG4gICAgR3JlYXRlcixcclxuICAgIEdyZWF0ZXJFcXVhbFxyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBGcmFtZUJ1ZmZlciB9IGZyb20gJy4uL2J1ZmZlcnMvZnJhbWUtYnVmZmVyJ1xyXG5pbXBvcnQgeyBSZW5kZXJCdWZmZXIgfSBmcm9tICcuLi9idWZmZXJzL3JlbmRlci1idWZmZXInXHJcbmltcG9ydCB7IFVuaWZvcm1CdWZmZXIgfSBmcm9tICcuLi9idWZmZXJzL3VuaWZvcm0tYnVmZmVyJ1xyXG5cclxuZXhwb3J0IHR5cGUgQnVmZmVyID0gRnJhbWVCdWZmZXIgfCBSZW5kZXJCdWZmZXIgfCBVbmlmb3JtQnVmZmVyXHJcblxyXG5leHBvcnQgbW9kdWxlIEJ1ZmZlciB7XHJcblxyXG4gIGV4cG9ydCBlbnVtIFRhcmdldCB7XHJcbiAgICBGcmFtZUJ1ZmZlcixcclxuICAgIFJlbmRlckJ1ZmZlcixcclxuICAgIFVuaWZvcm1CdWZmZXJcclxuICB9XHJcbiAgXHJcbn0iLCJleHBvcnQgdHlwZSBTaGFkZXIgPSBXZWJHTFNoYWRlciAmIHtcclxuICBjb21waWxlZDogYm9vbGVhblxyXG59XHJcblxyXG5leHBvcnQgbW9kdWxlIFNoYWRlciB7XHJcblxyXG4gIGV4cG9ydCBlbnVtIFN0YWdlIHtcclxuICAgIFZlcnRleFNoYWRlcixcclxuICAgIEZyYWdtZW50U2hhZGVyXHJcbiAgfVxyXG4gIFxyXG59IiwiZXhwb3J0IHR5cGUgVGV4dHVyZSA9IFdlYkdMVGV4dHVyZSAmIHtcclxuICB0YXJnZXQ6IG51bWJlclxyXG5cclxuICBmb3JtYXQ6IG51bWJlclxyXG4gIHR5cGU6IG51bWJlclxyXG5cclxuICB3aWR0aDogbnVtYmVyXHJcbiAgaGVpZ2h0OiBudW1iZXJcclxuXHJcbiAgdGlsaW5nOiBUZXh0dXJlLlRpbGluZ1xyXG4gIGZpbHRlcmluZzogVGV4dHVyZS5GaWx0ZXJpbmdcclxuXHJcbiAgdXNlTWlwbWFwczogYm9vbGVhblxyXG59XHJcblxyXG5leHBvcnQgbW9kdWxlIFRleHR1cmUge1xyXG5cclxuICBleHBvcnQgZW51bSBUaWxpbmcge1xyXG4gICAgTm9uZSxcclxuICBcclxuICAgIEJvdGgsXHJcbiAgXHJcbiAgICBIb3Jpem9udGFsLFxyXG4gICAgVmVydGljYWxcclxuICB9XHJcblxyXG4gIGV4cG9ydCBlbnVtIEZpbHRlcmluZyB7XHJcbiAgICBOb25lLFxyXG4gICAgTGluZWFyLFxyXG4gICAgQmlsaW5lYXIsXHJcbiAgICBUcmlsaW5lYXJcclxuICB9XHJcbiAgXHJcbn1cclxuXHJcbiIsImV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb2xsaWRlciB7XHJcblxyXG4gIGFic3RyYWN0IHJlYWRvbmx5IHR5cGU6IENvbGxpZGVyLlR5cGVcclxuXHJcbn1cclxuXHJcbmV4cG9ydCBtb2R1bGUgQ29sbGlkZXIge1xyXG5cclxuICBleHBvcnQgZW51bSBUeXBlIHtcclxuICAgIFJheSA9ICdyYXknLFxyXG4gICAgUGxhbmUgPSAncGxhbmUnLFxyXG4gICAgU3BoZXJlID0gJ3NwaGVyZScsXHJcbiAgICBDdWJvaWQgPSAnY3Vib2lkJ1xyXG4gIH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJy4uLy4uL3ZlY3RvcnMnXHJcbmltcG9ydCB7IENvbGxpZGVyIH0gZnJvbSAnLi4vY29sbGlkZXInXHJcblxyXG5leHBvcnQgY2xhc3MgUGxhbmUgZXh0ZW5kcyBDb2xsaWRlciB7XHJcblxyXG4gIHR5cGUgPSBDb2xsaWRlci5UeXBlLlBsYW5lXHJcblxyXG4gIHJlYWRvbmx5IG5vcm1hbDogUmVhZG9ubHk8dmVjMz5cclxuXHJcbiAgcmVhZG9ubHkgZGlzdGFuY2U6IG51bWJlclxyXG5cclxuICBjb25zdHJ1Y3Rvcih7XHJcbiAgICBub3JtYWwgPSB2ZWMzLnVwLFxyXG4gICAgZGlzdGFuY2UgPSAwXHJcbiAgfSA9IHt9KSB7XHJcbiAgICBzdXBlcigpXHJcblxyXG4gICAgdGhpcy5ub3JtYWwgPSBub3JtYWwuY29weSgpXHJcblxyXG4gICAgdGhpcy5kaXN0YW5jZSA9IGRpc3RhbmNlXHJcbiAgfVxyXG5cclxuICB0b0pTT04oKSB7XHJcbiAgICBjb25zdCB7IG5vcm1hbCwgZGlzdGFuY2UgfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4geyBub3JtYWwsIGRpc3RhbmNlIH1cclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICcuLi8uLi92ZWN0b3JzJ1xyXG5pbXBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4uL2NvbGxpZGVyJ1xyXG5cclxuZXhwb3J0IGNsYXNzIFJheSBleHRlbmRzIENvbGxpZGVyIHtcclxuXHJcbiAgdHlwZSA9IENvbGxpZGVyLlR5cGUuUmF5XHJcblxyXG4gIHJlYWRvbmx5IG9yaWdpbjogUmVhZG9ubHk8dmVjMz5cclxuXHJcbiAgcmVhZG9ubHkgZGlyZWN0aW9uOiBSZWFkb25seTx2ZWMzPlxyXG5cclxuICBjb25zdHJ1Y3Rvcih7XHJcbiAgICBvcmlnaW4gPSB2ZWMzLnplcm8sXHJcbiAgICBkaXJlY3Rpb24gPSB2ZWMzLnVwXHJcbiAgfSkge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIHRoaXMub3JpZ2luID0gb3JpZ2luLmNvcHkoKVxyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb24uY29weSgpLm5vcm1hbGl6ZSgpXHJcbiAgfVxyXG5cclxuICB0b0pTT04oKSB7XHJcbiAgICBjb25zdCB7IG9yaWdpbiwgZGlyZWN0aW9uIH0gPSB0aGlzXHJcblxyXG4gICAgcmV0dXJuIHsgb3JpZ2luLCBkaXJlY3Rpb24gfVxyXG4gIH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IHsgRXBzaWxvbiwgdmVjMyB9IGZyb20gJy4uLy4uLy4uL3ZlY3RvcnMnXHJcbmltcG9ydCB7IENvbGxpc2lvbiB9IGZyb20gJy4uLy4uL2NvbGxpc2lvbidcclxuaW1wb3J0IHsgQ3Vib2lkIH0gZnJvbSAnLi4vLi4vdm9sdW1lcy9jdWJvaWQnXHJcblxyXG5jb25zdCB7IG1pbiwgbWF4IH0gPSBNYXRoXHJcblxyXG5leHBvcnQgY29uc3QgY29sbGlkZUN1Ym9pZFdpdGhDdWJvaWQgPSAoY3Vib2lkMTogQ3Vib2lkLCBjdWJvaWQyOiBDdWJvaWQpOiBDb2xsaXNpb24gfCBudWxsID0+IHtcclxuICBjb25zdCB7IGNlbnRlcjogYzEsIGV4dGVudHM6IGUxIH0gPSBjdWJvaWQxXHJcbiAgY29uc3QgeyBjZW50ZXI6IGMyLCBleHRlbnRzOiBlMiB9ID0gY3Vib2lkMlxyXG5cclxuICBsZXQgbjogdmVjMyB8IG51bGwgPSBudWxsXHJcbiAgbGV0IGQgPSBJbmZpbml0eVxyXG5cclxuICBjb25zdCB0ZXN0QXhpcyA9IChheGlzOiB2ZWMzKSA9PiB7XHJcbiAgICBpZiAoYXhpcy5sZW5ndGggPCBFcHNpbG9uKSB7XHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeCA9IHZlYzMuYWJzb2x1dGUoYXhpcylcclxuXHJcbiAgICBjb25zdCBtMSA9IFtcclxuICAgICAgdmVjMy5kb3QoYzEsIGF4aXMpIC0gdmVjMy5kb3QoZTEsIHgpLFxyXG4gICAgICB2ZWMzLmRvdChjMSwgYXhpcykgKyB2ZWMzLmRvdChlMSwgeClcclxuICAgIF1cclxuXHJcbiAgICBjb25zdCBtMiA9IFtcclxuICAgICAgdmVjMy5kb3QoYzIsIGF4aXMpIC0gdmVjMy5kb3QoZTIsIHgpLFxyXG4gICAgICB2ZWMzLmRvdChjMiwgYXhpcykgKyB2ZWMzLmRvdChlMiwgeClcclxuICAgIF1cclxuXHJcbiAgICBpZiAobTFbMV0gPCBtMlswXSB8fCBtMlsxXSA8IG0xWzBdKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG8gPSBtaW4obTFbMV0sIG0yWzFdKSAtIG1heChtMVswXSwgbTJbMF0pXHJcblxyXG4gICAgaWYgKG8gPCBkKSB7XHJcbiAgICAgIGQgPSBvXHJcbiAgICAgIG4gPSBheGlzXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWVcclxuICB9XHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDM7IGorKykge1xyXG4gICAgICBjb25zdCBheGlzID0gdmVjMy5jcm9zcyhcclxuICAgICAgICBjdWJvaWQxLmF4ZXNbaV0sXHJcbiAgICAgICAgY3Vib2lkMi5heGVzW2pdXHJcbiAgICAgIClcclxuXHJcbiAgICAgIGlmICghdGVzdEF4aXMoYXhpcykpIHtcclxuICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xyXG4gICAgaWYgKCF0ZXN0QXhpcyhjdWJvaWQxLmF4ZXNbaV0pKSB7XHJcbiAgICAgIHJldHVybiBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0ZXN0QXhpcyhjdWJvaWQyLmF4ZXNbaV0pKSB7XHJcbiAgICAgIHJldHVybiBudWxsXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBwID0gdmVjMy5hZGQoYzEsIGMyKS5zY2FsZSgwLjUpXHJcblxyXG4gIHJldHVybiB7IG5vcm1hbDogbiwgY29udGFjdDogcCwgZGlzdGFuY2U6IGQgfVxyXG59IiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJy4uLy4uLy4uL3ZlY3RvcnMnXHJcbmltcG9ydCB7IFBsYW5lIH0gZnJvbSAnLi4vLi4vY29sbGlkZXJzL3BsYW5lJ1xyXG5pbXBvcnQgeyBDb2xsaXNpb24gfSBmcm9tICcuLi8uLi9jb2xsaXNpb24nXHJcbmltcG9ydCB7IEN1Ym9pZCB9IGZyb20gJy4uLy4uL3ZvbHVtZXMvY3Vib2lkJ1xyXG5cclxuY29uc3QgeyBhYnMgfSA9IE1hdGhcclxuXHJcbmV4cG9ydCBjb25zdCBjb2xsaWRlUGxhbmVXaXRoQ3Vib2lkID0gKHBsYW5lOiBQbGFuZSwgY3Vib2lkOiBDdWJvaWQpOiBDb2xsaXNpb24gfCBudWxsID0+IHtcclxuICBjb25zdCB7IG5vcm1hbDogbiwgZGlzdGFuY2U6IGQgfSA9IHBsYW5lXHJcbiAgY29uc3QgeyBjZW50ZXI6IGMsIGV4dGVudHM6IGUgfSA9IGN1Ym9pZFxyXG5cclxuICBjb25zdCBzID0gdmVjMy5kb3QobiwgYykgLSBkXHJcblxyXG4gIGNvbnN0IHQgPSBhYnMocylcclxuXHJcbiAgY29uc3QgZiA9IGFicyhuLnggKiBlLngpICsgYWJzKG4ueSAqIGUueSkgKyBhYnMobi56ICogZS56KVxyXG5cclxuICBpZiAodCA+IGYpIHtcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICBjb25zdCBwID0gdmVjMy5zdWJ0cmFjdChjLCB2ZWMzLnNjYWxlKG4sIGYpKVxyXG5cclxuICByZXR1cm4geyBjb250YWN0OiBwLCBub3JtYWw6IG4sIGRpc3RhbmNlOiB0IC0gZiB9XHJcbn0iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vLi4vLi4vdmVjdG9ycydcclxuaW1wb3J0IHsgUGxhbmUgfSBmcm9tICcuLi8uLi9jb2xsaWRlcnMvcGxhbmUnXHJcbmltcG9ydCB7IENvbGxpc2lvbiB9IGZyb20gJy4uLy4uL2NvbGxpc2lvbidcclxuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSAnLi4vLi4vdm9sdW1lcy9zcGhlcmUnXHJcblxyXG5jb25zdCB7IGFicyB9ID0gTWF0aFxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbGxpZGVQbGFuZVdpdGhTcGhlcmUgPSAocGxhbmU6IFBsYW5lLCBzcGhlcmU6IFNwaGVyZSk6IENvbGxpc2lvbiB8IG51bGwgPT4ge1xyXG4gIGNvbnN0IHsgbm9ybWFsOiBuLCBkaXN0YW5jZTogZCB9ID0gcGxhbmVcclxuICBjb25zdCB7IGNlbnRlcjogYywgcmFkaXVzOiByIH0gPSBzcGhlcmVcclxuXHJcbiAgY29uc3QgcyA9IHZlYzMuZG90KG4sIGMpICsgZFxyXG5cclxuICBjb25zdCB0ID0gYWJzKHMpXHJcblxyXG4gIGlmICh0ID4gcikge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IGUgPSByIC0gdFxyXG4gIGNvbnN0IGYgPSB2ZWMzLnNjYWxlKG4sIGUpXHJcblxyXG4gIGNvbnN0IHAgPSAocyA8IDApID8gdmVjMy5zdWJ0cmFjdChjLCBmKSA6IHZlYzMuYWRkKGMsIGYpXHJcblxyXG4gIHJldHVybiB7IGNvbnRhY3Q6IHAsIG5vcm1hbDogbiwgZGlzdGFuY2U6IHQgfVxyXG59XHJcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICcuLi8uLi8uLi92ZWN0b3JzJ1xyXG5pbXBvcnQgeyBSYXkgfSBmcm9tICcuLi8uLi9jb2xsaWRlcnMvcmF5J1xyXG5pbXBvcnQgeyBDb2xsaXNpb24gfSBmcm9tICcuLi8uLi9jb2xsaXNpb24nXHJcbmltcG9ydCB7IEN1Ym9pZCB9IGZyb20gJy4uLy4uL3ZvbHVtZXMvY3Vib2lkJ1xyXG5cclxuY29uc3QgeyBtaW4sIG1heCB9ID0gTWF0aFxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbGxpZGVSYXlXaXRoQ3Vib2lkID0gKHJheTogUmF5LCBjdWJvaWQ6IEN1Ym9pZCk6IENvbGxpc2lvbiB8IG51bGwgPT4ge1xyXG4gIGNvbnN0IHsgb3JpZ2luOiBvLCBkaXJlY3Rpb246IG4gfSA9IHJheVxyXG4gIGNvbnN0IHsgY2VudGVyOiBjLCBleHRlbnRzOiBlIH0gPSBjdWJvaWRcclxuICBcclxuICBjb25zdCBtYXhpbXVtID0gdmVjMy5hZGQoYywgZSlcclxuICBjb25zdCBtaW5pbXVtID0gdmVjMy5zdWJ0cmFjdChjLCBlKVxyXG5cclxuICBjb25zdCBzMSA9IHZlYzMuc3VidHJhY3QobWluaW11bSwgbykuZGl2aWRlKG4pXHJcbiAgY29uc3QgczIgPSB2ZWMzLnN1YnRyYWN0KG1heGltdW0sIG8pLmRpdmlkZShuKVxyXG5cclxuICBjb25zdCBtMSA9IG1heChtaW4oczEueCwgczIueCksIG1pbihzMS55LCBzMi55KSwgbWluKHMxLnosIHMyLnopKVxyXG4gIGNvbnN0IG0yID0gbWluKG1heChzMS54LCBzMi54KSwgbWF4KHMxLnksIHMyLnkpLCBtYXgoczEueiwgczIueikpXHJcblxyXG4gIGlmIChtMiA8IDAgfHwgbTEgPiBtMikge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IGQgPSAobTEgPCAwKSA/IG0yIDogbTFcclxuXHJcbiAgY29uc3QgcCA9IHZlYzMuYWRkKG8sIG4pLnNjYWxlKGQpXHJcblxyXG4gIHJldHVybiB7IGNvbnRhY3Q6IHAsIG5vcm1hbDogbiwgZGlzdGFuY2U6IGQgfVxyXG59IiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJy4uLy4uLy4uL3ZlY3RvcnMnXHJcbmltcG9ydCB7IFBsYW5lIH0gZnJvbSAnLi4vLi4vY29sbGlkZXJzL3BsYW5lJ1xyXG5pbXBvcnQgeyBSYXkgfSBmcm9tICcuLi8uLi9jb2xsaWRlcnMvcmF5J1xyXG5pbXBvcnQgeyBDb2xsaXNpb24gfSBmcm9tICcuLi8uLi9jb2xsaXNpb24nXHJcblxyXG5leHBvcnQgY29uc3QgY29sbGlkZVJheVdpdGhQbGFuZSA9IChyYXk6IFJheSwgcGxhbmU6IFBsYW5lKTogQ29sbGlzaW9uIHwgbnVsbCA9PiB7XHJcbiAgY29uc3QgeyBub3JtYWw6IG4sIGRpc3RhbmNlOiBkIH0gPSBwbGFuZVxyXG4gIGNvbnN0IHsgb3JpZ2luOiBvLCBkaXJlY3Rpb246IGUgfSA9IHJheVxyXG5cclxuICBjb25zdCBzID0gdmVjMy5kb3QoZSwgbilcclxuXHJcbiAgaWYgKHMgPT09IDApIHtcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICBjb25zdCB0ID0gKGQgLSB2ZWMzLmRvdChvLCBuKSkgLyBzXHJcblxyXG4gIGlmICh0IDwgMCkge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IHAgPSB2ZWMzLmFkZChvLCB2ZWMzLnNjYWxlKGUsIHQpKVxyXG5cclxuICByZXR1cm4geyBjb250YWN0OiBwLCBub3JtYWw6IG4sIGRpc3RhbmNlOiB0IH1cclxufSIsImltcG9ydCB7IHZlYzMgfSBmcm9tICcuLi8uLi8uLi92ZWN0b3JzJ1xyXG5pbXBvcnQgeyBSYXkgfSBmcm9tICcuLi8uLi9jb2xsaWRlcnMvcmF5J1xyXG5pbXBvcnQgeyBDb2xsaXNpb24gfSBmcm9tICcuLi8uLi9jb2xsaXNpb24nXHJcblxyXG5leHBvcnQgY29uc3QgY29sbGlkZVJheVdpdGhSYXkgPSAocmF5MTogUmF5LCByYXkyOiBSYXkpOiBDb2xsaXNpb24gfCBudWxsID0+IHtcclxuICBjb25zdCB7IGRpcmVjdGlvbjogZDEsIG9yaWdpbjogbzEgfSA9IHJheTFcclxuICBjb25zdCB7IGRpcmVjdGlvbjogZDIsIG9yaWdpbjogbzIgfSA9IHJheTJcclxuXHJcbiAgY29uc3QgYyA9IHZlYzMuY3Jvc3MoZDEsIGQyKVxyXG4gIGNvbnN0IGQgPSB2ZWMzLmRvdChjLCBjKVxyXG5cclxuICBpZiAoZCA9PT0gMCkge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IGYgPSB2ZWMzLnN1YnRyYWN0KG8yLCBvMSlcclxuXHJcbiAgY29uc3QgdSA9IHZlYzMuY3Jvc3MoYywgZikuc2NhbGUoMSAvIGQpXHJcbiAgY29uc3QgdCA9IHZlYzMuZG90KHZlYzMuY3Jvc3MoZiwgZDIpLCBjKSAvIGRcclxuXHJcbiAgaWYgKHQgPCAwIHx8IHQgPiAxKSB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxuXHJcbiAgY29uc3QgYzEgPSB2ZWMzLmFkZChvMSwgdmVjMy5zY2FsZShkMSwgdCkpXHJcbiAgY29uc3QgYzIgPSB2ZWMzLmFkZChvMiwgdmVjMy5zY2FsZShkMiwgdS56KSlcclxuXHJcbiAgY29uc3Qgbm9ybWFsID0gdmVjMy5zdWJ0cmFjdChjMSwgYzIpLm5vcm1hbGl6ZSgpXHJcbiAgY29uc3QgZGlzdGFuY2UgPSB2ZWMzLmRvdCh2ZWMzLnN1YnRyYWN0KGMxLCBvMSksIGQxKVxyXG5cclxuICByZXR1cm4geyBjb250YWN0OiBjMSwgbm9ybWFsLCBkaXN0YW5jZSB9XHJcbn0iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vLi4vLi4vdmVjdG9ycydcclxuaW1wb3J0IHsgUmF5IH0gZnJvbSAnLi4vLi4vY29sbGlkZXJzL3JheSdcclxuaW1wb3J0IHsgQ29sbGlzaW9uIH0gZnJvbSAnLi4vLi4vY29sbGlzaW9uJ1xyXG5pbXBvcnQgeyBTcGhlcmUgfSBmcm9tICcuLi8uLi92b2x1bWVzL3NwaGVyZSdcclxuXHJcbmNvbnN0IHsgc3FydCB9ID0gTWF0aFxyXG5cclxuZXhwb3J0IGNvbnN0IGNvbGxpZGVSYXlXaXRoU3BoZXJlID0gKHJheTogUmF5LCBzcGhlcmU6IFNwaGVyZSk6IENvbGxpc2lvbiB8IG51bGwgPT4ge1xyXG4gIGNvbnN0IHsgb3JpZ2luOiBvLCBkaXJlY3Rpb246IGUgfSA9IHJheVxyXG4gIGNvbnN0IHsgY2VudGVyOiBjLCByYWRpdXM6IHIgfSA9IHNwaGVyZVxyXG5cclxuICBjb25zdCByMiA9IHIgKiByXHJcblxyXG4gIGNvbnN0IHMgPSB2ZWMzLnN1YnRyYWN0KGMsIG8pXHJcbiAgY29uc3QgdCA9IHZlYzMuZG90KGUsIHMpXHJcblxyXG4gIGlmICh0IDwgMCkge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IGQyID0gcy5zcXVhcmVkTGVuZ3RoIC0gKHQgKiB0KVxyXG5cclxuICBpZiAoZDIgPiByMikge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IGQgPSB0IC0gc3FydChyMiAtIGQyKVxyXG5cclxuICBjb25zdCBwID0gdmVjMy5hZGQobywgdmVjMy5zY2FsZShlLCBkKSlcclxuICBjb25zdCBuID0gdmVjMy5zdWJ0cmFjdChwLCBjKS5ub3JtYWxpemUoKVxyXG5cclxuICByZXR1cm4geyBjb250YWN0OiBwLCBub3JtYWw6IG4sIGRpc3RhbmNlOiBkIH1cclxufSIsImltcG9ydCB7IHZlYzMgfSBmcm9tICcuLi8uLi8uLi92ZWN0b3JzJ1xyXG5pbXBvcnQgeyBDb2xsaXNpb24gfSBmcm9tICcuLi8uLi9jb2xsaXNpb24nXHJcbmltcG9ydCB7IEN1Ym9pZCB9IGZyb20gJy4uLy4uL3ZvbHVtZXMvY3Vib2lkJ1xyXG5pbXBvcnQgeyBTcGhlcmUgfSBmcm9tICcuLi8uLi92b2x1bWVzL3NwaGVyZSdcclxuXHJcbmNvbnN0IHsgc3FydCwgbWluLCBtYXggfSA9IE1hdGhcclxuXHJcbmV4cG9ydCBjb25zdCBjb2xsaWRlU3BoZXJlV2l0aEN1Ym9pZCA9IChzcGhlcmU6IFNwaGVyZSwgY3Vib2lkOiBDdWJvaWQpOiBDb2xsaXNpb24gfCBudWxsID0+IHtcclxuICBjb25zdCB7IGNlbnRlcjogYzEsIHJhZGl1czogciB9ID0gc3BoZXJlXHJcbiAgY29uc3QgeyBjZW50ZXI6IGMyLCBleHRlbnRzOiBlIH0gPSBjdWJvaWRcclxuICBcclxuICBjb25zdCByMiA9IHIgKiByXHJcblxyXG4gIGNvbnN0IG0xID0gdmVjMy5hZGQoYzIsIGUpXHJcbiAgY29uc3QgbTIgPSB2ZWMzLnN1YnRyYWN0KGMyLCBlKVxyXG5cclxuICBjb25zdCBtID0gbmV3IHZlYzMoW1xyXG4gICAgbWF4KG0yLngsIG1pbihjMS54LCBtMS54KSksXHJcbiAgICBtYXgobTIueSwgbWluKGMxLnksIG0xLnkpKSxcclxuICAgIG1heChtMi56LCBtaW4oYzEueiwgbTEueikpXHJcbiAgXSlcclxuXHJcbiAgY29uc3QgZDEgPSB2ZWMzLnN1YnRyYWN0KG0sIGMxKVxyXG4gIGNvbnN0IGQyID0gdmVjMy5kb3QoZDEsIGQxKVxyXG5cclxuICBpZiAoZDIgPiByMikge1xyXG4gICAgcmV0dXJuIG51bGxcclxuICB9XHJcblxyXG4gIGNvbnN0IG4gPSB2ZWMzLm5vcm1hbGl6ZShkMSlcclxuICBjb25zdCBwID0gdmVjMy5hZGQoYzEsIHZlYzMuc2NhbGUobiwgcikpXHJcblxyXG4gIHJldHVybiB7IGNvbnRhY3Q6IHAsIG5vcm1hbDogbiwgZGlzdGFuY2U6IHNxcnQocjIgLSBkMikgfVxyXG59IiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJy4uLy4uLy4uL3ZlY3RvcnMnXHJcbmltcG9ydCB7IENvbGxpc2lvbiB9IGZyb20gJy4uLy4uL2NvbGxpc2lvbidcclxuaW1wb3J0IHsgU3BoZXJlIH0gZnJvbSAnLi4vLi4vdm9sdW1lcy9zcGhlcmUnXHJcblxyXG5leHBvcnQgY29uc3QgY29sbGlkZVNwaGVyZVdpdGhTcGhlcmUgPSAoczE6IFNwaGVyZSwgczI6IFNwaGVyZSk6IENvbGxpc2lvbiB8IG51bGwgPT4ge1xyXG4gIGNvbnN0IHsgY2VudGVyOiBjMSwgcmFkaXVzOiByMSB9ID0gczFcclxuICBjb25zdCB7IGNlbnRlcjogYzIsIHJhZGl1czogcjIgfSA9IHMyXHJcblxyXG4gIGNvbnN0IGQgPSB2ZWMzLnN1YnRyYWN0KGMyLCBjMSlcclxuXHJcbiAgY29uc3QgZDIgPSBkLnNxdWFyZWRMZW5ndGhcclxuXHJcbiAgY29uc3QgcyA9IHIxICsgcjJcclxuXHJcbiAgaWYgKGQyID4gcyAqIHMpIHtcclxuICAgIHJldHVybiBudWxsXHJcbiAgfVxyXG5cclxuICBjb25zdCB0ID0gTWF0aC5zcXJ0KGQyKVxyXG5cclxuICBjb25zdCBuID0gZC5ub3JtYWxpemUoKVxyXG4gIGNvbnN0IHAgPSB2ZWMzLmFkZChjMSwgdmVjMy5zY2FsZShuLCByMSkpXHJcblxyXG4gIHJldHVybiB7IGNvbnRhY3Q6IHAsIG5vcm1hbDogbiwgZGlzdGFuY2U6IHQgLSBzIH1cclxufSIsImltcG9ydCB7IERpc3BhdGNoZXIgfSBmcm9tICcuLi8uLi91dGlsaXRpZXMnXHJcbmltcG9ydCB7IENvbGxpZGVyIH0gZnJvbSAnLi4vY29sbGlkZXInXHJcbmltcG9ydCB7IENvbGxpc2lvbiB9IGZyb20gJy4uL2NvbGxpc2lvbidcclxuaW1wb3J0IHsgY29sbGlkZUN1Ym9pZFdpdGhDdWJvaWQgfSBmcm9tICcuLi9jb2xsaXNpb25zL2N1Ym9pZC9jdWJvaWQnXHJcbmltcG9ydCB7IGNvbGxpZGVQbGFuZVdpdGhDdWJvaWQgfSBmcm9tICcuLi9jb2xsaXNpb25zL3BsYW5lL2N1Ym9pZCdcclxuaW1wb3J0IHsgY29sbGlkZVBsYW5lV2l0aFNwaGVyZSB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcGxhbmUvc3BoZXJlJ1xyXG5pbXBvcnQgeyBjb2xsaWRlUmF5V2l0aEN1Ym9pZCB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcmF5L2N1Ym9pZCdcclxuaW1wb3J0IHsgY29sbGlkZVJheVdpdGhQbGFuZSB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcmF5L3BsYW5lJ1xyXG5pbXBvcnQgeyBjb2xsaWRlUmF5V2l0aFJheSB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcmF5L3JheSdcclxuaW1wb3J0IHsgY29sbGlkZVJheVdpdGhTcGhlcmUgfSBmcm9tICcuLi9jb2xsaXNpb25zL3JheS9zcGhlcmUnXHJcbmltcG9ydCB7IGNvbGxpZGVTcGhlcmVXaXRoQ3Vib2lkIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9zcGhlcmUvY3Vib2lkJ1xyXG5pbXBvcnQgeyBjb2xsaWRlU3BoZXJlV2l0aFNwaGVyZSB9IGZyb20gJy4uL2NvbGxpc2lvbnMvc3BoZXJlL3NwaGVyZSdcclxuXHJcbmNvbnN0IHsgVHlwZSB9ID0gQ29sbGlkZXJcclxuXHJcbmV4cG9ydCBjbGFzcyBDb2xsaXNpb25EaXNwYXRjaGVyIGV4dGVuZHMgRGlzcGF0Y2hlcjxDb2xsaWRlciwgQ29sbGlzaW9uPiB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIC8vIHJheVxyXG4gICAgdGhpcy5yZWdpc3RlcihUeXBlLlJheSwgVHlwZS5SYXksIGNvbGxpZGVSYXlXaXRoUmF5KVxyXG4gICAgdGhpcy5yZWdpc3RlcihUeXBlLlJheSwgVHlwZS5QbGFuZSwgY29sbGlkZVJheVdpdGhQbGFuZSlcclxuICAgIHRoaXMucmVnaXN0ZXIoVHlwZS5SYXksIFR5cGUuU3BoZXJlLCBjb2xsaWRlUmF5V2l0aFNwaGVyZSlcclxuICAgIHRoaXMucmVnaXN0ZXIoVHlwZS5SYXksIFR5cGUuQ3Vib2lkLCBjb2xsaWRlUmF5V2l0aEN1Ym9pZClcclxuXHJcbiAgICAvLyBwbGFuZVxyXG4gICAgdGhpcy5yZWdpc3RlcihUeXBlLlBsYW5lLCBUeXBlLlNwaGVyZSwgY29sbGlkZVBsYW5lV2l0aFNwaGVyZSlcclxuICAgIHRoaXMucmVnaXN0ZXIoVHlwZS5QbGFuZSwgVHlwZS5DdWJvaWQsIGNvbGxpZGVQbGFuZVdpdGhDdWJvaWQpXHJcblxyXG4gICAgLy8gc3BoZXJlXHJcbiAgICB0aGlzLnJlZ2lzdGVyKFR5cGUuU3BoZXJlLCBUeXBlLlNwaGVyZSwgY29sbGlkZVNwaGVyZVdpdGhTcGhlcmUpXHJcbiAgICB0aGlzLnJlZ2lzdGVyKFR5cGUuU3BoZXJlLCBUeXBlLkN1Ym9pZCwgY29sbGlkZVNwaGVyZVdpdGhDdWJvaWQpXHJcblxyXG4gICAgLy8gY3Vib2lkXHJcbiAgICB0aGlzLnJlZ2lzdGVyKFR5cGUuQ3Vib2lkLCBUeXBlLkN1Ym9pZCwgY29sbGlkZUN1Ym9pZFdpdGhDdWJvaWQpXHJcbiAgfVxyXG5cclxufSIsImV4cG9ydCB7IFZvbHVtZSB9IGZyb20gJy4vdm9sdW1lJ1xyXG5leHBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4vY29sbGlkZXInXHJcbmV4cG9ydCB7IENvbGxpc2lvbiB9IGZyb20gJy4vY29sbGlzaW9uJ1xyXG5cclxuZXhwb3J0IHsgUmF5IH0gZnJvbSAnLi9jb2xsaWRlcnMvcmF5J1xyXG5leHBvcnQgeyBQbGFuZSB9IGZyb20gJy4vY29sbGlkZXJzL3BsYW5lJ1xyXG5cclxuZXhwb3J0IHsgU3BoZXJlIH0gZnJvbSAnLi92b2x1bWVzL3NwaGVyZSdcclxuZXhwb3J0IHsgQ3Vib2lkIH0gZnJvbSAnLi92b2x1bWVzL2N1Ym9pZCdcclxuXHJcbmV4cG9ydCB7IENvbGxpc2lvbkRpc3BhdGNoZXIgfSBmcm9tICcuL2Rpc3BhdGNoZXJzL2NvbGxpc2lvbidcclxuXHJcbmV4cG9ydCB7IGNvbGxpZGVSYXlXaXRoUmF5IH0gZnJvbSAnLi9jb2xsaXNpb25zL3JheS9yYXknXHJcbmV4cG9ydCB7IGNvbGxpZGVSYXlXaXRoUGxhbmUgfSBmcm9tICcuL2NvbGxpc2lvbnMvcmF5L3BsYW5lJ1xyXG5leHBvcnQgeyBjb2xsaWRlUmF5V2l0aFNwaGVyZSB9IGZyb20gJy4vY29sbGlzaW9ucy9yYXkvc3BoZXJlJ1xyXG5leHBvcnQgeyBjb2xsaWRlUmF5V2l0aEN1Ym9pZCB9IGZyb20gJy4vY29sbGlzaW9ucy9yYXkvY3Vib2lkJ1xyXG5cclxuZXhwb3J0IHsgY29sbGlkZVBsYW5lV2l0aFNwaGVyZSB9IGZyb20gJy4vY29sbGlzaW9ucy9wbGFuZS9zcGhlcmUnXHJcbmV4cG9ydCB7IGNvbGxpZGVQbGFuZVdpdGhDdWJvaWQgfSBmcm9tICcuL2NvbGxpc2lvbnMvcGxhbmUvY3Vib2lkJ1xyXG5cclxuZXhwb3J0IHsgY29sbGlkZVNwaGVyZVdpdGhTcGhlcmUgfSBmcm9tICcuL2NvbGxpc2lvbnMvc3BoZXJlL3NwaGVyZSdcclxuZXhwb3J0IHsgY29sbGlkZVNwaGVyZVdpdGhDdWJvaWQgfSBmcm9tICcuL2NvbGxpc2lvbnMvc3BoZXJlL2N1Ym9pZCdcclxuXHJcbmV4cG9ydCB7IGNvbGxpZGVDdWJvaWRXaXRoQ3Vib2lkIH0gZnJvbSAnLi9jb2xsaXNpb25zL2N1Ym9pZC9jdWJvaWQnXHJcbiIsImltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJy4uL2NvcmUnXHJcbmltcG9ydCB7IG1hdDMsIHZlYzMgfSBmcm9tICcuLi92ZWN0b3JzJ1xyXG5pbXBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4vY29sbGlkZXInXHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVm9sdW1lIGV4dGVuZHMgQ29sbGlkZXIge1xyXG5cclxuICByZWFkb25seSBjZW50ZXI6IHZlYzNcclxuXHJcbiAgcmVhZG9ubHkgaW5lcnRpYTogbWF0M1xyXG5cclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgb3JpZ2luOiB2ZWMzXHJcblxyXG4gIGNvbnN0cnVjdG9yKHtcclxuICAgIG9yaWdpbiA9IHZlYzMuemVyb1xyXG4gIH0gPSB7fSkge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIHRoaXMub3JpZ2luID0gb3JpZ2luLmNvcHkoKVxyXG4gICAgdGhpcy5jZW50ZXIgPSBvcmlnaW4uY29weSgpXHJcblxyXG4gICAgdGhpcy5pbmVydGlhID0gbmV3IG1hdDMoKVxyXG4gIH1cclxuXHJcbiAgdG9KU09OKCkge1xyXG4gICAgY29uc3QgeyBvcmlnaW4gfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4geyBvcmlnaW4gfVxyXG4gIH1cclxuXHJcbiAgYWJzdHJhY3QgdHJhbnNmb3JtKHRyYW5zZm9ybTogVHJhbnNmb3JtKTogdm9pZFxyXG5cclxuICBhYnN0cmFjdCBjYWxjdWxhdGVJbmVydGlhKG1hc3M6IG51bWJlciwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0pOiB2b2lkXHJcblxyXG59XHJcblxyXG4iLCJpbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuLi8uLi9jb3JlJ1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vLi4vdmVjdG9ycydcclxuaW1wb3J0IHsgQ29sbGlkZXIgfSBmcm9tICcuLi9jb2xsaWRlcidcclxuaW1wb3J0IHsgVm9sdW1lIH0gZnJvbSAnLi4vdm9sdW1lJ1xyXG5cclxuZXhwb3J0IGNsYXNzIEN1Ym9pZCBleHRlbmRzIFZvbHVtZSB7XHJcblxyXG4gIHJlYWRvbmx5IHR5cGUgPSBDb2xsaWRlci5UeXBlLkN1Ym9pZFxyXG5cclxuICByZWFkb25seSBleHRlbnRzOiBSZWFkb25seTx2ZWMzPlxyXG5cclxuICByZWFkb25seSBheGVzOiB2ZWMzW11cclxuXHJcbiAgY29uc3RydWN0b3Ioe1xyXG4gICAgb3JpZ2luID0gdmVjMy56ZXJvLFxyXG4gICAgZXh0ZW50cyA9IHZlYzMub25lXHJcbiAgfSA9IHt9KSB7XHJcbiAgICBzdXBlcih7IG9yaWdpbiB9KVxyXG5cclxuICAgIHRoaXMuZXh0ZW50cyA9IGV4dGVudHMuY29weSgpXHJcblxyXG4gICAgdGhpcy5heGVzID0gW11cclxuXHJcbiAgICB2ZWMzLmF4ZXMuZm9yRWFjaCgoYXhpcykgPT4ge1xyXG4gICAgICB0aGlzLmF4ZXMucHVzaChheGlzLmNvcHkoKSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm0odHJhbnNmb3JtOiBUcmFuc2Zvcm0pIHtcclxuICAgIGNvbnN0IHsgdHJhbnNsYXRpb24sIHJvdGF0aW9uIH0gPSB0cmFuc2Zvcm1cclxuXHJcbiAgICB2ZWMzLmFkZCh0aGlzLm9yaWdpbiwgdHJhbnNsYXRpb24sIHRoaXMuY2VudGVyKVxyXG5cclxuICAgIHZlYzMuYXhlcy5mb3JFYWNoKChheGlzLCBpbmRleCkgPT4ge1xyXG4gICAgICByb3RhdGlvbi50cmFuc2Zvcm1WZWMzKGF4aXMsIHRoaXMuYXhlc1tpbmRleF0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgY2FsY3VsYXRlSW5lcnRpYShtYXNzOiBudW1iZXIsIHRyYW5zZm9ybTogVHJhbnNmb3JtKSB7XHJcbiAgICBjb25zdCB7IHJvdGF0aW9uTWF0cml4IH0gPSB0cmFuc2Zvcm1cclxuXHJcbiAgICBjb25zdCB7IHgsIHksIHogfSA9IHRoaXMuZXh0ZW50c1xyXG5cclxuICAgIGNvbnN0IHQxID0gKDEgLyAxMikgKiBtYXNzICogKHkgKiB5ICsgeiAqIHopXHJcbiAgICBjb25zdCB0MiA9ICgxIC8gMTIpICogbWFzcyAqICh4ICogeCArIHogKiB6KVxyXG4gICAgY29uc3QgdDMgPSAoMSAvIDEyKSAqIG1hc3MgKiAoeCAqIHggKyB5ICogeSlcclxuXHJcbiAgICB0aGlzLmluZXJ0aWEuc2V0KFtcclxuICAgICAgdDEsIDAsIDAsXHJcbiAgICAgIDAsIHQyLCAwLFxyXG4gICAgICAwLCAwLCB0M1xyXG4gICAgXSlcclxuXHJcbiAgICB0aGlzLmluZXJ0aWEubXVsdGlwbHkocm90YXRpb25NYXRyaXgpLmludmVydCgpXHJcbiAgfVxyXG5cclxuICB0b0pTT04oKSB7XHJcbiAgICBjb25zdCB7IGV4dGVudHMgfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4geyAuLi5zdXBlci50b0pTT04oKSwgZXh0ZW50cyB9XHJcbiAgfVxyXG5cclxufVxyXG4iLCJpbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuLi8uLi9jb3JlJ1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi4vLi4vdmVjdG9ycydcclxuaW1wb3J0IHsgQ29sbGlkZXIgfSBmcm9tICcuLi9jb2xsaWRlcidcclxuaW1wb3J0IHsgVm9sdW1lIH0gZnJvbSAnLi4vdm9sdW1lJ1xyXG5cclxuZXhwb3J0IGNsYXNzIFNwaGVyZSBleHRlbmRzIFZvbHVtZSB7XHJcblxyXG4gIHJlYWRvbmx5IHR5cGUgPSBDb2xsaWRlci5UeXBlLlNwaGVyZVxyXG5cclxuICByZWFkb25seSByYWRpdXM6IG51bWJlclxyXG5cclxuICBjb25zdHJ1Y3Rvcih7XHJcbiAgICBvcmlnaW4gPSB2ZWMzLnplcm8sXHJcbiAgICByYWRpdXMgPSAxLjBcclxuICB9KSB7XHJcbiAgICBzdXBlcih7IG9yaWdpbiB9KVxyXG5cclxuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzXHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm0odHJhbnNmb3JtOiBUcmFuc2Zvcm0pIHtcclxuICAgIGNvbnN0IHsgdHJhbnNsYXRpb24gfSA9IHRyYW5zZm9ybVxyXG5cclxuICAgIHZlYzMuYWRkKHRoaXMub3JpZ2luLCB0cmFuc2xhdGlvbiwgdGhpcy5jZW50ZXIpXHJcbiAgfVxyXG5cclxuICBjYWxjdWxhdGVJbmVydGlhKG1hc3M6IG51bWJlciwgdHJhbnNmb3JtOiBUcmFuc2Zvcm0pIHtcclxuICAgIGNvbnN0IHsgcmFkaXVzIH0gPSB0aGlzXHJcblxyXG4gICAgY29uc3QgdCA9ICgyIC8gNSkgKiBtYXNzICogcmFkaXVzICogcmFkaXVzXHJcblxyXG4gICAgdGhpcy5pbmVydGlhLnNldChbXHJcbiAgICAgIHQsIDAsIDAsXHJcbiAgICAgIDAsIHQsIDAsXHJcbiAgICAgIDAsIDAsIHRcclxuICAgIF0pXHJcblxyXG4gICAgdGhpcy5pbmVydGlhLmludmVydCgpXHJcbiAgfVxyXG5cclxuICB0b0pTT04oKSB7XHJcbiAgICBjb25zdCB7IHJhZGl1cyB9ID0gdGhpc1xyXG5cclxuICAgIHJldHVybiB7IC4uLnN1cGVyLnRvSlNPTigpLCByYWRpdXMgfVxyXG4gIH1cclxuXHJcbn1cclxuIiwidHlwZSBDYWxsYmFjazxUIGV4dGVuZHMgeyB0eXBlOiBzdHJpbmcgfSwgUz4gPSAoYTogVCwgYjogVCkgPT4gUyB8IG51bGxcclxuXHJcbmV4cG9ydCBjbGFzcyBEaXNwYXRjaGVyPFQgZXh0ZW5kcyB7IHR5cGU6IHN0cmluZyB9LCBTPiB7XHJcblxyXG4gIHByaXZhdGUgY2FsbGJhY2tzOiBNYXA8c3RyaW5nLCBDYWxsYmFjazxULCBTPj4gPSBuZXcgTWFwKClcclxuXHJcbiAgcmVnaXN0ZXIoZmlyc3RUeXBlOiBzdHJpbmcsIG90aGVyVHlwZTogc3RyaW5nLCBjYWxsYmFjazogQ2FsbGJhY2s8VCwgUz4pIHtcclxuICAgIHRoaXMuY2FsbGJhY2tzLnNldChgJHtmaXJzdFR5cGV9LSR7b3RoZXJUeXBlfWAsIGNhbGxiYWNrKVxyXG4gIH1cclxuXHJcbiAgZGlzcGF0Y2goZmlyc3Q6IFQsIG90aGVyOiBUKTogUyB8IG51bGwge1xyXG4gICAgbGV0IGtleSA9IGAke2ZpcnN0LnR5cGV9LSR7b3RoZXIudHlwZX1gXHJcbiAgICBsZXQgY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrcy5nZXQoa2V5KVxyXG5cclxuICAgIGlmICghY2FsbGJhY2spIHtcclxuICAgICAga2V5ID0gYCR7b3RoZXIudHlwZX0tJHtmaXJzdC50eXBlfWBcclxuICAgICAgY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrcy5nZXQoa2V5KVxyXG5cclxuICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG90aGVyLCBmaXJzdClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAoY2FsbGJhY2spID8gY2FsbGJhY2soZmlyc3QsIG90aGVyKSA6IG51bGxcclxuICB9XHJcblxyXG59IiwiZXhwb3J0IHsgUG9vbCB9IGZyb20gJy4vcG9vbCdcclxuZXhwb3J0IHsgRGlzcGF0Y2hlciB9IGZyb20gJy4vZGlzcGF0Y2hlcidcclxuIiwiY29uc3QgeyBjZWlsIH0gPSBNYXRoXHJcblxyXG5leHBvcnQgY2xhc3MgUG9vbDxUPiB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcG9vbDogVFtdXHJcblxyXG4gIHByaXZhdGUgbWF4aW11bVNpemU6IG51bWJlciAgICAgICAgIC8vIG1heGltdW0gbnVtYmVyIG9mIG9iamVjdHMgdGhhdCB0aGUgcG9vbCBjYW4gZ3JvdyB0b1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgY3JlYXRlOiAoKSA9PiBULFxyXG4gICAgcHJpdmF0ZSByZXNldDogKG9iamVjdDogVCkgPT4gVCxcclxuICAgIHByaXZhdGUgaW5pdGlhbFNpemU6IG51bWJlciwgICAgICAvLyBudW1iZXIgb2Ygb2JqZWN0cyB0byBhbGxvY2F0ZSBvbiBwb29sIGNyZWF0aW9uXHJcbiAgICBwcml2YXRlIGJhdGNoU2l6ZTogbnVtYmVyID0gMCAgICAgLy8gbnVtYmVyIG9mIG9iamVjdHMgdG8gY3JlYXRlIHdoZW5ldmVyIHBvb2wgbmVlZHMgdG8gZ3Jvd1xyXG4gICkge1xyXG4gICAgdGhpcy5wb29sID0gbmV3IEFycmF5PFQ+KClcclxuXHJcbiAgICB0aGlzLm1heGltdW1TaXplID0gaW5pdGlhbFNpemVcclxuXHJcbiAgICB0aGlzLmFsbG9jYXRlKHRoaXMuaW5pdGlhbFNpemUpXHJcbiAgfVxyXG5cclxuICBnZXQgbGVuZ3RoKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucG9vbC5sZW5ndGhcclxuICB9XHJcblxyXG4gIGFjcXVpcmUoKTogVCB7XHJcbiAgICBpZiAodGhpcy5wb29sLmxlbmd0aCA+IDApIHtcclxuICAgICAgLy8gaWYgbnVtYmVyIG9mIGF2YWlsYWJsZSBvYmplY3RzIGlzIGxlc3MgdGhhbiAxMCUgb2YgbWF4aW11bSBzaXplLFxyXG4gICAgICAvLyBkb3VibGUgbWF4aW11bSBzaXplIGFuZCBmaWxsIHVwIHBvb2wgd2l0aCBuZXdseSBhbGxvY2F0ZWQgb2JqZWN0c1xyXG5cclxuICAgICAgaWYgKHRoaXMucG9vbC5sZW5ndGggPD0gY2VpbCh0aGlzLm1heGltdW1TaXplICogMC4xKSkge1xyXG4gICAgICAgIHRoaXMubWF4aW11bVNpemUgKj0gMlxyXG5cclxuICAgICAgICB0aGlzLmFsbG9jYXRlKHRoaXMubWF4aW11bVNpemUgLSB0aGlzLnBvb2wubGVuZ3RoKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBpZiB0aGVyZSBhcmUgbm9uZSBhdmFpbGFibGUsIFxyXG4gICAgICAvLyBhbGxvY2F0ZSBuZXcgYmF0Y2ggb2Ygb2JqZWN0c1xyXG5cclxuICAgICAgdGhpcy5hbGxvY2F0ZSh0aGlzLmJhdGNoU2l6ZSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5wb29sLnBvcCgpIC8vIHJldHVybiBsYXN0IG9iamVjdCBpbiBwb29sXHJcbiAgfVxyXG5cclxuICByZWxlYXNlKG9iamVjdDogVCkge1xyXG4gICAgdGhpcy5wb29sLnB1c2godGhpcy5yZXNldChvYmplY3QpKVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBhbGxvY2F0ZShzaXplOiBudW1iZXIpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XHJcbiAgICAgIHRoaXMucG9vbC5wdXNoKHRoaXMuY3JlYXRlKCkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxufVxyXG4iLCJleHBvcnQgY29uc3QgRXBzaWxvbiA9IDAuMDAwMDFcclxuIiwiZXhwb3J0IHsgbWF0MiB9IGZyb20gJy4vbWF0MidcclxuZXhwb3J0IHsgbWF0MyB9IGZyb20gJy4vbWF0MydcclxuZXhwb3J0IHsgbWF0NCB9IGZyb20gJy4vbWF0NCdcclxuZXhwb3J0IHsgdmVjMiB9IGZyb20gJy4vdmVjMidcclxuZXhwb3J0IHsgdmVjMyB9IGZyb20gJy4vdmVjMydcclxuZXhwb3J0IHsgdmVjNCB9IGZyb20gJy4vdmVjNCdcclxuZXhwb3J0IHsgcXVhdCB9IGZyb20gJy4vcXVhdCdcclxuXHJcbmV4cG9ydCB7IEVwc2lsb24gfSBmcm9tICcuL2NvbnN0YW50cydcclxuIiwiaW1wb3J0IHsgRXBzaWxvbiB9IGZyb20gJy4vY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyB2ZWMyIH0gZnJvbSAnLi92ZWMyJ1xyXG5cclxuZXhwb3J0IGNsYXNzIG1hdDIgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih2YWx1ZXM6IG51bWJlcltdID0gW1xyXG4gICAgMS4wLCAwLjAsXHJcbiAgICAwLjAsIDEuMFxyXG4gIF0pIHtcclxuICAgIHN1cGVyKHZhbHVlcy5zbGljZSgwLCA0KSlcclxuICB9XHJcblxyXG4gIHN0YXRpYyByZWFkb25seSBpZGVudGl0eSA9IG5ldyBtYXQyKClcclxuXHJcbiAgZ2V0IGRldGVybWluYW50KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1swXSAqIHRoaXNbM10gLSB0aGlzWzJdICogdGhpc1sxXVxyXG4gIH1cclxuXHJcbiAgY29weShkZXN0OiBudWxsIHwgbWF0MiA9IG51bGwpOiBtYXQyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDIoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3Quc2V0KHRoaXMpXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHJvdyhpbmRleDogbnVtYmVyLCBkZXN0OiBudWxsIHwgdmVjMiA9IG51bGwpOiB2ZWMyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzIoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXNbaW5kZXggKiAyXVxyXG4gICAgZGVzdC55ID0gdGhpc1tpbmRleCAqIDIgKyAxXVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBjb2x1bW4oaW5kZXg6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMyKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzW2luZGV4XVxyXG4gICAgZGVzdC55ID0gdGhpc1tpbmRleCArIDJdXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGVxdWFscyhvdGhlcjogbWF0MiwgdGhyZXNob2xkID0gRXBzaWxvbik6IGJvb2xlYW4ge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgaWYgKE1hdGguYWJzKHRoaXNbaV0gLSBvdGhlcltpXSkgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlXHJcbiAgfVxyXG5cclxuICByZXNldCgpOiBtYXQyIHtcclxuICAgIHRoaXNbMF0gPSAxLjBcclxuICAgIHRoaXNbMV0gPSAwLjBcclxuICAgIHRoaXNbMl0gPSAwLjBcclxuICAgIHRoaXNbM10gPSAxLjBcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgdHJhbnNwb3NlKGRlc3Q6IG51bGwgfCBtYXQyID0gbnVsbCk6IG1hdDIge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdCA9IHRoaXNbMV1cclxuICAgIGRlc3RbMV0gPSBkZXN0WzJdXHJcbiAgICBkZXN0WzJdID0gdFxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBpbnZlcnQoZGVzdDogbnVsbCB8IG1hdDIgPSBudWxsKTogbWF0MiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGV0ID0gdGhpcy5kZXRlcm1pbmFudFxyXG5cclxuICAgIGlmIChkZXQgPT09IDAuMCkge1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGRldCA9IDEuMCAvIGRldFxyXG5cclxuICAgIGNvbnN0IHQwMCA9IHRoaXNbMF1cclxuICAgIGNvbnN0IHQwMSA9IHRoaXNbMV1cclxuICAgIGNvbnN0IHQxMCA9IHRoaXNbMl1cclxuICAgIGNvbnN0IHQxMSA9IHRoaXNbM11cclxuXHJcbiAgICBkZXN0WzBdID0gZGV0ICogdDExXHJcbiAgICBkZXN0WzFdID0gZGV0ICogLXQwMVxyXG4gICAgZGVzdFsyXSA9IGRldCAqIC10MTBcclxuICAgIGRlc3RbM10gPSBkZXQgKiB0MDBcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbXVsdGlwbHkob3RoZXI6IG1hdDIsIGRlc3Q6IG51bGwgfCBtYXQyID0gbnVsbCk6IG1hdDIge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYTAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgYTAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgYTEwID0gdGhpc1syXVxyXG4gICAgY29uc3QgYTExID0gdGhpc1szXVxyXG5cclxuICAgIGNvbnN0IGIwMCA9IG90aGVyWzBdXHJcbiAgICBjb25zdCBiMDEgPSBvdGhlclsxXVxyXG4gICAgY29uc3QgYjEwID0gb3RoZXJbMl1cclxuICAgIGNvbnN0IGIxMSA9IG90aGVyWzNdXHJcblxyXG4gICAgZGVzdFswXSA9IGEwMCAqIGIwMCArIGEwMSAqIGIxMFxyXG4gICAgZGVzdFsxXSA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMVxyXG4gICAgZGVzdFsyXSA9IGExMCAqIGIwMCArIGExMSAqIGIxMFxyXG4gICAgZGVzdFszXSA9IGExMCAqIGIwMSArIGExMSAqIGIxMVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm0odmVjdG9yOiB2ZWMyLCBkZXN0OiBudWxsIHwgdmVjMiA9IG51bGwpOiB2ZWMyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzIoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHggPSB2ZWN0b3IueFxyXG4gICAgY29uc3QgeSA9IHZlY3Rvci55XHJcblxyXG4gICAgZGVzdC54ID0geCAqIHRoaXNbMF0gKyB5ICogdGhpc1sxXVxyXG4gICAgZGVzdC55ID0geCAqIHRoaXNbMl0gKyB5ICogdGhpc1szXVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzY2FsZSh2ZWN0b3I6IHZlYzIsIGRlc3Q6IG51bGwgfCBtYXQyID0gbnVsbCk6IG1hdDIge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdjAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgdjAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdjEwID0gdGhpc1syXVxyXG4gICAgY29uc3QgdjExID0gdGhpc1szXVxyXG5cclxuICAgIGNvbnN0IHggPSB2ZWN0b3IueFxyXG4gICAgY29uc3QgeSA9IHZlY3Rvci55XHJcblxyXG4gICAgZGVzdFswXSA9IHYwMCAqIHhcclxuICAgIGRlc3RbMV0gPSB2MDEgKiB5XHJcbiAgICBkZXN0WzJdID0gdjEwICogeFxyXG4gICAgZGVzdFszXSA9IHYxMSAqIHlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgcm90YXRlKGFuZ2xlOiBudW1iZXIsIGRlc3Q6IG51bGwgfCBtYXQyID0gbnVsbCk6IG1hdDIge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdjAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgdjAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdjEwID0gdGhpc1syXVxyXG4gICAgY29uc3QgdjExID0gdGhpc1szXVxyXG5cclxuICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKGFuZ2xlKVxyXG4gICAgY29uc3QgY29zID0gTWF0aC5jb3MoYW5nbGUpXHJcblxyXG4gICAgZGVzdFswXSA9IHYwMCAqIGNvcyArIHYwMSAqIHNpblxyXG4gICAgZGVzdFsxXSA9IHYwMCAqIC1zaW4gKyB2MDEgKiBjb3NcclxuICAgIGRlc3RbMl0gPSB2MTAgKiBjb3MgKyB2MTEgKiBzaW5cclxuICAgIGRlc3RbM10gPSB2MTAgKiAtc2luICsgdjExICogY29zXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtdWx0aXBseShtMTogbWF0MiwgbTI6IG1hdDIsIGRlc3Q6IG51bGwgfCBtYXQyID0gbnVsbCk6IG1hdDIge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0MigpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYTAwID0gbTFbMF1cclxuICAgIGNvbnN0IGEwMSA9IG0xWzFdXHJcbiAgICBjb25zdCBhMTAgPSBtMVsyXVxyXG4gICAgY29uc3QgYTExID0gbTFbM11cclxuXHJcbiAgICBjb25zdCBiMDAgPSBtMlswXVxyXG4gICAgY29uc3QgYjAxID0gbTJbMV1cclxuICAgIGNvbnN0IGIxMCA9IG0yWzJdXHJcbiAgICBjb25zdCBiMTEgPSBtMlszXVxyXG5cclxuICAgIGRlc3RbMF0gPSBhMDAgKiBiMDAgKyBhMDEgKiBiMTBcclxuICAgIGRlc3RbMV0gPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTFcclxuICAgIGRlc3RbMl0gPSBhMTAgKiBiMDAgKyBhMTEgKiBiMTBcclxuICAgIGRlc3RbM10gPSBhMTAgKiBiMDEgKyBhMTEgKiBiMTFcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IHsgRXBzaWxvbiB9IGZyb20gJy4vY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBtYXQ0IH0gZnJvbSAnLi9tYXQ0J1xyXG5pbXBvcnQgeyBxdWF0IH0gZnJvbSAnLi9xdWF0J1xyXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi92ZWMzJ1xyXG5cclxuZXhwb3J0IGNsYXNzIG1hdDMgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xyXG5cclxuICBjb25zdHJ1Y3Rvcih2YWx1ZXM6IG51bWJlcltdID0gW1xyXG4gICAgMS4wLCAwLjAsIDAuMCxcclxuICAgIDAuMCwgMS4wLCAwLjAsXHJcbiAgICAwLjAsIDAuMCwgMS4wXHJcbiAgXSkge1xyXG4gICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDkpKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IGlkZW50aXR5ID0gbmV3IG1hdDMoKVxyXG5cclxuICBnZXQgZGV0ZXJtaW5hbnQoKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHYwMCA9IHRoaXNbMF1cclxuICAgIGNvbnN0IHYwMSA9IHRoaXNbMV1cclxuICAgIGNvbnN0IHYwMiA9IHRoaXNbMl1cclxuICAgIGNvbnN0IHYxMCA9IHRoaXNbM11cclxuICAgIGNvbnN0IHYxMSA9IHRoaXNbNF1cclxuICAgIGNvbnN0IHYxMiA9IHRoaXNbNV1cclxuICAgIGNvbnN0IHYyMCA9IHRoaXNbNl1cclxuICAgIGNvbnN0IHYyMSA9IHRoaXNbN11cclxuICAgIGNvbnN0IHYyMiA9IHRoaXNbOF1cclxuXHJcbiAgICBjb25zdCBkZXQwMSA9IHYyMiAqIHYxMSAtIHYxMiAqIHYyMVxyXG4gICAgY29uc3QgZGV0MTEgPSAtdjIyICogdjEwICsgdjEyICogdjIwXHJcbiAgICBjb25zdCBkZXQyMSA9IHYyMSAqIHYxMCAtIHYxMSAqIHYyMFxyXG5cclxuICAgIHJldHVybiB2MDAgKiBkZXQwMSArIHYwMSAqIGRldDExICsgdjAyICogZGV0MjFcclxuICB9XHJcblxyXG4gIGNvcHkoZGVzdDogbnVsbCB8IG1hdDMgPSBudWxsKTogbWF0MyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBtYXQzKClcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDk7IGkrKykge1xyXG4gICAgICBkZXN0W2ldID0gdGhpc1tpXVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICByb3coaW5kZXg6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzW2luZGV4ICogM11cclxuICAgIGRlc3QueSA9IHRoaXNbaW5kZXggKiAzICsgMV1cclxuICAgIGRlc3QueiA9IHRoaXNbaW5kZXggKiAzICsgMl1cclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgY29sdW1uKGluZGV4OiBudW1iZXIsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpc1tpbmRleF1cclxuICAgIGRlc3QueSA9IHRoaXNbaW5kZXggKyAzXVxyXG4gICAgZGVzdC56ID0gdGhpc1tpbmRleCArIDZdXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGVxdWFscyhvdGhlcjogbWF0MywgdGhyZXNob2xkID0gRXBzaWxvbik6IGJvb2xlYW4ge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA5OyBpKyspIHtcclxuICAgICAgaWYgKE1hdGguYWJzKHRoaXNbaV0gLSBvdGhlcltpXSkgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlXHJcbiAgfVxyXG5cclxuICByZXNldCgpOiBtYXQzIHtcclxuICAgIHRoaXNbMF0gPSAxLjBcclxuICAgIHRoaXNbMV0gPSAwLjBcclxuICAgIHRoaXNbMl0gPSAwLjBcclxuXHJcbiAgICB0aGlzWzNdID0gMC4wXHJcbiAgICB0aGlzWzRdID0gMS4wXHJcbiAgICB0aGlzWzVdID0gMC4wXHJcblxyXG4gICAgdGhpc1s2XSA9IDAuMFxyXG4gICAgdGhpc1s3XSA9IDAuMFxyXG4gICAgdGhpc1s4XSA9IDEuMFxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICB0cmFuc3Bvc2UoZGVzdDogbnVsbCB8IG1hdDMgPSBudWxsKTogbWF0MyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0MDAgPSB0aGlzWzBdXHJcbiAgICBjb25zdCB0MDEgPSB0aGlzWzFdXHJcbiAgICBjb25zdCB0MDIgPSB0aGlzWzJdXHJcblxyXG4gICAgY29uc3QgdDEwID0gdGhpc1szXVxyXG4gICAgY29uc3QgdDExID0gdGhpc1s0XVxyXG4gICAgY29uc3QgdDEyID0gdGhpc1s1XVxyXG5cclxuICAgIGNvbnN0IHQyMCA9IHRoaXNbNl1cclxuICAgIGNvbnN0IHQyMSA9IHRoaXNbN11cclxuICAgIGNvbnN0IHQyMiA9IHRoaXNbOF1cclxuXHJcbiAgICBkZXN0WzBdID0gdDAwXHJcbiAgICBkZXN0WzFdID0gdDEwXHJcbiAgICBkZXN0WzJdID0gdDIwXHJcblxyXG4gICAgZGVzdFszXSA9IHQwMVxyXG4gICAgZGVzdFs0XSA9IHQxMVxyXG4gICAgZGVzdFs1XSA9IHQyMVxyXG5cclxuICAgIGRlc3RbNl0gPSB0MDJcclxuICAgIGRlc3RbN10gPSB0MTJcclxuICAgIGRlc3RbOF0gPSB0MjJcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgaW52ZXJ0KGRlc3Q6IG51bGwgfCBtYXQzID0gbnVsbCk6IG1hdDMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdjAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgdjAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdjAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgdjEwID0gdGhpc1szXVxyXG4gICAgY29uc3QgdjExID0gdGhpc1s0XVxyXG4gICAgY29uc3QgdjEyID0gdGhpc1s1XVxyXG4gICAgY29uc3QgdjIwID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdjIxID0gdGhpc1s3XVxyXG4gICAgY29uc3QgdjIyID0gdGhpc1s4XVxyXG5cclxuICAgIGNvbnN0IGRldDAxID0gdjIyICogdjExIC0gdjEyICogdjIxXHJcbiAgICBjb25zdCBkZXQxMSA9IC12MjIgKiB2MTAgKyB2MTIgKiB2MjBcclxuICAgIGNvbnN0IGRldDIxID0gdjIxICogdjEwIC0gdjExICogdjIwXHJcblxyXG4gICAgbGV0IGRldCA9IHYwMCAqIGRldDAxICsgdjAxICogZGV0MTEgKyB2MDIgKiBkZXQyMVxyXG5cclxuICAgIGlmIChkZXQgPT09IDAuMCkge1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGRldCA9IDEuMCAvIGRldFxyXG5cclxuICAgIGRlc3RbMF0gPSBkZXQwMSAqIGRldFxyXG4gICAgZGVzdFsxXSA9ICgtdjIyICogdjAxICsgdjAyICogdjIxKSAqIGRldFxyXG4gICAgZGVzdFsyXSA9ICh2MTIgKiB2MDEgLSB2MDIgKiB2MTEpICogZGV0XHJcblxyXG4gICAgZGVzdFszXSA9IGRldDExICogZGV0XHJcbiAgICBkZXN0WzRdID0gKHYyMiAqIHYwMCAtIHYwMiAqIHYyMCkgKiBkZXRcclxuICAgIGRlc3RbNV0gPSAoLXYxMiAqIHYwMCArIHYwMiAqIHYxMCkgKiBkZXRcclxuXHJcbiAgICBkZXN0WzZdID0gZGV0MjEgKiBkZXRcclxuICAgIGRlc3RbN10gPSAoLXYyMSAqIHYwMCArIHYwMSAqIHYyMCkgKiBkZXRcclxuICAgIGRlc3RbOF0gPSAodjExICogdjAwIC0gdjAxICogdjEwKSAqIGRldFxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBtdWx0aXBseShvdGhlcjogbWF0MywgZGVzdDogbnVsbCB8IG1hdDMgPSBudWxsKTogbWF0MyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhMDAgPSB0aGlzWzBdXHJcbiAgICBjb25zdCBhMDEgPSB0aGlzWzFdXHJcbiAgICBjb25zdCBhMDIgPSB0aGlzWzJdXHJcbiAgICBjb25zdCBhMTAgPSB0aGlzWzNdXHJcbiAgICBjb25zdCBhMTEgPSB0aGlzWzRdXHJcbiAgICBjb25zdCBhMTIgPSB0aGlzWzVdXHJcbiAgICBjb25zdCBhMjAgPSB0aGlzWzZdXHJcbiAgICBjb25zdCBhMjEgPSB0aGlzWzddXHJcbiAgICBjb25zdCBhMjIgPSB0aGlzWzhdXHJcblxyXG4gICAgY29uc3QgYjAwID0gb3RoZXJbMF1cclxuICAgIGNvbnN0IGIwMSA9IG90aGVyWzFdXHJcbiAgICBjb25zdCBiMDIgPSBvdGhlclsyXVxyXG4gICAgY29uc3QgYjEwID0gb3RoZXJbM11cclxuICAgIGNvbnN0IGIxMSA9IG90aGVyWzRdXHJcbiAgICBjb25zdCBiMTIgPSBvdGhlcls1XVxyXG4gICAgY29uc3QgYjIwID0gb3RoZXJbNl1cclxuICAgIGNvbnN0IGIyMSA9IG90aGVyWzddXHJcbiAgICBjb25zdCBiMjIgPSBvdGhlcls4XVxyXG5cclxuICAgIGRlc3RbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjBcclxuICAgIGRlc3RbMV0gPSBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjFcclxuICAgIGRlc3RbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjJcclxuXHJcbiAgICBkZXN0WzNdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwXHJcbiAgICBkZXN0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxXHJcbiAgICBkZXN0WzVdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyXHJcblxyXG4gICAgZGVzdFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMFxyXG4gICAgZGVzdFs3XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMVxyXG4gICAgZGVzdFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMlxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm0odmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdmVjdG9yXHJcblxyXG4gICAgZGVzdC54ID0geCAqIHRoaXNbMF0gKyB5ICogdGhpc1szXSArIHogKiB0aGlzWzZdXHJcbiAgICBkZXN0LnkgPSB4ICogdGhpc1sxXSArIHkgKiB0aGlzWzRdICsgeiAqIHRoaXNbN11cclxuICAgIGRlc3QueiA9IHggKiB0aGlzWzJdICsgeSAqIHRoaXNbNV0gKyB6ICogdGhpc1s4XVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICByb3RhdGUoYW5nbGU6IG51bWJlciwgYXhpczogdmVjMywgZGVzdDogbnVsbCB8IG1hdDMgPSBudWxsKTogbnVsbCB8IG1hdDMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHsgeCwgeSwgeiB9ID0gYXhpc1xyXG5cclxuICAgIGxldCBsZW5ndGggPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KVxyXG5cclxuICAgIGlmICghbGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybiBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGxlbmd0aCAhPT0gMSkge1xyXG4gICAgICBsZW5ndGggPSAxIC8gbGVuZ3RoXHJcbiAgICAgIHggKj0gbGVuZ3RoXHJcbiAgICAgIHkgKj0gbGVuZ3RoXHJcbiAgICAgIHogKj0gbGVuZ3RoXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcyA9IE1hdGguc2luKGFuZ2xlKVxyXG4gICAgY29uc3QgYyA9IE1hdGguY29zKGFuZ2xlKVxyXG5cclxuICAgIGNvbnN0IHQgPSAxLjAgLSBjXHJcblxyXG4gICAgY29uc3QgYTAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgYTAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgYTAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgYTEwID0gdGhpc1szXVxyXG4gICAgY29uc3QgYTExID0gdGhpc1s0XVxyXG4gICAgY29uc3QgYTEyID0gdGhpc1s1XVxyXG4gICAgY29uc3QgYTIwID0gdGhpc1s2XVxyXG4gICAgY29uc3QgYTIxID0gdGhpc1s3XVxyXG4gICAgY29uc3QgYTIyID0gdGhpc1s4XVxyXG5cclxuICAgIGNvbnN0IGIwMCA9IHggKiB4ICogdCArIGNcclxuICAgIGNvbnN0IGIwMSA9IHkgKiB4ICogdCArIHogKiBzXHJcbiAgICBjb25zdCBiMDIgPSB6ICogeCAqIHQgLSB5ICogc1xyXG4gICAgY29uc3QgYjEwID0geCAqIHkgKiB0IC0geiAqIHNcclxuICAgIGNvbnN0IGIxMSA9IHkgKiB5ICogdCArIGNcclxuICAgIGNvbnN0IGIxMiA9IHogKiB5ICogdCArIHggKiBzXHJcbiAgICBjb25zdCBiMjAgPSB4ICogeiAqIHQgKyB5ICogc1xyXG4gICAgY29uc3QgYjIxID0geSAqIHogKiB0IC0geCAqIHNcclxuICAgIGNvbnN0IGIyMiA9IHogKiB6ICogdCArIGNcclxuXHJcbiAgICBkZXN0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyXHJcbiAgICBkZXN0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyXHJcbiAgICBkZXN0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyXHJcblxyXG4gICAgZGVzdFszXSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMlxyXG4gICAgZGVzdFs0XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMlxyXG4gICAgZGVzdFs1XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMlxyXG5cclxuICAgIGRlc3RbNl0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjJcclxuICAgIGRlc3RbN10gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjJcclxuICAgIGRlc3RbOF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjJcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgdG9NYXQ0KGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0NCgpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC5zZXQoW1xyXG4gICAgICB0aGlzWzBdLFxyXG4gICAgICB0aGlzWzFdLFxyXG4gICAgICB0aGlzWzJdLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICB0aGlzWzNdLFxyXG4gICAgICB0aGlzWzRdLFxyXG4gICAgICB0aGlzWzVdLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICB0aGlzWzZdLFxyXG4gICAgICB0aGlzWzddLFxyXG4gICAgICB0aGlzWzhdLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAwLjAsXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG4gICAgICAxLjBcclxuICAgIF0pXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHRvUXVhdChkZXN0OiBudWxsIHwgcXVhdCA9IG51bGwpOiBxdWF0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHF1YXQoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHYwMCA9IHRoaXNbMF1cclxuICAgIGNvbnN0IHYwMSA9IHRoaXNbMV1cclxuICAgIGNvbnN0IHYwMiA9IHRoaXNbMl1cclxuICAgIGNvbnN0IHYxMCA9IHRoaXNbM11cclxuICAgIGNvbnN0IHYxMSA9IHRoaXNbNF1cclxuICAgIGNvbnN0IHYxMiA9IHRoaXNbNV1cclxuICAgIGNvbnN0IHYyMCA9IHRoaXNbNl1cclxuICAgIGNvbnN0IHYyMSA9IHRoaXNbN11cclxuICAgIGNvbnN0IHYyMiA9IHRoaXNbOF1cclxuXHJcbiAgICBjb25zdCB4ID0gdjAwIC0gdjExIC0gdjIyXHJcbiAgICBjb25zdCB5ID0gdjExIC0gdjAwIC0gdjIyXHJcbiAgICBjb25zdCB6ID0gdjIyIC0gdjAwIC0gdjExXHJcbiAgICBjb25zdCB3ID0gdjAwICsgdjExICsgdjIyXHJcblxyXG4gICAgbGV0IGkgPSAwXHJcbiAgICBsZXQgZiA9IHdcclxuXHJcbiAgICBpZiAoeCA+IGYpIHtcclxuICAgICAgZiA9IHhcclxuICAgICAgaSA9IDFcclxuICAgIH1cclxuXHJcbiAgICBpZiAoeSA+IGYpIHtcclxuICAgICAgZiA9IHlcclxuICAgICAgaSA9IDJcclxuICAgIH1cclxuXHJcbiAgICBpZiAoeiA+IGYpIHtcclxuICAgICAgZiA9IHpcclxuICAgICAgaSA9IDNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBiID0gTWF0aC5zcXJ0KGYgKyAxKSAqIDAuNVxyXG4gICAgY29uc3QgbSA9IDAuMjUgLyBiXHJcblxyXG4gICAgc3dpdGNoIChpKSB7XHJcbiAgICAgIGNhc2UgMDpcclxuICAgICAgICBkZXN0LncgPSBiXHJcbiAgICAgICAgZGVzdC54ID0gKHYxMiAtIHYyMSkgKiBtXHJcbiAgICAgICAgZGVzdC55ID0gKHYyMCAtIHYwMikgKiBtXHJcbiAgICAgICAgZGVzdC56ID0gKHYwMSAtIHYxMCkgKiBtXHJcblxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgZGVzdC53ID0gKHYxMiAtIHYyMSkgKiBtXHJcbiAgICAgICAgZGVzdC54ID0gYlxyXG4gICAgICAgIGRlc3QueSA9ICh2MDEgKyB2MTApICogbVxyXG4gICAgICAgIGRlc3QueiA9ICh2MjAgKyB2MDIpICogbVxyXG5cclxuICAgICAgICBicmVha1xyXG5cclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIGRlc3QudyA9ICh2MjAgLSB2MDIpICogbVxyXG4gICAgICAgIGRlc3QueCA9ICh2MDEgKyB2MTApICogbVxyXG4gICAgICAgIGRlc3QueSA9IGJcclxuICAgICAgICBkZXN0LnogPSAodjEyICsgdjIxKSAqIG1cclxuXHJcbiAgICAgICAgYnJlYWtcclxuXHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBkZXN0LncgPSAodjAxIC0gdjEwKSAqIG1cclxuICAgICAgICBkZXN0LnggPSAodjIwICsgdjAyKSAqIG1cclxuICAgICAgICBkZXN0LnkgPSAodjEyICsgdjIxKSAqIG1cclxuICAgICAgICBkZXN0LnogPSBiXHJcblxyXG4gICAgICAgIGJyZWFrXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyB0cmFuc2Zvcm0obWF0cml4OiBtYXQzLCB2ZWN0b3I6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyB4LCB5LCB6IH0gPSB2ZWN0b3JcclxuXHJcbiAgICBkZXN0LnggPSB4ICogbWF0cml4WzBdICsgeSAqIG1hdHJpeFszXSArIHogKiBtYXRyaXhbNl1cclxuICAgIGRlc3QueSA9IHggKiBtYXRyaXhbMV0gKyB5ICogbWF0cml4WzRdICsgeiAqIG1hdHJpeFs3XVxyXG4gICAgZGVzdC56ID0geCAqIG1hdHJpeFsyXSArIHkgKiBtYXRyaXhbNV0gKyB6ICogbWF0cml4WzhdXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtdWx0aXBseShtMTogbWF0MywgbTI6IG1hdDMsIGRlc3Q6IG51bGwgfCBtYXQzID0gbnVsbCk6IG1hdDMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0MygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYTAwID0gbTFbMF1cclxuICAgIGNvbnN0IGEwMSA9IG0xWzFdXHJcbiAgICBjb25zdCBhMDIgPSBtMVsyXVxyXG4gICAgY29uc3QgYTEwID0gbTFbM11cclxuICAgIGNvbnN0IGExMSA9IG0xWzRdXHJcbiAgICBjb25zdCBhMTIgPSBtMVs1XVxyXG4gICAgY29uc3QgYTIwID0gbTFbNl1cclxuICAgIGNvbnN0IGEyMSA9IG0xWzddXHJcbiAgICBjb25zdCBhMjIgPSBtMVs4XVxyXG5cclxuICAgIGNvbnN0IGIwMCA9IG0yWzBdXHJcbiAgICBjb25zdCBiMDEgPSBtMlsxXVxyXG4gICAgY29uc3QgYjAyID0gbTJbMl1cclxuICAgIGNvbnN0IGIxMCA9IG0yWzNdXHJcbiAgICBjb25zdCBiMTEgPSBtMls0XVxyXG4gICAgY29uc3QgYjEyID0gbTJbNV1cclxuICAgIGNvbnN0IGIyMCA9IG0yWzZdXHJcbiAgICBjb25zdCBiMjEgPSBtMls3XVxyXG4gICAgY29uc3QgYjIyID0gbTJbOF1cclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMCxcclxuICAgICAgYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxLFxyXG4gICAgICBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjIsXHJcblxyXG4gICAgICBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjAsXHJcbiAgICAgIGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMSxcclxuICAgICAgYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyLFxyXG5cclxuICAgICAgYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwLFxyXG4gICAgICBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjEsXHJcbiAgICAgIGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMlxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGxvb2tBdChleWU6IHZlYzMsIHRhcmdldDogdmVjMywgdXA6IHZlYzMgPSB2ZWMzLnVwLCBkZXN0OiBudWxsIHwgbWF0MyA9IG51bGwpOiBtYXQzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDMoKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChleWUuZXF1YWxzKHRhcmdldCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkuY29weShkZXN0KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHogPSB2ZWMzLnN1YnRyYWN0KGV5ZSwgdGFyZ2V0KS5ub3JtYWxpemUoKVxyXG5cclxuICAgIGNvbnN0IHggPSB2ZWMzLmNyb3NzKHVwLCB6KS5ub3JtYWxpemUoKVxyXG4gICAgY29uc3QgeSA9IHZlYzMuY3Jvc3MoeiwgeCkubm9ybWFsaXplKClcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIHgueCxcclxuICAgICAgeC55LFxyXG4gICAgICB4LnosXHJcblxyXG4gICAgICB5LngsXHJcbiAgICAgIHkueSxcclxuICAgICAgeS56LFxyXG5cclxuICAgICAgei54LFxyXG4gICAgICB6LnksXHJcbiAgICAgIHouelxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnXHJcbmltcG9ydCB7IG1hdDMgfSBmcm9tICcuL21hdDMnXHJcbmltcG9ydCB7IHF1YXQgfSBmcm9tICcuL3F1YXQnXHJcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuL3ZlYzMnXHJcbmltcG9ydCB7IHZlYzQgfSBmcm9tICcuL3ZlYzQnXHJcblxyXG5leHBvcnQgY2xhc3MgbWF0NCBleHRlbmRzIEZsb2F0MzJBcnJheSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHZhbHVlczogbnVtYmVyW10gPSBbXHJcbiAgICAxLjAsIDAuMCwgMC4wLCAwLjAsXHJcbiAgICAwLjAsIDEuMCwgMC4wLCAwLjAsXHJcbiAgICAwLjAsIDAuMCwgMS4wLCAwLjAsXHJcbiAgICAwLjAsIDAuMCwgMC4wLCAxLjBcclxuICBdKSB7XHJcbiAgICBzdXBlcih2YWx1ZXMuc2xpY2UoMCwgMTYpKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IGlkZW50aXR5ID0gbmV3IG1hdDQoKVxyXG5cclxuICBnZXQgZGV0ZXJtaW5hbnQoKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHYwMCA9IHRoaXNbMF1cclxuICAgIGNvbnN0IHYwMSA9IHRoaXNbMV1cclxuICAgIGNvbnN0IHYwMiA9IHRoaXNbMl1cclxuICAgIGNvbnN0IHYwMyA9IHRoaXNbM11cclxuICAgIGNvbnN0IHYxMCA9IHRoaXNbNF1cclxuICAgIGNvbnN0IHYxMSA9IHRoaXNbNV1cclxuICAgIGNvbnN0IHYxMiA9IHRoaXNbNl1cclxuICAgIGNvbnN0IHYxMyA9IHRoaXNbN11cclxuICAgIGNvbnN0IHYyMCA9IHRoaXNbOF1cclxuICAgIGNvbnN0IHYyMSA9IHRoaXNbOV1cclxuICAgIGNvbnN0IHYyMiA9IHRoaXNbMTBdXHJcbiAgICBjb25zdCB2MjMgPSB0aGlzWzExXVxyXG4gICAgY29uc3QgdjMwID0gdGhpc1sxMl1cclxuICAgIGNvbnN0IHYzMSA9IHRoaXNbMTNdXHJcbiAgICBjb25zdCB2MzIgPSB0aGlzWzE0XVxyXG4gICAgY29uc3QgdjMzID0gdGhpc1sxNV1cclxuXHJcbiAgICBjb25zdCBkZXQwMCA9IHYwMCAqIHYxMSAtIHYwMSAqIHYxMFxyXG4gICAgY29uc3QgZGV0MDEgPSB2MDAgKiB2MTIgLSB2MDIgKiB2MTBcclxuICAgIGNvbnN0IGRldDAyID0gdjAwICogdjEzIC0gdjAzICogdjEwXHJcbiAgICBjb25zdCBkZXQwMyA9IHYwMSAqIHYxMiAtIHYwMiAqIHYxMVxyXG4gICAgY29uc3QgZGV0MDQgPSB2MDEgKiB2MTMgLSB2MDMgKiB2MTFcclxuICAgIGNvbnN0IGRldDA1ID0gdjAyICogdjEzIC0gdjAzICogdjEyXHJcbiAgICBjb25zdCBkZXQwNiA9IHYyMCAqIHYzMSAtIHYyMSAqIHYzMFxyXG4gICAgY29uc3QgZGV0MDcgPSB2MjAgKiB2MzIgLSB2MjIgKiB2MzBcclxuICAgIGNvbnN0IGRldDA4ID0gdjIwICogdjMzIC0gdjIzICogdjMwXHJcbiAgICBjb25zdCBkZXQwOSA9IHYyMSAqIHYzMiAtIHYyMiAqIHYzMVxyXG4gICAgY29uc3QgZGV0MTAgPSB2MjEgKiB2MzMgLSB2MjMgKiB2MzFcclxuICAgIGNvbnN0IGRldDExID0gdjIyICogdjMzIC0gdjIzICogdjMyXHJcblxyXG4gICAgcmV0dXJuIGRldDAwICogZGV0MTEgLSBkZXQwMSAqIGRldDEwICsgZGV0MDIgKiBkZXQwOSArIGRldDAzICogZGV0MDggLSBkZXQwNCAqIGRldDA3ICsgZGV0MDUgKiBkZXQwNlxyXG4gIH1cclxuXHJcbiAgY29weShkZXN0OiBudWxsIHwgbWF0NCA9IG51bGwpOiBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDQoKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKykge1xyXG4gICAgICBkZXN0W2ldID0gdGhpc1tpXVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBjb2x1bW4oaW5kZXg6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzW2luZGV4XVxyXG4gICAgZGVzdC55ID0gdGhpc1tpbmRleCArIDRdXHJcbiAgICBkZXN0LnogPSB0aGlzW2luZGV4ICsgOF1cclxuICAgIGRlc3QudyA9IHRoaXNbaW5kZXggKyAxMl1cclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgZXF1YWxzKG90aGVyOiBtYXQ0LCB0aHJlc2hvbGQgPSBFcHNpbG9uKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyspIHtcclxuICAgICAgaWYgKE1hdGguYWJzKHRoaXNbaV0gLSBvdGhlcltpXSkgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlXHJcbiAgfVxyXG5cclxuICByZXNldCgpOiBtYXQ0IHtcclxuICAgIHRoaXNbMF0gPSAxLjBcclxuICAgIHRoaXNbMV0gPSAwLjBcclxuICAgIHRoaXNbMl0gPSAwLjBcclxuICAgIHRoaXNbM10gPSAwLjBcclxuXHJcbiAgICB0aGlzWzRdID0gMC4wXHJcbiAgICB0aGlzWzVdID0gMS4wXHJcbiAgICB0aGlzWzZdID0gMC4wXHJcbiAgICB0aGlzWzddID0gMC4wXHJcblxyXG4gICAgdGhpc1s4XSA9IDAuMFxyXG4gICAgdGhpc1s5XSA9IDAuMFxyXG4gICAgdGhpc1sxMF0gPSAxLjBcclxuICAgIHRoaXNbMTFdID0gMC4wXHJcblxyXG4gICAgdGhpc1sxMl0gPSAwLjBcclxuICAgIHRoaXNbMTNdID0gMC4wXHJcbiAgICB0aGlzWzE0XSA9IDAuMFxyXG4gICAgdGhpc1sxNV0gPSAxLjBcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgdHJhbnNwb3NlKGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdDAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdDAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgdDAzID0gdGhpc1szXVxyXG4gICAgY29uc3QgdDEyID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdDEzID0gdGhpc1s3XVxyXG4gICAgY29uc3QgdDIzID0gdGhpc1sxMV1cclxuXHJcbiAgICBkZXN0WzFdID0gdGhpc1s0XVxyXG4gICAgZGVzdFsyXSA9IHRoaXNbOF1cclxuICAgIGRlc3RbM10gPSB0aGlzWzEyXVxyXG5cclxuICAgIGRlc3RbNF0gPSB0MDFcclxuICAgIGRlc3RbNl0gPSB0aGlzWzldXHJcbiAgICBkZXN0WzddID0gdGhpc1sxM11cclxuXHJcbiAgICBkZXN0WzhdID0gdDAyXHJcbiAgICBkZXN0WzldID0gdDEyXHJcbiAgICBkZXN0WzExXSA9IHRoaXNbMTRdXHJcblxyXG4gICAgZGVzdFsxMl0gPSB0MDNcclxuICAgIGRlc3RbMTNdID0gdDEzXHJcbiAgICBkZXN0WzE0XSA9IHQyM1xyXG5cclxuICAgIGlmIChkZXN0ICE9PSB0aGlzKSB7XHJcbiAgICAgIGRlc3RbMF0gPSB0aGlzWzBdXHJcbiAgICAgIGRlc3RbNV0gPSB0aGlzWzVdXHJcbiAgICAgIGRlc3RbMTBdID0gdGhpc1sxMF1cclxuICAgICAgZGVzdFsxNV0gPSB0aGlzWzE1XVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBpbnZlcnQoZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKTogbnVsbCB8IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdjAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgdjAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdjAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgdjAzID0gdGhpc1szXVxyXG4gICAgY29uc3QgdjEwID0gdGhpc1s0XVxyXG4gICAgY29uc3QgdjExID0gdGhpc1s1XVxyXG4gICAgY29uc3QgdjEyID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdjEzID0gdGhpc1s3XVxyXG4gICAgY29uc3QgdjIwID0gdGhpc1s4XVxyXG4gICAgY29uc3QgdjIxID0gdGhpc1s5XVxyXG4gICAgY29uc3QgdjIyID0gdGhpc1sxMF1cclxuICAgIGNvbnN0IHYyMyA9IHRoaXNbMTFdXHJcbiAgICBjb25zdCB2MzAgPSB0aGlzWzEyXVxyXG4gICAgY29uc3QgdjMxID0gdGhpc1sxM11cclxuICAgIGNvbnN0IHYzMiA9IHRoaXNbMTRdXHJcbiAgICBjb25zdCB2MzMgPSB0aGlzWzE1XVxyXG5cclxuICAgIGNvbnN0IGQwMCA9IHYwMCAqIHYxMSAtIHYwMSAqIHYxMFxyXG4gICAgY29uc3QgZDAxID0gdjAwICogdjEyIC0gdjAyICogdjEwXHJcbiAgICBjb25zdCBkMDIgPSB2MDAgKiB2MTMgLSB2MDMgKiB2MTBcclxuICAgIGNvbnN0IGQwMyA9IHYwMSAqIHYxMiAtIHYwMiAqIHYxMVxyXG4gICAgY29uc3QgZDA0ID0gdjAxICogdjEzIC0gdjAzICogdjExXHJcbiAgICBjb25zdCBkMDUgPSB2MDIgKiB2MTMgLSB2MDMgKiB2MTJcclxuICAgIGNvbnN0IGQwNiA9IHYyMCAqIHYzMSAtIHYyMSAqIHYzMFxyXG4gICAgY29uc3QgZDA3ID0gdjIwICogdjMyIC0gdjIyICogdjMwXHJcbiAgICBjb25zdCBkMDggPSB2MjAgKiB2MzMgLSB2MjMgKiB2MzBcclxuICAgIGNvbnN0IGQwOSA9IHYyMSAqIHYzMiAtIHYyMiAqIHYzMVxyXG4gICAgY29uc3QgZDEwID0gdjIxICogdjMzIC0gdjIzICogdjMxXHJcbiAgICBjb25zdCBkMTEgPSB2MjIgKiB2MzMgLSB2MjMgKiB2MzJcclxuXHJcbiAgICBsZXQgZCA9IGQwMCAqIGQxMSAtIGQwMSAqIGQxMCArIGQwMiAqIGQwOSArIGQwMyAqIGQwOCAtIGQwNCAqIGQwNyArIGQwNSAqIGQwNlxyXG5cclxuICAgIGlmIChkID09PSAwLjApIHtcclxuICAgICAgcmV0dXJuIG51bGxcclxuICAgIH1cclxuXHJcbiAgICBkID0gMS4wIC8gZFxyXG5cclxuICAgIGRlc3RbMF0gPSAodjExICogZDExIC0gdjEyICogZDEwICsgdjEzICogZDA5KSAqIGRcclxuICAgIGRlc3RbMV0gPSAoLXYwMSAqIGQxMSArIHYwMiAqIGQxMCAtIHYwMyAqIGQwOSkgKiBkXHJcbiAgICBkZXN0WzJdID0gKHYzMSAqIGQwNSAtIHYzMiAqIGQwNCArIHYzMyAqIGQwMykgKiBkXHJcbiAgICBkZXN0WzNdID0gKC12MjEgKiBkMDUgKyB2MjIgKiBkMDQgLSB2MjMgKiBkMDMpICogZFxyXG5cclxuICAgIGRlc3RbNF0gPSAoLXYxMCAqIGQxMSArIHYxMiAqIGQwOCAtIHYxMyAqIGQwNykgKiBkXHJcbiAgICBkZXN0WzVdID0gKHYwMCAqIGQxMSAtIHYwMiAqIGQwOCArIHYwMyAqIGQwNykgKiBkXHJcbiAgICBkZXN0WzZdID0gKC12MzAgKiBkMDUgKyB2MzIgKiBkMDIgLSB2MzMgKiBkMDEpICogZFxyXG4gICAgZGVzdFs3XSA9ICh2MjAgKiBkMDUgLSB2MjIgKiBkMDIgKyB2MjMgKiBkMDEpICogZFxyXG5cclxuICAgIGRlc3RbOF0gPSAodjEwICogZDEwIC0gdjExICogZDA4ICsgdjEzICogZDA2KSAqIGRcclxuICAgIGRlc3RbOV0gPSAoLXYwMCAqIGQxMCArIHYwMSAqIGQwOCAtIHYwMyAqIGQwNikgKiBkXHJcbiAgICBkZXN0WzEwXSA9ICh2MzAgKiBkMDQgLSB2MzEgKiBkMDIgKyB2MzMgKiBkMDApICogZFxyXG4gICAgZGVzdFsxMV0gPSAoLXYyMCAqIGQwNCArIHYyMSAqIGQwMiAtIHYyMyAqIGQwMCkgKiBkXHJcblxyXG4gICAgZGVzdFsxMl0gPSAoLXYxMCAqIGQwOSArIHYxMSAqIGQwNyAtIHYxMiAqIGQwNikgKiBkXHJcbiAgICBkZXN0WzEzXSA9ICh2MDAgKiBkMDkgLSB2MDEgKiBkMDcgKyB2MDIgKiBkMDYpICogZFxyXG4gICAgZGVzdFsxNF0gPSAoLXYzMCAqIGQwMyArIHYzMSAqIGQwMSAtIHYzMiAqIGQwMCkgKiBkXHJcbiAgICBkZXN0WzE1XSA9ICh2MjAgKiBkMDMgLSB2MjEgKiBkMDEgKyB2MjIgKiBkMDApICogZFxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBtdWx0aXBseShvdGhlcjogbWF0NCwgZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKTogbWF0NCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhMDAgPSB0aGlzWzBdXHJcbiAgICBjb25zdCBhMDEgPSB0aGlzWzFdXHJcbiAgICBjb25zdCBhMDIgPSB0aGlzWzJdXHJcbiAgICBjb25zdCBhMDMgPSB0aGlzWzNdXHJcbiAgICBjb25zdCBhMTAgPSB0aGlzWzRdXHJcbiAgICBjb25zdCBhMTEgPSB0aGlzWzVdXHJcbiAgICBjb25zdCBhMTIgPSB0aGlzWzZdXHJcbiAgICBjb25zdCBhMTMgPSB0aGlzWzddXHJcbiAgICBjb25zdCBhMjAgPSB0aGlzWzhdXHJcbiAgICBjb25zdCBhMjEgPSB0aGlzWzldXHJcbiAgICBjb25zdCBhMjIgPSB0aGlzWzEwXVxyXG4gICAgY29uc3QgYTIzID0gdGhpc1sxMV1cclxuICAgIGNvbnN0IGEzMCA9IHRoaXNbMTJdXHJcbiAgICBjb25zdCBhMzEgPSB0aGlzWzEzXVxyXG4gICAgY29uc3QgYTMyID0gdGhpc1sxNF1cclxuICAgIGNvbnN0IGEzMyA9IHRoaXNbMTVdXHJcblxyXG4gICAgY29uc3QgYjAwID0gb3RoZXJbMF1cclxuICAgIGNvbnN0IGIwMSA9IG90aGVyWzFdXHJcbiAgICBjb25zdCBiMDIgPSBvdGhlclsyXVxyXG4gICAgY29uc3QgYjAzID0gb3RoZXJbM11cclxuICAgIGNvbnN0IGIxMCA9IG90aGVyWzRdXHJcbiAgICBjb25zdCBiMTEgPSBvdGhlcls1XVxyXG4gICAgY29uc3QgYjEyID0gb3RoZXJbNl1cclxuICAgIGNvbnN0IGIxMyA9IG90aGVyWzddXHJcbiAgICBjb25zdCBiMjAgPSBvdGhlcls4XVxyXG4gICAgY29uc3QgYjIxID0gb3RoZXJbOV1cclxuICAgIGNvbnN0IGIyMiA9IG90aGVyWzEwXVxyXG4gICAgY29uc3QgYjIzID0gb3RoZXJbMTFdXHJcbiAgICBjb25zdCBiMzAgPSBvdGhlclsxMl1cclxuICAgIGNvbnN0IGIzMSA9IG90aGVyWzEzXVxyXG4gICAgY29uc3QgYjMyID0gb3RoZXJbMTRdXHJcbiAgICBjb25zdCBiMzMgPSBvdGhlclsxNV1cclxuXHJcbiAgICBkZXN0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwICsgYjAzICogYTMwXHJcbiAgICBkZXN0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxICsgYjAzICogYTMxXHJcbiAgICBkZXN0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyICsgYjAzICogYTMyXHJcbiAgICBkZXN0WzNdID0gYjAwICogYTAzICsgYjAxICogYTEzICsgYjAyICogYTIzICsgYjAzICogYTMzXHJcblxyXG4gICAgZGVzdFs0XSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCArIGIxMyAqIGEzMFxyXG4gICAgZGVzdFs1XSA9IGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMSArIGIxMyAqIGEzMVxyXG4gICAgZGVzdFs2XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMiArIGIxMyAqIGEzMlxyXG4gICAgZGVzdFs3XSA9IGIxMCAqIGEwMyArIGIxMSAqIGExMyArIGIxMiAqIGEyMyArIGIxMyAqIGEzM1xyXG5cclxuICAgIGRlc3RbOF0gPSBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjAgKyBiMjMgKiBhMzBcclxuICAgIGRlc3RbOV0gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjEgKyBiMjMgKiBhMzFcclxuICAgIGRlc3RbMTBdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyICsgYjIzICogYTMyXHJcbiAgICBkZXN0WzExXSA9IGIyMCAqIGEwMyArIGIyMSAqIGExMyArIGIyMiAqIGEyMyArIGIyMyAqIGEzM1xyXG5cclxuICAgIGRlc3RbMTJdID0gYjMwICogYTAwICsgYjMxICogYTEwICsgYjMyICogYTIwICsgYjMzICogYTMwXHJcbiAgICBkZXN0WzEzXSA9IGIzMCAqIGEwMSArIGIzMSAqIGExMSArIGIzMiAqIGEyMSArIGIzMyAqIGEzMVxyXG4gICAgZGVzdFsxNF0gPSBiMzAgKiBhMDIgKyBiMzEgKiBhMTIgKyBiMzIgKiBhMjIgKyBiMzMgKiBhMzJcclxuICAgIGRlc3RbMTVdID0gYjMwICogYTAzICsgYjMxICogYTEzICsgYjMyICogYTIzICsgYjMzICogYTMzXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHRyYW5zZm9ybSh2ZWN0b3I6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB2ZWN0b3JcclxuXHJcbiAgICBkZXN0LnggPSB0aGlzWzBdICogeCArIHRoaXNbNF0gKiB5ICsgdGhpc1s4XSAqIHogKyB0aGlzWzEyXSAqIHdcclxuICAgIGRlc3QueSA9IHRoaXNbMV0gKiB4ICsgdGhpc1s1XSAqIHkgKyB0aGlzWzldICogeiArIHRoaXNbMTNdICogd1xyXG4gICAgZGVzdC56ID0gdGhpc1syXSAqIHggKyB0aGlzWzZdICogeSArIHRoaXNbMTBdICogeiArIHRoaXNbMTRdICogd1xyXG4gICAgZGVzdC53ID0gdGhpc1szXSAqIHggKyB0aGlzWzddICogeSArIHRoaXNbMTFdICogeiArIHRoaXNbMTVdICogd1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm1WZWMzKHZlY3RvcjogdmVjMywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IHgsIHksIHogfSA9IHZlY3RvclxyXG5cclxuICAgIGRlc3QueCA9IHRoaXNbMF0gKiB4ICsgdGhpc1s0XSAqIHkgKyB0aGlzWzhdICogeiArIHRoaXNbMTJdXHJcbiAgICBkZXN0LnkgPSB0aGlzWzFdICogeCArIHRoaXNbNV0gKiB5ICsgdGhpc1s5XSAqIHogKyB0aGlzWzEzXVxyXG4gICAgZGVzdC56ID0gdGhpc1syXSAqIHggKyB0aGlzWzZdICogeSArIHRoaXNbMTBdICogeiArIHRoaXNbMTRdXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHRvTWF0MyhkZXN0OiBudWxsIHwgbWF0MyA9IG51bGwpOiBtYXQzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDMoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3Quc2V0KFtcclxuICAgICAgdGhpc1swXSxcclxuICAgICAgdGhpc1sxXSxcclxuICAgICAgdGhpc1syXSxcclxuXHJcbiAgICAgIHRoaXNbNF0sXHJcbiAgICAgIHRoaXNbNV0sXHJcbiAgICAgIHRoaXNbNl0sXHJcblxyXG4gICAgICB0aGlzWzhdLFxyXG4gICAgICB0aGlzWzldLFxyXG4gICAgICB0aGlzWzEwXVxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc2NhbGUodmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgbWF0NCA9IG51bGwpOiBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdmVjdG9yXHJcblxyXG4gICAgZGVzdFswXSA9IHRoaXNbMF0gKiB4XHJcbiAgICBkZXN0WzFdID0gdGhpc1sxXSAqIHhcclxuICAgIGRlc3RbMl0gPSB0aGlzWzJdICogeFxyXG4gICAgZGVzdFszXSA9IHRoaXNbM10gKiB4XHJcblxyXG4gICAgZGVzdFs0XSA9IHRoaXNbNF0gKiB5XHJcbiAgICBkZXN0WzVdID0gdGhpc1s1XSAqIHlcclxuICAgIGRlc3RbNl0gPSB0aGlzWzZdICogeVxyXG4gICAgZGVzdFs3XSA9IHRoaXNbN10gKiB5XHJcblxyXG4gICAgZGVzdFs4XSA9IHRoaXNbOF0gKiB6XHJcbiAgICBkZXN0WzldID0gdGhpc1s5XSAqIHpcclxuICAgIGRlc3RbMTBdID0gdGhpc1sxMF0gKiB6XHJcbiAgICBkZXN0WzExXSA9IHRoaXNbMTFdICogelxyXG5cclxuICAgIGlmIChkZXN0ICE9PSB0aGlzKSB7XHJcbiAgICAgIGRlc3RbMTJdID0gdGhpc1sxMl1cclxuICAgICAgZGVzdFsxM10gPSB0aGlzWzEzXVxyXG4gICAgICBkZXN0WzE0XSA9IHRoaXNbMTRdXHJcbiAgICAgIGRlc3RbMTVdID0gdGhpc1sxNV1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgcm90YXRlKGFuZ2xlOiBudW1iZXIsIGF4aXM6IHZlYzMsIGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG51bGwgfCBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB7IHgsIHksIHogfSA9IGF4aXNcclxuXHJcbiAgICBsZXQgbGVuZ3RoID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHJcbiAgICBpZiAoIWxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGlmIChsZW5ndGggIT09IDEpIHtcclxuICAgICAgbGVuZ3RoID0gMSAvIGxlbmd0aFxyXG4gICAgICB4ICo9IGxlbmd0aFxyXG4gICAgICB5ICo9IGxlbmd0aFxyXG4gICAgICB6ICo9IGxlbmd0aFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHMgPSBNYXRoLnNpbihhbmdsZSlcclxuICAgIGNvbnN0IGMgPSBNYXRoLmNvcyhhbmdsZSlcclxuXHJcbiAgICBjb25zdCB0ID0gMS4wIC0gY1xyXG5cclxuICAgIGNvbnN0IGEwMCA9IHRoaXNbMF1cclxuICAgIGNvbnN0IGEwMSA9IHRoaXNbMV1cclxuICAgIGNvbnN0IGEwMiA9IHRoaXNbMl1cclxuICAgIGNvbnN0IGEwMyA9IHRoaXNbM11cclxuICAgIGNvbnN0IGExMCA9IHRoaXNbNF1cclxuICAgIGNvbnN0IGExMSA9IHRoaXNbNV1cclxuICAgIGNvbnN0IGExMiA9IHRoaXNbNl1cclxuICAgIGNvbnN0IGExMyA9IHRoaXNbN11cclxuICAgIGNvbnN0IGEyMCA9IHRoaXNbOF1cclxuICAgIGNvbnN0IGEyMSA9IHRoaXNbOV1cclxuICAgIGNvbnN0IGEyMiA9IHRoaXNbMTBdXHJcbiAgICBjb25zdCBhMjMgPSB0aGlzWzExXVxyXG5cclxuICAgIGNvbnN0IGIwMCA9IHggKiB4ICogdCArIGNcclxuICAgIGNvbnN0IGIwMSA9IHkgKiB4ICogdCArIHogKiBzXHJcbiAgICBjb25zdCBiMDIgPSB6ICogeCAqIHQgLSB5ICogc1xyXG4gICAgY29uc3QgYjEwID0geCAqIHkgKiB0IC0geiAqIHNcclxuICAgIGNvbnN0IGIxMSA9IHkgKiB5ICogdCArIGNcclxuICAgIGNvbnN0IGIxMiA9IHogKiB5ICogdCArIHggKiBzXHJcbiAgICBjb25zdCBiMjAgPSB4ICogeiAqIHQgKyB5ICogc1xyXG4gICAgY29uc3QgYjIxID0geSAqIHogKiB0IC0geCAqIHNcclxuICAgIGNvbnN0IGIyMiA9IHogKiB6ICogdCArIGNcclxuXHJcbiAgICBkZXN0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyXHJcbiAgICBkZXN0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyXHJcbiAgICBkZXN0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyXHJcbiAgICBkZXN0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyXHJcblxyXG4gICAgZGVzdFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMlxyXG4gICAgZGVzdFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMlxyXG4gICAgZGVzdFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMlxyXG4gICAgZGVzdFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMlxyXG5cclxuICAgIGRlc3RbOF0gPSBhMDAgKiBiMjAgKyBhMTAgKiBiMjEgKyBhMjAgKiBiMjJcclxuICAgIGRlc3RbOV0gPSBhMDEgKiBiMjAgKyBhMTEgKiBiMjEgKyBhMjEgKiBiMjJcclxuICAgIGRlc3RbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyXHJcbiAgICBkZXN0WzExXSA9IGEwMyAqIGIyMCArIGExMyAqIGIyMSArIGEyMyAqIGIyMlxyXG5cclxuICAgIGlmIChkZXN0ICE9PSB0aGlzKSB7XHJcbiAgICAgIGRlc3RbMTJdID0gdGhpc1sxMl1cclxuICAgICAgZGVzdFsxM10gPSB0aGlzWzEzXVxyXG4gICAgICBkZXN0WzE0XSA9IHRoaXNbMTRdXHJcbiAgICAgIGRlc3RbMTVdID0gdGhpc1sxNV1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgdHJhbnNsYXRlKHZlY3RvcjogdmVjMywgZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKTogbWF0NCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB4ID0gdmVjdG9yLnhcclxuICAgIGNvbnN0IHkgPSB2ZWN0b3IueVxyXG4gICAgY29uc3QgeiA9IHZlY3Rvci56XHJcblxyXG4gICAgaWYgKGRlc3QgIT09IHRoaXMpIHtcclxuICAgICAgZm9yIChsZXQgaXQgPSAwOyBpdCA8IDEyOyBpdCsrKSB7XHJcbiAgICAgICAgZGVzdFtpdF0gPSB0aGlzW2l0XVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdFsxMl0gPSB0aGlzWzEyXSArIHRoaXNbMF0gKiB4ICsgdGhpc1s0XSAqIHkgKyB0aGlzWzhdICogelxyXG4gICAgZGVzdFsxM10gPSB0aGlzWzEzXSArIHRoaXNbMV0gKiB4ICsgdGhpc1s1XSAqIHkgKyB0aGlzWzldICogelxyXG4gICAgZGVzdFsxNF0gPSB0aGlzWzE0XSArIHRoaXNbMl0gKiB4ICsgdGhpc1s2XSAqIHkgKyB0aGlzWzEwXSAqIHpcclxuICAgIGRlc3RbMTVdID0gdGhpc1sxNV0gKyB0aGlzWzNdICogeCArIHRoaXNbN10gKiB5ICsgdGhpc1sxMV0gKiB6XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGRlY29tcG9zZSh0cmFuc2xhdGlvbjogdmVjMywgcm90YXRpb246IG1hdDMsIHNjYWxpbmc6IG51bGwgfCB2ZWMzID0gbnVsbCkge1xyXG4gICAgY29uc3QgdjAwID0gdGhpc1swXVxyXG4gICAgY29uc3QgdjAxID0gdGhpc1sxXVxyXG4gICAgY29uc3QgdjAyID0gdGhpc1syXVxyXG4gICAgY29uc3QgdjEwID0gdGhpc1s0XVxyXG4gICAgY29uc3QgdjExID0gdGhpc1s1XVxyXG4gICAgY29uc3QgdjEyID0gdGhpc1s2XVxyXG4gICAgY29uc3QgdjIwID0gdGhpc1s4XVxyXG4gICAgY29uc3QgdjIxID0gdGhpc1s5XVxyXG4gICAgY29uc3QgdjIyID0gdGhpc1sxMF1cclxuICAgIGNvbnN0IHYzMCA9IHRoaXNbMTJdXHJcbiAgICBjb25zdCB2MzEgPSB0aGlzWzEzXVxyXG4gICAgY29uc3QgdjMyID0gdGhpc1sxNF1cclxuXHJcbiAgICBpZiAoc2NhbGluZyAhPT0gbnVsbCkge1xyXG4gICAgICBzY2FsaW5nLnggPSBNYXRoLnNxcnQodjAwICogdjAwICsgdjAxICogdjAxICsgdjAyICogdjAyKVxyXG4gICAgICBzY2FsaW5nLnkgPSBNYXRoLnNxcnQodjEwICogdjEwICsgdjExICogdjExICsgdjEyICogdjEyKVxyXG4gICAgICBzY2FsaW5nLnogPSBNYXRoLnNxcnQodjIwICogdjIwICsgdjIxICogdjIxICsgdjIyICogdjIyKVxyXG4gICAgfVxyXG5cclxuICAgIHJvdGF0aW9uLnNldChbdjAwLCB2MDEsIHYwMiwgdjEwLCB2MTEsIHYxMiwgdjIwLCB2MjEsIHYyMl0pXHJcblxyXG4gICAgdHJhbnNsYXRpb24ueHl6ID0gW3YzMCwgdjMxLCB2MzJdXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY29uc3RydWN0KHJvdGF0aW9uOiBxdWF0LCB0cmFuc2xhdGlvbjogdmVjMywgZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKSB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBtYXQ0KClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBxeCA9IHJvdGF0aW9uLnhcclxuICAgIGNvbnN0IHF5ID0gcm90YXRpb24ueVxyXG4gICAgY29uc3QgcXogPSByb3RhdGlvbi56XHJcbiAgICBjb25zdCBxdyA9IHJvdGF0aW9uLndcclxuXHJcbiAgICBjb25zdCB2eCA9IHRyYW5zbGF0aW9uLnhcclxuICAgIGNvbnN0IHZ5ID0gdHJhbnNsYXRpb24ueVxyXG4gICAgY29uc3QgdnogPSB0cmFuc2xhdGlvbi56XHJcblxyXG4gICAgY29uc3QgeDIgPSBxeCArIHF4XHJcbiAgICBjb25zdCB5MiA9IHF5ICsgcXlcclxuICAgIGNvbnN0IHoyID0gcXogKyBxelxyXG4gICAgY29uc3QgeHggPSBxeCAqIHgyXHJcbiAgICBjb25zdCB4eSA9IHF4ICogeTJcclxuICAgIGNvbnN0IHh6ID0gcXggKiB6MlxyXG4gICAgY29uc3QgeXkgPSBxeSAqIHkyXHJcbiAgICBjb25zdCB5eiA9IHF5ICogejJcclxuICAgIGNvbnN0IHp6ID0gcXogKiB6MlxyXG4gICAgY29uc3Qgd3ggPSBxdyAqIHgyXHJcbiAgICBjb25zdCB3eSA9IHF3ICogeTJcclxuICAgIGNvbnN0IHd6ID0gcXcgKiB6MlxyXG5cclxuICAgIGRlc3Quc2V0KFtcclxuICAgICAgMS4wIC0gKHl5ICsgenopLFxyXG4gICAgICB4eSArIHd6LFxyXG4gICAgICB4eiAtIHd5LFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICB4eSAtIHd6LFxyXG4gICAgICAxLjAgLSAoeHggKyB6eiksXHJcbiAgICAgIHl6ICsgd3gsXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIHh6ICsgd3ksXHJcbiAgICAgIHl6IC0gd3gsXHJcbiAgICAgIDEuMCAtICh4eCArIHl5KSxcclxuICAgICAgMC4wLFxyXG5cclxuICAgICAgdngsXHJcbiAgICAgIHZ5LFxyXG4gICAgICB2eixcclxuICAgICAgMS4wXHJcbiAgICBdKVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbXVsdGlwbHkobTE6IG1hdDQsIG0yOiBtYXQ0LCBkZXN0OiBudWxsIHwgbWF0NCA9IG51bGwpOiBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDQoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGEwMCA9IG0xWzBdXHJcbiAgICBjb25zdCBhMDEgPSBtMVsxXVxyXG4gICAgY29uc3QgYTAyID0gbTFbMl1cclxuICAgIGNvbnN0IGEwMyA9IG0xWzNdXHJcbiAgICBjb25zdCBhMTAgPSBtMVs0XVxyXG4gICAgY29uc3QgYTExID0gbTFbNV1cclxuICAgIGNvbnN0IGExMiA9IG0xWzZdXHJcbiAgICBjb25zdCBhMTMgPSBtMVs3XVxyXG4gICAgY29uc3QgYTIwID0gbTFbOF1cclxuICAgIGNvbnN0IGEyMSA9IG0xWzldXHJcbiAgICBjb25zdCBhMjIgPSBtMVsxMF1cclxuICAgIGNvbnN0IGEyMyA9IG0xWzExXVxyXG4gICAgY29uc3QgYTMwID0gbTFbMTJdXHJcbiAgICBjb25zdCBhMzEgPSBtMVsxM11cclxuICAgIGNvbnN0IGEzMiA9IG0xWzE0XVxyXG4gICAgY29uc3QgYTMzID0gbTFbMTVdXHJcblxyXG4gICAgY29uc3QgYjAwID0gbTJbMF1cclxuICAgIGNvbnN0IGIwMSA9IG0yWzFdXHJcbiAgICBjb25zdCBiMDIgPSBtMlsyXVxyXG4gICAgY29uc3QgYjAzID0gbTJbM11cclxuICAgIGNvbnN0IGIxMCA9IG0yWzRdXHJcbiAgICBjb25zdCBiMTEgPSBtMls1XVxyXG4gICAgY29uc3QgYjEyID0gbTJbNl1cclxuICAgIGNvbnN0IGIxMyA9IG0yWzddXHJcbiAgICBjb25zdCBiMjAgPSBtMls4XVxyXG4gICAgY29uc3QgYjIxID0gbTJbOV1cclxuICAgIGNvbnN0IGIyMiA9IG0yWzEwXVxyXG4gICAgY29uc3QgYjIzID0gbTJbMTFdXHJcbiAgICBjb25zdCBiMzAgPSBtMlsxMl1cclxuICAgIGNvbnN0IGIzMSA9IG0yWzEzXVxyXG4gICAgY29uc3QgYjMyID0gbTJbMTRdXHJcbiAgICBjb25zdCBiMzMgPSBtMlsxNV1cclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMCArIGIwMyAqIGEzMCxcclxuICAgICAgYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxICsgYjAzICogYTMxLFxyXG4gICAgICBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjIgKyBiMDMgKiBhMzIsXHJcbiAgICAgIGIwMCAqIGEwMyArIGIwMSAqIGExMyArIGIwMiAqIGEyMyArIGIwMyAqIGEzMyxcclxuXHJcbiAgICAgIGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCArIGIxMyAqIGEzMCxcclxuICAgICAgYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxICsgYjEzICogYTMxLFxyXG4gICAgICBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjIgKyBiMTMgKiBhMzIsXHJcbiAgICAgIGIxMCAqIGEwMyArIGIxMSAqIGExMyArIGIxMiAqIGEyMyArIGIxMyAqIGEzMyxcclxuXHJcbiAgICAgIGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMCArIGIyMyAqIGEzMCxcclxuICAgICAgYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxICsgYjIzICogYTMxLFxyXG4gICAgICBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjIgKyBiMjMgKiBhMzIsXHJcbiAgICAgIGIyMCAqIGEwMyArIGIyMSAqIGExMyArIGIyMiAqIGEyMyArIGIyMyAqIGEzMyxcclxuXHJcbiAgICAgIGIzMCAqIGEwMCArIGIzMSAqIGExMCArIGIzMiAqIGEyMCArIGIzMyAqIGEzMCxcclxuICAgICAgYjMwICogYTAxICsgYjMxICogYTExICsgYjMyICogYTIxICsgYjMzICogYTMxLFxyXG4gICAgICBiMzAgKiBhMDIgKyBiMzEgKiBhMTIgKyBiMzIgKiBhMjIgKyBiMzMgKiBhMzIsXHJcbiAgICAgIGIzMCAqIGEwMyArIGIzMSAqIGExMyArIGIzMiAqIGEyMyArIGIzMyAqIGEzM1xyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZydXN0dW0obGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyLCBib3R0b206IG51bWJlciwgdG9wOiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIsIGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0NCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmwgPSByaWdodCAtIGxlZnRcclxuICAgIGNvbnN0IHRiID0gdG9wIC0gYm90dG9tXHJcbiAgICBjb25zdCBmbiA9IGZhciAtIG5lYXJcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIChuZWFyICogMi4wKSAvIHJsLFxyXG4gICAgICAwLjAsXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG5cclxuICAgICAgMC4wLFxyXG4gICAgICAobmVhciAqIDIuMCkgLyB0YixcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAocmlnaHQgKyBsZWZ0KSAvIHJsLFxyXG4gICAgICAodG9wICsgYm90dG9tKSAvIHRiLFxyXG4gICAgICAtKGZhciArIG5lYXIpIC8gZm4sXHJcbiAgICAgIC0xLjAsXHJcblxyXG4gICAgICAwLjAsXHJcbiAgICAgIDAuMCxcclxuICAgICAgLShmYXIgKiBuZWFyICogMi4wKSAvIGZuLFxyXG4gICAgICAwLjBcclxuICAgIF0pXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBwZXJzcGVjdGl2ZShmb3Y6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIsIGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0NCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdG9wID0gbmVhciAqIE1hdGgudGFuKChmb3YgKiBNYXRoLlBJKSAvIDM2MC4wKVxyXG4gICAgY29uc3QgcmlnaHQgPSB0b3AgKiBhc3BlY3RcclxuXHJcbiAgICByZXR1cm4gbWF0NC5mcnVzdHVtKC1yaWdodCwgcmlnaHQsIC10b3AsIHRvcCwgbmVhciwgZmFyLCBkZXN0KVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG9ydGhvZ3JhcGhpYyhsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIsIGJvdHRvbTogbnVtYmVyLCB0b3A6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlciwgZGVzdDogbnVsbCB8IG1hdDQgPSBudWxsKTogbWF0NCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBtYXQ0KClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBybCA9IHJpZ2h0IC0gbGVmdFxyXG4gICAgY29uc3QgdGIgPSB0b3AgLSBib3R0b21cclxuICAgIGNvbnN0IGZuID0gZmFyIC0gbmVhclxyXG5cclxuICAgIGRlc3Quc2V0KFtcclxuICAgICAgMi4wIC8gcmwsXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAwLjAsXHJcbiAgICAgIDIgLyB0YixcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAwLjAsXHJcbiAgICAgIDAuMCxcclxuICAgICAgLTIuMCAvIGZuLFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICAtKGxlZnQgKyByaWdodCkgLyBybCxcclxuICAgICAgLSh0b3AgKyBib3R0b20pIC8gdGIsXHJcbiAgICAgIC0oZmFyICsgbmVhcikgLyBmbixcclxuICAgICAgMS4wXHJcbiAgICBdKVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcmVmbGVjdGlvbihwbGFuZTogdmVjNCwgZGVzdD86IG1hdDQpIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDQoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHh4ID0gcGxhbmUueCAqIHBsYW5lLnhcclxuICAgIGNvbnN0IHh5ID0gcGxhbmUueCAqIHBsYW5lLnlcclxuICAgIGNvbnN0IHh6ID0gcGxhbmUueCAqIHBsYW5lLnpcclxuICAgIGNvbnN0IHh3ID0gcGxhbmUueCAqIHBsYW5lLndcclxuICAgIGNvbnN0IHl5ID0gcGxhbmUueSAqIHBsYW5lLnlcclxuICAgIGNvbnN0IHl6ID0gcGxhbmUueSAqIHBsYW5lLnpcclxuICAgIGNvbnN0IHl3ID0gcGxhbmUueSAqIHBsYW5lLndcclxuICAgIGNvbnN0IHp6ID0gcGxhbmUueiAqIHBsYW5lLnpcclxuICAgIGNvbnN0IHp3ID0gcGxhbmUueiAqIHBsYW5lLndcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIDEuMCAtIDIuMCAqIHh4LFxyXG4gICAgICAtMi4wICogeHksXHJcbiAgICAgIC0yLjAgKiB4eixcclxuICAgICAgLTIuMCAqIHh3LFxyXG5cclxuICAgICAgLTIuMCAqIHh5LFxyXG4gICAgICAxLjAgLSAyLjAgKiB5eSxcclxuICAgICAgLTIuMCAqIHl6LFxyXG4gICAgICAtMi4wICogeXcsXHJcblxyXG4gICAgICAtMi4wICogeHosXHJcbiAgICAgIC0yLjAgKiB5eixcclxuICAgICAgMS4wIC0gMi4wICogenosXHJcbiAgICAgIC0yLjAgKiB6dyxcclxuXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcbiAgICAgIDEuMFxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGxvb2tBdChleWU6IHZlYzMsIHRhcmdldDogdmVjMywgdXA6IHZlYzMgPSB2ZWMzLnVwLCBkZXN0OiBudWxsIHwgbWF0NCA9IG51bGwpOiBtYXQ0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IG1hdDQoKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChleWUuZXF1YWxzKHRhcmdldCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkuY29weShkZXN0KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHogPSB2ZWMzLnN1YnRyYWN0KGV5ZSwgdGFyZ2V0KS5ub3JtYWxpemUoKVxyXG5cclxuICAgIGNvbnN0IHggPSB2ZWMzLmNyb3NzKHVwLCB6KS5ub3JtYWxpemUoKVxyXG4gICAgY29uc3QgeSA9IHZlYzMuY3Jvc3MoeiwgeCkubm9ybWFsaXplKClcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIHgueCxcclxuICAgICAgeC55LFxyXG4gICAgICB4LnosXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIHkueCxcclxuICAgICAgeS55LFxyXG4gICAgICB5LnosXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIHoueCxcclxuICAgICAgei55LFxyXG4gICAgICB6LnosXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIGV5ZS54LFxyXG4gICAgICBleWUueSxcclxuICAgICAgZXllLnosXHJcbiAgICAgIDEuMFxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnXHJcbmltcG9ydCB7IG1hdDMgfSBmcm9tICcuL21hdDMnXHJcbmltcG9ydCB7IG1hdDQgfSBmcm9tICcuL21hdDQnXHJcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuL3ZlYzMnXHJcblxyXG5leHBvcnQgY2xhc3MgcXVhdCBleHRlbmRzIEZsb2F0MzJBcnJheSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHZhbHVlczogbnVtYmVyW10gPSBbMC4wLCAwLjAsIDAuMCwgMS4wXSkge1xyXG4gICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDQpKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IGlkZW50aXR5ID0gbmV3IHF1YXQoKVxyXG5cclxuICBnZXQgeCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbMF1cclxuICB9XHJcblxyXG4gIHNldCB4KHg6IG51bWJlcikge1xyXG4gICAgdGhpc1swXSA9IHhcclxuICB9XHJcblxyXG4gIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1sxXVxyXG4gIH1cclxuXHJcbiAgc2V0IHkoeTogbnVtYmVyKSB7XHJcbiAgICB0aGlzWzFdID0geVxyXG4gIH1cclxuXHJcbiAgZ2V0IHooKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzJdXHJcbiAgfVxyXG5cclxuICBzZXQgeih6OiBudW1iZXIpIHtcclxuICAgIHRoaXNbMl0gPSB6XHJcbiAgfVxyXG5cclxuICBnZXQgdygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbM11cclxuICB9XHJcblxyXG4gIHNldCB3KHc6IG51bWJlcikge1xyXG4gICAgdGhpc1szXSA9IHdcclxuICB9XHJcblxyXG4gIGdldCB5YXcoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBNYXRoLmFzaW4oMi4wICogKHRoaXMueCAqIHRoaXMueiAtIHRoaXMudyAqIHRoaXMueSkpXHJcbiAgfVxyXG5cclxuICBzZXQgeWF3KHlhdzogbnVtYmVyKSB7XHJcbiAgICBxdWF0LmZyb21FdWxlckFuZ2xlcyh5YXcsIHRoaXMucGl0Y2gsIHRoaXMucm9sbCwgdGhpcylcclxuICB9XHJcblxyXG4gIGdldCBwaXRjaCgpOiBudW1iZXIge1xyXG4gICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzXHJcblxyXG4gICAgcmV0dXJuIE1hdGguYXRhbjIoMi4wICogKHkgKiB6ICsgdyAqIHgpLCB3ICogdyAtIHggKiB4IC0geSAqIHkgKyB6ICogeilcclxuICB9XHJcblxyXG4gIHNldCBwaXRjaChwaXRjaDogbnVtYmVyKSB7XHJcbiAgICBxdWF0LmZyb21FdWxlckFuZ2xlcyh0aGlzLnlhdywgcGl0Y2gsIHRoaXMucm9sbCwgdGhpcylcclxuICB9XHJcblxyXG4gIGdldCByb2xsKCk6IG51bWJlciB7XHJcbiAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4gTWF0aC5hdGFuMigyLjAgKiAoeCAqIHkgKyB3ICogeiksIHcgKiB3ICsgeCAqIHggLSB5ICogeSAtIHogKiB6KVxyXG4gIH1cclxuXHJcbiAgc2V0IHJvbGwocm9sbDogbnVtYmVyKSB7XHJcbiAgICBxdWF0LmZyb21FdWxlckFuZ2xlcyh0aGlzLnlhdywgdGhpcy5waXRjaCwgcm9sbCwgdGhpcylcclxuICB9XHJcblxyXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5zcXVhcmVkTGVuZ3RoKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHNxdWFyZWRMZW5ndGgoKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHsgeCwgeSwgeiwgdyB9ID0gdGhpc1xyXG5cclxuICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogd1xyXG4gIH1cclxuXHJcbiAgY29weShkZXN0OiBudWxsIHwgcXVhdCA9IG51bGwpOiBxdWF0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHF1YXQoKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgIGRlc3RbaV0gPSB0aGlzW2ldXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHJlc2V0KCk6IHF1YXQge1xyXG4gICAgdGhpcy54ID0gMC4wXHJcbiAgICB0aGlzLnkgPSAwLjBcclxuICAgIHRoaXMueiA9IDAuMFxyXG4gICAgdGhpcy53ID0gMS4wXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGNhbGN1bGF0ZVcoKTogcXVhdCB7XHJcbiAgICBjb25zdCB7IHgsIHksIHogfSA9IHRoaXNcclxuXHJcbiAgICB0aGlzLncgPSAtTWF0aC5zcXJ0KE1hdGguYWJzKDEuMCAtIHggKiB4IC0geSAqIHkgLSB6ICogeikpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGludmVydChkZXN0OiBudWxsIHwgcXVhdCA9IG51bGwpOiBxdWF0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRvdCA9IHF1YXQuZG90KHRoaXMsIHRoaXMpXHJcblxyXG4gICAgaWYgKCFkb3QpIHtcclxuICAgICAgZGVzdC5zZXQoWzAuMCwgMC4wLCAwLjAsIDAuMF0pXHJcblxyXG4gICAgICByZXR1cm4gZGVzdFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGludkRvdCA9IGRvdCA/IDEuMCAvIGRvdCA6IDAuMFxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAqIC1pbnZEb3RcclxuICAgIGRlc3QueSA9IHRoaXMueSAqIC1pbnZEb3RcclxuICAgIGRlc3QueiA9IHRoaXMueiAqIC1pbnZEb3RcclxuICAgIGRlc3QudyA9IHRoaXMudyAqIGludkRvdFxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBjb25qdWdhdGUoZGVzdDogbnVsbCB8IHF1YXQgPSBudWxsKTogcXVhdCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzLnggKiAtMVxyXG4gICAgZGVzdC55ID0gdGhpcy55ICogLTFcclxuICAgIGRlc3QueiA9IHRoaXMueiAqIC0xXHJcbiAgICBkZXN0LncgPSB0aGlzLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbm9ybWFsaXplKGRlc3Q6IG51bGwgfCBxdWF0ID0gbnVsbCk6IHF1YXQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzXHJcblxyXG4gICAgbGV0IGxlbmd0aCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdylcclxuXHJcbiAgICBpZiAoIWxlbmd0aCkge1xyXG4gICAgICBkZXN0LnggPSAwXHJcbiAgICAgIGRlc3QueSA9IDBcclxuICAgICAgZGVzdC56ID0gMFxyXG4gICAgICBkZXN0LncgPSAwXHJcblxyXG4gICAgICByZXR1cm4gZGVzdFxyXG4gICAgfVxyXG5cclxuICAgIGxlbmd0aCA9IDEgLyBsZW5ndGhcclxuXHJcbiAgICBkZXN0LnggPSB4ICogbGVuZ3RoXHJcbiAgICBkZXN0LnkgPSB5ICogbGVuZ3RoXHJcbiAgICBkZXN0LnogPSB6ICogbGVuZ3RoXHJcbiAgICBkZXN0LncgPSB3ICogbGVuZ3RoXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGVxdWFscyhxOiBxdWF0LCB0aHJlc2hvbGQgPSBFcHNpbG9uKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoTWF0aC5hYnModGhpcy54IC0gcS54KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoTWF0aC5hYnModGhpcy55IC0gcS55KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoTWF0aC5hYnModGhpcy56IC0gcS56KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoTWF0aC5hYnModGhpcy53IC0gcS53KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYWRkKG90aGVyOiBxdWF0LCBkZXN0OiBudWxsIHwgcXVhdCA9IG51bGwpOiBxdWF0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCArIG90aGVyLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSArIG90aGVyLnlcclxuICAgIGRlc3QueiA9IHRoaXMueiArIG90aGVyLnpcclxuICAgIGRlc3QudyA9IHRoaXMudyArIG90aGVyLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbXVsdGlwbHkob3RoZXI6IHF1YXQsIGRlc3Q6IG51bGwgfCBxdWF0ID0gbnVsbCk6IHF1YXQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcTF4ID0gdGhpcy54XHJcbiAgICBjb25zdCBxMXkgPSB0aGlzLnlcclxuICAgIGNvbnN0IHExeiA9IHRoaXMuelxyXG4gICAgY29uc3QgcTF3ID0gdGhpcy53XHJcblxyXG4gICAgY29uc3QgcTJ4ID0gb3RoZXIueFxyXG4gICAgY29uc3QgcTJ5ID0gb3RoZXIueVxyXG4gICAgY29uc3QgcTJ6ID0gb3RoZXIuelxyXG4gICAgY29uc3QgcTJ3ID0gb3RoZXIud1xyXG5cclxuICAgIGRlc3QueCA9IHExeCAqIHEydyArIHExdyAqIHEyeCArIHExeSAqIHEyeiAtIHExeiAqIHEyeVxyXG4gICAgZGVzdC55ID0gcTF5ICogcTJ3ICsgcTF3ICogcTJ5ICsgcTF6ICogcTJ4IC0gcTF4ICogcTJ6XHJcbiAgICBkZXN0LnogPSBxMXogKiBxMncgKyBxMXcgKiBxMnogKyBxMXggKiBxMnkgLSBxMXkgKiBxMnhcclxuICAgIGRlc3QudyA9IHExdyAqIHEydyAtIHExeCAqIHEyeCAtIHExeSAqIHEyeSAtIHExeiAqIHEyelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm1WZWMzKHZlY3RvcjogdmVjMywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyB4LCB5LCB6IH0gPSB2ZWN0b3I7XHJcblxyXG4gICAgY29uc3QgcTEgPSBuZXcgcXVhdChbeCwgeSwgeiwgMF0pO1xyXG5cclxuICAgIGNvbnN0IHEyID0gdGhpcy5jb3B5KCkuaW52ZXJ0KCk7XHJcbiAgICBjb25zdCBxMyA9IHRoaXMuY29weSgpLm11bHRpcGx5KHExKVxyXG4gICAgY29uc3QgcTQgPSBxMy5jb3B5KCkubXVsdGlwbHkocTIpO1xyXG5cclxuICAgIGRlc3QueHl6ID0gW3E0LngsIHE0LnksIHE0LnpdO1xyXG5cclxuICAgIHJldHVybiBkZXN0O1xyXG4gIH1cclxuXHJcbiAgdG9NYXQzKGRlc3Q6IG51bGwgfCBtYXQzID0gbnVsbCk6IG1hdDMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0MygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzXHJcblxyXG4gICAgY29uc3QgeDIgPSB4ICsgeFxyXG4gICAgY29uc3QgeTIgPSB5ICsgeVxyXG4gICAgY29uc3QgejIgPSB6ICsgelxyXG5cclxuICAgIGNvbnN0IHh4ID0geCAqIHgyXHJcbiAgICBjb25zdCB4eSA9IHggKiB5MlxyXG4gICAgY29uc3QgeHogPSB4ICogejJcclxuICAgIGNvbnN0IHl5ID0geSAqIHkyXHJcbiAgICBjb25zdCB5eiA9IHkgKiB6MlxyXG4gICAgY29uc3QgenogPSB6ICogejJcclxuICAgIGNvbnN0IHd4ID0gdyAqIHgyXHJcbiAgICBjb25zdCB3eSA9IHcgKiB5MlxyXG4gICAgY29uc3Qgd3ogPSB3ICogejJcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIDEuMCAtICh5eSArIHp6KSxcclxuICAgICAgeHkgKyB3eixcclxuICAgICAgeHogLSB3eSxcclxuXHJcbiAgICAgIHh5IC0gd3osXHJcbiAgICAgIDEuMCAtICh4eCArIHp6KSxcclxuICAgICAgeXogKyB3eCxcclxuXHJcbiAgICAgIHh6ICsgd3ksXHJcbiAgICAgIHl6IC0gd3gsXHJcbiAgICAgIDEuMCAtICh4eCArIHl5KVxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgdG9NYXQ0KGRlc3Q6IG51bGwgfCBtYXQ0ID0gbnVsbCk6IG1hdDQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgbWF0NCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzXHJcblxyXG4gICAgY29uc3QgeDIgPSB4ICsgeFxyXG4gICAgY29uc3QgeTIgPSB5ICsgeVxyXG4gICAgY29uc3QgejIgPSB6ICsgelxyXG5cclxuICAgIGNvbnN0IHh4ID0geCAqIHgyXHJcbiAgICBjb25zdCB4eSA9IHggKiB5MlxyXG4gICAgY29uc3QgeHogPSB4ICogejJcclxuICAgIGNvbnN0IHl5ID0geSAqIHkyXHJcbiAgICBjb25zdCB5eiA9IHkgKiB6MlxyXG4gICAgY29uc3QgenogPSB6ICogejJcclxuICAgIGNvbnN0IHd4ID0gdyAqIHgyXHJcbiAgICBjb25zdCB3eSA9IHcgKiB5MlxyXG4gICAgY29uc3Qgd3ogPSB3ICogejJcclxuXHJcbiAgICBkZXN0LnNldChbXHJcbiAgICAgIDEuMCAtICh5eSArIHp6KSxcclxuICAgICAgeHkgKyB3eixcclxuICAgICAgeHogLSB3eSxcclxuICAgICAgMC4wLFxyXG5cclxuICAgICAgeHkgLSB3eixcclxuICAgICAgMS4wIC0gKHh4ICsgenopLFxyXG4gICAgICB5eiArIHd4LFxyXG4gICAgICAwLjAsXHJcblxyXG4gICAgICB4eiArIHd5LFxyXG4gICAgICB5eiAtIHd4LFxyXG4gICAgICAxLjAgLSAoeHggKyB5eSksXHJcbiAgICAgIDAuMCxcclxuXHJcbiAgICAgIDAuMCxcclxuICAgICAgMC4wLFxyXG4gICAgICAwLjAsXHJcbiAgICAgIDEuMFxyXG4gICAgXSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgdG9KU09OKCkge1xyXG4gICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzXHJcblxyXG4gICAgcmV0dXJuIFt4LCB5LCB6LCB3XVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRvdChxMTogcXVhdCwgcTI6IHF1YXQpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHExLnggKiBxMi54ICsgcTEueSAqIHEyLnkgKyBxMS56ICogcTIueiArIHExLncgKiBxMi53XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgYWRkKHExOiBxdWF0LCBxMjogcXVhdCwgZGVzdDogbnVsbCB8IHF1YXQgPSBudWxsKTogcXVhdCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBxdWF0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSBxMS54ICsgcTIueFxyXG4gICAgZGVzdC55ID0gcTEueSArIHEyLnlcclxuICAgIGRlc3QueiA9IHExLnogKyBxMi56XHJcbiAgICBkZXN0LncgPSBxMS53ICsgcTIud1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbXVsdGlwbHkocTE6IHF1YXQsIHEyOiBxdWF0LCBkZXN0OiBudWxsIHwgcXVhdCA9IG51bGwpOiBxdWF0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHF1YXQoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHExeCA9IHExLnhcclxuICAgIGNvbnN0IHExeSA9IHExLnlcclxuICAgIGNvbnN0IHExeiA9IHExLnpcclxuICAgIGNvbnN0IHExdyA9IHExLndcclxuXHJcbiAgICBjb25zdCBxMnggPSBxMi54XHJcbiAgICBjb25zdCBxMnkgPSBxMi55XHJcbiAgICBjb25zdCBxMnogPSBxMi56XHJcbiAgICBjb25zdCBxMncgPSBxMi53XHJcblxyXG4gICAgZGVzdC54ID0gcTF4ICogcTJ3ICsgcTF3ICogcTJ4ICsgcTF5ICogcTJ6IC0gcTF6ICogcTJ5XHJcbiAgICBkZXN0LnkgPSBxMXkgKiBxMncgKyBxMXcgKiBxMnkgKyBxMXogKiBxMnggLSBxMXggKiBxMnpcclxuICAgIGRlc3QueiA9IHExeiAqIHEydyArIHExdyAqIHEyeiArIHExeCAqIHEyeSAtIHExeSAqIHEyeFxyXG4gICAgZGVzdC53ID0gcTF3ICogcTJ3IC0gcTF4ICogcTJ4IC0gcTF5ICogcTJ5IC0gcTF6ICogcTJ6XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBjcm9zcyhxMTogcXVhdCwgcTI6IHF1YXQsIGRlc3Q6IG51bGwgfCBxdWF0ID0gbnVsbCk6IHF1YXQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgcXVhdCgpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcTF4ID0gcTEueFxyXG4gICAgY29uc3QgcTF5ID0gcTEueVxyXG4gICAgY29uc3QgcTF6ID0gcTEuelxyXG4gICAgY29uc3QgcTF3ID0gcTEud1xyXG5cclxuICAgIGNvbnN0IHEyeCA9IHEyLnhcclxuICAgIGNvbnN0IHEyeSA9IHEyLnlcclxuICAgIGNvbnN0IHEyeiA9IHEyLnpcclxuICAgIGNvbnN0IHEydyA9IHEyLndcclxuXHJcbiAgICBkZXN0LnggPSBxMXcgKiBxMnogKyBxMXogKiBxMncgKyBxMXggKiBxMnkgLSBxMXkgKiBxMnhcclxuICAgIGRlc3QueSA9IHExdyAqIHEydyAtIHExeCAqIHEyeCAtIHExeSAqIHEyeSAtIHExeiAqIHEyelxyXG4gICAgZGVzdC56ID0gcTF3ICogcTJ4ICsgcTF4ICogcTJ3ICsgcTF5ICogcTJ6IC0gcTF6ICogcTJ5XHJcbiAgICBkZXN0LncgPSBxMXcgKiBxMnkgKyBxMXkgKiBxMncgKyBxMXogKiBxMnggLSBxMXggKiBxMnpcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG1peChxMTogcXVhdCwgcTI6IHF1YXQsIHRpbWU6IG51bWJlciwgZGVzdDogbnVsbCB8IHF1YXQgPSBudWxsKTogcXVhdCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBxdWF0KClcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGltZSA8PSAwLjApIHtcclxuICAgICAgcTEuY29weShkZXN0KVxyXG5cclxuICAgICAgcmV0dXJuIGRlc3RcclxuICAgIH0gZWxzZSBpZiAodGltZSA+PSAxLjApIHtcclxuICAgICAgcTIuY29weShkZXN0KVxyXG5cclxuICAgICAgcmV0dXJuIGRlc3RcclxuICAgIH1cclxuXHJcbiAgICBsZXQgY29zID0gcXVhdC5kb3QocTEsIHEyKVxyXG4gICAgY29uc3QgcTJhID0gcTIuY29weShkZXN0KVxyXG5cclxuICAgIGlmIChjb3MgPCAwLjApIHtcclxuICAgICAgcTJhLmludmVydCgpXHJcbiAgICAgIGNvcyA9IC1jb3NcclxuICAgIH1cclxuXHJcbiAgICBsZXQgazA6IG51bWJlclxyXG4gICAgbGV0IGsxOiBudW1iZXJcclxuXHJcbiAgICBpZiAoY29zID4gMSAtIEVwc2lsb24pIHtcclxuICAgICAgazAgPSAxIC0gdGltZVxyXG4gICAgICBrMSA9IDAgKyB0aW1lXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBzaW46IG51bWJlciA9IE1hdGguc3FydCgxIC0gY29zICogY29zKVxyXG4gICAgICBjb25zdCBhbmdsZTogbnVtYmVyID0gTWF0aC5hdGFuMihzaW4sIGNvcylcclxuXHJcbiAgICAgIGNvbnN0IG9uZU92ZXJTaW46IG51bWJlciA9IDEgLyBzaW5cclxuXHJcbiAgICAgIGswID0gTWF0aC5zaW4oKDEgLSB0aW1lKSAqIGFuZ2xlKSAqIG9uZU92ZXJTaW5cclxuICAgICAgazEgPSBNYXRoLnNpbigoMCArIHRpbWUpICogYW5nbGUpICogb25lT3ZlclNpblxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IGswICogcTEueCArIGsxICogcTJhLnhcclxuICAgIGRlc3QueSA9IGswICogcTEueSArIGsxICogcTJhLnlcclxuICAgIGRlc3QueiA9IGswICogcTEueiArIGsxICogcTJhLnpcclxuICAgIGRlc3QudyA9IGswICogcTEudyArIGsxICogcTJhLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZyb21BeGlzQW5nbGUoYXhpczogdmVjMywgYW5nbGU6IG51bWJlciwgZGVzdDogbnVsbCB8IHF1YXQgPSBudWxsKTogcXVhdCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyBxdWF0KClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhID0gYW5nbGUgKiAwLjVcclxuICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKGEpXHJcblxyXG4gICAgZGVzdC54ID0gYXhpcy54ICogc2luXHJcbiAgICBkZXN0LnkgPSBheGlzLnkgKiBzaW5cclxuICAgIGRlc3QueiA9IGF4aXMueiAqIHNpblxyXG4gICAgZGVzdC53ID0gTWF0aC5jb3MoYSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZyb21FdWxlckFuZ2xlcyh5YXc6IG51bWJlciwgcGl0Y2g6IG51bWJlciwgcm9sbDogbnVtYmVyLCBkZXN0OiBudWxsIHwgcXVhdCA9IG51bGwpOiBxdWF0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHF1YXQoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHkgPSB5YXcgKiAwLjVcclxuICAgIGNvbnN0IHIgPSByb2xsICogMC41XHJcbiAgICBjb25zdCBwID0gcGl0Y2ggKiAwLjVcclxuXHJcbiAgICBjb25zdCBjMSA9IE1hdGguY29zKHkpXHJcbiAgICBjb25zdCBzMSA9IE1hdGguc2luKHkpXHJcbiAgICBjb25zdCBjMiA9IE1hdGguY29zKHIpXHJcbiAgICBjb25zdCBzMiA9IE1hdGguc2luKHIpXHJcbiAgICBjb25zdCBjMyA9IE1hdGguY29zKHApXHJcbiAgICBjb25zdCBzMyA9IE1hdGguc2luKHApXHJcblxyXG4gICAgY29uc3QgYzFjMiA9IGMxICogYzJcclxuICAgIGNvbnN0IHMxczIgPSBzMSAqIHMyXHJcblxyXG4gICAgZGVzdC54ID0gYzFjMiAqIHMzICsgczFzMiAqIGMzXHJcbiAgICBkZXN0LnkgPSBzMSAqIGMyICogYzMgKyBjMSAqIHMyICogczNcclxuICAgIGRlc3QueiA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzM1xyXG4gICAgZGVzdC53ID0gYzFjMiAqIGMzIC0gczFzMiAqIHMzXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG59IiwiaW1wb3J0IHsgRXBzaWxvbiB9IGZyb20gJy4vY29uc3RhbnRzJ1xyXG5pbXBvcnQgeyBtYXQyIH0gZnJvbSAnLi9tYXQyJ1xyXG5cclxuY29uc3QgeyBtaW4sIG1heCwgYWJzLCBzcXJ0IH0gPSBNYXRoXHJcblxyXG5leHBvcnQgY2xhc3MgdmVjMiBleHRlbmRzIEZsb2F0MzJBcnJheSB7XHJcblxyXG4gIHN0YXRpYyByZWFkb25seSB6ZXJvOiBSZWFkb25seTx2ZWMyPiA9IG5ldyB2ZWMyKFswLjAsIDAuMF0pXHJcbiAgc3RhdGljIHJlYWRvbmx5IG9uZTogUmVhZG9ubHk8dmVjMj4gPSBuZXcgdmVjMihbMS4wLCAxLjBdKVxyXG5cclxuICBzdGF0aWMgcmVhZG9ubHkgcmlnaHQ6IFJlYWRvbmx5PHZlYzI+ID0gbmV3IHZlYzIoWzEuMCwgMC4wXSlcclxuICBzdGF0aWMgcmVhZG9ubHkgdXA6IFJlYWRvbmx5PHZlYzI+ID0gbmV3IHZlYzIoWzAuMCwgMS4wXSlcclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IGF4ZXM6IFJlYWRvbmx5PHZlYzJbXT4gPSBbdmVjMi5yaWdodCwgdmVjMi51cF1cclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IGluZmluaXR5OiBSZWFkb25seTx2ZWMyPiA9IG5ldyB2ZWMyKFtJbmZpbml0eSwgSW5maW5pdHldKVxyXG5cclxuICBjb25zdHJ1Y3Rvcih2YWx1ZXM6IG51bWJlcltdID0gWzAuMCwgMC4wXSkge1xyXG4gICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDIpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzBdXHJcbiAgfVxyXG5cclxuICBzZXQgeCh4OiBudW1iZXIpIHtcclxuICAgIHRoaXNbMF0gPSB4XHJcbiAgfVxyXG5cclxuICBnZXQgeSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbMV1cclxuICB9XHJcblxyXG4gIHNldCB5KHk6IG51bWJlcikge1xyXG4gICAgdGhpc1sxXSA9IHlcclxuICB9XHJcblxyXG4gIGdldCB4eSgpOiBudW1iZXJbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKVxyXG4gIH1cclxuXHJcbiAgc2V0IHh5KHh5OiBudW1iZXJbXSkge1xyXG4gICAgdGhpcy5zZXQoeHkpXHJcbiAgfVxyXG5cclxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gc3FydCh0aGlzLnNxdWFyZWRMZW5ndGgpXHJcbiAgfVxyXG5cclxuICBnZXQgc3F1YXJlZExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgY29uc3QgeyB4LCB5IH0gPSB0aGlzXHJcblxyXG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHlcclxuICB9XHJcblxyXG4gIHJlc2V0KCk6IHZlYzIge1xyXG4gICAgdGhpcy54ID0gMC4wXHJcbiAgICB0aGlzLnkgPSAwLjBcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgY29weShkZXN0OiBudWxsIHwgdmVjMiA9IG51bGwpOiB2ZWMyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzIoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueFxyXG4gICAgZGVzdC55ID0gdGhpcy55XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIG5lZ2F0ZShkZXN0OiBudWxsIHwgdmVjMiA9IG51bGwpOiB2ZWMyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IC10aGlzLnhcclxuICAgIGRlc3QueSA9IC10aGlzLnlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgZXF1YWxzKHZlY3RvcjogdmVjMiwgdGhyZXNob2xkID0gRXBzaWxvbik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKGFicyh0aGlzLnggLSB2ZWN0b3IueCkgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFicyh0aGlzLnkgLSB2ZWN0b3IueSkgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWVcclxuICB9XHJcblxyXG4gIGFkZCh2ZWN0b3I6IHZlYzIsIGRlc3Q6IG51bGwgfCB2ZWMyID0gbnVsbCk6IHZlYzIge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICsgdmVjdG9yLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSArIHZlY3Rvci55XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN1YnRyYWN0KHZlY3RvcjogdmVjMiwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzLnggLSB2ZWN0b3IueFxyXG4gICAgZGVzdC55ID0gdGhpcy55IC0gdmVjdG9yLnlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbXVsdGlwbHkodmVjdG9yOiB2ZWMyLCBkZXN0OiBudWxsIHwgdmVjMiA9IG51bGwpOiB2ZWMyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAqIHZlY3Rvci54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiB2ZWN0b3IueVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBkaXZpZGUodmVjdG9yOiB2ZWMyLCBkZXN0OiBudWxsIHwgdmVjMiA9IG51bGwpOiB2ZWMyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAvIHZlY3Rvci54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgLyB2ZWN0b3IueVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzY2FsZShzY2FsYXI6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzLnggKiBzY2FsYXJcclxuICAgIGRlc3QueSA9IHRoaXMueSAqIHNjYWxhclxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBub3JtYWxpemUoZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbGVuZ3RoID0gdGhpcy5sZW5ndGhcclxuXHJcbiAgICBpZiAobGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBkZXN0LnggPSAwXHJcbiAgICAgIGRlc3QueSA9IDBcclxuXHJcbiAgICAgIHJldHVybiBkZXN0XHJcbiAgICB9XHJcblxyXG4gICAgbGVuZ3RoID0gMS4wIC8gbGVuZ3RoXHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICogbGVuZ3RoXHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiBsZW5ndGhcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgdHJhbnNmb3JtKG1hdHJpeDogbWF0MiwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbWF0cml4LnRyYW5zZm9ybSh0aGlzLCBkZXN0KVxyXG4gIH1cclxuXHJcbiAgdG9KU09OKCkge1xyXG4gICAgY29uc3QgeyB4LCB5IH0gPSB0aGlzXHJcblxyXG4gICAgcmV0dXJuIFt4LCB5XVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGFic29sdXRlKHZlY3RvcjogdmVjMiwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMyKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSBhYnModmVjdG9yLngpXHJcbiAgICBkZXN0LnkgPSBhYnModmVjdG9yLnkpXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtaW5pbXVtKHZlY3RvcjogdmVjMiwgdmVjdG9yMjogdmVjMiwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMyKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSBtaW4odmVjdG9yLngsIHZlY3RvcjIueClcclxuICAgIGRlc3QueSA9IG1pbih2ZWN0b3IueSwgdmVjdG9yMi55KVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbWF4aW11bSh2ZWN0b3I6IHZlYzIsIHZlY3RvcjI6IHZlYzIsIGRlc3Q6IG51bGwgfCB2ZWMyID0gbnVsbCk6IHZlYzIge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMigpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gbWF4KHZlY3Rvci54LCB2ZWN0b3IyLngpXHJcbiAgICBkZXN0LnkgPSBtYXgodmVjdG9yLnksIHZlY3RvcjIueSlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNyb3NzKHZlY3RvcjogdmVjMiwgdmVjdG9yMjogdmVjMiwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMyKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCAqIHZlY3RvcjIueVxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKiB2ZWN0b3IyLnhcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRvdCh2ZWN0b3I6IHZlYzIsIHZlY3RvcjI6IHZlYzIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHZlY3Rvci54ICogdmVjdG9yMi54ICsgdmVjdG9yLnkgKiB2ZWN0b3IyLnlcclxuICB9XHJcblxyXG4gIHN0YXRpYyBkaXN0YW5jZSh2ZWN0b3I6IHZlYzIsIHZlY3RvcjI6IHZlYzIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHNxcnQodGhpcy5zcXVhcmVkRGlzdGFuY2UodmVjdG9yLCB2ZWN0b3IyKSlcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzcXVhcmVkRGlzdGFuY2UodmVjdG9yOiB2ZWMyLCB2ZWN0b3IyOiB2ZWMyKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHggPSB2ZWN0b3IyLnggLSB2ZWN0b3IueFxyXG4gICAgY29uc3QgeSA9IHZlY3RvcjIueSAtIHZlY3Rvci55XHJcblxyXG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHlcclxuICB9XHJcblxyXG4gIHN0YXRpYyBkaXJlY3Rpb24odmVjdG9yOiB2ZWMyLCB2ZWN0b3IyOiB2ZWMyLCBkZXN0OiBudWxsIHwgdmVjMiA9IG51bGwpOiB2ZWMyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzIoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHggPSB2ZWN0b3IueCAtIHZlY3RvcjIueFxyXG4gICAgY29uc3QgeSA9IHZlY3Rvci55IC0gdmVjdG9yMi55XHJcblxyXG4gICAgbGV0IGxlbmd0aCA9IHNxcnQoeCAqIHggKyB5ICogeSlcclxuXHJcbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGRlc3QueCA9IDBcclxuICAgICAgZGVzdC55ID0gMFxyXG5cclxuICAgICAgcmV0dXJuIGRlc3RcclxuICAgIH1cclxuXHJcbiAgICBsZW5ndGggPSAxIC8gbGVuZ3RoXHJcblxyXG4gICAgZGVzdC54ID0geCAqIGxlbmd0aFxyXG4gICAgZGVzdC55ID0geSAqIGxlbmd0aFxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbWl4KHZlY3RvcjogdmVjMiwgdmVjdG9yMjogdmVjMiwgdGltZTogbnVtYmVyLCBkZXN0OiBudWxsIHwgdmVjMiA9IG51bGwpOiB2ZWMyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzIoKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHggPSB2ZWN0b3IueFxyXG4gICAgY29uc3QgeSA9IHZlY3Rvci55XHJcblxyXG4gICAgY29uc3QgeDIgPSB2ZWN0b3IyLnhcclxuICAgIGNvbnN0IHkyID0gdmVjdG9yMi55XHJcblxyXG4gICAgZGVzdC54ID0geCArIHRpbWUgKiAoeDIgLSB4KVxyXG4gICAgZGVzdC55ID0geSArIHRpbWUgKiAoeTIgLSB5KVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgYWRkKHZlY3RvcjogdmVjMiwgdmVjdG9yMjogdmVjMiwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMyKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCArIHZlY3RvcjIueFxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKyB2ZWN0b3IyLnlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHN1YnRyYWN0KHZlY3RvcjogdmVjMiwgdmVjdG9yMjogdmVjMiwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMyKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCAtIHZlY3RvcjIueFxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgLSB2ZWN0b3IyLnlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG11bHRpcGx5KHZlY3RvcjogdmVjMiwgdmVjdG9yMjogdmVjMiwgZGVzdDogbnVsbCB8IHZlYzIgPSBudWxsKTogdmVjMiB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMyKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCAqIHZlY3RvcjIueFxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKiB2ZWN0b3IyLnlcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRpdmlkZSh2ZWN0b3I6IHZlYzIsIHZlY3RvcjI6IHZlYzIsIGRlc3Q6IG51bGwgfCB2ZWMyID0gbnVsbCk6IHZlYzIge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMigpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggLyB2ZWN0b3IyLnhcclxuICAgIGRlc3QueSA9IHZlY3Rvci55IC8gdmVjdG9yMi55XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzY2FsZSh2ZWN0b3I6IHZlYzIsIHNjYWxhcjogbnVtYmVyLCBkZXN0OiBudWxsIHwgdmVjMiA9IG51bGwpOiB2ZWMyIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzIoKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2ZWN0b3Iuc2NhbGUoc2NhbGFyLCBkZXN0KVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG5vcm1hbGl6ZSh2ZWN0b3I6IHZlYzIsIGRlc3Q6IG51bGwgfCB2ZWMyID0gbnVsbCk6IHZlYzIge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMigpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHZlY3Rvci5ub3JtYWxpemUoZGVzdClcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzdW0oLi4udmVjdG9yczogdmVjMltdKTogdmVjMiB7XHJcbiAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzIoKVxyXG4gIFxyXG4gICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xyXG4gICAgICBkZXN0LnggKz0gdmVjdG9yLnhcclxuICAgICAgZGVzdC55ICs9IHZlY3Rvci55XHJcbiAgICB9XHJcbiAgXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRpZmZlcmVuY2UoLi4udmVjdG9yczogdmVjMltdKTogdmVjMiB7XHJcbiAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzIoKVxyXG4gIFxyXG4gICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xyXG4gICAgICBkZXN0LnggLT0gdmVjdG9yLnhcclxuICAgICAgZGVzdC55IC09IHZlY3Rvci55XHJcbiAgICB9XHJcbiAgXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHByb2R1Y3QoLi4udmVjdG9yczogdmVjMltdKTogdmVjMiB7XHJcbiAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzIoKVxyXG4gIFxyXG4gICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xyXG4gICAgICBkZXN0LnggKj0gdmVjdG9yLnhcclxuICAgICAgZGVzdC55ICo9IHZlY3Rvci55XHJcbiAgICB9XHJcbiAgXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRpdmlzaW9uKC4uLnZlY3RvcnM6IHZlYzJbXSk6IHZlYzIge1xyXG4gICAgY29uc3QgZGVzdCA9IG5ldyB2ZWMyKClcclxuICBcclxuICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcclxuICAgICAgZGVzdC54IC89IHZlY3Rvci54XHJcbiAgICAgIGRlc3QueSAvPSB2ZWN0b3IueVxyXG4gICAgfVxyXG4gIFxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IEVwc2lsb24gfSBmcm9tICcuL2NvbnN0YW50cydcclxuaW1wb3J0IHsgbWF0MyB9IGZyb20gJy4vbWF0MydcclxuXHJcbmNvbnN0IHsgbWluLCBtYXgsIGFicywgc3FydCB9ID0gTWF0aFxyXG5cclxuZXhwb3J0IGNsYXNzIHZlYzMgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xyXG5cclxuICBzdGF0aWMgcmVhZG9ubHkgemVybzogUmVhZG9ubHk8dmVjMz4gPSBuZXcgdmVjMyhbMC4wLCAwLjAsIDAuMF0pXHJcbiAgc3RhdGljIHJlYWRvbmx5IG9uZTogUmVhZG9ubHk8dmVjMz4gPSBuZXcgdmVjMyhbMS4wLCAxLjAsIDEuMF0pXHJcblxyXG4gIHN0YXRpYyByZWFkb25seSByaWdodDogUmVhZG9ubHk8dmVjMz4gPSBuZXcgdmVjMyhbMS4wLCAwLjAsIDAuMF0pXHJcbiAgc3RhdGljIHJlYWRvbmx5IHVwOiBSZWFkb25seTx2ZWMzPiA9IG5ldyB2ZWMzKFswLjAsIDEuMCwgMC4wXSlcclxuICBzdGF0aWMgcmVhZG9ubHkgZm9yd2FyZDogUmVhZG9ubHk8dmVjMz4gPSBuZXcgdmVjMyhbMC4wLCAwLjAsIDEuMF0pXHJcblxyXG4gIHN0YXRpYyByZWFkb25seSBheGVzOiBSZWFkb25seTx2ZWMzW10+ID0gW3ZlYzMucmlnaHQsIHZlYzMudXAsIHZlYzMuZm9yd2FyZF1cclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IGluZmluaXR5OiBSZWFkb25seTx2ZWMzPiA9IG5ldyB2ZWMzKFtJbmZpbml0eSwgSW5maW5pdHksIEluZmluaXR5XSlcclxuXHJcbiAgY29uc3RydWN0b3IodmFsdWVzOiBudW1iZXJbXSA9IFswLjAsIDAuMCwgMC4wXSkge1xyXG4gICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDMpKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzBdXHJcbiAgfVxyXG5cclxuICBzZXQgeCh4OiBudW1iZXIpIHtcclxuICAgIHRoaXNbMF0gPSB4XHJcbiAgfVxyXG5cclxuICBnZXQgeSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbMV1cclxuICB9XHJcblxyXG4gIHNldCB5KHk6IG51bWJlcikge1xyXG4gICAgdGhpc1sxXSA9IHlcclxuICB9XHJcblxyXG4gIGdldCB6KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1syXVxyXG4gIH1cclxuXHJcbiAgc2V0IHooejogbnVtYmVyKSB7XHJcbiAgICB0aGlzWzJdID0gelxyXG4gIH1cclxuXHJcbiAgZ2V0IHh5eigpOiBudW1iZXJbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKVxyXG4gIH1cclxuXHJcbiAgc2V0IHh5eih4eXo6IG51bWJlcltdKSB7XHJcbiAgICB0aGlzLnNldCh4eXopXHJcbiAgfVxyXG5cclxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gc3FydCh0aGlzLnNxdWFyZWRMZW5ndGgpXHJcbiAgfVxyXG5cclxuICBnZXQgc3F1YXJlZExlbmd0aCgpOiBudW1iZXIge1xyXG4gICAgY29uc3QgeyB4LCB5LCB6IH0gPSB0aGlzXHJcblxyXG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogelxyXG4gIH1cclxuXHJcbiAgcmVzZXQoKTogdmVjMyB7XHJcbiAgICB0aGlzLnggPSAwLjBcclxuICAgIHRoaXMueSA9IDAuMFxyXG4gICAgdGhpcy56ID0gMC4wXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGNvcHkoZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzLnhcclxuICAgIGRlc3QueSA9IHRoaXMueVxyXG4gICAgZGVzdC56ID0gdGhpcy56XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIG5lZ2F0ZShkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IC10aGlzLnhcclxuICAgIGRlc3QueSA9IC10aGlzLnlcclxuICAgIGRlc3QueiA9IC10aGlzLnpcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgZXF1YWxzKHZlY3RvcjogdmVjMywgdGhyZXNob2xkID0gRXBzaWxvbik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKGFicyh0aGlzLnggLSB2ZWN0b3IueCkgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFicyh0aGlzLnkgLSB2ZWN0b3IueSkgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFicyh0aGlzLnogLSB2ZWN0b3IueikgPiB0aHJlc2hvbGQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWVcclxuICB9XHJcblxyXG4gIGFkZCh2ZWN0b3I6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICsgdmVjdG9yLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSArIHZlY3Rvci55XHJcbiAgICBkZXN0LnogPSB0aGlzLnogKyB2ZWN0b3IuelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdWJ0cmFjdCh2ZWN0b3I6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54IC0gdmVjdG9yLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSAtIHZlY3Rvci55XHJcbiAgICBkZXN0LnogPSB0aGlzLnogLSB2ZWN0b3IuelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBtdWx0aXBseSh2ZWN0b3I6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICogdmVjdG9yLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSAqIHZlY3Rvci55XHJcbiAgICBkZXN0LnogPSB0aGlzLnogKiB2ZWN0b3IuelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBkaXZpZGUodmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAvIHZlY3Rvci54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgLyB2ZWN0b3IueVxyXG4gICAgZGVzdC56ID0gdGhpcy56IC8gdmVjdG9yLnpcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc2NhbGUoc2NhbGFyOiBudW1iZXIsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICogc2NhbGFyXHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiBzY2FsYXJcclxuICAgIGRlc3QueiA9IHRoaXMueiAqIHNjYWxhclxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBub3JtYWxpemUoZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbGVuZ3RoID0gdGhpcy5sZW5ndGhcclxuXHJcbiAgICBpZiAobGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBkZXN0LnggPSAwXHJcbiAgICAgIGRlc3QueSA9IDBcclxuICAgICAgZGVzdC56ID0gMFxyXG5cclxuICAgICAgcmV0dXJuIGRlc3RcclxuICAgIH1cclxuXHJcbiAgICBsZW5ndGggPSAxLjAgLyBsZW5ndGhcclxuXHJcbiAgICBkZXN0LnggPSB0aGlzLnggKiBsZW5ndGhcclxuICAgIGRlc3QueSA9IHRoaXMueSAqIGxlbmd0aFxyXG4gICAgZGVzdC56ID0gdGhpcy56ICogbGVuZ3RoXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHJlZmxlY3Qobm9ybWFsOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBub3JtYWwuY29weShkZXN0KS5zY2FsZSgtMi4wICogdmVjMy5kb3QodGhpcywgbm9ybWFsKSkuYWRkKHRoaXMpXHJcbiAgfVxyXG5cclxuICB0cmFuc2Zvcm0obWF0cml4OiBtYXQzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBtYXRyaXgudHJhbnNmb3JtKHRoaXMsIGRlc3QpXHJcbiAgfVxyXG5cclxuICB0b0pTT04oKSB7XHJcbiAgICBjb25zdCB7IHgsIHksIHogfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4gW3gsIHksIHpdXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgYWJzb2x1dGUodmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IGFicyh2ZWN0b3IueClcclxuICAgIGRlc3QueSA9IGFicyh2ZWN0b3IueSlcclxuICAgIGRlc3QueiA9IGFicyh2ZWN0b3IueilcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG1pbmltdW0odmVjdG9yOiB2ZWMzLCB2ZWN0b3IyOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IG1pbih2ZWN0b3IueCwgdmVjdG9yMi54KVxyXG4gICAgZGVzdC55ID0gbWluKHZlY3Rvci55LCB2ZWN0b3IyLnkpXHJcbiAgICBkZXN0LnogPSBtaW4odmVjdG9yLnosIHZlY3RvcjIueilcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG1heGltdW0odmVjdG9yOiB2ZWMzLCB2ZWN0b3IyOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IG1heCh2ZWN0b3IueCwgdmVjdG9yMi54KVxyXG4gICAgZGVzdC55ID0gbWF4KHZlY3Rvci55LCB2ZWN0b3IyLnkpXHJcbiAgICBkZXN0LnogPSBtYXgodmVjdG9yLnosIHZlY3RvcjIueilcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNyb3NzKHZlY3RvcjogdmVjMywgdmVjdG9yMjogdmVjMywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB4ID0gdmVjdG9yLnhcclxuICAgIGNvbnN0IHkgPSB2ZWN0b3IueVxyXG4gICAgY29uc3QgeiA9IHZlY3Rvci56XHJcblxyXG4gICAgY29uc3QgeDIgPSB2ZWN0b3IyLnhcclxuICAgIGNvbnN0IHkyID0gdmVjdG9yMi55XHJcbiAgICBjb25zdCB6MiA9IHZlY3RvcjIuelxyXG5cclxuICAgIGRlc3QueCA9IHkgKiB6MiAtIHogKiB5MlxyXG4gICAgZGVzdC55ID0geiAqIHgyIC0geCAqIHoyXHJcbiAgICBkZXN0LnogPSB4ICogeTIgLSB5ICogeDJcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRvdCh2ZWN0b3I6IHZlYzMsIHZlY3RvcjI6IHZlYzMpOiBudW1iZXIge1xyXG4gICAgY29uc3QgeCA9IHZlY3Rvci54XHJcbiAgICBjb25zdCB5ID0gdmVjdG9yLnlcclxuICAgIGNvbnN0IHogPSB2ZWN0b3IuelxyXG5cclxuICAgIGNvbnN0IHgyID0gdmVjdG9yMi54XHJcbiAgICBjb25zdCB5MiA9IHZlY3RvcjIueVxyXG4gICAgY29uc3QgejIgPSB2ZWN0b3IyLnpcclxuXHJcbiAgICByZXR1cm4geCAqIHgyICsgeSAqIHkyICsgeiAqIHoyXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZGlzdGFuY2UodmVjdG9yOiB2ZWMzLCB2ZWN0b3IyOiB2ZWMzKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBzcXJ0KHRoaXMuc3F1YXJlZERpc3RhbmNlKHZlY3RvciwgdmVjdG9yMikpXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc3F1YXJlZERpc3RhbmNlKHZlY3RvcjogdmVjMywgdmVjdG9yMjogdmVjMyk6IG51bWJlciB7XHJcbiAgICBjb25zdCB4ID0gdmVjdG9yMi54IC0gdmVjdG9yLnhcclxuICAgIGNvbnN0IHkgPSB2ZWN0b3IyLnkgLSB2ZWN0b3IueVxyXG4gICAgY29uc3QgeiA9IHZlY3RvcjIueiAtIHZlY3Rvci56XHJcblxyXG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogelxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRpcmVjdGlvbih2ZWN0b3I6IHZlYzMsIHZlY3RvcjI6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeCA9IHZlY3Rvci54IC0gdmVjdG9yMi54XHJcbiAgICBjb25zdCB5ID0gdmVjdG9yLnkgLSB2ZWN0b3IyLnlcclxuICAgIGNvbnN0IHogPSB2ZWN0b3IueiAtIHZlY3RvcjIuelxyXG5cclxuICAgIGxldCBsZW5ndGggPSBzcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeilcclxuXHJcbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGRlc3QueCA9IDBcclxuICAgICAgZGVzdC55ID0gMFxyXG4gICAgICBkZXN0LnogPSAwXHJcblxyXG4gICAgICByZXR1cm4gZGVzdFxyXG4gICAgfVxyXG5cclxuICAgIGxlbmd0aCA9IDEgLyBsZW5ndGhcclxuXHJcbiAgICBkZXN0LnggPSB4ICogbGVuZ3RoXHJcbiAgICBkZXN0LnkgPSB5ICogbGVuZ3RoXHJcbiAgICBkZXN0LnogPSB6ICogbGVuZ3RoXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtaXgodmVjdG9yOiB2ZWMzLCB2ZWN0b3IyOiB2ZWMzLCB0aW1lOiBudW1iZXIsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggKyB0aW1lICogKHZlY3RvcjIueCAtIHZlY3Rvci54KVxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKyB0aW1lICogKHZlY3RvcjIueSAtIHZlY3Rvci55KVxyXG4gICAgZGVzdC56ID0gdmVjdG9yLnogKyB0aW1lICogKHZlY3RvcjIueiAtIHZlY3Rvci56KVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgYWRkKHZlY3RvcjogdmVjMywgdmVjdG9yMjogdmVjMywgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCArIHZlY3RvcjIueFxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKyB2ZWN0b3IyLnlcclxuICAgIGRlc3QueiA9IHZlY3Rvci56ICsgdmVjdG9yMi56XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzdWJ0cmFjdCh2ZWN0b3I6IHZlYzMsIHZlY3RvcjI6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggLSB2ZWN0b3IyLnhcclxuICAgIGRlc3QueSA9IHZlY3Rvci55IC0gdmVjdG9yMi55XHJcbiAgICBkZXN0LnogPSB2ZWN0b3IueiAtIHZlY3RvcjIuelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbXVsdGlwbHkodmVjdG9yOiB2ZWMzLCB2ZWN0b3IyOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHZlY3Rvci54ICogdmVjdG9yMi54XHJcbiAgICBkZXN0LnkgPSB2ZWN0b3IueSAqIHZlY3RvcjIueVxyXG4gICAgZGVzdC56ID0gdmVjdG9yLnogKiB2ZWN0b3IyLnpcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRpdmlkZSh2ZWN0b3I6IHZlYzMsIHZlY3RvcjI6IHZlYzMsIGRlc3Q6IG51bGwgfCB2ZWMzID0gbnVsbCk6IHZlYzMge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggLyB2ZWN0b3IyLnhcclxuICAgIGRlc3QueSA9IHZlY3Rvci55IC8gdmVjdG9yMi55XHJcbiAgICBkZXN0LnogPSB2ZWN0b3IueiAvIHZlY3RvcjIuelxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc2NhbGUodmVjdG9yOiB2ZWMzLCBzY2FsYXI6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzMgPSBudWxsKTogdmVjMyB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWMzKClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmVjdG9yLnNjYWxlKHNjYWxhciwgZGVzdClcclxuICB9XHJcblxyXG4gIHN0YXRpYyBub3JtYWxpemUodmVjdG9yOiB2ZWMzLCBkZXN0OiBudWxsIHwgdmVjMyA9IG51bGwpOiB2ZWMzIHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2ZWN0b3Iubm9ybWFsaXplKGRlc3QpXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc3VtKC4uLnZlY3RvcnM6IHZlYzNbXSk6IHZlYzMge1xyXG4gICAgY29uc3QgZGVzdCA9IG5ldyB2ZWMzKClcclxuICBcclxuICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcclxuICAgICAgZGVzdC54ICs9IHZlY3Rvci54XHJcbiAgICAgIGRlc3QueSArPSB2ZWN0b3IueVxyXG4gICAgICBkZXN0LnogKz0gdmVjdG9yLnpcclxuICAgIH1cclxuICBcclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZGlmZmVyZW5jZSguLi52ZWN0b3JzOiB2ZWMzW10pOiB2ZWMzIHtcclxuICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgXHJcbiAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XHJcbiAgICAgIGRlc3QueCAtPSB2ZWN0b3IueFxyXG4gICAgICBkZXN0LnkgLT0gdmVjdG9yLnlcclxuICAgICAgZGVzdC56IC09IHZlY3Rvci56XHJcbiAgICB9XHJcbiAgXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHByb2R1Y3QoLi4udmVjdG9yczogdmVjM1tdKTogdmVjMyB7XHJcbiAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzMoKVxyXG4gIFxyXG4gICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xyXG4gICAgICBkZXN0LnggKj0gdmVjdG9yLnhcclxuICAgICAgZGVzdC55ICo9IHZlY3Rvci55XHJcbiAgICAgIGRlc3QueiAqPSB2ZWN0b3IuelxyXG4gICAgfVxyXG4gIFxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBkaXZpc2lvbiguLi52ZWN0b3JzOiB2ZWMzW10pOiB2ZWMzIHtcclxuICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjMygpXHJcbiAgXHJcbiAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XHJcbiAgICAgIGRlc3QueCAvPSB2ZWN0b3IueFxyXG4gICAgICBkZXN0LnkgLz0gdmVjdG9yLnlcclxuICAgICAgZGVzdC56IC89IHZlY3Rvci56XHJcbiAgICB9XHJcbiAgXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnXHJcbmltcG9ydCB7IG1hdDQgfSBmcm9tICcuL21hdDQnXHJcblxyXG5jb25zdCB7IG1pbiwgbWF4LCBhYnMsIHNxcnQgfSA9IE1hdGhcclxuXHJcbmV4cG9ydCBjbGFzcyB2ZWM0IGV4dGVuZHMgRmxvYXQzMkFycmF5IHtcclxuXHJcbiAgc3RhdGljIHJlYWRvbmx5IHplcm86IFJlYWRvbmx5PHZlYzQ+ID0gbmV3IHZlYzQoWzAuMCwgMC4wLCAwLjAsIDEuMF0pXHJcbiAgc3RhdGljIHJlYWRvbmx5IG9uZTogUmVhZG9ubHk8dmVjND4gPSBuZXcgdmVjNChbMS4wLCAxLjAsIDEuMCwgMS4wXSlcclxuXHJcbiAgY29uc3RydWN0b3IodmFsdWVzOiBudW1iZXJbXSA9IFswLjAsIDAuMCwgMC4wLCAxLjBdKSB7XHJcbiAgICBzdXBlcih2YWx1ZXMuc2xpY2UoMCwgNCkpXHJcbiAgfVxyXG5cclxuICBnZXQgeCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbMF1cclxuICB9XHJcblxyXG4gIHNldCB4KHg6IG51bWJlcikge1xyXG4gICAgdGhpc1swXSA9IHhcclxuICB9XHJcblxyXG4gIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpc1sxXVxyXG4gIH1cclxuXHJcbiAgc2V0IHkoeTogbnVtYmVyKSB7XHJcbiAgICB0aGlzWzFdID0geVxyXG4gIH1cclxuXHJcbiAgZ2V0IHooKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzWzJdXHJcbiAgfVxyXG5cclxuICBzZXQgeih6OiBudW1iZXIpIHtcclxuICAgIHRoaXNbMl0gPSB6XHJcbiAgfVxyXG5cclxuICBnZXQgdygpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXNbM11cclxuICB9XHJcblxyXG4gIHNldCB3KHc6IG51bWJlcikge1xyXG4gICAgdGhpc1szXSA9IHdcclxuICB9XHJcblxyXG4gIGdldCB4eXp3KCk6IG51bWJlcltdIHtcclxuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMpXHJcbiAgfVxyXG5cclxuICBzZXQgeHl6dyh4eXp3OiBudW1iZXJbXSkge1xyXG4gICAgdGhpcy5zZXQoeHl6dylcclxuICB9XHJcblxyXG4gIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBzcXJ0KHRoaXMuc3F1YXJlZExlbmd0aClcclxuICB9XHJcblxyXG4gIGdldCBzcXVhcmVkTGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHdcclxuICB9XHJcblxyXG4gIHJlc2V0KCk6IHZlYzQge1xyXG4gICAgdGhpcy54ID0gMC4wXHJcbiAgICB0aGlzLnkgPSAwLjBcclxuICAgIHRoaXMueiA9IDAuMFxyXG4gICAgdGhpcy53ID0gMS4wXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGNvcHkoZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzLnhcclxuICAgIGRlc3QueSA9IHRoaXMueVxyXG4gICAgZGVzdC56ID0gdGhpcy56XHJcbiAgICBkZXN0LncgPSB0aGlzLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbmVnYXRlKGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gLXRoaXMueFxyXG4gICAgZGVzdC55ID0gLXRoaXMueVxyXG4gICAgZGVzdC56ID0gLXRoaXMuelxyXG4gICAgZGVzdC53ID0gLXRoaXMud1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBlcXVhbHModmVjdG9yOiB2ZWM0LCB0aHJlc2hvbGQgPSBFcHNpbG9uKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoYWJzKHRoaXMueCAtIHZlY3Rvci54KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWJzKHRoaXMueSAtIHZlY3Rvci55KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWJzKHRoaXMueiAtIHZlY3Rvci56KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWJzKHRoaXMudyAtIHZlY3Rvci53KSA+IHRocmVzaG9sZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgYWRkKHZlY3RvcjogdmVjNCwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB0aGlzLnggKyB2ZWN0b3IueFxyXG4gICAgZGVzdC55ID0gdGhpcy55ICsgdmVjdG9yLnlcclxuICAgIGRlc3QueiA9IHRoaXMueiArIHZlY3Rvci56XHJcbiAgICBkZXN0LncgPSB0aGlzLncgKyB2ZWN0b3Iud1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdWJ0cmFjdCh2ZWN0b3I6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54IC0gdmVjdG9yLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSAtIHZlY3Rvci55XHJcbiAgICBkZXN0LnogPSB0aGlzLnogLSB2ZWN0b3IuelxyXG4gICAgZGVzdC53ID0gdGhpcy53IC0gdmVjdG9yLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgbXVsdGlwbHkodmVjdG9yOiB2ZWM0LCBkZXN0OiBudWxsIHwgdmVjNCA9IG51bGwpOiB2ZWM0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHRoaXMueCAqIHZlY3Rvci54XHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiB2ZWN0b3IueVxyXG4gICAgZGVzdC56ID0gdGhpcy56ICogdmVjdG9yLnpcclxuICAgIGRlc3QudyA9IHRoaXMudyAqIHZlY3Rvci53XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIGRpdmlkZSh2ZWN0b3I6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54IC8gdmVjdG9yLnhcclxuICAgIGRlc3QueSA9IHRoaXMueSAvIHZlY3Rvci55XHJcbiAgICBkZXN0LnogPSB0aGlzLnogLyB2ZWN0b3IuelxyXG4gICAgZGVzdC53ID0gdGhpcy53IC8gdmVjdG9yLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc2NhbGUoc2NhbGFyOiBudW1iZXIsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICogc2NhbGFyXHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiBzY2FsYXJcclxuICAgIGRlc3QueiA9IHRoaXMueiAqIHNjYWxhclxyXG4gICAgZGVzdC53ID0gdGhpcy53ICogc2NhbGFyXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIG5vcm1hbGl6ZShkZXN0OiBudWxsIHwgdmVjNCA9IG51bGwpOiB2ZWM0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBsZW5ndGggPSB0aGlzLmxlbmd0aFxyXG5cclxuICAgIGlmIChsZW5ndGggPT09IDEpIHtcclxuICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBpZiAobGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGRlc3QueCA9IDBcclxuICAgICAgZGVzdC55ID0gMFxyXG4gICAgICBkZXN0LnogPSAwXHJcbiAgICAgIGRlc3QudyA9IDBcclxuXHJcbiAgICAgIHJldHVybiBkZXN0XHJcbiAgICB9XHJcblxyXG4gICAgbGVuZ3RoID0gMS4wIC8gbGVuZ3RoXHJcblxyXG4gICAgZGVzdC54ID0gdGhpcy54ICogbGVuZ3RoXHJcbiAgICBkZXN0LnkgPSB0aGlzLnkgKiBsZW5ndGhcclxuICAgIGRlc3QueiA9IHRoaXMueiAqIGxlbmd0aFxyXG4gICAgZGVzdC53ID0gdGhpcy53ICogbGVuZ3RoXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHRyYW5zZm9ybShtYXRyaXg6IG1hdDQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSB0aGlzXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1hdHJpeC50cmFuc2Zvcm0odGhpcywgZGVzdClcclxuICB9XHJcblxyXG4gIHRvSlNPTigpIHtcclxuICAgIGNvbnN0IHsgeCwgeSwgeiwgdyB9ID0gdGhpc1xyXG5cclxuICAgIHJldHVybiBbeCwgeSwgeiwgd11cclxuICB9XHJcblxyXG4gIHN0YXRpYyBhYnNvbHV0ZSh2ZWN0b3I6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gYWJzKHZlY3Rvci54KVxyXG4gICAgZGVzdC55ID0gYWJzKHZlY3Rvci55KVxyXG4gICAgZGVzdC56ID0gYWJzKHZlY3Rvci56KVxyXG4gICAgZGVzdC53ID0gYWJzKHZlY3Rvci53KVxyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbWluaW11bSh2ZWN0b3I6IHZlYzQsIHZlY3RvcjI6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gbWluKHZlY3Rvci54LCB2ZWN0b3IyLngpXHJcbiAgICBkZXN0LnkgPSBtaW4odmVjdG9yLnksIHZlY3RvcjIueSlcclxuICAgIGRlc3QueiA9IG1pbih2ZWN0b3IueiwgdmVjdG9yMi56KVxyXG4gICAgZGVzdC56ID0gbWluKHZlY3Rvci53LCB2ZWN0b3IyLncpXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBtYXhpbXVtKHZlY3RvcjogdmVjNCwgdmVjdG9yMjogdmVjNCwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSBtYXgodmVjdG9yLngsIHZlY3RvcjIueClcclxuICAgIGRlc3QueSA9IG1heCh2ZWN0b3IueSwgdmVjdG9yMi55KVxyXG4gICAgZGVzdC56ID0gbWF4KHZlY3Rvci56LCB2ZWN0b3IyLnopXHJcbiAgICBkZXN0LnogPSBtYXgodmVjdG9yLncsIHZlY3RvcjIudylcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG1peCh2ZWN0b3I6IHZlYzQsIHZlY3RvcjI6IHZlYzQsIHRpbWU6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCArIHRpbWUgKiAodmVjdG9yMi54IC0gdmVjdG9yLngpXHJcbiAgICBkZXN0LnkgPSB2ZWN0b3IueSArIHRpbWUgKiAodmVjdG9yMi55IC0gdmVjdG9yLnkpXHJcbiAgICBkZXN0LnogPSB2ZWN0b3IueiArIHRpbWUgKiAodmVjdG9yMi56IC0gdmVjdG9yLnopXHJcbiAgICBkZXN0LncgPSB2ZWN0b3IudyArIHRpbWUgKiAodmVjdG9yMi53IC0gdmVjdG9yLncpXHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBhZGQodmVjdG9yOiB2ZWM0LCB2ZWN0b3IyOiB2ZWM0LCBkZXN0OiBudWxsIHwgdmVjNCA9IG51bGwpOiB2ZWM0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzQoKVxyXG4gICAgfVxyXG5cclxuICAgIGRlc3QueCA9IHZlY3Rvci54ICsgdmVjdG9yMi54XHJcbiAgICBkZXN0LnkgPSB2ZWN0b3IueSArIHZlY3RvcjIueVxyXG4gICAgZGVzdC56ID0gdmVjdG9yLnogKyB2ZWN0b3IyLnpcclxuICAgIGRlc3QudyA9IHZlY3Rvci53ICsgdmVjdG9yMi53XHJcblxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzdWJ0cmFjdCh2ZWN0b3I6IHZlYzQsIHZlY3RvcjI6IHZlYzQsIGRlc3Q6IG51bGwgfCB2ZWM0ID0gbnVsbCk6IHZlYzQge1xyXG4gICAgaWYgKCFkZXN0KSB7XHJcbiAgICAgIGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgICB9XHJcblxyXG4gICAgZGVzdC54ID0gdmVjdG9yLnggLSB2ZWN0b3IyLnhcclxuICAgIGRlc3QueSA9IHZlY3Rvci55IC0gdmVjdG9yMi55XHJcbiAgICBkZXN0LnogPSB2ZWN0b3IueiAtIHZlY3RvcjIuelxyXG4gICAgZGVzdC53ID0gdmVjdG9yLncgLSB2ZWN0b3IyLndcclxuXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG11bHRpcGx5KHZlY3RvcjogdmVjNCwgdmVjdG9yMjogdmVjNCwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCAqIHZlY3RvcjIueFxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgKiB2ZWN0b3IyLnlcclxuICAgIGRlc3QueiA9IHZlY3Rvci56ICogdmVjdG9yMi56XHJcbiAgICBkZXN0LncgPSB2ZWN0b3IudyAqIHZlY3RvcjIud1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgZGl2aWRlKHZlY3RvcjogdmVjNCwgdmVjdG9yMjogdmVjNCwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICBkZXN0LnggPSB2ZWN0b3IueCAvIHZlY3RvcjIueFxyXG4gICAgZGVzdC55ID0gdmVjdG9yLnkgLyB2ZWN0b3IyLnlcclxuICAgIGRlc3QueiA9IHZlY3Rvci56IC8gdmVjdG9yMi56XHJcbiAgICBkZXN0LncgPSB2ZWN0b3IudyAvIHZlY3RvcjIud1xyXG5cclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc2NhbGUodmVjdG9yOiB2ZWM0LCBzY2FsYXI6IG51bWJlciwgZGVzdDogbnVsbCB8IHZlYzQgPSBudWxsKTogdmVjNCB7XHJcbiAgICBpZiAoIWRlc3QpIHtcclxuICAgICAgZGVzdCA9IG5ldyB2ZWM0KClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmVjdG9yLnNjYWxlKHNjYWxhciwgZGVzdClcclxuICB9XHJcblxyXG4gIHN0YXRpYyBub3JtYWxpemUodmVjdG9yOiB2ZWM0LCBkZXN0OiBudWxsIHwgdmVjNCA9IG51bGwpOiB2ZWM0IHtcclxuICAgIGlmICghZGVzdCkge1xyXG4gICAgICBkZXN0ID0gbmV3IHZlYzQoKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2ZWN0b3Iubm9ybWFsaXplKGRlc3QpXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgc3VtKC4uLnZlY3RvcnM6IHZlYzRbXSk6IHZlYzQge1xyXG4gICAgY29uc3QgZGVzdCA9IG5ldyB2ZWM0KClcclxuICBcclxuICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcclxuICAgICAgZGVzdC54ICs9IHZlY3Rvci54XHJcbiAgICAgIGRlc3QueSArPSB2ZWN0b3IueVxyXG4gICAgICBkZXN0LnogKz0gdmVjdG9yLnpcclxuICAgICAgZGVzdC53ICs9IHZlY3Rvci53XHJcbiAgICB9XHJcbiAgXHJcbiAgICByZXR1cm4gZGVzdFxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGRpZmZlcmVuY2UoLi4udmVjdG9yczogdmVjNFtdKTogdmVjNCB7XHJcbiAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzQoKVxyXG4gIFxyXG4gICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xyXG4gICAgICBkZXN0LnggLT0gdmVjdG9yLnhcclxuICAgICAgZGVzdC55IC09IHZlY3Rvci55XHJcbiAgICAgIGRlc3QueiAtPSB2ZWN0b3IuelxyXG4gICAgICBkZXN0LncgLT0gdmVjdG9yLndcclxuICAgIH1cclxuICBcclxuICAgIHJldHVybiBkZXN0XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcHJvZHVjdCguLi52ZWN0b3JzOiB2ZWM0W10pOiB2ZWM0IHtcclxuICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgXHJcbiAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XHJcbiAgICAgIGRlc3QueCAqPSB2ZWN0b3IueFxyXG4gICAgICBkZXN0LnkgKj0gdmVjdG9yLnlcclxuICAgICAgZGVzdC56ICo9IHZlY3Rvci56XHJcbiAgICAgIGRlc3QudyAqPSB2ZWN0b3Iud1xyXG4gICAgfVxyXG4gIFxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG4gIHN0YXRpYyBkaXZpc2lvbiguLi52ZWN0b3JzOiB2ZWM0W10pOiB2ZWM0IHtcclxuICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjNCgpXHJcbiAgXHJcbiAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XHJcbiAgICAgIGRlc3QueCAvPSB2ZWN0b3IueFxyXG4gICAgICBkZXN0LnkgLz0gdmVjdG9yLnlcclxuICAgICAgZGVzdC56IC89IHZlY3Rvci56XHJcbiAgICAgIGRlc3QudyAvPSB2ZWN0b3Iud1xyXG4gICAgfVxyXG4gIFxyXG4gICAgcmV0dXJuIGRlc3RcclxuICB9XHJcblxyXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJleHBvcnQgKiBmcm9tICcuL2NvcmUnXHJcbmV4cG9ydCAqIGZyb20gJy4vZ3JhcGhpY3MnXHJcbmV4cG9ydCAqIGZyb20gJy4vcGh5c2ljcydcclxuZXhwb3J0ICogZnJvbSAnLi92ZWN0b3JzJ1xyXG5leHBvcnQgKiBmcm9tICcuL3V0aWxpdGllcyciXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=