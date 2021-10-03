/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/game/entity.js":
/*!****************************!*\
  !*** ./src/game/entity.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const {Node, TRS } = __webpack_require__(/*! ../node */ "./src/node.js")
const {Physics} = __webpack_require__(/*! ../server/physics */ "./src/server/physics.js")
const {Box} = __webpack_require__(/*! ../server/collider */ "./src/server/collider.js")
const {makeRenderNode} = __webpack_require__(/*! ../render/model */ "./src/render/model.js")
const {cube} = __webpack_require__(/*! ../render/basemodel */ "./src/render/basemodel.js")
const m4 = __webpack_require__(/*! ../m4 */ "./src/m4.js")
const PartsMap = {
    box : function(x,y,z){
        return new Physics(new Box(x,y,z))
    }
}
const modelMap = {
    box : function(){
        return makeRenderNode(cube)
    }
}

class EntityNode extends Node{
    constructor(localMatrix, name, source, physics, renderNode){
        super(localMatrix, name, source)
        this.physics = physics
        this.renderNode = renderNode
        this.objectsToDraw = []
    }
    updateWorldMatrix(parentWorldMatrix){
        if(!parentWorldMatrix){
            this.worldMatrix = this.physics.collider.getM4()
            this.renderNode.updateWorldMatrix(this.worldMatrix)
            this.children.forEach(child => child.updateWorldMatrix(this.worldMatrix))
            return
        }
        let matrix = this.source.getMatrix()
        matrix = m4.multiply(parentWorldMatrix, matrix);
        this.worldMatrix = m4.multiply(matrix, this.localMatrix)
        this.physics.collider.pos.x = this.worldMatrix[12]
        this.physics.collider.pos.x = this.worldMatrix[13]
        this.physics.collider.pos.x = this.worldMatrix[14]
        this.physics.collider.setRmatrix(m4.m4Tom3(this.worldMatrix))
        this.renderNode.updateWorldMatrix(this.worldMatrix)
        this.children.forEach((child) => {
            child.updateWorldMatrix([...matrix]);
        })
    }
    updateObjectsToDraw(){
        this.traversal(node =>{
            
            if(node.renderNode){
                node.renderNode.traversal(_node =>this.objectsToDraw.push(_node))
                
            }
        })
    }
}
const makeEntity = (desc) =>{
    const source = new TRS()
    let matrix = m4.xRotation(desc.rotation[0])
    matrix = m4.yRotate(matrix,desc.rotation[1])
    matrix = m4.zRotate(matrix,desc.rotation[2])
    matrix = m4.translate(matrix,...desc.translation)
    const physics = PartsMap[desc.physics.name](...desc.physics.props)
    const model = modelMap[desc.model.name](...desc.model.props)
    const node = new EntityNode(matrix, desc.name, source, physics, model)
    
    if(desc.children){
        desc.children.forEach(childDesc =>{
            const child = makeEntity(childDesc)
            child.setParent(node)
        })
    }
    return node
}
module.exports = { EntityNode, makeEntity}


/***/ }),

/***/ "./src/game/objects.js":
/*!*****************************!*\
  !*** ./src/game/objects.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {


const box = {
    translation : [0,0,0],
    rotation :  [0,0,0],
    scale : [1,1,1],
    physics : {
        name : 'box',
        props : [1,1,1]
    },
    model : {
        name : 'box',
        props : []
    },
    
}

module.exports = {box}

/***/ }),

/***/ "./src/m3.js":
/*!*******************!*\
  !*** ./src/m3.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports) {

const m3 = {
    multiply : function(b, a) {
        var a00 = a[0 * 3 + 0];
        var a01 = a[0 * 3 + 1];
        var a02 = a[0 * 3 + 2];
        var a10 = a[1 * 3 + 0];
        var a11 = a[1 * 3 + 1];
        var a12 = a[1 * 3 + 2];
        var a20 = a[2 * 3 + 0];
        var a21 = a[2 * 3 + 1];
        var a22 = a[2 * 3 + 2];
        var b00 = b[0 * 3 + 0];
        var b01 = b[0 * 3 + 1];
        var b02 = b[0 * 3 + 2];
        var b10 = b[1 * 3 + 0];
        var b11 = b[1 * 3 + 1];
        var b12 = b[1 * 3 + 2];
        var b20 = b[2 * 3 + 0];
        var b21 = b[2 * 3 + 1];
        var b22 = b[2 * 3 + 2];
    
        return [
          b00 * a00 + b01 * a10 + b02 * a20,
          b00 * a01 + b01 * a11 + b02 * a21,
          b00 * a02 + b01 * a12 + b02 * a22,
          b10 * a00 + b11 * a10 + b12 * a20,
          b10 * a01 + b11 * a11 + b12 * a21,
          b10 * a02 + b11 * a12 + b12 * a22,
          b20 * a00 + b21 * a10 + b22 * a20,
          b20 * a01 + b21 * a11 + b22 * a21,
          b20 * a02 + b21 * a12 + b22 * a22,
        ];
      },
      xRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
     
        return [
          1, 0, 0, 
          0, c, s, 
          0, -s, c
        ];
      },
     
      yRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
     
        return [
          c, 0, -s, 
          0, 1, 0, 
          s, 0, c
        ];
      },
     
      zRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
     
        return [
           c, s, 0, 
          -s, c, 0,
           0, 0, 1
        ];
      },
      m3Tom4 : function(m){
        const dst = new Float32Array(16)
        dst[ 0] = m[0]
        dst[ 1] = m[1]
        dst[ 2] = m[2]
        dst[ 3] = 0
        dst[ 4] = m[3]
        dst[ 5] = m[4]
        dst[ 6] = m[5]
        dst[ 7] = 0
        dst[ 8] = m[6]
        dst[ 9] = m[7]
        dst[10] = m[8]
        dst[11] = 0
        dst[12] = 0
        dst[13] = 0
        dst[14] = 0
        dst[15] = 1
        return dst
      },
      xRotate: function(m, angleInRadians) {
        return m3.multiply(m, m3.xRotation(angleInRadians));
      },
     
      yRotate: function(m, angleInRadians) {
        return m3.multiply(m, m3.yRotation(angleInRadians));
      },
     
      zRotate: function(m, angleInRadians) {
        return m3.multiply(m, m3.zRotation(angleInRadians));
      },
      transformPoint : function(m, v, dst) {
        dst = dst || new Float32Array(3);
        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];
        
    
        dst[0] = (v0 * m[0 * 3 + 0] + v1 * m[1 * 3 + 0] + v2 * m[2 * 3 + 0]  ) 
        dst[1] = (v0 * m[0 * 3 + 1] + v1 * m[1 * 3 + 1] + v2 * m[2 * 3 + 1]  ) 
        dst[2] = (v0 * m[0 * 3 + 2] + v1 * m[1 * 3 + 2] + v2 * m[2 * 3 + 2] ) 
    
        return dst;
      },
      identity : function() {
        return [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
        ];
      },
      transpose : function(m){
         
          dst = new Float32Array(9)
          dst[0] = m[0]
          dst[1] = m[3]
          dst[2] = m[6]
          dst[3] = m[1]
          dst[4] = m[4]
          dst[5] = m[7]
          dst[6] = m[2]
          dst[7] = m[5]
          dst[8] = m[8]
          return dst
      },
      scaling : function(sx,sy,sz){
        return new Float32Array([
                    sx, 0, 0,
                    0, sy, 0,
                    0,  0, sz
              ])
      },
      scale : function(m, sx,sy,sz){
        return m3.multiply(m, m3.scaling(sx, sy, sz))
      },
      inverse : function(m){
       const det = m[0] * m[4] * m[8] + 
                   m[2] * m[3] * m[7] +
                   m[1] * m[5] * m[6] -
                   m[2] * m[4] * m[6] -
                   m[0] * m[5] * m[7] -
                   m[8] * m[3] * m[2] 
        const dst = new Float32Array(9)
        dst[0] = (m[4] * m[8] - m[7] * m[5]) / det
        dst[1] = (m[3] * m[8] - m[6] * m[5]) / det
        dst[2] = (m[3] * m[7] - m[6] * m[4]) / det
        dst[3] = (m[1] * m[8] - m[2] * m[7]) / det
        dst[4] = (m[3])
        
      },
      toString(m){
        return m.reduce((acc,el,idx) => (idx) % 3 === 0 ? acc += '\n' + el : acc += ' ' + el )
      },
      dot(v1,v2){
        return v1[0]*v2[0] + v1[1]*v2[1] + v1[2] * v2[2]
      }
}
module.exports = m3

/***/ }),

