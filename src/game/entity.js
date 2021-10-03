
const {Node, TRS } = require('../node')
const {Physics} = require('../server/physics')
const {Box} = require('../server/collider')
const {makeRenderNode} = require('../render/model')
const {cube} = require('../render/basemodel')
const m4 = require('../m4')
const PartsMap = {
    box : function(x,y,z){
        return new Physics(new Box(x,y,z))
    }
}
const modelMap = {
    box : function(){
        return makeRenderNode(cube)
    }
}

class EntityNode extends Node{
    constructor(localMatrix, name, source, physics, renderNode){
        super(localMatrix, name, source)
        this.physics = physics
        this.renderNode = renderNode
        this.objectsToDraw = []
    }
    updateWorldMatrix(parentWorldMatrix){
        if(!parentWorldMatrix){
            this.worldMatrix = this.physics.collider.getM4()
            this.renderNode.updateWorldMatrix(this.worldMatrix)
            this.children.forEach(child => child.updateWorldMatrix(this.worldMatrix))
            return
        }
        let matrix = this.source.getMatrix()
        matrix = m4.multiply(parentWorldMatrix, matrix);
        this.worldMatrix = m4.multiply(matrix, this.localMatrix)
        this.physics.collider.pos.x = this.worldMatrix[12]
        this.physics.collider.pos.x = this.worldMatrix[13]
        this.physics.collider.pos.x = this.worldMatrix[14]
        this.physics.collider.setRmatrix(m4.m4Tom3(this.worldMatrix))
        this.renderNode.updateWorldMatrix(this.worldMatrix)
        this.children.forEach((child) => {
            child.updateWorldMatrix([...matrix]);
        })
    }
    updateObjectsToDraw(){
        this.traversal(node =>{
            
            if(node.renderNode){
                node.renderNode.traversal(_node =>this.objectsToDraw.push(_node))
                
            }
        })
    }
}
const makeEntity = (desc) =>{
    const source = new TRS()
    let matrix = m4.xRotation(desc.rotation[0])
    matrix = m4.yRotate(matrix,desc.rotation[1])
    matrix = m4.zRotate(matrix,desc.rotation[2])
    matrix = m4.translate(matrix,...desc.translation)
    const physics = PartsMap[desc.physics.name](...desc.physics.props)
    const model = modelMap[desc.model.name](...desc.model.props)
    const node = new EntityNode(matrix, desc.name, source, physics, model)
    
    if(desc.children){
        desc.children.forEach(childDesc =>{
            const child = makeEntity(childDesc)
            child.setParent(node)
        })
    }
    return node
}
module.exports = { EntityNode, makeEntity}
