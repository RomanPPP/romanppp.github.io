const {drawScene} = require('./render/render')
const m4 = require('./m4')


const {makeRenderNode} = require('./render/model')
const {man} = require('./render/basemodel')

const model = makeRenderNode(man)
let angle = 0
model.updatePartsList()
model.source.rotation[1] = Math.PI/2
console.log(model.parts)
const cPos = [0,0,10]
const cRot = [0,0,0]
const controls = {
    ArrowDown : ()=> cRot[0] -= 0.1 ,
    ArrowUp : () => cRot[0] +=0.1 ,
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
        
    },
    l : () =>{
        angle +=0.11
        model.parts.forEach(part => {
            
            if(part.name === 'bone2') part.source.rotation[0] = Math.sin(angle)
        })
        
    }
}
document.onkeydown = e =>{
    if(!controls[e.key]) return
    controls[e.key]()
}
let objectsToDraw = []

  console.log(model)
const uniforms = { u_reverseLightDirection : m4.normalize([0.5, 0.7, 1])}
objectsToDraw.push(...model.parts.filter(node => node.sprite))
const loop = () =>{
    model.updateWorldMatrix()
    let cameraMatrix = m4.translation(...cPos)
    cameraMatrix = m4.yRotate(cameraMatrix, cRot[1])
    cameraMatrix = m4.xRotate(cameraMatrix, cRot[0])
    
    
   

    drawScene(objectsToDraw, cameraMatrix, uniforms)
    requestAnimationFrame(loop)

}
loop()