/***/ "./src/m4.js":
/*!*******************!*\
  !*** ./src/m4.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports) {

const MatType = Float32Array
const m4 = {
    multiply: function(a, b) {
      var a00 = a[0 * 4 + 0];
      var a01 = a[0 * 4 + 1];
      var a02 = a[0 * 4 + 2];
      var a03 = a[0 * 4 + 3];
      var a10 = a[1 * 4 + 0];
      var a11 = a[1 * 4 + 1];
      var a12 = a[1 * 4 + 2];
      var a13 = a[1 * 4 + 3];
      var a20 = a[2 * 4 + 0];
      var a21 = a[2 * 4 + 1];
      var a22 = a[2 * 4 + 2];
      var a23 = a[2 * 4 + 3];
      var a30 = a[3 * 4 + 0];
      var a31 = a[3 * 4 + 1];
      var a32 = a[3 * 4 + 2];
      var a33 = a[3 * 4 + 3];
      var b00 = b[0 * 4 + 0];
      var b01 = b[0 * 4 + 1];
      var b02 = b[0 * 4 + 2];
      var b03 = b[0 * 4 + 3];
      var b10 = b[1 * 4 + 0];
      var b11 = b[1 * 4 + 1];
      var b12 = b[1 * 4 + 2];
      var b13 = b[1 * 4 + 3];
      var b20 = b[2 * 4 + 0];
      var b21 = b[2 * 4 + 1];
      var b22 = b[2 * 4 + 2];
      var b23 = b[2 * 4 + 3];
      var b30 = b[3 * 4 + 0];
      var b31 = b[3 * 4 + 1];
      var b32 = b[3 * 4 + 2];
      var b33 = b[3 * 4 + 3];
      return [
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
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
      ];
    },
      
      translation: function(tx, ty, tz) {
        return [
           1,  0,  0,  0,
           0,  1,  0,  0,
           0,  0,  1,  0,
           tx, ty, tz, 1,
        ];
      },
     
      xRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
     
        return [
          1, 0, 0, 0,
          0, c, s, 0,
          0, -s, c, 0,
          0, 0, 0, 1,
        ];
      },
     
      yRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
     
        return [
          c, 0, -s, 0,
          0, 1, 0, 0,
          s, 0, c, 0,
          0, 0, 0, 1,
        ];
      },
     
      zRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
     
        return [
           c, s, 0, 0,
          -s, c, 0, 0,
           0, 0, 1, 0,
           0, 0, 0, 1,
        ];
      },
     
      scaling: function(sx, sy, sz) {
        return [
          sx, 0,  0,  0,
          0, sy,  0,  0,
          0,  0, sz,  0,
          0,  0,  0,  1,
        ];
      },
      translate: function(m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
      },
     
      xRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
      },
     
      yRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
      },
     
      zRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
      },
     
      scale: function(m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
      },
      makeOrt : function(v){
        const o = [0,0,0]
        const norm = Math.sqrt( v[0] * v[0] + v[1] * v[1] + v[2]*v[2] )
        o[0] = v[0] / norm
        o[1] = v[1] / norm
        o[2] = v[2] / norm
        return o
      },
      projection: function(width, height, depth) {
        // Эта матрица переворачивает Y, чтобы 0 был наверху
        return [
           2 / width, 0, 0, 0,
           0, -2 / height, 0, 0,
           0, 0, 2 / depth, 0,
          -1, 1, 0, 1,
        ];
      },
      perspective: function(fieldOfViewInRadians, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);
     
        return [
          f / aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (near + far) * rangeInv, -1,
          0, 0, near * far * rangeInv * 2, 0
        ];
      },
      inverse: function(m) {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0  = m22 * m33;
        var tmp_1  = m32 * m23;
        var tmp_2  = m12 * m33;
        var tmp_3  = m32 * m13;
        var tmp_4  = m12 * m23;
        var tmp_5  = m22 * m13;
        var tmp_6  = m02 * m33;
        var tmp_7  = m32 * m03;
        var tmp_8  = m02 * m23;
        var tmp_9  = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;
    
        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
    
        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
    
        return [
          d * t0,
          d * t1,
          d * t2,
          d * t3,
          d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
          d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
          d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
          d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
          d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
          d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
          d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
          d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
          d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
          d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
          d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
          d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
      },
      lookAt: function(cameraPosition, target, up) {
        var zAxis = normalize(
            subtractVectors(cameraPosition, target));
        var xAxis = normalize(cross(up, zAxis));
        var yAxis = normalize(cross(zAxis, xAxis));
     
        return [
           xAxis[0], xAxis[1], xAxis[2], 0,
           yAxis[0], yAxis[1], yAxis[2], 0,
           zAxis[0], zAxis[1], zAxis[2], 0,
           cameraPosition[0],
           cameraPosition[1],
           cameraPosition[2],
           1,
        ];
      },
      copy:function(src){
        
          const dst = new MatType(16);
      
          dst[ 0] = src[ 0];
          dst[ 1] = src[ 1];
          dst[ 2] = src[ 2];
          dst[ 3] = src[ 3];
          dst[ 4] = src[ 4];
          dst[ 5] = src[ 5];
          dst[ 6] = src[ 6];
          dst[ 7] = src[ 7];
          dst[ 8] = src[ 8];
          dst[ 9] = src[ 9];
          dst[10] = src[10];
          dst[11] = src[11];
          dst[12] = src[12];
          dst[13] = src[13];
          dst[14] = src[14];
          dst[15] = src[15];
      
          return dst;
        
      
      },
      vectorSum : function(v1,v2){
        const vector = [0,0,0]
        vector[0] = v1[0] + v2[0]
        vector[1] = v1[1] + v2[1]
        vector[2] = v1[2] + v2[2]
        return vector
      },
      cross  : function(a, b) {
        return [a[1] * b[2] - a[2] * b[1],
                a[2] * b[0] - a[0] * b[2],
                a[0] * b[1] - a[1] * b[0]];
      },
      vectorScalarProduct(a,s){
        let v = [0,0,0]

        v[0] = a[0] * s
        v[1] = a[1] * s
        v[2] = a[2] * s
        if(isNaN(v[0])|| isNaN(v[2]) || isNaN(v[2])) return [0,0,0]
        return v
      },

      scalarProduct : function(v1,v2){
        let a = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
        
        return a
      },
      dot(v1,v2){
        return v1[0]*v2[0] + v1[1]*v2[1] + v1[2] * v2[2]
      },
      isNullVector: function(v){
        
        return !v[0]&&!v[1]&&!v[2]
      },
      getVectorLength(v){
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
      },
      transformPoint : function(m, v, dst) {
        dst = dst || new MatType(3);
        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];
        var d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];
    
        dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
        dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
        dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;
    
        return dst;
      },
      normalize : function(v, dst) {
        dst = dst || new MatType(3);
        var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we don't divide by 0.
        if (length > 0.00001) {
          dst[0] = v[0] / length;
          dst[1] = v[1] / length;
          dst[2] = v[2] / length;
        }
        return dst;
      },
      identity: function() {
        dst = new MatType(16);
        dst[ 0] = 1;
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = 1;
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;
    
        return dst;
      },
      m3Tom4 : function(m){
        const dst = new MatType(16)
        dst[ 0] = m[0]
        dst[ 1] = m[1]
        dst[ 2] = m[2]
        dst[ 3] = 0
        dst[ 4] = m[3]
        dst[ 5] = m[4]
        dst[ 6] = m[5]
        dst[ 7] = 0
        dst[ 8] = m[6]
        dst[ 9] = m[7]
        dst[10] = m[8]
        dst[11] = 0
        dst[12] = 0
        dst[13] = 0
        dst[14] = 0
        dst[15] = 1
        return dst
      },
      m4Tom3 : function(m){
        const dst = new MatType(9)
        dst[ 0] = m[0]
        dst[ 1] = m[1]
        dst[ 2] = m[2]
        dst[ 3] = m[4]
        dst[ 4] = m[5]
        dst[ 5] = m[6]
        dst[ 6] = m[8]
        dst[ 7] = m[9]
        dst[ 8] = m[10]
        return dst
      },
      toString(m){
        return m.reduce((acc,el,idx) => (idx) % 4 === 0 ? acc += '\n' + el : acc += ' ' + el )
      },
      transpose: function(m) {
        return [
          m[0], m[4], m[8], m[12],
          m[1], m[5], m[9], m[13],
          m[2], m[6], m[10], m[14],
          m[3], m[7], m[11], m[15],
        ];
      },
    };
    function makeZToWMatrix(fudgeFactor) {
      return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, fudgeFactor,
        0, 0, 0, 1,
      ];
    }
    function cross(a, b) {
      return [a[1] * b[2] - a[2] * b[1],
              a[2] * b[0] - a[0] * b[2],
              a[0] * b[1] - a[1] * b[0]];
    }
    function subtractVectors(a, b) {
      return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }
    
module.exports = m4

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {drawScene, drawPoints, drawLines, resizeCanvasToDisplaySize} = __webpack_require__(/*! ./render/render */ "./src/render/render.js")
const m4 = __webpack_require__(/*! ./m4 */ "./src/m4.js")

const {makeEntity} = __webpack_require__(/*! ./game/entity */ "./src/game/entity.js")
const {box} = __webpack_require__(/*! ./game/objects */ "./src/game/objects.js")

const cPos = [0,2,25]
const cRot = [0,0,0]
const controls = {
    ArrowDown : ()=> cRot[0] -= 0.1 ,
    ArrowUp : () => cRot[0] += 0.1 ,
    ArrowLeft : () => cRot[1] += 0.1,
    ArrowRight : () => cRot[1] -=0.1 ,
    w : () => {
        const delta = m4.transformPoint(m4.xRotate(m4.yRotation(cRot[1]), cRot[0]),[0,0,-1])
        cPos[0] += delta[0]
        cPos[1] += delta[1]
        cPos[2] += delta[2]
        
    } ,
    s : () => {
        const delta = m4.transformPoint(m4.xRotate(m4.yRotation(cRot[1]), cRot[0]),[0,0,1])
        cPos[0] += delta[0]
        cPos[1] += delta[1]
        cPos[2] += delta[2]
        
    } ,
    a : () => {
        const delta = m4.transformPoint(m4.xRotate(m4.yRotation(cRot[1]), cRot[0]),[-1,0,0])
        cPos[0] += delta[0]
        cPos[1] += delta[1]
        cPos[2] += delta[2]
        
    } ,
    d : () => {
        const delta = m4.transformPoint(m4.xRotate(m4.yRotation(cRot[1]), cRot[0]),[1,0,0])
        cPos[0] += delta[0]
        cPos[1] += delta[1]
        cPos[2] += delta[2]
        
    }
}
const mouseControls = {
    lastX : 0,
    lastY : 0,
    mousemove : function(e){
        
        deltaX = e.offsetX - this.lastX 
        this.lastX = e.offsetX
        deltaY = e.offsetY -  this.lastY
        this.lastY = e.offsetY
        
        cRot[1] -= deltaX*0.005
        cRot[0] -= deltaY*0.005
    }
}
document.onkeydown = e =>{
    if(!controls[e.key]) return
    controls[e.key]()
}
document.onmousedown = (e) =>{
    mouseControls.lastY = e.offsetY
    mouseControls.lastX = e.offsetX
    document.onmousemove = mouseControls.mousemove.bind(mouseControls)
    document.onmouseup = ()=>{
       
        document.onmousemove = null
    }
}
const uniforms = { u_lightWorldPosition : [0,35,0], u_ambientLight : [0.2,0.2,0.3,1]}
const {Simulation} = __webpack_require__(/*! ./server/simulation */ "./src/server/simulation.js")
const sim = new Simulation()



const { Vector } = __webpack_require__(/*! ./server/vectors */ "./src/server/vectors.js")
const objectsToDraw = []
const floor = makeEntity(box)
const floor2 = makeEntity(box)
const wallN = makeEntity(box)
const wallS = makeEntity(box)
const wallW = makeEntity(box)
const wallE = makeEntity(box)


floor.updateObjectsToDraw()
sim.addObject(floor.physics)
floor.physics.collider.min = new Vector(-30,-2,-30)
floor.physics.collider.max = new Vector(30,2,30)


floor.renderNode.localMatrix = m4.scaling(60,4,60)
floor.physics.setMass(100000000)

floor2.updateObjectsToDraw()
sim.addObject(floor2.physics)
floor2.physics.collider.min = new Vector(-10,-10,-10)
floor2.physics.collider.max = new Vector(10,10,10)
floor2.renderNode.localMatrix = m4.scaling(20,20,20)
floor2.physics.setMass(100000000)

let entities = [wallN, wallE, wallW, wallS]
entities.forEach(wall =>{
    wall.updateObjectsToDraw()
    objectsToDraw.push(...wall.objectsToDraw)
    sim.addObject(wall.physics)
    wall.physics.setMass(100000000)
    wall.physics.static = true
    wall.physics.collider.min = new Vector(-30,-2,-30)
    wall.physics.collider.max = new Vector(30,2,30)
    wall.renderNode.localMatrix = m4.scaling(60,4,60)
})
entities.push(floor, floor2)
floor.physics.translate(0,-2,0)
floor.physics.static = true
floor2.physics.static = true

