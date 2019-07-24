import * as THREE from '../libs/three.min'
export default class DisplayBox {
  constructor(url, lengthX = 0, lengthY = 0, x = 0, y = 0, z = 0){
    this.loaded = false
    this.url = url
    this.x = x
    this.y = y
    this.z = z
    this.lengthX = lengthX
    this.lengthY = lengthY
    this.model = null
    this.boundScene = false
    this.visible = false

    let self = this
    let loader = new THREE.TextureLoader()
    loader.load(
      url,
      function(texture){
        console.log(`${url} loaded`)
        let material = new THREE.MeshLambertMaterial({map:texture, transparent:true})
        let geometry = new THREE.PlaneGeometry(self.lengthX, self.lengthY)
        self.model = new THREE.Mesh(geometry, material)
        self.loaded = true        
      }
    )
  }

  show(){
    if(!this.loaded){
      console.log('texture loading in progress')
      return
    }
    this.visible = true
    this.model.visible = true
  }
  hide(){
    if(!this.loaded){
      console.log('texture loading in progress')
      return
    }
    this.visible = false
    this.model.visible = false
  }

  initToScene(scene, x = this.x, y = this.y, z = this.z){
    if(!this.loaded){
      console.log('texture loading in progress')
      return
    }
    if(this.boundScene){
      return
    }
    this.x = x
    this.y = y
    this.z = z
    scene.add(this.model)
    this.model.position.x = this.x + this.lengthX / 2
    this.model.position.y = this.y + this.lengthY / 2
    this.model.position.z = this.z
    this.boundScene = true
    this.show()
  }
  removeFromScene(scene){
    if(!this.boundScene){
      console.error('not attached to any scene')
      return
    }
    this.hide()
    scene.remove(this.model)
    this.boundScene = false
  }  
  discard(){
    if(this.boundScene){
      console.error('still attached to a scene')
    }
    if(!this.loaded){
      console.log('texture loading in progress')
      return
    }
    this.model.material.dispose()
    this.model.geometry.dispose()
  }
}