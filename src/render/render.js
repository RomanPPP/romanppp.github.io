
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

function computeMatrix(viewProjectionMatrix, translation,rotation,scale) {
  let matrix = m4.translate(viewProjectionMatrix,
      ...translation);
  matrix = m4.xRotate(matrix,rotation[0]);
  matrix = m4.yRotate(matrix,rotation[1]);
  matrix = m4.zRotate(matrix, rotation[2]);
  if(scale){
    matrix = m4.scale(matrix,...scale)
  }
  
  return matrix
}
    var worldMatrix = m4.yRotation(Math.PI);
    let ambientLight = m4.normalize([1, 0.6, 0.6])
    function degToRad(d) {
        return d * Math.PI / 180;
    }
    var fieldOfViewRadians = degToRad(90);
function drawScene(objectsToDraw,cameraMatrix, globalUniforms) {
        resizeCanvasToDisplaySize(canvas, 1)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE)
        gl.enable(gl.DEPTH_TEST)
        
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;
        var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar)
        
        var viewMatrix = m4.inverse(cameraMatrix)
        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix)

        let lastUsedProgramInfo = null
        let lastUsedBufferInfo = null
        
        for(let i = 0, n = objectsToDraw.length; i < n; ++i){
          const node = objectsToDraw[i]
          const sprite = node.sprite
          if(lastUsedBufferInfo != sprite.buffersInfo){
            lastUsedBufferInfo = sprite.buffersInfo
          }
          if(lastUsedProgramInfo != sprite.programmInfo){
            lastUsedProgramInfo = sprite.programmInfo
            gl.useProgram(lastUsedProgramInfo.prg)
          }
          
   
          sprite.uniforms.u_matrix = m4.multiply(viewProjectionMatrix,node.worldMatrix)
          
          sprite.uniforms.u_world =  node.source.getRMatrix()
          lastUsedProgramInfo.setAttributes(lastUsedBufferInfo)
          lastUsedProgramInfo.setUniforms( sprite.uniforms)
          lastUsedProgramInfo.setUniforms(globalUniforms)
          gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0) 
        } 
      }
module.exports = {drawScene}

