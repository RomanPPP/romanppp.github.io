
const {Tree} = require('./tree')

const {solveCollision, solveContactPositionErr, warmStart, solvePosition} = require('./constraints')
const {gjk} = require('./gjk')

const {Manifold} = require('./manifold')
const prec = 0.3
const pairHash = (x,y) => x === Math.max(x, y) ? x * x + x + y : y * y + x





class Simulation {
    constructor(){
        this.objects = []
        this.bvh = new Tree()
        this.collisions = []
        this.constrains = []
        this.collisionManifolds = new Map()
        this.lastId = 0
    }
    addObject(object){   
            
            const aabb = object.getExpandedAABB()
           
            
            const leaf = this.bvh.insertLeaf(aabb,object)
            object.BVlink = leaf
            object.id = this.lastId
            this.lastId++
            object.on('update',()=>this.updateObjectAABB.call(this,object))
            
            this.objects.push(object)

    }
    
    
    updateObjectAABB(object){
        
        
       
        const newAABB = object.getAABB()
        
       
           this.bvh.removeLeaf(object.BVlink)
           const leaf = this.bvh.insertLeaf(newAABB,object)
           object.BVlink = leaf
        
    }
    removeObject(object){
        this.bvh.removeLeaf(object.BVlink)
        this.objects = this.objects.filter(el => el === object)
    }
    updateCollisions(){
        const manifolds = this.collisionManifolds.values()
        /*for(let manifold of manifolds){
            
            
            
            if(contacts.length < 4 ) manifold.warm = 0
            if(contacts.length ===  4 && manifold.warm < 20)manifold.warm ++
            
            

        }*/
        for(let i = 0, n = this.objects.length; i < n; i++){
            const object = this.objects[i]
            if(object.static) continue
            const cols = this.bvh.getCollisions(object.BVlink)
            object.BVlink.isChecked = true
            if(cols.length !=0) 
            for(let j = 0, n = cols.length; j < n; j++){
                const hash = pairHash(object.id, cols[j].id)
                let manifold = this.collisionManifolds.get(hash)
                //if(manifold && manifold.contacts.length > 4) continue
                const contact = gjk(object, cols[j])
               
                if(!contact){
                   
                    if(manifold) this.collisionManifolds.delete(hash)
                    continue
                }
               
                if(!manifold){
                    
                    manifold = new Manifold(object, cols[j])
                    manifold.contacts = [contact]
                   
                   
                    this.collisionManifolds.set(hash,manifold)
                   
                }
                else manifold.addContact(contact)
                
            }
        }
        
        this.bvh.setUnchecked()
        
    }
    tick(deltaTime){
        this.updateCollisions()
        let manifolds = this.collisionManifolds.values()
        for(let manifold of manifolds)
            manifold.update()

        for(let i = 0, n = this.objects.length;i < n; i++){
            this.objects[i].integrateForces(deltaTime)
        }  
        
        
        manifolds = this.collisionManifolds.values()
            for(let manifold of manifolds){
                const contacts = manifold.contacts
                for(let i = 0, n = contacts.length; i < n; i++){
                    contacts[i].updateEq()
                }
            }
        this.constrains.forEach(constraint => constraint.updateEq())
           
        
        for(let i = 0; i < 7; i++){
            let manifolds = this.collisionManifolds.values()
            for(let manifold of manifolds){
                const contacts = manifold.contacts
                if(manifold.warm > 7){
                 //warmStart(manifold, deltaTime)
                   
                }   
                solveCollision(manifold, deltaTime)
                
            }
            this.constrains.forEach(constraint => solveConstraint(constraint, deltaTime))   
            this.constrains.forEach(constraint => solvePosition(constraint, deltaTime))
        }

        

        for(let i = 0, n = this.objects.length;i < n; i++){
            this.objects[i].integrateVelocities(deltaTime)    
        }
        for(let i = 0; i <7; i++){
            let manifolds = this.collisionManifolds.values()
            for(let manifold of manifolds){
                const contacts = manifold.contacts
                contacts.forEach(c => solveContactPositionErr(c, deltaTime, contacts.length))
                
            }
             
            
        }
       //for(let i = 0; i<4; i++)
        
        for(let i = 0, n = this.objects.length;i < n; i++){
            this.objects[i].integratePseudoVelocities(deltaTime)
            this.objects[i].updateInverseInertia()
        }  
        
    }
}

module.exports = {Simulation}