import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'
import GameStatus from '../status'

let gamestatus = new GameStatus()

export default class ResultPanel {
  constructor(){
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-CONST.SCREEN_X/2, CONST.SCREEN_X/2, CONST.SCREEN_Y/2, -CONST.SCREEN_Y/2, 1, 2000)
    this.ground = null
    this.texture = null
    this.visible = false
  }

  preInit(){
    let data = {
      pic: gamestatus.selfInfo.image,           // 图片
      nickname: gamestatus.selfInfo.nickName,   // 昵称
      win: gamestatus.enemyHit,                 // true-win, false-lose
      score: gamestatus.score                   // 得分
    }
    //todo: this.texture = ?
  }

  init(){
    let geometry = new THREE.PlaneGeometry(CONST.PANEL_WIDTH, CONST.PANEL_WIDTH)
    let material = new THREE.MeshBasicGeometry({map: this.texture})
    this.ground = new THREE.Mesh(geometry, material)
    this.scene.add(this.ground)
    this.visible = true
  }
  reset(){
    this.scene.remove(this.ground)
    this.ground.geometry.dispose()
    this.ground.material.dispose()
    this.ground = null
    this.texture = null
    this.visible = false
  }

  // render
  setupRenderer(renderer){
    renderer.setScissor((CONST.SCREEN_X - CONST.PANEL_WIDTH)/2, (CONST.SCREEN_Y - CONST.PANEL_HEIGHT)/2, CONST.PANEL_WIDTH, CONST.PANEL_HEIGHT)
    renderer.setViewport(0, 0, CONST.SCREEN_X, CONST.SCREEN_Y)
  }
  render(renderer){
    if(!this.visible){
      return
    }
    this.setupRenderer(renderer)
    renderer.render(this.scene, this.camera)
  }
}