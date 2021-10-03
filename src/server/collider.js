

const {Vector} = require('./vectors')
const {EventEmitter} = require('./eventEmitter')
const m4 = require('../m4')
const m3 = require('../m3')
const xAxis = new Vector(1,0,0)
const yAxis = new Vector(0,1,0)
const zAxis = new Vector(0,0,1)
const xAxisNegative = xAxis.multiply(-1)
const yAxisNegative = yAxis.multiply(-1)
const zAxisNegative = zAxis.multiply(-1)
const dirs = [xAxis,yAxis,zAxis,xAxisNegative,yAxisNegative, zAxisNegative]

class Box extends EventEmitter{
    constructor(a = 1,b = 1,c = 1){
        super()
        this.min = new Vector(-a/2,-b/2,-c/2)
        this.max = new Vector(a/2,b/2,c/2)
        this.Rmatrix = m3.identity()
        this.RmatrixInverse = m3.identity()
        this.RS = m3.identity()
        this.pos = new Vector(0,0,0)
    }
    getAABB(){
        const maxX = this.support(xAxis).x
        const maxY = this.support(yAxis).y
        const maxZ = this.support(zAxis).z

        const minX = this.support(xAxisNegative).x
        const minY = this.support(yAxisNegative).y
        const minZ = this.support(zAxisNegative).z
        return [new Vector(minX, minY, minZ), new Vector(maxX, maxY, maxZ)]
    }
    translate(tx,ty,tz){
        this.pos.x += tx
        this.pos.y += ty
        this.pos.z += tz
    }
    rotate(ax,ay,az){
        this.Rmatrix = m3.xRotate(this.Rmatrix, ax)
        this.Rmatrix = m3.yRotate(this.Rmatrix, ay)
        this.Rmatrix = m3.zRotate(this.Rmatrix, az)

        this.RmatrixInverse = m3.transpose(this.Rmatrix)
    }
    setRmatrix(matrix){
        this.Rmatrix = matrix
        this.RmatrixInverse = m3.transpose(matrix)
    }
    support(dir){
        const _dir = m3.transformPoint(this.RmatrixInverse, dir.toArray())
        
        const res = new Vector(0,0,0)
        
        res[0]= _dir[0] > 0 ? this.max.x : this.min.x
        res[1] = _dir[1] > 0 ? this.max.y : this.min.y
        res[2] = _dir[2] > 0 ? this.max.z : this.min.z
        
        const sup = new Vector(...m4.transformPoint(this.getM4(), res))
        this.emit('sup', sup,dir)
        return sup
  
    }
    getInverseInertiaTensor(mass){
        const i1 = mass/12 * (this.max.y * this.max.y + this.max.z * this.max.z)
        const i2 = mass / 12 *(this.max.x * this.max.x + this.max.z * this.max.z)
        const i3 = mass / 12 *(this.max.x * this.max.x + this.max.y * this.max.y)
        
        const m = new Float32Array([1/i1, 0, 0, 0, 1/i2, 0, 0, 0, 1/i3])
        
        return m3.multiply(this.Rmatrix,(m3.multiply(this.RmatrixInverse,m)))

    }
    getM4(){
        const m = m4.m3Tom4(this.Rmatrix)
        m[12] = this.pos.x
        m[13] = this.pos.y
        m[14] = this.pos.z
        m[15] = 1
        return m
    }
    test(){
        return dirs.map(d =>this.support(d).toArray())
    }
}

 
module.exports = { Box}