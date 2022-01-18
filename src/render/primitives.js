const {expandedTypedArray} = require( './programm.js')



const CUBE_FACE_INDICES = [
    [3, 7, 5, 1], // right
    [6, 2, 0, 4], // left
    [6, 7, 3, 2], // ??
    [0, 1, 5, 4], // ??
    [7, 6, 4, 5], // front
    [2, 3, 1, 0], // back
  ];


function createBoxGeometry(_a = 1, _b = 1, _c = 1){
    const a = _a/2, b = _b/2, c = _c/2
    const cornerVertices = [
        [-a, -b, -c],
        [+a, -b, -c],
        [-a, +b, -c],
        [+a, +b, -c],
        [-a, -b, +c],
        [+a, -b, +c],
        [-a, +b, +c],
        [+a, +b, +c],
      ];
  
      const faceNormals = [
        [+1, +0, +0],
        [-1, +0, +0],
        [+0, +1, +0],
        [+0, -1, +0],
        [+0, +0, +1],
        [+0, +0, -1],
      ];
  
      const uvCoords = [
        [1, 0],
        [0, 0],
        [0, 1],
        [1, 1],
      ];
      const numVertices = 6 * 4
      const positions = expandedTypedArray(new Float32Array(numVertices * 3))
      const normals   = expandedTypedArray(new Float32Array(numVertices * 3))
      //const texCoords = webglUtils.createAugmentedTypedArray(2 , numVertices);
      const indices   = expandedTypedArray(new Uint16Array(6 * 2 * 3))
  
      for (let f = 0; f < 6; ++f) {
        const faceIndices = CUBE_FACE_INDICES[f];
        for (let v = 0; v < 4; ++v) {
          const position = cornerVertices[faceIndices[v]];
          const normal = faceNormals[f];
          positions.push(position)
          normals.push(normal)
          
          
  
        }
        
        const offset = 4 * f;
        indices.push(offset + 0, offset + 1, offset + 2);
        indices.push(offset + 0, offset + 2, offset + 3);
      }
  
      return {
        position: positions,
        normal: normals,
        
        indices: indices,
      };
}




 function createGeometry(arrays){
  const v = arrays.v
  const vt = arrays.vt
  const vn = arrays.vn
  const f = arrays.f
  const numFaces = f.length
  const facesSize = f[0].length
  const numVertices = numFaces * facesSize
  const positions = expandedTypedArray(new Float32Array(numVertices * 3))
  const normals   = expandedTypedArray(new Float32Array(numVertices * 3))
  const indices   = expandedTypedArray(new Uint16Array(numFaces * 2 * 3))
  for (let i = 0; i < numFaces; ++i) {
    const faceIndices = f[i];
    for (let j = 0; j < facesSize; ++j) {
      const position = v[faceIndices[j] - 1];
      const normal = vn[i];
    
      positions.push(position)
      //normals.push(normal)
      
      //texCoords.push(uv);

    }
    
    const offset = 4 * i;
    indices.push(offset + 0, offset + 1, offset + 2);
    indices.push(offset + 0, offset + 2, offset + 3);
  } 
  return {position : positions, normal : normals, indices}
}

const linedBoxIndices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, // front
  0, 5, 5, 4, 4, 1, 1, 0, //bottom
  0, 4, 4, 7, 7, 3, 3, 0, //left
  1, 2, 2, 6, 6, 5, 5, 1, //right
  4, 5, 5, 6, 6, 7, 7, 4, // back
  2, 7, 7, 3, 3, 6, 6, 2 // top 
])
const LinedBoxGeometry = (a = 1, b = 1, c = 1) =>{
  const geometry = createBoxGeometry(a, b, c)
  geometry.indices = linedBoxIndices
  return geometry
}


module.exports = {createBoxGeometry , LinedBoxGeometry,  createGeometry, linedBoxIndices}