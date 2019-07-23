import GameScene from './scenes/gamescene'
import WelcomScene from './scenes/welcome'
import * as THREE from './libs/three.min'

let ctx = canvas.getContext('webgl')
let renderer = new THREE.WebGLRenderer(ctx)
canvas.appendChild(renderer.domElement)
renderer.setSize(1920, 1080)
renderer.shadowMapEnabled = true
renderer.autoClear = true
renderer.setScissorTest(true)
export default class Game {
  constructor(){
    this.aniID = 0
    this.frame = 0
    this.gameScene = new GameScene()
    this.welcome = new WelcomScene()
    this.restart()
  }
  restart(){  
    this.frame = 0
    //this.welcome.restart()
    this.bindLoop = this.loop.bind(this)
    window.cancelAnimationFrame(this.aniID)
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
  loop() {
    if(!this.gameScene.loaded){
      this.gameScene.tryToSetUp()
    }
    else{
      this.gameScene.loop()
    }
    this.frame += 1
    if(this.frame === 120){
      this.gameScene.initStartAnimation()
    }
    this.render()
  }
  render() {
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
      )
    this.welcome.render(renderer)
    this.gameScene.render(renderer)
  }
  handleTouchEvents(res){
    return
  }  
}