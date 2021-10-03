
const {Vector, dot, cross, normalize} =  require('./vectors')


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
function gjk(body1,body2){
    const coll1 = body1.collider
    const coll2 = body2.collider
    this.a, this.b, this.c, this.d, this.search_dir = new Vector(0,0,0), this.simp_dim = 2
    this.originsMap = new Map()
    

    
    
    let mtv = new Vector(0,0,0)
   
    search_dir = coll1.pos.substract(coll2.pos)
    const c_origin1 = coll1.support(search_dir.multiply(-1))
    const c_origin2 = coll2.support(search_dir)
    c = c_origin2.substract(c_origin1)
    c.oa = c_origin1
    c.ob = c_origin2
    this.originsMap.set(c,[c_origin1, c_origin2])
    
    search_dir = c.multiply(-1)
    
    const b_origin1 = coll1.support(search_dir.multiply(-1))
    const b_origin2 = coll2.support(search_dir)
    b = b_origin2.substract(b_origin1)
    b.oa = b_origin1
    b.ob = b_origin2
    this.originsMap.set(b, [b_origin1, b_origin2])
    
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
        this.originsMap.set(a, [a_origin1, a_origin2])
        if(dot(a,search_dir) < 0 ) return false
        
        simp_dim ++
        if(simp_dim === 3){
            update_simplex3()
        }
        else if(update_simplex4()){
            
            return EPA(a,b,c,d,body1,body2)

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

   return [d1/d , d2/d, d3/d ]
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
const EPA = (a, b, c, d, body1, body2) =>{
    const coll1 = body1.collider
    const coll2 = body2.collider
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
        const p_origin1 = coll1.support(search_dir.multiply(-1))
        const p_origin2 = coll2.support(search_dir)
        p.oa = p_origin1
        p.ob = p_origin2
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
            
            
            let PA = Aa.multiply(result[0]).add(Ab.multiply(result[1])).add(Ac.multiply(result[2]))
            let PB = Ba.multiply(result[0]).add(Bb.multiply(result[1])).add(Bc.multiply(result[2]))
            
            //const ra = PA.substract(coll1.pos)
    
            const rb = PB.substract(coll2.pos)
            const ra = PA.substract(coll1.pos)
            const n = face[3].multiply(-dot(p,search_dir))
            if(n.isNull()) return false
            return {PA, PB, n, ra, rb, accI : 0}
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
        for(let i = 0; i < num_loose_edges; i++){
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
            
            
            let PA = Aa.multiply(result[0]).add(Ab.multiply(result[1])).add(Ac.multiply(result[2]))
            let PB = Ba.multiply(result[0]).add(Bb.multiply(result[1])).add(Bc.multiply(result[2]))
            
            //const ra = PA.substract(coll1.pos)
            console.log(face)
            const rb = PB.substract(coll2.pos)
            const ra = PA.substract(coll1.pos)
            const n = face[3].multiply(-dot(p,search_dir))
            
            return false

}
module.exports = {gjk}