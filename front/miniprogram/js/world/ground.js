import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'

export default class Ground {
  constructor(){
    this.loaded = false
    this.leftLoaded = false
    this.rightLoaded = false
    this.midLoaded = false

    let groundGeometry = new THREE.PlaneGeometry(CONST.PLANE_WIDTH, CONST.PLANE_LENGTH, 1, 1)
    let groundMaterial = new THREE.MeshLambertMaterial({color: 0xfefefe})
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial)
    this.ground.receiveShadow = true

    let self = this
    let sideGeometry = new THREE.PlaneGeometry(CONST.SIDE_BAR_WIDTH, CONST.PLANE_LENGTH, 1, 1)
    let midGeometry = new THREE.PlaneGeometry(2 * CONST.BLOCK_OFFSET, CONST.PLANE_LENGTH, 1, 1)

    let leftLoader = new THREE.TextureLoader()
    leftLoader.load(
      'resources/leftside.png',
      function(texture){
        console.log(`left texture ${texture} loaded`)
        let material = new THREE.MeshBasicMaterial({map:texture})
        self.leftBar1 = new THREE.Mesh(sideGeometry, material)
        self.leftBar2 = new THREE.Mesh(sideGeometry, material)
        self.leftLoaded = true
        self.loaded = self.loaded || (self.leftLoaded && self.rightLoaded && self.midLoaded)
      }
    )

    let rightLoader = new THREE.TextureLoader()
    rightLoader.load(
      'resources/rightside.png',
      function(texture){
        console.log(`right texture ${texture} loaded`)
        let material = new THREE.MeshBasicMaterial({map:texture})
        self.rightBar1 = new THREE.Mesh(sideGeometry, material)
        self.rightBar2 = new THREE.Mesh(sideGeometry, material)
        self.rightLoaded = true
        self.loaded = self.loaded || (self.leftLoaded && self.rightLoaded && self.midLoaded)
      }
    )

    let midLoader = new THREE.TextureLoader()
    midLoader.load(
      'resources/midbar.png',
      function(texture){
        console.log(`mid texture ${texture} loaded`)
        let material = new THREE.MeshBasicMaterial({map:texture})
        self.midBarL1 = new THREE.Mesh(midGeometry, material)
        self.midBarL2 = new THREE.Mesh(midGeometry, material)
        self.midBarM1 = new THREE.Mesh(midGeometry, material)
        self.midBarM2 = new THREE.Mesh(midGeometry, material)
        self.midBarR1 = new THREE.Mesh(midGeometry, material)
        self.midBarR2 = new THREE.Mesh(midGeometry, material)
        self.midLoaded = true
        self.loaded = self.loaded || (self.leftLoaded && self.rightLoaded && self.midLoaded)
      }
    )
  }
  addToScene(scene){
    if(!this.loaded){
      console.log('loading')
      return
    }

    scene.add(this.ground)
    
    scene.add(this.leftBar1)
    scene.add(this.leftBar2)
    scene.add(this.midBarL1)
    scene.add(this.midBarL2)
    scene.add(this.midBarM1)
    scene.add(this.midBarM2)
    scene.add(this.midBarR1)
    scene.add(this.midBarR2)
    scene.add(this.rightBar1)
    scene.add(this.rightBar2)

    this.leftBar1.position.set(-CONST.PLANE_WIDTH/2, 0, CONST.SIDE_BAR_WIDTH/2)
    this.leftBar1.rotateY(Math.PI / 2)

    this.leftBar2.position.set(-CONST.PLANE_WIDTH/2, CONST.PLANE_LENGTH, CONST.SIDE_BAR_WIDTH/2)
    this.leftBar2.rotateY(Math.PI / 2)

    this.rightBar1.position.set(CONST.PLANE_WIDTH/2, 0, CONST.SIDE_BAR_WIDTH/2)
    this.rightBar1.rotateY(-Math.PI / 2)

    this.rightBar2.position.set(CONST.PLANE_WIDTH/2, CONST.PLANE_LENGTH, CONST.SIDE_BAR_WIDTH/2)
    this.rightBar2.rotateY(-Math.PI / 2)

    this.midBarL1.position.set(-CONST.ROW_WIDTH, 0, 1)
    this.midBarL2.position.set(-CONST.ROW_WIDTH, CONST.PLANE_LENGTH, 1)
    
    this.midBarM1.position.set(0, 0, 1)
    this.midBarM2.position.set(0, CONST.ROW_WIDTH, 1)

    this.midBarR1.position.set(CONST.ROW_WIDTH, 0, 1)
    this.midBarR2.position.set(CONST.ROW_WIDTH, CONST.PLANE_LENGTH, 1)
  }
  removeFromScene(scene){
    scene.remove(this.ground)
    scene.remove(this.leftBar1)
    scene.remove(this.leftBar2)
    scene.remove(this.midBarL1)
    scene.remove(this.midBarL2)
    scene.remove(this.midBarM1)
    scene.remove(this.midBarM2)
    scene.remove(this.midBarR1)
    scene.remove(this.midBarR2)
    scene.remove(this.rightBar1)
    scene.remove(this.rightBar2)
  }
  update(speed){
    this.leftBar1.position.y -= speed
    if(this.leftBar1.position.y < -CONST.PLANE_LENGTH){
      this.leftBar1.position += 2*CONST.PLANE_LENGTH
    }

    this.leftBar2.position.y -= speed
    if(this.leftBar2.position.y < -CONST.PLANE_LENGTH){
      this.leftBar2.position += 2*CONST.PLANE_LENGTH
    }

    this.rightBar1.position.y -= speed
    if(this.rightBar1.position.y < -CONST.PLANE_LENGTH){
      this.rightBar1.position += 2*CONST.PLANE_LENGTH
    }

    this.rightBar2.position.y -= speed
    if(this.rightBar2.position.y < -CONST.PLANE_LENGTH){
      this.rightBar2.position += 2*CONST.PLANE_LENGTH
    }

    this.midBarL1.position.y -= speed
    if(this.midBarL1.position.y < -CONST.PLANE_LENGTH){
      this.midBarL1.position += 2*CONST.PLANE_LENGTH
    }

    this.midBarL2.position.y -= speed
    if(this.midBarL2.position.y < -CONST.PLANE_LENGTH){
      this.midBarL2.position += 2*CONST.PLANE_LENGTH
    }

    this.midBarR1.position.y -= speed
    if(this.midBarR1.position.y < -CONST.PLANE_LENGTH){
      this.midBarR1.position += 2*CONST.PLANE_LENGTH
    }

    this.midBarR2.position.y -= speed
    if(this.midBarR2.position.y < -CONST.PLANE_LENGTH){
      this.midBarR2.position += 2*CONST.PLANE_LENGTH
    }

    this.midBarM1.position.y -= speed
    if(this.midBarM1.position.y < -CONST.PLANE_LENGTH){
      this.midBarM1.position += 2*CONST.PLANE_LENGTH
    }

    this.midBarM2.position.y -= speed
    if(this.midBarM2.position.y < -CONST.PLANE_LENGTH){
      this.midBarM2.position += 2*CONST.PLANE_LENGTH
    }
  }
}