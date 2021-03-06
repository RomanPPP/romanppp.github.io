
const {dot, cross, normalize, sum, diff, len, scale, isNull, norm} =  require('./vector')

const {Contact} = require('./contact')
const m3 = require('../m3')
const GJK_MAX_ITERATIONS_NUM = 64


function update_simplex3(a, b, c, d, search_dir, simp_dim){
        
    const n = cross(diff(this.b, this.a), diff(this.c, this.a))
    const AO = scale(this.a, -1)
    
    this.simp_dim = 2
    if(dot(cross(diff(this.b, this.a), n), AO) > 0){
        this.c = this.a
        this.search_dir = cross(cross(diff(this.b, this.a), AO), diff(this.b, this.a))
        return
    }
    if(dot(cross(n, diff(this.c, this.a)), AO) > 0){ 
        this.b = this.a
        this.search_dir = cross(cross(diff(this.c, this.a), AO),diff(this.c, this.a))
        return
    }
    this.simp_dim = 3
    if(dot(n, AO) > 0){
        this.d = this.c
        this.c = this.b
        this.b = this.a
        this.search_dir = n
        return
    }
    this.d = this.b
    this.b = this.a
    this.search_dir = scale(n, -1)
    return
}
function update_simplex4(a, b, c, d, search_dir, simp_dim){
        
    const ABC = cross(diff(this.b, this.a), diff(this.c, this.a))
    const ACD = cross(diff(this.c, this.a), diff(this.d, this.a))
    const ADB = cross(diff(this.d, this.a), diff(this.b, this.a))
    const AO = scale(this.a, -1)
    this.simp_dim = 3

    if(dot(ABC,AO) > 0){
        this.d = this.c
        this.c = this.b
        this.b = this.a
        this.search_dir = ABC
        return false
    }

    if(dot(ACD,AO) > 0){
        this.b = this.a
        this.search_dir = ACD
        return false
    }

    if(dot(ADB,(AO)) > 0){
        this.c = this.d
        this.d = this.b
        this.b = this.a
        this.search_dir = ADB
        return false
    }
    return true
}
function gjk(body1,body2){
    const coll1 = body1.collider
    const coll2 = body2.collider
    this.a = [0,0,0]
    this.b = [0,0,0]
    this.c = [0,0,0]
    this.d = [0,0,0]
    this.search_dir = [0,0,0]
    this.simp_dim = 0
   
    this.originsMap = new Map()
    

    
    
    let mtv = [0, 0, 0]
   
    this.search_dir = diff(coll1.pos, coll2.pos)
    const c_origin1 = coll1.support(scale(this.search_dir, -1))
    const c_origin2 = coll2.support(this.search_dir)
    this.c = diff(c_origin2, c_origin1)
    
    this.originsMap.set(this.c,[c_origin1, c_origin2])
    
    this.search_dir = scale(this.c, -1)
    
    const b_origin1 = coll1.support(scale(this.search_dir, -1))
    const b_origin2 = coll2.support(this.search_dir)
    this.b = diff(b_origin2, b_origin1)
    
    this.originsMap.set(this.b, [b_origin1, b_origin2])
    
    if(dot(this.b, this.search_dir) < 0){
        
        return false
    }
    
    this.search_dir = cross(cross(diff(this.c, this.b), scale(this.b, -1)), diff(this.c, this.b))
    
    if(isNull(this.search_dir)){
        
        this.search_dir = cross(diff(this.c, this.b),[1,0,0])
        
        if(isNull(this.search_dir)){
            
            this.search_dir = cross(diff(this.c, this.b), [0, 0, -1])
            
        }
    }
    
    this.simp_dim = 2
    for(let i = 0; i < GJK_MAX_ITERATIONS_NUM; ++i){
        
        const a_origin1 = coll1.support(scale(this.search_dir, -1))
        const a_origin2 = coll2.support(this.search_dir)
        this.a = diff(a_origin2, a_origin1)
        
        this.originsMap.set(this.a, [a_origin1, a_origin2])
        if(dot(this.a, this.search_dir) < 0 ) return false
        
        this.simp_dim ++
        if(this.simp_dim === 3){
            update_simplex3.apply(this)
        }
        else if(update_simplex4.apply(this)){
            
            return EPA(this.a, this.b, this.c, this.d, this.originsMap, body1, body2)

        }
    }
}

const baricentric = (face, point) =>{
    let a11 = face[0][0]
    let a12 = face[1][0]
    let a13 = face[2][0]
    let b1 = point[0]
    let a21 = face[0][1]
    let a22 = face[1][1]
    let a23 = face[2][1]
    let b2 = point[1]
    let a31 = face[0][2]
    let a32 = face[1][2]
    let a33 = face[2][2]
    let b3 = point[2]

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

   return [d1/d , d2/d, d3/d ]
}
const originToFaceProj = face =>{
    const normal = face[3]
    const point = face[0]
    const c = - normal[0] * point[0] - normal[1] * point[1] - normal[2] * point[2]
    const t = - c / (normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2])
    return [t * normal[0], t * normal[1], t * normal[2]]
}


