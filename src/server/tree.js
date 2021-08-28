const util = require('util')


const {Vector} = require('./vectors')
const getBoundAabb = (aabb1, aabb2)=>{
    if(!aabb1 || !aabb2){
        return 0
    }
    const x1 = aabb1[0].x < aabb2[0].x ? aabb1[0].x : aabb2[0].x
    const x2 = aabb1[1].x > aabb2[1].x ? aabb1[1].x : aabb2[1].x
    const y1 = aabb1[0].y < aabb2[0].y ? aabb1[0].y : aabb2[0].y
    const y2 = aabb1[1].y > aabb2[1].y ? aabb1[1].y : aabb2[1].y
    const z1 = aabb1[0].z < aabb2[0].z ? aabb1[0].z : aabb2[0].z
    const z2 = aabb1[1].z > aabb2[1].z ? aabb1[1].z : aabb2[1].z
    return [new Vector(x1 , y1,z1), new Vector(x2, y2, z2)]
}
const isCollide = (aabb1,aabb2) => {
      
    if(aabb1[0].x <= aabb2[1].x && aabb1[1].x >= aabb2[0].x && aabb1[0].y <= aabb2[1].y && aabb1[1].y >= aabb2[0].y && aabb1[0].z <= aabb2[1].z && aabb1[1].z >= aabb2[0].z){
        return true
    }
    return false
}
const getSize = (aabb) => {
    const area = Math.abs(aabb[1].x - aabb[0].x) + Math.abs(aabb[1].y - aabb[0].y) + Math.abs(aabb[1].z - aabb[0].z)
    return area > 0 ? area : - area
}
class Node{
    constructor(aabb,isLeaf,gameObject){
        this.aabb = aabb
        this.isLeaf = isLeaf
        this.parent = null
        
        this.gameObject = gameObject
        this.isChecked = false
    }
}
class Tree{
    constructor(){
        
        this.root = null
        this.leafs = {}
        this.unusedIndexes = []
        
    }
    setUnchecked(){
        const stack = [this.root]
        
        while(stack.length != 0){
            const node = stack.pop()
            if(node.isLeaf) {
                node.isChecked = false
                continue
            }
            if(node.child1) stack.push(node.child1)
            if(node.child2) stack.push(node.child2)

        }
    }
    getBestSibling(leaf){
        let potential = this.root
        while(!potential.isLeaf){
            const size = getSize(potential.aabb)
            const combinedAABB = getBoundAabb(potential.aabb, leaf.aabb)
            const combinedSize = getSize(combinedAABB)
            let cost = combinedSize
            let inherCost = combinedSize - size

            let cost1
            if( potential.child1.isLeaf){
                cost1 = getSize(potential.child1.aabb) + inherCost
            }
            else{
                cost1 = getSize(getBoundAabb(leaf.aabb, potential.child1.aabb)) - getSize(potential.child1.aabb) + inherCost
            }

            let cost2
            if(potential.child2.isLeaf){
                cost2 = getSize(potential.child2.aabb) + inherCost
            }
            else{
                cost2 = getSize(getBoundAabb(leaf.aabb, potential.child2.aabb)) - getSize(potential.child2.aabb) + inherCost
            }
            if(cost < cost1 && cost <  cost2) return potential
            if(cost1 < cost2){
                potential = potential.child1
            }
            else potential = potential.child2
        }
        return potential
    }
    insertLeaf(aabb,gameObject){
        
        const leaf = new Node(aabb,true,gameObject)
        if(this.root === null){
            this.root = leaf
            this.root.parent = null
            return leaf
        }
        
        const sibling = this.getBestSibling(leaf)
        const oldParent = sibling.parent
        const newParent = new Node(leaf.aabb,false)
        newParent.parent = oldParent
        
        newParent.aabb = getBoundAabb(leaf.aabb, sibling.aabb)
        
        if(oldParent){
            if(oldParent.child1 === sibling) oldParent.child1 = newParent
            else oldParent.child2 = newParent

            newParent.child1 = sibling
            newParent.child2 = leaf

            sibling.parent = newParent
            leaf.parent = newParent
        }
        else{
            newParent.child1 = sibling
            newParent.child2 = leaf

            sibling.parent = newParent
            leaf.parent = newParent
            this.root = newParent
        }
        let index = leaf.parent
        
        while(index){
            index = this.rebalance(index)
            index = index.parent
        }
        return leaf
    }
    getCollisions(leaf){
        
        const cols = []
        const iter = _node =>{
            if(!_node){
                return
            }
            if(_node === leaf){
                return
            }
            if(isCollide(leaf.aabb,_node.aabb)){  
                if(_node.isLeaf && !_node.isChecked){
                    cols.push(_node.gameObject)
                }
                iter(_node.child1)
                iter(_node.child2)
            }
        }
        
            iter(this.root)
        
        return cols
    }
    removeLeaf(leaf){
        
        if(leaf === this.root){
            this.root = null
            return
        }
        const parent = leaf.parent
        const grandParent = parent ? parent.parent : null 
        let sibling
        if(parent.child1 === leaf) sibling = parent.child2
        else sibling = parent.child1

        if(grandParent){
            if(grandParent.child1 === parent) grandParent.child1 = sibling
            else grandParent.child2 = sibling

            sibling.parent = grandParent

            let index = grandParent
            while(index){
                index = this.rebalance(index)

                index = index.parent
            }
        }
        else {
            this.root = sibling
            sibling.parent = null
        }
    }
    rebalance(leaf){
        if(!leaf){
            return null
        }
        if(leaf.isLeaf || this.getHeight(leaf) < 2){
            leaf.aabb = getBoundAabb(leaf.child1.aabb, leaf.child2.aabb)
            return leaf
        }
        const child1 = leaf.child1
        const child2 = leaf.child2
        const balance = this.getHeight(child2) - this.getHeight(child1)
        
        if(balance > 1){
            const child2Child1 = child2.child1
            const child2Child2 = child2.child2

            child2.child1 = leaf
            child2.parent = leaf.parent
            leaf.parent = child2
            if(child2.parent != null){
                if(child2.parent.child1 === leaf){
                    child2.parent.child1 = child2
                }
                else{
                    child2.parent.child2 = child2
                }
            }
            else this.root = child2
            if(this.getHeight(child2Child1) > this.getHeight(child2Child2)){
                child2.child2 = child2Child1
                leaf.child2 = child2Child2
                child2Child2.parent = leaf
                
            }
            else{
                
                leaf.child2 = child2Child1
                child2Child1.parent = leaf
            }
            leaf.aabb = getBoundAabb(leaf.child1.aabb, leaf.child2.aabb)
            child2.aabb = getBoundAabb(child2.child1.aabb, child2.child2.aabb)
           
            return child2
            
        }
        if(balance < -1){
            const child1Child1 = child1.child1
            const child1Child2 = child1.child2
            
            child1.child1 = leaf
            child1.parent = leaf.parent
            leaf.parent = child1

            if(child1.parent != null){
                if(child1.parent.child1 === leaf){
                    child1.parent.child1 = child1
                }
                else{
                    child1.parent.child2 = child1
                }
            }
            else this.root = child1
            if(this.getHeight(child1Child1) > this.getHeight(child1Child2)){
                child1.child2 = child1Child1
                leaf.child1 = child1Child2
                child1Child2.parent = leaf
                
            }
            else{
                child1.child2 = child1Child2
                leaf.child1 = child1Child1
                child1Child1.parent = leaf
            }
            leaf.aabb = getBoundAabb(leaf.child1.aabb, leaf.child2.aabb)
            child1.aabb = getBoundAabb(child1.child1.aabb, child1.child2.aabb)
            
            return child1
        }
       leaf.aabb = getBoundAabb(leaf.child1.aabb, leaf.child2.aabb)
       return leaf
    }
    toArray(i){
        const iter = (leaf, level)  =>{
            if(!leaf){
                return null
                
            }
            if(leaf.isLeaf) return leaf.objectLink.name
            else return [iter(leaf.child1), iter(leaf.child2)]
        }
        if(!i) i = this.root
        return iter(i)
    }
    getHeight(leaf){
        
        const iter = (leaf, level)  =>{
            if(!leaf){
                return level
                
            }
            
            let h1 = iter(leaf.child1, level + 1)
            let h2 = iter(leaf.child2, level + 1)
            return h1 > h2 ? h1 : h2
        }
        return iter(leaf,1)
    }
    
}
module.exports = {Tree, Node}