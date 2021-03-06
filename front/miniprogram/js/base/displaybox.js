import * as THREE from '../libs/three.min'
export default class DisplayBox {
  constructor (url, lengthX = 0, lengthY = 0, x = 0, y = 0, z = 0, basic = false) {
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
    this.basic = basic

    if (typeof (url) === 'string') {
      const self = this
      const loader = new THREE.TextureLoader()
      loader.load(
        url,
        function (texture) {
          console.log(`${url} loaded`)
          let material
          if (self.basic) {
            material = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
          } else {
            material = new THREE.MeshLambertMaterial({ map: texture, transparent: true })
          }
          const geometry = new THREE.PlaneGeometry(self.lengthX, self.lengthY)
          self.model = new THREE.Mesh(geometry, material)
          self.loaded = true
        }
      )
    } else {
      this.loaded = true
      let material
      if (this.basic) {
        material = new THREE.MeshBasicMaterial({ map: url, transparent: true })
      } else {
        material = new THREE.MeshLambertMaterial({ map: url, transparent: true })
      }
      const geometry = new THREE.PlaneGeometry(this.lengthX, this.lengthY)
      this.model = new THREE.Mesh(geometry, material)
    }
  }

  show () {
    if (!this.loaded) {
      console.log('texture loading in progress')
      return
    }
    this.visible = true
    this.model.visible = true
  }

  hide () {
    if (!this.loaded) {
      console.log('texture loading in progress')
      return
    }
    this.visible = false
    this.model.visible = false
  }

  initToScene (scene, x = this.x, y = this.y, z = this.z) {
    if (!this.loaded) {
      console.log('texture loading in progress')
      return
    }
    if (this.boundScene) {
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

  resetPos (x = this.x, y = this.y, z = this.z) {
    if (!this.loaded) {
      console.log('texture loading in progress')
      return
    }
    this.x = x
    this.y = y
    this.z = z
    this.model.position.x = this.x + this.lengthX / 2
    this.model.position.y = this.y + this.lengthY / 2
    this.model.position.z = this.z
  }

  removeFromScene (scene) {
    if (!this.boundScene) {
      console.error('not attached to any scene')
      return
    }
    this.hide()
    scene.remove(this.model)
    this.boundScene = false
  }

  discard () {
    if (this.boundScene) {
      console.error('still attached to a scene')
    }
    if (!this.loaded) {
      console.log('texture loading in progress')
      return
    }
    this.loaded = false
    this.model.material.dispose()
    this.model.geometry.dispose()
    this.model = null
  }
}
