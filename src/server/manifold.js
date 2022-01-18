const prec = 0.005
const m3 = require('../m3')

const { distanceFromLine, norm, findFurthestPoint, sum, diff, normSq} = require('./vector')
class Manifold{
    constructor(body1,body2){
        this.contacts = []
        this.body1 = body1
        this.body2 = body2
        this.warm = 0
    }
    addContact(contact){
        let isFarEnough = true
        const contacts = this.contacts
        
        for(let i = 0, n = contacts.length; i < n; i++){
            
            const biasA = diff(contacts[i].PA, contact.PA)
            const biasB = diff(contacts[i].PB, contact.PB)
            if(norm(biasA) < 0.5 && norm(biasB) < 0.5 ){
                 isFarEnough = false
                
                 contacts[i] = contact
            
            }   
        }
        if(isFarEnough) {
            contacts.push(contact) 
            
        }        
    }
    update(){
        let i, j , n
        const contacts = this.contacts
        const pos1 = this.body1.collider.pos
        const pos2 = this.body2.collider.pos
        for(i = 0, j = 0, n = contacts.length; i < n; i++){
            const contact = contacts[i]

            const newPA = sum(pos1, m3.transformPoint(this.body1.collider.Rmatrix, contact.raLocal))
            const newPB = sum(pos2, m3.transformPoint(this.body2.collider.Rmatrix, contact.rbLocal))
            const raBias = diff(contact.PA, newPA)
            const rbBias = diff(contact.PB, newPB)
            
            
            if(norm(raBias) < 0.05 && norm(rbBias) < 0.05){
               /* contact.PA = newPA
                contact.PB = newPB
                contact.ra = pos1.substract(newPA)
                contact.rb = pos2.substract(newPB)
                contact.raLocal = new Vector(...m3.transformPoint(this.body1.collider.RmatrixInverse,contact.ra.toArray()))
                contact.rbLocal = new Vector(...m3.transformPoint(this.body2.collider.RmatrixInverse,contact.rb.toArray()))
                contact.accI = 0*/
                contacts[j] = contacts[i]
                            
               j++
            }
          
        }
        
        while(j < contacts.length){
            contacts.pop()
        }
        if(contacts.length > 2) this.warm ++
        if(contacts.length < 3 ) this.warm = 0
        if(contacts.length > 4){
            let deepest = null
            let maxDeep = 0
            for(i = 0, n = contacts.length; i < n; i++){
                if(normSq(contacts[i].n) >= maxDeep){
                    maxDeep = normSq(contacts[i].n)
                    deepest = contacts[i]
                }
            }
            let furthest = null
            let maxDistance = 0
            for(i = 0, n = contacts.length; i < n; i++){
                let dist = normSq(diff(contacts[i].PA, deepest.PA))
                if(dist >= maxDistance){
                    maxDistance = dist
                    furthest = contacts[i]
                }
            }
            let furthest2 = null
            maxDistance = 0
            for(i = 0, n = contacts.length; i < n; i++){
                let dist = distanceFromLine(furthest.PA, deepest.PA, contacts[i].PA)
                
                if(dist >= maxDistance){
                    maxDistance = dist
                    furthest2 = contacts[i]
                }
            }
            
            let furthest3 = null
            maxDistance = 0
           
            const oppositeTodiagonal = findFurthestPoint(deepest.PA,furthest.PA,furthest2.PA)
            
            for(i = 0, n = contacts.length; i < n; i++){
                let dist = normSq(diff(oppositeTodiagonal, contacts[i].PA))
                
                if(dist >= maxDistance){
                    maxDistance = dist
                    furthest3 = contacts[i]
                }
            }
           

            contacts[0] = deepest
            contacts[1] = furthest
            contacts[2] = furthest2
            contacts[3] = furthest3
            while(contacts.length > 4) contacts.pop()
            
        }        
    }
}
module.exports = {Manifold}