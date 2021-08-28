

const {Vector, cross,dot,normalize, Matrix3, rotationX, rotationY, rotationZ} = require('./vectors')


const xAxis = new Vector(1,0,0)
const yAxis = new Vector(0,1,0)
const zAxis = new Vector(0,0,1)
const xAxisNegative = xAxis.multiply(-1)
const yAxisNegative = yAxis.multiply(-1)
const zAxisNegative = zAxis.multiply(-1)

class Box{
    constructor(a,b,c){
        
        this.min = new Vector(-a/2,-b/2,-c/2)
        this.max = new Vector(a/2,b/2,c/2)
       
        this.rotation = new Vector(0,0,0)
        this.Rmatrix = new Matrix3()
        this.RmatrixInverse = new Matrix3()
       
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
     
        
        const rx = rotationX(ax)
        const ry = rotationY(ay)
        const rz = rotationZ(az)
        this.rotation.x += ax
        this.rotation.y += ay
        this.rotation.z += az
        this.Rmatrix = this.Rmatrix.m_multiply(rx).m_multiply(ry).m_multiply(rz)
        this.RmatrixInverse = this.Rmatrix.getInverse()
        
    }
    setRmatrix(matrix){
        this.Rmatrix = matrix
        this.RmatrixInverse = matrix.getInverse()
    }
   /* getOverlapVector(p){
    
        let penetrationLength = 5000
        const v1 = this.verticles
        const v2 = p.verticles
        const forward1 = this.forwardNormal
        const upper1 = this.forwardNormal
        const right1 = this.rightNormal
    
        const forward2 = p.forwardNormal
        const upper2 = p.upperNormal
        const right2 = p.rightNormal
        
        let axises1 = [
            forward1,
            right1,
            upper1,
            forward2,
            upper2,
            right2
        ] 
        let axises2 = [
            forward1,forward2,
            forward1, upper2,
            forward1, right2,

            right1, forward2,
            right1, upper2,
            right1, right2,

            upper1, upper2,
            upper1, forward2,
            upper1, right2
        ]
        let vector = [0,0,0]
        let minPenetration = 5000
        for(let i = 0; i<6;++i){
            let result = separated(v1,v2, axises1[i])
            if(m4.isNullVector(result)) return result
            let length = m4.getVectorLength(result)
            if(length < minPenetration)
            {
                minPenetration = length
                vector = result
            }
        }
        for(let i = 0; i< 18;i+=2){
            const normal1 = axises2[i]
            const normal2 = axises2[i+1]
            const axis = m4.cross(normal1,normal2)
            if(m4.isNullVector(axis)){
                continue
            }
            let result = separated(v1,v2, axis)
            if(m4.isNullVector(result)) return result
            let length = m4.getVectorLength(result)
            if(length < minPenetration)
            {
                minPenetration = length
                vector = result
            }
        }
        
        
        return vector
    
        
    }*/
    support(dir){
        const _dir = this.RmatrixInverse.v_multiply(dir)
       
        const res = new Vector(0,0,0)
        
        res.x = _dir.x > 0 ? this.max.x : this.min.x
        res.y = _dir.y > 0 ? this.max.y : this.min.y
        res.z = _dir.z > 0 ? this.max.z : this.min.z
       
        return this.Rmatrix.v_multiply(res).add(this.pos)
    }
    getInverseInertiaTensor(mass){
        return (new Vector(1/(this.max.y * this.max.y + this.max.z * this.max.z), 
            1 / (this.max.x * this.max.x + this.max.z * this.max.z), 
            1 / (this.max.x * this.max.x + this.max.y * this.max.y))).multiply(12/mass)
    }
}

const GJK_MAX_ITERATIONS_NUM = 64


