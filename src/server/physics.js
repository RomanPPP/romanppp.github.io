
const {EventEmitter}  = require('./eventEmitter')
const { cross, scale, norm, sum, diff, chkV } = require('./vector')
const m3 = require('../m3')
const { AABB } = require('./aabb')
const prec = 0.01
const stopTreshold = 0.001
class Physics extends EventEmitter{
    constructor(collider){
        super()
        this.static = false
        this.collider = collider
        this.mass = 1
        this.inverseMass = 1/this.mass
        this.velocity = [0, 0, 0]
        this.pseudoVelocity = [0, 0, 0]
        this.pseudoAngularV = [0, 0, 0]
        this.acceleration = [0, 0, 0]
        this.angularV = [0, 0, 0]
        this.inverseInertia = collider.getInverseInertiaTensor(this.mass)
        this.id = 1
        this.friction = 0.1
        this.BVlink
    }
    
    integratePseudoVelocities(dt){
        const translation = scale(this.pseudoVelocity, dt)
        
        const rotation = scale(this.pseudoAngularV, dt*0.5)
        if(norm(translation) > stopTreshold)
        this.translate(translation)

        if(norm(rotation) > stopTreshold)
        this.rotate(rotation)
        
        this.pseudoVelocity = [0, 0, 0]
        this.pseudoAngularV = [0, 0, 0]
    }
    addPseudoVelocity(v){
        this.pseudoVelocity = sum(this.pseudoVelocity, v)
    }
    addPseudoAngularV(v){
        this.pseudoAngularV = sum(this.pseudoAngularV, v)
    }
    integrateVelocities(dt){
        const translation = scale(this.velocity, dt)
        if(norm(translation) > stopTreshold)
        this.translate(translation)
        const rotation = scale(this.angularV, dt*0.5)
        if(norm(translation) > stopTreshold)
        this.rotate(rotation)
        
        
    }
    integrateForces(dt){


        let deltaSpeed = scale(this.acceleration, dt)
        this.velocity = sum(this.velocity, deltaSpeed)
        
        
    }
    updateInverseInertia(){
        this.inverseInertia = this.collider.getInverseInertiaTensor(this.mass)
    }
    
    setMass(mass){
        this.mass = mass
        this.inverseMass = 1 / this.mass
        
    }
    translate(translation){
        
        this.collider.translate(translation)

        this.emit('update')
       
    }
    rotate(rotation){
        
        this.collider.rotate(rotation)

        this.emit('update')
        
        
    }
    applyImpulse(impulse, point){
        this.velocity = sum(this.velocity, scale(impulse, this.inverseMass))
        const angularImpulse = m3.transformPoint(this.inverseInertia, cross( point, impulse))
        this.angularV = sum(this.angularV, angularImpulse)
    }
    applyPseudoImpulse(impulse, point){
        this.pseudoVelocity = sum(this.pseudoVelocity, scale(impulse, this.inverseMass))
        const angularImpulse = m3.transformPoint(this.inverseInertia, cross( point, impulse))
        this.pseudoAngularV = sum(this.pseudoAngularV, angularImpulse)
    }
    addVelocity(v){
        chkV(v)
        if(this.static)return
        this.velocity = sum(this.velocity, v)
    }
    addAngularV(v){
        chkV(v)
        if(this.static)return
        this.angularV = sum(this.angularV, v)
    }
    addAcceleration(v){
        this.acceleration = sum(this.acceleration, v)
    }
    getExpandedAABB(){
        const aabb = this.collider.getAABB()
        const velocity = this.velocity
        const tr = [prec, prec, prec]
        aabb.min = diff(aabb.min, tr)
        aabb.max = sum(aabb.max, tr)
        
        /*if(velocity[0] > 10) aabb.max[0] += velocity[0]
        if(velocity[1] > 10) aabb.max[1] += velocity[1]
        if(velocity[2] > 10) aabb.max[2] += velocity[2]
        if(velocity[0] < -10) aabb.min[0] += velocity[0]
        if(velocity[1] < -10) aabb.min[1] += velocity[1]
        if(velocity[2] < -10) aabb.min[2] += velocity[2]*/
        return aabb
    }
    getAABB(){
        return this.collider.getAABB()
    }
    
}

class Player extends Physics{
    constructor(){
        super(...arguments)
        this.friction = 10
    }
    applyImpulse(impulse, point){
        this.velocity = sum(this.velocity, scale(impulse, this.inverseMass))
        
    }
    applyPseudoImpulse(impulse){
        this.pseudoVelocity = sum(this.pseudoVelocity, scale(impulse, this.inverseMass))
    }
}
module.exports = {Physics, Player}