import * as THREE from '../libs/three.min'
import HUD from '../runtime/hud'

let hud = new HUD()

export default class Stage {
  constructor(camera, light, alight){
    this.scene = new THREE.Scene()
    this.camera = camera
    this.light = light
    this.aLight = alight
    this.animation = false
    this.scene.add(this.light)
    this.scene.add(this.aLight)
    this.showHUD = false
    this.display = false
  }
  restart(){
    return
  }
  displayHUD(){
    this.showHUD = true
  }
  hideHUD(){
    this.showHUD = false
  }
  show(){
    this.display = true
  }
  hide(){
    this.display = false
  }
  render(renderer){
    renderer.clear()
    renderer.render(this.scene, this.camera)
    if(this.showHUD){
      renderer.render(hud)
    }
  }
  handleTouchEvents(res = null){
    return
  }
}