floor2.physics.translate(10,0,0)
floor2.physics.rotate(Math.PI/4,0,0)
wallN.physics.translate(0,0,30)
wallN.physics.rotate(Math.PI/2,0,0)

wallS.physics.translate(0,0,-30)
wallS.physics.rotate(Math.PI/2,0,0)

wallW.physics.translate(30,0,0)
wallW.physics.rotate(0,0, Math.PI/2)

wallE.physics.translate(-30,0,0)
wallE.physics.rotate(0,0, Math.PI/2)


objectsToDraw.push(...floor.objectsToDraw, ...floor2.objectsToDraw)

let cameraMatrix = m4.translation(...cPos)
cameraMatrix = m4.yRotate(cameraMatrix, cRot[1])
cameraMatrix = m4.xRotate(cameraMatrix, cRot[0])




controls[' '] = () =>{
    const cube = makeEntity(box)
    cube.updateObjectsToDraw()
    entities.push(cube)
    objectsToDraw.push(...cube.objectsToDraw)
    sim.addObject(cube.physics)
    
    cube.renderNode.sprite.uniforms.u_color = [0.2,0.3,0.4,1]
    cube.physics.translate(...cPos)
    
    let Rm = m4.yRotation(cRot[1])
    Rm = m4.xRotate(Rm, cRot[0])
    
    const vel = m4.transformPoint(Rm, [0,0,-20])
    
    cube.physics.addVelocity(new Vector(...vel))
    cube.physics.addAcceleration(new Vector(0,-9.8,0))
    

}
 
resizeCanvasToDisplaySize(gl.canvas, 1)

const loop = () =>{
    
   
    
    entities.forEach(entity => entity.updateWorldMatrix())
    sim.tick(0.016)
    cameraMatrix = m4.translation(...cPos)
    cameraMatrix = m4.yRotate(cameraMatrix, cRot[1])
    cameraMatrix = m4.xRotate(cameraMatrix, cRot[0])
    
    const manifolds = sim.collisionManifolds.values()
    const cols = []
    for(let manifold of manifolds)cols.push(...manifold.contacts)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)
    drawScene(objectsToDraw, cameraMatrix, uniforms)
   
    requestAnimationFrame(loop)


}

loop()

/***/ }),

/***/ "./src/node.js":
/*!*********************!*\
  !*** ./src/node.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const m4 = __webpack_require__(/*! ./m4 */ "./src/m4.js")
class TRS{
    constructor(){
        this.translation = [0,0,0]
        this.rotation = [0, 0, 0]
        this.scale = [1, 1, 1]
    }
    
    getMatrix(m) {
        let dst = m || m4.identity();
        var t = this.translation;
        var r = this.rotation;
        var s = this.scale;
        dst = m4.translate(dst,t[0], t[1], t[2]);
        dst = m4.xRotate(dst, r[0]);
        dst = m4.yRotate(dst, r[1]);
        dst = m4.zRotate(dst, r[2]);
        dst = m4.scale(dst, s[0], s[1], s[2]);
        return dst;
      };
    getRMatrix(){
        let dst = m4.identity();
        var r = this.rotation;
        dst = m4.xRotate(dst, r[0]);
        dst = m4.yRotate(dst, r[1]);
        dst = m4.zRotate(dst, r[2]);
        return dst
    }
}
class Node{
    constructor(localMatrix, name, source = new TRS()){
        this.localMatrix = localMatrix
        this.worldMatrix = m4.identity()
        this.parent = null
        this.children = []
        this.source = source
        this.name = name
        this.parts = []
    }
    setParent(parent){
        if (this.parent) {
            var ndx = this.parent.children.indexOf(this);
            if (ndx >= 0) {
              this.parent.children.splice(ndx, 1);
            }
          }
          if (parent) {
            parent.children.push(this);
          }
          this.parent = parent;
    }
    updateWorldMatrix(parentWorldMatrix){
        var source = this.source;
        let matrix = source.getMatrix()
        if (parentWorldMatrix) {
          matrix = m4.multiply(parentWorldMatrix, matrix);
        }
        this.worldMatrix = m4.multiply(matrix, this.localMatrix)
        this.children.forEach((child) => {
          child.updateWorldMatrix([...matrix]);
        })
    }
    updatePartsList(){
        const iter = (node,arr) => {
            arr.push(node)
            node.children.forEach(child => iter(child,arr))
        }
        iter(this, this.parts)
    }
    traversal(func){
      func(this)
      this.children.forEach(child => child.traversal(func))
    }
    
    
}


module.exports = {Node, TRS}

/***/ }),

/***/ "./src/render/basemodel.js":
/*!*********************************!*\
  !*** ./src/render/basemodel.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {



const cube = {
        name : '',
        sTranslation : [0,0,0],
        translation : [0,0,0],
        rotation : [0,0,0],
        scale : [1,1,1],
        spriteName : 'BoxSprite',
}
module.exports = { cube}

/***/ }),

/***/ "./src/render/model.js":
/*!*****************************!*\
  !*** ./src/render/model.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {



const {Node, TRS} =  __webpack_require__(/*! ../node */ "./src/node.js")
const sprites = __webpack_require__(/*! ./sprites */ "./src/render/sprites.js")

const m4 = __webpack_require__(/*! ../m4 */ "./src/m4.js")



class RenderNode extends Node{
    constructor(localMatrix, name, source,spriteName){
        super(localMatrix, name, source)
        
        this.sprite = new sprites[spriteName]()
        
        this.objectsToDraw = []
    }
    updateObjectsToDraw(){
        this.updatePartsList()
        this.objectsToDraw = this.parts.filter(part => part.sprite)
    }
}
const makeRenderNode = (desc)=>{
    const source = new TRS()
   
    source.translation = desc.sTranslation
    
    
    
    matrix = m4.xRotation( desc.rotation[0])
    matrix = m4.yRotate(matrix,desc.rotation[1])
    matrix = m4.zRotate(matrix,desc.rotation[2])
    matrix = m4.translate(matrix, ...desc.translation)
    matrix = m4.scale(matrix, ...desc.scale)
    const node = new RenderNode(matrix,desc.name,source, desc.spriteName)
    
    if(desc.children){
        desc.children.forEach(childDesc =>{
            const child = makeRenderNode(childDesc)
            child.setParent(node)
        })
    }
    return node
}
module.exports = {RenderNode, makeRenderNode}


/***/ }),

/***/ "./src/render/primitives.js":
/*!**********************************!*\
  !*** ./src/render/primitives.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {expandedTypedArray} = __webpack_require__( /*! ./programm.js */ "./src/render/programm.js")



const CUBE_FACE_INDICES = [
    [3, 7, 5, 1], // right
    [6, 2, 0, 4], // left
    [6, 7, 3, 2], // ??
    [0, 1, 5, 4], // ??
    [7, 6, 4, 5], // front
    [2, 3, 1, 0], // back
  ];


function createBoxGeometry(_a = 1, _b = 1, _c = 1){
    const a = _a/2, b = _b/2, c = _c/2
    const cornerVertices = [
        [-a, -b, -c],
        [+a, -b, -c],
        [-a, +b, -c],
        [+a, +b, -c],
        [-a, -b, +c],
        [+a, -b, +c],
        [-a, +b, +c],
        [+a, +b, +c],
      ];
  
      const faceNormals = [
        [+1, +0, +0],
        [-1, +0, +0],
        [+0, +1, +0],
        [+0, -1, +0],
        [+0, +0, +1],
        [+0, +0, -1],
      ];
  
      const uvCoords = [
        [1, 0],
        [0, 0],
        [0, 1],
        [1, 1],
      ];
      const numVertices = 6 * 4
      const positions = expandedTypedArray(new Float32Array(numVertices * 3))
      const normals   = expandedTypedArray(new Float32Array(numVertices * 3))
      //const texCoords = webglUtils.createAugmentedTypedArray(2 , numVertices);
      const indices   = expandedTypedArray(new Uint16Array(6 * 2 * 3))
  
      for (let f = 0; f < 6; ++f) {
        const faceIndices = CUBE_FACE_INDICES[f];
        for (let v = 0; v < 4; ++v) {
          const position = cornerVertices[faceIndices[v]];
          const normal = faceNormals[f];
          positions.push(position)
          normals.push(normal)
          
          
  
        }
        
        const offset = 4 * f;
        indices.push(offset + 0, offset + 1, offset + 2);
        indices.push(offset + 0, offset + 2, offset + 3);
      }
  
      return {
        position: positions,
        normal: normals,
        
        indices: indices,
      };
}




 function createGeometry(arrays){
  const v = arrays.v
  const vt = arrays.vt
  const vn = arrays.vn
  const f = arrays.f
  const numFaces = f.length
  const facesSize = f[0].length
  const numVertices = numFaces * facesSize
  const positions = expandedTypedArray(new Float32Array(numVertices * 3))
  const normals   = expandedTypedArray(new Float32Array(numVertices * 3))
  const indices   = expandedTypedArray(new Uint16Array(numFaces * 2 * 3))
  for (let i = 0; i < numFaces; ++i) {
    const faceIndices = f[i];
    for (let j = 0; j < facesSize; ++j) {
      const position = v[faceIndices[j] - 1];
      const normal = vn[i];
    
      positions.push(position)
      //normals.push(normal)
      
      //texCoords.push(uv);

    }
    
    const offset = 4 * i;
    indices.push(offset + 0, offset + 1, offset + 2);
    indices.push(offset + 0, offset + 2, offset + 3);
  } 
  return {position : positions, normal : normals, indices}
}

const linedBoxIndices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, //front
  0, 5, 5, 4, 4, 1, 1, 0, //bottom
  0, 4, 4, 7, 7, 3, 3, 0, //left
  1, 2, 2, 6, 6, 5, 5, 1, //right
  4, 5, 5, 6, 6, 7, 7, 4, // back
  2, 7, 7, 3, 3, 6, 6, 2 // top 
])
module.exports = {createBoxGeometry, createGeometry, linedBoxIndices}

/***/ }),

/***/ "./src/render/programm.js":
/*!********************************!*\
  !*** ./src/render/programm.js ***!
  \********************************/
