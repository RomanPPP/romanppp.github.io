const { getVectorLength } = require('./m4')
const m4 = require('./m4')
const {Matrix3, Vector} = require('./server/vectors')
let matrix = m4.identity()

matrix = m4.xRotate(matrix, Math.PI/3)
matrix = m4.translate(matrix, 1,1,1)
const print = k => m =>{
    for(let i = 0; i < k; i++){
        let str = ''
        for(let j = 0; j < k; j++)str += (' ' + m[i*k + j])
        console.log(str)
    }
}

let m = new Matrix3()
m = m.rotate(Math.PI/3,0,0)
print(4)(matrix)
print(3)(m.arr)
console.log(m4.getVectorLength(m4.transformPoint(matrix, (new Vector(0,0,0).toArray()))), m4.getVectorLength([1,1,1]))
console.log(m4.transformPoint(matrix, (new Vector(0,0,0).toArray())))