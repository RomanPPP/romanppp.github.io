
const m4 = require('../m4')
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
          gl.drawElements(sprite.type, sprite.buffersInfo.numElements, gl.UNSIGNED_SHORT, 0) 
        } 
      }

const pointvs =
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
      
      const {createBuffersInfo,ProgrammInfo} = require('./programm')
      
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
const aabbBI = (min, max) =>{
  const geometry = { position : new Float32Array([
    min[0], min[1], min[2],
    min[0], min[1], max[2],
    min[0], max[1], max[2],
    min[0], max[1], min[2],

    max[0], max[1], max[2],
    max[0], max[1], min[2],
    max[0], min[0], min[2],
    max[0], min[0], max[2]
  ]),
  indices : new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, // front
    0, 5, 5, 4, 4, 1, 1, 0, //bottom
    0, 4, 4, 7, 7, 3, 3, 0, //left
    1, 2, 2, 6, 6, 5, 5, 1, //right
    4, 5, 5, 6, 6, 7, 7, 4, // back
    2, 7, 7, 3, 3, 6, 6, 2 // top 
  ])
  }
  return createBuffersInfo(gl, geometry)
}
const drawAAbbs = (aabbs, u_color, cameraMatrix) =>{
  gl.useProgram(lineProgramInfo.prg)
  
  let viewProjectionMatrix
  if(cameraMatrix)viewProjectionMatrix = m4.multiply(projectionMatrix, m4.inverse(cameraMatrix))
  else viewProjectionMatrix = m4.identity()
  aabbs.forEach(aabb =>{
    const buffersInfo = aabbBI(aabb.min, aabb.max)
    lineProgramInfo.setAttributes(buffersInfo)
    const u_matrix = m4.multiply(viewProjectionMatrix,m4.identity())
    lineProgramInfo.setUniforms({u_matrix, u_color })
    
    gl.drawElements(gl.LINES, buffersInfo.numElements, gl.UNSIGNED_SHORT, 0) 
})
}
module.exports = {drawScene, drawPoints, drawPlanes, drawLines, resizeCanvasToDisplaySize, drawAAbbs}

