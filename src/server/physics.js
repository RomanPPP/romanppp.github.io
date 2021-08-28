
const {EventEmitter}  = require('./eventEmitter')
const {Vector} = require('./vectors')
const prec = 0.1
class Physics extends EventEmitter{
    constructor(collider){
        super()
        this.static = false
        this.collider = collider
        this.mass = 5
        this.inverseMass = 0.2
        this.velocity = new Vector(0, 0, 0)
        this.acceleration = new Vector(0,0,0)
        this.inverseInertia = this.collider.getInverseInertiaTensor(this.mass)
        this.angularV = new Vector(0, 0, 0)
        this.bounce = 1
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
    setMass(mass){
        this.mass = mass
        this.inverseMass = 1 / this.mass
        this.inverseInertia = this.collider.getInverseInertiaTensor(this.mass)
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
        this.velocity = this.velocity.add(v)
    }
    addAngularV(v){
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
        if(velocity.z > 10) aabb[1].z  += velocity.z
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