/*! exports provided: expandedTypedArray, ProgrammInfo, createBuffersInfo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expandedTypedArray", function() { return expandedTypedArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ProgrammInfo", function() { return ProgrammInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBuffersInfo", function() { return createBuffersInfo; });

function getGLTypeForTypedArray(gl, typedArray) {
    if (typedArray instanceof Int8Array)    { return gl.BYTE; }            // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return gl.UNSIGNED_BYTE; }   // eslint-disable-line
    if (typedArray instanceof Int16Array)   { return gl.SHORT; }           // eslint-disable-line
    if (typedArray instanceof Uint16Array)  { return gl.UNSIGNED_SHORT; }  // eslint-disable-line
    if (typedArray instanceof Int32Array)   { return gl.INT; }             // eslint-disable-line
    if (typedArray instanceof Uint32Array)  { return gl.UNSIGNED_INT; }    // eslint-disable-line
    if (typedArray instanceof Float32Array) { return gl.FLOAT; }           // eslint-disable-line
    return false
  }
function expandedTypedArray(array){
   
    let cursor = 0
    array.push = function(){
        for (let ii = 0; ii < arguments.length; ++ii) {
          const value = arguments[ii];
          
          if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
            for (let jj = 0; jj < value.length; ++jj) {
              array[cursor++] = value[jj];
            }
          } else {
            array[cursor++] = value;
          }
        }
        
      }
      
      return array
  }

function createUniformSetters(gl, program){
    let textureUnit = 0

    function createUniformSetter(program, uniformInfo) {
    
        const location = gl.getUniformLocation(program, uniformInfo.name)
        const type = uniformInfo.type
        const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');
        
        if (type === gl.FLOAT && isArray) {
        return function(v) {
            gl.uniform1fv(location, v);
        };
        }
        if (type === gl.FLOAT) {
        return function(v) {
            gl.uniform1f(location, v);
        };
        }
        if (type === gl.FLOAT_VEC2) {
        return function(v) {
            gl.uniform2fv(location, v);
        };
        }
        if (type === gl.FLOAT_VEC3) {
        return function(v) {
            gl.uniform3fv(location, v);
        };
        }
        if (type === gl.FLOAT_VEC4) {
        return function(v) {
            gl.uniform4fv(location, v);
        };
        }
        if (type === gl.INT && isArray) {
        return function(v) {
            gl.uniform1iv(location, v);
        };
        }
        if (type === gl.INT) {
        return function(v) {
            gl.uniform1i(location, v);
        };
        }
        if (type === gl.INT_VEC2) {
        return function(v) {
            gl.uniform2iv(location, v);
        };
        }
        if (type === gl.INT_VEC3) {
        return function(v) {
            gl.uniform3iv(location, v);
        };
        }
        if (type === gl.INT_VEC4) {
        return function(v) {
            gl.uniform4iv(location, v);
        };
        }
        if (type === gl.BOOL) {
        return function(v) {
            gl.uniform1iv(location, v);
        };
        }
        if (type === gl.BOOL_VEC2) {
        return function(v) {
            gl.uniform2iv(location, v);
        };
        }
        if (type === gl.BOOL_VEC3) {
        return function(v) {
            gl.uniform3iv(location, v);
        };
        }
        if (type === gl.BOOL_VEC4) {
        return function(v) {
            gl.uniform4iv(location, v);
        };
        }
        if (type === gl.FLOAT_MAT2) {
        return function(v) {
            gl.uniformMatrix2fv(location, false, v);
        };
        }
        if (type === gl.FLOAT_MAT3) {
        return function(v) {
            gl.uniformMatrix3fv(location, false, v);
        };
        }
        if (type === gl.FLOAT_MAT4) {
        return function(v) {
            gl.uniformMatrix4fv(location, false, v);
        };
        }    
    }
    const uniformSetters = { };
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    
    for (let ii = 0; ii < numUniforms; ++ii) {
      const uniformInfo = gl.getActiveUniform(program, ii);
      if (!uniformInfo) {
        break;
      }
      
      let name = uniformInfo.name;
      
      if (name.substr(-3) === '[0]') {
        name = name.substr(0, name.length - 3);
      }
      if(uniformInfo.size > 1){
        for(let i = 0; i < uniformInfo.size; i++){
          const obj = {size : uniformInfo.size, type : uniformInfo.type, name : name + `[${i}]`}
          uniformSetters[name + `[${i}]`] = createUniformSetter(program, obj );
        }
      }
      else{
        const setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
      }
      
    }
    return uniformSetters
}
function createAttribSetters(gl, program){
    const setters = {}
    
    const numAtrribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
    for(let i = 0; i < numAtrribs; i++){
      const attribInfo = gl.getActiveAttrib(program,i)
      const location = gl.getAttribLocation(program,attribInfo.name)
      setters[attribInfo.name] = function(bufferInfo){
 
        const {numComponents, type, buffer} = bufferInfo
        gl.enableVertexAttribArray(location)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.vertexAttribPointer(location, numComponents, type, false, 0,0)
      }
    }
    return setters
  }
function createBuffersInfo(gl,arrays){
    const buffersInfo = {}
    buffersInfo.attribs = {}
    Object.keys(arrays).forEach(key =>{
        if(key === 'indices') return 
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, arrays[key],gl.STATIC_DRAW)
        buffersInfo.attribs['a_' + key] = {
            buffer,
            numComponents : 3,
            type : getGLTypeForTypedArray(gl,arrays[key])
        }
     
    })

    if(arrays.indices){
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices,gl.STATIC_DRAW)
        buffersInfo.indices = buffer
        buffersInfo.numElements = arrays.indices.length
        return buffersInfo
    }
    buffersInfo.numElements = arrays.position.length / 3
    return buffersInfo
  }





class ProgrammInfo{
    constructor(gl, vs, fs){
        this.gl = gl
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(this.vertexShader, vs)
        gl.compileShader(this.vertexShader)
        if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(this.vertexShader))
        }

        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(this.fragmentShader, fs)
        gl.compileShader(this.fragmentShader)
        if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(this.fragmentShader))
        }
        

        this.prg = gl.createProgram()
        gl.attachShader(this.prg, this.vertexShader)
        gl.attachShader(this.prg, this.fragmentShader)
        gl.linkProgram(this.prg)
        if (!gl.getProgramParameter(this.prg, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(this.prg))
        }

        
        this.uniformSetters = createUniformSetters(gl, this.prg)
        this.attributeSetters = createAttribSetters(gl, this.prg)
        
    }
    setUniforms(uniforms){
        
        Object.keys(uniforms).forEach(name=>{
            const setter = this.uniformSetters[name]
            if(setter) setter(uniforms[name])
        })
    }
    setAttributes(buffers){
 
        Object.keys(buffers.attribs).forEach(key =>{
            const setter = this.attributeSetters[key]
            if(setter){
              setter(buffers.attribs[key])
            }
        })
        if(buffers.indices){
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
        }
    }
}



/***/ }),

/***/ "./src/render/render.js":
/*!******************************!*\
  !*** ./src/render/render.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const m4 = __webpack_require__(/*! ../m4 */ "./src/m4.js")
function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  const width  = canvas.clientWidth  * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width ||  canvas.height !== height) {
    canvas.width  = width;
    canvas.height = height;
    return true;
  }
  return false;
}

  
 
    function degToRad(d) {
        return d * Math.PI / 180;
    }
    var fieldOfViewRadians = degToRad(90);

const zNear = 0.01;
const zFar = 2000;
var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar)

function drawScene(objectsToDraw,cameraMatrix, globalUniforms, type) {
        
        
        
        
        var viewMatrix = m4.inverse(cameraMatrix)
        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

        let lastUsedProgramInfo = null
        let lastUsedBufferInfo = null
        
        for(let i = 0, n = objectsToDraw.length; i < n; ++i){
          const object = objectsToDraw[i]
          const sprite = object.sprite
          if(lastUsedBufferInfo != sprite.buffersInfo){
            lastUsedBufferInfo = sprite.buffersInfo
          }
          if(lastUsedProgramInfo != sprite.programmInfo){
            lastUsedProgramInfo = sprite.programmInfo
            gl.useProgram(lastUsedProgramInfo.prg)
          }
          
   
          sprite.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix)
          
          sprite.uniforms.u_world =  object.worldMatrix
          sprite.uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(object.worldMatrix))
          lastUsedProgramInfo.setAttributes(lastUsedBufferInfo)
          lastUsedProgramInfo.setUniforms( sprite.uniforms)
          if(globalUniforms)lastUsedProgramInfo.setUniforms(globalUniforms)
          gl.drawElements(gl.TRIANGLES, sprite.buffersInfo.numElements, gl.UNSIGNED_SHORT, 0) 
        } 
      }

const pointvs =
      'uniform mat4 u_matrix;' +
      
      'void main(void) {' +
         'gl_Position = u_matrix * vec4(0.0,0.0,0.0,1.0);' +
         'gl_PointSize = 1.0;'+
      '}';
const defaultFs =
      'precision mediump float;' +
      'uniform vec4 u_color;' +
      'void main(void) {' +
         ' gl_FragColor = u_color;' +
      '}';
      
      const {createBuffersInfo,ProgrammInfo} = __webpack_require__(/*! ./programm */ "./src/render/programm.js")
      
const pointGeometry = {position : new Float32Array(0.0,0.0,0.0)}
const pointBuffersInfo = createBuffersInfo(gl,pointGeometry)
const pointProgrammInfo = new ProgrammInfo(gl, pointvs, defaultFs)




const planePoints = {position : new Float32Array([
  -100.0,  0.0, -100.0,
  -100.0,  0.0,  100.0,
   100.0,  0.0,  100.0,
   100.0,  0.0, -100.0]),
  indices : new Uint16Array([0,  1,  2,      0,  2,  3])}
const planeVs = 
  'uniform mat4 u_matrix;' +
  'attribute vec4 a_position;'+      
  'void main(void) {' +
    'gl_Position = u_matrix * a_position;' +
    'gl_PointSize = 10.0;'+
  '}';

const planeProgrammInfo = new ProgrammInfo(gl, planeVs, defaultFs)
const planeBuffersInfo = createBuffersInfo(gl, planePoints)

function simpleDraw(programInfo, buffersInfo, type, numElements, list, u_color, cameraMatrix){
  
  
      
      gl.useProgram(programInfo.prg)
      programInfo.setAttributes(buffersInfo)
      let viewProjectionMatrix
      if(cameraMatrix)viewProjectionMatrix = m4.multiply(projectionMatrix, m4.inverse(cameraMatrix))
      else viewProjectionMatrix = m4.identity()
      list.forEach(element =>{
        const mat = element
        const u_matrix = m4.multiply(viewProjectionMatrix,mat)
        programInfo.setUniforms({u_matrix, u_color : u_color})
        
        gl.drawElements(type, numElements || buffersInfo.numElements, gl.UNSIGNED_SHORT, 0) 
    })
  }



const lineIndices = new Uint16Array([0,1])
const lineVs = 
  'uniform mat4 u_matrix;' +
  'attribute vec4 a_position;'+      
  'void main(void) {' +
    'gl_Position = u_matrix * a_position;' +
    
  '}';

const lineProgramInfo = new ProgrammInfo(gl, lineVs,defaultFs)


const drawPoints = simpleDraw.bind(null, pointProgrammInfo, pointBuffersInfo, gl.POINT,3 )
const drawPlanes = simpleDraw.bind(null,planeProgrammInfo, planeBuffersInfo, gl.TRIANGLES, 6)
const drawLines = function(lines, color, cameraMatrix){
    lines.forEach(line =>{
      const lineGeometry =  {position : new Float32Array([...line[0], ...line[1]]),
                            }
      
      const lineBuffersInfo = createBuffersInfo(gl,lineGeometry)
      
      simpleDraw(lineProgramInfo, lineBuffersInfo, gl.LINES,2, [m4.identity()], color, cameraMatrix)
    })
}


