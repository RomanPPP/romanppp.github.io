const {dot, cross, normalize, diff, scale, norm} = require('./vector')
const m3 = require('../m3')
class Constraint{
    constructor( body1, body2){
        
        this.n = null
        this.J = null
        this.effMass = null
        this.body1 = body1
        this.body2 = body2
        this.ra = null
        this.rb = null
    }
    updateEq(){
    }
}
class Contact extends Constraint{
    constructor(PA, PB, ra, rb, n, penDepth, body1, body2){
        super( body1, body2)
        this.ra = ra
        this.rb = rb
        this.PA = PA
        this.PB = PB
        this.n = n
        this.penDepth = penDepth
        this.initialVelProj = null
        this.effMass = null
        
        this.J = null
        this.accI = 0
        this.accFI1 = 0
        this.accFI2 = 0
        try{
            if(dot(this.n, [1, 0, 0]) < 0.5){
                this.fDir1 = cross(this.n, [1, 0, 0])
            }
            else {
                this.fDir1 = cross(this.n, [0, 0, 1])
            }
            this.fDir2 = normalize(cross(this.fDir1, this.n))
            this.fDir1 = normalize(this.fDir1)
        }
        catch(err){
            console.log(this.n)
            throw new Error()
        }
    }
    updateEq(){
        this.J = [
            scale(this.n, -1),
            cross(this.n, this.ra),
            this.n,
            cross(this.rb, this.n)
        ]
        const I1 = this.body1.inverseInertia
        const I2 = this.body2.inverseInertia
        const M1 = this.body1.inverseMass
        const M2 = this.body2.inverseMass
        this.effMass = M1 
            + dot( m3.transformPoint(I1, this.J[1]), this.J[1])
            + M2 
            + dot( m3.transformPoint(I2, this.J[3]), this.J[3])
        const tJ1 = [
            this.fDir1,
            cross(this.ra, this.fDir1),
            scale(this.fDir1, -1),
            cross(this.rb, this.fDir1)
        ]
        this.fEffMass1 = this.body1.inverseMass
                + m3.dot(m3.transformPoint(this.body1.inverseInertia, tJ1[1]), tJ1[1])
                + this.body2.inverseMass
                + m3.dot(m3.transformPoint(this.body2.inverseInertia, tJ1[3]), tJ1[3])
        const tJ2 = [
            scale(this.fDir2, -1),
            cross(this.ra, this.fDir2 ),
            this.fDir2,
            cross( this.fDir2, this.rb)
        ]
        this.fEffMass2 = this.body1.inverseMass
                + m3.dot(m3.transformPoint(this.body1.inverseInertia, tJ2[1]), tJ2[1])
                + this.body2.inverseMass
                + m3.dot(m3.transformPoint(this.body2.inverseInertia, tJ2[3]), tJ2[3])
        
    }
}
class Joint extends Constraint{
    constructor(localRa, localRb, body1, body2){
        
        super( body1, body2)
        this.localRa = localRa
        this.localRb = localRb
        this.PA = this.body1.collider.localToGlobal(this.localRa)
        this.PB = this.body2.collider.localToGlobal(this.localRb)
    }
    updateEq(){
        this.PA = this.body1.collider.localToGlobal(this.localRa)
        this.PB = this.body2.collider.localToGlobal(this.localRb)
        this.n = diff(this.PA, this.PB)
        this.ra = diff(this.PA,this.body1.collider.pos)
        this.rb = diff(this.PB,this.body2.collider.pos)
        this.dist = norm(this.n)
        this.J = [
            scale(this.n, 1/this.dist),
            scale(cross(this.n, this.ra), 1/this.dist),
            scale(this.n, -1/this.dist),
            scale(cross(this.rb, this.n), 1/this.dist)
        ]
        const I1 = this.body1.inverseInertia
        const I2 = this.body2.inverseInertia
        const M1 = this.body1.inverseMass
        const M2 = this.body2.inverseMass
        this.effMass = M1 
            + dot( m3.transformPoint(I1, this.J[1]), this.J[1])
            + M2 
            + dot( m3.transformPoint(I2, this.J[3]), this.J[3])
        
    }
}
module.exports = {Contact, Constraint, Joint}