
const box = {
    translation : [0,0,0],
    rotation :  [0,0,0],
    scale : [1,1,1],
    physics : {
        name : 'box',
        props : [1,1,1]
    },
    model : {
        name : 'box',
        props : []
    },
    
}
const player = {
    translation : [0,0,0],
    rotation :  [0,0,0],
    scale : [1,1,1],
    physics : {
        name : 'player',
        props : [1,1,1]
    },
    model : {
        name : 'box',
        props : []
    },
    
}

module.exports = {box, player}