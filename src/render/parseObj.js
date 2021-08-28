


export function parseObj(text){
    const v = []
    const vt = []
    const vn = []
    const f = []
    const mapping = {
        v(data){
            v.push(data.map(el => parseFloat(el)))
        },
        vt(data){
            vt.push(data.map(el => parseFloat(el)))
        },
        vn(data){
            vn.push(data.map(el => parseFloat(el)))
        },
        f(data){
            
            f.push(data.map(el => parseInt(el[0])))
            
            
        }
    }
    const lines = text.split('\n')
    for(let i = 0, n = lines.length; i < n; i++){
        const line = lines[i]
        const key = line.split(' ')[0]
        if(!mapping[key]) continue
        const [j, ...data ] = [...line.split(' ')]
        
        mapping[key](data)
    }
    return {v, vt, vn, f}
}