
const {createBoxGeometry} = require('./primitives')
const {createBuffersInfo,ProgrammInfo} = require('./programm')
const m4 = require('../m4')
const geometry = createBoxGeometry()
const buffersInfo = createBuffersInfo(gl,geometry)
const vs = document.getElementById('vertex-shader-3d').text
const fs = document.getElementById('fragment-shader-3d').text
const programmInfo = new ProgrammInfo(gl, vs, fs)
function Box(size,color = [0.5,0.5,0.5,1]){
    return{
        buffersInfo,
        programmInfo,
        sizeMatrix : m4.scale(m4.identity(), ...size),
        uniforms : {
            u_color : color,
            u_matrix : null,
            u_world : null
        }
    }
}

module.exports = { Box }