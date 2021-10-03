const {Vector, cross, dot,normalize} = require('./vectors')
const m3 = require('../m3')
const tol = 0.005
const tol2 = 0.002
const numIterations = 7
function getCollisionResolution(manifold, deltaTime){
    const body1 = manifold.body1
    const body2 = manifold.body2
    
    for(let j = 0; j <  numIterations; j++){
        for(let i = 0, n = manifold.contacts.length; i< n; i++){
            let vel1 = body1.velocity
            let vel2 = body2.velocity
            let omega1 = body1.angularV
            let omega2 = body2.angularV
            const contact = manifold.contacts[i]
            const I1 = body1.getInverseInertiaTensor()
            const I2 = body2.getInverseInertiaTensor()
            const M1 = body1.inverseMass
            const M2 = body2.inverseMass
            const normal = normalize(contact.n)
            let J1 = normal.multiply(-1)
            let J2 = cross(normal, contact.ra)
            let J3 = normal
            let J4 = cross(contact.rb, normal)
            
            
        
        
            const penDepth = contact.n.norm()
            const Vc = dot(vel2.add(cross(omega2, contact.rb)).substract(vel1).substract(cross(omega1, contact.ra)),normal)
            const restitution =  Math.max(Vc - tol2, 0) * 0.1
    
            let b = Math.max(0,penDepth-tol)/deltaTime *0.1 + restitution
            
            const k1 = dot(J1, vel1) + dot(J2, omega1) + dot(J3, vel2) + dot(J4, omega2) - b
        
            const Ma = [M1, 0, 0,
                        0, M1, 0,
                        0, 0, M1 ]
            const Mb = [M2, 0, 0,
                        0, M2, 0,
                        0, 0, M2]
            const JMa = m3.dot(m3.transformPoint(Ma, J1.toArray()),J1.toArray())
            const JIa = m3.dot(m3.transformPoint(I1, J2.toArray()), J2.toArray())
            const JMb = m3.dot(m3.transformPoint(Mb, J3.toArray()), J3.toArray())
            const JIb = m3.dot(m3.transformPoint(I2, J4.toArray()), J4.toArray())
            const k2 = (JMa + JMb + JIa + JIb)
            
            
            let lambda = -k1/k2
            let oldAcc = contact.accI
            contact.accI += lambda
            if(contact.accI < 0) contact.accI = 0
            lambda = contact.accI - oldAcc
            
            
            vel1 = J1.multiply(lambda * M1)
            body1.addVelocity(vel1)
            omega1 = (new Vector(...m3.transformPoint(I1,J2.toArray()))).multiply(lambda)
            body1.addAngularV(omega1)
            vel2 = J3.multiply(lambda * M2)
            body2.addVelocity(vel2)
            omega2 = (new Vector(...m3.transformPoint(I2, J4.toArray()))).multiply(lambda)
            body2.addAngularV(omega2)
        }
    }
    
    
    
    
    
}
const warmStart = (manifold, deltaTime) =>{
    const body1 = manifold.body1
    const body2 = manifold.body2
    
    for(let i = 0, n = manifold.contacts.length; i< n; i++){
        let vel1 = body1.velocity
        let vel2 = body2.velocity
        let omega1 = body1.angularV
        let omega2 = body2.angularV
        const contact = manifold.contacts[i]
        const I1 = body1.getInverseInertiaTensor()
        const I2 = body2.getInverseInertiaTensor()
        const M1 = body1.inverseMass
        const M2 = body2.inverseMass
        const normal = normalize(contact.n)
        let J1 = normal.multiply(-1)
        let J2 = cross(normal, contact.ra)
        let J3 = normal
        let J4 = cross(contact.rb, normal)


        const lambda = manifold.contacts[i].accI * deltaTime
        vel1 = J1.multiply(lambda * M1)
        body1.addVelocity(vel1)
        
        omega1 = (new Vector(...m3.transformPoint(I1,J2.toArray()))).multiply(lambda)
        body1.addAngularV(omega1)
        vel2 = J3.multiply(lambda * M2)
        body2.addVelocity(vel2)
        omega2 = (new Vector(...m3.transformPoint(I2, J4.toArray()))).multiply(lambda)
        body2.addAngularV(omega2)
    }
    
}
module.exports = {getCollisionResolution, warmStart}