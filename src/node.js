
const m4 = require('./m4')
class TRS{
    constructor(){
        this.translation = [0,0,0]
        this.rotation = [0, 0, 0]
        this.scale = [1, 1, 1]
    }
    
    getMatrix(m) {
        let dst = m || m4.identity();
        var t = this.translation;
        var r = this.rotation;
        var s = this.scale;
        dst = m4.translate(dst,t[0], t[1], t[2]);
        dst = m4.xRotate(dst, r[0]);
        dst = m4.yRotate(dst, r[1]);
        dst = m4.zRotate(dst, r[2]);
        dst = m4.scale(dst, s[0], s[1], s[2]);
        return dst;
      };
    getRMatrix(){
        let dst = m4.identity();
        var r = this.rotation;
        dst = m4.xRotate(dst, r[0]);
        dst = m4.yRotate(dst, r[1]);
        dst = m4.zRotate(dst, r[2]);
        return dst
    }
}
class Node{
    constructor(localMatrix, name, source = new TRS()){
        this.localMatrix = localMatrix
        this.worldMatrix = m4.identity()
        this.parent = null
        this.children = []
        this.source = source
        this.name = name
        this.parts = []
    }
    setParent(parent){
        if (this.parent) {
            var ndx = this.parent.children.indexOf(this);
            if (ndx >= 0) {
              this.parent.children.splice(ndx, 1);
            }
          }
          if (parent) {
            parent.children.push(this);
          }
          this.parent = parent;
    }
    updateWorldMatrix(parentWorldMatrix){
        var source = this.source;
        let matrix = source.getMatrix()
        if (parentWorldMatrix) {
          matrix = m4.multiply(parentWorldMatrix, matrix);
        }
        this.worldMatrix = m4.multiply(matrix, this.localMatrix)
        this.children.forEach((child) => {
          child.updateWorldMatrix([...matrix]);
        })
    }
    updatePartsList(){
        const iter = (node,arr) => {
            arr.push(node)
            node.children.forEach(child => iter(child,arr))
        }
        iter(this, this.parts)
    }
    traversal(func){
      func(this)
      this.children.forEach(child => child.traversal(func))
    }
    
    
}


module.exports = {Node, TRS}