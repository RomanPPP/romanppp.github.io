
function getGLTypeForTypedArray(gl, typedArray) {
    if (typedArray instanceof Int8Array)    { return gl.BYTE; }            // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return gl.UNSIGNED_BYTE; }   // eslint-disable-line
    if (typedArray instanceof Int16Array)   { return gl.SHORT; }           // eslint-disable-line
    if (typedArray instanceof Uint16Array)  { return gl.UNSIGNED_SHORT; }  // eslint-disable-line
    if (typedArray instanceof Int32Array)   { return gl.INT; }             // eslint-disable-line
    if (typedArray instanceof Uint32Array)  { return gl.UNSIGNED_INT; }    // eslint-disable-line
    if (typedArray instanceof Float32Array) { return gl.FLOAT; }           // eslint-disable-line
    return false
  }
function expandedTypedArray(array){
   
    let cursor = 0
    array.push = function(){
        for (let ii = 0; ii < arguments.length; ++ii) {
          const value = arguments[ii];
          
          if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
            for (let jj = 0; jj < value.length; ++jj) {
              array[cursor++] = value[jj];
            }
          } else {
            array[cursor++] = value;
          }
        }
        
      }
      
      return array
  }

function createUniformSetters(gl, program){
    let textureUnit = 0

    function createUniformSetter(program, uniformInfo) {
    
        const location = gl.getUniformLocation(program, uniformInfo.name)
        const type = uniformInfo.type
        const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');
        
        if (type === gl.FLOAT && isArray) {
        return function(v) {
            gl.uniform1fv(location, v);
        };
        }
        if (type === gl.FLOAT) {
        return function(v) {
            gl.uniform1f(location, v);
        };
        }
        if (type === gl.FLOAT_VEC2) {
        return function(v) {
            gl.uniform2fv(location, v);
        };
        }
        if (type === gl.FLOAT_VEC3) {
        return function(v) {
            gl.uniform3fv(location, v);
        };
        }
        if (type === gl.FLOAT_VEC4) {
        return function(v) {
            gl.uniform4fv(location, v);
        };
        }
        if (type === gl.INT && isArray) {
        return function(v) {
            gl.uniform1iv(location, v);
        };
        }
        if (type === gl.INT) {
        return function(v) {
            gl.uniform1i(location, v);
        };
        }
        if (type === gl.INT_VEC2) {
        return function(v) {
            gl.uniform2iv(location, v);
        };
        }
        if (type === gl.INT_VEC3) {
        return function(v) {
            gl.uniform3iv(location, v);
        };
        }
        if (type === gl.INT_VEC4) {
        return function(v) {
            gl.uniform4iv(location, v);
        };
        }
        if (type === gl.BOOL) {
        return function(v) {
            gl.uniform1iv(location, v);
        };
        }
        if (type === gl.BOOL_VEC2) {
        return function(v) {
            gl.uniform2iv(location, v);
        };
        }
        if (type === gl.BOOL_VEC3) {
        return function(v) {
            gl.uniform3iv(location, v);
        };
        }
        if (type === gl.BOOL_VEC4) {
        return function(v) {
            gl.uniform4iv(location, v);
        };
        }
        if (type === gl.FLOAT_MAT2) {
        return function(v) {
            gl.uniformMatrix2fv(location, false, v);
        };
        }
        if (type === gl.FLOAT_MAT3) {
        return function(v) {
            gl.uniformMatrix3fv(location, false, v);
        };
        }
        if (type === gl.FLOAT_MAT4) {
        return function(v) {
            gl.uniformMatrix4fv(location, false, v);
        };
        }    
    }
    const uniformSetters = { };
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    
    for (let ii = 0; ii < numUniforms; ++ii) {
      const uniformInfo = gl.getActiveUniform(program, ii);
      if (!uniformInfo) {
        break;
      }
      
      let name = uniformInfo.name;
      
      if (name.substr(-3) === '[0]') {
        name = name.substr(0, name.length - 3);
      }
      if(uniformInfo.size > 1){
        for(let i = 0; i < uniformInfo.size; i++){
          const obj = {size : uniformInfo.size, type : uniformInfo.type, name : name + `[${i}]`}
          uniformSetters[name + `[${i}]`] = createUniformSetter(program, obj );
        }
      }
      else{
        const setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
      }
      
    }
    return uniformSetters
}
function createAttribSetters(gl, program){
    const setters = {}
    
    const numAtrribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
    for(let i = 0; i < numAtrribs; i++){
      const attribInfo = gl.getActiveAttrib(program,i)
      const location = gl.getAttribLocation(program,attribInfo.name)
      setters[attribInfo.name] = function(bufferInfo){
 
        const {numComponents, type, buffer} = bufferInfo
        gl.enableVertexAttribArray(location)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.vertexAttribPointer(location, numComponents, type, false, 0,0)
      }
    }
    return setters
  }
function createBuffersInfo(gl,arrays){
    const buffersInfo = {}
    buffersInfo.attribs = {}
    Object.keys(arrays).forEach(key =>{
        if(key === 'indices') return 
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, arrays[key],gl.STATIC_DRAW)
        buffersInfo.attribs['a_' + key] = {
            buffer,
            numComponents : 3,
            type : getGLTypeForTypedArray(gl,arrays[key])
        }
     
    })

    if(arrays.indices){
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices,gl.STATIC_DRAW)
        buffersInfo.indices = buffer
        buffersInfo.numElements = arrays.indices.length
        return buffersInfo
    }
    buffersInfo.numElements = arrays.position.length / 3
    return buffersInfo
  }





class ProgrammInfo{
    constructor(gl, vs, fs){
        this.gl = gl
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER)
        gl.shaderSource(this.vertexShader, vs)
        gl.compileShader(this.vertexShader)
        if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(this.vertexShader))
        }

        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
        gl.shaderSource(this.fragmentShader, fs)
        gl.compileShader(this.fragmentShader)
        if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(this.fragmentShader))
        }
        

        this.prg = gl.createProgram()
        gl.attachShader(this.prg, this.vertexShader)
        gl.attachShader(this.prg, this.fragmentShader)
        gl.linkProgram(this.prg)
        if (!gl.getProgramParameter(this.prg, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(this.prg))
        }

        
        this.uniformSetters = createUniformSetters(gl, this.prg)
        this.attributeSetters = createAttribSetters(gl, this.prg)
        
    }
    setUniforms(uniforms){
        
        Object.keys(uniforms).forEach(name=>{
            const setter = this.uniformSetters[name]
            if(setter) setter(uniforms[name])
        })
    }
    setAttributes(buffers){
 
        Object.keys(buffers.attribs).forEach(key =>{
            const setter = this.attributeSetters[key]
            if(setter){
              setter(buffers.attribs[key])
            }
        })
        if(buffers.indices){
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
        }
    }
}

export {
    expandedTypedArray, ProgrammInfo, createBuffersInfo
}