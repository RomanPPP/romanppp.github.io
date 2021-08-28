const {Vector, cross, dot} = require('./vectors')

function getCollisionResolution(phys1,phys2,contact, deltaTime){
    
    const vel1 = phys1.velocity
    const vel2 = phys2.velocity
    const omega1 = phys1.angularV
    const omega2 = phys2.angularV 
    const I1 = phys1.inverseInertia
    const I2 = phys2.inverseInertia
    const M1 = phys1.inverseMass
    const M2 = phys2.inverseMass
    const J1 = contact.n.multiply(-1)
    const J2 = cross(contact.n, contact.ra)
    const J3 = contact.n
    const J4 = cross(contact.rb, contact.n) 
    const penDepth = dot(contact.PB.substract(contact.PA), contact.n)
    const b = 0.95*penDepth/deltaTime

    const k1 = -dot(J1, vel1) - dot(J2, omega1) - dot(J3, vel2) - dot(J4, omega2) - b
    const k2 = dot(J1, J1) * M1 + dot(new Vector(J2.x * I1.x, J2.y * I1.y, J2.z * I1.z), J2) + dot(J3,J3) * M2
     + dot(new Vector(J4.x * I2.x, J4.y * I2.y, J4.z * I2.z), J4)
    let lambda = k1/k2
    if(lambda < 0) lambda = -lambda * 0.1
    const deltaV = [J1.multiply(lambda * M1), 
                    (new Vector(J2.x * I1.x, J2.y * I1.y, J2.z * I1.z)).multiply(lambda),
                    J3.multiply(lambda * M2),
                    (new Vector(J4.x * I2.x, J4.y * I2.y, J4.z * I2.z)).multiply(lambda)
    ]
    
    return deltaV
}
module.exports = {getCollisionResolution}