const update_simplex3 = () =>{
        
    const n = cross(b.substract(a),c.substract(a))
    const AO = a.multiply(-1)
    
    simp_dim = 2
    if(dot(cross(b.substract(a), n), AO) > 0){
        c = a
        search_dir = cross(cross(b.substract(a), AO),b.substract(a))
        return
    }
    if(dot(cross(n, c.substract(a)),AO) > 0){ 
        b = a
        search_dir = cross(cross(c.substract(a), AO),c.substract(a))
        return
    }
    simp_dim = 3
    if(dot(n, AO) > 0){
        d = c
        c = b
        b = a
        search_dir = n
        return
    }
    d = b
    b = a
    search_dir = n.multiply(-1)
    return
}
const update_simplex4 = () =>{
        
    const ABC = cross(b.substract(a),(c.substract(a)))
    const ACD = cross(c.substract(a),(d.substract(a)))
    const ADB = cross(d.substract(a),(b.substract(a)))
    const AO = a.multiply(-1)
    simp_dim = 3

    if(dot(ABC,AO) > 0){
        d = c
        c = b
        b = a
        search_dir = ABC
        return false
    }

    if(dot(ACD,AO) > 0){
        b = a
        search_dir = ACD
        return false
    }

    if(dot(ADB,(AO)) > 0){
        c = d
        d = b
        b = a
        search_dir = ADB
        return false
    }
    return true
}
function gjk(coll1,coll2){
    this.a, this.b, this.c, this.d, this.search_dir = new Vector(0,0,0), this.simp_dim = 2
    

    
    
    let mtv = new Vector(0,0,0)
   
    search_dir = coll1.pos.substract(coll2.pos)
    const c_origin1 = coll1.support(search_dir.multiply(-1))
    const c_origin2 = coll2.support(search_dir)
    c = c_origin2.substract(c_origin1)
   
    c.oa = c_origin1
    c.ob = c_origin2
    search_dir = c.multiply(-1)
    
    const b_origin1 = coll1.support(search_dir.multiply(-1))
    const b_origin2 = coll2.support(search_dir)
    b = b_origin2.substract(b_origin1)
    b.oa = b_origin1
    b.ob = b_origin2
    if(dot(b,search_dir) < 0){
        return false
    }
    
    search_dir = cross(cross(c.substract(b),b.multiply(-1)),c.substract(b))
    
    if(search_dir.isNull()){
        
        search_dir = cross(c.substract(b),(new Vector(1,0,0)))
        
        if(search_dir.isNull()){
            
            search_dir = cross(c.substract(b),(new Vector(0,0,-1)))
            
        }
    }
    
    simp_dim = 2
    for(let i = 0; i < GJK_MAX_ITERATIONS_NUM; ++i){
        
        const a_origin1 = coll1.support(search_dir.multiply(-1))
        const a_origin2 = coll2.support(search_dir)
        a = a_origin2.substract(a_origin1)
        a.oa = a_origin1
        a.ob = a_origin2
        if(dot(a,search_dir) < 0 ) return false
        
        simp_dim ++
        if(simp_dim === 3){
            update_simplex3()
        }
        else if(update_simplex4()){
            
            return EPA(a,b,c,d,coll1,coll2)

        }
    }
}

const baricentric = (face, point) =>{
    let a11 = face[0].x
    let a12 = face[1].x
    let a13 = face[2].x
    let b1 = point.x
    let a21 = face[0].y
    let a22 = face[1].y
    let a23 = face[2].y
    let b2 = point.y
    let a31 = face[0].z
    let a32 = face[1].z
    let a33 = face[2].z
    let b3 = point.z

    const d = a11 * a22 * a33 
    + a21 * a32 * a13
    + a12 * a23 * a31
    - a13 * a22 * a31
    - a21 * a12 * a33
    - a32 * a23 * a11

    const d1 = b1 * a22 * a33 +
    b2 * a32 * a13
    + a12 * a23 * b3
    - a13 * a22 * b3
    - b2 * a12 * a33
    - a32 * a23 * b1

    const d2 = a11 * b2 * a33
    + a21 * b3 * a13
    + b1 * a23 * a31
    - a13 * b2 * a31
    - a11 * b3 * a23
    - a21 * b1 * a33

    const d3 = a11 * a22 * b3
    + a21 * a32 * b1
    + a12 * b2 * a31
    - b1 * a22 * a31
    - a21 * a12 * b3
    - b2 * a32 * a11

   return [d1/d, d2/d, d3/d]
}
const originToFaceProj = ( face) =>{
        
        
        
       

    const normal = face[3]
    const point = face[0]
    const c = -normal.x * point.x - normal.y * point.y - normal.z * point.z

    const t = - c / (normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)




    return new Vector(t * normal.x, t * normal.y, t * normal.z)
}

const formContact = ()=>{
    
}