module.exports = {drawScene, drawPoints, drawPlanes, drawLines, resizeCanvasToDisplaySize}



/***/ }),

/***/ "./src/render/sprites.js":
/*!*******************************!*\
  !*** ./src/render/sprites.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const {createBoxGeometry, linedBoxIndices} = __webpack_require__(/*! ./primitives */ "./src/render/primitives.js")
const {createBuffersInfo,ProgrammInfo} = __webpack_require__(/*! ./programm */ "./src/render/programm.js")
const m4 = __webpack_require__(/*! ../m4 */ "./src/m4.js")
const geometry = createBoxGeometry()
//geometry.indices = linedBoxIndices
const buffersInfo = createBuffersInfo(gl,geometry)
const vs = document.getElementById('vertex-shader-3d').text
const fs = document.getElementById('fragment-shader-3d').text
const programmInfo = new ProgrammInfo(gl, vs, fs)
function Box(size,color = [0.5,0.5,0.5,1]){
    return {
        buffersInfo,
        programmInfo,
        sizeMatrix : m4.scaling( ...size),
        uniforms : {
            u_color : color,
            u_matrix : null,
            u_world : null
        }
    }
}
class BoxSprite{
    constructor(color = [0.5,0.5,0.5,1]){
        this.buffersInfo = buffersInfo
        this.programmInfo = programmInfo
        this.uniforms = {
            u_color : color,
            u_matrix : null,
            u_world : null,
        }
        }
}
const planeVs = 
  'uniform mat4 u_matrix;' +
  'attribute vec4 a_position;'+      
  'void main(void) {' +
    'gl_Position = u_matrix * a_position;' +
    'gl_PointSize = 10.0;'+
  '}';
  const lineVs = 
  'uniform mat4 u_matrix;' +
  'attribute vec4 a_position;'+      
  'void main(void) {' +
    'gl_Position = u_matrix * a_position;' +
    
  '}';
  const pointVs =
  'uniform mat4 u_matrix;' +
  
  'void main(void) {' +
     'gl_Position = u_matrix * vec4(0.0,0.0,0.0,1.0);' +
     'gl_PointSize = 10.0;'+
  '}';
const defaultFs =
  'precision mediump float;' +
  'uniform vec4 u_color;' +
  'void main(void) {' +
     ' gl_FragColor = u_color;' +
  '}';
const pointProgrammInfo = new ProgrammInfo(gl, pointVs, defaultFs)
class PointsSprite {
    constructor(points,color){
        this.programmInfo = pointProgrammInfo
        this.uniforms = {
            u_color : color,
            u_matrix : null,
            u_world : null
        }
        this.buffersInfo = createBuffersInfo({position : new Float32Array(points)})
        this.type = gl.POINT
    }
}
const linesProgramInfo = new ProgrammInfo(gl, lineVs, defaultFs)

class LineSprite {
    constructor(points,color){
        this.programmInfo = linesProgramInfo
        this.uniforms = {
            u_color : color,
            u_matrix : null,
            u_world : null
        }
        
        let indices = []
        for(let i = 0, n = points.length/3; i < n; i++){
            indices.push(i,i+1)
        }
        indices[indices.length - 1] = 0
        indices = new Uint16Array(indices)
        
        this.buffersInfo = createBuffersInfo(gl,{position : new Float32Array(points), indices})
        this.type = gl.LINES
    }
}
module.exports = { LineSprite, PointsSprite, BoxSprite}

/***/ }),

/***/ "./src/server/collider.js":
/*!********************************!*\
  !*** ./src/server/collider.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {



const {Vector} = __webpack_require__(/*! ./vectors */ "./src/server/vectors.js")
const {EventEmitter} = __webpack_require__(/*! ./eventEmitter */ "./src/server/eventEmitter.js")
const m4 = __webpack_require__(/*! ../m4 */ "./src/m4.js")
const m3 = __webpack_require__(/*! ../m3 */ "./src/m3.js")
const xAxis = new Vector(1,0,0)
const yAxis = new Vector(0,1,0)
const zAxis = new Vector(0,0,1)
const xAxisNegative = xAxis.multiply(-1)
const yAxisNegative = yAxis.multiply(-1)
const zAxisNegative = zAxis.multiply(-1)
const dirs = [xAxis,yAxis,zAxis,xAxisNegative,yAxisNegative, zAxisNegative]

class Box extends EventEmitter{
    constructor(a = 1,b = 1,c = 1){
        super()
        this.min = new Vector(-a/2,-b/2,-c/2)
        this.max = new Vector(a/2,b/2,c/2)
        this.Rmatrix = m3.identity()
        this.RmatrixInverse = m3.identity()
        this.RS = m3.identity()
        this.pos = new Vector(0,0,0)
    }
    getAABB(){
        const maxX = this.support(xAxis).x
        const maxY = this.support(yAxis).y
        const maxZ = this.support(zAxis).z

        const minX = this.support(xAxisNegative).x
        const minY = this.support(yAxisNegative).y
        const minZ = this.support(zAxisNegative).z
        return [new Vector(minX, minY, minZ), new Vector(maxX, maxY, maxZ)]
    }
    translate(tx,ty,tz){
        this.pos.x += tx
        this.pos.y += ty
        this.pos.z += tz
    }
    rotate(ax,ay,az){
        this.Rmatrix = m3.xRotate(this.Rmatrix, ax)
        this.Rmatrix = m3.yRotate(this.Rmatrix, ay)
        this.Rmatrix = m3.zRotate(this.Rmatrix, az)

        this.RmatrixInverse = m3.transpose(this.Rmatrix)
    }
    setRmatrix(matrix){
        this.Rmatrix = matrix
        this.RmatrixInverse = m3.transpose(matrix)
    }
    support(dir){
        const _dir = m3.transformPoint(this.RmatrixInverse, dir.toArray())
        
        const res = new Vector(0,0,0)
        
        res[0]= _dir[0] > 0 ? this.max.x : this.min.x
        res[1] = _dir[1] > 0 ? this.max.y : this.min.y
        res[2] = _dir[2] > 0 ? this.max.z : this.min.z
        
        const sup = new Vector(...m4.transformPoint(this.getM4(), res))
        this.emit('sup', sup,dir)
        return sup
  
    }
    getInverseInertiaTensor(mass){
        const i1 = mass/12 * (this.max.y * this.max.y + this.max.z * this.max.z)
        const i2 = mass / 12 *(this.max.x * this.max.x + this.max.z * this.max.z)
        const i3 = mass / 12 *(this.max.x * this.max.x + this.max.y * this.max.y)
        
        const m = new Float32Array([1/i1, 0, 0, 0, 1/i2, 0, 0, 0, 1/i3])
        
        return m3.multiply(this.Rmatrix,(m3.multiply(this.RmatrixInverse,m)))

    }
    getM4(){
        const m = m4.m3Tom4(this.Rmatrix)
        m[12] = this.pos.x
        m[13] = this.pos.y
        m[14] = this.pos.z
        m[15] = 1
        return m
    }
    test(){
        return dirs.map(d =>this.support(d).toArray())
    }
}

 
module.exports = { Box}

/***/ }),

/***/ "./src/server/constraints.js":
/*!***********************************!*\
  !*** ./src/server/constraints.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {Vector, cross, dot,normalize} = __webpack_require__(/*! ./vectors */ "./src/server/vectors.js")
const m3 = __webpack_require__(/*! ../m3 */ "./src/m3.js")
const tol = 0.005
const tol2 = 0.002
const numIterations = 7
function getCollisionResolution(manifold, deltaTime){
    const body1 = manifold.body1
    const body2 = manifold.body2
    
    for(let j = 0; j <  numIterations; j++){
        for(let i = 0, n = manifold.contacts.length; i< n; i++){
            let vel1 = body1.velocity
            let vel2 = body2.velocity
            let omega1 = body1.angularV
            let omega2 = body2.angularV
            const contact = manifold.contacts[i]
            const I1 = body1.getInverseInertiaTensor()
            const I2 = body2.getInverseInertiaTensor()
            const M1 = body1.inverseMass
            const M2 = body2.inverseMass
            const normal = normalize(contact.n)
            let J1 = normal.multiply(-1)
            let J2 = cross(normal, contact.ra)
            let J3 = normal
            let J4 = cross(contact.rb, normal)
            
            
        
        
            const penDepth = contact.n.norm()
            const Vc = dot(vel2.add(cross(omega2, contact.rb)).substract(vel1).substract(cross(omega1, contact.ra)),normal)
            const restitution =  Math.max(Vc - tol2, 0) * 0.1
    
            let b = Math.max(0,penDepth-tol)/deltaTime *0.1 + restitution
            
            const k1 = dot(J1, vel1) + dot(J2, omega1) + dot(J3, vel2) + dot(J4, omega2) - b
        
            const Ma = [M1, 0, 0,
                        0, M1, 0,
                        0, 0, M1 ]
            const Mb = [M2, 0, 0,
                        0, M2, 0,
                        0, 0, M2]
            const JMa = m3.dot(m3.transformPoint(Ma, J1.toArray()),J1.toArray())
            const JIa = m3.dot(m3.transformPoint(I1, J2.toArray()), J2.toArray())
            const JMb = m3.dot(m3.transformPoint(Mb, J3.toArray()), J3.toArray())
            const JIb = m3.dot(m3.transformPoint(I2, J4.toArray()), J4.toArray())
            const k2 = (JMa + JMb + JIa + JIb)
            
            
            let lambda = -k1/k2
            let oldAcc = contact.accI
            contact.accI += lambda
            if(contact.accI < 0) contact.accI = 0
            lambda = contact.accI - oldAcc
            
            
            vel1 = J1.multiply(lambda * M1)
            body1.addVelocity(vel1)
            omega1 = (new Vector(...m3.transformPoint(I1,J2.toArray()))).multiply(lambda)
            body1.addAngularV(omega1)
            vel2 = J3.multiply(lambda * M2)
            body2.addVelocity(vel2)
            omega2 = (new Vector(...m3.transformPoint(I2, J4.toArray()))).multiply(lambda)
            body2.addAngularV(omega2)
        }
    }
    
    
    
    
    
}
const warmStart = (manifold, deltaTime) =>{
    const body1 = manifold.body1
    const body2 = manifold.body2
    
    for(let i = 0, n = manifold.contacts.length; i< n; i++){
        let vel1 = body1.velocity
        let vel2 = body2.velocity
        let omega1 = body1.angularV
        let omega2 = body2.angularV
        const contact = manifold.contacts[i]
        const I1 = body1.getInverseInertiaTensor()
        const I2 = body2.getInverseInertiaTensor()
        const M1 = body1.inverseMass
        const M2 = body2.inverseMass
        const normal = normalize(contact.n)
        let J1 = normal.multiply(-1)
        let J2 = cross(normal, contact.ra)
        let J3 = normal
        let J4 = cross(contact.rb, normal)


        const lambda = manifold.contacts[i].accI * deltaTime
        vel1 = J1.multiply(lambda * M1)
        body1.addVelocity(vel1)
        
        omega1 = (new Vector(...m3.transformPoint(I1,J2.toArray()))).multiply(lambda)
        body1.addAngularV(omega1)
        vel2 = J3.multiply(lambda * M2)
        body2.addVelocity(vel2)
        omega2 = (new Vector(...m3.transformPoint(I2, J4.toArray()))).multiply(lambda)
        body2.addAngularV(omega2)
    }
    
}
module.exports = {getCollisionResolution, warmStart}

