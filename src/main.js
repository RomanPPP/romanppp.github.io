const {drawScene, drawPoints, drawLines, resizeCanvasToDisplaySize} = require('./render/render')
const m4 = require('./m4')
const {sum, diff, scale} = require('./server/vector')
const {makeEntity} = require('./game/entity')
const {box, player} = require('./game/objects')
const {BoxSprite} = require('./render/sprites')
const AABBsprite = new BoxSprite()
const bbox = {sprite : AABBsprite, worldMatrix : m4.identity()}
const {Joint} = require('./server/contact')
const cPos = [0,2,5]
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




const { Box } = require('./server/collider')
const { AABB } = require('./server/aabb')
const objectsToDraw = []
const floor = makeEntity(box)


floor.updateObjectsToDraw()
sim.addObject(floor.physics)
floor.physics.collider.min = [-30, -2, -30]
floor.physics.collider.max = [30,2,30]


floor.renderNode.localMatrix = m4.scaling(60,4,60)
floor.physics.setMass(100000000000)



let entities = []

entities.push(floor)
floor.physics.translate([0,-2,0])
floor.physics.rotate([0.0,0,0])

objectsToDraw.push(...floor.objectsToDraw,)

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
    cube.physics.translate(cPos)
    
    let Rm = m4.yRotation(cRot[1])
    Rm = m4.xRotate(Rm, cRot[0])
    
    const vel = m4.transformPoint(Rm, [0,0,-20])
    
    cube.physics.addVelocity(vel)
    cube.physics.addAcceleration([0, -9.8, 0])
    console.log(cube)

}
for(let i = 0; i < 0;i++){
    const cube = makeEntity(box)
    cube.updateObjectsToDraw()
    entities.push(cube)
    objectsToDraw.push(...cube.objectsToDraw)
    sim.addObject(cube.physics)
    cube.physics.collider.min = [-3, -2, -3]
    cube.physics.collider.max = [3, 2, 3]
    cube.renderNode.localMatrix = m4.scaling(6,4,6)
    cube.renderNode.sprite.uniforms.u_color = [0.2,0.3,0.4,1]
    cube.physics.translate([0,4 + i * 4,0])
    cube.physics.addAcceleration([0, -9.8, 0])
    cube.physics.rotate([0.5, 0.5, 0])
    console.log(cube)
}
const Player = makeEntity(player)
Player.updateObjectsToDraw()
entities.push(Player)
objectsToDraw.push(...Player.objectsToDraw)
sim.addObject(Player.physics)
Player.physics.collider.min = [-1, -2, -1]
Player.physics.collider.max = [1, 2, 1]
Player.renderNode.localMatrix = m4.scaling(2,4,2)
Player.renderNode.sprite.uniforms.u_color = [0.2,0.3,0.4,1]
Player.physics.translate([0,4 + 2 * 4,0])
Player.physics.addAcceleration([0, -9.8, 0])



for(let i = 0; i < 2;i++){
    const cube = makeEntity(box)
    cube.updateObjectsToDraw()
    cube.physics.collider.min = [-0.5, -2, -0.5]
    cube.physics.collider.max = [0.5, 2, 0.5]
    cube.renderNode.localMatrix = m4.scaling(1,4,1)
    entities.push(cube)
    objectsToDraw.push(...cube.objectsToDraw)
    sim.addObject(cube.physics)
    cube.physics.translate([0, i * 4.5 + 4, 0])
    cube.physics.addAcceleration([0, -9.8, 0])
    
    sim.constrains.push(new Joint([ (-1)**(i %2 )*2, 0, 0], [0, 2, 0], Player.physics, cube.physics))
    //sim.constrains.push(new Joint([ (-1)**(i %2 )*2, -4, 0], [0, -2, 0], Player.physics, cube.physics))
}
    //sim.constrains.push(new Joint([0,5,0], [0,14,0], Player.physics, floor.physics))
    //cube.physics.rotate(1,2,0)
   

    /*const cube2 = makeEntity(box)
    cube2.updateObjectsToDraw()
    entities.push(cube2)
    objectsToDraw.push(...cube2.objectsToDraw)*/
    //sim.addObject(cube2.physics)
    //cube2.physics.setMass(1000)
    //cube2.physics.collider.min = new Vector(-0.1,-0.1,-0.1)
    //cube2.physics.collider.max = new Vector(0.1,0.1,0.1)
    //cube2.renderNode.localMatrix = m4.scaling(0.2,0.2,0.2)
    
    //cube2.renderNode.sprite.uniforms.u_color = [0.2,0.3,0.4,1]
    //cube2.physics.translate([0,10,0])
    
    //cube2.physics.setMass(10)
    //cube2.physics.addAcceleration([0, -9.8, 0])
resizeCanvasToDisplaySize(gl.canvas, 1)
controls['p'] = () => {
    sim.tick(0.015)
    
   
}
const loop = () =>{
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)
    
    entities.forEach(entity => entity.updateWorldMatrix())
    sim.tick(0.016)

    
    cameraMatrix = m4.translation(...cPos)
    cameraMatrix = m4.yRotate(cameraMatrix, cRot[1])
    cameraMatrix = m4.xRotate(cameraMatrix, cRot[0])
    
    const manifolds = sim.collisionManifolds.values()
    const cols = []
    
    for(let manifold of manifolds)cols.push(...manifold.contacts)
    
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    drawScene(objectsToDraw, cameraMatrix, uniforms)

    
    
    /*sim.bvh.getNodes().forEach(node => {
        
        const tr = scale(sum(node.aabb.min, node.aabb.max),0.5)
        const scaling = diff(node.aabb.max, node.aabb.min)
        bbox.worldMatrix = m4.scale(m4.translation(...tr), ...scaling)
        drawScene([bbox], cameraMatrix, uniforms)
        drawPoints([m4.translation(...node.aabb.min), m4.translation(...node.aabb.max),], [0.0,0.5,0.4,1], cameraMatrix)
    })*/
    
    //drawPoints(aabbs.map(aabb => m4.translation(...aabb.min)), [0.1,0.0,0.4,1], cameraMatrix)
    //drawPoints(aabbs.map(aabb => m4.translation(...aabb.max)), [0.1,0.0,0.4,1], cameraMatrix)
    drawPoints(cols.map(col => m4.translation(...col.PA)), [0.2,0.3,0.4,1], cameraMatrix)
    drawPoints(cols.map(col => m4.translation(...col.PB)), [0.0,0.5,0.4,1], cameraMatrix)
    drawPoints(sim.constrains.map(c => m4.translation(...c.PA)), [0.0,0.5,0.4,1], cameraMatrix)
    drawPoints(sim.constrains.map(c => m4.translation(...c.PB)), [1.0,0.5,0.4,1], cameraMatrix)
    
    

    requestAnimationFrame(loop)


}

loop()