const TOLERANCE = 0.001
const MAX_NUM_FACES = 64
const MAX_NUM_LOOSE_EDGES = 32
const EPA_MAX_NUM_ITER = 64
const EPA = (a, b, c, d, coll1, coll2) =>{
    const faces = []
    for(let i = 0; i< 4; i++){
        faces[i] = []
    }

    faces[0][0] = a
    faces[0][1] = b
    faces[0][2] = c
    faces[0][3] = normalize(cross(b.substract(a),c.substract(a)))
    faces[1][0] = a
    faces[1][1] = c
    faces[1][2] = d
    faces[1][3] = normalize(cross(c.substract(a),d.substract(a)))
    faces[2][0] = a
    faces[2][1] = d
    faces[2][2] = b
    faces[2][3] = normalize(cross(d.substract(a),b.substract(a)))
    faces[3][0] = b
    faces[3][1] = d
    faces[3][2] = c
    faces[3][3] = normalize(cross(d.substract(b),c.substract(b)))
    
    let num_faces = 4
    let closest_face = null
    let search_dir
   

    let p
    for(let iteration = 0; iteration < EPA_MAX_NUM_ITER; ++iteration){
        let min_dist = dot(faces[0][0], faces[0][3])
        
       closest_face = 0
        for(let i = 0; i < num_faces; ++i){
            let dist = dot(faces[i][0],faces[i][3])
            if(dist < min_dist){
                min_dist = dist
                closest_face = i
            }
        }
        search_dir = faces[closest_face][3]
        p = coll2.support(search_dir).substract(coll1.support(search_dir.multiply(-1)))
        p.oa = coll1.support(search_dir.multiply(-1))
        p.ob = coll2.support(search_dir)
        if(dot(p,search_dir) - min_dist < 0.0001){
            const face = faces[closest_face]

            const point = originToFaceProj(face)

            const Aa = face[0].oa
            const Ba = face[0].ob
            const Ab = face[1].oa
            const Bb = face[1].ob
            const Ac = face[2].oa
            const Bc = face[2].ob
           
            const result = baricentric(face,point)
            
            
            const PA = Aa.multiply(result[0]).add(Ab.multiply(result[1])).add(Ac.multiply(result[2]))
            const PB = Ba.multiply(result[0]).add(Bb.multiply(result[1])).add(Bc.multiply(result[2]))
            
            const ra = PA.substract(coll1.pos)
            const rb = PB.substract(coll2.pos)

            const n = face[3].multiply(-dot(p,search_dir))
            const dots = []
            for(let k = 0; k < 3; k++){
                if(dot(face[k], search_dir) - min_dist < 0.1){
                    
                    if(face[k].oa.substract(PA).norm() < face[k].ob.substract(PA).norm()) dots.push(face[k].oa)
                    else dots.push(face[k].ob)
                }

            }
            

            if(n.isNull()) return false
            return {PA, PB, n, ra, rb, Aa, Ba, Ab, Bb, Ac, Bc,dots}
        }

        const loose_edges = []
        let num_loose_edges = 0
        for(let i = 0; i < num_faces;++i){
           
            if(dot(faces[i][3],p.substract(faces[i][0])) > 0){
                
                for(let j = 0; j < 3; j++){
                    let current_edge = [faces[i][j], faces[i][(j + 1) % 3]]
                    let found_edge = false
                    for(let k = 0; k < num_loose_edges; k++){
                        if(loose_edges[k][1] === current_edge[0] && loose_edges[k][0] === current_edge[1]){
                            
                            loose_edges[k][0] = loose_edges[num_loose_edges - 1][0]
                            loose_edges[k][1] = loose_edges[num_loose_edges-1][1]
                            num_loose_edges --
                            found_edge = true
                            k = num_loose_edges
                        }
                    }
                    if(!found_edge){
                        if(num_loose_edges >= MAX_NUM_LOOSE_EDGES) break;
                       
                        loose_edges[num_loose_edges] = []
                        loose_edges[num_loose_edges][0] = current_edge[0]
                        loose_edges[num_loose_edges][1] = current_edge[1]
                        num_loose_edges++
                    }
                }
                faces[i][0] = faces[num_faces - 1][0]
                faces[i][1] = faces[num_faces - 1][1]
                faces[i][2] = faces[num_faces - 1][2]
                faces[i][3] = faces[num_faces - 1][3]
                num_faces--
                i--
            }
        }
        for(let i = 0; i <num_loose_edges; i++){
            if(num_faces >= MAX_NUM_FACES) break;
            faces[num_faces]=[]
            faces[num_faces][0] = loose_edges[i][0]
            faces[num_faces][1] = loose_edges[i][1]
            faces[num_faces][2] = p
            
            faces[num_faces][3] = normalize( cross( loose_edges[i][0].substract(loose_edges[i][1]), loose_edges[i][0].substract(p)))
            if(dot(faces[num_faces][0], faces[num_faces][3]) + 0.01 < 0){
                temp = faces[num_faces][0]
                faces[num_faces][0] = faces[num_faces][1]
                faces[num_faces][1] = temp
                faces[num_faces][3] = faces[num_faces][3].multiply(-1)
                
            }
            num_faces++
        }
        
    }

    const face = faces[closest_face]

    const point = originToFaceProj(face)

    const Aa = coll1.support(face[0].multiply(-1))
    const Ba = coll2.support(face[0])
    const Ab = coll1.support(face[1].multiply(-1))
    const Bb = coll2.support(face[1])
    const Ac = coll1.support(face[2].multiply(-1))
    const Bc = coll2.support(face[2])
 
    const result = baricentric(face,point)

    
    const PA = Aa.multiply(result[0]).add(Ab.multiply(result[1])).add(Ac.multiply(result[2]))
    const PB = Ba.multiply(result[0]).add(Bb.multiply(result[1])).add(Bc.multiply(result[2]))
    
    const ra = PA.substract(coll1.pos)
    const rb = PB.substract(coll2.pos)

    const n = face[3].multiply(-dot(p,search_dir))
    console.log('----')
    return {PA, PB, n, ra, rb}

} 
module.exports = { Box,gjk, EPA, baricentric,originToFaceProj}
