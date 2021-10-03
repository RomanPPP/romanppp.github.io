

function Vector(x = 0, y = 0, z = 0){

    
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
Vector.prototype.normSq = function(){
    return this.x * this.x + this.y * this.y + this.z * this.z
}
const distanceFromLine = (a,b,c) =>{
    const ac = c.substract(a)
    const ab = b.substract(a)
    const k = dot(ab,ac) / ab.normSq()
    const h = a.add(ab.multiply(k))
    return c.substract(h).normSq()
}
const distanceFromTriangle = (a,b,c,d) =>{
    const h1 = distanceFromLine(a,b,d)
    const h2 = distanceFromLine(a,c,d)
    const h3 = distanceFromLine(b,c,d)
    if(h1 < h2){
        if(h1 < h3) return h1
        return h3
    }
    else{
        if(h2 < h3) return h2
        else return h3
    }
}

const findLargestFace = (a,b,c) => {
    const AB = a.substract(b).normSq()
    const AC = a.substract(c).normSq()
    const BC = c.substract(b).normSq()
    if(AB < AC){
        if(AB < BC) return c
        return b
    }
    else{
        if(AC < BC) return b
        else return a
    }
}
module.exports = {Vector, cross, dot, normalize, distanceFromLine, distanceFromTriangle, findLargestFace}