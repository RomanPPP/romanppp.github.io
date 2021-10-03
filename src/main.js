const {drawScene, drawPoints, drawLines, resizeCanvasToDisplaySize} = require('./render/render')
const m4 = require('./m4')

const {makeEntity} = require('./game/entity')
const {box} = require('./game/objects')

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
const {Simulation} = require('./server/simulation')
const sim = new Simulation()



const { Vector } = require('./server/vectors')
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