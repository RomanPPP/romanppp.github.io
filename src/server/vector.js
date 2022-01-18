const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => {
    const res = [
                            a[1] * b[2] - b[1] * a[2],
                            a[2] * b[0] - b[2] * a[0],
                            a[0] * b[1] - b[0] * a[1]    
                    ]
    if(isNaNvec(a) || isNaNvec(b)){
        console.log(a, b)
        throw new Error('args is NaN : ,')
    }
    return res
}          
const scale = (a, scalar) => [a[0] * scalar, a[1] * scalar, a[2] * scalar]
const sum = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const diff = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const norm = a => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
const normSq = a => a[0] * a[0] + a[1] * a[1] + a[2] * a[2]
const normalize = a => {
    const length = norm(a)
    if(length === 0) return a
    return [a[0] / length, a[1] / length, a[2] / length]
}
const isNull = a => a[0]*a[0] + a[1] * a[1] + a[2] * a[2] === 0

const chkV = (v) =>{
    if(isNaNvec(v)){
        console.log(v)
        throw new Error('NaN Vec')
    }
}

const findFurthestPoint = (a,b,c) => {
    const AB = normSq(diff(a, b))
    const AC = normSq(diff(a, c))
    const BC = normSq(diff(c, b))
    if(AB < AC){
        if(AB < BC) return c
        return b
    }
    else{
        if(AC < BC) return b
        else return a
    }
}
const distanceFromLine = (a,b,c) =>{
    const ac = diff(c, a)
    const ab = diff(b, a)
    const k = dot(ab,ac) / normSq(ab)
    const h = sum(a, scale(ab, k))
    return normSq(diff(c, h))
}


const isNaNvec = v => isNaN(v[0] + v[1] + v[2]) || (v[0] + v[1] + v[2] === Infinity) || (v[0] + v[1] + v[2] === -Infinity)
const _dot = (a, b) =>{
    if(isNaNvec(a) || isNaNvec(b)){
        console.log(a, b)
        throw new Error('args is NaN : ,')
    }
    return dot(a, b)
}
const _cross = (a, b) =>{
    if(isNaNvec(a) || isNaNvec(b)){
        console.log(a, b)
        throw new Error('args is NaN : ,')
    }
    const res = cross(a, b)  
    if(isNaNvec(res)){
        console.log(a, b)
        throw new Error('get NaN : ,')
    }
    return res 
}
const _sum = (a, b) =>{
    if(isNaNvec(a) || isNaNvec(b)){
        console.log(a, b)
        throw new Error('args is NaN : ,')
    }
    const res = sum(a, b)  
    if(isNaNvec(res)){
        console.log(a, b)
        throw new Error('get NaN : ,')
    }
    return res 
}
const _diff = (a, b) =>{
    if(isNaNvec(a) || isNaNvec(b)){
        console.log(a, b)
        throw new Error('args is NaN : ,')
    }
    const res = diff(a, b)  
    if(isNaNvec(res)){
        console.log(a, b)
        throw new Error('get NaN : ,')
    }
    return res    
}
const _scale = (a, scalar) =>{
    if(isNaNvec(a) || isNaN(scalar)){
        console.log(a, scalar)
        throw new Error('args is NaN : ,')
    }
    const res = scale(a, scalar)  
    if(isNaNvec(res)){
        console.log(a, scalar)
        throw new Error('get NaN : ,')
    }
    return res 
}
const _normalize = a =>{
    if(isNaNvec(a)){
        console.log(a)
        throw new Error('args is NaN : ,')
    }
    const res = normalize(a)  
    if(isNaNvec(res)){
        console.log(a)
        throw new Error('get NaN : ,')
    }
    return res 
}
module.exports = {chkV, dot : _dot, cross : _cross, scale : _scale, sum : _sum, diff : _diff, normalize : _normalize, norm, normSq, isNull, findFurthestPoint, distanceFromLine}