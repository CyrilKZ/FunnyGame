import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'

export default class Ground {
  constructor () {
    this.loaded = false
    this.allLoadings = [false, false, false, false]

    this.bars = []

    const groundGeometry = new THREE.PlaneGeometry(CONST.PLANE_WIDTH, CONST.PLANE_LENGTH, 1, 1)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xfefefe })
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial)
    this.ground.receiveShadow = true

    const self = this
    const sideGeometry = new THREE.PlaneGeometry(CONST.SIDE_BAR_WIDTH, CONST.PLANE_LENGTH, 1, 1)
    const midGeometry = new THREE.PlaneGeometry(2 * CONST.BLOCK_OFFSET, CONST.PLANE_LENGTH, 1, 1)

    const leftLoader = new THREE.TextureLoader()
    leftLoader.load(
      'resources/leftside.jpg',
      function (texture) {
        console.log(`left texture ${texture} loaded`)
        const material = new THREE.MeshBasicMaterial({ map: texture })
        self.bars[0] = new THREE.Mesh(sideGeometry, material)
        self.bars[1] = new THREE.Mesh(sideGeometry, material)
        self.allLoadings[0] = true
        self.checkLoading()
      }
    )

    const rightLoader = new THREE.TextureLoader()
    rightLoader.load(
      'resources/rightside.jpg',
      function (texture) {
        console.log(`right texture ${texture} loaded`)
        const material = new THREE.MeshBasicMaterial({ map: texture })
        self.bars[2] = new THREE.Mesh(sideGeometry, material)
        self.bars[3] = new THREE.Mesh(sideGeometry, material)
        self.allLoadings[1] = true
        self.checkLoading()
      }
    )

    const midLoader = new THREE.TextureLoader()
    midLoader.load(
      'resources/midbar.jpg',
      function (texture) {
        console.log(`mid texture ${texture} loaded`)
        const material = new THREE.MeshBasicMaterial({ map: texture })
        for (let k = 4; k < 8; ++k) {
          self.bars[k] = new THREE.Mesh(midGeometry, material)
        }
        self.allLoadings[2] = true
        self.checkLoading()
      }
    )

    const centerLoader = new THREE.TextureLoader()
    centerLoader.load(
      'resources/centerbar.jpg',
      function (texture) {
        console.log(`mid texture ${texture} loaded`)
        const material = new THREE.MeshBasicMaterial({ map: texture })
        self.bars[8] = new THREE.Mesh(midGeometry, material)
        self.bars[9] = new THREE.Mesh(midGeometry, material)
        self.allLoadings[3] = true
        self.checkLoading()
      }
    )
  }

  checkLoading () {
    let flag = true
    this.allLoadings.forEach((f) => {
      flag = flag && f
    })
    this.loaded = this.loaded || flag
  }

  addToScene (scene) {
    if (!this.loaded) {
      console.log('loading')
      return
    }

    scene.add(this.ground)

    this.bars.forEach((bar) => {
      scene.add(bar)
    })

    this.bars[0].position.set(-CONST.PLANE_WIDTH / 2, 0, CONST.SIDE_BAR_WIDTH / 2)
    this.bars[0].rotateY(Math.PI / 2)

    this.bars[1].position.set(-CONST.PLANE_WIDTH / 2, CONST.PLANE_LENGTH, CONST.SIDE_BAR_WIDTH / 2)
    this.bars[1].rotateY(Math.PI / 2)

    this.bars[2].position.set(CONST.PLANE_WIDTH / 2, 0, CONST.SIDE_BAR_WIDTH / 2)
    this.bars[2].rotateY(-Math.PI / 2)

    this.bars[3].position.set(CONST.PLANE_WIDTH / 2, CONST.PLANE_LENGTH, CONST.SIDE_BAR_WIDTH / 2)
    this.bars[3].rotateY(-Math.PI / 2)

    this.bars[4].position.set(-CONST.ROW_WIDTH, 0, 1)
    this.bars[5].position.set(-CONST.ROW_WIDTH, CONST.PLANE_LENGTH, 1)

    this.bars[6].position.set(CONST.ROW_WIDTH, 0, 1)
    this.bars[7].position.set(CONST.ROW_WIDTH, CONST.PLANE_LENGTH, 1)

    this.bars[8].position.set(0, 0, 1)
    this.bars[9].position.set(0, CONST.PLANE_LENGTH, 1)
  }

  removeFromScene (scene) {
    scene.remove(this.ground)
    this.bars.forEach((bar) => {
      scene.remove(bar)
    })
  }

  update (speed) {
    this.bars.forEach((bar) => {
      bar.position.y -= speed
      if (bar.position.y < -CONST.PLANE_LENGTH) {
        bar.position.y += 2 * CONST.PLANE_LENGTH
      }
    })
  }
}