/***/ }),

/***/ "./src/server/eventEmitter.js":
/*!************************************!*\
  !*** ./src/server/eventEmitter.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

class EventEmitter{
    constructor(){
        this.events = {}
    }
    on(eventName, fn){
        if(!this.events[eventName]){
            this.events[eventName] = []
        }
        this.events[eventName].push(fn)
        return () =>{
            this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn)
        }
    }
    emit(eventName, data){
        if(this.events[eventName]){
            this.events[eventName].forEach(fn => {
                fn.call(null,data)
               
            })

        }
    }
}
module.exports = {EventEmitter}

/***/ }),

/***/ "./src/server/gjk.js":
/*!***************************!*\
  !*** ./src/server/gjk.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const {Vector, dot, cross, normalize} =  __webpack_require__(/*! ./vectors */ "./src/server/vectors.js")


const GJK_MAX_ITERATIONS_NUM = 64


const update_simplex3 = () =>{
        
    const n = cross(b.substract(a),c.substract(a))
    const AO = a.multiply(-1)
    
    simp_dim = 2
    if(dot(cross(b.substract(a), n), AO) > 0){
        c = a
        search_dir = cross(cross(b.substract(a), AO),b.substract(a))
        return
    }
    if(dot(cross(n, c.substract(a)),AO) > 0){ 
        b = a
        search_dir = cross(cross(c.substract(a), AO),c.substract(a))
        return
    }
    simp_dim = 3
    if(dot(n, AO) > 0){
        d = c
        c = b
        b = a
        search_dir = n
        return
    }
    d = b
    b = a
    search_dir = n.multiply(-1)
    return
}
const update_simplex4 = () =>{
        
    const ABC = cross(b.substract(a),(c.substract(a)))
    const ACD = cross(c.substract(a),(d.substract(a)))
    const ADB = cross(d.substract(a),(b.substract(a)))
    const AO = a.multiply(-1)
    simp_dim = 3

    if(dot(ABC,AO) > 0){
        d = c
        c = b
        b = a
        search_dir = ABC
        return false
    }

    if(dot(ACD,AO) > 0){
        b = a
        search_dir = ACD
        return false
    }

    if(dot(ADB,(AO)) > 0){
        c = d
        d = b
        b = a
        search_dir = ADB
        return false
    }
    return true
}
function gjk(body1,body2){
    const coll1 = body1.collider
    const coll2 = body2.collider
    this.a, this.b, this.c, this.d, this.search_dir = new Vector(0,0,0), this.simp_dim = 2
    this.originsMap = new Map()
    

    
    
    let mtv = new Vector(0,0,0)
   
    search_dir = coll1.pos.substract(coll2.pos)
    const c_origin1 = coll1.support(search_dir.multiply(-1))
    const c_origin2 = coll2.support(search_dir)
    c = c_origin2.substract(c_origin1)
    c.oa = c_origin1
    c.ob = c_origin2
    this.originsMap.set(c,[c_origin1, c_origin2])
    
    search_dir = c.multiply(-1)
    
    const b_origin1 = coll1.support(search_dir.multiply(-1))
    const b_origin2 = coll2.support(search_dir)
    b = b_origin2.substract(b_origin1)
    b.oa = b_origin1
    b.ob = b_origin2
    this.originsMap.set(b, [b_origin1, b_origin2])
    
    if(dot(b,search_dir) < 0){
        
        return false
    }
    
    search_dir = cross(cross(c.substract(b),b.multiply(-1)),c.substract(b))
    
    if(search_dir.isNull()){
        
        search_dir = cross(c.substract(b),(new Vector(1,0,0)))
        
        if(search_dir.isNull()){
            
            search_dir = cross(c.substract(b),(new Vector(0,0,-1)))
            
        }
    }
    
    simp_dim = 2
    for(let i = 0; i < GJK_MAX_ITERATIONS_NUM; ++i){
        
        const a_origin1 = coll1.support(search_dir.multiply(-1))
        const a_origin2 = coll2.support(search_dir)
        a = a_origin2.substract(a_origin1)
        a.oa = a_origin1
        a.ob = a_origin2
        this.originsMap.set(a, [a_origin1, a_origin2])
        if(dot(a,search_dir) < 0 ) return false
        
        simp_dim ++
        if(simp_dim === 3){
            update_simplex3()
        }
        else if(update_simplex4()){
            
            return EPA(a,b,c,d,body1,body2)

        }
    }
}

const baricentric = (face, point) =>{
    let a11 = face[0].x
    let a12 = face[1].x
    let a13 = face[2].x
    let b1 = point.x
    let a21 = face[0].y
    let a22 = face[1].y
    let a23 = face[2].y
    let b2 = point.y
    let a31 = face[0].z
    let a32 = face[1].z
    let a33 = face[2].z
    let b3 = point.z

    const d = a11 * a22 * a33 
    + a21 * a32 * a13
    + a12 * a23 * a31
    - a13 * a22 * a31
    - a21 * a12 * a33
    - a32 * a23 * a11

    const d1 = b1 * a22 * a33 +
    b2 * a32 * a13
    + a12 * a23 * b3
    - a13 * a22 * b3
    - b2 * a12 * a33
    - a32 * a23 * b1

    const d2 = a11 * b2 * a33
    + a21 * b3 * a13
    + b1 * a23 * a31
    - a13 * b2 * a31
    - a11 * b3 * a23
    - a21 * b1 * a33

    const d3 = a11 * a22 * b3
    + a21 * a32 * b1
    + a12 * b2 * a31
    - b1 * a22 * a31
    - a21 * a12 * b3
    - b2 * a32 * a11

   return [d1/d , d2/d, d3/d ]
}
const originToFaceProj = ( face) =>{
        
        
        
       

    const normal = face[3]
    const point = face[0]
    const c = -normal.x * point.x - normal.y * point.y - normal.z * point.z

    const t = - c / (normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)




    return new Vector(t * normal.x, t * normal.y, t * normal.z)
}

const formContact = ()=>{
    
}

const TOLERANCE = 0.001
const MAX_NUM_FACES = 64
const MAX_NUM_LOOSE_EDGES = 32
const EPA_MAX_NUM_ITER = 64
const EPA = (a, b, c, d, body1, body2) =>{
    const coll1 = body1.collider
    const coll2 = body2.collider
    const faces = []
    for(let i = 0; i< 4; i++){
        faces[i] = []
    }

    faces[0][0] = a
    faces[0][1] = b
    faces[0][2] = c
    faces[0][3] = normalize(cross(b.substract(a),c.substract(a)))
    faces[1][0] = a
    faces[1][1] = c
    faces[1][2] = d
    faces[1][3] = normalize(cross(c.substract(a),d.substract(a)))
    faces[2][0] = a
    faces[2][1] = d
    faces[2][2] = b
    faces[2][3] = normalize(cross(d.substract(a),b.substract(a)))
    faces[3][0] = b
    faces[3][1] = d
    faces[3][2] = c
    faces[3][3] = normalize(cross(d.substract(b),c.substract(b)))
    
    let num_faces = 4
    let closest_face = null
    let search_dir
   

    let p
    for(let iteration = 0; iteration < EPA_MAX_NUM_ITER; ++iteration){
        let min_dist = dot(faces[0][0], faces[0][3])
        
       closest_face = 0
        for(let i = 0; i < num_faces; ++i){
            let dist = dot(faces[i][0],faces[i][3])
            if(dist < min_dist){
                min_dist = dist
                closest_face = i
            }
        }
        search_dir = faces[closest_face][3]
        p = coll2.support(search_dir).substract(coll1.support(search_dir.multiply(-1)))
        const p_origin1 = coll1.support(search_dir.multiply(-1))
        const p_origin2 = coll2.support(search_dir)
        p.oa = p_origin1
        p.ob = p_origin2
        originsMap.set(p, [ p_origin1, p_origin2])
        if(dot(p,search_dir) - min_dist < 0.00001){
            const face = faces[closest_face]

            const point = originToFaceProj(face)
            
            
            const [Aa, Ba] = originsMap.get(face[0])
            //const Aa = face[0].oa
            //const Ba = face[0].ob
            const [Ab, Bb] = originsMap.get(face[1])
            //const Ab = face[1].oa
            //const Bb = face[1].ob
            const [Ac, Bc] = originsMap.get(face[2])
            //const Ac = face[2].oa
            //const Bc = face[2].ob
           
            const result = baricentric(face,point)
            
            
            let PA = Aa.multiply(result[0]).add(Ab.multiply(result[1])).add(Ac.multiply(result[2]))
            let PB = Ba.multiply(result[0]).add(Bb.multiply(result[1])).add(Bc.multiply(result[2]))
            
            //const ra = PA.substract(coll1.pos)
    
            const rb = PB.substract(coll2.pos)
            const ra = PA.substract(coll1.pos)
            const n = face[3].multiply(-dot(p,search_dir))
            if(n.isNull()) return false
            return {PA, PB, n, ra, rb, accI : 0}
        }

        const loose_edges = []
        let num_loose_edges = 0
        for(let i = 0; i < num_faces;++i){
           
            if(dot(faces[i][3],p.substract(faces[i][0])) > 0){
                
                for(let j = 0; j < 3; j++){
                    let current_edge = [faces[i][j], faces[i][(j + 1) % 3]]
                    let found_edge = false
                    for(let k = 0; k < num_loose_edges; k++){
                        if(loose_edges[k][1] === current_edge[0] && loose_edges[k][0] === current_edge[1]){
                            
                            loose_edges[k][0] = loose_edges[num_loose_edges - 1][0]
                            loose_edges[k][1] = loose_edges[num_loose_edges-1][1]
                            num_loose_edges --
                            found_edge = true
                            k = num_loose_edges
                        }
                    }
                    if(!found_edge){
                        if(num_loose_edges >= MAX_NUM_LOOSE_EDGES) break;
                       
                        loose_edges[num_loose_edges] = []
                        loose_edges[num_loose_edges][0] = current_edge[0]
                        loose_edges[num_loose_edges][1] = current_edge[1]
                        num_loose_edges++
                    }
                }
                faces[i][0] = faces[num_faces - 1][0]
                faces[i][1] = faces[num_faces - 1][1]
                faces[i][2] = faces[num_faces - 1][2]
                faces[i][3] = faces[num_faces - 1][3]
                num_faces--
                i--
            }
        }
        for(let i = 0; i < num_loose_edges; i++){
            if(num_faces >= MAX_NUM_FACES) break;
            faces[num_faces]=[]
            faces[num_faces][0] = loose_edges[i][0]
            faces[num_faces][1] = loose_edges[i][1]
            faces[num_faces][2] = p
            
            faces[num_faces][3] = normalize( cross( loose_edges[i][0].substract(loose_edges[i][1]), loose_edges[i][0].substract(p)))
            if(dot(faces[num_faces][0], faces[num_faces][3]) + 0.01 < 0){
                temp = faces[num_faces][0]
                faces[num_faces][0] = faces[num_faces][1]
                faces[num_faces][1] = temp
                faces[num_faces][3] = faces[num_faces][3].multiply(-1)
                
            }
            num_faces++
        }
        
    }

    const face = faces[closest_face]

            const point = originToFaceProj(face)
            
            
            const [Aa, Ba] = originsMap.get(face[0])
            //const Aa = face[0].oa
            //const Ba = face[0].ob
            const [Ab, Bb] = originsMap.get(face[1])
            //const Ab = face[1].oa
            //const Bb = face[1].ob
            const [Ac, Bc] = originsMap.get(face[2])
            //const Ac = face[2].oa
            //const Bc = face[2].ob
           
            const result = baricentric(face,point)
            
            
            let PA = Aa.multiply(result[0]).add(Ab.multiply(result[1])).add(Ac.multiply(result[2]))
            let PB = Ba.multiply(result[0]).add(Bb.multiply(result[1])).add(Bc.multiply(result[2]))
            
            //const ra = PA.substract(coll1.pos)
            console.log(face)
            const rb = PB.substract(coll2.pos)
            const ra = PA.substract(coll1.pos)
            const n = face[3].multiply(-dot(p,search_dir))
            
            return false

}
module.exports = {gjk}

