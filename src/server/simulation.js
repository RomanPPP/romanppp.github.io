
const {Tree, Node} = require('./tree')
const {Vector} = require('./vectors')
const {getCollisionResolution} = require('./constraints')
const {gjk} = require('./collider')


class Simulation{
    constructor(){
        this.objects = []
        this.bvh = new Tree()
       
    }
    

    addObject(object){   
            
            const aabb = object.getExpandedAABB()
           
            
            const leaf = this.bvh.insertLeaf(aabb,object)
            object.BVlink = leaf
            
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
    getCollisionsPairs(){
        const collisionsPairs = []
        for(let i = 0, n = this.objects.length; i < n; i++){
            const object = this.objects[i]
        
            const cols = this.bvh.getCollisions(object.BVlink)
            object.BVlink.isChecked = true
            
            for(let j = 0, n = cols.length; j < n; j++){
                collisionsPairs.push([object, cols[j]])
            }
        }
        this.bvh.setUnchecked()
        return collisionsPairs
    }
    tick(deltaTime){
        const collisionsPairs = this.getCollisionsPairs()
        const contacts = []
        for(let i = 0, n = collisionsPairs.length; i < n; i++){
            const o1 = collisionsPairs[i][0]
            const o2 = collisionsPairs[i][1]
            const result = gjk(o1.collider, o2.collider)
            if(result) contacts.push([o1,o2, result])
        }
        for(let i = 0, n = contacts.length; i < n; i++){
            const contact = contacts[i]
            const delta = getCollisionResolution(contact[0], contact[1], contact[2],deltaTime)
            /*if(contact[0].mass > contact[1].mass) contact[1].translate(...contact[2].n.toArray())
            else contact[0].translate(...contact[2].n.multiply(-1).toArray())*/
            if(!contact[0].static)contact[0].addVelocity(delta[0])
            //contact[0].addAngularV(delta[1].multiply(0.2))
            if(!contact[1].static)contact[1].addVelocity(delta[2])
            //contact[1].addAngularV(delta[3].multiply(0.2))
        }
        for(let i = 0, n = this.objects.length;i < n; i++){
            this.objects[i].update(deltaTime)
        }
    }
}

module.exports = {Simulation}