const TOLERANCE = 0.001
const MAX_NUM_FACES = 64
const MAX_NUM_LOOSE_EDGES = 32
const EPA_MAX_NUM_ITER = 64
const EPA = (a, b, c, d, originsMap, body1, body2) =>{
  
    const coll1 = body1.collider
    const coll2 = body2.collider
    const faces = []
    for(let i = 0; i< 4; i++){
        faces[i] = []
    }

    faces[0][0] = a
    faces[0][1] = b
    faces[0][2] = c
    faces[0][3] = normalize(cross(diff(b, a),diff(c, a)))
    faces[1][0] = a
    faces[1][1] = c
    faces[1][2] = d
    faces[1][3] = normalize(cross(diff(c, a),diff(d, a)))
    faces[2][0] = a
    faces[2][1] = d
    faces[2][2] = b
    faces[2][3] = normalize(cross(diff(d, a),diff(b, a)))
    faces[3][0] = b
    faces[3][1] = d
    faces[3][2] = c
    faces[3][3] = normalize(cross(diff(d, b), diff(c, b)))
    
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
        
        const p_origin1 = coll1.support(scale(search_dir, -1))
        const p_origin2 = coll2.support(search_dir)
        p = diff(p_origin2, p_origin1)
        originsMap.set(p, [ p_origin1, p_origin2])

        if(dot(p,search_dir) - min_dist < 0.00001){
            const face = faces[closest_face]

            const point = originToFaceProj(face)
            
            
            const [Aa, Ba] = originsMap.get(face[0])
            //const Aa = face[0].oa
            //const Ba = face[0].ob
            const [Ab, Bb] = originsMap.get(face[1])
            //const Ab = face[1].oa
            //const Bb = face[1].ob
            const [Ac, Bc] = originsMap.get(face[2])
            //const Ac = face[2].oa
            //const Bc = face[2].ob
            
            const result = baricentric(face,point)
            
            if(isNaN(result[0] + result[1] + result[2] )){
                console.log('no conv')
                return false}
            
            let PA = sum(sum(scale(Aa, result[0]), scale(Ab, result[1])), scale(Ac, result[2]))
            //Aa.multiply(result[0]).add(Ab.multiply(result[1])).add(Ac.multiply(result[2]))
            let PB = sum(sum(scale(Ba, result[0]), scale(Bb, result[1])), scale(Bc, result[2]))
            //Ba.multiply(result[0]).add(Bb.multiply(result[1])).add(Bc.multiply(result[2]))
            
            //const ra = PA.substract(coll1.pos)
    
            const rb = diff(PB, coll2.pos)
            const ra = diff(PA, coll1.pos)
            const raLocal = m3.transformPoint(coll1.RmatrixInverse, ra)
            const rbLocal = m3.transformPoint(coll2.RmatrixInverse, rb)
            const n = normalize(scale(face[3], -dot(p,search_dir)))
            if(norm(n) < 0.01)
                return false
            const penDepth = -dot(diff(PB, PA), n)
            
            const contact = new Contact(PA, PB, ra, rb, n, penDepth, body1, body2)
            contact.raLocal = raLocal
            contact.rbLocal = rbLocal
            
            return contact
            
        }

        const loose_edges = []
        let num_loose_edges = 0
        for(let i = 0; i < num_faces;++i){
   
            if(dot(faces[i][3],diff(p, faces[i][0])) > 0){
                
                for(let j = 0; j < 3; j++){
                    let current_edge = [faces[i][j], faces[i][(j + 1) % 3]]
                    let found_edge = false
                    for(let k = 0; k < num_loose_edges; k++){
                        if(loose_edges[k][1] === current_edge[0] && loose_edges[k][0] === current_edge[1]){
                            
                            loose_edges[k][0] = loose_edges[num_loose_edges - 1][0]
                            loose_edges[k][1] = loose_edges[num_loose_edges - 1][1]
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
        for(let i = 0; i < num_loose_edges; i++){
            if(num_faces >= MAX_NUM_FACES) break;
            faces[num_faces]=[]
            faces[num_faces][0] = loose_edges[i][0]
            faces[num_faces][1] = loose_edges[i][1]
            faces[num_faces][2] = p
            
            faces[num_faces][3] = normalize( cross( diff(loose_edges[i][0], loose_edges[i][1]), diff(loose_edges[i][0], p)))
            
            if(dot(faces[num_faces][0], faces[num_faces][3]) + 0.01 < 0){
                 temp = faces[num_faces][0]
                faces[num_faces][0] = faces[num_faces][1]
                faces[num_faces][1] = temp
                faces[num_faces][3] = scale(faces[num_faces][3], -1)
                
            }
            num_faces++
        }
        
    }
    console.log('no conv')
    return false

}
module.exports = {gjk}