/***/ }),

/***/ "./src/server/physics.js":
/*!*******************************!*\
  !*** ./src/server/physics.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const {EventEmitter}  = __webpack_require__(/*! ./eventEmitter */ "./src/server/eventEmitter.js")
const {Vector} = __webpack_require__(/*! ./vectors */ "./src/server/vectors.js")
const prec = 0.01
class Physics extends EventEmitter{
    constructor(collider){
        super()
        this.static = false
        this.collider = collider
        this.mass = 1
        this.inverseMass = 1/this.mass
        this.velocity = new Vector(0, 0, 0)
        this.acceleration = new Vector(0,0,0)
        this.angularV = new Vector(0, 0, 0)
        this.id = 1
        this.acceleration = new Vector(0,0,0)
        this.BVlink
    }
    update(dt){
        let deltaSpeed = this.acceleration.multiply(dt)
        this.velocity = this.velocity.add( deltaSpeed)
        
        const translation = this.velocity.multiply(dt)
        this.translate(translation.x, translation.y, translation.z)
        const deltaRotation = this.angularV.multiply(dt)
        this.rotate(deltaRotation.x, deltaRotation.y, deltaRotation.z)
        
        this.emit('update')
        return this
    }
    getInverseInertiaTensor(){
        return this.collider.getInverseInertiaTensor(this.mass)
    }
    setMass(mass){
        this.mass = mass
        this.inverseMass = 1 / this.mass
        
    }
    translate(tx,ty,tz){
        
        this.collider.translate(tx,ty,tz)

        this.emit('translation')
        return this
    }
    rotate(ax,ay,az){
        
        this.collider.rotate(ax,ay,az)

        this.emit('rotation')
        return this
        
    }
    
    addVelocity(v){
        if(this.static)return
        this.velocity = this.velocity.add(v)
    }
    addAngularV(v){
        if(this.static)return
        this.angularV = this.angularV.add(v)
    }
    addAcceleration(v){
        this.acceleration = this.acceleration.add(v)
    }
    getExpandedAABB(){
        const aabb = this.collider.getAABB()
        const velocity = this.velocity
        aabb[0].x -= prec
        aabb[1].x += prec
        aabb[0].y -= prec
        aabb[0].z -= prec
        aabb[1].y += prec
        aabb[1].z += prec
        if(velocity.x > 10) aabb[1].x += velocity.x
        if(velocity.y > 10) aabb[1].y += velocity.y
        if(velocity.z > 10) aabb[1].z += velocity.z
        if(velocity.x < -10) aabb[0].x -= velocity.x
        if(velocity.y < -10) aabb[0].y -= velocity.y
        if(velocity.z < -10) aabb[0].z -= velocity.z
        return aabb
    }
    getAABB(){
        return this.collider.getAABB()
    }
    
}


module.exports = {Physics}

/***/ }),

/***/ "./src/server/simulation.js":
/*!**********************************!*\
  !*** ./src/server/simulation.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const {Tree} = __webpack_require__(/*! ./tree */ "./src/server/tree.js")

const {getCollisionResolution, warmStart} = __webpack_require__(/*! ./constraints */ "./src/server/constraints.js")
const {gjk} = __webpack_require__(/*! ./gjk */ "./src/server/gjk.js")
const { distanceFromLine, findLargestFace} = __webpack_require__(/*! ./vectors */ "./src/server/vectors.js")

const prec = 0.01
const pairHash = (x,y) => x === Math.max(x, y) ? x * x + x + y : y * y + x





class Simulation {
    constructor(){
        this.objects = []
        this.bvh = new Tree()
        this.collisions = []
        this.collisionManifolds = new Map()
        this.lastId = 0
    }
    addObject(object){   
            
            const aabb = object.getExpandedAABB()
           
            
            const leaf = this.bvh.insertLeaf(aabb,object)
            object.BVlink = leaf
            object.id = this.lastId
            this.lastId++
            object.on('translation',()=>this.updateObjectAABB.call(this,object))
            object.on('rotate',()=>this.updateObjectAABB.call(this,object))
            this.objects.push(object)

    }
    
    
    updateObjectAABB(object){
        
        const oldAABB = object.BVlink.aabb
      
        const newAABB = object.getAABB()
        
        if(newAABB[0].x < oldAABB[0].x || newAABB[1].x > oldAABB[1].x ||
             newAABB[0].y < oldAABB[0].y || newAABB[1].y> oldAABB[1].y ||
             newAABB[0].z < oldAABB[0].z || newAABB[1].z > oldAABB[1].z)
        {
           this.bvh.removeLeaf(object.BVlink)
           const leaf = this.bvh.insertLeaf(newAABB,object)
           object.BVlink = leaf
        }
    }
    removeObject(object){
        this.bvh.removeLeaf(object.BVlink)
        this.objects = this.objects.filter(el => el === object)
    }
    updateCollisions(){
        const manifolds = this.collisionManifolds.values()
        for(let manifold of manifolds){
            
            let i, j , n
            const contacts = manifold.contacts
            const pos1 = manifold.body1.collider.pos
            const pos2 = manifold.body2.collider.pos
            for(i = 0, j = 0, n = contacts.length; i < n; i++){
                const contact = contacts[i]
                const newPA = pos1.add(contact.ra)
                const newPB = pos2.add(contact.rb)
                const raBias = contact.PA.substract(newPA)
                const rbBias = contact.PB.substract(newPB)
                if(raBias.norm() < prec + manifold.warm * 0.001  && rbBias.norm() <  prec +manifold.warm * 0.001){
                    contacts[j] = contacts[i]
                   j++
                }
                
            }
            
            while(j < contacts.length){
                contacts.pop()
            }
            
            if(contacts.length < 4&& manifold.warm  > 1) manifold.warm--
            if(contacts.length === 4 && manifold.warm < 5)manifold.warm ++
            if(contacts.length > 4){
                let deepest = null
                let maxDeep = 0
                for(i = 0, n = contacts.length; i < n; i++){
                    if(contacts[i].n.normSq() >= maxDeep){
                        maxDeep = contacts[i].n.normSq()
                        deepest = contacts[i]
                    }
                }
                let furthest = null
                let maxDistance = 0
                for(i = 0, n = contacts.length; i < n; i++){
                    let dist = contacts[i].PA.substract(deepest.PA).normSq()
                    if(dist >= maxDistance){
                        maxDistance = dist
                        furthest = contacts[i]
                    }
                }
                let furthest2 = null
                maxDistance = 0
                for(i = 0, n = contacts.length; i < n; i++){
                    let dist = distanceFromLine(furthest.PA, deepest.PA, contacts[i].PA)
                    
                    if(dist >= maxDistance){
                        maxDistance = dist
                        furthest2 = contacts[i]
                    }
                }
                
                let furthest3 = null
                maxDistance = 0
               
                const oppositeTodiagonal = findLargestFace(deepest.PA,furthest.PA,furthest2.PA)
                
                for(i = 0, n = contacts.length; i < n; i++){
                    let dist = oppositeTodiagonal.substract(contacts[i].PA).normSq()
                    
                    if(dist >= maxDistance){
                        maxDistance = dist
                        furthest3 = contacts[i]
                    }
                }
               

                contacts[0] = deepest
                contacts[1] = furthest
                contacts[2] = furthest2
                contacts[3] = furthest3
                while(contacts.length > 4) contacts.pop()
                
            }
            

        }
        for(let i = 0, n = this.objects.length; i < n; i++){
            const object = this.objects[i]
            if(object.static) continue
            const cols = this.bvh.getCollisions(object.BVlink)
            object.BVlink.isChecked = true
            
            for(let j = 0, n = cols.length; j < n; j++){
                const hash = pairHash(object.id, cols[j].id)
                let manifold = this.collisionManifolds.get(hash)
                if(manifold && manifold.contacts.length > 4) continue
                const contact = gjk(object, cols[j])
                if(!contact) continue
                
                
                if(!manifold){
                    manifold = { contacts : [], body1 : object, body2 : cols[j], warm : 0}
                    this.collisionManifolds.set(hash,manifold)
                }
                let isFarEnough = true
                const contacts = manifold.contacts
                for(let i = 0, n = contacts.length; i < n; i++){
                    const biasPA = contacts[i].PA.substract(contact.PA)
                    const biasPB = contacts[i].PB.substract(contact.PB)
                    if(biasPA.norm() < prec || biasPB.norm() < prec) isFarEnough = false 
                }
                if(isFarEnough) contacts.push(contact)   
            }
        }
        
        this.bvh.setUnchecked()
        
    }
    tick(deltaTime){
        
        for(let i = 0, n = this.objects.length;i < n; i++){
            this.objects[i].update(deltaTime)
        }   
        this.updateCollisions()
        
        this.cols = []
        let manifolds = this.collisionManifolds.values()
        
        
        
       
            for(let manifold of manifolds){
                const contacts = manifold.contacts
                
                /*if(contacts.length > 0){
                    const deepest = contacts[0]
                    manifold.body1.translate(...deepest.n.multiply(-1/manifold.body1.mass).toArray())
                    manifold.body2.translate(...deepest.n.multiply(1/manifold.body2.mass).toArray())
                }   */


                if(manifold.warm > 1){
                    warmStart(manifold, deltaTime)
                   
                }   
                getCollisionResolution(manifold, deltaTime) 
                
                
                
            
        }
        
    }
}

