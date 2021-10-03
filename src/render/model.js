

const {Node, TRS} =  require('../node')
const sprites = require('./sprites')

const m4 = require('../m4')



class RenderNode extends Node{
    constructor(localMatrix, name, source,spriteName){
        super(localMatrix, name, source)
        
        this.sprite = new sprites[spriteName]()
        
        this.objectsToDraw = []
    }
    updateObjectsToDraw(){
        this.updatePartsList()
        this.objectsToDraw = this.parts.filter(part => part.sprite)
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
    const node = new RenderNode(matrix,desc.name,source, desc.spriteName)
    
    if(desc.children){
        desc.children.forEach(childDesc =>{
            const child = makeRenderNode(childDesc)
            child.setParent(node)
        })
    }
    return node
}
module.exports = {RenderNode, makeRenderNode}
