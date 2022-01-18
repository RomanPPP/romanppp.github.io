
const {LinedBoxGeometry, createBoxGeometry} = require('./primitives')
const {createBuffersInfo,ProgrammInfo} = require('./programm')
const m4 = require('../m4')
const geometry = LinedBoxGeometry()

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
        this.type = gl.LINES
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