module.exports = {Simulation}

/***/ }),

/***/ "./src/server/tree.js":
/*!****************************!*\
  !*** ./src/server/tree.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {



const {Vector} = __webpack_require__(/*! ./vectors */ "./src/server/vectors.js")
const getBoundAabb = (aabb1, aabb2)=>{
    if(!aabb1 || !aabb2){
        return 0
    }
    const x1 = aabb1[0].x < aabb2[0].x ? aabb1[0].x : aabb2[0].x
    const x2 = aabb1[1].x > aabb2[1].x ? aabb1[1].x : aabb2[1].x
    const y1 = aabb1[0].y < aabb2[0].y ? aabb1[0].y : aabb2[0].y
    const y2 = aabb1[1].y > aabb2[1].y ? aabb1[1].y : aabb2[1].y
    const z1 = aabb1[0].z < aabb2[0].z ? aabb1[0].z : aabb2[0].z
    const z2 = aabb1[1].z > aabb2[1].z ? aabb1[1].z : aabb2[1].z
    return [new Vector(x1 , y1,z1), new Vector(x2, y2, z2)]
}
const isCollide = (aabb1,aabb2) => {
      
    if(aabb1[0].x <= aabb2[1].x && aabb1[1].x >= aabb2[0].x && aabb1[0].y <= aabb2[1].y && aabb1[1].y >= aabb2[0].y && aabb1[0].z <= aabb2[1].z && aabb1[1].z >= aabb2[0].z){
        return true
    }
    return false
}
const getSize = (aabb) => {
    const area = Math.abs(aabb[1].x - aabb[0].x) + Math.abs(aabb[1].y - aabb[0].y) + Math.abs(aabb[1].z - aabb[0].z)
    return area > 0 ? area : - area
}
class Node{
    constructor(aabb,isLeaf,gameObject){
        this.aabb = aabb
        this.isLeaf = isLeaf
        this.parent = null
        
        this.gameObject = gameObject
        this.isChecked = false
    }
}
class Tree{
    constructor(){
        
        this.root = null
        this.leafs = {}
        this.unusedIndexes = []
        
    }
    setUnchecked(){
        const stack = [this.root]
        
        while(stack.length != 0){
            const node = stack.pop()
            if(node.isLeaf) {
                node.isChecked = false
                continue
            }
            if(node.child1) stack.push(node.child1)
            if(node.child2) stack.push(node.child2)

        }
    }
    getBestSibling(leaf){
        let potential = this.root
        while(!potential.isLeaf){
            const size = getSize(potential.aabb)
            const combinedAABB = getBoundAabb(potential.aabb, leaf.aabb)
            const combinedSize = getSize(combinedAABB)
            let cost = combinedSize
            let inherCost = combinedSize - size

            let cost1
            if( potential.child1.isLeaf){
                cost1 = getSize(potential.child1.aabb) + inherCost
            }
            else{
                cost1 = getSize(getBoundAabb(leaf.aabb, potential.child1.aabb)) - getSize(potential.child1.aabb) + inherCost
            }

            let cost2
            if(potential.child2.isLeaf){
                cost2 = getSize(potential.child2.aabb) + inherCost
            }
            else{
                cost2 = getSize(getBoundAabb(leaf.aabb, potential.child2.aabb)) - getSize(potential.child2.aabb) + inherCost
            }
            if(cost < cost1 && cost <  cost2) return potential
            if(cost1 < cost2){
                potential = potential.child1
            }
            else potential = potential.child2
        }
        return potential
    }
    insertLeaf(aabb,gameObject){
        
        const leaf = new Node(aabb,true,gameObject)
        if(this.root === null){
            this.root = leaf
            this.root.parent = null
            return leaf
        }
        
        const sibling = this.getBestSibling(leaf)
        const oldParent = sibling.parent
        const newParent = new Node(leaf.aabb,false)
        newParent.parent = oldParent
        
        newParent.aabb = getBoundAabb(leaf.aabb, sibling.aabb)
        
        if(oldParent){
            if(oldParent.child1 === sibling) oldParent.child1 = newParent
            else oldParent.child2 = newParent

            newParent.child1 = sibling
            newParent.child2 = leaf

            sibling.parent = newParent
            leaf.parent = newParent
        }
        else{
            newParent.child1 = sibling
            newParent.child2 = leaf

            sibling.parent = newParent
            leaf.parent = newParent
            this.root = newParent
        }
        let index = leaf.parent
        
        while(index){
            index = this.rebalance(index)
            index = index.parent
        }
        return leaf
    }
    getCollisions(leaf){
        
        const cols = []
        const iter = _node =>{
            if(!_node){
                return
            }
            if(_node === leaf){
                return
            }
            if(isCollide(leaf.aabb,_node.aabb)){  
                if(_node.isLeaf && !_node.isChecked){
                    cols.push(_node.gameObject)
                }
                iter(_node.child1)
                iter(_node.child2)
            }
        }
        
            iter(this.root)
        
        return cols
    }
    removeLeaf(leaf){
        
        if(leaf === this.root){
            this.root = null
            return
        }
        const parent = leaf.parent
        const grandParent = parent ? parent.parent : null 
        let sibling
        if(parent.child1 === leaf) sibling = parent.child2
        else sibling = parent.child1

        if(grandParent){
            if(grandParent.child1 === parent) grandParent.child1 = sibling
            else grandParent.child2 = sibling

            sibling.parent = grandParent

            let index = grandParent
            while(index){
                index = this.rebalance(index)

                index = index.parent
            }
        }
        else {
            this.root = sibling
            sibling.parent = null
        }
    }
    rebalance(leaf){
        if(!leaf){
            return null
        }
        if(leaf.isLeaf || this.getHeight(leaf) < 2){
            leaf.aabb = getBoundAabb(leaf.child1.aabb, leaf.child2.aabb)
            return leaf
        }
        const child1 = leaf.child1
        const child2 = leaf.child2
        const balance = this.getHeight(child2) - this.getHeight(child1)
        
        if(balance > 1){
            const child2Child1 = child2.child1
            const child2Child2 = child2.child2

            child2.child1 = leaf
            child2.parent = leaf.parent
            leaf.parent = child2
            if(child2.parent != null){
                if(child2.parent.child1 === leaf){
                    child2.parent.child1 = child2
                }
                else{
                    child2.parent.child2 = child2
                }
            }
            else this.root = child2
            if(this.getHeight(child2Child1) > this.getHeight(child2Child2)){
                child2.child2 = child2Child1
                leaf.child2 = child2Child2
                child2Child2.parent = leaf
                
            }
            else{
                
                leaf.child2 = child2Child1
                child2Child1.parent = leaf
            }
            leaf.aabb = getBoundAabb(leaf.child1.aabb, leaf.child2.aabb)
            child2.aabb = getBoundAabb(child2.child1.aabb, child2.child2.aabb)
           
            return child2
            
        }
        if(balance < -1){
            const child1Child1 = child1.child1
            const child1Child2 = child1.child2
            
            child1.child1 = leaf
            child1.parent = leaf.parent
            leaf.parent = child1

            if(child1.parent != null){
                if(child1.parent.child1 === leaf){
                    child1.parent.child1 = child1
                }
                else{
                    child1.parent.child2 = child1
                }
            }
            else this.root = child1
            if(this.getHeight(child1Child1) > this.getHeight(child1Child2)){
                child1.child2 = child1Child1
                leaf.child1 = child1Child2
                child1Child2.parent = leaf
                
            }
            else{
                child1.child2 = child1Child2
                leaf.child1 = child1Child1
                child1Child1.parent = leaf
            }
            leaf.aabb = getBoundAabb(leaf.child1.aabb, leaf.child2.aabb)
            child1.aabb = getBoundAabb(child1.child1.aabb, child1.child2.aabb)
            
            return child1
        }
       leaf.aabb = getBoundAabb(leaf.child1.aabb, leaf.child2.aabb)
       return leaf
    }
    toArray(i){
        const iter = (leaf, level)  =>{
            if(!leaf){
                return null
                
            }
            if(leaf.isLeaf) return leaf.objectLink.name
            else return [iter(leaf.child1), iter(leaf.child2)]
        }
        if(!i) i = this.root
        return iter(i)
    }
    getHeight(leaf){
        
        const iter = (leaf, level)  =>{
            if(!leaf){
                return level
                
            }
            
            let h1 = iter(leaf.child1, level + 1)
            let h2 = iter(leaf.child2, level + 1)
            return h1 > h2 ? h1 : h2
        }
        return iter(leaf,1)
    }
    
}
module.exports = {Tree, Node}

/***/ }),

/***/ "./src/server/vectors.js":
/*!*******************************!*\
  !*** ./src/server/vectors.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {



function Vector(x = 0, y = 0, z = 0){

    
    this.x = x
    this.y = y
    this.z = z
}

Vector.prototype.toArray = function(){
    return [this.x,this.y,this.z]
}
const dot = (v1,v2) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z

const cross = (v1,v2) => new Vector(
                        v1.y * v2.z - v2.y * v1.z,
                        v1.z * v2.x - v2.z * v1.x,
                        v1.x * v2.y - v2.x * v1.y )
Vector.prototype.add = function(v){
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z)
}
Vector.prototype.multiply = function(a){
    return new Vector(this.x * a, this.y * a, this.z * a)

}

Vector.prototype.substract = function(v){
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z)
}
Vector.prototype.isNull = function(){
    return this.x * this.x + this.y * this.y + this.z * this.z === 0
}
const normalize = v =>{
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
    return new Vector(v.x / len, v.y / len, v.z / len)
}
Vector.prototype.norm = function(){
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
}
Vector.prototype.normSq = function(){
    return this.x * this.x + this.y * this.y + this.z * this.z
}
const distanceFromLine = (a,b,c) =>{
    const ac = c.substract(a)
    const ab = b.substract(a)
    const k = dot(ab,ac) / ab.normSq()
    const h = a.add(ab.multiply(k))
    return c.substract(h).normSq()
}
const distanceFromTriangle = (a,b,c,d) =>{
    const h1 = distanceFromLine(a,b,d)
    const h2 = distanceFromLine(a,c,d)
    const h3 = distanceFromLine(b,c,d)
    if(h1 < h2){
        if(h1 < h3) return h1
        return h3
    }
    else{
        if(h2 < h3) return h2
        else return h3
    }
}

const findLargestFace = (a,b,c) => {
    const AB = a.substract(b).normSq()
    const AC = a.substract(c).normSq()
    const BC = c.substract(b).normSq()
    if(AB < AC){
        if(AB < BC) return c
        return b
    }
    else{
        if(AC < BC) return b
        else return a
    }
}
module.exports = {Vector, cross, dot, normalize, distanceFromLine, distanceFromTriangle, findLargestFace}

/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map