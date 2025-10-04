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
/******/ 	var __webpack_modules__ = ({

/***/ "./modules/core/component.ts":
/*!***********************************!*\
  !*** ./modules/core/component.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Component: () => (/* binding */ Component)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

class Component extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Component.prototype, "type", void 0);


/***/ }),

/***/ "./modules/core/components/biped.ts":
/*!******************************************!*\
  !*** ./modules/core/components/biped.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Biped: () => (/* binding */ Biped)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _body__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./body */ "./modules/core/components/body.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



let Biped = class Biped extends _body__WEBPACK_IMPORTED_MODULE_2__.Body {
    type = 'Biped';
    // True when a contact exists below the biped this step
    onGround = false;
    update(transform, deltaTime) {
        this.torque.reset();
        this.angularVelocity.reset();
        this.angularCorrection.reset();
        super.update(transform, deltaTime);
        const { yaw } = transform.rotation;
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.quat.fromEulerAngles(yaw, 0, 0, transform.rotation);
    }
};
Biped = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Register)()
], Biped);



/***/ }),

/***/ "./modules/core/components/body.ts":
/*!*****************************************!*\
  !*** ./modules/core/components/body.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Body: () => (/* binding */ Body)
/* harmony export */ });
/* harmony import */ var _luz_physics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/physics */ "./modules/physics/index.ts");
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../component */ "./modules/core/component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




let Body = class Body extends _component__WEBPACK_IMPORTED_MODULE_3__.Component {
    type = 'Body';
    timestep = 'Fixed';
    mass;
    volume;
    force;
    torque;
    linearVelocity;
    angularVelocity;
    angularCorrection;
    lastTransform = null;
    constructor({ mass = 1.0 } = {}) {
        super();
        this.mass = mass;
        this.force = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.zero.copy();
        this.torque = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.zero.copy();
        this.linearVelocity = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.zero.copy();
        this.angularVelocity = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.zero.copy();
        this.angularCorrection = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.zero.copy();
    }
    applyTransform(transform) {
        const { volume } = this;
        volume.applyTransform(transform);
        this.lastTransform = transform;
    }
    applyPositionCorrection(delta) {
        if (!this.lastTransform) {
            return;
        }
        this.lastTransform.translation.add(delta);
        this.volume.applyTransform(this.lastTransform);
    }
    update(transform, deltaTime) {
        const { mass, volume } = this;
        if (mass <= 0) {
            this.force.reset();
            this.torque.reset();
            this.linearVelocity.reset();
            this.angularVelocity.reset();
            volume.inverseInertia.reset();
            this.angularCorrection.reset();
            return;
        }
        volume.calculateInverseInertia(mass, transform);
        this.integrateLinearVelocity(transform, deltaTime);
        this.integrateAngularVelocity(transform, deltaTime);
    }
    integrateLinearVelocity(transform, deltaTime) {
        const acceleration = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(this.force, 1 / this.mass);
        this.linearVelocity.add(acceleration.scale(deltaTime));
        transform.translation.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(this.linearVelocity, deltaTime));
        this.volume.applyTransform(transform);
        this.force.reset();
    }
    integrateAngularVelocity(transform, deltaTime) {
        const { inverseInertia } = this.volume;
        const acceleration = inverseInertia.transform(this.torque);
        this.angularVelocity.add(acceleration.scale(deltaTime));
        const axis = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.normalize(this.angularVelocity);
        const angle = this.angularVelocity.length * deltaTime;
        if (angle !== 0) {
            transform.rotation.multiply(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.quat.fromAxisAngle(axis, angle));
        }
        this.torque.reset();
        this.angularCorrection.reset();
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(),
    __metadata("design:type", Number)
], Body.prototype, "mass", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(),
    __metadata("design:type", _luz_physics__WEBPACK_IMPORTED_MODULE_0__.Volume)
], Body.prototype, "volume", void 0);
Body = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Register)(),
    __metadata("design:paramtypes", [Object])
], Body);



/***/ }),

/***/ "./modules/core/components/camera.ts":
/*!*******************************************!*\
  !*** ./modules/core/components/camera.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Camera: () => (/* binding */ Camera)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../component */ "./modules/core/component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



let Camera = class Camera extends _component__WEBPACK_IMPORTED_MODULE_2__.Component {
    type = 'Camera';
    timestep = 'Variable';
    aspect = 1.0;
    aperture = 90.0;
    clipPlanes = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec2([1.0, 100.0]);
    viewMatrix = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4();
    modelViewMatrix = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4();
    projectionMatrix = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4();
    reconstructionMatrix = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4();
    update(transform, deltaTime) {
        const { modelMatrix } = transform;
        // view matrix
        modelMatrix.invert(this.viewMatrix);
        // model view matrix
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.multiply(this.viewMatrix, modelMatrix, this.modelViewMatrix);
        // perspective matrix
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.perspective(this.aperture, this.aspect, this.clipPlanes.x, this.clipPlanes.y, this.projectionMatrix);
        // reconstruction matrix (to reconstruct fragment positions)
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.multiply(this.projectionMatrix, this.viewMatrix, this.reconstructionMatrix).invert();
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Camera.prototype, "aspect", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Camera.prototype, "aperture", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec2)
], Camera.prototype, "clipPlanes", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Camera.prototype, "viewMatrix", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Camera.prototype, "modelViewMatrix", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Camera.prototype, "projectionMatrix", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Camera.prototype, "reconstructionMatrix", void 0);
Camera = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Register)()
], Camera);



/***/ }),

/***/ "./modules/core/components/light.ts":
/*!******************************************!*\
  !*** ./modules/core/components/light.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Light: () => (/* binding */ Light)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _camera__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./camera */ "./modules/core/components/camera.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



let Light = class Light extends _camera__WEBPACK_IMPORTED_MODULE_2__.Camera {
    type = 'Light';
    radius = 6.0;
    falloff = 10.0;
    intensity = 1.0;
    color = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.one.copy();
    translation = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3();
    direction = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3();
    textureMatrix = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4();
    biasMatrix = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4();
    constructor() {
        super();
        this.translation = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3();
        this.direction = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3();
        this.biasMatrix.translate(new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3([0.5, 0.5, 0.5]));
        this.biasMatrix.scale(new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3([0.5, 0.5, 0.5]));
    }
    update(transform, deltaTime) {
        super.update(transform, deltaTime);
        transform.translation.copy(this.translation);
        transform.direction.copy(this.direction);
        this.biasMatrix.copy(this.textureMatrix);
        this.textureMatrix.multiply(this.projectionMatrix);
        this.textureMatrix.multiply(this.viewMatrix);
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Light.prototype, "radius", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Light.prototype, "falloff", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Light.prototype, "intensity", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Light.prototype, "color", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Light.prototype, "translation", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Light.prototype, "direction", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Light.prototype, "textureMatrix", void 0);
Light = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Register)(),
    __metadata("design:paramtypes", [])
], Light);



/***/ }),

/***/ "./modules/core/components/model.ts":
/*!******************************************!*\
  !*** ./modules/core/components/model.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Model: () => (/* binding */ Model)
/* harmony export */ });
/* harmony import */ var _luz_graphics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/graphics */ "./modules/graphics/index.ts");
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../component */ "./modules/core/component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



let Model = class Model extends _component__WEBPACK_IMPORTED_MODULE_2__.Component {
    type = 'Model';
    timestep = 'Variable';
    materials = {};
    partitions = {};
    armatures = {};
    animations = {};
    boneMatrices; // uploaded separately
    isAnimated = false;
    static async deserialize(data) {
        const model = (await super.deserialize(data));
        if (Object.values(model.armatures).length > 0) {
            model.boneMatrices = new Float32Array(1024); // 16 * 64
            model.isAnimated = true;
        }
        return model;
    }
    update(transform, deltaTime) {
        const animations = Object.values(this.animations);
        animations.forEach((animation) => {
            animation.update(deltaTime);
        });
        const armatures = Object.values(this.armatures);
        armatures.forEach((armature) => {
            armature.update(deltaTime, animations);
        });
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(_luz_graphics__WEBPACK_IMPORTED_MODULE_0__.Material),
    __metadata("design:type", Object)
], Model.prototype, "materials", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(_luz_graphics__WEBPACK_IMPORTED_MODULE_0__.Partition),
    __metadata("design:type", Object)
], Model.prototype, "partitions", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(_luz_graphics__WEBPACK_IMPORTED_MODULE_0__.Armature),
    __metadata("design:type", Object)
], Model.prototype, "armatures", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(_luz_graphics__WEBPACK_IMPORTED_MODULE_0__.Animation),
    __metadata("design:type", Object)
], Model.prototype, "animations", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Uniform)(),
    __metadata("design:type", Boolean)
], Model.prototype, "isAnimated", void 0);
Model = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Register)()
], Model);



/***/ }),

/***/ "./modules/core/entity.ts":
/*!********************************!*\
  !*** ./modules/core/entity.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Entity: () => (/* binding */ Entity)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _transform__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./transform */ "./modules/core/transform.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./component */ "./modules/core/component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



class Entity extends _transform__WEBPACK_IMPORTED_MODULE_1__.Transform {
    components = {};
    // volume: Volume -- TODO: for visibility determination
    static async deserialize(data) {
        return (await super.deserialize(data));
    }
    update(deltaTime) {
        super.update(deltaTime);
        Object.values(this.components).forEach((component) => {
            if (component.timestep === 'Variable') {
                component.update(this, deltaTime);
            }
        });
    }
    fixedUpdate(deltaTime) {
        Object.values(this.components).forEach((component) => {
            if (component.timestep === 'Fixed') {
                component.update(this, deltaTime);
            }
        });
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(_component__WEBPACK_IMPORTED_MODULE_2__.Component),
    __metadata("design:type", Object)
], Entity.prototype, "components", void 0);


/***/ }),

/***/ "./modules/core/index.ts":
/*!*******************************!*\
  !*** ./modules/core/index.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Biped: () => (/* reexport safe */ _components_biped__WEBPACK_IMPORTED_MODULE_5__.Biped),
/* harmony export */   Body: () => (/* reexport safe */ _components_body__WEBPACK_IMPORTED_MODULE_4__.Body),
/* harmony export */   Camera: () => (/* reexport safe */ _components_camera__WEBPACK_IMPORTED_MODULE_8__.Camera),
/* harmony export */   Component: () => (/* reexport safe */ _component__WEBPACK_IMPORTED_MODULE_3__.Component),
/* harmony export */   Entity: () => (/* reexport safe */ _entity__WEBPACK_IMPORTED_MODULE_1__.Entity),
/* harmony export */   Light: () => (/* reexport safe */ _components_light__WEBPACK_IMPORTED_MODULE_7__.Light),
/* harmony export */   Model: () => (/* reexport safe */ _components_model__WEBPACK_IMPORTED_MODULE_6__.Model),
/* harmony export */   Scene: () => (/* reexport safe */ _scene__WEBPACK_IMPORTED_MODULE_0__.Scene),
/* harmony export */   Transform: () => (/* reexport safe */ _transform__WEBPACK_IMPORTED_MODULE_2__.Transform)
/* harmony export */ });
/* harmony import */ var _scene__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scene */ "./modules/core/scene.ts");
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./entity */ "./modules/core/entity.ts");
/* harmony import */ var _transform__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./transform */ "./modules/core/transform.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./component */ "./modules/core/component.ts");
/* harmony import */ var _components_body__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/body */ "./modules/core/components/body.ts");
/* harmony import */ var _components_biped__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/biped */ "./modules/core/components/biped.ts");
/* harmony import */ var _components_model__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/model */ "./modules/core/components/model.ts");
/* harmony import */ var _components_light__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/light */ "./modules/core/components/light.ts");
/* harmony import */ var _components_camera__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/camera */ "./modules/core/components/camera.ts");











/***/ }),

/***/ "./modules/core/scene.ts":
/*!*******************************!*\
  !*** ./modules/core/scene.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scene: () => (/* binding */ Scene)
/* harmony export */ });
/* harmony import */ var _luz_physics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/physics */ "./modules/physics/index.ts");
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _entity__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./entity */ "./modules/core/entity.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




const STEP_COUNT = 4;
const FRAME_RATE = 1 / 60;
const velocityIterations = 8;
const positionIterations = 8;
const contactRestVelocity = 0.002;
const penetrationTolerance = 0.001;
const positionCorrectionFactor = 0.25;
const positionCorrectionPerStep = 0.005;
// Consider surfaces with upward normal above this threshold as "ground".
// cos(maxSlopeAngle). 0.7 ~= 45 degrees.
const groundMinNormalY = 0.7;
// Allow larger per-step separation for dynamic pairs involving a Biped
// (applied to the non-biped body), to reduce tunneling.
const bipedDynamicCorrectionPerStep = 0.02;
const isBodyComponent = (component) => {
    return component.type === 'Body' || component.type === 'Biped';
};
class Scene extends _luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serializable {
    gravity;
    friction = 0.2;
    restitution = 0.2;
    linearDamping = 0.01;
    angularDamping = 0.01;
    entities = {};
    colliders = {};
    collisionManifolds = [];
    collisionDispatcher;
    elapsedTime = 0;
    constructor() {
        super();
        this.gravity = new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3([0, -9.81, 0]);
        this.collisionDispatcher = new _luz_physics__WEBPACK_IMPORTED_MODULE_0__.CollisionDispatcher();
    }
    static async deserialize(data) {
        return (await super.deserialize(data));
    }
    update(deltaTime) {
        const entities = Object.values(this.entities);
        this.elapsedTime += deltaTime;
        let steps = 0;
        // transform bodies
        entities.forEach((entity) => {
            Object.values(entity.components).forEach((component) => {
                if (isBodyComponent(component)) {
                    component.applyTransform(entity);
                }
            });
        });
        while (this.elapsedTime >= FRAME_RATE && steps++ < STEP_COUNT) {
            const components = entities.reduce((components, entity) => {
                return [...components, ...Object.values(entity.components)];
            }, []);
            const bodies = components.filter((component) => {
                return isBodyComponent(component);
            });
            this.applyGravity(bodies);
            this.applyDamping(bodies, FRAME_RATE);
            // fixed update
            entities.forEach((entity) => {
                entity.fixedUpdate(FRAME_RATE);
            });
            this.solveCollisions(bodies);
            this.elapsedTime -= FRAME_RATE;
        }
        // variable update
        entities.forEach((entity) => {
            entity.update(deltaTime);
        });
    }
    solveCollisions(bodies) {
        // Reset onGround for all bipeds before solving
        bodies.filter((b) => b.type === 'Biped').forEach((b) => {
            b.onGround = false;
        });
        // Velocity phase
        for (let iteration = 0; iteration < velocityIterations; iteration++) {
            this.detectCollisions(bodies);
            if (this.collisionManifolds.length === 0)
                break;
            this.updateBipedGroundState();
            this.resolveVelocities();
        }
        // Position phase
        for (let iteration = 0; iteration < positionIterations; iteration++) {
            this.detectCollisions(bodies);
            if (this.collisionManifolds.length === 0)
                break;
            this.updateBipedGroundState();
            const applied = this.resolvePositions();
            if (!applied)
                break;
        }
    }
    applyGravity(bodies) {
        const gravityForce = new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3();
        bodies.forEach((body) => {
            if (body.mass <= 0)
                return;
            _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(this.gravity, body.mass, gravityForce);
            body.force.add(gravityForce);
        });
    }
    applyDamping(bodies, deltaTime) {
        const hasLinear = this.linearDamping > 0;
        const hasAngular = this.angularDamping > 0;
        if (!hasLinear && !hasAngular)
            return;
        const linearFactor = hasLinear ? Math.exp(-this.linearDamping * deltaTime) : 1;
        const angularFactor = hasAngular ? Math.exp(-this.angularDamping * deltaTime) : 1;
        bodies.forEach((body) => {
            if (body.mass <= 0)
                return;
            if (hasLinear)
                body.linearVelocity.scale(linearFactor);
            if (hasAngular)
                body.angularVelocity.scale(angularFactor);
        });
    }
    detectCollisions(bodies) {
        this.collisionManifolds.length = 0;
        // body-vs-body
        for (let i = 0; i < bodies.length; i++) {
            const b1 = bodies[i];
            for (let j = i + 1; j < bodies.length; j++) {
                const b2 = bodies[j];
                const collisions = this.collisionDispatcher.dispatch(b1.volume, b2.volume);
                if (collisions && collisions.length > 0) {
                    this.collisionManifolds.push({ bodies: [b1, b2], collisions });
                }
            }
        }
        // body-vs-static
        bodies.forEach((body) => {
            const colliders = Object.values(this.colliders);
            colliders.forEach((collider) => {
                const collisions = this.collisionDispatcher.dispatch(body.volume, collider);
                if (collisions && collisions.length > 0) {
                    this.collisionManifolds.push({ bodies: [body, null], collisions });
                }
            });
        });
    }
    // Stable per-pair normal orientation (shared by both solvers)
    orientNormalForPair(nIn, contact, b1, b2) {
        const n = nIn.copy();
        const r1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(contact, b1.volume.center, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
        if (b2) {
            const c12 = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(b2.volume.center, b1.volume.center, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
            if (_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.dot(n, c12) < 0)
                n.scale(-1);
        }
        else {
            if (_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.dot(n, r1) < 0)
                n.scale(-1);
        }
        return n;
    }
    resolveVelocities() {
        this.collisionManifolds.forEach(({ bodies, collisions }) => {
            const [b1, b2] = bodies;
            collisions.forEach(({ contact, normal: collisionNormal, distance }) => {
                const normal = this.orientNormalForPair(collisionNormal, contact, b1, b2);
                // Contact point offsets
                const r1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(contact, b1.volume.center, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                const contactVelocity1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.add(b1.linearVelocity, _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(b1.angularVelocity, r1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                const r2 = b2 ? _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(contact, b2.volume.center, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()) : null;
                const contactVelocity2 = b2
                    ? _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.add(b2.linearVelocity, _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(b2.angularVelocity, r2, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3())
                    : null;
                // Relative velocity
                const relativeVelocity = contactVelocity2
                    ? _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(contactVelocity2, contactVelocity1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3())
                    : _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.zero, contactVelocity1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                const velocityAlongNormal = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.dot(relativeVelocity, normal);
                if (velocityAlongNormal > 0)
                    return; // separating
                // Tangent
                const tangent = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(relativeVelocity, _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(normal, velocityAlongNormal, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()));
                const tangentLength = tangent.length;
                const tangentDirection = tangentLength > 0 ? tangent.normalize() : _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.zero;
                const restitution = Math.abs(velocityAlongNormal) < contactRestVelocity ? 0 : this.restitution;
                const impulseScalar = Math.max(-((1.0 + restitution) * velocityAlongNormal), 0);
                // Mass/inertia
                // Treat Biped as immovable for dynamic collisions, but allow
                // normal impulses vs static colliders (b2 === null) to prevent tunneling.
                const b1IsBiped = b1.type === 'Biped';
                const b2IsBiped = b2 ? b2.type === 'Biped' : false;
                const invMass1Base = b1.mass > 0 ? 1.0 / b1.mass : 0;
                const invMass2Base = b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0;
                const inverseMass1 = b1IsBiped && b2 ? 0 : invMass1Base;
                const inverseMass2 = b2 ? (b2IsBiped ? 0 : invMass2Base) : 0;
                const totalInverseMass = inverseMass1 + inverseMass2;
                if (totalInverseMass === 0)
                    return;
                const inverseInertia1 = b1.volume.inverseInertia;
                const inverseInertia2 = b2 ? b2.volume.inverseInertia : null;
                const computeEffectiveMass = (direction) => {
                    let denominator = totalInverseMass;
                    if (inverseMass1 > 0) {
                        const r1CrossDir = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(r1, direction, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                        const angularComponent1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(inverseInertia1.transform(r1CrossDir, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()), r1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                        denominator += _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.dot(angularComponent1, direction);
                    }
                    if (b2 && inverseMass2 > 0 && r2 && inverseInertia2) {
                        const r2CrossDir = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(r2, direction, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                        const angularComponent2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(inverseInertia2.transform(r2CrossDir, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()), r2, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                        denominator += _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.dot(angularComponent2, direction);
                    }
                    return denominator;
                };
                const normalEffectiveMass = computeEffectiveMass(normal);
                if (normalEffectiveMass <= 0)
                    return;
                const normalImpulseMagnitude = impulseScalar > 0 ? impulseScalar / normalEffectiveMass : 0;
                if (normalImpulseMagnitude > 0) {
                    const normalImpulse = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(normal, normalImpulseMagnitude, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                    if (inverseMass1 > 0) {
                        b1.linearVelocity.subtract(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(normalImpulse, inverseMass1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()));
                        const angularImpulse1 = inverseInertia1.transform(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(r1, normalImpulse, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                        b1.angularVelocity.subtract(angularImpulse1);
                    }
                    if (b2 && inverseMass2 > 0 && r2 && inverseInertia2) {
                        b2.linearVelocity.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(normalImpulse, inverseMass2, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()));
                        const angularImpulse2 = inverseInertia2.transform(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(r2, normalImpulse, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                        b2.angularVelocity.add(angularImpulse2);
                    }
                }
                // Friction
                // --- Tangential Friction (stick–slip) ---
                if (tangentLength > 0) {
                    const frictionEffectiveMass = computeEffectiveMass(tangentDirection);
                    if (frictionEffectiveMass > 0) {
                        // Desired impulse to zero tangential velocity (static attempt)
                        let jt = -_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.dot(relativeVelocity, tangentDirection) / frictionEffectiveMass;
                        const jn = Math.abs(normalImpulseMagnitude);
                        const mu_s = this.friction * 1.5; // static friction coefficient (tune)
                        const mu_d = this.friction; // dynamic friction coefficient
                        // Clamp for stick or slip
                        if (Math.abs(jt) <= mu_s * jn) {
                            // Static friction: use exactly what's needed to stop tangential motion
                            // (jt already computed)
                        }
                        else {
                            // Dynamic friction: clamp to Coulomb bound
                            jt = Math.sign(jt) * mu_d * jn;
                        }
                        if (jt !== 0) {
                            const frictionImpulse = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(tangentDirection, jt, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                            if (inverseMass1 > 0) {
                                b1.linearVelocity.subtract(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(frictionImpulse, inverseMass1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()));
                                const angularImpulse1 = inverseInertia1.transform(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(r1, frictionImpulse, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                                b1.angularVelocity.subtract(angularImpulse1);
                            }
                            if (b2 && inverseMass2 > 0 && r2 && inverseInertia2) {
                                b2.linearVelocity.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(frictionImpulse, inverseMass2, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()));
                                const angularImpulse2 = inverseInertia2.transform(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.cross(r2, frictionImpulse, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                                b2.angularVelocity.add(angularImpulse2);
                            }
                        }
                    }
                }
            });
        });
    }
    resolvePositions() {
        let appliedCorrection = false;
        // IMPORTANT: one correction per manifold (pair), using MAX penetration across contacts.
        this.collisionManifolds.forEach(({ bodies, collisions }) => {
            const [b1, b2] = bodies;
            // Pick the deepest contact and a stable normal for the pair
            let maxDepth = 0;
            let chosenNormal = null;
            let chosenContact = null;
            for (const { contact, normal: nIn, distance } of collisions) {
                const depth = Math.max(distance - penetrationTolerance, 0);
                if (depth > maxDepth) {
                    maxDepth = depth;
                    chosenContact = contact;
                    // Orient normal deterministically
                    chosenNormal = this.orientNormalForPair(nIn, contact, b1, b2);
                }
            }
            if (!chosenNormal || !chosenContact || maxDepth <= 0) {
                return;
            }
            // For position correction:
            // - Do not move Biped in dynamic-dynamic pairs (let the other body move)
            // - Allow Biped to be corrected against static colliders (b2 === null)
            const b1IsBiped = b1.type === 'Biped';
            const b2IsBiped = b2 ? b2.type === 'Biped' : false;
            const invMass1Base = b1.mass > 0 ? 1.0 / b1.mass : 0;
            const invMass2Base = b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0;
            const inverseMass1 = b1IsBiped && b2 ? 0 : invMass1Base;
            const inverseMass2 = b2 ? (b2IsBiped ? 0 : invMass2Base) : 0;
            const totalInverseMass = inverseMass1 + inverseMass2;
            if (totalInverseMass === 0)
                return;
            // Single correction for the pair
            let correctionMagnitude = (maxDepth * positionCorrectionFactor) / totalInverseMass;
            // Clamp per-step correction. For biped-vs-dynamic pairs, scale the clamp so that the
            // non-biped body can move up to a fixed amount regardless of its mass.
            let perStepClamp = positionCorrectionPerStep;
            if (b2 && b1IsBiped && inverseMass2 > 0) {
                // Ensure b2 can move up to bipedDynamicCorrectionPerStep this iteration
                perStepClamp = Math.max(perStepClamp, bipedDynamicCorrectionPerStep / inverseMass2);
            }
            else if (!b2 && b1IsBiped) {
                // biped vs static: keep default clamp
            }
            else if (b2IsBiped && inverseMass1 > 0) {
                // Ensure b1 can move up to bipedDynamicCorrectionPerStep this iteration
                perStepClamp = Math.max(perStepClamp, bipedDynamicCorrectionPerStep / inverseMass1);
            }
            if (correctionMagnitude > perStepClamp) {
                correctionMagnitude = perStepClamp;
            }
            const correction = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(chosenNormal, correctionMagnitude, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
            // Move b1 opposite n, b2 along n (same pairing as velocity impulses)
            if (inverseMass1 > 0) {
                b1.applyPositionCorrection(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(correction, -inverseMass1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()));
                appliedCorrection = true;
            }
            if (b2 && inverseMass2 > 0) {
                b2.applyPositionCorrection(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(correction, +inverseMass2, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()));
                appliedCorrection = true;
            }
        });
        return appliedCorrection;
    }
    updateBipedGroundState() {
        // Mark bipeds as onGround only if contact is below center AND
        // the surface normal is sufficiently upward (not a wall).
        this.collisionManifolds.forEach(({ bodies, collisions }) => {
            const [b1, b2] = bodies;
            const b1IsBiped = b1.type === 'Biped';
            const b2IsBiped = b2 ? b2.type === 'Biped' : false;
            if (!b1IsBiped && !b2IsBiped)
                return;
            collisions.forEach(({ contact, normal }) => {
                const isGroundish = normal.y >= groundMinNormalY;
                if (b1IsBiped) {
                    const r1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(contact, b1.volume.center, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                    if (r1.y < 0 && isGroundish)
                        b1.onGround = true;
                }
                if (b2 && b2IsBiped) {
                    const r2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.subtract(contact, b2.volume.center, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3());
                    if (r2.y < 0 && isGroundish)
                        b2.onGround = true;
                }
            });
        });
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3)
], Scene.prototype, "gravity", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(),
    __metadata("design:type", Number)
], Scene.prototype, "friction", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(),
    __metadata("design:type", Number)
], Scene.prototype, "restitution", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(),
    __metadata("design:type", Number)
], Scene.prototype, "linearDamping", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(),
    __metadata("design:type", Number)
], Scene.prototype, "angularDamping", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(_entity__WEBPACK_IMPORTED_MODULE_3__.Entity),
    __metadata("design:type", Object)
], Scene.prototype, "entities", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_1__.Serialize)(_luz_physics__WEBPACK_IMPORTED_MODULE_0__.Collider),
    __metadata("design:type", Object)
], Scene.prototype, "colliders", void 0);


/***/ }),

/***/ "./modules/core/transform.ts":
/*!***********************************!*\
  !*** ./modules/core/transform.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Transform: () => (/* binding */ Transform)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


class Transform extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    scale = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.one.copy();
    rotation = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.quat.identity.copy();
    translation = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero.copy();
    direction = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3();
    modelMatrix = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4();
    normalMatrix = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat3();
    rotationMatrix = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat3();
    static origin = new Transform();
    constructor({ translation = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero, rotation = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.quat.identity, scale = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.one } = {}) {
        super();
        this.translation = translation.copy();
        this.rotation = rotation.copy();
        this.scale = scale.copy();
    }
    update(deltaTime) {
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.construct(this.translation, this.rotation, this.scale, this.modelMatrix);
        this.modelMatrix.toMat3(this.rotationMatrix);
        this.rotationMatrix.row(2, this.direction).normalize();
        this.rotationMatrix.invert(this.normalMatrix).transpose();
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Transform.prototype, "scale", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.quat)
], Transform.prototype, "rotation", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Transform.prototype, "translation", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Transform.prototype, "direction", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Transform.prototype, "modelMatrix", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Transform.prototype, "normalMatrix", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Transform.prototype, "rotationMatrix", void 0);


/***/ }),

/***/ "./modules/graphics/index.ts":
/*!***********************************!*\
  !*** ./modules/graphics/index.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* reexport safe */ _renderer_animation__WEBPACK_IMPORTED_MODULE_13__.Animation),
/* harmony export */   Armature: () => (/* reexport safe */ _renderer_armature__WEBPACK_IMPORTED_MODULE_12__.Armature),
/* harmony export */   Bone: () => (/* reexport safe */ _renderer_bone__WEBPACK_IMPORTED_MODULE_15__.Bone),
/* harmony export */   Buffers: () => (/* reexport safe */ _managers_buffers__WEBPACK_IMPORTED_MODULE_3__.Buffers),
/* harmony export */   Keyframe: () => (/* reexport safe */ _renderer_keyframe__WEBPACK_IMPORTED_MODULE_17__.Keyframe),
/* harmony export */   Material: () => (/* reexport safe */ _renderer_material__WEBPACK_IMPORTED_MODULE_11__.Material),
/* harmony export */   Meshes: () => (/* reexport safe */ _managers_meshes__WEBPACK_IMPORTED_MODULE_2__.Meshes),
/* harmony export */   Partition: () => (/* reexport safe */ _renderer_partition__WEBPACK_IMPORTED_MODULE_14__.Partition),
/* harmony export */   Programs: () => (/* reexport safe */ _managers_programs__WEBPACK_IMPORTED_MODULE_6__.Programs),
/* harmony export */   RenderPass: () => (/* reexport safe */ _renderer_pass__WEBPACK_IMPORTED_MODULE_8__.RenderPass),
/* harmony export */   RenderTarget: () => (/* reexport safe */ _renderer_target__WEBPACK_IMPORTED_MODULE_9__.RenderTarget),
/* harmony export */   Renderer: () => (/* reexport safe */ _renderer_renderer__WEBPACK_IMPORTED_MODULE_1__.Renderer),
/* harmony export */   RotationKeyframe: () => (/* reexport safe */ _renderer_keyframe__WEBPACK_IMPORTED_MODULE_17__.RotationKeyframe),
/* harmony export */   Samplers: () => (/* reexport safe */ _managers_samplers__WEBPACK_IMPORTED_MODULE_7__.Samplers),
/* harmony export */   ScaleKeyframe: () => (/* reexport safe */ _renderer_keyframe__WEBPACK_IMPORTED_MODULE_17__.ScaleKeyframe),
/* harmony export */   Shaders: () => (/* reexport safe */ _managers_shaders__WEBPACK_IMPORTED_MODULE_4__.Shaders),
/* harmony export */   State: () => (/* reexport safe */ _renderer_state__WEBPACK_IMPORTED_MODULE_0__.State),
/* harmony export */   Surface: () => (/* reexport safe */ _renderer_surface__WEBPACK_IMPORTED_MODULE_10__.Surface),
/* harmony export */   Textures: () => (/* reexport safe */ _managers_textures__WEBPACK_IMPORTED_MODULE_5__.Textures),
/* harmony export */   TranslationKeyframe: () => (/* reexport safe */ _renderer_keyframe__WEBPACK_IMPORTED_MODULE_17__.TranslationKeyframe),
/* harmony export */   Weight: () => (/* reexport safe */ _renderer_weight__WEBPACK_IMPORTED_MODULE_16__.Weight)
/* harmony export */ });
/* harmony import */ var _renderer_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./renderer/state */ "./modules/graphics/renderer/state.ts");
/* harmony import */ var _renderer_renderer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./renderer/renderer */ "./modules/graphics/renderer/renderer.ts");
/* harmony import */ var _managers_meshes__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./managers/meshes */ "./modules/graphics/managers/meshes.ts");
/* harmony import */ var _managers_buffers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./managers/buffers */ "./modules/graphics/managers/buffers.ts");
/* harmony import */ var _managers_shaders__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./managers/shaders */ "./modules/graphics/managers/shaders.ts");
/* harmony import */ var _managers_textures__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./managers/textures */ "./modules/graphics/managers/textures.ts");
/* harmony import */ var _managers_programs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./managers/programs */ "./modules/graphics/managers/programs.ts");
/* harmony import */ var _managers_samplers__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./managers/samplers */ "./modules/graphics/managers/samplers.ts");
/* harmony import */ var _renderer_pass__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./renderer/pass */ "./modules/graphics/renderer/pass.ts");
/* harmony import */ var _renderer_target__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./renderer/target */ "./modules/graphics/renderer/target.ts");
/* harmony import */ var _renderer_surface__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./renderer/surface */ "./modules/graphics/renderer/surface.ts");
/* harmony import */ var _renderer_material__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./renderer/material */ "./modules/graphics/renderer/material.ts");
/* harmony import */ var _renderer_armature__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./renderer/armature */ "./modules/graphics/renderer/armature.ts");
/* harmony import */ var _renderer_animation__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./renderer/animation */ "./modules/graphics/renderer/animation.ts");
/* harmony import */ var _renderer_partition__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./renderer/partition */ "./modules/graphics/renderer/partition.ts");
/* harmony import */ var _renderer_bone__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./renderer/bone */ "./modules/graphics/renderer/bone.ts");
/* harmony import */ var _renderer_weight__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./renderer/weight */ "./modules/graphics/renderer/weight.ts");
/* harmony import */ var _renderer_keyframe__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./renderer/keyframe */ "./modules/graphics/renderer/keyframe.ts");




















/***/ }),

/***/ "./modules/graphics/managers/buffers.ts":
/*!**********************************************!*\
  !*** ./modules/graphics/managers/buffers.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Buffers: () => (/* binding */ Buffers)
/* harmony export */ });
class Buffers {
    gl;
    buffers = [];
    boundBuffers = {};
    constructor(gl) {
        this.gl = gl;
    }
    create(target, data) {
        switch (target) {
            case 'FrameBuffer':
                const frameBuffer = this.gl.createFramebuffer();
                frameBuffer.target = this.gl.FRAMEBUFFER;
                frameBuffer.attachments = {};
                this.buffers.push(frameBuffer);
                return frameBuffer;
            case 'RenderBuffer':
                const renderBuffer = this.gl.createRenderbuffer();
                renderBuffer.target = this.gl.RENDERBUFFER;
                this.buffers.push(renderBuffer);
                return renderBuffer;
            case 'UniformBuffer':
                const buffer = this.gl.createBuffer();
                buffer.target = this.gl.UNIFORM_BUFFER;
                buffer.usage = this.gl.DYNAMIC_DRAW;
                if (data) {
                    this.update(buffer, data);
                }
                this.buffers.push(buffer);
                return buffer;
            default:
                throw new Error(`Invalid buffer target: ${target}`);
        }
    }
    update(buffer, data, offset) {
        this.bind(buffer);
        if (offset !== undefined) {
            this.gl.bufferSubData(buffer.target, offset, data);
        }
        else {
            this.gl.bufferData(buffer.target, data, buffer.usage);
        }
    }
    format(buffer, format, width, height) {
        this.bind(buffer);
        this.gl.renderbufferStorage(buffer.target, format, width, height);
    }
    attach(frameBuffer, data, attachment) {
        this.bind(frameBuffer);
        switch (data.target) {
            case this.gl.TEXTURE_2D:
                this.gl.framebufferTexture2D(frameBuffer.target, attachment, data.target, data, 0);
                break;
            case this.gl.RENDERBUFFER:
                this.gl.framebufferRenderbuffer(frameBuffer.target, attachment, this.gl.RENDERBUFFER, data);
                break;
        }
        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
            throw new Error('Framebuffer is incomplete');
        }
        frameBuffer.attachments[attachment] = data;
    }
    bind(buffer) {
        const { target } = buffer;
        const boundBuffer = this.boundBuffers[target];
        if (boundBuffer === buffer) {
            return;
        }
        switch (target) {
            case this.gl.FRAMEBUFFER:
                /*const frameBuffer = buffer as FrameBuffer
        
                Object.values(frameBuffer.attachments).forEach((attachment) => {
                  const texture = attachment as Texture
                  const { target, useMipmaps } = texture
        
                  if (useMipmaps) {
                    this.gl.bindTexture(target, texture)
                    this.gl.generateMipmap(target)
                  }
                })*/
                this.gl.bindFramebuffer(target, buffer);
                break;
            case this.gl.RENDERBUFFER:
                this.gl.bindRenderbuffer(target, buffer);
                break;
            default:
                this.gl.bindBuffer(target, buffer);
                break;
        }
        this.boundBuffers[target] = buffer;
    }
    unbind(target) {
        switch (target) {
            case 'FrameBuffer':
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
                break;
            case 'RenderBuffer':
                this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
                break;
            case 'UniformBuffer':
                this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
                break;
        }
    }
}


/***/ }),

/***/ "./modules/graphics/managers/meshes.ts":
/*!*********************************************!*\
  !*** ./modules/graphics/managers/meshes.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Meshes: () => (/* binding */ Meshes)
/* harmony export */ });
const vertexSize = 8; // position (xyz) + normal (xyz) + texture coordinates (uv)
const stride = vertexSize * Float32Array.BYTES_PER_ELEMENT;
class Meshes {
    gl;
    constructor(gl) {
        this.gl = gl;
    }
    create(partition, material) {
        if (!partition.topology) {
            throw new Error('Mesh has no topology');
        }
        if (!partition.vertices || partition.vertices.length === 0) {
            throw new Error('Mesh has no vertices');
        }
        const vertexArray = this.gl.createVertexArray();
        vertexArray.topology = partition.topology;
        vertexArray.vertexCount = partition.vertices.length / vertexSize;
        const vertexBuffer = this.gl.createBuffer();
        const vertices = new Float32Array(partition.vertices);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        const boneIndices = new Float32Array(vertexArray.vertexCount * 4);
        const boneWeights = new Float32Array(vertexArray.vertexCount * 4);
        partition.weights.forEach((weight, index) => {
            boneIndices.set(weight.indices, index * 4);
            boneWeights.set(weight.weights, index * 4);
        });
        const boneIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneIndexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, boneIndices, this.gl.STATIC_DRAW);
        const boneWeightBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneWeightBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, boneWeights, this.gl.STATIC_DRAW);
        let indexBuffer = null;
        if (partition.indices && partition.indices.length > 0) {
            indexBuffer = this.gl.createBuffer();
            const indices = new Uint16Array(partition.indices);
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
            vertexArray.indexCount = indices.length;
        }
        else {
            vertexArray.indexCount = 0;
        }
        this.gl.bindVertexArray(vertexArray);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        // position
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, stride, 0);
        // normal
        this.gl.enableVertexAttribArray(1);
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, true, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
        // coordinates
        this.gl.enableVertexAttribArray(2);
        this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT);
        // bone indices
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneIndexBuffer);
        this.gl.vertexAttribPointer(3, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(3);
        // bone weights
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boneWeightBuffer);
        this.gl.vertexAttribPointer(4, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(4);
        // indices
        if (indexBuffer != null) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        }
        this.gl.bindVertexArray(null);
        return { vertexArray, material };
    }
    render(mesh) {
        const { vertexArray } = mesh;
        const { topology, vertexCount, indexCount } = vertexArray;
        if (!vertexArray) {
            throw new Error('Mesh has no vertex array');
        }
        let mode;
        switch (topology) {
            case 'Points':
                mode = this.gl.POINTS;
                break;
            case 'Lines':
                mode = this.gl.LINES;
                break;
            case 'LineLoop':
                mode = this.gl.LINE_LOOP;
                break;
            case 'LineStrip':
                mode = this.gl.LINE_STRIP;
                break;
            case 'Triangles':
                mode = this.gl.TRIANGLES;
                break;
            case 'TriangleFan':
                mode = this.gl.TRIANGLE_FAN;
                break;
            case 'TriangleStrip':
                mode = this.gl.TRIANGLE_STRIP;
                break;
            default:
                throw new Error(`Invalid topology: ${topology}`);
        }
        this.gl.bindVertexArray(vertexArray);
        if (vertexArray.indexCount > 0) {
            this.gl.drawElements(mode, indexCount, this.gl.UNSIGNED_SHORT, 0);
        }
        else {
            this.gl.drawArrays(mode, 0, vertexCount);
        }
        this.gl.bindVertexArray(null);
    }
}


/***/ }),

/***/ "./modules/graphics/managers/programs.ts":
/*!***********************************************!*\
  !*** ./modules/graphics/managers/programs.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Programs: () => (/* binding */ Programs)
/* harmony export */ });
class Programs {
    gl;
    programs = [];
    usedProgram; // TODO: should be 'boundProgram' for sake of consistency
    constructor(gl) {
        this.gl = gl;
    }
    create(vertexShader, fragmentShader, data) {
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
        if (data) {
            this.update(program, data);
        }
        this.programs.push(program);
        return program;
    }
    update(program, data) {
        this.use(program);
        if (data.uniforms) {
            Object.keys(data.uniforms).forEach((name) => {
                const value = data.uniforms[name];
                if (value === undefined) {
                    // tslint:disable-next-line: no-console
                    console.warn('Skipping undefined uniform value:', name);
                    return;
                }
                const uniform = program.uniforms[name];
                if (uniform) {
                    switch (uniform.type) {
                        case this.gl.SAMPLER_2D: {
                            const slot = program.textureSlots[name];
                            const texture = value;
                            this.gl.activeTexture(this.gl.TEXTURE0 + slot);
                            this.gl.bindTexture(texture.target, texture);
                            break;
                        }
                        case this.gl.BOOL: {
                            this.gl.uniform1i(uniform.location, value ? 1 : 0);
                            break;
                        }
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
        if (data.uniformBuffers) {
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
                const name = uniform.name.replace(/\[0\]$/, '');
                const location = this.gl.getUniformLocation(program, name);
                if (location != null) {
                    uniform.location = location;
                    program.uniforms[name] = uniform;
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
        this.use(program);
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

/***/ "./modules/graphics/managers/samplers.ts":
/*!***********************************************!*\
  !*** ./modules/graphics/managers/samplers.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Samplers: () => (/* binding */ Samplers)
/* harmony export */ });
class Samplers {
    gl;
    samplers = [];
    boundSamplers = {};
    constructor(gl) {
        this.gl = gl;
    }
    create(filtering = 'None', tiling = 'None') {
        let sampler = this.gl.createSampler();
        this.update(sampler, filtering, tiling);
        this.samplers.push(sampler);
        return sampler;
    }
    update(sampler, filtering, tiling) {
        switch (filtering) {
            case 'None':
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                break;
            case 'Linear':
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
                break;
            case 'Bilinear':
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
                break;
            case 'Trilinear':
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
                break;
        }
        switch (tiling) {
            case 'Repeat':
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
                break;
            case 'Mirror':
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);
            default:
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
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

/***/ "./modules/graphics/managers/shaders.ts":
/*!**********************************************!*\
  !*** ./modules/graphics/managers/shaders.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Shaders: () => (/* binding */ Shaders)
/* harmony export */ });
class Shaders {
    gl;
    shaders = [];
    constructor(gl) {
        this.gl = gl;
    }
    create(stage, source, headers) {
        let type;
        switch (stage) {
            case 'Vertex':
                type = this.gl.VERTEX_SHADER;
                break;
            case 'Fragment':
                type = this.gl.FRAGMENT_SHADER;
                break;
        }
        if (headers && headers.length > 0) {
            headers
                .slice()
                .reverse()
                .forEach((header) => {
                source = `${header}\n${source}`;
            });
        }
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        shader.isCompiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (!shader.isCompiled || !this.gl.isShader(shader)) {
            source.split('\n').forEach((line, index) => {
                console.log(`${index + 1}\t${line}`);
            });
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

/***/ "./modules/graphics/managers/textures.ts":
/*!***********************************************!*\
  !*** ./modules/graphics/managers/textures.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Textures: () => (/* binding */ Textures)
/* harmony export */ });
class Textures {
    gl;
    textures = [];
    boundTextures = {};
    constructor(gl) {
        this.gl = gl;
    }
    create(surface) {
        const { gl } = this;
        const texture = gl.createTexture();
        const { width = 1, height = 1, precision = 8, format = 'Color' } = surface;
        const { tiling = 'None', filtering = 'None', useMipmaps = false } = surface;
        texture.width = width;
        texture.height = height;
        texture.target = gl.TEXTURE_2D;
        switch (format) {
            case 'Color':
                switch (precision) {
                    case 8:
                        texture.components = gl.RGBA;
                        texture.dataFormat = gl.RGBA;
                        texture.dataType = gl.UNSIGNED_BYTE;
                        break;
                    case 32:
                        texture.components = gl.RGBA32F;
                        texture.dataFormat = gl.RGBA;
                        texture.dataType = gl.FLOAT;
                        break;
                    default:
                        throw new Error(`Invalid texture precision: ${precision}`);
                }
                break;
            case 'Alpha':
                switch (precision) {
                    case 8:
                        texture.components = gl.ALPHA;
                        texture.dataFormat = gl.ALPHA;
                        texture.dataType = gl.UNSIGNED_BYTE;
                        break;
                    case 32:
                        texture.components = gl.ALPHA;
                        texture.dataFormat = gl.ALPHA;
                        texture.dataType = gl.FLOAT;
                        break;
                    default:
                        throw new Error(`Invalid texture precision: ${precision}`);
                }
                break;
            case 'Depth': {
                switch (precision) {
                    case 24:
                        texture.components = gl.DEPTH_COMPONENT24;
                        texture.dataFormat = gl.DEPTH_COMPONENT;
                        texture.dataType = gl.UNSIGNED_INT;
                        break;
                    case 32:
                        texture.components = gl.DEPTH_COMPONENT32F;
                        texture.dataFormat = gl.DEPTH_COMPONENT;
                        texture.dataType = gl.FLOAT;
                        break;
                    default:
                        throw new Error(`Invalid texture precision: ${precision}`);
                }
                break;
            }
            default:
                throw new Error(`Invalid texture format: ${format}`);
        }
        this.bind(texture, 0);
        const { target, components, dataFormat, dataType } = texture;
        gl.texImage2D(target, 0, components, width, height, 0, dataFormat, dataType, null);
        switch (tiling) {
            case 'None':
                gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                break;
            case 'Repeat':
                gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.REPEAT);
                break;
            case 'Mirror':
                gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                break;
            default:
                throw new Error(`Invalid texture tiling: ${tiling}`);
        }
        switch (filtering) {
            case 'None':
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                break;
            case 'Linear':
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, useMipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR);
                break;
            case 'Bilinear':
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, useMipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR);
                break;
            case 'Trilinear':
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, useMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
                break;
        }
        if (surface.data) {
            this.update(texture, surface.data);
        }
        this.textures.push(texture);
        return texture;
    }
    update(texture, data, x = 0, y = 0, width, height) {
        const { gl } = this;
        if (width === undefined) {
            width = texture.width;
        }
        if (height === undefined) {
            height = texture.width;
        }
        this.bind(texture, 0);
        const { target, components, dataType, useMipmaps } = texture;
        gl.texSubImage2D(target, 0, x, y, width, height, components, dataType, data);
        if (useMipmaps) {
            gl.generateMipmap(target);
        }
        texture.data = data;
    }
    bind(texture, unit) {
        const { gl } = this;
        if (this.boundTextures[unit] === texture) {
            return;
        }
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(texture.target, texture);
        this.boundTextures[unit] = texture;
    }
}


/***/ }),

/***/ "./modules/graphics/renderer/animation.ts":
/*!************************************************!*\
  !*** ./modules/graphics/renderer/animation.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* binding */ Animation),
/* harmony export */   Keyframes: () => (/* binding */ Keyframes)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _keyframe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./keyframe */ "./modules/graphics/renderer/keyframe.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


class Keyframes extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    scale = [];
    rotation = [];
    translation = [];
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(_keyframe__WEBPACK_IMPORTED_MODULE_1__.ScaleKeyframe),
    __metadata("design:type", Array)
], Keyframes.prototype, "scale", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(_keyframe__WEBPACK_IMPORTED_MODULE_1__.RotationKeyframe),
    __metadata("design:type", Array)
], Keyframes.prototype, "rotation", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(_keyframe__WEBPACK_IMPORTED_MODULE_1__.TranslationKeyframe),
    __metadata("design:type", Array)
], Keyframes.prototype, "translation", void 0);
class Animation extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    keyframes = {};
    duration;
    time = 0.0;
    weight = 1.0;
    state = 'Stop';
    update(deltaTime) {
        switch (this.state) {
            case 'Play':
                this.time += deltaTime;
                if (this.time >= this.duration) {
                    this.state = 'Stop';
                }
                break;
            case 'Loop':
                this.time += deltaTime;
                this.time %= this.duration;
                break;
            case 'Pause':
                break;
            case 'Stop':
                this.time = 0.0;
                break;
        }
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(Keyframes),
    __metadata("design:type", Object)
], Animation.prototype, "keyframes", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Animation.prototype, "duration", void 0);


/***/ }),

/***/ "./modules/graphics/renderer/armature.ts":
/*!***********************************************!*\
  !*** ./modules/graphics/renderer/armature.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Armature: () => (/* binding */ Armature)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _bone__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bone */ "./modules/graphics/renderer/bone.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


class Armature extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    bones = [];
    rootBones = [];
    static async deserialize(data) {
        const armature = (await super.deserialize(data));
        armature.bones.forEach((bone) => {
            if (bone.parent) {
                const parentBone = armature.bones.find(({ name }) => name === bone.parent);
                if (!parentBone) {
                    throw new Error(`Missing parent ${bone.parent} for bone ${bone.name}`);
                }
                bone.parentBone = parentBone;
                parentBone.childBones.push(bone);
            }
            else {
                armature.rootBones.push(bone);
            }
        });
        return armature;
    }
    update(deltaTime, animations) {
        this.rootBones.forEach((bone) => {
            bone.update(deltaTime, animations);
        });
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(_bone__WEBPACK_IMPORTED_MODULE_1__.Bone),
    __metadata("design:type", Array)
], Armature.prototype, "bones", void 0);


/***/ }),

/***/ "./modules/graphics/renderer/bone.ts":
/*!*******************************************!*\
  !*** ./modules/graphics/renderer/bone.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Bone: () => (/* binding */ Bone)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _luz_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luz/core */ "./modules/core/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



class Bone extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    name = '';
    parent = '';
    head = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero.copy();
    tail = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero.copy();
    bindMatrix = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.identity.copy();
    parentBone = null;
    childBones = [];
    poseMatrix = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.identity.copy();
    localMatrix = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.identity.copy();
    inverseBindMatrix = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.identity.copy();
    constructor({ name, parent, head, tail, bindMatrix } = {}) {
        super();
        if (name) {
            this.name = name;
        }
        if (head) {
            this.head.set(head);
        }
        if (tail) {
            this.tail.set(tail);
        }
        if (parent) {
            this.parent = parent;
        }
        if (bindMatrix) {
            this.bindMatrix.set(bindMatrix);
            this.bindMatrix.invert(this.inverseBindMatrix);
        }
    }
    update(deltaTime, animations) {
        const transforms = animations.map((animation) => {
            return this.transform(animation);
        });
        const weights = animations.map(({ weight }) => weight);
        const transform = this.blendTransforms(transforms, weights);
        const { translation, rotation, scale } = transform;
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.construct(translation, rotation, scale, this.localMatrix);
        if (this.parentBone) {
            const { poseMatrix } = this.parentBone;
            _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4.multiply(this.localMatrix, poseMatrix, this.poseMatrix);
        }
        else {
            this.poseMatrix.copy(this.localMatrix);
        }
        this.poseMatrix.multiply(this.inverseBindMatrix);
        this.childBones.forEach((bone) => bone.update(deltaTime, animations));
    }
    transform(animation) {
        const keyframes = animation.keyframes[this.name];
        if (!keyframes) {
            throw new Error(`Missing keyframes for bone: ${this.name}`);
        }
        const { time } = animation;
        const { translation, rotation, scale } = keyframes;
        return new _luz_core__WEBPACK_IMPORTED_MODULE_2__.Transform({
            translation: this.interpolateKeyframes(time, translation, _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.interpolate),
            rotation: this.interpolateKeyframes(time, rotation, _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.quat.interpolate),
            scale: this.interpolateKeyframes(time, scale, _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.interpolate)
        });
    }
    interpolateKeyframes(time, keyframes, interpolate) {
        for (let i = 0; i < keyframes.length - 1; i++) {
            const { time: t1, value: v1 } = keyframes[i];
            const { time: t2, value: v2 } = keyframes[i + 1];
            if (time >= t1 && time <= t2) {
                return interpolate(v1, v2, (time - t1) / (t2 - t1));
            }
        }
        return keyframes[keyframes.length - 1].value;
    }
    blendTransforms(transforms, weights) {
        if (transforms.length === 0) {
            return _luz_core__WEBPACK_IMPORTED_MODULE_2__.Transform.origin;
        }
        const totalWeight = weights.reduce((total, weight) => {
            return total + weight;
        }, 0);
        if (totalWeight === 0) {
            return _luz_core__WEBPACK_IMPORTED_MODULE_2__.Transform.origin;
        }
        weights = weights.map((weight) => weight / totalWeight);
        const translation = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero.copy();
        const scale = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero.copy();
        transforms.forEach((transform, index) => {
            const weight = weights[index];
            translation.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(transform.translation, weight));
            scale.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(transform.scale, weight));
        });
        const rotation = transforms[0].rotation.copy();
        transforms.forEach((transform, index) => {
            const weight = weights[index];
            _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.quat.interpolate(rotation, transform.rotation, weight, rotation);
        });
        return new _luz_core__WEBPACK_IMPORTED_MODULE_2__.Transform({ translation, rotation, scale });
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Bone.prototype, "name", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Bone.prototype, "parent", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Bone.prototype, "head", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Bone.prototype, "tail", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat4)
], Bone.prototype, "bindMatrix", void 0);


/***/ }),

/***/ "./modules/graphics/renderer/keyframe.ts":
/*!***********************************************!*\
  !*** ./modules/graphics/renderer/keyframe.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Keyframe: () => (/* binding */ Keyframe),
/* harmony export */   RotationKeyframe: () => (/* binding */ RotationKeyframe),
/* harmony export */   ScaleKeyframe: () => (/* binding */ ScaleKeyframe),
/* harmony export */   TranslationKeyframe: () => (/* binding */ TranslationKeyframe)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


class Keyframe extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    time;
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Keyframe.prototype, "time", void 0);
class ScaleKeyframe extends Keyframe {
    value = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.one.copy();
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], ScaleKeyframe.prototype, "value", void 0);
class RotationKeyframe extends Keyframe {
    value = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.quat.identity.copy();
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.quat)
], RotationKeyframe.prototype, "value", void 0);
class TranslationKeyframe extends Keyframe {
    value = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero.copy();
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], TranslationKeyframe.prototype, "value", void 0);


/***/ }),

/***/ "./modules/graphics/renderer/material.ts":
/*!***********************************************!*\
  !*** ./modules/graphics/renderer/material.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Material: () => (/* binding */ Material)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/utilities/serializable */ "./modules/utilities/serializable.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



class Material extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    color = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.one.copy();
    surface;
    texture;
    constructor({ color, texture } = {}) {
        super();
        if (color) {
            this.color.set(color);
        }
        if (texture) {
            this.texture = texture;
        }
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    (0,_luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_1__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3)
], Material.prototype, "color", void 0);
__decorate([
    (0,_luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_1__.Serialize)(),
    __metadata("design:type", Object)
], Material.prototype, "surface", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Uniform)(),
    __metadata("design:type", Object)
], Material.prototype, "texture", void 0);


/***/ }),

/***/ "./modules/graphics/renderer/partition.ts":
/*!************************************************!*\
  !*** ./modules/graphics/renderer/partition.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Partition: () => (/* binding */ Partition)
/* harmony export */ });
/* harmony import */ var _luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities/serializable */ "./modules/utilities/serializable.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

class Partition extends _luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    topology = 'Triangles';
    vertices = [];
    indices = [];
    weights = [];
    material;
    mesh;
    constructor(data = {}) {
        super();
        Object.assign(this, data);
    }
}
__decorate([
    (0,_luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Partition.prototype, "topology", void 0);
__decorate([
    (0,_luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Array)
], Partition.prototype, "vertices", void 0);
__decorate([
    (0,_luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Array)
], Partition.prototype, "indices", void 0);
__decorate([
    (0,_luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Array)
], Partition.prototype, "weights", void 0);
__decorate([
    (0,_luz_utilities_serializable__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Partition.prototype, "material", void 0);


/***/ }),

/***/ "./modules/graphics/renderer/pass.ts":
/*!*******************************************!*\
  !*** ./modules/graphics/renderer/pass.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderPass: () => (/* binding */ RenderPass)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./state */ "./modules/graphics/renderer/state.ts");
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



class RenderPass extends _luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serializable {
    clearColor = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec4.zero.copy();
    clearDepth = 1.0;
    cullMode = 'Back';
    blendMode = 'None';
    depthTest = 'LessEqual';
    depthMask = true;
    colorMask = [true, true, true, true];
    vertexShader;
    fragmentShader;
    program = null;
    constructor(data) {
        super();
        Object.assign(this, data);
        this.clearColor.set(this.clearColor);
    }
    static async deserialize(data) {
        return (await super.deserialize(data));
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec4)
], RenderPass.prototype, "clearColor", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", Number)
], RenderPass.prototype, "clearDepth", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", String)
], RenderPass.prototype, "cullMode", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", String)
], RenderPass.prototype, "blendMode", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", String)
], RenderPass.prototype, "depthTest", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", Boolean)
], RenderPass.prototype, "depthMask", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", Array)
], RenderPass.prototype, "colorMask", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", String)
], RenderPass.prototype, "vertexShader", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", String)
], RenderPass.prototype, "fragmentShader", void 0);


/***/ }),

/***/ "./modules/graphics/renderer/renderer.ts":
/*!***********************************************!*\
  !*** ./modules/graphics/renderer/renderer.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Renderer: () => (/* binding */ Renderer)
/* harmony export */ });
/* harmony import */ var _luz_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/core */ "./modules/core/index.ts");
/* harmony import */ var _managers_meshes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../managers/meshes */ "./modules/graphics/managers/meshes.ts");
/* harmony import */ var _managers_buffers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../managers/buffers */ "./modules/graphics/managers/buffers.ts");
/* harmony import */ var _managers_programs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../managers/programs */ "./modules/graphics/managers/programs.ts");
/* harmony import */ var _managers_samplers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../managers/samplers */ "./modules/graphics/managers/samplers.ts");
/* harmony import */ var _managers_shaders__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../managers/shaders */ "./modules/graphics/managers/shaders.ts");
/* harmony import */ var _managers_textures__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../managers/textures */ "./modules/graphics/managers/textures.ts");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./state */ "./modules/graphics/renderer/state.ts");
/* harmony import */ var _material__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./material */ "./modules/graphics/renderer/material.ts");
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");










class Renderer {
    gl;
    state;
    shaders;
    programs;
    meshes;
    buffers;
    textures;
    samplers;
    defaultTexture;
    defaultMaterial;
    constructor(gl) {
        this.gl = gl;
        this.state = new _state__WEBPACK_IMPORTED_MODULE_7__.State(this.gl);
        this.meshes = new _managers_meshes__WEBPACK_IMPORTED_MODULE_1__.Meshes(this.gl);
        this.buffers = new _managers_buffers__WEBPACK_IMPORTED_MODULE_2__.Buffers(this.gl);
        this.shaders = new _managers_shaders__WEBPACK_IMPORTED_MODULE_5__.Shaders(this.gl);
        this.programs = new _managers_programs__WEBPACK_IMPORTED_MODULE_3__.Programs(this.gl);
        this.textures = new _managers_textures__WEBPACK_IMPORTED_MODULE_6__.Textures(this.gl);
        this.samplers = new _managers_samplers__WEBPACK_IMPORTED_MODULE_4__.Samplers(this.gl);
        const textureData = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
        this.defaultTexture = this.textures.create({ data: textureData });
        this.defaultMaterial = new _material__WEBPACK_IMPORTED_MODULE_8__.Material({ texture: this.defaultTexture });
    }
    use(target) {
        const { width, height, frameBuffer } = target;
        if (frameBuffer) {
            this.buffers.bind(frameBuffer);
        }
        else {
            this.buffers.unbind('FrameBuffer');
        }
        this.gl.viewport(0, 0, width, height);
    }
    mask({ color, depth }) {
        if (color != null) {
            this.gl.colorMask(color[0], color[1], color[2], color[3]);
        }
        if (depth != null) {
            this.gl.depthMask(depth);
        }
    }
    clear({ color, depth, stencil }) {
        let clearMask = 0;
        if (color != null) {
            const { x, y, z, w } = color;
            this.gl.clearColor(x, y, z, w);
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
    renderPass(pass, camera, entities, light, uniforms) {
        // cull mode
        this.state.cullMode = pass.cullMode;
        // blend mode
        this.state.blendMode = pass.blendMode;
        // depth test
        this.state.depthTest = pass.depthTest;
        // depth mask
        this.mask({ color: pass.colorMask, depth: pass.depthMask });
        // clear buffers
        this.clear({ color: pass.clearColor, depth: pass.clearDepth });
        const { program } = pass;
        if (!program) {
            throw new Error('Render pass has no program');
        }
        // render entities
        Object.values(entities).forEach((entity) => {
            Object.values(entity.components).forEach((component) => {
                if (component.type !== 'Model') {
                    return;
                }
                this.renderModel(camera, entity, component, light, program, uniforms);
            });
        });
    }
    renderModel(camera, transform, model, light, program, additionalUniforms) {
        const uniforms = {};
        const setUniformValue = (value, key, prefix) => {
            const name = prefix ? `${prefix}.${key}` : key;
            if (program.uniforms.hasOwnProperty(name)) {
                uniforms[name] = value;
            }
        };
        if (camera) {
            (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_9__.getUniformProperties)(_luz_core__WEBPACK_IMPORTED_MODULE_0__.Camera).forEach(({ key }) => {
                setUniformValue(camera[key], key, 'camera');
            });
        }
        if (transform) {
            (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_9__.getUniformProperties)(_luz_core__WEBPACK_IMPORTED_MODULE_0__.Transform).forEach(({ key }) => {
                setUniformValue(transform[key], key, 'transform');
            });
        }
        if (model) {
            (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_9__.getUniformProperties)(_luz_core__WEBPACK_IMPORTED_MODULE_0__.Model).forEach(({ key }) => {
                setUniformValue(model[key], key, 'model');
            });
        }
        if (model.boneMatrices) {
            // nested structures cannot contain arrays,
            // so we need to place bone matrices outside
            setUniformValue(model.boneMatrices, 'boneMatrices');
        }
        if (light) {
            (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_9__.getUniformProperties)(_luz_core__WEBPACK_IMPORTED_MODULE_0__.Light).forEach(({ key }) => {
                setUniformValue(light[key], key, 'light');
            });
        }
        this.programs.update(program, { uniforms });
        if (additionalUniforms) {
            // additional uniforms
            this.programs.update(program, {
                // this can get quite slow, only use sparingly!
                uniforms: this.collectUniformValues(program, additionalUniforms)
            });
        }
        Object.entries(model.partitions).forEach(([name, partition]) => {
            const { mesh } = partition;
            if (!mesh) {
                throw new Error('Partition has no mesh');
            }
            const { material } = mesh;
            if (!material) {
                throw new Error('Mesh has no material');
            }
            if (!material.texture) {
                throw new Error(name);
            }
            this.programs.update(program, {
                uniforms: (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_9__.getUniformProperties)(_material__WEBPACK_IMPORTED_MODULE_8__.Material).reduce((properties, { key }) => {
                    const name = `material.${key}`;
                    if (program.uniforms.hasOwnProperty(name)) {
                        properties[name] = material[key];
                    }
                    return properties;
                }, {})
            });
            this.meshes.render(mesh);
        });
    }
    collectUniformValues(program, uniformValues) {
        const collectedUniformValues = {};
        const collectRecursively = (values, prefix) => {
            if (values == null || typeof values !== 'object') {
                return;
            }
            Object.entries(values).forEach(([name, value]) => {
                const uniformName = prefix ? `${prefix}.${name}` : name;
                if (program.uniforms.hasOwnProperty(uniformName)) {
                    collectedUniformValues[uniformName] = value;
                }
                else if (Array.isArray(value)) {
                    value.forEach((element, index) => {
                        const arrayIndex = `${uniformName}[${index}]`;
                        if (program.uniforms.hasOwnProperty(arrayIndex)) {
                            collectedUniformValues[arrayIndex] = element;
                        }
                        else {
                            collectRecursively(element, arrayIndex);
                        }
                    });
                }
                else {
                    collectRecursively(value, uniformName);
                }
            });
        };
        collectRecursively(uniformValues);
        return collectedUniformValues;
    }
}


/***/ }),

/***/ "./modules/graphics/renderer/state.ts":
/*!********************************************!*\
  !*** ./modules/graphics/renderer/state.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   State: () => (/* binding */ State)
/* harmony export */ });
class State {
    gl;
    activeCullMode = 'None';
    activeBlendMode = 'None';
    activeDepthTest = 'None';
    constructor(gl) {
        this.gl = gl;
    }
    set cullMode(cullMode) {
        if (cullMode === this.activeCullMode) {
            return;
        }
        if (cullMode === 'None') {
            this.gl.disable(this.gl.CULL_FACE);
        }
        else {
            this.gl.enable(this.gl.CULL_FACE);
            switch (cullMode) {
                case 'Front':
                    this.gl.cullFace(this.gl.FRONT);
                    break;
                case 'Back':
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
        if (blendMode === 'None') {
            this.gl.disable(this.gl.BLEND);
        }
        else {
            this.gl.enable(this.gl.BLEND);
            switch (blendMode) {
                case 'Additive':
                    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
                    break;
                case 'Transparent':
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
        if (depthTest === 'None') {
            this.gl.disable(this.gl.DEPTH_TEST);
        }
        else {
            this.gl.enable(this.gl.DEPTH_TEST);
            switch (depthTest) {
                case 'Never':
                    this.gl.depthFunc(this.gl.NEVER);
                    break;
                case 'Always':
                    this.gl.depthFunc(this.gl.ALWAYS);
                    break;
                case 'Equal':
                    this.gl.depthFunc(this.gl.EQUAL);
                    break;
                case 'NotEqual':
                    this.gl.depthFunc(this.gl.NOTEQUAL);
                    break;
                case 'Less':
                    this.gl.depthFunc(this.gl.LESS);
                    break;
                case 'LessEqual':
                    this.gl.depthFunc(this.gl.LEQUAL);
                    break;
                case 'Greater':
                    this.gl.depthFunc(this.gl.GREATER);
                    break;
                case 'GreaterEqual':
                    this.gl.depthFunc(this.gl.GEQUAL);
                    break;
            }
        }
        this.activeDepthTest = depthTest;
    }
}


/***/ }),

/***/ "./modules/graphics/renderer/surface.ts":
/*!**********************************************!*\
  !*** ./modules/graphics/renderer/surface.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Surface: () => (/* binding */ Surface)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

class Surface extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    path;
    data;
    width = 1;
    height = 1;
    format = 'Color';
    precision = 8;
    tiling = 'None';
    filtering = 'None';
    useMipmaps = false;
    constructor(data = {}) {
        super();
        Object.assign(this, data);
    }
    static async deserialize(data) {
        const surface = (await super.deserialize(data));
        if ('data' in surface) {
            const { data, precision = 8 } = surface;
            switch (precision) {
                case 8:
                    surface.data = new Uint8Array(data);
                    break;
                case 32:
                    surface.data = new Float32Array(data);
                    break;
            }
        }
        return surface;
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Surface.prototype, "path", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Object)
], Surface.prototype, "data", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Surface.prototype, "width", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Surface.prototype, "height", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Surface.prototype, "format", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Surface.prototype, "precision", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Surface.prototype, "tiling", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Surface.prototype, "filtering", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Boolean)
], Surface.prototype, "useMipmaps", void 0);


/***/ }),

/***/ "./modules/graphics/renderer/target.ts":
/*!*********************************************!*\
  !*** ./modules/graphics/renderer/target.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderTarget: () => (/* binding */ RenderTarget)
/* harmony export */ });
class RenderTarget {
    width;
    height;
    frameBuffer;
    constructor({ width, height, frameBuffer }) {
        this.width = width;
        this.height = height;
        this.frameBuffer = frameBuffer;
    }
}


/***/ }),

/***/ "./modules/graphics/renderer/weight.ts":
/*!*********************************************!*\
  !*** ./modules/graphics/renderer/weight.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Weight: () => (/* binding */ Weight)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

class Weight extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
    vertex;
    indices;
    weights;
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Weight.prototype, "vertex", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Array)
], Weight.prototype, "indices", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Array)
], Weight.prototype, "weights", void 0);


/***/ }),

/***/ "./modules/index.ts":
/*!**************************!*\
  !*** ./modules/index.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Animation),
/* harmony export */   Armature: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Armature),
/* harmony export */   Biped: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Biped),
/* harmony export */   Body: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Body),
/* harmony export */   Bone: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Bone),
/* harmony export */   Buffers: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Buffers),
/* harmony export */   Camera: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Camera),
/* harmony export */   Collider: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Collider),
/* harmony export */   CollisionDispatcher: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.CollisionDispatcher),
/* harmony export */   Component: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Component),
/* harmony export */   Cuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Cuboid),
/* harmony export */   Dispatcher: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.Dispatcher),
/* harmony export */   Entity: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Entity),
/* harmony export */   Epsilon: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.Epsilon),
/* harmony export */   Keyframe: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Keyframe),
/* harmony export */   Light: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Light),
/* harmony export */   Material: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Material),
/* harmony export */   Meshes: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Meshes),
/* harmony export */   Model: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Model),
/* harmony export */   Partition: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Partition),
/* harmony export */   Plane: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Plane),
/* harmony export */   Polygon: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Polygon),
/* harmony export */   Pool: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.Pool),
/* harmony export */   Programs: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Programs),
/* harmony export */   Ray: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Ray),
/* harmony export */   Register: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.Register),
/* harmony export */   RenderPass: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.RenderPass),
/* harmony export */   RenderTarget: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.RenderTarget),
/* harmony export */   Renderer: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Renderer),
/* harmony export */   RotationKeyframe: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.RotationKeyframe),
/* harmony export */   Samplers: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Samplers),
/* harmony export */   ScaleKeyframe: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.ScaleKeyframe),
/* harmony export */   Scene: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Scene),
/* harmony export */   Serializable: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.Serializable),
/* harmony export */   Serialize: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.Serialize),
/* harmony export */   Shaders: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Shaders),
/* harmony export */   Sphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Sphere),
/* harmony export */   State: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.State),
/* harmony export */   Surface: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Surface),
/* harmony export */   Textures: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Textures),
/* harmony export */   Transform: () => (/* reexport safe */ _core__WEBPACK_IMPORTED_MODULE_0__.Transform),
/* harmony export */   TranslationKeyframe: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.TranslationKeyframe),
/* harmony export */   Uniform: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.Uniform),
/* harmony export */   Volume: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Volume),
/* harmony export */   Weight: () => (/* reexport safe */ _graphics__WEBPACK_IMPORTED_MODULE_1__.Weight),
/* harmony export */   collideCuboidWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideCuboidWithCuboid),
/* harmony export */   collidePlaneWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePlaneWithCuboid),
/* harmony export */   collidePlaneWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePlaneWithSphere),
/* harmony export */   collidePolygonWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePolygonWithCuboid),
/* harmony export */   collidePolygonWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePolygonWithSphere),
/* harmony export */   collideRayWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithCuboid),
/* harmony export */   collideRayWithPlane: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithPlane),
/* harmony export */   collideRayWithRay: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithRay),
/* harmony export */   collideRayWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithSphere),
/* harmony export */   collideSphereWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideSphereWithCuboid),
/* harmony export */   collideSphereWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideSphereWithSphere),
/* harmony export */   getRegisteredClass: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.getRegisteredClass),
/* harmony export */   getUniformProperties: () => (/* reexport safe */ _utilities__WEBPACK_IMPORTED_MODULE_4__.getUniformProperties),
/* harmony export */   mat2: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.mat2),
/* harmony export */   mat3: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.mat3),
/* harmony export */   mat4: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.mat4),
/* harmony export */   quat: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.quat),
/* harmony export */   vec2: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.vec2),
/* harmony export */   vec3: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.vec3),
/* harmony export */   vec4: () => (/* reexport safe */ _vectors__WEBPACK_IMPORTED_MODULE_3__.vec4)
/* harmony export */ });
/* harmony import */ var _core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./core */ "./modules/core/index.ts");
/* harmony import */ var _graphics__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./graphics */ "./modules/graphics/index.ts");
/* harmony import */ var _physics__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./physics */ "./modules/physics/index.ts");
/* harmony import */ var _vectors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utilities */ "./modules/utilities/index.ts");







/***/ }),

/***/ "./modules/physics/collider.ts":
/*!*************************************!*\
  !*** ./modules/physics/collider.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Collider: () => (/* binding */ Collider)
/* harmony export */ });
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utilities */ "./modules/utilities/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

class Collider extends _utilities__WEBPACK_IMPORTED_MODULE_0__.Serializable {
}
__decorate([
    (0,_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", String)
], Collider.prototype, "type", void 0);


/***/ }),

/***/ "./modules/physics/colliders/plane.ts":
/*!********************************************!*\
  !*** ./modules/physics/colliders/plane.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Plane: () => (/* binding */ Plane)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../collider */ "./modules/physics/collider.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



let Plane = class Plane extends _collider__WEBPACK_IMPORTED_MODULE_2__.Collider {
    type = 'Plane';
    normal = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.up;
    distance = 0;
    constructor({ normal = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.up, distance = 0 } = {}) {
        super();
        this.normal = normal.copy();
        this.distance = distance;
    }
    signedDistance(point) {
        return _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.dot(point, this.normal) - this.distance;
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Plane.prototype, "normal", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Plane.prototype, "distance", void 0);
Plane = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Register)(),
    __metadata("design:paramtypes", [Object])
], Plane);



/***/ }),

/***/ "./modules/physics/colliders/polygon.ts":
/*!**********************************************!*\
  !*** ./modules/physics/colliders/polygon.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Polygon: () => (/* binding */ Polygon)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../collider */ "./modules/physics/collider.ts");
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



let Polygon = class Polygon extends _collider__WEBPACK_IMPORTED_MODULE_1__.Collider {
    type = 'Polygon';
    vertices = [];
    edges;
    normal;
    constructor({ vertices = [] } = {}) {
        super();
        this.vertices = vertices.map((vertex) => vertex.copy());
        if (this.vertices.length < 3) {
            return;
        }
        this.edges = [
            _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(this.vertices[1], this.vertices[0]),
            _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(this.vertices[2], this.vertices[1]),
            _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(this.vertices[0], this.vertices[2])
        ];
        const edge1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(vertices[1], vertices[0]);
        const edge2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(vertices[2], vertices[0]);
        this.normal = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(edge1, edge2).normalize();
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Serialize)(),
    __metadata("design:type", Array)
], Polygon.prototype, "vertices", void 0);
Polygon = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_2__.Register)(),
    __metadata("design:paramtypes", [Object])
], Polygon);



/***/ }),

/***/ "./modules/physics/colliders/ray.ts":
/*!******************************************!*\
  !*** ./modules/physics/colliders/ray.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ray: () => (/* binding */ Ray)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../collider */ "./modules/physics/collider.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



let Ray = class Ray extends _collider__WEBPACK_IMPORTED_MODULE_2__.Collider {
    type = 'Ray';
    origin = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero;
    direction = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.up;
    constructor({ origin = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero, direction = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.up } = {}) {
        super();
        this.origin = origin.copy();
        this.direction = direction.copy().normalize();
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Ray.prototype, "origin", void 0);
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Ray.prototype, "direction", void 0);
Ray = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Register)(),
    __metadata("design:paramtypes", [Object])
], Ray);



/***/ }),

/***/ "./modules/physics/collisions/cuboid/cuboid.ts":
/*!*****************************************************!*\
  !*** ./modules/physics/collisions/cuboid/cuboid.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideCuboidWithCuboid: () => (/* binding */ collideCuboidWithCuboid)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

// ---------------------------------------------
// Small helpers
// ---------------------------------------------
const tmp = () => new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3();
const projectExtent = (axis, axes, extents) => {
    return (Math.abs(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(axis, axes[0])) * extents.x +
        Math.abs(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(axis, axes[1])) * extents.y +
        Math.abs(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(axis, axes[2])) * extents.z);
};
const chooseFaceTangentIndices = (main) => {
    switch (main) {
        case 0: return [1, 2];
        case 1: return [0, 2];
        default: return [0, 1];
    }
};
const getFaceCenterAndBasis = (center, axes, extents, faceAxisIndex, faceSign) => {
    const normal = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(axes[faceAxisIndex], faceSign, tmp());
    const faceCenter = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(center, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(axes[faceAxisIndex], extents[faceAxisIndex] * faceSign, tmp()), tmp());
    const [i1, i2] = chooseFaceTangentIndices(faceAxisIndex);
    const t1 = axes[i1];
    const t2 = axes[i2];
    const e1 = extents[i1];
    const e2 = extents[i2];
    return { faceCenter, normal, t1, t2, e1, e2, i1, i2 };
};
const getFaceVertices = (faceCenter, t1, t2, e1, e2) => {
    const v0 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(faceCenter, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t1, -e1, tmp()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t2, -e2, tmp()), tmp()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const v1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(faceCenter, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t1, +e1, tmp()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t2, -e2, tmp()), tmp()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const v2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(faceCenter, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t1, +e1, tmp()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t2, +e2, tmp()), tmp()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const v3 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(faceCenter, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t1, -e1, tmp()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t2, +e2, tmp()), tmp()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    return [v0, v1, v2, v3];
};
const clipPolygonAgainstPlane = (poly, planeNormal, planeDist) => {
    const result = [];
    if (poly.length === 0)
        return result;
    const dot = (p) => _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(planeNormal, p);
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const da = dot(a) - planeDist;
        const db = dot(b) - planeDist;
        const aInside = da <= _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.Epsilon;
        const bInside = db <= _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.Epsilon;
        if (aInside && bInside) {
            result.push(b.copy());
        }
        else if (aInside && !bInside) {
            const t = da / (da - db);
            const ab = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(b, a, tmp());
            result.push(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(a, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ab, t, tmp()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()));
        }
        else if (!aInside && bInside) {
            const t = da / (da - db);
            const ab = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(b, a, tmp());
            result.push(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(a, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ab, t, tmp()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()));
            result.push(b.copy());
        }
    }
    return result;
};
// Closest midpoint between two *segments*
const closestPointBetweenSegmentsMidpoint = (p0, u, uLen, q0, v, vLen) => {
    const w0 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p0, q0, tmp());
    const a = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(u, u);
    const b = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(u, v);
    const c = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(v, v);
    const d = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(u, w0);
    const e = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(v, w0);
    const denom = a * c - b * b;
    let s = 0, t = 0;
    if (Math.abs(denom) > _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
        s = (b * e - c * d) / denom;
        t = (a * e - b * d) / denom;
    }
    s = Math.max(-uLen, Math.min(s, +uLen));
    t = Math.max(-vLen, Math.min(t, +vLen));
    const p = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(p0, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(u, s, tmp()), tmp());
    const q = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(q0, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(v, t, tmp()), tmp());
    return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(p, q, tmp()), 0.5, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
};
const typeBias = (type) => (type === 'EdgeEdge' ? 1e-6 : 0);
const signNonZero = (x, fallback) => (x > 0 ? 1 : x < 0 ? -1 : fallback);
// --- NEW: compute the penetration of a point against a box face plane along `normal`
const pointPenetrationAgainstBoxPlane = (point, normal, axes, extents, center) => {
    // Pick the face on this box whose normal is *most aligned* with `normal`
    let faceIdx = 0;
    let maxDot = -Infinity;
    for (let i = 0; i < 3; i++) {
        const d = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(axes[i], normal); // since `normal` points A->B, this picks the A-face pointing toward B (or B-face toward A)
        if (d > maxDot) {
            maxDot = d;
            faceIdx = i;
        }
    }
    const faceSign = maxDot >= 0 ? +1 : -1;
    const { faceCenter } = getFaceCenterAndBasis(center, axes, extents, faceIdx, faceSign);
    const refPlaneD = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(normal, faceCenter);
    const pen = refPlaneD - _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(normal, point);
    return pen;
};
// ---------------------------------------------
// Main routine
// ---------------------------------------------
const collideCuboidWithCuboid = (a, b) => {
    const axesA = [a.axes[0].copy().normalize(), a.axes[1].copy().normalize(), a.axes[2].copy().normalize()];
    const axesB = [b.axes[0].copy().normalize(), b.axes[1].copy().normalize(), b.axes[2].copy().normalize()];
    const extA = a.extents;
    const extB = b.extents;
    const cA = a.center;
    const cB = b.center;
    const t = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(cB, cA, tmp());
    let bestAxis = new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3();
    let bestDepth = Infinity;
    let bestType = null;
    let bestIndexA = -1;
    let bestIndexB = -1;
    const evaluateAxis = (axis, type, i, j) => {
        const len = axis.length;
        if (len < _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.Epsilon)
            return true;
        const n = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(axis, 1 / len, tmp());
        const rA = projectExtent(n, axesA, extA);
        const rB = projectExtent(n, axesB, extB);
        const dist = Math.abs(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(t, n));
        const overlap = rA + rB - dist;
        if (overlap < -_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.Epsilon)
            return false;
        if (overlap - typeBias(type) < bestDepth - typeBias(bestType)) {
            bestDepth = overlap;
            bestAxis = n.copy(bestAxis);
            bestType = type;
            bestIndexA = i;
            bestIndexB = j;
        }
        return true;
    };
    for (let i = 0; i < 3; i++) {
        if (!evaluateAxis(axesA[i], 'FaceA', i, -1))
            return null;
        if (!evaluateAxis(axesB[i], 'FaceB', -1, i))
            return null;
    }
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const axis = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(axesA[i], axesB[j], tmp());
            if (!evaluateAxis(axis, 'EdgeEdge', i, j))
                return null;
        }
    }
    if (!bestType || !isFinite(bestDepth))
        return null;
    const normal = bestAxis.copy();
    if (_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(t, normal) < 0)
        normal.scale(-1);
    const collisions = [];
    if (bestType === 'FaceA' || bestType === 'FaceB') {
        const refIsA = bestType === 'FaceA';
        const refAxes = refIsA ? axesA : axesB;
        const refExt = refIsA ? extA : extB;
        const refCenter = refIsA ? cA : cB;
        const k = refIsA ? bestIndexA : bestIndexB;
        const faceDirSign = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(refAxes[k], normal) >= 0 ? +1 : -1;
        const { faceCenter: refFaceCenter, t1, t2, e1, e2 } = getFaceCenterAndBasis(refCenter, refAxes, refExt, k, faceDirSign);
        const incAxes = refIsA ? axesB : axesA;
        const incExt = refIsA ? extB : extA;
        const incCenter = refIsA ? cB : cA;
        let incFaceIndex = 0, minDot = Infinity;
        for (let i = 0; i < 3; i++) {
            const d = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(incAxes[i], normal);
            if (d < minDot) {
                minDot = d;
                incFaceIndex = i;
            }
        }
        const incFaceSign = minDot > 0 ? -1 : +1;
        const { faceCenter: incFaceCenter, t1: it1, t2: it2, e1: ie1, e2: ie2 } = getFaceCenterAndBasis(incCenter, incAxes, incExt, incFaceIndex, incFaceSign);
        let poly = getFaceVertices(incFaceCenter, it1, it2, ie1, ie2);
        const planeN1 = t1;
        const planeN2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t1, -1, tmp());
        const planeN3 = t2;
        const planeN4 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(t2, -1, tmp());
        const d1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(planeN1, refFaceCenter) + e1;
        const d2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(planeN2, refFaceCenter) + e1;
        const d3 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(planeN3, refFaceCenter) + e2;
        const d4 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(planeN4, refFaceCenter) + e2;
        poly = clipPolygonAgainstPlane(poly, planeN1, d1);
        poly = clipPolygonAgainstPlane(poly, planeN2, d2);
        poly = clipPolygonAgainstPlane(poly, planeN3, d3);
        poly = clipPolygonAgainstPlane(poly, planeN4, d4);
        if (poly.length === 0)
            return null;
        const refPlaneD = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(normal, refFaceCenter);
        for (const p of poly) {
            const penetration = refPlaneD - _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(normal, p);
            if (penetration >= -_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.Epsilon) {
                const depth = Math.max(0, penetration);
                collisions.push({ contact: p.copy(), normal: normal.copy(), distance: depth });
            }
        }
        if (collisions.length === 0) {
            const centroid = poly.reduce((acc, v) => _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(acc, v, acc), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()).scale(1 / poly.length);
            const pen = refPlaneD - _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(normal, centroid);
            _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(centroid, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(normal, Math.max(0, pen), tmp()), centroid);
            collisions.push({ contact: centroid, normal: normal.copy(), distance: Math.max(0, pen) });
        }
        if (collisions.length > 4)
            collisions.length = 4;
    }
    else {
        // --------- FIXED EDGE–EDGE CASE ----------
        const i = bestIndexA;
        const j = bestIndexB;
        const otherA = chooseFaceTangentIndices(i);
        const otherB = chooseFaceTangentIndices(j);
        const signA1 = signNonZero(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(t, axesA[otherA[0]]), 1);
        const signA2 = signNonZero(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(t, axesA[otherA[1]]), 1);
        const signB1 = -signNonZero(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(t, axesB[otherB[0]]), 1);
        const signB2 = -signNonZero(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(t, axesB[otherB[1]]), 1);
        const baseA = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(cA, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(axesA[otherA[0]], extA[otherA[0]] * signA1, tmp()), tmp()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(axesA[otherA[1]], extA[otherA[1]] * signA2, tmp()), tmp());
        const baseB = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(cB, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(axesB[otherB[0]], extB[otherB[0]] * signB1, tmp()), tmp()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(axesB[otherB[1]], extB[otherB[1]] * signB2, tmp()), tmp());
        const u = axesA[i].copy(); // unit
        const v = axesB[j].copy(); // unit
        const p0 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(baseA, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(u, -extA[i], tmp()), tmp());
        const q0 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(baseB, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(v, -extB[j], tmp()), tmp());
        const contact = closestPointBetweenSegmentsMidpoint(p0, u, extA[i], q0, v, extB[j]);
        // Compute penetration against both boxes' reference planes along `normal`,
        // and take the smaller non-negative penetration.
        const penA = pointPenetrationAgainstBoxPlane(contact, normal, axesA, extA, cA);
        const penB = pointPenetrationAgainstBoxPlane(contact, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(normal, -1, tmp()), axesB, extB, cB);
        // `penB` used a flipped normal to pick B's face toward A, but we report distance along `normal`.
        const depth = Math.max(0, Math.min(penA, penB));
        collisions.push({ contact, normal: normal.copy(), distance: depth });
    }
    return collisions.length > 0 ? collisions : null;
};


/***/ }),

/***/ "./modules/physics/collisions/plane/cuboid.ts":
/*!****************************************************!*\
  !*** ./modules/physics/collisions/plane/cuboid.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collidePlaneWithCuboid: () => (/* binding */ collidePlaneWithCuboid)
/* harmony export */ });
const collidePlaneWithCuboid = (plane, cuboid) => {
    const collisions = [];
    cuboid.getVertices().forEach((vertex) => {
        const distanceToPlane = plane.signedDistance(vertex);
        // If the vertex is penetrating the plane, add it to the collision manifold
        if (distanceToPlane <= 0) {
            const normal = plane.normal.copy();
            const penetrationDepth = -distanceToPlane; // Negative because it's penetration
            collisions.push({
                contact: vertex.copy(),
                normal: normal,
                distance: penetrationDepth
            });
        }
    });
    return collisions.length > 0 ? collisions : null;
};


/***/ }),

/***/ "./modules/physics/collisions/plane/sphere.ts":
/*!****************************************************!*\
  !*** ./modules/physics/collisions/plane/sphere.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collidePlaneWithSphere: () => (/* binding */ collidePlaneWithSphere)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

function collidePlaneWithSphere(plane, sphere) {
    const { center: sphereCenter, radius } = sphere;
    const { normal, distance: planeDistance } = plane;
    const distanceFromSphereCenterToPlane = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(sphereCenter, normal) - planeDistance;
    if (Math.abs(distanceFromSphereCenterToPlane) <= radius) {
        const offset = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(normal, distanceFromSphereCenterToPlane, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const contactPoint = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(sphereCenter, offset, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const penetrationDepth = radius - Math.abs(distanceFromSphereCenterToPlane);
        return [
            {
                contact: contactPoint,
                normal: normal.copy(),
                distance: penetrationDepth
            }
        ];
    }
    return null;
}


/***/ }),

/***/ "./modules/physics/collisions/polygon/cuboid.ts":
/*!******************************************************!*\
  !*** ./modules/physics/collisions/polygon/cuboid.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collidePolygonWithCuboid: () => (/* binding */ collidePolygonWithCuboid)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const EPS = 1e-6;
const CONTACT_SLOP = 1e-3;
const buildPlaneBasis = (n) => {
    const up = Math.abs(n.z) < 0.999 ? new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3([0, 0, 1]) : new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3([0, 1, 0]);
    const t1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(up, n, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()).normalize();
    const t2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(n, t1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()).normalize();
    return { t1, t2 };
};
const projectTo2D = (p, p0, t1, t2) => {
    const d = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, p0, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    return { x: _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(d, t1), y: _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(d, t2) };
};
const pointInPolygon2D = (pt, poly) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y;
        const xj = poly[j].x, yj = poly[j].y;
        const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
            (pt.x < ((xj - xi) * (pt.y - yi)) / ((yj - yi) || EPS) + xi);
        if (intersect)
            inside = !inside;
    }
    return inside;
};
function collidePolygonWithCuboid(polygon, cuboid) {
    const collisions = [];
    const n = polygon.normal.copy().normalize();
    const p0 = polygon.vertices[0];
    const planeD = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(n, p0);
    const { t1, t2 } = buildPlaneBasis(n);
    const poly2D = polygon.vertices.map(v => projectTo2D(v, p0, t1, t2));
    const verts = cuboid.getVertices();
    // 1) Penetrating vertices -> project contact to plane, keep positive depth
    for (const v of verts) {
        const signed = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(n, v) - planeD; // <0 means v is "behind" plane w.r.t n
        const depth = Math.max(0, -signed);
        if (depth > CONTACT_SLOP) {
            const proj2D = projectTo2D(v, p0, t1, t2);
            if (pointInPolygon2D(proj2D, poly2D)) {
                // contact point is v projected onto the plane
                const contactOnPlane = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(v, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(n, -signed, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
                collisions.push({ contact: contactOnPlane, normal: n.copy(), distance: depth });
            }
        }
    }
    // 2) Edge–plane intersections (touching)
    const edges = cuboid.getEdges();
    for (const [i1, i2] of edges) {
        const v1 = verts[i1], v2 = verts[i2];
        const d1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(n, v1) - planeD;
        const d2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(n, v2) - planeD;
        if ((d1 > CONTACT_SLOP && d2 < -CONTACT_SLOP) || (d1 < -CONTACT_SLOP && d2 > CONTACT_SLOP) ||
            (Math.abs(d1) <= CONTACT_SLOP && Math.abs(d2) <= CONTACT_SLOP)) {
            const edge = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(v2, v1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
            const denom = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(n, edge);
            if (Math.abs(denom) > EPS) {
                const t = (planeD - _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(n, v1)) / denom;
                if (t >= -EPS && t <= 1 + EPS) {
                    const hit = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(v1, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(edge, t, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
                    const proj2D = projectTo2D(hit, p0, t1, t2);
                    if (pointInPolygon2D(proj2D, poly2D)) {
                        collisions.push({ contact: hit, normal: n.copy(), distance: 0 });
                    }
                }
            }
        }
    }
    return collisions.length > 0 ? collisions : null;
}


/***/ }),

/***/ "./modules/physics/collisions/polygon/sphere.ts":
/*!******************************************************!*\
  !*** ./modules/physics/collisions/polygon/sphere.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collidePolygonWithSphere: () => (/* binding */ collidePolygonWithSphere)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const { min, max, sqrt } = Math;
const findClosestPointOnEdge = (point, v1, v2) => {
    const e1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(v2, v1);
    const l2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e1, e1);
    if (l2 === 0) {
        return v1.copy();
    }
    const t = max(0, min(1, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(point, v1), e1) / l2));
    return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(v1, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(e1, t));
};
const findClosestPointOnPolygon = (point, polygon) => {
    const [v1, v2, v3] = polygon.vertices;
    const e1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(v2, v1);
    const e2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(v3, v1);
    const p = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(point, v1);
    const e1p = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e1, p);
    const e2p = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e2, p);
    const e1e1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e1, e1);
    const e1e2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e1, e2);
    const e2e2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e2, e2);
    const d = e1e1 * e2e2 - e1e2 * e1e2;
    const u = (e2e2 * e1p - e1e2 * e2p) / d;
    const v = (e1e1 * e2p - e1e2 * e1p) / d;
    if (u >= 0 && v >= 0 && u + v <= 1) {
        return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(v1, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(e1, u), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(e2, v)), 1));
    }
    const p1 = findClosestPointOnEdge(point, v1, v2);
    const p2 = findClosestPointOnEdge(point, v2, v3);
    const p3 = findClosestPointOnEdge(point, v3, v1);
    const d1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(point, p1), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(point, p1));
    const d2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(point, p2), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(point, p2));
    const d3 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(point, p3), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(point, p3));
    if (d1 < d2 && d1 < d3) {
        return p1;
    }
    if (d2 < d3) {
        return p2;
    }
    return p3;
};
const collidePolygonWithSphere = (polygon, sphere) => {
    const contact = findClosestPointOnPolygon(sphere.center, polygon);
    const direction = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(contact, sphere.center);
    const distanceSquared = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(direction, direction);
    if (distanceSquared <= sphere.radius * sphere.radius) {
        const distance = sqrt(distanceSquared);
        return [
            {
                contact,
                normal: polygon.normal.copy(),
                distance: sphere.radius - distance
            }
        ];
    }
    return null;
};


/***/ }),

/***/ "./modules/physics/collisions/ray/cuboid.ts":
/*!**************************************************!*\
  !*** ./modules/physics/collisions/ray/cuboid.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideRayWithCuboid: () => (/* binding */ collideRayWithCuboid)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const EPSILON = 1e-6;
const collideRayWithCuboid = (ray, cuboid) => {
    const axes = cuboid.axes;
    const extents = [cuboid.extents.x, cuboid.extents.y, cuboid.extents.z];
    const relativeOrigin = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(ray.origin, cuboid.center);
    let tMin = -Infinity;
    let tMax = Infinity;
    let entryAxis = -1;
    let exitAxis = -1;
    let entrySign = 1;
    let exitSign = 1;
    for (let i = 0; i < 3; i++) {
        const axis = axes[i];
        const extent = extents[i];
        const originProjection = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(relativeOrigin, axis);
        const directionProjection = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ray.direction, axis);
        if (Math.abs(directionProjection) < EPSILON) {
            if (originProjection < -extent || originProjection > extent) {
                return null;
            }
            continue;
        }
        const inverseDirection = 1 / directionProjection;
        let t1 = (-extent - originProjection) * inverseDirection;
        let t2 = (extent - originProjection) * inverseDirection;
        let faceEntrySign = -1;
        let faceExitSign = 1;
        if (t1 > t2) {
            ;
            [t1, t2] = [t2, t1];
            [faceEntrySign, faceExitSign] = [faceExitSign, faceEntrySign];
        }
        if (t1 > tMin) {
            tMin = t1;
            entryAxis = i;
            entrySign = faceEntrySign;
        }
        if (t2 < tMax) {
            tMax = t2;
            exitAxis = i;
            exitSign = faceExitSign;
        }
        if (tMin > tMax) {
            return null;
        }
    }
    if (tMax < 0) {
        return null;
    }
    const distance = tMin >= 0 ? tMin : tMax;
    if (distance < 0) {
        return null;
    }
    const axisIndex = tMin >= 0 ? entryAxis : exitAxis;
    const sign = tMin >= 0 ? entrySign : exitSign;
    if (axisIndex < 0) {
        return null;
    }
    const contactOffset = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ray.direction, distance, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const contact = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(ray.origin, contactOffset, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const normal = axes[axisIndex].copy().scale(-sign);
    return { contact, normal, distance };
};


/***/ }),

/***/ "./modules/physics/collisions/ray/plane.ts":
/*!*************************************************!*\
  !*** ./modules/physics/collisions/ray/plane.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideRayWithPlane: () => (/* binding */ collideRayWithPlane)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const collideRayWithPlane = (ray, plane) => {
    const { normal: n, distance: d } = plane;
    const { origin: o, direction: e } = ray;
    const s = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e, n);
    if (s === 0) {
        return null;
    }
    const t = (d - _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(o, n)) / s;
    if (t < 0) {
        return null;
    }
    const contactOffset = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(e, t, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const contact = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(o, contactOffset, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    return { contact, normal: n.copy(), distance: t };
};


/***/ }),

/***/ "./modules/physics/collisions/ray/ray.ts":
/*!***********************************************!*\
  !*** ./modules/physics/collisions/ray/ray.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideRayWithRay: () => (/* binding */ collideRayWithRay)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const collideRayWithRay = (ray1, ray2) => {
    const { direction: d1, origin: o1 } = ray1;
    const { direction: d2, origin: o2 } = ray2;
    const c = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(d1, d2);
    const determinant = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(c, c);
    if (determinant === 0) {
        return null;
    }
    const f = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(o2, o1);
    const u = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(c, f).scale(1 / determinant);
    const t = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.cross(f, d2), c) / determinant;
    if (t < 0 || t > 1) {
        return null;
    }
    const contact1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(o1, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(d1, t, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const contact2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(o2, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(d2, u.z, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const normal = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(contact1, contact2).normalize();
    const distance = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(contact1, o1), d1);
    return { contact: contact1, normal, distance };
};


/***/ }),

/***/ "./modules/physics/collisions/ray/sphere.ts":
/*!**************************************************!*\
  !*** ./modules/physics/collisions/ray/sphere.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideRayWithSphere: () => (/* binding */ collideRayWithSphere)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const { sqrt } = Math;
const collideRayWithSphere = (ray, sphere) => {
    const { origin: o, direction: e } = ray;
    const { center: c, radius: r } = sphere;
    const r2 = r * r;
    const s = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, o);
    const t = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(e, s);
    const d2 = s.squaredLength - t * t;
    if (d2 > r2) {
        return null;
    }
    const thc = sqrt(r2 - d2);
    const t0 = t - thc;
    const t1 = t + thc;
    if (t0 < 0 && t1 < 0) {
        return null;
    }
    const distance = t0 >= 0 ? t0 : t1;
    const contactOffset = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(e, distance, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const contact = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(o, contactOffset, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    let normal = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, contact, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    if (normal.length === 0) {
        normal = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.normalize(e, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    }
    else {
        normal.normalize();
    }
    return { contact, normal, distance };
};


/***/ }),

/***/ "./modules/physics/collisions/sphere/cuboid.ts":
/*!*****************************************************!*\
  !*** ./modules/physics/collisions/sphere/cuboid.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideSphereWithCuboid: () => (/* binding */ collideSphereWithCuboid)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const EPSILON = 1e-6;
function collideSphereWithCuboid(sphere, cuboid) {
    const extents = [cuboid.extents.x, cuboid.extents.y, cuboid.extents.z];
    const axes = cuboid.axes;
    const relative = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(sphere.center, cuboid.center);
    const local = [];
    const closestPoint = cuboid.center.copy();
    for (let i = 0; i < 3; i++) {
        const axis = axes[i];
        const projection = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(relative, axis);
        local[i] = projection;
        const extent = extents[i];
        const clampedProjection = Math.max(-extent, Math.min(projection, extent));
        const contribution = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(axis, clampedProjection, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(closestPoint, contribution, closestPoint);
    }
    const offset = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(sphere.center, closestPoint);
    const distanceSquared = offset.squaredLength;
    const radius = sphere.radius;
    if (distanceSquared > radius * radius) {
        return null;
    }
    if (distanceSquared > EPSILON * EPSILON) {
        const distance = Math.sqrt(distanceSquared);
        const normal = offset.scale(1 / distance);
        const penetrationDepth = radius - distance;
        return [
            {
                contact: closestPoint.copy(),
                normal: normal.copy(),
                distance: penetrationDepth
            }
        ];
    }
    let bestAxis = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < 3; i++) {
        const extent = extents[i];
        const projection = local[i];
        const distanceToFace = Math.max(0, extent - Math.abs(projection));
        if (distanceToFace < bestDistance) {
            bestDistance = distanceToFace;
            bestAxis = i;
        }
    }
    const axis = axes[bestAxis];
    const extent = extents[bestAxis];
    const projection = local[bestAxis];
    const sign = projection >= 0 ? 1 : -1;
    const distanceToFace = extent - Math.abs(projection);
    const surfaceOffset = sign * distanceToFace;
    const contact = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(sphere.center, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(axis, surfaceOffset, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    let penetrationDepth = radius - distanceToFace;
    if (penetrationDepth < -EPSILON) {
        return null;
    }
    if (penetrationDepth < 0) {
        penetrationDepth = 0;
    }
    const normal = axis.copy().scale(sign);
    return [
        {
            contact,
            normal: normal.copy(),
            distance: penetrationDepth
        }
    ];
}


/***/ }),

/***/ "./modules/physics/collisions/sphere/sphere.ts":
/*!*****************************************************!*\
  !*** ./modules/physics/collisions/sphere/sphere.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideSphereWithSphere: () => (/* binding */ collideSphereWithSphere)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const collideSphereWithSphere = (s1, s2) => {
    const { center: c1, radius: r1 } = s1;
    const { center: c2, radius: r2 } = s2;
    const delta = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c2, c1);
    const distanceSquared = delta.squaredLength;
    const radiiSum = r1 + r2;
    if (distanceSquared > radiiSum * radiiSum) {
        return null;
    }
    const distance = Math.sqrt(distanceSquared);
    const normal = distance > 0 ? _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(delta, 1 / distance, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()) : _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.right.copy();
    const contactOffset = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(normal, r1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const contact = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c1, contactOffset, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    return { contact, normal, distance: distance - radiiSum };
};


/***/ }),

/***/ "./modules/physics/dispatchers/collision.ts":
/*!**************************************************!*\
  !*** ./modules/physics/dispatchers/collision.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CollisionDispatcher: () => (/* binding */ CollisionDispatcher)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../collisions/cuboid/cuboid */ "./modules/physics/collisions/cuboid/cuboid.ts");
/* harmony import */ var _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../collisions/plane/cuboid */ "./modules/physics/collisions/plane/cuboid.ts");
/* harmony import */ var _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../collisions/plane/sphere */ "./modules/physics/collisions/plane/sphere.ts");
/* harmony import */ var _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../collisions/sphere/cuboid */ "./modules/physics/collisions/sphere/cuboid.ts");
/* harmony import */ var _collisions_polygon_sphere__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../collisions/polygon/sphere */ "./modules/physics/collisions/polygon/sphere.ts");
/* harmony import */ var _collisions_polygon_cuboid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../collisions/polygon/cuboid */ "./modules/physics/collisions/polygon/cuboid.ts");







class CollisionDispatcher extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Dispatcher {
    constructor() {
        super();
        // ray
        //this.register('Ray', 'Ray', collideRayWithRay)
        //this.register('Ray', 'Plane', collideRayWithPlane)
        //this.register('Ray', 'Sphere', collideRayWithSphere)
        //this.register('Ray', 'Cuboid', collideRayWithCuboid)
        // plane
        this.register('Plane', 'Sphere', _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_3__.collidePlaneWithSphere);
        this.register('Plane', 'Cuboid', _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_2__.collidePlaneWithCuboid);
        // polygon
        this.register('Polygon', 'Sphere', _collisions_polygon_sphere__WEBPACK_IMPORTED_MODULE_5__.collidePolygonWithSphere);
        this.register('Polygon', 'Cuboid', _collisions_polygon_cuboid__WEBPACK_IMPORTED_MODULE_6__.collidePolygonWithCuboid);
        // sphere
        //this.register('Sphere', 'Sphere', collideSphereWithSphere)
        this.register('Sphere', 'Cuboid', _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_4__.collideSphereWithCuboid);
        // cuboid
        this.register('Cuboid', 'Cuboid', _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_1__.collideCuboidWithCuboid);
    }
}


/***/ }),

/***/ "./modules/physics/index.ts":
/*!**********************************!*\
  !*** ./modules/physics/index.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Collider: () => (/* reexport safe */ _collider__WEBPACK_IMPORTED_MODULE_1__.Collider),
/* harmony export */   CollisionDispatcher: () => (/* reexport safe */ _dispatchers_collision__WEBPACK_IMPORTED_MODULE_7__.CollisionDispatcher),
/* harmony export */   Cuboid: () => (/* reexport safe */ _volumes_cuboid__WEBPACK_IMPORTED_MODULE_6__.Cuboid),
/* harmony export */   Plane: () => (/* reexport safe */ _colliders_plane__WEBPACK_IMPORTED_MODULE_3__.Plane),
/* harmony export */   Polygon: () => (/* reexport safe */ _colliders_polygon__WEBPACK_IMPORTED_MODULE_4__.Polygon),
/* harmony export */   Ray: () => (/* reexport safe */ _colliders_ray__WEBPACK_IMPORTED_MODULE_2__.Ray),
/* harmony export */   Sphere: () => (/* reexport safe */ _volumes_sphere__WEBPACK_IMPORTED_MODULE_5__.Sphere),
/* harmony export */   Volume: () => (/* reexport safe */ _volume__WEBPACK_IMPORTED_MODULE_0__.Volume),
/* harmony export */   collideCuboidWithCuboid: () => (/* reexport safe */ _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_18__.collideCuboidWithCuboid),
/* harmony export */   collidePlaneWithCuboid: () => (/* reexport safe */ _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_13__.collidePlaneWithCuboid),
/* harmony export */   collidePlaneWithSphere: () => (/* reexport safe */ _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_12__.collidePlaneWithSphere),
/* harmony export */   collidePolygonWithCuboid: () => (/* reexport safe */ _collisions_polygon_cuboid__WEBPACK_IMPORTED_MODULE_17__.collidePolygonWithCuboid),
/* harmony export */   collidePolygonWithSphere: () => (/* reexport safe */ _collisions_polygon_sphere__WEBPACK_IMPORTED_MODULE_16__.collidePolygonWithSphere),
/* harmony export */   collideRayWithCuboid: () => (/* reexport safe */ _collisions_ray_cuboid__WEBPACK_IMPORTED_MODULE_11__.collideRayWithCuboid),
/* harmony export */   collideRayWithPlane: () => (/* reexport safe */ _collisions_ray_plane__WEBPACK_IMPORTED_MODULE_9__.collideRayWithPlane),
/* harmony export */   collideRayWithRay: () => (/* reexport safe */ _collisions_ray_ray__WEBPACK_IMPORTED_MODULE_8__.collideRayWithRay),
/* harmony export */   collideRayWithSphere: () => (/* reexport safe */ _collisions_ray_sphere__WEBPACK_IMPORTED_MODULE_10__.collideRayWithSphere),
/* harmony export */   collideSphereWithCuboid: () => (/* reexport safe */ _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_15__.collideSphereWithCuboid),
/* harmony export */   collideSphereWithSphere: () => (/* reexport safe */ _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_14__.collideSphereWithSphere)
/* harmony export */ });
/* harmony import */ var _volume__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./volume */ "./modules/physics/volume.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collider */ "./modules/physics/collider.ts");
/* harmony import */ var _colliders_ray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./colliders/ray */ "./modules/physics/colliders/ray.ts");
/* harmony import */ var _colliders_plane__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./colliders/plane */ "./modules/physics/colliders/plane.ts");
/* harmony import */ var _colliders_polygon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./colliders/polygon */ "./modules/physics/colliders/polygon.ts");
/* harmony import */ var _volumes_sphere__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./volumes/sphere */ "./modules/physics/volumes/sphere.ts");
/* harmony import */ var _volumes_cuboid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./volumes/cuboid */ "./modules/physics/volumes/cuboid.ts");
/* harmony import */ var _dispatchers_collision__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./dispatchers/collision */ "./modules/physics/dispatchers/collision.ts");
/* harmony import */ var _collisions_ray_ray__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./collisions/ray/ray */ "./modules/physics/collisions/ray/ray.ts");
/* harmony import */ var _collisions_ray_plane__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./collisions/ray/plane */ "./modules/physics/collisions/ray/plane.ts");
/* harmony import */ var _collisions_ray_sphere__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./collisions/ray/sphere */ "./modules/physics/collisions/ray/sphere.ts");
/* harmony import */ var _collisions_ray_cuboid__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./collisions/ray/cuboid */ "./modules/physics/collisions/ray/cuboid.ts");
/* harmony import */ var _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./collisions/plane/sphere */ "./modules/physics/collisions/plane/sphere.ts");
/* harmony import */ var _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./collisions/plane/cuboid */ "./modules/physics/collisions/plane/cuboid.ts");
/* harmony import */ var _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./collisions/sphere/sphere */ "./modules/physics/collisions/sphere/sphere.ts");
/* harmony import */ var _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./collisions/sphere/cuboid */ "./modules/physics/collisions/sphere/cuboid.ts");
/* harmony import */ var _collisions_polygon_sphere__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./collisions/polygon/sphere */ "./modules/physics/collisions/polygon/sphere.ts");
/* harmony import */ var _collisions_polygon_cuboid__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./collisions/polygon/cuboid */ "./modules/physics/collisions/polygon/cuboid.ts");
/* harmony import */ var _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./collisions/cuboid/cuboid */ "./modules/physics/collisions/cuboid/cuboid.ts");





















/***/ }),

/***/ "./modules/physics/volume.ts":
/*!***********************************!*\
  !*** ./modules/physics/volume.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Volume: () => (/* binding */ Volume)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./collider */ "./modules/physics/collider.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



class Volume extends _collider__WEBPACK_IMPORTED_MODULE_2__.Collider {
    origin = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero;
    center;
    inverseInertia;
    constructor({ origin = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero } = {}) {
        super();
        this.origin = origin.copy();
        this.center = origin.copy();
        this.inverseInertia = new _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.mat3();
    }
    serialize() {
        const { origin } = this;
        return {
            ...super.serialize(),
            origin: origin.serialize()
        };
    }
}
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Volume.prototype, "origin", void 0);


/***/ }),

/***/ "./modules/physics/volumes/cuboid.ts":
/*!*******************************************!*\
  !*** ./modules/physics/volumes/cuboid.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Cuboid: () => (/* binding */ Cuboid)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _volume__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../volume */ "./modules/physics/volume.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



let Cuboid = class Cuboid extends _volume__WEBPACK_IMPORTED_MODULE_2__.Volume {
    type = 'Cuboid';
    extents;
    axes; // Transformed axes of the cuboid
    constructor({ origin = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero, extents = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.one } = {}) {
        super({ origin });
        this.extents = extents.copy();
        this.axes = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.axes.map((axis) => axis.copy()); // Local axes, initially aligned with world axes
    }
    applyTransform(transform) {
        const { translation, rotation } = transform;
        // Update the center of the cuboid
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.add(this.origin, translation, this.center);
        // Rotate the local axes to align with the new orientation
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.axes.forEach((axis, index) => {
            rotation.transformVec3(axis, this.axes[index]);
        });
    }
    calculateInverseInertia(mass, transform) {
        const { rotationMatrix } = transform;
        const { x, y, z } = this.extents;
        const t1 = (1 / 12) * mass * (y * y + z * z);
        const t2 = (1 / 12) * mass * (x * x + z * z);
        const t3 = (1 / 12) * mass * (x * x + y * y);
        this.inverseInertia.set([t1, 0, 0, 0, t2, 0, 0, 0, t3]);
        this.inverseInertia.multiply(rotationMatrix).invert();
    }
    // New method to get the 8 vertices of the cuboid
    getVertices() {
        const { x: ex, y: ey, z: ez } = this.extents;
        // These combinations represent the 8 vertices, with different sign combinations of extents
        const signs = [
            [+1, +1, +1],
            [+1, +1, -1],
            [+1, -1, +1],
            [+1, -1, -1],
            [-1, +1, +1],
            [-1, +1, -1],
            [-1, -1, +1],
            [-1, -1, -1]
        ];
        // Compute each vertex by scaling the extents along each axis
        return signs.map(([sx, sy, sz]) => {
            const vertex = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero.copy();
            // Combine the axes scaled by the extents and the signs
            _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.add(vertex, _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(this.axes[0], ex * sx), vertex); // Scale along x-axis
            _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.add(vertex, _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(this.axes[1], ey * sy), vertex); // Scale along y-axis
            _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.add(vertex, _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.scale(this.axes[2], ez * sz), vertex); // Scale along z-axis
            // Offset the vertex by the cuboid's center
            return _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.add(this.center, vertex);
        });
    }
    getEdges() {
        return [
            [0, 1],
            [1, 3],
            [3, 2],
            [2, 0],
            [4, 5],
            [5, 7],
            [7, 6],
            [6, 4],
            [0, 4],
            [1, 5],
            [2, 6],
            [3, 7] // Vertical edges
        ];
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3)
], Cuboid.prototype, "extents", void 0);
Cuboid = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Register)(),
    __metadata("design:paramtypes", [Object])
], Cuboid);



/***/ }),

/***/ "./modules/physics/volumes/sphere.ts":
/*!*******************************************!*\
  !*** ./modules/physics/volumes/sphere.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Sphere: () => (/* binding */ Sphere)
/* harmony export */ });
/* harmony import */ var _luz_utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/utilities */ "./modules/utilities/index.ts");
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");
/* harmony import */ var _volume__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../volume */ "./modules/physics/volume.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



let Sphere = class Sphere extends _volume__WEBPACK_IMPORTED_MODULE_2__.Volume {
    type = 'Sphere';
    radius;
    constructor({ origin = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero, radius = 1.0 } = {}) {
        super({ origin });
        this.radius = radius;
    }
    applyTransform(transform) {
        const { translation } = transform;
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.add(this.origin, translation, this.center);
    }
    calculateInverseInertia(mass, transform) {
        const { radius } = this;
        const t = (2 / 5) * mass * radius * radius;
        this.inverseInertia.set([t, 0, 0, 0, t, 0, 0, 0, t]);
        this.inverseInertia.invert();
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", Number)
], Sphere.prototype, "radius", void 0);
Sphere = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Register)(),
    __metadata("design:paramtypes", [Object])
], Sphere);



/***/ }),

/***/ "./modules/utilities/dispatcher.ts":
/*!*****************************************!*\
  !*** ./modules/utilities/dispatcher.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Dispatcher: () => (/* binding */ Dispatcher)
/* harmony export */ });
class Dispatcher {
    callbacks = new Map();
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

/***/ "./modules/utilities/index.ts":
/*!************************************!*\
  !*** ./modules/utilities/index.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Dispatcher: () => (/* reexport safe */ _dispatcher__WEBPACK_IMPORTED_MODULE_1__.Dispatcher),
/* harmony export */   Pool: () => (/* reexport safe */ _pool__WEBPACK_IMPORTED_MODULE_0__.Pool),
/* harmony export */   Register: () => (/* reexport safe */ _registry__WEBPACK_IMPORTED_MODULE_4__.Register),
/* harmony export */   Serializable: () => (/* reexport safe */ _serializable__WEBPACK_IMPORTED_MODULE_2__.Serializable),
/* harmony export */   Serialize: () => (/* reexport safe */ _serializable__WEBPACK_IMPORTED_MODULE_2__.Serialize),
/* harmony export */   Uniform: () => (/* reexport safe */ _uniform__WEBPACK_IMPORTED_MODULE_3__.Uniform),
/* harmony export */   getRegisteredClass: () => (/* reexport safe */ _registry__WEBPACK_IMPORTED_MODULE_4__.getRegisteredClass),
/* harmony export */   getUniformProperties: () => (/* reexport safe */ _uniform__WEBPACK_IMPORTED_MODULE_3__.getUniformProperties)
/* harmony export */ });
/* harmony import */ var _pool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pool */ "./modules/utilities/pool.ts");
/* harmony import */ var _dispatcher__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dispatcher */ "./modules/utilities/dispatcher.ts");
/* harmony import */ var _serializable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./serializable */ "./modules/utilities/serializable.ts");
/* harmony import */ var _uniform__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./uniform */ "./modules/utilities/uniform.ts");
/* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./registry */ "./modules/utilities/registry.ts");







/***/ }),

/***/ "./modules/utilities/pool.ts":
/*!***********************************!*\
  !*** ./modules/utilities/pool.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pool: () => (/* binding */ Pool)
/* harmony export */ });
const { ceil } = Math;
class Pool {
    create;
    reset;
    initialSize;
    batchSize;
    pool;
    maximumSize; // maximum number of objects that the pool can grow to
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

/***/ "./modules/utilities/registry.ts":
/*!***************************************!*\
  !*** ./modules/utilities/registry.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Register: () => (/* binding */ Register),
/* harmony export */   getRegisteredClass: () => (/* binding */ getRegisteredClass)
/* harmony export */ });
const classRegistry = new Map();
function Register() {
    return function (classConstructor) {
        classRegistry.set(classConstructor.name, classConstructor);
    };
}
function getRegisteredClass(value) {
    return classRegistry.get(value?.type);
}


/***/ }),

/***/ "./modules/utilities/serializable.ts":
/*!*******************************************!*\
  !*** ./modules/utilities/serializable.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Serializable: () => (/* binding */ Serializable),
/* harmony export */   Serialize: () => (/* binding */ Serialize)
/* harmony export */ });
/* harmony import */ var reflect_metadata__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! reflect-metadata */ "./node_modules/reflect-metadata/Reflect.js");
/* harmony import */ var reflect_metadata__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(reflect_metadata__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./registry */ "./modules/utilities/registry.ts");


const serializedProperties = new WeakMap();
function Serialize(valueType) {
    return function (target, key) {
        let properties = [];
        if (serializedProperties.has(target.constructor)) {
            properties = serializedProperties.get(target.constructor);
        }
        else {
            serializedProperties.set(target.constructor, properties);
        }
        const type = Reflect.getMetadata('design:type', target, key);
        properties.push({ key, type, valueType });
    };
}
const { isArray } = Array;
const isObject = (value) => {
    return typeof value === 'object';
};
class Serializable {
    serialize() {
        const isSerializable = (value) => {
            return typeof value.serialize === 'function';
        };
        const properties = Serializable.getAllSerializableProperties(this.constructor);
        return properties.reduce((data, { key }) => {
            const value = this[key];
            if (value === undefined) {
                return data;
            }
            if (isSerializable(value)) {
                data[key] = value.serialize(value);
            }
            else if (isArray(value)) {
                data[key] = value.map((value) => {
                    return isSerializable(value) ? value.serialize(value) : value;
                });
            }
            else if (isObject(value)) {
                data[key] = Object.entries(value).reduce((entries, [key, value]) => {
                    entries[key] = isSerializable(value) ? value.serialize(value) : value;
                    return entries;
                }, {});
            }
            else {
                data[key] = value;
            }
            return data;
        }, {});
    }
    static async deserialize(data) {
        const isDeserializable = (type) => {
            return type && typeof type.deserialize === 'function';
        };
        const instance = new this();
        const properties = Serializable.getAllSerializableProperties(this);
        for (const { key, type, valueType } of properties) {
            const value = data[key];
            if (value === undefined) {
                continue;
            }
            let currentType = type;
            let currentValueType = valueType;
            if ((0,_registry__WEBPACK_IMPORTED_MODULE_1__.getRegisteredClass)(value)) {
                currentType = (0,_registry__WEBPACK_IMPORTED_MODULE_1__.getRegisteredClass)(value);
            }
            if (isDeserializable(currentType)) {
                instance[key] = await currentType.deserialize(value);
            }
            else if (isArray(value)) {
                instance[key] = await Promise.all(value.map(async (item) => {
                    let itemValueType = currentValueType;
                    if ((0,_registry__WEBPACK_IMPORTED_MODULE_1__.getRegisteredClass)(item)) {
                        itemValueType = (0,_registry__WEBPACK_IMPORTED_MODULE_1__.getRegisteredClass)(item);
                    }
                    if (typeof item === 'string' && itemValueType !== undefined) {
                        const response = await fetch(item);
                        const jsonData = await response.json();
                        const resolvedType = (0,_registry__WEBPACK_IMPORTED_MODULE_1__.getRegisteredClass)(jsonData) || itemValueType;
                        return await resolvedType.deserialize(jsonData);
                    }
                    else {
                        return isDeserializable(itemValueType) ? await itemValueType.deserialize(item) : item;
                    }
                }));
            }
            else if (isObject(value)) {
                const entries = await Promise.all(Object.entries(value).map(async ([entryKey, entryValue]) => {
                    let entryValueType = currentValueType;
                    if ((0,_registry__WEBPACK_IMPORTED_MODULE_1__.getRegisteredClass)(entryValue)) {
                        entryValueType = (0,_registry__WEBPACK_IMPORTED_MODULE_1__.getRegisteredClass)(entryValue);
                    }
                    if (typeof entryValue === 'string' && entryValueType !== undefined) {
                        const response = await fetch(entryValue);
                        const jsonData = await response.json();
                        const resolvedType = (0,_registry__WEBPACK_IMPORTED_MODULE_1__.getRegisteredClass)(jsonData) || entryValueType;
                        return [entryKey, await resolvedType.deserialize(jsonData)];
                    }
                    else {
                        return [
                            entryKey,
                            isDeserializable(entryValueType) ? await entryValueType.deserialize(entryValue) : entryValue
                        ];
                    }
                }));
                instance[key] = Object.fromEntries(entries);
            }
            else {
                instance[key] = value;
            }
        }
        return instance;
    }
    static getAllSerializableProperties(target) {
        let allProperties = [];
        let prototype = target.prototype;
        while (prototype && prototype !== Object.prototype) {
            const properties = serializedProperties.get(prototype.constructor) || [];
            allProperties = [...allProperties, ...properties];
            prototype = Object.getPrototypeOf(prototype);
        }
        return allProperties;
    }
}


/***/ }),

/***/ "./modules/utilities/uniform.ts":
/*!**************************************!*\
  !*** ./modules/utilities/uniform.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Uniform: () => (/* binding */ Uniform),
/* harmony export */   getUniformProperties: () => (/* binding */ getUniformProperties)
/* harmony export */ });
const uniformProperties = new WeakMap();
function Uniform() {
    return function (target, key) {
        let properties = [];
        if (uniformProperties.has(target.constructor)) {
            properties = uniformProperties.get(target.constructor);
        }
        else {
            uniformProperties.set(target.constructor, properties);
        }
        const type = Reflect.getMetadata('design:type', target, key);
        properties.push({ key, type });
    };
}
function getUniformProperties(target) {
    let allProperties = [];
    let prototype = target.prototype;
    while (prototype && prototype !== Object.prototype) {
        const properties = uniformProperties.get(prototype.constructor) || [];
        allProperties = [...allProperties, ...properties];
        prototype = Object.getPrototypeOf(prototype);
    }
    return allProperties;
}


/***/ }),

/***/ "./modules/vectors/constants.ts":
/*!**************************************!*\
  !*** ./modules/vectors/constants.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Epsilon: () => (/* binding */ Epsilon)
/* harmony export */ });
const Epsilon = 0.00001;


/***/ }),

/***/ "./modules/vectors/index.ts":
/*!**********************************!*\
  !*** ./modules/vectors/index.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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
/* harmony import */ var _mat2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mat2 */ "./modules/vectors/mat2.ts");
/* harmony import */ var _mat3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat3 */ "./modules/vectors/mat3.ts");
/* harmony import */ var _mat4__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mat4 */ "./modules/vectors/mat4.ts");
/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec2 */ "./modules/vectors/vec2.ts");
/* harmony import */ var _vec3__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vec3 */ "./modules/vectors/vec3.ts");
/* harmony import */ var _vec4__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./vec4 */ "./modules/vectors/vec4.ts");
/* harmony import */ var _quat__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./quat */ "./modules/vectors/quat.ts");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants */ "./modules/vectors/constants.ts");










/***/ }),

/***/ "./modules/vectors/mat2.ts":
/*!*********************************!*\
  !*** ./modules/vectors/mat2.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mat2: () => (/* binding */ mat2)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./modules/vectors/constants.ts");
/* harmony import */ var _vec2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vec2 */ "./modules/vectors/vec2.ts");


class mat2 extends Float32Array {
    constructor(values = [1.0, 0.0, 0.0, 1.0]) {
        super(values.slice(0, 4));
    }
    static identity = new mat2();
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
    static async deserialize(values) {
        return new mat2(values);
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


/***/ }),

/***/ "./modules/vectors/mat3.ts":
/*!*********************************!*\
  !*** ./modules/vectors/mat3.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mat3: () => (/* binding */ mat3)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./modules/vectors/constants.ts");
/* harmony import */ var _mat4__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat4 */ "./modules/vectors/mat4.ts");
/* harmony import */ var _quat__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./quat */ "./modules/vectors/quat.ts");
/* harmony import */ var _vec3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec3 */ "./modules/vectors/vec3.ts");




class mat3 extends Float32Array {
    constructor(values = [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]) {
        super(values.slice(0, 9));
    }
    static identity = new mat3();
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
            throw new Error('Matrix is not invertible');
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
    static async deserialize(values) {
        return new mat3(values);
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
        dest.set([x.x, x.y, x.z, y.x, y.y, y.z, z.x, z.y, z.z]);
        return dest;
    }
}


/***/ }),

/***/ "./modules/vectors/mat4.ts":
/*!*********************************!*\
  !*** ./modules/vectors/mat4.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mat4: () => (/* binding */ mat4)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./modules/vectors/constants.ts");
/* harmony import */ var _mat3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat3 */ "./modules/vectors/mat3.ts");
/* harmony import */ var _vec3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vec3 */ "./modules/vectors/vec3.ts");
/* harmony import */ var _vec4__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec4 */ "./modules/vectors/vec4.ts");




class mat4 extends Float32Array {
    constructor(values = [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]) {
        super(values.slice(0, 16));
    }
    static identity = new mat4();
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
            return dest;
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
        dest.set([this[0], this[1], this[2], this[4], this[5], this[6], this[8], this[9], this[10]]);
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
    static async deserialize(values) {
        return new mat4(values);
    }
    static construct(translation, rotation, scale = _vec3__WEBPACK_IMPORTED_MODULE_2__.vec3.one, dest = null) {
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
        const sx = scale.x;
        const sy = scale.y;
        const sz = scale.z;
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
            (1.0 - (yy + zz)) * sx,
            (xy + wz) * sx,
            (xz - wy) * sx,
            0.0,
            (xy - wz) * sy,
            (1.0 - (xx + zz)) * sy,
            (yz + wx) * sy,
            0.0,
            (xz + wy) * sz,
            (yz - wx) * sz,
            (1.0 - (xx + yy)) * sz,
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
        dest.set([x.x, x.y, x.z, 0.0, y.x, y.y, y.z, 0.0, z.x, z.y, z.z, 0.0, eye.x, eye.y, eye.z, 1.0]);
        return dest;
    }
}


/***/ }),

/***/ "./modules/vectors/quat.ts":
/*!*********************************!*\
  !*** ./modules/vectors/quat.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   quat: () => (/* binding */ quat)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./modules/vectors/constants.ts");
/* harmony import */ var _mat3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mat3 */ "./modules/vectors/mat3.ts");
/* harmony import */ var _mat4__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mat4 */ "./modules/vectors/mat4.ts");
/* harmony import */ var _vec3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vec3 */ "./modules/vectors/vec3.ts");




function toDegrees(radians) {
    return radians * (180 / Math.PI);
}
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
class quat extends Float32Array {
    constructor(values = [0.0, 0.0, 0.0, 1.0]) {
        super(values.slice(0, 4));
    }
    static identity = new quat();
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
        dest.set([1.0 - (yy + zz), xy + wz, xz - wy, xy - wz, 1.0 - (xx + zz), yz + wx, xz + wy, yz - wx, 1.0 - (xx + yy)]);
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
    interpolate(q, time, dest = null) {
        return quat.interpolate(this, q, time, dest);
    }
    serialize() {
        const { x, y, z, w } = this;
        return [x, y, z, w];
    }
    static async deserialize(values) {
        return new quat(values);
    }
    static interpolate(q1, q2, time, dest = null) {
        if (!dest) {
            dest = new quat();
        }
        if (time <= 0.0) {
            return q1.copy(dest);
        }
        if (time >= 1.0) {
            return q2.copy(dest);
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


/***/ }),

/***/ "./modules/vectors/vec2.ts":
/*!*********************************!*\
  !*** ./modules/vectors/vec2.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   vec2: () => (/* binding */ vec2)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./modules/vectors/constants.ts");

const { min, max, abs, sqrt } = Math;
class vec2 extends Float32Array {
    static zero = new vec2([0.0, 0.0]);
    static one = new vec2([1.0, 1.0]);
    static right = new vec2([1.0, 0.0]);
    static up = new vec2([0.0, 1.0]);
    static axes = [vec2.right, vec2.up];
    static infinity = new vec2([Infinity, Infinity]);
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
    serialize() {
        const { x, y } = this;
        return [x, y];
    }
    static async deserialize(values) {
        return new vec2(values);
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


/***/ }),

/***/ "./modules/vectors/vec3.ts":
/*!*********************************!*\
  !*** ./modules/vectors/vec3.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   vec3: () => (/* binding */ vec3)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./modules/vectors/constants.ts");

const { min, max, abs, sqrt } = Math;
class vec3 extends Float32Array {
    static zero = new vec3([0.0, 0.0, 0.0]);
    static one = new vec3([1.0, 1.0, 1.0]);
    static grey = new vec3([0.8, 0.8, 0.8]);
    static right = new vec3([1.0, 0.0, 0.0]);
    static left = new vec3([-1.0, 0.0, 0.0]);
    static up = new vec3([0.0, 1.0, 0.0]);
    static down = new vec3([0.0, -1.0, 0.0]);
    static forward = new vec3([0.0, 0.0, 1.0]);
    static backward = new vec3([0.0, 0.0, -1.0]);
    static axes = [vec3.right, vec3.up, vec3.forward];
    static infinity = new vec3([Infinity, Infinity, Infinity]);
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
    get rgb() {
        return Array.from(this);
    }
    set rgb(rgb) {
        this.set(rgb);
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
        return normal
            .copy(dest)
            .scale(-2.0 * vec3.dot(this, normal))
            .add(this);
    }
    transform(matrix, dest = null) {
        if (!dest) {
            dest = this;
        }
        return matrix.transform(this, dest);
    }
    interpolate(v2, time, dest = null) {
        return vec3.interpolate(this, v2, time, dest);
    }
    serialize() {
        const { x, y, z } = this;
        return [x, y, z];
    }
    static async deserialize(values) {
        return new vec3(values);
    }
    static interpolate(v1, v2, time, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        if (time <= 0.0) {
            return v1.copy(dest);
        }
        if (time >= 1.0) {
            return v2.copy(dest);
        }
        return v1
            .copy(dest)
            .scale(1.0 - time)
            .add(v2.copy().scale(time));
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
    static minimum(v1, v2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = min(v1.x, v2.x);
        dest.y = min(v1.y, v2.y);
        dest.z = min(v1.z, v2.z);
        return dest;
    }
    static maximum(v1, v2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = max(v1.x, v2.x);
        dest.y = max(v1.y, v2.y);
        dest.z = max(v1.z, v2.z);
        return dest;
    }
    static cross(v1, v2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        const x = v1.x;
        const y = v1.y;
        const z = v1.z;
        const x2 = v2.x;
        const y2 = v2.y;
        const z2 = v2.z;
        dest.x = y * z2 - z * y2;
        dest.y = z * x2 - x * z2;
        dest.z = x * y2 - y * x2;
        return dest;
    }
    static dot(v1, v2) {
        const x = v1.x;
        const y = v1.y;
        const z = v1.z;
        const x2 = v2.x;
        const y2 = v2.y;
        const z2 = v2.z;
        return x * x2 + y * y2 + z * z2;
    }
    static distance(v1, v2) {
        return sqrt(this.squaredDistance(v1, v2));
    }
    static squaredDistance(v1, v2) {
        const x = v2.x - v1.x;
        const y = v2.y - v1.y;
        const z = v2.z - v1.z;
        return x * x + y * y + z * z;
    }
    static direction(v1, v2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        const x = v1.x - v2.x;
        const y = v1.y - v2.y;
        const z = v1.z - v2.z;
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
    static mix(v1, v2, time, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = v1.x + time * (v2.x - v1.x);
        dest.y = v1.y + time * (v2.y - v1.y);
        dest.z = v1.z + time * (v2.z - v1.z);
        return dest;
    }
    static add(v1, v2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = v1.x + v2.x;
        dest.y = v1.y + v2.y;
        dest.z = v1.z + v2.z;
        return dest;
    }
    static subtract(v1, v2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = v1.x - v2.x;
        dest.y = v1.y - v2.y;
        dest.z = v1.z - v2.z;
        return dest;
    }
    static multiply(v1, v2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = v1.x * v2.x;
        dest.y = v1.y * v2.y;
        dest.z = v1.z * v2.z;
        return dest;
    }
    static divide(v1, v2, dest = null) {
        if (!dest) {
            dest = new vec3();
        }
        dest.x = v1.x / v2.x;
        dest.y = v1.y / v2.y;
        dest.z = v1.z / v2.z;
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


/***/ }),

/***/ "./modules/vectors/vec4.ts":
/*!*********************************!*\
  !*** ./modules/vectors/vec4.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   vec4: () => (/* binding */ vec4)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./modules/vectors/constants.ts");

const { min, max, abs, sqrt } = Math;
class vec4 extends Float32Array {
    static zero = new vec4([0.0, 0.0, 0.0, 1.0]);
    static one = new vec4([1.0, 1.0, 1.0, 1.0]);
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
    get rgba() {
        return Array.from(this);
    }
    set rgba(rgba) {
        this.set(rgba);
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
    serialize() {
        const { x, y, z, w } = this;
        return [x, y, z, w];
    }
    static async deserialize(values) {
        return new vec4(values);
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


/***/ }),

/***/ "./node_modules/reflect-metadata/Reflect.js":
/*!**************************************************!*\
  !*** ./node_modules/reflect-metadata/Reflect.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect;
(function (Reflect) {
    // Metadata Proposal
    // https://rbuckton.github.io/reflect-metadata/
    (function (factory) {
        var root = typeof globalThis === "object" ? globalThis :
            typeof __webpack_require__.g === "object" ? __webpack_require__.g :
                typeof self === "object" ? self :
                    typeof this === "object" ? this :
                        sloppyModeThis();
        var exporter = makeExporter(Reflect);
        if (typeof root.Reflect !== "undefined") {
            exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter, root);
        if (typeof root.Reflect === "undefined") {
            root.Reflect = Reflect;
        }
        function makeExporter(target, previous) {
            return function (key, value) {
                Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                if (previous)
                    previous(key, value);
            };
        }
        function functionThis() {
            try {
                return Function("return this;")();
            }
            catch (_) { }
        }
        function indirectEvalThis() {
            try {
                return (void 0, eval)("(function() { return this; })()");
            }
            catch (_) { }
        }
        function sloppyModeThis() {
            return functionThis() || indirectEvalThis();
        }
    })(function (exporter, root) {
        var hasOwn = Object.prototype.hasOwnProperty;
        // feature test for Symbol support
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
            create: supportsCreate
                ? function () { return MakeDictionary(Object.create(null)); }
                : supportsProto
                    ? function () { return MakeDictionary({ __proto__: null }); }
                    : function () { return MakeDictionary({}); },
            has: downLevel
                ? function (map, key) { return hasOwn.call(map, key); }
                : function (map, key) { return key in map; },
            get: downLevel
                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
                : function (map, key) { return map[key]; },
        };
        // Load global or shim versions of Map, Set, and WeakMap
        var functionPrototype = Object.getPrototypeOf(Function);
        var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        var registrySymbol = supportsSymbol ? Symbol.for("@reflect-metadata:registry") : undefined;
        var metadataRegistry = GetOrCreateMetadataRegistry();
        var metadataProvider = CreateMetadataProvider(metadataRegistry);
        /**
         * Applies a set of decorators to a property of a target object.
         * @param decorators An array of decorators.
         * @param target The target object.
         * @param propertyKey (Optional) The property key to decorate.
         * @param attributes (Optional) The property descriptor for the target key.
         * @remarks Decorators are applied in reverse order.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Example = Reflect.decorate(decoratorsArray, Example);
         *
         *     // property (on constructor)
         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Object.defineProperty(Example, "staticMethod",
         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
         *
         *     // method (on prototype)
         *     Object.defineProperty(Example.prototype, "method",
         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
         *
         */
        function decorate(decorators, target, propertyKey, attributes) {
            if (!IsUndefined(propertyKey)) {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                    throw new TypeError();
                if (IsNull(attributes))
                    attributes = undefined;
                propertyKey = ToPropertyKey(propertyKey);
                return DecorateProperty(decorators, target, propertyKey, attributes);
            }
            else {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsConstructor(target))
                    throw new TypeError();
                return DecorateConstructor(decorators, target);
            }
        }
        exporter("decorate", decorate);
        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
        /**
         * A default metadata decorator factory that can be used on a class, class member, or parameter.
         * @param metadataKey The key for the metadata entry.
         * @param metadataValue The value for the metadata entry.
         * @returns A decorator function.
         * @remarks
         * If `metadataKey` is already defined for the target and target key, the
         * metadataValue for that key will be overwritten.
         * @example
         *
         *     // constructor
         *     @Reflect.metadata(key, value)
         *     class Example {
         *     }
         *
         *     // property (on constructor, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticProperty;
         *     }
         *
         *     // property (on prototype, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         property;
         *     }
         *
         *     // method (on constructor)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticMethod() { }
         *     }
         *
         *     // method (on prototype)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         method() { }
         *     }
         *
         */
        function metadata(metadataKey, metadataValue) {
            function decorator(target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                    throw new TypeError();
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            return decorator;
        }
        exporter("metadata", metadata);
        /**
         * Define a unique metadata entry on the target.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param metadataValue A value that contains attached metadata.
         * @param target The target object on which to define metadata.
         * @param propertyKey (Optional) The property key for the target.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Reflect.defineMetadata("custom:annotation", options, Example);
         *
         *     // property (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
         *
         *     // method (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
         *
         *     // decorator factory as metadata-producing annotation.
         *     function MyAnnotation(options): Decorator {
         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
         *     }
         *
         */
        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);
        /**
         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        /**
         * Gets a value indicating whether the target object has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        /**
         * Gets the metadata keys defined on the target object or its prototype chain.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
         *
         */
        function getMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        /**
         * Gets the unique metadata keys defined on the target object.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
         *
         */
        function getOwnMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        /**
         * Deletes the metadata entry from the target object with the provided key.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.deleteMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function deleteMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            var provider = GetMetadataProvider(target, propertyKey, /*Create*/ false);
            if (IsUndefined(provider))
                return false;
            return provider.OrdinaryDeleteMetadata(metadataKey, target, propertyKey);
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsConstructor(decorated))
                        throw new TypeError();
                    target = decorated;
                }
            }
            return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target, propertyKey, descriptor);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsObject(decorated))
                        throw new TypeError();
                    descriptor = decorated;
                }
            }
            return descriptor;
        }
        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
        function OrdinaryHasMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return true;
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryHasMetadata(MetadataKey, parent, P);
            return false;
        }
        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
            var provider = GetMetadataProvider(O, P, /*Create*/ false);
            if (IsUndefined(provider))
                return false;
            return ToBoolean(provider.OrdinaryHasOwnMetadata(MetadataKey, O, P));
        }
        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
        function OrdinaryGetMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryGetMetadata(MetadataKey, parent, P);
            return undefined;
        }
        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
            var provider = GetMetadataProvider(O, P, /*Create*/ false);
            if (IsUndefined(provider))
                return;
            return provider.OrdinaryGetOwnMetadata(MetadataKey, O, P);
        }
        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
            var provider = GetMetadataProvider(O, P, /*Create*/ true);
            provider.OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P);
        }
        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
        function OrdinaryMetadataKeys(O, P) {
            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (parent === null)
                return ownKeys;
            var parentKeys = OrdinaryMetadataKeys(parent, P);
            if (parentKeys.length <= 0)
                return ownKeys;
            if (ownKeys.length <= 0)
                return parentKeys;
            var set = new _Set();
            var keys = [];
            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                var key = ownKeys_1[_i];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                var key = parentKeys_1[_a];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            return keys;
        }
        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
        function OrdinaryOwnMetadataKeys(O, P) {
            var provider = GetMetadataProvider(O, P, /*create*/ false);
            if (!provider) {
                return [];
            }
            return provider.OrdinaryOwnMetadataKeys(O, P);
        }
        // 6 ECMAScript Data Types and Values
        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
        function Type(x) {
            if (x === null)
                return 1 /* Null */;
            switch (typeof x) {
                case "undefined": return 0 /* Undefined */;
                case "boolean": return 2 /* Boolean */;
                case "string": return 3 /* String */;
                case "symbol": return 4 /* Symbol */;
                case "number": return 5 /* Number */;
                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
                default: return 6 /* Object */;
            }
        }
        // 6.1.1 The Undefined Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
        function IsUndefined(x) {
            return x === undefined;
        }
        // 6.1.2 The Null Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
        function IsNull(x) {
            return x === null;
        }
        // 6.1.5 The Symbol Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
        function IsSymbol(x) {
            return typeof x === "symbol";
        }
        // 6.1.7 The Object Type
        // https://tc39.github.io/ecma262/#sec-object-type
        function IsObject(x) {
            return typeof x === "object" ? x !== null : typeof x === "function";
        }
        // 7.1 Type Conversion
        // https://tc39.github.io/ecma262/#sec-type-conversion
        // 7.1.1 ToPrimitive(input [, PreferredType])
        // https://tc39.github.io/ecma262/#sec-toprimitive
        function ToPrimitive(input, PreferredType) {
            switch (Type(input)) {
                case 0 /* Undefined */: return input;
                case 1 /* Null */: return input;
                case 2 /* Boolean */: return input;
                case 3 /* String */: return input;
                case 4 /* Symbol */: return input;
                case 5 /* Number */: return input;
            }
            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
            if (exoticToPrim !== undefined) {
                var result = exoticToPrim.call(input, hint);
                if (IsObject(result))
                    throw new TypeError();
                return result;
            }
            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }
        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
        function OrdinaryToPrimitive(O, hint) {
            if (hint === "string") {
                var toString_1 = O.toString;
                if (IsCallable(toString_1)) {
                    var result = toString_1.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            else {
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var toString_2 = O.toString;
                if (IsCallable(toString_2)) {
                    var result = toString_2.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            throw new TypeError();
        }
        // 7.1.2 ToBoolean(argument)
        // https://tc39.github.io/ecma262/2016/#sec-toboolean
        function ToBoolean(argument) {
            return !!argument;
        }
        // 7.1.12 ToString(argument)
        // https://tc39.github.io/ecma262/#sec-tostring
        function ToString(argument) {
            return "" + argument;
        }
        // 7.1.14 ToPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-topropertykey
        function ToPropertyKey(argument) {
            var key = ToPrimitive(argument, 3 /* String */);
            if (IsSymbol(key))
                return key;
            return ToString(key);
        }
        // 7.2 Testing and Comparison Operations
        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
        // 7.2.2 IsArray(argument)
        // https://tc39.github.io/ecma262/#sec-isarray
        function IsArray(argument) {
            return Array.isArray
                ? Array.isArray(argument)
                : argument instanceof Object
                    ? argument instanceof Array
                    : Object.prototype.toString.call(argument) === "[object Array]";
        }
        // 7.2.3 IsCallable(argument)
        // https://tc39.github.io/ecma262/#sec-iscallable
        function IsCallable(argument) {
            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
            return typeof argument === "function";
        }
        // 7.2.4 IsConstructor(argument)
        // https://tc39.github.io/ecma262/#sec-isconstructor
        function IsConstructor(argument) {
            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
            return typeof argument === "function";
        }
        // 7.2.7 IsPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-ispropertykey
        function IsPropertyKey(argument) {
            switch (Type(argument)) {
                case 3 /* String */: return true;
                case 4 /* Symbol */: return true;
                default: return false;
            }
        }
        function SameValueZero(x, y) {
            return x === y || x !== x && y !== y;
        }
        // 7.3 Operations on Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-objects
        // 7.3.9 GetMethod(V, P)
        // https://tc39.github.io/ecma262/#sec-getmethod
        function GetMethod(V, P) {
            var func = V[P];
            if (func === undefined || func === null)
                return undefined;
            if (!IsCallable(func))
                throw new TypeError();
            return func;
        }
        // 7.4 Operations on Iterator Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
        function GetIterator(obj) {
            var method = GetMethod(obj, iteratorSymbol);
            if (!IsCallable(method))
                throw new TypeError(); // from Call
            var iterator = method.call(obj);
            if (!IsObject(iterator))
                throw new TypeError();
            return iterator;
        }
        // 7.4.4 IteratorValue(iterResult)
        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
        function IteratorValue(iterResult) {
            return iterResult.value;
        }
        // 7.4.5 IteratorStep(iterator)
        // https://tc39.github.io/ecma262/#sec-iteratorstep
        function IteratorStep(iterator) {
            var result = iterator.next();
            return result.done ? false : result;
        }
        // 7.4.6 IteratorClose(iterator, completion)
        // https://tc39.github.io/ecma262/#sec-iteratorclose
        function IteratorClose(iterator) {
            var f = iterator["return"];
            if (f)
                f.call(iterator);
        }
        // 9.1 Ordinary Object Internal Methods and Internal Slots
        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
        function OrdinaryGetPrototypeOf(O) {
            var proto = Object.getPrototypeOf(O);
            if (typeof O !== "function" || O === functionPrototype)
                return proto;
            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
            // Try to determine the superclass constructor. Compatible implementations
            // must either set __proto__ on a subclass constructor to the superclass constructor,
            // or ensure each class has a valid `constructor` property on its prototype that
            // points back to the constructor.
            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
            // This is the case when in ES6 or when using __proto__ in a compatible browser.
            if (proto !== functionPrototype)
                return proto;
            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
            var prototype = O.prototype;
            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
            if (prototypeProto == null || prototypeProto === Object.prototype)
                return proto;
            // If the constructor was not a function, then we cannot determine the heritage.
            var constructor = prototypeProto.constructor;
            if (typeof constructor !== "function")
                return proto;
            // If we have some kind of self-reference, then we cannot determine the heritage.
            if (constructor === O)
                return proto;
            // we have a pretty good guess at the heritage.
            return constructor;
        }
        // Global metadata registry
        // - Allows `import "reflect-metadata"` and `import "reflect-metadata/no-conflict"` to interoperate.
        // - Uses isolated metadata if `Reflect` is frozen before the registry can be installed.
        /**
         * Creates a registry used to allow multiple `reflect-metadata` providers.
         */
        function CreateMetadataRegistry() {
            var fallback;
            if (!IsUndefined(registrySymbol) &&
                typeof root.Reflect !== "undefined" &&
                !(registrySymbol in root.Reflect) &&
                typeof root.Reflect.defineMetadata === "function") {
                // interoperate with older version of `reflect-metadata` that did not support a registry.
                fallback = CreateFallbackProvider(root.Reflect);
            }
            var first;
            var second;
            var rest;
            var targetProviderMap = new _WeakMap();
            var registry = {
                registerProvider: registerProvider,
                getProvider: getProvider,
                setProvider: setProvider,
            };
            return registry;
            function registerProvider(provider) {
                if (!Object.isExtensible(registry)) {
                    throw new Error("Cannot add provider to a frozen registry.");
                }
                switch (true) {
                    case fallback === provider: break;
                    case IsUndefined(first):
                        first = provider;
                        break;
                    case first === provider: break;
                    case IsUndefined(second):
                        second = provider;
                        break;
                    case second === provider: break;
                    default:
                        if (rest === undefined)
                            rest = new _Set();
                        rest.add(provider);
                        break;
                }
            }
            function getProviderNoCache(O, P) {
                if (!IsUndefined(first)) {
                    if (first.isProviderFor(O, P))
                        return first;
                    if (!IsUndefined(second)) {
                        if (second.isProviderFor(O, P))
                            return first;
                        if (!IsUndefined(rest)) {
                            var iterator = GetIterator(rest);
                            while (true) {
                                var next = IteratorStep(iterator);
                                if (!next) {
                                    return undefined;
                                }
                                var provider = IteratorValue(next);
                                if (provider.isProviderFor(O, P)) {
                                    IteratorClose(iterator);
                                    return provider;
                                }
                            }
                        }
                    }
                }
                if (!IsUndefined(fallback) && fallback.isProviderFor(O, P)) {
                    return fallback;
                }
                return undefined;
            }
            function getProvider(O, P) {
                var providerMap = targetProviderMap.get(O);
                var provider;
                if (!IsUndefined(providerMap)) {
                    provider = providerMap.get(P);
                }
                if (!IsUndefined(provider)) {
                    return provider;
                }
                provider = getProviderNoCache(O, P);
                if (!IsUndefined(provider)) {
                    if (IsUndefined(providerMap)) {
                        providerMap = new _Map();
                        targetProviderMap.set(O, providerMap);
                    }
                    providerMap.set(P, provider);
                }
                return provider;
            }
            function hasProvider(provider) {
                if (IsUndefined(provider))
                    throw new TypeError();
                return first === provider || second === provider || !IsUndefined(rest) && rest.has(provider);
            }
            function setProvider(O, P, provider) {
                if (!hasProvider(provider)) {
                    throw new Error("Metadata provider not registered.");
                }
                var existingProvider = getProvider(O, P);
                if (existingProvider !== provider) {
                    if (!IsUndefined(existingProvider)) {
                        return false;
                    }
                    var providerMap = targetProviderMap.get(O);
                    if (IsUndefined(providerMap)) {
                        providerMap = new _Map();
                        targetProviderMap.set(O, providerMap);
                    }
                    providerMap.set(P, provider);
                }
                return true;
            }
        }
        /**
         * Gets or creates the shared registry of metadata providers.
         */
        function GetOrCreateMetadataRegistry() {
            var metadataRegistry;
            if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
                metadataRegistry = root.Reflect[registrySymbol];
            }
            if (IsUndefined(metadataRegistry)) {
                metadataRegistry = CreateMetadataRegistry();
            }
            if (!IsUndefined(registrySymbol) && IsObject(root.Reflect) && Object.isExtensible(root.Reflect)) {
                Object.defineProperty(root.Reflect, registrySymbol, {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: metadataRegistry
                });
            }
            return metadataRegistry;
        }
        function CreateMetadataProvider(registry) {
            // [[Metadata]] internal slot
            // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
            var metadata = new _WeakMap();
            var provider = {
                isProviderFor: function (O, P) {
                    var targetMetadata = metadata.get(O);
                    if (IsUndefined(targetMetadata))
                        return false;
                    return targetMetadata.has(P);
                },
                OrdinaryDefineOwnMetadata: OrdinaryDefineOwnMetadata,
                OrdinaryHasOwnMetadata: OrdinaryHasOwnMetadata,
                OrdinaryGetOwnMetadata: OrdinaryGetOwnMetadata,
                OrdinaryOwnMetadataKeys: OrdinaryOwnMetadataKeys,
                OrdinaryDeleteMetadata: OrdinaryDeleteMetadata,
            };
            metadataRegistry.registerProvider(provider);
            return provider;
            function GetOrCreateMetadataMap(O, P, Create) {
                var targetMetadata = metadata.get(O);
                var createdTargetMetadata = false;
                if (IsUndefined(targetMetadata)) {
                    if (!Create)
                        return undefined;
                    targetMetadata = new _Map();
                    metadata.set(O, targetMetadata);
                    createdTargetMetadata = true;
                }
                var metadataMap = targetMetadata.get(P);
                if (IsUndefined(metadataMap)) {
                    if (!Create)
                        return undefined;
                    metadataMap = new _Map();
                    targetMetadata.set(P, metadataMap);
                    if (!registry.setProvider(O, P, provider)) {
                        targetMetadata.delete(P);
                        if (createdTargetMetadata) {
                            metadata.delete(O);
                        }
                        throw new Error("Wrong provider for target.");
                    }
                }
                return metadataMap;
            }
            // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
            function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return false;
                return ToBoolean(metadataMap.has(MetadataKey));
            }
            // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
            function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return undefined;
                return metadataMap.get(MetadataKey);
            }
            // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
            function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
                metadataMap.set(MetadataKey, MetadataValue);
            }
            // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
            // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
            function OrdinaryOwnMetadataKeys(O, P) {
                var keys = [];
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return keys;
                var keysObj = metadataMap.keys();
                var iterator = GetIterator(keysObj);
                var k = 0;
                while (true) {
                    var next = IteratorStep(iterator);
                    if (!next) {
                        keys.length = k;
                        return keys;
                    }
                    var nextValue = IteratorValue(next);
                    try {
                        keys[k] = nextValue;
                    }
                    catch (e) {
                        try {
                            IteratorClose(iterator);
                        }
                        finally {
                            throw e;
                        }
                    }
                    k++;
                }
            }
            function OrdinaryDeleteMetadata(MetadataKey, O, P) {
                var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
                if (IsUndefined(metadataMap))
                    return false;
                if (!metadataMap.delete(MetadataKey))
                    return false;
                if (metadataMap.size === 0) {
                    var targetMetadata = metadata.get(O);
                    if (!IsUndefined(targetMetadata)) {
                        targetMetadata.delete(P);
                        if (targetMetadata.size === 0) {
                            metadata.delete(targetMetadata);
                        }
                    }
                }
                return true;
            }
        }
        function CreateFallbackProvider(reflect) {
            var defineMetadata = reflect.defineMetadata, hasOwnMetadata = reflect.hasOwnMetadata, getOwnMetadata = reflect.getOwnMetadata, getOwnMetadataKeys = reflect.getOwnMetadataKeys, deleteMetadata = reflect.deleteMetadata;
            var metadataOwner = new _WeakMap();
            var provider = {
                isProviderFor: function (O, P) {
                    var metadataPropertySet = metadataOwner.get(O);
                    if (!IsUndefined(metadataPropertySet) && metadataPropertySet.has(P)) {
                        return true;
                    }
                    if (getOwnMetadataKeys(O, P).length) {
                        if (IsUndefined(metadataPropertySet)) {
                            metadataPropertySet = new _Set();
                            metadataOwner.set(O, metadataPropertySet);
                        }
                        metadataPropertySet.add(P);
                        return true;
                    }
                    return false;
                },
                OrdinaryDefineOwnMetadata: defineMetadata,
                OrdinaryHasOwnMetadata: hasOwnMetadata,
                OrdinaryGetOwnMetadata: getOwnMetadata,
                OrdinaryOwnMetadataKeys: getOwnMetadataKeys,
                OrdinaryDeleteMetadata: deleteMetadata,
            };
            return provider;
        }
        /**
         * Gets the metadata provider for an object. If the object has no metadata provider and this is for a create operation,
         * then this module's metadata provider is assigned to the object.
         */
        function GetMetadataProvider(O, P, Create) {
            var registeredProvider = metadataRegistry.getProvider(O, P);
            if (!IsUndefined(registeredProvider)) {
                return registeredProvider;
            }
            if (Create) {
                if (metadataRegistry.setProvider(O, P, metadataProvider)) {
                    return metadataProvider;
                }
                throw new Error("Illegal state.");
            }
            return undefined;
        }
        // naive Map shim
        function CreateMapPolyfill() {
            var cacheSentinel = {};
            var arraySentinel = [];
            var MapIterator = /** @class */ (function () {
                function MapIterator(keys, values, selector) {
                    this._index = 0;
                    this._keys = keys;
                    this._values = values;
                    this._selector = selector;
                }
                MapIterator.prototype["@@iterator"] = function () { return this; };
                MapIterator.prototype[iteratorSymbol] = function () { return this; };
                MapIterator.prototype.next = function () {
                    var index = this._index;
                    if (index >= 0 && index < this._keys.length) {
                        var result = this._selector(this._keys[index], this._values[index]);
                        if (index + 1 >= this._keys.length) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        }
                        else {
                            this._index++;
                        }
                        return { value: result, done: false };
                    }
                    return { value: undefined, done: true };
                };
                MapIterator.prototype.throw = function (error) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    throw error;
                };
                MapIterator.prototype.return = function (value) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    return { value: value, done: true };
                };
                return MapIterator;
            }());
            var Map = /** @class */ (function () {
                function Map() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                Object.defineProperty(Map.prototype, "size", {
                    get: function () { return this._keys.length; },
                    enumerable: true,
                    configurable: true
                });
                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
                Map.prototype.get = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    return index >= 0 ? this._values[index] : undefined;
                };
                Map.prototype.set = function (key, value) {
                    var index = this._find(key, /*insert*/ true);
                    this._values[index] = value;
                    return this;
                };
                Map.prototype.delete = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    if (index >= 0) {
                        var size = this._keys.length;
                        for (var i = index + 1; i < size; i++) {
                            this._keys[i - 1] = this._keys[i];
                            this._values[i - 1] = this._values[i];
                        }
                        this._keys.length--;
                        this._values.length--;
                        if (SameValueZero(key, this._cacheKey)) {
                            this._cacheKey = cacheSentinel;
                            this._cacheIndex = -2;
                        }
                        return true;
                    }
                    return false;
                };
                Map.prototype.clear = function () {
                    this._keys.length = 0;
                    this._values.length = 0;
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                };
                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
                Map.prototype["@@iterator"] = function () { return this.entries(); };
                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
                Map.prototype._find = function (key, insert) {
                    if (!SameValueZero(this._cacheKey, key)) {
                        this._cacheIndex = -1;
                        for (var i = 0; i < this._keys.length; i++) {
                            if (SameValueZero(this._keys[i], key)) {
                                this._cacheIndex = i;
                                break;
                            }
                        }
                    }
                    if (this._cacheIndex < 0 && insert) {
                        this._cacheIndex = this._keys.length;
                        this._keys.push(key);
                        this._values.push(undefined);
                    }
                    return this._cacheIndex;
                };
                return Map;
            }());
            return Map;
            function getKey(key, _) {
                return key;
            }
            function getValue(_, value) {
                return value;
            }
            function getEntry(key, value) {
                return [key, value];
            }
        }
        // naive Set shim
        function CreateSetPolyfill() {
            var Set = /** @class */ (function () {
                function Set() {
                    this._map = new _Map();
                }
                Object.defineProperty(Set.prototype, "size", {
                    get: function () { return this._map.size; },
                    enumerable: true,
                    configurable: true
                });
                Set.prototype.has = function (value) { return this._map.has(value); };
                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
                Set.prototype.delete = function (value) { return this._map.delete(value); };
                Set.prototype.clear = function () { this._map.clear(); };
                Set.prototype.keys = function () { return this._map.keys(); };
                Set.prototype.values = function () { return this._map.keys(); };
                Set.prototype.entries = function () { return this._map.entries(); };
                Set.prototype["@@iterator"] = function () { return this.keys(); };
                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
                return Set;
            }());
            return Set;
        }
        // naive WeakMap shim
        function CreateWeakMapPolyfill() {
            var UUID_SIZE = 16;
            var keys = HashMap.create();
            var rootKey = CreateUniqueKey();
            return /** @class */ (function () {
                function WeakMap() {
                    this._key = CreateUniqueKey();
                }
                WeakMap.prototype.has = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.has(table, this._key) : false;
                };
                WeakMap.prototype.get = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
                };
                WeakMap.prototype.set = function (target, value) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                    table[this._key] = value;
                    return this;
                };
                WeakMap.prototype.delete = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? delete table[this._key] : false;
                };
                WeakMap.prototype.clear = function () {
                    // NOTE: not a real clear, just makes the previous data unreachable
                    this._key = CreateUniqueKey();
                };
                return WeakMap;
            }());
            function CreateUniqueKey() {
                var key;
                do
                    key = "@@WeakMap@@" + CreateUUID();
                while (HashMap.has(keys, key));
                keys[key] = true;
                return key;
            }
            function GetOrCreateWeakMapTable(target, create) {
                if (!hasOwn.call(target, rootKey)) {
                    if (!create)
                        return undefined;
                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
                }
                return target[rootKey];
            }
            function FillRandomBytes(buffer, size) {
                for (var i = 0; i < size; ++i)
                    buffer[i] = Math.random() * 0xff | 0;
                return buffer;
            }
            function GenRandomBytes(size) {
                if (typeof Uint8Array === "function") {
                    var array = new Uint8Array(size);
                    if (typeof crypto !== "undefined") {
                        crypto.getRandomValues(array);
                    }
                    else if (typeof msCrypto !== "undefined") {
                        msCrypto.getRandomValues(array);
                    }
                    else {
                        FillRandomBytes(array, size);
                    }
                    return array;
                }
                return FillRandomBytes(new Array(size), size);
            }
            function CreateUUID() {
                var data = GenRandomBytes(UUID_SIZE);
                // mark as random - RFC 4122 § 4.4
                data[6] = data[6] & 0x4f | 0x40;
                data[8] = data[8] & 0xbf | 0x80;
                var result = "";
                for (var offset = 0; offset < UUID_SIZE; ++offset) {
                    var byte = data[offset];
                    if (offset === 4 || offset === 6 || offset === 8)
                        result += "-";
                    if (byte < 16)
                        result += "0";
                    result += byte.toString(16).toLowerCase();
                }
                return result;
            }
        }
        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
        function MakeDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }
    });
})(Reflect || (Reflect = {}));


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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************!*\
  !*** ./index.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Animation),
/* harmony export */   Armature: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Armature),
/* harmony export */   Biped: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Biped),
/* harmony export */   Body: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Body),
/* harmony export */   Bone: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Bone),
/* harmony export */   Buffers: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Buffers),
/* harmony export */   Camera: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Camera),
/* harmony export */   Collider: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Collider),
/* harmony export */   CollisionDispatcher: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.CollisionDispatcher),
/* harmony export */   Component: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Component),
/* harmony export */   Cuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Cuboid),
/* harmony export */   Dispatcher: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Dispatcher),
/* harmony export */   Entity: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Entity),
/* harmony export */   Epsilon: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Epsilon),
/* harmony export */   Keyframe: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Keyframe),
/* harmony export */   Light: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Light),
/* harmony export */   Material: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Material),
/* harmony export */   Meshes: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Meshes),
/* harmony export */   Model: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Model),
/* harmony export */   Partition: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Partition),
/* harmony export */   Plane: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Plane),
/* harmony export */   Polygon: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Polygon),
/* harmony export */   Pool: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Pool),
/* harmony export */   Programs: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Programs),
/* harmony export */   Ray: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Ray),
/* harmony export */   Register: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Register),
/* harmony export */   RenderPass: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.RenderPass),
/* harmony export */   RenderTarget: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.RenderTarget),
/* harmony export */   Renderer: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Renderer),
/* harmony export */   RotationKeyframe: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.RotationKeyframe),
/* harmony export */   Samplers: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Samplers),
/* harmony export */   ScaleKeyframe: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.ScaleKeyframe),
/* harmony export */   Scene: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Scene),
/* harmony export */   Serializable: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Serializable),
/* harmony export */   Serialize: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Serialize),
/* harmony export */   Shaders: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Shaders),
/* harmony export */   Sphere: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Sphere),
/* harmony export */   State: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.State),
/* harmony export */   Surface: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Surface),
/* harmony export */   Textures: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Textures),
/* harmony export */   Transform: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Transform),
/* harmony export */   TranslationKeyframe: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.TranslationKeyframe),
/* harmony export */   Uniform: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Uniform),
/* harmony export */   Volume: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Volume),
/* harmony export */   Weight: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Weight),
/* harmony export */   collideCuboidWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideCuboidWithCuboid),
/* harmony export */   collidePlaneWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePlaneWithCuboid),
/* harmony export */   collidePlaneWithSphere: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePlaneWithSphere),
/* harmony export */   collidePolygonWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePolygonWithCuboid),
/* harmony export */   collidePolygonWithSphere: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePolygonWithSphere),
/* harmony export */   collideRayWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideRayWithCuboid),
/* harmony export */   collideRayWithPlane: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideRayWithPlane),
/* harmony export */   collideRayWithRay: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideRayWithRay),
/* harmony export */   collideRayWithSphere: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideRayWithSphere),
/* harmony export */   collideSphereWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideSphereWithCuboid),
/* harmony export */   collideSphereWithSphere: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideSphereWithSphere),
/* harmony export */   getRegisteredClass: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.getRegisteredClass),
/* harmony export */   getUniformProperties: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.getUniformProperties),
/* harmony export */   mat2: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.mat2),
/* harmony export */   mat3: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.mat3),
/* harmony export */   mat4: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.mat4),
/* harmony export */   quat: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.quat),
/* harmony export */   vec2: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.vec2),
/* harmony export */   vec3: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.vec3),
/* harmony export */   vec4: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.vec4)
/* harmony export */ });
/* harmony import */ var _modules__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules */ "./modules/index.ts");


})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87Ozs7Ozs7Ozs7Ozs7OztBQ1ZBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ0EsNkNBQTZDLFFBQVE7QUFDckQ7QUFDQTtBQUNBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ3lEO0FBQ2xELHdCQUF3Qix3REFBWTtBQUMzQztBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNmQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDMEM7QUFDTjtBQUNOO0FBQzlCLGdDQUFnQyx1Q0FBSTtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE1BQU07QUFDdEIsUUFBUSw4Q0FBSTtBQUNaO0FBQ0E7QUFDQTtBQUNBLElBQUksd0RBQVE7QUFDWjtBQUNpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6QmpCLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ0EsNkNBQTZDLFFBQVE7QUFDckQ7QUFDQTtBQUNBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ3NDO0FBQ2U7QUFDWDtBQUNEO0FBQ3pDLDhCQUE4QixpREFBUztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixhQUFhLElBQUk7QUFDbkM7QUFDQTtBQUNBLHFCQUFxQiw4Q0FBSTtBQUN6QixzQkFBc0IsOENBQUk7QUFDMUIsOEJBQThCLDhDQUFJO0FBQ2xDLCtCQUErQiw4Q0FBSTtBQUNuQyxpQ0FBaUMsOENBQUk7QUFDckM7QUFDQTtBQUNBLGdCQUFnQixTQUFTO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsZUFBZTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLDhDQUFJO0FBQ2pDO0FBQ0Esa0NBQWtDLDhDQUFJO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGlCQUFpQjtBQUNqQztBQUNBO0FBQ0EscUJBQXFCLDhDQUFJO0FBQ3pCO0FBQ0E7QUFDQSx3Q0FBd0MsOENBQUk7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYiw4QkFBOEIsZ0RBQU07QUFDcEM7QUFDQTtBQUNBLElBQUksd0RBQVE7QUFDWjtBQUNBO0FBQ2dCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNUZoQixrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUM4RDtBQUNwQjtBQUNEO0FBQ3pDLGtDQUFrQyxpREFBUztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQiw4Q0FBSTtBQUN6QixxQkFBcUIsOENBQUk7QUFDekIsMEJBQTBCLDhDQUFJO0FBQzlCLDJCQUEyQiw4Q0FBSTtBQUMvQiwrQkFBK0IsOENBQUk7QUFDbkM7QUFDQSxnQkFBZ0IsY0FBYztBQUM5QjtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFJO0FBQ1o7QUFDQSxRQUFRLDhDQUFJO0FBQ1o7QUFDQSxRQUFRLDhDQUFJO0FBQ1o7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUksdURBQU87QUFDWCxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx1REFBTztBQUNYLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7QUFDQTtBQUNBLElBQUksdURBQU87QUFDWDtBQUNBO0FBQ0E7QUFDQSxJQUFJLHVEQUFPO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsSUFBSSx1REFBTztBQUNYO0FBQ0E7QUFDQTtBQUNBLElBQUksdURBQU87QUFDWDtBQUNBO0FBQ0E7QUFDQSxJQUFJLHdEQUFRO0FBQ1o7QUFDa0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuRWxCLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ0EsNkNBQTZDLFFBQVE7QUFDckQ7QUFDQTtBQUNBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQzhEO0FBQ3BCO0FBQ1I7QUFDbEMsZ0NBQWdDLDJDQUFNO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSw4Q0FBSTtBQUNoQixzQkFBc0IsOENBQUk7QUFDMUIsb0JBQW9CLDhDQUFJO0FBQ3hCLHdCQUF3Qiw4Q0FBSTtBQUM1QixxQkFBcUIsOENBQUk7QUFDekI7QUFDQTtBQUNBLCtCQUErQiw4Q0FBSTtBQUNuQyw2QkFBNkIsOENBQUk7QUFDakMsc0NBQXNDLDhDQUFJO0FBQzFDLGtDQUFrQyw4Q0FBSTtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx1REFBTztBQUNYLElBQUkseURBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHVEQUFPO0FBQ1gsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUksdURBQU87QUFDWCxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx1REFBTztBQUNYLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7QUFDQTtBQUNBLElBQUksdURBQU87QUFDWDtBQUNBO0FBQ0E7QUFDQSxJQUFJLHVEQUFPO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsSUFBSSx1REFBTztBQUNYO0FBQ0E7QUFDQTtBQUNBLElBQUksd0RBQVE7QUFDWjtBQUNBO0FBQ2lCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUVqQixrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUN5RTtBQUNYO0FBQ3JCO0FBQ3pDLGdDQUFnQyxpREFBUztBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQ7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUyxDQUFDLG1EQUFRO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVMsQ0FBQyxvREFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTLENBQUMsbURBQVE7QUFDdEI7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUyxDQUFDLG9EQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBLElBQUksdURBQU87QUFDWDtBQUNBO0FBQ0E7QUFDQSxJQUFJLHdEQUFRO0FBQ1o7QUFDaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvRGpCLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ0EsNkNBQTZDLFFBQVE7QUFDckQ7QUFDQTtBQUNBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQzJDO0FBQ0g7QUFDQTtBQUNqQyxxQkFBcUIsaURBQVM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUyxDQUFDLGlEQUFTO0FBQ3ZCO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3JDZ0M7QUFDRTtBQUNNO0FBQ0E7QUFDQztBQUNFO0FBQ0E7QUFDQTtBQUNFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1I3QyxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUM2RDtBQUNKO0FBQ3JCO0FBQ0Y7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLG9CQUFvQix3REFBWTtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsOENBQUk7QUFDL0IsdUNBQXVDLDZEQUFtQjtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsZ0NBQWdDLGdDQUFnQztBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxnQ0FBZ0M7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsOENBQUk7QUFDckM7QUFDQTtBQUNBO0FBQ0EsWUFBWSw4Q0FBSTtBQUNoQjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsbUJBQW1CO0FBQzNDO0FBQ0EsZ0NBQWdDLG1CQUFtQjtBQUNuRDtBQUNBO0FBQ0E7QUFDQSxtREFBbUQsOEJBQThCO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxrQ0FBa0M7QUFDckY7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDhDQUFJLHlDQUF5Qyw4Q0FBSTtBQUNwRTtBQUNBLHdCQUF3Qiw4Q0FBSSxrREFBa0QsOENBQUk7QUFDbEYsZ0JBQWdCLDhDQUFJO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQiw4Q0FBSTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLG9CQUFvQjtBQUMvRDtBQUNBLGtDQUFrQyw0Q0FBNEM7QUFDOUU7QUFDQTtBQUNBLDJCQUEyQiw4Q0FBSSx5Q0FBeUMsOENBQUk7QUFDNUUseUNBQXlDLDhDQUFJLHdCQUF3Qiw4Q0FBSSxtQ0FBbUMsOENBQUksU0FBUyw4Q0FBSTtBQUM3SCxnQ0FBZ0MsOENBQUkseUNBQXlDLDhDQUFJO0FBQ2pGO0FBQ0Esc0JBQXNCLDhDQUFJLHdCQUF3Qiw4Q0FBSSxtQ0FBbUMsOENBQUksU0FBUyw4Q0FBSTtBQUMxRztBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsOENBQUksa0RBQWtELDhDQUFJO0FBQ2hGLHNCQUFzQiw4Q0FBSSxVQUFVLDhDQUFJLDZCQUE2Qiw4Q0FBSTtBQUN6RSw0Q0FBNEMsOENBQUk7QUFDaEQ7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQSxnQ0FBZ0MsOENBQUksNEJBQTRCLDhDQUFJLHdDQUF3Qyw4Q0FBSTtBQUNoSDtBQUNBLG1GQUFtRiw4Q0FBSTtBQUN2RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyw4Q0FBSSwwQkFBMEIsOENBQUk7QUFDN0Usa0RBQWtELDhDQUFJLGlEQUFpRCw4Q0FBSSxhQUFhLDhDQUFJO0FBQzVILHVDQUF1Qyw4Q0FBSTtBQUMzQztBQUNBO0FBQ0EsMkNBQTJDLDhDQUFJLDBCQUEwQiw4Q0FBSTtBQUM3RSxrREFBa0QsOENBQUksaURBQWlELDhDQUFJLGFBQWEsOENBQUk7QUFDNUgsdUNBQXVDLDhDQUFJO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsOENBQUksMkNBQTJDLDhDQUFJO0FBQzdGO0FBQ0EsbURBQW1ELDhDQUFJLHdDQUF3Qyw4Q0FBSTtBQUNuRywwRUFBMEUsOENBQUksOEJBQThCLDhDQUFJLFNBQVMsOENBQUk7QUFDN0g7QUFDQTtBQUNBO0FBQ0EsOENBQThDLDhDQUFJLHdDQUF3Qyw4Q0FBSTtBQUM5RiwwRUFBMEUsOENBQUksOEJBQThCLDhDQUFJLFNBQVMsOENBQUk7QUFDN0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLDhDQUFJO0FBQ3RDO0FBQ0EsMERBQTBEO0FBQzFELG9EQUFvRDtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRCw4Q0FBSSxpQ0FBaUMsOENBQUk7QUFDN0Y7QUFDQSwyREFBMkQsOENBQUksMENBQTBDLDhDQUFJO0FBQzdHLGtGQUFrRiw4Q0FBSSxnQ0FBZ0MsOENBQUksU0FBUyw4Q0FBSTtBQUN2STtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsOENBQUksMENBQTBDLDhDQUFJO0FBQ3hHLGtGQUFrRiw4Q0FBSSxnQ0FBZ0MsOENBQUksU0FBUyw4Q0FBSTtBQUN2STtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxvQkFBb0I7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixpQ0FBaUM7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLDhDQUFJLDhDQUE4Qyw4Q0FBSTtBQUNyRjtBQUNBO0FBQ0EsMkNBQTJDLDhDQUFJLHNDQUFzQyw4Q0FBSTtBQUN6RjtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsOENBQUksc0NBQXNDLDhDQUFJO0FBQ3pGO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxvQkFBb0I7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxpQkFBaUI7QUFDbkQ7QUFDQTtBQUNBLCtCQUErQiw4Q0FBSSx5Q0FBeUMsOENBQUk7QUFDaEY7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsOENBQUkseUNBQXlDLDhDQUFJO0FBQ2hGO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiLDhCQUE4Qiw4Q0FBSTtBQUNsQztBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVMsQ0FBQywyQ0FBTTtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTLENBQUMsa0RBQVE7QUFDdEI7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMVlBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ0EsNkNBQTZDLFFBQVE7QUFDckQ7QUFDQTtBQUNBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ2tFO0FBQ1o7QUFDL0Msd0JBQXdCLHdEQUFZO0FBQzNDLFlBQVksOENBQUk7QUFDaEIsZUFBZSw4Q0FBSTtBQUNuQixrQkFBa0IsOENBQUk7QUFDdEIsb0JBQW9CLDhDQUFJO0FBQ3hCLHNCQUFzQiw4Q0FBSTtBQUMxQix1QkFBdUIsOENBQUk7QUFDM0IseUJBQXlCLDhDQUFJO0FBQzdCO0FBQ0Esa0JBQWtCLGNBQWMsOENBQUksa0JBQWtCLDhDQUFJLG1CQUFtQiw4Q0FBSSxPQUFPLElBQUk7QUFDNUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBSTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7QUFDQTtBQUNBLElBQUksdURBQU87QUFDWDtBQUNBO0FBQ0E7QUFDQSxJQUFJLHVEQUFPO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsSUFBSSx1REFBTztBQUNYO0FBQ0E7QUFDQTtBQUNBLElBQUksdURBQU87QUFDWDtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1RHlDO0FBQ007QUFDSjtBQUNFO0FBQ0E7QUFDRTtBQUNBO0FBQ0E7QUFDRjtBQUNJO0FBQ0o7QUFDRTtBQUNBO0FBQ0U7QUFDQTtBQUNWO0FBQ0k7QUFDMEQ7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqQjlGO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxPQUFPO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLFNBQVM7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIscUJBQXFCO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4R0Esc0JBQXNCO0FBQ3RCO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGdCQUFnQixjQUFjO0FBQzlCLGdCQUFnQixvQ0FBb0M7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFELFNBQVM7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQy9HTztBQUNQO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsMEJBQTBCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQywrQkFBK0I7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLGtDQUFrQztBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsSUFBSTtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDekxPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2RE87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLE9BQU8sSUFBSSxPQUFPO0FBQzlDLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQixVQUFVLElBQUksS0FBSztBQUNsRCxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDeENPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsS0FBSztBQUNyQjtBQUNBLGdCQUFnQix5REFBeUQ7QUFDekUsZ0JBQWdCLDBEQUEwRDtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0VBQXNFLFVBQVU7QUFDaEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0VBQXNFLFVBQVU7QUFDaEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0VBQXNFLFVBQVU7QUFDaEY7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyREFBMkQsT0FBTztBQUNsRTtBQUNBO0FBQ0EsZ0JBQWdCLDJDQUEyQztBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyREFBMkQsT0FBTztBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLEtBQUs7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsMkNBQTJDO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLEtBQUs7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3hJQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUN5RDtBQUN5QjtBQUMzRSx3QkFBd0Isd0RBQVk7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVMsQ0FBQyxvREFBYTtBQUMzQjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTLENBQUMsdURBQWdCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVMsQ0FBQywwREFBbUI7QUFDakM7QUFDQTtBQUNPLHdCQUF3Qix3REFBWTtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3REEsa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDQSw2Q0FBNkMsUUFBUTtBQUNyRDtBQUNBO0FBQ0Esa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDeUQ7QUFDM0I7QUFDdkIsdUJBQXVCLHdEQUFZO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxNQUFNO0FBQ2hFO0FBQ0Esc0RBQXNELGFBQWEsV0FBVyxVQUFVO0FBQ3hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUyxDQUFDLHVDQUFJO0FBQ2xCO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4Q0Esa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDQSw2Q0FBNkMsUUFBUTtBQUNyRDtBQUNBO0FBQ0Esa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDeUQ7QUFDVDtBQUNWO0FBQy9CLG1CQUFtQix3REFBWTtBQUN0QztBQUNBO0FBQ0EsV0FBVyw4Q0FBSTtBQUNmLFdBQVcsOENBQUk7QUFDZixpQkFBaUIsOENBQUk7QUFDckI7QUFDQTtBQUNBLGlCQUFpQiw4Q0FBSTtBQUNyQixrQkFBa0IsOENBQUk7QUFDdEIsd0JBQXdCLDhDQUFJO0FBQzVCLGtCQUFrQix1Q0FBdUMsSUFBSTtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsMENBQTBDLFFBQVE7QUFDbEQ7QUFDQSxnQkFBZ0IsK0JBQStCO0FBQy9DLFFBQVEsOENBQUk7QUFDWjtBQUNBLG9CQUFvQixhQUFhO0FBQ2pDLFlBQVksOENBQUk7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyREFBMkQsVUFBVTtBQUNyRTtBQUNBLGdCQUFnQixPQUFPO0FBQ3ZCLGdCQUFnQiwrQkFBK0I7QUFDL0MsbUJBQW1CLGdEQUFTO0FBQzVCLHNFQUFzRSw4Q0FBSTtBQUMxRSxnRUFBZ0UsOENBQUk7QUFDcEUsMERBQTBELDhDQUFJO0FBQzlELFNBQVM7QUFDVDtBQUNBO0FBQ0Esd0JBQXdCLDBCQUEwQjtBQUNsRCxvQkFBb0Isc0JBQXNCO0FBQzFDLG9CQUFvQixzQkFBc0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixnREFBUztBQUM1QjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxtQkFBbUIsZ0RBQVM7QUFDNUI7QUFDQTtBQUNBLDRCQUE0Qiw4Q0FBSTtBQUNoQyxzQkFBc0IsOENBQUk7QUFDMUI7QUFDQTtBQUNBLDRCQUE0Qiw4Q0FBSTtBQUNoQyxzQkFBc0IsOENBQUk7QUFDMUIsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFlBQVksOENBQUk7QUFDaEIsU0FBUztBQUNULG1CQUFtQixnREFBUyxHQUFHLDhCQUE4QjtBQUM3RDtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hJQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUN5RDtBQUNmO0FBQ25DLHVCQUF1Qix3REFBWTtBQUMxQztBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNPO0FBQ1AsWUFBWSw4Q0FBSTtBQUNoQjtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiLDhCQUE4Qiw4Q0FBSTtBQUNsQztBQUNPO0FBQ1AsWUFBWSw4Q0FBSTtBQUNoQjtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiLDhCQUE4Qiw4Q0FBSTtBQUNsQztBQUNPO0FBQ1AsWUFBWSw4Q0FBSTtBQUNoQjtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiLDhCQUE4Qiw4Q0FBSTtBQUNsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUN1RDtBQUNDO0FBQ3BCO0FBQzdCLHVCQUF1Qix3REFBWTtBQUMxQyxZQUFZLDhDQUFJO0FBQ2hCO0FBQ0E7QUFDQSxrQkFBa0IsaUJBQWlCLElBQUk7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHVEQUFPO0FBQ1gsSUFBSSxzRUFBUztBQUNiLDhCQUE4Qiw4Q0FBSTtBQUNsQztBQUNBO0FBQ0EsSUFBSSxzRUFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUksdURBQU87QUFDWDtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3RDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNzRTtBQUMvRCx3QkFBd0IscUVBQVk7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHNFQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSxzRUFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUksc0VBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHNFQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSxzRUFBUztBQUNiO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6Q0Esa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDQSw2Q0FBNkMsUUFBUTtBQUNyRDtBQUNBO0FBQ0Esa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDb0M7QUFDSjtBQUN5QjtBQUNsRCx5QkFBeUIsd0RBQVk7QUFDNUMsaUJBQWlCLDhDQUFJO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiLDhCQUE4Qiw4Q0FBSTtBQUNsQztBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ25FNEQ7QUFDaEI7QUFDRTtBQUNFO0FBQ0E7QUFDRjtBQUNFO0FBQ2hCO0FBQ007QUFDZ0I7QUFDL0M7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIseUNBQUs7QUFDOUIsMEJBQTBCLG9EQUFNO0FBQ2hDLDJCQUEyQixzREFBTztBQUNsQywyQkFBMkIsc0RBQU87QUFDbEMsNEJBQTRCLHdEQUFRO0FBQ3BDLDRCQUE0Qix3REFBUTtBQUNwQyw0QkFBNEIsd0RBQVE7QUFDcEM7QUFDQSxxREFBcUQsbUJBQW1CO0FBQ3hFLG1DQUFtQywrQ0FBUSxHQUFHLDhCQUE4QjtBQUM1RTtBQUNBO0FBQ0EsZ0JBQWdCLDZCQUE2QjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxjQUFjO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSx1QkFBdUI7QUFDbkM7QUFDQTtBQUNBLG9CQUFvQixhQUFhO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw4Q0FBOEM7QUFDbEU7QUFDQSxxQkFBcUIsZ0RBQWdEO0FBQ3JFLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxPQUFPLEdBQUcsSUFBSTtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxvRUFBb0IsQ0FBQyw2Q0FBTSxhQUFhLEtBQUs7QUFDekQ7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFlBQVksb0VBQW9CLENBQUMsZ0RBQVMsYUFBYSxLQUFLO0FBQzVEO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxZQUFZLG9FQUFvQixDQUFDLDRDQUFLLGFBQWEsS0FBSztBQUN4RDtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksb0VBQW9CLENBQUMsNENBQUssYUFBYSxLQUFLO0FBQ3hEO0FBQ0EsYUFBYTtBQUNiO0FBQ0Esd0NBQXdDLFVBQVU7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLFdBQVc7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsb0VBQW9CLENBQUMsK0NBQVEsd0JBQXdCLEtBQUs7QUFDcEYsNkNBQTZDLElBQUk7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsSUFBSTtBQUNyQixhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxPQUFPLEdBQUcsS0FBSztBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLFlBQVksR0FBRyxNQUFNO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDN0xPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0RkEsa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDQSw2Q0FBNkMsUUFBUTtBQUNyRDtBQUNBO0FBQ0Esa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDeUQ7QUFDbEQsc0JBQXNCLHdEQUFZO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isc0JBQXNCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQzNFTztBQUNQO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQiw0QkFBNEI7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNUQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUN5RDtBQUNsRCxxQkFBcUIsd0RBQVk7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5REFBUztBQUNiO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxQnVCO0FBQ0k7QUFDRDtBQUNBO0FBQ0U7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDSjVCLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ0EsNkNBQTZDLFFBQVE7QUFDckQ7QUFDQTtBQUNBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ3VEO0FBQ2hELHVCQUF1QixvREFBWTtBQUMxQztBQUNBO0FBQ0EsSUFBSSxxREFBUztBQUNiO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNmQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNxRDtBQUNqQjtBQUNHO0FBQ3ZDLGdDQUFnQywrQ0FBUTtBQUN4QztBQUNBLGFBQWEsOENBQUk7QUFDakI7QUFDQSxrQkFBa0IsU0FBUyw4Q0FBSSxvQkFBb0IsSUFBSTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSw4Q0FBSTtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2IsOEJBQThCLDhDQUFJO0FBQ2xDO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx3REFBUTtBQUNaO0FBQ0E7QUFDaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyQ2pCLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ0EsNkNBQTZDLFFBQVE7QUFDckQ7QUFDQTtBQUNBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ29DO0FBQ0c7QUFDYztBQUNyRCxvQ0FBb0MsK0NBQVE7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsZ0JBQWdCLElBQUk7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSw4Q0FBSTtBQUNoQixZQUFZLDhDQUFJO0FBQ2hCLFlBQVksOENBQUk7QUFDaEI7QUFDQSxzQkFBc0IsOENBQUk7QUFDMUIsc0JBQXNCLDhDQUFJO0FBQzFCLHNCQUFzQiw4Q0FBSTtBQUMxQjtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx3REFBUTtBQUNaO0FBQ0E7QUFDbUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6Q25CLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ0EsNkNBQTZDLFFBQVE7QUFDckQ7QUFDQTtBQUNBLGtCQUFrQixTQUFJLElBQUksU0FBSTtBQUM5QjtBQUNBO0FBQ3FEO0FBQ2pCO0FBQ0c7QUFDdkMsNEJBQTRCLCtDQUFRO0FBQ3BDO0FBQ0EsYUFBYSw4Q0FBSTtBQUNqQixnQkFBZ0IsOENBQUk7QUFDcEIsa0JBQWtCLFNBQVMsOENBQUksbUJBQW1CLDhDQUFJLE1BQU0sSUFBSTtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2IsOEJBQThCLDhDQUFJO0FBQ2xDO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2IsOEJBQThCLDhDQUFJO0FBQ2xDO0FBQ0E7QUFDQSxJQUFJLHdEQUFRO0FBQ1o7QUFDQTtBQUNlOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2xDOEI7QUFDN0M7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLDhDQUFJO0FBQzFCO0FBQ0EscUJBQXFCLDhDQUFJO0FBQ3pCLGlCQUFpQiw4Q0FBSTtBQUNyQixpQkFBaUIsOENBQUk7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDhDQUFJO0FBQ3ZCLHVCQUF1Qiw4Q0FBSSxhQUFhLDhDQUFJO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGVBQWUsOENBQUksaUJBQWlCLDhDQUFJLEtBQUssOENBQUksd0JBQXdCLDhDQUFJLG9DQUFvQyw4Q0FBSTtBQUNySCxlQUFlLDhDQUFJLGlCQUFpQiw4Q0FBSSxLQUFLLDhDQUFJLHdCQUF3Qiw4Q0FBSSxvQ0FBb0MsOENBQUk7QUFDckgsZUFBZSw4Q0FBSSxpQkFBaUIsOENBQUksS0FBSyw4Q0FBSSx3QkFBd0IsOENBQUksb0NBQW9DLDhDQUFJO0FBQ3JILGVBQWUsOENBQUksaUJBQWlCLDhDQUFJLEtBQUssOENBQUksd0JBQXdCLDhDQUFJLG9DQUFvQyw4Q0FBSTtBQUNySDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsOENBQUk7QUFDM0Isb0JBQW9CLGlCQUFpQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixpREFBTztBQUNyQyw4QkFBOEIsaURBQU87QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qiw4Q0FBSTtBQUMzQix3QkFBd0IsOENBQUksUUFBUSw4Q0FBSSwwQkFBMEIsOENBQUk7QUFDdEU7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLDhDQUFJO0FBQzNCLHdCQUF3Qiw4Q0FBSSxRQUFRLDhDQUFJLDBCQUEwQiw4Q0FBSTtBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsOENBQUk7QUFDbkIsY0FBYyw4Q0FBSTtBQUNsQixjQUFjLDhDQUFJO0FBQ2xCLGNBQWMsOENBQUk7QUFDbEIsY0FBYyw4Q0FBSTtBQUNsQixjQUFjLDhDQUFJO0FBQ2xCO0FBQ0E7QUFDQSwwQkFBMEIsaURBQU87QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsOENBQUksU0FBUyw4Q0FBSTtBQUMvQixjQUFjLDhDQUFJLFNBQVMsOENBQUk7QUFDL0IsV0FBVyw4Q0FBSSxPQUFPLDhDQUFJLDRCQUE0Qiw4Q0FBSTtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0Isa0JBQWtCLDhDQUFJLHVCQUF1QjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLGFBQWE7QUFDekIsc0JBQXNCLDhDQUFJO0FBQzFCLDRCQUE0Qiw4Q0FBSTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLDhDQUFJO0FBQ2xCLHVCQUF1Qiw4Q0FBSTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsaURBQU87QUFDekI7QUFDQSxrQkFBa0IsOENBQUk7QUFDdEI7QUFDQTtBQUNBLDhCQUE4Qiw4Q0FBSTtBQUNsQztBQUNBLHVCQUF1QixpREFBTztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixPQUFPO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsT0FBTztBQUMzQix3QkFBd0IsT0FBTztBQUMvQix5QkFBeUIsOENBQUk7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFJO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0Qiw4Q0FBSTtBQUNoQyxnQkFBZ0IsNENBQTRDO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLE9BQU87QUFDL0Isc0JBQXNCLDhDQUFJO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixnRUFBZ0U7QUFDaEY7QUFDQTtBQUNBLHdCQUF3Qiw4Q0FBSTtBQUM1QjtBQUNBLHdCQUF3Qiw4Q0FBSTtBQUM1QixtQkFBbUIsOENBQUk7QUFDdkIsbUJBQW1CLDhDQUFJO0FBQ3ZCLG1CQUFtQiw4Q0FBSTtBQUN2QixtQkFBbUIsOENBQUk7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLDhDQUFJO0FBQzlCO0FBQ0EsNENBQTRDLDhDQUFJO0FBQ2hELGdDQUFnQyxpREFBTztBQUN2QztBQUNBLGtDQUFrQywyREFBMkQ7QUFDN0Y7QUFDQTtBQUNBO0FBQ0EscURBQXFELDhDQUFJLHVCQUF1Qiw4Q0FBSTtBQUNwRixvQ0FBb0MsOENBQUk7QUFDeEMsWUFBWSw4Q0FBSSxlQUFlLDhDQUFJO0FBQ25DLDhCQUE4QixzRUFBc0U7QUFDcEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsOENBQUk7QUFDdkMsbUNBQW1DLDhDQUFJO0FBQ3ZDLG9DQUFvQyw4Q0FBSTtBQUN4QyxvQ0FBb0MsOENBQUk7QUFDeEMsc0JBQXNCLDhDQUFJLEtBQUssOENBQUksU0FBUyw4Q0FBSSxtRUFBbUUsOENBQUk7QUFDdkgsc0JBQXNCLDhDQUFJLEtBQUssOENBQUksU0FBUyw4Q0FBSSxtRUFBbUUsOENBQUk7QUFDdkgsbUNBQW1DO0FBQ25DLG1DQUFtQztBQUNuQyxtQkFBbUIsOENBQUksWUFBWSw4Q0FBSTtBQUN2QyxtQkFBbUIsOENBQUksWUFBWSw4Q0FBSTtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBLDhEQUE4RCw4Q0FBSTtBQUNsRTtBQUNBO0FBQ0EsMEJBQTBCLGlEQUFpRDtBQUMzRTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3T087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQ7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQm9DO0FBQzdCO0FBQ1AsWUFBWSwrQkFBK0I7QUFDM0MsWUFBWSxrQ0FBa0M7QUFDOUMsNENBQTRDLDhDQUFJO0FBQ2hEO0FBQ0EsdUJBQXVCLDhDQUFJLG9EQUFvRCw4Q0FBSTtBQUNuRiw2QkFBNkIsOENBQUksb0NBQW9DLDhDQUFJO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbEJvQztBQUNwQztBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsOENBQUksa0JBQWtCLDhDQUFJO0FBQ3JFLGVBQWUsOENBQUksa0JBQWtCLDhDQUFJO0FBQ3pDLGVBQWUsOENBQUksa0JBQWtCLDhDQUFJO0FBQ3pDLGFBQWE7QUFDYjtBQUNBO0FBQ0EsY0FBYyw4Q0FBSSxxQkFBcUIsOENBQUk7QUFDM0MsYUFBYSxHQUFHLDhDQUFJLGdCQUFnQiw4Q0FBSTtBQUN4QztBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsaUJBQWlCO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDhDQUFJO0FBQ3ZCLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qiw4Q0FBSSxxQkFBcUI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1Qyw4Q0FBSSxRQUFRLDhDQUFJLHVCQUF1Qiw4Q0FBSSxTQUFTLDhDQUFJO0FBQy9GLGtDQUFrQyw0REFBNEQ7QUFDOUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsOENBQUk7QUFDdkIsbUJBQW1CLDhDQUFJO0FBQ3ZCO0FBQ0E7QUFDQSx5QkFBeUIsOENBQUksc0JBQXNCLDhDQUFJO0FBQ3ZELDBCQUEwQiw4Q0FBSTtBQUM5QjtBQUNBLG9DQUFvQyw4Q0FBSTtBQUN4QztBQUNBLGdDQUFnQyw4Q0FBSSxTQUFTLDhDQUFJLG9CQUFvQiw4Q0FBSSxTQUFTLDhDQUFJO0FBQ3RGO0FBQ0E7QUFDQSwwQ0FBMEMsNkNBQTZDO0FBQ3ZGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3JFb0M7QUFDcEMsUUFBUSxpQkFBaUI7QUFDekI7QUFDQSxlQUFlLDhDQUFJO0FBQ25CLGVBQWUsOENBQUk7QUFDbkI7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLDhDQUFJLEtBQUssOENBQUk7QUFDekMsV0FBVyw4Q0FBSSxTQUFTLDhDQUFJO0FBQzVCO0FBQ0E7QUFDQTtBQUNBLGVBQWUsOENBQUk7QUFDbkIsZUFBZSw4Q0FBSTtBQUNuQixjQUFjLDhDQUFJO0FBQ2xCLGdCQUFnQiw4Q0FBSTtBQUNwQixnQkFBZ0IsOENBQUk7QUFDcEIsaUJBQWlCLDhDQUFJO0FBQ3JCLGlCQUFpQiw4Q0FBSTtBQUNyQixpQkFBaUIsOENBQUk7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLDhDQUFJLFNBQVMsOENBQUksT0FBTyw4Q0FBSSxLQUFLLDhDQUFJLGVBQWUsOENBQUk7QUFDdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLDhDQUFJLEtBQUssOENBQUksc0JBQXNCLDhDQUFJO0FBQ3RELGVBQWUsOENBQUksS0FBSyw4Q0FBSSxzQkFBc0IsOENBQUk7QUFDdEQsZUFBZSw4Q0FBSSxLQUFLLDhDQUFJLHNCQUFzQiw4Q0FBSTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBLHNCQUFzQiw4Q0FBSTtBQUMxQiw0QkFBNEIsOENBQUk7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3hEb0M7QUFDcEM7QUFDTztBQUNQO0FBQ0E7QUFDQSwyQkFBMkIsOENBQUk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTtBQUNBLGlDQUFpQyw4Q0FBSTtBQUNyQyxvQ0FBb0MsOENBQUk7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLDhDQUFJLG9DQUFvQyw4Q0FBSTtBQUN0RSxvQkFBb0IsOENBQUksb0NBQW9DLDhDQUFJO0FBQ2hFO0FBQ0EsYUFBYTtBQUNiOzs7Ozs7Ozs7Ozs7Ozs7OztBQy9Eb0M7QUFDN0I7QUFDUCxZQUFZLHlCQUF5QjtBQUNyQyxZQUFZLDBCQUEwQjtBQUN0QyxjQUFjLDhDQUFJO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQiw4Q0FBSTtBQUN2QjtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsOENBQUksaUJBQWlCLDhDQUFJO0FBQ25ELG9CQUFvQiw4Q0FBSSwyQkFBMkIsOENBQUk7QUFDdkQsYUFBYTtBQUNiOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2ZvQztBQUM3QjtBQUNQLFlBQVksNEJBQTRCO0FBQ3hDLFlBQVksNEJBQTRCO0FBQ3hDLGNBQWMsOENBQUk7QUFDbEIsd0JBQXdCLDhDQUFJO0FBQzVCO0FBQ0E7QUFDQTtBQUNBLGNBQWMsOENBQUk7QUFDbEIsY0FBYyw4Q0FBSTtBQUNsQixjQUFjLDhDQUFJLEtBQUssOENBQUk7QUFDM0I7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLDhDQUFJLFNBQVMsOENBQUksa0JBQWtCLDhDQUFJLFNBQVMsOENBQUk7QUFDekUscUJBQXFCLDhDQUFJLFNBQVMsOENBQUksb0JBQW9CLDhDQUFJLFNBQVMsOENBQUk7QUFDM0UsbUJBQW1CLDhDQUFJO0FBQ3ZCLHFCQUFxQiw4Q0FBSSxLQUFLLDhDQUFJO0FBQ2xDLGFBQWE7QUFDYjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNwQm9DO0FBQ3BDLFFBQVEsT0FBTztBQUNSO0FBQ1AsWUFBWSwwQkFBMEI7QUFDdEMsWUFBWSx1QkFBdUI7QUFDbkM7QUFDQSxjQUFjLDhDQUFJO0FBQ2xCLGNBQWMsOENBQUk7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQiw4Q0FBSSx3QkFBd0IsOENBQUk7QUFDMUQsb0JBQW9CLDhDQUFJLDJCQUEyQiw4Q0FBSTtBQUN2RCxpQkFBaUIsOENBQUksMEJBQTBCLDhDQUFJO0FBQ25EO0FBQ0EsaUJBQWlCLDhDQUFJLGtCQUFrQiw4Q0FBSTtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3Qm9DO0FBQ3BDO0FBQ087QUFDUDtBQUNBO0FBQ0EscUJBQXFCLDhDQUFJO0FBQ3pCO0FBQ0E7QUFDQSxvQkFBb0IsT0FBTztBQUMzQjtBQUNBLDJCQUEyQiw4Q0FBSTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsOENBQUksb0NBQW9DLDhDQUFJO0FBQ3pFLFFBQVEsOENBQUk7QUFDWjtBQUNBLG1CQUFtQiw4Q0FBSTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixPQUFPO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsOENBQUksb0JBQW9CLDhDQUFJLGdDQUFnQyw4Q0FBSSxTQUFTLDhDQUFJO0FBQ2pHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3BFb0M7QUFDN0I7QUFDUCxZQUFZLHlCQUF5QjtBQUNyQyxZQUFZLHlCQUF5QjtBQUNyQyxrQkFBa0IsOENBQUk7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLDhDQUFJLGdDQUFnQyw4Q0FBSSxNQUFNLDhDQUFJO0FBQ3BGLDBCQUEwQiw4Q0FBSSx1QkFBdUIsOENBQUk7QUFDekQsb0JBQW9CLDhDQUFJLDRCQUE0Qiw4Q0FBSTtBQUN4RCxhQUFhO0FBQ2I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDZjRDO0FBQzBCO0FBQ0Y7QUFDQTtBQUNFO0FBQ0U7QUFDQTtBQUNqRSxrQ0FBa0Msc0RBQVU7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5Qyw0RUFBc0I7QUFDL0QseUNBQXlDLDRFQUFzQjtBQUMvRDtBQUNBLDJDQUEyQyxnRkFBd0I7QUFDbkUsMkNBQTJDLGdGQUF3QjtBQUNuRTtBQUNBO0FBQ0EsMENBQTBDLDhFQUF1QjtBQUNqRTtBQUNBLDBDQUEwQyw4RUFBdUI7QUFDakU7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzQmtDO0FBQ0k7QUFDQTtBQUNJO0FBQ0k7QUFDSjtBQUNBO0FBQ29CO0FBQ0w7QUFDSTtBQUNFO0FBQ0E7QUFDSTtBQUNBO0FBQ0U7QUFDQTtBQUNFO0FBQ0E7QUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2xCckUsa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDQSw2Q0FBNkMsUUFBUTtBQUNyRDtBQUNBO0FBQ0Esa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDMkM7QUFDRDtBQUNKO0FBQy9CLHFCQUFxQiwrQ0FBUTtBQUNwQyxhQUFhLDhDQUFJO0FBQ2pCO0FBQ0E7QUFDQSxrQkFBa0IsU0FBUyw4Q0FBSSxRQUFRLElBQUk7QUFDM0M7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLDhDQUFJO0FBQ3RDO0FBQ0E7QUFDQSxnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqQ0Esa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDQSw2Q0FBNkMsUUFBUTtBQUNyRDtBQUNBO0FBQ0Esa0JBQWtCLFNBQUksSUFBSSxTQUFJO0FBQzlCO0FBQ0E7QUFDcUQ7QUFDakI7QUFDRDtBQUNuQyxrQ0FBa0MsMkNBQU07QUFDeEM7QUFDQTtBQUNBLFVBQVU7QUFDVixrQkFBa0IsU0FBUyw4Q0FBSSxpQkFBaUIsOENBQUksT0FBTyxJQUFJO0FBQy9ELGdCQUFnQixRQUFRO0FBQ3hCO0FBQ0Esb0JBQW9CLDhDQUFJLGtDQUFrQztBQUMxRDtBQUNBO0FBQ0EsZ0JBQWdCLHdCQUF3QjtBQUN4QztBQUNBLFFBQVEsOENBQUk7QUFDWjtBQUNBLFFBQVEsOENBQUk7QUFDWjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsZ0JBQWdCLGlCQUFpQjtBQUNqQyxnQkFBZ0IsVUFBVTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLHNCQUFzQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQiw4Q0FBSTtBQUMvQjtBQUNBLFlBQVksOENBQUksYUFBYSw4Q0FBSSx3Q0FBd0M7QUFDekUsWUFBWSw4Q0FBSSxhQUFhLDhDQUFJLHdDQUF3QztBQUN6RSxZQUFZLDhDQUFJLGFBQWEsOENBQUksd0NBQXdDO0FBQ3pFO0FBQ0EsbUJBQW1CLDhDQUFJO0FBQ3ZCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkseURBQVM7QUFDYiw4QkFBOEIsOENBQUk7QUFDbEM7QUFDQTtBQUNBLElBQUksd0RBQVE7QUFDWjtBQUNBO0FBQ2tCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDekZsQixrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNBLDZDQUE2QyxRQUFRO0FBQ3JEO0FBQ0E7QUFDQSxrQkFBa0IsU0FBSSxJQUFJLFNBQUk7QUFDOUI7QUFDQTtBQUNxRDtBQUNqQjtBQUNEO0FBQ25DLGtDQUFrQywyQ0FBTTtBQUN4QztBQUNBO0FBQ0Esa0JBQWtCLFNBQVMsOENBQUksc0JBQXNCLElBQUk7QUFDekQsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGNBQWM7QUFDOUIsUUFBUSw4Q0FBSTtBQUNaO0FBQ0E7QUFDQSxnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsSUFBSSx3REFBUTtBQUNaO0FBQ0E7QUFDa0I7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0Q1g7QUFDUDtBQUNBO0FBQ0EsOEJBQThCLFVBQVUsR0FBRyxVQUFVO0FBQ3JEO0FBQ0E7QUFDQSxxQkFBcUIsV0FBVyxHQUFHLFdBQVc7QUFDOUM7QUFDQTtBQUNBLHFCQUFxQixXQUFXLEdBQUcsV0FBVztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakI4QjtBQUNZO0FBQ2U7QUFDQztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDSjFELFFBQVEsT0FBTztBQUNSO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLFVBQVU7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNSMEI7QUFDc0I7QUFDaEQ7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixzQkFBc0I7QUFDaEQ7QUFDQTtBQUNBLFFBQVEsVUFBVTtBQUNsQjtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsS0FBSztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLElBQUk7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsSUFBSTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLHVCQUF1QjtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsNkRBQWtCO0FBQ2xDLDhCQUE4Qiw2REFBa0I7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsNkRBQWtCO0FBQzFDLHdDQUF3Qyw2REFBa0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsNkRBQWtCO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsNkRBQWtCO0FBQzFDLHlDQUF5Qyw2REFBa0I7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsNkRBQWtCO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDNUhBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsV0FBVztBQUNyQztBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2Qk87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBdUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDUTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUEE7QUFDUjtBQUN2QjtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsK0NBQU87QUFDckMsd0JBQXdCLE9BQU87QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDN0pzQztBQUNSO0FBQ0E7QUFDQTtBQUN2QjtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsT0FBTztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsK0NBQU87QUFDckMsd0JBQXdCLE9BQU87QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLFVBQVU7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLHVDQUFJO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQix1Q0FBSTtBQUN0QixrQkFBa0IsdUNBQUk7QUFDdEIsa0JBQWtCLHVDQUFJO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzNXc0M7QUFDUjtBQUNBO0FBQ0E7QUFDdkI7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsUUFBUTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsK0NBQU87QUFDckMsd0JBQXdCLFFBQVE7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQSxnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0EsZ0JBQWdCLFVBQVU7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsVUFBVTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLFNBQVM7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0RBQW9ELHVDQUFJO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLHVDQUFJO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQix1Q0FBSTtBQUN0QixrQkFBa0IsdUNBQUk7QUFDdEIsa0JBQWtCLHVDQUFJO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzdrQnNDO0FBQ1I7QUFDQTtBQUNBO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQiwrQ0FBTztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0EsZ0JBQWdCLFVBQVU7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0EsZ0JBQWdCLGFBQWE7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsK0NBQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsK0NBQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN6WnNDO0FBQ3RDLFFBQVEsc0JBQXNCO0FBQ3ZCO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLCtDQUFPO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOVJzQztBQUN0QyxRQUFRLHNCQUFzQjtBQUN2QjtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsK0NBQU87QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaFhzQztBQUN0QyxRQUFRLHNCQUFzQjtBQUN2QjtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsK0NBQU87QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGFBQWE7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ3RUQTtBQUNBO0FBQ0EsZ0VBQWdFO0FBQ2hFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHFCQUFNLGdCQUFnQixxQkFBTTtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRCxrREFBa0Q7QUFDdkc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQsY0FBYztBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtFQUFrRTtBQUNsRSw4QkFBOEIsZ0JBQWdCLGtCQUFrQjtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBLG9DQUFvQyx3QkFBd0IsaUJBQWlCO0FBQzdFLG9DQUFvQyx3QkFBd0IsSUFBSTtBQUNoRTtBQUNBLHdDQUF3QztBQUN4Qyx3Q0FBd0Msb0JBQW9CO0FBQzVEO0FBQ0Esd0NBQXdDO0FBQ3hDLHdDQUF3QyxrQkFBa0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3R0FBd0c7QUFDeEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlGQUFpRjtBQUNqRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0VBQXNFO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzRUFBc0U7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0VBQXdFO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsUUFBUTtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELFFBQVE7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRCx1QkFBdUI7QUFDekU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0QsMEJBQTBCO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUNBO0FBQ0EsZ0NBQWdDLFVBQVU7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUMsb0JBQW9CO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUMsMEJBQTBCOzs7Ozs7O1VDdDRDM0I7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTjBCIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbHV6L3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2NvcmUvY29tcG9uZW50LnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvY29yZS9jb21wb25lbnRzL2JpcGVkLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvY29yZS9jb21wb25lbnRzL2JvZHkudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9jb3JlL2NvbXBvbmVudHMvY2FtZXJhLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvY29yZS9jb21wb25lbnRzL2xpZ2h0LnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvY29yZS9jb21wb25lbnRzL21vZGVsLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvY29yZS9lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9jb3JlL2luZGV4LnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvY29yZS9zY2VuZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2NvcmUvdHJhbnNmb3JtLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9tYW5hZ2Vycy9idWZmZXJzLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvbWFuYWdlcnMvbWVzaGVzLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvbWFuYWdlcnMvcHJvZ3JhbXMudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9tYW5hZ2Vycy9zYW1wbGVycy50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL21hbmFnZXJzL3NoYWRlcnMudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9tYW5hZ2Vycy90ZXh0dXJlcy50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL3JlbmRlcmVyL2FuaW1hdGlvbi50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL3JlbmRlcmVyL2FybWF0dXJlLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvcmVuZGVyZXIvYm9uZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL3JlbmRlcmVyL2tleWZyYW1lLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvcmVuZGVyZXIvbWF0ZXJpYWwudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9yZW5kZXJlci9wYXJ0aXRpb24udHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9yZW5kZXJlci9wYXNzLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvcmVuZGVyZXIvcmVuZGVyZXIudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9yZW5kZXJlci9zdGF0ZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL3JlbmRlcmVyL3N1cmZhY2UudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9yZW5kZXJlci90YXJnZXQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9yZW5kZXJlci93ZWlnaHQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9pbmRleC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlkZXIudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpZGVycy9wbGFuZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlkZXJzL3BvbHlnb24udHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpZGVycy9yYXkudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpc2lvbnMvY3Vib2lkL2N1Ym9pZC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlzaW9ucy9wbGFuZS9jdWJvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpc2lvbnMvcGxhbmUvc3BoZXJlLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL3BvbHlnb24vY3Vib2lkLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL3BvbHlnb24vc3BoZXJlLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL3JheS9jdWJvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpc2lvbnMvcmF5L3BsYW5lLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL3JheS9yYXkudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpc2lvbnMvcmF5L3NwaGVyZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlzaW9ucy9zcGhlcmUvY3Vib2lkLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL3NwaGVyZS9zcGhlcmUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2Rpc3BhdGNoZXJzL2NvbGxpc2lvbi50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL3ZvbHVtZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3Mvdm9sdW1lcy9jdWJvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL3ZvbHVtZXMvc3BoZXJlLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvdXRpbGl0aWVzL2Rpc3BhdGNoZXIudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy91dGlsaXRpZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy91dGlsaXRpZXMvcG9vbC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3V0aWxpdGllcy9yZWdpc3RyeS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3V0aWxpdGllcy9zZXJpYWxpemFibGUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy91dGlsaXRpZXMvdW5pZm9ybS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvdmVjdG9ycy9pbmRleC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvbWF0Mi50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvbWF0My50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvbWF0NC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvcXVhdC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvdmVjMi50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvdmVjMy50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvdmVjNC50cyIsIndlYnBhY2s6Ly9sdXovLi9ub2RlX21vZHVsZXMvcmVmbGVjdC1tZXRhZGF0YS9SZWZsZWN0LmpzIiwid2VicGFjazovL2x1ei93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbHV6L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9sdXovLi9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJsdXpcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wibHV6XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgKCkgPT4ge1xucmV0dXJuICIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmV4cG9ydCBjbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIENvbXBvbmVudC5wcm90b3R5cGUsIFwidHlwZVwiLCB2b2lkIDApO1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xuaW1wb3J0IHsgUmVnaXN0ZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyBxdWF0IH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xubGV0IEJpcGVkID0gY2xhc3MgQmlwZWQgZXh0ZW5kcyBCb2R5IHtcbiAgICB0eXBlID0gJ0JpcGVkJztcbiAgICAvLyBUcnVlIHdoZW4gYSBjb250YWN0IGV4aXN0cyBiZWxvdyB0aGUgYmlwZWQgdGhpcyBzdGVwXG4gICAgb25Hcm91bmQgPSBmYWxzZTtcbiAgICB1cGRhdGUodHJhbnNmb3JtLCBkZWx0YVRpbWUpIHtcbiAgICAgICAgdGhpcy50b3JxdWUucmVzZXQoKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkucmVzZXQoKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyQ29ycmVjdGlvbi5yZXNldCgpO1xuICAgICAgICBzdXBlci51cGRhdGUodHJhbnNmb3JtLCBkZWx0YVRpbWUpO1xuICAgICAgICBjb25zdCB7IHlhdyB9ID0gdHJhbnNmb3JtLnJvdGF0aW9uO1xuICAgICAgICBxdWF0LmZyb21FdWxlckFuZ2xlcyh5YXcsIDAsIDAsIHRyYW5zZm9ybS5yb3RhdGlvbik7XG4gICAgfVxufTtcbkJpcGVkID0gX19kZWNvcmF0ZShbXG4gICAgUmVnaXN0ZXIoKVxuXSwgQmlwZWQpO1xuZXhwb3J0IHsgQmlwZWQgfTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBWb2x1bWUgfSBmcm9tICdAbHV6L3BoeXNpY3MnO1xuaW1wb3J0IHsgU2VyaWFsaXplLCBSZWdpc3RlciB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IHF1YXQsIHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmxldCBCb2R5ID0gY2xhc3MgQm9keSBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgdHlwZSA9ICdCb2R5JztcbiAgICB0aW1lc3RlcCA9ICdGaXhlZCc7XG4gICAgbWFzcztcbiAgICB2b2x1bWU7XG4gICAgZm9yY2U7XG4gICAgdG9ycXVlO1xuICAgIGxpbmVhclZlbG9jaXR5O1xuICAgIGFuZ3VsYXJWZWxvY2l0eTtcbiAgICBhbmd1bGFyQ29ycmVjdGlvbjtcbiAgICBsYXN0VHJhbnNmb3JtID0gbnVsbDtcbiAgICBjb25zdHJ1Y3Rvcih7IG1hc3MgPSAxLjAgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubWFzcyA9IG1hc3M7XG4gICAgICAgIHRoaXMuZm9yY2UgPSB2ZWMzLnplcm8uY29weSgpO1xuICAgICAgICB0aGlzLnRvcnF1ZSA9IHZlYzMuemVyby5jb3B5KCk7XG4gICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkgPSB2ZWMzLnplcm8uY29weSgpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IHZlYzMuemVyby5jb3B5KCk7XG4gICAgICAgIHRoaXMuYW5ndWxhckNvcnJlY3Rpb24gPSB2ZWMzLnplcm8uY29weSgpO1xuICAgIH1cbiAgICBhcHBseVRyYW5zZm9ybSh0cmFuc2Zvcm0pIHtcbiAgICAgICAgY29uc3QgeyB2b2x1bWUgfSA9IHRoaXM7XG4gICAgICAgIHZvbHVtZS5hcHBseVRyYW5zZm9ybSh0cmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmxhc3RUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgfVxuICAgIGFwcGx5UG9zaXRpb25Db3JyZWN0aW9uKGRlbHRhKSB7XG4gICAgICAgIGlmICghdGhpcy5sYXN0VHJhbnNmb3JtKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0VHJhbnNmb3JtLnRyYW5zbGF0aW9uLmFkZChkZWx0YSk7XG4gICAgICAgIHRoaXMudm9sdW1lLmFwcGx5VHJhbnNmb3JtKHRoaXMubGFzdFRyYW5zZm9ybSk7XG4gICAgfVxuICAgIHVwZGF0ZSh0cmFuc2Zvcm0sIGRlbHRhVGltZSkge1xuICAgICAgICBjb25zdCB7IG1hc3MsIHZvbHVtZSB9ID0gdGhpcztcbiAgICAgICAgaWYgKG1hc3MgPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZS5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy50b3JxdWUucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnJlc2V0KCk7XG4gICAgICAgICAgICB2b2x1bWUuaW52ZXJzZUluZXJ0aWEucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhckNvcnJlY3Rpb24ucmVzZXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2b2x1bWUuY2FsY3VsYXRlSW52ZXJzZUluZXJ0aWEobWFzcywgdHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5pbnRlZ3JhdGVMaW5lYXJWZWxvY2l0eSh0cmFuc2Zvcm0sIGRlbHRhVGltZSk7XG4gICAgICAgIHRoaXMuaW50ZWdyYXRlQW5ndWxhclZlbG9jaXR5KHRyYW5zZm9ybSwgZGVsdGFUaW1lKTtcbiAgICB9XG4gICAgaW50ZWdyYXRlTGluZWFyVmVsb2NpdHkodHJhbnNmb3JtLCBkZWx0YVRpbWUpIHtcbiAgICAgICAgY29uc3QgYWNjZWxlcmF0aW9uID0gdmVjMy5zY2FsZSh0aGlzLmZvcmNlLCAxIC8gdGhpcy5tYXNzKTtcbiAgICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5hZGQoYWNjZWxlcmF0aW9uLnNjYWxlKGRlbHRhVGltZSkpO1xuICAgICAgICB0cmFuc2Zvcm0udHJhbnNsYXRpb24uYWRkKHZlYzMuc2NhbGUodGhpcy5saW5lYXJWZWxvY2l0eSwgZGVsdGFUaW1lKSk7XG4gICAgICAgIHRoaXMudm9sdW1lLmFwcGx5VHJhbnNmb3JtKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuZm9yY2UucmVzZXQoKTtcbiAgICB9XG4gICAgaW50ZWdyYXRlQW5ndWxhclZlbG9jaXR5KHRyYW5zZm9ybSwgZGVsdGFUaW1lKSB7XG4gICAgICAgIGNvbnN0IHsgaW52ZXJzZUluZXJ0aWEgfSA9IHRoaXMudm9sdW1lO1xuICAgICAgICBjb25zdCBhY2NlbGVyYXRpb24gPSBpbnZlcnNlSW5lcnRpYS50cmFuc2Zvcm0odGhpcy50b3JxdWUpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5hZGQoYWNjZWxlcmF0aW9uLnNjYWxlKGRlbHRhVGltZSkpO1xuICAgICAgICBjb25zdCBheGlzID0gdmVjMy5ub3JtYWxpemUodGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xuICAgICAgICBjb25zdCBhbmdsZSA9IHRoaXMuYW5ndWxhclZlbG9jaXR5Lmxlbmd0aCAqIGRlbHRhVGltZTtcbiAgICAgICAgaWYgKGFuZ2xlICE9PSAwKSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm0ucm90YXRpb24ubXVsdGlwbHkocXVhdC5mcm9tQXhpc0FuZ2xlKGF4aXMsIGFuZ2xlKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50b3JxdWUucmVzZXQoKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyQ29ycmVjdGlvbi5yZXNldCgpO1xuICAgIH1cbn07XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgTnVtYmVyKVxuXSwgQm9keS5wcm90b3R5cGUsIFwibWFzc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFZvbHVtZSlcbl0sIEJvZHkucHJvdG90eXBlLCBcInZvbHVtZVwiLCB2b2lkIDApO1xuQm9keSA9IF9fZGVjb3JhdGUoW1xuICAgIFJlZ2lzdGVyKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjpwYXJhbXR5cGVzXCIsIFtPYmplY3RdKVxuXSwgQm9keSk7XG5leHBvcnQgeyBCb2R5IH07XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXplLCBVbmlmb3JtLCBSZWdpc3RlciB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IG1hdDQsIHZlYzIgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmxldCBDYW1lcmEgPSBjbGFzcyBDYW1lcmEgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHR5cGUgPSAnQ2FtZXJhJztcbiAgICB0aW1lc3RlcCA9ICdWYXJpYWJsZSc7XG4gICAgYXNwZWN0ID0gMS4wO1xuICAgIGFwZXJ0dXJlID0gOTAuMDtcbiAgICBjbGlwUGxhbmVzID0gbmV3IHZlYzIoWzEuMCwgMTAwLjBdKTtcbiAgICB2aWV3TWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICBtb2RlbFZpZXdNYXRyaXggPSBuZXcgbWF0NCgpO1xuICAgIHByb2plY3Rpb25NYXRyaXggPSBuZXcgbWF0NCgpO1xuICAgIHJlY29uc3RydWN0aW9uTWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICB1cGRhdGUodHJhbnNmb3JtLCBkZWx0YVRpbWUpIHtcbiAgICAgICAgY29uc3QgeyBtb2RlbE1hdHJpeCB9ID0gdHJhbnNmb3JtO1xuICAgICAgICAvLyB2aWV3IG1hdHJpeFxuICAgICAgICBtb2RlbE1hdHJpeC5pbnZlcnQodGhpcy52aWV3TWF0cml4KTtcbiAgICAgICAgLy8gbW9kZWwgdmlldyBtYXRyaXhcbiAgICAgICAgbWF0NC5tdWx0aXBseSh0aGlzLnZpZXdNYXRyaXgsIG1vZGVsTWF0cml4LCB0aGlzLm1vZGVsVmlld01hdHJpeCk7XG4gICAgICAgIC8vIHBlcnNwZWN0aXZlIG1hdHJpeFxuICAgICAgICBtYXQ0LnBlcnNwZWN0aXZlKHRoaXMuYXBlcnR1cmUsIHRoaXMuYXNwZWN0LCB0aGlzLmNsaXBQbGFuZXMueCwgdGhpcy5jbGlwUGxhbmVzLnksIHRoaXMucHJvamVjdGlvbk1hdHJpeCk7XG4gICAgICAgIC8vIHJlY29uc3RydWN0aW9uIG1hdHJpeCAodG8gcmVjb25zdHJ1Y3QgZnJhZ21lbnQgcG9zaXRpb25zKVxuICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMucHJvamVjdGlvbk1hdHJpeCwgdGhpcy52aWV3TWF0cml4LCB0aGlzLnJlY29uc3RydWN0aW9uTWF0cml4KS5pbnZlcnQoKTtcbiAgICB9XG59O1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIENhbWVyYS5wcm90b3R5cGUsIFwiYXNwZWN0XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBVbmlmb3JtKCksXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIENhbWVyYS5wcm90b3R5cGUsIFwiYXBlcnR1cmVcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMilcbl0sIENhbWVyYS5wcm90b3R5cGUsIFwiY2xpcFBsYW5lc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBDYW1lcmEucHJvdG90eXBlLCBcInZpZXdNYXRyaXhcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgQ2FtZXJhLnByb3RvdHlwZSwgXCJtb2RlbFZpZXdNYXRyaXhcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgQ2FtZXJhLnByb3RvdHlwZSwgXCJwcm9qZWN0aW9uTWF0cml4XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBVbmlmb3JtKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE9iamVjdClcbl0sIENhbWVyYS5wcm90b3R5cGUsIFwicmVjb25zdHJ1Y3Rpb25NYXRyaXhcIiwgdm9pZCAwKTtcbkNhbWVyYSA9IF9fZGVjb3JhdGUoW1xuICAgIFJlZ2lzdGVyKClcbl0sIENhbWVyYSk7XG5leHBvcnQgeyBDYW1lcmEgfTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUsIFVuaWZvcm0sIFJlZ2lzdGVyIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuaW1wb3J0IHsgbWF0NCwgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5pbXBvcnQgeyBDYW1lcmEgfSBmcm9tICcuL2NhbWVyYSc7XG5sZXQgTGlnaHQgPSBjbGFzcyBMaWdodCBleHRlbmRzIENhbWVyYSB7XG4gICAgdHlwZSA9ICdMaWdodCc7XG4gICAgcmFkaXVzID0gNi4wO1xuICAgIGZhbGxvZmYgPSAxMC4wO1xuICAgIGludGVuc2l0eSA9IDEuMDtcbiAgICBjb2xvciA9IHZlYzMub25lLmNvcHkoKTtcbiAgICB0cmFuc2xhdGlvbiA9IG5ldyB2ZWMzKCk7XG4gICAgZGlyZWN0aW9uID0gbmV3IHZlYzMoKTtcbiAgICB0ZXh0dXJlTWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICBiaWFzTWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbmV3IHZlYzMoKTtcbiAgICAgICAgdGhpcy5iaWFzTWF0cml4LnRyYW5zbGF0ZShuZXcgdmVjMyhbMC41LCAwLjUsIDAuNV0pKTtcbiAgICAgICAgdGhpcy5iaWFzTWF0cml4LnNjYWxlKG5ldyB2ZWMzKFswLjUsIDAuNSwgMC41XSkpO1xuICAgIH1cbiAgICB1cGRhdGUodHJhbnNmb3JtLCBkZWx0YVRpbWUpIHtcbiAgICAgICAgc3VwZXIudXBkYXRlKHRyYW5zZm9ybSwgZGVsdGFUaW1lKTtcbiAgICAgICAgdHJhbnNmb3JtLnRyYW5zbGF0aW9uLmNvcHkodGhpcy50cmFuc2xhdGlvbik7XG4gICAgICAgIHRyYW5zZm9ybS5kaXJlY3Rpb24uY29weSh0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgIHRoaXMuYmlhc01hdHJpeC5jb3B5KHRoaXMudGV4dHVyZU1hdHJpeCk7XG4gICAgICAgIHRoaXMudGV4dHVyZU1hdHJpeC5tdWx0aXBseSh0aGlzLnByb2plY3Rpb25NYXRyaXgpO1xuICAgICAgICB0aGlzLnRleHR1cmVNYXRyaXgubXVsdGlwbHkodGhpcy52aWV3TWF0cml4KTtcbiAgICB9XG59O1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBMaWdodC5wcm90b3R5cGUsIFwicmFkaXVzXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBVbmlmb3JtKCksXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIExpZ2h0LnByb3RvdHlwZSwgXCJmYWxsb2ZmXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBVbmlmb3JtKCksXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIExpZ2h0LnByb3RvdHlwZSwgXCJpbnRlbnNpdHlcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMylcbl0sIExpZ2h0LnByb3RvdHlwZSwgXCJjb2xvclwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBMaWdodC5wcm90b3R5cGUsIFwidHJhbnNsYXRpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgTGlnaHQucHJvdG90eXBlLCBcImRpcmVjdGlvblwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBMaWdodC5wcm90b3R5cGUsIFwidGV4dHVyZU1hdHJpeFwiLCB2b2lkIDApO1xuTGlnaHQgPSBfX2RlY29yYXRlKFtcbiAgICBSZWdpc3RlcigpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246cGFyYW10eXBlc1wiLCBbXSlcbl0sIExpZ2h0KTtcbmV4cG9ydCB7IExpZ2h0IH07XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgTWF0ZXJpYWwsIFBhcnRpdGlvbiwgQXJtYXR1cmUsIEFuaW1hdGlvbiB9IGZyb20gJ0BsdXovZ3JhcGhpY3MnO1xuaW1wb3J0IHsgU2VyaWFsaXplLCBVbmlmb3JtLCBSZWdpc3RlciB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5sZXQgTW9kZWwgPSBjbGFzcyBNb2RlbCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgdHlwZSA9ICdNb2RlbCc7XG4gICAgdGltZXN0ZXAgPSAnVmFyaWFibGUnO1xuICAgIG1hdGVyaWFscyA9IHt9O1xuICAgIHBhcnRpdGlvbnMgPSB7fTtcbiAgICBhcm1hdHVyZXMgPSB7fTtcbiAgICBhbmltYXRpb25zID0ge307XG4gICAgYm9uZU1hdHJpY2VzOyAvLyB1cGxvYWRlZCBzZXBhcmF0ZWx5XG4gICAgaXNBbmltYXRlZCA9IGZhbHNlO1xuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgICAgIGNvbnN0IG1vZGVsID0gKGF3YWl0IHN1cGVyLmRlc2VyaWFsaXplKGRhdGEpKTtcbiAgICAgICAgaWYgKE9iamVjdC52YWx1ZXMobW9kZWwuYXJtYXR1cmVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBtb2RlbC5ib25lTWF0cmljZXMgPSBuZXcgRmxvYXQzMkFycmF5KDEwMjQpOyAvLyAxNiAqIDY0XG4gICAgICAgICAgICBtb2RlbC5pc0FuaW1hdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgfVxuICAgIHVwZGF0ZSh0cmFuc2Zvcm0sIGRlbHRhVGltZSkge1xuICAgICAgICBjb25zdCBhbmltYXRpb25zID0gT2JqZWN0LnZhbHVlcyh0aGlzLmFuaW1hdGlvbnMpO1xuICAgICAgICBhbmltYXRpb25zLmZvckVhY2goKGFuaW1hdGlvbikgPT4ge1xuICAgICAgICAgICAgYW5pbWF0aW9uLnVwZGF0ZShkZWx0YVRpbWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYXJtYXR1cmVzID0gT2JqZWN0LnZhbHVlcyh0aGlzLmFybWF0dXJlcyk7XG4gICAgICAgIGFybWF0dXJlcy5mb3JFYWNoKChhcm1hdHVyZSkgPT4ge1xuICAgICAgICAgICAgYXJtYXR1cmUudXBkYXRlKGRlbHRhVGltZSwgYW5pbWF0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoTWF0ZXJpYWwpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBNb2RlbC5wcm90b3R5cGUsIFwibWF0ZXJpYWxzXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoUGFydGl0aW9uKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgTW9kZWwucHJvdG90eXBlLCBcInBhcnRpdGlvbnNcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShBcm1hdHVyZSksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE9iamVjdClcbl0sIE1vZGVsLnByb3RvdHlwZSwgXCJhcm1hdHVyZXNcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShBbmltYXRpb24pLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBNb2RlbC5wcm90b3R5cGUsIFwiYW5pbWF0aW9uc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBCb29sZWFuKVxuXSwgTW9kZWwucHJvdG90eXBlLCBcImlzQW5pbWF0ZWRcIiwgdm9pZCAwKTtcbk1vZGVsID0gX19kZWNvcmF0ZShbXG4gICAgUmVnaXN0ZXIoKVxuXSwgTW9kZWwpO1xuZXhwb3J0IHsgTW9kZWwgfTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL3RyYW5zZm9ybSc7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudCc7XG5leHBvcnQgY2xhc3MgRW50aXR5IGV4dGVuZHMgVHJhbnNmb3JtIHtcbiAgICBjb21wb25lbnRzID0ge307XG4gICAgLy8gdm9sdW1lOiBWb2x1bWUgLS0gVE9ETzogZm9yIHZpc2liaWxpdHkgZGV0ZXJtaW5hdGlvblxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgc3VwZXIuZGVzZXJpYWxpemUoZGF0YSkpO1xuICAgIH1cbiAgICB1cGRhdGUoZGVsdGFUaW1lKSB7XG4gICAgICAgIHN1cGVyLnVwZGF0ZShkZWx0YVRpbWUpO1xuICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuY29tcG9uZW50cykuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50LnRpbWVzdGVwID09PSAnVmFyaWFibGUnKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnVwZGF0ZSh0aGlzLCBkZWx0YVRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZml4ZWRVcGRhdGUoZGVsdGFUaW1lKSB7XG4gICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5jb21wb25lbnRzKS5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQudGltZXN0ZXAgPT09ICdGaXhlZCcpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQudXBkYXRlKHRoaXMsIGRlbHRhVGltZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShDb21wb25lbnQpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBFbnRpdHkucHJvdG90eXBlLCBcImNvbXBvbmVudHNcIiwgdm9pZCAwKTtcbiIsImV4cG9ydCB7IFNjZW5lIH0gZnJvbSAnLi9zY2VuZSc7XG5leHBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5leHBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL3RyYW5zZm9ybSc7XG5leHBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudCc7XG5leHBvcnQgeyBCb2R5IH0gZnJvbSAnLi9jb21wb25lbnRzL2JvZHknO1xuZXhwb3J0IHsgQmlwZWQgfSBmcm9tICcuL2NvbXBvbmVudHMvYmlwZWQnO1xuZXhwb3J0IHsgTW9kZWwgfSBmcm9tICcuL2NvbXBvbmVudHMvbW9kZWwnO1xuZXhwb3J0IHsgTGlnaHQgfSBmcm9tICcuL2NvbXBvbmVudHMvbGlnaHQnO1xuZXhwb3J0IHsgQ2FtZXJhIH0gZnJvbSAnLi9jb21wb25lbnRzL2NhbWVyYSc7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgQ29sbGlkZXIsIENvbGxpc2lvbkRpc3BhdGNoZXIgfSBmcm9tICdAbHV6L3BoeXNpY3MnO1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmNvbnN0IFNURVBfQ09VTlQgPSA0O1xuY29uc3QgRlJBTUVfUkFURSA9IDEgLyA2MDtcbmNvbnN0IHZlbG9jaXR5SXRlcmF0aW9ucyA9IDg7XG5jb25zdCBwb3NpdGlvbkl0ZXJhdGlvbnMgPSA4O1xuY29uc3QgY29udGFjdFJlc3RWZWxvY2l0eSA9IDAuMDAyO1xuY29uc3QgcGVuZXRyYXRpb25Ub2xlcmFuY2UgPSAwLjAwMTtcbmNvbnN0IHBvc2l0aW9uQ29ycmVjdGlvbkZhY3RvciA9IDAuMjU7XG5jb25zdCBwb3NpdGlvbkNvcnJlY3Rpb25QZXJTdGVwID0gMC4wMDU7XG4vLyBDb25zaWRlciBzdXJmYWNlcyB3aXRoIHVwd2FyZCBub3JtYWwgYWJvdmUgdGhpcyB0aHJlc2hvbGQgYXMgXCJncm91bmRcIi5cbi8vIGNvcyhtYXhTbG9wZUFuZ2xlKS4gMC43IH49IDQ1IGRlZ3JlZXMuXG5jb25zdCBncm91bmRNaW5Ob3JtYWxZID0gMC43O1xuLy8gQWxsb3cgbGFyZ2VyIHBlci1zdGVwIHNlcGFyYXRpb24gZm9yIGR5bmFtaWMgcGFpcnMgaW52b2x2aW5nIGEgQmlwZWRcbi8vIChhcHBsaWVkIHRvIHRoZSBub24tYmlwZWQgYm9keSksIHRvIHJlZHVjZSB0dW5uZWxpbmcuXG5jb25zdCBiaXBlZER5bmFtaWNDb3JyZWN0aW9uUGVyU3RlcCA9IDAuMDI7XG5jb25zdCBpc0JvZHlDb21wb25lbnQgPSAoY29tcG9uZW50KSA9PiB7XG4gICAgcmV0dXJuIGNvbXBvbmVudC50eXBlID09PSAnQm9keScgfHwgY29tcG9uZW50LnR5cGUgPT09ICdCaXBlZCc7XG59O1xuZXhwb3J0IGNsYXNzIFNjZW5lIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICBncmF2aXR5O1xuICAgIGZyaWN0aW9uID0gMC4yO1xuICAgIHJlc3RpdHV0aW9uID0gMC4yO1xuICAgIGxpbmVhckRhbXBpbmcgPSAwLjAxO1xuICAgIGFuZ3VsYXJEYW1waW5nID0gMC4wMTtcbiAgICBlbnRpdGllcyA9IHt9O1xuICAgIGNvbGxpZGVycyA9IHt9O1xuICAgIGNvbGxpc2lvbk1hbmlmb2xkcyA9IFtdO1xuICAgIGNvbGxpc2lvbkRpc3BhdGNoZXI7XG4gICAgZWxhcHNlZFRpbWUgPSAwO1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdyYXZpdHkgPSBuZXcgdmVjMyhbMCwgLTkuODEsIDBdKTtcbiAgICAgICAgdGhpcy5jb2xsaXNpb25EaXNwYXRjaGVyID0gbmV3IENvbGxpc2lvbkRpc3BhdGNoZXIoKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGRlc2VyaWFsaXplKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIChhd2FpdCBzdXBlci5kZXNlcmlhbGl6ZShkYXRhKSk7XG4gICAgfVxuICAgIHVwZGF0ZShkZWx0YVRpbWUpIHtcbiAgICAgICAgY29uc3QgZW50aXRpZXMgPSBPYmplY3QudmFsdWVzKHRoaXMuZW50aXRpZXMpO1xuICAgICAgICB0aGlzLmVsYXBzZWRUaW1lICs9IGRlbHRhVGltZTtcbiAgICAgICAgbGV0IHN0ZXBzID0gMDtcbiAgICAgICAgLy8gdHJhbnNmb3JtIGJvZGllc1xuICAgICAgICBlbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgIE9iamVjdC52YWx1ZXMoZW50aXR5LmNvbXBvbmVudHMpLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc0JvZHlDb21wb25lbnQoY29tcG9uZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQuYXBwbHlUcmFuc2Zvcm0oZW50aXR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdoaWxlICh0aGlzLmVsYXBzZWRUaW1lID49IEZSQU1FX1JBVEUgJiYgc3RlcHMrKyA8IFNURVBfQ09VTlQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBlbnRpdGllcy5yZWR1Y2UoKGNvbXBvbmVudHMsIGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbLi4uY29tcG9uZW50cywgLi4uT2JqZWN0LnZhbHVlcyhlbnRpdHkuY29tcG9uZW50cyldO1xuICAgICAgICAgICAgfSwgW10pO1xuICAgICAgICAgICAgY29uc3QgYm9kaWVzID0gY29tcG9uZW50cy5maWx0ZXIoKGNvbXBvbmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc0JvZHlDb21wb25lbnQoY29tcG9uZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hcHBseUdyYXZpdHkoYm9kaWVzKTtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlEYW1waW5nKGJvZGllcywgRlJBTUVfUkFURSk7XG4gICAgICAgICAgICAvLyBmaXhlZCB1cGRhdGVcbiAgICAgICAgICAgIGVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGVudGl0eS5maXhlZFVwZGF0ZShGUkFNRV9SQVRFKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zb2x2ZUNvbGxpc2lvbnMoYm9kaWVzKTtcbiAgICAgICAgICAgIHRoaXMuZWxhcHNlZFRpbWUgLT0gRlJBTUVfUkFURTtcbiAgICAgICAgfVxuICAgICAgICAvLyB2YXJpYWJsZSB1cGRhdGVcbiAgICAgICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICBlbnRpdHkudXBkYXRlKGRlbHRhVGltZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBzb2x2ZUNvbGxpc2lvbnMoYm9kaWVzKSB7XG4gICAgICAgIC8vIFJlc2V0IG9uR3JvdW5kIGZvciBhbGwgYmlwZWRzIGJlZm9yZSBzb2x2aW5nXG4gICAgICAgIGJvZGllcy5maWx0ZXIoKGIpID0+IGIudHlwZSA9PT0gJ0JpcGVkJykuZm9yRWFjaCgoYikgPT4ge1xuICAgICAgICAgICAgYi5vbkdyb3VuZCA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gVmVsb2NpdHkgcGhhc2VcbiAgICAgICAgZm9yIChsZXQgaXRlcmF0aW9uID0gMDsgaXRlcmF0aW9uIDwgdmVsb2NpdHlJdGVyYXRpb25zOyBpdGVyYXRpb24rKykge1xuICAgICAgICAgICAgdGhpcy5kZXRlY3RDb2xsaXNpb25zKGJvZGllcyk7XG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25NYW5pZm9sZHMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVCaXBlZEdyb3VuZFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmVWZWxvY2l0aWVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gUG9zaXRpb24gcGhhc2VcbiAgICAgICAgZm9yIChsZXQgaXRlcmF0aW9uID0gMDsgaXRlcmF0aW9uIDwgcG9zaXRpb25JdGVyYXRpb25zOyBpdGVyYXRpb24rKykge1xuICAgICAgICAgICAgdGhpcy5kZXRlY3RDb2xsaXNpb25zKGJvZGllcyk7XG4gICAgICAgICAgICBpZiAodGhpcy5jb2xsaXNpb25NYW5pZm9sZHMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVCaXBlZEdyb3VuZFN0YXRlKCk7XG4gICAgICAgICAgICBjb25zdCBhcHBsaWVkID0gdGhpcy5yZXNvbHZlUG9zaXRpb25zKCk7XG4gICAgICAgICAgICBpZiAoIWFwcGxpZWQpXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXBwbHlHcmF2aXR5KGJvZGllcykge1xuICAgICAgICBjb25zdCBncmF2aXR5Rm9yY2UgPSBuZXcgdmVjMygpO1xuICAgICAgICBib2RpZXMuZm9yRWFjaCgoYm9keSkgPT4ge1xuICAgICAgICAgICAgaWYgKGJvZHkubWFzcyA8PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHZlYzMuc2NhbGUodGhpcy5ncmF2aXR5LCBib2R5Lm1hc3MsIGdyYXZpdHlGb3JjZSk7XG4gICAgICAgICAgICBib2R5LmZvcmNlLmFkZChncmF2aXR5Rm9yY2UpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXBwbHlEYW1waW5nKGJvZGllcywgZGVsdGFUaW1lKSB7XG4gICAgICAgIGNvbnN0IGhhc0xpbmVhciA9IHRoaXMubGluZWFyRGFtcGluZyA+IDA7XG4gICAgICAgIGNvbnN0IGhhc0FuZ3VsYXIgPSB0aGlzLmFuZ3VsYXJEYW1waW5nID4gMDtcbiAgICAgICAgaWYgKCFoYXNMaW5lYXIgJiYgIWhhc0FuZ3VsYXIpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGxpbmVhckZhY3RvciA9IGhhc0xpbmVhciA/IE1hdGguZXhwKC10aGlzLmxpbmVhckRhbXBpbmcgKiBkZWx0YVRpbWUpIDogMTtcbiAgICAgICAgY29uc3QgYW5ndWxhckZhY3RvciA9IGhhc0FuZ3VsYXIgPyBNYXRoLmV4cCgtdGhpcy5hbmd1bGFyRGFtcGluZyAqIGRlbHRhVGltZSkgOiAxO1xuICAgICAgICBib2RpZXMuZm9yRWFjaCgoYm9keSkgPT4ge1xuICAgICAgICAgICAgaWYgKGJvZHkubWFzcyA8PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGlmIChoYXNMaW5lYXIpXG4gICAgICAgICAgICAgICAgYm9keS5saW5lYXJWZWxvY2l0eS5zY2FsZShsaW5lYXJGYWN0b3IpO1xuICAgICAgICAgICAgaWYgKGhhc0FuZ3VsYXIpXG4gICAgICAgICAgICAgICAgYm9keS5hbmd1bGFyVmVsb2NpdHkuc2NhbGUoYW5ndWxhckZhY3Rvcik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBkZXRlY3RDb2xsaXNpb25zKGJvZGllcykge1xuICAgICAgICB0aGlzLmNvbGxpc2lvbk1hbmlmb2xkcy5sZW5ndGggPSAwO1xuICAgICAgICAvLyBib2R5LXZzLWJvZHlcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGIxID0gYm9kaWVzW2ldO1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgYm9kaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYjIgPSBib2RpZXNbal07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sbGlzaW9ucyA9IHRoaXMuY29sbGlzaW9uRGlzcGF0Y2hlci5kaXNwYXRjaChiMS52b2x1bWUsIGIyLnZvbHVtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbGxpc2lvbnMgJiYgY29sbGlzaW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29sbGlzaW9uTWFuaWZvbGRzLnB1c2goeyBib2RpZXM6IFtiMSwgYjJdLCBjb2xsaXNpb25zIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBib2R5LXZzLXN0YXRpY1xuICAgICAgICBib2RpZXMuZm9yRWFjaCgoYm9keSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29sbGlkZXJzID0gT2JqZWN0LnZhbHVlcyh0aGlzLmNvbGxpZGVycyk7XG4gICAgICAgICAgICBjb2xsaWRlcnMuZm9yRWFjaCgoY29sbGlkZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xsaXNpb25zID0gdGhpcy5jb2xsaXNpb25EaXNwYXRjaGVyLmRpc3BhdGNoKGJvZHkudm9sdW1lLCBjb2xsaWRlcik7XG4gICAgICAgICAgICAgICAgaWYgKGNvbGxpc2lvbnMgJiYgY29sbGlzaW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29sbGlzaW9uTWFuaWZvbGRzLnB1c2goeyBib2RpZXM6IFtib2R5LCBudWxsXSwgY29sbGlzaW9ucyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFN0YWJsZSBwZXItcGFpciBub3JtYWwgb3JpZW50YXRpb24gKHNoYXJlZCBieSBib3RoIHNvbHZlcnMpXG4gICAgb3JpZW50Tm9ybWFsRm9yUGFpcihuSW4sIGNvbnRhY3QsIGIxLCBiMikge1xuICAgICAgICBjb25zdCBuID0gbkluLmNvcHkoKTtcbiAgICAgICAgY29uc3QgcjEgPSB2ZWMzLnN1YnRyYWN0KGNvbnRhY3QsIGIxLnZvbHVtZS5jZW50ZXIsIG5ldyB2ZWMzKCkpO1xuICAgICAgICBpZiAoYjIpIHtcbiAgICAgICAgICAgIGNvbnN0IGMxMiA9IHZlYzMuc3VidHJhY3QoYjIudm9sdW1lLmNlbnRlciwgYjEudm9sdW1lLmNlbnRlciwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICBpZiAodmVjMy5kb3QobiwgYzEyKSA8IDApXG4gICAgICAgICAgICAgICAgbi5zY2FsZSgtMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAodmVjMy5kb3QobiwgcjEpIDwgMClcbiAgICAgICAgICAgICAgICBuLnNjYWxlKC0xKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbjtcbiAgICB9XG4gICAgcmVzb2x2ZVZlbG9jaXRpZXMoKSB7XG4gICAgICAgIHRoaXMuY29sbGlzaW9uTWFuaWZvbGRzLmZvckVhY2goKHsgYm9kaWVzLCBjb2xsaXNpb25zIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFtiMSwgYjJdID0gYm9kaWVzO1xuICAgICAgICAgICAgY29sbGlzaW9ucy5mb3JFYWNoKCh7IGNvbnRhY3QsIG5vcm1hbDogY29sbGlzaW9uTm9ybWFsLCBkaXN0YW5jZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsID0gdGhpcy5vcmllbnROb3JtYWxGb3JQYWlyKGNvbGxpc2lvbk5vcm1hbCwgY29udGFjdCwgYjEsIGIyKTtcbiAgICAgICAgICAgICAgICAvLyBDb250YWN0IHBvaW50IG9mZnNldHNcbiAgICAgICAgICAgICAgICBjb25zdCByMSA9IHZlYzMuc3VidHJhY3QoY29udGFjdCwgYjEudm9sdW1lLmNlbnRlciwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGFjdFZlbG9jaXR5MSA9IHZlYzMuYWRkKGIxLmxpbmVhclZlbG9jaXR5LCB2ZWMzLmNyb3NzKGIxLmFuZ3VsYXJWZWxvY2l0eSwgcjEsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICBjb25zdCByMiA9IGIyID8gdmVjMy5zdWJ0cmFjdChjb250YWN0LCBiMi52b2x1bWUuY2VudGVyLCBuZXcgdmVjMygpKSA6IG51bGw7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGFjdFZlbG9jaXR5MiA9IGIyXG4gICAgICAgICAgICAgICAgICAgID8gdmVjMy5hZGQoYjIubGluZWFyVmVsb2NpdHksIHZlYzMuY3Jvc3MoYjIuYW5ndWxhclZlbG9jaXR5LCByMiwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpXG4gICAgICAgICAgICAgICAgICAgIDogbnVsbDtcbiAgICAgICAgICAgICAgICAvLyBSZWxhdGl2ZSB2ZWxvY2l0eVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlVmVsb2NpdHkgPSBjb250YWN0VmVsb2NpdHkyXG4gICAgICAgICAgICAgICAgICAgID8gdmVjMy5zdWJ0cmFjdChjb250YWN0VmVsb2NpdHkyLCBjb250YWN0VmVsb2NpdHkxLCBuZXcgdmVjMygpKVxuICAgICAgICAgICAgICAgICAgICA6IHZlYzMuc3VidHJhY3QodmVjMy56ZXJvLCBjb250YWN0VmVsb2NpdHkxLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2ZWxvY2l0eUFsb25nTm9ybWFsID0gdmVjMy5kb3QocmVsYXRpdmVWZWxvY2l0eSwgbm9ybWFsKTtcbiAgICAgICAgICAgICAgICBpZiAodmVsb2NpdHlBbG9uZ05vcm1hbCA+IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gc2VwYXJhdGluZ1xuICAgICAgICAgICAgICAgIC8vIFRhbmdlbnRcbiAgICAgICAgICAgICAgICBjb25zdCB0YW5nZW50ID0gdmVjMy5zdWJ0cmFjdChyZWxhdGl2ZVZlbG9jaXR5LCB2ZWMzLnNjYWxlKG5vcm1hbCwgdmVsb2NpdHlBbG9uZ05vcm1hbCwgbmV3IHZlYzMoKSkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhbmdlbnRMZW5ndGggPSB0YW5nZW50Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb25zdCB0YW5nZW50RGlyZWN0aW9uID0gdGFuZ2VudExlbmd0aCA+IDAgPyB0YW5nZW50Lm5vcm1hbGl6ZSgpIDogdmVjMy56ZXJvO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3RpdHV0aW9uID0gTWF0aC5hYnModmVsb2NpdHlBbG9uZ05vcm1hbCkgPCBjb250YWN0UmVzdFZlbG9jaXR5ID8gMCA6IHRoaXMucmVzdGl0dXRpb247XG4gICAgICAgICAgICAgICAgY29uc3QgaW1wdWxzZVNjYWxhciA9IE1hdGgubWF4KC0oKDEuMCArIHJlc3RpdHV0aW9uKSAqIHZlbG9jaXR5QWxvbmdOb3JtYWwpLCAwKTtcbiAgICAgICAgICAgICAgICAvLyBNYXNzL2luZXJ0aWFcbiAgICAgICAgICAgICAgICAvLyBUcmVhdCBCaXBlZCBhcyBpbW1vdmFibGUgZm9yIGR5bmFtaWMgY29sbGlzaW9ucywgYnV0IGFsbG93XG4gICAgICAgICAgICAgICAgLy8gbm9ybWFsIGltcHVsc2VzIHZzIHN0YXRpYyBjb2xsaWRlcnMgKGIyID09PSBudWxsKSB0byBwcmV2ZW50IHR1bm5lbGluZy5cbiAgICAgICAgICAgICAgICBjb25zdCBiMUlzQmlwZWQgPSBiMS50eXBlID09PSAnQmlwZWQnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGIySXNCaXBlZCA9IGIyID8gYjIudHlwZSA9PT0gJ0JpcGVkJyA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGludk1hc3MxQmFzZSA9IGIxLm1hc3MgPiAwID8gMS4wIC8gYjEubWFzcyA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52TWFzczJCYXNlID0gYjIgPyAoYjIubWFzcyA+IDAgPyAxLjAgLyBiMi5tYXNzIDogMCkgOiAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGludmVyc2VNYXNzMSA9IGIxSXNCaXBlZCAmJiBiMiA/IDAgOiBpbnZNYXNzMUJhc2U7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52ZXJzZU1hc3MyID0gYjIgPyAoYjJJc0JpcGVkID8gMCA6IGludk1hc3MyQmFzZSkgOiAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvdGFsSW52ZXJzZU1hc3MgPSBpbnZlcnNlTWFzczEgKyBpbnZlcnNlTWFzczI7XG4gICAgICAgICAgICAgICAgaWYgKHRvdGFsSW52ZXJzZU1hc3MgPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnZlcnNlSW5lcnRpYTEgPSBiMS52b2x1bWUuaW52ZXJzZUluZXJ0aWE7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52ZXJzZUluZXJ0aWEyID0gYjIgPyBiMi52b2x1bWUuaW52ZXJzZUluZXJ0aWEgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXB1dGVFZmZlY3RpdmVNYXNzID0gKGRpcmVjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGVub21pbmF0b3IgPSB0b3RhbEludmVyc2VNYXNzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW52ZXJzZU1hc3MxID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcjFDcm9zc0RpciA9IHZlYzMuY3Jvc3MocjEsIGRpcmVjdGlvbiwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbmd1bGFyQ29tcG9uZW50MSA9IHZlYzMuY3Jvc3MoaW52ZXJzZUluZXJ0aWExLnRyYW5zZm9ybShyMUNyb3NzRGlyLCBuZXcgdmVjMygpKSwgcjEsIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVub21pbmF0b3IgKz0gdmVjMy5kb3QoYW5ndWxhckNvbXBvbmVudDEsIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGIyICYmIGludmVyc2VNYXNzMiA+IDAgJiYgcjIgJiYgaW52ZXJzZUluZXJ0aWEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByMkNyb3NzRGlyID0gdmVjMy5jcm9zcyhyMiwgZGlyZWN0aW9uLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuZ3VsYXJDb21wb25lbnQyID0gdmVjMy5jcm9zcyhpbnZlcnNlSW5lcnRpYTIudHJhbnNmb3JtKHIyQ3Jvc3NEaXIsIG5ldyB2ZWMzKCkpLCByMiwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZW5vbWluYXRvciArPSB2ZWMzLmRvdChhbmd1bGFyQ29tcG9uZW50MiwgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVub21pbmF0b3I7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxFZmZlY3RpdmVNYXNzID0gY29tcHV0ZUVmZmVjdGl2ZU1hc3Mobm9ybWFsKTtcbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsRWZmZWN0aXZlTWFzcyA8PSAwKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsSW1wdWxzZU1hZ25pdHVkZSA9IGltcHVsc2VTY2FsYXIgPiAwID8gaW1wdWxzZVNjYWxhciAvIG5vcm1hbEVmZmVjdGl2ZU1hc3MgOiAwO1xuICAgICAgICAgICAgICAgIGlmIChub3JtYWxJbXB1bHNlTWFnbml0dWRlID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxJbXB1bHNlID0gdmVjMy5zY2FsZShub3JtYWwsIG5vcm1hbEltcHVsc2VNYWduaXR1ZGUsIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW52ZXJzZU1hc3MxID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYjEubGluZWFyVmVsb2NpdHkuc3VidHJhY3QodmVjMy5zY2FsZShub3JtYWxJbXB1bHNlLCBpbnZlcnNlTWFzczEsIG5ldyB2ZWMzKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuZ3VsYXJJbXB1bHNlMSA9IGludmVyc2VJbmVydGlhMS50cmFuc2Zvcm0odmVjMy5jcm9zcyhyMSwgbm9ybWFsSW1wdWxzZSwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYjEuYW5ndWxhclZlbG9jaXR5LnN1YnRyYWN0KGFuZ3VsYXJJbXB1bHNlMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGIyICYmIGludmVyc2VNYXNzMiA+IDAgJiYgcjIgJiYgaW52ZXJzZUluZXJ0aWEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiMi5saW5lYXJWZWxvY2l0eS5hZGQodmVjMy5zY2FsZShub3JtYWxJbXB1bHNlLCBpbnZlcnNlTWFzczIsIG5ldyB2ZWMzKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuZ3VsYXJJbXB1bHNlMiA9IGludmVyc2VJbmVydGlhMi50cmFuc2Zvcm0odmVjMy5jcm9zcyhyMiwgbm9ybWFsSW1wdWxzZSwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYjIuYW5ndWxhclZlbG9jaXR5LmFkZChhbmd1bGFySW1wdWxzZTIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZyaWN0aW9uXG4gICAgICAgICAgICAgICAgLy8gLS0tIFRhbmdlbnRpYWwgRnJpY3Rpb24gKHN0aWNr4oCTc2xpcCkgLS0tXG4gICAgICAgICAgICAgICAgaWYgKHRhbmdlbnRMZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZyaWN0aW9uRWZmZWN0aXZlTWFzcyA9IGNvbXB1dGVFZmZlY3RpdmVNYXNzKHRhbmdlbnREaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZnJpY3Rpb25FZmZlY3RpdmVNYXNzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVzaXJlZCBpbXB1bHNlIHRvIHplcm8gdGFuZ2VudGlhbCB2ZWxvY2l0eSAoc3RhdGljIGF0dGVtcHQpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQganQgPSAtdmVjMy5kb3QocmVsYXRpdmVWZWxvY2l0eSwgdGFuZ2VudERpcmVjdGlvbikgLyBmcmljdGlvbkVmZmVjdGl2ZU1hc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqbiA9IE1hdGguYWJzKG5vcm1hbEltcHVsc2VNYWduaXR1ZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbXVfcyA9IHRoaXMuZnJpY3Rpb24gKiAxLjU7IC8vIHN0YXRpYyBmcmljdGlvbiBjb2VmZmljaWVudCAodHVuZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG11X2QgPSB0aGlzLmZyaWN0aW9uOyAvLyBkeW5hbWljIGZyaWN0aW9uIGNvZWZmaWNpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDbGFtcCBmb3Igc3RpY2sgb3Igc2xpcFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGp0KSA8PSBtdV9zICogam4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGF0aWMgZnJpY3Rpb246IHVzZSBleGFjdGx5IHdoYXQncyBuZWVkZWQgdG8gc3RvcCB0YW5nZW50aWFsIG1vdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIChqdCBhbHJlYWR5IGNvbXB1dGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRHluYW1pYyBmcmljdGlvbjogY2xhbXAgdG8gQ291bG9tYiBib3VuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGp0ID0gTWF0aC5zaWduKGp0KSAqIG11X2QgKiBqbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqdCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZyaWN0aW9uSW1wdWxzZSA9IHZlYzMuc2NhbGUodGFuZ2VudERpcmVjdGlvbiwganQsIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnZlcnNlTWFzczEgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIxLmxpbmVhclZlbG9jaXR5LnN1YnRyYWN0KHZlYzMuc2NhbGUoZnJpY3Rpb25JbXB1bHNlLCBpbnZlcnNlTWFzczEsIG5ldyB2ZWMzKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5ndWxhckltcHVsc2UxID0gaW52ZXJzZUluZXJ0aWExLnRyYW5zZm9ybSh2ZWMzLmNyb3NzKHIxLCBmcmljdGlvbkltcHVsc2UsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYjEuYW5ndWxhclZlbG9jaXR5LnN1YnRyYWN0KGFuZ3VsYXJJbXB1bHNlMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiMiAmJiBpbnZlcnNlTWFzczIgPiAwICYmIHIyICYmIGludmVyc2VJbmVydGlhMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiMi5saW5lYXJWZWxvY2l0eS5hZGQodmVjMy5zY2FsZShmcmljdGlvbkltcHVsc2UsIGludmVyc2VNYXNzMiwgbmV3IHZlYzMoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbmd1bGFySW1wdWxzZTIgPSBpbnZlcnNlSW5lcnRpYTIudHJhbnNmb3JtKHZlYzMuY3Jvc3MocjIsIGZyaWN0aW9uSW1wdWxzZSwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiMi5hbmd1bGFyVmVsb2NpdHkuYWRkKGFuZ3VsYXJJbXB1bHNlMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXNvbHZlUG9zaXRpb25zKCkge1xuICAgICAgICBsZXQgYXBwbGllZENvcnJlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgLy8gSU1QT1JUQU5UOiBvbmUgY29ycmVjdGlvbiBwZXIgbWFuaWZvbGQgKHBhaXIpLCB1c2luZyBNQVggcGVuZXRyYXRpb24gYWNyb3NzIGNvbnRhY3RzLlxuICAgICAgICB0aGlzLmNvbGxpc2lvbk1hbmlmb2xkcy5mb3JFYWNoKCh7IGJvZGllcywgY29sbGlzaW9ucyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYjEsIGIyXSA9IGJvZGllcztcbiAgICAgICAgICAgIC8vIFBpY2sgdGhlIGRlZXBlc3QgY29udGFjdCBhbmQgYSBzdGFibGUgbm9ybWFsIGZvciB0aGUgcGFpclxuICAgICAgICAgICAgbGV0IG1heERlcHRoID0gMDtcbiAgICAgICAgICAgIGxldCBjaG9zZW5Ob3JtYWwgPSBudWxsO1xuICAgICAgICAgICAgbGV0IGNob3NlbkNvbnRhY3QgPSBudWxsO1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IGNvbnRhY3QsIG5vcm1hbDogbkluLCBkaXN0YW5jZSB9IG9mIGNvbGxpc2lvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXB0aCA9IE1hdGgubWF4KGRpc3RhbmNlIC0gcGVuZXRyYXRpb25Ub2xlcmFuY2UsIDApO1xuICAgICAgICAgICAgICAgIGlmIChkZXB0aCA+IG1heERlcHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heERlcHRoID0gZGVwdGg7XG4gICAgICAgICAgICAgICAgICAgIGNob3NlbkNvbnRhY3QgPSBjb250YWN0O1xuICAgICAgICAgICAgICAgICAgICAvLyBPcmllbnQgbm9ybWFsIGRldGVybWluaXN0aWNhbGx5XG4gICAgICAgICAgICAgICAgICAgIGNob3Nlbk5vcm1hbCA9IHRoaXMub3JpZW50Tm9ybWFsRm9yUGFpcihuSW4sIGNvbnRhY3QsIGIxLCBiMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjaG9zZW5Ob3JtYWwgfHwgIWNob3NlbkNvbnRhY3QgfHwgbWF4RGVwdGggPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZvciBwb3NpdGlvbiBjb3JyZWN0aW9uOlxuICAgICAgICAgICAgLy8gLSBEbyBub3QgbW92ZSBCaXBlZCBpbiBkeW5hbWljLWR5bmFtaWMgcGFpcnMgKGxldCB0aGUgb3RoZXIgYm9keSBtb3ZlKVxuICAgICAgICAgICAgLy8gLSBBbGxvdyBCaXBlZCB0byBiZSBjb3JyZWN0ZWQgYWdhaW5zdCBzdGF0aWMgY29sbGlkZXJzIChiMiA9PT0gbnVsbClcbiAgICAgICAgICAgIGNvbnN0IGIxSXNCaXBlZCA9IGIxLnR5cGUgPT09ICdCaXBlZCc7XG4gICAgICAgICAgICBjb25zdCBiMklzQmlwZWQgPSBiMiA/IGIyLnR5cGUgPT09ICdCaXBlZCcgOiBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IGludk1hc3MxQmFzZSA9IGIxLm1hc3MgPiAwID8gMS4wIC8gYjEubWFzcyA6IDA7XG4gICAgICAgICAgICBjb25zdCBpbnZNYXNzMkJhc2UgPSBiMiA/IChiMi5tYXNzID4gMCA/IDEuMCAvIGIyLm1hc3MgOiAwKSA6IDA7XG4gICAgICAgICAgICBjb25zdCBpbnZlcnNlTWFzczEgPSBiMUlzQmlwZWQgJiYgYjIgPyAwIDogaW52TWFzczFCYXNlO1xuICAgICAgICAgICAgY29uc3QgaW52ZXJzZU1hc3MyID0gYjIgPyAoYjJJc0JpcGVkID8gMCA6IGludk1hc3MyQmFzZSkgOiAwO1xuICAgICAgICAgICAgY29uc3QgdG90YWxJbnZlcnNlTWFzcyA9IGludmVyc2VNYXNzMSArIGludmVyc2VNYXNzMjtcbiAgICAgICAgICAgIGlmICh0b3RhbEludmVyc2VNYXNzID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIC8vIFNpbmdsZSBjb3JyZWN0aW9uIGZvciB0aGUgcGFpclxuICAgICAgICAgICAgbGV0IGNvcnJlY3Rpb25NYWduaXR1ZGUgPSAobWF4RGVwdGggKiBwb3NpdGlvbkNvcnJlY3Rpb25GYWN0b3IpIC8gdG90YWxJbnZlcnNlTWFzcztcbiAgICAgICAgICAgIC8vIENsYW1wIHBlci1zdGVwIGNvcnJlY3Rpb24uIEZvciBiaXBlZC12cy1keW5hbWljIHBhaXJzLCBzY2FsZSB0aGUgY2xhbXAgc28gdGhhdCB0aGVcbiAgICAgICAgICAgIC8vIG5vbi1iaXBlZCBib2R5IGNhbiBtb3ZlIHVwIHRvIGEgZml4ZWQgYW1vdW50IHJlZ2FyZGxlc3Mgb2YgaXRzIG1hc3MuXG4gICAgICAgICAgICBsZXQgcGVyU3RlcENsYW1wID0gcG9zaXRpb25Db3JyZWN0aW9uUGVyU3RlcDtcbiAgICAgICAgICAgIGlmIChiMiAmJiBiMUlzQmlwZWQgJiYgaW52ZXJzZU1hc3MyID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBiMiBjYW4gbW92ZSB1cCB0byBiaXBlZER5bmFtaWNDb3JyZWN0aW9uUGVyU3RlcCB0aGlzIGl0ZXJhdGlvblxuICAgICAgICAgICAgICAgIHBlclN0ZXBDbGFtcCA9IE1hdGgubWF4KHBlclN0ZXBDbGFtcCwgYmlwZWREeW5hbWljQ29ycmVjdGlvblBlclN0ZXAgLyBpbnZlcnNlTWFzczIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIWIyICYmIGIxSXNCaXBlZCkge1xuICAgICAgICAgICAgICAgIC8vIGJpcGVkIHZzIHN0YXRpYzoga2VlcCBkZWZhdWx0IGNsYW1wXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChiMklzQmlwZWQgJiYgaW52ZXJzZU1hc3MxID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIEVuc3VyZSBiMSBjYW4gbW92ZSB1cCB0byBiaXBlZER5bmFtaWNDb3JyZWN0aW9uUGVyU3RlcCB0aGlzIGl0ZXJhdGlvblxuICAgICAgICAgICAgICAgIHBlclN0ZXBDbGFtcCA9IE1hdGgubWF4KHBlclN0ZXBDbGFtcCwgYmlwZWREeW5hbWljQ29ycmVjdGlvblBlclN0ZXAgLyBpbnZlcnNlTWFzczEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvcnJlY3Rpb25NYWduaXR1ZGUgPiBwZXJTdGVwQ2xhbXApIHtcbiAgICAgICAgICAgICAgICBjb3JyZWN0aW9uTWFnbml0dWRlID0gcGVyU3RlcENsYW1wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29ycmVjdGlvbiA9IHZlYzMuc2NhbGUoY2hvc2VuTm9ybWFsLCBjb3JyZWN0aW9uTWFnbml0dWRlLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgIC8vIE1vdmUgYjEgb3Bwb3NpdGUgbiwgYjIgYWxvbmcgbiAoc2FtZSBwYWlyaW5nIGFzIHZlbG9jaXR5IGltcHVsc2VzKVxuICAgICAgICAgICAgaWYgKGludmVyc2VNYXNzMSA+IDApIHtcbiAgICAgICAgICAgICAgICBiMS5hcHBseVBvc2l0aW9uQ29ycmVjdGlvbih2ZWMzLnNjYWxlKGNvcnJlY3Rpb24sIC1pbnZlcnNlTWFzczEsIG5ldyB2ZWMzKCkpKTtcbiAgICAgICAgICAgICAgICBhcHBsaWVkQ29ycmVjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYjIgJiYgaW52ZXJzZU1hc3MyID4gMCkge1xuICAgICAgICAgICAgICAgIGIyLmFwcGx5UG9zaXRpb25Db3JyZWN0aW9uKHZlYzMuc2NhbGUoY29ycmVjdGlvbiwgK2ludmVyc2VNYXNzMiwgbmV3IHZlYzMoKSkpO1xuICAgICAgICAgICAgICAgIGFwcGxpZWRDb3JyZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhcHBsaWVkQ29ycmVjdGlvbjtcbiAgICB9XG4gICAgdXBkYXRlQmlwZWRHcm91bmRTdGF0ZSgpIHtcbiAgICAgICAgLy8gTWFyayBiaXBlZHMgYXMgb25Hcm91bmQgb25seSBpZiBjb250YWN0IGlzIGJlbG93IGNlbnRlciBBTkRcbiAgICAgICAgLy8gdGhlIHN1cmZhY2Ugbm9ybWFsIGlzIHN1ZmZpY2llbnRseSB1cHdhcmQgKG5vdCBhIHdhbGwpLlxuICAgICAgICB0aGlzLmNvbGxpc2lvbk1hbmlmb2xkcy5mb3JFYWNoKCh7IGJvZGllcywgY29sbGlzaW9ucyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYjEsIGIyXSA9IGJvZGllcztcbiAgICAgICAgICAgIGNvbnN0IGIxSXNCaXBlZCA9IGIxLnR5cGUgPT09ICdCaXBlZCc7XG4gICAgICAgICAgICBjb25zdCBiMklzQmlwZWQgPSBiMiA/IGIyLnR5cGUgPT09ICdCaXBlZCcgOiBmYWxzZTtcbiAgICAgICAgICAgIGlmICghYjFJc0JpcGVkICYmICFiMklzQmlwZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY29sbGlzaW9ucy5mb3JFYWNoKCh7IGNvbnRhY3QsIG5vcm1hbCB9KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNHcm91bmRpc2ggPSBub3JtYWwueSA+PSBncm91bmRNaW5Ob3JtYWxZO1xuICAgICAgICAgICAgICAgIGlmIChiMUlzQmlwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcjEgPSB2ZWMzLnN1YnRyYWN0KGNvbnRhY3QsIGIxLnZvbHVtZS5jZW50ZXIsIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocjEueSA8IDAgJiYgaXNHcm91bmRpc2gpXG4gICAgICAgICAgICAgICAgICAgICAgICBiMS5vbkdyb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChiMiAmJiBiMklzQmlwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcjIgPSB2ZWMzLnN1YnRyYWN0KGNvbnRhY3QsIGIyLnZvbHVtZS5jZW50ZXIsIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocjIueSA8IDAgJiYgaXNHcm91bmRpc2gpXG4gICAgICAgICAgICAgICAgICAgICAgICBiMi5vbkdyb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgU2NlbmUucHJvdG90eXBlLCBcImdyYXZpdHlcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBTY2VuZS5wcm90b3R5cGUsIFwiZnJpY3Rpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBTY2VuZS5wcm90b3R5cGUsIFwicmVzdGl0dXRpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBTY2VuZS5wcm90b3R5cGUsIFwibGluZWFyRGFtcGluZ1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFNjZW5lLnByb3RvdHlwZSwgXCJhbmd1bGFyRGFtcGluZ1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKEVudGl0eSksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE9iamVjdClcbl0sIFNjZW5lLnByb3RvdHlwZSwgXCJlbnRpdGllc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKENvbGxpZGVyKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgU2NlbmUucHJvdG90eXBlLCBcImNvbGxpZGVyc1wiLCB2b2lkIDApO1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xudmFyIF9fbWV0YWRhdGEgPSAodGhpcyAmJiB0aGlzLl9fbWV0YWRhdGEpIHx8IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xufTtcbmltcG9ydCB7IFNlcmlhbGl6ZSwgU2VyaWFsaXphYmxlLCBVbmlmb3JtIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuaW1wb3J0IHsgbWF0MywgbWF0NCwgcXVhdCwgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICBzY2FsZSA9IHZlYzMub25lLmNvcHkoKTtcbiAgICByb3RhdGlvbiA9IHF1YXQuaWRlbnRpdHkuY29weSgpO1xuICAgIHRyYW5zbGF0aW9uID0gdmVjMy56ZXJvLmNvcHkoKTtcbiAgICBkaXJlY3Rpb24gPSBuZXcgdmVjMygpO1xuICAgIG1vZGVsTWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICBub3JtYWxNYXRyaXggPSBuZXcgbWF0MygpO1xuICAgIHJvdGF0aW9uTWF0cml4ID0gbmV3IG1hdDMoKTtcbiAgICBzdGF0aWMgb3JpZ2luID0gbmV3IFRyYW5zZm9ybSgpO1xuICAgIGNvbnN0cnVjdG9yKHsgdHJhbnNsYXRpb24gPSB2ZWMzLnplcm8sIHJvdGF0aW9uID0gcXVhdC5pZGVudGl0eSwgc2NhbGUgPSB2ZWMzLm9uZSB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IHRyYW5zbGF0aW9uLmNvcHkoKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHJvdGF0aW9uLmNvcHkoKTtcbiAgICAgICAgdGhpcy5zY2FsZSA9IHNjYWxlLmNvcHkoKTtcbiAgICB9XG4gICAgdXBkYXRlKGRlbHRhVGltZSkge1xuICAgICAgICBtYXQ0LmNvbnN0cnVjdCh0aGlzLnRyYW5zbGF0aW9uLCB0aGlzLnJvdGF0aW9uLCB0aGlzLnNjYWxlLCB0aGlzLm1vZGVsTWF0cml4KTtcbiAgICAgICAgdGhpcy5tb2RlbE1hdHJpeC50b01hdDModGhpcy5yb3RhdGlvbk1hdHJpeCk7XG4gICAgICAgIHRoaXMucm90YXRpb25NYXRyaXgucm93KDIsIHRoaXMuZGlyZWN0aW9uKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbk1hdHJpeC5pbnZlcnQodGhpcy5ub3JtYWxNYXRyaXgpLnRyYW5zcG9zZSgpO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgVHJhbnNmb3JtLnByb3RvdHlwZSwgXCJzY2FsZVwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHF1YXQpXG5dLCBUcmFuc2Zvcm0ucHJvdG90eXBlLCBcInJvdGF0aW9uXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMylcbl0sIFRyYW5zZm9ybS5wcm90b3R5cGUsIFwidHJhbnNsYXRpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgVHJhbnNmb3JtLnByb3RvdHlwZSwgXCJkaXJlY3Rpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgVHJhbnNmb3JtLnByb3RvdHlwZSwgXCJtb2RlbE1hdHJpeFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBUcmFuc2Zvcm0ucHJvdG90eXBlLCBcIm5vcm1hbE1hdHJpeFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBUcmFuc2Zvcm0ucHJvdG90eXBlLCBcInJvdGF0aW9uTWF0cml4XCIsIHZvaWQgMCk7XG4iLCJleHBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vcmVuZGVyZXIvc3RhdGUnO1xuZXhwb3J0IHsgUmVuZGVyZXIgfSBmcm9tICcuL3JlbmRlcmVyL3JlbmRlcmVyJztcbmV4cG9ydCB7IE1lc2hlcyB9IGZyb20gJy4vbWFuYWdlcnMvbWVzaGVzJztcbmV4cG9ydCB7IEJ1ZmZlcnMgfSBmcm9tICcuL21hbmFnZXJzL2J1ZmZlcnMnO1xuZXhwb3J0IHsgU2hhZGVycyB9IGZyb20gJy4vbWFuYWdlcnMvc2hhZGVycyc7XG5leHBvcnQgeyBUZXh0dXJlcyB9IGZyb20gJy4vbWFuYWdlcnMvdGV4dHVyZXMnO1xuZXhwb3J0IHsgUHJvZ3JhbXMgfSBmcm9tICcuL21hbmFnZXJzL3Byb2dyYW1zJztcbmV4cG9ydCB7IFNhbXBsZXJzIH0gZnJvbSAnLi9tYW5hZ2Vycy9zYW1wbGVycyc7XG5leHBvcnQgeyBSZW5kZXJQYXNzIH0gZnJvbSAnLi9yZW5kZXJlci9wYXNzJztcbmV4cG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4vcmVuZGVyZXIvdGFyZ2V0JztcbmV4cG9ydCB7IFN1cmZhY2UgfSBmcm9tICcuL3JlbmRlcmVyL3N1cmZhY2UnO1xuZXhwb3J0IHsgTWF0ZXJpYWwgfSBmcm9tICcuL3JlbmRlcmVyL21hdGVyaWFsJztcbmV4cG9ydCB7IEFybWF0dXJlIH0gZnJvbSAnLi9yZW5kZXJlci9hcm1hdHVyZSc7XG5leHBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL3JlbmRlcmVyL2FuaW1hdGlvbic7XG5leHBvcnQgeyBQYXJ0aXRpb24gfSBmcm9tICcuL3JlbmRlcmVyL3BhcnRpdGlvbic7XG5leHBvcnQgeyBCb25lIH0gZnJvbSAnLi9yZW5kZXJlci9ib25lJztcbmV4cG9ydCB7IFdlaWdodCB9IGZyb20gJy4vcmVuZGVyZXIvd2VpZ2h0JztcbmV4cG9ydCB7IEtleWZyYW1lLCBTY2FsZUtleWZyYW1lLCBSb3RhdGlvbktleWZyYW1lLCBUcmFuc2xhdGlvbktleWZyYW1lIH0gZnJvbSAnLi9yZW5kZXJlci9rZXlmcmFtZSc7XG4iLCJleHBvcnQgY2xhc3MgQnVmZmVycyB7XG4gICAgZ2w7XG4gICAgYnVmZmVycyA9IFtdO1xuICAgIGJvdW5kQnVmZmVycyA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKGdsKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB9XG4gICAgY3JlYXRlKHRhcmdldCwgZGF0YSkge1xuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xuICAgICAgICAgICAgY2FzZSAnRnJhbWVCdWZmZXInOlxuICAgICAgICAgICAgICAgIGNvbnN0IGZyYW1lQnVmZmVyID0gdGhpcy5nbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIGZyYW1lQnVmZmVyLnRhcmdldCA9IHRoaXMuZ2wuRlJBTUVCVUZGRVI7XG4gICAgICAgICAgICAgICAgZnJhbWVCdWZmZXIuYXR0YWNobWVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcnMucHVzaChmcmFtZUJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyYW1lQnVmZmVyO1xuICAgICAgICAgICAgY2FzZSAnUmVuZGVyQnVmZmVyJzpcbiAgICAgICAgICAgICAgICBjb25zdCByZW5kZXJCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIHJlbmRlckJ1ZmZlci50YXJnZXQgPSB0aGlzLmdsLlJFTkRFUkJVRkZFUjtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcnMucHVzaChyZW5kZXJCdWZmZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZW5kZXJCdWZmZXI7XG4gICAgICAgICAgICBjYXNlICdVbmlmb3JtQnVmZmVyJzpcbiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci50YXJnZXQgPSB0aGlzLmdsLlVOSUZPUk1fQlVGRkVSO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci51c2FnZSA9IHRoaXMuZ2wuRFlOQU1JQ19EUkFXO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKGJ1ZmZlciwgZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVycy5wdXNoKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGJ1ZmZlciB0YXJnZXQ6ICR7dGFyZ2V0fWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZShidWZmZXIsIGRhdGEsIG9mZnNldCkge1xuICAgICAgICB0aGlzLmJpbmQoYnVmZmVyKTtcbiAgICAgICAgaWYgKG9mZnNldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmJ1ZmZlclN1YkRhdGEoYnVmZmVyLnRhcmdldCwgb2Zmc2V0LCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuYnVmZmVyRGF0YShidWZmZXIudGFyZ2V0LCBkYXRhLCBidWZmZXIudXNhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcm1hdChidWZmZXIsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLmJpbmQoYnVmZmVyKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKGJ1ZmZlci50YXJnZXQsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuICAgIGF0dGFjaChmcmFtZUJ1ZmZlciwgZGF0YSwgYXR0YWNobWVudCkge1xuICAgICAgICB0aGlzLmJpbmQoZnJhbWVCdWZmZXIpO1xuICAgICAgICBzd2l0Y2ggKGRhdGEudGFyZ2V0KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuVEVYVFVSRV8yRDpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGZyYW1lQnVmZmVyLnRhcmdldCwgYXR0YWNobWVudCwgZGF0YS50YXJnZXQsIGRhdGEsIDApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmdsLlJFTkRFUkJVRkZFUjpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGZyYW1lQnVmZmVyLnRhcmdldCwgYXR0YWNobWVudCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIGRhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmdsLmNoZWNrRnJhbWVidWZmZXJTdGF0dXModGhpcy5nbC5GUkFNRUJVRkZFUikgIT09IHRoaXMuZ2wuRlJBTUVCVUZGRVJfQ09NUExFVEUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRnJhbWVidWZmZXIgaXMgaW5jb21wbGV0ZScpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lQnVmZmVyLmF0dGFjaG1lbnRzW2F0dGFjaG1lbnRdID0gZGF0YTtcbiAgICB9XG4gICAgYmluZChidWZmZXIpIHtcbiAgICAgICAgY29uc3QgeyB0YXJnZXQgfSA9IGJ1ZmZlcjtcbiAgICAgICAgY29uc3QgYm91bmRCdWZmZXIgPSB0aGlzLmJvdW5kQnVmZmVyc1t0YXJnZXRdO1xuICAgICAgICBpZiAoYm91bmRCdWZmZXIgPT09IGJ1ZmZlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRlJBTUVCVUZGRVI6XG4gICAgICAgICAgICAgICAgLypjb25zdCBmcmFtZUJ1ZmZlciA9IGJ1ZmZlciBhcyBGcmFtZUJ1ZmZlclxuICAgICAgICBcbiAgICAgICAgICAgICAgICBPYmplY3QudmFsdWVzKGZyYW1lQnVmZmVyLmF0dGFjaG1lbnRzKS5mb3JFYWNoKChhdHRhY2htZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0dXJlID0gYXR0YWNobWVudCBhcyBUZXh0dXJlXG4gICAgICAgICAgICAgICAgICBjb25zdCB7IHRhcmdldCwgdXNlTWlwbWFwcyB9ID0gdGV4dHVyZVxuICAgICAgICBcbiAgICAgICAgICAgICAgICAgIGlmICh1c2VNaXBtYXBzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXh0dXJlKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmdlbmVyYXRlTWlwbWFwKHRhcmdldClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSovXG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGFyZ2V0LCBidWZmZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmdsLlJFTkRFUkJVRkZFUjpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRSZW5kZXJidWZmZXIodGFyZ2V0LCBidWZmZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGFyZ2V0LCBidWZmZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm91bmRCdWZmZXJzW3RhcmdldF0gPSBidWZmZXI7XG4gICAgfVxuICAgIHVuYmluZCh0YXJnZXQpIHtcbiAgICAgICAgc3dpdGNoICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGNhc2UgJ0ZyYW1lQnVmZmVyJzpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1JlbmRlckJ1ZmZlcic6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCBudWxsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1VuaWZvcm1CdWZmZXInOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLlVOSUZPUk1fQlVGRkVSLCBudWxsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImNvbnN0IHZlcnRleFNpemUgPSA4OyAvLyBwb3NpdGlvbiAoeHl6KSArIG5vcm1hbCAoeHl6KSArIHRleHR1cmUgY29vcmRpbmF0ZXMgKHV2KVxuY29uc3Qgc3RyaWRlID0gdmVydGV4U2l6ZSAqIEZsb2F0MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVDtcbmV4cG9ydCBjbGFzcyBNZXNoZXMge1xuICAgIGdsO1xuICAgIGNvbnN0cnVjdG9yKGdsKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB9XG4gICAgY3JlYXRlKHBhcnRpdGlvbiwgbWF0ZXJpYWwpIHtcbiAgICAgICAgaWYgKCFwYXJ0aXRpb24udG9wb2xvZ3kpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWVzaCBoYXMgbm8gdG9wb2xvZ3knKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhcnRpdGlvbi52ZXJ0aWNlcyB8fCBwYXJ0aXRpb24udmVydGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01lc2ggaGFzIG5vIHZlcnRpY2VzJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmVydGV4QXJyYXkgPSB0aGlzLmdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gICAgICAgIHZlcnRleEFycmF5LnRvcG9sb2d5ID0gcGFydGl0aW9uLnRvcG9sb2d5O1xuICAgICAgICB2ZXJ0ZXhBcnJheS52ZXJ0ZXhDb3VudCA9IHBhcnRpdGlvbi52ZXJ0aWNlcy5sZW5ndGggLyB2ZXJ0ZXhTaXplO1xuICAgICAgICBjb25zdCB2ZXJ0ZXhCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBjb25zdCB2ZXJ0aWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGl0aW9uLnZlcnRpY2VzKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xuICAgICAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHZlcnRpY2VzLCB0aGlzLmdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgY29uc3QgYm9uZUluZGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRleEFycmF5LnZlcnRleENvdW50ICogNCk7XG4gICAgICAgIGNvbnN0IGJvbmVXZWlnaHRzID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXhBcnJheS52ZXJ0ZXhDb3VudCAqIDQpO1xuICAgICAgICBwYXJ0aXRpb24ud2VpZ2h0cy5mb3JFYWNoKCh3ZWlnaHQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBib25lSW5kaWNlcy5zZXQod2VpZ2h0LmluZGljZXMsIGluZGV4ICogNCk7XG4gICAgICAgICAgICBib25lV2VpZ2h0cy5zZXQod2VpZ2h0LndlaWdodHMsIGluZGV4ICogNCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBib25lSW5kZXhCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIGJvbmVJbmRleEJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZ2wuYnVmZmVyRGF0YSh0aGlzLmdsLkFSUkFZX0JVRkZFUiwgYm9uZUluZGljZXMsIHRoaXMuZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICBjb25zdCBib25lV2VpZ2h0QnVmZmVyID0gdGhpcy5nbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCBib25lV2VpZ2h0QnVmZmVyKTtcbiAgICAgICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCBib25lV2VpZ2h0cywgdGhpcy5nbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGxldCBpbmRleEJ1ZmZlciA9IG51bGw7XG4gICAgICAgIGlmIChwYXJ0aXRpb24uaW5kaWNlcyAmJiBwYXJ0aXRpb24uaW5kaWNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpbmRleEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgICAgICBjb25zdCBpbmRpY2VzID0gbmV3IFVpbnQxNkFycmF5KHBhcnRpdGlvbi5pbmRpY2VzKTtcbiAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGhpcy5nbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlcywgdGhpcy5nbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheS5pbmRleENvdW50ID0gaW5kaWNlcy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheS5pbmRleENvdW50ID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdsLmJpbmRWZXJ0ZXhBcnJheSh2ZXJ0ZXhBcnJheSk7XG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcbiAgICAgICAgLy8gcG9zaXRpb25cbiAgICAgICAgdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgwKTtcbiAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDAsIDMsIHRoaXMuZ2wuRkxPQVQsIGZhbHNlLCBzdHJpZGUsIDApO1xuICAgICAgICAvLyBub3JtYWxcbiAgICAgICAgdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgxKTtcbiAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDEsIDMsIHRoaXMuZ2wuRkxPQVQsIHRydWUsIHN0cmlkZSwgMyAqIEZsb2F0MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVCk7XG4gICAgICAgIC8vIGNvb3JkaW5hdGVzXG4gICAgICAgIHRoaXMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoMik7XG4gICAgICAgIHRoaXMuZ2wudmVydGV4QXR0cmliUG9pbnRlcigyLCAyLCB0aGlzLmdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLCA2ICogRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKTtcbiAgICAgICAgLy8gYm9uZSBpbmRpY2VzXG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgYm9uZUluZGV4QnVmZmVyKTtcbiAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDMsIDQsIHRoaXMuZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgzKTtcbiAgICAgICAgLy8gYm9uZSB3ZWlnaHRzXG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgYm9uZVdlaWdodEJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZ2wudmVydGV4QXR0cmliUG9pbnRlcig0LCA0LCB0aGlzLmdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICAgIHRoaXMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoNCk7XG4gICAgICAgIC8vIGluZGljZXNcbiAgICAgICAgaWYgKGluZGV4QnVmZmVyICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgICAgIHJldHVybiB7IHZlcnRleEFycmF5LCBtYXRlcmlhbCB9O1xuICAgIH1cbiAgICByZW5kZXIobWVzaCkge1xuICAgICAgICBjb25zdCB7IHZlcnRleEFycmF5IH0gPSBtZXNoO1xuICAgICAgICBjb25zdCB7IHRvcG9sb2d5LCB2ZXJ0ZXhDb3VudCwgaW5kZXhDb3VudCB9ID0gdmVydGV4QXJyYXk7XG4gICAgICAgIGlmICghdmVydGV4QXJyYXkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWVzaCBoYXMgbm8gdmVydGV4IGFycmF5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG1vZGU7XG4gICAgICAgIHN3aXRjaCAodG9wb2xvZ3kpIHtcbiAgICAgICAgICAgIGNhc2UgJ1BvaW50cyc6XG4gICAgICAgICAgICAgICAgbW9kZSA9IHRoaXMuZ2wuUE9JTlRTO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTGluZXMnOlxuICAgICAgICAgICAgICAgIG1vZGUgPSB0aGlzLmdsLkxJTkVTO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTGluZUxvb3AnOlxuICAgICAgICAgICAgICAgIG1vZGUgPSB0aGlzLmdsLkxJTkVfTE9PUDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0xpbmVTdHJpcCc6XG4gICAgICAgICAgICAgICAgbW9kZSA9IHRoaXMuZ2wuTElORV9TVFJJUDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1RyaWFuZ2xlcyc6XG4gICAgICAgICAgICAgICAgbW9kZSA9IHRoaXMuZ2wuVFJJQU5HTEVTO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnVHJpYW5nbGVGYW4nOlxuICAgICAgICAgICAgICAgIG1vZGUgPSB0aGlzLmdsLlRSSUFOR0xFX0ZBTjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1RyaWFuZ2xlU3RyaXAnOlxuICAgICAgICAgICAgICAgIG1vZGUgPSB0aGlzLmdsLlRSSUFOR0xFX1NUUklQO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdG9wb2xvZ3k6ICR7dG9wb2xvZ3l9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC5iaW5kVmVydGV4QXJyYXkodmVydGV4QXJyYXkpO1xuICAgICAgICBpZiAodmVydGV4QXJyYXkuaW5kZXhDb3VudCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZHJhd0VsZW1lbnRzKG1vZGUsIGluZGV4Q291bnQsIHRoaXMuZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nbC5kcmF3QXJyYXlzKG1vZGUsIDAsIHZlcnRleENvdW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUHJvZ3JhbXMge1xuICAgIGdsO1xuICAgIHByb2dyYW1zID0gW107XG4gICAgdXNlZFByb2dyYW07IC8vIFRPRE86IHNob3VsZCBiZSAnYm91bmRQcm9ncmFtJyBmb3Igc2FrZSBvZiBjb25zaXN0ZW5jeVxuICAgIGNvbnN0cnVjdG9yKGdsKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB9XG4gICAgY3JlYXRlKHZlcnRleFNoYWRlciwgZnJhZ21lbnRTaGFkZXIsIGRhdGEpIHtcbiAgICAgICAgbGV0IHByb2dyYW0gPSB0aGlzLmdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgdGhpcy5nbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4U2hhZGVyKTtcbiAgICAgICAgdGhpcy5nbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICB0aGlzLmdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuICAgICAgICBjb25zdCBsaW5rZWQgPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgdGhpcy5nbC5MSU5LX1NUQVRVUyk7XG4gICAgICAgIGlmICghbGlua2VkIHx8ICF0aGlzLmdsLmlzUHJvZ3JhbShwcm9ncmFtKSkge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25zb2xlXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHRoaXMuZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXR1cEF0dHJpYnV0ZXMocHJvZ3JhbSk7XG4gICAgICAgIHRoaXMuc2V0dXBVbmlmb3Jtcyhwcm9ncmFtKTtcbiAgICAgICAgdGhpcy5zZXR1cFVuaWZvcm1CbG9ja3MocHJvZ3JhbSk7XG4gICAgICAgIHRoaXMuc2V0dXBUZXh1cmVTbG90cyhwcm9ncmFtKTtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHByb2dyYW0sIGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvZ3JhbXMucHVzaChwcm9ncmFtKTtcbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgfVxuICAgIHVwZGF0ZShwcm9ncmFtLCBkYXRhKSB7XG4gICAgICAgIHRoaXMudXNlKHByb2dyYW0pO1xuICAgICAgICBpZiAoZGF0YS51bmlmb3Jtcykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoZGF0YS51bmlmb3JtcykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZGF0YS51bmlmb3Jtc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdTa2lwcGluZyB1bmRlZmluZWQgdW5pZm9ybSB2YWx1ZTonLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCB1bmlmb3JtID0gcHJvZ3JhbS51bmlmb3Jtc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAodW5pZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHVuaWZvcm0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB0aGlzLmdsLlNBTVBMRVJfMkQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzbG90ID0gcHJvZ3JhbS50ZXh0dXJlU2xvdHNbbmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuYWN0aXZlVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkUwICsgc2xvdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0ZXh0dXJlLnRhcmdldCwgdGV4dHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuZ2wuQk9PTDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTFpKHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlID8gMSA6IDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB0aGlzLmdsLklOVDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTFpKHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTFmKHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9WRUMyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtMmZ2KHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9WRUMzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtM2Z2KHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9WRUM0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtNGZ2KHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9NQVQyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtTWF0cml4MmZ2KHVuaWZvcm0ubG9jYXRpb24sIGZhbHNlLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRkxPQVRfTUFUMzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdHJpeCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybU1hdHJpeDNmdih1bmlmb3JtLmxvY2F0aW9uLCBmYWxzZSwgbWF0cml4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9NQVQ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0cml4ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtTWF0cml4NGZ2KHVuaWZvcm0ubG9jYXRpb24sIGZhbHNlLCBtYXRyaXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2V0IHVuaWZvcm0gdmFsdWU6JywgbmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdBdHRlbXB0aW5nIHRvIHVwZGF0ZSBub24tZXhpc3RlbnQgdW5pZm9ybTonLCBuYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS51bmlmb3JtQnVmZmVycykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoZGF0YS51bmlmb3JtQnVmZmVycykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1CbG9jayA9IHByb2dyYW0udW5pZm9ybUJsb2Nrc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAodW5pZm9ybUJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlckJhc2UodGhpcy5nbC5VTklGT1JNX0JVRkZFUiwgdW5pZm9ybUJsb2NrLmluZGV4LCBkYXRhLnVuaWZvcm1CdWZmZXJzW25hbWVdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1c2UocHJvZ3JhbSkge1xuICAgICAgICBpZiAodGhpcy51c2VkUHJvZ3JhbSA9PT0gcHJvZ3JhbSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgICAgdGhpcy51c2VkUHJvZ3JhbSA9IHByb2dyYW07XG4gICAgfVxuICAgIHNldHVwQXR0cmlidXRlcyhwcm9ncmFtKSB7XG4gICAgICAgIHByb2dyYW0uYXR0cmlidXRlcyA9IHt9O1xuICAgICAgICBjb25zdCBhY3RpdmVBdHRyaWJ1dGVzID0gdGhpcy5nbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIHRoaXMuZ2wuQUNUSVZFX0FUVFJJQlVURVMpO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYWN0aXZlQXR0cmlidXRlczsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5nbC5nZXRBY3RpdmVBdHRyaWIocHJvZ3JhbSwgaW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLmdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIGF0dHJpYnV0ZS5uYW1lKTtcbiAgICAgICAgICAgIGF0dHJpYnV0ZS5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgcHJvZ3JhbS5hdHRyaWJ1dGVzW2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXR1cFVuaWZvcm1zKHByb2dyYW0pIHtcbiAgICAgICAgcHJvZ3JhbS51bmlmb3JtcyA9IHt9O1xuICAgICAgICBjb25zdCBhY3RpdmVVbmlmb3JtcyA9IHRoaXMuZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9VTklGT1JNUyk7XG4gICAgICAgIGZvciAobGV0IHVuaWZvcm1JbmRleCA9IDA7IHVuaWZvcm1JbmRleCA8IGFjdGl2ZVVuaWZvcm1zOyB1bmlmb3JtSW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybSA9IHRoaXMuZ2wuZ2V0QWN0aXZlVW5pZm9ybShwcm9ncmFtLCB1bmlmb3JtSW5kZXgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNVbmlmb3JtQXJyYXkodW5pZm9ybSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gdW5pZm9ybS5uYW1lLnJlcGxhY2UoL1xcWzBcXF0kLywgJycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgbmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybS5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtLnVuaWZvcm1zW25hbWVdID0gdW5pZm9ybTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIHVuaWZvcm0ubmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybS5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtLnVuaWZvcm1zW3VuaWZvcm0ubmFtZV0gPSB1bmlmb3JtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXR1cFVuaWZvcm1CbG9ja3MocHJvZ3JhbSkge1xuICAgICAgICBwcm9ncmFtLnVuaWZvcm1CbG9ja3MgPSB7fTtcbiAgICAgICAgY29uc3QgYWN0aXZlVW5pZm9ybUJsb2NrcyA9IHRoaXMuZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9VTklGT1JNX0JMT0NLUyk7XG4gICAgICAgIGZvciAobGV0IGJsb2NrSW5kZXggPSAwOyBibG9ja0luZGV4IDwgYWN0aXZlVW5pZm9ybUJsb2NrczsgYmxvY2tJbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCB1bmlmb3JtQmxvY2tOYW1lID0gdGhpcy5nbC5nZXRBY3RpdmVVbmlmb3JtQmxvY2tOYW1lKHByb2dyYW0sIGJsb2NrSW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybUJsb2NrSW5kZXggPSB0aGlzLmdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHByb2dyYW0sIHVuaWZvcm1CbG9ja05hbWUpO1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybUJsb2NrQmluZGluZyA9IHVuaWZvcm1CbG9ja0luZGV4O1xuICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtQmxvY2tCaW5kaW5nKHByb2dyYW0sIHVuaWZvcm1CbG9ja0luZGV4LCB1bmlmb3JtQmxvY2tCaW5kaW5nKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1JbmRpY2VzID0gdGhpcy5nbC5nZXRBY3RpdmVVbmlmb3JtQmxvY2tQYXJhbWV0ZXIocHJvZ3JhbSwgYmxvY2tJbmRleCwgdGhpcy5nbC5VTklGT1JNX0JMT0NLX0FDVElWRV9VTklGT1JNX0lORElDRVMpO1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybU9mZnNldHMgPSB0aGlzLmdsLmdldEFjdGl2ZVVuaWZvcm1zKHByb2dyYW0sIHVuaWZvcm1JbmRpY2VzLCB0aGlzLmdsLlVOSUZPUk1fT0ZGU0VUKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1PZmZzZXRzQnlOYW1lID0gdW5pZm9ybUluZGljZXMucmVkdWNlKChvZmZzZXRzLCB1bmlmb3JtSW5kZXgsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdW5pZm9ybSA9IHRoaXMuZ2wuZ2V0QWN0aXZlVW5pZm9ybShwcm9ncmFtLCB1bmlmb3JtSW5kZXgpO1xuICAgICAgICAgICAgICAgIG9mZnNldHNbdW5pZm9ybS5uYW1lXSA9IHVuaWZvcm1PZmZzZXRzW2luZGV4XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0cztcbiAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgICAgIHByb2dyYW0udW5pZm9ybUJsb2Nrc1t1bmlmb3JtQmxvY2tOYW1lXSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiB1bmlmb3JtQmxvY2tOYW1lLFxuICAgICAgICAgICAgICAgIGluZGV4OiB1bmlmb3JtQmxvY2tJbmRleCxcbiAgICAgICAgICAgICAgICBiaW5kaW5nOiB1bmlmb3JtQmxvY2tCaW5kaW5nLFxuICAgICAgICAgICAgICAgIG9mZnNldHM6IHVuaWZvcm1PZmZzZXRzQnlOYW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHNldHVwVGV4dXJlU2xvdHMocHJvZ3JhbSkge1xuICAgICAgICBwcm9ncmFtLnRleHR1cmVTbG90cyA9IHt9O1xuICAgICAgICBsZXQgc2xvdCA9IDA7XG4gICAgICAgIHRoaXMudXNlKHByb2dyYW0pO1xuICAgICAgICBPYmplY3Qua2V5cyhwcm9ncmFtLnVuaWZvcm1zKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1bmlmb3JtID0gcHJvZ3JhbS51bmlmb3Jtc1tuYW1lXTtcbiAgICAgICAgICAgIGlmICh1bmlmb3JtLnR5cGUgPT09IHRoaXMuZ2wuU0FNUExFUl8yRCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTFpKHVuaWZvcm0ubG9jYXRpb24sIHNsb3QpO1xuICAgICAgICAgICAgICAgIHByb2dyYW0udGV4dHVyZVNsb3RzW25hbWVdID0gc2xvdDtcbiAgICAgICAgICAgICAgICBzbG90ID0gc2xvdCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpc1VuaWZvcm1BcnJheSh1bmlmb3JtKSB7XG4gICAgICAgIHJldHVybiB1bmlmb3JtLnNpemUgPiAxO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBTYW1wbGVycyB7XG4gICAgZ2w7XG4gICAgc2FtcGxlcnMgPSBbXTtcbiAgICBib3VuZFNhbXBsZXJzID0ge307XG4gICAgY29uc3RydWN0b3IoZ2wpIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgIH1cbiAgICBjcmVhdGUoZmlsdGVyaW5nID0gJ05vbmUnLCB0aWxpbmcgPSAnTm9uZScpIHtcbiAgICAgICAgbGV0IHNhbXBsZXIgPSB0aGlzLmdsLmNyZWF0ZVNhbXBsZXIoKTtcbiAgICAgICAgdGhpcy51cGRhdGUoc2FtcGxlciwgZmlsdGVyaW5nLCB0aWxpbmcpO1xuICAgICAgICB0aGlzLnNhbXBsZXJzLnB1c2goc2FtcGxlcik7XG4gICAgICAgIHJldHVybiBzYW1wbGVyO1xuICAgIH1cbiAgICB1cGRhdGUoc2FtcGxlciwgZmlsdGVyaW5nLCB0aWxpbmcpIHtcbiAgICAgICAgc3dpdGNoIChmaWx0ZXJpbmcpIHtcbiAgICAgICAgICAgIGNhc2UgJ05vbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX01BR19GSUxURVIsIHRoaXMuZ2wuTkVBUkVTVCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy5nbC5ORUFSRVNUKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0xpbmVhcic6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5nbC5ORUFSRVNUKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCB0aGlzLmdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdCaWxpbmVhcic6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5nbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMuZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1RyaWxpbmVhcic6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5nbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMuZ2wuTElORUFSX01JUE1BUF9MSU5FQVIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodGlsaW5nKSB7XG4gICAgICAgICAgICBjYXNlICdSZXBlYXQnOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfUywgdGhpcy5nbC5SRVBFQVQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfVCwgdGhpcy5nbC5SRVBFQVQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTWlycm9yJzpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1MsIHRoaXMuZ2wuTUlSUk9SRURfUkVQRUFUKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1QsIHRoaXMuZ2wuTUlSUk9SRURfUkVQRUFUKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLmdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfVCwgdGhpcy5nbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzYW1wbGVyLmZpbHRlcmluZyA9IGZpbHRlcmluZztcbiAgICAgICAgc2FtcGxlci50aWxpbmcgPSB0aWxpbmc7XG4gICAgfVxuICAgIGJpbmQoc2FtcGxlciwgdW5pdCkge1xuICAgICAgICBpZiAodGhpcy5ib3VuZFNhbXBsZXJzW3VuaXRdID09PSBzYW1wbGVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC5iaW5kU2FtcGxlcih0aGlzLmdsLlRFWFRVUkUwICsgdW5pdCwgc2FtcGxlcik7XG4gICAgICAgIHRoaXMuYm91bmRTYW1wbGVyc1t1bml0XSA9IHNhbXBsZXI7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFNoYWRlcnMge1xuICAgIGdsO1xuICAgIHNoYWRlcnMgPSBbXTtcbiAgICBjb25zdHJ1Y3RvcihnbCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgfVxuICAgIGNyZWF0ZShzdGFnZSwgc291cmNlLCBoZWFkZXJzKSB7XG4gICAgICAgIGxldCB0eXBlO1xuICAgICAgICBzd2l0Y2ggKHN0YWdlKSB7XG4gICAgICAgICAgICBjYXNlICdWZXJ0ZXgnOlxuICAgICAgICAgICAgICAgIHR5cGUgPSB0aGlzLmdsLlZFUlRFWF9TSEFERVI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdGcmFnbWVudCc6XG4gICAgICAgICAgICAgICAgdHlwZSA9IHRoaXMuZ2wuRlJBR01FTlRfU0hBREVSO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoZWFkZXJzICYmIGhlYWRlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGVhZGVyc1xuICAgICAgICAgICAgICAgIC5zbGljZSgpXG4gICAgICAgICAgICAgICAgLnJldmVyc2UoKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBgJHtoZWFkZXJ9XFxuJHtzb3VyY2V9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzaGFkZXIgPSB0aGlzLmdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcbiAgICAgICAgdGhpcy5nbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuICAgICAgICB0aGlzLmdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgICAgc2hhZGVyLmlzQ29tcGlsZWQgPSB0aGlzLmdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIHRoaXMuZ2wuQ09NUElMRV9TVEFUVVMpO1xuICAgICAgICBpZiAoIXNoYWRlci5pc0NvbXBpbGVkIHx8ICF0aGlzLmdsLmlzU2hhZGVyKHNoYWRlcikpIHtcbiAgICAgICAgICAgIHNvdXJjZS5zcGxpdCgnXFxuJykuZm9yRWFjaCgobGluZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtpbmRleCArIDF9XFx0JHtsaW5lfWApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IodGhpcy5nbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikpO1xuICAgICAgICAgICAgdGhpcy5nbC5kZWxldGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2hhZGVycy5wdXNoKHNoYWRlcik7XG4gICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFRleHR1cmVzIHtcbiAgICBnbDtcbiAgICB0ZXh0dXJlcyA9IFtdO1xuICAgIGJvdW5kVGV4dHVyZXMgPSB7fTtcbiAgICBjb25zdHJ1Y3RvcihnbCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgfVxuICAgIGNyZWF0ZShzdXJmYWNlKSB7XG4gICAgICAgIGNvbnN0IHsgZ2wgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGNvbnN0IHsgd2lkdGggPSAxLCBoZWlnaHQgPSAxLCBwcmVjaXNpb24gPSA4LCBmb3JtYXQgPSAnQ29sb3InIH0gPSBzdXJmYWNlO1xuICAgICAgICBjb25zdCB7IHRpbGluZyA9ICdOb25lJywgZmlsdGVyaW5nID0gJ05vbmUnLCB1c2VNaXBtYXBzID0gZmFsc2UgfSA9IHN1cmZhY2U7XG4gICAgICAgIHRleHR1cmUud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGV4dHVyZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRleHR1cmUudGFyZ2V0ID0gZ2wuVEVYVFVSRV8yRDtcbiAgICAgICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgICAgICAgIGNhc2UgJ0NvbG9yJzpcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHByZWNpc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmNvbXBvbmVudHMgPSBnbC5SR0JBO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5kYXRhRm9ybWF0ID0gZ2wuUkdCQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5VTlNJR05FRF9CWVRFO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmNvbXBvbmVudHMgPSBnbC5SR0JBMzJGO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5kYXRhRm9ybWF0ID0gZ2wuUkdCQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5GTE9BVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRleHR1cmUgcHJlY2lzaW9uOiAke3ByZWNpc2lvbn1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdBbHBoYSc6XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwcmVjaXNpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5jb21wb25lbnRzID0gZ2wuQUxQSEE7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmRhdGFGb3JtYXQgPSBnbC5BTFBIQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5VTlNJR05FRF9CWVRFO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmNvbXBvbmVudHMgPSBnbC5BTFBIQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YUZvcm1hdCA9IGdsLkFMUEhBO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5kYXRhVHlwZSA9IGdsLkZMT0FUO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGV4dHVyZSBwcmVjaXNpb246ICR7cHJlY2lzaW9ufWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0RlcHRoJzoge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocHJlY2lzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmNvbXBvbmVudHMgPSBnbC5ERVBUSF9DT01QT05FTlQyNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YUZvcm1hdCA9IGdsLkRFUFRIX0NPTVBPTkVOVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5VTlNJR05FRF9JTlQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuY29tcG9uZW50cyA9IGdsLkRFUFRIX0NPTVBPTkVOVDMyRjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YUZvcm1hdCA9IGdsLkRFUFRIX0NPTVBPTkVOVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5GTE9BVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRleHR1cmUgcHJlY2lzaW9uOiAke3ByZWNpc2lvbn1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZXh0dXJlIGZvcm1hdDogJHtmb3JtYXR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iaW5kKHRleHR1cmUsIDApO1xuICAgICAgICBjb25zdCB7IHRhcmdldCwgY29tcG9uZW50cywgZGF0YUZvcm1hdCwgZGF0YVR5cGUgfSA9IHRleHR1cmU7XG4gICAgICAgIGdsLnRleEltYWdlMkQodGFyZ2V0LCAwLCBjb21wb25lbnRzLCB3aWR0aCwgaGVpZ2h0LCAwLCBkYXRhRm9ybWF0LCBkYXRhVHlwZSwgbnVsbCk7XG4gICAgICAgIHN3aXRjaCAodGlsaW5nKSB7XG4gICAgICAgICAgICBjYXNlICdOb25lJzpcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdSZXBlYXQnOlxuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuUkVQRUFUKTtcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLlJFUEVBVCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdNaXJyb3InOlxuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuTUlSUk9SRURfUkVQRUFUKTtcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLk1JUlJPUkVEX1JFUEVBVCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZXh0dXJlIHRpbGluZzogJHt0aWxpbmd9YCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChmaWx0ZXJpbmcpIHtcbiAgICAgICAgICAgIGNhc2UgJ05vbmUnOlxuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTGluZWFyJzpcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCB1c2VNaXBtYXBzID8gZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUIDogZ2wuTElORUFSKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0JpbGluZWFyJzpcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX01JTl9GSUxURVIsIHVzZU1pcG1hcHMgPyBnbC5MSU5FQVJfTUlQTUFQX05FQVJFU1QgOiBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnVHJpbGluZWFyJzpcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX01JTl9GSUxURVIsIHVzZU1pcG1hcHMgPyBnbC5MSU5FQVJfTUlQTUFQX0xJTkVBUiA6IGdsLkxJTkVBUik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1cmZhY2UuZGF0YSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGUodGV4dHVyZSwgc3VyZmFjZS5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRleHR1cmVzLnB1c2godGV4dHVyZSk7XG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH1cbiAgICB1cGRhdGUodGV4dHVyZSwgZGF0YSwgeCA9IDAsIHkgPSAwLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGNvbnN0IHsgZ2wgfSA9IHRoaXM7XG4gICAgICAgIGlmICh3aWR0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3aWR0aCA9IHRleHR1cmUud2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhlaWdodCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBoZWlnaHQgPSB0ZXh0dXJlLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYmluZCh0ZXh0dXJlLCAwKTtcbiAgICAgICAgY29uc3QgeyB0YXJnZXQsIGNvbXBvbmVudHMsIGRhdGFUeXBlLCB1c2VNaXBtYXBzIH0gPSB0ZXh0dXJlO1xuICAgICAgICBnbC50ZXhTdWJJbWFnZTJEKHRhcmdldCwgMCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgY29tcG9uZW50cywgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgICBpZiAodXNlTWlwbWFwcykge1xuICAgICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICB0ZXh0dXJlLmRhdGEgPSBkYXRhO1xuICAgIH1cbiAgICBiaW5kKHRleHR1cmUsIHVuaXQpIHtcbiAgICAgICAgY29uc3QgeyBnbCB9ID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuYm91bmRUZXh0dXJlc1t1bml0XSA9PT0gdGV4dHVyZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyB1bml0KTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUodGV4dHVyZS50YXJnZXQsIHRleHR1cmUpO1xuICAgICAgICB0aGlzLmJvdW5kVGV4dHVyZXNbdW5pdF0gPSB0ZXh0dXJlO1xuICAgIH1cbn1cbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUsIFNlcmlhbGl6YWJsZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IFNjYWxlS2V5ZnJhbWUsIFJvdGF0aW9uS2V5ZnJhbWUsIFRyYW5zbGF0aW9uS2V5ZnJhbWUgfSBmcm9tICcuL2tleWZyYW1lJztcbmV4cG9ydCBjbGFzcyBLZXlmcmFtZXMgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICAgIHNjYWxlID0gW107XG4gICAgcm90YXRpb24gPSBbXTtcbiAgICB0cmFuc2xhdGlvbiA9IFtdO1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKFNjYWxlS2V5ZnJhbWUpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIEtleWZyYW1lcy5wcm90b3R5cGUsIFwic2NhbGVcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShSb3RhdGlvbktleWZyYW1lKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgQXJyYXkpXG5dLCBLZXlmcmFtZXMucHJvdG90eXBlLCBcInJvdGF0aW9uXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoVHJhbnNsYXRpb25LZXlmcmFtZSksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIEFycmF5KVxuXSwgS2V5ZnJhbWVzLnByb3RvdHlwZSwgXCJ0cmFuc2xhdGlvblwiLCB2b2lkIDApO1xuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAga2V5ZnJhbWVzID0ge307XG4gICAgZHVyYXRpb247XG4gICAgdGltZSA9IDAuMDtcbiAgICB3ZWlnaHQgPSAxLjA7XG4gICAgc3RhdGUgPSAnU3RvcCc7XG4gICAgdXBkYXRlKGRlbHRhVGltZSkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ1BsYXknOlxuICAgICAgICAgICAgICAgIHRoaXMudGltZSArPSBkZWx0YVRpbWU7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGltZSA+PSB0aGlzLmR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnU3RvcCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTG9vcCc6XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lICs9IGRlbHRhVGltZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWUgJT0gdGhpcy5kdXJhdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1BhdXNlJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1N0b3AnOlxuICAgICAgICAgICAgICAgIHRoaXMudGltZSA9IDAuMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShLZXlmcmFtZXMpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBBbmltYXRpb24ucHJvdG90eXBlLCBcImtleWZyYW1lc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIEFuaW1hdGlvbi5wcm90b3R5cGUsIFwiZHVyYXRpb25cIiwgdm9pZCAwKTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IEJvbmUgfSBmcm9tICcuL2JvbmUnO1xuZXhwb3J0IGNsYXNzIEFybWF0dXJlIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICBib25lcyA9IFtdO1xuICAgIHJvb3RCb25lcyA9IFtdO1xuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgICAgIGNvbnN0IGFybWF0dXJlID0gKGF3YWl0IHN1cGVyLmRlc2VyaWFsaXplKGRhdGEpKTtcbiAgICAgICAgYXJtYXR1cmUuYm9uZXMuZm9yRWFjaCgoYm9uZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGJvbmUucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50Qm9uZSA9IGFybWF0dXJlLmJvbmVzLmZpbmQoKHsgbmFtZSB9KSA9PiBuYW1lID09PSBib25lLnBhcmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnRCb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBwYXJlbnQgJHtib25lLnBhcmVudH0gZm9yIGJvbmUgJHtib25lLm5hbWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJvbmUucGFyZW50Qm9uZSA9IHBhcmVudEJvbmU7XG4gICAgICAgICAgICAgICAgcGFyZW50Qm9uZS5jaGlsZEJvbmVzLnB1c2goYm9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcm1hdHVyZS5yb290Qm9uZXMucHVzaChib25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhcm1hdHVyZTtcbiAgICB9XG4gICAgdXBkYXRlKGRlbHRhVGltZSwgYW5pbWF0aW9ucykge1xuICAgICAgICB0aGlzLnJvb3RCb25lcy5mb3JFYWNoKChib25lKSA9PiB7XG4gICAgICAgICAgICBib25lLnVwZGF0ZShkZWx0YVRpbWUsIGFuaW1hdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoQm9uZSksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIEFycmF5KVxuXSwgQXJtYXR1cmUucHJvdG90eXBlLCBcImJvbmVzXCIsIHZvaWQgMCk7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXplLCBTZXJpYWxpemFibGUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzLCBtYXQ0LCBxdWF0IH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJ0BsdXovY29yZSc7XG5leHBvcnQgY2xhc3MgQm9uZSBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAgbmFtZSA9ICcnO1xuICAgIHBhcmVudCA9ICcnO1xuICAgIGhlYWQgPSB2ZWMzLnplcm8uY29weSgpO1xuICAgIHRhaWwgPSB2ZWMzLnplcm8uY29weSgpO1xuICAgIGJpbmRNYXRyaXggPSBtYXQ0LmlkZW50aXR5LmNvcHkoKTtcbiAgICBwYXJlbnRCb25lID0gbnVsbDtcbiAgICBjaGlsZEJvbmVzID0gW107XG4gICAgcG9zZU1hdHJpeCA9IG1hdDQuaWRlbnRpdHkuY29weSgpO1xuICAgIGxvY2FsTWF0cml4ID0gbWF0NC5pZGVudGl0eS5jb3B5KCk7XG4gICAgaW52ZXJzZUJpbmRNYXRyaXggPSBtYXQ0LmlkZW50aXR5LmNvcHkoKTtcbiAgICBjb25zdHJ1Y3Rvcih7IG5hbWUsIHBhcmVudCwgaGVhZCwgdGFpbCwgYmluZE1hdHJpeCB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhlYWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGVhZC5zZXQoaGVhZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhaWwpIHtcbiAgICAgICAgICAgIHRoaXMudGFpbC5zZXQodGFpbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJpbmRNYXRyaXgpIHtcbiAgICAgICAgICAgIHRoaXMuYmluZE1hdHJpeC5zZXQoYmluZE1hdHJpeCk7XG4gICAgICAgICAgICB0aGlzLmJpbmRNYXRyaXguaW52ZXJ0KHRoaXMuaW52ZXJzZUJpbmRNYXRyaXgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZShkZWx0YVRpbWUsIGFuaW1hdGlvbnMpIHtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtcyA9IGFuaW1hdGlvbnMubWFwKChhbmltYXRpb24pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybShhbmltYXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgd2VpZ2h0cyA9IGFuaW1hdGlvbnMubWFwKCh7IHdlaWdodCB9KSA9PiB3ZWlnaHQpO1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSB0aGlzLmJsZW5kVHJhbnNmb3Jtcyh0cmFuc2Zvcm1zLCB3ZWlnaHRzKTtcbiAgICAgICAgY29uc3QgeyB0cmFuc2xhdGlvbiwgcm90YXRpb24sIHNjYWxlIH0gPSB0cmFuc2Zvcm07XG4gICAgICAgIG1hdDQuY29uc3RydWN0KHRyYW5zbGF0aW9uLCByb3RhdGlvbiwgc2NhbGUsIHRoaXMubG9jYWxNYXRyaXgpO1xuICAgICAgICBpZiAodGhpcy5wYXJlbnRCb25lKSB7XG4gICAgICAgICAgICBjb25zdCB7IHBvc2VNYXRyaXggfSA9IHRoaXMucGFyZW50Qm9uZTtcbiAgICAgICAgICAgIG1hdDQubXVsdGlwbHkodGhpcy5sb2NhbE1hdHJpeCwgcG9zZU1hdHJpeCwgdGhpcy5wb3NlTWF0cml4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9zZU1hdHJpeC5jb3B5KHRoaXMubG9jYWxNYXRyaXgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zZU1hdHJpeC5tdWx0aXBseSh0aGlzLmludmVyc2VCaW5kTWF0cml4KTtcbiAgICAgICAgdGhpcy5jaGlsZEJvbmVzLmZvckVhY2goKGJvbmUpID0+IGJvbmUudXBkYXRlKGRlbHRhVGltZSwgYW5pbWF0aW9ucykpO1xuICAgIH1cbiAgICB0cmFuc2Zvcm0oYW5pbWF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGtleWZyYW1lcyA9IGFuaW1hdGlvbi5rZXlmcmFtZXNbdGhpcy5uYW1lXTtcbiAgICAgICAgaWYgKCFrZXlmcmFtZXMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBrZXlmcmFtZXMgZm9yIGJvbmU6ICR7dGhpcy5uYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgdGltZSB9ID0gYW5pbWF0aW9uO1xuICAgICAgICBjb25zdCB7IHRyYW5zbGF0aW9uLCByb3RhdGlvbiwgc2NhbGUgfSA9IGtleWZyYW1lcztcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oe1xuICAgICAgICAgICAgdHJhbnNsYXRpb246IHRoaXMuaW50ZXJwb2xhdGVLZXlmcmFtZXModGltZSwgdHJhbnNsYXRpb24sIHZlYzMuaW50ZXJwb2xhdGUpLFxuICAgICAgICAgICAgcm90YXRpb246IHRoaXMuaW50ZXJwb2xhdGVLZXlmcmFtZXModGltZSwgcm90YXRpb24sIHF1YXQuaW50ZXJwb2xhdGUpLFxuICAgICAgICAgICAgc2NhbGU6IHRoaXMuaW50ZXJwb2xhdGVLZXlmcmFtZXModGltZSwgc2NhbGUsIHZlYzMuaW50ZXJwb2xhdGUpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbnRlcnBvbGF0ZUtleWZyYW1lcyh0aW1lLCBrZXlmcmFtZXMsIGludGVycG9sYXRlKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5ZnJhbWVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgeyB0aW1lOiB0MSwgdmFsdWU6IHYxIH0gPSBrZXlmcmFtZXNbaV07XG4gICAgICAgICAgICBjb25zdCB7IHRpbWU6IHQyLCB2YWx1ZTogdjIgfSA9IGtleWZyYW1lc1tpICsgMV07XG4gICAgICAgICAgICBpZiAodGltZSA+PSB0MSAmJiB0aW1lIDw9IHQyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGludGVycG9sYXRlKHYxLCB2MiwgKHRpbWUgLSB0MSkgLyAodDIgLSB0MSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlmcmFtZXNba2V5ZnJhbWVzLmxlbmd0aCAtIDFdLnZhbHVlO1xuICAgIH1cbiAgICBibGVuZFRyYW5zZm9ybXModHJhbnNmb3Jtcywgd2VpZ2h0cykge1xuICAgICAgICBpZiAodHJhbnNmb3Jtcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBUcmFuc2Zvcm0ub3JpZ2luO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsV2VpZ2h0ID0gd2VpZ2h0cy5yZWR1Y2UoKHRvdGFsLCB3ZWlnaHQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0b3RhbCArIHdlaWdodDtcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIGlmICh0b3RhbFdlaWdodCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFRyYW5zZm9ybS5vcmlnaW47XG4gICAgICAgIH1cbiAgICAgICAgd2VpZ2h0cyA9IHdlaWdodHMubWFwKCh3ZWlnaHQpID0+IHdlaWdodCAvIHRvdGFsV2VpZ2h0KTtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSB2ZWMzLnplcm8uY29weSgpO1xuICAgICAgICBjb25zdCBzY2FsZSA9IHZlYzMuemVyby5jb3B5KCk7XG4gICAgICAgIHRyYW5zZm9ybXMuZm9yRWFjaCgodHJhbnNmb3JtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd2VpZ2h0ID0gd2VpZ2h0c1tpbmRleF07XG4gICAgICAgICAgICB0cmFuc2xhdGlvbi5hZGQodmVjMy5zY2FsZSh0cmFuc2Zvcm0udHJhbnNsYXRpb24sIHdlaWdodCkpO1xuICAgICAgICAgICAgc2NhbGUuYWRkKHZlYzMuc2NhbGUodHJhbnNmb3JtLnNjYWxlLCB3ZWlnaHQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gdHJhbnNmb3Jtc1swXS5yb3RhdGlvbi5jb3B5KCk7XG4gICAgICAgIHRyYW5zZm9ybXMuZm9yRWFjaCgodHJhbnNmb3JtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd2VpZ2h0ID0gd2VpZ2h0c1tpbmRleF07XG4gICAgICAgICAgICBxdWF0LmludGVycG9sYXRlKHJvdGF0aW9uLCB0cmFuc2Zvcm0ucm90YXRpb24sIHdlaWdodCwgcm90YXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oeyB0cmFuc2xhdGlvbiwgcm90YXRpb24sIHNjYWxlIH0pO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBTdHJpbmcpXG5dLCBCb25lLnByb3RvdHlwZSwgXCJuYW1lXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgU3RyaW5nKVxuXSwgQm9uZS5wcm90b3R5cGUsIFwicGFyZW50XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMylcbl0sIEJvbmUucHJvdG90eXBlLCBcImhlYWRcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgQm9uZS5wcm90b3R5cGUsIFwidGFpbFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIG1hdDQpXG5dLCBCb25lLnByb3RvdHlwZSwgXCJiaW5kTWF0cml4XCIsIHZvaWQgMCk7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzLCBxdWF0IH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmV4cG9ydCBjbGFzcyBLZXlmcmFtZSBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAgdGltZTtcbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBLZXlmcmFtZS5wcm90b3R5cGUsIFwidGltZVwiLCB2b2lkIDApO1xuZXhwb3J0IGNsYXNzIFNjYWxlS2V5ZnJhbWUgZXh0ZW5kcyBLZXlmcmFtZSB7XG4gICAgdmFsdWUgPSB2ZWMzLm9uZS5jb3B5KCk7XG59XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMylcbl0sIFNjYWxlS2V5ZnJhbWUucHJvdG90eXBlLCBcInZhbHVlXCIsIHZvaWQgMCk7XG5leHBvcnQgY2xhc3MgUm90YXRpb25LZXlmcmFtZSBleHRlbmRzIEtleWZyYW1lIHtcbiAgICB2YWx1ZSA9IHF1YXQuaWRlbnRpdHkuY29weSgpO1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHF1YXQpXG5dLCBSb3RhdGlvbktleWZyYW1lLnByb3RvdHlwZSwgXCJ2YWx1ZVwiLCB2b2lkIDApO1xuZXhwb3J0IGNsYXNzIFRyYW5zbGF0aW9uS2V5ZnJhbWUgZXh0ZW5kcyBLZXlmcmFtZSB7XG4gICAgdmFsdWUgPSB2ZWMzLnplcm8uY29weSgpO1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHZlYzMpXG5dLCBUcmFuc2xhdGlvbktleWZyYW1lLnByb3RvdHlwZSwgXCJ2YWx1ZVwiLCB2b2lkIDApO1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xudmFyIF9fbWV0YWRhdGEgPSAodGhpcyAmJiB0aGlzLl9fbWV0YWRhdGEpIHx8IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xufTtcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgVW5pZm9ybSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzL3NlcmlhbGl6YWJsZSc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbCBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAgY29sb3IgPSB2ZWMzLm9uZS5jb3B5KCk7XG4gICAgc3VyZmFjZTtcbiAgICB0ZXh0dXJlO1xuICAgIGNvbnN0cnVjdG9yKHsgY29sb3IsIHRleHR1cmUgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmIChjb2xvcikge1xuICAgICAgICAgICAgdGhpcy5jb2xvci5zZXQoY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0dXJlKSB7XG4gICAgICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB9XG4gICAgfVxufVxuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgTWF0ZXJpYWwucHJvdG90eXBlLCBcImNvbG9yXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgTWF0ZXJpYWwucHJvdG90eXBlLCBcInN1cmZhY2VcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgTWF0ZXJpYWwucHJvdG90eXBlLCBcInRleHR1cmVcIiwgdm9pZCAwKTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzL3NlcmlhbGl6YWJsZSc7XG5leHBvcnQgY2xhc3MgUGFydGl0aW9uIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICB0b3BvbG9neSA9ICdUcmlhbmdsZXMnO1xuICAgIHZlcnRpY2VzID0gW107XG4gICAgaW5kaWNlcyA9IFtdO1xuICAgIHdlaWdodHMgPSBbXTtcbiAgICBtYXRlcmlhbDtcbiAgICBtZXNoO1xuICAgIGNvbnN0cnVjdG9yKGRhdGEgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGRhdGEpO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBTdHJpbmcpXG5dLCBQYXJ0aXRpb24ucHJvdG90eXBlLCBcInRvcG9sb2d5XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgQXJyYXkpXG5dLCBQYXJ0aXRpb24ucHJvdG90eXBlLCBcInZlcnRpY2VzXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgQXJyYXkpXG5dLCBQYXJ0aXRpb24ucHJvdG90eXBlLCBcImluZGljZXNcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIFBhcnRpdGlvbi5wcm90b3R5cGUsIFwid2VpZ2h0c1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFBhcnRpdGlvbi5wcm90b3R5cGUsIFwibWF0ZXJpYWxcIiwgdm9pZCAwKTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyB2ZWM0IH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmV4cG9ydCBjbGFzcyBSZW5kZXJQYXNzIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICBjbGVhckNvbG9yID0gdmVjNC56ZXJvLmNvcHkoKTtcbiAgICBjbGVhckRlcHRoID0gMS4wO1xuICAgIGN1bGxNb2RlID0gJ0JhY2snO1xuICAgIGJsZW5kTW9kZSA9ICdOb25lJztcbiAgICBkZXB0aFRlc3QgPSAnTGVzc0VxdWFsJztcbiAgICBkZXB0aE1hc2sgPSB0cnVlO1xuICAgIGNvbG9yTWFzayA9IFt0cnVlLCB0cnVlLCB0cnVlLCB0cnVlXTtcbiAgICB2ZXJ0ZXhTaGFkZXI7XG4gICAgZnJhZ21lbnRTaGFkZXI7XG4gICAgcHJvZ3JhbSA9IG51bGw7XG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGRhdGEpO1xuICAgICAgICB0aGlzLmNsZWFyQ29sb3Iuc2V0KHRoaXMuY2xlYXJDb2xvcik7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgc3VwZXIuZGVzZXJpYWxpemUoZGF0YSkpO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWM0KVxuXSwgUmVuZGVyUGFzcy5wcm90b3R5cGUsIFwiY2xlYXJDb2xvclwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImNsZWFyRGVwdGhcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBTdHJpbmcpXG5dLCBSZW5kZXJQYXNzLnByb3RvdHlwZSwgXCJjdWxsTW9kZVwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImJsZW5kTW9kZVwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImRlcHRoVGVzdFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIEJvb2xlYW4pXG5dLCBSZW5kZXJQYXNzLnByb3RvdHlwZSwgXCJkZXB0aE1hc2tcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImNvbG9yTWFza1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcInZlcnRleFNoYWRlclwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImZyYWdtZW50U2hhZGVyXCIsIHZvaWQgMCk7XG4iLCJpbXBvcnQgeyBDYW1lcmEsIExpZ2h0LCBNb2RlbCwgVHJhbnNmb3JtIH0gZnJvbSAnQGx1ei9jb3JlJztcbmltcG9ydCB7IE1lc2hlcyB9IGZyb20gJy4uL21hbmFnZXJzL21lc2hlcyc7XG5pbXBvcnQgeyBCdWZmZXJzIH0gZnJvbSAnLi4vbWFuYWdlcnMvYnVmZmVycyc7XG5pbXBvcnQgeyBQcm9ncmFtcyB9IGZyb20gJy4uL21hbmFnZXJzL3Byb2dyYW1zJztcbmltcG9ydCB7IFNhbXBsZXJzIH0gZnJvbSAnLi4vbWFuYWdlcnMvc2FtcGxlcnMnO1xuaW1wb3J0IHsgU2hhZGVycyB9IGZyb20gJy4uL21hbmFnZXJzL3NoYWRlcnMnO1xuaW1wb3J0IHsgVGV4dHVyZXMgfSBmcm9tICcuLi9tYW5hZ2Vycy90ZXh0dXJlcyc7XG5pbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHsgTWF0ZXJpYWwgfSBmcm9tICcuL21hdGVyaWFsJztcbmltcG9ydCB7IGdldFVuaWZvcm1Qcm9wZXJ0aWVzIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcbiAgICBnbDtcbiAgICBzdGF0ZTtcbiAgICBzaGFkZXJzO1xuICAgIHByb2dyYW1zO1xuICAgIG1lc2hlcztcbiAgICBidWZmZXJzO1xuICAgIHRleHR1cmVzO1xuICAgIHNhbXBsZXJzO1xuICAgIGRlZmF1bHRUZXh0dXJlO1xuICAgIGRlZmF1bHRNYXRlcmlhbDtcbiAgICBjb25zdHJ1Y3RvcihnbCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBuZXcgU3RhdGUodGhpcy5nbCk7XG4gICAgICAgIHRoaXMubWVzaGVzID0gbmV3IE1lc2hlcyh0aGlzLmdsKTtcbiAgICAgICAgdGhpcy5idWZmZXJzID0gbmV3IEJ1ZmZlcnModGhpcy5nbCk7XG4gICAgICAgIHRoaXMuc2hhZGVycyA9IG5ldyBTaGFkZXJzKHRoaXMuZ2wpO1xuICAgICAgICB0aGlzLnByb2dyYW1zID0gbmV3IFByb2dyYW1zKHRoaXMuZ2wpO1xuICAgICAgICB0aGlzLnRleHR1cmVzID0gbmV3IFRleHR1cmVzKHRoaXMuZ2wpO1xuICAgICAgICB0aGlzLnNhbXBsZXJzID0gbmV3IFNhbXBsZXJzKHRoaXMuZ2wpO1xuICAgICAgICBjb25zdCB0ZXh0dXJlRGF0YSA9IG5ldyBVaW50OEFycmF5KFsweGZmLCAweGZmLCAweGZmLCAweGZmXSk7XG4gICAgICAgIHRoaXMuZGVmYXVsdFRleHR1cmUgPSB0aGlzLnRleHR1cmVzLmNyZWF0ZSh7IGRhdGE6IHRleHR1cmVEYXRhIH0pO1xuICAgICAgICB0aGlzLmRlZmF1bHRNYXRlcmlhbCA9IG5ldyBNYXRlcmlhbCh7IHRleHR1cmU6IHRoaXMuZGVmYXVsdFRleHR1cmUgfSk7XG4gICAgfVxuICAgIHVzZSh0YXJnZXQpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0LCBmcmFtZUJ1ZmZlciB9ID0gdGFyZ2V0O1xuICAgICAgICBpZiAoZnJhbWVCdWZmZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVycy5iaW5kKGZyYW1lQnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVycy51bmJpbmQoJ0ZyYW1lQnVmZmVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG4gICAgbWFzayh7IGNvbG9yLCBkZXB0aCB9KSB7XG4gICAgICAgIGlmIChjb2xvciAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmNvbG9yTWFzayhjb2xvclswXSwgY29sb3JbMV0sIGNvbG9yWzJdLCBjb2xvclszXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlcHRoICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZGVwdGhNYXNrKGRlcHRoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhcih7IGNvbG9yLCBkZXB0aCwgc3RlbmNpbCB9KSB7XG4gICAgICAgIGxldCBjbGVhck1hc2sgPSAwO1xuICAgICAgICBpZiAoY29sb3IgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSBjb2xvcjtcbiAgICAgICAgICAgIHRoaXMuZ2wuY2xlYXJDb2xvcih4LCB5LCB6LCB3KTtcbiAgICAgICAgICAgIGNsZWFyTWFzayB8PSB0aGlzLmdsLkNPTE9SX0JVRkZFUl9CSVQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlcHRoICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuY2xlYXJEZXB0aChkZXB0aCk7XG4gICAgICAgICAgICBjbGVhck1hc2sgfD0gdGhpcy5nbC5ERVBUSF9CVUZGRVJfQklUO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGVuY2lsICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuY2xlYXJTdGVuY2lsKHN0ZW5jaWwpO1xuICAgICAgICAgICAgY2xlYXJNYXNrIHw9IHRoaXMuZ2wuU1RFTkNJTF9CVUZGRVJfQklUO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2wuY2xlYXIoY2xlYXJNYXNrKTtcbiAgICB9XG4gICAgcmVuZGVyUGFzcyhwYXNzLCBjYW1lcmEsIGVudGl0aWVzLCBsaWdodCwgdW5pZm9ybXMpIHtcbiAgICAgICAgLy8gY3VsbCBtb2RlXG4gICAgICAgIHRoaXMuc3RhdGUuY3VsbE1vZGUgPSBwYXNzLmN1bGxNb2RlO1xuICAgICAgICAvLyBibGVuZCBtb2RlXG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRNb2RlID0gcGFzcy5ibGVuZE1vZGU7XG4gICAgICAgIC8vIGRlcHRoIHRlc3RcbiAgICAgICAgdGhpcy5zdGF0ZS5kZXB0aFRlc3QgPSBwYXNzLmRlcHRoVGVzdDtcbiAgICAgICAgLy8gZGVwdGggbWFza1xuICAgICAgICB0aGlzLm1hc2soeyBjb2xvcjogcGFzcy5jb2xvck1hc2ssIGRlcHRoOiBwYXNzLmRlcHRoTWFzayB9KTtcbiAgICAgICAgLy8gY2xlYXIgYnVmZmVyc1xuICAgICAgICB0aGlzLmNsZWFyKHsgY29sb3I6IHBhc3MuY2xlYXJDb2xvciwgZGVwdGg6IHBhc3MuY2xlYXJEZXB0aCB9KTtcbiAgICAgICAgY29uc3QgeyBwcm9ncmFtIH0gPSBwYXNzO1xuICAgICAgICBpZiAoIXByb2dyYW0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVuZGVyIHBhc3MgaGFzIG5vIHByb2dyYW0nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZW5kZXIgZW50aXRpZXNcbiAgICAgICAgT2JqZWN0LnZhbHVlcyhlbnRpdGllcykuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKGVudGl0eS5jb21wb25lbnRzKS5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LnR5cGUgIT09ICdNb2RlbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck1vZGVsKGNhbWVyYSwgZW50aXR5LCBjb21wb25lbnQsIGxpZ2h0LCBwcm9ncmFtLCB1bmlmb3Jtcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbmRlck1vZGVsKGNhbWVyYSwgdHJhbnNmb3JtLCBtb2RlbCwgbGlnaHQsIHByb2dyYW0sIGFkZGl0aW9uYWxVbmlmb3Jtcykge1xuICAgICAgICBjb25zdCB1bmlmb3JtcyA9IHt9O1xuICAgICAgICBjb25zdCBzZXRVbmlmb3JtVmFsdWUgPSAodmFsdWUsIGtleSwgcHJlZml4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gcHJlZml4ID8gYCR7cHJlZml4fS4ke2tleX1gIDoga2V5O1xuICAgICAgICAgICAgaWYgKHByb2dyYW0udW5pZm9ybXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICB1bmlmb3Jtc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoY2FtZXJhKSB7XG4gICAgICAgICAgICBnZXRVbmlmb3JtUHJvcGVydGllcyhDYW1lcmEpLmZvckVhY2goKHsga2V5IH0pID0+IHtcbiAgICAgICAgICAgICAgICBzZXRVbmlmb3JtVmFsdWUoY2FtZXJhW2tleV0sIGtleSwgJ2NhbWVyYScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgZ2V0VW5pZm9ybVByb3BlcnRpZXMoVHJhbnNmb3JtKS5mb3JFYWNoKCh7IGtleSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0VW5pZm9ybVZhbHVlKHRyYW5zZm9ybVtrZXldLCBrZXksICd0cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb2RlbCkge1xuICAgICAgICAgICAgZ2V0VW5pZm9ybVByb3BlcnRpZXMoTW9kZWwpLmZvckVhY2goKHsga2V5IH0pID0+IHtcbiAgICAgICAgICAgICAgICBzZXRVbmlmb3JtVmFsdWUobW9kZWxba2V5XSwga2V5LCAnbW9kZWwnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb2RlbC5ib25lTWF0cmljZXMpIHtcbiAgICAgICAgICAgIC8vIG5lc3RlZCBzdHJ1Y3R1cmVzIGNhbm5vdCBjb250YWluIGFycmF5cyxcbiAgICAgICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gcGxhY2UgYm9uZSBtYXRyaWNlcyBvdXRzaWRlXG4gICAgICAgICAgICBzZXRVbmlmb3JtVmFsdWUobW9kZWwuYm9uZU1hdHJpY2VzLCAnYm9uZU1hdHJpY2VzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpZ2h0KSB7XG4gICAgICAgICAgICBnZXRVbmlmb3JtUHJvcGVydGllcyhMaWdodCkuZm9yRWFjaCgoeyBrZXkgfSkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFVuaWZvcm1WYWx1ZShsaWdodFtrZXldLCBrZXksICdsaWdodCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcm9ncmFtcy51cGRhdGUocHJvZ3JhbSwgeyB1bmlmb3JtcyB9KTtcbiAgICAgICAgaWYgKGFkZGl0aW9uYWxVbmlmb3Jtcykge1xuICAgICAgICAgICAgLy8gYWRkaXRpb25hbCB1bmlmb3Jtc1xuICAgICAgICAgICAgdGhpcy5wcm9ncmFtcy51cGRhdGUocHJvZ3JhbSwge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgY2FuIGdldCBxdWl0ZSBzbG93LCBvbmx5IHVzZSBzcGFyaW5nbHkhXG4gICAgICAgICAgICAgICAgdW5pZm9ybXM6IHRoaXMuY29sbGVjdFVuaWZvcm1WYWx1ZXMocHJvZ3JhbSwgYWRkaXRpb25hbFVuaWZvcm1zKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmVudHJpZXMobW9kZWwucGFydGl0aW9ucykuZm9yRWFjaCgoW25hbWUsIHBhcnRpdGlvbl0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgbWVzaCB9ID0gcGFydGl0aW9uO1xuICAgICAgICAgICAgaWYgKCFtZXNoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJ0aXRpb24gaGFzIG5vIG1lc2gnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgbWF0ZXJpYWwgfSA9IG1lc2g7XG4gICAgICAgICAgICBpZiAoIW1hdGVyaWFsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXNoIGhhcyBubyBtYXRlcmlhbCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFtYXRlcmlhbC50ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcm9ncmFtcy51cGRhdGUocHJvZ3JhbSwge1xuICAgICAgICAgICAgICAgIHVuaWZvcm1zOiBnZXRVbmlmb3JtUHJvcGVydGllcyhNYXRlcmlhbCkucmVkdWNlKChwcm9wZXJ0aWVzLCB7IGtleSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBgbWF0ZXJpYWwuJHtrZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyYW0udW5pZm9ybXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbbmFtZV0gPSBtYXRlcmlhbFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgIH0sIHt9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1lc2hlcy5yZW5kZXIobWVzaCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb2xsZWN0VW5pZm9ybVZhbHVlcyhwcm9ncmFtLCB1bmlmb3JtVmFsdWVzKSB7XG4gICAgICAgIGNvbnN0IGNvbGxlY3RlZFVuaWZvcm1WYWx1ZXMgPSB7fTtcbiAgICAgICAgY29uc3QgY29sbGVjdFJlY3Vyc2l2ZWx5ID0gKHZhbHVlcywgcHJlZml4KSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsdWVzID09IG51bGwgfHwgdHlwZW9mIHZhbHVlcyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyh2YWx1ZXMpLmZvckVhY2goKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmlmb3JtTmFtZSA9IHByZWZpeCA/IGAke3ByZWZpeH0uJHtuYW1lfWAgOiBuYW1lO1xuICAgICAgICAgICAgICAgIGlmIChwcm9ncmFtLnVuaWZvcm1zLmhhc093blByb3BlcnR5KHVuaWZvcm1OYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0ZWRVbmlmb3JtVmFsdWVzW3VuaWZvcm1OYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5mb3JFYWNoKChlbGVtZW50LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJyYXlJbmRleCA9IGAke3VuaWZvcm1OYW1lfVske2luZGV4fV1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyYW0udW5pZm9ybXMuaGFzT3duUHJvcGVydHkoYXJyYXlJbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0ZWRVbmlmb3JtVmFsdWVzW2FycmF5SW5kZXhdID0gZWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3RSZWN1cnNpdmVseShlbGVtZW50LCBhcnJheUluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0UmVjdXJzaXZlbHkodmFsdWUsIHVuaWZvcm1OYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29sbGVjdFJlY3Vyc2l2ZWx5KHVuaWZvcm1WYWx1ZXMpO1xuICAgICAgICByZXR1cm4gY29sbGVjdGVkVW5pZm9ybVZhbHVlcztcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgU3RhdGUge1xuICAgIGdsO1xuICAgIGFjdGl2ZUN1bGxNb2RlID0gJ05vbmUnO1xuICAgIGFjdGl2ZUJsZW5kTW9kZSA9ICdOb25lJztcbiAgICBhY3RpdmVEZXB0aFRlc3QgPSAnTm9uZSc7XG4gICAgY29uc3RydWN0b3IoZ2wpIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgIH1cbiAgICBzZXQgY3VsbE1vZGUoY3VsbE1vZGUpIHtcbiAgICAgICAgaWYgKGN1bGxNb2RlID09PSB0aGlzLmFjdGl2ZUN1bGxNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN1bGxNb2RlID09PSAnTm9uZScpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZGlzYWJsZSh0aGlzLmdsLkNVTExfRkFDRSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdsLmVuYWJsZSh0aGlzLmdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICBzd2l0Y2ggKGN1bGxNb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnRnJvbnQnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmN1bGxGYWNlKHRoaXMuZ2wuRlJPTlQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdCYWNrJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5jdWxsRmFjZSh0aGlzLmdsLkJBQ0spO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFjdGl2ZUN1bGxNb2RlID0gY3VsbE1vZGU7XG4gICAgfVxuICAgIHNldCBibGVuZE1vZGUoYmxlbmRNb2RlKSB7XG4gICAgICAgIGlmIChibGVuZE1vZGUgPT09IHRoaXMuYWN0aXZlQmxlbmRNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJsZW5kTW9kZSA9PT0gJ05vbmUnKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmRpc2FibGUodGhpcy5nbC5CTEVORCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdsLmVuYWJsZSh0aGlzLmdsLkJMRU5EKTtcbiAgICAgICAgICAgIHN3aXRjaCAoYmxlbmRNb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnQWRkaXRpdmUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmJsZW5kRnVuYyh0aGlzLmdsLlNSQ19BTFBIQSwgdGhpcy5nbC5PTkUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdUcmFuc3BhcmVudCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmxlbmRGdW5jKHRoaXMuZ2wuU1JDX0FMUEhBLCB0aGlzLmdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFjdGl2ZUJsZW5kTW9kZSA9IGJsZW5kTW9kZTtcbiAgICB9XG4gICAgc2V0IGRlcHRoVGVzdChkZXB0aFRlc3QpIHtcbiAgICAgICAgaWYgKGRlcHRoVGVzdCA9PT0gdGhpcy5hY3RpdmVEZXB0aFRlc3QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVwdGhUZXN0ID09PSAnTm9uZScpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZGlzYWJsZSh0aGlzLmdsLkRFUFRIX1RFU1QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nbC5lbmFibGUodGhpcy5nbC5ERVBUSF9URVNUKTtcbiAgICAgICAgICAgIHN3aXRjaCAoZGVwdGhUZXN0KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnTmV2ZXInOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmRlcHRoRnVuYyh0aGlzLmdsLk5FVkVSKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnQWx3YXlzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5BTFdBWVMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdFcXVhbCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHRoaXMuZ2wuRVFVQUwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdOb3RFcXVhbCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHRoaXMuZ2wuTk9URVFVQUwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdMZXNzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5MRVNTKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnTGVzc0VxdWFsJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5MRVFVQUwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdHcmVhdGVyJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5HUkVBVEVSKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnR3JlYXRlckVxdWFsJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5HRVFVQUwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFjdGl2ZURlcHRoVGVzdCA9IGRlcHRoVGVzdDtcbiAgICB9XG59XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5leHBvcnQgY2xhc3MgU3VyZmFjZSBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAgcGF0aDtcbiAgICBkYXRhO1xuICAgIHdpZHRoID0gMTtcbiAgICBoZWlnaHQgPSAxO1xuICAgIGZvcm1hdCA9ICdDb2xvcic7XG4gICAgcHJlY2lzaW9uID0gODtcbiAgICB0aWxpbmcgPSAnTm9uZSc7XG4gICAgZmlsdGVyaW5nID0gJ05vbmUnO1xuICAgIHVzZU1pcG1hcHMgPSBmYWxzZTtcbiAgICBjb25zdHJ1Y3RvcihkYXRhID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBkYXRhKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGRlc2VyaWFsaXplKGRhdGEpIHtcbiAgICAgICAgY29uc3Qgc3VyZmFjZSA9IChhd2FpdCBzdXBlci5kZXNlcmlhbGl6ZShkYXRhKSk7XG4gICAgICAgIGlmICgnZGF0YScgaW4gc3VyZmFjZSkge1xuICAgICAgICAgICAgY29uc3QgeyBkYXRhLCBwcmVjaXNpb24gPSA4IH0gPSBzdXJmYWNlO1xuICAgICAgICAgICAgc3dpdGNoIChwcmVjaXNpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgICAgIHN1cmZhY2UuZGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgICAgICAgICBzdXJmYWNlLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VyZmFjZTtcbiAgICB9XG59XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgU3RyaW5nKVxuXSwgU3VyZmFjZS5wcm90b3R5cGUsIFwicGF0aFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE9iamVjdClcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcImRhdGFcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBTdXJmYWNlLnByb3RvdHlwZSwgXCJ3aWR0aFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcImhlaWdodFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcImZvcm1hdFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcInByZWNpc2lvblwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcInRpbGluZ1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcImZpbHRlcmluZ1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIEJvb2xlYW4pXG5dLCBTdXJmYWNlLnByb3RvdHlwZSwgXCJ1c2VNaXBtYXBzXCIsIHZvaWQgMCk7XG4iLCJleHBvcnQgY2xhc3MgUmVuZGVyVGFyZ2V0IHtcbiAgICB3aWR0aDtcbiAgICBoZWlnaHQ7XG4gICAgZnJhbWVCdWZmZXI7XG4gICAgY29uc3RydWN0b3IoeyB3aWR0aCwgaGVpZ2h0LCBmcmFtZUJ1ZmZlciB9KSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZnJhbWVCdWZmZXIgPSBmcmFtZUJ1ZmZlcjtcbiAgICB9XG59XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5leHBvcnQgY2xhc3MgV2VpZ2h0IGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICB2ZXJ0ZXg7XG4gICAgaW5kaWNlcztcbiAgICB3ZWlnaHRzO1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFdlaWdodC5wcm90b3R5cGUsIFwidmVydGV4XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgQXJyYXkpXG5dLCBXZWlnaHQucHJvdG90eXBlLCBcImluZGljZXNcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIFdlaWdodC5wcm90b3R5cGUsIFwid2VpZ2h0c1wiLCB2b2lkIDApO1xuIiwiZXhwb3J0ICogZnJvbSAnLi9jb3JlJztcbmV4cG9ydCAqIGZyb20gJy4vZ3JhcGhpY3MnO1xuZXhwb3J0ICogZnJvbSAnLi9waHlzaWNzJztcbmV4cG9ydCAqIGZyb20gJy4vdmVjdG9ycyc7XG5leHBvcnQgKiBmcm9tICcuL3V0aWxpdGllcyc7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXplLCBTZXJpYWxpemFibGUgfSBmcm9tICcuLi91dGlsaXRpZXMnO1xuZXhwb3J0IGNsYXNzIENvbGxpZGVyIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBTdHJpbmcpXG5dLCBDb2xsaWRlci5wcm90b3R5cGUsIFwidHlwZVwiLCB2b2lkIDApO1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xudmFyIF9fbWV0YWRhdGEgPSAodGhpcyAmJiB0aGlzLl9fbWV0YWRhdGEpIHx8IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xufTtcbmltcG9ydCB7IFNlcmlhbGl6ZSwgUmVnaXN0ZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IENvbGxpZGVyIH0gZnJvbSAnLi4vY29sbGlkZXInO1xubGV0IFBsYW5lID0gY2xhc3MgUGxhbmUgZXh0ZW5kcyBDb2xsaWRlciB7XG4gICAgdHlwZSA9ICdQbGFuZSc7XG4gICAgbm9ybWFsID0gdmVjMy51cDtcbiAgICBkaXN0YW5jZSA9IDA7XG4gICAgY29uc3RydWN0b3IoeyBub3JtYWwgPSB2ZWMzLnVwLCBkaXN0YW5jZSA9IDAgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubm9ybWFsID0gbm9ybWFsLmNvcHkoKTtcbiAgICAgICAgdGhpcy5kaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgIH1cbiAgICBzaWduZWREaXN0YW5jZShwb2ludCkge1xuICAgICAgICByZXR1cm4gdmVjMy5kb3QocG9pbnQsIHRoaXMubm9ybWFsKSAtIHRoaXMuZGlzdGFuY2U7XG4gICAgfVxufTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgUGxhbmUucHJvdG90eXBlLCBcIm5vcm1hbFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFBsYW5lLnByb3RvdHlwZSwgXCJkaXN0YW5jZVwiLCB2b2lkIDApO1xuUGxhbmUgPSBfX2RlY29yYXRlKFtcbiAgICBSZWdpc3RlcigpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246cGFyYW10eXBlc1wiLCBbT2JqZWN0XSlcbl0sIFBsYW5lKTtcbmV4cG9ydCB7IFBsYW5lIH07XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5pbXBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4uL2NvbGxpZGVyJztcbmltcG9ydCB7IFNlcmlhbGl6ZSwgUmVnaXN0ZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5sZXQgUG9seWdvbiA9IGNsYXNzIFBvbHlnb24gZXh0ZW5kcyBDb2xsaWRlciB7XG4gICAgdHlwZSA9ICdQb2x5Z29uJztcbiAgICB2ZXJ0aWNlcyA9IFtdO1xuICAgIGVkZ2VzO1xuICAgIG5vcm1hbDtcbiAgICBjb25zdHJ1Y3Rvcih7IHZlcnRpY2VzID0gW10gfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudmVydGljZXMgPSB2ZXJ0aWNlcy5tYXAoKHZlcnRleCkgPT4gdmVydGV4LmNvcHkoKSk7XG4gICAgICAgIGlmICh0aGlzLnZlcnRpY2VzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVkZ2VzID0gW1xuICAgICAgICAgICAgdmVjMy5zdWJ0cmFjdCh0aGlzLnZlcnRpY2VzWzFdLCB0aGlzLnZlcnRpY2VzWzBdKSxcbiAgICAgICAgICAgIHZlYzMuc3VidHJhY3QodGhpcy52ZXJ0aWNlc1syXSwgdGhpcy52ZXJ0aWNlc1sxXSksXG4gICAgICAgICAgICB2ZWMzLnN1YnRyYWN0KHRoaXMudmVydGljZXNbMF0sIHRoaXMudmVydGljZXNbMl0pXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IGVkZ2UxID0gdmVjMy5zdWJ0cmFjdCh2ZXJ0aWNlc1sxXSwgdmVydGljZXNbMF0pO1xuICAgICAgICBjb25zdCBlZGdlMiA9IHZlYzMuc3VidHJhY3QodmVydGljZXNbMl0sIHZlcnRpY2VzWzBdKTtcbiAgICAgICAgdGhpcy5ub3JtYWwgPSB2ZWMzLmNyb3NzKGVkZ2UxLCBlZGdlMikubm9ybWFsaXplKCk7XG4gICAgfVxufTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIFBvbHlnb24ucHJvdG90eXBlLCBcInZlcnRpY2VzXCIsIHZvaWQgMCk7XG5Qb2x5Z29uID0gX19kZWNvcmF0ZShbXG4gICAgUmVnaXN0ZXIoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnBhcmFtdHlwZXNcIiwgW09iamVjdF0pXG5dLCBQb2x5Z29uKTtcbmV4cG9ydCB7IFBvbHlnb24gfTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUsIFJlZ2lzdGVyIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5pbXBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4uL2NvbGxpZGVyJztcbmxldCBSYXkgPSBjbGFzcyBSYXkgZXh0ZW5kcyBDb2xsaWRlciB7XG4gICAgdHlwZSA9ICdSYXknO1xuICAgIG9yaWdpbiA9IHZlYzMuemVybztcbiAgICBkaXJlY3Rpb24gPSB2ZWMzLnVwO1xuICAgIGNvbnN0cnVjdG9yKHsgb3JpZ2luID0gdmVjMy56ZXJvLCBkaXJlY3Rpb24gPSB2ZWMzLnVwIH0gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9yaWdpbiA9IG9yaWdpbi5jb3B5KCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uLmNvcHkoKS5ub3JtYWxpemUoKTtcbiAgICB9XG59O1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHZlYzMpXG5dLCBSYXkucHJvdG90eXBlLCBcIm9yaWdpblwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHZlYzMpXG5dLCBSYXkucHJvdG90eXBlLCBcImRpcmVjdGlvblwiLCB2b2lkIDApO1xuUmF5ID0gX19kZWNvcmF0ZShbXG4gICAgUmVnaXN0ZXIoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnBhcmFtdHlwZXNcIiwgW09iamVjdF0pXG5dLCBSYXkpO1xuZXhwb3J0IHsgUmF5IH07XG4iLCJpbXBvcnQgeyBFcHNpbG9uLCB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU21hbGwgaGVscGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCB0bXAgPSAoKSA9PiBuZXcgdmVjMygpO1xuY29uc3QgcHJvamVjdEV4dGVudCA9IChheGlzLCBheGVzLCBleHRlbnRzKSA9PiB7XG4gICAgcmV0dXJuIChNYXRoLmFicyh2ZWMzLmRvdChheGlzLCBheGVzWzBdKSkgKiBleHRlbnRzLnggK1xuICAgICAgICBNYXRoLmFicyh2ZWMzLmRvdChheGlzLCBheGVzWzFdKSkgKiBleHRlbnRzLnkgK1xuICAgICAgICBNYXRoLmFicyh2ZWMzLmRvdChheGlzLCBheGVzWzJdKSkgKiBleHRlbnRzLnopO1xufTtcbmNvbnN0IGNob29zZUZhY2VUYW5nZW50SW5kaWNlcyA9IChtYWluKSA9PiB7XG4gICAgc3dpdGNoIChtYWluKSB7XG4gICAgICAgIGNhc2UgMDogcmV0dXJuIFsxLCAyXTtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gWzAsIDJdO1xuICAgICAgICBkZWZhdWx0OiByZXR1cm4gWzAsIDFdO1xuICAgIH1cbn07XG5jb25zdCBnZXRGYWNlQ2VudGVyQW5kQmFzaXMgPSAoY2VudGVyLCBheGVzLCBleHRlbnRzLCBmYWNlQXhpc0luZGV4LCBmYWNlU2lnbikgPT4ge1xuICAgIGNvbnN0IG5vcm1hbCA9IHZlYzMuc2NhbGUoYXhlc1tmYWNlQXhpc0luZGV4XSwgZmFjZVNpZ24sIHRtcCgpKTtcbiAgICBjb25zdCBmYWNlQ2VudGVyID0gdmVjMy5hZGQoY2VudGVyLCB2ZWMzLnNjYWxlKGF4ZXNbZmFjZUF4aXNJbmRleF0sIGV4dGVudHNbZmFjZUF4aXNJbmRleF0gKiBmYWNlU2lnbiwgdG1wKCkpLCB0bXAoKSk7XG4gICAgY29uc3QgW2kxLCBpMl0gPSBjaG9vc2VGYWNlVGFuZ2VudEluZGljZXMoZmFjZUF4aXNJbmRleCk7XG4gICAgY29uc3QgdDEgPSBheGVzW2kxXTtcbiAgICBjb25zdCB0MiA9IGF4ZXNbaTJdO1xuICAgIGNvbnN0IGUxID0gZXh0ZW50c1tpMV07XG4gICAgY29uc3QgZTIgPSBleHRlbnRzW2kyXTtcbiAgICByZXR1cm4geyBmYWNlQ2VudGVyLCBub3JtYWwsIHQxLCB0MiwgZTEsIGUyLCBpMSwgaTIgfTtcbn07XG5jb25zdCBnZXRGYWNlVmVydGljZXMgPSAoZmFjZUNlbnRlciwgdDEsIHQyLCBlMSwgZTIpID0+IHtcbiAgICBjb25zdCB2MCA9IHZlYzMuYWRkKGZhY2VDZW50ZXIsIHZlYzMuYWRkKHZlYzMuc2NhbGUodDEsIC1lMSwgdG1wKCkpLCB2ZWMzLnNjYWxlKHQyLCAtZTIsIHRtcCgpKSwgdG1wKCkpLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCB2MSA9IHZlYzMuYWRkKGZhY2VDZW50ZXIsIHZlYzMuYWRkKHZlYzMuc2NhbGUodDEsICtlMSwgdG1wKCkpLCB2ZWMzLnNjYWxlKHQyLCAtZTIsIHRtcCgpKSwgdG1wKCkpLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCB2MiA9IHZlYzMuYWRkKGZhY2VDZW50ZXIsIHZlYzMuYWRkKHZlYzMuc2NhbGUodDEsICtlMSwgdG1wKCkpLCB2ZWMzLnNjYWxlKHQyLCArZTIsIHRtcCgpKSwgdG1wKCkpLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCB2MyA9IHZlYzMuYWRkKGZhY2VDZW50ZXIsIHZlYzMuYWRkKHZlYzMuc2NhbGUodDEsIC1lMSwgdG1wKCkpLCB2ZWMzLnNjYWxlKHQyLCArZTIsIHRtcCgpKSwgdG1wKCkpLCBuZXcgdmVjMygpKTtcbiAgICByZXR1cm4gW3YwLCB2MSwgdjIsIHYzXTtcbn07XG5jb25zdCBjbGlwUG9seWdvbkFnYWluc3RQbGFuZSA9IChwb2x5LCBwbGFuZU5vcm1hbCwgcGxhbmVEaXN0KSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgaWYgKHBvbHkubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIGNvbnN0IGRvdCA9IChwKSA9PiB2ZWMzLmRvdChwbGFuZU5vcm1hbCwgcCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb2x5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGEgPSBwb2x5W2ldO1xuICAgICAgICBjb25zdCBiID0gcG9seVsoaSArIDEpICUgcG9seS5sZW5ndGhdO1xuICAgICAgICBjb25zdCBkYSA9IGRvdChhKSAtIHBsYW5lRGlzdDtcbiAgICAgICAgY29uc3QgZGIgPSBkb3QoYikgLSBwbGFuZURpc3Q7XG4gICAgICAgIGNvbnN0IGFJbnNpZGUgPSBkYSA8PSBFcHNpbG9uO1xuICAgICAgICBjb25zdCBiSW5zaWRlID0gZGIgPD0gRXBzaWxvbjtcbiAgICAgICAgaWYgKGFJbnNpZGUgJiYgYkluc2lkZSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goYi5jb3B5KCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFJbnNpZGUgJiYgIWJJbnNpZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHQgPSBkYSAvIChkYSAtIGRiKTtcbiAgICAgICAgICAgIGNvbnN0IGFiID0gdmVjMy5zdWJ0cmFjdChiLCBhLCB0bXAoKSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh2ZWMzLmFkZChhLCB2ZWMzLnNjYWxlKGFiLCB0LCB0bXAoKSksIG5ldyB2ZWMzKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghYUluc2lkZSAmJiBiSW5zaWRlKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gZGEgLyAoZGEgLSBkYik7XG4gICAgICAgICAgICBjb25zdCBhYiA9IHZlYzMuc3VidHJhY3QoYiwgYSwgdG1wKCkpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godmVjMy5hZGQoYSwgdmVjMy5zY2FsZShhYiwgdCwgdG1wKCkpLCBuZXcgdmVjMygpKSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaChiLmNvcHkoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG4vLyBDbG9zZXN0IG1pZHBvaW50IGJldHdlZW4gdHdvICpzZWdtZW50cypcbmNvbnN0IGNsb3Nlc3RQb2ludEJldHdlZW5TZWdtZW50c01pZHBvaW50ID0gKHAwLCB1LCB1TGVuLCBxMCwgdiwgdkxlbikgPT4ge1xuICAgIGNvbnN0IHcwID0gdmVjMy5zdWJ0cmFjdChwMCwgcTAsIHRtcCgpKTtcbiAgICBjb25zdCBhID0gdmVjMy5kb3QodSwgdSk7XG4gICAgY29uc3QgYiA9IHZlYzMuZG90KHUsIHYpO1xuICAgIGNvbnN0IGMgPSB2ZWMzLmRvdCh2LCB2KTtcbiAgICBjb25zdCBkID0gdmVjMy5kb3QodSwgdzApO1xuICAgIGNvbnN0IGUgPSB2ZWMzLmRvdCh2LCB3MCk7XG4gICAgY29uc3QgZGVub20gPSBhICogYyAtIGIgKiBiO1xuICAgIGxldCBzID0gMCwgdCA9IDA7XG4gICAgaWYgKE1hdGguYWJzKGRlbm9tKSA+IEVwc2lsb24pIHtcbiAgICAgICAgcyA9IChiICogZSAtIGMgKiBkKSAvIGRlbm9tO1xuICAgICAgICB0ID0gKGEgKiBlIC0gYiAqIGQpIC8gZGVub207XG4gICAgfVxuICAgIHMgPSBNYXRoLm1heCgtdUxlbiwgTWF0aC5taW4ocywgK3VMZW4pKTtcbiAgICB0ID0gTWF0aC5tYXgoLXZMZW4sIE1hdGgubWluKHQsICt2TGVuKSk7XG4gICAgY29uc3QgcCA9IHZlYzMuYWRkKHAwLCB2ZWMzLnNjYWxlKHUsIHMsIHRtcCgpKSwgdG1wKCkpO1xuICAgIGNvbnN0IHEgPSB2ZWMzLmFkZChxMCwgdmVjMy5zY2FsZSh2LCB0LCB0bXAoKSksIHRtcCgpKTtcbiAgICByZXR1cm4gdmVjMy5zY2FsZSh2ZWMzLmFkZChwLCBxLCB0bXAoKSksIDAuNSwgbmV3IHZlYzMoKSk7XG59O1xuY29uc3QgdHlwZUJpYXMgPSAodHlwZSkgPT4gKHR5cGUgPT09ICdFZGdlRWRnZScgPyAxZS02IDogMCk7XG5jb25zdCBzaWduTm9uWmVybyA9ICh4LCBmYWxsYmFjaykgPT4gKHggPiAwID8gMSA6IHggPCAwID8gLTEgOiBmYWxsYmFjayk7XG4vLyAtLS0gTkVXOiBjb21wdXRlIHRoZSBwZW5ldHJhdGlvbiBvZiBhIHBvaW50IGFnYWluc3QgYSBib3ggZmFjZSBwbGFuZSBhbG9uZyBgbm9ybWFsYFxuY29uc3QgcG9pbnRQZW5ldHJhdGlvbkFnYWluc3RCb3hQbGFuZSA9IChwb2ludCwgbm9ybWFsLCBheGVzLCBleHRlbnRzLCBjZW50ZXIpID0+IHtcbiAgICAvLyBQaWNrIHRoZSBmYWNlIG9uIHRoaXMgYm94IHdob3NlIG5vcm1hbCBpcyAqbW9zdCBhbGlnbmVkKiB3aXRoIGBub3JtYWxgXG4gICAgbGV0IGZhY2VJZHggPSAwO1xuICAgIGxldCBtYXhEb3QgPSAtSW5maW5pdHk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgY29uc3QgZCA9IHZlYzMuZG90KGF4ZXNbaV0sIG5vcm1hbCk7IC8vIHNpbmNlIGBub3JtYWxgIHBvaW50cyBBLT5CLCB0aGlzIHBpY2tzIHRoZSBBLWZhY2UgcG9pbnRpbmcgdG93YXJkIEIgKG9yIEItZmFjZSB0b3dhcmQgQSlcbiAgICAgICAgaWYgKGQgPiBtYXhEb3QpIHtcbiAgICAgICAgICAgIG1heERvdCA9IGQ7XG4gICAgICAgICAgICBmYWNlSWR4ID0gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBmYWNlU2lnbiA9IG1heERvdCA+PSAwID8gKzEgOiAtMTtcbiAgICBjb25zdCB7IGZhY2VDZW50ZXIgfSA9IGdldEZhY2VDZW50ZXJBbmRCYXNpcyhjZW50ZXIsIGF4ZXMsIGV4dGVudHMsIGZhY2VJZHgsIGZhY2VTaWduKTtcbiAgICBjb25zdCByZWZQbGFuZUQgPSB2ZWMzLmRvdChub3JtYWwsIGZhY2VDZW50ZXIpO1xuICAgIGNvbnN0IHBlbiA9IHJlZlBsYW5lRCAtIHZlYzMuZG90KG5vcm1hbCwgcG9pbnQpO1xuICAgIHJldHVybiBwZW47XG59O1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNYWluIHJvdXRpbmVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGNvbnN0IGNvbGxpZGVDdWJvaWRXaXRoQ3Vib2lkID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCBheGVzQSA9IFthLmF4ZXNbMF0uY29weSgpLm5vcm1hbGl6ZSgpLCBhLmF4ZXNbMV0uY29weSgpLm5vcm1hbGl6ZSgpLCBhLmF4ZXNbMl0uY29weSgpLm5vcm1hbGl6ZSgpXTtcbiAgICBjb25zdCBheGVzQiA9IFtiLmF4ZXNbMF0uY29weSgpLm5vcm1hbGl6ZSgpLCBiLmF4ZXNbMV0uY29weSgpLm5vcm1hbGl6ZSgpLCBiLmF4ZXNbMl0uY29weSgpLm5vcm1hbGl6ZSgpXTtcbiAgICBjb25zdCBleHRBID0gYS5leHRlbnRzO1xuICAgIGNvbnN0IGV4dEIgPSBiLmV4dGVudHM7XG4gICAgY29uc3QgY0EgPSBhLmNlbnRlcjtcbiAgICBjb25zdCBjQiA9IGIuY2VudGVyO1xuICAgIGNvbnN0IHQgPSB2ZWMzLnN1YnRyYWN0KGNCLCBjQSwgdG1wKCkpO1xuICAgIGxldCBiZXN0QXhpcyA9IG5ldyB2ZWMzKCk7XG4gICAgbGV0IGJlc3REZXB0aCA9IEluZmluaXR5O1xuICAgIGxldCBiZXN0VHlwZSA9IG51bGw7XG4gICAgbGV0IGJlc3RJbmRleEEgPSAtMTtcbiAgICBsZXQgYmVzdEluZGV4QiA9IC0xO1xuICAgIGNvbnN0IGV2YWx1YXRlQXhpcyA9IChheGlzLCB0eXBlLCBpLCBqKSA9PiB7XG4gICAgICAgIGNvbnN0IGxlbiA9IGF4aXMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuIDwgRXBzaWxvbilcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjb25zdCBuID0gdmVjMy5zY2FsZShheGlzLCAxIC8gbGVuLCB0bXAoKSk7XG4gICAgICAgIGNvbnN0IHJBID0gcHJvamVjdEV4dGVudChuLCBheGVzQSwgZXh0QSk7XG4gICAgICAgIGNvbnN0IHJCID0gcHJvamVjdEV4dGVudChuLCBheGVzQiwgZXh0Qik7XG4gICAgICAgIGNvbnN0IGRpc3QgPSBNYXRoLmFicyh2ZWMzLmRvdCh0LCBuKSk7XG4gICAgICAgIGNvbnN0IG92ZXJsYXAgPSByQSArIHJCIC0gZGlzdDtcbiAgICAgICAgaWYgKG92ZXJsYXAgPCAtRXBzaWxvbilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKG92ZXJsYXAgLSB0eXBlQmlhcyh0eXBlKSA8IGJlc3REZXB0aCAtIHR5cGVCaWFzKGJlc3RUeXBlKSkge1xuICAgICAgICAgICAgYmVzdERlcHRoID0gb3ZlcmxhcDtcbiAgICAgICAgICAgIGJlc3RBeGlzID0gbi5jb3B5KGJlc3RBeGlzKTtcbiAgICAgICAgICAgIGJlc3RUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIGJlc3RJbmRleEEgPSBpO1xuICAgICAgICAgICAgYmVzdEluZGV4QiA9IGo7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBpZiAoIWV2YWx1YXRlQXhpcyhheGVzQVtpXSwgJ0ZhY2VBJywgaSwgLTEpKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICghZXZhbHVhdGVBeGlzKGF4ZXNCW2ldLCAnRmFjZUInLCAtMSwgaSkpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGF4aXMgPSB2ZWMzLmNyb3NzKGF4ZXNBW2ldLCBheGVzQltqXSwgdG1wKCkpO1xuICAgICAgICAgICAgaWYgKCFldmFsdWF0ZUF4aXMoYXhpcywgJ0VkZ2VFZGdlJywgaSwgaikpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFiZXN0VHlwZSB8fCAhaXNGaW5pdGUoYmVzdERlcHRoKSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgY29uc3Qgbm9ybWFsID0gYmVzdEF4aXMuY29weSgpO1xuICAgIGlmICh2ZWMzLmRvdCh0LCBub3JtYWwpIDwgMClcbiAgICAgICAgbm9ybWFsLnNjYWxlKC0xKTtcbiAgICBjb25zdCBjb2xsaXNpb25zID0gW107XG4gICAgaWYgKGJlc3RUeXBlID09PSAnRmFjZUEnIHx8IGJlc3RUeXBlID09PSAnRmFjZUInKSB7XG4gICAgICAgIGNvbnN0IHJlZklzQSA9IGJlc3RUeXBlID09PSAnRmFjZUEnO1xuICAgICAgICBjb25zdCByZWZBeGVzID0gcmVmSXNBID8gYXhlc0EgOiBheGVzQjtcbiAgICAgICAgY29uc3QgcmVmRXh0ID0gcmVmSXNBID8gZXh0QSA6IGV4dEI7XG4gICAgICAgIGNvbnN0IHJlZkNlbnRlciA9IHJlZklzQSA/IGNBIDogY0I7XG4gICAgICAgIGNvbnN0IGsgPSByZWZJc0EgPyBiZXN0SW5kZXhBIDogYmVzdEluZGV4QjtcbiAgICAgICAgY29uc3QgZmFjZURpclNpZ24gPSB2ZWMzLmRvdChyZWZBeGVzW2tdLCBub3JtYWwpID49IDAgPyArMSA6IC0xO1xuICAgICAgICBjb25zdCB7IGZhY2VDZW50ZXI6IHJlZkZhY2VDZW50ZXIsIHQxLCB0MiwgZTEsIGUyIH0gPSBnZXRGYWNlQ2VudGVyQW5kQmFzaXMocmVmQ2VudGVyLCByZWZBeGVzLCByZWZFeHQsIGssIGZhY2VEaXJTaWduKTtcbiAgICAgICAgY29uc3QgaW5jQXhlcyA9IHJlZklzQSA/IGF4ZXNCIDogYXhlc0E7XG4gICAgICAgIGNvbnN0IGluY0V4dCA9IHJlZklzQSA/IGV4dEIgOiBleHRBO1xuICAgICAgICBjb25zdCBpbmNDZW50ZXIgPSByZWZJc0EgPyBjQiA6IGNBO1xuICAgICAgICBsZXQgaW5jRmFjZUluZGV4ID0gMCwgbWluRG90ID0gSW5maW5pdHk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBkID0gdmVjMy5kb3QoaW5jQXhlc1tpXSwgbm9ybWFsKTtcbiAgICAgICAgICAgIGlmIChkIDwgbWluRG90KSB7XG4gICAgICAgICAgICAgICAgbWluRG90ID0gZDtcbiAgICAgICAgICAgICAgICBpbmNGYWNlSW5kZXggPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluY0ZhY2VTaWduID0gbWluRG90ID4gMCA/IC0xIDogKzE7XG4gICAgICAgIGNvbnN0IHsgZmFjZUNlbnRlcjogaW5jRmFjZUNlbnRlciwgdDE6IGl0MSwgdDI6IGl0MiwgZTE6IGllMSwgZTI6IGllMiB9ID0gZ2V0RmFjZUNlbnRlckFuZEJhc2lzKGluY0NlbnRlciwgaW5jQXhlcywgaW5jRXh0LCBpbmNGYWNlSW5kZXgsIGluY0ZhY2VTaWduKTtcbiAgICAgICAgbGV0IHBvbHkgPSBnZXRGYWNlVmVydGljZXMoaW5jRmFjZUNlbnRlciwgaXQxLCBpdDIsIGllMSwgaWUyKTtcbiAgICAgICAgY29uc3QgcGxhbmVOMSA9IHQxO1xuICAgICAgICBjb25zdCBwbGFuZU4yID0gdmVjMy5zY2FsZSh0MSwgLTEsIHRtcCgpKTtcbiAgICAgICAgY29uc3QgcGxhbmVOMyA9IHQyO1xuICAgICAgICBjb25zdCBwbGFuZU40ID0gdmVjMy5zY2FsZSh0MiwgLTEsIHRtcCgpKTtcbiAgICAgICAgY29uc3QgZDEgPSB2ZWMzLmRvdChwbGFuZU4xLCByZWZGYWNlQ2VudGVyKSArIGUxO1xuICAgICAgICBjb25zdCBkMiA9IHZlYzMuZG90KHBsYW5lTjIsIHJlZkZhY2VDZW50ZXIpICsgZTE7XG4gICAgICAgIGNvbnN0IGQzID0gdmVjMy5kb3QocGxhbmVOMywgcmVmRmFjZUNlbnRlcikgKyBlMjtcbiAgICAgICAgY29uc3QgZDQgPSB2ZWMzLmRvdChwbGFuZU40LCByZWZGYWNlQ2VudGVyKSArIGUyO1xuICAgICAgICBwb2x5ID0gY2xpcFBvbHlnb25BZ2FpbnN0UGxhbmUocG9seSwgcGxhbmVOMSwgZDEpO1xuICAgICAgICBwb2x5ID0gY2xpcFBvbHlnb25BZ2FpbnN0UGxhbmUocG9seSwgcGxhbmVOMiwgZDIpO1xuICAgICAgICBwb2x5ID0gY2xpcFBvbHlnb25BZ2FpbnN0UGxhbmUocG9seSwgcGxhbmVOMywgZDMpO1xuICAgICAgICBwb2x5ID0gY2xpcFBvbHlnb25BZ2FpbnN0UGxhbmUocG9seSwgcGxhbmVONCwgZDQpO1xuICAgICAgICBpZiAocG9seS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgcmVmUGxhbmVEID0gdmVjMy5kb3Qobm9ybWFsLCByZWZGYWNlQ2VudGVyKTtcbiAgICAgICAgZm9yIChjb25zdCBwIG9mIHBvbHkpIHtcbiAgICAgICAgICAgIGNvbnN0IHBlbmV0cmF0aW9uID0gcmVmUGxhbmVEIC0gdmVjMy5kb3Qobm9ybWFsLCBwKTtcbiAgICAgICAgICAgIGlmIChwZW5ldHJhdGlvbiA+PSAtRXBzaWxvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlcHRoID0gTWF0aC5tYXgoMCwgcGVuZXRyYXRpb24pO1xuICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaCh7IGNvbnRhY3Q6IHAuY29weSgpLCBub3JtYWw6IG5vcm1hbC5jb3B5KCksIGRpc3RhbmNlOiBkZXB0aCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sbGlzaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbnRyb2lkID0gcG9seS5yZWR1Y2UoKGFjYywgdikgPT4gdmVjMy5hZGQoYWNjLCB2LCBhY2MpLCBuZXcgdmVjMygpKS5zY2FsZSgxIC8gcG9seS5sZW5ndGgpO1xuICAgICAgICAgICAgY29uc3QgcGVuID0gcmVmUGxhbmVEIC0gdmVjMy5kb3Qobm9ybWFsLCBjZW50cm9pZCk7XG4gICAgICAgICAgICB2ZWMzLmFkZChjZW50cm9pZCwgdmVjMy5zY2FsZShub3JtYWwsIE1hdGgubWF4KDAsIHBlbiksIHRtcCgpKSwgY2VudHJvaWQpO1xuICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoKHsgY29udGFjdDogY2VudHJvaWQsIG5vcm1hbDogbm9ybWFsLmNvcHkoKSwgZGlzdGFuY2U6IE1hdGgubWF4KDAsIHBlbikgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbGxpc2lvbnMubGVuZ3RoID4gNClcbiAgICAgICAgICAgIGNvbGxpc2lvbnMubGVuZ3RoID0gNDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIC0tLS0tLS0tLSBGSVhFRCBFREdF4oCTRURHRSBDQVNFIC0tLS0tLS0tLS1cbiAgICAgICAgY29uc3QgaSA9IGJlc3RJbmRleEE7XG4gICAgICAgIGNvbnN0IGogPSBiZXN0SW5kZXhCO1xuICAgICAgICBjb25zdCBvdGhlckEgPSBjaG9vc2VGYWNlVGFuZ2VudEluZGljZXMoaSk7XG4gICAgICAgIGNvbnN0IG90aGVyQiA9IGNob29zZUZhY2VUYW5nZW50SW5kaWNlcyhqKTtcbiAgICAgICAgY29uc3Qgc2lnbkExID0gc2lnbk5vblplcm8odmVjMy5kb3QodCwgYXhlc0Fbb3RoZXJBWzBdXSksIDEpO1xuICAgICAgICBjb25zdCBzaWduQTIgPSBzaWduTm9uWmVybyh2ZWMzLmRvdCh0LCBheGVzQVtvdGhlckFbMV1dKSwgMSk7XG4gICAgICAgIGNvbnN0IHNpZ25CMSA9IC1zaWduTm9uWmVybyh2ZWMzLmRvdCh0LCBheGVzQltvdGhlckJbMF1dKSwgMSk7XG4gICAgICAgIGNvbnN0IHNpZ25CMiA9IC1zaWduTm9uWmVybyh2ZWMzLmRvdCh0LCBheGVzQltvdGhlckJbMV1dKSwgMSk7XG4gICAgICAgIGNvbnN0IGJhc2VBID0gdmVjMy5hZGQodmVjMy5hZGQoY0EsIHZlYzMuc2NhbGUoYXhlc0Fbb3RoZXJBWzBdXSwgZXh0QVtvdGhlckFbMF1dICogc2lnbkExLCB0bXAoKSksIHRtcCgpKSwgdmVjMy5zY2FsZShheGVzQVtvdGhlckFbMV1dLCBleHRBW290aGVyQVsxXV0gKiBzaWduQTIsIHRtcCgpKSwgdG1wKCkpO1xuICAgICAgICBjb25zdCBiYXNlQiA9IHZlYzMuYWRkKHZlYzMuYWRkKGNCLCB2ZWMzLnNjYWxlKGF4ZXNCW290aGVyQlswXV0sIGV4dEJbb3RoZXJCWzBdXSAqIHNpZ25CMSwgdG1wKCkpLCB0bXAoKSksIHZlYzMuc2NhbGUoYXhlc0Jbb3RoZXJCWzFdXSwgZXh0QltvdGhlckJbMV1dICogc2lnbkIyLCB0bXAoKSksIHRtcCgpKTtcbiAgICAgICAgY29uc3QgdSA9IGF4ZXNBW2ldLmNvcHkoKTsgLy8gdW5pdFxuICAgICAgICBjb25zdCB2ID0gYXhlc0Jbal0uY29weSgpOyAvLyB1bml0XG4gICAgICAgIGNvbnN0IHAwID0gdmVjMy5hZGQoYmFzZUEsIHZlYzMuc2NhbGUodSwgLWV4dEFbaV0sIHRtcCgpKSwgdG1wKCkpO1xuICAgICAgICBjb25zdCBxMCA9IHZlYzMuYWRkKGJhc2VCLCB2ZWMzLnNjYWxlKHYsIC1leHRCW2pdLCB0bXAoKSksIHRtcCgpKTtcbiAgICAgICAgY29uc3QgY29udGFjdCA9IGNsb3Nlc3RQb2ludEJldHdlZW5TZWdtZW50c01pZHBvaW50KHAwLCB1LCBleHRBW2ldLCBxMCwgdiwgZXh0QltqXSk7XG4gICAgICAgIC8vIENvbXB1dGUgcGVuZXRyYXRpb24gYWdhaW5zdCBib3RoIGJveGVzJyByZWZlcmVuY2UgcGxhbmVzIGFsb25nIGBub3JtYWxgLFxuICAgICAgICAvLyBhbmQgdGFrZSB0aGUgc21hbGxlciBub24tbmVnYXRpdmUgcGVuZXRyYXRpb24uXG4gICAgICAgIGNvbnN0IHBlbkEgPSBwb2ludFBlbmV0cmF0aW9uQWdhaW5zdEJveFBsYW5lKGNvbnRhY3QsIG5vcm1hbCwgYXhlc0EsIGV4dEEsIGNBKTtcbiAgICAgICAgY29uc3QgcGVuQiA9IHBvaW50UGVuZXRyYXRpb25BZ2FpbnN0Qm94UGxhbmUoY29udGFjdCwgdmVjMy5zY2FsZShub3JtYWwsIC0xLCB0bXAoKSksIGF4ZXNCLCBleHRCLCBjQik7XG4gICAgICAgIC8vIGBwZW5CYCB1c2VkIGEgZmxpcHBlZCBub3JtYWwgdG8gcGljayBCJ3MgZmFjZSB0b3dhcmQgQSwgYnV0IHdlIHJlcG9ydCBkaXN0YW5jZSBhbG9uZyBgbm9ybWFsYC5cbiAgICAgICAgY29uc3QgZGVwdGggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihwZW5BLCBwZW5CKSk7XG4gICAgICAgIGNvbGxpc2lvbnMucHVzaCh7IGNvbnRhY3QsIG5vcm1hbDogbm9ybWFsLmNvcHkoKSwgZGlzdGFuY2U6IGRlcHRoIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY29sbGlzaW9ucy5sZW5ndGggPiAwID8gY29sbGlzaW9ucyA6IG51bGw7XG59O1xuIiwiZXhwb3J0IGNvbnN0IGNvbGxpZGVQbGFuZVdpdGhDdWJvaWQgPSAocGxhbmUsIGN1Ym9pZCkgPT4ge1xuICAgIGNvbnN0IGNvbGxpc2lvbnMgPSBbXTtcbiAgICBjdWJvaWQuZ2V0VmVydGljZXMoKS5mb3JFYWNoKCh2ZXJ0ZXgpID0+IHtcbiAgICAgICAgY29uc3QgZGlzdGFuY2VUb1BsYW5lID0gcGxhbmUuc2lnbmVkRGlzdGFuY2UodmVydGV4KTtcbiAgICAgICAgLy8gSWYgdGhlIHZlcnRleCBpcyBwZW5ldHJhdGluZyB0aGUgcGxhbmUsIGFkZCBpdCB0byB0aGUgY29sbGlzaW9uIG1hbmlmb2xkXG4gICAgICAgIGlmIChkaXN0YW5jZVRvUGxhbmUgPD0gMCkge1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsID0gcGxhbmUubm9ybWFsLmNvcHkoKTtcbiAgICAgICAgICAgIGNvbnN0IHBlbmV0cmF0aW9uRGVwdGggPSAtZGlzdGFuY2VUb1BsYW5lOyAvLyBOZWdhdGl2ZSBiZWNhdXNlIGl0J3MgcGVuZXRyYXRpb25cbiAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgY29udGFjdDogdmVydGV4LmNvcHkoKSxcbiAgICAgICAgICAgICAgICBub3JtYWw6IG5vcm1hbCxcbiAgICAgICAgICAgICAgICBkaXN0YW5jZTogcGVuZXRyYXRpb25EZXB0aFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gY29sbGlzaW9ucy5sZW5ndGggPiAwID8gY29sbGlzaW9ucyA6IG51bGw7XG59O1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5leHBvcnQgZnVuY3Rpb24gY29sbGlkZVBsYW5lV2l0aFNwaGVyZShwbGFuZSwgc3BoZXJlKSB7XG4gICAgY29uc3QgeyBjZW50ZXI6IHNwaGVyZUNlbnRlciwgcmFkaXVzIH0gPSBzcGhlcmU7XG4gICAgY29uc3QgeyBub3JtYWwsIGRpc3RhbmNlOiBwbGFuZURpc3RhbmNlIH0gPSBwbGFuZTtcbiAgICBjb25zdCBkaXN0YW5jZUZyb21TcGhlcmVDZW50ZXJUb1BsYW5lID0gdmVjMy5kb3Qoc3BoZXJlQ2VudGVyLCBub3JtYWwpIC0gcGxhbmVEaXN0YW5jZTtcbiAgICBpZiAoTWF0aC5hYnMoZGlzdGFuY2VGcm9tU3BoZXJlQ2VudGVyVG9QbGFuZSkgPD0gcmFkaXVzKSB7XG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHZlYzMuc2NhbGUobm9ybWFsLCBkaXN0YW5jZUZyb21TcGhlcmVDZW50ZXJUb1BsYW5lLCBuZXcgdmVjMygpKTtcbiAgICAgICAgY29uc3QgY29udGFjdFBvaW50ID0gdmVjMy5zdWJ0cmFjdChzcGhlcmVDZW50ZXIsIG9mZnNldCwgbmV3IHZlYzMoKSk7XG4gICAgICAgIGNvbnN0IHBlbmV0cmF0aW9uRGVwdGggPSByYWRpdXMgLSBNYXRoLmFicyhkaXN0YW5jZUZyb21TcGhlcmVDZW50ZXJUb1BsYW5lKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb250YWN0OiBjb250YWN0UG9pbnQsXG4gICAgICAgICAgICAgICAgbm9ybWFsOiBub3JtYWwuY29weSgpLFxuICAgICAgICAgICAgICAgIGRpc3RhbmNlOiBwZW5ldHJhdGlvbkRlcHRoXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5jb25zdCBFUFMgPSAxZS02O1xuY29uc3QgQ09OVEFDVF9TTE9QID0gMWUtMztcbmNvbnN0IGJ1aWxkUGxhbmVCYXNpcyA9IChuKSA9PiB7XG4gICAgY29uc3QgdXAgPSBNYXRoLmFicyhuLnopIDwgMC45OTkgPyBuZXcgdmVjMyhbMCwgMCwgMV0pIDogbmV3IHZlYzMoWzAsIDEsIDBdKTtcbiAgICBjb25zdCB0MSA9IHZlYzMuY3Jvc3ModXAsIG4sIG5ldyB2ZWMzKCkpLm5vcm1hbGl6ZSgpO1xuICAgIGNvbnN0IHQyID0gdmVjMy5jcm9zcyhuLCB0MSwgbmV3IHZlYzMoKSkubm9ybWFsaXplKCk7XG4gICAgcmV0dXJuIHsgdDEsIHQyIH07XG59O1xuY29uc3QgcHJvamVjdFRvMkQgPSAocCwgcDAsIHQxLCB0MikgPT4ge1xuICAgIGNvbnN0IGQgPSB2ZWMzLnN1YnRyYWN0KHAsIHAwLCBuZXcgdmVjMygpKTtcbiAgICByZXR1cm4geyB4OiB2ZWMzLmRvdChkLCB0MSksIHk6IHZlYzMuZG90KGQsIHQyKSB9O1xufTtcbmNvbnN0IHBvaW50SW5Qb2x5Z29uMkQgPSAocHQsIHBvbHkpID0+IHtcbiAgICBsZXQgaW5zaWRlID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDAsIGogPSBwb2x5Lmxlbmd0aCAtIDE7IGkgPCBwb2x5Lmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICBjb25zdCB4aSA9IHBvbHlbaV0ueCwgeWkgPSBwb2x5W2ldLnk7XG4gICAgICAgIGNvbnN0IHhqID0gcG9seVtqXS54LCB5aiA9IHBvbHlbal0ueTtcbiAgICAgICAgY29uc3QgaW50ZXJzZWN0ID0gKCh5aSA+IHB0LnkpICE9PSAoeWogPiBwdC55KSkgJiZcbiAgICAgICAgICAgIChwdC54IDwgKCh4aiAtIHhpKSAqIChwdC55IC0geWkpKSAvICgoeWogLSB5aSkgfHwgRVBTKSArIHhpKTtcbiAgICAgICAgaWYgKGludGVyc2VjdClcbiAgICAgICAgICAgIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgfVxuICAgIHJldHVybiBpbnNpZGU7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxpZGVQb2x5Z29uV2l0aEN1Ym9pZChwb2x5Z29uLCBjdWJvaWQpIHtcbiAgICBjb25zdCBjb2xsaXNpb25zID0gW107XG4gICAgY29uc3QgbiA9IHBvbHlnb24ubm9ybWFsLmNvcHkoKS5ub3JtYWxpemUoKTtcbiAgICBjb25zdCBwMCA9IHBvbHlnb24udmVydGljZXNbMF07XG4gICAgY29uc3QgcGxhbmVEID0gdmVjMy5kb3QobiwgcDApO1xuICAgIGNvbnN0IHsgdDEsIHQyIH0gPSBidWlsZFBsYW5lQmFzaXMobik7XG4gICAgY29uc3QgcG9seTJEID0gcG9seWdvbi52ZXJ0aWNlcy5tYXAodiA9PiBwcm9qZWN0VG8yRCh2LCBwMCwgdDEsIHQyKSk7XG4gICAgY29uc3QgdmVydHMgPSBjdWJvaWQuZ2V0VmVydGljZXMoKTtcbiAgICAvLyAxKSBQZW5ldHJhdGluZyB2ZXJ0aWNlcyAtPiBwcm9qZWN0IGNvbnRhY3QgdG8gcGxhbmUsIGtlZXAgcG9zaXRpdmUgZGVwdGhcbiAgICBmb3IgKGNvbnN0IHYgb2YgdmVydHMpIHtcbiAgICAgICAgY29uc3Qgc2lnbmVkID0gdmVjMy5kb3QobiwgdikgLSBwbGFuZUQ7IC8vIDwwIG1lYW5zIHYgaXMgXCJiZWhpbmRcIiBwbGFuZSB3LnIudCBuXG4gICAgICAgIGNvbnN0IGRlcHRoID0gTWF0aC5tYXgoMCwgLXNpZ25lZCk7XG4gICAgICAgIGlmIChkZXB0aCA+IENPTlRBQ1RfU0xPUCkge1xuICAgICAgICAgICAgY29uc3QgcHJvajJEID0gcHJvamVjdFRvMkQodiwgcDAsIHQxLCB0Mik7XG4gICAgICAgICAgICBpZiAocG9pbnRJblBvbHlnb24yRChwcm9qMkQsIHBvbHkyRCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjb250YWN0IHBvaW50IGlzIHYgcHJvamVjdGVkIG9udG8gdGhlIHBsYW5lXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGFjdE9uUGxhbmUgPSB2ZWMzLmFkZCh2LCB2ZWMzLnNjYWxlKG4sIC1zaWduZWQsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goeyBjb250YWN0OiBjb250YWN0T25QbGFuZSwgbm9ybWFsOiBuLmNvcHkoKSwgZGlzdGFuY2U6IGRlcHRoIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIDIpIEVkZ2XigJNwbGFuZSBpbnRlcnNlY3Rpb25zICh0b3VjaGluZylcbiAgICBjb25zdCBlZGdlcyA9IGN1Ym9pZC5nZXRFZGdlcygpO1xuICAgIGZvciAoY29uc3QgW2kxLCBpMl0gb2YgZWRnZXMpIHtcbiAgICAgICAgY29uc3QgdjEgPSB2ZXJ0c1tpMV0sIHYyID0gdmVydHNbaTJdO1xuICAgICAgICBjb25zdCBkMSA9IHZlYzMuZG90KG4sIHYxKSAtIHBsYW5lRDtcbiAgICAgICAgY29uc3QgZDIgPSB2ZWMzLmRvdChuLCB2MikgLSBwbGFuZUQ7XG4gICAgICAgIGlmICgoZDEgPiBDT05UQUNUX1NMT1AgJiYgZDIgPCAtQ09OVEFDVF9TTE9QKSB8fCAoZDEgPCAtQ09OVEFDVF9TTE9QICYmIGQyID4gQ09OVEFDVF9TTE9QKSB8fFxuICAgICAgICAgICAgKE1hdGguYWJzKGQxKSA8PSBDT05UQUNUX1NMT1AgJiYgTWF0aC5hYnMoZDIpIDw9IENPTlRBQ1RfU0xPUCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVkZ2UgPSB2ZWMzLnN1YnRyYWN0KHYyLCB2MSwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICBjb25zdCBkZW5vbSA9IHZlYzMuZG90KG4sIGVkZ2UpO1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGRlbm9tKSA+IEVQUykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSAocGxhbmVEIC0gdmVjMy5kb3QobiwgdjEpKSAvIGRlbm9tO1xuICAgICAgICAgICAgICAgIGlmICh0ID49IC1FUFMgJiYgdCA8PSAxICsgRVBTKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhpdCA9IHZlYzMuYWRkKHYxLCB2ZWMzLnNjYWxlKGVkZ2UsIHQsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvajJEID0gcHJvamVjdFRvMkQoaGl0LCBwMCwgdDEsIHQyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50SW5Qb2x5Z29uMkQocHJvajJELCBwb2x5MkQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goeyBjb250YWN0OiBoaXQsIG5vcm1hbDogbi5jb3B5KCksIGRpc3RhbmNlOiAwIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb2xsaXNpb25zLmxlbmd0aCA+IDAgPyBjb2xsaXNpb25zIDogbnVsbDtcbn1cbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuY29uc3QgeyBtaW4sIG1heCwgc3FydCB9ID0gTWF0aDtcbmNvbnN0IGZpbmRDbG9zZXN0UG9pbnRPbkVkZ2UgPSAocG9pbnQsIHYxLCB2MikgPT4ge1xuICAgIGNvbnN0IGUxID0gdmVjMy5zdWJ0cmFjdCh2MiwgdjEpO1xuICAgIGNvbnN0IGwyID0gdmVjMy5kb3QoZTEsIGUxKTtcbiAgICBpZiAobDIgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHYxLmNvcHkoKTtcbiAgICB9XG4gICAgY29uc3QgdCA9IG1heCgwLCBtaW4oMSwgdmVjMy5kb3QodmVjMy5zdWJ0cmFjdChwb2ludCwgdjEpLCBlMSkgLyBsMikpO1xuICAgIHJldHVybiB2ZWMzLmFkZCh2MSwgdmVjMy5zY2FsZShlMSwgdCkpO1xufTtcbmNvbnN0IGZpbmRDbG9zZXN0UG9pbnRPblBvbHlnb24gPSAocG9pbnQsIHBvbHlnb24pID0+IHtcbiAgICBjb25zdCBbdjEsIHYyLCB2M10gPSBwb2x5Z29uLnZlcnRpY2VzO1xuICAgIGNvbnN0IGUxID0gdmVjMy5zdWJ0cmFjdCh2MiwgdjEpO1xuICAgIGNvbnN0IGUyID0gdmVjMy5zdWJ0cmFjdCh2MywgdjEpO1xuICAgIGNvbnN0IHAgPSB2ZWMzLnN1YnRyYWN0KHBvaW50LCB2MSk7XG4gICAgY29uc3QgZTFwID0gdmVjMy5kb3QoZTEsIHApO1xuICAgIGNvbnN0IGUycCA9IHZlYzMuZG90KGUyLCBwKTtcbiAgICBjb25zdCBlMWUxID0gdmVjMy5kb3QoZTEsIGUxKTtcbiAgICBjb25zdCBlMWUyID0gdmVjMy5kb3QoZTEsIGUyKTtcbiAgICBjb25zdCBlMmUyID0gdmVjMy5kb3QoZTIsIGUyKTtcbiAgICBjb25zdCBkID0gZTFlMSAqIGUyZTIgLSBlMWUyICogZTFlMjtcbiAgICBjb25zdCB1ID0gKGUyZTIgKiBlMXAgLSBlMWUyICogZTJwKSAvIGQ7XG4gICAgY29uc3QgdiA9IChlMWUxICogZTJwIC0gZTFlMiAqIGUxcCkgLyBkO1xuICAgIGlmICh1ID49IDAgJiYgdiA+PSAwICYmIHUgKyB2IDw9IDEpIHtcbiAgICAgICAgcmV0dXJuIHZlYzMuYWRkKHYxLCB2ZWMzLnNjYWxlKHZlYzMuYWRkKHZlYzMuc2NhbGUoZTEsIHUpLCB2ZWMzLnNjYWxlKGUyLCB2KSksIDEpKTtcbiAgICB9XG4gICAgY29uc3QgcDEgPSBmaW5kQ2xvc2VzdFBvaW50T25FZGdlKHBvaW50LCB2MSwgdjIpO1xuICAgIGNvbnN0IHAyID0gZmluZENsb3Nlc3RQb2ludE9uRWRnZShwb2ludCwgdjIsIHYzKTtcbiAgICBjb25zdCBwMyA9IGZpbmRDbG9zZXN0UG9pbnRPbkVkZ2UocG9pbnQsIHYzLCB2MSk7XG4gICAgY29uc3QgZDEgPSB2ZWMzLmRvdCh2ZWMzLnN1YnRyYWN0KHBvaW50LCBwMSksIHZlYzMuc3VidHJhY3QocG9pbnQsIHAxKSk7XG4gICAgY29uc3QgZDIgPSB2ZWMzLmRvdCh2ZWMzLnN1YnRyYWN0KHBvaW50LCBwMiksIHZlYzMuc3VidHJhY3QocG9pbnQsIHAyKSk7XG4gICAgY29uc3QgZDMgPSB2ZWMzLmRvdCh2ZWMzLnN1YnRyYWN0KHBvaW50LCBwMyksIHZlYzMuc3VidHJhY3QocG9pbnQsIHAzKSk7XG4gICAgaWYgKGQxIDwgZDIgJiYgZDEgPCBkMykge1xuICAgICAgICByZXR1cm4gcDE7XG4gICAgfVxuICAgIGlmIChkMiA8IGQzKSB7XG4gICAgICAgIHJldHVybiBwMjtcbiAgICB9XG4gICAgcmV0dXJuIHAzO1xufTtcbmV4cG9ydCBjb25zdCBjb2xsaWRlUG9seWdvbldpdGhTcGhlcmUgPSAocG9seWdvbiwgc3BoZXJlKSA9PiB7XG4gICAgY29uc3QgY29udGFjdCA9IGZpbmRDbG9zZXN0UG9pbnRPblBvbHlnb24oc3BoZXJlLmNlbnRlciwgcG9seWdvbik7XG4gICAgY29uc3QgZGlyZWN0aW9uID0gdmVjMy5zdWJ0cmFjdChjb250YWN0LCBzcGhlcmUuY2VudGVyKTtcbiAgICBjb25zdCBkaXN0YW5jZVNxdWFyZWQgPSB2ZWMzLmRvdChkaXJlY3Rpb24sIGRpcmVjdGlvbik7XG4gICAgaWYgKGRpc3RhbmNlU3F1YXJlZCA8PSBzcGhlcmUucmFkaXVzICogc3BoZXJlLnJhZGl1cykge1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHNxcnQoZGlzdGFuY2VTcXVhcmVkKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb250YWN0LFxuICAgICAgICAgICAgICAgIG5vcm1hbDogcG9seWdvbi5ub3JtYWwuY29weSgpLFxuICAgICAgICAgICAgICAgIGRpc3RhbmNlOiBzcGhlcmUucmFkaXVzIC0gZGlzdGFuY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5jb25zdCBFUFNJTE9OID0gMWUtNjtcbmV4cG9ydCBjb25zdCBjb2xsaWRlUmF5V2l0aEN1Ym9pZCA9IChyYXksIGN1Ym9pZCkgPT4ge1xuICAgIGNvbnN0IGF4ZXMgPSBjdWJvaWQuYXhlcztcbiAgICBjb25zdCBleHRlbnRzID0gW2N1Ym9pZC5leHRlbnRzLngsIGN1Ym9pZC5leHRlbnRzLnksIGN1Ym9pZC5leHRlbnRzLnpdO1xuICAgIGNvbnN0IHJlbGF0aXZlT3JpZ2luID0gdmVjMy5zdWJ0cmFjdChyYXkub3JpZ2luLCBjdWJvaWQuY2VudGVyKTtcbiAgICBsZXQgdE1pbiA9IC1JbmZpbml0eTtcbiAgICBsZXQgdE1heCA9IEluZmluaXR5O1xuICAgIGxldCBlbnRyeUF4aXMgPSAtMTtcbiAgICBsZXQgZXhpdEF4aXMgPSAtMTtcbiAgICBsZXQgZW50cnlTaWduID0gMTtcbiAgICBsZXQgZXhpdFNpZ24gPSAxO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGF4aXMgPSBheGVzW2ldO1xuICAgICAgICBjb25zdCBleHRlbnQgPSBleHRlbnRzW2ldO1xuICAgICAgICBjb25zdCBvcmlnaW5Qcm9qZWN0aW9uID0gdmVjMy5kb3QocmVsYXRpdmVPcmlnaW4sIGF4aXMpO1xuICAgICAgICBjb25zdCBkaXJlY3Rpb25Qcm9qZWN0aW9uID0gdmVjMy5kb3QocmF5LmRpcmVjdGlvbiwgYXhpcyk7XG4gICAgICAgIGlmIChNYXRoLmFicyhkaXJlY3Rpb25Qcm9qZWN0aW9uKSA8IEVQU0lMT04pIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5Qcm9qZWN0aW9uIDwgLWV4dGVudCB8fCBvcmlnaW5Qcm9qZWN0aW9uID4gZXh0ZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnZlcnNlRGlyZWN0aW9uID0gMSAvIGRpcmVjdGlvblByb2plY3Rpb247XG4gICAgICAgIGxldCB0MSA9ICgtZXh0ZW50IC0gb3JpZ2luUHJvamVjdGlvbikgKiBpbnZlcnNlRGlyZWN0aW9uO1xuICAgICAgICBsZXQgdDIgPSAoZXh0ZW50IC0gb3JpZ2luUHJvamVjdGlvbikgKiBpbnZlcnNlRGlyZWN0aW9uO1xuICAgICAgICBsZXQgZmFjZUVudHJ5U2lnbiA9IC0xO1xuICAgICAgICBsZXQgZmFjZUV4aXRTaWduID0gMTtcbiAgICAgICAgaWYgKHQxID4gdDIpIHtcbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIFt0MSwgdDJdID0gW3QyLCB0MV07XG4gICAgICAgICAgICBbZmFjZUVudHJ5U2lnbiwgZmFjZUV4aXRTaWduXSA9IFtmYWNlRXhpdFNpZ24sIGZhY2VFbnRyeVNpZ25dO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0MSA+IHRNaW4pIHtcbiAgICAgICAgICAgIHRNaW4gPSB0MTtcbiAgICAgICAgICAgIGVudHJ5QXhpcyA9IGk7XG4gICAgICAgICAgICBlbnRyeVNpZ24gPSBmYWNlRW50cnlTaWduO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0MiA8IHRNYXgpIHtcbiAgICAgICAgICAgIHRNYXggPSB0MjtcbiAgICAgICAgICAgIGV4aXRBeGlzID0gaTtcbiAgICAgICAgICAgIGV4aXRTaWduID0gZmFjZUV4aXRTaWduO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0TWluID4gdE1heCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRNYXggPCAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBkaXN0YW5jZSA9IHRNaW4gPj0gMCA/IHRNaW4gOiB0TWF4O1xuICAgIGlmIChkaXN0YW5jZSA8IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGF4aXNJbmRleCA9IHRNaW4gPj0gMCA/IGVudHJ5QXhpcyA6IGV4aXRBeGlzO1xuICAgIGNvbnN0IHNpZ24gPSB0TWluID49IDAgPyBlbnRyeVNpZ24gOiBleGl0U2lnbjtcbiAgICBpZiAoYXhpc0luZGV4IDwgMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGFjdE9mZnNldCA9IHZlYzMuc2NhbGUocmF5LmRpcmVjdGlvbiwgZGlzdGFuY2UsIG5ldyB2ZWMzKCkpO1xuICAgIGNvbnN0IGNvbnRhY3QgPSB2ZWMzLmFkZChyYXkub3JpZ2luLCBjb250YWN0T2Zmc2V0LCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCBub3JtYWwgPSBheGVzW2F4aXNJbmRleF0uY29weSgpLnNjYWxlKC1zaWduKTtcbiAgICByZXR1cm4geyBjb250YWN0LCBub3JtYWwsIGRpc3RhbmNlIH07XG59O1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5leHBvcnQgY29uc3QgY29sbGlkZVJheVdpdGhQbGFuZSA9IChyYXksIHBsYW5lKSA9PiB7XG4gICAgY29uc3QgeyBub3JtYWw6IG4sIGRpc3RhbmNlOiBkIH0gPSBwbGFuZTtcbiAgICBjb25zdCB7IG9yaWdpbjogbywgZGlyZWN0aW9uOiBlIH0gPSByYXk7XG4gICAgY29uc3QgcyA9IHZlYzMuZG90KGUsIG4pO1xuICAgIGlmIChzID09PSAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0ID0gKGQgLSB2ZWMzLmRvdChvLCBuKSkgLyBzO1xuICAgIGlmICh0IDwgMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGFjdE9mZnNldCA9IHZlYzMuc2NhbGUoZSwgdCwgbmV3IHZlYzMoKSk7XG4gICAgY29uc3QgY29udGFjdCA9IHZlYzMuYWRkKG8sIGNvbnRhY3RPZmZzZXQsIG5ldyB2ZWMzKCkpO1xuICAgIHJldHVybiB7IGNvbnRhY3QsIG5vcm1hbDogbi5jb3B5KCksIGRpc3RhbmNlOiB0IH07XG59O1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5leHBvcnQgY29uc3QgY29sbGlkZVJheVdpdGhSYXkgPSAocmF5MSwgcmF5MikgPT4ge1xuICAgIGNvbnN0IHsgZGlyZWN0aW9uOiBkMSwgb3JpZ2luOiBvMSB9ID0gcmF5MTtcbiAgICBjb25zdCB7IGRpcmVjdGlvbjogZDIsIG9yaWdpbjogbzIgfSA9IHJheTI7XG4gICAgY29uc3QgYyA9IHZlYzMuY3Jvc3MoZDEsIGQyKTtcbiAgICBjb25zdCBkZXRlcm1pbmFudCA9IHZlYzMuZG90KGMsIGMpO1xuICAgIGlmIChkZXRlcm1pbmFudCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZiA9IHZlYzMuc3VidHJhY3QobzIsIG8xKTtcbiAgICBjb25zdCB1ID0gdmVjMy5jcm9zcyhjLCBmKS5zY2FsZSgxIC8gZGV0ZXJtaW5hbnQpO1xuICAgIGNvbnN0IHQgPSB2ZWMzLmRvdCh2ZWMzLmNyb3NzKGYsIGQyKSwgYykgLyBkZXRlcm1pbmFudDtcbiAgICBpZiAodCA8IDAgfHwgdCA+IDEpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRhY3QxID0gdmVjMy5hZGQobzEsIHZlYzMuc2NhbGUoZDEsIHQsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCBjb250YWN0MiA9IHZlYzMuYWRkKG8yLCB2ZWMzLnNjYWxlKGQyLCB1LnosIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCBub3JtYWwgPSB2ZWMzLnN1YnRyYWN0KGNvbnRhY3QxLCBjb250YWN0Mikubm9ybWFsaXplKCk7XG4gICAgY29uc3QgZGlzdGFuY2UgPSB2ZWMzLmRvdCh2ZWMzLnN1YnRyYWN0KGNvbnRhY3QxLCBvMSksIGQxKTtcbiAgICByZXR1cm4geyBjb250YWN0OiBjb250YWN0MSwgbm9ybWFsLCBkaXN0YW5jZSB9O1xufTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuY29uc3QgeyBzcXJ0IH0gPSBNYXRoO1xuZXhwb3J0IGNvbnN0IGNvbGxpZGVSYXlXaXRoU3BoZXJlID0gKHJheSwgc3BoZXJlKSA9PiB7XG4gICAgY29uc3QgeyBvcmlnaW46IG8sIGRpcmVjdGlvbjogZSB9ID0gcmF5O1xuICAgIGNvbnN0IHsgY2VudGVyOiBjLCByYWRpdXM6IHIgfSA9IHNwaGVyZTtcbiAgICBjb25zdCByMiA9IHIgKiByO1xuICAgIGNvbnN0IHMgPSB2ZWMzLnN1YnRyYWN0KGMsIG8pO1xuICAgIGNvbnN0IHQgPSB2ZWMzLmRvdChlLCBzKTtcbiAgICBjb25zdCBkMiA9IHMuc3F1YXJlZExlbmd0aCAtIHQgKiB0O1xuICAgIGlmIChkMiA+IHIyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0aGMgPSBzcXJ0KHIyIC0gZDIpO1xuICAgIGNvbnN0IHQwID0gdCAtIHRoYztcbiAgICBjb25zdCB0MSA9IHQgKyB0aGM7XG4gICAgaWYgKHQwIDwgMCAmJiB0MSA8IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGRpc3RhbmNlID0gdDAgPj0gMCA/IHQwIDogdDE7XG4gICAgY29uc3QgY29udGFjdE9mZnNldCA9IHZlYzMuc2NhbGUoZSwgZGlzdGFuY2UsIG5ldyB2ZWMzKCkpO1xuICAgIGNvbnN0IGNvbnRhY3QgPSB2ZWMzLmFkZChvLCBjb250YWN0T2Zmc2V0LCBuZXcgdmVjMygpKTtcbiAgICBsZXQgbm9ybWFsID0gdmVjMy5zdWJ0cmFjdChjLCBjb250YWN0LCBuZXcgdmVjMygpKTtcbiAgICBpZiAobm9ybWFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBub3JtYWwgPSB2ZWMzLm5vcm1hbGl6ZShlLCBuZXcgdmVjMygpKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vcm1hbC5ub3JtYWxpemUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgY29udGFjdCwgbm9ybWFsLCBkaXN0YW5jZSB9O1xufTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuY29uc3QgRVBTSUxPTiA9IDFlLTY7XG5leHBvcnQgZnVuY3Rpb24gY29sbGlkZVNwaGVyZVdpdGhDdWJvaWQoc3BoZXJlLCBjdWJvaWQpIHtcbiAgICBjb25zdCBleHRlbnRzID0gW2N1Ym9pZC5leHRlbnRzLngsIGN1Ym9pZC5leHRlbnRzLnksIGN1Ym9pZC5leHRlbnRzLnpdO1xuICAgIGNvbnN0IGF4ZXMgPSBjdWJvaWQuYXhlcztcbiAgICBjb25zdCByZWxhdGl2ZSA9IHZlYzMuc3VidHJhY3Qoc3BoZXJlLmNlbnRlciwgY3Vib2lkLmNlbnRlcik7XG4gICAgY29uc3QgbG9jYWwgPSBbXTtcbiAgICBjb25zdCBjbG9zZXN0UG9pbnQgPSBjdWJvaWQuY2VudGVyLmNvcHkoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBjb25zdCBheGlzID0gYXhlc1tpXTtcbiAgICAgICAgY29uc3QgcHJvamVjdGlvbiA9IHZlYzMuZG90KHJlbGF0aXZlLCBheGlzKTtcbiAgICAgICAgbG9jYWxbaV0gPSBwcm9qZWN0aW9uO1xuICAgICAgICBjb25zdCBleHRlbnQgPSBleHRlbnRzW2ldO1xuICAgICAgICBjb25zdCBjbGFtcGVkUHJvamVjdGlvbiA9IE1hdGgubWF4KC1leHRlbnQsIE1hdGgubWluKHByb2plY3Rpb24sIGV4dGVudCkpO1xuICAgICAgICBjb25zdCBjb250cmlidXRpb24gPSB2ZWMzLnNjYWxlKGF4aXMsIGNsYW1wZWRQcm9qZWN0aW9uLCBuZXcgdmVjMygpKTtcbiAgICAgICAgdmVjMy5hZGQoY2xvc2VzdFBvaW50LCBjb250cmlidXRpb24sIGNsb3Nlc3RQb2ludCk7XG4gICAgfVxuICAgIGNvbnN0IG9mZnNldCA9IHZlYzMuc3VidHJhY3Qoc3BoZXJlLmNlbnRlciwgY2xvc2VzdFBvaW50KTtcbiAgICBjb25zdCBkaXN0YW5jZVNxdWFyZWQgPSBvZmZzZXQuc3F1YXJlZExlbmd0aDtcbiAgICBjb25zdCByYWRpdXMgPSBzcGhlcmUucmFkaXVzO1xuICAgIGlmIChkaXN0YW5jZVNxdWFyZWQgPiByYWRpdXMgKiByYWRpdXMpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChkaXN0YW5jZVNxdWFyZWQgPiBFUFNJTE9OICogRVBTSUxPTikge1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkaXN0YW5jZVNxdWFyZWQpO1xuICAgICAgICBjb25zdCBub3JtYWwgPSBvZmZzZXQuc2NhbGUoMSAvIGRpc3RhbmNlKTtcbiAgICAgICAgY29uc3QgcGVuZXRyYXRpb25EZXB0aCA9IHJhZGl1cyAtIGRpc3RhbmNlO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnRhY3Q6IGNsb3Nlc3RQb2ludC5jb3B5KCksXG4gICAgICAgICAgICAgICAgbm9ybWFsOiBub3JtYWwuY29weSgpLFxuICAgICAgICAgICAgICAgIGRpc3RhbmNlOiBwZW5ldHJhdGlvbkRlcHRoXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgfVxuICAgIGxldCBiZXN0QXhpcyA9IDA7XG4gICAgbGV0IGJlc3REaXN0YW5jZSA9IEluZmluaXR5O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGV4dGVudCA9IGV4dGVudHNbaV07XG4gICAgICAgIGNvbnN0IHByb2plY3Rpb24gPSBsb2NhbFtpXTtcbiAgICAgICAgY29uc3QgZGlzdGFuY2VUb0ZhY2UgPSBNYXRoLm1heCgwLCBleHRlbnQgLSBNYXRoLmFicyhwcm9qZWN0aW9uKSk7XG4gICAgICAgIGlmIChkaXN0YW5jZVRvRmFjZSA8IGJlc3REaXN0YW5jZSkge1xuICAgICAgICAgICAgYmVzdERpc3RhbmNlID0gZGlzdGFuY2VUb0ZhY2U7XG4gICAgICAgICAgICBiZXN0QXhpcyA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYXhpcyA9IGF4ZXNbYmVzdEF4aXNdO1xuICAgIGNvbnN0IGV4dGVudCA9IGV4dGVudHNbYmVzdEF4aXNdO1xuICAgIGNvbnN0IHByb2plY3Rpb24gPSBsb2NhbFtiZXN0QXhpc107XG4gICAgY29uc3Qgc2lnbiA9IHByb2plY3Rpb24gPj0gMCA/IDEgOiAtMTtcbiAgICBjb25zdCBkaXN0YW5jZVRvRmFjZSA9IGV4dGVudCAtIE1hdGguYWJzKHByb2plY3Rpb24pO1xuICAgIGNvbnN0IHN1cmZhY2VPZmZzZXQgPSBzaWduICogZGlzdGFuY2VUb0ZhY2U7XG4gICAgY29uc3QgY29udGFjdCA9IHZlYzMuYWRkKHNwaGVyZS5jZW50ZXIsIHZlYzMuc2NhbGUoYXhpcywgc3VyZmFjZU9mZnNldCwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgIGxldCBwZW5ldHJhdGlvbkRlcHRoID0gcmFkaXVzIC0gZGlzdGFuY2VUb0ZhY2U7XG4gICAgaWYgKHBlbmV0cmF0aW9uRGVwdGggPCAtRVBTSUxPTikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHBlbmV0cmF0aW9uRGVwdGggPCAwKSB7XG4gICAgICAgIHBlbmV0cmF0aW9uRGVwdGggPSAwO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWwgPSBheGlzLmNvcHkoKS5zY2FsZShzaWduKTtcbiAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBjb250YWN0LFxuICAgICAgICAgICAgbm9ybWFsOiBub3JtYWwuY29weSgpLFxuICAgICAgICAgICAgZGlzdGFuY2U6IHBlbmV0cmF0aW9uRGVwdGhcbiAgICAgICAgfVxuICAgIF07XG59XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmV4cG9ydCBjb25zdCBjb2xsaWRlU3BoZXJlV2l0aFNwaGVyZSA9IChzMSwgczIpID0+IHtcbiAgICBjb25zdCB7IGNlbnRlcjogYzEsIHJhZGl1czogcjEgfSA9IHMxO1xuICAgIGNvbnN0IHsgY2VudGVyOiBjMiwgcmFkaXVzOiByMiB9ID0gczI7XG4gICAgY29uc3QgZGVsdGEgPSB2ZWMzLnN1YnRyYWN0KGMyLCBjMSk7XG4gICAgY29uc3QgZGlzdGFuY2VTcXVhcmVkID0gZGVsdGEuc3F1YXJlZExlbmd0aDtcbiAgICBjb25zdCByYWRpaVN1bSA9IHIxICsgcjI7XG4gICAgaWYgKGRpc3RhbmNlU3F1YXJlZCA+IHJhZGlpU3VtICogcmFkaWlTdW0pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KGRpc3RhbmNlU3F1YXJlZCk7XG4gICAgY29uc3Qgbm9ybWFsID0gZGlzdGFuY2UgPiAwID8gdmVjMy5zY2FsZShkZWx0YSwgMSAvIGRpc3RhbmNlLCBuZXcgdmVjMygpKSA6IHZlYzMucmlnaHQuY29weSgpO1xuICAgIGNvbnN0IGNvbnRhY3RPZmZzZXQgPSB2ZWMzLnNjYWxlKG5vcm1hbCwgcjEsIG5ldyB2ZWMzKCkpO1xuICAgIGNvbnN0IGNvbnRhY3QgPSB2ZWMzLmFkZChjMSwgY29udGFjdE9mZnNldCwgbmV3IHZlYzMoKSk7XG4gICAgcmV0dXJuIHsgY29udGFjdCwgbm9ybWFsLCBkaXN0YW5jZTogZGlzdGFuY2UgLSByYWRpaVN1bSB9O1xufTtcbiIsImltcG9ydCB7IERpc3BhdGNoZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyBjb2xsaWRlQ3Vib2lkV2l0aEN1Ym9pZCB9IGZyb20gJy4uL2NvbGxpc2lvbnMvY3Vib2lkL2N1Ym9pZCc7XG5pbXBvcnQgeyBjb2xsaWRlUGxhbmVXaXRoQ3Vib2lkIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9wbGFuZS9jdWJvaWQnO1xuaW1wb3J0IHsgY29sbGlkZVBsYW5lV2l0aFNwaGVyZSB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcGxhbmUvc3BoZXJlJztcbmltcG9ydCB7IGNvbGxpZGVTcGhlcmVXaXRoQ3Vib2lkIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9zcGhlcmUvY3Vib2lkJztcbmltcG9ydCB7IGNvbGxpZGVQb2x5Z29uV2l0aFNwaGVyZSB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcG9seWdvbi9zcGhlcmUnO1xuaW1wb3J0IHsgY29sbGlkZVBvbHlnb25XaXRoQ3Vib2lkIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9wb2x5Z29uL2N1Ym9pZCc7XG5leHBvcnQgY2xhc3MgQ29sbGlzaW9uRGlzcGF0Y2hlciBleHRlbmRzIERpc3BhdGNoZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICAvLyByYXlcbiAgICAgICAgLy90aGlzLnJlZ2lzdGVyKCdSYXknLCAnUmF5JywgY29sbGlkZVJheVdpdGhSYXkpXG4gICAgICAgIC8vdGhpcy5yZWdpc3RlcignUmF5JywgJ1BsYW5lJywgY29sbGlkZVJheVdpdGhQbGFuZSlcbiAgICAgICAgLy90aGlzLnJlZ2lzdGVyKCdSYXknLCAnU3BoZXJlJywgY29sbGlkZVJheVdpdGhTcGhlcmUpXG4gICAgICAgIC8vdGhpcy5yZWdpc3RlcignUmF5JywgJ0N1Ym9pZCcsIGNvbGxpZGVSYXlXaXRoQ3Vib2lkKVxuICAgICAgICAvLyBwbGFuZVxuICAgICAgICB0aGlzLnJlZ2lzdGVyKCdQbGFuZScsICdTcGhlcmUnLCBjb2xsaWRlUGxhbmVXaXRoU3BoZXJlKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlcignUGxhbmUnLCAnQ3Vib2lkJywgY29sbGlkZVBsYW5lV2l0aEN1Ym9pZCk7XG4gICAgICAgIC8vIHBvbHlnb25cbiAgICAgICAgdGhpcy5yZWdpc3RlcignUG9seWdvbicsICdTcGhlcmUnLCBjb2xsaWRlUG9seWdvbldpdGhTcGhlcmUpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyKCdQb2x5Z29uJywgJ0N1Ym9pZCcsIGNvbGxpZGVQb2x5Z29uV2l0aEN1Ym9pZCk7XG4gICAgICAgIC8vIHNwaGVyZVxuICAgICAgICAvL3RoaXMucmVnaXN0ZXIoJ1NwaGVyZScsICdTcGhlcmUnLCBjb2xsaWRlU3BoZXJlV2l0aFNwaGVyZSlcbiAgICAgICAgdGhpcy5yZWdpc3RlcignU3BoZXJlJywgJ0N1Ym9pZCcsIGNvbGxpZGVTcGhlcmVXaXRoQ3Vib2lkKTtcbiAgICAgICAgLy8gY3Vib2lkXG4gICAgICAgIHRoaXMucmVnaXN0ZXIoJ0N1Ym9pZCcsICdDdWJvaWQnLCBjb2xsaWRlQ3Vib2lkV2l0aEN1Ym9pZCk7XG4gICAgfVxufVxuIiwiZXhwb3J0IHsgVm9sdW1lIH0gZnJvbSAnLi92b2x1bWUnO1xuZXhwb3J0IHsgQ29sbGlkZXIgfSBmcm9tICcuL2NvbGxpZGVyJztcbmV4cG9ydCB7IFJheSB9IGZyb20gJy4vY29sbGlkZXJzL3JheSc7XG5leHBvcnQgeyBQbGFuZSB9IGZyb20gJy4vY29sbGlkZXJzL3BsYW5lJztcbmV4cG9ydCB7IFBvbHlnb24gfSBmcm9tICcuL2NvbGxpZGVycy9wb2x5Z29uJztcbmV4cG9ydCB7IFNwaGVyZSB9IGZyb20gJy4vdm9sdW1lcy9zcGhlcmUnO1xuZXhwb3J0IHsgQ3Vib2lkIH0gZnJvbSAnLi92b2x1bWVzL2N1Ym9pZCc7XG5leHBvcnQgeyBDb2xsaXNpb25EaXNwYXRjaGVyIH0gZnJvbSAnLi9kaXNwYXRjaGVycy9jb2xsaXNpb24nO1xuZXhwb3J0IHsgY29sbGlkZVJheVdpdGhSYXkgfSBmcm9tICcuL2NvbGxpc2lvbnMvcmF5L3JheSc7XG5leHBvcnQgeyBjb2xsaWRlUmF5V2l0aFBsYW5lIH0gZnJvbSAnLi9jb2xsaXNpb25zL3JheS9wbGFuZSc7XG5leHBvcnQgeyBjb2xsaWRlUmF5V2l0aFNwaGVyZSB9IGZyb20gJy4vY29sbGlzaW9ucy9yYXkvc3BoZXJlJztcbmV4cG9ydCB7IGNvbGxpZGVSYXlXaXRoQ3Vib2lkIH0gZnJvbSAnLi9jb2xsaXNpb25zL3JheS9jdWJvaWQnO1xuZXhwb3J0IHsgY29sbGlkZVBsYW5lV2l0aFNwaGVyZSB9IGZyb20gJy4vY29sbGlzaW9ucy9wbGFuZS9zcGhlcmUnO1xuZXhwb3J0IHsgY29sbGlkZVBsYW5lV2l0aEN1Ym9pZCB9IGZyb20gJy4vY29sbGlzaW9ucy9wbGFuZS9jdWJvaWQnO1xuZXhwb3J0IHsgY29sbGlkZVNwaGVyZVdpdGhTcGhlcmUgfSBmcm9tICcuL2NvbGxpc2lvbnMvc3BoZXJlL3NwaGVyZSc7XG5leHBvcnQgeyBjb2xsaWRlU3BoZXJlV2l0aEN1Ym9pZCB9IGZyb20gJy4vY29sbGlzaW9ucy9zcGhlcmUvY3Vib2lkJztcbmV4cG9ydCB7IGNvbGxpZGVQb2x5Z29uV2l0aFNwaGVyZSB9IGZyb20gJy4vY29sbGlzaW9ucy9wb2x5Z29uL3NwaGVyZSc7XG5leHBvcnQgeyBjb2xsaWRlUG9seWdvbldpdGhDdWJvaWQgfSBmcm9tICcuL2NvbGxpc2lvbnMvcG9seWdvbi9jdWJvaWQnO1xuZXhwb3J0IHsgY29sbGlkZUN1Ym9pZFdpdGhDdWJvaWQgfSBmcm9tICcuL2NvbGxpc2lvbnMvY3Vib2lkL2N1Ym9pZCc7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXplIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuaW1wb3J0IHsgbWF0MywgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5pbXBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4vY29sbGlkZXInO1xuZXhwb3J0IGNsYXNzIFZvbHVtZSBleHRlbmRzIENvbGxpZGVyIHtcbiAgICBvcmlnaW4gPSB2ZWMzLnplcm87XG4gICAgY2VudGVyO1xuICAgIGludmVyc2VJbmVydGlhO1xuICAgIGNvbnN0cnVjdG9yKHsgb3JpZ2luID0gdmVjMy56ZXJvIH0gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9yaWdpbiA9IG9yaWdpbi5jb3B5KCk7XG4gICAgICAgIHRoaXMuY2VudGVyID0gb3JpZ2luLmNvcHkoKTtcbiAgICAgICAgdGhpcy5pbnZlcnNlSW5lcnRpYSA9IG5ldyBtYXQzKCk7XG4gICAgfVxuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgICAgY29uc3QgeyBvcmlnaW4gfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5zdXBlci5zZXJpYWxpemUoKSxcbiAgICAgICAgICAgIG9yaWdpbjogb3JpZ2luLnNlcmlhbGl6ZSgpXG4gICAgICAgIH07XG4gICAgfVxufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHZlYzMpXG5dLCBWb2x1bWUucHJvdG90eXBlLCBcIm9yaWdpblwiLCB2b2lkIDApO1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xudmFyIF9fbWV0YWRhdGEgPSAodGhpcyAmJiB0aGlzLl9fbWV0YWRhdGEpIHx8IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xufTtcbmltcG9ydCB7IFNlcmlhbGl6ZSwgUmVnaXN0ZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IFZvbHVtZSB9IGZyb20gJy4uL3ZvbHVtZSc7XG5sZXQgQ3Vib2lkID0gY2xhc3MgQ3Vib2lkIGV4dGVuZHMgVm9sdW1lIHtcbiAgICB0eXBlID0gJ0N1Ym9pZCc7XG4gICAgZXh0ZW50cztcbiAgICBheGVzOyAvLyBUcmFuc2Zvcm1lZCBheGVzIG9mIHRoZSBjdWJvaWRcbiAgICBjb25zdHJ1Y3Rvcih7IG9yaWdpbiA9IHZlYzMuemVybywgZXh0ZW50cyA9IHZlYzMub25lIH0gPSB7fSkge1xuICAgICAgICBzdXBlcih7IG9yaWdpbiB9KTtcbiAgICAgICAgdGhpcy5leHRlbnRzID0gZXh0ZW50cy5jb3B5KCk7XG4gICAgICAgIHRoaXMuYXhlcyA9IHZlYzMuYXhlcy5tYXAoKGF4aXMpID0+IGF4aXMuY29weSgpKTsgLy8gTG9jYWwgYXhlcywgaW5pdGlhbGx5IGFsaWduZWQgd2l0aCB3b3JsZCBheGVzXG4gICAgfVxuICAgIGFwcGx5VHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICBjb25zdCB7IHRyYW5zbGF0aW9uLCByb3RhdGlvbiB9ID0gdHJhbnNmb3JtO1xuICAgICAgICAvLyBVcGRhdGUgdGhlIGNlbnRlciBvZiB0aGUgY3Vib2lkXG4gICAgICAgIHZlYzMuYWRkKHRoaXMub3JpZ2luLCB0cmFuc2xhdGlvbiwgdGhpcy5jZW50ZXIpO1xuICAgICAgICAvLyBSb3RhdGUgdGhlIGxvY2FsIGF4ZXMgdG8gYWxpZ24gd2l0aCB0aGUgbmV3IG9yaWVudGF0aW9uXG4gICAgICAgIHZlYzMuYXhlcy5mb3JFYWNoKChheGlzLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgcm90YXRpb24udHJhbnNmb3JtVmVjMyhheGlzLCB0aGlzLmF4ZXNbaW5kZXhdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhbGN1bGF0ZUludmVyc2VJbmVydGlhKG1hc3MsIHRyYW5zZm9ybSkge1xuICAgICAgICBjb25zdCB7IHJvdGF0aW9uTWF0cml4IH0gPSB0cmFuc2Zvcm07XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdGhpcy5leHRlbnRzO1xuICAgICAgICBjb25zdCB0MSA9ICgxIC8gMTIpICogbWFzcyAqICh5ICogeSArIHogKiB6KTtcbiAgICAgICAgY29uc3QgdDIgPSAoMSAvIDEyKSAqIG1hc3MgKiAoeCAqIHggKyB6ICogeik7XG4gICAgICAgIGNvbnN0IHQzID0gKDEgLyAxMikgKiBtYXNzICogKHggKiB4ICsgeSAqIHkpO1xuICAgICAgICB0aGlzLmludmVyc2VJbmVydGlhLnNldChbdDEsIDAsIDAsIDAsIHQyLCAwLCAwLCAwLCB0M10pO1xuICAgICAgICB0aGlzLmludmVyc2VJbmVydGlhLm11bHRpcGx5KHJvdGF0aW9uTWF0cml4KS5pbnZlcnQoKTtcbiAgICB9XG4gICAgLy8gTmV3IG1ldGhvZCB0byBnZXQgdGhlIDggdmVydGljZXMgb2YgdGhlIGN1Ym9pZFxuICAgIGdldFZlcnRpY2VzKCkge1xuICAgICAgICBjb25zdCB7IHg6IGV4LCB5OiBleSwgejogZXogfSA9IHRoaXMuZXh0ZW50cztcbiAgICAgICAgLy8gVGhlc2UgY29tYmluYXRpb25zIHJlcHJlc2VudCB0aGUgOCB2ZXJ0aWNlcywgd2l0aCBkaWZmZXJlbnQgc2lnbiBjb21iaW5hdGlvbnMgb2YgZXh0ZW50c1xuICAgICAgICBjb25zdCBzaWducyA9IFtcbiAgICAgICAgICAgIFsrMSwgKzEsICsxXSxcbiAgICAgICAgICAgIFsrMSwgKzEsIC0xXSxcbiAgICAgICAgICAgIFsrMSwgLTEsICsxXSxcbiAgICAgICAgICAgIFsrMSwgLTEsIC0xXSxcbiAgICAgICAgICAgIFstMSwgKzEsICsxXSxcbiAgICAgICAgICAgIFstMSwgKzEsIC0xXSxcbiAgICAgICAgICAgIFstMSwgLTEsICsxXSxcbiAgICAgICAgICAgIFstMSwgLTEsIC0xXVxuICAgICAgICBdO1xuICAgICAgICAvLyBDb21wdXRlIGVhY2ggdmVydGV4IGJ5IHNjYWxpbmcgdGhlIGV4dGVudHMgYWxvbmcgZWFjaCBheGlzXG4gICAgICAgIHJldHVybiBzaWducy5tYXAoKFtzeCwgc3ksIHN6XSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmVydGV4ID0gdmVjMy56ZXJvLmNvcHkoKTtcbiAgICAgICAgICAgIC8vIENvbWJpbmUgdGhlIGF4ZXMgc2NhbGVkIGJ5IHRoZSBleHRlbnRzIGFuZCB0aGUgc2lnbnNcbiAgICAgICAgICAgIHZlYzMuYWRkKHZlcnRleCwgdmVjMy5zY2FsZSh0aGlzLmF4ZXNbMF0sIGV4ICogc3gpLCB2ZXJ0ZXgpOyAvLyBTY2FsZSBhbG9uZyB4LWF4aXNcbiAgICAgICAgICAgIHZlYzMuYWRkKHZlcnRleCwgdmVjMy5zY2FsZSh0aGlzLmF4ZXNbMV0sIGV5ICogc3kpLCB2ZXJ0ZXgpOyAvLyBTY2FsZSBhbG9uZyB5LWF4aXNcbiAgICAgICAgICAgIHZlYzMuYWRkKHZlcnRleCwgdmVjMy5zY2FsZSh0aGlzLmF4ZXNbMl0sIGV6ICogc3opLCB2ZXJ0ZXgpOyAvLyBTY2FsZSBhbG9uZyB6LWF4aXNcbiAgICAgICAgICAgIC8vIE9mZnNldCB0aGUgdmVydGV4IGJ5IHRoZSBjdWJvaWQncyBjZW50ZXJcbiAgICAgICAgICAgIHJldHVybiB2ZWMzLmFkZCh0aGlzLmNlbnRlciwgdmVydGV4KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldEVkZ2VzKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgWzAsIDFdLFxuICAgICAgICAgICAgWzEsIDNdLFxuICAgICAgICAgICAgWzMsIDJdLFxuICAgICAgICAgICAgWzIsIDBdLFxuICAgICAgICAgICAgWzQsIDVdLFxuICAgICAgICAgICAgWzUsIDddLFxuICAgICAgICAgICAgWzcsIDZdLFxuICAgICAgICAgICAgWzYsIDRdLFxuICAgICAgICAgICAgWzAsIDRdLFxuICAgICAgICAgICAgWzEsIDVdLFxuICAgICAgICAgICAgWzIsIDZdLFxuICAgICAgICAgICAgWzMsIDddIC8vIFZlcnRpY2FsIGVkZ2VzXG4gICAgICAgIF07XG4gICAgfVxufTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgQ3Vib2lkLnByb3RvdHlwZSwgXCJleHRlbnRzXCIsIHZvaWQgMCk7XG5DdWJvaWQgPSBfX2RlY29yYXRlKFtcbiAgICBSZWdpc3RlcigpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246cGFyYW10eXBlc1wiLCBbT2JqZWN0XSlcbl0sIEN1Ym9pZCk7XG5leHBvcnQgeyBDdWJvaWQgfTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUsIFJlZ2lzdGVyIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5pbXBvcnQgeyBWb2x1bWUgfSBmcm9tICcuLi92b2x1bWUnO1xubGV0IFNwaGVyZSA9IGNsYXNzIFNwaGVyZSBleHRlbmRzIFZvbHVtZSB7XG4gICAgdHlwZSA9ICdTcGhlcmUnO1xuICAgIHJhZGl1cztcbiAgICBjb25zdHJ1Y3Rvcih7IG9yaWdpbiA9IHZlYzMuemVybywgcmFkaXVzID0gMS4wIH0gPSB7fSkge1xuICAgICAgICBzdXBlcih7IG9yaWdpbiB9KTtcbiAgICAgICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgfVxuICAgIGFwcGx5VHJhbnNmb3JtKHRyYW5zZm9ybSkge1xuICAgICAgICBjb25zdCB7IHRyYW5zbGF0aW9uIH0gPSB0cmFuc2Zvcm07XG4gICAgICAgIHZlYzMuYWRkKHRoaXMub3JpZ2luLCB0cmFuc2xhdGlvbiwgdGhpcy5jZW50ZXIpO1xuICAgIH1cbiAgICBjYWxjdWxhdGVJbnZlcnNlSW5lcnRpYShtYXNzLCB0cmFuc2Zvcm0pIHtcbiAgICAgICAgY29uc3QgeyByYWRpdXMgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHQgPSAoMiAvIDUpICogbWFzcyAqIHJhZGl1cyAqIHJhZGl1cztcbiAgICAgICAgdGhpcy5pbnZlcnNlSW5lcnRpYS5zZXQoW3QsIDAsIDAsIDAsIHQsIDAsIDAsIDAsIHRdKTtcbiAgICAgICAgdGhpcy5pbnZlcnNlSW5lcnRpYS5pbnZlcnQoKTtcbiAgICB9XG59O1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFNwaGVyZS5wcm90b3R5cGUsIFwicmFkaXVzXCIsIHZvaWQgMCk7XG5TcGhlcmUgPSBfX2RlY29yYXRlKFtcbiAgICBSZWdpc3RlcigpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246cGFyYW10eXBlc1wiLCBbT2JqZWN0XSlcbl0sIFNwaGVyZSk7XG5leHBvcnQgeyBTcGhlcmUgfTtcbiIsImV4cG9ydCBjbGFzcyBEaXNwYXRjaGVyIHtcbiAgICBjYWxsYmFja3MgPSBuZXcgTWFwKCk7XG4gICAgcmVnaXN0ZXIoZmlyc3RUeXBlLCBvdGhlclR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnNldChgJHtmaXJzdFR5cGV9LSR7b3RoZXJUeXBlfWAsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZGlzcGF0Y2goZmlyc3QsIG90aGVyKSB7XG4gICAgICAgIGxldCBrZXkgPSBgJHtmaXJzdC50eXBlfS0ke290aGVyLnR5cGV9YDtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gdGhpcy5jYWxsYmFja3MuZ2V0KGtleSk7XG4gICAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGtleSA9IGAke290aGVyLnR5cGV9LSR7Zmlyc3QudHlwZX1gO1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrcy5nZXQoa2V5KTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhvdGhlciwgZmlyc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoY2FsbGJhY2spID8gY2FsbGJhY2soZmlyc3QsIG90aGVyKSA6IG51bGw7XG4gICAgfVxufVxuIiwiZXhwb3J0IHsgUG9vbCB9IGZyb20gJy4vcG9vbCc7XG5leHBvcnQgeyBEaXNwYXRjaGVyIH0gZnJvbSAnLi9kaXNwYXRjaGVyJztcbmV4cG9ydCB7IFNlcmlhbGl6ZSwgU2VyaWFsaXphYmxlIH0gZnJvbSAnLi9zZXJpYWxpemFibGUnO1xuZXhwb3J0IHsgVW5pZm9ybSwgZ2V0VW5pZm9ybVByb3BlcnRpZXMgfSBmcm9tICcuL3VuaWZvcm0nO1xuZXhwb3J0IHsgUmVnaXN0ZXIsIGdldFJlZ2lzdGVyZWRDbGFzcyB9IGZyb20gJy4vcmVnaXN0cnknO1xuIiwiY29uc3QgeyBjZWlsIH0gPSBNYXRoO1xuZXhwb3J0IGNsYXNzIFBvb2wge1xuICAgIGNyZWF0ZTtcbiAgICByZXNldDtcbiAgICBpbml0aWFsU2l6ZTtcbiAgICBiYXRjaFNpemU7XG4gICAgcG9vbDtcbiAgICBtYXhpbXVtU2l6ZTsgLy8gbWF4aW11bSBudW1iZXIgb2Ygb2JqZWN0cyB0aGF0IHRoZSBwb29sIGNhbiBncm93IHRvXG4gICAgY29uc3RydWN0b3IoY3JlYXRlLCByZXNldCwgaW5pdGlhbFNpemUsIC8vIG51bWJlciBvZiBvYmplY3RzIHRvIGFsbG9jYXRlIG9uIHBvb2wgY3JlYXRpb25cbiAgICBiYXRjaFNpemUgPSAwIC8vIG51bWJlciBvZiBvYmplY3RzIHRvIGNyZWF0ZSB3aGVuZXZlciBwb29sIG5lZWRzIHRvIGdyb3dcbiAgICApIHtcbiAgICAgICAgdGhpcy5jcmVhdGUgPSBjcmVhdGU7XG4gICAgICAgIHRoaXMucmVzZXQgPSByZXNldDtcbiAgICAgICAgdGhpcy5pbml0aWFsU2l6ZSA9IGluaXRpYWxTaXplO1xuICAgICAgICB0aGlzLmJhdGNoU2l6ZSA9IGJhdGNoU2l6ZTtcbiAgICAgICAgdGhpcy5wb29sID0gbmV3IEFycmF5KCk7XG4gICAgICAgIHRoaXMubWF4aW11bVNpemUgPSBpbml0aWFsU2l6ZTtcbiAgICAgICAgdGhpcy5hbGxvY2F0ZSh0aGlzLmluaXRpYWxTaXplKTtcbiAgICB9XG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9vbC5sZW5ndGg7XG4gICAgfVxuICAgIGFjcXVpcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLnBvb2wubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gaWYgbnVtYmVyIG9mIGF2YWlsYWJsZSBvYmplY3RzIGlzIGxlc3MgdGhhbiAxMCUgb2YgbWF4aW11bSBzaXplLFxuICAgICAgICAgICAgLy8gZG91YmxlIG1heGltdW0gc2l6ZSBhbmQgZmlsbCB1cCBwb29sIHdpdGggbmV3bHkgYWxsb2NhdGVkIG9iamVjdHNcbiAgICAgICAgICAgIGlmICh0aGlzLnBvb2wubGVuZ3RoIDw9IGNlaWwodGhpcy5tYXhpbXVtU2l6ZSAqIDAuMSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1heGltdW1TaXplICo9IDI7XG4gICAgICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZSh0aGlzLm1heGltdW1TaXplIC0gdGhpcy5wb29sLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbm9uZSBhdmFpbGFibGUsIFxuICAgICAgICAgICAgLy8gYWxsb2NhdGUgbmV3IGJhdGNoIG9mIG9iamVjdHNcbiAgICAgICAgICAgIHRoaXMuYWxsb2NhdGUodGhpcy5iYXRjaFNpemUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBvb2wucG9wKCk7IC8vIHJldHVybiBsYXN0IG9iamVjdCBpbiBwb29sXG4gICAgfVxuICAgIHJlbGVhc2Uob2JqZWN0KSB7XG4gICAgICAgIHRoaXMucG9vbC5wdXNoKHRoaXMucmVzZXQob2JqZWN0KSk7XG4gICAgfVxuICAgIGFsbG9jYXRlKHNpemUpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMucG9vbC5wdXNoKHRoaXMuY3JlYXRlKCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiY29uc3QgY2xhc3NSZWdpc3RyeSA9IG5ldyBNYXAoKTtcbmV4cG9ydCBmdW5jdGlvbiBSZWdpc3RlcigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGNsYXNzQ29uc3RydWN0b3IpIHtcbiAgICAgICAgY2xhc3NSZWdpc3RyeS5zZXQoY2xhc3NDb25zdHJ1Y3Rvci5uYW1lLCBjbGFzc0NvbnN0cnVjdG9yKTtcbiAgICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFJlZ2lzdGVyZWRDbGFzcyh2YWx1ZSkge1xuICAgIHJldHVybiBjbGFzc1JlZ2lzdHJ5LmdldCh2YWx1ZT8udHlwZSk7XG59XG4iLCJpbXBvcnQgJ3JlZmxlY3QtbWV0YWRhdGEnO1xuaW1wb3J0IHsgZ2V0UmVnaXN0ZXJlZENsYXNzIH0gZnJvbSAnLi9yZWdpc3RyeSc7XG5jb25zdCBzZXJpYWxpemVkUHJvcGVydGllcyA9IG5ldyBXZWFrTWFwKCk7XG5leHBvcnQgZnVuY3Rpb24gU2VyaWFsaXplKHZhbHVlVHlwZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgbGV0IHByb3BlcnRpZXMgPSBbXTtcbiAgICAgICAgaWYgKHNlcmlhbGl6ZWRQcm9wZXJ0aWVzLmhhcyh0YXJnZXQuY29uc3RydWN0b3IpKSB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0gc2VyaWFsaXplZFByb3BlcnRpZXMuZ2V0KHRhcmdldC5jb25zdHJ1Y3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZXJpYWxpemVkUHJvcGVydGllcy5zZXQodGFyZ2V0LmNvbnN0cnVjdG9yLCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlID0gUmVmbGVjdC5nZXRNZXRhZGF0YSgnZGVzaWduOnR5cGUnLCB0YXJnZXQsIGtleSk7XG4gICAgICAgIHByb3BlcnRpZXMucHVzaCh7IGtleSwgdHlwZSwgdmFsdWVUeXBlIH0pO1xuICAgIH07XG59XG5jb25zdCB7IGlzQXJyYXkgfSA9IEFycmF5O1xuY29uc3QgaXNPYmplY3QgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbn07XG5leHBvcnQgY2xhc3MgU2VyaWFsaXphYmxlIHtcbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICAgIGNvbnN0IGlzU2VyaWFsaXphYmxlID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlLnNlcmlhbGl6ZSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IFNlcmlhbGl6YWJsZS5nZXRBbGxTZXJpYWxpemFibGVQcm9wZXJ0aWVzKHRoaXMuY29uc3RydWN0b3IpO1xuICAgICAgICByZXR1cm4gcHJvcGVydGllcy5yZWR1Y2UoKGRhdGEsIHsga2V5IH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpc1trZXldO1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1NlcmlhbGl6YWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZS5zZXJpYWxpemUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZS5tYXAoKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1NlcmlhbGl6YWJsZSh2YWx1ZSkgPyB2YWx1ZS5zZXJpYWxpemUodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSBPYmplY3QuZW50cmllcyh2YWx1ZSkucmVkdWNlKChlbnRyaWVzLCBba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZW50cmllc1trZXldID0gaXNTZXJpYWxpemFibGUodmFsdWUpID8gdmFsdWUuc2VyaWFsaXplKHZhbHVlKSA6IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50cmllcztcbiAgICAgICAgICAgICAgICB9LCB7fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9LCB7fSk7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgICAgIGNvbnN0IGlzRGVzZXJpYWxpemFibGUgPSAodHlwZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGUgJiYgdHlwZW9mIHR5cGUuZGVzZXJpYWxpemUgPT09ICdmdW5jdGlvbic7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IHRoaXMoKTtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IFNlcmlhbGl6YWJsZS5nZXRBbGxTZXJpYWxpemFibGVQcm9wZXJ0aWVzKHRoaXMpO1xuICAgICAgICBmb3IgKGNvbnN0IHsga2V5LCB0eXBlLCB2YWx1ZVR5cGUgfSBvZiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGRhdGFba2V5XTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgY3VycmVudFR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRWYWx1ZVR5cGUgPSB2YWx1ZVR5cGU7XG4gICAgICAgICAgICBpZiAoZ2V0UmVnaXN0ZXJlZENsYXNzKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUeXBlID0gZ2V0UmVnaXN0ZXJlZENsYXNzKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0Rlc2VyaWFsaXphYmxlKGN1cnJlbnRUeXBlKSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlW2tleV0gPSBhd2FpdCBjdXJyZW50VHlwZS5kZXNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlW2tleV0gPSBhd2FpdCBQcm9taXNlLmFsbCh2YWx1ZS5tYXAoYXN5bmMgKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW1WYWx1ZVR5cGUgPSBjdXJyZW50VmFsdWVUeXBlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0UmVnaXN0ZXJlZENsYXNzKGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtVmFsdWVUeXBlID0gZ2V0UmVnaXN0ZXJlZENsYXNzKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycgJiYgaXRlbVZhbHVlVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbkRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNvbHZlZFR5cGUgPSBnZXRSZWdpc3RlcmVkQ2xhc3MoanNvbkRhdGEpIHx8IGl0ZW1WYWx1ZVR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcmVzb2x2ZWRUeXBlLmRlc2VyaWFsaXplKGpzb25EYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpc0Rlc2VyaWFsaXphYmxlKGl0ZW1WYWx1ZVR5cGUpID8gYXdhaXQgaXRlbVZhbHVlVHlwZS5kZXNlcmlhbGl6ZShpdGVtKSA6IGl0ZW07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgUHJvbWlzZS5hbGwoT2JqZWN0LmVudHJpZXModmFsdWUpLm1hcChhc3luYyAoW2VudHJ5S2V5LCBlbnRyeVZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZW50cnlWYWx1ZVR5cGUgPSBjdXJyZW50VmFsdWVUeXBlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZ2V0UmVnaXN0ZXJlZENsYXNzKGVudHJ5VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRyeVZhbHVlVHlwZSA9IGdldFJlZ2lzdGVyZWRDbGFzcyhlbnRyeVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVudHJ5VmFsdWUgPT09ICdzdHJpbmcnICYmIGVudHJ5VmFsdWVUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZW50cnlWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkVHlwZSA9IGdldFJlZ2lzdGVyZWRDbGFzcyhqc29uRGF0YSkgfHwgZW50cnlWYWx1ZVR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2VudHJ5S2V5LCBhd2FpdCByZXNvbHZlZFR5cGUuZGVzZXJpYWxpemUoanNvbkRhdGEpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnlLZXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNEZXNlcmlhbGl6YWJsZShlbnRyeVZhbHVlVHlwZSkgPyBhd2FpdCBlbnRyeVZhbHVlVHlwZS5kZXNlcmlhbGl6ZShlbnRyeVZhbHVlKSA6IGVudHJ5VmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2Vba2V5XSA9IE9iamVjdC5mcm9tRW50cmllcyhlbnRyaWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfVxuICAgIHN0YXRpYyBnZXRBbGxTZXJpYWxpemFibGVQcm9wZXJ0aWVzKHRhcmdldCkge1xuICAgICAgICBsZXQgYWxsUHJvcGVydGllcyA9IFtdO1xuICAgICAgICBsZXQgcHJvdG90eXBlID0gdGFyZ2V0LnByb3RvdHlwZTtcbiAgICAgICAgd2hpbGUgKHByb3RvdHlwZSAmJiBwcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBzZXJpYWxpemVkUHJvcGVydGllcy5nZXQocHJvdG90eXBlLmNvbnN0cnVjdG9yKSB8fCBbXTtcbiAgICAgICAgICAgIGFsbFByb3BlcnRpZXMgPSBbLi4uYWxsUHJvcGVydGllcywgLi4ucHJvcGVydGllc107XG4gICAgICAgICAgICBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG90eXBlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxsUHJvcGVydGllcztcbiAgICB9XG59XG4iLCJjb25zdCB1bmlmb3JtUHJvcGVydGllcyA9IG5ldyBXZWFrTWFwKCk7XG5leHBvcnQgZnVuY3Rpb24gVW5pZm9ybSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7XG4gICAgICAgIGxldCBwcm9wZXJ0aWVzID0gW107XG4gICAgICAgIGlmICh1bmlmb3JtUHJvcGVydGllcy5oYXModGFyZ2V0LmNvbnN0cnVjdG9yKSkge1xuICAgICAgICAgICAgcHJvcGVydGllcyA9IHVuaWZvcm1Qcm9wZXJ0aWVzLmdldCh0YXJnZXQuY29uc3RydWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdW5pZm9ybVByb3BlcnRpZXMuc2V0KHRhcmdldC5jb25zdHJ1Y3RvciwgcHJvcGVydGllcyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdHlwZSA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoJ2Rlc2lnbjp0eXBlJywgdGFyZ2V0LCBrZXkpO1xuICAgICAgICBwcm9wZXJ0aWVzLnB1c2goeyBrZXksIHR5cGUgfSk7XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRVbmlmb3JtUHJvcGVydGllcyh0YXJnZXQpIHtcbiAgICBsZXQgYWxsUHJvcGVydGllcyA9IFtdO1xuICAgIGxldCBwcm90b3R5cGUgPSB0YXJnZXQucHJvdG90eXBlO1xuICAgIHdoaWxlIChwcm90b3R5cGUgJiYgcHJvdG90eXBlICE9PSBPYmplY3QucHJvdG90eXBlKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB1bmlmb3JtUHJvcGVydGllcy5nZXQocHJvdG90eXBlLmNvbnN0cnVjdG9yKSB8fCBbXTtcbiAgICAgICAgYWxsUHJvcGVydGllcyA9IFsuLi5hbGxQcm9wZXJ0aWVzLCAuLi5wcm9wZXJ0aWVzXTtcbiAgICAgICAgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvdHlwZSk7XG4gICAgfVxuICAgIHJldHVybiBhbGxQcm9wZXJ0aWVzO1xufVxuIiwiZXhwb3J0IGNvbnN0IEVwc2lsb24gPSAwLjAwMDAxO1xuIiwiZXhwb3J0IHsgbWF0MiB9IGZyb20gJy4vbWF0Mic7XG5leHBvcnQgeyBtYXQzIH0gZnJvbSAnLi9tYXQzJztcbmV4cG9ydCB7IG1hdDQgfSBmcm9tICcuL21hdDQnO1xuZXhwb3J0IHsgdmVjMiB9IGZyb20gJy4vdmVjMic7XG5leHBvcnQgeyB2ZWMzIH0gZnJvbSAnLi92ZWMzJztcbmV4cG9ydCB7IHZlYzQgfSBmcm9tICcuL3ZlYzQnO1xuZXhwb3J0IHsgcXVhdCB9IGZyb20gJy4vcXVhdCc7XG5leHBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuIiwiaW1wb3J0IHsgRXBzaWxvbiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IHZlYzIgfSBmcm9tICcuL3ZlYzInO1xuZXhwb3J0IGNsYXNzIG1hdDIgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyA9IFsxLjAsIDAuMCwgMC4wLCAxLjBdKSB7XG4gICAgICAgIHN1cGVyKHZhbHVlcy5zbGljZSgwLCA0KSk7XG4gICAgfVxuICAgIHN0YXRpYyBpZGVudGl0eSA9IG5ldyBtYXQyKCk7XG4gICAgZ2V0IGRldGVybWluYW50KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXSAqIHRoaXNbM10gLSB0aGlzWzJdICogdGhpc1sxXTtcbiAgICB9XG4gICAgY29weShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgbWF0MigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3Quc2V0KHRoaXMpO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgcm93KGluZGV4LCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXNbaW5kZXggKiAyXTtcbiAgICAgICAgZGVzdC55ID0gdGhpc1tpbmRleCAqIDIgKyAxXTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIGNvbHVtbihpbmRleCwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzW2luZGV4XTtcbiAgICAgICAgZGVzdC55ID0gdGhpc1tpbmRleCArIDJdO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgZXF1YWxzKG90aGVyLCB0aHJlc2hvbGQgPSBFcHNpbG9uKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpc1tpXSAtIG90aGVyW2ldKSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXNbMF0gPSAxLjA7XG4gICAgICAgIHRoaXNbMV0gPSAwLjA7XG4gICAgICAgIHRoaXNbMl0gPSAwLjA7XG4gICAgICAgIHRoaXNbM10gPSAxLjA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB0cmFuc3Bvc2UoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0ID0gdGhpc1sxXTtcbiAgICAgICAgZGVzdFsxXSA9IGRlc3RbMl07XG4gICAgICAgIGRlc3RbMl0gPSB0O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgaW52ZXJ0KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRldCA9IHRoaXMuZGV0ZXJtaW5hbnQ7XG4gICAgICAgIGlmIChkZXQgPT09IDAuMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZGV0ID0gMS4wIC8gZGV0O1xuICAgICAgICBjb25zdCB0MDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCB0MDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCB0MTAgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCB0MTEgPSB0aGlzWzNdO1xuICAgICAgICBkZXN0WzBdID0gZGV0ICogdDExO1xuICAgICAgICBkZXN0WzFdID0gZGV0ICogLXQwMTtcbiAgICAgICAgZGVzdFsyXSA9IGRldCAqIC10MTA7XG4gICAgICAgIGRlc3RbM10gPSBkZXQgKiB0MDA7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBtdWx0aXBseShvdGhlciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhMDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCBhMDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCBhMTAgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCBhMTEgPSB0aGlzWzNdO1xuICAgICAgICBjb25zdCBiMDAgPSBvdGhlclswXTtcbiAgICAgICAgY29uc3QgYjAxID0gb3RoZXJbMV07XG4gICAgICAgIGNvbnN0IGIxMCA9IG90aGVyWzJdO1xuICAgICAgICBjb25zdCBiMTEgPSBvdGhlclszXTtcbiAgICAgICAgZGVzdFswXSA9IGEwMCAqIGIwMCArIGEwMSAqIGIxMDtcbiAgICAgICAgZGVzdFsxXSA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMTtcbiAgICAgICAgZGVzdFsyXSA9IGExMCAqIGIwMCArIGExMSAqIGIxMDtcbiAgICAgICAgZGVzdFszXSA9IGExMCAqIGIwMSArIGExMSAqIGIxMTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHRyYW5zZm9ybSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeCA9IHZlY3Rvci54O1xuICAgICAgICBjb25zdCB5ID0gdmVjdG9yLnk7XG4gICAgICAgIGRlc3QueCA9IHggKiB0aGlzWzBdICsgeSAqIHRoaXNbMV07XG4gICAgICAgIGRlc3QueSA9IHggKiB0aGlzWzJdICsgeSAqIHRoaXNbM107XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzY2FsZSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdjAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgdjAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgdjEwID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgdjExID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgeCA9IHZlY3Rvci54O1xuICAgICAgICBjb25zdCB5ID0gdmVjdG9yLnk7XG4gICAgICAgIGRlc3RbMF0gPSB2MDAgKiB4O1xuICAgICAgICBkZXN0WzFdID0gdjAxICogeTtcbiAgICAgICAgZGVzdFsyXSA9IHYxMCAqIHg7XG4gICAgICAgIGRlc3RbM10gPSB2MTEgKiB5O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgcm90YXRlKGFuZ2xlLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHYwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IHYwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IHYxMCA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IHYxMSA9IHRoaXNbM107XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgY29uc3QgY29zID0gTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBkZXN0WzBdID0gdjAwICogY29zICsgdjAxICogc2luO1xuICAgICAgICBkZXN0WzFdID0gdjAwICogLXNpbiArIHYwMSAqIGNvcztcbiAgICAgICAgZGVzdFsyXSA9IHYxMCAqIGNvcyArIHYxMSAqIHNpbjtcbiAgICAgICAgZGVzdFszXSA9IHYxMCAqIC1zaW4gKyB2MTEgKiBjb3M7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZGVzZXJpYWxpemUodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBuZXcgbWF0Mih2YWx1ZXMpO1xuICAgIH1cbiAgICBzdGF0aWMgbXVsdGlwbHkobTEsIG0yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgbWF0MigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGEwMCA9IG0xWzBdO1xuICAgICAgICBjb25zdCBhMDEgPSBtMVsxXTtcbiAgICAgICAgY29uc3QgYTEwID0gbTFbMl07XG4gICAgICAgIGNvbnN0IGExMSA9IG0xWzNdO1xuICAgICAgICBjb25zdCBiMDAgPSBtMlswXTtcbiAgICAgICAgY29uc3QgYjAxID0gbTJbMV07XG4gICAgICAgIGNvbnN0IGIxMCA9IG0yWzJdO1xuICAgICAgICBjb25zdCBiMTEgPSBtMlszXTtcbiAgICAgICAgZGVzdFswXSA9IGEwMCAqIGIwMCArIGEwMSAqIGIxMDtcbiAgICAgICAgZGVzdFsxXSA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMTtcbiAgICAgICAgZGVzdFsyXSA9IGExMCAqIGIwMCArIGExMSAqIGIxMDtcbiAgICAgICAgZGVzdFszXSA9IGExMCAqIGIwMSArIGExMSAqIGIxMTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRXBzaWxvbiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IG1hdDQgfSBmcm9tICcuL21hdDQnO1xuaW1wb3J0IHsgcXVhdCB9IGZyb20gJy4vcXVhdCc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi92ZWMzJztcbmV4cG9ydCBjbGFzcyBtYXQzIGV4dGVuZHMgRmxvYXQzMkFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMgPSBbMS4wLCAwLjAsIDAuMCwgMC4wLCAxLjAsIDAuMCwgMC4wLCAwLjAsIDEuMF0pIHtcbiAgICAgICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDkpKTtcbiAgICB9XG4gICAgc3RhdGljIGlkZW50aXR5ID0gbmV3IG1hdDMoKTtcbiAgICBnZXQgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIGNvbnN0IHYwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IHYwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IHYwMiA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IHYxMCA9IHRoaXNbM107XG4gICAgICAgIGNvbnN0IHYxMSA9IHRoaXNbNF07XG4gICAgICAgIGNvbnN0IHYxMiA9IHRoaXNbNV07XG4gICAgICAgIGNvbnN0IHYyMCA9IHRoaXNbNl07XG4gICAgICAgIGNvbnN0IHYyMSA9IHRoaXNbN107XG4gICAgICAgIGNvbnN0IHYyMiA9IHRoaXNbOF07XG4gICAgICAgIGNvbnN0IGRldDAxID0gdjIyICogdjExIC0gdjEyICogdjIxO1xuICAgICAgICBjb25zdCBkZXQxMSA9IC12MjIgKiB2MTAgKyB2MTIgKiB2MjA7XG4gICAgICAgIGNvbnN0IGRldDIxID0gdjIxICogdjEwIC0gdjExICogdjIwO1xuICAgICAgICByZXR1cm4gdjAwICogZGV0MDEgKyB2MDEgKiBkZXQxMSArIHYwMiAqIGRldDIxO1xuICAgIH1cbiAgICBjb3B5KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA5OyBpKyspIHtcbiAgICAgICAgICAgIGRlc3RbaV0gPSB0aGlzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICByb3coaW5kZXgsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpc1tpbmRleCAqIDNdO1xuICAgICAgICBkZXN0LnkgPSB0aGlzW2luZGV4ICogMyArIDFdO1xuICAgICAgICBkZXN0LnogPSB0aGlzW2luZGV4ICogMyArIDJdO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgY29sdW1uKGluZGV4LCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXNbaW5kZXhdO1xuICAgICAgICBkZXN0LnkgPSB0aGlzW2luZGV4ICsgM107XG4gICAgICAgIGRlc3QueiA9IHRoaXNbaW5kZXggKyA2XTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIGVxdWFscyhvdGhlciwgdGhyZXNob2xkID0gRXBzaWxvbikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDk7IGkrKykge1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRoaXNbaV0gLSBvdGhlcltpXSkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzWzBdID0gMS4wO1xuICAgICAgICB0aGlzWzFdID0gMC4wO1xuICAgICAgICB0aGlzWzJdID0gMC4wO1xuICAgICAgICB0aGlzWzNdID0gMC4wO1xuICAgICAgICB0aGlzWzRdID0gMS4wO1xuICAgICAgICB0aGlzWzVdID0gMC4wO1xuICAgICAgICB0aGlzWzZdID0gMC4wO1xuICAgICAgICB0aGlzWzddID0gMC4wO1xuICAgICAgICB0aGlzWzhdID0gMS4wO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdHJhbnNwb3NlKGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdDAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgdDAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgdDAyID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgdDEwID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgdDExID0gdGhpc1s0XTtcbiAgICAgICAgY29uc3QgdDEyID0gdGhpc1s1XTtcbiAgICAgICAgY29uc3QgdDIwID0gdGhpc1s2XTtcbiAgICAgICAgY29uc3QgdDIxID0gdGhpc1s3XTtcbiAgICAgICAgY29uc3QgdDIyID0gdGhpc1s4XTtcbiAgICAgICAgZGVzdFswXSA9IHQwMDtcbiAgICAgICAgZGVzdFsxXSA9IHQxMDtcbiAgICAgICAgZGVzdFsyXSA9IHQyMDtcbiAgICAgICAgZGVzdFszXSA9IHQwMTtcbiAgICAgICAgZGVzdFs0XSA9IHQxMTtcbiAgICAgICAgZGVzdFs1XSA9IHQyMTtcbiAgICAgICAgZGVzdFs2XSA9IHQwMjtcbiAgICAgICAgZGVzdFs3XSA9IHQxMjtcbiAgICAgICAgZGVzdFs4XSA9IHQyMjtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIGludmVydChkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHYwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IHYwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IHYwMiA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IHYxMCA9IHRoaXNbM107XG4gICAgICAgIGNvbnN0IHYxMSA9IHRoaXNbNF07XG4gICAgICAgIGNvbnN0IHYxMiA9IHRoaXNbNV07XG4gICAgICAgIGNvbnN0IHYyMCA9IHRoaXNbNl07XG4gICAgICAgIGNvbnN0IHYyMSA9IHRoaXNbN107XG4gICAgICAgIGNvbnN0IHYyMiA9IHRoaXNbOF07XG4gICAgICAgIGNvbnN0IGRldDAxID0gdjIyICogdjExIC0gdjEyICogdjIxO1xuICAgICAgICBjb25zdCBkZXQxMSA9IC12MjIgKiB2MTAgKyB2MTIgKiB2MjA7XG4gICAgICAgIGNvbnN0IGRldDIxID0gdjIxICogdjEwIC0gdjExICogdjIwO1xuICAgICAgICBsZXQgZGV0ID0gdjAwICogZGV0MDEgKyB2MDEgKiBkZXQxMSArIHYwMiAqIGRldDIxO1xuICAgICAgICBpZiAoZGV0ID09PSAwLjApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWF0cml4IGlzIG5vdCBpbnZlcnRpYmxlJyk7XG4gICAgICAgIH1cbiAgICAgICAgZGV0ID0gMS4wIC8gZGV0O1xuICAgICAgICBkZXN0WzBdID0gZGV0MDEgKiBkZXQ7XG4gICAgICAgIGRlc3RbMV0gPSAoLXYyMiAqIHYwMSArIHYwMiAqIHYyMSkgKiBkZXQ7XG4gICAgICAgIGRlc3RbMl0gPSAodjEyICogdjAxIC0gdjAyICogdjExKSAqIGRldDtcbiAgICAgICAgZGVzdFszXSA9IGRldDExICogZGV0O1xuICAgICAgICBkZXN0WzRdID0gKHYyMiAqIHYwMCAtIHYwMiAqIHYyMCkgKiBkZXQ7XG4gICAgICAgIGRlc3RbNV0gPSAoLXYxMiAqIHYwMCArIHYwMiAqIHYxMCkgKiBkZXQ7XG4gICAgICAgIGRlc3RbNl0gPSBkZXQyMSAqIGRldDtcbiAgICAgICAgZGVzdFs3XSA9ICgtdjIxICogdjAwICsgdjAxICogdjIwKSAqIGRldDtcbiAgICAgICAgZGVzdFs4XSA9ICh2MTEgKiB2MDAgLSB2MDEgKiB2MTApICogZGV0O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgbXVsdGlwbHkob3RoZXIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYTAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgYTAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgYTAyID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgYTEwID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgYTExID0gdGhpc1s0XTtcbiAgICAgICAgY29uc3QgYTEyID0gdGhpc1s1XTtcbiAgICAgICAgY29uc3QgYTIwID0gdGhpc1s2XTtcbiAgICAgICAgY29uc3QgYTIxID0gdGhpc1s3XTtcbiAgICAgICAgY29uc3QgYTIyID0gdGhpc1s4XTtcbiAgICAgICAgY29uc3QgYjAwID0gb3RoZXJbMF07XG4gICAgICAgIGNvbnN0IGIwMSA9IG90aGVyWzFdO1xuICAgICAgICBjb25zdCBiMDIgPSBvdGhlclsyXTtcbiAgICAgICAgY29uc3QgYjEwID0gb3RoZXJbM107XG4gICAgICAgIGNvbnN0IGIxMSA9IG90aGVyWzRdO1xuICAgICAgICBjb25zdCBiMTIgPSBvdGhlcls1XTtcbiAgICAgICAgY29uc3QgYjIwID0gb3RoZXJbNl07XG4gICAgICAgIGNvbnN0IGIyMSA9IG90aGVyWzddO1xuICAgICAgICBjb25zdCBiMjIgPSBvdGhlcls4XTtcbiAgICAgICAgZGVzdFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMDtcbiAgICAgICAgZGVzdFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMTtcbiAgICAgICAgZGVzdFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMjtcbiAgICAgICAgZGVzdFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgICAgICAgZGVzdFs0XSA9IGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMTtcbiAgICAgICAgZGVzdFs1XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMjtcbiAgICAgICAgZGVzdFs2XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMDtcbiAgICAgICAgZGVzdFs3XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMTtcbiAgICAgICAgZGVzdFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMjtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHRyYW5zZm9ybSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB4LCB5LCB6IH0gPSB2ZWN0b3I7XG4gICAgICAgIGRlc3QueCA9IHggKiB0aGlzWzBdICsgeSAqIHRoaXNbM10gKyB6ICogdGhpc1s2XTtcbiAgICAgICAgZGVzdC55ID0geCAqIHRoaXNbMV0gKyB5ICogdGhpc1s0XSArIHogKiB0aGlzWzddO1xuICAgICAgICBkZXN0LnogPSB4ICogdGhpc1syXSArIHkgKiB0aGlzWzVdICsgeiAqIHRoaXNbOF07XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICByb3RhdGUoYW5nbGUsIGF4aXMsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHsgeCwgeSwgeiB9ID0gYXhpcztcbiAgICAgICAgbGV0IGxlbmd0aCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xuICAgICAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgbGVuZ3RoID0gMSAvIGxlbmd0aDtcbiAgICAgICAgICAgIHggKj0gbGVuZ3RoO1xuICAgICAgICAgICAgeSAqPSBsZW5ndGg7XG4gICAgICAgICAgICB6ICo9IGxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICBjb25zdCBjID0gTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBjb25zdCB0ID0gMS4wIC0gYztcbiAgICAgICAgY29uc3QgYTAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgYTAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgYTAyID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgYTEwID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgYTExID0gdGhpc1s0XTtcbiAgICAgICAgY29uc3QgYTEyID0gdGhpc1s1XTtcbiAgICAgICAgY29uc3QgYTIwID0gdGhpc1s2XTtcbiAgICAgICAgY29uc3QgYTIxID0gdGhpc1s3XTtcbiAgICAgICAgY29uc3QgYTIyID0gdGhpc1s4XTtcbiAgICAgICAgY29uc3QgYjAwID0geCAqIHggKiB0ICsgYztcbiAgICAgICAgY29uc3QgYjAxID0geSAqIHggKiB0ICsgeiAqIHM7XG4gICAgICAgIGNvbnN0IGIwMiA9IHogKiB4ICogdCAtIHkgKiBzO1xuICAgICAgICBjb25zdCBiMTAgPSB4ICogeSAqIHQgLSB6ICogcztcbiAgICAgICAgY29uc3QgYjExID0geSAqIHkgKiB0ICsgYztcbiAgICAgICAgY29uc3QgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XG4gICAgICAgIGNvbnN0IGIyMCA9IHggKiB6ICogdCArIHkgKiBzO1xuICAgICAgICBjb25zdCBiMjEgPSB5ICogeiAqIHQgLSB4ICogcztcbiAgICAgICAgY29uc3QgYjIyID0geiAqIHogKiB0ICsgYztcbiAgICAgICAgZGVzdFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcbiAgICAgICAgZGVzdFsxXSA9IGEwMSAqIGIwMCArIGExMSAqIGIwMSArIGEyMSAqIGIwMjtcbiAgICAgICAgZGVzdFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICAgICAgZGVzdFszXSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMjtcbiAgICAgICAgZGVzdFs0XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICAgICAgZGVzdFs1XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcbiAgICAgICAgZGVzdFs2XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICAgICAgZGVzdFs3XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcbiAgICAgICAgZGVzdFs4XSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHRvTWF0NChkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgbWF0NCgpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3Quc2V0KFtcbiAgICAgICAgICAgIHRoaXNbMF0sXG4gICAgICAgICAgICB0aGlzWzFdLFxuICAgICAgICAgICAgdGhpc1syXSxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIHRoaXNbM10sXG4gICAgICAgICAgICB0aGlzWzRdLFxuICAgICAgICAgICAgdGhpc1s1XSxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIHRoaXNbNl0sXG4gICAgICAgICAgICB0aGlzWzddLFxuICAgICAgICAgICAgdGhpc1s4XSxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDEuMFxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHRvUXVhdChkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgcXVhdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHYwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IHYwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IHYwMiA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IHYxMCA9IHRoaXNbM107XG4gICAgICAgIGNvbnN0IHYxMSA9IHRoaXNbNF07XG4gICAgICAgIGNvbnN0IHYxMiA9IHRoaXNbNV07XG4gICAgICAgIGNvbnN0IHYyMCA9IHRoaXNbNl07XG4gICAgICAgIGNvbnN0IHYyMSA9IHRoaXNbN107XG4gICAgICAgIGNvbnN0IHYyMiA9IHRoaXNbOF07XG4gICAgICAgIGNvbnN0IHggPSB2MDAgLSB2MTEgLSB2MjI7XG4gICAgICAgIGNvbnN0IHkgPSB2MTEgLSB2MDAgLSB2MjI7XG4gICAgICAgIGNvbnN0IHogPSB2MjIgLSB2MDAgLSB2MTE7XG4gICAgICAgIGNvbnN0IHcgPSB2MDAgKyB2MTEgKyB2MjI7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgbGV0IGYgPSB3O1xuICAgICAgICBpZiAoeCA+IGYpIHtcbiAgICAgICAgICAgIGYgPSB4O1xuICAgICAgICAgICAgaSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHkgPiBmKSB7XG4gICAgICAgICAgICBmID0geTtcbiAgICAgICAgICAgIGkgPSAyO1xuICAgICAgICB9XG4gICAgICAgIGlmICh6ID4gZikge1xuICAgICAgICAgICAgZiA9IHo7XG4gICAgICAgICAgICBpID0gMztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBiID0gTWF0aC5zcXJ0KGYgKyAxKSAqIDAuNTtcbiAgICAgICAgY29uc3QgbSA9IDAuMjUgLyBiO1xuICAgICAgICBzd2l0Y2ggKGkpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBkZXN0LncgPSBiO1xuICAgICAgICAgICAgICAgIGRlc3QueCA9ICh2MTIgLSB2MjEpICogbTtcbiAgICAgICAgICAgICAgICBkZXN0LnkgPSAodjIwIC0gdjAyKSAqIG07XG4gICAgICAgICAgICAgICAgZGVzdC56ID0gKHYwMSAtIHYxMCkgKiBtO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGRlc3QudyA9ICh2MTIgLSB2MjEpICogbTtcbiAgICAgICAgICAgICAgICBkZXN0LnggPSBiO1xuICAgICAgICAgICAgICAgIGRlc3QueSA9ICh2MDEgKyB2MTApICogbTtcbiAgICAgICAgICAgICAgICBkZXN0LnogPSAodjIwICsgdjAyKSAqIG07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgZGVzdC53ID0gKHYyMCAtIHYwMikgKiBtO1xuICAgICAgICAgICAgICAgIGRlc3QueCA9ICh2MDEgKyB2MTApICogbTtcbiAgICAgICAgICAgICAgICBkZXN0LnkgPSBiO1xuICAgICAgICAgICAgICAgIGRlc3QueiA9ICh2MTIgKyB2MjEpICogbTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBkZXN0LncgPSAodjAxIC0gdjEwKSAqIG07XG4gICAgICAgICAgICAgICAgZGVzdC54ID0gKHYyMCArIHYwMikgKiBtO1xuICAgICAgICAgICAgICAgIGRlc3QueSA9ICh2MTIgKyB2MjEpICogbTtcbiAgICAgICAgICAgICAgICBkZXN0LnogPSBiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZGVzZXJpYWxpemUodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBuZXcgbWF0Myh2YWx1ZXMpO1xuICAgIH1cbiAgICBzdGF0aWMgdHJhbnNmb3JtKG1hdHJpeCwgdmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdmVjdG9yO1xuICAgICAgICBkZXN0LnggPSB4ICogbWF0cml4WzBdICsgeSAqIG1hdHJpeFszXSArIHogKiBtYXRyaXhbNl07XG4gICAgICAgIGRlc3QueSA9IHggKiBtYXRyaXhbMV0gKyB5ICogbWF0cml4WzRdICsgeiAqIG1hdHJpeFs3XTtcbiAgICAgICAgZGVzdC56ID0geCAqIG1hdHJpeFsyXSArIHkgKiBtYXRyaXhbNV0gKyB6ICogbWF0cml4WzhdO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG11bHRpcGx5KG0xLCBtMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDMoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhMDAgPSBtMVswXTtcbiAgICAgICAgY29uc3QgYTAxID0gbTFbMV07XG4gICAgICAgIGNvbnN0IGEwMiA9IG0xWzJdO1xuICAgICAgICBjb25zdCBhMTAgPSBtMVszXTtcbiAgICAgICAgY29uc3QgYTExID0gbTFbNF07XG4gICAgICAgIGNvbnN0IGExMiA9IG0xWzVdO1xuICAgICAgICBjb25zdCBhMjAgPSBtMVs2XTtcbiAgICAgICAgY29uc3QgYTIxID0gbTFbN107XG4gICAgICAgIGNvbnN0IGEyMiA9IG0xWzhdO1xuICAgICAgICBjb25zdCBiMDAgPSBtMlswXTtcbiAgICAgICAgY29uc3QgYjAxID0gbTJbMV07XG4gICAgICAgIGNvbnN0IGIwMiA9IG0yWzJdO1xuICAgICAgICBjb25zdCBiMTAgPSBtMlszXTtcbiAgICAgICAgY29uc3QgYjExID0gbTJbNF07XG4gICAgICAgIGNvbnN0IGIxMiA9IG0yWzVdO1xuICAgICAgICBjb25zdCBiMjAgPSBtMls2XTtcbiAgICAgICAgY29uc3QgYjIxID0gbTJbN107XG4gICAgICAgIGNvbnN0IGIyMiA9IG0yWzhdO1xuICAgICAgICBkZXN0LnNldChbXG4gICAgICAgICAgICBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjAsXG4gICAgICAgICAgICBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjEsXG4gICAgICAgICAgICBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjIsXG4gICAgICAgICAgICBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjAsXG4gICAgICAgICAgICBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjEsXG4gICAgICAgICAgICBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjIsXG4gICAgICAgICAgICBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjAsXG4gICAgICAgICAgICBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjEsXG4gICAgICAgICAgICBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjJcbiAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbG9va0F0KGV5ZSwgdGFyZ2V0LCB1cCA9IHZlYzMudXAsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV5ZS5lcXVhbHModGFyZ2V0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkuY29weShkZXN0KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB6ID0gdmVjMy5zdWJ0cmFjdChleWUsIHRhcmdldCkubm9ybWFsaXplKCk7XG4gICAgICAgIGNvbnN0IHggPSB2ZWMzLmNyb3NzKHVwLCB6KS5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgeSA9IHZlYzMuY3Jvc3MoeiwgeCkubm9ybWFsaXplKCk7XG4gICAgICAgIGRlc3Quc2V0KFt4LngsIHgueSwgeC56LCB5LngsIHkueSwgeS56LCB6LngsIHoueSwgei56XSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEVwc2lsb24gfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBtYXQzIH0gZnJvbSAnLi9tYXQzJztcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuL3ZlYzMnO1xuaW1wb3J0IHsgdmVjNCB9IGZyb20gJy4vdmVjNCc7XG5leHBvcnQgY2xhc3MgbWF0NCBleHRlbmRzIEZsb2F0MzJBcnJheSB7XG4gICAgY29uc3RydWN0b3IodmFsdWVzID0gWzEuMCwgMC4wLCAwLjAsIDAuMCwgMC4wLCAxLjAsIDAuMCwgMC4wLCAwLjAsIDAuMCwgMS4wLCAwLjAsIDAuMCwgMC4wLCAwLjAsIDEuMF0pIHtcbiAgICAgICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDE2KSk7XG4gICAgfVxuICAgIHN0YXRpYyBpZGVudGl0eSA9IG5ldyBtYXQ0KCk7XG4gICAgZ2V0IGRldGVybWluYW50KCkge1xuICAgICAgICBjb25zdCB2MDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCB2MDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCB2MDIgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCB2MDMgPSB0aGlzWzNdO1xuICAgICAgICBjb25zdCB2MTAgPSB0aGlzWzRdO1xuICAgICAgICBjb25zdCB2MTEgPSB0aGlzWzVdO1xuICAgICAgICBjb25zdCB2MTIgPSB0aGlzWzZdO1xuICAgICAgICBjb25zdCB2MTMgPSB0aGlzWzddO1xuICAgICAgICBjb25zdCB2MjAgPSB0aGlzWzhdO1xuICAgICAgICBjb25zdCB2MjEgPSB0aGlzWzldO1xuICAgICAgICBjb25zdCB2MjIgPSB0aGlzWzEwXTtcbiAgICAgICAgY29uc3QgdjIzID0gdGhpc1sxMV07XG4gICAgICAgIGNvbnN0IHYzMCA9IHRoaXNbMTJdO1xuICAgICAgICBjb25zdCB2MzEgPSB0aGlzWzEzXTtcbiAgICAgICAgY29uc3QgdjMyID0gdGhpc1sxNF07XG4gICAgICAgIGNvbnN0IHYzMyA9IHRoaXNbMTVdO1xuICAgICAgICBjb25zdCBkZXQwMCA9IHYwMCAqIHYxMSAtIHYwMSAqIHYxMDtcbiAgICAgICAgY29uc3QgZGV0MDEgPSB2MDAgKiB2MTIgLSB2MDIgKiB2MTA7XG4gICAgICAgIGNvbnN0IGRldDAyID0gdjAwICogdjEzIC0gdjAzICogdjEwO1xuICAgICAgICBjb25zdCBkZXQwMyA9IHYwMSAqIHYxMiAtIHYwMiAqIHYxMTtcbiAgICAgICAgY29uc3QgZGV0MDQgPSB2MDEgKiB2MTMgLSB2MDMgKiB2MTE7XG4gICAgICAgIGNvbnN0IGRldDA1ID0gdjAyICogdjEzIC0gdjAzICogdjEyO1xuICAgICAgICBjb25zdCBkZXQwNiA9IHYyMCAqIHYzMSAtIHYyMSAqIHYzMDtcbiAgICAgICAgY29uc3QgZGV0MDcgPSB2MjAgKiB2MzIgLSB2MjIgKiB2MzA7XG4gICAgICAgIGNvbnN0IGRldDA4ID0gdjIwICogdjMzIC0gdjIzICogdjMwO1xuICAgICAgICBjb25zdCBkZXQwOSA9IHYyMSAqIHYzMiAtIHYyMiAqIHYzMTtcbiAgICAgICAgY29uc3QgZGV0MTAgPSB2MjEgKiB2MzMgLSB2MjMgKiB2MzE7XG4gICAgICAgIGNvbnN0IGRldDExID0gdjIyICogdjMzIC0gdjIzICogdjMyO1xuICAgICAgICByZXR1cm4gZGV0MDAgKiBkZXQxMSAtIGRldDAxICogZGV0MTAgKyBkZXQwMiAqIGRldDA5ICsgZGV0MDMgKiBkZXQwOCAtIGRldDA0ICogZGV0MDcgKyBkZXQwNSAqIGRldDA2O1xuICAgIH1cbiAgICBjb3B5KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgaSsrKSB7XG4gICAgICAgICAgICBkZXN0W2ldID0gdGhpc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgY29sdW1uKGluZGV4LCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXNbaW5kZXhdO1xuICAgICAgICBkZXN0LnkgPSB0aGlzW2luZGV4ICsgNF07XG4gICAgICAgIGRlc3QueiA9IHRoaXNbaW5kZXggKyA4XTtcbiAgICAgICAgZGVzdC53ID0gdGhpc1tpbmRleCArIDEyXTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIGVxdWFscyhvdGhlciwgdGhyZXNob2xkID0gRXBzaWxvbikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzW2ldIC0gb3RoZXJbaV0pID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpc1swXSA9IDEuMDtcbiAgICAgICAgdGhpc1sxXSA9IDAuMDtcbiAgICAgICAgdGhpc1syXSA9IDAuMDtcbiAgICAgICAgdGhpc1szXSA9IDAuMDtcbiAgICAgICAgdGhpc1s0XSA9IDAuMDtcbiAgICAgICAgdGhpc1s1XSA9IDEuMDtcbiAgICAgICAgdGhpc1s2XSA9IDAuMDtcbiAgICAgICAgdGhpc1s3XSA9IDAuMDtcbiAgICAgICAgdGhpc1s4XSA9IDAuMDtcbiAgICAgICAgdGhpc1s5XSA9IDAuMDtcbiAgICAgICAgdGhpc1sxMF0gPSAxLjA7XG4gICAgICAgIHRoaXNbMTFdID0gMC4wO1xuICAgICAgICB0aGlzWzEyXSA9IDAuMDtcbiAgICAgICAgdGhpc1sxM10gPSAwLjA7XG4gICAgICAgIHRoaXNbMTRdID0gMC4wO1xuICAgICAgICB0aGlzWzE1XSA9IDEuMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRyYW5zcG9zZShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHQwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IHQwMiA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IHQwMyA9IHRoaXNbM107XG4gICAgICAgIGNvbnN0IHQxMiA9IHRoaXNbNl07XG4gICAgICAgIGNvbnN0IHQxMyA9IHRoaXNbN107XG4gICAgICAgIGNvbnN0IHQyMyA9IHRoaXNbMTFdO1xuICAgICAgICBkZXN0WzFdID0gdGhpc1s0XTtcbiAgICAgICAgZGVzdFsyXSA9IHRoaXNbOF07XG4gICAgICAgIGRlc3RbM10gPSB0aGlzWzEyXTtcbiAgICAgICAgZGVzdFs0XSA9IHQwMTtcbiAgICAgICAgZGVzdFs2XSA9IHRoaXNbOV07XG4gICAgICAgIGRlc3RbN10gPSB0aGlzWzEzXTtcbiAgICAgICAgZGVzdFs4XSA9IHQwMjtcbiAgICAgICAgZGVzdFs5XSA9IHQxMjtcbiAgICAgICAgZGVzdFsxMV0gPSB0aGlzWzE0XTtcbiAgICAgICAgZGVzdFsxMl0gPSB0MDM7XG4gICAgICAgIGRlc3RbMTNdID0gdDEzO1xuICAgICAgICBkZXN0WzE0XSA9IHQyMztcbiAgICAgICAgaWYgKGRlc3QgIT09IHRoaXMpIHtcbiAgICAgICAgICAgIGRlc3RbMF0gPSB0aGlzWzBdO1xuICAgICAgICAgICAgZGVzdFs1XSA9IHRoaXNbNV07XG4gICAgICAgICAgICBkZXN0WzEwXSA9IHRoaXNbMTBdO1xuICAgICAgICAgICAgZGVzdFsxNV0gPSB0aGlzWzE1XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgaW52ZXJ0KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdjAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgdjAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgdjAyID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgdjAzID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgdjEwID0gdGhpc1s0XTtcbiAgICAgICAgY29uc3QgdjExID0gdGhpc1s1XTtcbiAgICAgICAgY29uc3QgdjEyID0gdGhpc1s2XTtcbiAgICAgICAgY29uc3QgdjEzID0gdGhpc1s3XTtcbiAgICAgICAgY29uc3QgdjIwID0gdGhpc1s4XTtcbiAgICAgICAgY29uc3QgdjIxID0gdGhpc1s5XTtcbiAgICAgICAgY29uc3QgdjIyID0gdGhpc1sxMF07XG4gICAgICAgIGNvbnN0IHYyMyA9IHRoaXNbMTFdO1xuICAgICAgICBjb25zdCB2MzAgPSB0aGlzWzEyXTtcbiAgICAgICAgY29uc3QgdjMxID0gdGhpc1sxM107XG4gICAgICAgIGNvbnN0IHYzMiA9IHRoaXNbMTRdO1xuICAgICAgICBjb25zdCB2MzMgPSB0aGlzWzE1XTtcbiAgICAgICAgY29uc3QgZDAwID0gdjAwICogdjExIC0gdjAxICogdjEwO1xuICAgICAgICBjb25zdCBkMDEgPSB2MDAgKiB2MTIgLSB2MDIgKiB2MTA7XG4gICAgICAgIGNvbnN0IGQwMiA9IHYwMCAqIHYxMyAtIHYwMyAqIHYxMDtcbiAgICAgICAgY29uc3QgZDAzID0gdjAxICogdjEyIC0gdjAyICogdjExO1xuICAgICAgICBjb25zdCBkMDQgPSB2MDEgKiB2MTMgLSB2MDMgKiB2MTE7XG4gICAgICAgIGNvbnN0IGQwNSA9IHYwMiAqIHYxMyAtIHYwMyAqIHYxMjtcbiAgICAgICAgY29uc3QgZDA2ID0gdjIwICogdjMxIC0gdjIxICogdjMwO1xuICAgICAgICBjb25zdCBkMDcgPSB2MjAgKiB2MzIgLSB2MjIgKiB2MzA7XG4gICAgICAgIGNvbnN0IGQwOCA9IHYyMCAqIHYzMyAtIHYyMyAqIHYzMDtcbiAgICAgICAgY29uc3QgZDA5ID0gdjIxICogdjMyIC0gdjIyICogdjMxO1xuICAgICAgICBjb25zdCBkMTAgPSB2MjEgKiB2MzMgLSB2MjMgKiB2MzE7XG4gICAgICAgIGNvbnN0IGQxMSA9IHYyMiAqIHYzMyAtIHYyMyAqIHYzMjtcbiAgICAgICAgbGV0IGQgPSBkMDAgKiBkMTEgLSBkMDEgKiBkMTAgKyBkMDIgKiBkMDkgKyBkMDMgKiBkMDggLSBkMDQgKiBkMDcgKyBkMDUgKiBkMDY7XG4gICAgICAgIGlmIChkID09PSAwLjApIHtcbiAgICAgICAgICAgIHJldHVybiBkZXN0O1xuICAgICAgICB9XG4gICAgICAgIGQgPSAxLjAgLyBkO1xuICAgICAgICBkZXN0WzBdID0gKHYxMSAqIGQxMSAtIHYxMiAqIGQxMCArIHYxMyAqIGQwOSkgKiBkO1xuICAgICAgICBkZXN0WzFdID0gKC12MDEgKiBkMTEgKyB2MDIgKiBkMTAgLSB2MDMgKiBkMDkpICogZDtcbiAgICAgICAgZGVzdFsyXSA9ICh2MzEgKiBkMDUgLSB2MzIgKiBkMDQgKyB2MzMgKiBkMDMpICogZDtcbiAgICAgICAgZGVzdFszXSA9ICgtdjIxICogZDA1ICsgdjIyICogZDA0IC0gdjIzICogZDAzKSAqIGQ7XG4gICAgICAgIGRlc3RbNF0gPSAoLXYxMCAqIGQxMSArIHYxMiAqIGQwOCAtIHYxMyAqIGQwNykgKiBkO1xuICAgICAgICBkZXN0WzVdID0gKHYwMCAqIGQxMSAtIHYwMiAqIGQwOCArIHYwMyAqIGQwNykgKiBkO1xuICAgICAgICBkZXN0WzZdID0gKC12MzAgKiBkMDUgKyB2MzIgKiBkMDIgLSB2MzMgKiBkMDEpICogZDtcbiAgICAgICAgZGVzdFs3XSA9ICh2MjAgKiBkMDUgLSB2MjIgKiBkMDIgKyB2MjMgKiBkMDEpICogZDtcbiAgICAgICAgZGVzdFs4XSA9ICh2MTAgKiBkMTAgLSB2MTEgKiBkMDggKyB2MTMgKiBkMDYpICogZDtcbiAgICAgICAgZGVzdFs5XSA9ICgtdjAwICogZDEwICsgdjAxICogZDA4IC0gdjAzICogZDA2KSAqIGQ7XG4gICAgICAgIGRlc3RbMTBdID0gKHYzMCAqIGQwNCAtIHYzMSAqIGQwMiArIHYzMyAqIGQwMCkgKiBkO1xuICAgICAgICBkZXN0WzExXSA9ICgtdjIwICogZDA0ICsgdjIxICogZDAyIC0gdjIzICogZDAwKSAqIGQ7XG4gICAgICAgIGRlc3RbMTJdID0gKC12MTAgKiBkMDkgKyB2MTEgKiBkMDcgLSB2MTIgKiBkMDYpICogZDtcbiAgICAgICAgZGVzdFsxM10gPSAodjAwICogZDA5IC0gdjAxICogZDA3ICsgdjAyICogZDA2KSAqIGQ7XG4gICAgICAgIGRlc3RbMTRdID0gKC12MzAgKiBkMDMgKyB2MzEgKiBkMDEgLSB2MzIgKiBkMDApICogZDtcbiAgICAgICAgZGVzdFsxNV0gPSAodjIwICogZDAzIC0gdjIxICogZDAxICsgdjIyICogZDAwKSAqIGQ7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBtdWx0aXBseShvdGhlciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhMDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCBhMDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCBhMDIgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCBhMDMgPSB0aGlzWzNdO1xuICAgICAgICBjb25zdCBhMTAgPSB0aGlzWzRdO1xuICAgICAgICBjb25zdCBhMTEgPSB0aGlzWzVdO1xuICAgICAgICBjb25zdCBhMTIgPSB0aGlzWzZdO1xuICAgICAgICBjb25zdCBhMTMgPSB0aGlzWzddO1xuICAgICAgICBjb25zdCBhMjAgPSB0aGlzWzhdO1xuICAgICAgICBjb25zdCBhMjEgPSB0aGlzWzldO1xuICAgICAgICBjb25zdCBhMjIgPSB0aGlzWzEwXTtcbiAgICAgICAgY29uc3QgYTIzID0gdGhpc1sxMV07XG4gICAgICAgIGNvbnN0IGEzMCA9IHRoaXNbMTJdO1xuICAgICAgICBjb25zdCBhMzEgPSB0aGlzWzEzXTtcbiAgICAgICAgY29uc3QgYTMyID0gdGhpc1sxNF07XG4gICAgICAgIGNvbnN0IGEzMyA9IHRoaXNbMTVdO1xuICAgICAgICBjb25zdCBiMDAgPSBvdGhlclswXTtcbiAgICAgICAgY29uc3QgYjAxID0gb3RoZXJbMV07XG4gICAgICAgIGNvbnN0IGIwMiA9IG90aGVyWzJdO1xuICAgICAgICBjb25zdCBiMDMgPSBvdGhlclszXTtcbiAgICAgICAgY29uc3QgYjEwID0gb3RoZXJbNF07XG4gICAgICAgIGNvbnN0IGIxMSA9IG90aGVyWzVdO1xuICAgICAgICBjb25zdCBiMTIgPSBvdGhlcls2XTtcbiAgICAgICAgY29uc3QgYjEzID0gb3RoZXJbN107XG4gICAgICAgIGNvbnN0IGIyMCA9IG90aGVyWzhdO1xuICAgICAgICBjb25zdCBiMjEgPSBvdGhlcls5XTtcbiAgICAgICAgY29uc3QgYjIyID0gb3RoZXJbMTBdO1xuICAgICAgICBjb25zdCBiMjMgPSBvdGhlclsxMV07XG4gICAgICAgIGNvbnN0IGIzMCA9IG90aGVyWzEyXTtcbiAgICAgICAgY29uc3QgYjMxID0gb3RoZXJbMTNdO1xuICAgICAgICBjb25zdCBiMzIgPSBvdGhlclsxNF07XG4gICAgICAgIGNvbnN0IGIzMyA9IG90aGVyWzE1XTtcbiAgICAgICAgZGVzdFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMCArIGIwMyAqIGEzMDtcbiAgICAgICAgZGVzdFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMSArIGIwMyAqIGEzMTtcbiAgICAgICAgZGVzdFsyXSA9IGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMiArIGIwMyAqIGEzMjtcbiAgICAgICAgZGVzdFszXSA9IGIwMCAqIGEwMyArIGIwMSAqIGExMyArIGIwMiAqIGEyMyArIGIwMyAqIGEzMztcbiAgICAgICAgZGVzdFs0XSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCArIGIxMyAqIGEzMDtcbiAgICAgICAgZGVzdFs1XSA9IGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMSArIGIxMyAqIGEzMTtcbiAgICAgICAgZGVzdFs2XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMiArIGIxMyAqIGEzMjtcbiAgICAgICAgZGVzdFs3XSA9IGIxMCAqIGEwMyArIGIxMSAqIGExMyArIGIxMiAqIGEyMyArIGIxMyAqIGEzMztcbiAgICAgICAgZGVzdFs4XSA9IGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMCArIGIyMyAqIGEzMDtcbiAgICAgICAgZGVzdFs5XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMSArIGIyMyAqIGEzMTtcbiAgICAgICAgZGVzdFsxMF0gPSBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjIgKyBiMjMgKiBhMzI7XG4gICAgICAgIGRlc3RbMTFdID0gYjIwICogYTAzICsgYjIxICogYTEzICsgYjIyICogYTIzICsgYjIzICogYTMzO1xuICAgICAgICBkZXN0WzEyXSA9IGIzMCAqIGEwMCArIGIzMSAqIGExMCArIGIzMiAqIGEyMCArIGIzMyAqIGEzMDtcbiAgICAgICAgZGVzdFsxM10gPSBiMzAgKiBhMDEgKyBiMzEgKiBhMTEgKyBiMzIgKiBhMjEgKyBiMzMgKiBhMzE7XG4gICAgICAgIGRlc3RbMTRdID0gYjMwICogYTAyICsgYjMxICogYTEyICsgYjMyICogYTIyICsgYjMzICogYTMyO1xuICAgICAgICBkZXN0WzE1XSA9IGIzMCAqIGEwMyArIGIzMSAqIGExMyArIGIzMiAqIGEyMyArIGIzMyAqIGEzMztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHRyYW5zZm9ybSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB2ZWN0b3I7XG4gICAgICAgIGRlc3QueCA9IHRoaXNbMF0gKiB4ICsgdGhpc1s0XSAqIHkgKyB0aGlzWzhdICogeiArIHRoaXNbMTJdICogdztcbiAgICAgICAgZGVzdC55ID0gdGhpc1sxXSAqIHggKyB0aGlzWzVdICogeSArIHRoaXNbOV0gKiB6ICsgdGhpc1sxM10gKiB3O1xuICAgICAgICBkZXN0LnogPSB0aGlzWzJdICogeCArIHRoaXNbNl0gKiB5ICsgdGhpc1sxMF0gKiB6ICsgdGhpc1sxNF0gKiB3O1xuICAgICAgICBkZXN0LncgPSB0aGlzWzNdICogeCArIHRoaXNbN10gKiB5ICsgdGhpc1sxMV0gKiB6ICsgdGhpc1sxNV0gKiB3O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdHJhbnNmb3JtVmVjMyh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB4LCB5LCB6IH0gPSB2ZWN0b3I7XG4gICAgICAgIGRlc3QueCA9IHRoaXNbMF0gKiB4ICsgdGhpc1s0XSAqIHkgKyB0aGlzWzhdICogeiArIHRoaXNbMTJdO1xuICAgICAgICBkZXN0LnkgPSB0aGlzWzFdICogeCArIHRoaXNbNV0gKiB5ICsgdGhpc1s5XSAqIHogKyB0aGlzWzEzXTtcbiAgICAgICAgZGVzdC56ID0gdGhpc1syXSAqIHggKyB0aGlzWzZdICogeSArIHRoaXNbMTBdICogeiArIHRoaXNbMTRdO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdG9NYXQzKGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC5zZXQoW3RoaXNbMF0sIHRoaXNbMV0sIHRoaXNbMl0sIHRoaXNbNF0sIHRoaXNbNV0sIHRoaXNbNl0sIHRoaXNbOF0sIHRoaXNbOV0sIHRoaXNbMTBdXSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzY2FsZSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB4LCB5LCB6IH0gPSB2ZWN0b3I7XG4gICAgICAgIGRlc3RbMF0gPSB0aGlzWzBdICogeDtcbiAgICAgICAgZGVzdFsxXSA9IHRoaXNbMV0gKiB4O1xuICAgICAgICBkZXN0WzJdID0gdGhpc1syXSAqIHg7XG4gICAgICAgIGRlc3RbM10gPSB0aGlzWzNdICogeDtcbiAgICAgICAgZGVzdFs0XSA9IHRoaXNbNF0gKiB5O1xuICAgICAgICBkZXN0WzVdID0gdGhpc1s1XSAqIHk7XG4gICAgICAgIGRlc3RbNl0gPSB0aGlzWzZdICogeTtcbiAgICAgICAgZGVzdFs3XSA9IHRoaXNbN10gKiB5O1xuICAgICAgICBkZXN0WzhdID0gdGhpc1s4XSAqIHo7XG4gICAgICAgIGRlc3RbOV0gPSB0aGlzWzldICogejtcbiAgICAgICAgZGVzdFsxMF0gPSB0aGlzWzEwXSAqIHo7XG4gICAgICAgIGRlc3RbMTFdID0gdGhpc1sxMV0gKiB6O1xuICAgICAgICBpZiAoZGVzdCAhPT0gdGhpcykge1xuICAgICAgICAgICAgZGVzdFsxMl0gPSB0aGlzWzEyXTtcbiAgICAgICAgICAgIGRlc3RbMTNdID0gdGhpc1sxM107XG4gICAgICAgICAgICBkZXN0WzE0XSA9IHRoaXNbMTRdO1xuICAgICAgICAgICAgZGVzdFsxNV0gPSB0aGlzWzE1XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgcm90YXRlKGFuZ2xlLCBheGlzLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGxldCB7IHgsIHksIHogfSA9IGF4aXM7XG4gICAgICAgIGxldCBsZW5ndGggPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcbiAgICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggIT09IDEpIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IDEgLyBsZW5ndGg7XG4gICAgICAgICAgICB4ICo9IGxlbmd0aDtcbiAgICAgICAgICAgIHkgKj0gbGVuZ3RoO1xuICAgICAgICAgICAgeiAqPSBsZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcyA9IE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgY29uc3QgYyA9IE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgY29uc3QgdCA9IDEuMCAtIGM7XG4gICAgICAgIGNvbnN0IGEwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IGEwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IGEwMiA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IGEwMyA9IHRoaXNbM107XG4gICAgICAgIGNvbnN0IGExMCA9IHRoaXNbNF07XG4gICAgICAgIGNvbnN0IGExMSA9IHRoaXNbNV07XG4gICAgICAgIGNvbnN0IGExMiA9IHRoaXNbNl07XG4gICAgICAgIGNvbnN0IGExMyA9IHRoaXNbN107XG4gICAgICAgIGNvbnN0IGEyMCA9IHRoaXNbOF07XG4gICAgICAgIGNvbnN0IGEyMSA9IHRoaXNbOV07XG4gICAgICAgIGNvbnN0IGEyMiA9IHRoaXNbMTBdO1xuICAgICAgICBjb25zdCBhMjMgPSB0aGlzWzExXTtcbiAgICAgICAgY29uc3QgYjAwID0geCAqIHggKiB0ICsgYztcbiAgICAgICAgY29uc3QgYjAxID0geSAqIHggKiB0ICsgeiAqIHM7XG4gICAgICAgIGNvbnN0IGIwMiA9IHogKiB4ICogdCAtIHkgKiBzO1xuICAgICAgICBjb25zdCBiMTAgPSB4ICogeSAqIHQgLSB6ICogcztcbiAgICAgICAgY29uc3QgYjExID0geSAqIHkgKiB0ICsgYztcbiAgICAgICAgY29uc3QgYjEyID0geiAqIHkgKiB0ICsgeCAqIHM7XG4gICAgICAgIGNvbnN0IGIyMCA9IHggKiB6ICogdCArIHkgKiBzO1xuICAgICAgICBjb25zdCBiMjEgPSB5ICogeiAqIHQgLSB4ICogcztcbiAgICAgICAgY29uc3QgYjIyID0geiAqIHogKiB0ICsgYztcbiAgICAgICAgZGVzdFswXSA9IGEwMCAqIGIwMCArIGExMCAqIGIwMSArIGEyMCAqIGIwMjtcbiAgICAgICAgZGVzdFsxXSA9IGEwMSAqIGIwMCArIGExMSAqIGIwMSArIGEyMSAqIGIwMjtcbiAgICAgICAgZGVzdFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgICAgICAgZGVzdFszXSA9IGEwMyAqIGIwMCArIGExMyAqIGIwMSArIGEyMyAqIGIwMjtcbiAgICAgICAgZGVzdFs0XSA9IGEwMCAqIGIxMCArIGExMCAqIGIxMSArIGEyMCAqIGIxMjtcbiAgICAgICAgZGVzdFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgICAgICAgZGVzdFs2XSA9IGEwMiAqIGIxMCArIGExMiAqIGIxMSArIGEyMiAqIGIxMjtcbiAgICAgICAgZGVzdFs3XSA9IGEwMyAqIGIxMCArIGExMyAqIGIxMSArIGEyMyAqIGIxMjtcbiAgICAgICAgZGVzdFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgICAgICAgZGVzdFs5XSA9IGEwMSAqIGIyMCArIGExMSAqIGIyMSArIGEyMSAqIGIyMjtcbiAgICAgICAgZGVzdFsxMF0gPSBhMDIgKiBiMjAgKyBhMTIgKiBiMjEgKyBhMjIgKiBiMjI7XG4gICAgICAgIGRlc3RbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuICAgICAgICBpZiAoZGVzdCAhPT0gdGhpcykge1xuICAgICAgICAgICAgZGVzdFsxMl0gPSB0aGlzWzEyXTtcbiAgICAgICAgICAgIGRlc3RbMTNdID0gdGhpc1sxM107XG4gICAgICAgICAgICBkZXN0WzE0XSA9IHRoaXNbMTRdO1xuICAgICAgICAgICAgZGVzdFsxNV0gPSB0aGlzWzE1XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdHJhbnNsYXRlKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB4ID0gdmVjdG9yLng7XG4gICAgICAgIGNvbnN0IHkgPSB2ZWN0b3IueTtcbiAgICAgICAgY29uc3QgeiA9IHZlY3Rvci56O1xuICAgICAgICBpZiAoZGVzdCAhPT0gdGhpcykge1xuICAgICAgICAgICAgZm9yIChsZXQgaXQgPSAwOyBpdCA8IDEyOyBpdCsrKSB7XG4gICAgICAgICAgICAgICAgZGVzdFtpdF0gPSB0aGlzW2l0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkZXN0WzEyXSA9IHRoaXNbMTJdICsgdGhpc1swXSAqIHggKyB0aGlzWzRdICogeSArIHRoaXNbOF0gKiB6O1xuICAgICAgICBkZXN0WzEzXSA9IHRoaXNbMTNdICsgdGhpc1sxXSAqIHggKyB0aGlzWzVdICogeSArIHRoaXNbOV0gKiB6O1xuICAgICAgICBkZXN0WzE0XSA9IHRoaXNbMTRdICsgdGhpc1syXSAqIHggKyB0aGlzWzZdICogeSArIHRoaXNbMTBdICogejtcbiAgICAgICAgZGVzdFsxNV0gPSB0aGlzWzE1XSArIHRoaXNbM10gKiB4ICsgdGhpc1s3XSAqIHkgKyB0aGlzWzExXSAqIHo7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBkZWNvbXBvc2UodHJhbnNsYXRpb24sIHJvdGF0aW9uLCBzY2FsaW5nID0gbnVsbCkge1xuICAgICAgICBjb25zdCB2MDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCB2MDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCB2MDIgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCB2MTAgPSB0aGlzWzRdO1xuICAgICAgICBjb25zdCB2MTEgPSB0aGlzWzVdO1xuICAgICAgICBjb25zdCB2MTIgPSB0aGlzWzZdO1xuICAgICAgICBjb25zdCB2MjAgPSB0aGlzWzhdO1xuICAgICAgICBjb25zdCB2MjEgPSB0aGlzWzldO1xuICAgICAgICBjb25zdCB2MjIgPSB0aGlzWzEwXTtcbiAgICAgICAgY29uc3QgdjMwID0gdGhpc1sxMl07XG4gICAgICAgIGNvbnN0IHYzMSA9IHRoaXNbMTNdO1xuICAgICAgICBjb25zdCB2MzIgPSB0aGlzWzE0XTtcbiAgICAgICAgaWYgKHNjYWxpbmcgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHNjYWxpbmcueCA9IE1hdGguc3FydCh2MDAgKiB2MDAgKyB2MDEgKiB2MDEgKyB2MDIgKiB2MDIpO1xuICAgICAgICAgICAgc2NhbGluZy55ID0gTWF0aC5zcXJ0KHYxMCAqIHYxMCArIHYxMSAqIHYxMSArIHYxMiAqIHYxMik7XG4gICAgICAgICAgICBzY2FsaW5nLnogPSBNYXRoLnNxcnQodjIwICogdjIwICsgdjIxICogdjIxICsgdjIyICogdjIyKTtcbiAgICAgICAgfVxuICAgICAgICByb3RhdGlvbi5zZXQoW3YwMCwgdjAxLCB2MDIsIHYxMCwgdjExLCB2MTIsIHYyMCwgdjIxLCB2MjJdKTtcbiAgICAgICAgdHJhbnNsYXRpb24ueHl6ID0gW3YzMCwgdjMxLCB2MzJdO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZGVzZXJpYWxpemUodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBuZXcgbWF0NCh2YWx1ZXMpO1xuICAgIH1cbiAgICBzdGF0aWMgY29uc3RydWN0KHRyYW5zbGF0aW9uLCByb3RhdGlvbiwgc2NhbGUgPSB2ZWMzLm9uZSwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBxeCA9IHJvdGF0aW9uLng7XG4gICAgICAgIGNvbnN0IHF5ID0gcm90YXRpb24ueTtcbiAgICAgICAgY29uc3QgcXogPSByb3RhdGlvbi56O1xuICAgICAgICBjb25zdCBxdyA9IHJvdGF0aW9uLnc7XG4gICAgICAgIGNvbnN0IHZ4ID0gdHJhbnNsYXRpb24ueDtcbiAgICAgICAgY29uc3QgdnkgPSB0cmFuc2xhdGlvbi55O1xuICAgICAgICBjb25zdCB2eiA9IHRyYW5zbGF0aW9uLno7XG4gICAgICAgIGNvbnN0IHN4ID0gc2NhbGUueDtcbiAgICAgICAgY29uc3Qgc3kgPSBzY2FsZS55O1xuICAgICAgICBjb25zdCBzeiA9IHNjYWxlLno7XG4gICAgICAgIGNvbnN0IHgyID0gcXggKyBxeDtcbiAgICAgICAgY29uc3QgeTIgPSBxeSArIHF5O1xuICAgICAgICBjb25zdCB6MiA9IHF6ICsgcXo7XG4gICAgICAgIGNvbnN0IHh4ID0gcXggKiB4MjtcbiAgICAgICAgY29uc3QgeHkgPSBxeCAqIHkyO1xuICAgICAgICBjb25zdCB4eiA9IHF4ICogejI7XG4gICAgICAgIGNvbnN0IHl5ID0gcXkgKiB5MjtcbiAgICAgICAgY29uc3QgeXogPSBxeSAqIHoyO1xuICAgICAgICBjb25zdCB6eiA9IHF6ICogejI7XG4gICAgICAgIGNvbnN0IHd4ID0gcXcgKiB4MjtcbiAgICAgICAgY29uc3Qgd3kgPSBxdyAqIHkyO1xuICAgICAgICBjb25zdCB3eiA9IHF3ICogejI7XG4gICAgICAgIGRlc3Quc2V0KFtcbiAgICAgICAgICAgICgxLjAgLSAoeXkgKyB6eikpICogc3gsXG4gICAgICAgICAgICAoeHkgKyB3eikgKiBzeCxcbiAgICAgICAgICAgICh4eiAtIHd5KSAqIHN4LFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgKHh5IC0gd3opICogc3ksXG4gICAgICAgICAgICAoMS4wIC0gKHh4ICsgenopKSAqIHN5LFxuICAgICAgICAgICAgKHl6ICsgd3gpICogc3ksXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAoeHogKyB3eSkgKiBzeixcbiAgICAgICAgICAgICh5eiAtIHd4KSAqIHN6LFxuICAgICAgICAgICAgKDEuMCAtICh4eCArIHl5KSkgKiBzeixcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIHZ4LFxuICAgICAgICAgICAgdnksXG4gICAgICAgICAgICB2eixcbiAgICAgICAgICAgIDEuMFxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtdWx0aXBseShtMSwgbTIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYTAwID0gbTFbMF07XG4gICAgICAgIGNvbnN0IGEwMSA9IG0xWzFdO1xuICAgICAgICBjb25zdCBhMDIgPSBtMVsyXTtcbiAgICAgICAgY29uc3QgYTAzID0gbTFbM107XG4gICAgICAgIGNvbnN0IGExMCA9IG0xWzRdO1xuICAgICAgICBjb25zdCBhMTEgPSBtMVs1XTtcbiAgICAgICAgY29uc3QgYTEyID0gbTFbNl07XG4gICAgICAgIGNvbnN0IGExMyA9IG0xWzddO1xuICAgICAgICBjb25zdCBhMjAgPSBtMVs4XTtcbiAgICAgICAgY29uc3QgYTIxID0gbTFbOV07XG4gICAgICAgIGNvbnN0IGEyMiA9IG0xWzEwXTtcbiAgICAgICAgY29uc3QgYTIzID0gbTFbMTFdO1xuICAgICAgICBjb25zdCBhMzAgPSBtMVsxMl07XG4gICAgICAgIGNvbnN0IGEzMSA9IG0xWzEzXTtcbiAgICAgICAgY29uc3QgYTMyID0gbTFbMTRdO1xuICAgICAgICBjb25zdCBhMzMgPSBtMVsxNV07XG4gICAgICAgIGNvbnN0IGIwMCA9IG0yWzBdO1xuICAgICAgICBjb25zdCBiMDEgPSBtMlsxXTtcbiAgICAgICAgY29uc3QgYjAyID0gbTJbMl07XG4gICAgICAgIGNvbnN0IGIwMyA9IG0yWzNdO1xuICAgICAgICBjb25zdCBiMTAgPSBtMls0XTtcbiAgICAgICAgY29uc3QgYjExID0gbTJbNV07XG4gICAgICAgIGNvbnN0IGIxMiA9IG0yWzZdO1xuICAgICAgICBjb25zdCBiMTMgPSBtMls3XTtcbiAgICAgICAgY29uc3QgYjIwID0gbTJbOF07XG4gICAgICAgIGNvbnN0IGIyMSA9IG0yWzldO1xuICAgICAgICBjb25zdCBiMjIgPSBtMlsxMF07XG4gICAgICAgIGNvbnN0IGIyMyA9IG0yWzExXTtcbiAgICAgICAgY29uc3QgYjMwID0gbTJbMTJdO1xuICAgICAgICBjb25zdCBiMzEgPSBtMlsxM107XG4gICAgICAgIGNvbnN0IGIzMiA9IG0yWzE0XTtcbiAgICAgICAgY29uc3QgYjMzID0gbTJbMTVdO1xuICAgICAgICBkZXN0LnNldChbXG4gICAgICAgICAgICBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjAgKyBiMDMgKiBhMzAsXG4gICAgICAgICAgICBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjEgKyBiMDMgKiBhMzEsXG4gICAgICAgICAgICBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjIgKyBiMDMgKiBhMzIsXG4gICAgICAgICAgICBiMDAgKiBhMDMgKyBiMDEgKiBhMTMgKyBiMDIgKiBhMjMgKyBiMDMgKiBhMzMsXG4gICAgICAgICAgICBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjAgKyBiMTMgKiBhMzAsXG4gICAgICAgICAgICBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjEgKyBiMTMgKiBhMzEsXG4gICAgICAgICAgICBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjIgKyBiMTMgKiBhMzIsXG4gICAgICAgICAgICBiMTAgKiBhMDMgKyBiMTEgKiBhMTMgKyBiMTIgKiBhMjMgKyBiMTMgKiBhMzMsXG4gICAgICAgICAgICBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjAgKyBiMjMgKiBhMzAsXG4gICAgICAgICAgICBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjEgKyBiMjMgKiBhMzEsXG4gICAgICAgICAgICBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjIgKyBiMjMgKiBhMzIsXG4gICAgICAgICAgICBiMjAgKiBhMDMgKyBiMjEgKiBhMTMgKyBiMjIgKiBhMjMgKyBiMjMgKiBhMzMsXG4gICAgICAgICAgICBiMzAgKiBhMDAgKyBiMzEgKiBhMTAgKyBiMzIgKiBhMjAgKyBiMzMgKiBhMzAsXG4gICAgICAgICAgICBiMzAgKiBhMDEgKyBiMzEgKiBhMTEgKyBiMzIgKiBhMjEgKyBiMzMgKiBhMzEsXG4gICAgICAgICAgICBiMzAgKiBhMDIgKyBiMzEgKiBhMTIgKyBiMzIgKiBhMjIgKyBiMzMgKiBhMzIsXG4gICAgICAgICAgICBiMzAgKiBhMDMgKyBiMzEgKiBhMTMgKyBiMzIgKiBhMjMgKyBiMzMgKiBhMzNcbiAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZnJ1c3R1bShsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBybCA9IHJpZ2h0IC0gbGVmdDtcbiAgICAgICAgY29uc3QgdGIgPSB0b3AgLSBib3R0b207XG4gICAgICAgIGNvbnN0IGZuID0gZmFyIC0gbmVhcjtcbiAgICAgICAgZGVzdC5zZXQoW1xuICAgICAgICAgICAgKG5lYXIgKiAyLjApIC8gcmwsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAobmVhciAqIDIuMCkgLyB0YixcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIChyaWdodCArIGxlZnQpIC8gcmwsXG4gICAgICAgICAgICAodG9wICsgYm90dG9tKSAvIHRiLFxuICAgICAgICAgICAgLShmYXIgKyBuZWFyKSAvIGZuLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIC0oZmFyICogbmVhciAqIDIuMCkgLyBmbixcbiAgICAgICAgICAgIDAuMFxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBwZXJzcGVjdGl2ZShmb3YsIGFzcGVjdCwgbmVhciwgZmFyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgbWF0NCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvcCA9IG5lYXIgKiBNYXRoLnRhbigoZm92ICogTWF0aC5QSSkgLyAzNjAuMCk7XG4gICAgICAgIGNvbnN0IHJpZ2h0ID0gdG9wICogYXNwZWN0O1xuICAgICAgICByZXR1cm4gbWF0NC5mcnVzdHVtKC1yaWdodCwgcmlnaHQsIC10b3AsIHRvcCwgbmVhciwgZmFyLCBkZXN0KTtcbiAgICB9XG4gICAgc3RhdGljIG9ydGhvZ3JhcGhpYyhsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBybCA9IHJpZ2h0IC0gbGVmdDtcbiAgICAgICAgY29uc3QgdGIgPSB0b3AgLSBib3R0b207XG4gICAgICAgIGNvbnN0IGZuID0gZmFyIC0gbmVhcjtcbiAgICAgICAgZGVzdC5zZXQoW1xuICAgICAgICAgICAgMi4wIC8gcmwsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAyIC8gdGIsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAtMi4wIC8gZm4sXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAtKGxlZnQgKyByaWdodCkgLyBybCxcbiAgICAgICAgICAgIC0odG9wICsgYm90dG9tKSAvIHRiLFxuICAgICAgICAgICAgLShmYXIgKyBuZWFyKSAvIGZuLFxuICAgICAgICAgICAgMS4wXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIHJlZmxlY3Rpb24ocGxhbmUsIGRlc3QpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB4eCA9IHBsYW5lLnggKiBwbGFuZS54O1xuICAgICAgICBjb25zdCB4eSA9IHBsYW5lLnggKiBwbGFuZS55O1xuICAgICAgICBjb25zdCB4eiA9IHBsYW5lLnggKiBwbGFuZS56O1xuICAgICAgICBjb25zdCB4dyA9IHBsYW5lLnggKiBwbGFuZS53O1xuICAgICAgICBjb25zdCB5eSA9IHBsYW5lLnkgKiBwbGFuZS55O1xuICAgICAgICBjb25zdCB5eiA9IHBsYW5lLnkgKiBwbGFuZS56O1xuICAgICAgICBjb25zdCB5dyA9IHBsYW5lLnkgKiBwbGFuZS53O1xuICAgICAgICBjb25zdCB6eiA9IHBsYW5lLnogKiBwbGFuZS56O1xuICAgICAgICBjb25zdCB6dyA9IHBsYW5lLnogKiBwbGFuZS53O1xuICAgICAgICBkZXN0LnNldChbXG4gICAgICAgICAgICAxLjAgLSAyLjAgKiB4eCxcbiAgICAgICAgICAgIC0yLjAgKiB4eSxcbiAgICAgICAgICAgIC0yLjAgKiB4eixcbiAgICAgICAgICAgIC0yLjAgKiB4dyxcbiAgICAgICAgICAgIC0yLjAgKiB4eSxcbiAgICAgICAgICAgIDEuMCAtIDIuMCAqIHl5LFxuICAgICAgICAgICAgLTIuMCAqIHl6LFxuICAgICAgICAgICAgLTIuMCAqIHl3LFxuICAgICAgICAgICAgLTIuMCAqIHh6LFxuICAgICAgICAgICAgLTIuMCAqIHl6LFxuICAgICAgICAgICAgMS4wIC0gMi4wICogenosXG4gICAgICAgICAgICAtMi4wICogencsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbG9va0F0KGV5ZSwgdGFyZ2V0LCB1cCA9IHZlYzMudXAsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV5ZS5lcXVhbHModGFyZ2V0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWRlbnRpdHkuY29weShkZXN0KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB6ID0gdmVjMy5zdWJ0cmFjdChleWUsIHRhcmdldCkubm9ybWFsaXplKCk7XG4gICAgICAgIGNvbnN0IHggPSB2ZWMzLmNyb3NzKHVwLCB6KS5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgeSA9IHZlYzMuY3Jvc3MoeiwgeCkubm9ybWFsaXplKCk7XG4gICAgICAgIGRlc3Quc2V0KFt4LngsIHgueSwgeC56LCAwLjAsIHkueCwgeS55LCB5LnosIDAuMCwgei54LCB6LnksIHoueiwgMC4wLCBleWUueCwgZXllLnksIGV5ZS56LCAxLjBdKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRXBzaWxvbiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IG1hdDMgfSBmcm9tICcuL21hdDMnO1xuaW1wb3J0IHsgbWF0NCB9IGZyb20gJy4vbWF0NCc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnLi92ZWMzJztcbmZ1bmN0aW9uIHRvRGVncmVlcyhyYWRpYW5zKSB7XG4gICAgcmV0dXJuIHJhZGlhbnMgKiAoMTgwIC8gTWF0aC5QSSk7XG59XG5mdW5jdGlvbiB0b1JhZGlhbnMoZGVncmVlcykge1xuICAgIHJldHVybiBkZWdyZWVzICogKE1hdGguUEkgLyAxODApO1xufVxuZXhwb3J0IGNsYXNzIHF1YXQgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyA9IFswLjAsIDAuMCwgMC4wLCAxLjBdKSB7XG4gICAgICAgIHN1cGVyKHZhbHVlcy5zbGljZSgwLCA0KSk7XG4gICAgfVxuICAgIHN0YXRpYyBpZGVudGl0eSA9IG5ldyBxdWF0KCk7XG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cbiAgICBzZXQgeCh4KSB7XG4gICAgICAgIHRoaXNbMF0gPSB4O1xuICAgIH1cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuICAgIHNldCB5KHkpIHtcbiAgICAgICAgdGhpc1sxXSA9IHk7XG4gICAgfVxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG4gICAgc2V0IHooeikge1xuICAgICAgICB0aGlzWzJdID0gejtcbiAgICB9XG4gICAgZ2V0IHcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzNdO1xuICAgIH1cbiAgICBzZXQgdyh3KSB7XG4gICAgICAgIHRoaXNbM10gPSB3O1xuICAgIH1cbiAgICBnZXQgeWF3KCkge1xuICAgICAgICByZXR1cm4gTWF0aC5hc2luKDIuMCAqICh0aGlzLnggKiB0aGlzLnogLSB0aGlzLncgKiB0aGlzLnkpKTtcbiAgICB9XG4gICAgc2V0IHlhdyh5YXcpIHtcbiAgICAgICAgcXVhdC5mcm9tRXVsZXJBbmdsZXMoeWF3LCB0aGlzLnBpdGNoLCB0aGlzLnJvbGwsIHRoaXMpO1xuICAgIH1cbiAgICBnZXQgcGl0Y2goKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiwgdyB9ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIoMi4wICogKHkgKiB6ICsgdyAqIHgpLCB3ICogdyAtIHggKiB4IC0geSAqIHkgKyB6ICogeik7XG4gICAgfVxuICAgIHNldCBwaXRjaChwaXRjaCkge1xuICAgICAgICBxdWF0LmZyb21FdWxlckFuZ2xlcyh0aGlzLnlhdywgcGl0Y2gsIHRoaXMucm9sbCwgdGhpcyk7XG4gICAgfVxuICAgIGdldCByb2xsKCkge1xuICAgICAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBNYXRoLmF0YW4yKDIuMCAqICh4ICogeSArIHcgKiB6KSwgdyAqIHcgKyB4ICogeCAtIHkgKiB5IC0geiAqIHopO1xuICAgIH1cbiAgICBzZXQgcm9sbChyb2xsKSB7XG4gICAgICAgIHF1YXQuZnJvbUV1bGVyQW5nbGVzKHRoaXMueWF3LCB0aGlzLnBpdGNoLCByb2xsLCB0aGlzKTtcbiAgICB9XG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnNxdWFyZWRMZW5ndGgpO1xuICAgIH1cbiAgICBnZXQgc3F1YXJlZExlbmd0aCgpIHtcbiAgICAgICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHc7XG4gICAgfVxuICAgIGNvcHkoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHF1YXQoKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgZGVzdFtpXSA9IHRoaXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnggPSAwLjA7XG4gICAgICAgIHRoaXMueSA9IDAuMDtcbiAgICAgICAgdGhpcy56ID0gMC4wO1xuICAgICAgICB0aGlzLncgPSAxLjA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBjYWxjdWxhdGVXKCkge1xuICAgICAgICBjb25zdCB7IHgsIHksIHogfSA9IHRoaXM7XG4gICAgICAgIHRoaXMudyA9IC1NYXRoLnNxcnQoTWF0aC5hYnMoMS4wIC0geCAqIHggLSB5ICogeSAtIHogKiB6KSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpbnZlcnQoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkb3QgPSBxdWF0LmRvdCh0aGlzLCB0aGlzKTtcbiAgICAgICAgaWYgKCFkb3QpIHtcbiAgICAgICAgICAgIGRlc3Quc2V0KFswLjAsIDAuMCwgMC4wLCAwLjBdKTtcbiAgICAgICAgICAgIHJldHVybiBkZXN0O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGludkRvdCA9IGRvdCA/IDEuMCAvIGRvdCA6IDAuMDtcbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICogLWludkRvdDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICogLWludkRvdDtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56ICogLWludkRvdDtcbiAgICAgICAgZGVzdC53ID0gdGhpcy53ICogaW52RG90O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgY29uanVnYXRlKGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICogLTE7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAqIC0xO1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogKiAtMTtcbiAgICAgICAgZGVzdC53ID0gdGhpcy53O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgbm9ybWFsaXplKGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzO1xuICAgICAgICBsZXQgbGVuZ3RoID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3KTtcbiAgICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgICAgIGRlc3QueCA9IDA7XG4gICAgICAgICAgICBkZXN0LnkgPSAwO1xuICAgICAgICAgICAgZGVzdC56ID0gMDtcbiAgICAgICAgICAgIGRlc3QudyA9IDA7XG4gICAgICAgICAgICByZXR1cm4gZGVzdDtcbiAgICAgICAgfVxuICAgICAgICBsZW5ndGggPSAxIC8gbGVuZ3RoO1xuICAgICAgICBkZXN0LnggPSB4ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnkgPSB5ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnogPSB6ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LncgPSB3ICogbGVuZ3RoO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgZXF1YWxzKHEsIHRocmVzaG9sZCA9IEVwc2lsb24pIHtcbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMueCAtIHEueCkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy55IC0gcS55KSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnogLSBxLnopID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMudyAtIHEudykgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYWRkKG90aGVyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCArIG90aGVyLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSArIG90aGVyLnk7XG4gICAgICAgIGRlc3QueiA9IHRoaXMueiArIG90aGVyLno7XG4gICAgICAgIGRlc3QudyA9IHRoaXMudyArIG90aGVyLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBtdWx0aXBseShvdGhlciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBxMXggPSB0aGlzLng7XG4gICAgICAgIGNvbnN0IHExeSA9IHRoaXMueTtcbiAgICAgICAgY29uc3QgcTF6ID0gdGhpcy56O1xuICAgICAgICBjb25zdCBxMXcgPSB0aGlzLnc7XG4gICAgICAgIGNvbnN0IHEyeCA9IG90aGVyLng7XG4gICAgICAgIGNvbnN0IHEyeSA9IG90aGVyLnk7XG4gICAgICAgIGNvbnN0IHEyeiA9IG90aGVyLno7XG4gICAgICAgIGNvbnN0IHEydyA9IG90aGVyLnc7XG4gICAgICAgIGRlc3QueCA9IHExeCAqIHEydyArIHExdyAqIHEyeCArIHExeSAqIHEyeiAtIHExeiAqIHEyeTtcbiAgICAgICAgZGVzdC55ID0gcTF5ICogcTJ3ICsgcTF3ICogcTJ5ICsgcTF6ICogcTJ4IC0gcTF4ICogcTJ6O1xuICAgICAgICBkZXN0LnogPSBxMXogKiBxMncgKyBxMXcgKiBxMnogKyBxMXggKiBxMnkgLSBxMXkgKiBxMng7XG4gICAgICAgIGRlc3QudyA9IHExdyAqIHEydyAtIHExeCAqIHEyeCAtIHExeSAqIHEyeSAtIHExeiAqIHEyejtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHRyYW5zZm9ybVZlYzModmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdmVjdG9yO1xuICAgICAgICBjb25zdCBxMSA9IG5ldyBxdWF0KFt4LCB5LCB6LCAwXSk7XG4gICAgICAgIGNvbnN0IHEyID0gdGhpcy5jb3B5KCkuaW52ZXJ0KCk7XG4gICAgICAgIGNvbnN0IHEzID0gdGhpcy5jb3B5KCkubXVsdGlwbHkocTEpO1xuICAgICAgICBjb25zdCBxNCA9IHEzLmNvcHkoKS5tdWx0aXBseShxMik7XG4gICAgICAgIGRlc3QueHl6ID0gW3E0LngsIHE0LnksIHE0LnpdO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdG9NYXQzKGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB4MiA9IHggKyB4O1xuICAgICAgICBjb25zdCB5MiA9IHkgKyB5O1xuICAgICAgICBjb25zdCB6MiA9IHogKyB6O1xuICAgICAgICBjb25zdCB4eCA9IHggKiB4MjtcbiAgICAgICAgY29uc3QgeHkgPSB4ICogeTI7XG4gICAgICAgIGNvbnN0IHh6ID0geCAqIHoyO1xuICAgICAgICBjb25zdCB5eSA9IHkgKiB5MjtcbiAgICAgICAgY29uc3QgeXogPSB5ICogejI7XG4gICAgICAgIGNvbnN0IHp6ID0geiAqIHoyO1xuICAgICAgICBjb25zdCB3eCA9IHcgKiB4MjtcbiAgICAgICAgY29uc3Qgd3kgPSB3ICogeTI7XG4gICAgICAgIGNvbnN0IHd6ID0gdyAqIHoyO1xuICAgICAgICBkZXN0LnNldChbMS4wIC0gKHl5ICsgenopLCB4eSArIHd6LCB4eiAtIHd5LCB4eSAtIHd6LCAxLjAgLSAoeHggKyB6eiksIHl6ICsgd3gsIHh6ICsgd3ksIHl6IC0gd3gsIDEuMCAtICh4eCArIHl5KV0pO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdG9NYXQ0KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB4MiA9IHggKyB4O1xuICAgICAgICBjb25zdCB5MiA9IHkgKyB5O1xuICAgICAgICBjb25zdCB6MiA9IHogKyB6O1xuICAgICAgICBjb25zdCB4eCA9IHggKiB4MjtcbiAgICAgICAgY29uc3QgeHkgPSB4ICogeTI7XG4gICAgICAgIGNvbnN0IHh6ID0geCAqIHoyO1xuICAgICAgICBjb25zdCB5eSA9IHkgKiB5MjtcbiAgICAgICAgY29uc3QgeXogPSB5ICogejI7XG4gICAgICAgIGNvbnN0IHp6ID0geiAqIHoyO1xuICAgICAgICBjb25zdCB3eCA9IHcgKiB4MjtcbiAgICAgICAgY29uc3Qgd3kgPSB3ICogeTI7XG4gICAgICAgIGNvbnN0IHd6ID0gdyAqIHoyO1xuICAgICAgICBkZXN0LnNldChbXG4gICAgICAgICAgICAxLjAgLSAoeXkgKyB6eiksXG4gICAgICAgICAgICB4eSArIHd6LFxuICAgICAgICAgICAgeHogLSB3eSxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIHh5IC0gd3osXG4gICAgICAgICAgICAxLjAgLSAoeHggKyB6eiksXG4gICAgICAgICAgICB5eiArIHd4LFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgeHogKyB3eSxcbiAgICAgICAgICAgIHl6IC0gd3gsXG4gICAgICAgICAgICAxLjAgLSAoeHggKyB5eSksXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBpbnRlcnBvbGF0ZShxLCB0aW1lLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcXVhdC5pbnRlcnBvbGF0ZSh0aGlzLCBxLCB0aW1lLCBkZXN0KTtcbiAgICB9XG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBbeCwgeSwgeiwgd107XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZSh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBxdWF0KHZhbHVlcyk7XG4gICAgfVxuICAgIHN0YXRpYyBpbnRlcnBvbGF0ZShxMSwgcTIsIHRpbWUsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBxdWF0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRpbWUgPD0gMC4wKSB7XG4gICAgICAgICAgICByZXR1cm4gcTEuY29weShkZXN0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGltZSA+PSAxLjApIHtcbiAgICAgICAgICAgIHJldHVybiBxMi5jb3B5KGRlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb3MgPSBxdWF0LmRvdChxMSwgcTIpO1xuICAgICAgICBjb25zdCBxMmEgPSBxMi5jb3B5KGRlc3QpO1xuICAgICAgICBpZiAoY29zIDwgMC4wKSB7XG4gICAgICAgICAgICBxMmEuaW52ZXJ0KCk7XG4gICAgICAgICAgICBjb3MgPSAtY29zO1xuICAgICAgICB9XG4gICAgICAgIGxldCBrMDtcbiAgICAgICAgbGV0IGsxO1xuICAgICAgICBpZiAoY29zID4gMSAtIEVwc2lsb24pIHtcbiAgICAgICAgICAgIGswID0gMSAtIHRpbWU7XG4gICAgICAgICAgICBrMSA9IDAgKyB0aW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zcXJ0KDEgLSBjb3MgKiBjb3MpO1xuICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKHNpbiwgY29zKTtcbiAgICAgICAgICAgIGNvbnN0IG9uZU92ZXJTaW4gPSAxIC8gc2luO1xuICAgICAgICAgICAgazAgPSBNYXRoLnNpbigoMSAtIHRpbWUpICogYW5nbGUpICogb25lT3ZlclNpbjtcbiAgICAgICAgICAgIGsxID0gTWF0aC5zaW4oKDAgKyB0aW1lKSAqIGFuZ2xlKSAqIG9uZU92ZXJTaW47XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gazAgKiBxMS54ICsgazEgKiBxMmEueDtcbiAgICAgICAgZGVzdC55ID0gazAgKiBxMS55ICsgazEgKiBxMmEueTtcbiAgICAgICAgZGVzdC56ID0gazAgKiBxMS56ICsgazEgKiBxMmEuejtcbiAgICAgICAgZGVzdC53ID0gazAgKiBxMS53ICsgazEgKiBxMmEudztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBkb3QocTEsIHEyKSB7XG4gICAgICAgIHJldHVybiBxMS54ICogcTIueCArIHExLnkgKiBxMi55ICsgcTEueiAqIHEyLnogKyBxMS53ICogcTIudztcbiAgICB9XG4gICAgc3RhdGljIGFkZChxMSwgcTIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBxdWF0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gcTEueCArIHEyLng7XG4gICAgICAgIGRlc3QueSA9IHExLnkgKyBxMi55O1xuICAgICAgICBkZXN0LnogPSBxMS56ICsgcTIuejtcbiAgICAgICAgZGVzdC53ID0gcTEudyArIHEyLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbXVsdGlwbHkocTEsIHEyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgcXVhdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHExeCA9IHExLng7XG4gICAgICAgIGNvbnN0IHExeSA9IHExLnk7XG4gICAgICAgIGNvbnN0IHExeiA9IHExLno7XG4gICAgICAgIGNvbnN0IHExdyA9IHExLnc7XG4gICAgICAgIGNvbnN0IHEyeCA9IHEyLng7XG4gICAgICAgIGNvbnN0IHEyeSA9IHEyLnk7XG4gICAgICAgIGNvbnN0IHEyeiA9IHEyLno7XG4gICAgICAgIGNvbnN0IHEydyA9IHEyLnc7XG4gICAgICAgIGRlc3QueCA9IHExeCAqIHEydyArIHExdyAqIHEyeCArIHExeSAqIHEyeiAtIHExeiAqIHEyeTtcbiAgICAgICAgZGVzdC55ID0gcTF5ICogcTJ3ICsgcTF3ICogcTJ5ICsgcTF6ICogcTJ4IC0gcTF4ICogcTJ6O1xuICAgICAgICBkZXN0LnogPSBxMXogKiBxMncgKyBxMXcgKiBxMnogKyBxMXggKiBxMnkgLSBxMXkgKiBxMng7XG4gICAgICAgIGRlc3QudyA9IHExdyAqIHEydyAtIHExeCAqIHEyeCAtIHExeSAqIHEyeSAtIHExeiAqIHEyejtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBjcm9zcyhxMSwgcTIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBxdWF0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcTF4ID0gcTEueDtcbiAgICAgICAgY29uc3QgcTF5ID0gcTEueTtcbiAgICAgICAgY29uc3QgcTF6ID0gcTEuejtcbiAgICAgICAgY29uc3QgcTF3ID0gcTEudztcbiAgICAgICAgY29uc3QgcTJ4ID0gcTIueDtcbiAgICAgICAgY29uc3QgcTJ5ID0gcTIueTtcbiAgICAgICAgY29uc3QgcTJ6ID0gcTIuejtcbiAgICAgICAgY29uc3QgcTJ3ID0gcTIudztcbiAgICAgICAgZGVzdC54ID0gcTF3ICogcTJ6ICsgcTF6ICogcTJ3ICsgcTF4ICogcTJ5IC0gcTF5ICogcTJ4O1xuICAgICAgICBkZXN0LnkgPSBxMXcgKiBxMncgLSBxMXggKiBxMnggLSBxMXkgKiBxMnkgLSBxMXogKiBxMno7XG4gICAgICAgIGRlc3QueiA9IHExdyAqIHEyeCArIHExeCAqIHEydyArIHExeSAqIHEyeiAtIHExeiAqIHEyeTtcbiAgICAgICAgZGVzdC53ID0gcTF3ICogcTJ5ICsgcTF5ICogcTJ3ICsgcTF6ICogcTJ4IC0gcTF4ICogcTJ6O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG1peChxMSwgcTIsIHRpbWUsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBxdWF0KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRpbWUgPD0gMC4wKSB7XG4gICAgICAgICAgICBxMS5jb3B5KGRlc3QpO1xuICAgICAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGltZSA+PSAxLjApIHtcbiAgICAgICAgICAgIHEyLmNvcHkoZGVzdCk7XG4gICAgICAgICAgICByZXR1cm4gZGVzdDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29zID0gcXVhdC5kb3QocTEsIHEyKTtcbiAgICAgICAgY29uc3QgcTJhID0gcTIuY29weShkZXN0KTtcbiAgICAgICAgaWYgKGNvcyA8IDAuMCkge1xuICAgICAgICAgICAgcTJhLmludmVydCgpO1xuICAgICAgICAgICAgY29zID0gLWNvcztcbiAgICAgICAgfVxuICAgICAgICBsZXQgazA7XG4gICAgICAgIGxldCBrMTtcbiAgICAgICAgaWYgKGNvcyA+IDEgLSBFcHNpbG9uKSB7XG4gICAgICAgICAgICBrMCA9IDEgLSB0aW1lO1xuICAgICAgICAgICAgazEgPSAwICsgdGltZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc3FydCgxIC0gY29zICogY29zKTtcbiAgICAgICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihzaW4sIGNvcyk7XG4gICAgICAgICAgICBjb25zdCBvbmVPdmVyU2luID0gMSAvIHNpbjtcbiAgICAgICAgICAgIGswID0gTWF0aC5zaW4oKDEgLSB0aW1lKSAqIGFuZ2xlKSAqIG9uZU92ZXJTaW47XG4gICAgICAgICAgICBrMSA9IE1hdGguc2luKCgwICsgdGltZSkgKiBhbmdsZSkgKiBvbmVPdmVyU2luO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IGswICogcTEueCArIGsxICogcTJhLng7XG4gICAgICAgIGRlc3QueSA9IGswICogcTEueSArIGsxICogcTJhLnk7XG4gICAgICAgIGRlc3QueiA9IGswICogcTEueiArIGsxICogcTJhLno7XG4gICAgICAgIGRlc3QudyA9IGswICogcTEudyArIGsxICogcTJhLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZnJvbUF4aXNBbmdsZShheGlzLCBhbmdsZSwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHF1YXQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhID0gYW5nbGUgKiAwLjU7XG4gICAgICAgIGNvbnN0IHNpbiA9IE1hdGguc2luKGEpO1xuICAgICAgICBkZXN0LnggPSBheGlzLnggKiBzaW47XG4gICAgICAgIGRlc3QueSA9IGF4aXMueSAqIHNpbjtcbiAgICAgICAgZGVzdC56ID0gYXhpcy56ICogc2luO1xuICAgICAgICBkZXN0LncgPSBNYXRoLmNvcyhhKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tRXVsZXJBbmdsZXMoeWF3LCBwaXRjaCwgcm9sbCwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHF1YXQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB5ID0geWF3ICogMC41O1xuICAgICAgICBjb25zdCByID0gcm9sbCAqIDAuNTtcbiAgICAgICAgY29uc3QgcCA9IHBpdGNoICogMC41O1xuICAgICAgICBjb25zdCBjMSA9IE1hdGguY29zKHkpO1xuICAgICAgICBjb25zdCBzMSA9IE1hdGguc2luKHkpO1xuICAgICAgICBjb25zdCBjMiA9IE1hdGguY29zKHIpO1xuICAgICAgICBjb25zdCBzMiA9IE1hdGguc2luKHIpO1xuICAgICAgICBjb25zdCBjMyA9IE1hdGguY29zKHApO1xuICAgICAgICBjb25zdCBzMyA9IE1hdGguc2luKHApO1xuICAgICAgICBjb25zdCBjMWMyID0gYzEgKiBjMjtcbiAgICAgICAgY29uc3QgczFzMiA9IHMxICogczI7XG4gICAgICAgIGRlc3QueCA9IGMxYzIgKiBzMyArIHMxczIgKiBjMztcbiAgICAgICAgZGVzdC55ID0gczEgKiBjMiAqIGMzICsgYzEgKiBzMiAqIHMzO1xuICAgICAgICBkZXN0LnogPSBjMSAqIHMyICogYzMgLSBzMSAqIGMyICogczM7XG4gICAgICAgIGRlc3QudyA9IGMxYzIgKiBjMyAtIHMxczIgKiBzMztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRXBzaWxvbiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmNvbnN0IHsgbWluLCBtYXgsIGFicywgc3FydCB9ID0gTWF0aDtcbmV4cG9ydCBjbGFzcyB2ZWMyIGV4dGVuZHMgRmxvYXQzMkFycmF5IHtcbiAgICBzdGF0aWMgemVybyA9IG5ldyB2ZWMyKFswLjAsIDAuMF0pO1xuICAgIHN0YXRpYyBvbmUgPSBuZXcgdmVjMihbMS4wLCAxLjBdKTtcbiAgICBzdGF0aWMgcmlnaHQgPSBuZXcgdmVjMihbMS4wLCAwLjBdKTtcbiAgICBzdGF0aWMgdXAgPSBuZXcgdmVjMihbMC4wLCAxLjBdKTtcbiAgICBzdGF0aWMgYXhlcyA9IFt2ZWMyLnJpZ2h0LCB2ZWMyLnVwXTtcbiAgICBzdGF0aWMgaW5maW5pdHkgPSBuZXcgdmVjMihbSW5maW5pdHksIEluZmluaXR5XSk7XG4gICAgY29uc3RydWN0b3IodmFsdWVzID0gWzAuMCwgMC4wXSkge1xuICAgICAgICBzdXBlcih2YWx1ZXMuc2xpY2UoMCwgMikpO1xuICAgIH1cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuICAgIHNldCB4KHgpIHtcbiAgICAgICAgdGhpc1swXSA9IHg7XG4gICAgfVxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG4gICAgc2V0IHkoeSkge1xuICAgICAgICB0aGlzWzFdID0geTtcbiAgICB9XG4gICAgZ2V0IHh5KCkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbiAgICB9XG4gICAgc2V0IHh5KHh5KSB7XG4gICAgICAgIHRoaXMuc2V0KHh5KTtcbiAgICB9XG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHNxcnQodGhpcy5zcXVhcmVkTGVuZ3RoKTtcbiAgICB9XG4gICAgZ2V0IHNxdWFyZWRMZW5ndGgoKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSB9ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIHggKiB4ICsgeSAqIHk7XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnggPSAwLjA7XG4gICAgICAgIHRoaXMueSA9IDAuMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGNvcHkoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIG5lZ2F0ZShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IC10aGlzLng7XG4gICAgICAgIGRlc3QueSA9IC10aGlzLnk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBlcXVhbHModmVjdG9yLCB0aHJlc2hvbGQgPSBFcHNpbG9uKSB7XG4gICAgICAgIGlmIChhYnModGhpcy54IC0gdmVjdG9yLngpID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFicyh0aGlzLnkgLSB2ZWN0b3IueSkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYWRkKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggKyB2ZWN0b3IueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICsgdmVjdG9yLnk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdWJ0cmFjdCh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54IC0gdmVjdG9yLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAtIHZlY3Rvci55O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgbXVsdGlwbHkodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAqIHZlY3Rvci54O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKiB2ZWN0b3IueTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIGRpdmlkZSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54IC8gdmVjdG9yLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAvIHZlY3Rvci55O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc2NhbGUoc2NhbGFyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAqIHNjYWxhcjtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICogc2NhbGFyO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgbm9ybWFsaXplKGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBkZXN0LnggPSAwO1xuICAgICAgICAgICAgZGVzdC55ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBkZXN0O1xuICAgICAgICB9XG4gICAgICAgIGxlbmd0aCA9IDEuMCAvIGxlbmd0aDtcbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKiBsZW5ndGg7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICB0cmFuc2Zvcm0obWF0cml4LCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRyaXgudHJhbnNmb3JtKHRoaXMsIGRlc3QpO1xuICAgIH1cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSB9ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIFt4LCB5XTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGRlc2VyaWFsaXplKHZhbHVlcykge1xuICAgICAgICByZXR1cm4gbmV3IHZlYzIodmFsdWVzKTtcbiAgICB9XG4gICAgc3RhdGljIGFic29sdXRlKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSBhYnModmVjdG9yLngpO1xuICAgICAgICBkZXN0LnkgPSBhYnModmVjdG9yLnkpO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG1pbmltdW0odmVjdG9yLCB2ZWN0b3IyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IG1pbih2ZWN0b3IueCwgdmVjdG9yMi54KTtcbiAgICAgICAgZGVzdC55ID0gbWluKHZlY3Rvci55LCB2ZWN0b3IyLnkpO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG1heGltdW0odmVjdG9yLCB2ZWN0b3IyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IG1heCh2ZWN0b3IueCwgdmVjdG9yMi54KTtcbiAgICAgICAgZGVzdC55ID0gbWF4KHZlY3Rvci55LCB2ZWN0b3IyLnkpO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGNyb3NzKHZlY3RvciwgdmVjdG9yMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2ZWN0b3IueCAqIHZlY3RvcjIueTtcbiAgICAgICAgZGVzdC55ID0gdmVjdG9yLnkgKiB2ZWN0b3IyLng7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZG90KHZlY3RvciwgdmVjdG9yMikge1xuICAgICAgICByZXR1cm4gdmVjdG9yLnggKiB2ZWN0b3IyLnggKyB2ZWN0b3IueSAqIHZlY3RvcjIueTtcbiAgICB9XG4gICAgc3RhdGljIGRpc3RhbmNlKHZlY3RvciwgdmVjdG9yMikge1xuICAgICAgICByZXR1cm4gc3FydCh0aGlzLnNxdWFyZWREaXN0YW5jZSh2ZWN0b3IsIHZlY3RvcjIpKTtcbiAgICB9XG4gICAgc3RhdGljIHNxdWFyZWREaXN0YW5jZSh2ZWN0b3IsIHZlY3RvcjIpIHtcbiAgICAgICAgY29uc3QgeCA9IHZlY3RvcjIueCAtIHZlY3Rvci54O1xuICAgICAgICBjb25zdCB5ID0gdmVjdG9yMi55IC0gdmVjdG9yLnk7XG4gICAgICAgIHJldHVybiB4ICogeCArIHkgKiB5O1xuICAgIH1cbiAgICBzdGF0aWMgZGlyZWN0aW9uKHZlY3RvciwgdmVjdG9yMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB4ID0gdmVjdG9yLnggLSB2ZWN0b3IyLng7XG4gICAgICAgIGNvbnN0IHkgPSB2ZWN0b3IueSAtIHZlY3RvcjIueTtcbiAgICAgICAgbGV0IGxlbmd0aCA9IHNxcnQoeCAqIHggKyB5ICogeSk7XG4gICAgICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGRlc3QueCA9IDA7XG4gICAgICAgICAgICBkZXN0LnkgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgICAgIH1cbiAgICAgICAgbGVuZ3RoID0gMSAvIGxlbmd0aDtcbiAgICAgICAgZGVzdC54ID0geCAqIGxlbmd0aDtcbiAgICAgICAgZGVzdC55ID0geSAqIGxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtaXgodmVjdG9yLCB2ZWN0b3IyLCB0aW1lLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHggPSB2ZWN0b3IueDtcbiAgICAgICAgY29uc3QgeSA9IHZlY3Rvci55O1xuICAgICAgICBjb25zdCB4MiA9IHZlY3RvcjIueDtcbiAgICAgICAgY29uc3QgeTIgPSB2ZWN0b3IyLnk7XG4gICAgICAgIGRlc3QueCA9IHggKyB0aW1lICogKHgyIC0geCk7XG4gICAgICAgIGRlc3QueSA9IHkgKyB0aW1lICogKHkyIC0geSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgYWRkKHZlY3RvciwgdmVjdG9yMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2ZWN0b3IueCArIHZlY3RvcjIueDtcbiAgICAgICAgZGVzdC55ID0gdmVjdG9yLnkgKyB2ZWN0b3IyLnk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgc3VidHJhY3QodmVjdG9yLCB2ZWN0b3IyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHZlY3Rvci54IC0gdmVjdG9yMi54O1xuICAgICAgICBkZXN0LnkgPSB2ZWN0b3IueSAtIHZlY3RvcjIueTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtdWx0aXBseSh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdmVjdG9yLnggKiB2ZWN0b3IyLng7XG4gICAgICAgIGRlc3QueSA9IHZlY3Rvci55ICogdmVjdG9yMi55O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGRpdmlkZSh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdmVjdG9yLnggLyB2ZWN0b3IyLng7XG4gICAgICAgIGRlc3QueSA9IHZlY3Rvci55IC8gdmVjdG9yMi55O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIHNjYWxlKHZlY3Rvciwgc2NhbGFyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZWN0b3Iuc2NhbGUoc2NhbGFyLCBkZXN0KTtcbiAgICB9XG4gICAgc3RhdGljIG5vcm1hbGl6ZSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlY3Rvci5ub3JtYWxpemUoZGVzdCk7XG4gICAgfVxuICAgIHN0YXRpYyBzdW0oLi4udmVjdG9ycykge1xuICAgICAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xuICAgICAgICAgICAgZGVzdC54ICs9IHZlY3Rvci54O1xuICAgICAgICAgICAgZGVzdC55ICs9IHZlY3Rvci55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZGlmZmVyZW5jZSguLi52ZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XG4gICAgICAgICAgICBkZXN0LnggLT0gdmVjdG9yLng7XG4gICAgICAgICAgICBkZXN0LnkgLT0gdmVjdG9yLnk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBwcm9kdWN0KC4uLnZlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcbiAgICAgICAgICAgIGRlc3QueCAqPSB2ZWN0b3IueDtcbiAgICAgICAgICAgIGRlc3QueSAqPSB2ZWN0b3IueTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGRpdmlzaW9uKC4uLnZlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcbiAgICAgICAgICAgIGRlc3QueCAvPSB2ZWN0b3IueDtcbiAgICAgICAgICAgIGRlc3QueSAvPSB2ZWN0b3IueTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuY29uc3QgeyBtaW4sIG1heCwgYWJzLCBzcXJ0IH0gPSBNYXRoO1xuZXhwb3J0IGNsYXNzIHZlYzMgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xuICAgIHN0YXRpYyB6ZXJvID0gbmV3IHZlYzMoWzAuMCwgMC4wLCAwLjBdKTtcbiAgICBzdGF0aWMgb25lID0gbmV3IHZlYzMoWzEuMCwgMS4wLCAxLjBdKTtcbiAgICBzdGF0aWMgZ3JleSA9IG5ldyB2ZWMzKFswLjgsIDAuOCwgMC44XSk7XG4gICAgc3RhdGljIHJpZ2h0ID0gbmV3IHZlYzMoWzEuMCwgMC4wLCAwLjBdKTtcbiAgICBzdGF0aWMgbGVmdCA9IG5ldyB2ZWMzKFstMS4wLCAwLjAsIDAuMF0pO1xuICAgIHN0YXRpYyB1cCA9IG5ldyB2ZWMzKFswLjAsIDEuMCwgMC4wXSk7XG4gICAgc3RhdGljIGRvd24gPSBuZXcgdmVjMyhbMC4wLCAtMS4wLCAwLjBdKTtcbiAgICBzdGF0aWMgZm9yd2FyZCA9IG5ldyB2ZWMzKFswLjAsIDAuMCwgMS4wXSk7XG4gICAgc3RhdGljIGJhY2t3YXJkID0gbmV3IHZlYzMoWzAuMCwgMC4wLCAtMS4wXSk7XG4gICAgc3RhdGljIGF4ZXMgPSBbdmVjMy5yaWdodCwgdmVjMy51cCwgdmVjMy5mb3J3YXJkXTtcbiAgICBzdGF0aWMgaW5maW5pdHkgPSBuZXcgdmVjMyhbSW5maW5pdHksIEluZmluaXR5LCBJbmZpbml0eV0pO1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyA9IFswLjAsIDAuMCwgMC4wXSkge1xuICAgICAgICBzdXBlcih2YWx1ZXMuc2xpY2UoMCwgMykpO1xuICAgIH1cbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuICAgIHNldCB4KHgpIHtcbiAgICAgICAgdGhpc1swXSA9IHg7XG4gICAgfVxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG4gICAgc2V0IHkoeSkge1xuICAgICAgICB0aGlzWzFdID0geTtcbiAgICB9XG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cbiAgICBzZXQgeih6KSB7XG4gICAgICAgIHRoaXNbMl0gPSB6O1xuICAgIH1cbiAgICBnZXQgeHl6KCkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbiAgICB9XG4gICAgc2V0IHh5eih4eXopIHtcbiAgICAgICAgdGhpcy5zZXQoeHl6KTtcbiAgICB9XG4gICAgZ2V0IHJnYigpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcyk7XG4gICAgfVxuICAgIHNldCByZ2IocmdiKSB7XG4gICAgICAgIHRoaXMuc2V0KHJnYik7XG4gICAgfVxuICAgIGdldCBsZW5ndGgoKSB7XG4gICAgICAgIHJldHVybiBzcXJ0KHRoaXMuc3F1YXJlZExlbmd0aCk7XG4gICAgfVxuICAgIGdldCBzcXVhcmVkTGVuZ3RoKCkge1xuICAgICAgICBjb25zdCB7IHgsIHksIHogfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLnggPSAwLjA7XG4gICAgICAgIHRoaXMueSA9IDAuMDtcbiAgICAgICAgdGhpcy56ID0gMC4wO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgY29weShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55O1xuICAgICAgICBkZXN0LnogPSB0aGlzLno7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBuZWdhdGUoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSAtdGhpcy54O1xuICAgICAgICBkZXN0LnkgPSAtdGhpcy55O1xuICAgICAgICBkZXN0LnogPSAtdGhpcy56O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgZXF1YWxzKHZlY3RvciwgdGhyZXNob2xkID0gRXBzaWxvbikge1xuICAgICAgICBpZiAoYWJzKHRoaXMueCAtIHZlY3Rvci54KSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhYnModGhpcy55IC0gdmVjdG9yLnkpID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFicyh0aGlzLnogLSB2ZWN0b3IueikgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYWRkKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggKyB2ZWN0b3IueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICsgdmVjdG9yLnk7XG4gICAgICAgIGRlc3QueiA9IHRoaXMueiArIHZlY3Rvci56O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3VidHJhY3QodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAtIHZlY3Rvci54O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgLSB2ZWN0b3IueTtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56IC0gdmVjdG9yLno7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBtdWx0aXBseSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICogdmVjdG9yLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAqIHZlY3Rvci55O1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogKiB2ZWN0b3IuejtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIGRpdmlkZSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54IC8gdmVjdG9yLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAvIHZlY3Rvci55O1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogLyB2ZWN0b3IuejtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHNjYWxlKHNjYWxhciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggKiBzY2FsYXI7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAqIHNjYWxhcjtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56ICogc2NhbGFyO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgbm9ybWFsaXplKGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBkZXN0LnggPSAwO1xuICAgICAgICAgICAgZGVzdC55ID0gMDtcbiAgICAgICAgICAgIGRlc3QueiA9IDA7XG4gICAgICAgICAgICByZXR1cm4gZGVzdDtcbiAgICAgICAgfVxuICAgICAgICBsZW5ndGggPSAxLjAgLyBsZW5ndGg7XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAqIGxlbmd0aDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogKiBsZW5ndGg7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICByZWZsZWN0KG5vcm1hbCwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9ybWFsXG4gICAgICAgICAgICAuY29weShkZXN0KVxuICAgICAgICAgICAgLnNjYWxlKC0yLjAgKiB2ZWMzLmRvdCh0aGlzLCBub3JtYWwpKVxuICAgICAgICAgICAgLmFkZCh0aGlzKTtcbiAgICB9XG4gICAgdHJhbnNmb3JtKG1hdHJpeCwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0cml4LnRyYW5zZm9ybSh0aGlzLCBkZXN0KTtcbiAgICB9XG4gICAgaW50ZXJwb2xhdGUodjIsIHRpbWUsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2ZWMzLmludGVycG9sYXRlKHRoaXMsIHYyLCB0aW1lLCBkZXN0KTtcbiAgICB9XG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgICBjb25zdCB7IHgsIHksIHogfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBbeCwgeSwgel07XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZSh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB2ZWMzKHZhbHVlcyk7XG4gICAgfVxuICAgIHN0YXRpYyBpbnRlcnBvbGF0ZSh2MSwgdjIsIHRpbWUsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRpbWUgPD0gMC4wKSB7XG4gICAgICAgICAgICByZXR1cm4gdjEuY29weShkZXN0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGltZSA+PSAxLjApIHtcbiAgICAgICAgICAgIHJldHVybiB2Mi5jb3B5KGRlc3QpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2MVxuICAgICAgICAgICAgLmNvcHkoZGVzdClcbiAgICAgICAgICAgIC5zY2FsZSgxLjAgLSB0aW1lKVxuICAgICAgICAgICAgLmFkZCh2Mi5jb3B5KCkuc2NhbGUodGltZSkpO1xuICAgIH1cbiAgICBzdGF0aWMgYWJzb2x1dGUodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IGFicyh2ZWN0b3IueCk7XG4gICAgICAgIGRlc3QueSA9IGFicyh2ZWN0b3IueSk7XG4gICAgICAgIGRlc3QueiA9IGFicyh2ZWN0b3Iueik7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbWluaW11bSh2MSwgdjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gbWluKHYxLngsIHYyLngpO1xuICAgICAgICBkZXN0LnkgPSBtaW4odjEueSwgdjIueSk7XG4gICAgICAgIGRlc3QueiA9IG1pbih2MS56LCB2Mi56KTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtYXhpbXVtKHYxLCB2MiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSBtYXgodjEueCwgdjIueCk7XG4gICAgICAgIGRlc3QueSA9IG1heCh2MS55LCB2Mi55KTtcbiAgICAgICAgZGVzdC56ID0gbWF4KHYxLnosIHYyLnopO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGNyb3NzKHYxLCB2MiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB4ID0gdjEueDtcbiAgICAgICAgY29uc3QgeSA9IHYxLnk7XG4gICAgICAgIGNvbnN0IHogPSB2MS56O1xuICAgICAgICBjb25zdCB4MiA9IHYyLng7XG4gICAgICAgIGNvbnN0IHkyID0gdjIueTtcbiAgICAgICAgY29uc3QgejIgPSB2Mi56O1xuICAgICAgICBkZXN0LnggPSB5ICogejIgLSB6ICogeTI7XG4gICAgICAgIGRlc3QueSA9IHogKiB4MiAtIHggKiB6MjtcbiAgICAgICAgZGVzdC56ID0geCAqIHkyIC0geSAqIHgyO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGRvdCh2MSwgdjIpIHtcbiAgICAgICAgY29uc3QgeCA9IHYxLng7XG4gICAgICAgIGNvbnN0IHkgPSB2MS55O1xuICAgICAgICBjb25zdCB6ID0gdjEuejtcbiAgICAgICAgY29uc3QgeDIgPSB2Mi54O1xuICAgICAgICBjb25zdCB5MiA9IHYyLnk7XG4gICAgICAgIGNvbnN0IHoyID0gdjIuejtcbiAgICAgICAgcmV0dXJuIHggKiB4MiArIHkgKiB5MiArIHogKiB6MjtcbiAgICB9XG4gICAgc3RhdGljIGRpc3RhbmNlKHYxLCB2Mikge1xuICAgICAgICByZXR1cm4gc3FydCh0aGlzLnNxdWFyZWREaXN0YW5jZSh2MSwgdjIpKTtcbiAgICB9XG4gICAgc3RhdGljIHNxdWFyZWREaXN0YW5jZSh2MSwgdjIpIHtcbiAgICAgICAgY29uc3QgeCA9IHYyLnggLSB2MS54O1xuICAgICAgICBjb25zdCB5ID0gdjIueSAtIHYxLnk7XG4gICAgICAgIGNvbnN0IHogPSB2Mi56IC0gdjEuejtcbiAgICAgICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogejtcbiAgICB9XG4gICAgc3RhdGljIGRpcmVjdGlvbih2MSwgdjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeCA9IHYxLnggLSB2Mi54O1xuICAgICAgICBjb25zdCB5ID0gdjEueSAtIHYyLnk7XG4gICAgICAgIGNvbnN0IHogPSB2MS56IC0gdjIuejtcbiAgICAgICAgbGV0IGxlbmd0aCA9IHNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZGVzdC54ID0gMDtcbiAgICAgICAgICAgIGRlc3QueSA9IDA7XG4gICAgICAgICAgICBkZXN0LnogPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgICAgIH1cbiAgICAgICAgbGVuZ3RoID0gMSAvIGxlbmd0aDtcbiAgICAgICAgZGVzdC54ID0geCAqIGxlbmd0aDtcbiAgICAgICAgZGVzdC55ID0geSAqIGxlbmd0aDtcbiAgICAgICAgZGVzdC56ID0geiAqIGxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtaXgodjEsIHYyLCB0aW1lLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHYxLnggKyB0aW1lICogKHYyLnggLSB2MS54KTtcbiAgICAgICAgZGVzdC55ID0gdjEueSArIHRpbWUgKiAodjIueSAtIHYxLnkpO1xuICAgICAgICBkZXN0LnogPSB2MS56ICsgdGltZSAqICh2Mi56IC0gdjEueik7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgYWRkKHYxLCB2MiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2MS54ICsgdjIueDtcbiAgICAgICAgZGVzdC55ID0gdjEueSArIHYyLnk7XG4gICAgICAgIGRlc3QueiA9IHYxLnogKyB2Mi56O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIHN1YnRyYWN0KHYxLCB2MiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2MS54IC0gdjIueDtcbiAgICAgICAgZGVzdC55ID0gdjEueSAtIHYyLnk7XG4gICAgICAgIGRlc3QueiA9IHYxLnogLSB2Mi56O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG11bHRpcGx5KHYxLCB2MiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2MS54ICogdjIueDtcbiAgICAgICAgZGVzdC55ID0gdjEueSAqIHYyLnk7XG4gICAgICAgIGRlc3QueiA9IHYxLnogKiB2Mi56O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGRpdmlkZSh2MSwgdjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdjEueCAvIHYyLng7XG4gICAgICAgIGRlc3QueSA9IHYxLnkgLyB2Mi55O1xuICAgICAgICBkZXN0LnogPSB2MS56IC8gdjIuejtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBzY2FsZSh2ZWN0b3IsIHNjYWxhciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmVjdG9yLnNjYWxlKHNjYWxhciwgZGVzdCk7XG4gICAgfVxuICAgIHN0YXRpYyBub3JtYWxpemUodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZWN0b3Iubm9ybWFsaXplKGRlc3QpO1xuICAgIH1cbiAgICBzdGF0aWMgc3VtKC4uLnZlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcbiAgICAgICAgICAgIGRlc3QueCArPSB2ZWN0b3IueDtcbiAgICAgICAgICAgIGRlc3QueSArPSB2ZWN0b3IueTtcbiAgICAgICAgICAgIGRlc3QueiArPSB2ZWN0b3IuejtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGRpZmZlcmVuY2UoLi4udmVjdG9ycykge1xuICAgICAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xuICAgICAgICAgICAgZGVzdC54IC09IHZlY3Rvci54O1xuICAgICAgICAgICAgZGVzdC55IC09IHZlY3Rvci55O1xuICAgICAgICAgICAgZGVzdC56IC09IHZlY3Rvci56O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgcHJvZHVjdCguLi52ZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XG4gICAgICAgICAgICBkZXN0LnggKj0gdmVjdG9yLng7XG4gICAgICAgICAgICBkZXN0LnkgKj0gdmVjdG9yLnk7XG4gICAgICAgICAgICBkZXN0LnogKj0gdmVjdG9yLno7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBkaXZpc2lvbiguLi52ZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XG4gICAgICAgICAgICBkZXN0LnggLz0gdmVjdG9yLng7XG4gICAgICAgICAgICBkZXN0LnkgLz0gdmVjdG9yLnk7XG4gICAgICAgICAgICBkZXN0LnogLz0gdmVjdG9yLno7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRXBzaWxvbiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmNvbnN0IHsgbWluLCBtYXgsIGFicywgc3FydCB9ID0gTWF0aDtcbmV4cG9ydCBjbGFzcyB2ZWM0IGV4dGVuZHMgRmxvYXQzMkFycmF5IHtcbiAgICBzdGF0aWMgemVybyA9IG5ldyB2ZWM0KFswLjAsIDAuMCwgMC4wLCAxLjBdKTtcbiAgICBzdGF0aWMgb25lID0gbmV3IHZlYzQoWzEuMCwgMS4wLCAxLjAsIDEuMF0pO1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyA9IFswLjAsIDAuMCwgMC4wLCAxLjBdKSB7XG4gICAgICAgIHN1cGVyKHZhbHVlcy5zbGljZSgwLCA0KSk7XG4gICAgfVxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG4gICAgc2V0IHgoeCkge1xuICAgICAgICB0aGlzWzBdID0geDtcbiAgICB9XG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cbiAgICBzZXQgeSh5KSB7XG4gICAgICAgIHRoaXNbMV0gPSB5O1xuICAgIH1cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuICAgIHNldCB6KHopIHtcbiAgICAgICAgdGhpc1syXSA9IHo7XG4gICAgfVxuICAgIGdldCB3KCkge1xuICAgICAgICByZXR1cm4gdGhpc1szXTtcbiAgICB9XG4gICAgc2V0IHcodykge1xuICAgICAgICB0aGlzWzNdID0gdztcbiAgICB9XG4gICAgZ2V0IHh5encoKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMpO1xuICAgIH1cbiAgICBzZXQgeHl6dyh4eXp3KSB7XG4gICAgICAgIHRoaXMuc2V0KHh5encpO1xuICAgIH1cbiAgICBnZXQgcmdiYSgpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcyk7XG4gICAgfVxuICAgIHNldCByZ2JhKHJnYmEpIHtcbiAgICAgICAgdGhpcy5zZXQocmdiYSk7XG4gICAgfVxuICAgIGdldCBsZW5ndGgoKSB7XG4gICAgICAgIHJldHVybiBzcXJ0KHRoaXMuc3F1YXJlZExlbmd0aCk7XG4gICAgfVxuICAgIGdldCBzcXVhcmVkTGVuZ3RoKCkge1xuICAgICAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdztcbiAgICB9XG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMueCA9IDAuMDtcbiAgICAgICAgdGhpcy55ID0gMC4wO1xuICAgICAgICB0aGlzLnogPSAwLjA7XG4gICAgICAgIHRoaXMudyA9IDEuMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGNvcHkoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueTtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56O1xuICAgICAgICBkZXN0LncgPSB0aGlzLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBuZWdhdGUoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSAtdGhpcy54O1xuICAgICAgICBkZXN0LnkgPSAtdGhpcy55O1xuICAgICAgICBkZXN0LnogPSAtdGhpcy56O1xuICAgICAgICBkZXN0LncgPSAtdGhpcy53O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgZXF1YWxzKHZlY3RvciwgdGhyZXNob2xkID0gRXBzaWxvbikge1xuICAgICAgICBpZiAoYWJzKHRoaXMueCAtIHZlY3Rvci54KSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhYnModGhpcy55IC0gdmVjdG9yLnkpID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFicyh0aGlzLnogLSB2ZWN0b3IueikgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWJzKHRoaXMudyAtIHZlY3Rvci53KSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBhZGQodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCArIHZlY3Rvci54O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKyB2ZWN0b3IueTtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56ICsgdmVjdG9yLno7XG4gICAgICAgIGRlc3QudyA9IHRoaXMudyArIHZlY3Rvci53O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3VidHJhY3QodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAtIHZlY3Rvci54O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgLSB2ZWN0b3IueTtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56IC0gdmVjdG9yLno7XG4gICAgICAgIGRlc3QudyA9IHRoaXMudyAtIHZlY3Rvci53O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgbXVsdGlwbHkodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAqIHZlY3Rvci54O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKiB2ZWN0b3IueTtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56ICogdmVjdG9yLno7XG4gICAgICAgIGRlc3QudyA9IHRoaXMudyAqIHZlY3Rvci53O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgZGl2aWRlKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggLyB2ZWN0b3IueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55IC8gdmVjdG9yLnk7XG4gICAgICAgIGRlc3QueiA9IHRoaXMueiAvIHZlY3Rvci56O1xuICAgICAgICBkZXN0LncgPSB0aGlzLncgLyB2ZWN0b3IudztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHNjYWxlKHNjYWxhciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggKiBzY2FsYXI7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAqIHNjYWxhcjtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56ICogc2NhbGFyO1xuICAgICAgICBkZXN0LncgPSB0aGlzLncgKiBzY2FsYXI7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBub3JtYWxpemUoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGRlc3QueCA9IDA7XG4gICAgICAgICAgICBkZXN0LnkgPSAwO1xuICAgICAgICAgICAgZGVzdC56ID0gMDtcbiAgICAgICAgICAgIGRlc3QudyA9IDA7XG4gICAgICAgICAgICByZXR1cm4gZGVzdDtcbiAgICAgICAgfVxuICAgICAgICBsZW5ndGggPSAxLjAgLyBsZW5ndGg7XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAqIGxlbmd0aDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogKiBsZW5ndGg7XG4gICAgICAgIGRlc3QudyA9IHRoaXMudyAqIGxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHRyYW5zZm9ybShtYXRyaXgsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdHJpeC50cmFuc2Zvcm0odGhpcywgZGVzdCk7XG4gICAgfVxuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4gW3gsIHksIHosIHddO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZGVzZXJpYWxpemUodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBuZXcgdmVjNCh2YWx1ZXMpO1xuICAgIH1cbiAgICBzdGF0aWMgYWJzb2x1dGUodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IGFicyh2ZWN0b3IueCk7XG4gICAgICAgIGRlc3QueSA9IGFicyh2ZWN0b3IueSk7XG4gICAgICAgIGRlc3QueiA9IGFicyh2ZWN0b3Iueik7XG4gICAgICAgIGRlc3QudyA9IGFicyh2ZWN0b3Iudyk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbWluaW11bSh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gbWluKHZlY3Rvci54LCB2ZWN0b3IyLngpO1xuICAgICAgICBkZXN0LnkgPSBtaW4odmVjdG9yLnksIHZlY3RvcjIueSk7XG4gICAgICAgIGRlc3QueiA9IG1pbih2ZWN0b3IueiwgdmVjdG9yMi56KTtcbiAgICAgICAgZGVzdC56ID0gbWluKHZlY3Rvci53LCB2ZWN0b3IyLncpO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG1heGltdW0odmVjdG9yLCB2ZWN0b3IyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IG1heCh2ZWN0b3IueCwgdmVjdG9yMi54KTtcbiAgICAgICAgZGVzdC55ID0gbWF4KHZlY3Rvci55LCB2ZWN0b3IyLnkpO1xuICAgICAgICBkZXN0LnogPSBtYXgodmVjdG9yLnosIHZlY3RvcjIueik7XG4gICAgICAgIGRlc3QueiA9IG1heCh2ZWN0b3IudywgdmVjdG9yMi53KTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtaXgodmVjdG9yLCB2ZWN0b3IyLCB0aW1lLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHZlY3Rvci54ICsgdGltZSAqICh2ZWN0b3IyLnggLSB2ZWN0b3IueCk7XG4gICAgICAgIGRlc3QueSA9IHZlY3Rvci55ICsgdGltZSAqICh2ZWN0b3IyLnkgLSB2ZWN0b3IueSk7XG4gICAgICAgIGRlc3QueiA9IHZlY3Rvci56ICsgdGltZSAqICh2ZWN0b3IyLnogLSB2ZWN0b3Iueik7XG4gICAgICAgIGRlc3QudyA9IHZlY3Rvci53ICsgdGltZSAqICh2ZWN0b3IyLncgLSB2ZWN0b3Iudyk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgYWRkKHZlY3RvciwgdmVjdG9yMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2ZWN0b3IueCArIHZlY3RvcjIueDtcbiAgICAgICAgZGVzdC55ID0gdmVjdG9yLnkgKyB2ZWN0b3IyLnk7XG4gICAgICAgIGRlc3QueiA9IHZlY3Rvci56ICsgdmVjdG9yMi56O1xuICAgICAgICBkZXN0LncgPSB2ZWN0b3IudyArIHZlY3RvcjIudztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBzdWJ0cmFjdCh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdmVjdG9yLnggLSB2ZWN0b3IyLng7XG4gICAgICAgIGRlc3QueSA9IHZlY3Rvci55IC0gdmVjdG9yMi55O1xuICAgICAgICBkZXN0LnogPSB2ZWN0b3IueiAtIHZlY3RvcjIuejtcbiAgICAgICAgZGVzdC53ID0gdmVjdG9yLncgLSB2ZWN0b3IyLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbXVsdGlwbHkodmVjdG9yLCB2ZWN0b3IyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHZlY3Rvci54ICogdmVjdG9yMi54O1xuICAgICAgICBkZXN0LnkgPSB2ZWN0b3IueSAqIHZlY3RvcjIueTtcbiAgICAgICAgZGVzdC56ID0gdmVjdG9yLnogKiB2ZWN0b3IyLno7XG4gICAgICAgIGRlc3QudyA9IHZlY3Rvci53ICogdmVjdG9yMi53O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGRpdmlkZSh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdmVjdG9yLnggLyB2ZWN0b3IyLng7XG4gICAgICAgIGRlc3QueSA9IHZlY3Rvci55IC8gdmVjdG9yMi55O1xuICAgICAgICBkZXN0LnogPSB2ZWN0b3IueiAvIHZlY3RvcjIuejtcbiAgICAgICAgZGVzdC53ID0gdmVjdG9yLncgLyB2ZWN0b3IyLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgc2NhbGUodmVjdG9yLCBzY2FsYXIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlY3Rvci5zY2FsZShzY2FsYXIsIGRlc3QpO1xuICAgIH1cbiAgICBzdGF0aWMgbm9ybWFsaXplKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmVjdG9yLm5vcm1hbGl6ZShkZXN0KTtcbiAgICB9XG4gICAgc3RhdGljIHN1bSguLi52ZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XG4gICAgICAgICAgICBkZXN0LnggKz0gdmVjdG9yLng7XG4gICAgICAgICAgICBkZXN0LnkgKz0gdmVjdG9yLnk7XG4gICAgICAgICAgICBkZXN0LnogKz0gdmVjdG9yLno7XG4gICAgICAgICAgICBkZXN0LncgKz0gdmVjdG9yLnc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBkaWZmZXJlbmNlKC4uLnZlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcbiAgICAgICAgICAgIGRlc3QueCAtPSB2ZWN0b3IueDtcbiAgICAgICAgICAgIGRlc3QueSAtPSB2ZWN0b3IueTtcbiAgICAgICAgICAgIGRlc3QueiAtPSB2ZWN0b3IuejtcbiAgICAgICAgICAgIGRlc3QudyAtPSB2ZWN0b3IudztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIHByb2R1Y3QoLi4udmVjdG9ycykge1xuICAgICAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xuICAgICAgICAgICAgZGVzdC54ICo9IHZlY3Rvci54O1xuICAgICAgICAgICAgZGVzdC55ICo9IHZlY3Rvci55O1xuICAgICAgICAgICAgZGVzdC56ICo9IHZlY3Rvci56O1xuICAgICAgICAgICAgZGVzdC53ICo9IHZlY3Rvci53O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZGl2aXNpb24oLi4udmVjdG9ycykge1xuICAgICAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xuICAgICAgICAgICAgZGVzdC54IC89IHZlY3Rvci54O1xuICAgICAgICAgICAgZGVzdC55IC89IHZlY3Rvci55O1xuICAgICAgICAgICAgZGVzdC56IC89IHZlY3Rvci56O1xuICAgICAgICAgICAgZGVzdC53IC89IHZlY3Rvci53O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbn1cbiIsIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuQ29weXJpZ2h0IChDKSBNaWNyb3NvZnQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2VcbnRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlXG5MaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5USElTIENPREUgSVMgUFJPVklERUQgT04gQU4gKkFTIElTKiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZXG5LSU5ELCBFSVRIRVIgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgV0lUSE9VVCBMSU1JVEFUSU9OIEFOWSBJTVBMSUVEXG5XQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgVElUTEUsIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLFxuTUVSQ0hBTlRBQkxJVFkgT1IgTk9OLUlORlJJTkdFTUVOVC5cblxuU2VlIHRoZSBBcGFjaGUgVmVyc2lvbiAyLjAgTGljZW5zZSBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zXG5hbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xudmFyIFJlZmxlY3Q7XG4oZnVuY3Rpb24gKFJlZmxlY3QpIHtcbiAgICAvLyBNZXRhZGF0YSBQcm9wb3NhbFxuICAgIC8vIGh0dHBzOi8vcmJ1Y2t0b24uZ2l0aHViLmlvL3JlZmxlY3QtbWV0YWRhdGEvXG4gICAgKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgICAgIHZhciByb290ID0gdHlwZW9mIGdsb2JhbFRoaXMgPT09IFwib2JqZWN0XCIgPyBnbG9iYWxUaGlzIDpcbiAgICAgICAgICAgIHR5cGVvZiBnbG9iYWwgPT09IFwib2JqZWN0XCIgPyBnbG9iYWwgOlxuICAgICAgICAgICAgICAgIHR5cGVvZiBzZWxmID09PSBcIm9iamVjdFwiID8gc2VsZiA6XG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiB0aGlzID09PSBcIm9iamVjdFwiID8gdGhpcyA6XG4gICAgICAgICAgICAgICAgICAgICAgICBzbG9wcHlNb2RlVGhpcygpO1xuICAgICAgICB2YXIgZXhwb3J0ZXIgPSBtYWtlRXhwb3J0ZXIoUmVmbGVjdCk7XG4gICAgICAgIGlmICh0eXBlb2Ygcm9vdC5SZWZsZWN0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBleHBvcnRlciA9IG1ha2VFeHBvcnRlcihyb290LlJlZmxlY3QsIGV4cG9ydGVyKTtcbiAgICAgICAgfVxuICAgICAgICBmYWN0b3J5KGV4cG9ydGVyLCByb290KTtcbiAgICAgICAgaWYgKHR5cGVvZiByb290LlJlZmxlY3QgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHJvb3QuUmVmbGVjdCA9IFJlZmxlY3Q7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gbWFrZUV4cG9ydGVyKHRhcmdldCwgcHJldmlvdXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgeyBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzKVxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyhrZXksIHZhbHVlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gZnVuY3Rpb25UaGlzKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gRnVuY3Rpb24oXCJyZXR1cm4gdGhpcztcIikoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChfKSB7IH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBpbmRpcmVjdEV2YWxUaGlzKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHZvaWQgMCwgZXZhbCkoXCIoZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSgpXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKF8pIHsgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNsb3BweU1vZGVUaGlzKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uVGhpcygpIHx8IGluZGlyZWN0RXZhbFRoaXMoKTtcbiAgICAgICAgfVxuICAgIH0pKGZ1bmN0aW9uIChleHBvcnRlciwgcm9vdCkge1xuICAgICAgICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgICAgICAgLy8gZmVhdHVyZSB0ZXN0IGZvciBTeW1ib2wgc3VwcG9ydFxuICAgICAgICB2YXIgc3VwcG9ydHNTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCI7XG4gICAgICAgIHZhciB0b1ByaW1pdGl2ZVN5bWJvbCA9IHN1cHBvcnRzU3ltYm9sICYmIHR5cGVvZiBTeW1ib2wudG9QcmltaXRpdmUgIT09IFwidW5kZWZpbmVkXCIgPyBTeW1ib2wudG9QcmltaXRpdmUgOiBcIkBAdG9QcmltaXRpdmVcIjtcbiAgICAgICAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gc3VwcG9ydHNTeW1ib2wgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciAhPT0gXCJ1bmRlZmluZWRcIiA/IFN5bWJvbC5pdGVyYXRvciA6IFwiQEBpdGVyYXRvclwiO1xuICAgICAgICB2YXIgc3VwcG9ydHNDcmVhdGUgPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gXCJmdW5jdGlvblwiOyAvLyBmZWF0dXJlIHRlc3QgZm9yIE9iamVjdC5jcmVhdGUgc3VwcG9ydFxuICAgICAgICB2YXIgc3VwcG9ydHNQcm90byA9IHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXk7IC8vIGZlYXR1cmUgdGVzdCBmb3IgX19wcm90b19fIHN1cHBvcnRcbiAgICAgICAgdmFyIGRvd25MZXZlbCA9ICFzdXBwb3J0c0NyZWF0ZSAmJiAhc3VwcG9ydHNQcm90bztcbiAgICAgICAgdmFyIEhhc2hNYXAgPSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgYW4gb2JqZWN0IGluIGRpY3Rpb25hcnkgbW9kZSAoYS5rLmEuIFwic2xvd1wiIG1vZGUgaW4gdjgpXG4gICAgICAgICAgICBjcmVhdGU6IHN1cHBvcnRzQ3JlYXRlXG4gICAgICAgICAgICAgICAgPyBmdW5jdGlvbiAoKSB7IHJldHVybiBNYWtlRGljdGlvbmFyeShPYmplY3QuY3JlYXRlKG51bGwpKTsgfVxuICAgICAgICAgICAgICAgIDogc3VwcG9ydHNQcm90b1xuICAgICAgICAgICAgICAgICAgICA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIE1ha2VEaWN0aW9uYXJ5KHsgX19wcm90b19fOiBudWxsIH0pOyB9XG4gICAgICAgICAgICAgICAgICAgIDogZnVuY3Rpb24gKCkgeyByZXR1cm4gTWFrZURpY3Rpb25hcnkoe30pOyB9LFxuICAgICAgICAgICAgaGFzOiBkb3duTGV2ZWxcbiAgICAgICAgICAgICAgICA/IGZ1bmN0aW9uIChtYXAsIGtleSkgeyByZXR1cm4gaGFzT3duLmNhbGwobWFwLCBrZXkpOyB9XG4gICAgICAgICAgICAgICAgOiBmdW5jdGlvbiAobWFwLCBrZXkpIHsgcmV0dXJuIGtleSBpbiBtYXA7IH0sXG4gICAgICAgICAgICBnZXQ6IGRvd25MZXZlbFxuICAgICAgICAgICAgICAgID8gZnVuY3Rpb24gKG1hcCwga2V5KSB7IHJldHVybiBoYXNPd24uY2FsbChtYXAsIGtleSkgPyBtYXBba2V5XSA6IHVuZGVmaW5lZDsgfVxuICAgICAgICAgICAgICAgIDogZnVuY3Rpb24gKG1hcCwga2V5KSB7IHJldHVybiBtYXBba2V5XTsgfSxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gTG9hZCBnbG9iYWwgb3Igc2hpbSB2ZXJzaW9ucyBvZiBNYXAsIFNldCwgYW5kIFdlYWtNYXBcbiAgICAgICAgdmFyIGZ1bmN0aW9uUHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKEZ1bmN0aW9uKTtcbiAgICAgICAgdmFyIF9NYXAgPSB0eXBlb2YgTWFwID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIE1hcC5wcm90b3R5cGUuZW50cmllcyA9PT0gXCJmdW5jdGlvblwiID8gTWFwIDogQ3JlYXRlTWFwUG9seWZpbGwoKTtcbiAgICAgICAgdmFyIF9TZXQgPSB0eXBlb2YgU2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFNldC5wcm90b3R5cGUuZW50cmllcyA9PT0gXCJmdW5jdGlvblwiID8gU2V0IDogQ3JlYXRlU2V0UG9seWZpbGwoKTtcbiAgICAgICAgdmFyIF9XZWFrTWFwID0gdHlwZW9mIFdlYWtNYXAgPT09IFwiZnVuY3Rpb25cIiA/IFdlYWtNYXAgOiBDcmVhdGVXZWFrTWFwUG9seWZpbGwoKTtcbiAgICAgICAgdmFyIHJlZ2lzdHJ5U3ltYm9sID0gc3VwcG9ydHNTeW1ib2wgPyBTeW1ib2wuZm9yKFwiQHJlZmxlY3QtbWV0YWRhdGE6cmVnaXN0cnlcIikgOiB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBtZXRhZGF0YVJlZ2lzdHJ5ID0gR2V0T3JDcmVhdGVNZXRhZGF0YVJlZ2lzdHJ5KCk7XG4gICAgICAgIHZhciBtZXRhZGF0YVByb3ZpZGVyID0gQ3JlYXRlTWV0YWRhdGFQcm92aWRlcihtZXRhZGF0YVJlZ2lzdHJ5KTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFwcGxpZXMgYSBzZXQgb2YgZGVjb3JhdG9ycyB0byBhIHByb3BlcnR5IG9mIGEgdGFyZ2V0IG9iamVjdC5cbiAgICAgICAgICogQHBhcmFtIGRlY29yYXRvcnMgQW4gYXJyYXkgb2YgZGVjb3JhdG9ycy5cbiAgICAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdC5cbiAgICAgICAgICogQHBhcmFtIHByb3BlcnR5S2V5IChPcHRpb25hbCkgVGhlIHByb3BlcnR5IGtleSB0byBkZWNvcmF0ZS5cbiAgICAgICAgICogQHBhcmFtIGF0dHJpYnV0ZXMgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkgZGVzY3JpcHRvciBmb3IgdGhlIHRhcmdldCBrZXkuXG4gICAgICAgICAqIEByZW1hcmtzIERlY29yYXRvcnMgYXJlIGFwcGxpZWQgaW4gcmV2ZXJzZSBvcmRlci5cbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcbiAgICAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAgICAgY29uc3RydWN0b3IocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxuICAgICAgICAgKiAgICAgRXhhbXBsZSA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIixcbiAgICAgICAgICogICAgICAgICBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnNBcnJheSwgRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIixcbiAgICAgICAgICogICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKSkpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIsXG4gICAgICAgICAqICAgICAgICAgUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiLFxuICAgICAgICAgKiAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKSkpO1xuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChwcm9wZXJ0eUtleSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIUlzQXJyYXkoZGVjb3JhdG9ycykpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICBpZiAoIUlzT2JqZWN0KGF0dHJpYnV0ZXMpICYmICFJc1VuZGVmaW5lZChhdHRyaWJ1dGVzKSAmJiAhSXNOdWxsKGF0dHJpYnV0ZXMpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgaWYgKElzTnVsbChhdHRyaWJ1dGVzKSlcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUtleSA9IFRvUHJvcGVydHlLZXkocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBEZWNvcmF0ZVByb3BlcnR5KGRlY29yYXRvcnMsIHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFJc0FycmF5KGRlY29yYXRvcnMpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgaWYgKCFJc0NvbnN0cnVjdG9yKHRhcmdldCkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gRGVjb3JhdGVDb25zdHJ1Y3RvcihkZWNvcmF0b3JzLCB0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGV4cG9ydGVyKFwiZGVjb3JhdGVcIiwgZGVjb3JhdGUpO1xuICAgICAgICAvLyA0LjEuMiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKVxuICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNyZWZsZWN0Lm1ldGFkYXRhXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIGRlZmF1bHQgbWV0YWRhdGEgZGVjb3JhdG9yIGZhY3RvcnkgdGhhdCBjYW4gYmUgdXNlZCBvbiBhIGNsYXNzLCBjbGFzcyBtZW1iZXIsIG9yIHBhcmFtZXRlci5cbiAgICAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IFRoZSBrZXkgZm9yIHRoZSBtZXRhZGF0YSBlbnRyeS5cbiAgICAgICAgICogQHBhcmFtIG1ldGFkYXRhVmFsdWUgVGhlIHZhbHVlIGZvciB0aGUgbWV0YWRhdGEgZW50cnkuXG4gICAgICAgICAqIEByZXR1cm5zIEEgZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICAgICAgICAgKiBAcmVtYXJrc1xuICAgICAgICAgKiBJZiBgbWV0YWRhdGFLZXlgIGlzIGFscmVhZHkgZGVmaW5lZCBmb3IgdGhlIHRhcmdldCBhbmQgdGFyZ2V0IGtleSwgdGhlXG4gICAgICAgICAqIG1ldGFkYXRhVmFsdWUgZm9yIHRoYXQga2V5IHdpbGwgYmUgb3ZlcndyaXR0ZW4uXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxuICAgICAgICAgKiAgICAgQFJlZmxlY3QubWV0YWRhdGEoa2V5LCB2YWx1ZSlcbiAgICAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xuICAgICAgICAgKiAgICAgfVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yLCBUeXBlU2NyaXB0IG9ubHkpXG4gICAgICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcbiAgICAgICAgICogICAgICAgICBAUmVmbGVjdC5tZXRhZGF0YShrZXksIHZhbHVlKVxuICAgICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUsIFR5cGVTY3JpcHQgb25seSlcbiAgICAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xuICAgICAgICAgKiAgICAgICAgIEBSZWZsZWN0Lm1ldGFkYXRhKGtleSwgdmFsdWUpXG4gICAgICAgICAqICAgICAgICAgcHJvcGVydHk7XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgQFJlZmxlY3QubWV0YWRhdGEoa2V5LCB2YWx1ZSlcbiAgICAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKCkgeyB9XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xuICAgICAgICAgKiAgICAgICAgIEBSZWZsZWN0Lm1ldGFkYXRhKGtleSwgdmFsdWUpXG4gICAgICAgICAqICAgICAgICAgbWV0aG9kKCkgeyB9XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBtZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZGVjb3JhdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3BlcnR5S2V5KSAmJiAhSXNQcm9wZXJ0eUtleShwcm9wZXJ0eUtleSkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICBPcmRpbmFyeURlZmluZU93bk1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlLCB0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBkZWNvcmF0b3I7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0ZXIoXCJtZXRhZGF0YVwiLCBtZXRhZGF0YSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWZpbmUgYSB1bmlxdWUgbWV0YWRhdGEgZW50cnkgb24gdGhlIHRhcmdldC5cbiAgICAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxuICAgICAgICAgKiBAcGFyYW0gbWV0YWRhdGFWYWx1ZSBBIHZhbHVlIHRoYXQgY29udGFpbnMgYXR0YWNoZWQgbWV0YWRhdGEuXG4gICAgICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdG8gZGVmaW5lIG1ldGFkYXRhLlxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxuICAgICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cbiAgICAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgICAgICAqICAgICBSZWZsZWN0LmRlZmluZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgb3B0aW9ucywgRXhhbXBsZSk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICBSZWZsZWN0LmRlZmluZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgb3B0aW9ucywgRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICBSZWZsZWN0LmRlZmluZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgb3B0aW9ucywgRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIG9wdGlvbnMsIEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICBSZWZsZWN0LmRlZmluZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgb3B0aW9ucywgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gZGVjb3JhdG9yIGZhY3RvcnkgYXMgbWV0YWRhdGEtcHJvZHVjaW5nIGFubm90YXRpb24uXG4gICAgICAgICAqICAgICBmdW5jdGlvbiBNeUFubm90YXRpb24ob3B0aW9ucyk6IERlY29yYXRvciB7XG4gICAgICAgICAqICAgICAgICAgcmV0dXJuICh0YXJnZXQsIGtleT8pID0+IFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBvcHRpb25zLCB0YXJnZXQsIGtleSk7XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBkZWZpbmVNZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSkge1xuICAgICAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvcGVydHlLZXkpKVxuICAgICAgICAgICAgICAgIHByb3BlcnR5S2V5ID0gVG9Qcm9wZXJ0eUtleShwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICByZXR1cm4gT3JkaW5hcnlEZWZpbmVPd25NZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0ZXIoXCJkZWZpbmVNZXRhZGF0YVwiLCBkZWZpbmVNZXRhZGF0YSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXRzIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB0YXJnZXQgb2JqZWN0IG9yIGl0cyBwcm90b3R5cGUgY2hhaW4gaGFzIHRoZSBwcm92aWRlZCBtZXRhZGF0YSBrZXkgZGVmaW5lZC5cbiAgICAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxuICAgICAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG1ldGFkYXRhIGtleSB3YXMgZGVmaW5lZCBvbiB0aGUgdGFyZ2V0IG9iamVjdCBvciBpdHMgcHJvdG90eXBlIGNoYWluOyBvdGhlcndpc2UsIGBmYWxzZWAuXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XG4gICAgICAgICAqICAgICAgICAgLy8gc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgICAgIGNvbnN0cnVjdG9yKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgfVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0Lmhhc01ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBoYXNNZXRhZGF0YShtZXRhZGF0YUtleSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSkge1xuICAgICAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvcGVydHlLZXkpKVxuICAgICAgICAgICAgICAgIHByb3BlcnR5S2V5ID0gVG9Qcm9wZXJ0eUtleShwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICByZXR1cm4gT3JkaW5hcnlIYXNNZXRhZGF0YShtZXRhZGF0YUtleSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0ZXIoXCJoYXNNZXRhZGF0YVwiLCBoYXNNZXRhZGF0YSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXRzIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB0YXJnZXQgb2JqZWN0IGhhcyB0aGUgcHJvdmlkZWQgbWV0YWRhdGEga2V5IGRlZmluZWQuXG4gICAgICAgICAqIEBwYXJhbSBtZXRhZGF0YUtleSBBIGtleSB1c2VkIHRvIHN0b3JlIGFuZCByZXRyaWV2ZSBtZXRhZGF0YS5cbiAgICAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cbiAgICAgICAgICogQHBhcmFtIHByb3BlcnR5S2V5IChPcHRpb25hbCkgVGhlIHByb3BlcnR5IGtleSBmb3IgdGhlIHRhcmdldC5cbiAgICAgICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBtZXRhZGF0YSBrZXkgd2FzIGRlZmluZWQgb24gdGhlIHRhcmdldCBvYmplY3Q7IG90aGVyd2lzZSwgYGZhbHNlYC5cbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcbiAgICAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAgICAgY29uc3RydWN0b3IocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzT3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGhhc093bk1ldGFkYXRhKG1ldGFkYXRhS2V5LCB0YXJnZXQsIHByb3BlcnR5S2V5KSB7XG4gICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChwcm9wZXJ0eUtleSkpXG4gICAgICAgICAgICAgICAgcHJvcGVydHlLZXkgPSBUb1Byb3BlcnR5S2V5KHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIHJldHVybiBPcmRpbmFyeUhhc093bk1ldGFkYXRhKG1ldGFkYXRhS2V5LCB0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuICAgICAgICBleHBvcnRlcihcImhhc093bk1ldGFkYXRhXCIsIGhhc093bk1ldGFkYXRhKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldHMgdGhlIG1ldGFkYXRhIHZhbHVlIGZvciB0aGUgcHJvdmlkZWQgbWV0YWRhdGEga2V5IG9uIHRoZSB0YXJnZXQgb2JqZWN0IG9yIGl0cyBwcm90b3R5cGUgY2hhaW4uXG4gICAgICAgICAqIEBwYXJhbSBtZXRhZGF0YUtleSBBIGtleSB1c2VkIHRvIHN0b3JlIGFuZCByZXRyaWV2ZSBtZXRhZGF0YS5cbiAgICAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cbiAgICAgICAgICogQHBhcmFtIHByb3BlcnR5S2V5IChPcHRpb25hbCkgVGhlIHByb3BlcnR5IGtleSBmb3IgdGhlIHRhcmdldC5cbiAgICAgICAgICogQHJldHVybnMgVGhlIG1ldGFkYXRhIHZhbHVlIGZvciB0aGUgbWV0YWRhdGEga2V5IGlmIGZvdW5kOyBvdGhlcndpc2UsIGB1bmRlZmluZWRgLlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxuICAgICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cbiAgICAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZ2V0TWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgcHJvcGVydHlLZXkpIHtcbiAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3BlcnR5S2V5KSlcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUtleSA9IFRvUHJvcGVydHlLZXkocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgcmV0dXJuIE9yZGluYXJ5R2V0TWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGV4cG9ydGVyKFwiZ2V0TWV0YWRhdGFcIiwgZ2V0TWV0YWRhdGEpO1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0cyB0aGUgbWV0YWRhdGEgdmFsdWUgZm9yIHRoZSBwcm92aWRlZCBtZXRhZGF0YSBrZXkgb24gdGhlIHRhcmdldCBvYmplY3QuXG4gICAgICAgICAqIEBwYXJhbSBtZXRhZGF0YUtleSBBIGtleSB1c2VkIHRvIHN0b3JlIGFuZCByZXRyaWV2ZSBtZXRhZGF0YS5cbiAgICAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cbiAgICAgICAgICogQHBhcmFtIHByb3BlcnR5S2V5IChPcHRpb25hbCkgVGhlIHByb3BlcnR5IGtleSBmb3IgdGhlIHRhcmdldC5cbiAgICAgICAgICogQHJldHVybnMgVGhlIG1ldGFkYXRhIHZhbHVlIGZvciB0aGUgbWV0YWRhdGEga2V5IGlmIGZvdW5kOyBvdGhlcndpc2UsIGB1bmRlZmluZWRgLlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxuICAgICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cbiAgICAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZ2V0T3duTWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgcHJvcGVydHlLZXkpIHtcbiAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3BlcnR5S2V5KSlcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUtleSA9IFRvUHJvcGVydHlLZXkocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgcmV0dXJuIE9yZGluYXJ5R2V0T3duTWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGV4cG9ydGVyKFwiZ2V0T3duTWV0YWRhdGFcIiwgZ2V0T3duTWV0YWRhdGEpO1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0cyB0aGUgbWV0YWRhdGEga2V5cyBkZWZpbmVkIG9uIHRoZSB0YXJnZXQgb2JqZWN0IG9yIGl0cyBwcm90b3R5cGUgY2hhaW4uXG4gICAgICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXG4gICAgICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAoT3B0aW9uYWwpIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXG4gICAgICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHVuaXF1ZSBtZXRhZGF0YSBrZXlzLlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxuICAgICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cbiAgICAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhS2V5cyhFeGFtcGxlKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzKEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YUtleXMoRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YUtleXMoRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzKEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGdldE1ldGFkYXRhS2V5cyh0YXJnZXQsIHByb3BlcnR5S2V5KSB7XG4gICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChwcm9wZXJ0eUtleSkpXG4gICAgICAgICAgICAgICAgcHJvcGVydHlLZXkgPSBUb1Byb3BlcnR5S2V5KHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIHJldHVybiBPcmRpbmFyeU1ldGFkYXRhS2V5cyh0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuICAgICAgICBleHBvcnRlcihcImdldE1ldGFkYXRhS2V5c1wiLCBnZXRNZXRhZGF0YUtleXMpO1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0cyB0aGUgdW5pcXVlIG1ldGFkYXRhIGtleXMgZGVmaW5lZCBvbiB0aGUgdGFyZ2V0IG9iamVjdC5cbiAgICAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cbiAgICAgICAgICogQHBhcmFtIHByb3BlcnR5S2V5IChPcHRpb25hbCkgVGhlIHByb3BlcnR5IGtleSBmb3IgdGhlIHRhcmdldC5cbiAgICAgICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgdW5pcXVlIG1ldGFkYXRhIGtleXMuXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XG4gICAgICAgICAqICAgICAgICAgLy8gc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgICAgIGNvbnN0cnVjdG9yKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgfVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGFLZXlzKEV4YW1wbGUpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YUtleXMoRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhS2V5cyhFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhS2V5cyhFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YUtleXMoRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZ2V0T3duTWV0YWRhdGFLZXlzKHRhcmdldCwgcHJvcGVydHlLZXkpIHtcbiAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3BlcnR5S2V5KSlcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUtleSA9IFRvUHJvcGVydHlLZXkocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgcmV0dXJuIE9yZGluYXJ5T3duTWV0YWRhdGFLZXlzKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGV4cG9ydGVyKFwiZ2V0T3duTWV0YWRhdGFLZXlzXCIsIGdldE93bk1ldGFkYXRhS2V5cyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWxldGVzIHRoZSBtZXRhZGF0YSBlbnRyeSBmcm9tIHRoZSB0YXJnZXQgb2JqZWN0IHdpdGggdGhlIHByb3ZpZGVkIGtleS5cbiAgICAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxuICAgICAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG1ldGFkYXRhIGVudHJ5IHdhcyBmb3VuZCBhbmQgZGVsZXRlZDsgb3RoZXJ3aXNlLCBmYWxzZS5cbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcbiAgICAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAgICAgY29uc3RydWN0b3IocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZGVsZXRlTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGRlbGV0ZU1ldGFkYXRhKG1ldGFkYXRhS2V5LCB0YXJnZXQsIHByb3BlcnR5S2V5KSB7XG4gICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChwcm9wZXJ0eUtleSkpXG4gICAgICAgICAgICAgICAgcHJvcGVydHlLZXkgPSBUb1Byb3BlcnR5S2V5KHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3BlcnR5S2V5KSlcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUtleSA9IFRvUHJvcGVydHlLZXkocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gR2V0TWV0YWRhdGFQcm92aWRlcih0YXJnZXQsIHByb3BlcnR5S2V5LCAvKkNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChJc1VuZGVmaW5lZChwcm92aWRlcikpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyLk9yZGluYXJ5RGVsZXRlTWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGV4cG9ydGVyKFwiZGVsZXRlTWV0YWRhdGFcIiwgZGVsZXRlTWV0YWRhdGEpO1xuICAgICAgICBmdW5jdGlvbiBEZWNvcmF0ZUNvbnN0cnVjdG9yKGRlY29yYXRvcnMsIHRhcmdldCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVjb3JhdG9yID0gZGVjb3JhdG9yc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgZGVjb3JhdGVkID0gZGVjb3JhdG9yKHRhcmdldCk7XG4gICAgICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChkZWNvcmF0ZWQpICYmICFJc051bGwoZGVjb3JhdGVkKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUlzQ29uc3RydWN0b3IoZGVjb3JhdGVkKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0ID0gZGVjb3JhdGVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gRGVjb3JhdGVQcm9wZXJ0eShkZWNvcmF0b3JzLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBkZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgICAgIHZhciBkZWNvcmF0b3IgPSBkZWNvcmF0b3JzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBkZWNvcmF0ZWQgPSBkZWNvcmF0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvcik7XG4gICAgICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChkZWNvcmF0ZWQpICYmICFJc051bGwoZGVjb3JhdGVkKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUlzT2JqZWN0KGRlY29yYXRlZCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0b3IgPSBkZWNvcmF0ZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XG4gICAgICAgIH1cbiAgICAgICAgLy8gMy4xLjEuMSBPcmRpbmFyeUhhc01ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKVxuICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeWhhc21ldGFkYXRhXG4gICAgICAgIGZ1bmN0aW9uIE9yZGluYXJ5SGFzTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApIHtcbiAgICAgICAgICAgIHZhciBoYXNPd24gPSBPcmRpbmFyeUhhc093bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKTtcbiAgICAgICAgICAgIGlmIChoYXNPd24pXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gT3JkaW5hcnlHZXRQcm90b3R5cGVPZihPKTtcbiAgICAgICAgICAgIGlmICghSXNOdWxsKHBhcmVudCkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9yZGluYXJ5SGFzTWV0YWRhdGEoTWV0YWRhdGFLZXksIHBhcmVudCwgUCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gMy4xLjIuMSBPcmRpbmFyeUhhc093bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKVxuICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeWhhc293bm1ldGFkYXRhXG4gICAgICAgIGZ1bmN0aW9uIE9yZGluYXJ5SGFzT3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApIHtcbiAgICAgICAgICAgIHZhciBwcm92aWRlciA9IEdldE1ldGFkYXRhUHJvdmlkZXIoTywgUCwgLypDcmVhdGUqLyBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQocHJvdmlkZXIpKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBUb0Jvb2xlYW4ocHJvdmlkZXIuT3JkaW5hcnlIYXNPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTywgUCkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIDMuMS4zLjEgT3JkaW5hcnlHZXRNZXRhZGF0YShNZXRhZGF0YUtleSwgTywgUClcbiAgICAgICAgLy8gaHR0cHM6Ly9yYnVja3Rvbi5naXRodWIuaW8vcmVmbGVjdC1tZXRhZGF0YS8jb3JkaW5hcnlnZXRtZXRhZGF0YVxuICAgICAgICBmdW5jdGlvbiBPcmRpbmFyeUdldE1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKSB7XG4gICAgICAgICAgICB2YXIgaGFzT3duID0gT3JkaW5hcnlIYXNPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTywgUCk7XG4gICAgICAgICAgICBpZiAoaGFzT3duKVxuICAgICAgICAgICAgICAgIHJldHVybiBPcmRpbmFyeUdldE93bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKTtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSBPcmRpbmFyeUdldFByb3RvdHlwZU9mKE8pO1xuICAgICAgICAgICAgaWYgKCFJc051bGwocGFyZW50KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gT3JkaW5hcnlHZXRNZXRhZGF0YShNZXRhZGF0YUtleSwgcGFyZW50LCBQKTtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gMy4xLjQuMSBPcmRpbmFyeUdldE93bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKVxuICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeWdldG93bm1ldGFkYXRhXG4gICAgICAgIGZ1bmN0aW9uIE9yZGluYXJ5R2V0T3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApIHtcbiAgICAgICAgICAgIHZhciBwcm92aWRlciA9IEdldE1ldGFkYXRhUHJvdmlkZXIoTywgUCwgLypDcmVhdGUqLyBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQocHJvdmlkZXIpKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlci5PcmRpbmFyeUdldE93bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAzLjEuNS4xIE9yZGluYXJ5RGVmaW5lT3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE1ldGFkYXRhVmFsdWUsIE8sIFApXG4gICAgICAgIC8vIGh0dHBzOi8vcmJ1Y2t0b24uZ2l0aHViLmlvL3JlZmxlY3QtbWV0YWRhdGEvI29yZGluYXJ5ZGVmaW5lb3dubWV0YWRhdGFcbiAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlEZWZpbmVPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTWV0YWRhdGFWYWx1ZSwgTywgUCkge1xuICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gR2V0TWV0YWRhdGFQcm92aWRlcihPLCBQLCAvKkNyZWF0ZSovIHRydWUpO1xuICAgICAgICAgICAgcHJvdmlkZXIuT3JkaW5hcnlEZWZpbmVPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTWV0YWRhdGFWYWx1ZSwgTywgUCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gMy4xLjYuMSBPcmRpbmFyeU1ldGFkYXRhS2V5cyhPLCBQKVxuICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeW1ldGFkYXRha2V5c1xuICAgICAgICBmdW5jdGlvbiBPcmRpbmFyeU1ldGFkYXRhS2V5cyhPLCBQKSB7XG4gICAgICAgICAgICB2YXIgb3duS2V5cyA9IE9yZGluYXJ5T3duTWV0YWRhdGFLZXlzKE8sIFApO1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IE9yZGluYXJ5R2V0UHJvdG90eXBlT2YoTyk7XG4gICAgICAgICAgICBpZiAocGFyZW50ID09PSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiBvd25LZXlzO1xuICAgICAgICAgICAgdmFyIHBhcmVudEtleXMgPSBPcmRpbmFyeU1ldGFkYXRhS2V5cyhwYXJlbnQsIFApO1xuICAgICAgICAgICAgaWYgKHBhcmVudEtleXMubGVuZ3RoIDw9IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIG93bktleXM7XG4gICAgICAgICAgICBpZiAob3duS2V5cy5sZW5ndGggPD0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50S2V5cztcbiAgICAgICAgICAgIHZhciBzZXQgPSBuZXcgX1NldCgpO1xuICAgICAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgb3duS2V5c18xID0gb3duS2V5czsgX2kgPCBvd25LZXlzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IG93bktleXNfMVtfaV07XG4gICAgICAgICAgICAgICAgdmFyIGhhc0tleSA9IHNldC5oYXMoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc0tleSkge1xuICAgICAgICAgICAgICAgICAgICBzZXQuYWRkKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIF9hID0gMCwgcGFyZW50S2V5c18xID0gcGFyZW50S2V5czsgX2EgPCBwYXJlbnRLZXlzXzEubGVuZ3RoOyBfYSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IHBhcmVudEtleXNfMVtfYV07XG4gICAgICAgICAgICAgICAgdmFyIGhhc0tleSA9IHNldC5oYXMoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc0tleSkge1xuICAgICAgICAgICAgICAgICAgICBzZXQuYWRkKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICB9XG4gICAgICAgIC8vIDMuMS43LjEgT3JkaW5hcnlPd25NZXRhZGF0YUtleXMoTywgUClcbiAgICAgICAgLy8gaHR0cHM6Ly9yYnVja3Rvbi5naXRodWIuaW8vcmVmbGVjdC1tZXRhZGF0YS8jb3JkaW5hcnlvd25tZXRhZGF0YWtleXNcbiAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlPd25NZXRhZGF0YUtleXMoTywgUCkge1xuICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gR2V0TWV0YWRhdGFQcm92aWRlcihPLCBQLCAvKmNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgIGlmICghcHJvdmlkZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXIuT3JkaW5hcnlPd25NZXRhZGF0YUtleXMoTywgUCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNiBFQ01BU2NyaXB0IERhdGEgVHlwZXMgYW5kIFZhbHVlc1xuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1lY21hc2NyaXB0LWRhdGEtdHlwZXMtYW5kLXZhbHVlc1xuICAgICAgICBmdW5jdGlvbiBUeXBlKHgpIHtcbiAgICAgICAgICAgIGlmICh4ID09PSBudWxsKVxuICAgICAgICAgICAgICAgIHJldHVybiAxIC8qIE51bGwgKi87XG4gICAgICAgICAgICBzd2l0Y2ggKHR5cGVvZiB4KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInVuZGVmaW5lZFwiOiByZXR1cm4gMCAvKiBVbmRlZmluZWQgKi87XG4gICAgICAgICAgICAgICAgY2FzZSBcImJvb2xlYW5cIjogcmV0dXJuIDIgLyogQm9vbGVhbiAqLztcbiAgICAgICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6IHJldHVybiAzIC8qIFN0cmluZyAqLztcbiAgICAgICAgICAgICAgICBjYXNlIFwic3ltYm9sXCI6IHJldHVybiA0IC8qIFN5bWJvbCAqLztcbiAgICAgICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6IHJldHVybiA1IC8qIE51bWJlciAqLztcbiAgICAgICAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6IHJldHVybiB4ID09PSBudWxsID8gMSAvKiBOdWxsICovIDogNiAvKiBPYmplY3QgKi87XG4gICAgICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIDYgLyogT2JqZWN0ICovO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIDYuMS4xIFRoZSBVbmRlZmluZWQgVHlwZVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzLXVuZGVmaW5lZC10eXBlXG4gICAgICAgIGZ1bmN0aW9uIElzVW5kZWZpbmVkKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB4ID09PSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNi4xLjIgVGhlIE51bGwgVHlwZVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzLW51bGwtdHlwZVxuICAgICAgICBmdW5jdGlvbiBJc051bGwoeCkge1xuICAgICAgICAgICAgcmV0dXJuIHggPT09IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNi4xLjUgVGhlIFN5bWJvbCBUeXBlXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMtc3ltYm9sLXR5cGVcbiAgICAgICAgZnVuY3Rpb24gSXNTeW1ib2woeCkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSBcInN5bWJvbFwiO1xuICAgICAgICB9XG4gICAgICAgIC8vIDYuMS43IFRoZSBPYmplY3QgVHlwZVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QtdHlwZVxuICAgICAgICBmdW5jdGlvbiBJc09iamVjdCh4KSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHggPT09IFwib2JqZWN0XCIgPyB4ICE9PSBudWxsIDogdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIjtcbiAgICAgICAgfVxuICAgICAgICAvLyA3LjEgVHlwZSBDb252ZXJzaW9uXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXR5cGUtY29udmVyc2lvblxuICAgICAgICAvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9wcmltaXRpdmVcbiAgICAgICAgZnVuY3Rpb24gVG9QcmltaXRpdmUoaW5wdXQsIFByZWZlcnJlZFR5cGUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoVHlwZShpbnB1dCkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDAgLyogVW5kZWZpbmVkICovOiByZXR1cm4gaW5wdXQ7XG4gICAgICAgICAgICAgICAgY2FzZSAxIC8qIE51bGwgKi86IHJldHVybiBpbnB1dDtcbiAgICAgICAgICAgICAgICBjYXNlIDIgLyogQm9vbGVhbiAqLzogcmV0dXJuIGlucHV0O1xuICAgICAgICAgICAgICAgIGNhc2UgMyAvKiBTdHJpbmcgKi86IHJldHVybiBpbnB1dDtcbiAgICAgICAgICAgICAgICBjYXNlIDQgLyogU3ltYm9sICovOiByZXR1cm4gaW5wdXQ7XG4gICAgICAgICAgICAgICAgY2FzZSA1IC8qIE51bWJlciAqLzogcmV0dXJuIGlucHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGhpbnQgPSBQcmVmZXJyZWRUeXBlID09PSAzIC8qIFN0cmluZyAqLyA/IFwic3RyaW5nXCIgOiBQcmVmZXJyZWRUeXBlID09PSA1IC8qIE51bWJlciAqLyA/IFwibnVtYmVyXCIgOiBcImRlZmF1bHRcIjtcbiAgICAgICAgICAgIHZhciBleG90aWNUb1ByaW0gPSBHZXRNZXRob2QoaW5wdXQsIHRvUHJpbWl0aXZlU3ltYm9sKTtcbiAgICAgICAgICAgIGlmIChleG90aWNUb1ByaW0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBleG90aWNUb1ByaW0uY2FsbChpbnB1dCwgaGludCk7XG4gICAgICAgICAgICAgICAgaWYgKElzT2JqZWN0KHJlc3VsdCkpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIE9yZGluYXJ5VG9QcmltaXRpdmUoaW5wdXQsIGhpbnQgPT09IFwiZGVmYXVsdFwiID8gXCJudW1iZXJcIiA6IGhpbnQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuMS4xLjEgT3JkaW5hcnlUb1ByaW1pdGl2ZShPLCBoaW50KVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vcmRpbmFyeXRvcHJpbWl0aXZlXG4gICAgICAgIGZ1bmN0aW9uIE9yZGluYXJ5VG9QcmltaXRpdmUoTywgaGludCkge1xuICAgICAgICAgICAgaWYgKGhpbnQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG9TdHJpbmdfMSA9IE8udG9TdHJpbmc7XG4gICAgICAgICAgICAgICAgaWYgKElzQ2FsbGFibGUodG9TdHJpbmdfMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRvU3RyaW5nXzEuY2FsbChPKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFJc09iamVjdChyZXN1bHQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlT2YgPSBPLnZhbHVlT2Y7XG4gICAgICAgICAgICAgICAgaWYgKElzQ2FsbGFibGUodmFsdWVPZikpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHZhbHVlT2YuY2FsbChPKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFJc09iamVjdChyZXN1bHQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWVPZiA9IE8udmFsdWVPZjtcbiAgICAgICAgICAgICAgICBpZiAoSXNDYWxsYWJsZSh2YWx1ZU9mKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdmFsdWVPZi5jYWxsKE8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHJlc3VsdCkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdG9TdHJpbmdfMiA9IE8udG9TdHJpbmc7XG4gICAgICAgICAgICAgICAgaWYgKElzQ2FsbGFibGUodG9TdHJpbmdfMikpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRvU3RyaW5nXzIuY2FsbChPKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFJc09iamVjdChyZXN1bHQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNy4xLjIgVG9Cb29sZWFuKGFyZ3VtZW50KVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvMjAxNi8jc2VjLXRvYm9vbGVhblxuICAgICAgICBmdW5jdGlvbiBUb0Jvb2xlYW4oYXJndW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiAhIWFyZ3VtZW50O1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuMS4xMiBUb1N0cmluZyhhcmd1bWVudClcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9zdHJpbmdcbiAgICAgICAgZnVuY3Rpb24gVG9TdHJpbmcoYXJndW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiICsgYXJndW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNy4xLjE0IFRvUHJvcGVydHlLZXkoYXJndW1lbnQpXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvcHJvcGVydHlrZXlcbiAgICAgICAgZnVuY3Rpb24gVG9Qcm9wZXJ0eUtleShhcmd1bWVudCkge1xuICAgICAgICAgICAgdmFyIGtleSA9IFRvUHJpbWl0aXZlKGFyZ3VtZW50LCAzIC8qIFN0cmluZyAqLyk7XG4gICAgICAgICAgICBpZiAoSXNTeW1ib2woa2V5KSlcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgICAgcmV0dXJuIFRvU3RyaW5nKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNy4yIFRlc3RpbmcgYW5kIENvbXBhcmlzb24gT3BlcmF0aW9uc1xuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10ZXN0aW5nLWFuZC1jb21wYXJpc29uLW9wZXJhdGlvbnNcbiAgICAgICAgLy8gNy4yLjIgSXNBcnJheShhcmd1bWVudClcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXNhcnJheVxuICAgICAgICBmdW5jdGlvbiBJc0FycmF5KGFyZ3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheVxuICAgICAgICAgICAgICAgID8gQXJyYXkuaXNBcnJheShhcmd1bWVudClcbiAgICAgICAgICAgICAgICA6IGFyZ3VtZW50IGluc3RhbmNlb2YgT2JqZWN0XG4gICAgICAgICAgICAgICAgICAgID8gYXJndW1lbnQgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICA6IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmd1bWVudCkgPT09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgICAgICAgfVxuICAgICAgICAvLyA3LjIuMyBJc0NhbGxhYmxlKGFyZ3VtZW50KVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1pc2NhbGxhYmxlXG4gICAgICAgIGZ1bmN0aW9uIElzQ2FsbGFibGUoYXJndW1lbnQpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgYW4gYXBwcm94aW1hdGlvbiBhcyB3ZSBjYW5ub3QgY2hlY2sgZm9yIFtbQ2FsbF1dIGludGVybmFsIG1ldGhvZC5cbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgYXJndW1lbnQgPT09IFwiZnVuY3Rpb25cIjtcbiAgICAgICAgfVxuICAgICAgICAvLyA3LjIuNCBJc0NvbnN0cnVjdG9yKGFyZ3VtZW50KVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1pc2NvbnN0cnVjdG9yXG4gICAgICAgIGZ1bmN0aW9uIElzQ29uc3RydWN0b3IoYXJndW1lbnQpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgYW4gYXBwcm94aW1hdGlvbiBhcyB3ZSBjYW5ub3QgY2hlY2sgZm9yIFtbQ29uc3RydWN0XV0gaW50ZXJuYWwgbWV0aG9kLlxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBhcmd1bWVudCA9PT0gXCJmdW5jdGlvblwiO1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuMi43IElzUHJvcGVydHlLZXkoYXJndW1lbnQpXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWlzcHJvcGVydHlrZXlcbiAgICAgICAgZnVuY3Rpb24gSXNQcm9wZXJ0eUtleShhcmd1bWVudCkge1xuICAgICAgICAgICAgc3dpdGNoIChUeXBlKGFyZ3VtZW50KSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMyAvKiBTdHJpbmcgKi86IHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNCAvKiBTeW1ib2wgKi86IHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBTYW1lVmFsdWVaZXJvKHgsIHkpIHtcbiAgICAgICAgICAgIHJldHVybiB4ID09PSB5IHx8IHggIT09IHggJiYgeSAhPT0geTtcbiAgICAgICAgfVxuICAgICAgICAvLyA3LjMgT3BlcmF0aW9ucyBvbiBPYmplY3RzXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9wZXJhdGlvbnMtb24tb2JqZWN0c1xuICAgICAgICAvLyA3LjMuOSBHZXRNZXRob2QoViwgUClcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtZ2V0bWV0aG9kXG4gICAgICAgIGZ1bmN0aW9uIEdldE1ldGhvZChWLCBQKSB7XG4gICAgICAgICAgICB2YXIgZnVuYyA9IFZbUF07XG4gICAgICAgICAgICBpZiAoZnVuYyA9PT0gdW5kZWZpbmVkIHx8IGZ1bmMgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICghSXNDYWxsYWJsZShmdW5jKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICByZXR1cm4gZnVuYztcbiAgICAgICAgfVxuICAgICAgICAvLyA3LjQgT3BlcmF0aW9ucyBvbiBJdGVyYXRvciBPYmplY3RzXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9wZXJhdGlvbnMtb24taXRlcmF0b3Itb2JqZWN0c1xuICAgICAgICBmdW5jdGlvbiBHZXRJdGVyYXRvcihvYmopIHtcbiAgICAgICAgICAgIHZhciBtZXRob2QgPSBHZXRNZXRob2Qob2JqLCBpdGVyYXRvclN5bWJvbCk7XG4gICAgICAgICAgICBpZiAoIUlzQ2FsbGFibGUobWV0aG9kKSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7IC8vIGZyb20gQ2FsbFxuICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0gbWV0aG9kLmNhbGwob2JqKTtcbiAgICAgICAgICAgIGlmICghSXNPYmplY3QoaXRlcmF0b3IpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIHJldHVybiBpdGVyYXRvcjtcbiAgICAgICAgfVxuICAgICAgICAvLyA3LjQuNCBJdGVyYXRvclZhbHVlKGl0ZXJSZXN1bHQpXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8yMDE2LyNzZWMtaXRlcmF0b3J2YWx1ZVxuICAgICAgICBmdW5jdGlvbiBJdGVyYXRvclZhbHVlKGl0ZXJSZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVyUmVzdWx0LnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuNC41IEl0ZXJhdG9yU3RlcChpdGVyYXRvcilcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXRlcmF0b3JzdGVwXG4gICAgICAgIGZ1bmN0aW9uIEl0ZXJhdG9yU3RlcChpdGVyYXRvcikge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IGZhbHNlIDogcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWl0ZXJhdG9yY2xvc2VcbiAgICAgICAgZnVuY3Rpb24gSXRlcmF0b3JDbG9zZShpdGVyYXRvcikge1xuICAgICAgICAgICAgdmFyIGYgPSBpdGVyYXRvcltcInJldHVyblwiXTtcbiAgICAgICAgICAgIGlmIChmKVxuICAgICAgICAgICAgICAgIGYuY2FsbChpdGVyYXRvcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gOS4xIE9yZGluYXJ5IE9iamVjdCBJbnRlcm5hbCBNZXRob2RzIGFuZCBJbnRlcm5hbCBTbG90c1xuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vcmRpbmFyeS1vYmplY3QtaW50ZXJuYWwtbWV0aG9kcy1hbmQtaW50ZXJuYWwtc2xvdHNcbiAgICAgICAgLy8gOS4xLjEuMSBPcmRpbmFyeUdldFByb3RvdHlwZU9mKE8pXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9yZGluYXJ5Z2V0cHJvdG90eXBlb2ZcbiAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlHZXRQcm90b3R5cGVPZihPKSB7XG4gICAgICAgICAgICB2YXIgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIE8gIT09IFwiZnVuY3Rpb25cIiB8fCBPID09PSBmdW5jdGlvblByb3RvdHlwZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvdG87XG4gICAgICAgICAgICAvLyBUeXBlU2NyaXB0IGRvZXNuJ3Qgc2V0IF9fcHJvdG9fXyBpbiBFUzUsIGFzIGl0J3Mgbm9uLXN0YW5kYXJkLlxuICAgICAgICAgICAgLy8gVHJ5IHRvIGRldGVybWluZSB0aGUgc3VwZXJjbGFzcyBjb25zdHJ1Y3Rvci4gQ29tcGF0aWJsZSBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgICAgIC8vIG11c3QgZWl0aGVyIHNldCBfX3Byb3RvX18gb24gYSBzdWJjbGFzcyBjb25zdHJ1Y3RvciB0byB0aGUgc3VwZXJjbGFzcyBjb25zdHJ1Y3RvcixcbiAgICAgICAgICAgIC8vIG9yIGVuc3VyZSBlYWNoIGNsYXNzIGhhcyBhIHZhbGlkIGBjb25zdHJ1Y3RvcmAgcHJvcGVydHkgb24gaXRzIHByb3RvdHlwZSB0aGF0XG4gICAgICAgICAgICAvLyBwb2ludHMgYmFjayB0byB0aGUgY29uc3RydWN0b3IuXG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIG5vdCB0aGUgc2FtZSBhcyBGdW5jdGlvbi5bW1Byb3RvdHlwZV1dLCB0aGVuIHRoaXMgaXMgZGVmaW5hdGVseSBpbmhlcml0ZWQuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBjYXNlIHdoZW4gaW4gRVM2IG9yIHdoZW4gdXNpbmcgX19wcm90b19fIGluIGEgY29tcGF0aWJsZSBicm93c2VyLlxuICAgICAgICAgICAgaWYgKHByb3RvICE9PSBmdW5jdGlvblByb3RvdHlwZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvdG87XG4gICAgICAgICAgICAvLyBJZiB0aGUgc3VwZXIgcHJvdG90eXBlIGlzIE9iamVjdC5wcm90b3R5cGUsIG51bGwsIG9yIHVuZGVmaW5lZCwgdGhlbiB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHRoZSBoZXJpdGFnZS5cbiAgICAgICAgICAgIHZhciBwcm90b3R5cGUgPSBPLnByb3RvdHlwZTtcbiAgICAgICAgICAgIHZhciBwcm90b3R5cGVQcm90byA9IHByb3RvdHlwZSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG90eXBlKTtcbiAgICAgICAgICAgIGlmIChwcm90b3R5cGVQcm90byA9PSBudWxsIHx8IHByb3RvdHlwZVByb3RvID09PSBPYmplY3QucHJvdG90eXBlKVxuICAgICAgICAgICAgICAgIHJldHVybiBwcm90bztcbiAgICAgICAgICAgIC8vIElmIHRoZSBjb25zdHJ1Y3RvciB3YXMgbm90IGEgZnVuY3Rpb24sIHRoZW4gd2UgY2Fubm90IGRldGVybWluZSB0aGUgaGVyaXRhZ2UuXG4gICAgICAgICAgICB2YXIgY29uc3RydWN0b3IgPSBwcm90b3R5cGVQcm90by5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc3RydWN0b3IgIT09IFwiZnVuY3Rpb25cIilcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvdG87XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIHNvbWUga2luZCBvZiBzZWxmLXJlZmVyZW5jZSwgdGhlbiB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHRoZSBoZXJpdGFnZS5cbiAgICAgICAgICAgIGlmIChjb25zdHJ1Y3RvciA9PT0gTylcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvdG87XG4gICAgICAgICAgICAvLyB3ZSBoYXZlIGEgcHJldHR5IGdvb2QgZ3Vlc3MgYXQgdGhlIGhlcml0YWdlLlxuICAgICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yO1xuICAgICAgICB9XG4gICAgICAgIC8vIEdsb2JhbCBtZXRhZGF0YSByZWdpc3RyeVxuICAgICAgICAvLyAtIEFsbG93cyBgaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YVwiYCBhbmQgYGltcG9ydCBcInJlZmxlY3QtbWV0YWRhdGEvbm8tY29uZmxpY3RcImAgdG8gaW50ZXJvcGVyYXRlLlxuICAgICAgICAvLyAtIFVzZXMgaXNvbGF0ZWQgbWV0YWRhdGEgaWYgYFJlZmxlY3RgIGlzIGZyb3plbiBiZWZvcmUgdGhlIHJlZ2lzdHJ5IGNhbiBiZSBpbnN0YWxsZWQuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIGEgcmVnaXN0cnkgdXNlZCB0byBhbGxvdyBtdWx0aXBsZSBgcmVmbGVjdC1tZXRhZGF0YWAgcHJvdmlkZXJzLlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gQ3JlYXRlTWV0YWRhdGFSZWdpc3RyeSgpIHtcbiAgICAgICAgICAgIHZhciBmYWxsYmFjaztcbiAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocmVnaXN0cnlTeW1ib2wpICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIHJvb3QuUmVmbGVjdCAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgICAgICAgICAgICEocmVnaXN0cnlTeW1ib2wgaW4gcm9vdC5SZWZsZWN0KSAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiByb290LlJlZmxlY3QuZGVmaW5lTWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIC8vIGludGVyb3BlcmF0ZSB3aXRoIG9sZGVyIHZlcnNpb24gb2YgYHJlZmxlY3QtbWV0YWRhdGFgIHRoYXQgZGlkIG5vdCBzdXBwb3J0IGEgcmVnaXN0cnkuXG4gICAgICAgICAgICAgICAgZmFsbGJhY2sgPSBDcmVhdGVGYWxsYmFja1Byb3ZpZGVyKHJvb3QuUmVmbGVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZmlyc3Q7XG4gICAgICAgICAgICB2YXIgc2Vjb25kO1xuICAgICAgICAgICAgdmFyIHJlc3Q7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0UHJvdmlkZXJNYXAgPSBuZXcgX1dlYWtNYXAoKTtcbiAgICAgICAgICAgIHZhciByZWdpc3RyeSA9IHtcbiAgICAgICAgICAgICAgICByZWdpc3RlclByb3ZpZGVyOiByZWdpc3RlclByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIGdldFByb3ZpZGVyOiBnZXRQcm92aWRlcixcbiAgICAgICAgICAgICAgICBzZXRQcm92aWRlcjogc2V0UHJvdmlkZXIsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHJlZ2lzdHJ5O1xuICAgICAgICAgICAgZnVuY3Rpb24gcmVnaXN0ZXJQcm92aWRlcihwcm92aWRlcikge1xuICAgICAgICAgICAgICAgIGlmICghT2JqZWN0LmlzRXh0ZW5zaWJsZShyZWdpc3RyeSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGFkZCBwcm92aWRlciB0byBhIGZyb3plbiByZWdpc3RyeS5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGZhbGxiYWNrID09PSBwcm92aWRlcjogYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgSXNVbmRlZmluZWQoZmlyc3QpOlxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSBwcm92aWRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGZpcnN0ID09PSBwcm92aWRlcjogYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgSXNVbmRlZmluZWQoc2Vjb25kKTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY29uZCA9IHByb3ZpZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2Ugc2Vjb25kID09PSBwcm92aWRlcjogYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3QgPSBuZXcgX1NldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdC5hZGQocHJvdmlkZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0UHJvdmlkZXJOb0NhY2hlKE8sIFApIHtcbiAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKGZpcnN0KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlyc3QuaXNQcm92aWRlckZvcihPLCBQKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaXJzdDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChzZWNvbmQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2Vjb25kLmlzUHJvdmlkZXJGb3IoTywgUCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpcnN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChyZXN0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IEdldEl0ZXJhdG9yKHJlc3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwcm92aWRlciA9IEl0ZXJhdG9yVmFsdWUobmV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm92aWRlci5pc1Byb3ZpZGVyRm9yKE8sIFApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm92aWRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKGZhbGxiYWNrKSAmJiBmYWxsYmFjay5pc1Byb3ZpZGVyRm9yKE8sIFApKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxsYmFjaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldFByb3ZpZGVyKE8sIFApIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXJNYXAgPSB0YXJnZXRQcm92aWRlck1hcC5nZXQoTyk7XG4gICAgICAgICAgICAgICAgdmFyIHByb3ZpZGVyO1xuICAgICAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvdmlkZXJNYXApKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyID0gcHJvdmlkZXJNYXAuZ2V0KFApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3ZpZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb3ZpZGVyID0gZ2V0UHJvdmlkZXJOb0NhY2hlKE8sIFApO1xuICAgICAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvdmlkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChJc1VuZGVmaW5lZChwcm92aWRlck1hcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyTWFwID0gbmV3IF9NYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3ZpZGVyTWFwLnNldChPLCBwcm92aWRlck1hcCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJNYXAuc2V0KFAsIHByb3ZpZGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaGFzUHJvdmlkZXIocHJvdmlkZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQocHJvdmlkZXIpKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpcnN0ID09PSBwcm92aWRlciB8fCBzZWNvbmQgPT09IHByb3ZpZGVyIHx8ICFJc1VuZGVmaW5lZChyZXN0KSAmJiByZXN0Lmhhcyhwcm92aWRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBzZXRQcm92aWRlcihPLCBQLCBwcm92aWRlcikge1xuICAgICAgICAgICAgICAgIGlmICghaGFzUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGFkYXRhIHByb3ZpZGVyIG5vdCByZWdpc3RlcmVkLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGV4aXN0aW5nUHJvdmlkZXIgPSBnZXRQcm92aWRlcihPLCBQKTtcbiAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmdQcm92aWRlciAhPT0gcHJvdmlkZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChleGlzdGluZ1Byb3ZpZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm92aWRlck1hcCA9IHRhcmdldFByb3ZpZGVyTWFwLmdldChPKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKElzVW5kZWZpbmVkKHByb3ZpZGVyTWFwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJNYXAgPSBuZXcgX01hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvdmlkZXJNYXAuc2V0KE8sIHByb3ZpZGVyTWFwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlck1hcC5zZXQoUCwgcHJvdmlkZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0cyBvciBjcmVhdGVzIHRoZSBzaGFyZWQgcmVnaXN0cnkgb2YgbWV0YWRhdGEgcHJvdmlkZXJzLlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gR2V0T3JDcmVhdGVNZXRhZGF0YVJlZ2lzdHJ5KCkge1xuICAgICAgICAgICAgdmFyIG1ldGFkYXRhUmVnaXN0cnk7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHJlZ2lzdHJ5U3ltYm9sKSAmJiBJc09iamVjdChyb290LlJlZmxlY3QpICYmIE9iamVjdC5pc0V4dGVuc2libGUocm9vdC5SZWZsZWN0KSkge1xuICAgICAgICAgICAgICAgIG1ldGFkYXRhUmVnaXN0cnkgPSByb290LlJlZmxlY3RbcmVnaXN0cnlTeW1ib2xdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKElzVW5kZWZpbmVkKG1ldGFkYXRhUmVnaXN0cnkpKSB7XG4gICAgICAgICAgICAgICAgbWV0YWRhdGFSZWdpc3RyeSA9IENyZWF0ZU1ldGFkYXRhUmVnaXN0cnkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocmVnaXN0cnlTeW1ib2wpICYmIElzT2JqZWN0KHJvb3QuUmVmbGVjdCkgJiYgT2JqZWN0LmlzRXh0ZW5zaWJsZShyb290LlJlZmxlY3QpKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJvb3QuUmVmbGVjdCwgcmVnaXN0cnlTeW1ib2wsIHtcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG1ldGFkYXRhUmVnaXN0cnlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZXRhZGF0YVJlZ2lzdHJ5O1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIENyZWF0ZU1ldGFkYXRhUHJvdmlkZXIocmVnaXN0cnkpIHtcbiAgICAgICAgICAgIC8vIFtbTWV0YWRhdGFdXSBpbnRlcm5hbCBzbG90XG4gICAgICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeS1vYmplY3QtaW50ZXJuYWwtbWV0aG9kcy1hbmQtaW50ZXJuYWwtc2xvdHNcbiAgICAgICAgICAgIHZhciBtZXRhZGF0YSA9IG5ldyBfV2Vha01hcCgpO1xuICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0ge1xuICAgICAgICAgICAgICAgIGlzUHJvdmlkZXJGb3I6IGZ1bmN0aW9uIChPLCBQKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXRNZXRhZGF0YSA9IG1ldGFkYXRhLmdldChPKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKElzVW5kZWZpbmVkKHRhcmdldE1ldGFkYXRhKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldE1ldGFkYXRhLmhhcyhQKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIE9yZGluYXJ5RGVmaW5lT3duTWV0YWRhdGE6IE9yZGluYXJ5RGVmaW5lT3duTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgT3JkaW5hcnlIYXNPd25NZXRhZGF0YTogT3JkaW5hcnlIYXNPd25NZXRhZGF0YSxcbiAgICAgICAgICAgICAgICBPcmRpbmFyeUdldE93bk1ldGFkYXRhOiBPcmRpbmFyeUdldE93bk1ldGFkYXRhLFxuICAgICAgICAgICAgICAgIE9yZGluYXJ5T3duTWV0YWRhdGFLZXlzOiBPcmRpbmFyeU93bk1ldGFkYXRhS2V5cyxcbiAgICAgICAgICAgICAgICBPcmRpbmFyeURlbGV0ZU1ldGFkYXRhOiBPcmRpbmFyeURlbGV0ZU1ldGFkYXRhLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1ldGFkYXRhUmVnaXN0cnkucmVnaXN0ZXJQcm92aWRlcihwcm92aWRlcik7XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgICAgICBmdW5jdGlvbiBHZXRPckNyZWF0ZU1ldGFkYXRhTWFwKE8sIFAsIENyZWF0ZSkge1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXRNZXRhZGF0YSA9IG1ldGFkYXRhLmdldChPKTtcbiAgICAgICAgICAgICAgICB2YXIgY3JlYXRlZFRhcmdldE1ldGFkYXRhID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKElzVW5kZWZpbmVkKHRhcmdldE1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldE1ldGFkYXRhID0gbmV3IF9NYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEuc2V0KE8sIHRhcmdldE1ldGFkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZFRhcmdldE1ldGFkYXRhID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIG1ldGFkYXRhTWFwID0gdGFyZ2V0TWV0YWRhdGEuZ2V0KFApO1xuICAgICAgICAgICAgICAgIGlmIChJc1VuZGVmaW5lZChtZXRhZGF0YU1hcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFDcmVhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YU1hcCA9IG5ldyBfTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldE1ldGFkYXRhLnNldChQLCBtZXRhZGF0YU1hcCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVnaXN0cnkuc2V0UHJvdmlkZXIoTywgUCwgcHJvdmlkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNZXRhZGF0YS5kZWxldGUoUCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3JlYXRlZFRhcmdldE1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEuZGVsZXRlKE8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV3JvbmcgcHJvdmlkZXIgZm9yIHRhcmdldC5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGFkYXRhTWFwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gMy4xLjIuMSBPcmRpbmFyeUhhc093bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKVxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9yYnVja3Rvbi5naXRodWIuaW8vcmVmbGVjdC1tZXRhZGF0YS8jb3JkaW5hcnloYXNvd25tZXRhZGF0YVxuICAgICAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlIYXNPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTywgUCkge1xuICAgICAgICAgICAgICAgIHZhciBtZXRhZGF0YU1hcCA9IEdldE9yQ3JlYXRlTWV0YWRhdGFNYXAoTywgUCwgLypDcmVhdGUqLyBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKElzVW5kZWZpbmVkKG1ldGFkYXRhTWFwKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBUb0Jvb2xlYW4obWV0YWRhdGFNYXAuaGFzKE1ldGFkYXRhS2V5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAzLjEuNC4xIE9yZGluYXJ5R2V0T3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApXG4gICAgICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeWdldG93bm1ldGFkYXRhXG4gICAgICAgICAgICBmdW5jdGlvbiBPcmRpbmFyeUdldE93bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1ldGFkYXRhTWFwID0gR2V0T3JDcmVhdGVNZXRhZGF0YU1hcChPLCBQLCAvKkNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQobWV0YWRhdGFNYXApKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXRhZGF0YU1hcC5nZXQoTWV0YWRhdGFLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gMy4xLjUuMSBPcmRpbmFyeURlZmluZU93bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBNZXRhZGF0YVZhbHVlLCBPLCBQKVxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9yYnVja3Rvbi5naXRodWIuaW8vcmVmbGVjdC1tZXRhZGF0YS8jb3JkaW5hcnlkZWZpbmVvd25tZXRhZGF0YVxuICAgICAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlEZWZpbmVPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTWV0YWRhdGFWYWx1ZSwgTywgUCkge1xuICAgICAgICAgICAgICAgIHZhciBtZXRhZGF0YU1hcCA9IEdldE9yQ3JlYXRlTWV0YWRhdGFNYXAoTywgUCwgLypDcmVhdGUqLyB0cnVlKTtcbiAgICAgICAgICAgICAgICBtZXRhZGF0YU1hcC5zZXQoTWV0YWRhdGFLZXksIE1ldGFkYXRhVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gMy4xLjcuMSBPcmRpbmFyeU93bk1ldGFkYXRhS2V5cyhPLCBQKVxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9yYnVja3Rvbi5naXRodWIuaW8vcmVmbGVjdC1tZXRhZGF0YS8jb3JkaW5hcnlvd25tZXRhZGF0YWtleXNcbiAgICAgICAgICAgIGZ1bmN0aW9uIE9yZGluYXJ5T3duTWV0YWRhdGFLZXlzKE8sIFApIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5cyA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBtZXRhZGF0YU1hcCA9IEdldE9yQ3JlYXRlTWV0YWRhdGFNYXAoTywgUCwgLypDcmVhdGUqLyBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKElzVW5kZWZpbmVkKG1ldGFkYXRhTWFwKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICAgICAgICAgICAgdmFyIGtleXNPYmogPSBtZXRhZGF0YU1hcC5rZXlzKCk7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0gR2V0SXRlcmF0b3Ioa2V5c09iaik7XG4gICAgICAgICAgICAgICAgdmFyIGsgPSAwO1xuICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlzLmxlbmd0aCA9IGs7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dFZhbHVlID0gSXRlcmF0b3JWYWx1ZShuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXNba10gPSBuZXh0VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGsrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBPcmRpbmFyeURlbGV0ZU1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1ldGFkYXRhTWFwID0gR2V0T3JDcmVhdGVNZXRhZGF0YU1hcChPLCBQLCAvKkNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQobWV0YWRhdGFNYXApKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCFtZXRhZGF0YU1hcC5kZWxldGUoTWV0YWRhdGFLZXkpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKG1ldGFkYXRhTWFwLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldE1ldGFkYXRhID0gbWV0YWRhdGEuZ2V0KE8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHRhcmdldE1ldGFkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWV0YWRhdGEuZGVsZXRlKFApO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldE1ldGFkYXRhLnNpemUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YS5kZWxldGUodGFyZ2V0TWV0YWRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIENyZWF0ZUZhbGxiYWNrUHJvdmlkZXIocmVmbGVjdCkge1xuICAgICAgICAgICAgdmFyIGRlZmluZU1ldGFkYXRhID0gcmVmbGVjdC5kZWZpbmVNZXRhZGF0YSwgaGFzT3duTWV0YWRhdGEgPSByZWZsZWN0Lmhhc093bk1ldGFkYXRhLCBnZXRPd25NZXRhZGF0YSA9IHJlZmxlY3QuZ2V0T3duTWV0YWRhdGEsIGdldE93bk1ldGFkYXRhS2V5cyA9IHJlZmxlY3QuZ2V0T3duTWV0YWRhdGFLZXlzLCBkZWxldGVNZXRhZGF0YSA9IHJlZmxlY3QuZGVsZXRlTWV0YWRhdGE7XG4gICAgICAgICAgICB2YXIgbWV0YWRhdGFPd25lciA9IG5ldyBfV2Vha01hcCgpO1xuICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0ge1xuICAgICAgICAgICAgICAgIGlzUHJvdmlkZXJGb3I6IGZ1bmN0aW9uIChPLCBQKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtZXRhZGF0YVByb3BlcnR5U2V0ID0gbWV0YWRhdGFPd25lci5nZXQoTyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQobWV0YWRhdGFQcm9wZXJ0eVNldCkgJiYgbWV0YWRhdGFQcm9wZXJ0eVNldC5oYXMoUCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRPd25NZXRhZGF0YUtleXMoTywgUCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQobWV0YWRhdGFQcm9wZXJ0eVNldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YVByb3BlcnR5U2V0ID0gbmV3IF9TZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YU93bmVyLnNldChPLCBtZXRhZGF0YVByb3BlcnR5U2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhUHJvcGVydHlTZXQuYWRkKFApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgT3JkaW5hcnlEZWZpbmVPd25NZXRhZGF0YTogZGVmaW5lTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgT3JkaW5hcnlIYXNPd25NZXRhZGF0YTogaGFzT3duTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgT3JkaW5hcnlHZXRPd25NZXRhZGF0YTogZ2V0T3duTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgT3JkaW5hcnlPd25NZXRhZGF0YUtleXM6IGdldE93bk1ldGFkYXRhS2V5cyxcbiAgICAgICAgICAgICAgICBPcmRpbmFyeURlbGV0ZU1ldGFkYXRhOiBkZWxldGVNZXRhZGF0YSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldHMgdGhlIG1ldGFkYXRhIHByb3ZpZGVyIGZvciBhbiBvYmplY3QuIElmIHRoZSBvYmplY3QgaGFzIG5vIG1ldGFkYXRhIHByb3ZpZGVyIGFuZCB0aGlzIGlzIGZvciBhIGNyZWF0ZSBvcGVyYXRpb24sXG4gICAgICAgICAqIHRoZW4gdGhpcyBtb2R1bGUncyBtZXRhZGF0YSBwcm92aWRlciBpcyBhc3NpZ25lZCB0byB0aGUgb2JqZWN0LlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gR2V0TWV0YWRhdGFQcm92aWRlcihPLCBQLCBDcmVhdGUpIHtcbiAgICAgICAgICAgIHZhciByZWdpc3RlcmVkUHJvdmlkZXIgPSBtZXRhZGF0YVJlZ2lzdHJ5LmdldFByb3ZpZGVyKE8sIFApO1xuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChyZWdpc3RlcmVkUHJvdmlkZXIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lzdGVyZWRQcm92aWRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChDcmVhdGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobWV0YWRhdGFSZWdpc3RyeS5zZXRQcm92aWRlcihPLCBQLCBtZXRhZGF0YVByb3ZpZGVyKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWV0YWRhdGFQcm92aWRlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSWxsZWdhbCBzdGF0ZS5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5haXZlIE1hcCBzaGltXG4gICAgICAgIGZ1bmN0aW9uIENyZWF0ZU1hcFBvbHlmaWxsKCkge1xuICAgICAgICAgICAgdmFyIGNhY2hlU2VudGluZWwgPSB7fTtcbiAgICAgICAgICAgIHZhciBhcnJheVNlbnRpbmVsID0gW107XG4gICAgICAgICAgICB2YXIgTWFwSXRlcmF0b3IgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gTWFwSXRlcmF0b3Ioa2V5cywgdmFsdWVzLCBzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleXMgPSBrZXlzO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE1hcEl0ZXJhdG9yLnByb3RvdHlwZVtcIkBAaXRlcmF0b3JcIl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9O1xuICAgICAgICAgICAgICAgIE1hcEl0ZXJhdG9yLnByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9O1xuICAgICAgICAgICAgICAgIE1hcEl0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9pbmRleDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLl9rZXlzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX3NlbGVjdG9yKHRoaXMuX2tleXNbaW5kZXhdLCB0aGlzLl92YWx1ZXNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCArIDEgPj0gdGhpcy5fa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleXMgPSBhcnJheVNlbnRpbmVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlcyA9IGFycmF5U2VudGluZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHJlc3VsdCwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBNYXBJdGVyYXRvci5wcm90b3R5cGUudGhyb3cgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2luZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9rZXlzID0gYXJyYXlTZW50aW5lbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlcyA9IGFycmF5U2VudGluZWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBNYXBJdGVyYXRvci5wcm90b3R5cGUucmV0dXJuID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cyA9IGFycmF5U2VudGluZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXMgPSBhcnJheVNlbnRpbmVsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZG9uZTogdHJ1ZSB9O1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hcEl0ZXJhdG9yO1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgICAgIHZhciBNYXAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gTWFwKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9rZXlzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZUtleSA9IGNhY2hlU2VudGluZWw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlSW5kZXggPSAtMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE1hcC5wcm90b3R5cGUsIFwic2l6ZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5fa2V5cy5sZW5ndGg7IH0sXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIE1hcC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gdGhpcy5fZmluZChrZXksIC8qaW5zZXJ0Ki8gZmFsc2UpID49IDA7IH07XG4gICAgICAgICAgICAgICAgTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2ZpbmQoa2V5LCAvKmluc2VydCovIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ID49IDAgPyB0aGlzLl92YWx1ZXNbaW5kZXhdIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kKGtleSwgLyppbnNlcnQqLyB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIE1hcC5wcm90b3R5cGUuZGVsZXRlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kKGtleSwgLyppbnNlcnQqLyBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuX2tleXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IGluZGV4ICsgMTsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleXNbaSAtIDFdID0gdGhpcy5fa2V5c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXNbaSAtIDFdID0gdGhpcy5fdmFsdWVzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5sZW5ndGgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlcy5sZW5ndGgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChTYW1lVmFsdWVaZXJvKGtleSwgdGhpcy5fY2FjaGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVLZXkgPSBjYWNoZVNlbnRpbmVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlSW5kZXggPSAtMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIE1hcC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleXMubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlS2V5ID0gY2FjaGVTZW50aW5lbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVJbmRleCA9IC0yO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgTWFwLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IE1hcEl0ZXJhdG9yKHRoaXMuX2tleXMsIHRoaXMuX3ZhbHVlcywgZ2V0S2V5KTsgfTtcbiAgICAgICAgICAgICAgICBNYXAucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNYXBJdGVyYXRvcih0aGlzLl9rZXlzLCB0aGlzLl92YWx1ZXMsIGdldFZhbHVlKTsgfTtcbiAgICAgICAgICAgICAgICBNYXAucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcy5fa2V5cywgdGhpcy5fdmFsdWVzLCBnZXRFbnRyeSk7IH07XG4gICAgICAgICAgICAgICAgTWFwLnByb3RvdHlwZVtcIkBAaXRlcmF0b3JcIl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmVudHJpZXMoKTsgfTtcbiAgICAgICAgICAgICAgICBNYXAucHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZW50cmllcygpOyB9O1xuICAgICAgICAgICAgICAgIE1hcC5wcm90b3R5cGUuX2ZpbmQgPSBmdW5jdGlvbiAoa2V5LCBpbnNlcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFTYW1lVmFsdWVaZXJvKHRoaXMuX2NhY2hlS2V5LCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZUluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2tleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoU2FtZVZhbHVlWmVybyh0aGlzLl9rZXlzW2ldLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlSW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2NhY2hlSW5kZXggPCAwICYmIGluc2VydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVJbmRleCA9IHRoaXMuX2tleXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYWNoZUluZGV4O1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hcDtcbiAgICAgICAgICAgIH0oKSk7XG4gICAgICAgICAgICByZXR1cm4gTWFwO1xuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0S2V5KGtleSwgXykge1xuICAgICAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRWYWx1ZShfLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldEVudHJ5KGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2tleSwgdmFsdWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIG5haXZlIFNldCBzaGltXG4gICAgICAgIGZ1bmN0aW9uIENyZWF0ZVNldFBvbHlmaWxsKCkge1xuICAgICAgICAgICAgdmFyIFNldCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBTZXQoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21hcCA9IG5ldyBfTWFwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTZXQucHJvdG90eXBlLCBcInNpemVcIiwge1xuICAgICAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX21hcC5zaXplOyB9LFxuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBTZXQucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdGhpcy5fbWFwLmhhcyh2YWx1ZSk7IH07XG4gICAgICAgICAgICAgICAgU2V0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIHRoaXMuX21hcC5zZXQodmFsdWUsIHZhbHVlKSwgdGhpczsgfTtcbiAgICAgICAgICAgICAgICBTZXQucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdGhpcy5fbWFwLmRlbGV0ZSh2YWx1ZSk7IH07XG4gICAgICAgICAgICAgICAgU2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHsgdGhpcy5fbWFwLmNsZWFyKCk7IH07XG4gICAgICAgICAgICAgICAgU2V0LnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5fbWFwLmtleXMoKTsgfTtcbiAgICAgICAgICAgICAgICBTZXQucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuX21hcC5rZXlzKCk7IH07XG4gICAgICAgICAgICAgICAgU2V0LnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5fbWFwLmVudHJpZXMoKTsgfTtcbiAgICAgICAgICAgICAgICBTZXQucHJvdG90eXBlW1wiQEBpdGVyYXRvclwiXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMua2V5cygpOyB9O1xuICAgICAgICAgICAgICAgIFNldC5wcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5rZXlzKCk7IH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIFNldDtcbiAgICAgICAgICAgIH0oKSk7XG4gICAgICAgICAgICByZXR1cm4gU2V0O1xuICAgICAgICB9XG4gICAgICAgIC8vIG5haXZlIFdlYWtNYXAgc2hpbVxuICAgICAgICBmdW5jdGlvbiBDcmVhdGVXZWFrTWFwUG9seWZpbGwoKSB7XG4gICAgICAgICAgICB2YXIgVVVJRF9TSVpFID0gMTY7XG4gICAgICAgICAgICB2YXIga2V5cyA9IEhhc2hNYXAuY3JlYXRlKCk7XG4gICAgICAgICAgICB2YXIgcm9vdEtleSA9IENyZWF0ZVVuaXF1ZUtleSgpO1xuICAgICAgICAgICAgcmV0dXJuIC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBXZWFrTWFwKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9rZXkgPSBDcmVhdGVVbmlxdWVLZXkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgV2Vha01hcC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFibGUgPSBHZXRPckNyZWF0ZVdlYWtNYXBUYWJsZSh0YXJnZXQsIC8qY3JlYXRlKi8gZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFibGUgIT09IHVuZGVmaW5lZCA/IEhhc2hNYXAuaGFzKHRhYmxlLCB0aGlzLl9rZXkpIDogZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBXZWFrTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YWJsZSA9IEdldE9yQ3JlYXRlV2Vha01hcFRhYmxlKHRhcmdldCwgLypjcmVhdGUqLyBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJsZSAhPT0gdW5kZWZpbmVkID8gSGFzaE1hcC5nZXQodGFibGUsIHRoaXMuX2tleSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBXZWFrTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodGFyZ2V0LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFibGUgPSBHZXRPckNyZWF0ZVdlYWtNYXBUYWJsZSh0YXJnZXQsIC8qY3JlYXRlKi8gdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRhYmxlW3RoaXMuX2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBXZWFrTWFwLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YWJsZSA9IEdldE9yQ3JlYXRlV2Vha01hcFRhYmxlKHRhcmdldCwgLypjcmVhdGUqLyBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJsZSAhPT0gdW5kZWZpbmVkID8gZGVsZXRlIHRhYmxlW3RoaXMuX2tleV0gOiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFdlYWtNYXAucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBub3QgYSByZWFsIGNsZWFyLCBqdXN0IG1ha2VzIHRoZSBwcmV2aW91cyBkYXRhIHVucmVhY2hhYmxlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleSA9IENyZWF0ZVVuaXF1ZUtleSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIFdlYWtNYXA7XG4gICAgICAgICAgICB9KCkpO1xuICAgICAgICAgICAgZnVuY3Rpb24gQ3JlYXRlVW5pcXVlS2V5KCkge1xuICAgICAgICAgICAgICAgIHZhciBrZXk7XG4gICAgICAgICAgICAgICAgZG9cbiAgICAgICAgICAgICAgICAgICAga2V5ID0gXCJAQFdlYWtNYXBAQFwiICsgQ3JlYXRlVVVJRCgpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChIYXNoTWFwLmhhcyhrZXlzLCBrZXkpKTtcbiAgICAgICAgICAgICAgICBrZXlzW2tleV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBHZXRPckNyZWF0ZVdlYWtNYXBUYWJsZSh0YXJnZXQsIGNyZWF0ZSkge1xuICAgICAgICAgICAgICAgIGlmICghaGFzT3duLmNhbGwodGFyZ2V0LCByb290S2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHJvb3RLZXksIHsgdmFsdWU6IEhhc2hNYXAuY3JlYXRlKCkgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcm9vdEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBGaWxsUmFuZG9tQnl0ZXMoYnVmZmVyLCBzaXplKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyArK2kpXG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlcltpXSA9IE1hdGgucmFuZG9tKCkgKiAweGZmIHwgMDtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gR2VuUmFuZG9tQnl0ZXMoc2l6ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgVWludDhBcnJheSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcnJheSA9IG5ldyBVaW50OEFycmF5KHNpemUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNyeXB0byAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIG1zQ3J5cHRvICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMoYXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgRmlsbFJhbmRvbUJ5dGVzKGFycmF5LCBzaXplKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBGaWxsUmFuZG9tQnl0ZXMobmV3IEFycmF5KHNpemUpLCBzaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIENyZWF0ZVVVSUQoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBHZW5SYW5kb21CeXRlcyhVVUlEX1NJWkUpO1xuICAgICAgICAgICAgICAgIC8vIG1hcmsgYXMgcmFuZG9tIC0gUkZDIDQxMjIgwqcgNC40XG4gICAgICAgICAgICAgICAgZGF0YVs2XSA9IGRhdGFbNl0gJiAweDRmIHwgMHg0MDtcbiAgICAgICAgICAgICAgICBkYXRhWzhdID0gZGF0YVs4XSAmIDB4YmYgfCAweDgwO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG9mZnNldCA9IDA7IG9mZnNldCA8IFVVSURfU0laRTsgKytvZmZzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJ5dGUgPSBkYXRhW29mZnNldF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChvZmZzZXQgPT09IDQgfHwgb2Zmc2V0ID09PSA2IHx8IG9mZnNldCA9PT0gOClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIi1cIjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJ5dGUgPCAxNilcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBcIjBcIjtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGJ5dGUudG9TdHJpbmcoMTYpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gdXNlcyBhIGhldXJpc3RpYyB1c2VkIGJ5IHY4IGFuZCBjaGFrcmEgdG8gZm9yY2UgYW4gb2JqZWN0IGludG8gZGljdGlvbmFyeSBtb2RlLlxuICAgICAgICBmdW5jdGlvbiBNYWtlRGljdGlvbmFyeShvYmopIHtcbiAgICAgICAgICAgIG9iai5fXyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouX187XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG4gICAgfSk7XG59KShSZWZsZWN0IHx8IChSZWZsZWN0ID0ge30pKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImV4cG9ydCAqIGZyb20gJy4vbW9kdWxlcyc7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=