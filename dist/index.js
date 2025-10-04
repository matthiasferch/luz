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
// Express the threshold via a slope angle in degrees for easier tuning.
const groundMaxSlopeDegrees = 45; // degrees
const groundMinNormalY = Math.cos((groundMaxSlopeDegrees * Math.PI) / 180);
// Allow larger per-step separation for dynamic pairs involving a Biped
// (applied to the non-biped body), to reduce tunneling.
const bipedDynamicCorrectionPerStep = 0.02;
// Step climbing tuning
const bipedStepHeight = 0.02; // max height that can be stepped onto
const bipedStepNormalMaxY = 0.2; // consider near-vertical faces only
const bipedStepMinSpeed = 0.25; // require some forward motion
const bipedStepUpBias = 1.5; // how strongly to bias correction upward
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
            // Biped step handling against static geometry: if the biped hits a near-vertical
            // face within step height while moving forward and is grounded, bias the correction
            // upward to allow stepping onto the obstacle instead of just pushing back.
            if (!b2 && b1IsBiped) {
                const biped = b1;
                // Use horizontal movement direction as intent
                const horizVelocity = new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3([b1.linearVelocity.x, 0, b1.linearVelocity.z]);
                const horizSpeed = horizVelocity.length;
                const facingIntoWall = horizSpeed > 0
                    ? _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.dot(horizVelocity.normalize(), _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(chosenNormal, -1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3())) > 0.25
                    : false;
                // Compute contact height relative to the biped's bottom if we can
                let isWithinStepHeight = false;
                const vol = b1.volume;
                if (vol) {
                    let bottomY = null;
                    if (vol.type === 'Cuboid' && vol.extents) {
                        bottomY = b1.volume.center.y - vol.extents.y;
                    }
                    else if (vol.type === 'Sphere' && typeof vol.radius === 'number') {
                        bottomY = b1.volume.center.y - vol.radius;
                    }
                    else if (vol.type === 'Ellipsoid' && typeof vol.effectiveRadius === 'function') {
                        // Use effective radius along world up direction
                        bottomY = b1.volume.center.y - vol.effectiveRadius(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.up);
                    }
                    if (bottomY !== null) {
                        const contactHeightAboveBottom = chosenContact.y - bottomY;
                        isWithinStepHeight = contactHeightAboveBottom >= -1e-3 && contactHeightAboveBottom <= bipedStepHeight;
                    }
                }
                if (biped.onGround &&
                    chosenNormal.y <= bipedStepNormalMaxY &&
                    horizSpeed >= bipedStepMinSpeed &&
                    facingIntoWall &&
                    isWithinStepHeight) {
                    // Blend the normal upward. Stronger bias when step is small.
                    const vol = b1.volume;
                    let weight = 1.0;
                    if (vol) {
                        let bottomY = null;
                        if (vol.type === 'Cuboid' && vol.extents) {
                            bottomY = b1.volume.center.y - vol.extents.y;
                        }
                        else if (vol.type === 'Sphere' && typeof vol.radius === 'number') {
                            bottomY = b1.volume.center.y - vol.radius;
                        }
                        else if (vol.type === 'Ellipsoid' && typeof vol.effectiveRadius === 'function') {
                            bottomY = b1.volume.center.y - vol.effectiveRadius(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.up);
                        }
                        if (bottomY !== null) {
                            const h = Math.max(0, Math.min(bipedStepHeight, chosenContact.y - bottomY));
                            weight = 1.0 + bipedStepUpBias * (1.0 - h / bipedStepHeight);
                        }
                        else {
                            weight = 1.0 + bipedStepUpBias * 0.5;
                        }
                    }
                    else {
                        weight = 1.0 + bipedStepUpBias * 0.5;
                    }
                    const stepped = _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.add(chosenNormal, _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.scale(_luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3.up, weight, new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_2__.vec3()).normalize();
                    chosenNormal = stepped;
                }
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
/* harmony export */   Ellipsoid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.Ellipsoid),
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
/* harmony export */   collideEllipsoidWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideEllipsoidWithCuboid),
/* harmony export */   collidePlaneWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePlaneWithCuboid),
/* harmony export */   collidePlaneWithEllipsoid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePlaneWithEllipsoid),
/* harmony export */   collidePlaneWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePlaneWithSphere),
/* harmony export */   collidePolygonWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePolygonWithCuboid),
/* harmony export */   collidePolygonWithEllipsoid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePolygonWithEllipsoid),
/* harmony export */   collidePolygonWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collidePolygonWithSphere),
/* harmony export */   collideRayWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithCuboid),
/* harmony export */   collideRayWithEllipsoid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithEllipsoid),
/* harmony export */   collideRayWithPlane: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithPlane),
/* harmony export */   collideRayWithRay: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithRay),
/* harmony export */   collideRayWithSphere: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideRayWithSphere),
/* harmony export */   collideSphereWithCuboid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideSphereWithCuboid),
/* harmony export */   collideSphereWithEllipsoid: () => (/* reexport safe */ _physics__WEBPACK_IMPORTED_MODULE_2__.collideSphereWithEllipsoid),
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

/***/ "./modules/physics/collisions/ellipsoid/cuboid.ts":
/*!********************************************************!*\
  !*** ./modules/physics/collisions/ellipsoid/cuboid.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideEllipsoidWithCuboid: () => (/* binding */ collideEllipsoidWithCuboid)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const EPS = 1e-6;
// Exact via transform to unit sphere and triangle distance
function collideEllipsoidWithCuboid(ellipsoid, cuboid) {
    const c = ellipsoid.center;
    const ux = ellipsoid.axes[0];
    const uy = ellipsoid.axes[1];
    const uz = ellipsoid.axes[2];
    const { x: a, y: b, z: cr } = ellipsoid.radii;
    const toScaled = (p, out = new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()) => {
        const r = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, c, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        out.x = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(r, ux) / a;
        out.y = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(r, uy) / b;
        out.z = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(r, uz) / cr;
        return out;
    };
    const toWorld = (pS, out = new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()) => {
        return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ux, a * pS.x, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uy, b * pS.y, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uz, cr * pS.z, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), out);
    };
    // Transform cuboid vertices to scaled space
    const vWorld = cuboid.getVertices();
    const vS = vWorld.map((v) => toScaled(v));
    // Faces as quads, then triangulate ([i0,i1,i2], [i0,i2,i3])
    const faces = [
        [0, 1, 3, 2],
        [4, 5, 7, 6],
        [0, 1, 5, 4],
        [2, 3, 7, 6],
        [0, 2, 6, 4],
        [1, 3, 7, 5] // -Z
    ];
    const triIndices = [];
    faces.forEach(([i0, i1, i2, i3]) => {
        triIndices.push([i0, i1, i2], [i0, i2, i3]);
    });
    const originS = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero;
    let minDist2 = Infinity;
    let bestClosest = new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3();
    const closestPointOnTri = (p, a, b, c) => {
        const ab = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(b, a, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const ac = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, a, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const ap = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, a, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const d1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ab, ap);
        const d2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ac, ap);
        if (d1 <= 0 && d2 <= 0)
            return a.copy();
        const bp = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, b, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const d3 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ab, bp);
        const d4 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ac, bp);
        if (d3 >= 0 && d4 <= d3)
            return b.copy();
        const vc = d1 * d4 - d3 * d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) {
            const v = d1 / (d1 - d3);
            return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(a, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ab, v, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        }
        const cp = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, c, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const d5 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ab, cp);
        const d6 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ac, cp);
        if (d6 >= 0 && d5 <= d6)
            return c.copy();
        const vb = d5 * d2 - d1 * d6;
        if (vb <= 0 && d2 >= 0 && d6 <= 0) {
            const w = d2 / (d2 - d6);
            return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(a, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ac, w, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        }
        const va = d3 * d6 - d5 * d4;
        if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
            const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
            const bc = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, b, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
            return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(b, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(bc, w, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        }
        const denom = 1 / (va + vb + vc);
        const v = vb * denom;
        const w = vc * denom;
        return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(a, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ab, v, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ac, w, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    };
    for (const [i0, i1, i2] of triIndices) {
        const aS = vS[i0];
        const bS = vS[i1];
        const cS = vS[i2];
        const q = closestPointOnTri(originS, aS, bS, cS);
        const d2 = q.squaredLength;
        if (d2 < minDist2) {
            minDist2 = d2;
            bestClosest = q;
        }
    }
    const dist = Math.sqrt(minDist2);
    if (dist > 1 + EPS)
        return null;
    const contact = toWorld(bestClosest);
    const penetration = Math.max(0, 1 - dist);
    // Normal: use sphere normal in scaled space mapped back to world: n = M^T n'
    let nWorld = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ux, bestClosest.x / a, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uy, bestClosest.y / b, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uz, bestClosest.z / cr, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    if (nWorld.length > 0) {
        nWorld.normalize();
    }
    else {
        nWorld = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.up.copy();
    }
    return [{ contact, normal: nWorld, distance: penetration }];
}


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

/***/ "./modules/physics/collisions/plane/ellipsoid.ts":
/*!*******************************************************!*\
  !*** ./modules/physics/collisions/plane/ellipsoid.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collidePlaneWithEllipsoid: () => (/* binding */ collidePlaneWithEllipsoid)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

function collidePlaneWithEllipsoid(plane, ellipsoid) {
    const { center } = ellipsoid;
    const { normal, distance: planeDistance } = plane;
    const signed = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(center, normal) - planeDistance;
    const r = ellipsoid.effectiveRadius(normal);
    if (Math.abs(signed) <= r) {
        const offset = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(normal, signed, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const contactPoint = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(center, offset, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const penetrationDepth = r - Math.abs(signed);
        return [
            { contact: contactPoint, normal: normal.copy(), distance: penetrationDepth }
        ];
    }
    return null;
}


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

/***/ "./modules/physics/collisions/polygon/ellipsoid.ts":
/*!*********************************************************!*\
  !*** ./modules/physics/collisions/polygon/ellipsoid.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collidePolygonWithEllipsoid: () => (/* binding */ collidePolygonWithEllipsoid)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

// Closest point from point p to triangle abc
const closestPointOnTriangle = (p, a, b, c) => {
    const ab = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(b, a, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const ac = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, a, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const ap = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, a, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const d1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ab, ap);
    const d2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ac, ap);
    if (d1 <= 0 && d2 <= 0)
        return a.copy();
    const bp = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, b, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const d3 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ab, bp);
    const d4 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ac, bp);
    if (d3 >= 0 && d4 <= d3)
        return b.copy();
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        const v = d1 / (d1 - d3);
        return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(a, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ab, v, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    }
    const cp = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, c, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const d5 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ab, cp);
    const d6 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(ac, cp);
    if (d6 >= 0 && d5 <= d6)
        return c.copy();
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        const w = d2 / (d2 - d6);
        return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(a, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ac, w, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
        const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
        const bc = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c, b, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(b, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(bc, w, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    }
    const denom = 1 / (va + vb + vc);
    const v = vb * denom;
    const w = vc * denom;
    return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(a, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ab, v, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ac, w, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
};
const collidePolygonWithEllipsoid = (polygon, ellipsoid) => {
    const c = ellipsoid.center;
    const ux = ellipsoid.axes[0];
    const uy = ellipsoid.axes[1];
    const uz = ellipsoid.axes[2];
    const { x: a, y: b, z: cr } = ellipsoid.radii;
    const toScaled = (p, out = new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()) => {
        const r = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, c, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        out.x = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(r, ux) / a;
        out.y = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(r, uy) / b;
        out.z = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(r, uz) / cr;
        return out;
    };
    const toWorld = (pS, out = new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()) => {
        return _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ux, a * pS.x, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uy, b * pS.y, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uz, cr * pS.z, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), out);
    };
    const v1S = toScaled(polygon.vertices[0]);
    const v2S = toScaled(polygon.vertices[1]);
    const v3S = toScaled(polygon.vertices[2]);
    const closestS = closestPointOnTriangle(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.zero, v1S, v2S, v3S);
    const dist = closestS.length;
    if (dist <= 1) {
        const contact = toWorld(closestS);
        const penetration = 1 - dist;
        // Use polygon normal in world for stable ground contacts
        const normal = polygon.normal.copy();
        return [{ contact, normal, distance: penetration }];
    }
    return null;
};


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

/***/ "./modules/physics/collisions/ray/ellipsoid.ts":
/*!*****************************************************!*\
  !*** ./modules/physics/collisions/ray/ellipsoid.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideRayWithEllipsoid: () => (/* binding */ collideRayWithEllipsoid)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

// Exact ray-ellipsoid via transform to unit sphere
const collideRayWithEllipsoid = (ray, ellipsoid) => {
    const { origin: o, direction: d } = ray;
    const { center: c } = ellipsoid;
    const { x: a, y: b, z: zc } = ellipsoid.radii;
    // Build orthonormal basis (axes) U from ellipsoid
    const ux = ellipsoid.axes[0];
    const uy = ellipsoid.axes[1];
    const uz = ellipsoid.axes[2];
    // World -> scaled (unit sphere) transform: p' = M (p - c)
    const toScaled = (p, dest = new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()) => {
        const r = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(p, c, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
        const px = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(r, ux) / a;
        const py = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(r, uy) / b;
        const pz = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(r, uz) / zc;
        dest.x = px;
        dest.y = py;
        dest.z = pz;
        return dest;
    };
    const oS = toScaled(o);
    // Direction transforms linearly (no translation)
    const dx = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(d, ux) / a;
    const dy = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(d, uy) / b;
    const dz = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(d, uz) / zc;
    const dS = new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3([dx, dy, dz]);
    const A = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(dS, dS);
    const B = 2 * _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(oS, dS);
    const C = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(oS, oS) - 1;
    const disc = B * B - 4 * A * C;
    if (disc < 0)
        return null;
    const sqrtDisc = Math.sqrt(disc);
    const inv2A = 1 / (2 * A);
    let t0 = (-B - sqrtDisc) * inv2A;
    let t1 = (-B + sqrtDisc) * inv2A;
    if (t0 > t1) {
        const tmp = t0;
        t0 = t1;
        t1 = tmp;
    }
    if (t1 < 0)
        return null; // both behind
    const t = t0 >= 0 ? t0 : t1;
    const hitS = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(oS, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(dS, t, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    // Map to world: p = c + U diag(a,b,c) hitS
    const hit = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ux, a * hitS.x, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uy, b * hitS.y, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uz, zc * hitS.z, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    // Normal mapping: n_world ∝ M^T n' with n' = hitS on unit sphere; M is symmetric
    let n = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ux, hitS.x / a, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uy, hitS.y / b, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(uz, hitS.z / zc, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    if (n.length > 0) {
        n.normalize();
    }
    else {
        n = d.copy().normalize(); // fallback
    }
    // Align with existing ray API (like ray-sphere): point normal toward center
    n.scale(-1);
    // Distance along original ray
    const distance = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(hit, o, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()).length;
    return [{ contact: hit, normal: n, distance }];
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

/***/ "./modules/physics/collisions/sphere/ellipsoid.ts":
/*!********************************************************!*\
  !*** ./modules/physics/collisions/sphere/ellipsoid.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   collideSphereWithEllipsoid: () => (/* binding */ collideSphereWithEllipsoid)
/* harmony export */ });
/* harmony import */ var _luz_vectors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @luz/vectors */ "./modules/vectors/index.ts");

const EPS = 1e-6;
function collideSphereWithEllipsoid(sphere, ellipsoid) {
    const cE = ellipsoid.center;
    const cS = sphere.center;
    // Vector from ellipsoid center to sphere center
    const d = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(cS, cE, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const a = ellipsoid.radii.x;
    const b = ellipsoid.radii.y;
    const c = ellipsoid.radii.z;
    // Inflate ellipsoid by sphere radius (Minkowski sum)
    const A = a + sphere.radius;
    const B = b + sphere.radius;
    const C = c + sphere.radius;
    // Express d in ellipsoid's local basis and scale by inflated radii
    const u0 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(d, ellipsoid.axes[0]) / A;
    const u1 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(d, ellipsoid.axes[1]) / B;
    const u2 = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.dot(d, ellipsoid.axes[2]) / C;
    const uLen2 = u0 * u0 + u1 * u1 + u2 * u2;
    if (uLen2 > 1 + EPS) {
        // Outside inflated ellipsoid: no collision
        return null;
    }
    // Handle degenerate center overlap
    let uLen = Math.sqrt(Math.max(uLen2, 0));
    let hx = 1, hy = 0, hz = 0;
    if (uLen > EPS) {
        hx = u0 / uLen;
        hy = u1 / uLen;
        hz = u2 / uLen;
    }
    else {
        // Choose a stable direction (major axis)
        // Prefer the largest radius axis to reduce instability
        if (a >= b && a >= c) {
            hx = 1;
            hy = 0;
            hz = 0;
        }
        else if (b >= a && b >= c) {
            hx = 0;
            hy = 1;
            hz = 0;
        }
        else {
            hx = 0;
            hy = 0;
            hz = 1;
        }
    }
    // Point on original ellipsoid surface in local coords along direction h
    const qLocX = a * hx;
    const qLocY = b * hy;
    const qLocZ = c * hz;
    // World-space contact point on ellipsoid surface
    const qWorld = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(cE, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ellipsoid.axes[0], qLocX, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ellipsoid.axes[1], qLocY, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ellipsoid.axes[2], qLocZ, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    // Compute normal via gradient of implicit ellipsoid
    const nLocal = new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3([qLocX / (a * a), qLocY / (b * b), qLocZ / (c * c)]);
    let normal = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(_luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ellipsoid.axes[0], nLocal.x, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ellipsoid.axes[1], nLocal.y, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(ellipsoid.axes[2], nLocal.z, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()).normalize();
    // Penetration depth: compare sphere radius vs distance to ellipsoid surface
    const distToSurface = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(cS, qWorld, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()).length;
    const penetration = sphere.radius - distToSurface;
    if (penetration < -EPS) {
        return null;
    }
    const distance = Math.max(0, penetration);
    return [
        {
            contact: qWorld,
            normal,
            distance
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

// Returns a single contact with positive penetration depth, consistent with dispatcher API
const collideSphereWithSphere = (s1, s2) => {
    const { center: c1, radius: r1 } = s1;
    const { center: c2, radius: r2 } = s2;
    const delta = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.subtract(c2, c1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const distanceSquared = delta.squaredLength;
    const radiiSum = r1 + r2;
    if (distanceSquared > radiiSum * radiiSum) {
        return null;
    }
    const distance = Math.sqrt(distanceSquared);
    const normal = distance > 0 ? _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(delta, 1 / distance, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()) : _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.right.copy();
    const contact = _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.add(c1, _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3.scale(normal, r1, new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3()), new _luz_vectors__WEBPACK_IMPORTED_MODULE_0__.vec3());
    const penetration = Math.max(0, radiiSum - distance);
    return [{ contact, normal, distance: penetration }];
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
/* harmony import */ var _collisions_plane_ellipsoid__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../collisions/plane/ellipsoid */ "./modules/physics/collisions/plane/ellipsoid.ts");
/* harmony import */ var _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../collisions/plane/sphere */ "./modules/physics/collisions/plane/sphere.ts");
/* harmony import */ var _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../collisions/sphere/cuboid */ "./modules/physics/collisions/sphere/cuboid.ts");
/* harmony import */ var _collisions_sphere_ellipsoid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../collisions/sphere/ellipsoid */ "./modules/physics/collisions/sphere/ellipsoid.ts");
/* harmony import */ var _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../collisions/sphere/sphere */ "./modules/physics/collisions/sphere/sphere.ts");
/* harmony import */ var _collisions_polygon_sphere__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../collisions/polygon/sphere */ "./modules/physics/collisions/polygon/sphere.ts");
/* harmony import */ var _collisions_polygon_cuboid__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../collisions/polygon/cuboid */ "./modules/physics/collisions/polygon/cuboid.ts");
/* harmony import */ var _collisions_polygon_ellipsoid__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../collisions/polygon/ellipsoid */ "./modules/physics/collisions/polygon/ellipsoid.ts");
/* harmony import */ var _collisions_ellipsoid_cuboid__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../collisions/ellipsoid/cuboid */ "./modules/physics/collisions/ellipsoid/cuboid.ts");












class CollisionDispatcher extends _luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Dispatcher {
    constructor() {
        super();
        // ray
        //this.register('Ray', 'Ray', collideRayWithRay)
        //this.register('Ray', 'Plane', collideRayWithPlane)
        //this.register('Ray', 'Sphere', collideRayWithSphere)
        //this.register('Ray', 'Cuboid', collideRayWithCuboid)
        // this.register('Ray', 'Ellipsoid', collideRayWithEllipsoid)
        // plane
        this.register('Plane', 'Sphere', _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_4__.collidePlaneWithSphere);
        this.register('Plane', 'Cuboid', _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_2__.collidePlaneWithCuboid);
        this.register('Plane', 'Ellipsoid', _collisions_plane_ellipsoid__WEBPACK_IMPORTED_MODULE_3__.collidePlaneWithEllipsoid);
        // polygon
        this.register('Polygon', 'Sphere', _collisions_polygon_sphere__WEBPACK_IMPORTED_MODULE_8__.collidePolygonWithSphere);
        this.register('Polygon', 'Cuboid', _collisions_polygon_cuboid__WEBPACK_IMPORTED_MODULE_9__.collidePolygonWithCuboid);
        this.register('Polygon', 'Ellipsoid', _collisions_polygon_ellipsoid__WEBPACK_IMPORTED_MODULE_10__.collidePolygonWithEllipsoid);
        // sphere
        this.register('Sphere', 'Sphere', _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_7__.collideSphereWithSphere);
        this.register('Sphere', 'Cuboid', _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_5__.collideSphereWithCuboid);
        this.register('Sphere', 'Ellipsoid', _collisions_sphere_ellipsoid__WEBPACK_IMPORTED_MODULE_6__.collideSphereWithEllipsoid);
        // cuboid
        this.register('Cuboid', 'Cuboid', _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_1__.collideCuboidWithCuboid);
        this.register('Ellipsoid', 'Cuboid', _collisions_ellipsoid_cuboid__WEBPACK_IMPORTED_MODULE_11__.collideEllipsoidWithCuboid);
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
/* harmony export */   CollisionDispatcher: () => (/* reexport safe */ _dispatchers_collision__WEBPACK_IMPORTED_MODULE_8__.CollisionDispatcher),
/* harmony export */   Cuboid: () => (/* reexport safe */ _volumes_cuboid__WEBPACK_IMPORTED_MODULE_6__.Cuboid),
/* harmony export */   Ellipsoid: () => (/* reexport safe */ _volumes_ellipsoid__WEBPACK_IMPORTED_MODULE_7__.Ellipsoid),
/* harmony export */   Plane: () => (/* reexport safe */ _colliders_plane__WEBPACK_IMPORTED_MODULE_3__.Plane),
/* harmony export */   Polygon: () => (/* reexport safe */ _colliders_polygon__WEBPACK_IMPORTED_MODULE_4__.Polygon),
/* harmony export */   Ray: () => (/* reexport safe */ _colliders_ray__WEBPACK_IMPORTED_MODULE_2__.Ray),
/* harmony export */   Sphere: () => (/* reexport safe */ _volumes_sphere__WEBPACK_IMPORTED_MODULE_5__.Sphere),
/* harmony export */   Volume: () => (/* reexport safe */ _volume__WEBPACK_IMPORTED_MODULE_0__.Volume),
/* harmony export */   collideCuboidWithCuboid: () => (/* reexport safe */ _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_23__.collideCuboidWithCuboid),
/* harmony export */   collideEllipsoidWithCuboid: () => (/* reexport safe */ _collisions_ellipsoid_cuboid__WEBPACK_IMPORTED_MODULE_24__.collideEllipsoidWithCuboid),
/* harmony export */   collidePlaneWithCuboid: () => (/* reexport safe */ _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_15__.collidePlaneWithCuboid),
/* harmony export */   collidePlaneWithEllipsoid: () => (/* reexport safe */ _collisions_plane_ellipsoid__WEBPACK_IMPORTED_MODULE_16__.collidePlaneWithEllipsoid),
/* harmony export */   collidePlaneWithSphere: () => (/* reexport safe */ _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_14__.collidePlaneWithSphere),
/* harmony export */   collidePolygonWithCuboid: () => (/* reexport safe */ _collisions_polygon_cuboid__WEBPACK_IMPORTED_MODULE_21__.collidePolygonWithCuboid),
/* harmony export */   collidePolygonWithEllipsoid: () => (/* reexport safe */ _collisions_polygon_ellipsoid__WEBPACK_IMPORTED_MODULE_22__.collidePolygonWithEllipsoid),
/* harmony export */   collidePolygonWithSphere: () => (/* reexport safe */ _collisions_polygon_sphere__WEBPACK_IMPORTED_MODULE_20__.collidePolygonWithSphere),
/* harmony export */   collideRayWithCuboid: () => (/* reexport safe */ _collisions_ray_cuboid__WEBPACK_IMPORTED_MODULE_12__.collideRayWithCuboid),
/* harmony export */   collideRayWithEllipsoid: () => (/* reexport safe */ _collisions_ray_ellipsoid__WEBPACK_IMPORTED_MODULE_13__.collideRayWithEllipsoid),
/* harmony export */   collideRayWithPlane: () => (/* reexport safe */ _collisions_ray_plane__WEBPACK_IMPORTED_MODULE_10__.collideRayWithPlane),
/* harmony export */   collideRayWithRay: () => (/* reexport safe */ _collisions_ray_ray__WEBPACK_IMPORTED_MODULE_9__.collideRayWithRay),
/* harmony export */   collideRayWithSphere: () => (/* reexport safe */ _collisions_ray_sphere__WEBPACK_IMPORTED_MODULE_11__.collideRayWithSphere),
/* harmony export */   collideSphereWithCuboid: () => (/* reexport safe */ _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_18__.collideSphereWithCuboid),
/* harmony export */   collideSphereWithEllipsoid: () => (/* reexport safe */ _collisions_sphere_ellipsoid__WEBPACK_IMPORTED_MODULE_19__.collideSphereWithEllipsoid),
/* harmony export */   collideSphereWithSphere: () => (/* reexport safe */ _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_17__.collideSphereWithSphere)
/* harmony export */ });
/* harmony import */ var _volume__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./volume */ "./modules/physics/volume.ts");
/* harmony import */ var _collider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collider */ "./modules/physics/collider.ts");
/* harmony import */ var _colliders_ray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./colliders/ray */ "./modules/physics/colliders/ray.ts");
/* harmony import */ var _colliders_plane__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./colliders/plane */ "./modules/physics/colliders/plane.ts");
/* harmony import */ var _colliders_polygon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./colliders/polygon */ "./modules/physics/colliders/polygon.ts");
/* harmony import */ var _volumes_sphere__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./volumes/sphere */ "./modules/physics/volumes/sphere.ts");
/* harmony import */ var _volumes_cuboid__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./volumes/cuboid */ "./modules/physics/volumes/cuboid.ts");
/* harmony import */ var _volumes_ellipsoid__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./volumes/ellipsoid */ "./modules/physics/volumes/ellipsoid.ts");
/* harmony import */ var _dispatchers_collision__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./dispatchers/collision */ "./modules/physics/dispatchers/collision.ts");
/* harmony import */ var _collisions_ray_ray__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./collisions/ray/ray */ "./modules/physics/collisions/ray/ray.ts");
/* harmony import */ var _collisions_ray_plane__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./collisions/ray/plane */ "./modules/physics/collisions/ray/plane.ts");
/* harmony import */ var _collisions_ray_sphere__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./collisions/ray/sphere */ "./modules/physics/collisions/ray/sphere.ts");
/* harmony import */ var _collisions_ray_cuboid__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./collisions/ray/cuboid */ "./modules/physics/collisions/ray/cuboid.ts");
/* harmony import */ var _collisions_ray_ellipsoid__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./collisions/ray/ellipsoid */ "./modules/physics/collisions/ray/ellipsoid.ts");
/* harmony import */ var _collisions_plane_sphere__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./collisions/plane/sphere */ "./modules/physics/collisions/plane/sphere.ts");
/* harmony import */ var _collisions_plane_cuboid__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./collisions/plane/cuboid */ "./modules/physics/collisions/plane/cuboid.ts");
/* harmony import */ var _collisions_plane_ellipsoid__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./collisions/plane/ellipsoid */ "./modules/physics/collisions/plane/ellipsoid.ts");
/* harmony import */ var _collisions_sphere_sphere__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./collisions/sphere/sphere */ "./modules/physics/collisions/sphere/sphere.ts");
/* harmony import */ var _collisions_sphere_cuboid__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./collisions/sphere/cuboid */ "./modules/physics/collisions/sphere/cuboid.ts");
/* harmony import */ var _collisions_sphere_ellipsoid__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./collisions/sphere/ellipsoid */ "./modules/physics/collisions/sphere/ellipsoid.ts");
/* harmony import */ var _collisions_polygon_sphere__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./collisions/polygon/sphere */ "./modules/physics/collisions/polygon/sphere.ts");
/* harmony import */ var _collisions_polygon_cuboid__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./collisions/polygon/cuboid */ "./modules/physics/collisions/polygon/cuboid.ts");
/* harmony import */ var _collisions_polygon_ellipsoid__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./collisions/polygon/ellipsoid */ "./modules/physics/collisions/polygon/ellipsoid.ts");
/* harmony import */ var _collisions_cuboid_cuboid__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./collisions/cuboid/cuboid */ "./modules/physics/collisions/cuboid/cuboid.ts");
/* harmony import */ var _collisions_ellipsoid_cuboid__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./collisions/ellipsoid/cuboid */ "./modules/physics/collisions/ellipsoid/cuboid.ts");



























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

/***/ "./modules/physics/volumes/ellipsoid.ts":
/*!**********************************************!*\
  !*** ./modules/physics/volumes/ellipsoid.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ellipsoid: () => (/* binding */ Ellipsoid)
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



// General ellipsoid with three semi-axes radii along local X, Y, Z.
let Ellipsoid = class Ellipsoid extends _volume__WEBPACK_IMPORTED_MODULE_2__.Volume {
    type = 'Ellipsoid';
    radii; // [a, b, c] along local X, Y, Z
    // World-space unit axes corresponding to local X, Y, Z
    axes;
    constructor({ origin = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.zero, radii = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.one } = {}) {
        super({ origin });
        this.radii = radii.copy();
        this.axes = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.axes.map((axis) => axis.copy());
    }
    applyTransform(transform) {
        const { translation, rotation } = transform;
        // Update the center of the ellipsoid
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.add(this.origin, translation, this.center);
        // Rotate the local axes into world space
        _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.axes.forEach((axis, index) => {
            rotation.transformVec3(axis, this.axes[index]).normalize();
        });
    }
    calculateInverseInertia(mass, transform) {
        const { rotationMatrix } = transform;
        const { x: a, y: b, z: c } = this.radii;
        // Principal moments of inertia for a solid ellipsoid
        const Ixx = (1 / 5) * mass * (b * b + c * c);
        const Iyy = (1 / 5) * mass * (a * a + c * c);
        const Izz = (1 / 5) * mass * (a * a + b * b);
        this.inverseInertia.set([Ixx, 0, 0, 0, Iyy, 0, 0, 0, Izz]);
        this.inverseInertia.multiply(rotationMatrix).invert();
    }
    // Effective radius along a given world-space direction.
    effectiveRadius(direction) {
        const { x: ax, y: ay, z: az } = this.radii;
        // Components of direction along local axes
        const dx = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.dot(direction, this.axes[0]);
        const dy = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.dot(direction, this.axes[1]);
        const dz = _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3.dot(direction, this.axes[2]);
        const len2 = dx * dx + dy * dy + dz * dz;
        if (len2 === 0)
            return 0;
        const invR2 = (dx * dx) / (ax * ax) + (dy * dy) / (ay * ay) + (dz * dz) / (az * az);
        return Math.sqrt(len2) / Math.sqrt(invR2);
    }
};
__decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Serialize)(),
    __metadata("design:type", _luz_vectors__WEBPACK_IMPORTED_MODULE_1__.vec3 // [a, b, c] along local X, Y, Z
    // World-space unit axes corresponding to local X, Y, Z
    )
], Ellipsoid.prototype, "radii", void 0);
Ellipsoid = __decorate([
    (0,_luz_utilities__WEBPACK_IMPORTED_MODULE_0__.Register)(),
    __metadata("design:paramtypes", [Object])
], Ellipsoid);



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
/* harmony export */   Ellipsoid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.Ellipsoid),
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
/* harmony export */   collideEllipsoidWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideEllipsoidWithCuboid),
/* harmony export */   collidePlaneWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePlaneWithCuboid),
/* harmony export */   collidePlaneWithEllipsoid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePlaneWithEllipsoid),
/* harmony export */   collidePlaneWithSphere: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePlaneWithSphere),
/* harmony export */   collidePolygonWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePolygonWithCuboid),
/* harmony export */   collidePolygonWithEllipsoid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePolygonWithEllipsoid),
/* harmony export */   collidePolygonWithSphere: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collidePolygonWithSphere),
/* harmony export */   collideRayWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideRayWithCuboid),
/* harmony export */   collideRayWithEllipsoid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideRayWithEllipsoid),
/* harmony export */   collideRayWithPlane: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideRayWithPlane),
/* harmony export */   collideRayWithRay: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideRayWithRay),
/* harmony export */   collideRayWithSphere: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideRayWithSphere),
/* harmony export */   collideSphereWithCuboid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideSphereWithCuboid),
/* harmony export */   collideSphereWithEllipsoid: () => (/* reexport safe */ _modules__WEBPACK_IMPORTED_MODULE_0__.collideSphereWithEllipsoid),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QiwwQkFBMEI7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLCtCQUErQjtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsa0NBQWtDO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxJQUFJO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNU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QUNBO0FBQ0EsMEJBQTBCLFdBQVc7QUFDckM7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDdkJPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQXVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ1E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1BBO0FBQ1I7QUFDdkI7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLCtDQUFPO0FBQ3JDLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzdKc0M7QUFDUjtBQUNBO0FBQ0E7QUFDdkI7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLE9BQU87QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLCtDQUFPO0FBQ3JDLHdCQUF3QixPQUFPO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0EsZ0JBQWdCLFVBQVU7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxVQUFVO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyx1Q0FBSTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsdUNBQUk7QUFDdEIsa0JBQWtCLHVDQUFJO0FBQ3RCLGtCQUFrQix1Q0FBSTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzV3NDO0FBQ1I7QUFDQTtBQUNBO0FBQ3ZCO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLFFBQVE7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLCtDQUFPO0FBQ3JDLHdCQUF3QixRQUFRO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0EsZ0JBQWdCLGFBQWE7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHVDQUFJO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLFVBQVU7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixTQUFTO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRCx1Q0FBSTtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyx1Q0FBSTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsdUNBQUk7QUFDdEIsa0JBQWtCLHVDQUFJO0FBQ3RCLGtCQUFrQix1Q0FBSTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3a0JzQztBQUNSO0FBQ0E7QUFDQTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsT0FBTztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsK0NBQU87QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1Qix1Q0FBSTtBQUMzQjtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUNBQUk7QUFDM0I7QUFDQSxnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLCtDQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLCtDQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDelpzQztBQUN0QyxRQUFRLHNCQUFzQjtBQUN2QjtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQiwrQ0FBTztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixPQUFPO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQzlSc0M7QUFDdEMsUUFBUSxzQkFBc0I7QUFDdkI7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLCtDQUFPO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2hYc0M7QUFDdEMsUUFBUSxzQkFBc0I7QUFDdkI7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLCtDQUFPO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUN0VEE7QUFDQTtBQUNBLGdFQUFnRTtBQUNoRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixxQkFBTSxnQkFBZ0IscUJBQU07QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQsa0RBQWtEO0FBQ3ZHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFELGNBQWM7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBa0U7QUFDbEUsOEJBQThCLGdCQUFnQixrQkFBa0I7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQSxvQ0FBb0Msd0JBQXdCLGlCQUFpQjtBQUM3RSxvQ0FBb0Msd0JBQXdCLElBQUk7QUFDaEU7QUFDQSx3Q0FBd0M7QUFDeEMsd0NBQXdDLG9CQUFvQjtBQUM1RDtBQUNBLHdDQUF3QztBQUN4Qyx3Q0FBd0Msa0JBQWtCO0FBQzFEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0dBQXdHO0FBQ3hHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNFQUFzRTtBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0VBQXNFO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdFQUF3RTtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdELFFBQVE7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxRQUFRO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0QsdUJBQXVCO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0RBQXdELDBCQUEwQjtBQUNsRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ04wQiIsInNvdXJjZXMiOlsid2VicGFjazovL2x1ei93ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24iLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9jb3JlL2NvbXBvbmVudC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2NvcmUvY29tcG9uZW50cy9iaXBlZC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2NvcmUvY29tcG9uZW50cy9ib2R5LnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvY29yZS9jb21wb25lbnRzL2NhbWVyYS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2NvcmUvY29tcG9uZW50cy9saWdodC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2NvcmUvY29tcG9uZW50cy9tb2RlbC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2NvcmUvZW50aXR5LnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvY29yZS9pbmRleC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2NvcmUvc2NlbmUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9jb3JlL3RyYW5zZm9ybS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL2luZGV4LnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvbWFuYWdlcnMvYnVmZmVycy50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL21hbmFnZXJzL21lc2hlcy50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL21hbmFnZXJzL3Byb2dyYW1zLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvbWFuYWdlcnMvc2FtcGxlcnMudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9tYW5hZ2Vycy9zaGFkZXJzLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvbWFuYWdlcnMvdGV4dHVyZXMudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9yZW5kZXJlci9hbmltYXRpb24udHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9yZW5kZXJlci9hcm1hdHVyZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL3JlbmRlcmVyL2JvbmUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9yZW5kZXJlci9rZXlmcmFtZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL3JlbmRlcmVyL21hdGVyaWFsLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvcmVuZGVyZXIvcGFydGl0aW9uLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvcmVuZGVyZXIvcGFzcy50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL2dyYXBoaWNzL3JlbmRlcmVyL3JlbmRlcmVyLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvcmVuZGVyZXIvc3RhdGUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9ncmFwaGljcy9yZW5kZXJlci9zdXJmYWNlLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvcmVuZGVyZXIvdGFyZ2V0LnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvZ3JhcGhpY3MvcmVuZGVyZXIvd2VpZ2h0LnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpZGVyLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaWRlcnMvcGxhbmUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpZGVycy9wb2x5Z29uLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaWRlcnMvcmF5LnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL2N1Ym9pZC9jdWJvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpc2lvbnMvZWxsaXBzb2lkL2N1Ym9pZC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlzaW9ucy9wbGFuZS9jdWJvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpc2lvbnMvcGxhbmUvZWxsaXBzb2lkLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL3BsYW5lL3NwaGVyZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlzaW9ucy9wb2x5Z29uL2N1Ym9pZC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlzaW9ucy9wb2x5Z29uL2VsbGlwc29pZC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlzaW9ucy9wb2x5Z29uL3NwaGVyZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlzaW9ucy9yYXkvY3Vib2lkLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL3JheS9lbGxpcHNvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpc2lvbnMvcmF5L3BsYW5lLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL3JheS9yYXkudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpc2lvbnMvcmF5L3NwaGVyZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvY29sbGlzaW9ucy9zcGhlcmUvY3Vib2lkLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9jb2xsaXNpb25zL3NwaGVyZS9lbGxpcHNvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL2NvbGxpc2lvbnMvc3BoZXJlL3NwaGVyZS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3MvZGlzcGF0Y2hlcnMvY29sbGlzaW9uLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy9pbmRleC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3Mvdm9sdW1lLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvcGh5c2ljcy92b2x1bWVzL2N1Ym9pZC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3BoeXNpY3Mvdm9sdW1lcy9lbGxpcHNvaWQudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy9waHlzaWNzL3ZvbHVtZXMvc3BoZXJlLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvdXRpbGl0aWVzL2Rpc3BhdGNoZXIudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy91dGlsaXRpZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy91dGlsaXRpZXMvcG9vbC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3V0aWxpdGllcy9yZWdpc3RyeS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3V0aWxpdGllcy9zZXJpYWxpemFibGUudHMiLCJ3ZWJwYWNrOi8vbHV6Ly4vbW9kdWxlcy91dGlsaXRpZXMvdW5pZm9ybS50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvY29uc3RhbnRzLnRzIiwid2VicGFjazovL2x1ei8uL21vZHVsZXMvdmVjdG9ycy9pbmRleC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvbWF0Mi50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvbWF0My50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvbWF0NC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvcXVhdC50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvdmVjMi50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvdmVjMy50cyIsIndlYnBhY2s6Ly9sdXovLi9tb2R1bGVzL3ZlY3RvcnMvdmVjNC50cyIsIndlYnBhY2s6Ly9sdXovLi9ub2RlX21vZHVsZXMvcmVmbGVjdC1tZXRhZGF0YS9SZWZsZWN0LmpzIiwid2VicGFjazovL2x1ei93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbHV6L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9sdXovd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9sdXovLi9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJsdXpcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wibHV6XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgKCkgPT4ge1xucmV0dXJuICIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmV4cG9ydCBjbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIENvbXBvbmVudC5wcm90b3R5cGUsIFwidHlwZVwiLCB2b2lkIDApO1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xuaW1wb3J0IHsgUmVnaXN0ZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyBxdWF0IH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IEJvZHkgfSBmcm9tICcuL2JvZHknO1xubGV0IEJpcGVkID0gY2xhc3MgQmlwZWQgZXh0ZW5kcyBCb2R5IHtcbiAgICB0eXBlID0gJ0JpcGVkJztcbiAgICAvLyBUcnVlIHdoZW4gYSBjb250YWN0IGV4aXN0cyBiZWxvdyB0aGUgYmlwZWQgdGhpcyBzdGVwXG4gICAgb25Hcm91bmQgPSBmYWxzZTtcbiAgICB1cGRhdGUodHJhbnNmb3JtLCBkZWx0YVRpbWUpIHtcbiAgICAgICAgdGhpcy50b3JxdWUucmVzZXQoKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyVmVsb2NpdHkucmVzZXQoKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyQ29ycmVjdGlvbi5yZXNldCgpO1xuICAgICAgICBzdXBlci51cGRhdGUodHJhbnNmb3JtLCBkZWx0YVRpbWUpO1xuICAgICAgICBjb25zdCB7IHlhdyB9ID0gdHJhbnNmb3JtLnJvdGF0aW9uO1xuICAgICAgICBxdWF0LmZyb21FdWxlckFuZ2xlcyh5YXcsIDAsIDAsIHRyYW5zZm9ybS5yb3RhdGlvbik7XG4gICAgfVxufTtcbkJpcGVkID0gX19kZWNvcmF0ZShbXG4gICAgUmVnaXN0ZXIoKVxuXSwgQmlwZWQpO1xuZXhwb3J0IHsgQmlwZWQgfTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBWb2x1bWUgfSBmcm9tICdAbHV6L3BoeXNpY3MnO1xuaW1wb3J0IHsgU2VyaWFsaXplLCBSZWdpc3RlciB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IHF1YXQsIHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmxldCBCb2R5ID0gY2xhc3MgQm9keSBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgdHlwZSA9ICdCb2R5JztcbiAgICB0aW1lc3RlcCA9ICdGaXhlZCc7XG4gICAgbWFzcztcbiAgICB2b2x1bWU7XG4gICAgZm9yY2U7XG4gICAgdG9ycXVlO1xuICAgIGxpbmVhclZlbG9jaXR5O1xuICAgIGFuZ3VsYXJWZWxvY2l0eTtcbiAgICBhbmd1bGFyQ29ycmVjdGlvbjtcbiAgICBsYXN0VHJhbnNmb3JtID0gbnVsbDtcbiAgICBjb25zdHJ1Y3Rvcih7IG1hc3MgPSAxLjAgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubWFzcyA9IG1hc3M7XG4gICAgICAgIHRoaXMuZm9yY2UgPSB2ZWMzLnplcm8uY29weSgpO1xuICAgICAgICB0aGlzLnRvcnF1ZSA9IHZlYzMuemVyby5jb3B5KCk7XG4gICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkgPSB2ZWMzLnplcm8uY29weSgpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eSA9IHZlYzMuemVyby5jb3B5KCk7XG4gICAgICAgIHRoaXMuYW5ndWxhckNvcnJlY3Rpb24gPSB2ZWMzLnplcm8uY29weSgpO1xuICAgIH1cbiAgICBhcHBseVRyYW5zZm9ybSh0cmFuc2Zvcm0pIHtcbiAgICAgICAgY29uc3QgeyB2b2x1bWUgfSA9IHRoaXM7XG4gICAgICAgIHZvbHVtZS5hcHBseVRyYW5zZm9ybSh0cmFuc2Zvcm0pO1xuICAgICAgICB0aGlzLmxhc3RUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgfVxuICAgIGFwcGx5UG9zaXRpb25Db3JyZWN0aW9uKGRlbHRhKSB7XG4gICAgICAgIGlmICghdGhpcy5sYXN0VHJhbnNmb3JtKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0VHJhbnNmb3JtLnRyYW5zbGF0aW9uLmFkZChkZWx0YSk7XG4gICAgICAgIHRoaXMudm9sdW1lLmFwcGx5VHJhbnNmb3JtKHRoaXMubGFzdFRyYW5zZm9ybSk7XG4gICAgfVxuICAgIHVwZGF0ZSh0cmFuc2Zvcm0sIGRlbHRhVGltZSkge1xuICAgICAgICBjb25zdCB7IG1hc3MsIHZvbHVtZSB9ID0gdGhpcztcbiAgICAgICAgaWYgKG1hc3MgPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZS5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy50b3JxdWUucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMubGluZWFyVmVsb2NpdHkucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhclZlbG9jaXR5LnJlc2V0KCk7XG4gICAgICAgICAgICB2b2x1bWUuaW52ZXJzZUluZXJ0aWEucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMuYW5ndWxhckNvcnJlY3Rpb24ucmVzZXQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2b2x1bWUuY2FsY3VsYXRlSW52ZXJzZUluZXJ0aWEobWFzcywgdHJhbnNmb3JtKTtcbiAgICAgICAgdGhpcy5pbnRlZ3JhdGVMaW5lYXJWZWxvY2l0eSh0cmFuc2Zvcm0sIGRlbHRhVGltZSk7XG4gICAgICAgIHRoaXMuaW50ZWdyYXRlQW5ndWxhclZlbG9jaXR5KHRyYW5zZm9ybSwgZGVsdGFUaW1lKTtcbiAgICB9XG4gICAgaW50ZWdyYXRlTGluZWFyVmVsb2NpdHkodHJhbnNmb3JtLCBkZWx0YVRpbWUpIHtcbiAgICAgICAgY29uc3QgYWNjZWxlcmF0aW9uID0gdmVjMy5zY2FsZSh0aGlzLmZvcmNlLCAxIC8gdGhpcy5tYXNzKTtcbiAgICAgICAgdGhpcy5saW5lYXJWZWxvY2l0eS5hZGQoYWNjZWxlcmF0aW9uLnNjYWxlKGRlbHRhVGltZSkpO1xuICAgICAgICB0cmFuc2Zvcm0udHJhbnNsYXRpb24uYWRkKHZlYzMuc2NhbGUodGhpcy5saW5lYXJWZWxvY2l0eSwgZGVsdGFUaW1lKSk7XG4gICAgICAgIHRoaXMudm9sdW1lLmFwcGx5VHJhbnNmb3JtKHRyYW5zZm9ybSk7XG4gICAgICAgIHRoaXMuZm9yY2UucmVzZXQoKTtcbiAgICB9XG4gICAgaW50ZWdyYXRlQW5ndWxhclZlbG9jaXR5KHRyYW5zZm9ybSwgZGVsdGFUaW1lKSB7XG4gICAgICAgIGNvbnN0IHsgaW52ZXJzZUluZXJ0aWEgfSA9IHRoaXMudm9sdW1lO1xuICAgICAgICBjb25zdCBhY2NlbGVyYXRpb24gPSBpbnZlcnNlSW5lcnRpYS50cmFuc2Zvcm0odGhpcy50b3JxdWUpO1xuICAgICAgICB0aGlzLmFuZ3VsYXJWZWxvY2l0eS5hZGQoYWNjZWxlcmF0aW9uLnNjYWxlKGRlbHRhVGltZSkpO1xuICAgICAgICBjb25zdCBheGlzID0gdmVjMy5ub3JtYWxpemUodGhpcy5hbmd1bGFyVmVsb2NpdHkpO1xuICAgICAgICBjb25zdCBhbmdsZSA9IHRoaXMuYW5ndWxhclZlbG9jaXR5Lmxlbmd0aCAqIGRlbHRhVGltZTtcbiAgICAgICAgaWYgKGFuZ2xlICE9PSAwKSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm0ucm90YXRpb24ubXVsdGlwbHkocXVhdC5mcm9tQXhpc0FuZ2xlKGF4aXMsIGFuZ2xlKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50b3JxdWUucmVzZXQoKTtcbiAgICAgICAgdGhpcy5hbmd1bGFyQ29ycmVjdGlvbi5yZXNldCgpO1xuICAgIH1cbn07XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgTnVtYmVyKVxuXSwgQm9keS5wcm90b3R5cGUsIFwibWFzc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFZvbHVtZSlcbl0sIEJvZHkucHJvdG90eXBlLCBcInZvbHVtZVwiLCB2b2lkIDApO1xuQm9keSA9IF9fZGVjb3JhdGUoW1xuICAgIFJlZ2lzdGVyKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjpwYXJhbXR5cGVzXCIsIFtPYmplY3RdKVxuXSwgQm9keSk7XG5leHBvcnQgeyBCb2R5IH07XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXplLCBVbmlmb3JtLCBSZWdpc3RlciB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IG1hdDQsIHZlYzIgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmxldCBDYW1lcmEgPSBjbGFzcyBDYW1lcmEgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHR5cGUgPSAnQ2FtZXJhJztcbiAgICB0aW1lc3RlcCA9ICdWYXJpYWJsZSc7XG4gICAgYXNwZWN0ID0gMS4wO1xuICAgIGFwZXJ0dXJlID0gOTAuMDtcbiAgICBjbGlwUGxhbmVzID0gbmV3IHZlYzIoWzEuMCwgMTAwLjBdKTtcbiAgICB2aWV3TWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICBtb2RlbFZpZXdNYXRyaXggPSBuZXcgbWF0NCgpO1xuICAgIHByb2plY3Rpb25NYXRyaXggPSBuZXcgbWF0NCgpO1xuICAgIHJlY29uc3RydWN0aW9uTWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICB1cGRhdGUodHJhbnNmb3JtLCBkZWx0YVRpbWUpIHtcbiAgICAgICAgY29uc3QgeyBtb2RlbE1hdHJpeCB9ID0gdHJhbnNmb3JtO1xuICAgICAgICAvLyB2aWV3IG1hdHJpeFxuICAgICAgICBtb2RlbE1hdHJpeC5pbnZlcnQodGhpcy52aWV3TWF0cml4KTtcbiAgICAgICAgLy8gbW9kZWwgdmlldyBtYXRyaXhcbiAgICAgICAgbWF0NC5tdWx0aXBseSh0aGlzLnZpZXdNYXRyaXgsIG1vZGVsTWF0cml4LCB0aGlzLm1vZGVsVmlld01hdHJpeCk7XG4gICAgICAgIC8vIHBlcnNwZWN0aXZlIG1hdHJpeFxuICAgICAgICBtYXQ0LnBlcnNwZWN0aXZlKHRoaXMuYXBlcnR1cmUsIHRoaXMuYXNwZWN0LCB0aGlzLmNsaXBQbGFuZXMueCwgdGhpcy5jbGlwUGxhbmVzLnksIHRoaXMucHJvamVjdGlvbk1hdHJpeCk7XG4gICAgICAgIC8vIHJlY29uc3RydWN0aW9uIG1hdHJpeCAodG8gcmVjb25zdHJ1Y3QgZnJhZ21lbnQgcG9zaXRpb25zKVxuICAgICAgICBtYXQ0Lm11bHRpcGx5KHRoaXMucHJvamVjdGlvbk1hdHJpeCwgdGhpcy52aWV3TWF0cml4LCB0aGlzLnJlY29uc3RydWN0aW9uTWF0cml4KS5pbnZlcnQoKTtcbiAgICB9XG59O1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIENhbWVyYS5wcm90b3R5cGUsIFwiYXNwZWN0XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBVbmlmb3JtKCksXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIENhbWVyYS5wcm90b3R5cGUsIFwiYXBlcnR1cmVcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMilcbl0sIENhbWVyYS5wcm90b3R5cGUsIFwiY2xpcFBsYW5lc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBDYW1lcmEucHJvdG90eXBlLCBcInZpZXdNYXRyaXhcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgQ2FtZXJhLnByb3RvdHlwZSwgXCJtb2RlbFZpZXdNYXRyaXhcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgQ2FtZXJhLnByb3RvdHlwZSwgXCJwcm9qZWN0aW9uTWF0cml4XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBVbmlmb3JtKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE9iamVjdClcbl0sIENhbWVyYS5wcm90b3R5cGUsIFwicmVjb25zdHJ1Y3Rpb25NYXRyaXhcIiwgdm9pZCAwKTtcbkNhbWVyYSA9IF9fZGVjb3JhdGUoW1xuICAgIFJlZ2lzdGVyKClcbl0sIENhbWVyYSk7XG5leHBvcnQgeyBDYW1lcmEgfTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUsIFVuaWZvcm0sIFJlZ2lzdGVyIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuaW1wb3J0IHsgbWF0NCwgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5pbXBvcnQgeyBDYW1lcmEgfSBmcm9tICcuL2NhbWVyYSc7XG5sZXQgTGlnaHQgPSBjbGFzcyBMaWdodCBleHRlbmRzIENhbWVyYSB7XG4gICAgdHlwZSA9ICdMaWdodCc7XG4gICAgcmFkaXVzID0gNi4wO1xuICAgIGZhbGxvZmYgPSAxMC4wO1xuICAgIGludGVuc2l0eSA9IDEuMDtcbiAgICBjb2xvciA9IHZlYzMub25lLmNvcHkoKTtcbiAgICB0cmFuc2xhdGlvbiA9IG5ldyB2ZWMzKCk7XG4gICAgZGlyZWN0aW9uID0gbmV3IHZlYzMoKTtcbiAgICB0ZXh0dXJlTWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICBiaWFzTWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gbmV3IHZlYzMoKTtcbiAgICAgICAgdGhpcy5iaWFzTWF0cml4LnRyYW5zbGF0ZShuZXcgdmVjMyhbMC41LCAwLjUsIDAuNV0pKTtcbiAgICAgICAgdGhpcy5iaWFzTWF0cml4LnNjYWxlKG5ldyB2ZWMzKFswLjUsIDAuNSwgMC41XSkpO1xuICAgIH1cbiAgICB1cGRhdGUodHJhbnNmb3JtLCBkZWx0YVRpbWUpIHtcbiAgICAgICAgc3VwZXIudXBkYXRlKHRyYW5zZm9ybSwgZGVsdGFUaW1lKTtcbiAgICAgICAgdHJhbnNmb3JtLnRyYW5zbGF0aW9uLmNvcHkodGhpcy50cmFuc2xhdGlvbik7XG4gICAgICAgIHRyYW5zZm9ybS5kaXJlY3Rpb24uY29weSh0aGlzLmRpcmVjdGlvbik7XG4gICAgICAgIHRoaXMuYmlhc01hdHJpeC5jb3B5KHRoaXMudGV4dHVyZU1hdHJpeCk7XG4gICAgICAgIHRoaXMudGV4dHVyZU1hdHJpeC5tdWx0aXBseSh0aGlzLnByb2plY3Rpb25NYXRyaXgpO1xuICAgICAgICB0aGlzLnRleHR1cmVNYXRyaXgubXVsdGlwbHkodGhpcy52aWV3TWF0cml4KTtcbiAgICB9XG59O1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBMaWdodC5wcm90b3R5cGUsIFwicmFkaXVzXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBVbmlmb3JtKCksXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIExpZ2h0LnByb3RvdHlwZSwgXCJmYWxsb2ZmXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBVbmlmb3JtKCksXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIExpZ2h0LnByb3RvdHlwZSwgXCJpbnRlbnNpdHlcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMylcbl0sIExpZ2h0LnByb3RvdHlwZSwgXCJjb2xvclwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBMaWdodC5wcm90b3R5cGUsIFwidHJhbnNsYXRpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgTGlnaHQucHJvdG90eXBlLCBcImRpcmVjdGlvblwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBMaWdodC5wcm90b3R5cGUsIFwidGV4dHVyZU1hdHJpeFwiLCB2b2lkIDApO1xuTGlnaHQgPSBfX2RlY29yYXRlKFtcbiAgICBSZWdpc3RlcigpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246cGFyYW10eXBlc1wiLCBbXSlcbl0sIExpZ2h0KTtcbmV4cG9ydCB7IExpZ2h0IH07XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgTWF0ZXJpYWwsIFBhcnRpdGlvbiwgQXJtYXR1cmUsIEFuaW1hdGlvbiB9IGZyb20gJ0BsdXovZ3JhcGhpY3MnO1xuaW1wb3J0IHsgU2VyaWFsaXplLCBVbmlmb3JtLCBSZWdpc3RlciB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5sZXQgTW9kZWwgPSBjbGFzcyBNb2RlbCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgdHlwZSA9ICdNb2RlbCc7XG4gICAgdGltZXN0ZXAgPSAnVmFyaWFibGUnO1xuICAgIG1hdGVyaWFscyA9IHt9O1xuICAgIHBhcnRpdGlvbnMgPSB7fTtcbiAgICBhcm1hdHVyZXMgPSB7fTtcbiAgICBhbmltYXRpb25zID0ge307XG4gICAgYm9uZU1hdHJpY2VzOyAvLyB1cGxvYWRlZCBzZXBhcmF0ZWx5XG4gICAgaXNBbmltYXRlZCA9IGZhbHNlO1xuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgICAgIGNvbnN0IG1vZGVsID0gKGF3YWl0IHN1cGVyLmRlc2VyaWFsaXplKGRhdGEpKTtcbiAgICAgICAgaWYgKE9iamVjdC52YWx1ZXMobW9kZWwuYXJtYXR1cmVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBtb2RlbC5ib25lTWF0cmljZXMgPSBuZXcgRmxvYXQzMkFycmF5KDEwMjQpOyAvLyAxNiAqIDY0XG4gICAgICAgICAgICBtb2RlbC5pc0FuaW1hdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgfVxuICAgIHVwZGF0ZSh0cmFuc2Zvcm0sIGRlbHRhVGltZSkge1xuICAgICAgICBjb25zdCBhbmltYXRpb25zID0gT2JqZWN0LnZhbHVlcyh0aGlzLmFuaW1hdGlvbnMpO1xuICAgICAgICBhbmltYXRpb25zLmZvckVhY2goKGFuaW1hdGlvbikgPT4ge1xuICAgICAgICAgICAgYW5pbWF0aW9uLnVwZGF0ZShkZWx0YVRpbWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYXJtYXR1cmVzID0gT2JqZWN0LnZhbHVlcyh0aGlzLmFybWF0dXJlcyk7XG4gICAgICAgIGFybWF0dXJlcy5mb3JFYWNoKChhcm1hdHVyZSkgPT4ge1xuICAgICAgICAgICAgYXJtYXR1cmUudXBkYXRlKGRlbHRhVGltZSwgYW5pbWF0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoTWF0ZXJpYWwpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBNb2RlbC5wcm90b3R5cGUsIFwibWF0ZXJpYWxzXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoUGFydGl0aW9uKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgTW9kZWwucHJvdG90eXBlLCBcInBhcnRpdGlvbnNcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShBcm1hdHVyZSksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE9iamVjdClcbl0sIE1vZGVsLnByb3RvdHlwZSwgXCJhcm1hdHVyZXNcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShBbmltYXRpb24pLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBNb2RlbC5wcm90b3R5cGUsIFwiYW5pbWF0aW9uc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBCb29sZWFuKVxuXSwgTW9kZWwucHJvdG90eXBlLCBcImlzQW5pbWF0ZWRcIiwgdm9pZCAwKTtcbk1vZGVsID0gX19kZWNvcmF0ZShbXG4gICAgUmVnaXN0ZXIoKVxuXSwgTW9kZWwpO1xuZXhwb3J0IHsgTW9kZWwgfTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL3RyYW5zZm9ybSc7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudCc7XG5leHBvcnQgY2xhc3MgRW50aXR5IGV4dGVuZHMgVHJhbnNmb3JtIHtcbiAgICBjb21wb25lbnRzID0ge307XG4gICAgLy8gdm9sdW1lOiBWb2x1bWUgLS0gVE9ETzogZm9yIHZpc2liaWxpdHkgZGV0ZXJtaW5hdGlvblxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgc3VwZXIuZGVzZXJpYWxpemUoZGF0YSkpO1xuICAgIH1cbiAgICB1cGRhdGUoZGVsdGFUaW1lKSB7XG4gICAgICAgIHN1cGVyLnVwZGF0ZShkZWx0YVRpbWUpO1xuICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuY29tcG9uZW50cykuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50LnRpbWVzdGVwID09PSAnVmFyaWFibGUnKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnVwZGF0ZSh0aGlzLCBkZWx0YVRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZml4ZWRVcGRhdGUoZGVsdGFUaW1lKSB7XG4gICAgICAgIE9iamVjdC52YWx1ZXModGhpcy5jb21wb25lbnRzKS5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQudGltZXN0ZXAgPT09ICdGaXhlZCcpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQudXBkYXRlKHRoaXMsIGRlbHRhVGltZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShDb21wb25lbnQpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBFbnRpdHkucHJvdG90eXBlLCBcImNvbXBvbmVudHNcIiwgdm9pZCAwKTtcbiIsImV4cG9ydCB7IFNjZW5lIH0gZnJvbSAnLi9zY2VuZSc7XG5leHBvcnQgeyBFbnRpdHkgfSBmcm9tICcuL2VudGl0eSc7XG5leHBvcnQgeyBUcmFuc2Zvcm0gfSBmcm9tICcuL3RyYW5zZm9ybSc7XG5leHBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudCc7XG5leHBvcnQgeyBCb2R5IH0gZnJvbSAnLi9jb21wb25lbnRzL2JvZHknO1xuZXhwb3J0IHsgQmlwZWQgfSBmcm9tICcuL2NvbXBvbmVudHMvYmlwZWQnO1xuZXhwb3J0IHsgTW9kZWwgfSBmcm9tICcuL2NvbXBvbmVudHMvbW9kZWwnO1xuZXhwb3J0IHsgTGlnaHQgfSBmcm9tICcuL2NvbXBvbmVudHMvbGlnaHQnO1xuZXhwb3J0IHsgQ2FtZXJhIH0gZnJvbSAnLi9jb21wb25lbnRzL2NhbWVyYSc7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgQ29sbGlkZXIsIENvbGxpc2lvbkRpc3BhdGNoZXIgfSBmcm9tICdAbHV6L3BoeXNpY3MnO1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IEVudGl0eSB9IGZyb20gJy4vZW50aXR5JztcbmNvbnN0IFNURVBfQ09VTlQgPSA0O1xuY29uc3QgRlJBTUVfUkFURSA9IDEgLyA2MDtcbmNvbnN0IHZlbG9jaXR5SXRlcmF0aW9ucyA9IDg7XG5jb25zdCBwb3NpdGlvbkl0ZXJhdGlvbnMgPSA4O1xuY29uc3QgY29udGFjdFJlc3RWZWxvY2l0eSA9IDAuMDAyO1xuY29uc3QgcGVuZXRyYXRpb25Ub2xlcmFuY2UgPSAwLjAwMTtcbmNvbnN0IHBvc2l0aW9uQ29ycmVjdGlvbkZhY3RvciA9IDAuMjU7XG5jb25zdCBwb3NpdGlvbkNvcnJlY3Rpb25QZXJTdGVwID0gMC4wMDU7XG4vLyBDb25zaWRlciBzdXJmYWNlcyB3aXRoIHVwd2FyZCBub3JtYWwgYWJvdmUgdGhpcyB0aHJlc2hvbGQgYXMgXCJncm91bmRcIi5cbi8vIEV4cHJlc3MgdGhlIHRocmVzaG9sZCB2aWEgYSBzbG9wZSBhbmdsZSBpbiBkZWdyZWVzIGZvciBlYXNpZXIgdHVuaW5nLlxuY29uc3QgZ3JvdW5kTWF4U2xvcGVEZWdyZWVzID0gNDU7IC8vIGRlZ3JlZXNcbmNvbnN0IGdyb3VuZE1pbk5vcm1hbFkgPSBNYXRoLmNvcygoZ3JvdW5kTWF4U2xvcGVEZWdyZWVzICogTWF0aC5QSSkgLyAxODApO1xuLy8gQWxsb3cgbGFyZ2VyIHBlci1zdGVwIHNlcGFyYXRpb24gZm9yIGR5bmFtaWMgcGFpcnMgaW52b2x2aW5nIGEgQmlwZWRcbi8vIChhcHBsaWVkIHRvIHRoZSBub24tYmlwZWQgYm9keSksIHRvIHJlZHVjZSB0dW5uZWxpbmcuXG5jb25zdCBiaXBlZER5bmFtaWNDb3JyZWN0aW9uUGVyU3RlcCA9IDAuMDI7XG4vLyBTdGVwIGNsaW1iaW5nIHR1bmluZ1xuY29uc3QgYmlwZWRTdGVwSGVpZ2h0ID0gMC4wMjsgLy8gbWF4IGhlaWdodCB0aGF0IGNhbiBiZSBzdGVwcGVkIG9udG9cbmNvbnN0IGJpcGVkU3RlcE5vcm1hbE1heFkgPSAwLjI7IC8vIGNvbnNpZGVyIG5lYXItdmVydGljYWwgZmFjZXMgb25seVxuY29uc3QgYmlwZWRTdGVwTWluU3BlZWQgPSAwLjI1OyAvLyByZXF1aXJlIHNvbWUgZm9yd2FyZCBtb3Rpb25cbmNvbnN0IGJpcGVkU3RlcFVwQmlhcyA9IDEuNTsgLy8gaG93IHN0cm9uZ2x5IHRvIGJpYXMgY29ycmVjdGlvbiB1cHdhcmRcbmNvbnN0IGlzQm9keUNvbXBvbmVudCA9IChjb21wb25lbnQpID0+IHtcbiAgICByZXR1cm4gY29tcG9uZW50LnR5cGUgPT09ICdCb2R5JyB8fCBjb21wb25lbnQudHlwZSA9PT0gJ0JpcGVkJztcbn07XG5leHBvcnQgY2xhc3MgU2NlbmUgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICAgIGdyYXZpdHk7XG4gICAgZnJpY3Rpb24gPSAwLjI7XG4gICAgcmVzdGl0dXRpb24gPSAwLjI7XG4gICAgbGluZWFyRGFtcGluZyA9IDAuMDE7XG4gICAgYW5ndWxhckRhbXBpbmcgPSAwLjAxO1xuICAgIGVudGl0aWVzID0ge307XG4gICAgY29sbGlkZXJzID0ge307XG4gICAgY29sbGlzaW9uTWFuaWZvbGRzID0gW107XG4gICAgY29sbGlzaW9uRGlzcGF0Y2hlcjtcbiAgICBlbGFwc2VkVGltZSA9IDA7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ3Jhdml0eSA9IG5ldyB2ZWMzKFswLCAtOS44MSwgMF0pO1xuICAgICAgICB0aGlzLmNvbGxpc2lvbkRpc3BhdGNoZXIgPSBuZXcgQ29sbGlzaW9uRGlzcGF0Y2hlcigpO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZGVzZXJpYWxpemUoZGF0YSkge1xuICAgICAgICByZXR1cm4gKGF3YWl0IHN1cGVyLmRlc2VyaWFsaXplKGRhdGEpKTtcbiAgICB9XG4gICAgdXBkYXRlKGRlbHRhVGltZSkge1xuICAgICAgICBjb25zdCBlbnRpdGllcyA9IE9iamVjdC52YWx1ZXModGhpcy5lbnRpdGllcyk7XG4gICAgICAgIHRoaXMuZWxhcHNlZFRpbWUgKz0gZGVsdGFUaW1lO1xuICAgICAgICBsZXQgc3RlcHMgPSAwO1xuICAgICAgICAvLyB0cmFuc2Zvcm0gYm9kaWVzXG4gICAgICAgIGVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgT2JqZWN0LnZhbHVlcyhlbnRpdHkuY29tcG9uZW50cykuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQm9keUNvbXBvbmVudChjb21wb25lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC5hcHBseVRyYW5zZm9ybShlbnRpdHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgd2hpbGUgKHRoaXMuZWxhcHNlZFRpbWUgPj0gRlJBTUVfUkFURSAmJiBzdGVwcysrIDwgU1RFUF9DT1VOVCkge1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IGVudGl0aWVzLnJlZHVjZSgoY29tcG9uZW50cywgZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsuLi5jb21wb25lbnRzLCAuLi5PYmplY3QudmFsdWVzKGVudGl0eS5jb21wb25lbnRzKV07XG4gICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICBjb25zdCBib2RpZXMgPSBjb21wb25lbnRzLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzQm9keUNvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmFwcGx5R3Jhdml0eShib2RpZXMpO1xuICAgICAgICAgICAgdGhpcy5hcHBseURhbXBpbmcoYm9kaWVzLCBGUkFNRV9SQVRFKTtcbiAgICAgICAgICAgIC8vIGZpeGVkIHVwZGF0ZVxuICAgICAgICAgICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgZW50aXR5LmZpeGVkVXBkYXRlKEZSQU1FX1JBVEUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNvbHZlQ29sbGlzaW9ucyhib2RpZXMpO1xuICAgICAgICAgICAgdGhpcy5lbGFwc2VkVGltZSAtPSBGUkFNRV9SQVRFO1xuICAgICAgICB9XG4gICAgICAgIC8vIHZhcmlhYmxlIHVwZGF0ZVxuICAgICAgICBlbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUoZGVsdGFUaW1lKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNvbHZlQ29sbGlzaW9ucyhib2RpZXMpIHtcbiAgICAgICAgLy8gUmVzZXQgb25Hcm91bmQgZm9yIGFsbCBiaXBlZHMgYmVmb3JlIHNvbHZpbmdcbiAgICAgICAgYm9kaWVzLmZpbHRlcigoYikgPT4gYi50eXBlID09PSAnQmlwZWQnKS5mb3JFYWNoKChiKSA9PiB7XG4gICAgICAgICAgICBiLm9uR3JvdW5kID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBWZWxvY2l0eSBwaGFzZVxuICAgICAgICBmb3IgKGxldCBpdGVyYXRpb24gPSAwOyBpdGVyYXRpb24gPCB2ZWxvY2l0eUl0ZXJhdGlvbnM7IGl0ZXJhdGlvbisrKSB7XG4gICAgICAgICAgICB0aGlzLmRldGVjdENvbGxpc2lvbnMoYm9kaWVzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbk1hbmlmb2xkcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJpcGVkR3JvdW5kU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZVZlbG9jaXRpZXMoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBQb3NpdGlvbiBwaGFzZVxuICAgICAgICBmb3IgKGxldCBpdGVyYXRpb24gPSAwOyBpdGVyYXRpb24gPCBwb3NpdGlvbkl0ZXJhdGlvbnM7IGl0ZXJhdGlvbisrKSB7XG4gICAgICAgICAgICB0aGlzLmRldGVjdENvbGxpc2lvbnMoYm9kaWVzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbGxpc2lvbk1hbmlmb2xkcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUJpcGVkR3JvdW5kU3RhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IGFwcGxpZWQgPSB0aGlzLnJlc29sdmVQb3NpdGlvbnMoKTtcbiAgICAgICAgICAgIGlmICghYXBwbGllZClcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBhcHBseUdyYXZpdHkoYm9kaWVzKSB7XG4gICAgICAgIGNvbnN0IGdyYXZpdHlGb3JjZSA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIGJvZGllcy5mb3JFYWNoKChib2R5KSA9PiB7XG4gICAgICAgICAgICBpZiAoYm9keS5tYXNzIDw9IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgdmVjMy5zY2FsZSh0aGlzLmdyYXZpdHksIGJvZHkubWFzcywgZ3Jhdml0eUZvcmNlKTtcbiAgICAgICAgICAgIGJvZHkuZm9yY2UuYWRkKGdyYXZpdHlGb3JjZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhcHBseURhbXBpbmcoYm9kaWVzLCBkZWx0YVRpbWUpIHtcbiAgICAgICAgY29uc3QgaGFzTGluZWFyID0gdGhpcy5saW5lYXJEYW1waW5nID4gMDtcbiAgICAgICAgY29uc3QgaGFzQW5ndWxhciA9IHRoaXMuYW5ndWxhckRhbXBpbmcgPiAwO1xuICAgICAgICBpZiAoIWhhc0xpbmVhciAmJiAhaGFzQW5ndWxhcilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgbGluZWFyRmFjdG9yID0gaGFzTGluZWFyID8gTWF0aC5leHAoLXRoaXMubGluZWFyRGFtcGluZyAqIGRlbHRhVGltZSkgOiAxO1xuICAgICAgICBjb25zdCBhbmd1bGFyRmFjdG9yID0gaGFzQW5ndWxhciA/IE1hdGguZXhwKC10aGlzLmFuZ3VsYXJEYW1waW5nICogZGVsdGFUaW1lKSA6IDE7XG4gICAgICAgIGJvZGllcy5mb3JFYWNoKChib2R5KSA9PiB7XG4gICAgICAgICAgICBpZiAoYm9keS5tYXNzIDw9IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGhhc0xpbmVhcilcbiAgICAgICAgICAgICAgICBib2R5LmxpbmVhclZlbG9jaXR5LnNjYWxlKGxpbmVhckZhY3Rvcik7XG4gICAgICAgICAgICBpZiAoaGFzQW5ndWxhcilcbiAgICAgICAgICAgICAgICBib2R5LmFuZ3VsYXJWZWxvY2l0eS5zY2FsZShhbmd1bGFyRmFjdG9yKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGRldGVjdENvbGxpc2lvbnMoYm9kaWVzKSB7XG4gICAgICAgIHRoaXMuY29sbGlzaW9uTWFuaWZvbGRzLmxlbmd0aCA9IDA7XG4gICAgICAgIC8vIGJvZHktdnMtYm9keVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYjEgPSBib2RpZXNbaV07XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBib2RpZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBiMiA9IGJvZGllc1tqXTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xsaXNpb25zID0gdGhpcy5jb2xsaXNpb25EaXNwYXRjaGVyLmRpc3BhdGNoKGIxLnZvbHVtZSwgYjIudm9sdW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoY29sbGlzaW9ucyAmJiBjb2xsaXNpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2xsaXNpb25NYW5pZm9sZHMucHVzaCh7IGJvZGllczogW2IxLCBiMl0sIGNvbGxpc2lvbnMgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGJvZHktdnMtc3RhdGljXG4gICAgICAgIGJvZGllcy5mb3JFYWNoKChib2R5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb2xsaWRlcnMgPSBPYmplY3QudmFsdWVzKHRoaXMuY29sbGlkZXJzKTtcbiAgICAgICAgICAgIGNvbGxpZGVycy5mb3JFYWNoKChjb2xsaWRlcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbGxpc2lvbnMgPSB0aGlzLmNvbGxpc2lvbkRpc3BhdGNoZXIuZGlzcGF0Y2goYm9keS52b2x1bWUsIGNvbGxpZGVyKTtcbiAgICAgICAgICAgICAgICBpZiAoY29sbGlzaW9ucyAmJiBjb2xsaXNpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb2xsaXNpb25NYW5pZm9sZHMucHVzaCh7IGJvZGllczogW2JvZHksIG51bGxdLCBjb2xsaXNpb25zIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gU3RhYmxlIHBlci1wYWlyIG5vcm1hbCBvcmllbnRhdGlvbiAoc2hhcmVkIGJ5IGJvdGggc29sdmVycylcbiAgICBvcmllbnROb3JtYWxGb3JQYWlyKG5JbiwgY29udGFjdCwgYjEsIGIyKSB7XG4gICAgICAgIGNvbnN0IG4gPSBuSW4uY29weSgpO1xuICAgICAgICBjb25zdCByMSA9IHZlYzMuc3VidHJhY3QoY29udGFjdCwgYjEudm9sdW1lLmNlbnRlciwgbmV3IHZlYzMoKSk7XG4gICAgICAgIGlmIChiMikge1xuICAgICAgICAgICAgY29uc3QgYzEyID0gdmVjMy5zdWJ0cmFjdChiMi52b2x1bWUuY2VudGVyLCBiMS52b2x1bWUuY2VudGVyLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgIGlmICh2ZWMzLmRvdChuLCBjMTIpIDwgMClcbiAgICAgICAgICAgICAgICBuLnNjYWxlKC0xKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh2ZWMzLmRvdChuLCByMSkgPCAwKVxuICAgICAgICAgICAgICAgIG4uc2NhbGUoLTEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cbiAgICByZXNvbHZlVmVsb2NpdGllcygpIHtcbiAgICAgICAgdGhpcy5jb2xsaXNpb25NYW5pZm9sZHMuZm9yRWFjaCgoeyBib2RpZXMsIGNvbGxpc2lvbnMgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgW2IxLCBiMl0gPSBib2RpZXM7XG4gICAgICAgICAgICBjb2xsaXNpb25zLmZvckVhY2goKHsgY29udGFjdCwgbm9ybWFsOiBjb2xsaXNpb25Ob3JtYWwsIGRpc3RhbmNlIH0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBub3JtYWwgPSB0aGlzLm9yaWVudE5vcm1hbEZvclBhaXIoY29sbGlzaW9uTm9ybWFsLCBjb250YWN0LCBiMSwgYjIpO1xuICAgICAgICAgICAgICAgIC8vIENvbnRhY3QgcG9pbnQgb2Zmc2V0c1xuICAgICAgICAgICAgICAgIGNvbnN0IHIxID0gdmVjMy5zdWJ0cmFjdChjb250YWN0LCBiMS52b2x1bWUuY2VudGVyLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250YWN0VmVsb2NpdHkxID0gdmVjMy5hZGQoYjEubGluZWFyVmVsb2NpdHksIHZlYzMuY3Jvc3MoYjEuYW5ndWxhclZlbG9jaXR5LCByMSwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHIyID0gYjIgPyB2ZWMzLnN1YnRyYWN0KGNvbnRhY3QsIGIyLnZvbHVtZS5jZW50ZXIsIG5ldyB2ZWMzKCkpIDogbnVsbDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250YWN0VmVsb2NpdHkyID0gYjJcbiAgICAgICAgICAgICAgICAgICAgPyB2ZWMzLmFkZChiMi5saW5lYXJWZWxvY2l0eSwgdmVjMy5jcm9zcyhiMi5hbmd1bGFyVmVsb2NpdHksIHIyLCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSlcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgICAgICAgIC8vIFJlbGF0aXZlIHZlbG9jaXR5XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVWZWxvY2l0eSA9IGNvbnRhY3RWZWxvY2l0eTJcbiAgICAgICAgICAgICAgICAgICAgPyB2ZWMzLnN1YnRyYWN0KGNvbnRhY3RWZWxvY2l0eTIsIGNvbnRhY3RWZWxvY2l0eTEsIG5ldyB2ZWMzKCkpXG4gICAgICAgICAgICAgICAgICAgIDogdmVjMy5zdWJ0cmFjdCh2ZWMzLnplcm8sIGNvbnRhY3RWZWxvY2l0eTEsIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZlbG9jaXR5QWxvbmdOb3JtYWwgPSB2ZWMzLmRvdChyZWxhdGl2ZVZlbG9jaXR5LCBub3JtYWwpO1xuICAgICAgICAgICAgICAgIGlmICh2ZWxvY2l0eUFsb25nTm9ybWFsID4gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBzZXBhcmF0aW5nXG4gICAgICAgICAgICAgICAgLy8gVGFuZ2VudFxuICAgICAgICAgICAgICAgIGNvbnN0IHRhbmdlbnQgPSB2ZWMzLnN1YnRyYWN0KHJlbGF0aXZlVmVsb2NpdHksIHZlYzMuc2NhbGUobm9ybWFsLCB2ZWxvY2l0eUFsb25nTm9ybWFsLCBuZXcgdmVjMygpKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFuZ2VudExlbmd0aCA9IHRhbmdlbnQubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhbmdlbnREaXJlY3Rpb24gPSB0YW5nZW50TGVuZ3RoID4gMCA/IHRhbmdlbnQubm9ybWFsaXplKCkgOiB2ZWMzLnplcm87XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdGl0dXRpb24gPSBNYXRoLmFicyh2ZWxvY2l0eUFsb25nTm9ybWFsKSA8IGNvbnRhY3RSZXN0VmVsb2NpdHkgPyAwIDogdGhpcy5yZXN0aXR1dGlvbjtcbiAgICAgICAgICAgICAgICBjb25zdCBpbXB1bHNlU2NhbGFyID0gTWF0aC5tYXgoLSgoMS4wICsgcmVzdGl0dXRpb24pICogdmVsb2NpdHlBbG9uZ05vcm1hbCksIDApO1xuICAgICAgICAgICAgICAgIC8vIE1hc3MvaW5lcnRpYVxuICAgICAgICAgICAgICAgIC8vIFRyZWF0IEJpcGVkIGFzIGltbW92YWJsZSBmb3IgZHluYW1pYyBjb2xsaXNpb25zLCBidXQgYWxsb3dcbiAgICAgICAgICAgICAgICAvLyBub3JtYWwgaW1wdWxzZXMgdnMgc3RhdGljIGNvbGxpZGVycyAoYjIgPT09IG51bGwpIHRvIHByZXZlbnQgdHVubmVsaW5nLlxuICAgICAgICAgICAgICAgIGNvbnN0IGIxSXNCaXBlZCA9IGIxLnR5cGUgPT09ICdCaXBlZCc7XG4gICAgICAgICAgICAgICAgY29uc3QgYjJJc0JpcGVkID0gYjIgPyBiMi50eXBlID09PSAnQmlwZWQnIDogZmFsc2U7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52TWFzczFCYXNlID0gYjEubWFzcyA+IDAgPyAxLjAgLyBiMS5tYXNzIDogMDtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnZNYXNzMkJhc2UgPSBiMiA/IChiMi5tYXNzID4gMCA/IDEuMCAvIGIyLm1hc3MgOiAwKSA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgaW52ZXJzZU1hc3MxID0gYjFJc0JpcGVkICYmIGIyID8gMCA6IGludk1hc3MxQmFzZTtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnZlcnNlTWFzczIgPSBiMiA/IChiMklzQmlwZWQgPyAwIDogaW52TWFzczJCYXNlKSA6IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgdG90YWxJbnZlcnNlTWFzcyA9IGludmVyc2VNYXNzMSArIGludmVyc2VNYXNzMjtcbiAgICAgICAgICAgICAgICBpZiAodG90YWxJbnZlcnNlTWFzcyA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNvbnN0IGludmVyc2VJbmVydGlhMSA9IGIxLnZvbHVtZS5pbnZlcnNlSW5lcnRpYTtcbiAgICAgICAgICAgICAgICBjb25zdCBpbnZlcnNlSW5lcnRpYTIgPSBiMiA/IGIyLnZvbHVtZS5pbnZlcnNlSW5lcnRpYSA6IG51bGw7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcHV0ZUVmZmVjdGl2ZU1hc3MgPSAoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkZW5vbWluYXRvciA9IHRvdGFsSW52ZXJzZU1hc3M7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnZlcnNlTWFzczEgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByMUNyb3NzRGlyID0gdmVjMy5jcm9zcyhyMSwgZGlyZWN0aW9uLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuZ3VsYXJDb21wb25lbnQxID0gdmVjMy5jcm9zcyhpbnZlcnNlSW5lcnRpYTEudHJhbnNmb3JtKHIxQ3Jvc3NEaXIsIG5ldyB2ZWMzKCkpLCByMSwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZW5vbWluYXRvciArPSB2ZWMzLmRvdChhbmd1bGFyQ29tcG9uZW50MSwgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYjIgJiYgaW52ZXJzZU1hc3MyID4gMCAmJiByMiAmJiBpbnZlcnNlSW5lcnRpYTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHIyQ3Jvc3NEaXIgPSB2ZWMzLmNyb3NzKHIyLCBkaXJlY3Rpb24sIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5ndWxhckNvbXBvbmVudDIgPSB2ZWMzLmNyb3NzKGludmVyc2VJbmVydGlhMi50cmFuc2Zvcm0ocjJDcm9zc0RpciwgbmV3IHZlYzMoKSksIHIyLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbm9taW5hdG9yICs9IHZlYzMuZG90KGFuZ3VsYXJDb21wb25lbnQyLCBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZW5vbWluYXRvcjtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbEVmZmVjdGl2ZU1hc3MgPSBjb21wdXRlRWZmZWN0aXZlTWFzcyhub3JtYWwpO1xuICAgICAgICAgICAgICAgIGlmIChub3JtYWxFZmZlY3RpdmVNYXNzIDw9IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjb25zdCBub3JtYWxJbXB1bHNlTWFnbml0dWRlID0gaW1wdWxzZVNjYWxhciA+IDAgPyBpbXB1bHNlU2NhbGFyIC8gbm9ybWFsRWZmZWN0aXZlTWFzcyA6IDA7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbEltcHVsc2VNYWduaXR1ZGUgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbEltcHVsc2UgPSB2ZWMzLnNjYWxlKG5vcm1hbCwgbm9ybWFsSW1wdWxzZU1hZ25pdHVkZSwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnZlcnNlTWFzczEgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiMS5saW5lYXJWZWxvY2l0eS5zdWJ0cmFjdCh2ZWMzLnNjYWxlKG5vcm1hbEltcHVsc2UsIGludmVyc2VNYXNzMSwgbmV3IHZlYzMoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5ndWxhckltcHVsc2UxID0gaW52ZXJzZUluZXJ0aWExLnRyYW5zZm9ybSh2ZWMzLmNyb3NzKHIxLCBub3JtYWxJbXB1bHNlLCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiMS5hbmd1bGFyVmVsb2NpdHkuc3VidHJhY3QoYW5ndWxhckltcHVsc2UxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYjIgJiYgaW52ZXJzZU1hc3MyID4gMCAmJiByMiAmJiBpbnZlcnNlSW5lcnRpYTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGIyLmxpbmVhclZlbG9jaXR5LmFkZCh2ZWMzLnNjYWxlKG5vcm1hbEltcHVsc2UsIGludmVyc2VNYXNzMiwgbmV3IHZlYzMoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5ndWxhckltcHVsc2UyID0gaW52ZXJzZUluZXJ0aWEyLnRyYW5zZm9ybSh2ZWMzLmNyb3NzKHIyLCBub3JtYWxJbXB1bHNlLCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiMi5hbmd1bGFyVmVsb2NpdHkuYWRkKGFuZ3VsYXJJbXB1bHNlMik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gRnJpY3Rpb25cbiAgICAgICAgICAgICAgICAvLyAtLS0gVGFuZ2VudGlhbCBGcmljdGlvbiAoc3RpY2vigJNzbGlwKSAtLS1cbiAgICAgICAgICAgICAgICBpZiAodGFuZ2VudExlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnJpY3Rpb25FZmZlY3RpdmVNYXNzID0gY29tcHV0ZUVmZmVjdGl2ZU1hc3ModGFuZ2VudERpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmcmljdGlvbkVmZmVjdGl2ZU1hc3MgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBEZXNpcmVkIGltcHVsc2UgdG8gemVybyB0YW5nZW50aWFsIHZlbG9jaXR5IChzdGF0aWMgYXR0ZW1wdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBqdCA9IC12ZWMzLmRvdChyZWxhdGl2ZVZlbG9jaXR5LCB0YW5nZW50RGlyZWN0aW9uKSAvIGZyaWN0aW9uRWZmZWN0aXZlTWFzcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpuID0gTWF0aC5hYnMobm9ybWFsSW1wdWxzZU1hZ25pdHVkZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtdV9zID0gdGhpcy5mcmljdGlvbiAqIDEuNTsgLy8gc3RhdGljIGZyaWN0aW9uIGNvZWZmaWNpZW50ICh0dW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbXVfZCA9IHRoaXMuZnJpY3Rpb247IC8vIGR5bmFtaWMgZnJpY3Rpb24gY29lZmZpY2llbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENsYW1wIGZvciBzdGljayBvciBzbGlwXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoanQpIDw9IG11X3MgKiBqbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0YXRpYyBmcmljdGlvbjogdXNlIGV4YWN0bHkgd2hhdCdzIG5lZWRlZCB0byBzdG9wIHRhbmdlbnRpYWwgbW90aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKGp0IGFscmVhZHkgY29tcHV0ZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEeW5hbWljIGZyaWN0aW9uOiBjbGFtcCB0byBDb3Vsb21iIGJvdW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAganQgPSBNYXRoLnNpZ24oanQpICogbXVfZCAqIGpuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGp0ICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnJpY3Rpb25JbXB1bHNlID0gdmVjMy5zY2FsZSh0YW5nZW50RGlyZWN0aW9uLCBqdCwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludmVyc2VNYXNzMSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYjEubGluZWFyVmVsb2NpdHkuc3VidHJhY3QodmVjMy5zY2FsZShmcmljdGlvbkltcHVsc2UsIGludmVyc2VNYXNzMSwgbmV3IHZlYzMoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbmd1bGFySW1wdWxzZTEgPSBpbnZlcnNlSW5lcnRpYTEudHJhbnNmb3JtKHZlYzMuY3Jvc3MocjEsIGZyaWN0aW9uSW1wdWxzZSwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiMS5hbmd1bGFyVmVsb2NpdHkuc3VidHJhY3QoYW5ndWxhckltcHVsc2UxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGIyICYmIGludmVyc2VNYXNzMiA+IDAgJiYgcjIgJiYgaW52ZXJzZUluZXJ0aWEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIyLmxpbmVhclZlbG9jaXR5LmFkZCh2ZWMzLnNjYWxlKGZyaWN0aW9uSW1wdWxzZSwgaW52ZXJzZU1hc3MyLCBuZXcgdmVjMygpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuZ3VsYXJJbXB1bHNlMiA9IGludmVyc2VJbmVydGlhMi50cmFuc2Zvcm0odmVjMy5jcm9zcyhyMiwgZnJpY3Rpb25JbXB1bHNlLCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGIyLmFuZ3VsYXJWZWxvY2l0eS5hZGQoYW5ndWxhckltcHVsc2UyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlc29sdmVQb3NpdGlvbnMoKSB7XG4gICAgICAgIGxldCBhcHBsaWVkQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgICAgICAvLyBJTVBPUlRBTlQ6IG9uZSBjb3JyZWN0aW9uIHBlciBtYW5pZm9sZCAocGFpciksIHVzaW5nIE1BWCBwZW5ldHJhdGlvbiBhY3Jvc3MgY29udGFjdHMuXG4gICAgICAgIHRoaXMuY29sbGlzaW9uTWFuaWZvbGRzLmZvckVhY2goKHsgYm9kaWVzLCBjb2xsaXNpb25zIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFtiMSwgYjJdID0gYm9kaWVzO1xuICAgICAgICAgICAgLy8gUGljayB0aGUgZGVlcGVzdCBjb250YWN0IGFuZCBhIHN0YWJsZSBub3JtYWwgZm9yIHRoZSBwYWlyXG4gICAgICAgICAgICBsZXQgbWF4RGVwdGggPSAwO1xuICAgICAgICAgICAgbGV0IGNob3Nlbk5vcm1hbCA9IG51bGw7XG4gICAgICAgICAgICBsZXQgY2hvc2VuQ29udGFjdCA9IG51bGw7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgY29udGFjdCwgbm9ybWFsOiBuSW4sIGRpc3RhbmNlIH0gb2YgY29sbGlzaW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlcHRoID0gTWF0aC5tYXgoZGlzdGFuY2UgLSBwZW5ldHJhdGlvblRvbGVyYW5jZSwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGRlcHRoID4gbWF4RGVwdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF4RGVwdGggPSBkZXB0aDtcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuQ29udGFjdCA9IGNvbnRhY3Q7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9yaWVudCBub3JtYWwgZGV0ZXJtaW5pc3RpY2FsbHlcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuTm9ybWFsID0gdGhpcy5vcmllbnROb3JtYWxGb3JQYWlyKG5JbiwgY29udGFjdCwgYjEsIGIyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNob3Nlbk5vcm1hbCB8fCAhY2hvc2VuQ29udGFjdCB8fCBtYXhEZXB0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRm9yIHBvc2l0aW9uIGNvcnJlY3Rpb246XG4gICAgICAgICAgICAvLyAtIERvIG5vdCBtb3ZlIEJpcGVkIGluIGR5bmFtaWMtZHluYW1pYyBwYWlycyAobGV0IHRoZSBvdGhlciBib2R5IG1vdmUpXG4gICAgICAgICAgICAvLyAtIEFsbG93IEJpcGVkIHRvIGJlIGNvcnJlY3RlZCBhZ2FpbnN0IHN0YXRpYyBjb2xsaWRlcnMgKGIyID09PSBudWxsKVxuICAgICAgICAgICAgY29uc3QgYjFJc0JpcGVkID0gYjEudHlwZSA9PT0gJ0JpcGVkJztcbiAgICAgICAgICAgIGNvbnN0IGIySXNCaXBlZCA9IGIyID8gYjIudHlwZSA9PT0gJ0JpcGVkJyA6IGZhbHNlO1xuICAgICAgICAgICAgY29uc3QgaW52TWFzczFCYXNlID0gYjEubWFzcyA+IDAgPyAxLjAgLyBiMS5tYXNzIDogMDtcbiAgICAgICAgICAgIGNvbnN0IGludk1hc3MyQmFzZSA9IGIyID8gKGIyLm1hc3MgPiAwID8gMS4wIC8gYjIubWFzcyA6IDApIDogMDtcbiAgICAgICAgICAgIGNvbnN0IGludmVyc2VNYXNzMSA9IGIxSXNCaXBlZCAmJiBiMiA/IDAgOiBpbnZNYXNzMUJhc2U7XG4gICAgICAgICAgICBjb25zdCBpbnZlcnNlTWFzczIgPSBiMiA/IChiMklzQmlwZWQgPyAwIDogaW52TWFzczJCYXNlKSA6IDA7XG4gICAgICAgICAgICBjb25zdCB0b3RhbEludmVyc2VNYXNzID0gaW52ZXJzZU1hc3MxICsgaW52ZXJzZU1hc3MyO1xuICAgICAgICAgICAgaWYgKHRvdGFsSW52ZXJzZU1hc3MgPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgLy8gU2luZ2xlIGNvcnJlY3Rpb24gZm9yIHRoZSBwYWlyXG4gICAgICAgICAgICBsZXQgY29ycmVjdGlvbk1hZ25pdHVkZSA9IChtYXhEZXB0aCAqIHBvc2l0aW9uQ29ycmVjdGlvbkZhY3RvcikgLyB0b3RhbEludmVyc2VNYXNzO1xuICAgICAgICAgICAgLy8gQ2xhbXAgcGVyLXN0ZXAgY29ycmVjdGlvbi4gRm9yIGJpcGVkLXZzLWR5bmFtaWMgcGFpcnMsIHNjYWxlIHRoZSBjbGFtcCBzbyB0aGF0IHRoZVxuICAgICAgICAgICAgLy8gbm9uLWJpcGVkIGJvZHkgY2FuIG1vdmUgdXAgdG8gYSBmaXhlZCBhbW91bnQgcmVnYXJkbGVzcyBvZiBpdHMgbWFzcy5cbiAgICAgICAgICAgIGxldCBwZXJTdGVwQ2xhbXAgPSBwb3NpdGlvbkNvcnJlY3Rpb25QZXJTdGVwO1xuICAgICAgICAgICAgaWYgKGIyICYmIGIxSXNCaXBlZCAmJiBpbnZlcnNlTWFzczIgPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGIyIGNhbiBtb3ZlIHVwIHRvIGJpcGVkRHluYW1pY0NvcnJlY3Rpb25QZXJTdGVwIHRoaXMgaXRlcmF0aW9uXG4gICAgICAgICAgICAgICAgcGVyU3RlcENsYW1wID0gTWF0aC5tYXgocGVyU3RlcENsYW1wLCBiaXBlZER5bmFtaWNDb3JyZWN0aW9uUGVyU3RlcCAvIGludmVyc2VNYXNzMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghYjIgJiYgYjFJc0JpcGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gYmlwZWQgdnMgc3RhdGljOiBrZWVwIGRlZmF1bHQgY2xhbXBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGIySXNCaXBlZCAmJiBpbnZlcnNlTWFzczEgPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGIxIGNhbiBtb3ZlIHVwIHRvIGJpcGVkRHluYW1pY0NvcnJlY3Rpb25QZXJTdGVwIHRoaXMgaXRlcmF0aW9uXG4gICAgICAgICAgICAgICAgcGVyU3RlcENsYW1wID0gTWF0aC5tYXgocGVyU3RlcENsYW1wLCBiaXBlZER5bmFtaWNDb3JyZWN0aW9uUGVyU3RlcCAvIGludmVyc2VNYXNzMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29ycmVjdGlvbk1hZ25pdHVkZSA+IHBlclN0ZXBDbGFtcCkge1xuICAgICAgICAgICAgICAgIGNvcnJlY3Rpb25NYWduaXR1ZGUgPSBwZXJTdGVwQ2xhbXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBCaXBlZCBzdGVwIGhhbmRsaW5nIGFnYWluc3Qgc3RhdGljIGdlb21ldHJ5OiBpZiB0aGUgYmlwZWQgaGl0cyBhIG5lYXItdmVydGljYWxcbiAgICAgICAgICAgIC8vIGZhY2Ugd2l0aGluIHN0ZXAgaGVpZ2h0IHdoaWxlIG1vdmluZyBmb3J3YXJkIGFuZCBpcyBncm91bmRlZCwgYmlhcyB0aGUgY29ycmVjdGlvblxuICAgICAgICAgICAgLy8gdXB3YXJkIHRvIGFsbG93IHN0ZXBwaW5nIG9udG8gdGhlIG9ic3RhY2xlIGluc3RlYWQgb2YganVzdCBwdXNoaW5nIGJhY2suXG4gICAgICAgICAgICBpZiAoIWIyICYmIGIxSXNCaXBlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJpcGVkID0gYjE7XG4gICAgICAgICAgICAgICAgLy8gVXNlIGhvcml6b250YWwgbW92ZW1lbnQgZGlyZWN0aW9uIGFzIGludGVudFxuICAgICAgICAgICAgICAgIGNvbnN0IGhvcml6VmVsb2NpdHkgPSBuZXcgdmVjMyhbYjEubGluZWFyVmVsb2NpdHkueCwgMCwgYjEubGluZWFyVmVsb2NpdHkuel0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhvcml6U3BlZWQgPSBob3JpelZlbG9jaXR5Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBmYWNpbmdJbnRvV2FsbCA9IGhvcml6U3BlZWQgPiAwXG4gICAgICAgICAgICAgICAgICAgID8gdmVjMy5kb3QoaG9yaXpWZWxvY2l0eS5ub3JtYWxpemUoKSwgdmVjMy5zY2FsZShjaG9zZW5Ob3JtYWwsIC0xLCBuZXcgdmVjMygpKSkgPiAwLjI1XG4gICAgICAgICAgICAgICAgICAgIDogZmFsc2U7XG4gICAgICAgICAgICAgICAgLy8gQ29tcHV0ZSBjb250YWN0IGhlaWdodCByZWxhdGl2ZSB0byB0aGUgYmlwZWQncyBib3R0b20gaWYgd2UgY2FuXG4gICAgICAgICAgICAgICAgbGV0IGlzV2l0aGluU3RlcEhlaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZvbCA9IGIxLnZvbHVtZTtcbiAgICAgICAgICAgICAgICBpZiAodm9sKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBib3R0b21ZID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZvbC50eXBlID09PSAnQ3Vib2lkJyAmJiB2b2wuZXh0ZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tWSA9IGIxLnZvbHVtZS5jZW50ZXIueSAtIHZvbC5leHRlbnRzLnk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodm9sLnR5cGUgPT09ICdTcGhlcmUnICYmIHR5cGVvZiB2b2wucmFkaXVzID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm90dG9tWSA9IGIxLnZvbHVtZS5jZW50ZXIueSAtIHZvbC5yYWRpdXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodm9sLnR5cGUgPT09ICdFbGxpcHNvaWQnICYmIHR5cGVvZiB2b2wuZWZmZWN0aXZlUmFkaXVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBVc2UgZWZmZWN0aXZlIHJhZGl1cyBhbG9uZyB3b3JsZCB1cCBkaXJlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbVkgPSBiMS52b2x1bWUuY2VudGVyLnkgLSB2b2wuZWZmZWN0aXZlUmFkaXVzKHZlYzMudXApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChib3R0b21ZICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250YWN0SGVpZ2h0QWJvdmVCb3R0b20gPSBjaG9zZW5Db250YWN0LnkgLSBib3R0b21ZO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNXaXRoaW5TdGVwSGVpZ2h0ID0gY29udGFjdEhlaWdodEFib3ZlQm90dG9tID49IC0xZS0zICYmIGNvbnRhY3RIZWlnaHRBYm92ZUJvdHRvbSA8PSBiaXBlZFN0ZXBIZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJpcGVkLm9uR3JvdW5kICYmXG4gICAgICAgICAgICAgICAgICAgIGNob3Nlbk5vcm1hbC55IDw9IGJpcGVkU3RlcE5vcm1hbE1heFkgJiZcbiAgICAgICAgICAgICAgICAgICAgaG9yaXpTcGVlZCA+PSBiaXBlZFN0ZXBNaW5TcGVlZCAmJlxuICAgICAgICAgICAgICAgICAgICBmYWNpbmdJbnRvV2FsbCAmJlxuICAgICAgICAgICAgICAgICAgICBpc1dpdGhpblN0ZXBIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQmxlbmQgdGhlIG5vcm1hbCB1cHdhcmQuIFN0cm9uZ2VyIGJpYXMgd2hlbiBzdGVwIGlzIHNtYWxsLlxuICAgICAgICAgICAgICAgICAgICBjb25zdCB2b2wgPSBiMS52b2x1bWU7XG4gICAgICAgICAgICAgICAgICAgIGxldCB3ZWlnaHQgPSAxLjA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2b2wpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBib3R0b21ZID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2b2wudHlwZSA9PT0gJ0N1Ym9pZCcgJiYgdm9sLmV4dGVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3R0b21ZID0gYjEudm9sdW1lLmNlbnRlci55IC0gdm9sLmV4dGVudHMueTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHZvbC50eXBlID09PSAnU3BoZXJlJyAmJiB0eXBlb2Ygdm9sLnJhZGl1cyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3R0b21ZID0gYjEudm9sdW1lLmNlbnRlci55IC0gdm9sLnJhZGl1cztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHZvbC50eXBlID09PSAnRWxsaXBzb2lkJyAmJiB0eXBlb2Ygdm9sLmVmZmVjdGl2ZVJhZGl1cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvdHRvbVkgPSBiMS52b2x1bWUuY2VudGVyLnkgLSB2b2wuZWZmZWN0aXZlUmFkaXVzKHZlYzMudXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJvdHRvbVkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oYmlwZWRTdGVwSGVpZ2h0LCBjaG9zZW5Db250YWN0LnkgLSBib3R0b21ZKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gMS4wICsgYmlwZWRTdGVwVXBCaWFzICogKDEuMCAtIGggLyBiaXBlZFN0ZXBIZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gMS4wICsgYmlwZWRTdGVwVXBCaWFzICogMC41O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gMS4wICsgYmlwZWRTdGVwVXBCaWFzICogMC41O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0ZXBwZWQgPSB2ZWMzLmFkZChjaG9zZW5Ob3JtYWwsIHZlYzMuc2NhbGUodmVjMy51cCwgd2VpZ2h0LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSkubm9ybWFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgIGNob3Nlbk5vcm1hbCA9IHN0ZXBwZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY29ycmVjdGlvbiA9IHZlYzMuc2NhbGUoY2hvc2VuTm9ybWFsLCBjb3JyZWN0aW9uTWFnbml0dWRlLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgIC8vIE1vdmUgYjEgb3Bwb3NpdGUgbiwgYjIgYWxvbmcgbiAoc2FtZSBwYWlyaW5nIGFzIHZlbG9jaXR5IGltcHVsc2VzKVxuICAgICAgICAgICAgaWYgKGludmVyc2VNYXNzMSA+IDApIHtcbiAgICAgICAgICAgICAgICBiMS5hcHBseVBvc2l0aW9uQ29ycmVjdGlvbih2ZWMzLnNjYWxlKGNvcnJlY3Rpb24sIC1pbnZlcnNlTWFzczEsIG5ldyB2ZWMzKCkpKTtcbiAgICAgICAgICAgICAgICBhcHBsaWVkQ29ycmVjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYjIgJiYgaW52ZXJzZU1hc3MyID4gMCkge1xuICAgICAgICAgICAgICAgIGIyLmFwcGx5UG9zaXRpb25Db3JyZWN0aW9uKHZlYzMuc2NhbGUoY29ycmVjdGlvbiwgK2ludmVyc2VNYXNzMiwgbmV3IHZlYzMoKSkpO1xuICAgICAgICAgICAgICAgIGFwcGxpZWRDb3JyZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhcHBsaWVkQ29ycmVjdGlvbjtcbiAgICB9XG4gICAgdXBkYXRlQmlwZWRHcm91bmRTdGF0ZSgpIHtcbiAgICAgICAgLy8gTWFyayBiaXBlZHMgYXMgb25Hcm91bmQgb25seSBpZiBjb250YWN0IGlzIGJlbG93IGNlbnRlciBBTkRcbiAgICAgICAgLy8gdGhlIHN1cmZhY2Ugbm9ybWFsIGlzIHN1ZmZpY2llbnRseSB1cHdhcmQgKG5vdCBhIHdhbGwpLlxuICAgICAgICB0aGlzLmNvbGxpc2lvbk1hbmlmb2xkcy5mb3JFYWNoKCh7IGJvZGllcywgY29sbGlzaW9ucyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBbYjEsIGIyXSA9IGJvZGllcztcbiAgICAgICAgICAgIGNvbnN0IGIxSXNCaXBlZCA9IGIxLnR5cGUgPT09ICdCaXBlZCc7XG4gICAgICAgICAgICBjb25zdCBiMklzQmlwZWQgPSBiMiA/IGIyLnR5cGUgPT09ICdCaXBlZCcgOiBmYWxzZTtcbiAgICAgICAgICAgIGlmICghYjFJc0JpcGVkICYmICFiMklzQmlwZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY29sbGlzaW9ucy5mb3JFYWNoKCh7IGNvbnRhY3QsIG5vcm1hbCB9KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXNHcm91bmRpc2ggPSBub3JtYWwueSA+PSBncm91bmRNaW5Ob3JtYWxZO1xuICAgICAgICAgICAgICAgIGlmIChiMUlzQmlwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcjEgPSB2ZWMzLnN1YnRyYWN0KGNvbnRhY3QsIGIxLnZvbHVtZS5jZW50ZXIsIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocjEueSA8IDAgJiYgaXNHcm91bmRpc2gpXG4gICAgICAgICAgICAgICAgICAgICAgICBiMS5vbkdyb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChiMiAmJiBiMklzQmlwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcjIgPSB2ZWMzLnN1YnRyYWN0KGNvbnRhY3QsIGIyLnZvbHVtZS5jZW50ZXIsIG5ldyB2ZWMzKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocjIueSA8IDAgJiYgaXNHcm91bmRpc2gpXG4gICAgICAgICAgICAgICAgICAgICAgICBiMi5vbkdyb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgU2NlbmUucHJvdG90eXBlLCBcImdyYXZpdHlcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBTY2VuZS5wcm90b3R5cGUsIFwiZnJpY3Rpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBTY2VuZS5wcm90b3R5cGUsIFwicmVzdGl0dXRpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBTY2VuZS5wcm90b3R5cGUsIFwibGluZWFyRGFtcGluZ1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFNjZW5lLnByb3RvdHlwZSwgXCJhbmd1bGFyRGFtcGluZ1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKEVudGl0eSksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE9iamVjdClcbl0sIFNjZW5lLnByb3RvdHlwZSwgXCJlbnRpdGllc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKENvbGxpZGVyKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgU2NlbmUucHJvdG90eXBlLCBcImNvbGxpZGVyc1wiLCB2b2lkIDApO1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xudmFyIF9fbWV0YWRhdGEgPSAodGhpcyAmJiB0aGlzLl9fbWV0YWRhdGEpIHx8IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xufTtcbmltcG9ydCB7IFNlcmlhbGl6ZSwgU2VyaWFsaXphYmxlLCBVbmlmb3JtIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuaW1wb3J0IHsgbWF0MywgbWF0NCwgcXVhdCwgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICBzY2FsZSA9IHZlYzMub25lLmNvcHkoKTtcbiAgICByb3RhdGlvbiA9IHF1YXQuaWRlbnRpdHkuY29weSgpO1xuICAgIHRyYW5zbGF0aW9uID0gdmVjMy56ZXJvLmNvcHkoKTtcbiAgICBkaXJlY3Rpb24gPSBuZXcgdmVjMygpO1xuICAgIG1vZGVsTWF0cml4ID0gbmV3IG1hdDQoKTtcbiAgICBub3JtYWxNYXRyaXggPSBuZXcgbWF0MygpO1xuICAgIHJvdGF0aW9uTWF0cml4ID0gbmV3IG1hdDMoKTtcbiAgICBzdGF0aWMgb3JpZ2luID0gbmV3IFRyYW5zZm9ybSgpO1xuICAgIGNvbnN0cnVjdG9yKHsgdHJhbnNsYXRpb24gPSB2ZWMzLnplcm8sIHJvdGF0aW9uID0gcXVhdC5pZGVudGl0eSwgc2NhbGUgPSB2ZWMzLm9uZSB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IHRyYW5zbGF0aW9uLmNvcHkoKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHJvdGF0aW9uLmNvcHkoKTtcbiAgICAgICAgdGhpcy5zY2FsZSA9IHNjYWxlLmNvcHkoKTtcbiAgICB9XG4gICAgdXBkYXRlKGRlbHRhVGltZSkge1xuICAgICAgICBtYXQ0LmNvbnN0cnVjdCh0aGlzLnRyYW5zbGF0aW9uLCB0aGlzLnJvdGF0aW9uLCB0aGlzLnNjYWxlLCB0aGlzLm1vZGVsTWF0cml4KTtcbiAgICAgICAgdGhpcy5tb2RlbE1hdHJpeC50b01hdDModGhpcy5yb3RhdGlvbk1hdHJpeCk7XG4gICAgICAgIHRoaXMucm90YXRpb25NYXRyaXgucm93KDIsIHRoaXMuZGlyZWN0aW9uKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbk1hdHJpeC5pbnZlcnQodGhpcy5ub3JtYWxNYXRyaXgpLnRyYW5zcG9zZSgpO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgVHJhbnNmb3JtLnByb3RvdHlwZSwgXCJzY2FsZVwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHF1YXQpXG5dLCBUcmFuc2Zvcm0ucHJvdG90eXBlLCBcInJvdGF0aW9uXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMylcbl0sIFRyYW5zZm9ybS5wcm90b3R5cGUsIFwidHJhbnNsYXRpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgVHJhbnNmb3JtLnByb3RvdHlwZSwgXCJkaXJlY3Rpb25cIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgVHJhbnNmb3JtLnByb3RvdHlwZSwgXCJtb2RlbE1hdHJpeFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBUcmFuc2Zvcm0ucHJvdG90eXBlLCBcIm5vcm1hbE1hdHJpeFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBUcmFuc2Zvcm0ucHJvdG90eXBlLCBcInJvdGF0aW9uTWF0cml4XCIsIHZvaWQgMCk7XG4iLCJleHBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vcmVuZGVyZXIvc3RhdGUnO1xuZXhwb3J0IHsgUmVuZGVyZXIgfSBmcm9tICcuL3JlbmRlcmVyL3JlbmRlcmVyJztcbmV4cG9ydCB7IE1lc2hlcyB9IGZyb20gJy4vbWFuYWdlcnMvbWVzaGVzJztcbmV4cG9ydCB7IEJ1ZmZlcnMgfSBmcm9tICcuL21hbmFnZXJzL2J1ZmZlcnMnO1xuZXhwb3J0IHsgU2hhZGVycyB9IGZyb20gJy4vbWFuYWdlcnMvc2hhZGVycyc7XG5leHBvcnQgeyBUZXh0dXJlcyB9IGZyb20gJy4vbWFuYWdlcnMvdGV4dHVyZXMnO1xuZXhwb3J0IHsgUHJvZ3JhbXMgfSBmcm9tICcuL21hbmFnZXJzL3Byb2dyYW1zJztcbmV4cG9ydCB7IFNhbXBsZXJzIH0gZnJvbSAnLi9tYW5hZ2Vycy9zYW1wbGVycyc7XG5leHBvcnQgeyBSZW5kZXJQYXNzIH0gZnJvbSAnLi9yZW5kZXJlci9wYXNzJztcbmV4cG9ydCB7IFJlbmRlclRhcmdldCB9IGZyb20gJy4vcmVuZGVyZXIvdGFyZ2V0JztcbmV4cG9ydCB7IFN1cmZhY2UgfSBmcm9tICcuL3JlbmRlcmVyL3N1cmZhY2UnO1xuZXhwb3J0IHsgTWF0ZXJpYWwgfSBmcm9tICcuL3JlbmRlcmVyL21hdGVyaWFsJztcbmV4cG9ydCB7IEFybWF0dXJlIH0gZnJvbSAnLi9yZW5kZXJlci9hcm1hdHVyZSc7XG5leHBvcnQgeyBBbmltYXRpb24gfSBmcm9tICcuL3JlbmRlcmVyL2FuaW1hdGlvbic7XG5leHBvcnQgeyBQYXJ0aXRpb24gfSBmcm9tICcuL3JlbmRlcmVyL3BhcnRpdGlvbic7XG5leHBvcnQgeyBCb25lIH0gZnJvbSAnLi9yZW5kZXJlci9ib25lJztcbmV4cG9ydCB7IFdlaWdodCB9IGZyb20gJy4vcmVuZGVyZXIvd2VpZ2h0JztcbmV4cG9ydCB7IEtleWZyYW1lLCBTY2FsZUtleWZyYW1lLCBSb3RhdGlvbktleWZyYW1lLCBUcmFuc2xhdGlvbktleWZyYW1lIH0gZnJvbSAnLi9yZW5kZXJlci9rZXlmcmFtZSc7XG4iLCJleHBvcnQgY2xhc3MgQnVmZmVycyB7XG4gICAgZ2w7XG4gICAgYnVmZmVycyA9IFtdO1xuICAgIGJvdW5kQnVmZmVycyA9IHt9O1xuICAgIGNvbnN0cnVjdG9yKGdsKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB9XG4gICAgY3JlYXRlKHRhcmdldCwgZGF0YSkge1xuICAgICAgICBzd2l0Y2ggKHRhcmdldCkge1xuICAgICAgICAgICAgY2FzZSAnRnJhbWVCdWZmZXInOlxuICAgICAgICAgICAgICAgIGNvbnN0IGZyYW1lQnVmZmVyID0gdGhpcy5nbC5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIGZyYW1lQnVmZmVyLnRhcmdldCA9IHRoaXMuZ2wuRlJBTUVCVUZGRVI7XG4gICAgICAgICAgICAgICAgZnJhbWVCdWZmZXIuYXR0YWNobWVudHMgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcnMucHVzaChmcmFtZUJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyYW1lQnVmZmVyO1xuICAgICAgICAgICAgY2FzZSAnUmVuZGVyQnVmZmVyJzpcbiAgICAgICAgICAgICAgICBjb25zdCByZW5kZXJCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIHJlbmRlckJ1ZmZlci50YXJnZXQgPSB0aGlzLmdsLlJFTkRFUkJVRkZFUjtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcnMucHVzaChyZW5kZXJCdWZmZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZW5kZXJCdWZmZXI7XG4gICAgICAgICAgICBjYXNlICdVbmlmb3JtQnVmZmVyJzpcbiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci50YXJnZXQgPSB0aGlzLmdsLlVOSUZPUk1fQlVGRkVSO1xuICAgICAgICAgICAgICAgIGJ1ZmZlci51c2FnZSA9IHRoaXMuZ2wuRFlOQU1JQ19EUkFXO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKGJ1ZmZlciwgZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVycy5wdXNoKGJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGJ1ZmZlciB0YXJnZXQ6ICR7dGFyZ2V0fWApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZShidWZmZXIsIGRhdGEsIG9mZnNldCkge1xuICAgICAgICB0aGlzLmJpbmQoYnVmZmVyKTtcbiAgICAgICAgaWYgKG9mZnNldCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmJ1ZmZlclN1YkRhdGEoYnVmZmVyLnRhcmdldCwgb2Zmc2V0LCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuYnVmZmVyRGF0YShidWZmZXIudGFyZ2V0LCBkYXRhLCBidWZmZXIudXNhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvcm1hdChidWZmZXIsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICB0aGlzLmJpbmQoYnVmZmVyKTtcbiAgICAgICAgdGhpcy5nbC5yZW5kZXJidWZmZXJTdG9yYWdlKGJ1ZmZlci50YXJnZXQsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuICAgIGF0dGFjaChmcmFtZUJ1ZmZlciwgZGF0YSwgYXR0YWNobWVudCkge1xuICAgICAgICB0aGlzLmJpbmQoZnJhbWVCdWZmZXIpO1xuICAgICAgICBzd2l0Y2ggKGRhdGEudGFyZ2V0KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuVEVYVFVSRV8yRDpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKGZyYW1lQnVmZmVyLnRhcmdldCwgYXR0YWNobWVudCwgZGF0YS50YXJnZXQsIGRhdGEsIDApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmdsLlJFTkRFUkJVRkZFUjpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKGZyYW1lQnVmZmVyLnRhcmdldCwgYXR0YWNobWVudCwgdGhpcy5nbC5SRU5ERVJCVUZGRVIsIGRhdGEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmdsLmNoZWNrRnJhbWVidWZmZXJTdGF0dXModGhpcy5nbC5GUkFNRUJVRkZFUikgIT09IHRoaXMuZ2wuRlJBTUVCVUZGRVJfQ09NUExFVEUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRnJhbWVidWZmZXIgaXMgaW5jb21wbGV0ZScpO1xuICAgICAgICB9XG4gICAgICAgIGZyYW1lQnVmZmVyLmF0dGFjaG1lbnRzW2F0dGFjaG1lbnRdID0gZGF0YTtcbiAgICB9XG4gICAgYmluZChidWZmZXIpIHtcbiAgICAgICAgY29uc3QgeyB0YXJnZXQgfSA9IGJ1ZmZlcjtcbiAgICAgICAgY29uc3QgYm91bmRCdWZmZXIgPSB0aGlzLmJvdW5kQnVmZmVyc1t0YXJnZXRdO1xuICAgICAgICBpZiAoYm91bmRCdWZmZXIgPT09IGJ1ZmZlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodGFyZ2V0KSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRlJBTUVCVUZGRVI6XG4gICAgICAgICAgICAgICAgLypjb25zdCBmcmFtZUJ1ZmZlciA9IGJ1ZmZlciBhcyBGcmFtZUJ1ZmZlclxuICAgICAgICBcbiAgICAgICAgICAgICAgICBPYmplY3QudmFsdWVzKGZyYW1lQnVmZmVyLmF0dGFjaG1lbnRzKS5mb3JFYWNoKChhdHRhY2htZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0dXJlID0gYXR0YWNobWVudCBhcyBUZXh0dXJlXG4gICAgICAgICAgICAgICAgICBjb25zdCB7IHRhcmdldCwgdXNlTWlwbWFwcyB9ID0gdGV4dHVyZVxuICAgICAgICBcbiAgICAgICAgICAgICAgICAgIGlmICh1c2VNaXBtYXBzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXh0dXJlKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmdlbmVyYXRlTWlwbWFwKHRhcmdldClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSovXG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kRnJhbWVidWZmZXIodGFyZ2V0LCBidWZmZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmdsLlJFTkRFUkJVRkZFUjpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRSZW5kZXJidWZmZXIodGFyZ2V0LCBidWZmZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGFyZ2V0LCBidWZmZXIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYm91bmRCdWZmZXJzW3RhcmdldF0gPSBidWZmZXI7XG4gICAgfVxuICAgIHVuYmluZCh0YXJnZXQpIHtcbiAgICAgICAgc3dpdGNoICh0YXJnZXQpIHtcbiAgICAgICAgICAgIGNhc2UgJ0ZyYW1lQnVmZmVyJzpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLmJpbmRGcmFtZWJ1ZmZlcih0aGlzLmdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1JlbmRlckJ1ZmZlcic6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kUmVuZGVyYnVmZmVyKHRoaXMuZ2wuUkVOREVSQlVGRkVSLCBudWxsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1VuaWZvcm1CdWZmZXInOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLlVOSUZPUk1fQlVGRkVSLCBudWxsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImNvbnN0IHZlcnRleFNpemUgPSA4OyAvLyBwb3NpdGlvbiAoeHl6KSArIG5vcm1hbCAoeHl6KSArIHRleHR1cmUgY29vcmRpbmF0ZXMgKHV2KVxuY29uc3Qgc3RyaWRlID0gdmVydGV4U2l6ZSAqIEZsb2F0MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVDtcbmV4cG9ydCBjbGFzcyBNZXNoZXMge1xuICAgIGdsO1xuICAgIGNvbnN0cnVjdG9yKGdsKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB9XG4gICAgY3JlYXRlKHBhcnRpdGlvbiwgbWF0ZXJpYWwpIHtcbiAgICAgICAgaWYgKCFwYXJ0aXRpb24udG9wb2xvZ3kpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWVzaCBoYXMgbm8gdG9wb2xvZ3knKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXBhcnRpdGlvbi52ZXJ0aWNlcyB8fCBwYXJ0aXRpb24udmVydGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01lc2ggaGFzIG5vIHZlcnRpY2VzJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmVydGV4QXJyYXkgPSB0aGlzLmdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gICAgICAgIHZlcnRleEFycmF5LnRvcG9sb2d5ID0gcGFydGl0aW9uLnRvcG9sb2d5O1xuICAgICAgICB2ZXJ0ZXhBcnJheS52ZXJ0ZXhDb3VudCA9IHBhcnRpdGlvbi52ZXJ0aWNlcy5sZW5ndGggLyB2ZXJ0ZXhTaXplO1xuICAgICAgICBjb25zdCB2ZXJ0ZXhCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICBjb25zdCB2ZXJ0aWNlcyA9IG5ldyBGbG9hdDMyQXJyYXkocGFydGl0aW9uLnZlcnRpY2VzKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xuICAgICAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGhpcy5nbC5BUlJBWV9CVUZGRVIsIHZlcnRpY2VzLCB0aGlzLmdsLlNUQVRJQ19EUkFXKTtcbiAgICAgICAgY29uc3QgYm9uZUluZGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KHZlcnRleEFycmF5LnZlcnRleENvdW50ICogNCk7XG4gICAgICAgIGNvbnN0IGJvbmVXZWlnaHRzID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXhBcnJheS52ZXJ0ZXhDb3VudCAqIDQpO1xuICAgICAgICBwYXJ0aXRpb24ud2VpZ2h0cy5mb3JFYWNoKCh3ZWlnaHQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBib25lSW5kaWNlcy5zZXQod2VpZ2h0LmluZGljZXMsIGluZGV4ICogNCk7XG4gICAgICAgICAgICBib25lV2VpZ2h0cy5zZXQod2VpZ2h0LndlaWdodHMsIGluZGV4ICogNCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBib25lSW5kZXhCdWZmZXIgPSB0aGlzLmdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB0aGlzLmdsLmJpbmRCdWZmZXIodGhpcy5nbC5BUlJBWV9CVUZGRVIsIGJvbmVJbmRleEJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZ2wuYnVmZmVyRGF0YSh0aGlzLmdsLkFSUkFZX0JVRkZFUiwgYm9uZUluZGljZXMsIHRoaXMuZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICBjb25zdCBib25lV2VpZ2h0QnVmZmVyID0gdGhpcy5nbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCBib25lV2VpZ2h0QnVmZmVyKTtcbiAgICAgICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCBib25lV2VpZ2h0cywgdGhpcy5nbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGxldCBpbmRleEJ1ZmZlciA9IG51bGw7XG4gICAgICAgIGlmIChwYXJ0aXRpb24uaW5kaWNlcyAmJiBwYXJ0aXRpb24uaW5kaWNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpbmRleEJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgICAgICBjb25zdCBpbmRpY2VzID0gbmV3IFVpbnQxNkFycmF5KHBhcnRpdGlvbi5pbmRpY2VzKTtcbiAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcik7XG4gICAgICAgICAgICB0aGlzLmdsLmJ1ZmZlckRhdGEodGhpcy5nbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlcywgdGhpcy5nbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheS5pbmRleENvdW50ID0gaW5kaWNlcy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2ZXJ0ZXhBcnJheS5pbmRleENvdW50ID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdsLmJpbmRWZXJ0ZXhBcnJheSh2ZXJ0ZXhBcnJheSk7XG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcbiAgICAgICAgLy8gcG9zaXRpb25cbiAgICAgICAgdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgwKTtcbiAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDAsIDMsIHRoaXMuZ2wuRkxPQVQsIGZhbHNlLCBzdHJpZGUsIDApO1xuICAgICAgICAvLyBub3JtYWxcbiAgICAgICAgdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgxKTtcbiAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDEsIDMsIHRoaXMuZ2wuRkxPQVQsIHRydWUsIHN0cmlkZSwgMyAqIEZsb2F0MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVCk7XG4gICAgICAgIC8vIGNvb3JkaW5hdGVzXG4gICAgICAgIHRoaXMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoMik7XG4gICAgICAgIHRoaXMuZ2wudmVydGV4QXR0cmliUG9pbnRlcigyLCAyLCB0aGlzLmdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLCA2ICogRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UKTtcbiAgICAgICAgLy8gYm9uZSBpbmRpY2VzXG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgYm9uZUluZGV4QnVmZmVyKTtcbiAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKDMsIDQsIHRoaXMuZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICAgICAgdGhpcy5nbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSgzKTtcbiAgICAgICAgLy8gYm9uZSB3ZWlnaHRzXG4gICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkFSUkFZX0JVRkZFUiwgYm9uZVdlaWdodEJ1ZmZlcik7XG4gICAgICAgIHRoaXMuZ2wudmVydGV4QXR0cmliUG9pbnRlcig0LCA0LCB0aGlzLmdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICAgIHRoaXMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoNCk7XG4gICAgICAgIC8vIGluZGljZXNcbiAgICAgICAgaWYgKGluZGV4QnVmZmVyICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlcih0aGlzLmdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgICAgIHJldHVybiB7IHZlcnRleEFycmF5LCBtYXRlcmlhbCB9O1xuICAgIH1cbiAgICByZW5kZXIobWVzaCkge1xuICAgICAgICBjb25zdCB7IHZlcnRleEFycmF5IH0gPSBtZXNoO1xuICAgICAgICBjb25zdCB7IHRvcG9sb2d5LCB2ZXJ0ZXhDb3VudCwgaW5kZXhDb3VudCB9ID0gdmVydGV4QXJyYXk7XG4gICAgICAgIGlmICghdmVydGV4QXJyYXkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWVzaCBoYXMgbm8gdmVydGV4IGFycmF5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG1vZGU7XG4gICAgICAgIHN3aXRjaCAodG9wb2xvZ3kpIHtcbiAgICAgICAgICAgIGNhc2UgJ1BvaW50cyc6XG4gICAgICAgICAgICAgICAgbW9kZSA9IHRoaXMuZ2wuUE9JTlRTO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTGluZXMnOlxuICAgICAgICAgICAgICAgIG1vZGUgPSB0aGlzLmdsLkxJTkVTO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTGluZUxvb3AnOlxuICAgICAgICAgICAgICAgIG1vZGUgPSB0aGlzLmdsLkxJTkVfTE9PUDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0xpbmVTdHJpcCc6XG4gICAgICAgICAgICAgICAgbW9kZSA9IHRoaXMuZ2wuTElORV9TVFJJUDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1RyaWFuZ2xlcyc6XG4gICAgICAgICAgICAgICAgbW9kZSA9IHRoaXMuZ2wuVFJJQU5HTEVTO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnVHJpYW5nbGVGYW4nOlxuICAgICAgICAgICAgICAgIG1vZGUgPSB0aGlzLmdsLlRSSUFOR0xFX0ZBTjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1RyaWFuZ2xlU3RyaXAnOlxuICAgICAgICAgICAgICAgIG1vZGUgPSB0aGlzLmdsLlRSSUFOR0xFX1NUUklQO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdG9wb2xvZ3k6ICR7dG9wb2xvZ3l9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC5iaW5kVmVydGV4QXJyYXkodmVydGV4QXJyYXkpO1xuICAgICAgICBpZiAodmVydGV4QXJyYXkuaW5kZXhDb3VudCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZHJhd0VsZW1lbnRzKG1vZGUsIGluZGV4Q291bnQsIHRoaXMuZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nbC5kcmF3QXJyYXlzKG1vZGUsIDAsIHZlcnRleENvdW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUHJvZ3JhbXMge1xuICAgIGdsO1xuICAgIHByb2dyYW1zID0gW107XG4gICAgdXNlZFByb2dyYW07IC8vIFRPRE86IHNob3VsZCBiZSAnYm91bmRQcm9ncmFtJyBmb3Igc2FrZSBvZiBjb25zaXN0ZW5jeVxuICAgIGNvbnN0cnVjdG9yKGdsKSB7XG4gICAgICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB9XG4gICAgY3JlYXRlKHZlcnRleFNoYWRlciwgZnJhZ21lbnRTaGFkZXIsIGRhdGEpIHtcbiAgICAgICAgbGV0IHByb2dyYW0gPSB0aGlzLmdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgdGhpcy5nbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4U2hhZGVyKTtcbiAgICAgICAgdGhpcy5nbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICB0aGlzLmdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuICAgICAgICBjb25zdCBsaW5rZWQgPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgdGhpcy5nbC5MSU5LX1NUQVRVUyk7XG4gICAgICAgIGlmICghbGlua2VkIHx8ICF0aGlzLmdsLmlzUHJvZ3JhbShwcm9ncmFtKSkge1xuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25zb2xlXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHRoaXMuZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXR1cEF0dHJpYnV0ZXMocHJvZ3JhbSk7XG4gICAgICAgIHRoaXMuc2V0dXBVbmlmb3Jtcyhwcm9ncmFtKTtcbiAgICAgICAgdGhpcy5zZXR1cFVuaWZvcm1CbG9ja3MocHJvZ3JhbSk7XG4gICAgICAgIHRoaXMuc2V0dXBUZXh1cmVTbG90cyhwcm9ncmFtKTtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHByb2dyYW0sIGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvZ3JhbXMucHVzaChwcm9ncmFtKTtcbiAgICAgICAgcmV0dXJuIHByb2dyYW07XG4gICAgfVxuICAgIHVwZGF0ZShwcm9ncmFtLCBkYXRhKSB7XG4gICAgICAgIHRoaXMudXNlKHByb2dyYW0pO1xuICAgICAgICBpZiAoZGF0YS51bmlmb3Jtcykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoZGF0YS51bmlmb3JtcykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZGF0YS51bmlmb3Jtc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdTa2lwcGluZyB1bmRlZmluZWQgdW5pZm9ybSB2YWx1ZTonLCBuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCB1bmlmb3JtID0gcHJvZ3JhbS51bmlmb3Jtc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAodW5pZm9ybSkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHVuaWZvcm0udHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB0aGlzLmdsLlNBTVBMRVJfMkQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzbG90ID0gcHJvZ3JhbS50ZXh0dXJlU2xvdHNbbmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuYWN0aXZlVGV4dHVyZSh0aGlzLmdsLlRFWFRVUkUwICsgc2xvdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5iaW5kVGV4dHVyZSh0ZXh0dXJlLnRhcmdldCwgdGV4dHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuZ2wuQk9PTDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTFpKHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlID8gMSA6IDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSB0aGlzLmdsLklOVDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTFpKHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTFmKHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9WRUMyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtMmZ2KHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9WRUMzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtM2Z2KHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9WRUM0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtNGZ2KHVuaWZvcm0ubG9jYXRpb24sIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9NQVQyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtTWF0cml4MmZ2KHVuaWZvcm0ubG9jYXRpb24sIGZhbHNlLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRkxPQVRfTUFUMzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdHJpeCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybU1hdHJpeDNmdih1bmlmb3JtLmxvY2F0aW9uLCBmYWxzZSwgbWF0cml4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgdGhpcy5nbC5GTE9BVF9NQVQ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0cml4ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtTWF0cml4NGZ2KHVuaWZvcm0ubG9jYXRpb24sIGZhbHNlLCBtYXRyaXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2V0IHVuaWZvcm0gdmFsdWU6JywgbmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdBdHRlbXB0aW5nIHRvIHVwZGF0ZSBub24tZXhpc3RlbnQgdW5pZm9ybTonLCBuYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS51bmlmb3JtQnVmZmVycykge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoZGF0YS51bmlmb3JtQnVmZmVycykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1CbG9jayA9IHByb2dyYW0udW5pZm9ybUJsb2Nrc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAodW5pZm9ybUJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmluZEJ1ZmZlckJhc2UodGhpcy5nbC5VTklGT1JNX0JVRkZFUiwgdW5pZm9ybUJsb2NrLmluZGV4LCBkYXRhLnVuaWZvcm1CdWZmZXJzW25hbWVdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB1c2UocHJvZ3JhbSkge1xuICAgICAgICBpZiAodGhpcy51c2VkUHJvZ3JhbSA9PT0gcHJvZ3JhbSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgICAgdGhpcy51c2VkUHJvZ3JhbSA9IHByb2dyYW07XG4gICAgfVxuICAgIHNldHVwQXR0cmlidXRlcyhwcm9ncmFtKSB7XG4gICAgICAgIHByb2dyYW0uYXR0cmlidXRlcyA9IHt9O1xuICAgICAgICBjb25zdCBhY3RpdmVBdHRyaWJ1dGVzID0gdGhpcy5nbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIHRoaXMuZ2wuQUNUSVZFX0FUVFJJQlVURVMpO1xuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYWN0aXZlQXR0cmlidXRlczsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gdGhpcy5nbC5nZXRBY3RpdmVBdHRyaWIocHJvZ3JhbSwgaW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLmdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIGF0dHJpYnV0ZS5uYW1lKTtcbiAgICAgICAgICAgIGF0dHJpYnV0ZS5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgcHJvZ3JhbS5hdHRyaWJ1dGVzW2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXR1cFVuaWZvcm1zKHByb2dyYW0pIHtcbiAgICAgICAgcHJvZ3JhbS51bmlmb3JtcyA9IHt9O1xuICAgICAgICBjb25zdCBhY3RpdmVVbmlmb3JtcyA9IHRoaXMuZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9VTklGT1JNUyk7XG4gICAgICAgIGZvciAobGV0IHVuaWZvcm1JbmRleCA9IDA7IHVuaWZvcm1JbmRleCA8IGFjdGl2ZVVuaWZvcm1zOyB1bmlmb3JtSW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybSA9IHRoaXMuZ2wuZ2V0QWN0aXZlVW5pZm9ybShwcm9ncmFtLCB1bmlmb3JtSW5kZXgpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNVbmlmb3JtQXJyYXkodW5pZm9ybSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gdW5pZm9ybS5uYW1lLnJlcGxhY2UoL1xcWzBcXF0kLywgJycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgbmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybS5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtLnVuaWZvcm1zW25hbWVdID0gdW5pZm9ybTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIHVuaWZvcm0ubmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybS5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtLnVuaWZvcm1zW3VuaWZvcm0ubmFtZV0gPSB1bmlmb3JtO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXR1cFVuaWZvcm1CbG9ja3MocHJvZ3JhbSkge1xuICAgICAgICBwcm9ncmFtLnVuaWZvcm1CbG9ja3MgPSB7fTtcbiAgICAgICAgY29uc3QgYWN0aXZlVW5pZm9ybUJsb2NrcyA9IHRoaXMuZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9VTklGT1JNX0JMT0NLUyk7XG4gICAgICAgIGZvciAobGV0IGJsb2NrSW5kZXggPSAwOyBibG9ja0luZGV4IDwgYWN0aXZlVW5pZm9ybUJsb2NrczsgYmxvY2tJbmRleCsrKSB7XG4gICAgICAgICAgICBjb25zdCB1bmlmb3JtQmxvY2tOYW1lID0gdGhpcy5nbC5nZXRBY3RpdmVVbmlmb3JtQmxvY2tOYW1lKHByb2dyYW0sIGJsb2NrSW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybUJsb2NrSW5kZXggPSB0aGlzLmdsLmdldFVuaWZvcm1CbG9ja0luZGV4KHByb2dyYW0sIHVuaWZvcm1CbG9ja05hbWUpO1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybUJsb2NrQmluZGluZyA9IHVuaWZvcm1CbG9ja0luZGV4O1xuICAgICAgICAgICAgdGhpcy5nbC51bmlmb3JtQmxvY2tCaW5kaW5nKHByb2dyYW0sIHVuaWZvcm1CbG9ja0luZGV4LCB1bmlmb3JtQmxvY2tCaW5kaW5nKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1JbmRpY2VzID0gdGhpcy5nbC5nZXRBY3RpdmVVbmlmb3JtQmxvY2tQYXJhbWV0ZXIocHJvZ3JhbSwgYmxvY2tJbmRleCwgdGhpcy5nbC5VTklGT1JNX0JMT0NLX0FDVElWRV9VTklGT1JNX0lORElDRVMpO1xuICAgICAgICAgICAgY29uc3QgdW5pZm9ybU9mZnNldHMgPSB0aGlzLmdsLmdldEFjdGl2ZVVuaWZvcm1zKHByb2dyYW0sIHVuaWZvcm1JbmRpY2VzLCB0aGlzLmdsLlVOSUZPUk1fT0ZGU0VUKTtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1PZmZzZXRzQnlOYW1lID0gdW5pZm9ybUluZGljZXMucmVkdWNlKChvZmZzZXRzLCB1bmlmb3JtSW5kZXgsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdW5pZm9ybSA9IHRoaXMuZ2wuZ2V0QWN0aXZlVW5pZm9ybShwcm9ncmFtLCB1bmlmb3JtSW5kZXgpO1xuICAgICAgICAgICAgICAgIG9mZnNldHNbdW5pZm9ybS5uYW1lXSA9IHVuaWZvcm1PZmZzZXRzW2luZGV4XTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2Zmc2V0cztcbiAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgICAgIHByb2dyYW0udW5pZm9ybUJsb2Nrc1t1bmlmb3JtQmxvY2tOYW1lXSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiB1bmlmb3JtQmxvY2tOYW1lLFxuICAgICAgICAgICAgICAgIGluZGV4OiB1bmlmb3JtQmxvY2tJbmRleCxcbiAgICAgICAgICAgICAgICBiaW5kaW5nOiB1bmlmb3JtQmxvY2tCaW5kaW5nLFxuICAgICAgICAgICAgICAgIG9mZnNldHM6IHVuaWZvcm1PZmZzZXRzQnlOYW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHNldHVwVGV4dXJlU2xvdHMocHJvZ3JhbSkge1xuICAgICAgICBwcm9ncmFtLnRleHR1cmVTbG90cyA9IHt9O1xuICAgICAgICBsZXQgc2xvdCA9IDA7XG4gICAgICAgIHRoaXMudXNlKHByb2dyYW0pO1xuICAgICAgICBPYmplY3Qua2V5cyhwcm9ncmFtLnVuaWZvcm1zKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB1bmlmb3JtID0gcHJvZ3JhbS51bmlmb3Jtc1tuYW1lXTtcbiAgICAgICAgICAgIGlmICh1bmlmb3JtLnR5cGUgPT09IHRoaXMuZ2wuU0FNUExFUl8yRCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wudW5pZm9ybTFpKHVuaWZvcm0ubG9jYXRpb24sIHNsb3QpO1xuICAgICAgICAgICAgICAgIHByb2dyYW0udGV4dHVyZVNsb3RzW25hbWVdID0gc2xvdDtcbiAgICAgICAgICAgICAgICBzbG90ID0gc2xvdCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpc1VuaWZvcm1BcnJheSh1bmlmb3JtKSB7XG4gICAgICAgIHJldHVybiB1bmlmb3JtLnNpemUgPiAxO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBTYW1wbGVycyB7XG4gICAgZ2w7XG4gICAgc2FtcGxlcnMgPSBbXTtcbiAgICBib3VuZFNhbXBsZXJzID0ge307XG4gICAgY29uc3RydWN0b3IoZ2wpIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgIH1cbiAgICBjcmVhdGUoZmlsdGVyaW5nID0gJ05vbmUnLCB0aWxpbmcgPSAnTm9uZScpIHtcbiAgICAgICAgbGV0IHNhbXBsZXIgPSB0aGlzLmdsLmNyZWF0ZVNhbXBsZXIoKTtcbiAgICAgICAgdGhpcy51cGRhdGUoc2FtcGxlciwgZmlsdGVyaW5nLCB0aWxpbmcpO1xuICAgICAgICB0aGlzLnNhbXBsZXJzLnB1c2goc2FtcGxlcik7XG4gICAgICAgIHJldHVybiBzYW1wbGVyO1xuICAgIH1cbiAgICB1cGRhdGUoc2FtcGxlciwgZmlsdGVyaW5nLCB0aWxpbmcpIHtcbiAgICAgICAgc3dpdGNoIChmaWx0ZXJpbmcpIHtcbiAgICAgICAgICAgIGNhc2UgJ05vbmUnOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX01BR19GSUxURVIsIHRoaXMuZ2wuTkVBUkVTVCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgdGhpcy5nbC5ORUFSRVNUKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0xpbmVhcic6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5nbC5ORUFSRVNUKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCB0aGlzLmdsLkxJTkVBUl9NSVBNQVBfTkVBUkVTVCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdCaWxpbmVhcic6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5nbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMuZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1RyaWxpbmVhcic6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgdGhpcy5nbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX01JTl9GSUxURVIsIHRoaXMuZ2wuTElORUFSX01JUE1BUF9MSU5FQVIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodGlsaW5nKSB7XG4gICAgICAgICAgICBjYXNlICdSZXBlYXQnOlxuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfUywgdGhpcy5nbC5SRVBFQVQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfVCwgdGhpcy5nbC5SRVBFQVQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTWlycm9yJzpcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1MsIHRoaXMuZ2wuTUlSUk9SRURfUkVQRUFUKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdsLnNhbXBsZXJQYXJhbWV0ZXJpKHNhbXBsZXIsIHRoaXMuZ2wuVEVYVFVSRV9XUkFQX1QsIHRoaXMuZ2wuTUlSUk9SRURfUkVQRUFUKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhpcy5nbC5zYW1wbGVyUGFyYW1ldGVyaShzYW1wbGVyLCB0aGlzLmdsLlRFWFRVUkVfV1JBUF9TLCB0aGlzLmdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2wuc2FtcGxlclBhcmFtZXRlcmkoc2FtcGxlciwgdGhpcy5nbC5URVhUVVJFX1dSQVBfVCwgdGhpcy5nbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzYW1wbGVyLmZpbHRlcmluZyA9IGZpbHRlcmluZztcbiAgICAgICAgc2FtcGxlci50aWxpbmcgPSB0aWxpbmc7XG4gICAgfVxuICAgIGJpbmQoc2FtcGxlciwgdW5pdCkge1xuICAgICAgICBpZiAodGhpcy5ib3VuZFNhbXBsZXJzW3VuaXRdID09PSBzYW1wbGVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC5iaW5kU2FtcGxlcih0aGlzLmdsLlRFWFRVUkUwICsgdW5pdCwgc2FtcGxlcik7XG4gICAgICAgIHRoaXMuYm91bmRTYW1wbGVyc1t1bml0XSA9IHNhbXBsZXI7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFNoYWRlcnMge1xuICAgIGdsO1xuICAgIHNoYWRlcnMgPSBbXTtcbiAgICBjb25zdHJ1Y3RvcihnbCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgfVxuICAgIGNyZWF0ZShzdGFnZSwgc291cmNlLCBoZWFkZXJzKSB7XG4gICAgICAgIGxldCB0eXBlO1xuICAgICAgICBzd2l0Y2ggKHN0YWdlKSB7XG4gICAgICAgICAgICBjYXNlICdWZXJ0ZXgnOlxuICAgICAgICAgICAgICAgIHR5cGUgPSB0aGlzLmdsLlZFUlRFWF9TSEFERVI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdGcmFnbWVudCc6XG4gICAgICAgICAgICAgICAgdHlwZSA9IHRoaXMuZ2wuRlJBR01FTlRfU0hBREVSO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoZWFkZXJzICYmIGhlYWRlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGVhZGVyc1xuICAgICAgICAgICAgICAgIC5zbGljZSgpXG4gICAgICAgICAgICAgICAgLnJldmVyc2UoKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBgJHtoZWFkZXJ9XFxuJHtzb3VyY2V9YDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzaGFkZXIgPSB0aGlzLmdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcbiAgICAgICAgdGhpcy5nbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzb3VyY2UpO1xuICAgICAgICB0aGlzLmdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgICAgc2hhZGVyLmlzQ29tcGlsZWQgPSB0aGlzLmdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIHRoaXMuZ2wuQ09NUElMRV9TVEFUVVMpO1xuICAgICAgICBpZiAoIXNoYWRlci5pc0NvbXBpbGVkIHx8ICF0aGlzLmdsLmlzU2hhZGVyKHNoYWRlcikpIHtcbiAgICAgICAgICAgIHNvdXJjZS5zcGxpdCgnXFxuJykuZm9yRWFjaCgobGluZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtpbmRleCArIDF9XFx0JHtsaW5lfWApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbnNvbGVcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IodGhpcy5nbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikpO1xuICAgICAgICAgICAgdGhpcy5nbC5kZWxldGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2hhZGVycy5wdXNoKHNoYWRlcik7XG4gICAgICAgIHJldHVybiBzaGFkZXI7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFRleHR1cmVzIHtcbiAgICBnbDtcbiAgICB0ZXh0dXJlcyA9IFtdO1xuICAgIGJvdW5kVGV4dHVyZXMgPSB7fTtcbiAgICBjb25zdHJ1Y3RvcihnbCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgfVxuICAgIGNyZWF0ZShzdXJmYWNlKSB7XG4gICAgICAgIGNvbnN0IHsgZ2wgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGNvbnN0IHsgd2lkdGggPSAxLCBoZWlnaHQgPSAxLCBwcmVjaXNpb24gPSA4LCBmb3JtYXQgPSAnQ29sb3InIH0gPSBzdXJmYWNlO1xuICAgICAgICBjb25zdCB7IHRpbGluZyA9ICdOb25lJywgZmlsdGVyaW5nID0gJ05vbmUnLCB1c2VNaXBtYXBzID0gZmFsc2UgfSA9IHN1cmZhY2U7XG4gICAgICAgIHRleHR1cmUud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGV4dHVyZS5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRleHR1cmUudGFyZ2V0ID0gZ2wuVEVYVFVSRV8yRDtcbiAgICAgICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgICAgICAgIGNhc2UgJ0NvbG9yJzpcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHByZWNpc2lvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmNvbXBvbmVudHMgPSBnbC5SR0JBO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5kYXRhRm9ybWF0ID0gZ2wuUkdCQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5VTlNJR05FRF9CWVRFO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmNvbXBvbmVudHMgPSBnbC5SR0JBMzJGO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5kYXRhRm9ybWF0ID0gZ2wuUkdCQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5GTE9BVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRleHR1cmUgcHJlY2lzaW9uOiAke3ByZWNpc2lvbn1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdBbHBoYSc6XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwcmVjaXNpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5jb21wb25lbnRzID0gZ2wuQUxQSEE7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmRhdGFGb3JtYXQgPSBnbC5BTFBIQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5VTlNJR05FRF9CWVRFO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmNvbXBvbmVudHMgPSBnbC5BTFBIQTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YUZvcm1hdCA9IGdsLkFMUEhBO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5kYXRhVHlwZSA9IGdsLkZMT0FUO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGV4dHVyZSBwcmVjaXNpb246ICR7cHJlY2lzaW9ufWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0RlcHRoJzoge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocHJlY2lzaW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmNvbXBvbmVudHMgPSBnbC5ERVBUSF9DT01QT05FTlQyNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YUZvcm1hdCA9IGdsLkRFUFRIX0NPTVBPTkVOVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5VTlNJR05FRF9JTlQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuY29tcG9uZW50cyA9IGdsLkRFUFRIX0NPTVBPTkVOVDMyRjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YUZvcm1hdCA9IGdsLkRFUFRIX0NPTVBPTkVOVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUuZGF0YVR5cGUgPSBnbC5GTE9BVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRleHR1cmUgcHJlY2lzaW9uOiAke3ByZWNpc2lvbn1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZXh0dXJlIGZvcm1hdDogJHtmb3JtYXR9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5iaW5kKHRleHR1cmUsIDApO1xuICAgICAgICBjb25zdCB7IHRhcmdldCwgY29tcG9uZW50cywgZGF0YUZvcm1hdCwgZGF0YVR5cGUgfSA9IHRleHR1cmU7XG4gICAgICAgIGdsLnRleEltYWdlMkQodGFyZ2V0LCAwLCBjb21wb25lbnRzLCB3aWR0aCwgaGVpZ2h0LCAwLCBkYXRhRm9ybWF0LCBkYXRhVHlwZSwgbnVsbCk7XG4gICAgICAgIHN3aXRjaCAodGlsaW5nKSB7XG4gICAgICAgICAgICBjYXNlICdOb25lJzpcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdSZXBlYXQnOlxuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuUkVQRUFUKTtcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLlJFUEVBVCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdNaXJyb3InOlxuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuTUlSUk9SRURfUkVQRUFUKTtcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLk1JUlJPUkVEX1JFUEVBVCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZXh0dXJlIHRpbGluZzogJHt0aWxpbmd9YCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChmaWx0ZXJpbmcpIHtcbiAgICAgICAgICAgIGNhc2UgJ05vbmUnOlxuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTGluZWFyJzpcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCB1c2VNaXBtYXBzID8gZ2wuTElORUFSX01JUE1BUF9ORUFSRVNUIDogZ2wuTElORUFSKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0JpbGluZWFyJzpcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX01JTl9GSUxURVIsIHVzZU1pcG1hcHMgPyBnbC5MSU5FQVJfTUlQTUFQX05FQVJFU1QgOiBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnVHJpbGluZWFyJzpcbiAgICAgICAgICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX01JTl9GSUxURVIsIHVzZU1pcG1hcHMgPyBnbC5MSU5FQVJfTUlQTUFQX0xJTkVBUiA6IGdsLkxJTkVBUik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1cmZhY2UuZGF0YSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGUodGV4dHVyZSwgc3VyZmFjZS5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRleHR1cmVzLnB1c2godGV4dHVyZSk7XG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH1cbiAgICB1cGRhdGUodGV4dHVyZSwgZGF0YSwgeCA9IDAsIHkgPSAwLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIGNvbnN0IHsgZ2wgfSA9IHRoaXM7XG4gICAgICAgIGlmICh3aWR0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3aWR0aCA9IHRleHR1cmUud2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhlaWdodCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBoZWlnaHQgPSB0ZXh0dXJlLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYmluZCh0ZXh0dXJlLCAwKTtcbiAgICAgICAgY29uc3QgeyB0YXJnZXQsIGNvbXBvbmVudHMsIGRhdGFUeXBlLCB1c2VNaXBtYXBzIH0gPSB0ZXh0dXJlO1xuICAgICAgICBnbC50ZXhTdWJJbWFnZTJEKHRhcmdldCwgMCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgY29tcG9uZW50cywgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgICBpZiAodXNlTWlwbWFwcykge1xuICAgICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICB0ZXh0dXJlLmRhdGEgPSBkYXRhO1xuICAgIH1cbiAgICBiaW5kKHRleHR1cmUsIHVuaXQpIHtcbiAgICAgICAgY29uc3QgeyBnbCB9ID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuYm91bmRUZXh0dXJlc1t1bml0XSA9PT0gdGV4dHVyZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyB1bml0KTtcbiAgICAgICAgZ2wuYmluZFRleHR1cmUodGV4dHVyZS50YXJnZXQsIHRleHR1cmUpO1xuICAgICAgICB0aGlzLmJvdW5kVGV4dHVyZXNbdW5pdF0gPSB0ZXh0dXJlO1xuICAgIH1cbn1cbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUsIFNlcmlhbGl6YWJsZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IFNjYWxlS2V5ZnJhbWUsIFJvdGF0aW9uS2V5ZnJhbWUsIFRyYW5zbGF0aW9uS2V5ZnJhbWUgfSBmcm9tICcuL2tleWZyYW1lJztcbmV4cG9ydCBjbGFzcyBLZXlmcmFtZXMgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICAgIHNjYWxlID0gW107XG4gICAgcm90YXRpb24gPSBbXTtcbiAgICB0cmFuc2xhdGlvbiA9IFtdO1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKFNjYWxlS2V5ZnJhbWUpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIEtleWZyYW1lcy5wcm90b3R5cGUsIFwic2NhbGVcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShSb3RhdGlvbktleWZyYW1lKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgQXJyYXkpXG5dLCBLZXlmcmFtZXMucHJvdG90eXBlLCBcInJvdGF0aW9uXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoVHJhbnNsYXRpb25LZXlmcmFtZSksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIEFycmF5KVxuXSwgS2V5ZnJhbWVzLnByb3RvdHlwZSwgXCJ0cmFuc2xhdGlvblwiLCB2b2lkIDApO1xuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAga2V5ZnJhbWVzID0ge307XG4gICAgZHVyYXRpb247XG4gICAgdGltZSA9IDAuMDtcbiAgICB3ZWlnaHQgPSAxLjA7XG4gICAgc3RhdGUgPSAnU3RvcCc7XG4gICAgdXBkYXRlKGRlbHRhVGltZSkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ1BsYXknOlxuICAgICAgICAgICAgICAgIHRoaXMudGltZSArPSBkZWx0YVRpbWU7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGltZSA+PSB0aGlzLmR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnU3RvcCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnTG9vcCc6XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lICs9IGRlbHRhVGltZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWUgJT0gdGhpcy5kdXJhdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1BhdXNlJzpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1N0b3AnOlxuICAgICAgICAgICAgICAgIHRoaXMudGltZSA9IDAuMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZShLZXlmcmFtZXMpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBPYmplY3QpXG5dLCBBbmltYXRpb24ucHJvdG90eXBlLCBcImtleWZyYW1lc1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIEFuaW1hdGlvbi5wcm90b3R5cGUsIFwiZHVyYXRpb25cIiwgdm9pZCAwKTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IEJvbmUgfSBmcm9tICcuL2JvbmUnO1xuZXhwb3J0IGNsYXNzIEFybWF0dXJlIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICBib25lcyA9IFtdO1xuICAgIHJvb3RCb25lcyA9IFtdO1xuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgICAgIGNvbnN0IGFybWF0dXJlID0gKGF3YWl0IHN1cGVyLmRlc2VyaWFsaXplKGRhdGEpKTtcbiAgICAgICAgYXJtYXR1cmUuYm9uZXMuZm9yRWFjaCgoYm9uZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGJvbmUucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50Qm9uZSA9IGFybWF0dXJlLmJvbmVzLmZpbmQoKHsgbmFtZSB9KSA9PiBuYW1lID09PSBib25lLnBhcmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJlbnRCb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBwYXJlbnQgJHtib25lLnBhcmVudH0gZm9yIGJvbmUgJHtib25lLm5hbWV9YCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJvbmUucGFyZW50Qm9uZSA9IHBhcmVudEJvbmU7XG4gICAgICAgICAgICAgICAgcGFyZW50Qm9uZS5jaGlsZEJvbmVzLnB1c2goYm9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcm1hdHVyZS5yb290Qm9uZXMucHVzaChib25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhcm1hdHVyZTtcbiAgICB9XG4gICAgdXBkYXRlKGRlbHRhVGltZSwgYW5pbWF0aW9ucykge1xuICAgICAgICB0aGlzLnJvb3RCb25lcy5mb3JFYWNoKChib25lKSA9PiB7XG4gICAgICAgICAgICBib25lLnVwZGF0ZShkZWx0YVRpbWUsIGFuaW1hdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoQm9uZSksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIEFycmF5KVxuXSwgQXJtYXR1cmUucHJvdG90eXBlLCBcImJvbmVzXCIsIHZvaWQgMCk7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXplLCBTZXJpYWxpemFibGUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzLCBtYXQ0LCBxdWF0IH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IFRyYW5zZm9ybSB9IGZyb20gJ0BsdXovY29yZSc7XG5leHBvcnQgY2xhc3MgQm9uZSBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAgbmFtZSA9ICcnO1xuICAgIHBhcmVudCA9ICcnO1xuICAgIGhlYWQgPSB2ZWMzLnplcm8uY29weSgpO1xuICAgIHRhaWwgPSB2ZWMzLnplcm8uY29weSgpO1xuICAgIGJpbmRNYXRyaXggPSBtYXQ0LmlkZW50aXR5LmNvcHkoKTtcbiAgICBwYXJlbnRCb25lID0gbnVsbDtcbiAgICBjaGlsZEJvbmVzID0gW107XG4gICAgcG9zZU1hdHJpeCA9IG1hdDQuaWRlbnRpdHkuY29weSgpO1xuICAgIGxvY2FsTWF0cml4ID0gbWF0NC5pZGVudGl0eS5jb3B5KCk7XG4gICAgaW52ZXJzZUJpbmRNYXRyaXggPSBtYXQ0LmlkZW50aXR5LmNvcHkoKTtcbiAgICBjb25zdHJ1Y3Rvcih7IG5hbWUsIHBhcmVudCwgaGVhZCwgdGFpbCwgYmluZE1hdHJpeCB9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhlYWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGVhZC5zZXQoaGVhZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhaWwpIHtcbiAgICAgICAgICAgIHRoaXMudGFpbC5zZXQodGFpbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJpbmRNYXRyaXgpIHtcbiAgICAgICAgICAgIHRoaXMuYmluZE1hdHJpeC5zZXQoYmluZE1hdHJpeCk7XG4gICAgICAgICAgICB0aGlzLmJpbmRNYXRyaXguaW52ZXJ0KHRoaXMuaW52ZXJzZUJpbmRNYXRyaXgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZShkZWx0YVRpbWUsIGFuaW1hdGlvbnMpIHtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtcyA9IGFuaW1hdGlvbnMubWFwKChhbmltYXRpb24pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybShhbmltYXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgd2VpZ2h0cyA9IGFuaW1hdGlvbnMubWFwKCh7IHdlaWdodCB9KSA9PiB3ZWlnaHQpO1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSB0aGlzLmJsZW5kVHJhbnNmb3Jtcyh0cmFuc2Zvcm1zLCB3ZWlnaHRzKTtcbiAgICAgICAgY29uc3QgeyB0cmFuc2xhdGlvbiwgcm90YXRpb24sIHNjYWxlIH0gPSB0cmFuc2Zvcm07XG4gICAgICAgIG1hdDQuY29uc3RydWN0KHRyYW5zbGF0aW9uLCByb3RhdGlvbiwgc2NhbGUsIHRoaXMubG9jYWxNYXRyaXgpO1xuICAgICAgICBpZiAodGhpcy5wYXJlbnRCb25lKSB7XG4gICAgICAgICAgICBjb25zdCB7IHBvc2VNYXRyaXggfSA9IHRoaXMucGFyZW50Qm9uZTtcbiAgICAgICAgICAgIG1hdDQubXVsdGlwbHkodGhpcy5sb2NhbE1hdHJpeCwgcG9zZU1hdHJpeCwgdGhpcy5wb3NlTWF0cml4KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9zZU1hdHJpeC5jb3B5KHRoaXMubG9jYWxNYXRyaXgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zZU1hdHJpeC5tdWx0aXBseSh0aGlzLmludmVyc2VCaW5kTWF0cml4KTtcbiAgICAgICAgdGhpcy5jaGlsZEJvbmVzLmZvckVhY2goKGJvbmUpID0+IGJvbmUudXBkYXRlKGRlbHRhVGltZSwgYW5pbWF0aW9ucykpO1xuICAgIH1cbiAgICB0cmFuc2Zvcm0oYW5pbWF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGtleWZyYW1lcyA9IGFuaW1hdGlvbi5rZXlmcmFtZXNbdGhpcy5uYW1lXTtcbiAgICAgICAgaWYgKCFrZXlmcmFtZXMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBrZXlmcmFtZXMgZm9yIGJvbmU6ICR7dGhpcy5uYW1lfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgdGltZSB9ID0gYW5pbWF0aW9uO1xuICAgICAgICBjb25zdCB7IHRyYW5zbGF0aW9uLCByb3RhdGlvbiwgc2NhbGUgfSA9IGtleWZyYW1lcztcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oe1xuICAgICAgICAgICAgdHJhbnNsYXRpb246IHRoaXMuaW50ZXJwb2xhdGVLZXlmcmFtZXModGltZSwgdHJhbnNsYXRpb24sIHZlYzMuaW50ZXJwb2xhdGUpLFxuICAgICAgICAgICAgcm90YXRpb246IHRoaXMuaW50ZXJwb2xhdGVLZXlmcmFtZXModGltZSwgcm90YXRpb24sIHF1YXQuaW50ZXJwb2xhdGUpLFxuICAgICAgICAgICAgc2NhbGU6IHRoaXMuaW50ZXJwb2xhdGVLZXlmcmFtZXModGltZSwgc2NhbGUsIHZlYzMuaW50ZXJwb2xhdGUpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpbnRlcnBvbGF0ZUtleWZyYW1lcyh0aW1lLCBrZXlmcmFtZXMsIGludGVycG9sYXRlKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5ZnJhbWVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgeyB0aW1lOiB0MSwgdmFsdWU6IHYxIH0gPSBrZXlmcmFtZXNbaV07XG4gICAgICAgICAgICBjb25zdCB7IHRpbWU6IHQyLCB2YWx1ZTogdjIgfSA9IGtleWZyYW1lc1tpICsgMV07XG4gICAgICAgICAgICBpZiAodGltZSA+PSB0MSAmJiB0aW1lIDw9IHQyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGludGVycG9sYXRlKHYxLCB2MiwgKHRpbWUgLSB0MSkgLyAodDIgLSB0MSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlmcmFtZXNba2V5ZnJhbWVzLmxlbmd0aCAtIDFdLnZhbHVlO1xuICAgIH1cbiAgICBibGVuZFRyYW5zZm9ybXModHJhbnNmb3Jtcywgd2VpZ2h0cykge1xuICAgICAgICBpZiAodHJhbnNmb3Jtcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBUcmFuc2Zvcm0ub3JpZ2luO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRvdGFsV2VpZ2h0ID0gd2VpZ2h0cy5yZWR1Y2UoKHRvdGFsLCB3ZWlnaHQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0b3RhbCArIHdlaWdodDtcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIGlmICh0b3RhbFdlaWdodCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFRyYW5zZm9ybS5vcmlnaW47XG4gICAgICAgIH1cbiAgICAgICAgd2VpZ2h0cyA9IHdlaWdodHMubWFwKCh3ZWlnaHQpID0+IHdlaWdodCAvIHRvdGFsV2VpZ2h0KTtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSB2ZWMzLnplcm8uY29weSgpO1xuICAgICAgICBjb25zdCBzY2FsZSA9IHZlYzMuemVyby5jb3B5KCk7XG4gICAgICAgIHRyYW5zZm9ybXMuZm9yRWFjaCgodHJhbnNmb3JtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd2VpZ2h0ID0gd2VpZ2h0c1tpbmRleF07XG4gICAgICAgICAgICB0cmFuc2xhdGlvbi5hZGQodmVjMy5zY2FsZSh0cmFuc2Zvcm0udHJhbnNsYXRpb24sIHdlaWdodCkpO1xuICAgICAgICAgICAgc2NhbGUuYWRkKHZlYzMuc2NhbGUodHJhbnNmb3JtLnNjYWxlLCB3ZWlnaHQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gdHJhbnNmb3Jtc1swXS5yb3RhdGlvbi5jb3B5KCk7XG4gICAgICAgIHRyYW5zZm9ybXMuZm9yRWFjaCgodHJhbnNmb3JtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd2VpZ2h0ID0gd2VpZ2h0c1tpbmRleF07XG4gICAgICAgICAgICBxdWF0LmludGVycG9sYXRlKHJvdGF0aW9uLCB0cmFuc2Zvcm0ucm90YXRpb24sIHdlaWdodCwgcm90YXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0oeyB0cmFuc2xhdGlvbiwgcm90YXRpb24sIHNjYWxlIH0pO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBTdHJpbmcpXG5dLCBCb25lLnByb3RvdHlwZSwgXCJuYW1lXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgU3RyaW5nKVxuXSwgQm9uZS5wcm90b3R5cGUsIFwicGFyZW50XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMylcbl0sIEJvbmUucHJvdG90eXBlLCBcImhlYWRcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgQm9uZS5wcm90b3R5cGUsIFwidGFpbFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIG1hdDQpXG5dLCBCb25lLnByb3RvdHlwZSwgXCJiaW5kTWF0cml4XCIsIHZvaWQgMCk7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzLCBxdWF0IH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmV4cG9ydCBjbGFzcyBLZXlmcmFtZSBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAgdGltZTtcbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBLZXlmcmFtZS5wcm90b3R5cGUsIFwidGltZVwiLCB2b2lkIDApO1xuZXhwb3J0IGNsYXNzIFNjYWxlS2V5ZnJhbWUgZXh0ZW5kcyBLZXlmcmFtZSB7XG4gICAgdmFsdWUgPSB2ZWMzLm9uZS5jb3B5KCk7XG59XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMylcbl0sIFNjYWxlS2V5ZnJhbWUucHJvdG90eXBlLCBcInZhbHVlXCIsIHZvaWQgMCk7XG5leHBvcnQgY2xhc3MgUm90YXRpb25LZXlmcmFtZSBleHRlbmRzIEtleWZyYW1lIHtcbiAgICB2YWx1ZSA9IHF1YXQuaWRlbnRpdHkuY29weSgpO1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHF1YXQpXG5dLCBSb3RhdGlvbktleWZyYW1lLnByb3RvdHlwZSwgXCJ2YWx1ZVwiLCB2b2lkIDApO1xuZXhwb3J0IGNsYXNzIFRyYW5zbGF0aW9uS2V5ZnJhbWUgZXh0ZW5kcyBLZXlmcmFtZSB7XG4gICAgdmFsdWUgPSB2ZWMzLnplcm8uY29weSgpO1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHZlYzMpXG5dLCBUcmFuc2xhdGlvbktleWZyYW1lLnByb3RvdHlwZSwgXCJ2YWx1ZVwiLCB2b2lkIDApO1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xudmFyIF9fbWV0YWRhdGEgPSAodGhpcyAmJiB0aGlzLl9fbWV0YWRhdGEpIHx8IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xufTtcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgVW5pZm9ybSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzL3NlcmlhbGl6YWJsZSc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmV4cG9ydCBjbGFzcyBNYXRlcmlhbCBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAgY29sb3IgPSB2ZWMzLm9uZS5jb3B5KCk7XG4gICAgc3VyZmFjZTtcbiAgICB0ZXh0dXJlO1xuICAgIGNvbnN0cnVjdG9yKHsgY29sb3IsIHRleHR1cmUgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmIChjb2xvcikge1xuICAgICAgICAgICAgdGhpcy5jb2xvci5zZXQoY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0ZXh0dXJlKSB7XG4gICAgICAgICAgICB0aGlzLnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgICAgICB9XG4gICAgfVxufVxuX19kZWNvcmF0ZShbXG4gICAgVW5pZm9ybSgpLFxuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgTWF0ZXJpYWwucHJvdG90eXBlLCBcImNvbG9yXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgTWF0ZXJpYWwucHJvdG90eXBlLCBcInN1cmZhY2VcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFVuaWZvcm0oKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgT2JqZWN0KVxuXSwgTWF0ZXJpYWwucHJvdG90eXBlLCBcInRleHR1cmVcIiwgdm9pZCAwKTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzL3NlcmlhbGl6YWJsZSc7XG5leHBvcnQgY2xhc3MgUGFydGl0aW9uIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICB0b3BvbG9neSA9ICdUcmlhbmdsZXMnO1xuICAgIHZlcnRpY2VzID0gW107XG4gICAgaW5kaWNlcyA9IFtdO1xuICAgIHdlaWdodHMgPSBbXTtcbiAgICBtYXRlcmlhbDtcbiAgICBtZXNoO1xuICAgIGNvbnN0cnVjdG9yKGRhdGEgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGRhdGEpO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBTdHJpbmcpXG5dLCBQYXJ0aXRpb24ucHJvdG90eXBlLCBcInRvcG9sb2d5XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgQXJyYXkpXG5dLCBQYXJ0aXRpb24ucHJvdG90eXBlLCBcInZlcnRpY2VzXCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgQXJyYXkpXG5dLCBQYXJ0aXRpb24ucHJvdG90eXBlLCBcImluZGljZXNcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIFBhcnRpdGlvbi5wcm90b3R5cGUsIFwid2VpZ2h0c1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFBhcnRpdGlvbi5wcm90b3R5cGUsIFwibWF0ZXJpYWxcIiwgdm9pZCAwKTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyB2ZWM0IH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6ZSB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmV4cG9ydCBjbGFzcyBSZW5kZXJQYXNzIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICBjbGVhckNvbG9yID0gdmVjNC56ZXJvLmNvcHkoKTtcbiAgICBjbGVhckRlcHRoID0gMS4wO1xuICAgIGN1bGxNb2RlID0gJ0JhY2snO1xuICAgIGJsZW5kTW9kZSA9ICdOb25lJztcbiAgICBkZXB0aFRlc3QgPSAnTGVzc0VxdWFsJztcbiAgICBkZXB0aE1hc2sgPSB0cnVlO1xuICAgIGNvbG9yTWFzayA9IFt0cnVlLCB0cnVlLCB0cnVlLCB0cnVlXTtcbiAgICB2ZXJ0ZXhTaGFkZXI7XG4gICAgZnJhZ21lbnRTaGFkZXI7XG4gICAgcHJvZ3JhbSA9IG51bGw7XG4gICAgY29uc3RydWN0b3IoZGF0YSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIGRhdGEpO1xuICAgICAgICB0aGlzLmNsZWFyQ29sb3Iuc2V0KHRoaXMuY2xlYXJDb2xvcik7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZShkYXRhKSB7XG4gICAgICAgIHJldHVybiAoYXdhaXQgc3VwZXIuZGVzZXJpYWxpemUoZGF0YSkpO1xuICAgIH1cbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWM0KVxuXSwgUmVuZGVyUGFzcy5wcm90b3R5cGUsIFwiY2xlYXJDb2xvclwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImNsZWFyRGVwdGhcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBTdHJpbmcpXG5dLCBSZW5kZXJQYXNzLnByb3RvdHlwZSwgXCJjdWxsTW9kZVwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImJsZW5kTW9kZVwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImRlcHRoVGVzdFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIEJvb2xlYW4pXG5dLCBSZW5kZXJQYXNzLnByb3RvdHlwZSwgXCJkZXB0aE1hc2tcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImNvbG9yTWFza1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcInZlcnRleFNoYWRlclwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFJlbmRlclBhc3MucHJvdG90eXBlLCBcImZyYWdtZW50U2hhZGVyXCIsIHZvaWQgMCk7XG4iLCJpbXBvcnQgeyBDYW1lcmEsIExpZ2h0LCBNb2RlbCwgVHJhbnNmb3JtIH0gZnJvbSAnQGx1ei9jb3JlJztcbmltcG9ydCB7IE1lc2hlcyB9IGZyb20gJy4uL21hbmFnZXJzL21lc2hlcyc7XG5pbXBvcnQgeyBCdWZmZXJzIH0gZnJvbSAnLi4vbWFuYWdlcnMvYnVmZmVycyc7XG5pbXBvcnQgeyBQcm9ncmFtcyB9IGZyb20gJy4uL21hbmFnZXJzL3Byb2dyYW1zJztcbmltcG9ydCB7IFNhbXBsZXJzIH0gZnJvbSAnLi4vbWFuYWdlcnMvc2FtcGxlcnMnO1xuaW1wb3J0IHsgU2hhZGVycyB9IGZyb20gJy4uL21hbmFnZXJzL3NoYWRlcnMnO1xuaW1wb3J0IHsgVGV4dHVyZXMgfSBmcm9tICcuLi9tYW5hZ2Vycy90ZXh0dXJlcyc7XG5pbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnO1xuaW1wb3J0IHsgTWF0ZXJpYWwgfSBmcm9tICcuL21hdGVyaWFsJztcbmltcG9ydCB7IGdldFVuaWZvcm1Qcm9wZXJ0aWVzIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcbiAgICBnbDtcbiAgICBzdGF0ZTtcbiAgICBzaGFkZXJzO1xuICAgIHByb2dyYW1zO1xuICAgIG1lc2hlcztcbiAgICBidWZmZXJzO1xuICAgIHRleHR1cmVzO1xuICAgIHNhbXBsZXJzO1xuICAgIGRlZmF1bHRUZXh0dXJlO1xuICAgIGRlZmF1bHRNYXRlcmlhbDtcbiAgICBjb25zdHJ1Y3RvcihnbCkge1xuICAgICAgICB0aGlzLmdsID0gZ2w7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBuZXcgU3RhdGUodGhpcy5nbCk7XG4gICAgICAgIHRoaXMubWVzaGVzID0gbmV3IE1lc2hlcyh0aGlzLmdsKTtcbiAgICAgICAgdGhpcy5idWZmZXJzID0gbmV3IEJ1ZmZlcnModGhpcy5nbCk7XG4gICAgICAgIHRoaXMuc2hhZGVycyA9IG5ldyBTaGFkZXJzKHRoaXMuZ2wpO1xuICAgICAgICB0aGlzLnByb2dyYW1zID0gbmV3IFByb2dyYW1zKHRoaXMuZ2wpO1xuICAgICAgICB0aGlzLnRleHR1cmVzID0gbmV3IFRleHR1cmVzKHRoaXMuZ2wpO1xuICAgICAgICB0aGlzLnNhbXBsZXJzID0gbmV3IFNhbXBsZXJzKHRoaXMuZ2wpO1xuICAgICAgICBjb25zdCB0ZXh0dXJlRGF0YSA9IG5ldyBVaW50OEFycmF5KFsweGZmLCAweGZmLCAweGZmLCAweGZmXSk7XG4gICAgICAgIHRoaXMuZGVmYXVsdFRleHR1cmUgPSB0aGlzLnRleHR1cmVzLmNyZWF0ZSh7IGRhdGE6IHRleHR1cmVEYXRhIH0pO1xuICAgICAgICB0aGlzLmRlZmF1bHRNYXRlcmlhbCA9IG5ldyBNYXRlcmlhbCh7IHRleHR1cmU6IHRoaXMuZGVmYXVsdFRleHR1cmUgfSk7XG4gICAgfVxuICAgIHVzZSh0YXJnZXQpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0LCBmcmFtZUJ1ZmZlciB9ID0gdGFyZ2V0O1xuICAgICAgICBpZiAoZnJhbWVCdWZmZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVycy5iaW5kKGZyYW1lQnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVycy51bmJpbmQoJ0ZyYW1lQnVmZmVyJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbC52aWV3cG9ydCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG4gICAgbWFzayh7IGNvbG9yLCBkZXB0aCB9KSB7XG4gICAgICAgIGlmIChjb2xvciAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmNvbG9yTWFzayhjb2xvclswXSwgY29sb3JbMV0sIGNvbG9yWzJdLCBjb2xvclszXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlcHRoICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZGVwdGhNYXNrKGRlcHRoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhcih7IGNvbG9yLCBkZXB0aCwgc3RlbmNpbCB9KSB7XG4gICAgICAgIGxldCBjbGVhck1hc2sgPSAwO1xuICAgICAgICBpZiAoY29sb3IgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSBjb2xvcjtcbiAgICAgICAgICAgIHRoaXMuZ2wuY2xlYXJDb2xvcih4LCB5LCB6LCB3KTtcbiAgICAgICAgICAgIGNsZWFyTWFzayB8PSB0aGlzLmdsLkNPTE9SX0JVRkZFUl9CSVQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlcHRoICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuY2xlYXJEZXB0aChkZXB0aCk7XG4gICAgICAgICAgICBjbGVhck1hc2sgfD0gdGhpcy5nbC5ERVBUSF9CVUZGRVJfQklUO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGVuY2lsICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuY2xlYXJTdGVuY2lsKHN0ZW5jaWwpO1xuICAgICAgICAgICAgY2xlYXJNYXNrIHw9IHRoaXMuZ2wuU1RFTkNJTF9CVUZGRVJfQklUO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2wuY2xlYXIoY2xlYXJNYXNrKTtcbiAgICB9XG4gICAgcmVuZGVyUGFzcyhwYXNzLCBjYW1lcmEsIGVudGl0aWVzLCBsaWdodCwgdW5pZm9ybXMpIHtcbiAgICAgICAgLy8gY3VsbCBtb2RlXG4gICAgICAgIHRoaXMuc3RhdGUuY3VsbE1vZGUgPSBwYXNzLmN1bGxNb2RlO1xuICAgICAgICAvLyBibGVuZCBtb2RlXG4gICAgICAgIHRoaXMuc3RhdGUuYmxlbmRNb2RlID0gcGFzcy5ibGVuZE1vZGU7XG4gICAgICAgIC8vIGRlcHRoIHRlc3RcbiAgICAgICAgdGhpcy5zdGF0ZS5kZXB0aFRlc3QgPSBwYXNzLmRlcHRoVGVzdDtcbiAgICAgICAgLy8gZGVwdGggbWFza1xuICAgICAgICB0aGlzLm1hc2soeyBjb2xvcjogcGFzcy5jb2xvck1hc2ssIGRlcHRoOiBwYXNzLmRlcHRoTWFzayB9KTtcbiAgICAgICAgLy8gY2xlYXIgYnVmZmVyc1xuICAgICAgICB0aGlzLmNsZWFyKHsgY29sb3I6IHBhc3MuY2xlYXJDb2xvciwgZGVwdGg6IHBhc3MuY2xlYXJEZXB0aCB9KTtcbiAgICAgICAgY29uc3QgeyBwcm9ncmFtIH0gPSBwYXNzO1xuICAgICAgICBpZiAoIXByb2dyYW0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVuZGVyIHBhc3MgaGFzIG5vIHByb2dyYW0nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZW5kZXIgZW50aXRpZXNcbiAgICAgICAgT2JqZWN0LnZhbHVlcyhlbnRpdGllcykuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICBPYmplY3QudmFsdWVzKGVudGl0eS5jb21wb25lbnRzKS5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LnR5cGUgIT09ICdNb2RlbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck1vZGVsKGNhbWVyYSwgZW50aXR5LCBjb21wb25lbnQsIGxpZ2h0LCBwcm9ncmFtLCB1bmlmb3Jtcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbmRlck1vZGVsKGNhbWVyYSwgdHJhbnNmb3JtLCBtb2RlbCwgbGlnaHQsIHByb2dyYW0sIGFkZGl0aW9uYWxVbmlmb3Jtcykge1xuICAgICAgICBjb25zdCB1bmlmb3JtcyA9IHt9O1xuICAgICAgICBjb25zdCBzZXRVbmlmb3JtVmFsdWUgPSAodmFsdWUsIGtleSwgcHJlZml4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gcHJlZml4ID8gYCR7cHJlZml4fS4ke2tleX1gIDoga2V5O1xuICAgICAgICAgICAgaWYgKHByb2dyYW0udW5pZm9ybXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICB1bmlmb3Jtc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoY2FtZXJhKSB7XG4gICAgICAgICAgICBnZXRVbmlmb3JtUHJvcGVydGllcyhDYW1lcmEpLmZvckVhY2goKHsga2V5IH0pID0+IHtcbiAgICAgICAgICAgICAgICBzZXRVbmlmb3JtVmFsdWUoY2FtZXJhW2tleV0sIGtleSwgJ2NhbWVyYScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgZ2V0VW5pZm9ybVByb3BlcnRpZXMoVHJhbnNmb3JtKS5mb3JFYWNoKCh7IGtleSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0VW5pZm9ybVZhbHVlKHRyYW5zZm9ybVtrZXldLCBrZXksICd0cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb2RlbCkge1xuICAgICAgICAgICAgZ2V0VW5pZm9ybVByb3BlcnRpZXMoTW9kZWwpLmZvckVhY2goKHsga2V5IH0pID0+IHtcbiAgICAgICAgICAgICAgICBzZXRVbmlmb3JtVmFsdWUobW9kZWxba2V5XSwga2V5LCAnbW9kZWwnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb2RlbC5ib25lTWF0cmljZXMpIHtcbiAgICAgICAgICAgIC8vIG5lc3RlZCBzdHJ1Y3R1cmVzIGNhbm5vdCBjb250YWluIGFycmF5cyxcbiAgICAgICAgICAgIC8vIHNvIHdlIG5lZWQgdG8gcGxhY2UgYm9uZSBtYXRyaWNlcyBvdXRzaWRlXG4gICAgICAgICAgICBzZXRVbmlmb3JtVmFsdWUobW9kZWwuYm9uZU1hdHJpY2VzLCAnYm9uZU1hdHJpY2VzJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpZ2h0KSB7XG4gICAgICAgICAgICBnZXRVbmlmb3JtUHJvcGVydGllcyhMaWdodCkuZm9yRWFjaCgoeyBrZXkgfSkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFVuaWZvcm1WYWx1ZShsaWdodFtrZXldLCBrZXksICdsaWdodCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcm9ncmFtcy51cGRhdGUocHJvZ3JhbSwgeyB1bmlmb3JtcyB9KTtcbiAgICAgICAgaWYgKGFkZGl0aW9uYWxVbmlmb3Jtcykge1xuICAgICAgICAgICAgLy8gYWRkaXRpb25hbCB1bmlmb3Jtc1xuICAgICAgICAgICAgdGhpcy5wcm9ncmFtcy51cGRhdGUocHJvZ3JhbSwge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgY2FuIGdldCBxdWl0ZSBzbG93LCBvbmx5IHVzZSBzcGFyaW5nbHkhXG4gICAgICAgICAgICAgICAgdW5pZm9ybXM6IHRoaXMuY29sbGVjdFVuaWZvcm1WYWx1ZXMocHJvZ3JhbSwgYWRkaXRpb25hbFVuaWZvcm1zKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmVudHJpZXMobW9kZWwucGFydGl0aW9ucykuZm9yRWFjaCgoW25hbWUsIHBhcnRpdGlvbl0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgbWVzaCB9ID0gcGFydGl0aW9uO1xuICAgICAgICAgICAgaWYgKCFtZXNoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJ0aXRpb24gaGFzIG5vIG1lc2gnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgbWF0ZXJpYWwgfSA9IG1lc2g7XG4gICAgICAgICAgICBpZiAoIW1hdGVyaWFsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXNoIGhhcyBubyBtYXRlcmlhbCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFtYXRlcmlhbC50ZXh0dXJlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcm9ncmFtcy51cGRhdGUocHJvZ3JhbSwge1xuICAgICAgICAgICAgICAgIHVuaWZvcm1zOiBnZXRVbmlmb3JtUHJvcGVydGllcyhNYXRlcmlhbCkucmVkdWNlKChwcm9wZXJ0aWVzLCB7IGtleSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBgbWF0ZXJpYWwuJHtrZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyYW0udW5pZm9ybXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbbmFtZV0gPSBtYXRlcmlhbFtrZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICAgICAgICAgICAgICAgIH0sIHt9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1lc2hlcy5yZW5kZXIobWVzaCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb2xsZWN0VW5pZm9ybVZhbHVlcyhwcm9ncmFtLCB1bmlmb3JtVmFsdWVzKSB7XG4gICAgICAgIGNvbnN0IGNvbGxlY3RlZFVuaWZvcm1WYWx1ZXMgPSB7fTtcbiAgICAgICAgY29uc3QgY29sbGVjdFJlY3Vyc2l2ZWx5ID0gKHZhbHVlcywgcHJlZml4KSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsdWVzID09IG51bGwgfHwgdHlwZW9mIHZhbHVlcyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBPYmplY3QuZW50cmllcyh2YWx1ZXMpLmZvckVhY2goKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmlmb3JtTmFtZSA9IHByZWZpeCA/IGAke3ByZWZpeH0uJHtuYW1lfWAgOiBuYW1lO1xuICAgICAgICAgICAgICAgIGlmIChwcm9ncmFtLnVuaWZvcm1zLmhhc093blByb3BlcnR5KHVuaWZvcm1OYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0ZWRVbmlmb3JtVmFsdWVzW3VuaWZvcm1OYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5mb3JFYWNoKChlbGVtZW50LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJyYXlJbmRleCA9IGAke3VuaWZvcm1OYW1lfVske2luZGV4fV1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyYW0udW5pZm9ybXMuaGFzT3duUHJvcGVydHkoYXJyYXlJbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0ZWRVbmlmb3JtVmFsdWVzW2FycmF5SW5kZXhdID0gZWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3RSZWN1cnNpdmVseShlbGVtZW50LCBhcnJheUluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0UmVjdXJzaXZlbHkodmFsdWUsIHVuaWZvcm1OYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29sbGVjdFJlY3Vyc2l2ZWx5KHVuaWZvcm1WYWx1ZXMpO1xuICAgICAgICByZXR1cm4gY29sbGVjdGVkVW5pZm9ybVZhbHVlcztcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgU3RhdGUge1xuICAgIGdsO1xuICAgIGFjdGl2ZUN1bGxNb2RlID0gJ05vbmUnO1xuICAgIGFjdGl2ZUJsZW5kTW9kZSA9ICdOb25lJztcbiAgICBhY3RpdmVEZXB0aFRlc3QgPSAnTm9uZSc7XG4gICAgY29uc3RydWN0b3IoZ2wpIHtcbiAgICAgICAgdGhpcy5nbCA9IGdsO1xuICAgIH1cbiAgICBzZXQgY3VsbE1vZGUoY3VsbE1vZGUpIHtcbiAgICAgICAgaWYgKGN1bGxNb2RlID09PSB0aGlzLmFjdGl2ZUN1bGxNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN1bGxNb2RlID09PSAnTm9uZScpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZGlzYWJsZSh0aGlzLmdsLkNVTExfRkFDRSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdsLmVuYWJsZSh0aGlzLmdsLkNVTExfRkFDRSk7XG4gICAgICAgICAgICBzd2l0Y2ggKGN1bGxNb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnRnJvbnQnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmN1bGxGYWNlKHRoaXMuZ2wuRlJPTlQpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdCYWNrJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5jdWxsRmFjZSh0aGlzLmdsLkJBQ0spO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFjdGl2ZUN1bGxNb2RlID0gY3VsbE1vZGU7XG4gICAgfVxuICAgIHNldCBibGVuZE1vZGUoYmxlbmRNb2RlKSB7XG4gICAgICAgIGlmIChibGVuZE1vZGUgPT09IHRoaXMuYWN0aXZlQmxlbmRNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJsZW5kTW9kZSA9PT0gJ05vbmUnKSB7XG4gICAgICAgICAgICB0aGlzLmdsLmRpc2FibGUodGhpcy5nbC5CTEVORCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmdsLmVuYWJsZSh0aGlzLmdsLkJMRU5EKTtcbiAgICAgICAgICAgIHN3aXRjaCAoYmxlbmRNb2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnQWRkaXRpdmUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmJsZW5kRnVuYyh0aGlzLmdsLlNSQ19BTFBIQSwgdGhpcy5nbC5PTkUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdUcmFuc3BhcmVudCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuYmxlbmRGdW5jKHRoaXMuZ2wuU1JDX0FMUEhBLCB0aGlzLmdsLk9ORV9NSU5VU19TUkNfQUxQSEEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFjdGl2ZUJsZW5kTW9kZSA9IGJsZW5kTW9kZTtcbiAgICB9XG4gICAgc2V0IGRlcHRoVGVzdChkZXB0aFRlc3QpIHtcbiAgICAgICAgaWYgKGRlcHRoVGVzdCA9PT0gdGhpcy5hY3RpdmVEZXB0aFRlc3QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVwdGhUZXN0ID09PSAnTm9uZScpIHtcbiAgICAgICAgICAgIHRoaXMuZ2wuZGlzYWJsZSh0aGlzLmdsLkRFUFRIX1RFU1QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nbC5lbmFibGUodGhpcy5nbC5ERVBUSF9URVNUKTtcbiAgICAgICAgICAgIHN3aXRjaCAoZGVwdGhUZXN0KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnTmV2ZXInOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdsLmRlcHRoRnVuYyh0aGlzLmdsLk5FVkVSKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnQWx3YXlzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5BTFdBWVMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdFcXVhbCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHRoaXMuZ2wuRVFVQUwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdOb3RFcXVhbCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2wuZGVwdGhGdW5jKHRoaXMuZ2wuTk9URVFVQUwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdMZXNzJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5MRVNTKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnTGVzc0VxdWFsJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5MRVFVQUwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdHcmVhdGVyJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5HUkVBVEVSKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnR3JlYXRlckVxdWFsJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nbC5kZXB0aEZ1bmModGhpcy5nbC5HRVFVQUwpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFjdGl2ZURlcHRoVGVzdCA9IGRlcHRoVGVzdDtcbiAgICB9XG59XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5leHBvcnQgY2xhc3MgU3VyZmFjZSBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gICAgcGF0aDtcbiAgICBkYXRhO1xuICAgIHdpZHRoID0gMTtcbiAgICBoZWlnaHQgPSAxO1xuICAgIGZvcm1hdCA9ICdDb2xvcic7XG4gICAgcHJlY2lzaW9uID0gODtcbiAgICB0aWxpbmcgPSAnTm9uZSc7XG4gICAgZmlsdGVyaW5nID0gJ05vbmUnO1xuICAgIHVzZU1pcG1hcHMgPSBmYWxzZTtcbiAgICBjb25zdHJ1Y3RvcihkYXRhID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBkYXRhKTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGRlc2VyaWFsaXplKGRhdGEpIHtcbiAgICAgICAgY29uc3Qgc3VyZmFjZSA9IChhd2FpdCBzdXBlci5kZXNlcmlhbGl6ZShkYXRhKSk7XG4gICAgICAgIGlmICgnZGF0YScgaW4gc3VyZmFjZSkge1xuICAgICAgICAgICAgY29uc3QgeyBkYXRhLCBwcmVjaXNpb24gPSA4IH0gPSBzdXJmYWNlO1xuICAgICAgICAgICAgc3dpdGNoIChwcmVjaXNpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgICAgICAgIHN1cmZhY2UuZGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgICAgICAgICBzdXJmYWNlLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VyZmFjZTtcbiAgICB9XG59XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgU3RyaW5nKVxuXSwgU3VyZmFjZS5wcm90b3R5cGUsIFwicGF0aFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE9iamVjdClcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcImRhdGFcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBOdW1iZXIpXG5dLCBTdXJmYWNlLnByb3RvdHlwZSwgXCJ3aWR0aFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcImhlaWdodFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcImZvcm1hdFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcInByZWNpc2lvblwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcInRpbGluZ1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIFN0cmluZylcbl0sIFN1cmZhY2UucHJvdG90eXBlLCBcImZpbHRlcmluZ1wiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIEJvb2xlYW4pXG5dLCBTdXJmYWNlLnByb3RvdHlwZSwgXCJ1c2VNaXBtYXBzXCIsIHZvaWQgMCk7XG4iLCJleHBvcnQgY2xhc3MgUmVuZGVyVGFyZ2V0IHtcbiAgICB3aWR0aDtcbiAgICBoZWlnaHQ7XG4gICAgZnJhbWVCdWZmZXI7XG4gICAgY29uc3RydWN0b3IoeyB3aWR0aCwgaGVpZ2h0LCBmcmFtZUJ1ZmZlciB9KSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMuZnJhbWVCdWZmZXIgPSBmcmFtZUJ1ZmZlcjtcbiAgICB9XG59XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5leHBvcnQgY2xhc3MgV2VpZ2h0IGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgICB2ZXJ0ZXg7XG4gICAgaW5kaWNlcztcbiAgICB3ZWlnaHRzO1xufVxuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFdlaWdodC5wcm90b3R5cGUsIFwidmVydGV4XCIsIHZvaWQgMCk7XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgQXJyYXkpXG5dLCBXZWlnaHQucHJvdG90eXBlLCBcImluZGljZXNcIiwgdm9pZCAwKTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIFdlaWdodC5wcm90b3R5cGUsIFwid2VpZ2h0c1wiLCB2b2lkIDApO1xuIiwiZXhwb3J0ICogZnJvbSAnLi9jb3JlJztcbmV4cG9ydCAqIGZyb20gJy4vZ3JhcGhpY3MnO1xuZXhwb3J0ICogZnJvbSAnLi9waHlzaWNzJztcbmV4cG9ydCAqIGZyb20gJy4vdmVjdG9ycyc7XG5leHBvcnQgKiBmcm9tICcuL3V0aWxpdGllcyc7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXplLCBTZXJpYWxpemFibGUgfSBmcm9tICcuLi91dGlsaXRpZXMnO1xuZXhwb3J0IGNsYXNzIENvbGxpZGVyIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbn1cbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBTdHJpbmcpXG5dLCBDb2xsaWRlci5wcm90b3R5cGUsIFwidHlwZVwiLCB2b2lkIDApO1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xudmFyIF9fbWV0YWRhdGEgPSAodGhpcyAmJiB0aGlzLl9fbWV0YWRhdGEpIHx8IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xufTtcbmltcG9ydCB7IFNlcmlhbGl6ZSwgUmVnaXN0ZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IENvbGxpZGVyIH0gZnJvbSAnLi4vY29sbGlkZXInO1xubGV0IFBsYW5lID0gY2xhc3MgUGxhbmUgZXh0ZW5kcyBDb2xsaWRlciB7XG4gICAgdHlwZSA9ICdQbGFuZSc7XG4gICAgbm9ybWFsID0gdmVjMy51cDtcbiAgICBkaXN0YW5jZSA9IDA7XG4gICAgY29uc3RydWN0b3IoeyBub3JtYWwgPSB2ZWMzLnVwLCBkaXN0YW5jZSA9IDAgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubm9ybWFsID0gbm9ybWFsLmNvcHkoKTtcbiAgICAgICAgdGhpcy5kaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgIH1cbiAgICBzaWduZWREaXN0YW5jZShwb2ludCkge1xuICAgICAgICByZXR1cm4gdmVjMy5kb3QocG9pbnQsIHRoaXMubm9ybWFsKSAtIHRoaXMuZGlzdGFuY2U7XG4gICAgfVxufTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzKVxuXSwgUGxhbmUucHJvdG90eXBlLCBcIm5vcm1hbFwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIE51bWJlcilcbl0sIFBsYW5lLnByb3RvdHlwZSwgXCJkaXN0YW5jZVwiLCB2b2lkIDApO1xuUGxhbmUgPSBfX2RlY29yYXRlKFtcbiAgICBSZWdpc3RlcigpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246cGFyYW10eXBlc1wiLCBbT2JqZWN0XSlcbl0sIFBsYW5lKTtcbmV4cG9ydCB7IFBsYW5lIH07XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5pbXBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4uL2NvbGxpZGVyJztcbmltcG9ydCB7IFNlcmlhbGl6ZSwgUmVnaXN0ZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5sZXQgUG9seWdvbiA9IGNsYXNzIFBvbHlnb24gZXh0ZW5kcyBDb2xsaWRlciB7XG4gICAgdHlwZSA9ICdQb2x5Z29uJztcbiAgICB2ZXJ0aWNlcyA9IFtdO1xuICAgIGVkZ2VzO1xuICAgIG5vcm1hbDtcbiAgICBjb25zdHJ1Y3Rvcih7IHZlcnRpY2VzID0gW10gfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudmVydGljZXMgPSB2ZXJ0aWNlcy5tYXAoKHZlcnRleCkgPT4gdmVydGV4LmNvcHkoKSk7XG4gICAgICAgIGlmICh0aGlzLnZlcnRpY2VzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVkZ2VzID0gW1xuICAgICAgICAgICAgdmVjMy5zdWJ0cmFjdCh0aGlzLnZlcnRpY2VzWzFdLCB0aGlzLnZlcnRpY2VzWzBdKSxcbiAgICAgICAgICAgIHZlYzMuc3VidHJhY3QodGhpcy52ZXJ0aWNlc1syXSwgdGhpcy52ZXJ0aWNlc1sxXSksXG4gICAgICAgICAgICB2ZWMzLnN1YnRyYWN0KHRoaXMudmVydGljZXNbMF0sIHRoaXMudmVydGljZXNbMl0pXG4gICAgICAgIF07XG4gICAgICAgIGNvbnN0IGVkZ2UxID0gdmVjMy5zdWJ0cmFjdCh2ZXJ0aWNlc1sxXSwgdmVydGljZXNbMF0pO1xuICAgICAgICBjb25zdCBlZGdlMiA9IHZlYzMuc3VidHJhY3QodmVydGljZXNbMl0sIHZlcnRpY2VzWzBdKTtcbiAgICAgICAgdGhpcy5ub3JtYWwgPSB2ZWMzLmNyb3NzKGVkZ2UxLCBlZGdlMikubm9ybWFsaXplKCk7XG4gICAgfVxufTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCBBcnJheSlcbl0sIFBvbHlnb24ucHJvdG90eXBlLCBcInZlcnRpY2VzXCIsIHZvaWQgMCk7XG5Qb2x5Z29uID0gX19kZWNvcmF0ZShbXG4gICAgUmVnaXN0ZXIoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnBhcmFtdHlwZXNcIiwgW09iamVjdF0pXG5dLCBQb2x5Z29uKTtcbmV4cG9ydCB7IFBvbHlnb24gfTtcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUsIFJlZ2lzdGVyIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5pbXBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4uL2NvbGxpZGVyJztcbmxldCBSYXkgPSBjbGFzcyBSYXkgZXh0ZW5kcyBDb2xsaWRlciB7XG4gICAgdHlwZSA9ICdSYXknO1xuICAgIG9yaWdpbiA9IHZlYzMuemVybztcbiAgICBkaXJlY3Rpb24gPSB2ZWMzLnVwO1xuICAgIGNvbnN0cnVjdG9yKHsgb3JpZ2luID0gdmVjMy56ZXJvLCBkaXJlY3Rpb24gPSB2ZWMzLnVwIH0gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9yaWdpbiA9IG9yaWdpbi5jb3B5KCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uLmNvcHkoKS5ub3JtYWxpemUoKTtcbiAgICB9XG59O1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHZlYzMpXG5dLCBSYXkucHJvdG90eXBlLCBcIm9yaWdpblwiLCB2b2lkIDApO1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHZlYzMpXG5dLCBSYXkucHJvdG90eXBlLCBcImRpcmVjdGlvblwiLCB2b2lkIDApO1xuUmF5ID0gX19kZWNvcmF0ZShbXG4gICAgUmVnaXN0ZXIoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnBhcmFtdHlwZXNcIiwgW09iamVjdF0pXG5dLCBSYXkpO1xuZXhwb3J0IHsgUmF5IH07XG4iLCJpbXBvcnQgeyBFcHNpbG9uLCB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU21hbGwgaGVscGVyc1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jb25zdCB0bXAgPSAoKSA9PiBuZXcgdmVjMygpO1xuY29uc3QgcHJvamVjdEV4dGVudCA9IChheGlzLCBheGVzLCBleHRlbnRzKSA9PiB7XG4gICAgcmV0dXJuIChNYXRoLmFicyh2ZWMzLmRvdChheGlzLCBheGVzWzBdKSkgKiBleHRlbnRzLnggK1xuICAgICAgICBNYXRoLmFicyh2ZWMzLmRvdChheGlzLCBheGVzWzFdKSkgKiBleHRlbnRzLnkgK1xuICAgICAgICBNYXRoLmFicyh2ZWMzLmRvdChheGlzLCBheGVzWzJdKSkgKiBleHRlbnRzLnopO1xufTtcbmNvbnN0IGNob29zZUZhY2VUYW5nZW50SW5kaWNlcyA9IChtYWluKSA9PiB7XG4gICAgc3dpdGNoIChtYWluKSB7XG4gICAgICAgIGNhc2UgMDogcmV0dXJuIFsxLCAyXTtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gWzAsIDJdO1xuICAgICAgICBkZWZhdWx0OiByZXR1cm4gWzAsIDFdO1xuICAgIH1cbn07XG5jb25zdCBnZXRGYWNlQ2VudGVyQW5kQmFzaXMgPSAoY2VudGVyLCBheGVzLCBleHRlbnRzLCBmYWNlQXhpc0luZGV4LCBmYWNlU2lnbikgPT4ge1xuICAgIGNvbnN0IG5vcm1hbCA9IHZlYzMuc2NhbGUoYXhlc1tmYWNlQXhpc0luZGV4XSwgZmFjZVNpZ24sIHRtcCgpKTtcbiAgICBjb25zdCBmYWNlQ2VudGVyID0gdmVjMy5hZGQoY2VudGVyLCB2ZWMzLnNjYWxlKGF4ZXNbZmFjZUF4aXNJbmRleF0sIGV4dGVudHNbZmFjZUF4aXNJbmRleF0gKiBmYWNlU2lnbiwgdG1wKCkpLCB0bXAoKSk7XG4gICAgY29uc3QgW2kxLCBpMl0gPSBjaG9vc2VGYWNlVGFuZ2VudEluZGljZXMoZmFjZUF4aXNJbmRleCk7XG4gICAgY29uc3QgdDEgPSBheGVzW2kxXTtcbiAgICBjb25zdCB0MiA9IGF4ZXNbaTJdO1xuICAgIGNvbnN0IGUxID0gZXh0ZW50c1tpMV07XG4gICAgY29uc3QgZTIgPSBleHRlbnRzW2kyXTtcbiAgICByZXR1cm4geyBmYWNlQ2VudGVyLCBub3JtYWwsIHQxLCB0MiwgZTEsIGUyLCBpMSwgaTIgfTtcbn07XG5jb25zdCBnZXRGYWNlVmVydGljZXMgPSAoZmFjZUNlbnRlciwgdDEsIHQyLCBlMSwgZTIpID0+IHtcbiAgICBjb25zdCB2MCA9IHZlYzMuYWRkKGZhY2VDZW50ZXIsIHZlYzMuYWRkKHZlYzMuc2NhbGUodDEsIC1lMSwgdG1wKCkpLCB2ZWMzLnNjYWxlKHQyLCAtZTIsIHRtcCgpKSwgdG1wKCkpLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCB2MSA9IHZlYzMuYWRkKGZhY2VDZW50ZXIsIHZlYzMuYWRkKHZlYzMuc2NhbGUodDEsICtlMSwgdG1wKCkpLCB2ZWMzLnNjYWxlKHQyLCAtZTIsIHRtcCgpKSwgdG1wKCkpLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCB2MiA9IHZlYzMuYWRkKGZhY2VDZW50ZXIsIHZlYzMuYWRkKHZlYzMuc2NhbGUodDEsICtlMSwgdG1wKCkpLCB2ZWMzLnNjYWxlKHQyLCArZTIsIHRtcCgpKSwgdG1wKCkpLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCB2MyA9IHZlYzMuYWRkKGZhY2VDZW50ZXIsIHZlYzMuYWRkKHZlYzMuc2NhbGUodDEsIC1lMSwgdG1wKCkpLCB2ZWMzLnNjYWxlKHQyLCArZTIsIHRtcCgpKSwgdG1wKCkpLCBuZXcgdmVjMygpKTtcbiAgICByZXR1cm4gW3YwLCB2MSwgdjIsIHYzXTtcbn07XG5jb25zdCBjbGlwUG9seWdvbkFnYWluc3RQbGFuZSA9IChwb2x5LCBwbGFuZU5vcm1hbCwgcGxhbmVEaXN0KSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgaWYgKHBvbHkubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIGNvbnN0IGRvdCA9IChwKSA9PiB2ZWMzLmRvdChwbGFuZU5vcm1hbCwgcCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb2x5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGEgPSBwb2x5W2ldO1xuICAgICAgICBjb25zdCBiID0gcG9seVsoaSArIDEpICUgcG9seS5sZW5ndGhdO1xuICAgICAgICBjb25zdCBkYSA9IGRvdChhKSAtIHBsYW5lRGlzdDtcbiAgICAgICAgY29uc3QgZGIgPSBkb3QoYikgLSBwbGFuZURpc3Q7XG4gICAgICAgIGNvbnN0IGFJbnNpZGUgPSBkYSA8PSBFcHNpbG9uO1xuICAgICAgICBjb25zdCBiSW5zaWRlID0gZGIgPD0gRXBzaWxvbjtcbiAgICAgICAgaWYgKGFJbnNpZGUgJiYgYkluc2lkZSkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goYi5jb3B5KCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFJbnNpZGUgJiYgIWJJbnNpZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHQgPSBkYSAvIChkYSAtIGRiKTtcbiAgICAgICAgICAgIGNvbnN0IGFiID0gdmVjMy5zdWJ0cmFjdChiLCBhLCB0bXAoKSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh2ZWMzLmFkZChhLCB2ZWMzLnNjYWxlKGFiLCB0LCB0bXAoKSksIG5ldyB2ZWMzKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghYUluc2lkZSAmJiBiSW5zaWRlKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gZGEgLyAoZGEgLSBkYik7XG4gICAgICAgICAgICBjb25zdCBhYiA9IHZlYzMuc3VidHJhY3QoYiwgYSwgdG1wKCkpO1xuICAgICAgICAgICAgcmVzdWx0LnB1c2godmVjMy5hZGQoYSwgdmVjMy5zY2FsZShhYiwgdCwgdG1wKCkpLCBuZXcgdmVjMygpKSk7XG4gICAgICAgICAgICByZXN1bHQucHVzaChiLmNvcHkoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG4vLyBDbG9zZXN0IG1pZHBvaW50IGJldHdlZW4gdHdvICpzZWdtZW50cypcbmNvbnN0IGNsb3Nlc3RQb2ludEJldHdlZW5TZWdtZW50c01pZHBvaW50ID0gKHAwLCB1LCB1TGVuLCBxMCwgdiwgdkxlbikgPT4ge1xuICAgIGNvbnN0IHcwID0gdmVjMy5zdWJ0cmFjdChwMCwgcTAsIHRtcCgpKTtcbiAgICBjb25zdCBhID0gdmVjMy5kb3QodSwgdSk7XG4gICAgY29uc3QgYiA9IHZlYzMuZG90KHUsIHYpO1xuICAgIGNvbnN0IGMgPSB2ZWMzLmRvdCh2LCB2KTtcbiAgICBjb25zdCBkID0gdmVjMy5kb3QodSwgdzApO1xuICAgIGNvbnN0IGUgPSB2ZWMzLmRvdCh2LCB3MCk7XG4gICAgY29uc3QgZGVub20gPSBhICogYyAtIGIgKiBiO1xuICAgIGxldCBzID0gMCwgdCA9IDA7XG4gICAgaWYgKE1hdGguYWJzKGRlbm9tKSA+IEVwc2lsb24pIHtcbiAgICAgICAgcyA9IChiICogZSAtIGMgKiBkKSAvIGRlbm9tO1xuICAgICAgICB0ID0gKGEgKiBlIC0gYiAqIGQpIC8gZGVub207XG4gICAgfVxuICAgIHMgPSBNYXRoLm1heCgtdUxlbiwgTWF0aC5taW4ocywgK3VMZW4pKTtcbiAgICB0ID0gTWF0aC5tYXgoLXZMZW4sIE1hdGgubWluKHQsICt2TGVuKSk7XG4gICAgY29uc3QgcCA9IHZlYzMuYWRkKHAwLCB2ZWMzLnNjYWxlKHUsIHMsIHRtcCgpKSwgdG1wKCkpO1xuICAgIGNvbnN0IHEgPSB2ZWMzLmFkZChxMCwgdmVjMy5zY2FsZSh2LCB0LCB0bXAoKSksIHRtcCgpKTtcbiAgICByZXR1cm4gdmVjMy5zY2FsZSh2ZWMzLmFkZChwLCBxLCB0bXAoKSksIDAuNSwgbmV3IHZlYzMoKSk7XG59O1xuY29uc3QgdHlwZUJpYXMgPSAodHlwZSkgPT4gKHR5cGUgPT09ICdFZGdlRWRnZScgPyAxZS02IDogMCk7XG5jb25zdCBzaWduTm9uWmVybyA9ICh4LCBmYWxsYmFjaykgPT4gKHggPiAwID8gMSA6IHggPCAwID8gLTEgOiBmYWxsYmFjayk7XG4vLyAtLS0gTkVXOiBjb21wdXRlIHRoZSBwZW5ldHJhdGlvbiBvZiBhIHBvaW50IGFnYWluc3QgYSBib3ggZmFjZSBwbGFuZSBhbG9uZyBgbm9ybWFsYFxuY29uc3QgcG9pbnRQZW5ldHJhdGlvbkFnYWluc3RCb3hQbGFuZSA9IChwb2ludCwgbm9ybWFsLCBheGVzLCBleHRlbnRzLCBjZW50ZXIpID0+IHtcbiAgICAvLyBQaWNrIHRoZSBmYWNlIG9uIHRoaXMgYm94IHdob3NlIG5vcm1hbCBpcyAqbW9zdCBhbGlnbmVkKiB3aXRoIGBub3JtYWxgXG4gICAgbGV0IGZhY2VJZHggPSAwO1xuICAgIGxldCBtYXhEb3QgPSAtSW5maW5pdHk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgY29uc3QgZCA9IHZlYzMuZG90KGF4ZXNbaV0sIG5vcm1hbCk7IC8vIHNpbmNlIGBub3JtYWxgIHBvaW50cyBBLT5CLCB0aGlzIHBpY2tzIHRoZSBBLWZhY2UgcG9pbnRpbmcgdG93YXJkIEIgKG9yIEItZmFjZSB0b3dhcmQgQSlcbiAgICAgICAgaWYgKGQgPiBtYXhEb3QpIHtcbiAgICAgICAgICAgIG1heERvdCA9IGQ7XG4gICAgICAgICAgICBmYWNlSWR4ID0gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBmYWNlU2lnbiA9IG1heERvdCA+PSAwID8gKzEgOiAtMTtcbiAgICBjb25zdCB7IGZhY2VDZW50ZXIgfSA9IGdldEZhY2VDZW50ZXJBbmRCYXNpcyhjZW50ZXIsIGF4ZXMsIGV4dGVudHMsIGZhY2VJZHgsIGZhY2VTaWduKTtcbiAgICBjb25zdCByZWZQbGFuZUQgPSB2ZWMzLmRvdChub3JtYWwsIGZhY2VDZW50ZXIpO1xuICAgIGNvbnN0IHBlbiA9IHJlZlBsYW5lRCAtIHZlYzMuZG90KG5vcm1hbCwgcG9pbnQpO1xuICAgIHJldHVybiBwZW47XG59O1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNYWluIHJvdXRpbmVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGNvbnN0IGNvbGxpZGVDdWJvaWRXaXRoQ3Vib2lkID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCBheGVzQSA9IFthLmF4ZXNbMF0uY29weSgpLm5vcm1hbGl6ZSgpLCBhLmF4ZXNbMV0uY29weSgpLm5vcm1hbGl6ZSgpLCBhLmF4ZXNbMl0uY29weSgpLm5vcm1hbGl6ZSgpXTtcbiAgICBjb25zdCBheGVzQiA9IFtiLmF4ZXNbMF0uY29weSgpLm5vcm1hbGl6ZSgpLCBiLmF4ZXNbMV0uY29weSgpLm5vcm1hbGl6ZSgpLCBiLmF4ZXNbMl0uY29weSgpLm5vcm1hbGl6ZSgpXTtcbiAgICBjb25zdCBleHRBID0gYS5leHRlbnRzO1xuICAgIGNvbnN0IGV4dEIgPSBiLmV4dGVudHM7XG4gICAgY29uc3QgY0EgPSBhLmNlbnRlcjtcbiAgICBjb25zdCBjQiA9IGIuY2VudGVyO1xuICAgIGNvbnN0IHQgPSB2ZWMzLnN1YnRyYWN0KGNCLCBjQSwgdG1wKCkpO1xuICAgIGxldCBiZXN0QXhpcyA9IG5ldyB2ZWMzKCk7XG4gICAgbGV0IGJlc3REZXB0aCA9IEluZmluaXR5O1xuICAgIGxldCBiZXN0VHlwZSA9IG51bGw7XG4gICAgbGV0IGJlc3RJbmRleEEgPSAtMTtcbiAgICBsZXQgYmVzdEluZGV4QiA9IC0xO1xuICAgIGNvbnN0IGV2YWx1YXRlQXhpcyA9IChheGlzLCB0eXBlLCBpLCBqKSA9PiB7XG4gICAgICAgIGNvbnN0IGxlbiA9IGF4aXMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuIDwgRXBzaWxvbilcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjb25zdCBuID0gdmVjMy5zY2FsZShheGlzLCAxIC8gbGVuLCB0bXAoKSk7XG4gICAgICAgIGNvbnN0IHJBID0gcHJvamVjdEV4dGVudChuLCBheGVzQSwgZXh0QSk7XG4gICAgICAgIGNvbnN0IHJCID0gcHJvamVjdEV4dGVudChuLCBheGVzQiwgZXh0Qik7XG4gICAgICAgIGNvbnN0IGRpc3QgPSBNYXRoLmFicyh2ZWMzLmRvdCh0LCBuKSk7XG4gICAgICAgIGNvbnN0IG92ZXJsYXAgPSByQSArIHJCIC0gZGlzdDtcbiAgICAgICAgaWYgKG92ZXJsYXAgPCAtRXBzaWxvbilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKG92ZXJsYXAgLSB0eXBlQmlhcyh0eXBlKSA8IGJlc3REZXB0aCAtIHR5cGVCaWFzKGJlc3RUeXBlKSkge1xuICAgICAgICAgICAgYmVzdERlcHRoID0gb3ZlcmxhcDtcbiAgICAgICAgICAgIGJlc3RBeGlzID0gbi5jb3B5KGJlc3RBeGlzKTtcbiAgICAgICAgICAgIGJlc3RUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIGJlc3RJbmRleEEgPSBpO1xuICAgICAgICAgICAgYmVzdEluZGV4QiA9IGo7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBpZiAoIWV2YWx1YXRlQXhpcyhheGVzQVtpXSwgJ0ZhY2VBJywgaSwgLTEpKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICghZXZhbHVhdGVBeGlzKGF4ZXNCW2ldLCAnRmFjZUInLCAtMSwgaSkpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAzOyBqKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGF4aXMgPSB2ZWMzLmNyb3NzKGF4ZXNBW2ldLCBheGVzQltqXSwgdG1wKCkpO1xuICAgICAgICAgICAgaWYgKCFldmFsdWF0ZUF4aXMoYXhpcywgJ0VkZ2VFZGdlJywgaSwgaikpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFiZXN0VHlwZSB8fCAhaXNGaW5pdGUoYmVzdERlcHRoKSlcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgY29uc3Qgbm9ybWFsID0gYmVzdEF4aXMuY29weSgpO1xuICAgIGlmICh2ZWMzLmRvdCh0LCBub3JtYWwpIDwgMClcbiAgICAgICAgbm9ybWFsLnNjYWxlKC0xKTtcbiAgICBjb25zdCBjb2xsaXNpb25zID0gW107XG4gICAgaWYgKGJlc3RUeXBlID09PSAnRmFjZUEnIHx8IGJlc3RUeXBlID09PSAnRmFjZUInKSB7XG4gICAgICAgIGNvbnN0IHJlZklzQSA9IGJlc3RUeXBlID09PSAnRmFjZUEnO1xuICAgICAgICBjb25zdCByZWZBeGVzID0gcmVmSXNBID8gYXhlc0EgOiBheGVzQjtcbiAgICAgICAgY29uc3QgcmVmRXh0ID0gcmVmSXNBID8gZXh0QSA6IGV4dEI7XG4gICAgICAgIGNvbnN0IHJlZkNlbnRlciA9IHJlZklzQSA/IGNBIDogY0I7XG4gICAgICAgIGNvbnN0IGsgPSByZWZJc0EgPyBiZXN0SW5kZXhBIDogYmVzdEluZGV4QjtcbiAgICAgICAgY29uc3QgZmFjZURpclNpZ24gPSB2ZWMzLmRvdChyZWZBeGVzW2tdLCBub3JtYWwpID49IDAgPyArMSA6IC0xO1xuICAgICAgICBjb25zdCB7IGZhY2VDZW50ZXI6IHJlZkZhY2VDZW50ZXIsIHQxLCB0MiwgZTEsIGUyIH0gPSBnZXRGYWNlQ2VudGVyQW5kQmFzaXMocmVmQ2VudGVyLCByZWZBeGVzLCByZWZFeHQsIGssIGZhY2VEaXJTaWduKTtcbiAgICAgICAgY29uc3QgaW5jQXhlcyA9IHJlZklzQSA/IGF4ZXNCIDogYXhlc0E7XG4gICAgICAgIGNvbnN0IGluY0V4dCA9IHJlZklzQSA/IGV4dEIgOiBleHRBO1xuICAgICAgICBjb25zdCBpbmNDZW50ZXIgPSByZWZJc0EgPyBjQiA6IGNBO1xuICAgICAgICBsZXQgaW5jRmFjZUluZGV4ID0gMCwgbWluRG90ID0gSW5maW5pdHk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBkID0gdmVjMy5kb3QoaW5jQXhlc1tpXSwgbm9ybWFsKTtcbiAgICAgICAgICAgIGlmIChkIDwgbWluRG90KSB7XG4gICAgICAgICAgICAgICAgbWluRG90ID0gZDtcbiAgICAgICAgICAgICAgICBpbmNGYWNlSW5kZXggPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGluY0ZhY2VTaWduID0gbWluRG90ID4gMCA/IC0xIDogKzE7XG4gICAgICAgIGNvbnN0IHsgZmFjZUNlbnRlcjogaW5jRmFjZUNlbnRlciwgdDE6IGl0MSwgdDI6IGl0MiwgZTE6IGllMSwgZTI6IGllMiB9ID0gZ2V0RmFjZUNlbnRlckFuZEJhc2lzKGluY0NlbnRlciwgaW5jQXhlcywgaW5jRXh0LCBpbmNGYWNlSW5kZXgsIGluY0ZhY2VTaWduKTtcbiAgICAgICAgbGV0IHBvbHkgPSBnZXRGYWNlVmVydGljZXMoaW5jRmFjZUNlbnRlciwgaXQxLCBpdDIsIGllMSwgaWUyKTtcbiAgICAgICAgY29uc3QgcGxhbmVOMSA9IHQxO1xuICAgICAgICBjb25zdCBwbGFuZU4yID0gdmVjMy5zY2FsZSh0MSwgLTEsIHRtcCgpKTtcbiAgICAgICAgY29uc3QgcGxhbmVOMyA9IHQyO1xuICAgICAgICBjb25zdCBwbGFuZU40ID0gdmVjMy5zY2FsZSh0MiwgLTEsIHRtcCgpKTtcbiAgICAgICAgY29uc3QgZDEgPSB2ZWMzLmRvdChwbGFuZU4xLCByZWZGYWNlQ2VudGVyKSArIGUxO1xuICAgICAgICBjb25zdCBkMiA9IHZlYzMuZG90KHBsYW5lTjIsIHJlZkZhY2VDZW50ZXIpICsgZTE7XG4gICAgICAgIGNvbnN0IGQzID0gdmVjMy5kb3QocGxhbmVOMywgcmVmRmFjZUNlbnRlcikgKyBlMjtcbiAgICAgICAgY29uc3QgZDQgPSB2ZWMzLmRvdChwbGFuZU40LCByZWZGYWNlQ2VudGVyKSArIGUyO1xuICAgICAgICBwb2x5ID0gY2xpcFBvbHlnb25BZ2FpbnN0UGxhbmUocG9seSwgcGxhbmVOMSwgZDEpO1xuICAgICAgICBwb2x5ID0gY2xpcFBvbHlnb25BZ2FpbnN0UGxhbmUocG9seSwgcGxhbmVOMiwgZDIpO1xuICAgICAgICBwb2x5ID0gY2xpcFBvbHlnb25BZ2FpbnN0UGxhbmUocG9seSwgcGxhbmVOMywgZDMpO1xuICAgICAgICBwb2x5ID0gY2xpcFBvbHlnb25BZ2FpbnN0UGxhbmUocG9seSwgcGxhbmVONCwgZDQpO1xuICAgICAgICBpZiAocG9seS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgcmVmUGxhbmVEID0gdmVjMy5kb3Qobm9ybWFsLCByZWZGYWNlQ2VudGVyKTtcbiAgICAgICAgZm9yIChjb25zdCBwIG9mIHBvbHkpIHtcbiAgICAgICAgICAgIGNvbnN0IHBlbmV0cmF0aW9uID0gcmVmUGxhbmVEIC0gdmVjMy5kb3Qobm9ybWFsLCBwKTtcbiAgICAgICAgICAgIGlmIChwZW5ldHJhdGlvbiA+PSAtRXBzaWxvbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlcHRoID0gTWF0aC5tYXgoMCwgcGVuZXRyYXRpb24pO1xuICAgICAgICAgICAgICAgIGNvbGxpc2lvbnMucHVzaCh7IGNvbnRhY3Q6IHAuY29weSgpLCBub3JtYWw6IG5vcm1hbC5jb3B5KCksIGRpc3RhbmNlOiBkZXB0aCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29sbGlzaW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbnRyb2lkID0gcG9seS5yZWR1Y2UoKGFjYywgdikgPT4gdmVjMy5hZGQoYWNjLCB2LCBhY2MpLCBuZXcgdmVjMygpKS5zY2FsZSgxIC8gcG9seS5sZW5ndGgpO1xuICAgICAgICAgICAgY29uc3QgcGVuID0gcmVmUGxhbmVEIC0gdmVjMy5kb3Qobm9ybWFsLCBjZW50cm9pZCk7XG4gICAgICAgICAgICB2ZWMzLmFkZChjZW50cm9pZCwgdmVjMy5zY2FsZShub3JtYWwsIE1hdGgubWF4KDAsIHBlbiksIHRtcCgpKSwgY2VudHJvaWQpO1xuICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoKHsgY29udGFjdDogY2VudHJvaWQsIG5vcm1hbDogbm9ybWFsLmNvcHkoKSwgZGlzdGFuY2U6IE1hdGgubWF4KDAsIHBlbikgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbGxpc2lvbnMubGVuZ3RoID4gNClcbiAgICAgICAgICAgIGNvbGxpc2lvbnMubGVuZ3RoID0gNDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIC0tLS0tLS0tLSBGSVhFRCBFREdF4oCTRURHRSBDQVNFIC0tLS0tLS0tLS1cbiAgICAgICAgY29uc3QgaSA9IGJlc3RJbmRleEE7XG4gICAgICAgIGNvbnN0IGogPSBiZXN0SW5kZXhCO1xuICAgICAgICBjb25zdCBvdGhlckEgPSBjaG9vc2VGYWNlVGFuZ2VudEluZGljZXMoaSk7XG4gICAgICAgIGNvbnN0IG90aGVyQiA9IGNob29zZUZhY2VUYW5nZW50SW5kaWNlcyhqKTtcbiAgICAgICAgY29uc3Qgc2lnbkExID0gc2lnbk5vblplcm8odmVjMy5kb3QodCwgYXhlc0Fbb3RoZXJBWzBdXSksIDEpO1xuICAgICAgICBjb25zdCBzaWduQTIgPSBzaWduTm9uWmVybyh2ZWMzLmRvdCh0LCBheGVzQVtvdGhlckFbMV1dKSwgMSk7XG4gICAgICAgIGNvbnN0IHNpZ25CMSA9IC1zaWduTm9uWmVybyh2ZWMzLmRvdCh0LCBheGVzQltvdGhlckJbMF1dKSwgMSk7XG4gICAgICAgIGNvbnN0IHNpZ25CMiA9IC1zaWduTm9uWmVybyh2ZWMzLmRvdCh0LCBheGVzQltvdGhlckJbMV1dKSwgMSk7XG4gICAgICAgIGNvbnN0IGJhc2VBID0gdmVjMy5hZGQodmVjMy5hZGQoY0EsIHZlYzMuc2NhbGUoYXhlc0Fbb3RoZXJBWzBdXSwgZXh0QVtvdGhlckFbMF1dICogc2lnbkExLCB0bXAoKSksIHRtcCgpKSwgdmVjMy5zY2FsZShheGVzQVtvdGhlckFbMV1dLCBleHRBW290aGVyQVsxXV0gKiBzaWduQTIsIHRtcCgpKSwgdG1wKCkpO1xuICAgICAgICBjb25zdCBiYXNlQiA9IHZlYzMuYWRkKHZlYzMuYWRkKGNCLCB2ZWMzLnNjYWxlKGF4ZXNCW290aGVyQlswXV0sIGV4dEJbb3RoZXJCWzBdXSAqIHNpZ25CMSwgdG1wKCkpLCB0bXAoKSksIHZlYzMuc2NhbGUoYXhlc0Jbb3RoZXJCWzFdXSwgZXh0QltvdGhlckJbMV1dICogc2lnbkIyLCB0bXAoKSksIHRtcCgpKTtcbiAgICAgICAgY29uc3QgdSA9IGF4ZXNBW2ldLmNvcHkoKTsgLy8gdW5pdFxuICAgICAgICBjb25zdCB2ID0gYXhlc0Jbal0uY29weSgpOyAvLyB1bml0XG4gICAgICAgIGNvbnN0IHAwID0gdmVjMy5hZGQoYmFzZUEsIHZlYzMuc2NhbGUodSwgLWV4dEFbaV0sIHRtcCgpKSwgdG1wKCkpO1xuICAgICAgICBjb25zdCBxMCA9IHZlYzMuYWRkKGJhc2VCLCB2ZWMzLnNjYWxlKHYsIC1leHRCW2pdLCB0bXAoKSksIHRtcCgpKTtcbiAgICAgICAgY29uc3QgY29udGFjdCA9IGNsb3Nlc3RQb2ludEJldHdlZW5TZWdtZW50c01pZHBvaW50KHAwLCB1LCBleHRBW2ldLCBxMCwgdiwgZXh0QltqXSk7XG4gICAgICAgIC8vIENvbXB1dGUgcGVuZXRyYXRpb24gYWdhaW5zdCBib3RoIGJveGVzJyByZWZlcmVuY2UgcGxhbmVzIGFsb25nIGBub3JtYWxgLFxuICAgICAgICAvLyBhbmQgdGFrZSB0aGUgc21hbGxlciBub24tbmVnYXRpdmUgcGVuZXRyYXRpb24uXG4gICAgICAgIGNvbnN0IHBlbkEgPSBwb2ludFBlbmV0cmF0aW9uQWdhaW5zdEJveFBsYW5lKGNvbnRhY3QsIG5vcm1hbCwgYXhlc0EsIGV4dEEsIGNBKTtcbiAgICAgICAgY29uc3QgcGVuQiA9IHBvaW50UGVuZXRyYXRpb25BZ2FpbnN0Qm94UGxhbmUoY29udGFjdCwgdmVjMy5zY2FsZShub3JtYWwsIC0xLCB0bXAoKSksIGF4ZXNCLCBleHRCLCBjQik7XG4gICAgICAgIC8vIGBwZW5CYCB1c2VkIGEgZmxpcHBlZCBub3JtYWwgdG8gcGljayBCJ3MgZmFjZSB0b3dhcmQgQSwgYnV0IHdlIHJlcG9ydCBkaXN0YW5jZSBhbG9uZyBgbm9ybWFsYC5cbiAgICAgICAgY29uc3QgZGVwdGggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihwZW5BLCBwZW5CKSk7XG4gICAgICAgIGNvbGxpc2lvbnMucHVzaCh7IGNvbnRhY3QsIG5vcm1hbDogbm9ybWFsLmNvcHkoKSwgZGlzdGFuY2U6IGRlcHRoIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY29sbGlzaW9ucy5sZW5ndGggPiAwID8gY29sbGlzaW9ucyA6IG51bGw7XG59O1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5jb25zdCBFUFMgPSAxZS02O1xuLy8gRXhhY3QgdmlhIHRyYW5zZm9ybSB0byB1bml0IHNwaGVyZSBhbmQgdHJpYW5nbGUgZGlzdGFuY2VcbmV4cG9ydCBmdW5jdGlvbiBjb2xsaWRlRWxsaXBzb2lkV2l0aEN1Ym9pZChlbGxpcHNvaWQsIGN1Ym9pZCkge1xuICAgIGNvbnN0IGMgPSBlbGxpcHNvaWQuY2VudGVyO1xuICAgIGNvbnN0IHV4ID0gZWxsaXBzb2lkLmF4ZXNbMF07XG4gICAgY29uc3QgdXkgPSBlbGxpcHNvaWQuYXhlc1sxXTtcbiAgICBjb25zdCB1eiA9IGVsbGlwc29pZC5heGVzWzJdO1xuICAgIGNvbnN0IHsgeDogYSwgeTogYiwgejogY3IgfSA9IGVsbGlwc29pZC5yYWRpaTtcbiAgICBjb25zdCB0b1NjYWxlZCA9IChwLCBvdXQgPSBuZXcgdmVjMygpKSA9PiB7XG4gICAgICAgIGNvbnN0IHIgPSB2ZWMzLnN1YnRyYWN0KHAsIGMsIG5ldyB2ZWMzKCkpO1xuICAgICAgICBvdXQueCA9IHZlYzMuZG90KHIsIHV4KSAvIGE7XG4gICAgICAgIG91dC55ID0gdmVjMy5kb3QociwgdXkpIC8gYjtcbiAgICAgICAgb3V0LnogPSB2ZWMzLmRvdChyLCB1eikgLyBjcjtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIGNvbnN0IHRvV29ybGQgPSAocFMsIG91dCA9IG5ldyB2ZWMzKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIHZlYzMuYWRkKGMsIHZlYzMuYWRkKHZlYzMuYWRkKHZlYzMuc2NhbGUodXgsIGEgKiBwUy54LCBuZXcgdmVjMygpKSwgdmVjMy5zY2FsZSh1eSwgYiAqIHBTLnksIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKSwgdmVjMy5zY2FsZSh1eiwgY3IgKiBwUy56LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSksIG91dCk7XG4gICAgfTtcbiAgICAvLyBUcmFuc2Zvcm0gY3Vib2lkIHZlcnRpY2VzIHRvIHNjYWxlZCBzcGFjZVxuICAgIGNvbnN0IHZXb3JsZCA9IGN1Ym9pZC5nZXRWZXJ0aWNlcygpO1xuICAgIGNvbnN0IHZTID0gdldvcmxkLm1hcCgodikgPT4gdG9TY2FsZWQodikpO1xuICAgIC8vIEZhY2VzIGFzIHF1YWRzLCB0aGVuIHRyaWFuZ3VsYXRlIChbaTAsaTEsaTJdLCBbaTAsaTIsaTNdKVxuICAgIGNvbnN0IGZhY2VzID0gW1xuICAgICAgICBbMCwgMSwgMywgMl0sXG4gICAgICAgIFs0LCA1LCA3LCA2XSxcbiAgICAgICAgWzAsIDEsIDUsIDRdLFxuICAgICAgICBbMiwgMywgNywgNl0sXG4gICAgICAgIFswLCAyLCA2LCA0XSxcbiAgICAgICAgWzEsIDMsIDcsIDVdIC8vIC1aXG4gICAgXTtcbiAgICBjb25zdCB0cmlJbmRpY2VzID0gW107XG4gICAgZmFjZXMuZm9yRWFjaCgoW2kwLCBpMSwgaTIsIGkzXSkgPT4ge1xuICAgICAgICB0cmlJbmRpY2VzLnB1c2goW2kwLCBpMSwgaTJdLCBbaTAsIGkyLCBpM10pO1xuICAgIH0pO1xuICAgIGNvbnN0IG9yaWdpblMgPSB2ZWMzLnplcm87XG4gICAgbGV0IG1pbkRpc3QyID0gSW5maW5pdHk7XG4gICAgbGV0IGJlc3RDbG9zZXN0ID0gbmV3IHZlYzMoKTtcbiAgICBjb25zdCBjbG9zZXN0UG9pbnRPblRyaSA9IChwLCBhLCBiLCBjKSA9PiB7XG4gICAgICAgIGNvbnN0IGFiID0gdmVjMy5zdWJ0cmFjdChiLCBhLCBuZXcgdmVjMygpKTtcbiAgICAgICAgY29uc3QgYWMgPSB2ZWMzLnN1YnRyYWN0KGMsIGEsIG5ldyB2ZWMzKCkpO1xuICAgICAgICBjb25zdCBhcCA9IHZlYzMuc3VidHJhY3QocCwgYSwgbmV3IHZlYzMoKSk7XG4gICAgICAgIGNvbnN0IGQxID0gdmVjMy5kb3QoYWIsIGFwKTtcbiAgICAgICAgY29uc3QgZDIgPSB2ZWMzLmRvdChhYywgYXApO1xuICAgICAgICBpZiAoZDEgPD0gMCAmJiBkMiA8PSAwKVxuICAgICAgICAgICAgcmV0dXJuIGEuY29weSgpO1xuICAgICAgICBjb25zdCBicCA9IHZlYzMuc3VidHJhY3QocCwgYiwgbmV3IHZlYzMoKSk7XG4gICAgICAgIGNvbnN0IGQzID0gdmVjMy5kb3QoYWIsIGJwKTtcbiAgICAgICAgY29uc3QgZDQgPSB2ZWMzLmRvdChhYywgYnApO1xuICAgICAgICBpZiAoZDMgPj0gMCAmJiBkNCA8PSBkMylcbiAgICAgICAgICAgIHJldHVybiBiLmNvcHkoKTtcbiAgICAgICAgY29uc3QgdmMgPSBkMSAqIGQ0IC0gZDMgKiBkMjtcbiAgICAgICAgaWYgKHZjIDw9IDAgJiYgZDEgPj0gMCAmJiBkMyA8PSAwKSB7XG4gICAgICAgICAgICBjb25zdCB2ID0gZDEgLyAoZDEgLSBkMyk7XG4gICAgICAgICAgICByZXR1cm4gdmVjMy5hZGQoYSwgdmVjMy5zY2FsZShhYiwgdiwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNwID0gdmVjMy5zdWJ0cmFjdChwLCBjLCBuZXcgdmVjMygpKTtcbiAgICAgICAgY29uc3QgZDUgPSB2ZWMzLmRvdChhYiwgY3ApO1xuICAgICAgICBjb25zdCBkNiA9IHZlYzMuZG90KGFjLCBjcCk7XG4gICAgICAgIGlmIChkNiA+PSAwICYmIGQ1IDw9IGQ2KVxuICAgICAgICAgICAgcmV0dXJuIGMuY29weSgpO1xuICAgICAgICBjb25zdCB2YiA9IGQ1ICogZDIgLSBkMSAqIGQ2O1xuICAgICAgICBpZiAodmIgPD0gMCAmJiBkMiA+PSAwICYmIGQ2IDw9IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHcgPSBkMiAvIChkMiAtIGQ2KTtcbiAgICAgICAgICAgIHJldHVybiB2ZWMzLmFkZChhLCB2ZWMzLnNjYWxlKGFjLCB3LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmEgPSBkMyAqIGQ2IC0gZDUgKiBkNDtcbiAgICAgICAgaWYgKHZhIDw9IDAgJiYgKGQ0IC0gZDMpID49IDAgJiYgKGQ1IC0gZDYpID49IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHcgPSAoZDQgLSBkMykgLyAoKGQ0IC0gZDMpICsgKGQ1IC0gZDYpKTtcbiAgICAgICAgICAgIGNvbnN0IGJjID0gdmVjMy5zdWJ0cmFjdChjLCBiLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgIHJldHVybiB2ZWMzLmFkZChiLCB2ZWMzLnNjYWxlKGJjLCB3LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVub20gPSAxIC8gKHZhICsgdmIgKyB2Yyk7XG4gICAgICAgIGNvbnN0IHYgPSB2YiAqIGRlbm9tO1xuICAgICAgICBjb25zdCB3ID0gdmMgKiBkZW5vbTtcbiAgICAgICAgcmV0dXJuIHZlYzMuYWRkKGEsIHZlYzMuYWRkKHZlYzMuc2NhbGUoYWIsIHYsIG5ldyB2ZWMzKCkpLCB2ZWMzLnNjYWxlKGFjLCB3LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgIH07XG4gICAgZm9yIChjb25zdCBbaTAsIGkxLCBpMl0gb2YgdHJpSW5kaWNlcykge1xuICAgICAgICBjb25zdCBhUyA9IHZTW2kwXTtcbiAgICAgICAgY29uc3QgYlMgPSB2U1tpMV07XG4gICAgICAgIGNvbnN0IGNTID0gdlNbaTJdO1xuICAgICAgICBjb25zdCBxID0gY2xvc2VzdFBvaW50T25Ucmkob3JpZ2luUywgYVMsIGJTLCBjUyk7XG4gICAgICAgIGNvbnN0IGQyID0gcS5zcXVhcmVkTGVuZ3RoO1xuICAgICAgICBpZiAoZDIgPCBtaW5EaXN0Mikge1xuICAgICAgICAgICAgbWluRGlzdDIgPSBkMjtcbiAgICAgICAgICAgIGJlc3RDbG9zZXN0ID0gcTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkaXN0ID0gTWF0aC5zcXJ0KG1pbkRpc3QyKTtcbiAgICBpZiAoZGlzdCA+IDEgKyBFUFMpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGNvbnRhY3QgPSB0b1dvcmxkKGJlc3RDbG9zZXN0KTtcbiAgICBjb25zdCBwZW5ldHJhdGlvbiA9IE1hdGgubWF4KDAsIDEgLSBkaXN0KTtcbiAgICAvLyBOb3JtYWw6IHVzZSBzcGhlcmUgbm9ybWFsIGluIHNjYWxlZCBzcGFjZSBtYXBwZWQgYmFjayB0byB3b3JsZDogbiA9IE1eVCBuJ1xuICAgIGxldCBuV29ybGQgPSB2ZWMzLmFkZCh2ZWMzLmFkZCh2ZWMzLnNjYWxlKHV4LCBiZXN0Q2xvc2VzdC54IC8gYSwgbmV3IHZlYzMoKSksIHZlYzMuc2NhbGUodXksIGJlc3RDbG9zZXN0LnkgLyBiLCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSksIHZlYzMuc2NhbGUodXosIGJlc3RDbG9zZXN0LnogLyBjciwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgIGlmIChuV29ybGQubGVuZ3RoID4gMCkge1xuICAgICAgICBuV29ybGQubm9ybWFsaXplKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBuV29ybGQgPSB2ZWMzLnVwLmNvcHkoKTtcbiAgICB9XG4gICAgcmV0dXJuIFt7IGNvbnRhY3QsIG5vcm1hbDogbldvcmxkLCBkaXN0YW5jZTogcGVuZXRyYXRpb24gfV07XG59XG4iLCJleHBvcnQgY29uc3QgY29sbGlkZVBsYW5lV2l0aEN1Ym9pZCA9IChwbGFuZSwgY3Vib2lkKSA9PiB7XG4gICAgY29uc3QgY29sbGlzaW9ucyA9IFtdO1xuICAgIGN1Ym9pZC5nZXRWZXJ0aWNlcygpLmZvckVhY2goKHZlcnRleCkgPT4ge1xuICAgICAgICBjb25zdCBkaXN0YW5jZVRvUGxhbmUgPSBwbGFuZS5zaWduZWREaXN0YW5jZSh2ZXJ0ZXgpO1xuICAgICAgICAvLyBJZiB0aGUgdmVydGV4IGlzIHBlbmV0cmF0aW5nIHRoZSBwbGFuZSwgYWRkIGl0IHRvIHRoZSBjb2xsaXNpb24gbWFuaWZvbGRcbiAgICAgICAgaWYgKGRpc3RhbmNlVG9QbGFuZSA8PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWwgPSBwbGFuZS5ub3JtYWwuY29weSgpO1xuICAgICAgICAgICAgY29uc3QgcGVuZXRyYXRpb25EZXB0aCA9IC1kaXN0YW5jZVRvUGxhbmU7IC8vIE5lZ2F0aXZlIGJlY2F1c2UgaXQncyBwZW5ldHJhdGlvblxuICAgICAgICAgICAgY29sbGlzaW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBjb250YWN0OiB2ZXJ0ZXguY29weSgpLFxuICAgICAgICAgICAgICAgIG5vcm1hbDogbm9ybWFsLFxuICAgICAgICAgICAgICAgIGRpc3RhbmNlOiBwZW5ldHJhdGlvbkRlcHRoXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb2xsaXNpb25zLmxlbmd0aCA+IDAgPyBjb2xsaXNpb25zIDogbnVsbDtcbn07XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmV4cG9ydCBmdW5jdGlvbiBjb2xsaWRlUGxhbmVXaXRoRWxsaXBzb2lkKHBsYW5lLCBlbGxpcHNvaWQpIHtcbiAgICBjb25zdCB7IGNlbnRlciB9ID0gZWxsaXBzb2lkO1xuICAgIGNvbnN0IHsgbm9ybWFsLCBkaXN0YW5jZTogcGxhbmVEaXN0YW5jZSB9ID0gcGxhbmU7XG4gICAgY29uc3Qgc2lnbmVkID0gdmVjMy5kb3QoY2VudGVyLCBub3JtYWwpIC0gcGxhbmVEaXN0YW5jZTtcbiAgICBjb25zdCByID0gZWxsaXBzb2lkLmVmZmVjdGl2ZVJhZGl1cyhub3JtYWwpO1xuICAgIGlmIChNYXRoLmFicyhzaWduZWQpIDw9IHIpIHtcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gdmVjMy5zY2FsZShub3JtYWwsIHNpZ25lZCwgbmV3IHZlYzMoKSk7XG4gICAgICAgIGNvbnN0IGNvbnRhY3RQb2ludCA9IHZlYzMuc3VidHJhY3QoY2VudGVyLCBvZmZzZXQsIG5ldyB2ZWMzKCkpO1xuICAgICAgICBjb25zdCBwZW5ldHJhdGlvbkRlcHRoID0gciAtIE1hdGguYWJzKHNpZ25lZCk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB7IGNvbnRhY3Q6IGNvbnRhY3RQb2ludCwgbm9ybWFsOiBub3JtYWwuY29weSgpLCBkaXN0YW5jZTogcGVuZXRyYXRpb25EZXB0aCB9XG4gICAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5leHBvcnQgZnVuY3Rpb24gY29sbGlkZVBsYW5lV2l0aFNwaGVyZShwbGFuZSwgc3BoZXJlKSB7XG4gICAgY29uc3QgeyBjZW50ZXI6IHNwaGVyZUNlbnRlciwgcmFkaXVzIH0gPSBzcGhlcmU7XG4gICAgY29uc3QgeyBub3JtYWwsIGRpc3RhbmNlOiBwbGFuZURpc3RhbmNlIH0gPSBwbGFuZTtcbiAgICBjb25zdCBkaXN0YW5jZUZyb21TcGhlcmVDZW50ZXJUb1BsYW5lID0gdmVjMy5kb3Qoc3BoZXJlQ2VudGVyLCBub3JtYWwpIC0gcGxhbmVEaXN0YW5jZTtcbiAgICBpZiAoTWF0aC5hYnMoZGlzdGFuY2VGcm9tU3BoZXJlQ2VudGVyVG9QbGFuZSkgPD0gcmFkaXVzKSB7XG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHZlYzMuc2NhbGUobm9ybWFsLCBkaXN0YW5jZUZyb21TcGhlcmVDZW50ZXJUb1BsYW5lLCBuZXcgdmVjMygpKTtcbiAgICAgICAgY29uc3QgY29udGFjdFBvaW50ID0gdmVjMy5zdWJ0cmFjdChzcGhlcmVDZW50ZXIsIG9mZnNldCwgbmV3IHZlYzMoKSk7XG4gICAgICAgIGNvbnN0IHBlbmV0cmF0aW9uRGVwdGggPSByYWRpdXMgLSBNYXRoLmFicyhkaXN0YW5jZUZyb21TcGhlcmVDZW50ZXJUb1BsYW5lKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb250YWN0OiBjb250YWN0UG9pbnQsXG4gICAgICAgICAgICAgICAgbm9ybWFsOiBub3JtYWwuY29weSgpLFxuICAgICAgICAgICAgICAgIGRpc3RhbmNlOiBwZW5ldHJhdGlvbkRlcHRoXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5jb25zdCBFUFMgPSAxZS02O1xuY29uc3QgQ09OVEFDVF9TTE9QID0gMWUtMztcbmNvbnN0IGJ1aWxkUGxhbmVCYXNpcyA9IChuKSA9PiB7XG4gICAgY29uc3QgdXAgPSBNYXRoLmFicyhuLnopIDwgMC45OTkgPyBuZXcgdmVjMyhbMCwgMCwgMV0pIDogbmV3IHZlYzMoWzAsIDEsIDBdKTtcbiAgICBjb25zdCB0MSA9IHZlYzMuY3Jvc3ModXAsIG4sIG5ldyB2ZWMzKCkpLm5vcm1hbGl6ZSgpO1xuICAgIGNvbnN0IHQyID0gdmVjMy5jcm9zcyhuLCB0MSwgbmV3IHZlYzMoKSkubm9ybWFsaXplKCk7XG4gICAgcmV0dXJuIHsgdDEsIHQyIH07XG59O1xuY29uc3QgcHJvamVjdFRvMkQgPSAocCwgcDAsIHQxLCB0MikgPT4ge1xuICAgIGNvbnN0IGQgPSB2ZWMzLnN1YnRyYWN0KHAsIHAwLCBuZXcgdmVjMygpKTtcbiAgICByZXR1cm4geyB4OiB2ZWMzLmRvdChkLCB0MSksIHk6IHZlYzMuZG90KGQsIHQyKSB9O1xufTtcbmNvbnN0IHBvaW50SW5Qb2x5Z29uMkQgPSAocHQsIHBvbHkpID0+IHtcbiAgICBsZXQgaW5zaWRlID0gZmFsc2U7XG4gICAgZm9yIChsZXQgaSA9IDAsIGogPSBwb2x5Lmxlbmd0aCAtIDE7IGkgPCBwb2x5Lmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgICBjb25zdCB4aSA9IHBvbHlbaV0ueCwgeWkgPSBwb2x5W2ldLnk7XG4gICAgICAgIGNvbnN0IHhqID0gcG9seVtqXS54LCB5aiA9IHBvbHlbal0ueTtcbiAgICAgICAgY29uc3QgaW50ZXJzZWN0ID0gKCh5aSA+IHB0LnkpICE9PSAoeWogPiBwdC55KSkgJiZcbiAgICAgICAgICAgIChwdC54IDwgKCh4aiAtIHhpKSAqIChwdC55IC0geWkpKSAvICgoeWogLSB5aSkgfHwgRVBTKSArIHhpKTtcbiAgICAgICAgaWYgKGludGVyc2VjdClcbiAgICAgICAgICAgIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgfVxuICAgIHJldHVybiBpbnNpZGU7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxpZGVQb2x5Z29uV2l0aEN1Ym9pZChwb2x5Z29uLCBjdWJvaWQpIHtcbiAgICBjb25zdCBjb2xsaXNpb25zID0gW107XG4gICAgY29uc3QgbiA9IHBvbHlnb24ubm9ybWFsLmNvcHkoKS5ub3JtYWxpemUoKTtcbiAgICBjb25zdCBwMCA9IHBvbHlnb24udmVydGljZXNbMF07XG4gICAgY29uc3QgcGxhbmVEID0gdmVjMy5kb3QobiwgcDApO1xuICAgIGNvbnN0IHsgdDEsIHQyIH0gPSBidWlsZFBsYW5lQmFzaXMobik7XG4gICAgY29uc3QgcG9seTJEID0gcG9seWdvbi52ZXJ0aWNlcy5tYXAodiA9PiBwcm9qZWN0VG8yRCh2LCBwMCwgdDEsIHQyKSk7XG4gICAgY29uc3QgdmVydHMgPSBjdWJvaWQuZ2V0VmVydGljZXMoKTtcbiAgICAvLyAxKSBQZW5ldHJhdGluZyB2ZXJ0aWNlcyAtPiBwcm9qZWN0IGNvbnRhY3QgdG8gcGxhbmUsIGtlZXAgcG9zaXRpdmUgZGVwdGhcbiAgICBmb3IgKGNvbnN0IHYgb2YgdmVydHMpIHtcbiAgICAgICAgY29uc3Qgc2lnbmVkID0gdmVjMy5kb3QobiwgdikgLSBwbGFuZUQ7IC8vIDwwIG1lYW5zIHYgaXMgXCJiZWhpbmRcIiBwbGFuZSB3LnIudCBuXG4gICAgICAgIGNvbnN0IGRlcHRoID0gTWF0aC5tYXgoMCwgLXNpZ25lZCk7XG4gICAgICAgIGlmIChkZXB0aCA+IENPTlRBQ1RfU0xPUCkge1xuICAgICAgICAgICAgY29uc3QgcHJvajJEID0gcHJvamVjdFRvMkQodiwgcDAsIHQxLCB0Mik7XG4gICAgICAgICAgICBpZiAocG9pbnRJblBvbHlnb24yRChwcm9qMkQsIHBvbHkyRCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjb250YWN0IHBvaW50IGlzIHYgcHJvamVjdGVkIG9udG8gdGhlIHBsYW5lXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGFjdE9uUGxhbmUgPSB2ZWMzLmFkZCh2LCB2ZWMzLnNjYWxlKG4sIC1zaWduZWQsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goeyBjb250YWN0OiBjb250YWN0T25QbGFuZSwgbm9ybWFsOiBuLmNvcHkoKSwgZGlzdGFuY2U6IGRlcHRoIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIDIpIEVkZ2XigJNwbGFuZSBpbnRlcnNlY3Rpb25zICh0b3VjaGluZylcbiAgICBjb25zdCBlZGdlcyA9IGN1Ym9pZC5nZXRFZGdlcygpO1xuICAgIGZvciAoY29uc3QgW2kxLCBpMl0gb2YgZWRnZXMpIHtcbiAgICAgICAgY29uc3QgdjEgPSB2ZXJ0c1tpMV0sIHYyID0gdmVydHNbaTJdO1xuICAgICAgICBjb25zdCBkMSA9IHZlYzMuZG90KG4sIHYxKSAtIHBsYW5lRDtcbiAgICAgICAgY29uc3QgZDIgPSB2ZWMzLmRvdChuLCB2MikgLSBwbGFuZUQ7XG4gICAgICAgIGlmICgoZDEgPiBDT05UQUNUX1NMT1AgJiYgZDIgPCAtQ09OVEFDVF9TTE9QKSB8fCAoZDEgPCAtQ09OVEFDVF9TTE9QICYmIGQyID4gQ09OVEFDVF9TTE9QKSB8fFxuICAgICAgICAgICAgKE1hdGguYWJzKGQxKSA8PSBDT05UQUNUX1NMT1AgJiYgTWF0aC5hYnMoZDIpIDw9IENPTlRBQ1RfU0xPUCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVkZ2UgPSB2ZWMzLnN1YnRyYWN0KHYyLCB2MSwgbmV3IHZlYzMoKSk7XG4gICAgICAgICAgICBjb25zdCBkZW5vbSA9IHZlYzMuZG90KG4sIGVkZ2UpO1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGRlbm9tKSA+IEVQUykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSAocGxhbmVEIC0gdmVjMy5kb3QobiwgdjEpKSAvIGRlbm9tO1xuICAgICAgICAgICAgICAgIGlmICh0ID49IC1FUFMgJiYgdCA8PSAxICsgRVBTKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhpdCA9IHZlYzMuYWRkKHYxLCB2ZWMzLnNjYWxlKGVkZ2UsIHQsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvajJEID0gcHJvamVjdFRvMkQoaGl0LCBwMCwgdDEsIHQyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50SW5Qb2x5Z29uMkQocHJvajJELCBwb2x5MkQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsaXNpb25zLnB1c2goeyBjb250YWN0OiBoaXQsIG5vcm1hbDogbi5jb3B5KCksIGRpc3RhbmNlOiAwIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb2xsaXNpb25zLmxlbmd0aCA+IDAgPyBjb2xsaXNpb25zIDogbnVsbDtcbn1cbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuLy8gQ2xvc2VzdCBwb2ludCBmcm9tIHBvaW50IHAgdG8gdHJpYW5nbGUgYWJjXG5jb25zdCBjbG9zZXN0UG9pbnRPblRyaWFuZ2xlID0gKHAsIGEsIGIsIGMpID0+IHtcbiAgICBjb25zdCBhYiA9IHZlYzMuc3VidHJhY3QoYiwgYSwgbmV3IHZlYzMoKSk7XG4gICAgY29uc3QgYWMgPSB2ZWMzLnN1YnRyYWN0KGMsIGEsIG5ldyB2ZWMzKCkpO1xuICAgIGNvbnN0IGFwID0gdmVjMy5zdWJ0cmFjdChwLCBhLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCBkMSA9IHZlYzMuZG90KGFiLCBhcCk7XG4gICAgY29uc3QgZDIgPSB2ZWMzLmRvdChhYywgYXApO1xuICAgIGlmIChkMSA8PSAwICYmIGQyIDw9IDApXG4gICAgICAgIHJldHVybiBhLmNvcHkoKTtcbiAgICBjb25zdCBicCA9IHZlYzMuc3VidHJhY3QocCwgYiwgbmV3IHZlYzMoKSk7XG4gICAgY29uc3QgZDMgPSB2ZWMzLmRvdChhYiwgYnApO1xuICAgIGNvbnN0IGQ0ID0gdmVjMy5kb3QoYWMsIGJwKTtcbiAgICBpZiAoZDMgPj0gMCAmJiBkNCA8PSBkMylcbiAgICAgICAgcmV0dXJuIGIuY29weSgpO1xuICAgIGNvbnN0IHZjID0gZDEgKiBkNCAtIGQzICogZDI7XG4gICAgaWYgKHZjIDw9IDAgJiYgZDEgPj0gMCAmJiBkMyA8PSAwKSB7XG4gICAgICAgIGNvbnN0IHYgPSBkMSAvIChkMSAtIGQzKTtcbiAgICAgICAgcmV0dXJuIHZlYzMuYWRkKGEsIHZlYzMuc2NhbGUoYWIsIHYsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICB9XG4gICAgY29uc3QgY3AgPSB2ZWMzLnN1YnRyYWN0KHAsIGMsIG5ldyB2ZWMzKCkpO1xuICAgIGNvbnN0IGQ1ID0gdmVjMy5kb3QoYWIsIGNwKTtcbiAgICBjb25zdCBkNiA9IHZlYzMuZG90KGFjLCBjcCk7XG4gICAgaWYgKGQ2ID49IDAgJiYgZDUgPD0gZDYpXG4gICAgICAgIHJldHVybiBjLmNvcHkoKTtcbiAgICBjb25zdCB2YiA9IGQ1ICogZDIgLSBkMSAqIGQ2O1xuICAgIGlmICh2YiA8PSAwICYmIGQyID49IDAgJiYgZDYgPD0gMCkge1xuICAgICAgICBjb25zdCB3ID0gZDIgLyAoZDIgLSBkNik7XG4gICAgICAgIHJldHVybiB2ZWMzLmFkZChhLCB2ZWMzLnNjYWxlKGFjLCB3LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgfVxuICAgIGNvbnN0IHZhID0gZDMgKiBkNiAtIGQ1ICogZDQ7XG4gICAgaWYgKHZhIDw9IDAgJiYgKGQ0IC0gZDMpID49IDAgJiYgKGQ1IC0gZDYpID49IDApIHtcbiAgICAgICAgY29uc3QgdyA9IChkNCAtIGQzKSAvICgoZDQgLSBkMykgKyAoZDUgLSBkNikpO1xuICAgICAgICBjb25zdCBiYyA9IHZlYzMuc3VidHJhY3QoYywgYiwgbmV3IHZlYzMoKSk7XG4gICAgICAgIHJldHVybiB2ZWMzLmFkZChiLCB2ZWMzLnNjYWxlKGJjLCB3LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgfVxuICAgIGNvbnN0IGRlbm9tID0gMSAvICh2YSArIHZiICsgdmMpO1xuICAgIGNvbnN0IHYgPSB2YiAqIGRlbm9tO1xuICAgIGNvbnN0IHcgPSB2YyAqIGRlbm9tO1xuICAgIHJldHVybiB2ZWMzLmFkZChhLCB2ZWMzLmFkZCh2ZWMzLnNjYWxlKGFiLCB2LCBuZXcgdmVjMygpKSwgdmVjMy5zY2FsZShhYywgdywgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbn07XG5leHBvcnQgY29uc3QgY29sbGlkZVBvbHlnb25XaXRoRWxsaXBzb2lkID0gKHBvbHlnb24sIGVsbGlwc29pZCkgPT4ge1xuICAgIGNvbnN0IGMgPSBlbGxpcHNvaWQuY2VudGVyO1xuICAgIGNvbnN0IHV4ID0gZWxsaXBzb2lkLmF4ZXNbMF07XG4gICAgY29uc3QgdXkgPSBlbGxpcHNvaWQuYXhlc1sxXTtcbiAgICBjb25zdCB1eiA9IGVsbGlwc29pZC5heGVzWzJdO1xuICAgIGNvbnN0IHsgeDogYSwgeTogYiwgejogY3IgfSA9IGVsbGlwc29pZC5yYWRpaTtcbiAgICBjb25zdCB0b1NjYWxlZCA9IChwLCBvdXQgPSBuZXcgdmVjMygpKSA9PiB7XG4gICAgICAgIGNvbnN0IHIgPSB2ZWMzLnN1YnRyYWN0KHAsIGMsIG5ldyB2ZWMzKCkpO1xuICAgICAgICBvdXQueCA9IHZlYzMuZG90KHIsIHV4KSAvIGE7XG4gICAgICAgIG91dC55ID0gdmVjMy5kb3QociwgdXkpIC8gYjtcbiAgICAgICAgb3V0LnogPSB2ZWMzLmRvdChyLCB1eikgLyBjcjtcbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICAgIGNvbnN0IHRvV29ybGQgPSAocFMsIG91dCA9IG5ldyB2ZWMzKCkpID0+IHtcbiAgICAgICAgcmV0dXJuIHZlYzMuYWRkKGMsIHZlYzMuYWRkKHZlYzMuYWRkKHZlYzMuc2NhbGUodXgsIGEgKiBwUy54LCBuZXcgdmVjMygpKSwgdmVjMy5zY2FsZSh1eSwgYiAqIHBTLnksIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKSwgdmVjMy5zY2FsZSh1eiwgY3IgKiBwUy56LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSksIG91dCk7XG4gICAgfTtcbiAgICBjb25zdCB2MVMgPSB0b1NjYWxlZChwb2x5Z29uLnZlcnRpY2VzWzBdKTtcbiAgICBjb25zdCB2MlMgPSB0b1NjYWxlZChwb2x5Z29uLnZlcnRpY2VzWzFdKTtcbiAgICBjb25zdCB2M1MgPSB0b1NjYWxlZChwb2x5Z29uLnZlcnRpY2VzWzJdKTtcbiAgICBjb25zdCBjbG9zZXN0UyA9IGNsb3Nlc3RQb2ludE9uVHJpYW5nbGUodmVjMy56ZXJvLCB2MVMsIHYyUywgdjNTKTtcbiAgICBjb25zdCBkaXN0ID0gY2xvc2VzdFMubGVuZ3RoO1xuICAgIGlmIChkaXN0IDw9IDEpIHtcbiAgICAgICAgY29uc3QgY29udGFjdCA9IHRvV29ybGQoY2xvc2VzdFMpO1xuICAgICAgICBjb25zdCBwZW5ldHJhdGlvbiA9IDEgLSBkaXN0O1xuICAgICAgICAvLyBVc2UgcG9seWdvbiBub3JtYWwgaW4gd29ybGQgZm9yIHN0YWJsZSBncm91bmQgY29udGFjdHNcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gcG9seWdvbi5ub3JtYWwuY29weSgpO1xuICAgICAgICByZXR1cm4gW3sgY29udGFjdCwgbm9ybWFsLCBkaXN0YW5jZTogcGVuZXRyYXRpb24gfV07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuY29uc3QgeyBtaW4sIG1heCwgc3FydCB9ID0gTWF0aDtcbmNvbnN0IGZpbmRDbG9zZXN0UG9pbnRPbkVkZ2UgPSAocG9pbnQsIHYxLCB2MikgPT4ge1xuICAgIGNvbnN0IGUxID0gdmVjMy5zdWJ0cmFjdCh2MiwgdjEpO1xuICAgIGNvbnN0IGwyID0gdmVjMy5kb3QoZTEsIGUxKTtcbiAgICBpZiAobDIgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHYxLmNvcHkoKTtcbiAgICB9XG4gICAgY29uc3QgdCA9IG1heCgwLCBtaW4oMSwgdmVjMy5kb3QodmVjMy5zdWJ0cmFjdChwb2ludCwgdjEpLCBlMSkgLyBsMikpO1xuICAgIHJldHVybiB2ZWMzLmFkZCh2MSwgdmVjMy5zY2FsZShlMSwgdCkpO1xufTtcbmNvbnN0IGZpbmRDbG9zZXN0UG9pbnRPblBvbHlnb24gPSAocG9pbnQsIHBvbHlnb24pID0+IHtcbiAgICBjb25zdCBbdjEsIHYyLCB2M10gPSBwb2x5Z29uLnZlcnRpY2VzO1xuICAgIGNvbnN0IGUxID0gdmVjMy5zdWJ0cmFjdCh2MiwgdjEpO1xuICAgIGNvbnN0IGUyID0gdmVjMy5zdWJ0cmFjdCh2MywgdjEpO1xuICAgIGNvbnN0IHAgPSB2ZWMzLnN1YnRyYWN0KHBvaW50LCB2MSk7XG4gICAgY29uc3QgZTFwID0gdmVjMy5kb3QoZTEsIHApO1xuICAgIGNvbnN0IGUycCA9IHZlYzMuZG90KGUyLCBwKTtcbiAgICBjb25zdCBlMWUxID0gdmVjMy5kb3QoZTEsIGUxKTtcbiAgICBjb25zdCBlMWUyID0gdmVjMy5kb3QoZTEsIGUyKTtcbiAgICBjb25zdCBlMmUyID0gdmVjMy5kb3QoZTIsIGUyKTtcbiAgICBjb25zdCBkID0gZTFlMSAqIGUyZTIgLSBlMWUyICogZTFlMjtcbiAgICBjb25zdCB1ID0gKGUyZTIgKiBlMXAgLSBlMWUyICogZTJwKSAvIGQ7XG4gICAgY29uc3QgdiA9IChlMWUxICogZTJwIC0gZTFlMiAqIGUxcCkgLyBkO1xuICAgIGlmICh1ID49IDAgJiYgdiA+PSAwICYmIHUgKyB2IDw9IDEpIHtcbiAgICAgICAgcmV0dXJuIHZlYzMuYWRkKHYxLCB2ZWMzLnNjYWxlKHZlYzMuYWRkKHZlYzMuc2NhbGUoZTEsIHUpLCB2ZWMzLnNjYWxlKGUyLCB2KSksIDEpKTtcbiAgICB9XG4gICAgY29uc3QgcDEgPSBmaW5kQ2xvc2VzdFBvaW50T25FZGdlKHBvaW50LCB2MSwgdjIpO1xuICAgIGNvbnN0IHAyID0gZmluZENsb3Nlc3RQb2ludE9uRWRnZShwb2ludCwgdjIsIHYzKTtcbiAgICBjb25zdCBwMyA9IGZpbmRDbG9zZXN0UG9pbnRPbkVkZ2UocG9pbnQsIHYzLCB2MSk7XG4gICAgY29uc3QgZDEgPSB2ZWMzLmRvdCh2ZWMzLnN1YnRyYWN0KHBvaW50LCBwMSksIHZlYzMuc3VidHJhY3QocG9pbnQsIHAxKSk7XG4gICAgY29uc3QgZDIgPSB2ZWMzLmRvdCh2ZWMzLnN1YnRyYWN0KHBvaW50LCBwMiksIHZlYzMuc3VidHJhY3QocG9pbnQsIHAyKSk7XG4gICAgY29uc3QgZDMgPSB2ZWMzLmRvdCh2ZWMzLnN1YnRyYWN0KHBvaW50LCBwMyksIHZlYzMuc3VidHJhY3QocG9pbnQsIHAzKSk7XG4gICAgaWYgKGQxIDwgZDIgJiYgZDEgPCBkMykge1xuICAgICAgICByZXR1cm4gcDE7XG4gICAgfVxuICAgIGlmIChkMiA8IGQzKSB7XG4gICAgICAgIHJldHVybiBwMjtcbiAgICB9XG4gICAgcmV0dXJuIHAzO1xufTtcbmV4cG9ydCBjb25zdCBjb2xsaWRlUG9seWdvbldpdGhTcGhlcmUgPSAocG9seWdvbiwgc3BoZXJlKSA9PiB7XG4gICAgY29uc3QgY29udGFjdCA9IGZpbmRDbG9zZXN0UG9pbnRPblBvbHlnb24oc3BoZXJlLmNlbnRlciwgcG9seWdvbik7XG4gICAgY29uc3QgZGlyZWN0aW9uID0gdmVjMy5zdWJ0cmFjdChjb250YWN0LCBzcGhlcmUuY2VudGVyKTtcbiAgICBjb25zdCBkaXN0YW5jZVNxdWFyZWQgPSB2ZWMzLmRvdChkaXJlY3Rpb24sIGRpcmVjdGlvbik7XG4gICAgaWYgKGRpc3RhbmNlU3F1YXJlZCA8PSBzcGhlcmUucmFkaXVzICogc3BoZXJlLnJhZGl1cykge1xuICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHNxcnQoZGlzdGFuY2VTcXVhcmVkKTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb250YWN0LFxuICAgICAgICAgICAgICAgIG5vcm1hbDogcG9seWdvbi5ub3JtYWwuY29weSgpLFxuICAgICAgICAgICAgICAgIGRpc3RhbmNlOiBzcGhlcmUucmFkaXVzIC0gZGlzdGFuY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5jb25zdCBFUFNJTE9OID0gMWUtNjtcbmV4cG9ydCBjb25zdCBjb2xsaWRlUmF5V2l0aEN1Ym9pZCA9IChyYXksIGN1Ym9pZCkgPT4ge1xuICAgIGNvbnN0IGF4ZXMgPSBjdWJvaWQuYXhlcztcbiAgICBjb25zdCBleHRlbnRzID0gW2N1Ym9pZC5leHRlbnRzLngsIGN1Ym9pZC5leHRlbnRzLnksIGN1Ym9pZC5leHRlbnRzLnpdO1xuICAgIGNvbnN0IHJlbGF0aXZlT3JpZ2luID0gdmVjMy5zdWJ0cmFjdChyYXkub3JpZ2luLCBjdWJvaWQuY2VudGVyKTtcbiAgICBsZXQgdE1pbiA9IC1JbmZpbml0eTtcbiAgICBsZXQgdE1heCA9IEluZmluaXR5O1xuICAgIGxldCBlbnRyeUF4aXMgPSAtMTtcbiAgICBsZXQgZXhpdEF4aXMgPSAtMTtcbiAgICBsZXQgZW50cnlTaWduID0gMTtcbiAgICBsZXQgZXhpdFNpZ24gPSAxO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGF4aXMgPSBheGVzW2ldO1xuICAgICAgICBjb25zdCBleHRlbnQgPSBleHRlbnRzW2ldO1xuICAgICAgICBjb25zdCBvcmlnaW5Qcm9qZWN0aW9uID0gdmVjMy5kb3QocmVsYXRpdmVPcmlnaW4sIGF4aXMpO1xuICAgICAgICBjb25zdCBkaXJlY3Rpb25Qcm9qZWN0aW9uID0gdmVjMy5kb3QocmF5LmRpcmVjdGlvbiwgYXhpcyk7XG4gICAgICAgIGlmIChNYXRoLmFicyhkaXJlY3Rpb25Qcm9qZWN0aW9uKSA8IEVQU0lMT04pIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5Qcm9qZWN0aW9uIDwgLWV4dGVudCB8fCBvcmlnaW5Qcm9qZWN0aW9uID4gZXh0ZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpbnZlcnNlRGlyZWN0aW9uID0gMSAvIGRpcmVjdGlvblByb2plY3Rpb247XG4gICAgICAgIGxldCB0MSA9ICgtZXh0ZW50IC0gb3JpZ2luUHJvamVjdGlvbikgKiBpbnZlcnNlRGlyZWN0aW9uO1xuICAgICAgICBsZXQgdDIgPSAoZXh0ZW50IC0gb3JpZ2luUHJvamVjdGlvbikgKiBpbnZlcnNlRGlyZWN0aW9uO1xuICAgICAgICBsZXQgZmFjZUVudHJ5U2lnbiA9IC0xO1xuICAgICAgICBsZXQgZmFjZUV4aXRTaWduID0gMTtcbiAgICAgICAgaWYgKHQxID4gdDIpIHtcbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIFt0MSwgdDJdID0gW3QyLCB0MV07XG4gICAgICAgICAgICBbZmFjZUVudHJ5U2lnbiwgZmFjZUV4aXRTaWduXSA9IFtmYWNlRXhpdFNpZ24sIGZhY2VFbnRyeVNpZ25dO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0MSA+IHRNaW4pIHtcbiAgICAgICAgICAgIHRNaW4gPSB0MTtcbiAgICAgICAgICAgIGVudHJ5QXhpcyA9IGk7XG4gICAgICAgICAgICBlbnRyeVNpZ24gPSBmYWNlRW50cnlTaWduO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0MiA8IHRNYXgpIHtcbiAgICAgICAgICAgIHRNYXggPSB0MjtcbiAgICAgICAgICAgIGV4aXRBeGlzID0gaTtcbiAgICAgICAgICAgIGV4aXRTaWduID0gZmFjZUV4aXRTaWduO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0TWluID4gdE1heCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRNYXggPCAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBkaXN0YW5jZSA9IHRNaW4gPj0gMCA/IHRNaW4gOiB0TWF4O1xuICAgIGlmIChkaXN0YW5jZSA8IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGF4aXNJbmRleCA9IHRNaW4gPj0gMCA/IGVudHJ5QXhpcyA6IGV4aXRBeGlzO1xuICAgIGNvbnN0IHNpZ24gPSB0TWluID49IDAgPyBlbnRyeVNpZ24gOiBleGl0U2lnbjtcbiAgICBpZiAoYXhpc0luZGV4IDwgMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY29udGFjdE9mZnNldCA9IHZlYzMuc2NhbGUocmF5LmRpcmVjdGlvbiwgZGlzdGFuY2UsIG5ldyB2ZWMzKCkpO1xuICAgIGNvbnN0IGNvbnRhY3QgPSB2ZWMzLmFkZChyYXkub3JpZ2luLCBjb250YWN0T2Zmc2V0LCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCBub3JtYWwgPSBheGVzW2F4aXNJbmRleF0uY29weSgpLnNjYWxlKC1zaWduKTtcbiAgICByZXR1cm4geyBjb250YWN0LCBub3JtYWwsIGRpc3RhbmNlIH07XG59O1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG4vLyBFeGFjdCByYXktZWxsaXBzb2lkIHZpYSB0cmFuc2Zvcm0gdG8gdW5pdCBzcGhlcmVcbmV4cG9ydCBjb25zdCBjb2xsaWRlUmF5V2l0aEVsbGlwc29pZCA9IChyYXksIGVsbGlwc29pZCkgPT4ge1xuICAgIGNvbnN0IHsgb3JpZ2luOiBvLCBkaXJlY3Rpb246IGQgfSA9IHJheTtcbiAgICBjb25zdCB7IGNlbnRlcjogYyB9ID0gZWxsaXBzb2lkO1xuICAgIGNvbnN0IHsgeDogYSwgeTogYiwgejogemMgfSA9IGVsbGlwc29pZC5yYWRpaTtcbiAgICAvLyBCdWlsZCBvcnRob25vcm1hbCBiYXNpcyAoYXhlcykgVSBmcm9tIGVsbGlwc29pZFxuICAgIGNvbnN0IHV4ID0gZWxsaXBzb2lkLmF4ZXNbMF07XG4gICAgY29uc3QgdXkgPSBlbGxpcHNvaWQuYXhlc1sxXTtcbiAgICBjb25zdCB1eiA9IGVsbGlwc29pZC5heGVzWzJdO1xuICAgIC8vIFdvcmxkIC0+IHNjYWxlZCAodW5pdCBzcGhlcmUpIHRyYW5zZm9ybTogcCcgPSBNIChwIC0gYylcbiAgICBjb25zdCB0b1NjYWxlZCA9IChwLCBkZXN0ID0gbmV3IHZlYzMoKSkgPT4ge1xuICAgICAgICBjb25zdCByID0gdmVjMy5zdWJ0cmFjdChwLCBjLCBuZXcgdmVjMygpKTtcbiAgICAgICAgY29uc3QgcHggPSB2ZWMzLmRvdChyLCB1eCkgLyBhO1xuICAgICAgICBjb25zdCBweSA9IHZlYzMuZG90KHIsIHV5KSAvIGI7XG4gICAgICAgIGNvbnN0IHB6ID0gdmVjMy5kb3QociwgdXopIC8gemM7XG4gICAgICAgIGRlc3QueCA9IHB4O1xuICAgICAgICBkZXN0LnkgPSBweTtcbiAgICAgICAgZGVzdC56ID0gcHo7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH07XG4gICAgY29uc3Qgb1MgPSB0b1NjYWxlZChvKTtcbiAgICAvLyBEaXJlY3Rpb24gdHJhbnNmb3JtcyBsaW5lYXJseSAobm8gdHJhbnNsYXRpb24pXG4gICAgY29uc3QgZHggPSB2ZWMzLmRvdChkLCB1eCkgLyBhO1xuICAgIGNvbnN0IGR5ID0gdmVjMy5kb3QoZCwgdXkpIC8gYjtcbiAgICBjb25zdCBkeiA9IHZlYzMuZG90KGQsIHV6KSAvIHpjO1xuICAgIGNvbnN0IGRTID0gbmV3IHZlYzMoW2R4LCBkeSwgZHpdKTtcbiAgICBjb25zdCBBID0gdmVjMy5kb3QoZFMsIGRTKTtcbiAgICBjb25zdCBCID0gMiAqIHZlYzMuZG90KG9TLCBkUyk7XG4gICAgY29uc3QgQyA9IHZlYzMuZG90KG9TLCBvUykgLSAxO1xuICAgIGNvbnN0IGRpc2MgPSBCICogQiAtIDQgKiBBICogQztcbiAgICBpZiAoZGlzYyA8IDApXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIGNvbnN0IHNxcnREaXNjID0gTWF0aC5zcXJ0KGRpc2MpO1xuICAgIGNvbnN0IGludjJBID0gMSAvICgyICogQSk7XG4gICAgbGV0IHQwID0gKC1CIC0gc3FydERpc2MpICogaW52MkE7XG4gICAgbGV0IHQxID0gKC1CICsgc3FydERpc2MpICogaW52MkE7XG4gICAgaWYgKHQwID4gdDEpIHtcbiAgICAgICAgY29uc3QgdG1wID0gdDA7XG4gICAgICAgIHQwID0gdDE7XG4gICAgICAgIHQxID0gdG1wO1xuICAgIH1cbiAgICBpZiAodDEgPCAwKVxuICAgICAgICByZXR1cm4gbnVsbDsgLy8gYm90aCBiZWhpbmRcbiAgICBjb25zdCB0ID0gdDAgPj0gMCA/IHQwIDogdDE7XG4gICAgY29uc3QgaGl0UyA9IHZlYzMuYWRkKG9TLCB2ZWMzLnNjYWxlKGRTLCB0LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgLy8gTWFwIHRvIHdvcmxkOiBwID0gYyArIFUgZGlhZyhhLGIsYykgaGl0U1xuICAgIGNvbnN0IGhpdCA9IHZlYzMuYWRkKGMsIHZlYzMuYWRkKHZlYzMuYWRkKHZlYzMuc2NhbGUodXgsIGEgKiBoaXRTLngsIG5ldyB2ZWMzKCkpLCB2ZWMzLnNjYWxlKHV5LCBiICogaGl0Uy55LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSksIHZlYzMuc2NhbGUodXosIHpjICogaGl0Uy56LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgIC8vIE5vcm1hbCBtYXBwaW5nOiBuX3dvcmxkIOKInSBNXlQgbicgd2l0aCBuJyA9IGhpdFMgb24gdW5pdCBzcGhlcmU7IE0gaXMgc3ltbWV0cmljXG4gICAgbGV0IG4gPSB2ZWMzLmFkZCh2ZWMzLmFkZCh2ZWMzLnNjYWxlKHV4LCBoaXRTLnggLyBhLCBuZXcgdmVjMygpKSwgdmVjMy5zY2FsZSh1eSwgaGl0Uy55IC8gYiwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpLCB2ZWMzLnNjYWxlKHV6LCBoaXRTLnogLyB6YywgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpO1xuICAgIGlmIChuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbi5ub3JtYWxpemUoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG4gPSBkLmNvcHkoKS5ub3JtYWxpemUoKTsgLy8gZmFsbGJhY2tcbiAgICB9XG4gICAgLy8gQWxpZ24gd2l0aCBleGlzdGluZyByYXkgQVBJIChsaWtlIHJheS1zcGhlcmUpOiBwb2ludCBub3JtYWwgdG93YXJkIGNlbnRlclxuICAgIG4uc2NhbGUoLTEpO1xuICAgIC8vIERpc3RhbmNlIGFsb25nIG9yaWdpbmFsIHJheVxuICAgIGNvbnN0IGRpc3RhbmNlID0gdmVjMy5zdWJ0cmFjdChoaXQsIG8sIG5ldyB2ZWMzKCkpLmxlbmd0aDtcbiAgICByZXR1cm4gW3sgY29udGFjdDogaGl0LCBub3JtYWw6IG4sIGRpc3RhbmNlIH1dO1xufTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuZXhwb3J0IGNvbnN0IGNvbGxpZGVSYXlXaXRoUGxhbmUgPSAocmF5LCBwbGFuZSkgPT4ge1xuICAgIGNvbnN0IHsgbm9ybWFsOiBuLCBkaXN0YW5jZTogZCB9ID0gcGxhbmU7XG4gICAgY29uc3QgeyBvcmlnaW46IG8sIGRpcmVjdGlvbjogZSB9ID0gcmF5O1xuICAgIGNvbnN0IHMgPSB2ZWMzLmRvdChlLCBuKTtcbiAgICBpZiAocyA9PT0gMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdCA9IChkIC0gdmVjMy5kb3QobywgbikpIC8gcztcbiAgICBpZiAodCA8IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRhY3RPZmZzZXQgPSB2ZWMzLnNjYWxlKGUsIHQsIG5ldyB2ZWMzKCkpO1xuICAgIGNvbnN0IGNvbnRhY3QgPSB2ZWMzLmFkZChvLCBjb250YWN0T2Zmc2V0LCBuZXcgdmVjMygpKTtcbiAgICByZXR1cm4geyBjb250YWN0LCBub3JtYWw6IG4uY29weSgpLCBkaXN0YW5jZTogdCB9O1xufTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuZXhwb3J0IGNvbnN0IGNvbGxpZGVSYXlXaXRoUmF5ID0gKHJheTEsIHJheTIpID0+IHtcbiAgICBjb25zdCB7IGRpcmVjdGlvbjogZDEsIG9yaWdpbjogbzEgfSA9IHJheTE7XG4gICAgY29uc3QgeyBkaXJlY3Rpb246IGQyLCBvcmlnaW46IG8yIH0gPSByYXkyO1xuICAgIGNvbnN0IGMgPSB2ZWMzLmNyb3NzKGQxLCBkMik7XG4gICAgY29uc3QgZGV0ZXJtaW5hbnQgPSB2ZWMzLmRvdChjLCBjKTtcbiAgICBpZiAoZGV0ZXJtaW5hbnQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGYgPSB2ZWMzLnN1YnRyYWN0KG8yLCBvMSk7XG4gICAgY29uc3QgdSA9IHZlYzMuY3Jvc3MoYywgZikuc2NhbGUoMSAvIGRldGVybWluYW50KTtcbiAgICBjb25zdCB0ID0gdmVjMy5kb3QodmVjMy5jcm9zcyhmLCBkMiksIGMpIC8gZGV0ZXJtaW5hbnQ7XG4gICAgaWYgKHQgPCAwIHx8IHQgPiAxKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBjb250YWN0MSA9IHZlYzMuYWRkKG8xLCB2ZWMzLnNjYWxlKGQxLCB0LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgY29uc3QgY29udGFjdDIgPSB2ZWMzLmFkZChvMiwgdmVjMy5zY2FsZShkMiwgdS56LCBuZXcgdmVjMygpKSwgbmV3IHZlYzMoKSk7XG4gICAgY29uc3Qgbm9ybWFsID0gdmVjMy5zdWJ0cmFjdChjb250YWN0MSwgY29udGFjdDIpLm5vcm1hbGl6ZSgpO1xuICAgIGNvbnN0IGRpc3RhbmNlID0gdmVjMy5kb3QodmVjMy5zdWJ0cmFjdChjb250YWN0MSwgbzEpLCBkMSk7XG4gICAgcmV0dXJuIHsgY29udGFjdDogY29udGFjdDEsIG5vcm1hbCwgZGlzdGFuY2UgfTtcbn07XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmNvbnN0IHsgc3FydCB9ID0gTWF0aDtcbmV4cG9ydCBjb25zdCBjb2xsaWRlUmF5V2l0aFNwaGVyZSA9IChyYXksIHNwaGVyZSkgPT4ge1xuICAgIGNvbnN0IHsgb3JpZ2luOiBvLCBkaXJlY3Rpb246IGUgfSA9IHJheTtcbiAgICBjb25zdCB7IGNlbnRlcjogYywgcmFkaXVzOiByIH0gPSBzcGhlcmU7XG4gICAgY29uc3QgcjIgPSByICogcjtcbiAgICBjb25zdCBzID0gdmVjMy5zdWJ0cmFjdChjLCBvKTtcbiAgICBjb25zdCB0ID0gdmVjMy5kb3QoZSwgcyk7XG4gICAgY29uc3QgZDIgPSBzLnNxdWFyZWRMZW5ndGggLSB0ICogdDtcbiAgICBpZiAoZDIgPiByMikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdGhjID0gc3FydChyMiAtIGQyKTtcbiAgICBjb25zdCB0MCA9IHQgLSB0aGM7XG4gICAgY29uc3QgdDEgPSB0ICsgdGhjO1xuICAgIGlmICh0MCA8IDAgJiYgdDEgPCAwKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBkaXN0YW5jZSA9IHQwID49IDAgPyB0MCA6IHQxO1xuICAgIGNvbnN0IGNvbnRhY3RPZmZzZXQgPSB2ZWMzLnNjYWxlKGUsIGRpc3RhbmNlLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCBjb250YWN0ID0gdmVjMy5hZGQobywgY29udGFjdE9mZnNldCwgbmV3IHZlYzMoKSk7XG4gICAgbGV0IG5vcm1hbCA9IHZlYzMuc3VidHJhY3QoYywgY29udGFjdCwgbmV3IHZlYzMoKSk7XG4gICAgaWYgKG5vcm1hbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbm9ybWFsID0gdmVjMy5ub3JtYWxpemUoZSwgbmV3IHZlYzMoKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBub3JtYWwubm9ybWFsaXplKCk7XG4gICAgfVxuICAgIHJldHVybiB7IGNvbnRhY3QsIG5vcm1hbCwgZGlzdGFuY2UgfTtcbn07XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmNvbnN0IEVQU0lMT04gPSAxZS02O1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxpZGVTcGhlcmVXaXRoQ3Vib2lkKHNwaGVyZSwgY3Vib2lkKSB7XG4gICAgY29uc3QgZXh0ZW50cyA9IFtjdWJvaWQuZXh0ZW50cy54LCBjdWJvaWQuZXh0ZW50cy55LCBjdWJvaWQuZXh0ZW50cy56XTtcbiAgICBjb25zdCBheGVzID0gY3Vib2lkLmF4ZXM7XG4gICAgY29uc3QgcmVsYXRpdmUgPSB2ZWMzLnN1YnRyYWN0KHNwaGVyZS5jZW50ZXIsIGN1Ym9pZC5jZW50ZXIpO1xuICAgIGNvbnN0IGxvY2FsID0gW107XG4gICAgY29uc3QgY2xvc2VzdFBvaW50ID0gY3Vib2lkLmNlbnRlci5jb3B5KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgY29uc3QgYXhpcyA9IGF4ZXNbaV07XG4gICAgICAgIGNvbnN0IHByb2plY3Rpb24gPSB2ZWMzLmRvdChyZWxhdGl2ZSwgYXhpcyk7XG4gICAgICAgIGxvY2FsW2ldID0gcHJvamVjdGlvbjtcbiAgICAgICAgY29uc3QgZXh0ZW50ID0gZXh0ZW50c1tpXTtcbiAgICAgICAgY29uc3QgY2xhbXBlZFByb2plY3Rpb24gPSBNYXRoLm1heCgtZXh0ZW50LCBNYXRoLm1pbihwcm9qZWN0aW9uLCBleHRlbnQpKTtcbiAgICAgICAgY29uc3QgY29udHJpYnV0aW9uID0gdmVjMy5zY2FsZShheGlzLCBjbGFtcGVkUHJvamVjdGlvbiwgbmV3IHZlYzMoKSk7XG4gICAgICAgIHZlYzMuYWRkKGNsb3Nlc3RQb2ludCwgY29udHJpYnV0aW9uLCBjbG9zZXN0UG9pbnQpO1xuICAgIH1cbiAgICBjb25zdCBvZmZzZXQgPSB2ZWMzLnN1YnRyYWN0KHNwaGVyZS5jZW50ZXIsIGNsb3Nlc3RQb2ludCk7XG4gICAgY29uc3QgZGlzdGFuY2VTcXVhcmVkID0gb2Zmc2V0LnNxdWFyZWRMZW5ndGg7XG4gICAgY29uc3QgcmFkaXVzID0gc3BoZXJlLnJhZGl1cztcbiAgICBpZiAoZGlzdGFuY2VTcXVhcmVkID4gcmFkaXVzICogcmFkaXVzKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoZGlzdGFuY2VTcXVhcmVkID4gRVBTSUxPTiAqIEVQU0lMT04pIHtcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZGlzdGFuY2VTcXVhcmVkKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gb2Zmc2V0LnNjYWxlKDEgLyBkaXN0YW5jZSk7XG4gICAgICAgIGNvbnN0IHBlbmV0cmF0aW9uRGVwdGggPSByYWRpdXMgLSBkaXN0YW5jZTtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb250YWN0OiBjbG9zZXN0UG9pbnQuY29weSgpLFxuICAgICAgICAgICAgICAgIG5vcm1hbDogbm9ybWFsLmNvcHkoKSxcbiAgICAgICAgICAgICAgICBkaXN0YW5jZTogcGVuZXRyYXRpb25EZXB0aFxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cbiAgICBsZXQgYmVzdEF4aXMgPSAwO1xuICAgIGxldCBiZXN0RGlzdGFuY2UgPSBJbmZpbml0eTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBjb25zdCBleHRlbnQgPSBleHRlbnRzW2ldO1xuICAgICAgICBjb25zdCBwcm9qZWN0aW9uID0gbG9jYWxbaV07XG4gICAgICAgIGNvbnN0IGRpc3RhbmNlVG9GYWNlID0gTWF0aC5tYXgoMCwgZXh0ZW50IC0gTWF0aC5hYnMocHJvamVjdGlvbikpO1xuICAgICAgICBpZiAoZGlzdGFuY2VUb0ZhY2UgPCBiZXN0RGlzdGFuY2UpIHtcbiAgICAgICAgICAgIGJlc3REaXN0YW5jZSA9IGRpc3RhbmNlVG9GYWNlO1xuICAgICAgICAgICAgYmVzdEF4aXMgPSBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGF4aXMgPSBheGVzW2Jlc3RBeGlzXTtcbiAgICBjb25zdCBleHRlbnQgPSBleHRlbnRzW2Jlc3RBeGlzXTtcbiAgICBjb25zdCBwcm9qZWN0aW9uID0gbG9jYWxbYmVzdEF4aXNdO1xuICAgIGNvbnN0IHNpZ24gPSBwcm9qZWN0aW9uID49IDAgPyAxIDogLTE7XG4gICAgY29uc3QgZGlzdGFuY2VUb0ZhY2UgPSBleHRlbnQgLSBNYXRoLmFicyhwcm9qZWN0aW9uKTtcbiAgICBjb25zdCBzdXJmYWNlT2Zmc2V0ID0gc2lnbiAqIGRpc3RhbmNlVG9GYWNlO1xuICAgIGNvbnN0IGNvbnRhY3QgPSB2ZWMzLmFkZChzcGhlcmUuY2VudGVyLCB2ZWMzLnNjYWxlKGF4aXMsIHN1cmZhY2VPZmZzZXQsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICBsZXQgcGVuZXRyYXRpb25EZXB0aCA9IHJhZGl1cyAtIGRpc3RhbmNlVG9GYWNlO1xuICAgIGlmIChwZW5ldHJhdGlvbkRlcHRoIDwgLUVQU0lMT04pIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwZW5ldHJhdGlvbkRlcHRoIDwgMCkge1xuICAgICAgICBwZW5ldHJhdGlvbkRlcHRoID0gMDtcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsID0gYXhpcy5jb3B5KCkuc2NhbGUoc2lnbik7XG4gICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgICAgY29udGFjdCxcbiAgICAgICAgICAgIG5vcm1hbDogbm9ybWFsLmNvcHkoKSxcbiAgICAgICAgICAgIGRpc3RhbmNlOiBwZW5ldHJhdGlvbkRlcHRoXG4gICAgICAgIH1cbiAgICBdO1xufVxuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ0BsdXovdmVjdG9ycyc7XG5jb25zdCBFUFMgPSAxZS02O1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxpZGVTcGhlcmVXaXRoRWxsaXBzb2lkKHNwaGVyZSwgZWxsaXBzb2lkKSB7XG4gICAgY29uc3QgY0UgPSBlbGxpcHNvaWQuY2VudGVyO1xuICAgIGNvbnN0IGNTID0gc3BoZXJlLmNlbnRlcjtcbiAgICAvLyBWZWN0b3IgZnJvbSBlbGxpcHNvaWQgY2VudGVyIHRvIHNwaGVyZSBjZW50ZXJcbiAgICBjb25zdCBkID0gdmVjMy5zdWJ0cmFjdChjUywgY0UsIG5ldyB2ZWMzKCkpO1xuICAgIGNvbnN0IGEgPSBlbGxpcHNvaWQucmFkaWkueDtcbiAgICBjb25zdCBiID0gZWxsaXBzb2lkLnJhZGlpLnk7XG4gICAgY29uc3QgYyA9IGVsbGlwc29pZC5yYWRpaS56O1xuICAgIC8vIEluZmxhdGUgZWxsaXBzb2lkIGJ5IHNwaGVyZSByYWRpdXMgKE1pbmtvd3NraSBzdW0pXG4gICAgY29uc3QgQSA9IGEgKyBzcGhlcmUucmFkaXVzO1xuICAgIGNvbnN0IEIgPSBiICsgc3BoZXJlLnJhZGl1cztcbiAgICBjb25zdCBDID0gYyArIHNwaGVyZS5yYWRpdXM7XG4gICAgLy8gRXhwcmVzcyBkIGluIGVsbGlwc29pZCdzIGxvY2FsIGJhc2lzIGFuZCBzY2FsZSBieSBpbmZsYXRlZCByYWRpaVxuICAgIGNvbnN0IHUwID0gdmVjMy5kb3QoZCwgZWxsaXBzb2lkLmF4ZXNbMF0pIC8gQTtcbiAgICBjb25zdCB1MSA9IHZlYzMuZG90KGQsIGVsbGlwc29pZC5heGVzWzFdKSAvIEI7XG4gICAgY29uc3QgdTIgPSB2ZWMzLmRvdChkLCBlbGxpcHNvaWQuYXhlc1syXSkgLyBDO1xuICAgIGNvbnN0IHVMZW4yID0gdTAgKiB1MCArIHUxICogdTEgKyB1MiAqIHUyO1xuICAgIGlmICh1TGVuMiA+IDEgKyBFUFMpIHtcbiAgICAgICAgLy8gT3V0c2lkZSBpbmZsYXRlZCBlbGxpcHNvaWQ6IG5vIGNvbGxpc2lvblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gSGFuZGxlIGRlZ2VuZXJhdGUgY2VudGVyIG92ZXJsYXBcbiAgICBsZXQgdUxlbiA9IE1hdGguc3FydChNYXRoLm1heCh1TGVuMiwgMCkpO1xuICAgIGxldCBoeCA9IDEsIGh5ID0gMCwgaHogPSAwO1xuICAgIGlmICh1TGVuID4gRVBTKSB7XG4gICAgICAgIGh4ID0gdTAgLyB1TGVuO1xuICAgICAgICBoeSA9IHUxIC8gdUxlbjtcbiAgICAgICAgaHogPSB1MiAvIHVMZW47XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvLyBDaG9vc2UgYSBzdGFibGUgZGlyZWN0aW9uIChtYWpvciBheGlzKVxuICAgICAgICAvLyBQcmVmZXIgdGhlIGxhcmdlc3QgcmFkaXVzIGF4aXMgdG8gcmVkdWNlIGluc3RhYmlsaXR5XG4gICAgICAgIGlmIChhID49IGIgJiYgYSA+PSBjKSB7XG4gICAgICAgICAgICBoeCA9IDE7XG4gICAgICAgICAgICBoeSA9IDA7XG4gICAgICAgICAgICBoeiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYiA+PSBhICYmIGIgPj0gYykge1xuICAgICAgICAgICAgaHggPSAwO1xuICAgICAgICAgICAgaHkgPSAxO1xuICAgICAgICAgICAgaHogPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaHggPSAwO1xuICAgICAgICAgICAgaHkgPSAwO1xuICAgICAgICAgICAgaHogPSAxO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFBvaW50IG9uIG9yaWdpbmFsIGVsbGlwc29pZCBzdXJmYWNlIGluIGxvY2FsIGNvb3JkcyBhbG9uZyBkaXJlY3Rpb24gaFxuICAgIGNvbnN0IHFMb2NYID0gYSAqIGh4O1xuICAgIGNvbnN0IHFMb2NZID0gYiAqIGh5O1xuICAgIGNvbnN0IHFMb2NaID0gYyAqIGh6O1xuICAgIC8vIFdvcmxkLXNwYWNlIGNvbnRhY3QgcG9pbnQgb24gZWxsaXBzb2lkIHN1cmZhY2VcbiAgICBjb25zdCBxV29ybGQgPSB2ZWMzLmFkZChjRSwgdmVjMy5hZGQodmVjMy5hZGQodmVjMy5zY2FsZShlbGxpcHNvaWQuYXhlc1swXSwgcUxvY1gsIG5ldyB2ZWMzKCkpLCB2ZWMzLnNjYWxlKGVsbGlwc29pZC5heGVzWzFdLCBxTG9jWSwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpLCB2ZWMzLnNjYWxlKGVsbGlwc29pZC5heGVzWzJdLCBxTG9jWiwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICAvLyBDb21wdXRlIG5vcm1hbCB2aWEgZ3JhZGllbnQgb2YgaW1wbGljaXQgZWxsaXBzb2lkXG4gICAgY29uc3QgbkxvY2FsID0gbmV3IHZlYzMoW3FMb2NYIC8gKGEgKiBhKSwgcUxvY1kgLyAoYiAqIGIpLCBxTG9jWiAvIChjICogYyldKTtcbiAgICBsZXQgbm9ybWFsID0gdmVjMy5hZGQodmVjMy5hZGQodmVjMy5zY2FsZShlbGxpcHNvaWQuYXhlc1swXSwgbkxvY2FsLngsIG5ldyB2ZWMzKCkpLCB2ZWMzLnNjYWxlKGVsbGlwc29pZC5heGVzWzFdLCBuTG9jYWwueSwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpLCB2ZWMzLnNjYWxlKGVsbGlwc29pZC5heGVzWzJdLCBuTG9jYWwueiwgbmV3IHZlYzMoKSksIG5ldyB2ZWMzKCkpLm5vcm1hbGl6ZSgpO1xuICAgIC8vIFBlbmV0cmF0aW9uIGRlcHRoOiBjb21wYXJlIHNwaGVyZSByYWRpdXMgdnMgZGlzdGFuY2UgdG8gZWxsaXBzb2lkIHN1cmZhY2VcbiAgICBjb25zdCBkaXN0VG9TdXJmYWNlID0gdmVjMy5zdWJ0cmFjdChjUywgcVdvcmxkLCBuZXcgdmVjMygpKS5sZW5ndGg7XG4gICAgY29uc3QgcGVuZXRyYXRpb24gPSBzcGhlcmUucmFkaXVzIC0gZGlzdFRvU3VyZmFjZTtcbiAgICBpZiAocGVuZXRyYXRpb24gPCAtRVBTKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGgubWF4KDAsIHBlbmV0cmF0aW9uKTtcbiAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBjb250YWN0OiBxV29ybGQsXG4gICAgICAgICAgICBub3JtYWwsXG4gICAgICAgICAgICBkaXN0YW5jZVxuICAgICAgICB9XG4gICAgXTtcbn1cbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuLy8gUmV0dXJucyBhIHNpbmdsZSBjb250YWN0IHdpdGggcG9zaXRpdmUgcGVuZXRyYXRpb24gZGVwdGgsIGNvbnNpc3RlbnQgd2l0aCBkaXNwYXRjaGVyIEFQSVxuZXhwb3J0IGNvbnN0IGNvbGxpZGVTcGhlcmVXaXRoU3BoZXJlID0gKHMxLCBzMikgPT4ge1xuICAgIGNvbnN0IHsgY2VudGVyOiBjMSwgcmFkaXVzOiByMSB9ID0gczE7XG4gICAgY29uc3QgeyBjZW50ZXI6IGMyLCByYWRpdXM6IHIyIH0gPSBzMjtcbiAgICBjb25zdCBkZWx0YSA9IHZlYzMuc3VidHJhY3QoYzIsIGMxLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCBkaXN0YW5jZVNxdWFyZWQgPSBkZWx0YS5zcXVhcmVkTGVuZ3RoO1xuICAgIGNvbnN0IHJhZGlpU3VtID0gcjEgKyByMjtcbiAgICBpZiAoZGlzdGFuY2VTcXVhcmVkID4gcmFkaWlTdW0gKiByYWRpaVN1bSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZGlzdGFuY2VTcXVhcmVkKTtcbiAgICBjb25zdCBub3JtYWwgPSBkaXN0YW5jZSA+IDAgPyB2ZWMzLnNjYWxlKGRlbHRhLCAxIC8gZGlzdGFuY2UsIG5ldyB2ZWMzKCkpIDogdmVjMy5yaWdodC5jb3B5KCk7XG4gICAgY29uc3QgY29udGFjdCA9IHZlYzMuYWRkKGMxLCB2ZWMzLnNjYWxlKG5vcm1hbCwgcjEsIG5ldyB2ZWMzKCkpLCBuZXcgdmVjMygpKTtcbiAgICBjb25zdCBwZW5ldHJhdGlvbiA9IE1hdGgubWF4KDAsIHJhZGlpU3VtIC0gZGlzdGFuY2UpO1xuICAgIHJldHVybiBbeyBjb250YWN0LCBub3JtYWwsIGRpc3RhbmNlOiBwZW5ldHJhdGlvbiB9XTtcbn07XG4iLCJpbXBvcnQgeyBEaXNwYXRjaGVyIH0gZnJvbSAnQGx1ei91dGlsaXRpZXMnO1xuaW1wb3J0IHsgY29sbGlkZUN1Ym9pZFdpdGhDdWJvaWQgfSBmcm9tICcuLi9jb2xsaXNpb25zL2N1Ym9pZC9jdWJvaWQnO1xuaW1wb3J0IHsgY29sbGlkZVBsYW5lV2l0aEN1Ym9pZCB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcGxhbmUvY3Vib2lkJztcbmltcG9ydCB7IGNvbGxpZGVQbGFuZVdpdGhFbGxpcHNvaWQgfSBmcm9tICcuLi9jb2xsaXNpb25zL3BsYW5lL2VsbGlwc29pZCc7XG5pbXBvcnQgeyBjb2xsaWRlUGxhbmVXaXRoU3BoZXJlIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9wbGFuZS9zcGhlcmUnO1xuaW1wb3J0IHsgY29sbGlkZVNwaGVyZVdpdGhDdWJvaWQgfSBmcm9tICcuLi9jb2xsaXNpb25zL3NwaGVyZS9jdWJvaWQnO1xuaW1wb3J0IHsgY29sbGlkZVNwaGVyZVdpdGhFbGxpcHNvaWQgfSBmcm9tICcuLi9jb2xsaXNpb25zL3NwaGVyZS9lbGxpcHNvaWQnO1xuaW1wb3J0IHsgY29sbGlkZVNwaGVyZVdpdGhTcGhlcmUgfSBmcm9tICcuLi9jb2xsaXNpb25zL3NwaGVyZS9zcGhlcmUnO1xuaW1wb3J0IHsgY29sbGlkZVBvbHlnb25XaXRoU3BoZXJlIH0gZnJvbSAnLi4vY29sbGlzaW9ucy9wb2x5Z29uL3NwaGVyZSc7XG5pbXBvcnQgeyBjb2xsaWRlUG9seWdvbldpdGhDdWJvaWQgfSBmcm9tICcuLi9jb2xsaXNpb25zL3BvbHlnb24vY3Vib2lkJztcbmltcG9ydCB7IGNvbGxpZGVQb2x5Z29uV2l0aEVsbGlwc29pZCB9IGZyb20gJy4uL2NvbGxpc2lvbnMvcG9seWdvbi9lbGxpcHNvaWQnO1xuaW1wb3J0IHsgY29sbGlkZUVsbGlwc29pZFdpdGhDdWJvaWQgfSBmcm9tICcuLi9jb2xsaXNpb25zL2VsbGlwc29pZC9jdWJvaWQnO1xuZXhwb3J0IGNsYXNzIENvbGxpc2lvbkRpc3BhdGNoZXIgZXh0ZW5kcyBEaXNwYXRjaGVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgLy8gcmF5XG4gICAgICAgIC8vdGhpcy5yZWdpc3RlcignUmF5JywgJ1JheScsIGNvbGxpZGVSYXlXaXRoUmF5KVxuICAgICAgICAvL3RoaXMucmVnaXN0ZXIoJ1JheScsICdQbGFuZScsIGNvbGxpZGVSYXlXaXRoUGxhbmUpXG4gICAgICAgIC8vdGhpcy5yZWdpc3RlcignUmF5JywgJ1NwaGVyZScsIGNvbGxpZGVSYXlXaXRoU3BoZXJlKVxuICAgICAgICAvL3RoaXMucmVnaXN0ZXIoJ1JheScsICdDdWJvaWQnLCBjb2xsaWRlUmF5V2l0aEN1Ym9pZClcbiAgICAgICAgLy8gdGhpcy5yZWdpc3RlcignUmF5JywgJ0VsbGlwc29pZCcsIGNvbGxpZGVSYXlXaXRoRWxsaXBzb2lkKVxuICAgICAgICAvLyBwbGFuZVxuICAgICAgICB0aGlzLnJlZ2lzdGVyKCdQbGFuZScsICdTcGhlcmUnLCBjb2xsaWRlUGxhbmVXaXRoU3BoZXJlKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlcignUGxhbmUnLCAnQ3Vib2lkJywgY29sbGlkZVBsYW5lV2l0aEN1Ym9pZCk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXIoJ1BsYW5lJywgJ0VsbGlwc29pZCcsIGNvbGxpZGVQbGFuZVdpdGhFbGxpcHNvaWQpO1xuICAgICAgICAvLyBwb2x5Z29uXG4gICAgICAgIHRoaXMucmVnaXN0ZXIoJ1BvbHlnb24nLCAnU3BoZXJlJywgY29sbGlkZVBvbHlnb25XaXRoU3BoZXJlKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlcignUG9seWdvbicsICdDdWJvaWQnLCBjb2xsaWRlUG9seWdvbldpdGhDdWJvaWQpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyKCdQb2x5Z29uJywgJ0VsbGlwc29pZCcsIGNvbGxpZGVQb2x5Z29uV2l0aEVsbGlwc29pZCk7XG4gICAgICAgIC8vIHNwaGVyZVxuICAgICAgICB0aGlzLnJlZ2lzdGVyKCdTcGhlcmUnLCAnU3BoZXJlJywgY29sbGlkZVNwaGVyZVdpdGhTcGhlcmUpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyKCdTcGhlcmUnLCAnQ3Vib2lkJywgY29sbGlkZVNwaGVyZVdpdGhDdWJvaWQpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyKCdTcGhlcmUnLCAnRWxsaXBzb2lkJywgY29sbGlkZVNwaGVyZVdpdGhFbGxpcHNvaWQpO1xuICAgICAgICAvLyBjdWJvaWRcbiAgICAgICAgdGhpcy5yZWdpc3RlcignQ3Vib2lkJywgJ0N1Ym9pZCcsIGNvbGxpZGVDdWJvaWRXaXRoQ3Vib2lkKTtcbiAgICAgICAgdGhpcy5yZWdpc3RlcignRWxsaXBzb2lkJywgJ0N1Ym9pZCcsIGNvbGxpZGVFbGxpcHNvaWRXaXRoQ3Vib2lkKTtcbiAgICB9XG59XG4iLCJleHBvcnQgeyBWb2x1bWUgfSBmcm9tICcuL3ZvbHVtZSc7XG5leHBvcnQgeyBDb2xsaWRlciB9IGZyb20gJy4vY29sbGlkZXInO1xuZXhwb3J0IHsgUmF5IH0gZnJvbSAnLi9jb2xsaWRlcnMvcmF5JztcbmV4cG9ydCB7IFBsYW5lIH0gZnJvbSAnLi9jb2xsaWRlcnMvcGxhbmUnO1xuZXhwb3J0IHsgUG9seWdvbiB9IGZyb20gJy4vY29sbGlkZXJzL3BvbHlnb24nO1xuZXhwb3J0IHsgU3BoZXJlIH0gZnJvbSAnLi92b2x1bWVzL3NwaGVyZSc7XG5leHBvcnQgeyBDdWJvaWQgfSBmcm9tICcuL3ZvbHVtZXMvY3Vib2lkJztcbmV4cG9ydCB7IEVsbGlwc29pZCB9IGZyb20gJy4vdm9sdW1lcy9lbGxpcHNvaWQnO1xuZXhwb3J0IHsgQ29sbGlzaW9uRGlzcGF0Y2hlciB9IGZyb20gJy4vZGlzcGF0Y2hlcnMvY29sbGlzaW9uJztcbmV4cG9ydCB7IGNvbGxpZGVSYXlXaXRoUmF5IH0gZnJvbSAnLi9jb2xsaXNpb25zL3JheS9yYXknO1xuZXhwb3J0IHsgY29sbGlkZVJheVdpdGhQbGFuZSB9IGZyb20gJy4vY29sbGlzaW9ucy9yYXkvcGxhbmUnO1xuZXhwb3J0IHsgY29sbGlkZVJheVdpdGhTcGhlcmUgfSBmcm9tICcuL2NvbGxpc2lvbnMvcmF5L3NwaGVyZSc7XG5leHBvcnQgeyBjb2xsaWRlUmF5V2l0aEN1Ym9pZCB9IGZyb20gJy4vY29sbGlzaW9ucy9yYXkvY3Vib2lkJztcbmV4cG9ydCB7IGNvbGxpZGVSYXlXaXRoRWxsaXBzb2lkIH0gZnJvbSAnLi9jb2xsaXNpb25zL3JheS9lbGxpcHNvaWQnO1xuZXhwb3J0IHsgY29sbGlkZVBsYW5lV2l0aFNwaGVyZSB9IGZyb20gJy4vY29sbGlzaW9ucy9wbGFuZS9zcGhlcmUnO1xuZXhwb3J0IHsgY29sbGlkZVBsYW5lV2l0aEN1Ym9pZCB9IGZyb20gJy4vY29sbGlzaW9ucy9wbGFuZS9jdWJvaWQnO1xuZXhwb3J0IHsgY29sbGlkZVBsYW5lV2l0aEVsbGlwc29pZCB9IGZyb20gJy4vY29sbGlzaW9ucy9wbGFuZS9lbGxpcHNvaWQnO1xuZXhwb3J0IHsgY29sbGlkZVNwaGVyZVdpdGhTcGhlcmUgfSBmcm9tICcuL2NvbGxpc2lvbnMvc3BoZXJlL3NwaGVyZSc7XG5leHBvcnQgeyBjb2xsaWRlU3BoZXJlV2l0aEN1Ym9pZCB9IGZyb20gJy4vY29sbGlzaW9ucy9zcGhlcmUvY3Vib2lkJztcbmV4cG9ydCB7IGNvbGxpZGVTcGhlcmVXaXRoRWxsaXBzb2lkIH0gZnJvbSAnLi9jb2xsaXNpb25zL3NwaGVyZS9lbGxpcHNvaWQnO1xuZXhwb3J0IHsgY29sbGlkZVBvbHlnb25XaXRoU3BoZXJlIH0gZnJvbSAnLi9jb2xsaXNpb25zL3BvbHlnb24vc3BoZXJlJztcbmV4cG9ydCB7IGNvbGxpZGVQb2x5Z29uV2l0aEN1Ym9pZCB9IGZyb20gJy4vY29sbGlzaW9ucy9wb2x5Z29uL2N1Ym9pZCc7XG5leHBvcnQgeyBjb2xsaWRlUG9seWdvbldpdGhFbGxpcHNvaWQgfSBmcm9tICcuL2NvbGxpc2lvbnMvcG9seWdvbi9lbGxpcHNvaWQnO1xuZXhwb3J0IHsgY29sbGlkZUN1Ym9pZFdpdGhDdWJvaWQgfSBmcm9tICcuL2NvbGxpc2lvbnMvY3Vib2lkL2N1Ym9pZCc7XG5leHBvcnQgeyBjb2xsaWRlRWxsaXBzb2lkV2l0aEN1Ym9pZCB9IGZyb20gJy4vY29sbGlzaW9ucy9lbGxpcHNvaWQvY3Vib2lkJztcbiIsInZhciBfX2RlY29yYXRlID0gKHRoaXMgJiYgdGhpcy5fX2RlY29yYXRlKSB8fCBmdW5jdGlvbiAoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xufTtcbnZhciBfX21ldGFkYXRhID0gKHRoaXMgJiYgdGhpcy5fX21ldGFkYXRhKSB8fCBmdW5jdGlvbiAoaywgdikge1xuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShrLCB2KTtcbn07XG5pbXBvcnQgeyBTZXJpYWxpemUgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyBtYXQzLCB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IENvbGxpZGVyIH0gZnJvbSAnLi9jb2xsaWRlcic7XG5leHBvcnQgY2xhc3MgVm9sdW1lIGV4dGVuZHMgQ29sbGlkZXIge1xuICAgIG9yaWdpbiA9IHZlYzMuemVybztcbiAgICBjZW50ZXI7XG4gICAgaW52ZXJzZUluZXJ0aWE7XG4gICAgY29uc3RydWN0b3IoeyBvcmlnaW4gPSB2ZWMzLnplcm8gfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMub3JpZ2luID0gb3JpZ2luLmNvcHkoKTtcbiAgICAgICAgdGhpcy5jZW50ZXIgPSBvcmlnaW4uY29weSgpO1xuICAgICAgICB0aGlzLmludmVyc2VJbmVydGlhID0gbmV3IG1hdDMoKTtcbiAgICB9XG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgICBjb25zdCB7IG9yaWdpbiB9ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLnN1cGVyLnNlcmlhbGl6ZSgpLFxuICAgICAgICAgICAgb3JpZ2luOiBvcmlnaW4uc2VyaWFsaXplKClcbiAgICAgICAgfTtcbiAgICB9XG59XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgdmVjMylcbl0sIFZvbHVtZS5wcm90b3R5cGUsIFwib3JpZ2luXCIsIHZvaWQgMCk7XG4iLCJ2YXIgX19kZWNvcmF0ZSA9ICh0aGlzICYmIHRoaXMuX19kZWNvcmF0ZSkgfHwgZnVuY3Rpb24gKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcbn07XG52YXIgX19tZXRhZGF0YSA9ICh0aGlzICYmIHRoaXMuX19tZXRhZGF0YSkgfHwgZnVuY3Rpb24gKGssIHYpIHtcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEoaywgdik7XG59O1xuaW1wb3J0IHsgU2VyaWFsaXplLCBSZWdpc3RlciB9IGZyb20gJ0BsdXovdXRpbGl0aWVzJztcbmltcG9ydCB7IHZlYzMgfSBmcm9tICdAbHV6L3ZlY3RvcnMnO1xuaW1wb3J0IHsgVm9sdW1lIH0gZnJvbSAnLi4vdm9sdW1lJztcbmxldCBDdWJvaWQgPSBjbGFzcyBDdWJvaWQgZXh0ZW5kcyBWb2x1bWUge1xuICAgIHR5cGUgPSAnQ3Vib2lkJztcbiAgICBleHRlbnRzO1xuICAgIGF4ZXM7IC8vIFRyYW5zZm9ybWVkIGF4ZXMgb2YgdGhlIGN1Ym9pZFxuICAgIGNvbnN0cnVjdG9yKHsgb3JpZ2luID0gdmVjMy56ZXJvLCBleHRlbnRzID0gdmVjMy5vbmUgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgb3JpZ2luIH0pO1xuICAgICAgICB0aGlzLmV4dGVudHMgPSBleHRlbnRzLmNvcHkoKTtcbiAgICAgICAgdGhpcy5heGVzID0gdmVjMy5heGVzLm1hcCgoYXhpcykgPT4gYXhpcy5jb3B5KCkpOyAvLyBMb2NhbCBheGVzLCBpbml0aWFsbHkgYWxpZ25lZCB3aXRoIHdvcmxkIGF4ZXNcbiAgICB9XG4gICAgYXBwbHlUcmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgICAgIGNvbnN0IHsgdHJhbnNsYXRpb24sIHJvdGF0aW9uIH0gPSB0cmFuc2Zvcm07XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgY2VudGVyIG9mIHRoZSBjdWJvaWRcbiAgICAgICAgdmVjMy5hZGQodGhpcy5vcmlnaW4sIHRyYW5zbGF0aW9uLCB0aGlzLmNlbnRlcik7XG4gICAgICAgIC8vIFJvdGF0ZSB0aGUgbG9jYWwgYXhlcyB0byBhbGlnbiB3aXRoIHRoZSBuZXcgb3JpZW50YXRpb25cbiAgICAgICAgdmVjMy5heGVzLmZvckVhY2goKGF4aXMsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByb3RhdGlvbi50cmFuc2Zvcm1WZWMzKGF4aXMsIHRoaXMuYXhlc1tpbmRleF0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2FsY3VsYXRlSW52ZXJzZUluZXJ0aWEobWFzcywgdHJhbnNmb3JtKSB7XG4gICAgICAgIGNvbnN0IHsgcm90YXRpb25NYXRyaXggfSA9IHRyYW5zZm9ybTtcbiAgICAgICAgY29uc3QgeyB4LCB5LCB6IH0gPSB0aGlzLmV4dGVudHM7XG4gICAgICAgIGNvbnN0IHQxID0gKDEgLyAxMikgKiBtYXNzICogKHkgKiB5ICsgeiAqIHopO1xuICAgICAgICBjb25zdCB0MiA9ICgxIC8gMTIpICogbWFzcyAqICh4ICogeCArIHogKiB6KTtcbiAgICAgICAgY29uc3QgdDMgPSAoMSAvIDEyKSAqIG1hc3MgKiAoeCAqIHggKyB5ICogeSk7XG4gICAgICAgIHRoaXMuaW52ZXJzZUluZXJ0aWEuc2V0KFt0MSwgMCwgMCwgMCwgdDIsIDAsIDAsIDAsIHQzXSk7XG4gICAgICAgIHRoaXMuaW52ZXJzZUluZXJ0aWEubXVsdGlwbHkocm90YXRpb25NYXRyaXgpLmludmVydCgpO1xuICAgIH1cbiAgICAvLyBOZXcgbWV0aG9kIHRvIGdldCB0aGUgOCB2ZXJ0aWNlcyBvZiB0aGUgY3Vib2lkXG4gICAgZ2V0VmVydGljZXMoKSB7XG4gICAgICAgIGNvbnN0IHsgeDogZXgsIHk6IGV5LCB6OiBleiB9ID0gdGhpcy5leHRlbnRzO1xuICAgICAgICAvLyBUaGVzZSBjb21iaW5hdGlvbnMgcmVwcmVzZW50IHRoZSA4IHZlcnRpY2VzLCB3aXRoIGRpZmZlcmVudCBzaWduIGNvbWJpbmF0aW9ucyBvZiBleHRlbnRzXG4gICAgICAgIGNvbnN0IHNpZ25zID0gW1xuICAgICAgICAgICAgWysxLCArMSwgKzFdLFxuICAgICAgICAgICAgWysxLCArMSwgLTFdLFxuICAgICAgICAgICAgWysxLCAtMSwgKzFdLFxuICAgICAgICAgICAgWysxLCAtMSwgLTFdLFxuICAgICAgICAgICAgWy0xLCArMSwgKzFdLFxuICAgICAgICAgICAgWy0xLCArMSwgLTFdLFxuICAgICAgICAgICAgWy0xLCAtMSwgKzFdLFxuICAgICAgICAgICAgWy0xLCAtMSwgLTFdXG4gICAgICAgIF07XG4gICAgICAgIC8vIENvbXB1dGUgZWFjaCB2ZXJ0ZXggYnkgc2NhbGluZyB0aGUgZXh0ZW50cyBhbG9uZyBlYWNoIGF4aXNcbiAgICAgICAgcmV0dXJuIHNpZ25zLm1hcCgoW3N4LCBzeSwgc3pdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2ZXJ0ZXggPSB2ZWMzLnplcm8uY29weSgpO1xuICAgICAgICAgICAgLy8gQ29tYmluZSB0aGUgYXhlcyBzY2FsZWQgYnkgdGhlIGV4dGVudHMgYW5kIHRoZSBzaWduc1xuICAgICAgICAgICAgdmVjMy5hZGQodmVydGV4LCB2ZWMzLnNjYWxlKHRoaXMuYXhlc1swXSwgZXggKiBzeCksIHZlcnRleCk7IC8vIFNjYWxlIGFsb25nIHgtYXhpc1xuICAgICAgICAgICAgdmVjMy5hZGQodmVydGV4LCB2ZWMzLnNjYWxlKHRoaXMuYXhlc1sxXSwgZXkgKiBzeSksIHZlcnRleCk7IC8vIFNjYWxlIGFsb25nIHktYXhpc1xuICAgICAgICAgICAgdmVjMy5hZGQodmVydGV4LCB2ZWMzLnNjYWxlKHRoaXMuYXhlc1syXSwgZXogKiBzeiksIHZlcnRleCk7IC8vIFNjYWxlIGFsb25nIHotYXhpc1xuICAgICAgICAgICAgLy8gT2Zmc2V0IHRoZSB2ZXJ0ZXggYnkgdGhlIGN1Ym9pZCdzIGNlbnRlclxuICAgICAgICAgICAgcmV0dXJuIHZlYzMuYWRkKHRoaXMuY2VudGVyLCB2ZXJ0ZXgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0RWRnZXMoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbMCwgMV0sXG4gICAgICAgICAgICBbMSwgM10sXG4gICAgICAgICAgICBbMywgMl0sXG4gICAgICAgICAgICBbMiwgMF0sXG4gICAgICAgICAgICBbNCwgNV0sXG4gICAgICAgICAgICBbNSwgN10sXG4gICAgICAgICAgICBbNywgNl0sXG4gICAgICAgICAgICBbNiwgNF0sXG4gICAgICAgICAgICBbMCwgNF0sXG4gICAgICAgICAgICBbMSwgNV0sXG4gICAgICAgICAgICBbMiwgNl0sXG4gICAgICAgICAgICBbMywgN10gLy8gVmVydGljYWwgZWRnZXNcbiAgICAgICAgXTtcbiAgICB9XG59O1xuX19kZWNvcmF0ZShbXG4gICAgU2VyaWFsaXplKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjp0eXBlXCIsIHZlYzMpXG5dLCBDdWJvaWQucHJvdG90eXBlLCBcImV4dGVudHNcIiwgdm9pZCAwKTtcbkN1Ym9pZCA9IF9fZGVjb3JhdGUoW1xuICAgIFJlZ2lzdGVyKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjpwYXJhbXR5cGVzXCIsIFtPYmplY3RdKVxuXSwgQ3Vib2lkKTtcbmV4cG9ydCB7IEN1Ym9pZCB9O1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xudmFyIF9fbWV0YWRhdGEgPSAodGhpcyAmJiB0aGlzLl9fbWV0YWRhdGEpIHx8IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xufTtcbmltcG9ydCB7IFNlcmlhbGl6ZSwgUmVnaXN0ZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IFZvbHVtZSB9IGZyb20gJy4uL3ZvbHVtZSc7XG4vLyBHZW5lcmFsIGVsbGlwc29pZCB3aXRoIHRocmVlIHNlbWktYXhlcyByYWRpaSBhbG9uZyBsb2NhbCBYLCBZLCBaLlxubGV0IEVsbGlwc29pZCA9IGNsYXNzIEVsbGlwc29pZCBleHRlbmRzIFZvbHVtZSB7XG4gICAgdHlwZSA9ICdFbGxpcHNvaWQnO1xuICAgIHJhZGlpOyAvLyBbYSwgYiwgY10gYWxvbmcgbG9jYWwgWCwgWSwgWlxuICAgIC8vIFdvcmxkLXNwYWNlIHVuaXQgYXhlcyBjb3JyZXNwb25kaW5nIHRvIGxvY2FsIFgsIFksIFpcbiAgICBheGVzO1xuICAgIGNvbnN0cnVjdG9yKHsgb3JpZ2luID0gdmVjMy56ZXJvLCByYWRpaSA9IHZlYzMub25lIH0gPSB7fSkge1xuICAgICAgICBzdXBlcih7IG9yaWdpbiB9KTtcbiAgICAgICAgdGhpcy5yYWRpaSA9IHJhZGlpLmNvcHkoKTtcbiAgICAgICAgdGhpcy5heGVzID0gdmVjMy5heGVzLm1hcCgoYXhpcykgPT4gYXhpcy5jb3B5KCkpO1xuICAgIH1cbiAgICBhcHBseVRyYW5zZm9ybSh0cmFuc2Zvcm0pIHtcbiAgICAgICAgY29uc3QgeyB0cmFuc2xhdGlvbiwgcm90YXRpb24gfSA9IHRyYW5zZm9ybTtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBjZW50ZXIgb2YgdGhlIGVsbGlwc29pZFxuICAgICAgICB2ZWMzLmFkZCh0aGlzLm9yaWdpbiwgdHJhbnNsYXRpb24sIHRoaXMuY2VudGVyKTtcbiAgICAgICAgLy8gUm90YXRlIHRoZSBsb2NhbCBheGVzIGludG8gd29ybGQgc3BhY2VcbiAgICAgICAgdmVjMy5heGVzLmZvckVhY2goKGF4aXMsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByb3RhdGlvbi50cmFuc2Zvcm1WZWMzKGF4aXMsIHRoaXMuYXhlc1tpbmRleF0pLm5vcm1hbGl6ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2FsY3VsYXRlSW52ZXJzZUluZXJ0aWEobWFzcywgdHJhbnNmb3JtKSB7XG4gICAgICAgIGNvbnN0IHsgcm90YXRpb25NYXRyaXggfSA9IHRyYW5zZm9ybTtcbiAgICAgICAgY29uc3QgeyB4OiBhLCB5OiBiLCB6OiBjIH0gPSB0aGlzLnJhZGlpO1xuICAgICAgICAvLyBQcmluY2lwYWwgbW9tZW50cyBvZiBpbmVydGlhIGZvciBhIHNvbGlkIGVsbGlwc29pZFxuICAgICAgICBjb25zdCBJeHggPSAoMSAvIDUpICogbWFzcyAqIChiICogYiArIGMgKiBjKTtcbiAgICAgICAgY29uc3QgSXl5ID0gKDEgLyA1KSAqIG1hc3MgKiAoYSAqIGEgKyBjICogYyk7XG4gICAgICAgIGNvbnN0IEl6eiA9ICgxIC8gNSkgKiBtYXNzICogKGEgKiBhICsgYiAqIGIpO1xuICAgICAgICB0aGlzLmludmVyc2VJbmVydGlhLnNldChbSXh4LCAwLCAwLCAwLCBJeXksIDAsIDAsIDAsIEl6el0pO1xuICAgICAgICB0aGlzLmludmVyc2VJbmVydGlhLm11bHRpcGx5KHJvdGF0aW9uTWF0cml4KS5pbnZlcnQoKTtcbiAgICB9XG4gICAgLy8gRWZmZWN0aXZlIHJhZGl1cyBhbG9uZyBhIGdpdmVuIHdvcmxkLXNwYWNlIGRpcmVjdGlvbi5cbiAgICBlZmZlY3RpdmVSYWRpdXMoZGlyZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IHsgeDogYXgsIHk6IGF5LCB6OiBheiB9ID0gdGhpcy5yYWRpaTtcbiAgICAgICAgLy8gQ29tcG9uZW50cyBvZiBkaXJlY3Rpb24gYWxvbmcgbG9jYWwgYXhlc1xuICAgICAgICBjb25zdCBkeCA9IHZlYzMuZG90KGRpcmVjdGlvbiwgdGhpcy5heGVzWzBdKTtcbiAgICAgICAgY29uc3QgZHkgPSB2ZWMzLmRvdChkaXJlY3Rpb24sIHRoaXMuYXhlc1sxXSk7XG4gICAgICAgIGNvbnN0IGR6ID0gdmVjMy5kb3QoZGlyZWN0aW9uLCB0aGlzLmF4ZXNbMl0pO1xuICAgICAgICBjb25zdCBsZW4yID0gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuICAgICAgICBpZiAobGVuMiA9PT0gMClcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICBjb25zdCBpbnZSMiA9IChkeCAqIGR4KSAvIChheCAqIGF4KSArIChkeSAqIGR5KSAvIChheSAqIGF5KSArIChkeiAqIGR6KSAvIChheiAqIGF6KTtcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydChsZW4yKSAvIE1hdGguc3FydChpbnZSMik7XG4gICAgfVxufTtcbl9fZGVjb3JhdGUoW1xuICAgIFNlcmlhbGl6ZSgpLFxuICAgIF9fbWV0YWRhdGEoXCJkZXNpZ246dHlwZVwiLCB2ZWMzIC8vIFthLCBiLCBjXSBhbG9uZyBsb2NhbCBYLCBZLCBaXG4gICAgLy8gV29ybGQtc3BhY2UgdW5pdCBheGVzIGNvcnJlc3BvbmRpbmcgdG8gbG9jYWwgWCwgWSwgWlxuICAgIClcbl0sIEVsbGlwc29pZC5wcm90b3R5cGUsIFwicmFkaWlcIiwgdm9pZCAwKTtcbkVsbGlwc29pZCA9IF9fZGVjb3JhdGUoW1xuICAgIFJlZ2lzdGVyKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjpwYXJhbXR5cGVzXCIsIFtPYmplY3RdKVxuXSwgRWxsaXBzb2lkKTtcbmV4cG9ydCB7IEVsbGlwc29pZCB9O1xuIiwidmFyIF9fZGVjb3JhdGUgPSAodGhpcyAmJiB0aGlzLl9fZGVjb3JhdGUpIHx8IGZ1bmN0aW9uIChkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XG59O1xudmFyIF9fbWV0YWRhdGEgPSAodGhpcyAmJiB0aGlzLl9fbWV0YWRhdGEpIHx8IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKGssIHYpO1xufTtcbmltcG9ydCB7IFNlcmlhbGl6ZSwgUmVnaXN0ZXIgfSBmcm9tICdAbHV6L3V0aWxpdGllcyc7XG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnQGx1ei92ZWN0b3JzJztcbmltcG9ydCB7IFZvbHVtZSB9IGZyb20gJy4uL3ZvbHVtZSc7XG5sZXQgU3BoZXJlID0gY2xhc3MgU3BoZXJlIGV4dGVuZHMgVm9sdW1lIHtcbiAgICB0eXBlID0gJ1NwaGVyZSc7XG4gICAgcmFkaXVzO1xuICAgIGNvbnN0cnVjdG9yKHsgb3JpZ2luID0gdmVjMy56ZXJvLCByYWRpdXMgPSAxLjAgfSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKHsgb3JpZ2luIH0pO1xuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgICB9XG4gICAgYXBwbHlUcmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgICAgIGNvbnN0IHsgdHJhbnNsYXRpb24gfSA9IHRyYW5zZm9ybTtcbiAgICAgICAgdmVjMy5hZGQodGhpcy5vcmlnaW4sIHRyYW5zbGF0aW9uLCB0aGlzLmNlbnRlcik7XG4gICAgfVxuICAgIGNhbGN1bGF0ZUludmVyc2VJbmVydGlhKG1hc3MsIHRyYW5zZm9ybSkge1xuICAgICAgICBjb25zdCB7IHJhZGl1cyB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgdCA9ICgyIC8gNSkgKiBtYXNzICogcmFkaXVzICogcmFkaXVzO1xuICAgICAgICB0aGlzLmludmVyc2VJbmVydGlhLnNldChbdCwgMCwgMCwgMCwgdCwgMCwgMCwgMCwgdF0pO1xuICAgICAgICB0aGlzLmludmVyc2VJbmVydGlhLmludmVydCgpO1xuICAgIH1cbn07XG5fX2RlY29yYXRlKFtcbiAgICBTZXJpYWxpemUoKSxcbiAgICBfX21ldGFkYXRhKFwiZGVzaWduOnR5cGVcIiwgTnVtYmVyKVxuXSwgU3BoZXJlLnByb3RvdHlwZSwgXCJyYWRpdXNcIiwgdm9pZCAwKTtcblNwaGVyZSA9IF9fZGVjb3JhdGUoW1xuICAgIFJlZ2lzdGVyKCksXG4gICAgX19tZXRhZGF0YShcImRlc2lnbjpwYXJhbXR5cGVzXCIsIFtPYmplY3RdKVxuXSwgU3BoZXJlKTtcbmV4cG9ydCB7IFNwaGVyZSB9O1xuIiwiZXhwb3J0IGNsYXNzIERpc3BhdGNoZXIge1xuICAgIGNhbGxiYWNrcyA9IG5ldyBNYXAoKTtcbiAgICByZWdpc3RlcihmaXJzdFR5cGUsIG90aGVyVHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3Muc2V0KGAke2ZpcnN0VHlwZX0tJHtvdGhlclR5cGV9YCwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBkaXNwYXRjaChmaXJzdCwgb3RoZXIpIHtcbiAgICAgICAgbGV0IGtleSA9IGAke2ZpcnN0LnR5cGV9LSR7b3RoZXIudHlwZX1gO1xuICAgICAgICBsZXQgY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrcy5nZXQoa2V5KTtcbiAgICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICAgICAga2V5ID0gYCR7b3RoZXIudHlwZX0tJHtmaXJzdC50eXBlfWA7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHRoaXMuY2FsbGJhY2tzLmdldChrZXkpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG90aGVyLCBmaXJzdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChjYWxsYmFjaykgPyBjYWxsYmFjayhmaXJzdCwgb3RoZXIpIDogbnVsbDtcbiAgICB9XG59XG4iLCJleHBvcnQgeyBQb29sIH0gZnJvbSAnLi9wb29sJztcbmV4cG9ydCB7IERpc3BhdGNoZXIgfSBmcm9tICcuL2Rpc3BhdGNoZXInO1xuZXhwb3J0IHsgU2VyaWFsaXplLCBTZXJpYWxpemFibGUgfSBmcm9tICcuL3NlcmlhbGl6YWJsZSc7XG5leHBvcnQgeyBVbmlmb3JtLCBnZXRVbmlmb3JtUHJvcGVydGllcyB9IGZyb20gJy4vdW5pZm9ybSc7XG5leHBvcnQgeyBSZWdpc3RlciwgZ2V0UmVnaXN0ZXJlZENsYXNzIH0gZnJvbSAnLi9yZWdpc3RyeSc7XG4iLCJjb25zdCB7IGNlaWwgfSA9IE1hdGg7XG5leHBvcnQgY2xhc3MgUG9vbCB7XG4gICAgY3JlYXRlO1xuICAgIHJlc2V0O1xuICAgIGluaXRpYWxTaXplO1xuICAgIGJhdGNoU2l6ZTtcbiAgICBwb29sO1xuICAgIG1heGltdW1TaXplOyAvLyBtYXhpbXVtIG51bWJlciBvZiBvYmplY3RzIHRoYXQgdGhlIHBvb2wgY2FuIGdyb3cgdG9cbiAgICBjb25zdHJ1Y3RvcihjcmVhdGUsIHJlc2V0LCBpbml0aWFsU2l6ZSwgLy8gbnVtYmVyIG9mIG9iamVjdHMgdG8gYWxsb2NhdGUgb24gcG9vbCBjcmVhdGlvblxuICAgIGJhdGNoU2l6ZSA9IDAgLy8gbnVtYmVyIG9mIG9iamVjdHMgdG8gY3JlYXRlIHdoZW5ldmVyIHBvb2wgbmVlZHMgdG8gZ3Jvd1xuICAgICkge1xuICAgICAgICB0aGlzLmNyZWF0ZSA9IGNyZWF0ZTtcbiAgICAgICAgdGhpcy5yZXNldCA9IHJlc2V0O1xuICAgICAgICB0aGlzLmluaXRpYWxTaXplID0gaW5pdGlhbFNpemU7XG4gICAgICAgIHRoaXMuYmF0Y2hTaXplID0gYmF0Y2hTaXplO1xuICAgICAgICB0aGlzLnBvb2wgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgdGhpcy5tYXhpbXVtU2l6ZSA9IGluaXRpYWxTaXplO1xuICAgICAgICB0aGlzLmFsbG9jYXRlKHRoaXMuaW5pdGlhbFNpemUpO1xuICAgIH1cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wb29sLmxlbmd0aDtcbiAgICB9XG4gICAgYWNxdWlyZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucG9vbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBpZiBudW1iZXIgb2YgYXZhaWxhYmxlIG9iamVjdHMgaXMgbGVzcyB0aGFuIDEwJSBvZiBtYXhpbXVtIHNpemUsXG4gICAgICAgICAgICAvLyBkb3VibGUgbWF4aW11bSBzaXplIGFuZCBmaWxsIHVwIHBvb2wgd2l0aCBuZXdseSBhbGxvY2F0ZWQgb2JqZWN0c1xuICAgICAgICAgICAgaWYgKHRoaXMucG9vbC5sZW5ndGggPD0gY2VpbCh0aGlzLm1heGltdW1TaXplICogMC4xKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWF4aW11bVNpemUgKj0gMjtcbiAgICAgICAgICAgICAgICB0aGlzLmFsbG9jYXRlKHRoaXMubWF4aW11bVNpemUgLSB0aGlzLnBvb2wubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGFyZSBub25lIGF2YWlsYWJsZSwgXG4gICAgICAgICAgICAvLyBhbGxvY2F0ZSBuZXcgYmF0Y2ggb2Ygb2JqZWN0c1xuICAgICAgICAgICAgdGhpcy5hbGxvY2F0ZSh0aGlzLmJhdGNoU2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucG9vbC5wb3AoKTsgLy8gcmV0dXJuIGxhc3Qgb2JqZWN0IGluIHBvb2xcbiAgICB9XG4gICAgcmVsZWFzZShvYmplY3QpIHtcbiAgICAgICAgdGhpcy5wb29sLnB1c2godGhpcy5yZXNldChvYmplY3QpKTtcbiAgICB9XG4gICAgYWxsb2NhdGUoc2l6ZSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5wb29sLnB1c2godGhpcy5jcmVhdGUoKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJjb25zdCBjbGFzc1JlZ2lzdHJ5ID0gbmV3IE1hcCgpO1xuZXhwb3J0IGZ1bmN0aW9uIFJlZ2lzdGVyKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoY2xhc3NDb25zdHJ1Y3Rvcikge1xuICAgICAgICBjbGFzc1JlZ2lzdHJ5LnNldChjbGFzc0NvbnN0cnVjdG9yLm5hbWUsIGNsYXNzQ29uc3RydWN0b3IpO1xuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVnaXN0ZXJlZENsYXNzKHZhbHVlKSB7XG4gICAgcmV0dXJuIGNsYXNzUmVnaXN0cnkuZ2V0KHZhbHVlPy50eXBlKTtcbn1cbiIsImltcG9ydCAncmVmbGVjdC1tZXRhZGF0YSc7XG5pbXBvcnQgeyBnZXRSZWdpc3RlcmVkQ2xhc3MgfSBmcm9tICcuL3JlZ2lzdHJ5JztcbmNvbnN0IHNlcmlhbGl6ZWRQcm9wZXJ0aWVzID0gbmV3IFdlYWtNYXAoKTtcbmV4cG9ydCBmdW5jdGlvbiBTZXJpYWxpemUodmFsdWVUeXBlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkge1xuICAgICAgICBsZXQgcHJvcGVydGllcyA9IFtdO1xuICAgICAgICBpZiAoc2VyaWFsaXplZFByb3BlcnRpZXMuaGFzKHRhcmdldC5jb25zdHJ1Y3RvcikpIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXMgPSBzZXJpYWxpemVkUHJvcGVydGllcy5nZXQodGFyZ2V0LmNvbnN0cnVjdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRQcm9wZXJ0aWVzLnNldCh0YXJnZXQuY29uc3RydWN0b3IsIHByb3BlcnRpZXMpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHR5cGUgPSBSZWZsZWN0LmdldE1ldGFkYXRhKCdkZXNpZ246dHlwZScsIHRhcmdldCwga2V5KTtcbiAgICAgICAgcHJvcGVydGllcy5wdXNoKHsga2V5LCB0eXBlLCB2YWx1ZVR5cGUgfSk7XG4gICAgfTtcbn1cbmNvbnN0IHsgaXNBcnJheSB9ID0gQXJyYXk7XG5jb25zdCBpc09iamVjdCA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufTtcbmV4cG9ydCBjbGFzcyBTZXJpYWxpemFibGUge1xuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgICAgY29uc3QgaXNTZXJpYWxpemFibGUgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUuc2VyaWFsaXplID09PSAnZnVuY3Rpb24nO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0gU2VyaWFsaXphYmxlLmdldEFsbFNlcmlhbGl6YWJsZVByb3BlcnRpZXModGhpcy5jb25zdHJ1Y3Rvcik7XG4gICAgICAgIHJldHVybiBwcm9wZXJ0aWVzLnJlZHVjZSgoZGF0YSwgeyBrZXkgfSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzW2tleV07XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzU2VyaWFsaXphYmxlKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlLnNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlLm1hcCgodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzU2VyaWFsaXphYmxlKHZhbHVlKSA/IHZhbHVlLnNlcmlhbGl6ZSh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IE9iamVjdC5lbnRyaWVzKHZhbHVlKS5yZWR1Y2UoKGVudHJpZXMsIFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbnRyaWVzW2tleV0gPSBpc1NlcmlhbGl6YWJsZSh2YWx1ZSkgPyB2YWx1ZS5zZXJpYWxpemUodmFsdWUpIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbnRyaWVzO1xuICAgICAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sIHt9KTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGRlc2VyaWFsaXplKGRhdGEpIHtcbiAgICAgICAgY29uc3QgaXNEZXNlcmlhbGl6YWJsZSA9ICh0eXBlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZSAmJiB0eXBlb2YgdHlwZS5kZXNlcmlhbGl6ZSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgdGhpcygpO1xuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0gU2VyaWFsaXphYmxlLmdldEFsbFNlcmlhbGl6YWJsZVByb3BlcnRpZXModGhpcyk7XG4gICAgICAgIGZvciAoY29uc3QgeyBrZXksIHR5cGUsIHZhbHVlVHlwZSB9IG9mIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZGF0YVtrZXldO1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBjdXJyZW50VHlwZSA9IHR5cGU7XG4gICAgICAgICAgICBsZXQgY3VycmVudFZhbHVlVHlwZSA9IHZhbHVlVHlwZTtcbiAgICAgICAgICAgIGlmIChnZXRSZWdpc3RlcmVkQ2xhc3ModmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFR5cGUgPSBnZXRSZWdpc3RlcmVkQ2xhc3ModmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzRGVzZXJpYWxpemFibGUoY3VycmVudFR5cGUpKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2Vba2V5XSA9IGF3YWl0IGN1cnJlbnRUeXBlLmRlc2VyaWFsaXplKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2Vba2V5XSA9IGF3YWl0IFByb21pc2UuYWxsKHZhbHVlLm1hcChhc3luYyAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbVZhbHVlVHlwZSA9IGN1cnJlbnRWYWx1ZVR5cGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRSZWdpc3RlcmVkQ2xhc3MoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1WYWx1ZVR5cGUgPSBnZXRSZWdpc3RlcmVkQ2xhc3MoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJyAmJiBpdGVtVmFsdWVUeXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkVHlwZSA9IGdldFJlZ2lzdGVyZWRDbGFzcyhqc29uRGF0YSkgfHwgaXRlbVZhbHVlVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCByZXNvbHZlZFR5cGUuZGVzZXJpYWxpemUoanNvbkRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzRGVzZXJpYWxpemFibGUoaXRlbVZhbHVlVHlwZSkgPyBhd2FpdCBpdGVtVmFsdWVUeXBlLmRlc2VyaWFsaXplKGl0ZW0pIDogaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBQcm9taXNlLmFsbChPYmplY3QuZW50cmllcyh2YWx1ZSkubWFwKGFzeW5jIChbZW50cnlLZXksIGVudHJ5VmFsdWVdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnRyeVZhbHVlVHlwZSA9IGN1cnJlbnRWYWx1ZVR5cGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChnZXRSZWdpc3RlcmVkQ2xhc3MoZW50cnlWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5VmFsdWVUeXBlID0gZ2V0UmVnaXN0ZXJlZENsYXNzKGVudHJ5VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW50cnlWYWx1ZSA9PT0gJ3N0cmluZycgJiYgZW50cnlWYWx1ZVR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChlbnRyeVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb25EYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWRUeXBlID0gZ2V0UmVnaXN0ZXJlZENsYXNzKGpzb25EYXRhKSB8fCBlbnRyeVZhbHVlVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbZW50cnlLZXksIGF3YWl0IHJlc29sdmVkVHlwZS5kZXNlcmlhbGl6ZShqc29uRGF0YSldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeUtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Rlc2VyaWFsaXphYmxlKGVudHJ5VmFsdWVUeXBlKSA/IGF3YWl0IGVudHJ5VmFsdWVUeXBlLmRlc2VyaWFsaXplKGVudHJ5VmFsdWUpIDogZW50cnlWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZVtrZXldID0gT2JqZWN0LmZyb21FbnRyaWVzKGVudHJpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2Vba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG4gICAgc3RhdGljIGdldEFsbFNlcmlhbGl6YWJsZVByb3BlcnRpZXModGFyZ2V0KSB7XG4gICAgICAgIGxldCBhbGxQcm9wZXJ0aWVzID0gW107XG4gICAgICAgIGxldCBwcm90b3R5cGUgPSB0YXJnZXQucHJvdG90eXBlO1xuICAgICAgICB3aGlsZSAocHJvdG90eXBlICYmIHByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgICAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHNlcmlhbGl6ZWRQcm9wZXJ0aWVzLmdldChwcm90b3R5cGUuY29uc3RydWN0b3IpIHx8IFtdO1xuICAgICAgICAgICAgYWxsUHJvcGVydGllcyA9IFsuLi5hbGxQcm9wZXJ0aWVzLCAuLi5wcm9wZXJ0aWVzXTtcbiAgICAgICAgICAgIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90b3R5cGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhbGxQcm9wZXJ0aWVzO1xuICAgIH1cbn1cbiIsImNvbnN0IHVuaWZvcm1Qcm9wZXJ0aWVzID0gbmV3IFdlYWtNYXAoKTtcbmV4cG9ydCBmdW5jdGlvbiBVbmlmb3JtKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHtcbiAgICAgICAgbGV0IHByb3BlcnRpZXMgPSBbXTtcbiAgICAgICAgaWYgKHVuaWZvcm1Qcm9wZXJ0aWVzLmhhcyh0YXJnZXQuY29uc3RydWN0b3IpKSB7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzID0gdW5pZm9ybVByb3BlcnRpZXMuZ2V0KHRhcmdldC5jb25zdHJ1Y3Rvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB1bmlmb3JtUHJvcGVydGllcy5zZXQodGFyZ2V0LmNvbnN0cnVjdG9yLCBwcm9wZXJ0aWVzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlID0gUmVmbGVjdC5nZXRNZXRhZGF0YSgnZGVzaWduOnR5cGUnLCB0YXJnZXQsIGtleSk7XG4gICAgICAgIHByb3BlcnRpZXMucHVzaCh7IGtleSwgdHlwZSB9KTtcbiAgICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFVuaWZvcm1Qcm9wZXJ0aWVzKHRhcmdldCkge1xuICAgIGxldCBhbGxQcm9wZXJ0aWVzID0gW107XG4gICAgbGV0IHByb3RvdHlwZSA9IHRhcmdldC5wcm90b3R5cGU7XG4gICAgd2hpbGUgKHByb3RvdHlwZSAmJiBwcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHVuaWZvcm1Qcm9wZXJ0aWVzLmdldChwcm90b3R5cGUuY29uc3RydWN0b3IpIHx8IFtdO1xuICAgICAgICBhbGxQcm9wZXJ0aWVzID0gWy4uLmFsbFByb3BlcnRpZXMsIC4uLnByb3BlcnRpZXNdO1xuICAgICAgICBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG90eXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIGFsbFByb3BlcnRpZXM7XG59XG4iLCJleHBvcnQgY29uc3QgRXBzaWxvbiA9IDAuMDAwMDE7XG4iLCJleHBvcnQgeyBtYXQyIH0gZnJvbSAnLi9tYXQyJztcbmV4cG9ydCB7IG1hdDMgfSBmcm9tICcuL21hdDMnO1xuZXhwb3J0IHsgbWF0NCB9IGZyb20gJy4vbWF0NCc7XG5leHBvcnQgeyB2ZWMyIH0gZnJvbSAnLi92ZWMyJztcbmV4cG9ydCB7IHZlYzMgfSBmcm9tICcuL3ZlYzMnO1xuZXhwb3J0IHsgdmVjNCB9IGZyb20gJy4vdmVjNCc7XG5leHBvcnQgeyBxdWF0IH0gZnJvbSAnLi9xdWF0JztcbmV4cG9ydCB7IEVwc2lsb24gfSBmcm9tICcuL2NvbnN0YW50cyc7XG4iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgdmVjMiB9IGZyb20gJy4vdmVjMic7XG5leHBvcnQgY2xhc3MgbWF0MiBleHRlbmRzIEZsb2F0MzJBcnJheSB7XG4gICAgY29uc3RydWN0b3IodmFsdWVzID0gWzEuMCwgMC4wLCAwLjAsIDEuMF0pIHtcbiAgICAgICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDQpKTtcbiAgICB9XG4gICAgc3RhdGljIGlkZW50aXR5ID0gbmV3IG1hdDIoKTtcbiAgICBnZXQgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdICogdGhpc1szXSAtIHRoaXNbMl0gKiB0aGlzWzFdO1xuICAgIH1cbiAgICBjb3B5KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC5zZXQodGhpcyk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICByb3coaW5kZXgsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpc1tpbmRleCAqIDJdO1xuICAgICAgICBkZXN0LnkgPSB0aGlzW2luZGV4ICogMiArIDFdO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgY29sdW1uKGluZGV4LCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXNbaW5kZXhdO1xuICAgICAgICBkZXN0LnkgPSB0aGlzW2luZGV4ICsgMl07XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBlcXVhbHMob3RoZXIsIHRocmVzaG9sZCA9IEVwc2lsb24pIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh0aGlzW2ldIC0gb3RoZXJbaV0pID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpc1swXSA9IDEuMDtcbiAgICAgICAgdGhpc1sxXSA9IDAuMDtcbiAgICAgICAgdGhpc1syXSA9IDAuMDtcbiAgICAgICAgdGhpc1szXSA9IDEuMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRyYW5zcG9zZShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzWzFdO1xuICAgICAgICBkZXN0WzFdID0gZGVzdFsyXTtcbiAgICAgICAgZGVzdFsyXSA9IHQ7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBpbnZlcnQoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGV0ID0gdGhpcy5kZXRlcm1pbmFudDtcbiAgICAgICAgaWYgKGRldCA9PT0gMC4wKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBkZXQgPSAxLjAgLyBkZXQ7XG4gICAgICAgIGNvbnN0IHQwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IHQwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IHQxMCA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IHQxMSA9IHRoaXNbM107XG4gICAgICAgIGRlc3RbMF0gPSBkZXQgKiB0MTE7XG4gICAgICAgIGRlc3RbMV0gPSBkZXQgKiAtdDAxO1xuICAgICAgICBkZXN0WzJdID0gZGV0ICogLXQxMDtcbiAgICAgICAgZGVzdFszXSA9IGRldCAqIHQwMDtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIG11bHRpcGx5KG90aGVyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGEwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IGEwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IGExMCA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IGExMSA9IHRoaXNbM107XG4gICAgICAgIGNvbnN0IGIwMCA9IG90aGVyWzBdO1xuICAgICAgICBjb25zdCBiMDEgPSBvdGhlclsxXTtcbiAgICAgICAgY29uc3QgYjEwID0gb3RoZXJbMl07XG4gICAgICAgIGNvbnN0IGIxMSA9IG90aGVyWzNdO1xuICAgICAgICBkZXN0WzBdID0gYTAwICogYjAwICsgYTAxICogYjEwO1xuICAgICAgICBkZXN0WzFdID0gYTAwICogYjAxICsgYTAxICogYjExO1xuICAgICAgICBkZXN0WzJdID0gYTEwICogYjAwICsgYTExICogYjEwO1xuICAgICAgICBkZXN0WzNdID0gYTEwICogYjAxICsgYTExICogYjExO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdHJhbnNmb3JtKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB4ID0gdmVjdG9yLng7XG4gICAgICAgIGNvbnN0IHkgPSB2ZWN0b3IueTtcbiAgICAgICAgZGVzdC54ID0geCAqIHRoaXNbMF0gKyB5ICogdGhpc1sxXTtcbiAgICAgICAgZGVzdC55ID0geCAqIHRoaXNbMl0gKyB5ICogdGhpc1szXTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHNjYWxlKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2MDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCB2MDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCB2MTAgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCB2MTEgPSB0aGlzWzNdO1xuICAgICAgICBjb25zdCB4ID0gdmVjdG9yLng7XG4gICAgICAgIGNvbnN0IHkgPSB2ZWN0b3IueTtcbiAgICAgICAgZGVzdFswXSA9IHYwMCAqIHg7XG4gICAgICAgIGRlc3RbMV0gPSB2MDEgKiB5O1xuICAgICAgICBkZXN0WzJdID0gdjEwICogeDtcbiAgICAgICAgZGVzdFszXSA9IHYxMSAqIHk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICByb3RhdGUoYW5nbGUsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdjAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgdjAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgdjEwID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgdjExID0gdGhpc1szXTtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgIGRlc3RbMF0gPSB2MDAgKiBjb3MgKyB2MDEgKiBzaW47XG4gICAgICAgIGRlc3RbMV0gPSB2MDAgKiAtc2luICsgdjAxICogY29zO1xuICAgICAgICBkZXN0WzJdID0gdjEwICogY29zICsgdjExICogc2luO1xuICAgICAgICBkZXN0WzNdID0gdjEwICogLXNpbiArIHYxMSAqIGNvcztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZSh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBtYXQyKHZhbHVlcyk7XG4gICAgfVxuICAgIHN0YXRpYyBtdWx0aXBseShtMSwgbTIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQyKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYTAwID0gbTFbMF07XG4gICAgICAgIGNvbnN0IGEwMSA9IG0xWzFdO1xuICAgICAgICBjb25zdCBhMTAgPSBtMVsyXTtcbiAgICAgICAgY29uc3QgYTExID0gbTFbM107XG4gICAgICAgIGNvbnN0IGIwMCA9IG0yWzBdO1xuICAgICAgICBjb25zdCBiMDEgPSBtMlsxXTtcbiAgICAgICAgY29uc3QgYjEwID0gbTJbMl07XG4gICAgICAgIGNvbnN0IGIxMSA9IG0yWzNdO1xuICAgICAgICBkZXN0WzBdID0gYTAwICogYjAwICsgYTAxICogYjEwO1xuICAgICAgICBkZXN0WzFdID0gYTAwICogYjAxICsgYTAxICogYjExO1xuICAgICAgICBkZXN0WzJdID0gYTEwICogYjAwICsgYTExICogYjEwO1xuICAgICAgICBkZXN0WzNdID0gYTEwICogYjAxICsgYTExICogYjExO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgbWF0NCB9IGZyb20gJy4vbWF0NCc7XG5pbXBvcnQgeyBxdWF0IH0gZnJvbSAnLi9xdWF0JztcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuL3ZlYzMnO1xuZXhwb3J0IGNsYXNzIG1hdDMgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlcyA9IFsxLjAsIDAuMCwgMC4wLCAwLjAsIDEuMCwgMC4wLCAwLjAsIDAuMCwgMS4wXSkge1xuICAgICAgICBzdXBlcih2YWx1ZXMuc2xpY2UoMCwgOSkpO1xuICAgIH1cbiAgICBzdGF0aWMgaWRlbnRpdHkgPSBuZXcgbWF0MygpO1xuICAgIGdldCBkZXRlcm1pbmFudCgpIHtcbiAgICAgICAgY29uc3QgdjAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgdjAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgdjAyID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgdjEwID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgdjExID0gdGhpc1s0XTtcbiAgICAgICAgY29uc3QgdjEyID0gdGhpc1s1XTtcbiAgICAgICAgY29uc3QgdjIwID0gdGhpc1s2XTtcbiAgICAgICAgY29uc3QgdjIxID0gdGhpc1s3XTtcbiAgICAgICAgY29uc3QgdjIyID0gdGhpc1s4XTtcbiAgICAgICAgY29uc3QgZGV0MDEgPSB2MjIgKiB2MTEgLSB2MTIgKiB2MjE7XG4gICAgICAgIGNvbnN0IGRldDExID0gLXYyMiAqIHYxMCArIHYxMiAqIHYyMDtcbiAgICAgICAgY29uc3QgZGV0MjEgPSB2MjEgKiB2MTAgLSB2MTEgKiB2MjA7XG4gICAgICAgIHJldHVybiB2MDAgKiBkZXQwMSArIHYwMSAqIGRldDExICsgdjAyICogZGV0MjE7XG4gICAgfVxuICAgIGNvcHkoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDMoKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDk7IGkrKykge1xuICAgICAgICAgICAgZGVzdFtpXSA9IHRoaXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHJvdyhpbmRleCwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzW2luZGV4ICogM107XG4gICAgICAgIGRlc3QueSA9IHRoaXNbaW5kZXggKiAzICsgMV07XG4gICAgICAgIGRlc3QueiA9IHRoaXNbaW5kZXggKiAzICsgMl07XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBjb2x1bW4oaW5kZXgsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpc1tpbmRleF07XG4gICAgICAgIGRlc3QueSA9IHRoaXNbaW5kZXggKyAzXTtcbiAgICAgICAgZGVzdC56ID0gdGhpc1tpbmRleCArIDZdO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgZXF1YWxzKG90aGVyLCB0aHJlc2hvbGQgPSBFcHNpbG9uKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpc1tpXSAtIG90aGVyW2ldKSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXNbMF0gPSAxLjA7XG4gICAgICAgIHRoaXNbMV0gPSAwLjA7XG4gICAgICAgIHRoaXNbMl0gPSAwLjA7XG4gICAgICAgIHRoaXNbM10gPSAwLjA7XG4gICAgICAgIHRoaXNbNF0gPSAxLjA7XG4gICAgICAgIHRoaXNbNV0gPSAwLjA7XG4gICAgICAgIHRoaXNbNl0gPSAwLjA7XG4gICAgICAgIHRoaXNbN10gPSAwLjA7XG4gICAgICAgIHRoaXNbOF0gPSAxLjA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB0cmFuc3Bvc2UoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0MDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCB0MDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCB0MDIgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCB0MTAgPSB0aGlzWzNdO1xuICAgICAgICBjb25zdCB0MTEgPSB0aGlzWzRdO1xuICAgICAgICBjb25zdCB0MTIgPSB0aGlzWzVdO1xuICAgICAgICBjb25zdCB0MjAgPSB0aGlzWzZdO1xuICAgICAgICBjb25zdCB0MjEgPSB0aGlzWzddO1xuICAgICAgICBjb25zdCB0MjIgPSB0aGlzWzhdO1xuICAgICAgICBkZXN0WzBdID0gdDAwO1xuICAgICAgICBkZXN0WzFdID0gdDEwO1xuICAgICAgICBkZXN0WzJdID0gdDIwO1xuICAgICAgICBkZXN0WzNdID0gdDAxO1xuICAgICAgICBkZXN0WzRdID0gdDExO1xuICAgICAgICBkZXN0WzVdID0gdDIxO1xuICAgICAgICBkZXN0WzZdID0gdDAyO1xuICAgICAgICBkZXN0WzddID0gdDEyO1xuICAgICAgICBkZXN0WzhdID0gdDIyO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgaW52ZXJ0KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdjAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgdjAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgdjAyID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgdjEwID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgdjExID0gdGhpc1s0XTtcbiAgICAgICAgY29uc3QgdjEyID0gdGhpc1s1XTtcbiAgICAgICAgY29uc3QgdjIwID0gdGhpc1s2XTtcbiAgICAgICAgY29uc3QgdjIxID0gdGhpc1s3XTtcbiAgICAgICAgY29uc3QgdjIyID0gdGhpc1s4XTtcbiAgICAgICAgY29uc3QgZGV0MDEgPSB2MjIgKiB2MTEgLSB2MTIgKiB2MjE7XG4gICAgICAgIGNvbnN0IGRldDExID0gLXYyMiAqIHYxMCArIHYxMiAqIHYyMDtcbiAgICAgICAgY29uc3QgZGV0MjEgPSB2MjEgKiB2MTAgLSB2MTEgKiB2MjA7XG4gICAgICAgIGxldCBkZXQgPSB2MDAgKiBkZXQwMSArIHYwMSAqIGRldDExICsgdjAyICogZGV0MjE7XG4gICAgICAgIGlmIChkZXQgPT09IDAuMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNYXRyaXggaXMgbm90IGludmVydGlibGUnKTtcbiAgICAgICAgfVxuICAgICAgICBkZXQgPSAxLjAgLyBkZXQ7XG4gICAgICAgIGRlc3RbMF0gPSBkZXQwMSAqIGRldDtcbiAgICAgICAgZGVzdFsxXSA9ICgtdjIyICogdjAxICsgdjAyICogdjIxKSAqIGRldDtcbiAgICAgICAgZGVzdFsyXSA9ICh2MTIgKiB2MDEgLSB2MDIgKiB2MTEpICogZGV0O1xuICAgICAgICBkZXN0WzNdID0gZGV0MTEgKiBkZXQ7XG4gICAgICAgIGRlc3RbNF0gPSAodjIyICogdjAwIC0gdjAyICogdjIwKSAqIGRldDtcbiAgICAgICAgZGVzdFs1XSA9ICgtdjEyICogdjAwICsgdjAyICogdjEwKSAqIGRldDtcbiAgICAgICAgZGVzdFs2XSA9IGRldDIxICogZGV0O1xuICAgICAgICBkZXN0WzddID0gKC12MjEgKiB2MDAgKyB2MDEgKiB2MjApICogZGV0O1xuICAgICAgICBkZXN0WzhdID0gKHYxMSAqIHYwMCAtIHYwMSAqIHYxMCkgKiBkZXQ7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBtdWx0aXBseShvdGhlciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhMDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCBhMDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCBhMDIgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCBhMTAgPSB0aGlzWzNdO1xuICAgICAgICBjb25zdCBhMTEgPSB0aGlzWzRdO1xuICAgICAgICBjb25zdCBhMTIgPSB0aGlzWzVdO1xuICAgICAgICBjb25zdCBhMjAgPSB0aGlzWzZdO1xuICAgICAgICBjb25zdCBhMjEgPSB0aGlzWzddO1xuICAgICAgICBjb25zdCBhMjIgPSB0aGlzWzhdO1xuICAgICAgICBjb25zdCBiMDAgPSBvdGhlclswXTtcbiAgICAgICAgY29uc3QgYjAxID0gb3RoZXJbMV07XG4gICAgICAgIGNvbnN0IGIwMiA9IG90aGVyWzJdO1xuICAgICAgICBjb25zdCBiMTAgPSBvdGhlclszXTtcbiAgICAgICAgY29uc3QgYjExID0gb3RoZXJbNF07XG4gICAgICAgIGNvbnN0IGIxMiA9IG90aGVyWzVdO1xuICAgICAgICBjb25zdCBiMjAgPSBvdGhlcls2XTtcbiAgICAgICAgY29uc3QgYjIxID0gb3RoZXJbN107XG4gICAgICAgIGNvbnN0IGIyMiA9IG90aGVyWzhdO1xuICAgICAgICBkZXN0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwO1xuICAgICAgICBkZXN0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICAgICAgICBkZXN0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyO1xuICAgICAgICBkZXN0WzNdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwO1xuICAgICAgICBkZXN0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICAgICAgICBkZXN0WzVdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyO1xuICAgICAgICBkZXN0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICAgICAgICBkZXN0WzddID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxO1xuICAgICAgICBkZXN0WzhdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdHJhbnNmb3JtKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHgsIHksIHogfSA9IHZlY3RvcjtcbiAgICAgICAgZGVzdC54ID0geCAqIHRoaXNbMF0gKyB5ICogdGhpc1szXSArIHogKiB0aGlzWzZdO1xuICAgICAgICBkZXN0LnkgPSB4ICogdGhpc1sxXSArIHkgKiB0aGlzWzRdICsgeiAqIHRoaXNbN107XG4gICAgICAgIGRlc3QueiA9IHggKiB0aGlzWzJdICsgeSAqIHRoaXNbNV0gKyB6ICogdGhpc1s4XTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHJvdGF0ZShhbmdsZSwgYXhpcywgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBsZXQgeyB4LCB5LCB6IH0gPSBheGlzO1xuICAgICAgICBsZXQgbGVuZ3RoID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gICAgICAgIGlmICghbGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICBsZW5ndGggPSAxIC8gbGVuZ3RoO1xuICAgICAgICAgICAgeCAqPSBsZW5ndGg7XG4gICAgICAgICAgICB5ICo9IGxlbmd0aDtcbiAgICAgICAgICAgIHogKj0gbGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHMgPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgIGNvbnN0IGMgPSBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgIGNvbnN0IHQgPSAxLjAgLSBjO1xuICAgICAgICBjb25zdCBhMDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCBhMDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCBhMDIgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCBhMTAgPSB0aGlzWzNdO1xuICAgICAgICBjb25zdCBhMTEgPSB0aGlzWzRdO1xuICAgICAgICBjb25zdCBhMTIgPSB0aGlzWzVdO1xuICAgICAgICBjb25zdCBhMjAgPSB0aGlzWzZdO1xuICAgICAgICBjb25zdCBhMjEgPSB0aGlzWzddO1xuICAgICAgICBjb25zdCBhMjIgPSB0aGlzWzhdO1xuICAgICAgICBjb25zdCBiMDAgPSB4ICogeCAqIHQgKyBjO1xuICAgICAgICBjb25zdCBiMDEgPSB5ICogeCAqIHQgKyB6ICogcztcbiAgICAgICAgY29uc3QgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gICAgICAgIGNvbnN0IGIxMCA9IHggKiB5ICogdCAtIHogKiBzO1xuICAgICAgICBjb25zdCBiMTEgPSB5ICogeSAqIHQgKyBjO1xuICAgICAgICBjb25zdCBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgICAgICAgY29uc3QgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7XG4gICAgICAgIGNvbnN0IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzO1xuICAgICAgICBjb25zdCBiMjIgPSB6ICogeiAqIHQgKyBjO1xuICAgICAgICBkZXN0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xuICAgICAgICBkZXN0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgICAgICBkZXN0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyO1xuICAgICAgICBkZXN0WzNdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgICAgICBkZXN0WzRdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyO1xuICAgICAgICBkZXN0WzVdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xuICAgICAgICBkZXN0WzZdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyO1xuICAgICAgICBkZXN0WzddID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xuICAgICAgICBkZXN0WzhdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdG9NYXQ0KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC5zZXQoW1xuICAgICAgICAgICAgdGhpc1swXSxcbiAgICAgICAgICAgIHRoaXNbMV0sXG4gICAgICAgICAgICB0aGlzWzJdLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgdGhpc1szXSxcbiAgICAgICAgICAgIHRoaXNbNF0sXG4gICAgICAgICAgICB0aGlzWzVdLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgdGhpc1s2XSxcbiAgICAgICAgICAgIHRoaXNbN10sXG4gICAgICAgICAgICB0aGlzWzhdLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMS4wXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdG9RdWF0KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBxdWF0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdjAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgdjAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgdjAyID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgdjEwID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgdjExID0gdGhpc1s0XTtcbiAgICAgICAgY29uc3QgdjEyID0gdGhpc1s1XTtcbiAgICAgICAgY29uc3QgdjIwID0gdGhpc1s2XTtcbiAgICAgICAgY29uc3QgdjIxID0gdGhpc1s3XTtcbiAgICAgICAgY29uc3QgdjIyID0gdGhpc1s4XTtcbiAgICAgICAgY29uc3QgeCA9IHYwMCAtIHYxMSAtIHYyMjtcbiAgICAgICAgY29uc3QgeSA9IHYxMSAtIHYwMCAtIHYyMjtcbiAgICAgICAgY29uc3QgeiA9IHYyMiAtIHYwMCAtIHYxMTtcbiAgICAgICAgY29uc3QgdyA9IHYwMCArIHYxMSArIHYyMjtcbiAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICBsZXQgZiA9IHc7XG4gICAgICAgIGlmICh4ID4gZikge1xuICAgICAgICAgICAgZiA9IHg7XG4gICAgICAgICAgICBpID0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoeSA+IGYpIHtcbiAgICAgICAgICAgIGYgPSB5O1xuICAgICAgICAgICAgaSA9IDI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHogPiBmKSB7XG4gICAgICAgICAgICBmID0gejtcbiAgICAgICAgICAgIGkgPSAzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGIgPSBNYXRoLnNxcnQoZiArIDEpICogMC41O1xuICAgICAgICBjb25zdCBtID0gMC4yNSAvIGI7XG4gICAgICAgIHN3aXRjaCAoaSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGRlc3QudyA9IGI7XG4gICAgICAgICAgICAgICAgZGVzdC54ID0gKHYxMiAtIHYyMSkgKiBtO1xuICAgICAgICAgICAgICAgIGRlc3QueSA9ICh2MjAgLSB2MDIpICogbTtcbiAgICAgICAgICAgICAgICBkZXN0LnogPSAodjAxIC0gdjEwKSAqIG07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgZGVzdC53ID0gKHYxMiAtIHYyMSkgKiBtO1xuICAgICAgICAgICAgICAgIGRlc3QueCA9IGI7XG4gICAgICAgICAgICAgICAgZGVzdC55ID0gKHYwMSArIHYxMCkgKiBtO1xuICAgICAgICAgICAgICAgIGRlc3QueiA9ICh2MjAgKyB2MDIpICogbTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBkZXN0LncgPSAodjIwIC0gdjAyKSAqIG07XG4gICAgICAgICAgICAgICAgZGVzdC54ID0gKHYwMSArIHYxMCkgKiBtO1xuICAgICAgICAgICAgICAgIGRlc3QueSA9IGI7XG4gICAgICAgICAgICAgICAgZGVzdC56ID0gKHYxMiArIHYyMSkgKiBtO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIGRlc3QudyA9ICh2MDEgLSB2MTApICogbTtcbiAgICAgICAgICAgICAgICBkZXN0LnggPSAodjIwICsgdjAyKSAqIG07XG4gICAgICAgICAgICAgICAgZGVzdC55ID0gKHYxMiArIHYyMSkgKiBtO1xuICAgICAgICAgICAgICAgIGRlc3QueiA9IGI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZSh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBtYXQzKHZhbHVlcyk7XG4gICAgfVxuICAgIHN0YXRpYyB0cmFuc2Zvcm0obWF0cml4LCB2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB4LCB5LCB6IH0gPSB2ZWN0b3I7XG4gICAgICAgIGRlc3QueCA9IHggKiBtYXRyaXhbMF0gKyB5ICogbWF0cml4WzNdICsgeiAqIG1hdHJpeFs2XTtcbiAgICAgICAgZGVzdC55ID0geCAqIG1hdHJpeFsxXSArIHkgKiBtYXRyaXhbNF0gKyB6ICogbWF0cml4WzddO1xuICAgICAgICBkZXN0LnogPSB4ICogbWF0cml4WzJdICsgeSAqIG1hdHJpeFs1XSArIHogKiBtYXRyaXhbOF07XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbXVsdGlwbHkobTEsIG0yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgbWF0MygpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGEwMCA9IG0xWzBdO1xuICAgICAgICBjb25zdCBhMDEgPSBtMVsxXTtcbiAgICAgICAgY29uc3QgYTAyID0gbTFbMl07XG4gICAgICAgIGNvbnN0IGExMCA9IG0xWzNdO1xuICAgICAgICBjb25zdCBhMTEgPSBtMVs0XTtcbiAgICAgICAgY29uc3QgYTEyID0gbTFbNV07XG4gICAgICAgIGNvbnN0IGEyMCA9IG0xWzZdO1xuICAgICAgICBjb25zdCBhMjEgPSBtMVs3XTtcbiAgICAgICAgY29uc3QgYTIyID0gbTFbOF07XG4gICAgICAgIGNvbnN0IGIwMCA9IG0yWzBdO1xuICAgICAgICBjb25zdCBiMDEgPSBtMlsxXTtcbiAgICAgICAgY29uc3QgYjAyID0gbTJbMl07XG4gICAgICAgIGNvbnN0IGIxMCA9IG0yWzNdO1xuICAgICAgICBjb25zdCBiMTEgPSBtMls0XTtcbiAgICAgICAgY29uc3QgYjEyID0gbTJbNV07XG4gICAgICAgIGNvbnN0IGIyMCA9IG0yWzZdO1xuICAgICAgICBjb25zdCBiMjEgPSBtMls3XTtcbiAgICAgICAgY29uc3QgYjIyID0gbTJbOF07XG4gICAgICAgIGRlc3Quc2V0KFtcbiAgICAgICAgICAgIGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMCxcbiAgICAgICAgICAgIGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMSxcbiAgICAgICAgICAgIGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMixcbiAgICAgICAgICAgIGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCxcbiAgICAgICAgICAgIGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMSxcbiAgICAgICAgICAgIGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMixcbiAgICAgICAgICAgIGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMCxcbiAgICAgICAgICAgIGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMSxcbiAgICAgICAgICAgIGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMlxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBsb29rQXQoZXllLCB0YXJnZXQsIHVwID0gdmVjMy51cCwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXllLmVxdWFscyh0YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZGVudGl0eS5jb3B5KGRlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHogPSB2ZWMzLnN1YnRyYWN0KGV5ZSwgdGFyZ2V0KS5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgeCA9IHZlYzMuY3Jvc3ModXAsIHopLm5vcm1hbGl6ZSgpO1xuICAgICAgICBjb25zdCB5ID0gdmVjMy5jcm9zcyh6LCB4KS5ub3JtYWxpemUoKTtcbiAgICAgICAgZGVzdC5zZXQoW3gueCwgeC55LCB4LnosIHkueCwgeS55LCB5LnosIHoueCwgei55LCB6LnpdKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRXBzaWxvbiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IG1hdDMgfSBmcm9tICcuL21hdDMnO1xuaW1wb3J0IHsgdmVjMyB9IGZyb20gJy4vdmVjMyc7XG5pbXBvcnQgeyB2ZWM0IH0gZnJvbSAnLi92ZWM0JztcbmV4cG9ydCBjbGFzcyBtYXQ0IGV4dGVuZHMgRmxvYXQzMkFycmF5IHtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMgPSBbMS4wLCAwLjAsIDAuMCwgMC4wLCAwLjAsIDEuMCwgMC4wLCAwLjAsIDAuMCwgMC4wLCAxLjAsIDAuMCwgMC4wLCAwLjAsIDAuMCwgMS4wXSkge1xuICAgICAgICBzdXBlcih2YWx1ZXMuc2xpY2UoMCwgMTYpKTtcbiAgICB9XG4gICAgc3RhdGljIGlkZW50aXR5ID0gbmV3IG1hdDQoKTtcbiAgICBnZXQgZGV0ZXJtaW5hbnQoKSB7XG4gICAgICAgIGNvbnN0IHYwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IHYwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IHYwMiA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IHYwMyA9IHRoaXNbM107XG4gICAgICAgIGNvbnN0IHYxMCA9IHRoaXNbNF07XG4gICAgICAgIGNvbnN0IHYxMSA9IHRoaXNbNV07XG4gICAgICAgIGNvbnN0IHYxMiA9IHRoaXNbNl07XG4gICAgICAgIGNvbnN0IHYxMyA9IHRoaXNbN107XG4gICAgICAgIGNvbnN0IHYyMCA9IHRoaXNbOF07XG4gICAgICAgIGNvbnN0IHYyMSA9IHRoaXNbOV07XG4gICAgICAgIGNvbnN0IHYyMiA9IHRoaXNbMTBdO1xuICAgICAgICBjb25zdCB2MjMgPSB0aGlzWzExXTtcbiAgICAgICAgY29uc3QgdjMwID0gdGhpc1sxMl07XG4gICAgICAgIGNvbnN0IHYzMSA9IHRoaXNbMTNdO1xuICAgICAgICBjb25zdCB2MzIgPSB0aGlzWzE0XTtcbiAgICAgICAgY29uc3QgdjMzID0gdGhpc1sxNV07XG4gICAgICAgIGNvbnN0IGRldDAwID0gdjAwICogdjExIC0gdjAxICogdjEwO1xuICAgICAgICBjb25zdCBkZXQwMSA9IHYwMCAqIHYxMiAtIHYwMiAqIHYxMDtcbiAgICAgICAgY29uc3QgZGV0MDIgPSB2MDAgKiB2MTMgLSB2MDMgKiB2MTA7XG4gICAgICAgIGNvbnN0IGRldDAzID0gdjAxICogdjEyIC0gdjAyICogdjExO1xuICAgICAgICBjb25zdCBkZXQwNCA9IHYwMSAqIHYxMyAtIHYwMyAqIHYxMTtcbiAgICAgICAgY29uc3QgZGV0MDUgPSB2MDIgKiB2MTMgLSB2MDMgKiB2MTI7XG4gICAgICAgIGNvbnN0IGRldDA2ID0gdjIwICogdjMxIC0gdjIxICogdjMwO1xuICAgICAgICBjb25zdCBkZXQwNyA9IHYyMCAqIHYzMiAtIHYyMiAqIHYzMDtcbiAgICAgICAgY29uc3QgZGV0MDggPSB2MjAgKiB2MzMgLSB2MjMgKiB2MzA7XG4gICAgICAgIGNvbnN0IGRldDA5ID0gdjIxICogdjMyIC0gdjIyICogdjMxO1xuICAgICAgICBjb25zdCBkZXQxMCA9IHYyMSAqIHYzMyAtIHYyMyAqIHYzMTtcbiAgICAgICAgY29uc3QgZGV0MTEgPSB2MjIgKiB2MzMgLSB2MjMgKiB2MzI7XG4gICAgICAgIHJldHVybiBkZXQwMCAqIGRldDExIC0gZGV0MDEgKiBkZXQxMCArIGRldDAyICogZGV0MDkgKyBkZXQwMyAqIGRldDA4IC0gZGV0MDQgKiBkZXQwNyArIGRldDA1ICogZGV0MDY7XG4gICAgfVxuICAgIGNvcHkoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDQoKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgICAgIGRlc3RbaV0gPSB0aGlzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBjb2x1bW4oaW5kZXgsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpc1tpbmRleF07XG4gICAgICAgIGRlc3QueSA9IHRoaXNbaW5kZXggKyA0XTtcbiAgICAgICAgZGVzdC56ID0gdGhpc1tpbmRleCArIDhdO1xuICAgICAgICBkZXN0LncgPSB0aGlzW2luZGV4ICsgMTJdO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgZXF1YWxzKG90aGVyLCB0aHJlc2hvbGQgPSBFcHNpbG9uKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKykge1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRoaXNbaV0gLSBvdGhlcltpXSkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzWzBdID0gMS4wO1xuICAgICAgICB0aGlzWzFdID0gMC4wO1xuICAgICAgICB0aGlzWzJdID0gMC4wO1xuICAgICAgICB0aGlzWzNdID0gMC4wO1xuICAgICAgICB0aGlzWzRdID0gMC4wO1xuICAgICAgICB0aGlzWzVdID0gMS4wO1xuICAgICAgICB0aGlzWzZdID0gMC4wO1xuICAgICAgICB0aGlzWzddID0gMC4wO1xuICAgICAgICB0aGlzWzhdID0gMC4wO1xuICAgICAgICB0aGlzWzldID0gMC4wO1xuICAgICAgICB0aGlzWzEwXSA9IDEuMDtcbiAgICAgICAgdGhpc1sxMV0gPSAwLjA7XG4gICAgICAgIHRoaXNbMTJdID0gMC4wO1xuICAgICAgICB0aGlzWzEzXSA9IDAuMDtcbiAgICAgICAgdGhpc1sxNF0gPSAwLjA7XG4gICAgICAgIHRoaXNbMTVdID0gMS4wO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdHJhbnNwb3NlKGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdDAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgdDAyID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgdDAzID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgdDEyID0gdGhpc1s2XTtcbiAgICAgICAgY29uc3QgdDEzID0gdGhpc1s3XTtcbiAgICAgICAgY29uc3QgdDIzID0gdGhpc1sxMV07XG4gICAgICAgIGRlc3RbMV0gPSB0aGlzWzRdO1xuICAgICAgICBkZXN0WzJdID0gdGhpc1s4XTtcbiAgICAgICAgZGVzdFszXSA9IHRoaXNbMTJdO1xuICAgICAgICBkZXN0WzRdID0gdDAxO1xuICAgICAgICBkZXN0WzZdID0gdGhpc1s5XTtcbiAgICAgICAgZGVzdFs3XSA9IHRoaXNbMTNdO1xuICAgICAgICBkZXN0WzhdID0gdDAyO1xuICAgICAgICBkZXN0WzldID0gdDEyO1xuICAgICAgICBkZXN0WzExXSA9IHRoaXNbMTRdO1xuICAgICAgICBkZXN0WzEyXSA9IHQwMztcbiAgICAgICAgZGVzdFsxM10gPSB0MTM7XG4gICAgICAgIGRlc3RbMTRdID0gdDIzO1xuICAgICAgICBpZiAoZGVzdCAhPT0gdGhpcykge1xuICAgICAgICAgICAgZGVzdFswXSA9IHRoaXNbMF07XG4gICAgICAgICAgICBkZXN0WzVdID0gdGhpc1s1XTtcbiAgICAgICAgICAgIGRlc3RbMTBdID0gdGhpc1sxMF07XG4gICAgICAgICAgICBkZXN0WzE1XSA9IHRoaXNbMTVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBpbnZlcnQoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2MDAgPSB0aGlzWzBdO1xuICAgICAgICBjb25zdCB2MDEgPSB0aGlzWzFdO1xuICAgICAgICBjb25zdCB2MDIgPSB0aGlzWzJdO1xuICAgICAgICBjb25zdCB2MDMgPSB0aGlzWzNdO1xuICAgICAgICBjb25zdCB2MTAgPSB0aGlzWzRdO1xuICAgICAgICBjb25zdCB2MTEgPSB0aGlzWzVdO1xuICAgICAgICBjb25zdCB2MTIgPSB0aGlzWzZdO1xuICAgICAgICBjb25zdCB2MTMgPSB0aGlzWzddO1xuICAgICAgICBjb25zdCB2MjAgPSB0aGlzWzhdO1xuICAgICAgICBjb25zdCB2MjEgPSB0aGlzWzldO1xuICAgICAgICBjb25zdCB2MjIgPSB0aGlzWzEwXTtcbiAgICAgICAgY29uc3QgdjIzID0gdGhpc1sxMV07XG4gICAgICAgIGNvbnN0IHYzMCA9IHRoaXNbMTJdO1xuICAgICAgICBjb25zdCB2MzEgPSB0aGlzWzEzXTtcbiAgICAgICAgY29uc3QgdjMyID0gdGhpc1sxNF07XG4gICAgICAgIGNvbnN0IHYzMyA9IHRoaXNbMTVdO1xuICAgICAgICBjb25zdCBkMDAgPSB2MDAgKiB2MTEgLSB2MDEgKiB2MTA7XG4gICAgICAgIGNvbnN0IGQwMSA9IHYwMCAqIHYxMiAtIHYwMiAqIHYxMDtcbiAgICAgICAgY29uc3QgZDAyID0gdjAwICogdjEzIC0gdjAzICogdjEwO1xuICAgICAgICBjb25zdCBkMDMgPSB2MDEgKiB2MTIgLSB2MDIgKiB2MTE7XG4gICAgICAgIGNvbnN0IGQwNCA9IHYwMSAqIHYxMyAtIHYwMyAqIHYxMTtcbiAgICAgICAgY29uc3QgZDA1ID0gdjAyICogdjEzIC0gdjAzICogdjEyO1xuICAgICAgICBjb25zdCBkMDYgPSB2MjAgKiB2MzEgLSB2MjEgKiB2MzA7XG4gICAgICAgIGNvbnN0IGQwNyA9IHYyMCAqIHYzMiAtIHYyMiAqIHYzMDtcbiAgICAgICAgY29uc3QgZDA4ID0gdjIwICogdjMzIC0gdjIzICogdjMwO1xuICAgICAgICBjb25zdCBkMDkgPSB2MjEgKiB2MzIgLSB2MjIgKiB2MzE7XG4gICAgICAgIGNvbnN0IGQxMCA9IHYyMSAqIHYzMyAtIHYyMyAqIHYzMTtcbiAgICAgICAgY29uc3QgZDExID0gdjIyICogdjMzIC0gdjIzICogdjMyO1xuICAgICAgICBsZXQgZCA9IGQwMCAqIGQxMSAtIGQwMSAqIGQxMCArIGQwMiAqIGQwOSArIGQwMyAqIGQwOCAtIGQwNCAqIGQwNyArIGQwNSAqIGQwNjtcbiAgICAgICAgaWYgKGQgPT09IDAuMCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgICAgIH1cbiAgICAgICAgZCA9IDEuMCAvIGQ7XG4gICAgICAgIGRlc3RbMF0gPSAodjExICogZDExIC0gdjEyICogZDEwICsgdjEzICogZDA5KSAqIGQ7XG4gICAgICAgIGRlc3RbMV0gPSAoLXYwMSAqIGQxMSArIHYwMiAqIGQxMCAtIHYwMyAqIGQwOSkgKiBkO1xuICAgICAgICBkZXN0WzJdID0gKHYzMSAqIGQwNSAtIHYzMiAqIGQwNCArIHYzMyAqIGQwMykgKiBkO1xuICAgICAgICBkZXN0WzNdID0gKC12MjEgKiBkMDUgKyB2MjIgKiBkMDQgLSB2MjMgKiBkMDMpICogZDtcbiAgICAgICAgZGVzdFs0XSA9ICgtdjEwICogZDExICsgdjEyICogZDA4IC0gdjEzICogZDA3KSAqIGQ7XG4gICAgICAgIGRlc3RbNV0gPSAodjAwICogZDExIC0gdjAyICogZDA4ICsgdjAzICogZDA3KSAqIGQ7XG4gICAgICAgIGRlc3RbNl0gPSAoLXYzMCAqIGQwNSArIHYzMiAqIGQwMiAtIHYzMyAqIGQwMSkgKiBkO1xuICAgICAgICBkZXN0WzddID0gKHYyMCAqIGQwNSAtIHYyMiAqIGQwMiArIHYyMyAqIGQwMSkgKiBkO1xuICAgICAgICBkZXN0WzhdID0gKHYxMCAqIGQxMCAtIHYxMSAqIGQwOCArIHYxMyAqIGQwNikgKiBkO1xuICAgICAgICBkZXN0WzldID0gKC12MDAgKiBkMTAgKyB2MDEgKiBkMDggLSB2MDMgKiBkMDYpICogZDtcbiAgICAgICAgZGVzdFsxMF0gPSAodjMwICogZDA0IC0gdjMxICogZDAyICsgdjMzICogZDAwKSAqIGQ7XG4gICAgICAgIGRlc3RbMTFdID0gKC12MjAgKiBkMDQgKyB2MjEgKiBkMDIgLSB2MjMgKiBkMDApICogZDtcbiAgICAgICAgZGVzdFsxMl0gPSAoLXYxMCAqIGQwOSArIHYxMSAqIGQwNyAtIHYxMiAqIGQwNikgKiBkO1xuICAgICAgICBkZXN0WzEzXSA9ICh2MDAgKiBkMDkgLSB2MDEgKiBkMDcgKyB2MDIgKiBkMDYpICogZDtcbiAgICAgICAgZGVzdFsxNF0gPSAoLXYzMCAqIGQwMyArIHYzMSAqIGQwMSAtIHYzMiAqIGQwMCkgKiBkO1xuICAgICAgICBkZXN0WzE1XSA9ICh2MjAgKiBkMDMgLSB2MjEgKiBkMDEgKyB2MjIgKiBkMDApICogZDtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIG11bHRpcGx5KG90aGVyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGEwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IGEwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IGEwMiA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IGEwMyA9IHRoaXNbM107XG4gICAgICAgIGNvbnN0IGExMCA9IHRoaXNbNF07XG4gICAgICAgIGNvbnN0IGExMSA9IHRoaXNbNV07XG4gICAgICAgIGNvbnN0IGExMiA9IHRoaXNbNl07XG4gICAgICAgIGNvbnN0IGExMyA9IHRoaXNbN107XG4gICAgICAgIGNvbnN0IGEyMCA9IHRoaXNbOF07XG4gICAgICAgIGNvbnN0IGEyMSA9IHRoaXNbOV07XG4gICAgICAgIGNvbnN0IGEyMiA9IHRoaXNbMTBdO1xuICAgICAgICBjb25zdCBhMjMgPSB0aGlzWzExXTtcbiAgICAgICAgY29uc3QgYTMwID0gdGhpc1sxMl07XG4gICAgICAgIGNvbnN0IGEzMSA9IHRoaXNbMTNdO1xuICAgICAgICBjb25zdCBhMzIgPSB0aGlzWzE0XTtcbiAgICAgICAgY29uc3QgYTMzID0gdGhpc1sxNV07XG4gICAgICAgIGNvbnN0IGIwMCA9IG90aGVyWzBdO1xuICAgICAgICBjb25zdCBiMDEgPSBvdGhlclsxXTtcbiAgICAgICAgY29uc3QgYjAyID0gb3RoZXJbMl07XG4gICAgICAgIGNvbnN0IGIwMyA9IG90aGVyWzNdO1xuICAgICAgICBjb25zdCBiMTAgPSBvdGhlcls0XTtcbiAgICAgICAgY29uc3QgYjExID0gb3RoZXJbNV07XG4gICAgICAgIGNvbnN0IGIxMiA9IG90aGVyWzZdO1xuICAgICAgICBjb25zdCBiMTMgPSBvdGhlcls3XTtcbiAgICAgICAgY29uc3QgYjIwID0gb3RoZXJbOF07XG4gICAgICAgIGNvbnN0IGIyMSA9IG90aGVyWzldO1xuICAgICAgICBjb25zdCBiMjIgPSBvdGhlclsxMF07XG4gICAgICAgIGNvbnN0IGIyMyA9IG90aGVyWzExXTtcbiAgICAgICAgY29uc3QgYjMwID0gb3RoZXJbMTJdO1xuICAgICAgICBjb25zdCBiMzEgPSBvdGhlclsxM107XG4gICAgICAgIGNvbnN0IGIzMiA9IG90aGVyWzE0XTtcbiAgICAgICAgY29uc3QgYjMzID0gb3RoZXJbMTVdO1xuICAgICAgICBkZXN0WzBdID0gYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwICsgYjAzICogYTMwO1xuICAgICAgICBkZXN0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxICsgYjAzICogYTMxO1xuICAgICAgICBkZXN0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyICsgYjAzICogYTMyO1xuICAgICAgICBkZXN0WzNdID0gYjAwICogYTAzICsgYjAxICogYTEzICsgYjAyICogYTIzICsgYjAzICogYTMzO1xuICAgICAgICBkZXN0WzRdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwICsgYjEzICogYTMwO1xuICAgICAgICBkZXN0WzVdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxICsgYjEzICogYTMxO1xuICAgICAgICBkZXN0WzZdID0gYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyICsgYjEzICogYTMyO1xuICAgICAgICBkZXN0WzddID0gYjEwICogYTAzICsgYjExICogYTEzICsgYjEyICogYTIzICsgYjEzICogYTMzO1xuICAgICAgICBkZXN0WzhdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwICsgYjIzICogYTMwO1xuICAgICAgICBkZXN0WzldID0gYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxICsgYjIzICogYTMxO1xuICAgICAgICBkZXN0WzEwXSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMiArIGIyMyAqIGEzMjtcbiAgICAgICAgZGVzdFsxMV0gPSBiMjAgKiBhMDMgKyBiMjEgKiBhMTMgKyBiMjIgKiBhMjMgKyBiMjMgKiBhMzM7XG4gICAgICAgIGRlc3RbMTJdID0gYjMwICogYTAwICsgYjMxICogYTEwICsgYjMyICogYTIwICsgYjMzICogYTMwO1xuICAgICAgICBkZXN0WzEzXSA9IGIzMCAqIGEwMSArIGIzMSAqIGExMSArIGIzMiAqIGEyMSArIGIzMyAqIGEzMTtcbiAgICAgICAgZGVzdFsxNF0gPSBiMzAgKiBhMDIgKyBiMzEgKiBhMTIgKyBiMzIgKiBhMjIgKyBiMzMgKiBhMzI7XG4gICAgICAgIGRlc3RbMTVdID0gYjMwICogYTAzICsgYjMxICogYTEzICsgYjMyICogYTIzICsgYjMzICogYTMzO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdHJhbnNmb3JtKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHZlY3RvcjtcbiAgICAgICAgZGVzdC54ID0gdGhpc1swXSAqIHggKyB0aGlzWzRdICogeSArIHRoaXNbOF0gKiB6ICsgdGhpc1sxMl0gKiB3O1xuICAgICAgICBkZXN0LnkgPSB0aGlzWzFdICogeCArIHRoaXNbNV0gKiB5ICsgdGhpc1s5XSAqIHogKyB0aGlzWzEzXSAqIHc7XG4gICAgICAgIGRlc3QueiA9IHRoaXNbMl0gKiB4ICsgdGhpc1s2XSAqIHkgKyB0aGlzWzEwXSAqIHogKyB0aGlzWzE0XSAqIHc7XG4gICAgICAgIGRlc3QudyA9IHRoaXNbM10gKiB4ICsgdGhpc1s3XSAqIHkgKyB0aGlzWzExXSAqIHogKyB0aGlzWzE1XSAqIHc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICB0cmFuc2Zvcm1WZWMzKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHgsIHksIHogfSA9IHZlY3RvcjtcbiAgICAgICAgZGVzdC54ID0gdGhpc1swXSAqIHggKyB0aGlzWzRdICogeSArIHRoaXNbOF0gKiB6ICsgdGhpc1sxMl07XG4gICAgICAgIGRlc3QueSA9IHRoaXNbMV0gKiB4ICsgdGhpc1s1XSAqIHkgKyB0aGlzWzldICogeiArIHRoaXNbMTNdO1xuICAgICAgICBkZXN0LnogPSB0aGlzWzJdICogeCArIHRoaXNbNl0gKiB5ICsgdGhpc1sxMF0gKiB6ICsgdGhpc1sxNF07XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICB0b01hdDMoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDMoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnNldChbdGhpc1swXSwgdGhpc1sxXSwgdGhpc1syXSwgdGhpc1s0XSwgdGhpc1s1XSwgdGhpc1s2XSwgdGhpc1s4XSwgdGhpc1s5XSwgdGhpc1sxMF1dKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHNjYWxlKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHgsIHksIHogfSA9IHZlY3RvcjtcbiAgICAgICAgZGVzdFswXSA9IHRoaXNbMF0gKiB4O1xuICAgICAgICBkZXN0WzFdID0gdGhpc1sxXSAqIHg7XG4gICAgICAgIGRlc3RbMl0gPSB0aGlzWzJdICogeDtcbiAgICAgICAgZGVzdFszXSA9IHRoaXNbM10gKiB4O1xuICAgICAgICBkZXN0WzRdID0gdGhpc1s0XSAqIHk7XG4gICAgICAgIGRlc3RbNV0gPSB0aGlzWzVdICogeTtcbiAgICAgICAgZGVzdFs2XSA9IHRoaXNbNl0gKiB5O1xuICAgICAgICBkZXN0WzddID0gdGhpc1s3XSAqIHk7XG4gICAgICAgIGRlc3RbOF0gPSB0aGlzWzhdICogejtcbiAgICAgICAgZGVzdFs5XSA9IHRoaXNbOV0gKiB6O1xuICAgICAgICBkZXN0WzEwXSA9IHRoaXNbMTBdICogejtcbiAgICAgICAgZGVzdFsxMV0gPSB0aGlzWzExXSAqIHo7XG4gICAgICAgIGlmIChkZXN0ICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBkZXN0WzEyXSA9IHRoaXNbMTJdO1xuICAgICAgICAgICAgZGVzdFsxM10gPSB0aGlzWzEzXTtcbiAgICAgICAgICAgIGRlc3RbMTRdID0gdGhpc1sxNF07XG4gICAgICAgICAgICBkZXN0WzE1XSA9IHRoaXNbMTVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICByb3RhdGUoYW5nbGUsIGF4aXMsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHsgeCwgeSwgeiB9ID0gYXhpcztcbiAgICAgICAgbGV0IGxlbmd0aCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xuICAgICAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgbGVuZ3RoID0gMSAvIGxlbmd0aDtcbiAgICAgICAgICAgIHggKj0gbGVuZ3RoO1xuICAgICAgICAgICAgeSAqPSBsZW5ndGg7XG4gICAgICAgICAgICB6ICo9IGxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzID0gTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICBjb25zdCBjID0gTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBjb25zdCB0ID0gMS4wIC0gYztcbiAgICAgICAgY29uc3QgYTAwID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgYTAxID0gdGhpc1sxXTtcbiAgICAgICAgY29uc3QgYTAyID0gdGhpc1syXTtcbiAgICAgICAgY29uc3QgYTAzID0gdGhpc1szXTtcbiAgICAgICAgY29uc3QgYTEwID0gdGhpc1s0XTtcbiAgICAgICAgY29uc3QgYTExID0gdGhpc1s1XTtcbiAgICAgICAgY29uc3QgYTEyID0gdGhpc1s2XTtcbiAgICAgICAgY29uc3QgYTEzID0gdGhpc1s3XTtcbiAgICAgICAgY29uc3QgYTIwID0gdGhpc1s4XTtcbiAgICAgICAgY29uc3QgYTIxID0gdGhpc1s5XTtcbiAgICAgICAgY29uc3QgYTIyID0gdGhpc1sxMF07XG4gICAgICAgIGNvbnN0IGEyMyA9IHRoaXNbMTFdO1xuICAgICAgICBjb25zdCBiMDAgPSB4ICogeCAqIHQgKyBjO1xuICAgICAgICBjb25zdCBiMDEgPSB5ICogeCAqIHQgKyB6ICogcztcbiAgICAgICAgY29uc3QgYjAyID0geiAqIHggKiB0IC0geSAqIHM7XG4gICAgICAgIGNvbnN0IGIxMCA9IHggKiB5ICogdCAtIHogKiBzO1xuICAgICAgICBjb25zdCBiMTEgPSB5ICogeSAqIHQgKyBjO1xuICAgICAgICBjb25zdCBiMTIgPSB6ICogeSAqIHQgKyB4ICogcztcbiAgICAgICAgY29uc3QgYjIwID0geCAqIHogKiB0ICsgeSAqIHM7XG4gICAgICAgIGNvbnN0IGIyMSA9IHkgKiB6ICogdCAtIHggKiBzO1xuICAgICAgICBjb25zdCBiMjIgPSB6ICogeiAqIHQgKyBjO1xuICAgICAgICBkZXN0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xuICAgICAgICBkZXN0WzFdID0gYTAxICogYjAwICsgYTExICogYjAxICsgYTIxICogYjAyO1xuICAgICAgICBkZXN0WzJdID0gYTAyICogYjAwICsgYTEyICogYjAxICsgYTIyICogYjAyO1xuICAgICAgICBkZXN0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyO1xuICAgICAgICBkZXN0WzRdID0gYTAwICogYjEwICsgYTEwICogYjExICsgYTIwICogYjEyO1xuICAgICAgICBkZXN0WzVdID0gYTAxICogYjEwICsgYTExICogYjExICsgYTIxICogYjEyO1xuICAgICAgICBkZXN0WzZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xuICAgICAgICBkZXN0WzddID0gYTAzICogYjEwICsgYTEzICogYjExICsgYTIzICogYjEyO1xuICAgICAgICBkZXN0WzhdID0gYTAwICogYjIwICsgYTEwICogYjIxICsgYTIwICogYjIyO1xuICAgICAgICBkZXN0WzldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xuICAgICAgICBkZXN0WzEwXSA9IGEwMiAqIGIyMCArIGExMiAqIGIyMSArIGEyMiAqIGIyMjtcbiAgICAgICAgZGVzdFsxMV0gPSBhMDMgKiBiMjAgKyBhMTMgKiBiMjEgKyBhMjMgKiBiMjI7XG4gICAgICAgIGlmIChkZXN0ICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBkZXN0WzEyXSA9IHRoaXNbMTJdO1xuICAgICAgICAgICAgZGVzdFsxM10gPSB0aGlzWzEzXTtcbiAgICAgICAgICAgIGRlc3RbMTRdID0gdGhpc1sxNF07XG4gICAgICAgICAgICBkZXN0WzE1XSA9IHRoaXNbMTVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICB0cmFuc2xhdGUodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHggPSB2ZWN0b3IueDtcbiAgICAgICAgY29uc3QgeSA9IHZlY3Rvci55O1xuICAgICAgICBjb25zdCB6ID0gdmVjdG9yLno7XG4gICAgICAgIGlmIChkZXN0ICE9PSB0aGlzKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpdCA9IDA7IGl0IDwgMTI7IGl0KyspIHtcbiAgICAgICAgICAgICAgICBkZXN0W2l0XSA9IHRoaXNbaXRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRlc3RbMTJdID0gdGhpc1sxMl0gKyB0aGlzWzBdICogeCArIHRoaXNbNF0gKiB5ICsgdGhpc1s4XSAqIHo7XG4gICAgICAgIGRlc3RbMTNdID0gdGhpc1sxM10gKyB0aGlzWzFdICogeCArIHRoaXNbNV0gKiB5ICsgdGhpc1s5XSAqIHo7XG4gICAgICAgIGRlc3RbMTRdID0gdGhpc1sxNF0gKyB0aGlzWzJdICogeCArIHRoaXNbNl0gKiB5ICsgdGhpc1sxMF0gKiB6O1xuICAgICAgICBkZXN0WzE1XSA9IHRoaXNbMTVdICsgdGhpc1szXSAqIHggKyB0aGlzWzddICogeSArIHRoaXNbMTFdICogejtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIGRlY29tcG9zZSh0cmFuc2xhdGlvbiwgcm90YXRpb24sIHNjYWxpbmcgPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHYwMCA9IHRoaXNbMF07XG4gICAgICAgIGNvbnN0IHYwMSA9IHRoaXNbMV07XG4gICAgICAgIGNvbnN0IHYwMiA9IHRoaXNbMl07XG4gICAgICAgIGNvbnN0IHYxMCA9IHRoaXNbNF07XG4gICAgICAgIGNvbnN0IHYxMSA9IHRoaXNbNV07XG4gICAgICAgIGNvbnN0IHYxMiA9IHRoaXNbNl07XG4gICAgICAgIGNvbnN0IHYyMCA9IHRoaXNbOF07XG4gICAgICAgIGNvbnN0IHYyMSA9IHRoaXNbOV07XG4gICAgICAgIGNvbnN0IHYyMiA9IHRoaXNbMTBdO1xuICAgICAgICBjb25zdCB2MzAgPSB0aGlzWzEyXTtcbiAgICAgICAgY29uc3QgdjMxID0gdGhpc1sxM107XG4gICAgICAgIGNvbnN0IHYzMiA9IHRoaXNbMTRdO1xuICAgICAgICBpZiAoc2NhbGluZyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgc2NhbGluZy54ID0gTWF0aC5zcXJ0KHYwMCAqIHYwMCArIHYwMSAqIHYwMSArIHYwMiAqIHYwMik7XG4gICAgICAgICAgICBzY2FsaW5nLnkgPSBNYXRoLnNxcnQodjEwICogdjEwICsgdjExICogdjExICsgdjEyICogdjEyKTtcbiAgICAgICAgICAgIHNjYWxpbmcueiA9IE1hdGguc3FydCh2MjAgKiB2MjAgKyB2MjEgKiB2MjEgKyB2MjIgKiB2MjIpO1xuICAgICAgICB9XG4gICAgICAgIHJvdGF0aW9uLnNldChbdjAwLCB2MDEsIHYwMiwgdjEwLCB2MTEsIHYxMiwgdjIwLCB2MjEsIHYyMl0pO1xuICAgICAgICB0cmFuc2xhdGlvbi54eXogPSBbdjMwLCB2MzEsIHYzMl07XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZSh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBtYXQ0KHZhbHVlcyk7XG4gICAgfVxuICAgIHN0YXRpYyBjb25zdHJ1Y3QodHJhbnNsYXRpb24sIHJvdGF0aW9uLCBzY2FsZSA9IHZlYzMub25lLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgbWF0NCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHF4ID0gcm90YXRpb24ueDtcbiAgICAgICAgY29uc3QgcXkgPSByb3RhdGlvbi55O1xuICAgICAgICBjb25zdCBxeiA9IHJvdGF0aW9uLno7XG4gICAgICAgIGNvbnN0IHF3ID0gcm90YXRpb24udztcbiAgICAgICAgY29uc3QgdnggPSB0cmFuc2xhdGlvbi54O1xuICAgICAgICBjb25zdCB2eSA9IHRyYW5zbGF0aW9uLnk7XG4gICAgICAgIGNvbnN0IHZ6ID0gdHJhbnNsYXRpb24uejtcbiAgICAgICAgY29uc3Qgc3ggPSBzY2FsZS54O1xuICAgICAgICBjb25zdCBzeSA9IHNjYWxlLnk7XG4gICAgICAgIGNvbnN0IHN6ID0gc2NhbGUuejtcbiAgICAgICAgY29uc3QgeDIgPSBxeCArIHF4O1xuICAgICAgICBjb25zdCB5MiA9IHF5ICsgcXk7XG4gICAgICAgIGNvbnN0IHoyID0gcXogKyBxejtcbiAgICAgICAgY29uc3QgeHggPSBxeCAqIHgyO1xuICAgICAgICBjb25zdCB4eSA9IHF4ICogeTI7XG4gICAgICAgIGNvbnN0IHh6ID0gcXggKiB6MjtcbiAgICAgICAgY29uc3QgeXkgPSBxeSAqIHkyO1xuICAgICAgICBjb25zdCB5eiA9IHF5ICogejI7XG4gICAgICAgIGNvbnN0IHp6ID0gcXogKiB6MjtcbiAgICAgICAgY29uc3Qgd3ggPSBxdyAqIHgyO1xuICAgICAgICBjb25zdCB3eSA9IHF3ICogeTI7XG4gICAgICAgIGNvbnN0IHd6ID0gcXcgKiB6MjtcbiAgICAgICAgZGVzdC5zZXQoW1xuICAgICAgICAgICAgKDEuMCAtICh5eSArIHp6KSkgKiBzeCxcbiAgICAgICAgICAgICh4eSArIHd6KSAqIHN4LFxuICAgICAgICAgICAgKHh6IC0gd3kpICogc3gsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAoeHkgLSB3eikgKiBzeSxcbiAgICAgICAgICAgICgxLjAgLSAoeHggKyB6eikpICogc3ksXG4gICAgICAgICAgICAoeXogKyB3eCkgKiBzeSxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgICh4eiArIHd5KSAqIHN6LFxuICAgICAgICAgICAgKHl6IC0gd3gpICogc3osXG4gICAgICAgICAgICAoMS4wIC0gKHh4ICsgeXkpKSAqIHN6LFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgdngsXG4gICAgICAgICAgICB2eSxcbiAgICAgICAgICAgIHZ6LFxuICAgICAgICAgICAgMS4wXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG11bHRpcGx5KG0xLCBtMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhMDAgPSBtMVswXTtcbiAgICAgICAgY29uc3QgYTAxID0gbTFbMV07XG4gICAgICAgIGNvbnN0IGEwMiA9IG0xWzJdO1xuICAgICAgICBjb25zdCBhMDMgPSBtMVszXTtcbiAgICAgICAgY29uc3QgYTEwID0gbTFbNF07XG4gICAgICAgIGNvbnN0IGExMSA9IG0xWzVdO1xuICAgICAgICBjb25zdCBhMTIgPSBtMVs2XTtcbiAgICAgICAgY29uc3QgYTEzID0gbTFbN107XG4gICAgICAgIGNvbnN0IGEyMCA9IG0xWzhdO1xuICAgICAgICBjb25zdCBhMjEgPSBtMVs5XTtcbiAgICAgICAgY29uc3QgYTIyID0gbTFbMTBdO1xuICAgICAgICBjb25zdCBhMjMgPSBtMVsxMV07XG4gICAgICAgIGNvbnN0IGEzMCA9IG0xWzEyXTtcbiAgICAgICAgY29uc3QgYTMxID0gbTFbMTNdO1xuICAgICAgICBjb25zdCBhMzIgPSBtMVsxNF07XG4gICAgICAgIGNvbnN0IGEzMyA9IG0xWzE1XTtcbiAgICAgICAgY29uc3QgYjAwID0gbTJbMF07XG4gICAgICAgIGNvbnN0IGIwMSA9IG0yWzFdO1xuICAgICAgICBjb25zdCBiMDIgPSBtMlsyXTtcbiAgICAgICAgY29uc3QgYjAzID0gbTJbM107XG4gICAgICAgIGNvbnN0IGIxMCA9IG0yWzRdO1xuICAgICAgICBjb25zdCBiMTEgPSBtMls1XTtcbiAgICAgICAgY29uc3QgYjEyID0gbTJbNl07XG4gICAgICAgIGNvbnN0IGIxMyA9IG0yWzddO1xuICAgICAgICBjb25zdCBiMjAgPSBtMls4XTtcbiAgICAgICAgY29uc3QgYjIxID0gbTJbOV07XG4gICAgICAgIGNvbnN0IGIyMiA9IG0yWzEwXTtcbiAgICAgICAgY29uc3QgYjIzID0gbTJbMTFdO1xuICAgICAgICBjb25zdCBiMzAgPSBtMlsxMl07XG4gICAgICAgIGNvbnN0IGIzMSA9IG0yWzEzXTtcbiAgICAgICAgY29uc3QgYjMyID0gbTJbMTRdO1xuICAgICAgICBjb25zdCBiMzMgPSBtMlsxNV07XG4gICAgICAgIGRlc3Quc2V0KFtcbiAgICAgICAgICAgIGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMCArIGIwMyAqIGEzMCxcbiAgICAgICAgICAgIGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMSArIGIwMyAqIGEzMSxcbiAgICAgICAgICAgIGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMiArIGIwMyAqIGEzMixcbiAgICAgICAgICAgIGIwMCAqIGEwMyArIGIwMSAqIGExMyArIGIwMiAqIGEyMyArIGIwMyAqIGEzMyxcbiAgICAgICAgICAgIGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCArIGIxMyAqIGEzMCxcbiAgICAgICAgICAgIGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMSArIGIxMyAqIGEzMSxcbiAgICAgICAgICAgIGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMiArIGIxMyAqIGEzMixcbiAgICAgICAgICAgIGIxMCAqIGEwMyArIGIxMSAqIGExMyArIGIxMiAqIGEyMyArIGIxMyAqIGEzMyxcbiAgICAgICAgICAgIGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMCArIGIyMyAqIGEzMCxcbiAgICAgICAgICAgIGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMSArIGIyMyAqIGEzMSxcbiAgICAgICAgICAgIGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMiArIGIyMyAqIGEzMixcbiAgICAgICAgICAgIGIyMCAqIGEwMyArIGIyMSAqIGExMyArIGIyMiAqIGEyMyArIGIyMyAqIGEzMyxcbiAgICAgICAgICAgIGIzMCAqIGEwMCArIGIzMSAqIGExMCArIGIzMiAqIGEyMCArIGIzMyAqIGEzMCxcbiAgICAgICAgICAgIGIzMCAqIGEwMSArIGIzMSAqIGExMSArIGIzMiAqIGEyMSArIGIzMyAqIGEzMSxcbiAgICAgICAgICAgIGIzMCAqIGEwMiArIGIzMSAqIGExMiArIGIzMiAqIGEyMiArIGIzMyAqIGEzMixcbiAgICAgICAgICAgIGIzMCAqIGEwMyArIGIzMSAqIGExMyArIGIzMiAqIGEyMyArIGIzMyAqIGEzM1xuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBmcnVzdHVtKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgbWF0NCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJsID0gcmlnaHQgLSBsZWZ0O1xuICAgICAgICBjb25zdCB0YiA9IHRvcCAtIGJvdHRvbTtcbiAgICAgICAgY29uc3QgZm4gPSBmYXIgLSBuZWFyO1xuICAgICAgICBkZXN0LnNldChbXG4gICAgICAgICAgICAobmVhciAqIDIuMCkgLyBybCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIChuZWFyICogMi4wKSAvIHRiLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgKHJpZ2h0ICsgbGVmdCkgLyBybCxcbiAgICAgICAgICAgICh0b3AgKyBib3R0b20pIC8gdGIsXG4gICAgICAgICAgICAtKGZhciArIG5lYXIpIC8gZm4sXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgLShmYXIgKiBuZWFyICogMi4wKSAvIGZuLFxuICAgICAgICAgICAgMC4wXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIHBlcnNwZWN0aXZlKGZvdiwgYXNwZWN0LCBuZWFyLCBmYXIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBtYXQ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdG9wID0gbmVhciAqIE1hdGgudGFuKChmb3YgKiBNYXRoLlBJKSAvIDM2MC4wKTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSB0b3AgKiBhc3BlY3Q7XG4gICAgICAgIHJldHVybiBtYXQ0LmZydXN0dW0oLXJpZ2h0LCByaWdodCwgLXRvcCwgdG9wLCBuZWFyLCBmYXIsIGRlc3QpO1xuICAgIH1cbiAgICBzdGF0aWMgb3J0aG9ncmFwaGljKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgbWF0NCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJsID0gcmlnaHQgLSBsZWZ0O1xuICAgICAgICBjb25zdCB0YiA9IHRvcCAtIGJvdHRvbTtcbiAgICAgICAgY29uc3QgZm4gPSBmYXIgLSBuZWFyO1xuICAgICAgICBkZXN0LnNldChbXG4gICAgICAgICAgICAyLjAgLyBybCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDIgLyB0YixcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIC0yLjAgLyBmbixcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIC0obGVmdCArIHJpZ2h0KSAvIHJsLFxuICAgICAgICAgICAgLSh0b3AgKyBib3R0b20pIC8gdGIsXG4gICAgICAgICAgICAtKGZhciArIG5lYXIpIC8gZm4sXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgXSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgcmVmbGVjdGlvbihwbGFuZSwgZGVzdCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgbWF0NCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHh4ID0gcGxhbmUueCAqIHBsYW5lLng7XG4gICAgICAgIGNvbnN0IHh5ID0gcGxhbmUueCAqIHBsYW5lLnk7XG4gICAgICAgIGNvbnN0IHh6ID0gcGxhbmUueCAqIHBsYW5lLno7XG4gICAgICAgIGNvbnN0IHh3ID0gcGxhbmUueCAqIHBsYW5lLnc7XG4gICAgICAgIGNvbnN0IHl5ID0gcGxhbmUueSAqIHBsYW5lLnk7XG4gICAgICAgIGNvbnN0IHl6ID0gcGxhbmUueSAqIHBsYW5lLno7XG4gICAgICAgIGNvbnN0IHl3ID0gcGxhbmUueSAqIHBsYW5lLnc7XG4gICAgICAgIGNvbnN0IHp6ID0gcGxhbmUueiAqIHBsYW5lLno7XG4gICAgICAgIGNvbnN0IHp3ID0gcGxhbmUueiAqIHBsYW5lLnc7XG4gICAgICAgIGRlc3Quc2V0KFtcbiAgICAgICAgICAgIDEuMCAtIDIuMCAqIHh4LFxuICAgICAgICAgICAgLTIuMCAqIHh5LFxuICAgICAgICAgICAgLTIuMCAqIHh6LFxuICAgICAgICAgICAgLTIuMCAqIHh3LFxuICAgICAgICAgICAgLTIuMCAqIHh5LFxuICAgICAgICAgICAgMS4wIC0gMi4wICogeXksXG4gICAgICAgICAgICAtMi4wICogeXosXG4gICAgICAgICAgICAtMi4wICogeXcsXG4gICAgICAgICAgICAtMi4wICogeHosXG4gICAgICAgICAgICAtMi4wICogeXosXG4gICAgICAgICAgICAxLjAgLSAyLjAgKiB6eixcbiAgICAgICAgICAgIC0yLjAgKiB6dyxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDEuMFxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBsb29rQXQoZXllLCB0YXJnZXQsIHVwID0gdmVjMy51cCwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXllLmVxdWFscyh0YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pZGVudGl0eS5jb3B5KGRlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHogPSB2ZWMzLnN1YnRyYWN0KGV5ZSwgdGFyZ2V0KS5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgeCA9IHZlYzMuY3Jvc3ModXAsIHopLm5vcm1hbGl6ZSgpO1xuICAgICAgICBjb25zdCB5ID0gdmVjMy5jcm9zcyh6LCB4KS5ub3JtYWxpemUoKTtcbiAgICAgICAgZGVzdC5zZXQoW3gueCwgeC55LCB4LnosIDAuMCwgeS54LCB5LnksIHkueiwgMC4wLCB6LngsIHoueSwgei56LCAwLjAsIGV5ZS54LCBleWUueSwgZXllLnosIDEuMF0pO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgbWF0MyB9IGZyb20gJy4vbWF0Myc7XG5pbXBvcnQgeyBtYXQ0IH0gZnJvbSAnLi9tYXQ0JztcbmltcG9ydCB7IHZlYzMgfSBmcm9tICcuL3ZlYzMnO1xuZnVuY3Rpb24gdG9EZWdyZWVzKHJhZGlhbnMpIHtcbiAgICByZXR1cm4gcmFkaWFucyAqICgxODAgLyBNYXRoLlBJKTtcbn1cbmZ1bmN0aW9uIHRvUmFkaWFucyhkZWdyZWVzKSB7XG4gICAgcmV0dXJuIGRlZ3JlZXMgKiAoTWF0aC5QSSAvIDE4MCk7XG59XG5leHBvcnQgY2xhc3MgcXVhdCBleHRlbmRzIEZsb2F0MzJBcnJheSB7XG4gICAgY29uc3RydWN0b3IodmFsdWVzID0gWzAuMCwgMC4wLCAwLjAsIDEuMF0pIHtcbiAgICAgICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDQpKTtcbiAgICB9XG4gICAgc3RhdGljIGlkZW50aXR5ID0gbmV3IHF1YXQoKTtcbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMF07XG4gICAgfVxuICAgIHNldCB4KHgpIHtcbiAgICAgICAgdGhpc1swXSA9IHg7XG4gICAgfVxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpc1sxXTtcbiAgICB9XG4gICAgc2V0IHkoeSkge1xuICAgICAgICB0aGlzWzFdID0geTtcbiAgICB9XG4gICAgZ2V0IHooKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzJdO1xuICAgIH1cbiAgICBzZXQgeih6KSB7XG4gICAgICAgIHRoaXNbMl0gPSB6O1xuICAgIH1cbiAgICBnZXQgdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbM107XG4gICAgfVxuICAgIHNldCB3KHcpIHtcbiAgICAgICAgdGhpc1szXSA9IHc7XG4gICAgfVxuICAgIGdldCB5YXcoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFzaW4oMi4wICogKHRoaXMueCAqIHRoaXMueiAtIHRoaXMudyAqIHRoaXMueSkpO1xuICAgIH1cbiAgICBzZXQgeWF3KHlhdykge1xuICAgICAgICBxdWF0LmZyb21FdWxlckFuZ2xlcyh5YXcsIHRoaXMucGl0Y2gsIHRoaXMucm9sbCwgdGhpcyk7XG4gICAgfVxuICAgIGdldCBwaXRjaCgpIHtcbiAgICAgICAgY29uc3QgeyB4LCB5LCB6LCB3IH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMigyLjAgKiAoeSAqIHogKyB3ICogeCksIHcgKiB3IC0geCAqIHggLSB5ICogeSArIHogKiB6KTtcbiAgICB9XG4gICAgc2V0IHBpdGNoKHBpdGNoKSB7XG4gICAgICAgIHF1YXQuZnJvbUV1bGVyQW5nbGVzKHRoaXMueWF3LCBwaXRjaCwgdGhpcy5yb2xsLCB0aGlzKTtcbiAgICB9XG4gICAgZ2V0IHJvbGwoKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiwgdyB9ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIoMi4wICogKHggKiB5ICsgdyAqIHopLCB3ICogdyArIHggKiB4IC0geSAqIHkgLSB6ICogeik7XG4gICAgfVxuICAgIHNldCByb2xsKHJvbGwpIHtcbiAgICAgICAgcXVhdC5mcm9tRXVsZXJBbmdsZXModGhpcy55YXcsIHRoaXMucGl0Y2gsIHJvbGwsIHRoaXMpO1xuICAgIH1cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMuc3F1YXJlZExlbmd0aCk7XG4gICAgfVxuICAgIGdldCBzcXVhcmVkTGVuZ3RoKCkge1xuICAgICAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHogKyB3ICogdztcbiAgICB9XG4gICAgY29weShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgcXVhdCgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICBkZXN0W2ldID0gdGhpc1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMueCA9IDAuMDtcbiAgICAgICAgdGhpcy55ID0gMC4wO1xuICAgICAgICB0aGlzLnogPSAwLjA7XG4gICAgICAgIHRoaXMudyA9IDEuMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGNhbGN1bGF0ZVcoKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdGhpcztcbiAgICAgICAgdGhpcy53ID0gLU1hdGguc3FydChNYXRoLmFicygxLjAgLSB4ICogeCAtIHkgKiB5IC0geiAqIHopKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGludmVydChkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRvdCA9IHF1YXQuZG90KHRoaXMsIHRoaXMpO1xuICAgICAgICBpZiAoIWRvdCkge1xuICAgICAgICAgICAgZGVzdC5zZXQoWzAuMCwgMC4wLCAwLjAsIDAuMF0pO1xuICAgICAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW52RG90ID0gZG90ID8gMS4wIC8gZG90IDogMC4wO1xuICAgICAgICBkZXN0LnggPSB0aGlzLnggKiAtaW52RG90O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKiAtaW52RG90O1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogKiAtaW52RG90O1xuICAgICAgICBkZXN0LncgPSB0aGlzLncgKiBpbnZEb3Q7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBjb25qdWdhdGUoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggKiAtMTtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICogLTE7XG4gICAgICAgIGRlc3QueiA9IHRoaXMueiAqIC0xO1xuICAgICAgICBkZXN0LncgPSB0aGlzLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBub3JtYWxpemUoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXM7XG4gICAgICAgIGxldCBsZW5ndGggPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6ICsgdyAqIHcpO1xuICAgICAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgICAgICAgZGVzdC54ID0gMDtcbiAgICAgICAgICAgIGRlc3QueSA9IDA7XG4gICAgICAgICAgICBkZXN0LnogPSAwO1xuICAgICAgICAgICAgZGVzdC53ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBkZXN0O1xuICAgICAgICB9XG4gICAgICAgIGxlbmd0aCA9IDEgLyBsZW5ndGg7XG4gICAgICAgIGRlc3QueCA9IHggKiBsZW5ndGg7XG4gICAgICAgIGRlc3QueSA9IHkgKiBsZW5ndGg7XG4gICAgICAgIGRlc3QueiA9IHogKiBsZW5ndGg7XG4gICAgICAgIGRlc3QudyA9IHcgKiBsZW5ndGg7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBlcXVhbHMocSwgdGhyZXNob2xkID0gRXBzaWxvbikge1xuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy54IC0gcS54KSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnkgLSBxLnkpID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMueiAtIHEueikgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy53IC0gcS53KSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBhZGQob3RoZXIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICsgb3RoZXIueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICsgb3RoZXIueTtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56ICsgb3RoZXIuejtcbiAgICAgICAgZGVzdC53ID0gdGhpcy53ICsgb3RoZXIudztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIG11bHRpcGx5KG90aGVyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHExeCA9IHRoaXMueDtcbiAgICAgICAgY29uc3QgcTF5ID0gdGhpcy55O1xuICAgICAgICBjb25zdCBxMXogPSB0aGlzLno7XG4gICAgICAgIGNvbnN0IHExdyA9IHRoaXMudztcbiAgICAgICAgY29uc3QgcTJ4ID0gb3RoZXIueDtcbiAgICAgICAgY29uc3QgcTJ5ID0gb3RoZXIueTtcbiAgICAgICAgY29uc3QgcTJ6ID0gb3RoZXIuejtcbiAgICAgICAgY29uc3QgcTJ3ID0gb3RoZXIudztcbiAgICAgICAgZGVzdC54ID0gcTF4ICogcTJ3ICsgcTF3ICogcTJ4ICsgcTF5ICogcTJ6IC0gcTF6ICogcTJ5O1xuICAgICAgICBkZXN0LnkgPSBxMXkgKiBxMncgKyBxMXcgKiBxMnkgKyBxMXogKiBxMnggLSBxMXggKiBxMno7XG4gICAgICAgIGRlc3QueiA9IHExeiAqIHEydyArIHExdyAqIHEyeiArIHExeCAqIHEyeSAtIHExeSAqIHEyeDtcbiAgICAgICAgZGVzdC53ID0gcTF3ICogcTJ3IC0gcTF4ICogcTJ4IC0gcTF5ICogcTJ5IC0gcTF6ICogcTJ6O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdHJhbnNmb3JtVmVjMyh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB4LCB5LCB6IH0gPSB2ZWN0b3I7XG4gICAgICAgIGNvbnN0IHExID0gbmV3IHF1YXQoW3gsIHksIHosIDBdKTtcbiAgICAgICAgY29uc3QgcTIgPSB0aGlzLmNvcHkoKS5pbnZlcnQoKTtcbiAgICAgICAgY29uc3QgcTMgPSB0aGlzLmNvcHkoKS5tdWx0aXBseShxMSk7XG4gICAgICAgIGNvbnN0IHE0ID0gcTMuY29weSgpLm11bHRpcGx5KHEyKTtcbiAgICAgICAgZGVzdC54eXogPSBbcTQueCwgcTQueSwgcTQuel07XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICB0b01hdDMoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDMoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHgyID0geCArIHg7XG4gICAgICAgIGNvbnN0IHkyID0geSArIHk7XG4gICAgICAgIGNvbnN0IHoyID0geiArIHo7XG4gICAgICAgIGNvbnN0IHh4ID0geCAqIHgyO1xuICAgICAgICBjb25zdCB4eSA9IHggKiB5MjtcbiAgICAgICAgY29uc3QgeHogPSB4ICogejI7XG4gICAgICAgIGNvbnN0IHl5ID0geSAqIHkyO1xuICAgICAgICBjb25zdCB5eiA9IHkgKiB6MjtcbiAgICAgICAgY29uc3QgenogPSB6ICogejI7XG4gICAgICAgIGNvbnN0IHd4ID0gdyAqIHgyO1xuICAgICAgICBjb25zdCB3eSA9IHcgKiB5MjtcbiAgICAgICAgY29uc3Qgd3ogPSB3ICogejI7XG4gICAgICAgIGRlc3Quc2V0KFsxLjAgLSAoeXkgKyB6eiksIHh5ICsgd3osIHh6IC0gd3ksIHh5IC0gd3osIDEuMCAtICh4eCArIHp6KSwgeXogKyB3eCwgeHogKyB3eSwgeXogLSB3eCwgMS4wIC0gKHh4ICsgeXkpXSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICB0b01hdDQoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IG1hdDQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHgyID0geCArIHg7XG4gICAgICAgIGNvbnN0IHkyID0geSArIHk7XG4gICAgICAgIGNvbnN0IHoyID0geiArIHo7XG4gICAgICAgIGNvbnN0IHh4ID0geCAqIHgyO1xuICAgICAgICBjb25zdCB4eSA9IHggKiB5MjtcbiAgICAgICAgY29uc3QgeHogPSB4ICogejI7XG4gICAgICAgIGNvbnN0IHl5ID0geSAqIHkyO1xuICAgICAgICBjb25zdCB5eiA9IHkgKiB6MjtcbiAgICAgICAgY29uc3QgenogPSB6ICogejI7XG4gICAgICAgIGNvbnN0IHd4ID0gdyAqIHgyO1xuICAgICAgICBjb25zdCB3eSA9IHcgKiB5MjtcbiAgICAgICAgY29uc3Qgd3ogPSB3ICogejI7XG4gICAgICAgIGRlc3Quc2V0KFtcbiAgICAgICAgICAgIDEuMCAtICh5eSArIHp6KSxcbiAgICAgICAgICAgIHh5ICsgd3osXG4gICAgICAgICAgICB4eiAtIHd5LFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgeHkgLSB3eixcbiAgICAgICAgICAgIDEuMCAtICh4eCArIHp6KSxcbiAgICAgICAgICAgIHl6ICsgd3gsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICB4eiArIHd5LFxuICAgICAgICAgICAgeXogLSB3eCxcbiAgICAgICAgICAgIDEuMCAtICh4eCArIHl5KSxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDEuMFxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIGludGVycG9sYXRlKHEsIHRpbWUsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBxdWF0LmludGVycG9sYXRlKHRoaXMsIHEsIHRpbWUsIGRlc3QpO1xuICAgIH1cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiwgdyB9ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIFt4LCB5LCB6LCB3XTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGRlc2VyaWFsaXplKHZhbHVlcykge1xuICAgICAgICByZXR1cm4gbmV3IHF1YXQodmFsdWVzKTtcbiAgICB9XG4gICAgc3RhdGljIGludGVycG9sYXRlKHExLCBxMiwgdGltZSwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHF1YXQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGltZSA8PSAwLjApIHtcbiAgICAgICAgICAgIHJldHVybiBxMS5jb3B5KGRlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aW1lID49IDEuMCkge1xuICAgICAgICAgICAgcmV0dXJuIHEyLmNvcHkoZGVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvcyA9IHF1YXQuZG90KHExLCBxMik7XG4gICAgICAgIGNvbnN0IHEyYSA9IHEyLmNvcHkoZGVzdCk7XG4gICAgICAgIGlmIChjb3MgPCAwLjApIHtcbiAgICAgICAgICAgIHEyYS5pbnZlcnQoKTtcbiAgICAgICAgICAgIGNvcyA9IC1jb3M7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGswO1xuICAgICAgICBsZXQgazE7XG4gICAgICAgIGlmIChjb3MgPiAxIC0gRXBzaWxvbikge1xuICAgICAgICAgICAgazAgPSAxIC0gdGltZTtcbiAgICAgICAgICAgIGsxID0gMCArIHRpbWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzaW4gPSBNYXRoLnNxcnQoMSAtIGNvcyAqIGNvcyk7XG4gICAgICAgICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoc2luLCBjb3MpO1xuICAgICAgICAgICAgY29uc3Qgb25lT3ZlclNpbiA9IDEgLyBzaW47XG4gICAgICAgICAgICBrMCA9IE1hdGguc2luKCgxIC0gdGltZSkgKiBhbmdsZSkgKiBvbmVPdmVyU2luO1xuICAgICAgICAgICAgazEgPSBNYXRoLnNpbigoMCArIHRpbWUpICogYW5nbGUpICogb25lT3ZlclNpbjtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSBrMCAqIHExLnggKyBrMSAqIHEyYS54O1xuICAgICAgICBkZXN0LnkgPSBrMCAqIHExLnkgKyBrMSAqIHEyYS55O1xuICAgICAgICBkZXN0LnogPSBrMCAqIHExLnogKyBrMSAqIHEyYS56O1xuICAgICAgICBkZXN0LncgPSBrMCAqIHExLncgKyBrMSAqIHEyYS53O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGRvdChxMSwgcTIpIHtcbiAgICAgICAgcmV0dXJuIHExLnggKiBxMi54ICsgcTEueSAqIHEyLnkgKyBxMS56ICogcTIueiArIHExLncgKiBxMi53O1xuICAgIH1cbiAgICBzdGF0aWMgYWRkKHExLCBxMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHF1YXQoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSBxMS54ICsgcTIueDtcbiAgICAgICAgZGVzdC55ID0gcTEueSArIHEyLnk7XG4gICAgICAgIGRlc3QueiA9IHExLnogKyBxMi56O1xuICAgICAgICBkZXN0LncgPSBxMS53ICsgcTIudztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtdWx0aXBseShxMSwgcTIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyBxdWF0KCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcTF4ID0gcTEueDtcbiAgICAgICAgY29uc3QgcTF5ID0gcTEueTtcbiAgICAgICAgY29uc3QgcTF6ID0gcTEuejtcbiAgICAgICAgY29uc3QgcTF3ID0gcTEudztcbiAgICAgICAgY29uc3QgcTJ4ID0gcTIueDtcbiAgICAgICAgY29uc3QgcTJ5ID0gcTIueTtcbiAgICAgICAgY29uc3QgcTJ6ID0gcTIuejtcbiAgICAgICAgY29uc3QgcTJ3ID0gcTIudztcbiAgICAgICAgZGVzdC54ID0gcTF4ICogcTJ3ICsgcTF3ICogcTJ4ICsgcTF5ICogcTJ6IC0gcTF6ICogcTJ5O1xuICAgICAgICBkZXN0LnkgPSBxMXkgKiBxMncgKyBxMXcgKiBxMnkgKyBxMXogKiBxMnggLSBxMXggKiBxMno7XG4gICAgICAgIGRlc3QueiA9IHExeiAqIHEydyArIHExdyAqIHEyeiArIHExeCAqIHEyeSAtIHExeSAqIHEyeDtcbiAgICAgICAgZGVzdC53ID0gcTF3ICogcTJ3IC0gcTF4ICogcTJ4IC0gcTF5ICogcTJ5IC0gcTF6ICogcTJ6O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGNyb3NzKHExLCBxMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHF1YXQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBxMXggPSBxMS54O1xuICAgICAgICBjb25zdCBxMXkgPSBxMS55O1xuICAgICAgICBjb25zdCBxMXogPSBxMS56O1xuICAgICAgICBjb25zdCBxMXcgPSBxMS53O1xuICAgICAgICBjb25zdCBxMnggPSBxMi54O1xuICAgICAgICBjb25zdCBxMnkgPSBxMi55O1xuICAgICAgICBjb25zdCBxMnogPSBxMi56O1xuICAgICAgICBjb25zdCBxMncgPSBxMi53O1xuICAgICAgICBkZXN0LnggPSBxMXcgKiBxMnogKyBxMXogKiBxMncgKyBxMXggKiBxMnkgLSBxMXkgKiBxMng7XG4gICAgICAgIGRlc3QueSA9IHExdyAqIHEydyAtIHExeCAqIHEyeCAtIHExeSAqIHEyeSAtIHExeiAqIHEyejtcbiAgICAgICAgZGVzdC56ID0gcTF3ICogcTJ4ICsgcTF4ICogcTJ3ICsgcTF5ICogcTJ6IC0gcTF6ICogcTJ5O1xuICAgICAgICBkZXN0LncgPSBxMXcgKiBxMnkgKyBxMXkgKiBxMncgKyBxMXogKiBxMnggLSBxMXggKiBxMno7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbWl4KHExLCBxMiwgdGltZSwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHF1YXQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGltZSA8PSAwLjApIHtcbiAgICAgICAgICAgIHExLmNvcHkoZGVzdCk7XG4gICAgICAgICAgICByZXR1cm4gZGVzdDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aW1lID49IDEuMCkge1xuICAgICAgICAgICAgcTIuY29weShkZXN0KTtcbiAgICAgICAgICAgIHJldHVybiBkZXN0O1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb3MgPSBxdWF0LmRvdChxMSwgcTIpO1xuICAgICAgICBjb25zdCBxMmEgPSBxMi5jb3B5KGRlc3QpO1xuICAgICAgICBpZiAoY29zIDwgMC4wKSB7XG4gICAgICAgICAgICBxMmEuaW52ZXJ0KCk7XG4gICAgICAgICAgICBjb3MgPSAtY29zO1xuICAgICAgICB9XG4gICAgICAgIGxldCBrMDtcbiAgICAgICAgbGV0IGsxO1xuICAgICAgICBpZiAoY29zID4gMSAtIEVwc2lsb24pIHtcbiAgICAgICAgICAgIGswID0gMSAtIHRpbWU7XG4gICAgICAgICAgICBrMSA9IDAgKyB0aW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zcXJ0KDEgLSBjb3MgKiBjb3MpO1xuICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKHNpbiwgY29zKTtcbiAgICAgICAgICAgIGNvbnN0IG9uZU92ZXJTaW4gPSAxIC8gc2luO1xuICAgICAgICAgICAgazAgPSBNYXRoLnNpbigoMSAtIHRpbWUpICogYW5nbGUpICogb25lT3ZlclNpbjtcbiAgICAgICAgICAgIGsxID0gTWF0aC5zaW4oKDAgKyB0aW1lKSAqIGFuZ2xlKSAqIG9uZU92ZXJTaW47XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gazAgKiBxMS54ICsgazEgKiBxMmEueDtcbiAgICAgICAgZGVzdC55ID0gazAgKiBxMS55ICsgazEgKiBxMmEueTtcbiAgICAgICAgZGVzdC56ID0gazAgKiBxMS56ICsgazEgKiBxMmEuejtcbiAgICAgICAgZGVzdC53ID0gazAgKiBxMS53ICsgazEgKiBxMmEudztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tQXhpc0FuZ2xlKGF4aXMsIGFuZ2xlLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgcXVhdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGEgPSBhbmdsZSAqIDAuNTtcbiAgICAgICAgY29uc3Qgc2luID0gTWF0aC5zaW4oYSk7XG4gICAgICAgIGRlc3QueCA9IGF4aXMueCAqIHNpbjtcbiAgICAgICAgZGVzdC55ID0gYXhpcy55ICogc2luO1xuICAgICAgICBkZXN0LnogPSBheGlzLnogKiBzaW47XG4gICAgICAgIGRlc3QudyA9IE1hdGguY29zKGEpO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGZyb21FdWxlckFuZ2xlcyh5YXcsIHBpdGNoLCByb2xsLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgcXVhdCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHkgPSB5YXcgKiAwLjU7XG4gICAgICAgIGNvbnN0IHIgPSByb2xsICogMC41O1xuICAgICAgICBjb25zdCBwID0gcGl0Y2ggKiAwLjU7XG4gICAgICAgIGNvbnN0IGMxID0gTWF0aC5jb3MoeSk7XG4gICAgICAgIGNvbnN0IHMxID0gTWF0aC5zaW4oeSk7XG4gICAgICAgIGNvbnN0IGMyID0gTWF0aC5jb3Mocik7XG4gICAgICAgIGNvbnN0IHMyID0gTWF0aC5zaW4ocik7XG4gICAgICAgIGNvbnN0IGMzID0gTWF0aC5jb3MocCk7XG4gICAgICAgIGNvbnN0IHMzID0gTWF0aC5zaW4ocCk7XG4gICAgICAgIGNvbnN0IGMxYzIgPSBjMSAqIGMyO1xuICAgICAgICBjb25zdCBzMXMyID0gczEgKiBzMjtcbiAgICAgICAgZGVzdC54ID0gYzFjMiAqIHMzICsgczFzMiAqIGMzO1xuICAgICAgICBkZXN0LnkgPSBzMSAqIGMyICogYzMgKyBjMSAqIHMyICogczM7XG4gICAgICAgIGRlc3QueiA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcbiAgICAgICAgZGVzdC53ID0gYzFjMiAqIGMzIC0gczFzMiAqIHMzO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuY29uc3QgeyBtaW4sIG1heCwgYWJzLCBzcXJ0IH0gPSBNYXRoO1xuZXhwb3J0IGNsYXNzIHZlYzIgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xuICAgIHN0YXRpYyB6ZXJvID0gbmV3IHZlYzIoWzAuMCwgMC4wXSk7XG4gICAgc3RhdGljIG9uZSA9IG5ldyB2ZWMyKFsxLjAsIDEuMF0pO1xuICAgIHN0YXRpYyByaWdodCA9IG5ldyB2ZWMyKFsxLjAsIDAuMF0pO1xuICAgIHN0YXRpYyB1cCA9IG5ldyB2ZWMyKFswLjAsIDEuMF0pO1xuICAgIHN0YXRpYyBheGVzID0gW3ZlYzIucmlnaHQsIHZlYzIudXBdO1xuICAgIHN0YXRpYyBpbmZpbml0eSA9IG5ldyB2ZWMyKFtJbmZpbml0eSwgSW5maW5pdHldKTtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMgPSBbMC4wLCAwLjBdKSB7XG4gICAgICAgIHN1cGVyKHZhbHVlcy5zbGljZSgwLCAyKSk7XG4gICAgfVxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG4gICAgc2V0IHgoeCkge1xuICAgICAgICB0aGlzWzBdID0geDtcbiAgICB9XG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cbiAgICBzZXQgeSh5KSB7XG4gICAgICAgIHRoaXNbMV0gPSB5O1xuICAgIH1cbiAgICBnZXQgeHkoKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMpO1xuICAgIH1cbiAgICBzZXQgeHkoeHkpIHtcbiAgICAgICAgdGhpcy5zZXQoeHkpO1xuICAgIH1cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gc3FydCh0aGlzLnNxdWFyZWRMZW5ndGgpO1xuICAgIH1cbiAgICBnZXQgc3F1YXJlZExlbmd0aCgpIHtcbiAgICAgICAgY29uc3QgeyB4LCB5IH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4geCAqIHggKyB5ICogeTtcbiAgICB9XG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMueCA9IDAuMDtcbiAgICAgICAgdGhpcy55ID0gMC4wO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgY29weShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgbmVnYXRlKGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gLXRoaXMueDtcbiAgICAgICAgZGVzdC55ID0gLXRoaXMueTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIGVxdWFscyh2ZWN0b3IsIHRocmVzaG9sZCA9IEVwc2lsb24pIHtcbiAgICAgICAgaWYgKGFicyh0aGlzLnggLSB2ZWN0b3IueCkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWJzKHRoaXMueSAtIHZlY3Rvci55KSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBhZGQodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCArIHZlY3Rvci54O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKyB2ZWN0b3IueTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN1YnRyYWN0KHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggLSB2ZWN0b3IueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55IC0gdmVjdG9yLnk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBtdWx0aXBseSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICogdmVjdG9yLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAqIHZlY3Rvci55O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgZGl2aWRlKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggLyB2ZWN0b3IueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55IC8gdmVjdG9yLnk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzY2FsZShzY2FsYXIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICogc2NhbGFyO1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKiBzY2FsYXI7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBub3JtYWxpemUoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGRlc3QueCA9IDA7XG4gICAgICAgICAgICBkZXN0LnkgPSAwO1xuICAgICAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgICAgIH1cbiAgICAgICAgbGVuZ3RoID0gMS4wIC8gbGVuZ3RoO1xuICAgICAgICBkZXN0LnggPSB0aGlzLnggKiBsZW5ndGg7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAqIGxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHRyYW5zZm9ybShtYXRyaXgsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdHJpeC50cmFuc2Zvcm0odGhpcywgZGVzdCk7XG4gICAgfVxuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgICAgY29uc3QgeyB4LCB5IH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4gW3gsIHldO1xuICAgIH1cbiAgICBzdGF0aWMgYXN5bmMgZGVzZXJpYWxpemUodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBuZXcgdmVjMih2YWx1ZXMpO1xuICAgIH1cbiAgICBzdGF0aWMgYWJzb2x1dGUodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IGFicyh2ZWN0b3IueCk7XG4gICAgICAgIGRlc3QueSA9IGFicyh2ZWN0b3IueSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbWluaW11bSh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gbWluKHZlY3Rvci54LCB2ZWN0b3IyLngpO1xuICAgICAgICBkZXN0LnkgPSBtaW4odmVjdG9yLnksIHZlY3RvcjIueSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbWF4aW11bSh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gbWF4KHZlY3Rvci54LCB2ZWN0b3IyLngpO1xuICAgICAgICBkZXN0LnkgPSBtYXgodmVjdG9yLnksIHZlY3RvcjIueSk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgY3Jvc3ModmVjdG9yLCB2ZWN0b3IyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHZlY3Rvci54ICogdmVjdG9yMi55O1xuICAgICAgICBkZXN0LnkgPSB2ZWN0b3IueSAqIHZlY3RvcjIueDtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBkb3QodmVjdG9yLCB2ZWN0b3IyKSB7XG4gICAgICAgIHJldHVybiB2ZWN0b3IueCAqIHZlY3RvcjIueCArIHZlY3Rvci55ICogdmVjdG9yMi55O1xuICAgIH1cbiAgICBzdGF0aWMgZGlzdGFuY2UodmVjdG9yLCB2ZWN0b3IyKSB7XG4gICAgICAgIHJldHVybiBzcXJ0KHRoaXMuc3F1YXJlZERpc3RhbmNlKHZlY3RvciwgdmVjdG9yMikpO1xuICAgIH1cbiAgICBzdGF0aWMgc3F1YXJlZERpc3RhbmNlKHZlY3RvciwgdmVjdG9yMikge1xuICAgICAgICBjb25zdCB4ID0gdmVjdG9yMi54IC0gdmVjdG9yLng7XG4gICAgICAgIGNvbnN0IHkgPSB2ZWN0b3IyLnkgLSB2ZWN0b3IueTtcbiAgICAgICAgcmV0dXJuIHggKiB4ICsgeSAqIHk7XG4gICAgfVxuICAgIHN0YXRpYyBkaXJlY3Rpb24odmVjdG9yLCB2ZWN0b3IyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHggPSB2ZWN0b3IueCAtIHZlY3RvcjIueDtcbiAgICAgICAgY29uc3QgeSA9IHZlY3Rvci55IC0gdmVjdG9yMi55O1xuICAgICAgICBsZXQgbGVuZ3RoID0gc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZGVzdC54ID0gMDtcbiAgICAgICAgICAgIGRlc3QueSA9IDA7XG4gICAgICAgICAgICByZXR1cm4gZGVzdDtcbiAgICAgICAgfVxuICAgICAgICBsZW5ndGggPSAxIC8gbGVuZ3RoO1xuICAgICAgICBkZXN0LnggPSB4ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnkgPSB5ICogbGVuZ3RoO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG1peCh2ZWN0b3IsIHZlY3RvcjIsIHRpbWUsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeCA9IHZlY3Rvci54O1xuICAgICAgICBjb25zdCB5ID0gdmVjdG9yLnk7XG4gICAgICAgIGNvbnN0IHgyID0gdmVjdG9yMi54O1xuICAgICAgICBjb25zdCB5MiA9IHZlY3RvcjIueTtcbiAgICAgICAgZGVzdC54ID0geCArIHRpbWUgKiAoeDIgLSB4KTtcbiAgICAgICAgZGVzdC55ID0geSArIHRpbWUgKiAoeTIgLSB5KTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBhZGQodmVjdG9yLCB2ZWN0b3IyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHZlY3Rvci54ICsgdmVjdG9yMi54O1xuICAgICAgICBkZXN0LnkgPSB2ZWN0b3IueSArIHZlY3RvcjIueTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBzdWJ0cmFjdCh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdmVjdG9yLnggLSB2ZWN0b3IyLng7XG4gICAgICAgIGRlc3QueSA9IHZlY3Rvci55IC0gdmVjdG9yMi55O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG11bHRpcGx5KHZlY3RvciwgdmVjdG9yMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2ZWN0b3IueCAqIHZlY3RvcjIueDtcbiAgICAgICAgZGVzdC55ID0gdmVjdG9yLnkgKiB2ZWN0b3IyLnk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZGl2aWRlKHZlY3RvciwgdmVjdG9yMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2ZWN0b3IueCAvIHZlY3RvcjIueDtcbiAgICAgICAgZGVzdC55ID0gdmVjdG9yLnkgLyB2ZWN0b3IyLnk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgc2NhbGUodmVjdG9yLCBzY2FsYXIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlY3Rvci5zY2FsZShzY2FsYXIsIGRlc3QpO1xuICAgIH1cbiAgICBzdGF0aWMgbm9ybWFsaXplKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmVjdG9yLm5vcm1hbGl6ZShkZXN0KTtcbiAgICB9XG4gICAgc3RhdGljIHN1bSguLi52ZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjMigpO1xuICAgICAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XG4gICAgICAgICAgICBkZXN0LnggKz0gdmVjdG9yLng7XG4gICAgICAgICAgICBkZXN0LnkgKz0gdmVjdG9yLnk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBkaWZmZXJlbmNlKC4uLnZlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IG5ldyB2ZWMyKCk7XG4gICAgICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcbiAgICAgICAgICAgIGRlc3QueCAtPSB2ZWN0b3IueDtcbiAgICAgICAgICAgIGRlc3QueSAtPSB2ZWN0b3IueTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIHByb2R1Y3QoLi4udmVjdG9ycykge1xuICAgICAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xuICAgICAgICAgICAgZGVzdC54ICo9IHZlY3Rvci54O1xuICAgICAgICAgICAgZGVzdC55ICo9IHZlY3Rvci55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZGl2aXNpb24oLi4udmVjdG9ycykge1xuICAgICAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzIoKTtcbiAgICAgICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xuICAgICAgICAgICAgZGVzdC54IC89IHZlY3Rvci54O1xuICAgICAgICAgICAgZGVzdC55IC89IHZlY3Rvci55O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEVwc2lsb24gfSBmcm9tICcuL2NvbnN0YW50cyc7XG5jb25zdCB7IG1pbiwgbWF4LCBhYnMsIHNxcnQgfSA9IE1hdGg7XG5leHBvcnQgY2xhc3MgdmVjMyBleHRlbmRzIEZsb2F0MzJBcnJheSB7XG4gICAgc3RhdGljIHplcm8gPSBuZXcgdmVjMyhbMC4wLCAwLjAsIDAuMF0pO1xuICAgIHN0YXRpYyBvbmUgPSBuZXcgdmVjMyhbMS4wLCAxLjAsIDEuMF0pO1xuICAgIHN0YXRpYyBncmV5ID0gbmV3IHZlYzMoWzAuOCwgMC44LCAwLjhdKTtcbiAgICBzdGF0aWMgcmlnaHQgPSBuZXcgdmVjMyhbMS4wLCAwLjAsIDAuMF0pO1xuICAgIHN0YXRpYyBsZWZ0ID0gbmV3IHZlYzMoWy0xLjAsIDAuMCwgMC4wXSk7XG4gICAgc3RhdGljIHVwID0gbmV3IHZlYzMoWzAuMCwgMS4wLCAwLjBdKTtcbiAgICBzdGF0aWMgZG93biA9IG5ldyB2ZWMzKFswLjAsIC0xLjAsIDAuMF0pO1xuICAgIHN0YXRpYyBmb3J3YXJkID0gbmV3IHZlYzMoWzAuMCwgMC4wLCAxLjBdKTtcbiAgICBzdGF0aWMgYmFja3dhcmQgPSBuZXcgdmVjMyhbMC4wLCAwLjAsIC0xLjBdKTtcbiAgICBzdGF0aWMgYXhlcyA9IFt2ZWMzLnJpZ2h0LCB2ZWMzLnVwLCB2ZWMzLmZvcndhcmRdO1xuICAgIHN0YXRpYyBpbmZpbml0eSA9IG5ldyB2ZWMzKFtJbmZpbml0eSwgSW5maW5pdHksIEluZmluaXR5XSk7XG4gICAgY29uc3RydWN0b3IodmFsdWVzID0gWzAuMCwgMC4wLCAwLjBdKSB7XG4gICAgICAgIHN1cGVyKHZhbHVlcy5zbGljZSgwLCAzKSk7XG4gICAgfVxuICAgIGdldCB4KCkge1xuICAgICAgICByZXR1cm4gdGhpc1swXTtcbiAgICB9XG4gICAgc2V0IHgoeCkge1xuICAgICAgICB0aGlzWzBdID0geDtcbiAgICB9XG4gICAgZ2V0IHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzFdO1xuICAgIH1cbiAgICBzZXQgeSh5KSB7XG4gICAgICAgIHRoaXNbMV0gPSB5O1xuICAgIH1cbiAgICBnZXQgeigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMl07XG4gICAgfVxuICAgIHNldCB6KHopIHtcbiAgICAgICAgdGhpc1syXSA9IHo7XG4gICAgfVxuICAgIGdldCB4eXooKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMpO1xuICAgIH1cbiAgICBzZXQgeHl6KHh5eikge1xuICAgICAgICB0aGlzLnNldCh4eXopO1xuICAgIH1cbiAgICBnZXQgcmdiKCkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbiAgICB9XG4gICAgc2V0IHJnYihyZ2IpIHtcbiAgICAgICAgdGhpcy5zZXQocmdiKTtcbiAgICB9XG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHNxcnQodGhpcy5zcXVhcmVkTGVuZ3RoKTtcbiAgICB9XG4gICAgZ2V0IHNxdWFyZWRMZW5ndGgoKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogejtcbiAgICB9XG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMueCA9IDAuMDtcbiAgICAgICAgdGhpcy55ID0gMC4wO1xuICAgICAgICB0aGlzLnogPSAwLjA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBjb3B5KGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnk7XG4gICAgICAgIGRlc3QueiA9IHRoaXMuejtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIG5lZ2F0ZShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IC10aGlzLng7XG4gICAgICAgIGRlc3QueSA9IC10aGlzLnk7XG4gICAgICAgIGRlc3QueiA9IC10aGlzLno7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBlcXVhbHModmVjdG9yLCB0aHJlc2hvbGQgPSBFcHNpbG9uKSB7XG4gICAgICAgIGlmIChhYnModGhpcy54IC0gdmVjdG9yLngpID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFicyh0aGlzLnkgLSB2ZWN0b3IueSkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWJzKHRoaXMueiAtIHZlY3Rvci56KSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBhZGQodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCArIHZlY3Rvci54O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKyB2ZWN0b3IueTtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56ICsgdmVjdG9yLno7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdWJ0cmFjdCh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54IC0gdmVjdG9yLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAtIHZlY3Rvci55O1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogLSB2ZWN0b3IuejtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIG11bHRpcGx5KHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggKiB2ZWN0b3IueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICogdmVjdG9yLnk7XG4gICAgICAgIGRlc3QueiA9IHRoaXMueiAqIHZlY3Rvci56O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgZGl2aWRlKHZlY3RvciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB0aGlzLnggLyB2ZWN0b3IueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55IC8gdmVjdG9yLnk7XG4gICAgICAgIGRlc3QueiA9IHRoaXMueiAvIHZlY3Rvci56O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc2NhbGUoc2NhbGFyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAqIHNjYWxhcjtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICogc2NhbGFyO1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogKiBzY2FsYXI7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBub3JtYWxpemUoZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBsZXQgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGRlc3QueCA9IDA7XG4gICAgICAgICAgICBkZXN0LnkgPSAwO1xuICAgICAgICAgICAgZGVzdC56ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBkZXN0O1xuICAgICAgICB9XG4gICAgICAgIGxlbmd0aCA9IDEuMCAvIGxlbmd0aDtcbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKiBsZW5ndGg7XG4gICAgICAgIGRlc3QueiA9IHRoaXMueiAqIGxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHJlZmxlY3Qobm9ybWFsLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub3JtYWxcbiAgICAgICAgICAgIC5jb3B5KGRlc3QpXG4gICAgICAgICAgICAuc2NhbGUoLTIuMCAqIHZlYzMuZG90KHRoaXMsIG5vcm1hbCkpXG4gICAgICAgICAgICAuYWRkKHRoaXMpO1xuICAgIH1cbiAgICB0cmFuc2Zvcm0obWF0cml4LCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRyaXgudHJhbnNmb3JtKHRoaXMsIGRlc3QpO1xuICAgIH1cbiAgICBpbnRlcnBvbGF0ZSh2MiwgdGltZSwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHZlYzMuaW50ZXJwb2xhdGUodGhpcywgdjIsIHRpbWUsIGRlc3QpO1xuICAgIH1cbiAgICBzZXJpYWxpemUoKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIFt4LCB5LCB6XTtcbiAgICB9XG4gICAgc3RhdGljIGFzeW5jIGRlc2VyaWFsaXplKHZhbHVlcykge1xuICAgICAgICByZXR1cm4gbmV3IHZlYzModmFsdWVzKTtcbiAgICB9XG4gICAgc3RhdGljIGludGVycG9sYXRlKHYxLCB2MiwgdGltZSwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGltZSA8PSAwLjApIHtcbiAgICAgICAgICAgIHJldHVybiB2MS5jb3B5KGRlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aW1lID49IDEuMCkge1xuICAgICAgICAgICAgcmV0dXJuIHYyLmNvcHkoZGVzdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHYxXG4gICAgICAgICAgICAuY29weShkZXN0KVxuICAgICAgICAgICAgLnNjYWxlKDEuMCAtIHRpbWUpXG4gICAgICAgICAgICAuYWRkKHYyLmNvcHkoKS5zY2FsZSh0aW1lKSk7XG4gICAgfVxuICAgIHN0YXRpYyBhYnNvbHV0ZSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gYWJzKHZlY3Rvci54KTtcbiAgICAgICAgZGVzdC55ID0gYWJzKHZlY3Rvci55KTtcbiAgICAgICAgZGVzdC56ID0gYWJzKHZlY3Rvci56KTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtaW5pbXVtKHYxLCB2MiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSBtaW4odjEueCwgdjIueCk7XG4gICAgICAgIGRlc3QueSA9IG1pbih2MS55LCB2Mi55KTtcbiAgICAgICAgZGVzdC56ID0gbWluKHYxLnosIHYyLnopO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG1heGltdW0odjEsIHYyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IG1heCh2MS54LCB2Mi54KTtcbiAgICAgICAgZGVzdC55ID0gbWF4KHYxLnksIHYyLnkpO1xuICAgICAgICBkZXN0LnogPSBtYXgodjEueiwgdjIueik7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgY3Jvc3ModjEsIHYyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHggPSB2MS54O1xuICAgICAgICBjb25zdCB5ID0gdjEueTtcbiAgICAgICAgY29uc3QgeiA9IHYxLno7XG4gICAgICAgIGNvbnN0IHgyID0gdjIueDtcbiAgICAgICAgY29uc3QgeTIgPSB2Mi55O1xuICAgICAgICBjb25zdCB6MiA9IHYyLno7XG4gICAgICAgIGRlc3QueCA9IHkgKiB6MiAtIHogKiB5MjtcbiAgICAgICAgZGVzdC55ID0geiAqIHgyIC0geCAqIHoyO1xuICAgICAgICBkZXN0LnogPSB4ICogeTIgLSB5ICogeDI7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZG90KHYxLCB2Mikge1xuICAgICAgICBjb25zdCB4ID0gdjEueDtcbiAgICAgICAgY29uc3QgeSA9IHYxLnk7XG4gICAgICAgIGNvbnN0IHogPSB2MS56O1xuICAgICAgICBjb25zdCB4MiA9IHYyLng7XG4gICAgICAgIGNvbnN0IHkyID0gdjIueTtcbiAgICAgICAgY29uc3QgejIgPSB2Mi56O1xuICAgICAgICByZXR1cm4geCAqIHgyICsgeSAqIHkyICsgeiAqIHoyO1xuICAgIH1cbiAgICBzdGF0aWMgZGlzdGFuY2UodjEsIHYyKSB7XG4gICAgICAgIHJldHVybiBzcXJ0KHRoaXMuc3F1YXJlZERpc3RhbmNlKHYxLCB2MikpO1xuICAgIH1cbiAgICBzdGF0aWMgc3F1YXJlZERpc3RhbmNlKHYxLCB2Mikge1xuICAgICAgICBjb25zdCB4ID0gdjIueCAtIHYxLng7XG4gICAgICAgIGNvbnN0IHkgPSB2Mi55IC0gdjEueTtcbiAgICAgICAgY29uc3QgeiA9IHYyLnogLSB2MS56O1xuICAgICAgICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xuICAgIH1cbiAgICBzdGF0aWMgZGlyZWN0aW9uKHYxLCB2MiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB4ID0gdjEueCAtIHYyLng7XG4gICAgICAgIGNvbnN0IHkgPSB2MS55IC0gdjIueTtcbiAgICAgICAgY29uc3QgeiA9IHYxLnogLSB2Mi56O1xuICAgICAgICBsZXQgbGVuZ3RoID0gc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xuICAgICAgICBpZiAobGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBkZXN0LnggPSAwO1xuICAgICAgICAgICAgZGVzdC55ID0gMDtcbiAgICAgICAgICAgIGRlc3QueiA9IDA7XG4gICAgICAgICAgICByZXR1cm4gZGVzdDtcbiAgICAgICAgfVxuICAgICAgICBsZW5ndGggPSAxIC8gbGVuZ3RoO1xuICAgICAgICBkZXN0LnggPSB4ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnkgPSB5ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnogPSB6ICogbGVuZ3RoO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG1peCh2MSwgdjIsIHRpbWUsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdjEueCArIHRpbWUgKiAodjIueCAtIHYxLngpO1xuICAgICAgICBkZXN0LnkgPSB2MS55ICsgdGltZSAqICh2Mi55IC0gdjEueSk7XG4gICAgICAgIGRlc3QueiA9IHYxLnogKyB0aW1lICogKHYyLnogLSB2MS56KTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBhZGQodjEsIHYyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHYxLnggKyB2Mi54O1xuICAgICAgICBkZXN0LnkgPSB2MS55ICsgdjIueTtcbiAgICAgICAgZGVzdC56ID0gdjEueiArIHYyLno7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgc3VidHJhY3QodjEsIHYyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHYxLnggLSB2Mi54O1xuICAgICAgICBkZXN0LnkgPSB2MS55IC0gdjIueTtcbiAgICAgICAgZGVzdC56ID0gdjEueiAtIHYyLno7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbXVsdGlwbHkodjEsIHYyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHYxLnggKiB2Mi54O1xuICAgICAgICBkZXN0LnkgPSB2MS55ICogdjIueTtcbiAgICAgICAgZGVzdC56ID0gdjEueiAqIHYyLno7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZGl2aWRlKHYxLCB2MiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2MS54IC8gdjIueDtcbiAgICAgICAgZGVzdC55ID0gdjEueSAvIHYyLnk7XG4gICAgICAgIGRlc3QueiA9IHYxLnogLyB2Mi56O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIHNjYWxlKHZlY3Rvciwgc2NhbGFyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZWN0b3Iuc2NhbGUoc2NhbGFyLCBkZXN0KTtcbiAgICB9XG4gICAgc3RhdGljIG5vcm1hbGl6ZSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlY3Rvci5ub3JtYWxpemUoZGVzdCk7XG4gICAgfVxuICAgIHN0YXRpYyBzdW0oLi4udmVjdG9ycykge1xuICAgICAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzMoKTtcbiAgICAgICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xuICAgICAgICAgICAgZGVzdC54ICs9IHZlY3Rvci54O1xuICAgICAgICAgICAgZGVzdC55ICs9IHZlY3Rvci55O1xuICAgICAgICAgICAgZGVzdC56ICs9IHZlY3Rvci56O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZGlmZmVyZW5jZSguLi52ZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjMygpO1xuICAgICAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XG4gICAgICAgICAgICBkZXN0LnggLT0gdmVjdG9yLng7XG4gICAgICAgICAgICBkZXN0LnkgLT0gdmVjdG9yLnk7XG4gICAgICAgICAgICBkZXN0LnogLT0gdmVjdG9yLno7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBwcm9kdWN0KC4uLnZlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcbiAgICAgICAgICAgIGRlc3QueCAqPSB2ZWN0b3IueDtcbiAgICAgICAgICAgIGRlc3QueSAqPSB2ZWN0b3IueTtcbiAgICAgICAgICAgIGRlc3QueiAqPSB2ZWN0b3IuejtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGRpdmlzaW9uKC4uLnZlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IG5ldyB2ZWMzKCk7XG4gICAgICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcbiAgICAgICAgICAgIGRlc3QueCAvPSB2ZWN0b3IueDtcbiAgICAgICAgICAgIGRlc3QueSAvPSB2ZWN0b3IueTtcbiAgICAgICAgICAgIGRlc3QueiAvPSB2ZWN0b3IuejtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBFcHNpbG9uIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuY29uc3QgeyBtaW4sIG1heCwgYWJzLCBzcXJ0IH0gPSBNYXRoO1xuZXhwb3J0IGNsYXNzIHZlYzQgZXh0ZW5kcyBGbG9hdDMyQXJyYXkge1xuICAgIHN0YXRpYyB6ZXJvID0gbmV3IHZlYzQoWzAuMCwgMC4wLCAwLjAsIDEuMF0pO1xuICAgIHN0YXRpYyBvbmUgPSBuZXcgdmVjNChbMS4wLCAxLjAsIDEuMCwgMS4wXSk7XG4gICAgY29uc3RydWN0b3IodmFsdWVzID0gWzAuMCwgMC4wLCAwLjAsIDEuMF0pIHtcbiAgICAgICAgc3VwZXIodmFsdWVzLnNsaWNlKDAsIDQpKTtcbiAgICB9XG4gICAgZ2V0IHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdO1xuICAgIH1cbiAgICBzZXQgeCh4KSB7XG4gICAgICAgIHRoaXNbMF0gPSB4O1xuICAgIH1cbiAgICBnZXQgeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbMV07XG4gICAgfVxuICAgIHNldCB5KHkpIHtcbiAgICAgICAgdGhpc1sxXSA9IHk7XG4gICAgfVxuICAgIGdldCB6KCkge1xuICAgICAgICByZXR1cm4gdGhpc1syXTtcbiAgICB9XG4gICAgc2V0IHooeikge1xuICAgICAgICB0aGlzWzJdID0gejtcbiAgICB9XG4gICAgZ2V0IHcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzNdO1xuICAgIH1cbiAgICBzZXQgdyh3KSB7XG4gICAgICAgIHRoaXNbM10gPSB3O1xuICAgIH1cbiAgICBnZXQgeHl6dygpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcyk7XG4gICAgfVxuICAgIHNldCB4eXp3KHh5encpIHtcbiAgICAgICAgdGhpcy5zZXQoeHl6dyk7XG4gICAgfVxuICAgIGdldCByZ2JhKCkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbiAgICB9XG4gICAgc2V0IHJnYmEocmdiYSkge1xuICAgICAgICB0aGlzLnNldChyZ2JhKTtcbiAgICB9XG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHNxcnQodGhpcy5zcXVhcmVkTGVuZ3RoKTtcbiAgICB9XG4gICAgZ2V0IHNxdWFyZWRMZW5ndGgoKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiwgdyB9ID0gdGhpcztcbiAgICAgICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogeiArIHcgKiB3O1xuICAgIH1cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy54ID0gMC4wO1xuICAgICAgICB0aGlzLnkgPSAwLjA7XG4gICAgICAgIHRoaXMueiA9IDAuMDtcbiAgICAgICAgdGhpcy53ID0gMS4wO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgY29weShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueDtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55O1xuICAgICAgICBkZXN0LnogPSB0aGlzLno7XG4gICAgICAgIGRlc3QudyA9IHRoaXMudztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIG5lZ2F0ZShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IC10aGlzLng7XG4gICAgICAgIGRlc3QueSA9IC10aGlzLnk7XG4gICAgICAgIGRlc3QueiA9IC10aGlzLno7XG4gICAgICAgIGRlc3QudyA9IC10aGlzLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBlcXVhbHModmVjdG9yLCB0aHJlc2hvbGQgPSBFcHNpbG9uKSB7XG4gICAgICAgIGlmIChhYnModGhpcy54IC0gdmVjdG9yLngpID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFicyh0aGlzLnkgLSB2ZWN0b3IueSkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWJzKHRoaXMueiAtIHZlY3Rvci56KSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhYnModGhpcy53IC0gdmVjdG9yLncpID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGFkZCh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICsgdmVjdG9yLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSArIHZlY3Rvci55O1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogKyB2ZWN0b3IuejtcbiAgICAgICAgZGVzdC53ID0gdGhpcy53ICsgdmVjdG9yLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdWJ0cmFjdCh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54IC0gdmVjdG9yLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAtIHZlY3Rvci55O1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogLSB2ZWN0b3IuejtcbiAgICAgICAgZGVzdC53ID0gdGhpcy53IC0gdmVjdG9yLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBtdWx0aXBseSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICogdmVjdG9yLng7XG4gICAgICAgIGRlc3QueSA9IHRoaXMueSAqIHZlY3Rvci55O1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogKiB2ZWN0b3IuejtcbiAgICAgICAgZGVzdC53ID0gdGhpcy53ICogdmVjdG9yLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBkaXZpZGUodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAvIHZlY3Rvci54O1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgLyB2ZWN0b3IueTtcbiAgICAgICAgZGVzdC56ID0gdGhpcy56IC8gdmVjdG9yLno7XG4gICAgICAgIGRlc3QudyA9IHRoaXMudyAvIHZlY3Rvci53O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc2NhbGUoc2NhbGFyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHRoaXMueCAqIHNjYWxhcjtcbiAgICAgICAgZGVzdC55ID0gdGhpcy55ICogc2NhbGFyO1xuICAgICAgICBkZXN0LnogPSB0aGlzLnogKiBzY2FsYXI7XG4gICAgICAgIGRlc3QudyA9IHRoaXMudyAqIHNjYWxhcjtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIG5vcm1hbGl6ZShkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZGVzdC54ID0gMDtcbiAgICAgICAgICAgIGRlc3QueSA9IDA7XG4gICAgICAgICAgICBkZXN0LnogPSAwO1xuICAgICAgICAgICAgZGVzdC53ID0gMDtcbiAgICAgICAgICAgIHJldHVybiBkZXN0O1xuICAgICAgICB9XG4gICAgICAgIGxlbmd0aCA9IDEuMCAvIGxlbmd0aDtcbiAgICAgICAgZGVzdC54ID0gdGhpcy54ICogbGVuZ3RoO1xuICAgICAgICBkZXN0LnkgPSB0aGlzLnkgKiBsZW5ndGg7XG4gICAgICAgIGRlc3QueiA9IHRoaXMueiAqIGxlbmd0aDtcbiAgICAgICAgZGVzdC53ID0gdGhpcy53ICogbGVuZ3RoO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgdHJhbnNmb3JtKG1hdHJpeCwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gdGhpcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0cml4LnRyYW5zZm9ybSh0aGlzLCBkZXN0KTtcbiAgICB9XG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgICBjb25zdCB7IHgsIHksIHosIHcgfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBbeCwgeSwgeiwgd107XG4gICAgfVxuICAgIHN0YXRpYyBhc3luYyBkZXNlcmlhbGl6ZSh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyB2ZWM0KHZhbHVlcyk7XG4gICAgfVxuICAgIHN0YXRpYyBhYnNvbHV0ZSh2ZWN0b3IsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gYWJzKHZlY3Rvci54KTtcbiAgICAgICAgZGVzdC55ID0gYWJzKHZlY3Rvci55KTtcbiAgICAgICAgZGVzdC56ID0gYWJzKHZlY3Rvci56KTtcbiAgICAgICAgZGVzdC53ID0gYWJzKHZlY3Rvci53KTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtaW5pbXVtKHZlY3RvciwgdmVjdG9yMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSBtaW4odmVjdG9yLngsIHZlY3RvcjIueCk7XG4gICAgICAgIGRlc3QueSA9IG1pbih2ZWN0b3IueSwgdmVjdG9yMi55KTtcbiAgICAgICAgZGVzdC56ID0gbWluKHZlY3Rvci56LCB2ZWN0b3IyLnopO1xuICAgICAgICBkZXN0LnogPSBtaW4odmVjdG9yLncsIHZlY3RvcjIudyk7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgbWF4aW11bSh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gbWF4KHZlY3Rvci54LCB2ZWN0b3IyLngpO1xuICAgICAgICBkZXN0LnkgPSBtYXgodmVjdG9yLnksIHZlY3RvcjIueSk7XG4gICAgICAgIGRlc3QueiA9IG1heCh2ZWN0b3IueiwgdmVjdG9yMi56KTtcbiAgICAgICAgZGVzdC56ID0gbWF4KHZlY3Rvci53LCB2ZWN0b3IyLncpO1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIG1peCh2ZWN0b3IsIHZlY3RvcjIsIHRpbWUsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdmVjdG9yLnggKyB0aW1lICogKHZlY3RvcjIueCAtIHZlY3Rvci54KTtcbiAgICAgICAgZGVzdC55ID0gdmVjdG9yLnkgKyB0aW1lICogKHZlY3RvcjIueSAtIHZlY3Rvci55KTtcbiAgICAgICAgZGVzdC56ID0gdmVjdG9yLnogKyB0aW1lICogKHZlY3RvcjIueiAtIHZlY3Rvci56KTtcbiAgICAgICAgZGVzdC53ID0gdmVjdG9yLncgKyB0aW1lICogKHZlY3RvcjIudyAtIHZlY3Rvci53KTtcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBhZGQodmVjdG9yLCB2ZWN0b3IyLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICB9XG4gICAgICAgIGRlc3QueCA9IHZlY3Rvci54ICsgdmVjdG9yMi54O1xuICAgICAgICBkZXN0LnkgPSB2ZWN0b3IueSArIHZlY3RvcjIueTtcbiAgICAgICAgZGVzdC56ID0gdmVjdG9yLnogKyB2ZWN0b3IyLno7XG4gICAgICAgIGRlc3QudyA9IHZlY3Rvci53ICsgdmVjdG9yMi53O1xuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIHN1YnRyYWN0KHZlY3RvciwgdmVjdG9yMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2ZWN0b3IueCAtIHZlY3RvcjIueDtcbiAgICAgICAgZGVzdC55ID0gdmVjdG9yLnkgLSB2ZWN0b3IyLnk7XG4gICAgICAgIGRlc3QueiA9IHZlY3Rvci56IC0gdmVjdG9yMi56O1xuICAgICAgICBkZXN0LncgPSB2ZWN0b3IudyAtIHZlY3RvcjIudztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBtdWx0aXBseSh2ZWN0b3IsIHZlY3RvcjIsIGRlc3QgPSBudWxsKSB7XG4gICAgICAgIGlmICghZGVzdCkge1xuICAgICAgICAgICAgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVzdC54ID0gdmVjdG9yLnggKiB2ZWN0b3IyLng7XG4gICAgICAgIGRlc3QueSA9IHZlY3Rvci55ICogdmVjdG9yMi55O1xuICAgICAgICBkZXN0LnogPSB2ZWN0b3IueiAqIHZlY3RvcjIuejtcbiAgICAgICAgZGVzdC53ID0gdmVjdG9yLncgKiB2ZWN0b3IyLnc7XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgZGl2aWRlKHZlY3RvciwgdmVjdG9yMiwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXN0LnggPSB2ZWN0b3IueCAvIHZlY3RvcjIueDtcbiAgICAgICAgZGVzdC55ID0gdmVjdG9yLnkgLyB2ZWN0b3IyLnk7XG4gICAgICAgIGRlc3QueiA9IHZlY3Rvci56IC8gdmVjdG9yMi56O1xuICAgICAgICBkZXN0LncgPSB2ZWN0b3IudyAvIHZlY3RvcjIudztcbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBzY2FsZSh2ZWN0b3IsIHNjYWxhciwgZGVzdCA9IG51bGwpIHtcbiAgICAgICAgaWYgKCFkZXN0KSB7XG4gICAgICAgICAgICBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmVjdG9yLnNjYWxlKHNjYWxhciwgZGVzdCk7XG4gICAgfVxuICAgIHN0YXRpYyBub3JtYWxpemUodmVjdG9yLCBkZXN0ID0gbnVsbCkge1xuICAgICAgICBpZiAoIWRlc3QpIHtcbiAgICAgICAgICAgIGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZWN0b3Iubm9ybWFsaXplKGRlc3QpO1xuICAgIH1cbiAgICBzdGF0aWMgc3VtKC4uLnZlY3RvcnMpIHtcbiAgICAgICAgY29uc3QgZGVzdCA9IG5ldyB2ZWM0KCk7XG4gICAgICAgIGZvciAoY29uc3QgdmVjdG9yIG9mIHZlY3RvcnMpIHtcbiAgICAgICAgICAgIGRlc3QueCArPSB2ZWN0b3IueDtcbiAgICAgICAgICAgIGRlc3QueSArPSB2ZWN0b3IueTtcbiAgICAgICAgICAgIGRlc3QueiArPSB2ZWN0b3IuejtcbiAgICAgICAgICAgIGRlc3QudyArPSB2ZWN0b3IudztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVzdDtcbiAgICB9XG4gICAgc3RhdGljIGRpZmZlcmVuY2UoLi4udmVjdG9ycykge1xuICAgICAgICBjb25zdCBkZXN0ID0gbmV3IHZlYzQoKTtcbiAgICAgICAgZm9yIChjb25zdCB2ZWN0b3Igb2YgdmVjdG9ycykge1xuICAgICAgICAgICAgZGVzdC54IC09IHZlY3Rvci54O1xuICAgICAgICAgICAgZGVzdC55IC09IHZlY3Rvci55O1xuICAgICAgICAgICAgZGVzdC56IC09IHZlY3Rvci56O1xuICAgICAgICAgICAgZGVzdC53IC09IHZlY3Rvci53O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0O1xuICAgIH1cbiAgICBzdGF0aWMgcHJvZHVjdCguLi52ZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XG4gICAgICAgICAgICBkZXN0LnggKj0gdmVjdG9yLng7XG4gICAgICAgICAgICBkZXN0LnkgKj0gdmVjdG9yLnk7XG4gICAgICAgICAgICBkZXN0LnogKj0gdmVjdG9yLno7XG4gICAgICAgICAgICBkZXN0LncgKj0gdmVjdG9yLnc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxuICAgIHN0YXRpYyBkaXZpc2lvbiguLi52ZWN0b3JzKSB7XG4gICAgICAgIGNvbnN0IGRlc3QgPSBuZXcgdmVjNCgpO1xuICAgICAgICBmb3IgKGNvbnN0IHZlY3RvciBvZiB2ZWN0b3JzKSB7XG4gICAgICAgICAgICBkZXN0LnggLz0gdmVjdG9yLng7XG4gICAgICAgICAgICBkZXN0LnkgLz0gdmVjdG9yLnk7XG4gICAgICAgICAgICBkZXN0LnogLz0gdmVjdG9yLno7XG4gICAgICAgICAgICBkZXN0LncgLz0gdmVjdG9yLnc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlc3Q7XG4gICAgfVxufVxuIiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5Db3B5cmlnaHQgKEMpIE1pY3Jvc29mdC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90IHVzZVxudGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGVcbkxpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblRISVMgQ09ERSBJUyBQUk9WSURFRCBPTiBBTiAqQVMgSVMqIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTllcbktJTkQsIEVJVEhFUiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBXSVRIT1VUIExJTUlUQVRJT04gQU5ZIElNUExJRURcbldBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBUSVRMRSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UsXG5NRVJDSEFOVEFCTElUWSBPUiBOT04tSU5GUklOR0VNRU5ULlxuXG5TZWUgdGhlIEFwYWNoZSBWZXJzaW9uIDIuMCBMaWNlbnNlIGZvciBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnNcbmFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG52YXIgUmVmbGVjdDtcbihmdW5jdGlvbiAoUmVmbGVjdCkge1xuICAgIC8vIE1ldGFkYXRhIFByb3Bvc2FsXG4gICAgLy8gaHR0cHM6Ly9yYnVja3Rvbi5naXRodWIuaW8vcmVmbGVjdC1tZXRhZGF0YS9cbiAgICAoZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICAgICAgdmFyIHJvb3QgPSB0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbFRoaXMgOlxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6XG4gICAgICAgICAgICAgICAgdHlwZW9mIHNlbGYgPT09IFwib2JqZWN0XCIgPyBzZWxmIDpcbiAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHRoaXMgPT09IFwib2JqZWN0XCIgPyB0aGlzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsb3BweU1vZGVUaGlzKCk7XG4gICAgICAgIHZhciBleHBvcnRlciA9IG1ha2VFeHBvcnRlcihSZWZsZWN0KTtcbiAgICAgICAgaWYgKHR5cGVvZiByb290LlJlZmxlY3QgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGV4cG9ydGVyID0gbWFrZUV4cG9ydGVyKHJvb3QuUmVmbGVjdCwgZXhwb3J0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGZhY3RvcnkoZXhwb3J0ZXIsIHJvb3QpO1xuICAgICAgICBpZiAodHlwZW9mIHJvb3QuUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgcm9vdC5SZWZsZWN0ID0gUmVmbGVjdDtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBtYWtlRXhwb3J0ZXIodGFyZ2V0LCBwcmV2aW91cykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXMpXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBmdW5jdGlvblRoaXMoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBGdW5jdGlvbihcInJldHVybiB0aGlzO1wiKSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKF8pIHsgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGluZGlyZWN0RXZhbFRoaXMoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiAodm9pZCAwLCBldmFsKShcIihmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pKClcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoXykgeyB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc2xvcHB5TW9kZVRoaXMoKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb25UaGlzKCkgfHwgaW5kaXJlY3RFdmFsVGhpcygpO1xuICAgICAgICB9XG4gICAgfSkoZnVuY3Rpb24gKGV4cG9ydGVyLCByb290KSB7XG4gICAgICAgIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICAgICAgICAvLyBmZWF0dXJlIHRlc3QgZm9yIFN5bWJvbCBzdXBwb3J0XG4gICAgICAgIHZhciBzdXBwb3J0c1N5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIjtcbiAgICAgICAgdmFyIHRvUHJpbWl0aXZlU3ltYm9sID0gc3VwcG9ydHNTeW1ib2wgJiYgdHlwZW9mIFN5bWJvbC50b1ByaW1pdGl2ZSAhPT0gXCJ1bmRlZmluZWRcIiA/IFN5bWJvbC50b1ByaW1pdGl2ZSA6IFwiQEB0b1ByaW1pdGl2ZVwiO1xuICAgICAgICB2YXIgaXRlcmF0b3JTeW1ib2wgPSBzdXBwb3J0c1N5bWJvbCAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yICE9PSBcInVuZGVmaW5lZFwiID8gU3ltYm9sLml0ZXJhdG9yIDogXCJAQGl0ZXJhdG9yXCI7XG4gICAgICAgIHZhciBzdXBwb3J0c0NyZWF0ZSA9IHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSBcImZ1bmN0aW9uXCI7IC8vIGZlYXR1cmUgdGVzdCBmb3IgT2JqZWN0LmNyZWF0ZSBzdXBwb3J0XG4gICAgICAgIHZhciBzdXBwb3J0c1Byb3RvID0geyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheTsgLy8gZmVhdHVyZSB0ZXN0IGZvciBfX3Byb3RvX18gc3VwcG9ydFxuICAgICAgICB2YXIgZG93bkxldmVsID0gIXN1cHBvcnRzQ3JlYXRlICYmICFzdXBwb3J0c1Byb3RvO1xuICAgICAgICB2YXIgSGFzaE1hcCA9IHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhbiBvYmplY3QgaW4gZGljdGlvbmFyeSBtb2RlIChhLmsuYS4gXCJzbG93XCIgbW9kZSBpbiB2OClcbiAgICAgICAgICAgIGNyZWF0ZTogc3VwcG9ydHNDcmVhdGVcbiAgICAgICAgICAgICAgICA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIE1ha2VEaWN0aW9uYXJ5KE9iamVjdC5jcmVhdGUobnVsbCkpOyB9XG4gICAgICAgICAgICAgICAgOiBzdXBwb3J0c1Byb3RvXG4gICAgICAgICAgICAgICAgICAgID8gZnVuY3Rpb24gKCkgeyByZXR1cm4gTWFrZURpY3Rpb25hcnkoeyBfX3Byb3RvX186IG51bGwgfSk7IH1cbiAgICAgICAgICAgICAgICAgICAgOiBmdW5jdGlvbiAoKSB7IHJldHVybiBNYWtlRGljdGlvbmFyeSh7fSk7IH0sXG4gICAgICAgICAgICBoYXM6IGRvd25MZXZlbFxuICAgICAgICAgICAgICAgID8gZnVuY3Rpb24gKG1hcCwga2V5KSB7IHJldHVybiBoYXNPd24uY2FsbChtYXAsIGtleSk7IH1cbiAgICAgICAgICAgICAgICA6IGZ1bmN0aW9uIChtYXAsIGtleSkgeyByZXR1cm4ga2V5IGluIG1hcDsgfSxcbiAgICAgICAgICAgIGdldDogZG93bkxldmVsXG4gICAgICAgICAgICAgICAgPyBmdW5jdGlvbiAobWFwLCBrZXkpIHsgcmV0dXJuIGhhc093bi5jYWxsKG1hcCwga2V5KSA/IG1hcFtrZXldIDogdW5kZWZpbmVkOyB9XG4gICAgICAgICAgICAgICAgOiBmdW5jdGlvbiAobWFwLCBrZXkpIHsgcmV0dXJuIG1hcFtrZXldOyB9LFxuICAgICAgICB9O1xuICAgICAgICAvLyBMb2FkIGdsb2JhbCBvciBzaGltIHZlcnNpb25zIG9mIE1hcCwgU2V0LCBhbmQgV2Vha01hcFxuICAgICAgICB2YXIgZnVuY3Rpb25Qcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoRnVuY3Rpb24pO1xuICAgICAgICB2YXIgX01hcCA9IHR5cGVvZiBNYXAgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgTWFwLnByb3RvdHlwZS5lbnRyaWVzID09PSBcImZ1bmN0aW9uXCIgPyBNYXAgOiBDcmVhdGVNYXBQb2x5ZmlsbCgpO1xuICAgICAgICB2YXIgX1NldCA9IHR5cGVvZiBTZXQgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU2V0LnByb3RvdHlwZS5lbnRyaWVzID09PSBcImZ1bmN0aW9uXCIgPyBTZXQgOiBDcmVhdGVTZXRQb2x5ZmlsbCgpO1xuICAgICAgICB2YXIgX1dlYWtNYXAgPSB0eXBlb2YgV2Vha01hcCA9PT0gXCJmdW5jdGlvblwiID8gV2Vha01hcCA6IENyZWF0ZVdlYWtNYXBQb2x5ZmlsbCgpO1xuICAgICAgICB2YXIgcmVnaXN0cnlTeW1ib2wgPSBzdXBwb3J0c1N5bWJvbCA/IFN5bWJvbC5mb3IoXCJAcmVmbGVjdC1tZXRhZGF0YTpyZWdpc3RyeVwiKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIG1ldGFkYXRhUmVnaXN0cnkgPSBHZXRPckNyZWF0ZU1ldGFkYXRhUmVnaXN0cnkoKTtcbiAgICAgICAgdmFyIG1ldGFkYXRhUHJvdmlkZXIgPSBDcmVhdGVNZXRhZGF0YVByb3ZpZGVyKG1ldGFkYXRhUmVnaXN0cnkpO1xuICAgICAgICAvKipcbiAgICAgICAgICogQXBwbGllcyBhIHNldCBvZiBkZWNvcmF0b3JzIHRvIGEgcHJvcGVydHkgb2YgYSB0YXJnZXQgb2JqZWN0LlxuICAgICAgICAgKiBAcGFyYW0gZGVjb3JhdG9ycyBBbiBhcnJheSBvZiBkZWNvcmF0b3JzLlxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0LlxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IHRvIGRlY29yYXRlLlxuICAgICAgICAgKiBAcGFyYW0gYXR0cmlidXRlcyAoT3B0aW9uYWwpIFRoZSBwcm9wZXJ0eSBkZXNjcmlwdG9yIGZvciB0aGUgdGFyZ2V0IGtleS5cbiAgICAgICAgICogQHJlbWFya3MgRGVjb3JhdG9ycyBhcmUgYXBwbGllZCBpbiByZXZlcnNlIG9yZGVyLlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxuICAgICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cbiAgICAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgICAgICAqICAgICBFeGFtcGxlID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiLFxuICAgICAgICAgKiAgICAgICAgIFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiLFxuICAgICAgICAgKiAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpKSk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIixcbiAgICAgICAgICogICAgICAgICBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnNBcnJheSwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIsXG4gICAgICAgICAqICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpKSk7XG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBkZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3BlcnR5S2V5KSkge1xuICAgICAgICAgICAgICAgIGlmICghSXNBcnJheShkZWNvcmF0b3JzKSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgIGlmICghSXNPYmplY3QoYXR0cmlidXRlcykgJiYgIUlzVW5kZWZpbmVkKGF0dHJpYnV0ZXMpICYmICFJc051bGwoYXR0cmlidXRlcykpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICBpZiAoSXNOdWxsKGF0dHJpYnV0ZXMpKVxuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHByb3BlcnR5S2V5ID0gVG9Qcm9wZXJ0eUtleShwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIERlY29yYXRlUHJvcGVydHkoZGVjb3JhdG9ycywgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIUlzQXJyYXkoZGVjb3JhdG9ycykpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICBpZiAoIUlzQ29uc3RydWN0b3IodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBEZWNvcmF0ZUNvbnN0cnVjdG9yKGRlY29yYXRvcnMsIHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0ZXIoXCJkZWNvcmF0ZVwiLCBkZWNvcmF0ZSk7XG4gICAgICAgIC8vIDQuMS4yIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpXG4gICAgICAgIC8vIGh0dHBzOi8vcmJ1Y2t0b24uZ2l0aHViLmlvL3JlZmxlY3QtbWV0YWRhdGEvI3JlZmxlY3QubWV0YWRhdGFcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgZGVmYXVsdCBtZXRhZGF0YSBkZWNvcmF0b3IgZmFjdG9yeSB0aGF0IGNhbiBiZSB1c2VkIG9uIGEgY2xhc3MsIGNsYXNzIG1lbWJlciwgb3IgcGFyYW1ldGVyLlxuICAgICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgVGhlIGtleSBmb3IgdGhlIG1ldGFkYXRhIGVudHJ5LlxuICAgICAgICAgKiBAcGFyYW0gbWV0YWRhdGFWYWx1ZSBUaGUgdmFsdWUgZm9yIHRoZSBtZXRhZGF0YSBlbnRyeS5cbiAgICAgICAgICogQHJldHVybnMgQSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gICAgICAgICAqIEByZW1hcmtzXG4gICAgICAgICAqIElmIGBtZXRhZGF0YUtleWAgaXMgYWxyZWFkeSBkZWZpbmVkIGZvciB0aGUgdGFyZ2V0IGFuZCB0YXJnZXQga2V5LCB0aGVcbiAgICAgICAgICogbWV0YWRhdGFWYWx1ZSBmb3IgdGhhdCBrZXkgd2lsbCBiZSBvdmVyd3JpdHRlbi5cbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgICAgICAqICAgICBAUmVmbGVjdC5tZXRhZGF0YShrZXksIHZhbHVlKVxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IsIFR5cGVTY3JpcHQgb25seSlcbiAgICAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xuICAgICAgICAgKiAgICAgICAgIEBSZWZsZWN0Lm1ldGFkYXRhKGtleSwgdmFsdWUpXG4gICAgICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xuICAgICAgICAgKiAgICAgfVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSwgVHlwZVNjcmlwdCBvbmx5KVxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgQFJlZmxlY3QubWV0YWRhdGEoa2V5LCB2YWx1ZSlcbiAgICAgICAgICogICAgICAgICBwcm9wZXJ0eTtcbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcbiAgICAgICAgICogICAgICAgICBAUmVmbGVjdC5tZXRhZGF0YShrZXksIHZhbHVlKVxuICAgICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QoKSB7IH1cbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgQFJlZmxlY3QubWV0YWRhdGEoa2V5LCB2YWx1ZSlcbiAgICAgICAgICogICAgICAgICBtZXRob2QoKSB7IH1cbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIG1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBkZWNvcmF0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSkge1xuICAgICAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvcGVydHlLZXkpICYmICFJc1Byb3BlcnR5S2V5KHByb3BlcnR5S2V5KSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgIE9yZGluYXJ5RGVmaW5lT3duTWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUsIHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRlY29yYXRvcjtcbiAgICAgICAgfVxuICAgICAgICBleHBvcnRlcihcIm1ldGFkYXRhXCIsIG1ldGFkYXRhKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlZmluZSBhIHVuaXF1ZSBtZXRhZGF0YSBlbnRyeSBvbiB0aGUgdGFyZ2V0LlxuICAgICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgQSBrZXkgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmlldmUgbWV0YWRhdGEuXG4gICAgICAgICAqIEBwYXJhbSBtZXRhZGF0YVZhbHVlIEEgdmFsdWUgdGhhdCBjb250YWlucyBhdHRhY2hlZCBtZXRhZGF0YS5cbiAgICAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0byBkZWZpbmUgbWV0YWRhdGEuXG4gICAgICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAoT3B0aW9uYWwpIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XG4gICAgICAgICAqICAgICAgICAgLy8gc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgICAgIGNvbnN0cnVjdG9yKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgfVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcbiAgICAgICAgICogICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBvcHRpb25zLCBFeGFtcGxlKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBvcHRpb25zLCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBvcHRpb25zLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICBSZWZsZWN0LmRlZmluZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgb3B0aW9ucywgRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBvcHRpb25zLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBkZWNvcmF0b3IgZmFjdG9yeSBhcyBtZXRhZGF0YS1wcm9kdWNpbmcgYW5ub3RhdGlvbi5cbiAgICAgICAgICogICAgIGZ1bmN0aW9uIE15QW5ub3RhdGlvbihvcHRpb25zKTogRGVjb3JhdG9yIHtcbiAgICAgICAgICogICAgICAgICByZXR1cm4gKHRhcmdldCwga2V5PykgPT4gUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIG9wdGlvbnMsIHRhcmdldCwga2V5KTtcbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGRlZmluZU1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlLCB0YXJnZXQsIHByb3BlcnR5S2V5KSB7XG4gICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChwcm9wZXJ0eUtleSkpXG4gICAgICAgICAgICAgICAgcHJvcGVydHlLZXkgPSBUb1Byb3BlcnR5S2V5KHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIHJldHVybiBPcmRpbmFyeURlZmluZU93bk1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlLCB0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuICAgICAgICBleHBvcnRlcihcImRlZmluZU1ldGFkYXRhXCIsIGRlZmluZU1ldGFkYXRhKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldHMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHRhcmdldCBvYmplY3Qgb3IgaXRzIHByb3RvdHlwZSBjaGFpbiBoYXMgdGhlIHByb3ZpZGVkIG1ldGFkYXRhIGtleSBkZWZpbmVkLlxuICAgICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgQSBrZXkgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmlldmUgbWV0YWRhdGEuXG4gICAgICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXG4gICAgICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAoT3B0aW9uYWwpIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXG4gICAgICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgbWV0YWRhdGEga2V5IHdhcyBkZWZpbmVkIG9uIHRoZSB0YXJnZXQgb2JqZWN0IG9yIGl0cyBwcm90b3R5cGUgY2hhaW47IG90aGVyd2lzZSwgYGZhbHNlYC5cbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcbiAgICAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAgICAgY29uc3RydWN0b3IocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIGhhc01ldGFkYXRhKG1ldGFkYXRhS2V5LCB0YXJnZXQsIHByb3BlcnR5S2V5KSB7XG4gICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChwcm9wZXJ0eUtleSkpXG4gICAgICAgICAgICAgICAgcHJvcGVydHlLZXkgPSBUb1Byb3BlcnR5S2V5KHByb3BlcnR5S2V5KTtcbiAgICAgICAgICAgIHJldHVybiBPcmRpbmFyeUhhc01ldGFkYXRhKG1ldGFkYXRhS2V5LCB0YXJnZXQsIHByb3BlcnR5S2V5KTtcbiAgICAgICAgfVxuICAgICAgICBleHBvcnRlcihcImhhc01ldGFkYXRhXCIsIGhhc01ldGFkYXRhKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEdldHMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHRhcmdldCBvYmplY3QgaGFzIHRoZSBwcm92aWRlZCBtZXRhZGF0YSBrZXkgZGVmaW5lZC5cbiAgICAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxuICAgICAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG1ldGFkYXRhIGtleSB3YXMgZGVmaW5lZCBvbiB0aGUgdGFyZ2V0IG9iamVjdDsgb3RoZXJ3aXNlLCBgZmFsc2VgLlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxuICAgICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cbiAgICAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0Lmhhc093bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0Lmhhc093bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0Lmhhc093bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0Lmhhc093bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gaGFzT3duTWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgcHJvcGVydHlLZXkpIHtcbiAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3BlcnR5S2V5KSlcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUtleSA9IFRvUHJvcGVydHlLZXkocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgcmV0dXJuIE9yZGluYXJ5SGFzT3duTWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGV4cG9ydGVyKFwiaGFzT3duTWV0YWRhdGFcIiwgaGFzT3duTWV0YWRhdGEpO1xuICAgICAgICAvKipcbiAgICAgICAgICogR2V0cyB0aGUgbWV0YWRhdGEgdmFsdWUgZm9yIHRoZSBwcm92aWRlZCBtZXRhZGF0YSBrZXkgb24gdGhlIHRhcmdldCBvYmplY3Qgb3IgaXRzIHByb3RvdHlwZSBjaGFpbi5cbiAgICAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxuICAgICAgICAgKiBAcmV0dXJucyBUaGUgbWV0YWRhdGEgdmFsdWUgZm9yIHRoZSBtZXRhZGF0YSBrZXkgaWYgZm91bmQ7IG90aGVyd2lzZSwgYHVuZGVmaW5lZGAuXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XG4gICAgICAgICAqICAgICAgICAgLy8gc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgICAgIGNvbnN0cnVjdG9yKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgfVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBnZXRNZXRhZGF0YShtZXRhZGF0YUtleSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSkge1xuICAgICAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvcGVydHlLZXkpKVxuICAgICAgICAgICAgICAgIHByb3BlcnR5S2V5ID0gVG9Qcm9wZXJ0eUtleShwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICByZXR1cm4gT3JkaW5hcnlHZXRNZXRhZGF0YShtZXRhZGF0YUtleSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0ZXIoXCJnZXRNZXRhZGF0YVwiLCBnZXRNZXRhZGF0YSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXRzIHRoZSBtZXRhZGF0YSB2YWx1ZSBmb3IgdGhlIHByb3ZpZGVkIG1ldGFkYXRhIGtleSBvbiB0aGUgdGFyZ2V0IG9iamVjdC5cbiAgICAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxuICAgICAgICAgKiBAcmV0dXJucyBUaGUgbWV0YWRhdGEgdmFsdWUgZm9yIHRoZSBtZXRhZGF0YSBrZXkgaWYgZm91bmQ7IG90aGVyd2lzZSwgYHVuZGVmaW5lZGAuXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XG4gICAgICAgICAqICAgICAgICAgLy8gc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgICAgIGNvbnN0cnVjdG9yKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgfVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBnZXRPd25NZXRhZGF0YShtZXRhZGF0YUtleSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSkge1xuICAgICAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvcGVydHlLZXkpKVxuICAgICAgICAgICAgICAgIHByb3BlcnR5S2V5ID0gVG9Qcm9wZXJ0eUtleShwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICByZXR1cm4gT3JkaW5hcnlHZXRPd25NZXRhZGF0YShtZXRhZGF0YUtleSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0ZXIoXCJnZXRPd25NZXRhZGF0YVwiLCBnZXRPd25NZXRhZGF0YSk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXRzIHRoZSBtZXRhZGF0YSBrZXlzIGRlZmluZWQgb24gdGhlIHRhcmdldCBvYmplY3Qgb3IgaXRzIHByb3RvdHlwZSBjaGFpbi5cbiAgICAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cbiAgICAgICAgICogQHBhcmFtIHByb3BlcnR5S2V5IChPcHRpb25hbCkgVGhlIHByb3BlcnR5IGtleSBmb3IgdGhlIHRhcmdldC5cbiAgICAgICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgdW5pcXVlIG1ldGFkYXRhIGtleXMuXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XG4gICAgICAgICAqICAgICAgICAgLy8gc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgICAgIGNvbnN0cnVjdG9yKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgfVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzKEV4YW1wbGUpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YUtleXMoRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhS2V5cyhFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhS2V5cyhFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YUtleXMoRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZ2V0TWV0YWRhdGFLZXlzKHRhcmdldCwgcHJvcGVydHlLZXkpIHtcbiAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3BlcnR5S2V5KSlcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUtleSA9IFRvUHJvcGVydHlLZXkocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgcmV0dXJuIE9yZGluYXJ5TWV0YWRhdGFLZXlzKHRhcmdldCwgcHJvcGVydHlLZXkpO1xuICAgICAgICB9XG4gICAgICAgIGV4cG9ydGVyKFwiZ2V0TWV0YWRhdGFLZXlzXCIsIGdldE1ldGFkYXRhS2V5cyk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXRzIHRoZSB1bmlxdWUgbWV0YWRhdGEga2V5cyBkZWZpbmVkIG9uIHRoZSB0YXJnZXQgb2JqZWN0LlxuICAgICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxuICAgICAgICAgKiBAcGFyYW0gcHJvcGVydHlLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxuICAgICAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiB1bmlxdWUgbWV0YWRhdGEga2V5cy5cbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xuICAgICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcbiAgICAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAgICAgY29uc3RydWN0b3IocCkgeyB9XG4gICAgICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XG4gICAgICAgICAqICAgICB9XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YUtleXMoRXhhbXBsZSk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhS2V5cyhFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGFLZXlzKEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBjb25zdHJ1Y3RvcilcbiAgICAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGFLZXlzKEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhS2V5cyhFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBnZXRPd25NZXRhZGF0YUtleXModGFyZ2V0LCBwcm9wZXJ0eUtleSkge1xuICAgICAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvcGVydHlLZXkpKVxuICAgICAgICAgICAgICAgIHByb3BlcnR5S2V5ID0gVG9Qcm9wZXJ0eUtleShwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICByZXR1cm4gT3JkaW5hcnlPd25NZXRhZGF0YUtleXModGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0ZXIoXCJnZXRPd25NZXRhZGF0YUtleXNcIiwgZ2V0T3duTWV0YWRhdGFLZXlzKTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlbGV0ZXMgdGhlIG1ldGFkYXRhIGVudHJ5IGZyb20gdGhlIHRhcmdldCBvYmplY3Qgd2l0aCB0aGUgcHJvdmlkZWQga2V5LlxuICAgICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgQSBrZXkgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmlldmUgbWV0YWRhdGEuXG4gICAgICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXG4gICAgICAgICAqIEBwYXJhbSBwcm9wZXJ0eUtleSAoT3B0aW9uYWwpIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXG4gICAgICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgbWV0YWRhdGEgZW50cnkgd2FzIGZvdW5kIGFuZCBkZWxldGVkOyBvdGhlcndpc2UsIGZhbHNlLlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XG4gICAgICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxuICAgICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcbiAgICAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cbiAgICAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxuICAgICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cbiAgICAgICAgICogICAgIH1cbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcbiAgICAgICAgICpcbiAgICAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XG4gICAgICAgICAqXG4gICAgICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxuICAgICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXG4gICAgICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZGVsZXRlTWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgcHJvcGVydHlLZXkpIHtcbiAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSlcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHByb3BlcnR5S2V5KSlcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUtleSA9IFRvUHJvcGVydHlLZXkocHJvcGVydHlLZXkpO1xuICAgICAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXQpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvcGVydHlLZXkpKVxuICAgICAgICAgICAgICAgIHByb3BlcnR5S2V5ID0gVG9Qcm9wZXJ0eUtleShwcm9wZXJ0eUtleSk7XG4gICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBHZXRNZXRhZGF0YVByb3ZpZGVyKHRhcmdldCwgcHJvcGVydHlLZXksIC8qQ3JlYXRlKi8gZmFsc2UpO1xuICAgICAgICAgICAgaWYgKElzVW5kZWZpbmVkKHByb3ZpZGVyKSlcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gcHJvdmlkZXIuT3JkaW5hcnlEZWxldGVNZXRhZGF0YShtZXRhZGF0YUtleSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0ZXIoXCJkZWxldGVNZXRhZGF0YVwiLCBkZWxldGVNZXRhZGF0YSk7XG4gICAgICAgIGZ1bmN0aW9uIERlY29yYXRlQ29uc3RydWN0b3IoZGVjb3JhdG9ycywgdGFyZ2V0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgICAgIHZhciBkZWNvcmF0b3IgPSBkZWNvcmF0b3JzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBkZWNvcmF0ZWQgPSBkZWNvcmF0b3IodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKGRlY29yYXRlZCkgJiYgIUlzTnVsbChkZWNvcmF0ZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghSXNDb25zdHJ1Y3RvcihkZWNvcmF0ZWQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBkZWNvcmF0ZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBEZWNvcmF0ZVByb3BlcnR5KGRlY29yYXRvcnMsIHRhcmdldCwgcHJvcGVydHlLZXksIGRlc2NyaXB0b3IpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlY29yYXRvciA9IGRlY29yYXRvcnNbaV07XG4gICAgICAgICAgICAgICAgdmFyIGRlY29yYXRlZCA9IGRlY29yYXRvcih0YXJnZXQsIHByb3BlcnR5S2V5LCBkZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKGRlY29yYXRlZCkgJiYgIUlzTnVsbChkZWNvcmF0ZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghSXNPYmplY3QoZGVjb3JhdGVkKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRvciA9IGRlY29yYXRlZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZGVzY3JpcHRvcjtcbiAgICAgICAgfVxuICAgICAgICAvLyAzLjEuMS4xIE9yZGluYXJ5SGFzTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApXG4gICAgICAgIC8vIGh0dHBzOi8vcmJ1Y2t0b24uZ2l0aHViLmlvL3JlZmxlY3QtbWV0YWRhdGEvI29yZGluYXJ5aGFzbWV0YWRhdGFcbiAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlIYXNNZXRhZGF0YShNZXRhZGF0YUtleSwgTywgUCkge1xuICAgICAgICAgICAgdmFyIGhhc093biA9IE9yZGluYXJ5SGFzT3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApO1xuICAgICAgICAgICAgaWYgKGhhc093bilcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBwYXJlbnQgPSBPcmRpbmFyeUdldFByb3RvdHlwZU9mKE8pO1xuICAgICAgICAgICAgaWYgKCFJc051bGwocGFyZW50KSlcbiAgICAgICAgICAgICAgICByZXR1cm4gT3JkaW5hcnlIYXNNZXRhZGF0YShNZXRhZGF0YUtleSwgcGFyZW50LCBQKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyAzLjEuMi4xIE9yZGluYXJ5SGFzT3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApXG4gICAgICAgIC8vIGh0dHBzOi8vcmJ1Y2t0b24uZ2l0aHViLmlvL3JlZmxlY3QtbWV0YWRhdGEvI29yZGluYXJ5aGFzb3dubWV0YWRhdGFcbiAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlIYXNPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTywgUCkge1xuICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gR2V0TWV0YWRhdGFQcm92aWRlcihPLCBQLCAvKkNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChJc1VuZGVmaW5lZChwcm92aWRlcikpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIFRvQm9vbGVhbihwcm92aWRlci5PcmRpbmFyeUhhc093bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gMy4xLjMuMSBPcmRpbmFyeUdldE1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKVxuICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeWdldG1ldGFkYXRhXG4gICAgICAgIGZ1bmN0aW9uIE9yZGluYXJ5R2V0TWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApIHtcbiAgICAgICAgICAgIHZhciBoYXNPd24gPSBPcmRpbmFyeUhhc093bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKTtcbiAgICAgICAgICAgIGlmIChoYXNPd24pXG4gICAgICAgICAgICAgICAgcmV0dXJuIE9yZGluYXJ5R2V0T3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApO1xuICAgICAgICAgICAgdmFyIHBhcmVudCA9IE9yZGluYXJ5R2V0UHJvdG90eXBlT2YoTyk7XG4gICAgICAgICAgICBpZiAoIUlzTnVsbChwYXJlbnQpKVxuICAgICAgICAgICAgICAgIHJldHVybiBPcmRpbmFyeUdldE1ldGFkYXRhKE1ldGFkYXRhS2V5LCBwYXJlbnQsIFApO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyAzLjEuNC4xIE9yZGluYXJ5R2V0T3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApXG4gICAgICAgIC8vIGh0dHBzOi8vcmJ1Y2t0b24uZ2l0aHViLmlvL3JlZmxlY3QtbWV0YWRhdGEvI29yZGluYXJ5Z2V0b3dubWV0YWRhdGFcbiAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlHZXRPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTywgUCkge1xuICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gR2V0TWV0YWRhdGFQcm92aWRlcihPLCBQLCAvKkNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChJc1VuZGVmaW5lZChwcm92aWRlcikpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyLk9yZGluYXJ5R2V0T3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApO1xuICAgICAgICB9XG4gICAgICAgIC8vIDMuMS41LjEgT3JkaW5hcnlEZWZpbmVPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTWV0YWRhdGFWYWx1ZSwgTywgUClcbiAgICAgICAgLy8gaHR0cHM6Ly9yYnVja3Rvbi5naXRodWIuaW8vcmVmbGVjdC1tZXRhZGF0YS8jb3JkaW5hcnlkZWZpbmVvd25tZXRhZGF0YVxuICAgICAgICBmdW5jdGlvbiBPcmRpbmFyeURlZmluZU93bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBNZXRhZGF0YVZhbHVlLCBPLCBQKSB7XG4gICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBHZXRNZXRhZGF0YVByb3ZpZGVyKE8sIFAsIC8qQ3JlYXRlKi8gdHJ1ZSk7XG4gICAgICAgICAgICBwcm92aWRlci5PcmRpbmFyeURlZmluZU93bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBNZXRhZGF0YVZhbHVlLCBPLCBQKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAzLjEuNi4xIE9yZGluYXJ5TWV0YWRhdGFLZXlzKE8sIFApXG4gICAgICAgIC8vIGh0dHBzOi8vcmJ1Y2t0b24uZ2l0aHViLmlvL3JlZmxlY3QtbWV0YWRhdGEvI29yZGluYXJ5bWV0YWRhdGFrZXlzXG4gICAgICAgIGZ1bmN0aW9uIE9yZGluYXJ5TWV0YWRhdGFLZXlzKE8sIFApIHtcbiAgICAgICAgICAgIHZhciBvd25LZXlzID0gT3JkaW5hcnlPd25NZXRhZGF0YUtleXMoTywgUCk7XG4gICAgICAgICAgICB2YXIgcGFyZW50ID0gT3JkaW5hcnlHZXRQcm90b3R5cGVPZihPKTtcbiAgICAgICAgICAgIGlmIChwYXJlbnQgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG93bktleXM7XG4gICAgICAgICAgICB2YXIgcGFyZW50S2V5cyA9IE9yZGluYXJ5TWV0YWRhdGFLZXlzKHBhcmVudCwgUCk7XG4gICAgICAgICAgICBpZiAocGFyZW50S2V5cy5sZW5ndGggPD0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gb3duS2V5cztcbiAgICAgICAgICAgIGlmIChvd25LZXlzLmxlbmd0aCA8PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnRLZXlzO1xuICAgICAgICAgICAgdmFyIHNldCA9IG5ldyBfU2V0KCk7XG4gICAgICAgICAgICB2YXIga2V5cyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBvd25LZXlzXzEgPSBvd25LZXlzOyBfaSA8IG93bktleXNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gb3duS2V5c18xW19pXTtcbiAgICAgICAgICAgICAgICB2YXIgaGFzS2V5ID0gc2V0LmhhcyhrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghaGFzS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHNldC5hZGQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgX2EgPSAwLCBwYXJlbnRLZXlzXzEgPSBwYXJlbnRLZXlzOyBfYSA8IHBhcmVudEtleXNfMS5sZW5ndGg7IF9hKyspIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gcGFyZW50S2V5c18xW19hXTtcbiAgICAgICAgICAgICAgICB2YXIgaGFzS2V5ID0gc2V0LmhhcyhrZXkpO1xuICAgICAgICAgICAgICAgIGlmICghaGFzS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHNldC5hZGQoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gMy4xLjcuMSBPcmRpbmFyeU93bk1ldGFkYXRhS2V5cyhPLCBQKVxuICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeW93bm1ldGFkYXRha2V5c1xuICAgICAgICBmdW5jdGlvbiBPcmRpbmFyeU93bk1ldGFkYXRhS2V5cyhPLCBQKSB7XG4gICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBHZXRNZXRhZGF0YVByb3ZpZGVyKE8sIFAsIC8qY3JlYXRlKi8gZmFsc2UpO1xuICAgICAgICAgICAgaWYgKCFwcm92aWRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlci5PcmRpbmFyeU93bk1ldGFkYXRhS2V5cyhPLCBQKTtcbiAgICAgICAgfVxuICAgICAgICAvLyA2IEVDTUFTY3JpcHQgRGF0YSBUeXBlcyBhbmQgVmFsdWVzXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWVjbWFzY3JpcHQtZGF0YS10eXBlcy1hbmQtdmFsdWVzXG4gICAgICAgIGZ1bmN0aW9uIFR5cGUoeCkge1xuICAgICAgICAgICAgaWYgKHggPT09IG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEgLyogTnVsbCAqLztcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZW9mIHgpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwidW5kZWZpbmVkXCI6IHJldHVybiAwIC8qIFVuZGVmaW5lZCAqLztcbiAgICAgICAgICAgICAgICBjYXNlIFwiYm9vbGVhblwiOiByZXR1cm4gMiAvKiBCb29sZWFuICovO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjogcmV0dXJuIDMgLyogU3RyaW5nICovO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJzeW1ib2xcIjogcmV0dXJuIDQgLyogU3ltYm9sICovO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJudW1iZXJcIjogcmV0dXJuIDUgLyogTnVtYmVyICovO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJvYmplY3RcIjogcmV0dXJuIHggPT09IG51bGwgPyAxIC8qIE51bGwgKi8gOiA2IC8qIE9iamVjdCAqLztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gNiAvKiBPYmplY3QgKi87XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gNi4xLjEgVGhlIFVuZGVmaW5lZCBUeXBlXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMtdW5kZWZpbmVkLXR5cGVcbiAgICAgICAgZnVuY3Rpb24gSXNVbmRlZmluZWQoeCkge1xuICAgICAgICAgICAgcmV0dXJuIHggPT09IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyA2LjEuMiBUaGUgTnVsbCBUeXBlXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMtbnVsbC10eXBlXG4gICAgICAgIGZ1bmN0aW9uIElzTnVsbCh4KSB7XG4gICAgICAgICAgICByZXR1cm4geCA9PT0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyA2LjEuNSBUaGUgU3ltYm9sIFR5cGVcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcy1zeW1ib2wtdHlwZVxuICAgICAgICBmdW5jdGlvbiBJc1N5bWJvbCh4KSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNi4xLjcgVGhlIE9iamVjdCBUeXBlXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC10eXBlXG4gICAgICAgIGZ1bmN0aW9uIElzT2JqZWN0KHgpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gXCJvYmplY3RcIiA/IHggIT09IG51bGwgOiB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiO1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuMSBUeXBlIENvbnZlcnNpb25cbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdHlwZS1jb252ZXJzaW9uXG4gICAgICAgIC8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b3ByaW1pdGl2ZVxuICAgICAgICBmdW5jdGlvbiBUb1ByaW1pdGl2ZShpbnB1dCwgUHJlZmVycmVkVHlwZSkge1xuICAgICAgICAgICAgc3dpdGNoIChUeXBlKGlucHV0KSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMCAvKiBVbmRlZmluZWQgKi86IHJldHVybiBpbnB1dDtcbiAgICAgICAgICAgICAgICBjYXNlIDEgLyogTnVsbCAqLzogcmV0dXJuIGlucHV0O1xuICAgICAgICAgICAgICAgIGNhc2UgMiAvKiBCb29sZWFuICovOiByZXR1cm4gaW5wdXQ7XG4gICAgICAgICAgICAgICAgY2FzZSAzIC8qIFN0cmluZyAqLzogcmV0dXJuIGlucHV0O1xuICAgICAgICAgICAgICAgIGNhc2UgNCAvKiBTeW1ib2wgKi86IHJldHVybiBpbnB1dDtcbiAgICAgICAgICAgICAgICBjYXNlIDUgLyogTnVtYmVyICovOiByZXR1cm4gaW5wdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGludCA9IFByZWZlcnJlZFR5cGUgPT09IDMgLyogU3RyaW5nICovID8gXCJzdHJpbmdcIiA6IFByZWZlcnJlZFR5cGUgPT09IDUgLyogTnVtYmVyICovID8gXCJudW1iZXJcIiA6IFwiZGVmYXVsdFwiO1xuICAgICAgICAgICAgdmFyIGV4b3RpY1RvUHJpbSA9IEdldE1ldGhvZChpbnB1dCwgdG9QcmltaXRpdmVTeW1ib2wpO1xuICAgICAgICAgICAgaWYgKGV4b3RpY1RvUHJpbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGV4b3RpY1RvUHJpbS5jYWxsKGlucHV0LCBoaW50KTtcbiAgICAgICAgICAgICAgICBpZiAoSXNPYmplY3QocmVzdWx0KSlcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gT3JkaW5hcnlUb1ByaW1pdGl2ZShpbnB1dCwgaGludCA9PT0gXCJkZWZhdWx0XCIgPyBcIm51bWJlclwiIDogaGludCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNy4xLjEuMSBPcmRpbmFyeVRvUHJpbWl0aXZlKE8sIGhpbnQpXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9yZGluYXJ5dG9wcmltaXRpdmVcbiAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlUb1ByaW1pdGl2ZShPLCBoaW50KSB7XG4gICAgICAgICAgICBpZiAoaGludCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIHZhciB0b1N0cmluZ18xID0gTy50b1N0cmluZztcbiAgICAgICAgICAgICAgICBpZiAoSXNDYWxsYWJsZSh0b1N0cmluZ18xKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdG9TdHJpbmdfMS5jYWxsKE8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHJlc3VsdCkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgdmFsdWVPZiA9IE8udmFsdWVPZjtcbiAgICAgICAgICAgICAgICBpZiAoSXNDYWxsYWJsZSh2YWx1ZU9mKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdmFsdWVPZi5jYWxsKE8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHJlc3VsdCkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZU9mID0gTy52YWx1ZU9mO1xuICAgICAgICAgICAgICAgIGlmIChJc0NhbGxhYmxlKHZhbHVlT2YpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSB2YWx1ZU9mLmNhbGwoTyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghSXNPYmplY3QocmVzdWx0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB0b1N0cmluZ18yID0gTy50b1N0cmluZztcbiAgICAgICAgICAgICAgICBpZiAoSXNDYWxsYWJsZSh0b1N0cmluZ18yKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdG9TdHJpbmdfMi5jYWxsKE8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHJlc3VsdCkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyA3LjEuMiBUb0Jvb2xlYW4oYXJndW1lbnQpXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8yMDE2LyNzZWMtdG9ib29sZWFuXG4gICAgICAgIGZ1bmN0aW9uIFRvQm9vbGVhbihhcmd1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuICEhYXJndW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNy4xLjEyIFRvU3RyaW5nKGFyZ3VtZW50KVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b3N0cmluZ1xuICAgICAgICBmdW5jdGlvbiBUb1N0cmluZyhhcmd1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCIgKyBhcmd1bWVudDtcbiAgICAgICAgfVxuICAgICAgICAvLyA3LjEuMTQgVG9Qcm9wZXJ0eUtleShhcmd1bWVudClcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9wcm9wZXJ0eWtleVxuICAgICAgICBmdW5jdGlvbiBUb1Byb3BlcnR5S2V5KGFyZ3VtZW50KSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gVG9QcmltaXRpdmUoYXJndW1lbnQsIDMgLyogU3RyaW5nICovKTtcbiAgICAgICAgICAgIGlmIChJc1N5bWJvbChrZXkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgICByZXR1cm4gVG9TdHJpbmcoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICAvLyA3LjIgVGVzdGluZyBhbmQgQ29tcGFyaXNvbiBPcGVyYXRpb25zXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRlc3RpbmctYW5kLWNvbXBhcmlzb24tb3BlcmF0aW9uc1xuICAgICAgICAvLyA3LjIuMiBJc0FycmF5KGFyZ3VtZW50KVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1pc2FycmF5XG4gICAgICAgIGZ1bmN0aW9uIElzQXJyYXkoYXJndW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5XG4gICAgICAgICAgICAgICAgPyBBcnJheS5pc0FycmF5KGFyZ3VtZW50KVxuICAgICAgICAgICAgICAgIDogYXJndW1lbnQgaW5zdGFuY2VvZiBPYmplY3RcbiAgICAgICAgICAgICAgICAgICAgPyBhcmd1bWVudCBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgIDogT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuMi4zIElzQ2FsbGFibGUoYXJndW1lbnQpXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWlzY2FsbGFibGVcbiAgICAgICAgZnVuY3Rpb24gSXNDYWxsYWJsZShhcmd1bWVudCkge1xuICAgICAgICAgICAgLy8gTk9URTogVGhpcyBpcyBhbiBhcHByb3hpbWF0aW9uIGFzIHdlIGNhbm5vdCBjaGVjayBmb3IgW1tDYWxsXV0gaW50ZXJuYWwgbWV0aG9kLlxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBhcmd1bWVudCA9PT0gXCJmdW5jdGlvblwiO1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuMi40IElzQ29uc3RydWN0b3IoYXJndW1lbnQpXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWlzY29uc3RydWN0b3JcbiAgICAgICAgZnVuY3Rpb24gSXNDb25zdHJ1Y3Rvcihhcmd1bWVudCkge1xuICAgICAgICAgICAgLy8gTk9URTogVGhpcyBpcyBhbiBhcHByb3hpbWF0aW9uIGFzIHdlIGNhbm5vdCBjaGVjayBmb3IgW1tDb25zdHJ1Y3RdXSBpbnRlcm5hbCBtZXRob2QuXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGFyZ3VtZW50ID09PSBcImZ1bmN0aW9uXCI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNy4yLjcgSXNQcm9wZXJ0eUtleShhcmd1bWVudClcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXNwcm9wZXJ0eWtleVxuICAgICAgICBmdW5jdGlvbiBJc1Byb3BlcnR5S2V5KGFyZ3VtZW50KSB7XG4gICAgICAgICAgICBzd2l0Y2ggKFR5cGUoYXJndW1lbnQpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAzIC8qIFN0cmluZyAqLzogcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgY2FzZSA0IC8qIFN5bWJvbCAqLzogcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIFNhbWVWYWx1ZVplcm8oeCwgeSkge1xuICAgICAgICAgICAgcmV0dXJuIHggPT09IHkgfHwgeCAhPT0geCAmJiB5ICE9PSB5O1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuMyBPcGVyYXRpb25zIG9uIE9iamVjdHNcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb3BlcmF0aW9ucy1vbi1vYmplY3RzXG4gICAgICAgIC8vIDcuMy45IEdldE1ldGhvZChWLCBQKVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1nZXRtZXRob2RcbiAgICAgICAgZnVuY3Rpb24gR2V0TWV0aG9kKFYsIFApIHtcbiAgICAgICAgICAgIHZhciBmdW5jID0gVltQXTtcbiAgICAgICAgICAgIGlmIChmdW5jID09PSB1bmRlZmluZWQgfHwgZnVuYyA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKCFJc0NhbGxhYmxlKGZ1bmMpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jO1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuNCBPcGVyYXRpb25zIG9uIEl0ZXJhdG9yIE9iamVjdHNcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb3BlcmF0aW9ucy1vbi1pdGVyYXRvci1vYmplY3RzXG4gICAgICAgIGZ1bmN0aW9uIEdldEl0ZXJhdG9yKG9iaikge1xuICAgICAgICAgICAgdmFyIG1ldGhvZCA9IEdldE1ldGhvZChvYmosIGl0ZXJhdG9yU3ltYm9sKTtcbiAgICAgICAgICAgIGlmICghSXNDYWxsYWJsZShtZXRob2QpKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTsgLy8gZnJvbSBDYWxsXG4gICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSBtZXRob2QuY2FsbChvYmopO1xuICAgICAgICAgICAgaWYgKCFJc09iamVjdChpdGVyYXRvcikpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yO1xuICAgICAgICB9XG4gICAgICAgIC8vIDcuNC40IEl0ZXJhdG9yVmFsdWUoaXRlclJlc3VsdClcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLzIwMTYvI3NlYy1pdGVyYXRvcnZhbHVlXG4gICAgICAgIGZ1bmN0aW9uIEl0ZXJhdG9yVmFsdWUoaXRlclJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJSZXN1bHQudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNy40LjUgSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKVxuICAgICAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1pdGVyYXRvcnN0ZXBcbiAgICAgICAgZnVuY3Rpb24gSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gZmFsc2UgOiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gNy40LjYgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgY29tcGxldGlvbilcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXRlcmF0b3JjbG9zZVxuICAgICAgICBmdW5jdGlvbiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICB2YXIgZiA9IGl0ZXJhdG9yW1wicmV0dXJuXCJdO1xuICAgICAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICAgICAgZi5jYWxsKGl0ZXJhdG9yKTtcbiAgICAgICAgfVxuICAgICAgICAvLyA5LjEgT3JkaW5hcnkgT2JqZWN0IEludGVybmFsIE1ldGhvZHMgYW5kIEludGVybmFsIFNsb3RzXG4gICAgICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9yZGluYXJ5LW9iamVjdC1pbnRlcm5hbC1tZXRob2RzLWFuZC1pbnRlcm5hbC1zbG90c1xuICAgICAgICAvLyA5LjEuMS4xIE9yZGluYXJ5R2V0UHJvdG90eXBlT2YoTylcbiAgICAgICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb3JkaW5hcnlnZXRwcm90b3R5cGVvZlxuICAgICAgICBmdW5jdGlvbiBPcmRpbmFyeUdldFByb3RvdHlwZU9mKE8pIHtcbiAgICAgICAgICAgIHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgTyAhPT0gXCJmdW5jdGlvblwiIHx8IE8gPT09IGZ1bmN0aW9uUHJvdG90eXBlKVxuICAgICAgICAgICAgICAgIHJldHVybiBwcm90bztcbiAgICAgICAgICAgIC8vIFR5cGVTY3JpcHQgZG9lc24ndCBzZXQgX19wcm90b19fIGluIEVTNSwgYXMgaXQncyBub24tc3RhbmRhcmQuXG4gICAgICAgICAgICAvLyBUcnkgdG8gZGV0ZXJtaW5lIHRoZSBzdXBlcmNsYXNzIGNvbnN0cnVjdG9yLiBDb21wYXRpYmxlIGltcGxlbWVudGF0aW9uc1xuICAgICAgICAgICAgLy8gbXVzdCBlaXRoZXIgc2V0IF9fcHJvdG9fXyBvbiBhIHN1YmNsYXNzIGNvbnN0cnVjdG9yIHRvIHRoZSBzdXBlcmNsYXNzIGNvbnN0cnVjdG9yLFxuICAgICAgICAgICAgLy8gb3IgZW5zdXJlIGVhY2ggY2xhc3MgaGFzIGEgdmFsaWQgYGNvbnN0cnVjdG9yYCBwcm9wZXJ0eSBvbiBpdHMgcHJvdG90eXBlIHRoYXRcbiAgICAgICAgICAgIC8vIHBvaW50cyBiYWNrIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgbm90IHRoZSBzYW1lIGFzIEZ1bmN0aW9uLltbUHJvdG90eXBlXV0sIHRoZW4gdGhpcyBpcyBkZWZpbmF0ZWx5IGluaGVyaXRlZC5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGNhc2Ugd2hlbiBpbiBFUzYgb3Igd2hlbiB1c2luZyBfX3Byb3RvX18gaW4gYSBjb21wYXRpYmxlIGJyb3dzZXIuXG4gICAgICAgICAgICBpZiAocHJvdG8gIT09IGZ1bmN0aW9uUHJvdG90eXBlKVxuICAgICAgICAgICAgICAgIHJldHVybiBwcm90bztcbiAgICAgICAgICAgIC8vIElmIHRoZSBzdXBlciBwcm90b3R5cGUgaXMgT2JqZWN0LnByb3RvdHlwZSwgbnVsbCwgb3IgdW5kZWZpbmVkLCB0aGVuIHdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIGhlcml0YWdlLlxuICAgICAgICAgICAgdmFyIHByb3RvdHlwZSA9IE8ucHJvdG90eXBlO1xuICAgICAgICAgICAgdmFyIHByb3RvdHlwZVByb3RvID0gcHJvdG90eXBlICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90b3R5cGUpO1xuICAgICAgICAgICAgaWYgKHByb3RvdHlwZVByb3RvID09IG51bGwgfHwgcHJvdG90eXBlUHJvdG8gPT09IE9iamVjdC5wcm90b3R5cGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3RvO1xuICAgICAgICAgICAgLy8gSWYgdGhlIGNvbnN0cnVjdG9yIHdhcyBub3QgYSBmdW5jdGlvbiwgdGhlbiB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHRoZSBoZXJpdGFnZS5cbiAgICAgICAgICAgIHZhciBjb25zdHJ1Y3RvciA9IHByb3RvdHlwZVByb3RvLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zdHJ1Y3RvciAhPT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICAgIHJldHVybiBwcm90bztcbiAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgc29tZSBraW5kIG9mIHNlbGYtcmVmZXJlbmNlLCB0aGVuIHdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIGhlcml0YWdlLlxuICAgICAgICAgICAgaWYgKGNvbnN0cnVjdG9yID09PSBPKVxuICAgICAgICAgICAgICAgIHJldHVybiBwcm90bztcbiAgICAgICAgICAgIC8vIHdlIGhhdmUgYSBwcmV0dHkgZ29vZCBndWVzcyBhdCB0aGUgaGVyaXRhZ2UuXG4gICAgICAgICAgICByZXR1cm4gY29uc3RydWN0b3I7XG4gICAgICAgIH1cbiAgICAgICAgLy8gR2xvYmFsIG1ldGFkYXRhIHJlZ2lzdHJ5XG4gICAgICAgIC8vIC0gQWxsb3dzIGBpbXBvcnQgXCJyZWZsZWN0LW1ldGFkYXRhXCJgIGFuZCBgaW1wb3J0IFwicmVmbGVjdC1tZXRhZGF0YS9uby1jb25mbGljdFwiYCB0byBpbnRlcm9wZXJhdGUuXG4gICAgICAgIC8vIC0gVXNlcyBpc29sYXRlZCBtZXRhZGF0YSBpZiBgUmVmbGVjdGAgaXMgZnJvemVuIGJlZm9yZSB0aGUgcmVnaXN0cnkgY2FuIGJlIGluc3RhbGxlZC5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZXMgYSByZWdpc3RyeSB1c2VkIHRvIGFsbG93IG11bHRpcGxlIGByZWZsZWN0LW1ldGFkYXRhYCBwcm92aWRlcnMuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBDcmVhdGVNZXRhZGF0YVJlZ2lzdHJ5KCkge1xuICAgICAgICAgICAgdmFyIGZhbGxiYWNrO1xuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChyZWdpc3RyeVN5bWJvbCkgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2Ygcm9vdC5SZWZsZWN0ICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgICAgICAgICAgIShyZWdpc3RyeVN5bWJvbCBpbiByb290LlJlZmxlY3QpICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIHJvb3QuUmVmbGVjdC5kZWZpbmVNZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgLy8gaW50ZXJvcGVyYXRlIHdpdGggb2xkZXIgdmVyc2lvbiBvZiBgcmVmbGVjdC1tZXRhZGF0YWAgdGhhdCBkaWQgbm90IHN1cHBvcnQgYSByZWdpc3RyeS5cbiAgICAgICAgICAgICAgICBmYWxsYmFjayA9IENyZWF0ZUZhbGxiYWNrUHJvdmlkZXIocm9vdC5SZWZsZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBmaXJzdDtcbiAgICAgICAgICAgIHZhciBzZWNvbmQ7XG4gICAgICAgICAgICB2YXIgcmVzdDtcbiAgICAgICAgICAgIHZhciB0YXJnZXRQcm92aWRlck1hcCA9IG5ldyBfV2Vha01hcCgpO1xuICAgICAgICAgICAgdmFyIHJlZ2lzdHJ5ID0ge1xuICAgICAgICAgICAgICAgIHJlZ2lzdGVyUHJvdmlkZXI6IHJlZ2lzdGVyUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgZ2V0UHJvdmlkZXI6IGdldFByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIHNldFByb3ZpZGVyOiBzZXRQcm92aWRlcixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gcmVnaXN0cnk7XG4gICAgICAgICAgICBmdW5jdGlvbiByZWdpc3RlclByb3ZpZGVyKHByb3ZpZGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFPYmplY3QuaXNFeHRlbnNpYmxlKHJlZ2lzdHJ5KSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgYWRkIHByb3ZpZGVyIHRvIGEgZnJvemVuIHJlZ2lzdHJ5LlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgZmFsbGJhY2sgPT09IHByb3ZpZGVyOiBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBJc1VuZGVmaW5lZChmaXJzdCk6XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IHByb3ZpZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgZmlyc3QgPT09IHByb3ZpZGVyOiBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBJc1VuZGVmaW5lZChzZWNvbmQpOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kID0gcHJvdmlkZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBzZWNvbmQgPT09IHByb3ZpZGVyOiBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN0ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdCA9IG5ldyBfU2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN0LmFkZChwcm92aWRlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRQcm92aWRlck5vQ2FjaGUoTywgUCkge1xuICAgICAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQoZmlyc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdC5pc1Byb3ZpZGVyRm9yKE8sIFApKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpcnN0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHNlY29uZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWNvbmQuaXNQcm92aWRlckZvcihPLCBQKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHJlc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZXJhdG9yID0gR2V0SXRlcmF0b3IocmVzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBJdGVyYXRvclN0ZXAoaXRlcmF0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHByb3ZpZGVyID0gSXRlcmF0b3JWYWx1ZShuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3ZpZGVyLmlzUHJvdmlkZXJGb3IoTywgUCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3ZpZGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQoZmFsbGJhY2spICYmIGZhbGxiYWNrLmlzUHJvdmlkZXJGb3IoTywgUCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbGxiYWNrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0UHJvdmlkZXIoTywgUCkge1xuICAgICAgICAgICAgICAgIHZhciBwcm92aWRlck1hcCA9IHRhcmdldFByb3ZpZGVyTWFwLmdldChPKTtcbiAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXI7XG4gICAgICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChwcm92aWRlck1hcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXIgPSBwcm92aWRlck1hcC5nZXQoUCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocHJvdmlkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm92aWRlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHJvdmlkZXIgPSBnZXRQcm92aWRlck5vQ2FjaGUoTywgUCk7XG4gICAgICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChwcm92aWRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKElzVW5kZWZpbmVkKHByb3ZpZGVyTWFwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJNYXAgPSBuZXcgX01hcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvdmlkZXJNYXAuc2V0KE8sIHByb3ZpZGVyTWFwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwcm92aWRlck1hcC5zZXQoUCwgcHJvdmlkZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvdmlkZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBoYXNQcm92aWRlcihwcm92aWRlcikge1xuICAgICAgICAgICAgICAgIGlmIChJc1VuZGVmaW5lZChwcm92aWRlcikpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlyc3QgPT09IHByb3ZpZGVyIHx8IHNlY29uZCA9PT0gcHJvdmlkZXIgfHwgIUlzVW5kZWZpbmVkKHJlc3QpICYmIHJlc3QuaGFzKHByb3ZpZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIHNldFByb3ZpZGVyKE8sIFAsIHByb3ZpZGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNQcm92aWRlcihwcm92aWRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0YWRhdGEgcHJvdmlkZXIgbm90IHJlZ2lzdGVyZWQuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZXhpc3RpbmdQcm92aWRlciA9IGdldFByb3ZpZGVyKE8sIFApO1xuICAgICAgICAgICAgICAgIGlmIChleGlzdGluZ1Byb3ZpZGVyICE9PSBwcm92aWRlcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKGV4aXN0aW5nUHJvdmlkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3ZpZGVyTWFwID0gdGFyZ2V0UHJvdmlkZXJNYXAuZ2V0KE8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQocHJvdmlkZXJNYXApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlck1hcCA9IG5ldyBfTWFwKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm92aWRlck1hcC5zZXQoTywgcHJvdmlkZXJNYXApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyTWFwLnNldChQLCBwcm92aWRlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXRzIG9yIGNyZWF0ZXMgdGhlIHNoYXJlZCByZWdpc3RyeSBvZiBtZXRhZGF0YSBwcm92aWRlcnMuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBHZXRPckNyZWF0ZU1ldGFkYXRhUmVnaXN0cnkoKSB7XG4gICAgICAgICAgICB2YXIgbWV0YWRhdGFSZWdpc3RyeTtcbiAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQocmVnaXN0cnlTeW1ib2wpICYmIElzT2JqZWN0KHJvb3QuUmVmbGVjdCkgJiYgT2JqZWN0LmlzRXh0ZW5zaWJsZShyb290LlJlZmxlY3QpKSB7XG4gICAgICAgICAgICAgICAgbWV0YWRhdGFSZWdpc3RyeSA9IHJvb3QuUmVmbGVjdFtyZWdpc3RyeVN5bWJvbF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQobWV0YWRhdGFSZWdpc3RyeSkpIHtcbiAgICAgICAgICAgICAgICBtZXRhZGF0YVJlZ2lzdHJ5ID0gQ3JlYXRlTWV0YWRhdGFSZWdpc3RyeSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChyZWdpc3RyeVN5bWJvbCkgJiYgSXNPYmplY3Qocm9vdC5SZWZsZWN0KSAmJiBPYmplY3QuaXNFeHRlbnNpYmxlKHJvb3QuUmVmbGVjdCkpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocm9vdC5SZWZsZWN0LCByZWdpc3RyeVN5bWJvbCwge1xuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbWV0YWRhdGFSZWdpc3RyeVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1ldGFkYXRhUmVnaXN0cnk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gQ3JlYXRlTWV0YWRhdGFQcm92aWRlcihyZWdpc3RyeSkge1xuICAgICAgICAgICAgLy8gW1tNZXRhZGF0YV1dIGludGVybmFsIHNsb3RcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vcmJ1Y2t0b24uZ2l0aHViLmlvL3JlZmxlY3QtbWV0YWRhdGEvI29yZGluYXJ5LW9iamVjdC1pbnRlcm5hbC1tZXRob2RzLWFuZC1pbnRlcm5hbC1zbG90c1xuICAgICAgICAgICAgdmFyIG1ldGFkYXRhID0gbmV3IF9XZWFrTWFwKCk7XG4gICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSB7XG4gICAgICAgICAgICAgICAgaXNQcm92aWRlckZvcjogZnVuY3Rpb24gKE8sIFApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldE1ldGFkYXRhID0gbWV0YWRhdGEuZ2V0KE8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQodGFyZ2V0TWV0YWRhdGEpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0TWV0YWRhdGEuaGFzKFApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgT3JkaW5hcnlEZWZpbmVPd25NZXRhZGF0YTogT3JkaW5hcnlEZWZpbmVPd25NZXRhZGF0YSxcbiAgICAgICAgICAgICAgICBPcmRpbmFyeUhhc093bk1ldGFkYXRhOiBPcmRpbmFyeUhhc093bk1ldGFkYXRhLFxuICAgICAgICAgICAgICAgIE9yZGluYXJ5R2V0T3duTWV0YWRhdGE6IE9yZGluYXJ5R2V0T3duTWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgT3JkaW5hcnlPd25NZXRhZGF0YUtleXM6IE9yZGluYXJ5T3duTWV0YWRhdGFLZXlzLFxuICAgICAgICAgICAgICAgIE9yZGluYXJ5RGVsZXRlTWV0YWRhdGE6IE9yZGluYXJ5RGVsZXRlTWV0YWRhdGEsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbWV0YWRhdGFSZWdpc3RyeS5yZWdpc3RlclByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlcjtcbiAgICAgICAgICAgIGZ1bmN0aW9uIEdldE9yQ3JlYXRlTWV0YWRhdGFNYXAoTywgUCwgQ3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldE1ldGFkYXRhID0gbWV0YWRhdGEuZ2V0KE8pO1xuICAgICAgICAgICAgICAgIHZhciBjcmVhdGVkVGFyZ2V0TWV0YWRhdGEgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQodGFyZ2V0TWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghQ3JlYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWV0YWRhdGEgPSBuZXcgX01hcCgpO1xuICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YS5zZXQoTywgdGFyZ2V0TWV0YWRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkVGFyZ2V0TWV0YWRhdGEgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbWV0YWRhdGFNYXAgPSB0YXJnZXRNZXRhZGF0YS5nZXQoUCk7XG4gICAgICAgICAgICAgICAgaWYgKElzVW5kZWZpbmVkKG1ldGFkYXRhTWFwKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIUNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhTWFwID0gbmV3IF9NYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWV0YWRhdGEuc2V0KFAsIG1ldGFkYXRhTWFwKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWdpc3RyeS5zZXRQcm92aWRlcihPLCBQLCBwcm92aWRlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1ldGFkYXRhLmRlbGV0ZShQKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjcmVhdGVkVGFyZ2V0TWV0YWRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhZGF0YS5kZWxldGUoTyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJXcm9uZyBwcm92aWRlciBmb3IgdGFyZ2V0LlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbWV0YWRhdGFNYXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAzLjEuMi4xIE9yZGluYXJ5SGFzT3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApXG4gICAgICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeWhhc293bm1ldGFkYXRhXG4gICAgICAgICAgICBmdW5jdGlvbiBPcmRpbmFyeUhhc093bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1ldGFkYXRhTWFwID0gR2V0T3JDcmVhdGVNZXRhZGF0YU1hcChPLCBQLCAvKkNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQobWV0YWRhdGFNYXApKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRvQm9vbGVhbihtZXRhZGF0YU1hcC5oYXMoTWV0YWRhdGFLZXkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIDMuMS40LjEgT3JkaW5hcnlHZXRPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTywgUClcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vcmJ1Y2t0b24uZ2l0aHViLmlvL3JlZmxlY3QtbWV0YWRhdGEvI29yZGluYXJ5Z2V0b3dubWV0YWRhdGFcbiAgICAgICAgICAgIGZ1bmN0aW9uIE9yZGluYXJ5R2V0T3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApIHtcbiAgICAgICAgICAgICAgICB2YXIgbWV0YWRhdGFNYXAgPSBHZXRPckNyZWF0ZU1ldGFkYXRhTWFwKE8sIFAsIC8qQ3JlYXRlKi8gZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChJc1VuZGVmaW5lZChtZXRhZGF0YU1hcCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGFkYXRhTWFwLmdldChNZXRhZGF0YUtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAzLjEuNS4xIE9yZGluYXJ5RGVmaW5lT3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE1ldGFkYXRhVmFsdWUsIE8sIFApXG4gICAgICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeWRlZmluZW93bm1ldGFkYXRhXG4gICAgICAgICAgICBmdW5jdGlvbiBPcmRpbmFyeURlZmluZU93bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBNZXRhZGF0YVZhbHVlLCBPLCBQKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1ldGFkYXRhTWFwID0gR2V0T3JDcmVhdGVNZXRhZGF0YU1hcChPLCBQLCAvKkNyZWF0ZSovIHRydWUpO1xuICAgICAgICAgICAgICAgIG1ldGFkYXRhTWFwLnNldChNZXRhZGF0YUtleSwgTWV0YWRhdGFWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAzLjEuNy4xIE9yZGluYXJ5T3duTWV0YWRhdGFLZXlzKE8sIFApXG4gICAgICAgICAgICAvLyBodHRwczovL3JidWNrdG9uLmdpdGh1Yi5pby9yZWZsZWN0LW1ldGFkYXRhLyNvcmRpbmFyeW93bm1ldGFkYXRha2V5c1xuICAgICAgICAgICAgZnVuY3Rpb24gT3JkaW5hcnlPd25NZXRhZGF0YUtleXMoTywgUCkge1xuICAgICAgICAgICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgICAgICAgICAgdmFyIG1ldGFkYXRhTWFwID0gR2V0T3JDcmVhdGVNZXRhZGF0YU1hcChPLCBQLCAvKkNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoSXNVbmRlZmluZWQobWV0YWRhdGFNYXApKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgICAgICAgICAgICB2YXIga2V5c09iaiA9IG1ldGFkYXRhTWFwLmtleXMoKTtcbiAgICAgICAgICAgICAgICB2YXIgaXRlcmF0b3IgPSBHZXRJdGVyYXRvcihrZXlzT2JqKTtcbiAgICAgICAgICAgICAgICB2YXIgayA9IDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBJdGVyYXRvclN0ZXAoaXRlcmF0b3IpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXMubGVuZ3RoID0gaztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBrZXlzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0VmFsdWUgPSBJdGVyYXRvclZhbHVlKG5leHQpO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5c1trXSA9IG5leHRWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaysrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIE9yZGluYXJ5RGVsZXRlTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApIHtcbiAgICAgICAgICAgICAgICB2YXIgbWV0YWRhdGFNYXAgPSBHZXRPckNyZWF0ZU1ldGFkYXRhTWFwKE8sIFAsIC8qQ3JlYXRlKi8gZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChJc1VuZGVmaW5lZChtZXRhZGF0YU1hcCkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoIW1ldGFkYXRhTWFwLmRlbGV0ZShNZXRhZGF0YUtleSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAobWV0YWRhdGFNYXAuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0TWV0YWRhdGEgPSBtZXRhZGF0YS5nZXQoTyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghSXNVbmRlZmluZWQodGFyZ2V0TWV0YWRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNZXRhZGF0YS5kZWxldGUoUCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0TWV0YWRhdGEuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhLmRlbGV0ZSh0YXJnZXRNZXRhZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gQ3JlYXRlRmFsbGJhY2tQcm92aWRlcihyZWZsZWN0KSB7XG4gICAgICAgICAgICB2YXIgZGVmaW5lTWV0YWRhdGEgPSByZWZsZWN0LmRlZmluZU1ldGFkYXRhLCBoYXNPd25NZXRhZGF0YSA9IHJlZmxlY3QuaGFzT3duTWV0YWRhdGEsIGdldE93bk1ldGFkYXRhID0gcmVmbGVjdC5nZXRPd25NZXRhZGF0YSwgZ2V0T3duTWV0YWRhdGFLZXlzID0gcmVmbGVjdC5nZXRPd25NZXRhZGF0YUtleXMsIGRlbGV0ZU1ldGFkYXRhID0gcmVmbGVjdC5kZWxldGVNZXRhZGF0YTtcbiAgICAgICAgICAgIHZhciBtZXRhZGF0YU93bmVyID0gbmV3IF9XZWFrTWFwKCk7XG4gICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSB7XG4gICAgICAgICAgICAgICAgaXNQcm92aWRlckZvcjogZnVuY3Rpb24gKE8sIFApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1ldGFkYXRhUHJvcGVydHlTZXQgPSBtZXRhZGF0YU93bmVyLmdldChPKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChtZXRhZGF0YVByb3BlcnR5U2V0KSAmJiBtZXRhZGF0YVByb3BlcnR5U2V0LmhhcyhQKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGdldE93bk1ldGFkYXRhS2V5cyhPLCBQKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChJc1VuZGVmaW5lZChtZXRhZGF0YVByb3BlcnR5U2V0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhUHJvcGVydHlTZXQgPSBuZXcgX1NldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhT3duZXIuc2V0KE8sIG1ldGFkYXRhUHJvcGVydHlTZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGFQcm9wZXJ0eVNldC5hZGQoUCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBPcmRpbmFyeURlZmluZU93bk1ldGFkYXRhOiBkZWZpbmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICBPcmRpbmFyeUhhc093bk1ldGFkYXRhOiBoYXNPd25NZXRhZGF0YSxcbiAgICAgICAgICAgICAgICBPcmRpbmFyeUdldE93bk1ldGFkYXRhOiBnZXRPd25NZXRhZGF0YSxcbiAgICAgICAgICAgICAgICBPcmRpbmFyeU93bk1ldGFkYXRhS2V5czogZ2V0T3duTWV0YWRhdGFLZXlzLFxuICAgICAgICAgICAgICAgIE9yZGluYXJ5RGVsZXRlTWV0YWRhdGE6IGRlbGV0ZU1ldGFkYXRhLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBwcm92aWRlcjtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0cyB0aGUgbWV0YWRhdGEgcHJvdmlkZXIgZm9yIGFuIG9iamVjdC4gSWYgdGhlIG9iamVjdCBoYXMgbm8gbWV0YWRhdGEgcHJvdmlkZXIgYW5kIHRoaXMgaXMgZm9yIGEgY3JlYXRlIG9wZXJhdGlvbixcbiAgICAgICAgICogdGhlbiB0aGlzIG1vZHVsZSdzIG1ldGFkYXRhIHByb3ZpZGVyIGlzIGFzc2lnbmVkIHRvIHRoZSBvYmplY3QuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBHZXRNZXRhZGF0YVByb3ZpZGVyKE8sIFAsIENyZWF0ZSkge1xuICAgICAgICAgICAgdmFyIHJlZ2lzdGVyZWRQcm92aWRlciA9IG1ldGFkYXRhUmVnaXN0cnkuZ2V0UHJvdmlkZXIoTywgUCk7XG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHJlZ2lzdGVyZWRQcm92aWRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVnaXN0ZXJlZFByb3ZpZGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKENyZWF0ZSkge1xuICAgICAgICAgICAgICAgIGlmIChtZXRhZGF0YVJlZ2lzdHJ5LnNldFByb3ZpZGVyKE8sIFAsIG1ldGFkYXRhUHJvdmlkZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZXRhZGF0YVByb3ZpZGVyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbGxlZ2FsIHN0YXRlLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbmFpdmUgTWFwIHNoaW1cbiAgICAgICAgZnVuY3Rpb24gQ3JlYXRlTWFwUG9seWZpbGwoKSB7XG4gICAgICAgICAgICB2YXIgY2FjaGVTZW50aW5lbCA9IHt9O1xuICAgICAgICAgICAgdmFyIGFycmF5U2VudGluZWwgPSBbXTtcbiAgICAgICAgICAgIHZhciBNYXBJdGVyYXRvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBNYXBJdGVyYXRvcihrZXlzLCB2YWx1ZXMsIHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cyA9IGtleXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlcyA9IHZhbHVlcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgTWFwSXRlcmF0b3IucHJvdG90eXBlW1wiQEBpdGVyYXRvclwiXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH07XG4gICAgICAgICAgICAgICAgTWFwSXRlcmF0b3IucHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH07XG4gICAgICAgICAgICAgICAgTWFwSXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2luZGV4O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCAmJiBpbmRleCA8IHRoaXMuX2tleXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fc2VsZWN0b3IodGhpcy5fa2V5c1tpbmRleF0sIHRoaXMuX3ZhbHVlc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICsgMSA+PSB0aGlzLl9rZXlzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cyA9IGFycmF5U2VudGluZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzID0gYXJyYXlTZW50aW5lbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogcmVzdWx0LCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIE1hcEl0ZXJhdG9yLnByb3RvdHlwZS50aHJvdyA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleXMgPSBhcnJheVNlbnRpbmVsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzID0gYXJyYXlTZW50aW5lbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIE1hcEl0ZXJhdG9yLnByb3RvdHlwZS5yZXR1cm4gPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2luZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9rZXlzID0gYXJyYXlTZW50aW5lbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlcyA9IGFycmF5U2VudGluZWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkb25lOiB0cnVlIH07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWFwSXRlcmF0b3I7XG4gICAgICAgICAgICB9KCkpO1xuICAgICAgICAgICAgdmFyIE1hcCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBNYXAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlS2V5ID0gY2FjaGVTZW50aW5lbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVJbmRleCA9IC0yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTWFwLnByb3RvdHlwZSwgXCJzaXplXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9rZXlzLmxlbmd0aDsgfSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgTWFwLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAoa2V5KSB7IHJldHVybiB0aGlzLl9maW5kKGtleSwgLyppbnNlcnQqLyBmYWxzZSkgPj0gMDsgfTtcbiAgICAgICAgICAgICAgICBNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fZmluZChrZXksIC8qaW5zZXJ0Ki8gZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggPj0gMCA/IHRoaXMuX3ZhbHVlc1tpbmRleF0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBNYXAucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2ZpbmQoa2V5LCAvKmluc2VydCovIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgTWFwLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2ZpbmQoa2V5LCAvKmluc2VydCovIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzaXplID0gdGhpcy5fa2V5cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gaW5kZXggKyAxOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5c1tpIC0gMV0gPSB0aGlzLl9rZXlzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlc1tpIC0gMV0gPSB0aGlzLl92YWx1ZXNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9rZXlzLmxlbmd0aC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzLmxlbmd0aC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFNhbWVWYWx1ZVplcm8oa2V5LCB0aGlzLl9jYWNoZUtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZUtleSA9IGNhY2hlU2VudGluZWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVJbmRleCA9IC0yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgTWFwLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXMubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVLZXkgPSBjYWNoZVNlbnRpbmVsO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZUluZGV4ID0gLTI7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBNYXAucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcy5fa2V5cywgdGhpcy5fdmFsdWVzLCBnZXRLZXkpOyB9O1xuICAgICAgICAgICAgICAgIE1hcC5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IE1hcEl0ZXJhdG9yKHRoaXMuX2tleXMsIHRoaXMuX3ZhbHVlcywgZ2V0VmFsdWUpOyB9O1xuICAgICAgICAgICAgICAgIE1hcC5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBNYXBJdGVyYXRvcih0aGlzLl9rZXlzLCB0aGlzLl92YWx1ZXMsIGdldEVudHJ5KTsgfTtcbiAgICAgICAgICAgICAgICBNYXAucHJvdG90eXBlW1wiQEBpdGVyYXRvclwiXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMuZW50cmllcygpOyB9O1xuICAgICAgICAgICAgICAgIE1hcC5wcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5lbnRyaWVzKCk7IH07XG4gICAgICAgICAgICAgICAgTWFwLnByb3RvdHlwZS5fZmluZCA9IGZ1bmN0aW9uIChrZXksIGluc2VydCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIVNhbWVWYWx1ZVplcm8odGhpcy5fY2FjaGVLZXksIGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NhY2hlSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fa2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChTYW1lVmFsdWVaZXJvKHRoaXMuX2tleXNbaV0sIGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fY2FjaGVJbmRleCA8IDAgJiYgaW5zZXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZUluZGV4ID0gdGhpcy5fa2V5cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9rZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlcy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlSW5kZXg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTWFwO1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgICAgIHJldHVybiBNYXA7XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXRLZXkoa2V5LCBfKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldFZhbHVlKF8sIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RW50cnkoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBba2V5LCB2YWx1ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gbmFpdmUgU2V0IHNoaW1cbiAgICAgICAgZnVuY3Rpb24gQ3JlYXRlU2V0UG9seWZpbGwoKSB7XG4gICAgICAgICAgICB2YXIgU2V0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIFNldCgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWFwID0gbmV3IF9NYXAoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNldC5wcm90b3R5cGUsIFwic2l6ZVwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5fbWFwLnNpemU7IH0sXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFNldC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0aGlzLl9tYXAuaGFzKHZhbHVlKTsgfTtcbiAgICAgICAgICAgICAgICBTZXQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gdGhpcy5fbWFwLnNldCh2YWx1ZSwgdmFsdWUpLCB0aGlzOyB9O1xuICAgICAgICAgICAgICAgIFNldC5wcm90b3R5cGUuZGVsZXRlID0gZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB0aGlzLl9tYXAuZGVsZXRlKHZhbHVlKTsgfTtcbiAgICAgICAgICAgICAgICBTZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkgeyB0aGlzLl9tYXAuY2xlYXIoKTsgfTtcbiAgICAgICAgICAgICAgICBTZXQucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9tYXAua2V5cygpOyB9O1xuICAgICAgICAgICAgICAgIFNldC5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5fbWFwLmtleXMoKTsgfTtcbiAgICAgICAgICAgICAgICBTZXQucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9tYXAuZW50cmllcygpOyB9O1xuICAgICAgICAgICAgICAgIFNldC5wcm90b3R5cGVbXCJAQGl0ZXJhdG9yXCJdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcy5rZXlzKCk7IH07XG4gICAgICAgICAgICAgICAgU2V0LnByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLmtleXMoKTsgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gU2V0O1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgICAgIHJldHVybiBTZXQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbmFpdmUgV2Vha01hcCBzaGltXG4gICAgICAgIGZ1bmN0aW9uIENyZWF0ZVdlYWtNYXBQb2x5ZmlsbCgpIHtcbiAgICAgICAgICAgIHZhciBVVUlEX1NJWkUgPSAxNjtcbiAgICAgICAgICAgIHZhciBrZXlzID0gSGFzaE1hcC5jcmVhdGUoKTtcbiAgICAgICAgICAgIHZhciByb290S2V5ID0gQ3JlYXRlVW5pcXVlS2V5KCk7XG4gICAgICAgICAgICByZXR1cm4gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIFdlYWtNYXAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleSA9IENyZWF0ZVVuaXF1ZUtleSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBXZWFrTWFwLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YWJsZSA9IEdldE9yQ3JlYXRlV2Vha01hcFRhYmxlKHRhcmdldCwgLypjcmVhdGUqLyBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJsZSAhPT0gdW5kZWZpbmVkID8gSGFzaE1hcC5oYXModGFibGUsIHRoaXMuX2tleSkgOiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFdlYWtNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhYmxlID0gR2V0T3JDcmVhdGVXZWFrTWFwVGFibGUodGFyZ2V0LCAvKmNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhYmxlICE9PSB1bmRlZmluZWQgPyBIYXNoTWFwLmdldCh0YWJsZSwgdGhpcy5fa2V5KSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFdlYWtNYXAucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh0YXJnZXQsIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YWJsZSA9IEdldE9yQ3JlYXRlV2Vha01hcFRhYmxlKHRhcmdldCwgLypjcmVhdGUqLyB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGFibGVbdGhpcy5fa2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFdlYWtNYXAucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhYmxlID0gR2V0T3JDcmVhdGVXZWFrTWFwVGFibGUodGFyZ2V0LCAvKmNyZWF0ZSovIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhYmxlICE9PSB1bmRlZmluZWQgPyBkZWxldGUgdGFibGVbdGhpcy5fa2V5XSA6IGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgV2Vha01hcC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IG5vdCBhIHJlYWwgY2xlYXIsIGp1c3QgbWFrZXMgdGhlIHByZXZpb3VzIGRhdGEgdW5yZWFjaGFibGVcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5ID0gQ3JlYXRlVW5pcXVlS2V5KCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gV2Vha01hcDtcbiAgICAgICAgICAgIH0oKSk7XG4gICAgICAgICAgICBmdW5jdGlvbiBDcmVhdGVVbmlxdWVLZXkoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleTtcbiAgICAgICAgICAgICAgICBkb1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBcIkBAV2Vha01hcEBAXCIgKyBDcmVhdGVVVUlEKCk7XG4gICAgICAgICAgICAgICAgd2hpbGUgKEhhc2hNYXAuaGFzKGtleXMsIGtleSkpO1xuICAgICAgICAgICAgICAgIGtleXNba2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIEdldE9yQ3JlYXRlV2Vha01hcFRhYmxlKHRhcmdldCwgY3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFoYXNPd24uY2FsbCh0YXJnZXQsIHJvb3RLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY3JlYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcm9vdEtleSwgeyB2YWx1ZTogSGFzaE1hcC5jcmVhdGUoKSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtyb290S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIEZpbGxSYW5kb21CeXRlcyhidWZmZXIsIHNpemUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNpemU7ICsraSlcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyW2ldID0gTWF0aC5yYW5kb20oKSAqIDB4ZmYgfCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBHZW5SYW5kb21CeXRlcyhzaXplKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBVaW50OEFycmF5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY3J5cHRvICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGFycmF5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbXNDcnlwdG8gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyhhcnJheSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBGaWxsUmFuZG9tQnl0ZXMoYXJyYXksIHNpemUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIEZpbGxSYW5kb21CeXRlcyhuZXcgQXJyYXkoc2l6ZSksIHNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gQ3JlYXRlVVVJRCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IEdlblJhbmRvbUJ5dGVzKFVVSURfU0laRSk7XG4gICAgICAgICAgICAgICAgLy8gbWFyayBhcyByYW5kb20gLSBSRkMgNDEyMiDCpyA0LjRcbiAgICAgICAgICAgICAgICBkYXRhWzZdID0gZGF0YVs2XSAmIDB4NGYgfCAweDQwO1xuICAgICAgICAgICAgICAgIGRhdGFbOF0gPSBkYXRhWzhdICYgMHhiZiB8IDB4ODA7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgVVVJRF9TSVpFOyArK29mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYnl0ZSA9IGRhdGFbb2Zmc2V0XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldCA9PT0gNCB8fCBvZmZzZXQgPT09IDYgfHwgb2Zmc2V0ID09PSA4KVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiLVwiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYnl0ZSA8IDE2KVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IFwiMFwiO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gYnl0ZS50b1N0cmluZygxNikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyB1c2VzIGEgaGV1cmlzdGljIHVzZWQgYnkgdjggYW5kIGNoYWtyYSB0byBmb3JjZSBhbiBvYmplY3QgaW50byBkaWN0aW9uYXJ5IG1vZGUuXG4gICAgICAgIGZ1bmN0aW9uIE1ha2VEaWN0aW9uYXJ5KG9iaikge1xuICAgICAgICAgICAgb2JqLl9fID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgZGVsZXRlIG9iai5fXztcbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICB9KTtcbn0pKFJlZmxlY3QgfHwgKFJlZmxlY3QgPSB7fSkpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiZXhwb3J0ICogZnJvbSAnLi9tb2R1bGVzJztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==