const {Box} = require('./sprites')

const man = {
        name : 'bone1',
        sTranslation : [0,0,0],
        translation : [0,1,0],
        rotation : [0,0,0],
        scale : [1,2,1],
        sprite : Box([1,1,1]),
        children : [
                {
                        name : 'bone2',
                        sTranslation : [0,2,0],
                        rotation : [0,0,Math.PI/2],
                        translation : [1.5,0,0],
                        scale : [3,1,1],
                        sprite : Box([1,1,1]),
                }
        ]
}


module.exports = {man}