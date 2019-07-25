import GameScene from './scenes/gamescene'
import WelcomScene from './scenes/welcome'
import * as THREE from './libs/three.min'
import * as CONST from './libs/constants'
import GameStatus from './status';
import LobbyScene from './scenes/lobby'
import TouchEvents from './base/touch'
import Network from './base/network';

let ctx = canvas.getContext('webgl')
let renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  context: ctx,
  alpha: true,
  antialias: true
})
canvas.appendChild(renderer.domElement)
renderer.setSize(1920, 1080)
renderer.autoClear = true
renderer.shadowMapEnabled = true
renderer.setScissorTest(true)

wx.cloud.init()
let db = wx.cloud.database()

let gamestatus = new GameStatus()
let touchevents = new TouchEvents()
let network = new Network()

export default class Game {
  constructor(){
    this.aniID = 0
    this.gameScene = new GameScene()

    
    this.stages = [
      new WelcomScene(),
      new LobbyScene()
    ]
    this.currentStage = CONST.STAGE_WELCOME
    this.initTouchEvents()
    

    let self = this
    network.onJoin = function(data){
      console.log(data.userinfo)
      gamestatus.setEnemyInfo(data.userinfo)
            
    }    
    network.onStart = function(){
      self.stages[CONST.STAGE_LOBBY].initEndAnimation()
      self.gameScene.initCharacters()    
    }
    this.restart()
    
  }
  restart(){  
    this.frame = 0
    this.bindLoop = this.loop.bind(this)
    window.cancelAnimationFrame(this.aniID)
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
  loop() {
    if(gamestatus.switchToLobby){
      this.stages[CONST.STAGE_LOBBY].restore()
      this.stages[CONST.STAGE_LOBBY].initStartAnimation()
      this.gameScene.initSyncAnimation()
      this.currentStage = CONST.STAGE_LOBBY
      gamestatus.switchToLobby = false
    }
    else if(gamestatus.switchToGame){
      this.currentStage = -1
      this.gameScene.initStartAnimation()
      gamestatus.switchToGame = false
    }

    if(!this.gameScene.loaded){
      this.gameScene.tryToSetUp()
    }
    else{
      this.gameScene.loop()
    }
    this.stages.forEach((stage)=>{
      stage.loop()
    })

    this.render()
  }
  render() {
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
      )
    if(this.currentStage !== -1){
      this.stages[this.currentStage].render(renderer)
    }
    this.gameScene.render(renderer)
  }
  handleTouchEvents(res){  
    if(this.currentStage !== -1){
      this.stages[this.currentStage].handleTouchEvents(res)
    }
    else{
      this.gameScene.handleTouchEvents(res)
    }
  } 
  initTouchEvents(){
    touchevents.reset()
    canvas.addEventListener('touchstart', ((e)=>{
      e.preventDefault()
      e.touches.forEach((item)=>{
        touchevents.addEvent(item)
      })
    }))
    canvas.addEventListener('touchmove',((e)=>{
      e.preventDefault()
      e.touches.forEach((item)=>{
        touchevents.followUpEvent(item)
      })
    }))
    canvas.addEventListener('touchend', ((e)=>{
      e.preventDefault()
      e.changedTouches.forEach((item)=>{
        let res = touchevents.removeEvent(item)
        console.log(res)
        this.handleTouchEvents(res)        
      })
    }))
  } 
}