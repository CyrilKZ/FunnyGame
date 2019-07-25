import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'

export default class UI {
  constructor(url){
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-CONST.SCREEN_X/2, CONST.SCREEN_X/2, CONST.SCREEN_Y/2, -CONST.SCREEN_Y/2, 1, 2000)
    this.light = new THREE.DirectionalLight(0xffffff, 0)
    this.aLight = new THREE.AmbientLight(0xffffff, 1)
    this.camera.position.z = 2000
    this.light.position.set(0, 0, 100)
    this.scene.add(this.light)
    this.scene.add(this.aLight)
    
    this.display = false
    this.loaded = false

    this.animationFrame = 0
    this.startAnimation = false
    this.endAnimation = false

    let self = this
    let loader = new THREE.TextureLoader()
    loader.load(
      url,
      function(texture){
        let geometry = new THREE.PlaneGeometry(CONST.SCREEN_X, CONST.SCREEN_Y, 1, 1)
        let material = new THREE.MeshLambertMaterial({map:texture})
        self.backgound = new THREE.Mesh(geometry, material)
        self.scene.add(self.backgound)
        self.loaded = true
        self.restart()
      }
    )  
  }
  restart(){
    this.frame = 0
    this.show()
    this.light.intensity = 0.5
  }
  show(){
    this.display = true
    this.backgound.visible = true
  }
  hide(){
    this.display = false
    this.backgound.visible = false
  }
  setupRenderer(renderer){
    renderer.setScissor(0, 0, 1920, 1080)
    renderer.setViewport(0, 0, 1920, 1080)
  }
  render(renderer){
    this.setupRenderer(renderer)
    renderer.render(this.scene, this.camera)
  }
  handleTouchEvents(res = null){
    return
  }
}