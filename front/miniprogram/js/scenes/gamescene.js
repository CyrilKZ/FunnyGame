import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'
import Ground from '../world/ground'
import GameStatus from '../status';
import Hero from '../world/hero';
import Enemy from '../world/enemy';

const FINAL_CAMERA  = {
  y: -750,
  z: Math.round(250 * Math.sqrt(3)),
  rotX: Math.PI / 4,
  offsetX: 0,
}

const INITIAL_CAMERA = {
  y: -250,
  z: 1600,
  rotX: 0,
  offsetX: 200,
  subX: 600,
  subY: 1080
}

let gamestatus = new GameStatus()
export default class GameScene {
  constructor(){
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 2000)
    this.light = new THREE.DirectionalLight(0xffffff, 0.5)
    this.boarderLight1 = new THREE.DirectionalLight(0xffffff, 0.5)
    this.boarderLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
    this.aLight = new THREE.AmbientLight(0xeeeeee, 0.5)
    this.arena = new Ground()
    this.models = []
    this.hero = null
    this.enemy = null
    this.loaded = false

    this.animationFrame = 0
    this.startAnimation = false
    this.endAnimation = false
  }
  tryToSetUp(){
    if(this.arena.loaded){
      this.loaded = true
    }
    else{
      return
    }
    this.arena.addToScene(this.scene)
    this.scene.add(this.light)
    this.scene.add(this.aLight)
    this.scene.add(this.boarderLight1)
    this.scene.add(this.boarderLight2)

    this.light.castShadow = true
    this.light.position.set(0, 0, 400)
    this.light.shadow.camera.near = 0.5
    this.light.shadow.camera.far = 500
    this.light.shadow.camera.left = -220
    this.light.shadow.camera.bottom = -500
    this.light.shadow.camera.right = 220
    this.light.shadow.camera.top = 500
    this.light.target.position.set(0, 0, 0)

    this.boarderLight1.position.set(219, 0, 0)
    this.boarderLight1.target.position.set(220, 0 ,0)

    this.boarderLight2.position.set(-219, 0, 0)
    this.boarderLight2.target.position.set(-220, 0 ,0)

    this.camera.position.z = INITIAL_CAMERA.z
    this.camera.position.y = INITIAL_CAMERA.y

    this.hero = new Hero()
    this.hero.init(2, this.scene)

    this.enemy = new Enemy()
    this.enemy.init(1, this.scene)

  }
  initStartAnimation(){
    this.startAnimation = true
    let self = this
    this.setUpRenderer = function(renderer){
      renderer.setScissor(1200 - 600 / CONST.GAME_START_FRAME * self.animationFrame, 0, 720 + 1200 / CONST.GAME_START_FRAME * self.animationFrame, 1080)
      renderer.setViewport(600 - 600 / CONST.GAME_START_FRAME * self.animationFrame, 0, 1920, 1080)
    }
  }
  updateStartAnimation(){
    this.animationFrame += 1
    if(this.animationFrame === CONST.GAME_START_FRAME){
      this.setUpRenderer = function(renderer){
        renderer.setScissor(0, 0, 1920, 1080)
        renderer.setViewport(0, 0, 1920, 1080)
      }
      return
    }
    if(this.animationFrame === 2 * CONST.GAME_START_FRAME){
      this.camera.position.z = FINAL_CAMERA.z
      this.camera.position.y = FINAL_CAMERA.y
      this.animationFrame = 0
      this.startAnimation = false
      gamestatus.gameOn = true
    }
    if(this.animationFrame > CONST.GAME_START_FRAME){
      this.camera.position.z += (FINAL_CAMERA.z - INITIAL_CAMERA.z) / CONST.GAME_START_FRAME
      this.camera.position.y += (FINAL_CAMERA.y - INITIAL_CAMERA.y) / CONST.GAME_START_FRAME
      this.camera.rotateX(Math.PI/4 /CONST.GAME_START_FRAME)
    }
    
  }
  setUpRenderer(renderer){
    renderer.setScissor(1200, 0, 1920, 1080)
    renderer.setViewport(600, 0, 1920, 1080)
  }
  render(renderer){
    if(!this.loaded){
      return
    }
    this.setUpRenderer(renderer)
    renderer.render(this.scene, this.camera)
  }
  loop(){
    if(this.startAnimation){
      this.updateStartAnimation()
    }
  }
  updateGame(){
    gamestatus.frame += 1
    gamestatus.absDistance += gamestatus.speed
    gamestatus.blocks.forEach((row) => {
      row.forEach((item)=>{
        item.update(databus.speed)
      })
    })
    this.hero.update()
    this.enemy.sync()
  }

}