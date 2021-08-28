const Tree = require('../server/tree')
const {Vector,  Matrix3} = require('../server/vectors')
const {Node, TRS } = require('../node')
const {Physics} = require('../server/physics')
const {Box} = require('../server/collider')
const m4 = require('../m4')
const PartsMap = {
    box : function(){
        return new Physics(new Box(x,y,z))
    }
}

const getTranslation = (m) =>{
    return(new Vector(m[12], m[13], m[14]))
}
const getR3matrix = (m)=>{
    return new Matrix3(m[0], m[1], m[2], m[4], m[5],m[6], m[8], m[9], m[10])
}
const m3tom4 = m =>{
    const arr = m.arr
    return [arr[0, arr[1], arr[2], 0, arr[3], arr[4], arr[5], 0, arr[6], arr[7], arr[8], 0, 0, 0, 0, 1]]
}
class EntityNode extends Node{
    constructor(...args, physics, renderNode){
        super(...args)
        this.physics = physics
        this.renderNode = renderNode
        this.renderParts = []
    }
    updateRenderParts(){
        this.renderNode.updatePartsList()
        this.renderParts = this.renderNode.parts
    }
    updateColliders(){
        let rootMatrix = m4.translation(this.physics.collider.translation)
        const Rm3 = this.physics.collider.Rmatrix
        rootMatrix = m4.multiply(rootMatrix, m3tom4(Rm3))
        this.updateWorldMatrix(rootMatrix)
        this.parts.forEach(part =>{
            const wm4 = part.node.worldMatrix
            const translation = getTranslation(wm4)
            part.physics.translate(translation)
            const Rmatrix = getR3matrix(wm4)
            part.physics.collider.setRmatrix(Rmatrix)
            part.physics.emit('rotation')
        })
    }
    updateRenders(){
        this.parts.forEach(part =>{
            part.renderNode.updateWorldMatrix(part.node.worldMatrix)
        })
    }
}
const makeEntity = (desc) =>{
    const source = new TRS()
    let matrix = m4.xRotation(desc.rotation[0])
    matrix = m4.yRotate(matrix,desc.rotation[1])
    matrix = m4.zRotate(matrix,desc.rotation[2])
    matrix = m4.translate(matrix,...desc.translation)
    const physics = PartsMap[desc.physics.name](desc.physics.props)
    const node = new EntityNode(matrix, desc.name, source, physics, desc.renderNode)
    if(desc.children){
        desc.children.forEach(childDesc =>{
            const child = makeNode(childDesc)
            child.setParent(node)
        })
    }
    return node
}
module.exports = { EntityNode, makeEntity}
