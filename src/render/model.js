

const {Node, TRS} =  require('../node')
const sprites = require('./sprites')
const m4 = require('../m4')


const getObjectsToDraw = (node, objects) =>{
    if(node.sprite)objects.push(node.sprite)
    node.children.forEach(child => getObjectsToDraw(child, objects))
}
class RenderNode extends Node{
    constructor(localMatrix, name, source,sprite){
        super(localMatrix, name, source)
        this.sprite = sprite
    }
    getObjectsToDraw(){
        return this.parts
    }
}
const makeRenderNode = (desc)=>{
    const source = new TRS()
   
    source.translation = desc.sTranslation
    
    
    
    matrix = m4.xRotation( desc.rotation[0])
    matrix = m4.yRotate(matrix,desc.rotation[1])
    matrix = m4.zRotate(matrix,desc.rotation[2])
    matrix = m4.translate(matrix, ...desc.translation)
    matrix = m4.scale(matrix, ...desc.scale)
    const node = new RenderNode(matrix,desc.name,source, desc.sprite)
    
    if(desc.children){
        desc.children.forEach(childDesc =>{
            const child = makeRenderNode(childDesc)
            child.setParent(node)
        })
    }
    return node
}
module.exports = {RenderNode, makeRenderNode}
