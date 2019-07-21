import * as THREE from '../libs/three.min'
import HUD from '../runtime/hud'

let hud = new HUD()

export default class Stage {
  constructor(camera, light, alight, onSetup){
    this.scene = new THREE.Scene()
    this.camera = camera
    this.light = light
    this.alight = alight
    this.animation = false
    this.scene.add(this.light)
    this.scene.add(this.alight)
    this.showHUD = false
    onSetup()
  }
  displayHUD(){
    this.showHUD = true
  }
  hideHUD(){
    this.showHUD = false
  }
  render(renderer){
    renderer.render(this.scene, this.camera)
    if(this.showHUD){
      renderer.render(hud)
    }
  }
}