
function Vector(x,y,z){
    this.x = x
    this.y = y
    this.z = z
}
Vector.prototype.toArray = function(){
    return [this.x,this.y,this.z]
}
const dot = (v1,v2) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z

const cross = (v1,v2) => new Vector(
                        v1.y * v2.z - v2.y * v1.z,
                        v1.z * v2.x - v2.z * v1.x,
                        v1.x * v2.y - v2.x * v1.y )
Vector.prototype.add = function(v){
    return new Vector(this.x + v.x, this.y + v.y, this.z + v.z)
}
Vector.prototype.multiply = function(a){
    return new Vector(this.x * a, this.y * a, this.z * a)

}
Vector.prototype.substract = function(v){
    return new Vector(this.x - v.x, this.y - v.y, this.z - v.z)
}
Vector.prototype.isNull = function(){
    return this.x * this.x + this.y * this.y + this.z * this.z === 0
}
const normalize = v =>{
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
    return new Vector(v.x / len, v.y / len, v.z / len)
}
Vector.prototype.norm = function(){
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
}
function Matrix3(a11 = 1,a12 = 0,a13 = 0,a21 = 0,a22 = 1,a23 = 0,a31 = 0,a32 = 0,a33 = 1){
    this.a11 = a11
    this.a12 = a12
    this.a13 = a13
    this.a21 = a21
    this.a22 = a22
    this.a23 = a23
    this.a31 = a31
    this.a32 = a32
    this.a33 = a33

    this.arr = [a11, a12 ,a13 , a21, a22, a23, a31 , a32 ,a33 ]
}
Matrix3.prototype.v_multiply = function(v){
    
    const x = v.x * this.arr[0] + v.y * this.arr[1] + v.z * this.arr[2]
    const y = v.x * this.arr[3] + v.y * this.arr[4] + v.z * this.arr[5]
    const z = v.z * this.arr[6] + v.y * this.arr[7] + v.z * this.arr[8]
    return new Vector(x,y,z)
}
Matrix3.prototype.m_multiply = function(m){
    const a11 = this.a11 * m.a11 + this.a12 * m.a21 + this.a13 * m.a31
    const a12 = this.a11 * m.a12 + this.a12 * m.a22 + this.a13 * m.a32
    const a13 = this.a11 * m.a13 + this.a12 * m.a23 + this.a13 * m.a33

    const a21 = this.a21 * m.a11 + this.a22 * m.a21 + this.a23 * m.a31
    const a22 = this.a21 * m.a12 + this.a22 * m.a22 + this.a23 * m.a32
    const a23 = this.a21 * m.a13 + this.a22 * m.a23 + this.a23 * m.a33

    const a31 = this.a31 * m.a11 + this.a32 * m.a21 + this.a33 * m.a31
    const a32 = this.a31 * m.a12 + this.a32 * m.a22 + this.a33 * m.a32
    const a33 = this.a31 * m.a13 + this.a32 * m.a23 + this.a33 * m.a33

    return new Matrix3(a11, a12, a13, a21, a22, a23, a31, a32, a33)
}
Matrix3.prototype.det = function(){
    return this.a11 * this.a22 * this.a33 
    + this.a21 * this.a32 * this.a13
    + this.a12 * this.a23 * this.a31
    - this.a13 * this.a22 * this.a31
    - this.a21 * this.a12 * this.a33
    - this.a32 * this.a23 * this.a11
}
Matrix3.prototype.getInverse = function(){
    const det = this.det()
    const a11 = (this.a22 * this.a33 - this.a32 * this.a23) / det
    const a12 = -(this.a21 * this.a33 - this.a31 * this.a23) / det
    const a13 = (this.a21 * this.a32 - this.a31 * this.a22) / det
    
    const a21 = -(this.a12 * this.a33 - this.a32 * this.a13) / det
    const a22 = (this.a11 * this.a33 - this.a31 * this.a13) / det
    const a23 = -(this.a11 * this.a32 - this.a31 * this.a12) / det

    const a31 = (this.a12 * this.a23 - this.a22 * this.a13) / det
    const a32 = -(this.a11 * this.a23 - this.a21 * this.a13) / det
    const a33 = (this.a11 * this.a22 - this.a21 * this.a12) / det
    return new Matrix3(a11, a21, a31, a12, a22, a32, a13, a23, a33)
}
const rotationX = a => new Matrix3( 1,    0,             0,
                                0, Math.cos(a), -Math.sin(a),
                                0, Math.sin(a), Math.cos(a))

const rotationY =  a => new Matrix3(Math.cos(a), 0, Math.sin(a),
                                0,         1,         0,
                            -Math.sin(a), 0, Math.cos(a))


const rotationZ =  a => new Matrix3(Math.cos(a), -Math.sin(a),0,
                              Math.sin(a), Math.cos(a), 0,
                              0,            0,          1)
Matrix3.prototype.rotate = function(x,y,z){
    const mX = rotationX(x)
    const mY = rotationY(y)
    const mZ = rotationZ(z)
    return this.m_multiply(mX).m_multiply(mY).m_multiply(mZ)
}
function Maxtrix4(){
    this.a11 = 1
    this.a12 = 0
    this.a13 = 0
    this.a14 = 0
    this.a21 = 0
    this.a22 = 1
    this.a23 = 0
    this.a24 = 0
    this.a31 = 0
    this.a32 = 0
    this.a33 = 1
    this.a34 = 0
    this.a41 = 0
    this.a42 = 0
    this.a43 = 0
    this.a44 = 1
}
module.exports = {Vector, cross, dot, normalize, Matrix3, rotationX, rotationY, rotationZ}