
const {Tree} = require('./tree')

const {getCollisionResolution, warmStart} = require('./constraints')
const {gjk} = require('./gjk')
const { distanceFromLine, findLargestFace} = require('./vectors')

const prec = 0.01
const pairHash = (x,y) => x === Math.max(x, y) ? x * x + x + y : y * y + x





class Simulation {
    constructor(){
        this.objects = []
        this.bvh = new Tree()
        this.collisions = []
        this.collisionManifolds = new Map()
        this.lastId = 0
    }
    addObject(object){   
            
            const aabb = object.getExpandedAABB()
           
            
            const leaf = this.bvh.insertLeaf(aabb,object)
            object.BVlink = leaf
            object.id = this.lastId
            this.lastId++
            object.on('translation',()=>this.updateObjectAABB.call(this,object))
            object.on('rotate',()=>this.updateObjectAABB.call(this,object))
            this.objects.push(object)

    }
    
    
    updateObjectAABB(object){
        
        const oldAABB = object.BVlink.aabb
      
        const newAABB = object.getAABB()
        
        if(newAABB[0].x < oldAABB[0].x || newAABB[1].x > oldAABB[1].x ||
             newAABB[0].y < oldAABB[0].y || newAABB[1].y> oldAABB[1].y ||
             newAABB[0].z < oldAABB[0].z || newAABB[1].z > oldAABB[1].z)
        {
           this.bvh.removeLeaf(object.BVlink)
           const leaf = this.bvh.insertLeaf(newAABB,object)
           object.BVlink = leaf
        }
    }
    removeObject(object){
        this.bvh.removeLeaf(object.BVlink)
        this.objects = this.objects.filter(el => el === object)
    }
    updateCollisions(){
        const manifolds = this.collisionManifolds.values()
        for(let manifold of manifolds){
            
            let i, j , n
            const contacts = manifold.contacts
            const pos1 = manifold.body1.collider.pos
            const pos2 = manifold.body2.collider.pos
            for(i = 0, j = 0, n = contacts.length; i < n; i++){
                const contact = contacts[i]
                const newPA = pos1.add(contact.ra)
                const newPB = pos2.add(contact.rb)
                const raBias = contact.PA.substract(newPA)
                const rbBias = contact.PB.substract(newPB)
                if(raBias.norm() < prec + manifold.warm * 0.001  && rbBias.norm() <  prec +manifold.warm * 0.001){
                    contacts[j] = contacts[i]
                   j++
                }
                
            }
            
            while(j < contacts.length){
                contacts.pop()
            }
            
            if(contacts.length < 4&& manifold.warm  > 1) manifold.warm--
            if(contacts.length === 4 && manifold.warm < 5)manifold.warm ++
            if(contacts.length > 4){
                let deepest = null
                let maxDeep = 0
                for(i = 0, n = contacts.length; i < n; i++){
                    if(contacts[i].n.normSq() >= maxDeep){
                        maxDeep = contacts[i].n.normSq()
                        deepest = contacts[i]
                    }
                }
                let furthest = null
                let maxDistance = 0
                for(i = 0, n = contacts.length; i < n; i++){
                    let dist = contacts[i].PA.substract(deepest.PA).normSq()
                    if(dist >= maxDistance){
                        maxDistance = dist
                        furthest = contacts[i]
                    }
                }
                let furthest2 = null
                maxDistance = 0
                for(i = 0, n = contacts.length; i < n; i++){
                    let dist = distanceFromLine(furthest.PA, deepest.PA, contacts[i].PA)
                    
                    if(dist >= maxDistance){
                        maxDistance = dist
                        furthest2 = contacts[i]
                    }
                }
                
                let furthest3 = null
                maxDistance = 0
               
                const oppositeTodiagonal = findLargestFace(deepest.PA,furthest.PA,furthest2.PA)
                
                for(i = 0, n = contacts.length; i < n; i++){
                    let dist = oppositeTodiagonal.substract(contacts[i].PA).normSq()
                    
                    if(dist >= maxDistance){
                        maxDistance = dist
                        furthest3 = contacts[i]
                    }
                }
               

                contacts[0] = deepest
                contacts[1] = furthest
                contacts[2] = furthest2
                contacts[3] = furthest3
                while(contacts.length > 4) contacts.pop()
                
            }
            

        }
        for(let i = 0, n = this.objects.length; i < n; i++){
            const object = this.objects[i]
            if(object.static) continue
            const cols = this.bvh.getCollisions(object.BVlink)
            object.BVlink.isChecked = true
            
            for(let j = 0, n = cols.length; j < n; j++){
                const hash = pairHash(object.id, cols[j].id)
                let manifold = this.collisionManifolds.get(hash)
                if(manifold && manifold.contacts.length > 4) continue
                const contact = gjk(object, cols[j])
                if(!contact) continue
                
                
                if(!manifold){
                    manifold = { contacts : [], body1 : object, body2 : cols[j], warm : 0}
                    this.collisionManifolds.set(hash,manifold)
                }
                let isFarEnough = true
                const contacts = manifold.contacts
                for(let i = 0, n = contacts.length; i < n; i++){
                    const biasPA = contacts[i].PA.substract(contact.PA)
                    const biasPB = contacts[i].PB.substract(contact.PB)
                    if(biasPA.norm() < prec || biasPB.norm() < prec) isFarEnough = false 
                }
                if(isFarEnough) contacts.push(contact)   
            }
        }
        
        this.bvh.setUnchecked()
        
    }
    tick(deltaTime){
        
        for(let i = 0, n = this.objects.length;i < n; i++){
            this.objects[i].update(deltaTime)
        }   
        this.updateCollisions()
        
        this.cols = []
        let manifolds = this.collisionManifolds.values()
        
        
        
       
            for(let manifold of manifolds){
                const contacts = manifold.contacts
                
                /*if(contacts.length > 0){
                    const deepest = contacts[0]
                    manifold.body1.translate(...deepest.n.multiply(-1/manifold.body1.mass).toArray())
                    manifold.body2.translate(...deepest.n.multiply(1/manifold.body2.mass).toArray())
                }   */


                if(manifold.warm > 1){
                    warmStart(manifold, deltaTime)
                   
                }   
                getCollisionResolution(manifold, deltaTime) 
                
                
                
            
        }
        
    }
}

module.exports = {Simulation}