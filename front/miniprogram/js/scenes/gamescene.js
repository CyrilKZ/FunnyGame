import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'
import Ground from '../world/ground'
import GameStatus from '../status'
import Hero from '../world/hero'
import Enemy from '../world/enemy'
import Block from '../world/block'
import Network from '../base/network'
import ParticleCubeSystem from '../base/particles'
import HUD from '../base/HUD'

const FINAL_CAMERA  = {
  y: -750,
  z: Math.round(250 * Math.sqrt(3)),
  rotX: Math.PI / 4,
  offsetX: 0,
}

const INITIAL_CAMERA = {
  y: 0,
  z: 1600,
  rotX: 0,
  offsetX: 200,
  subX: 600,
  subY: 1080
}

let gamestatus = new GameStatus()
let network = new Network()

export default class GameScene {
  constructor(){
    this.scene = new THREE.Scene()
    this.scene.background = 'rgba(0,0,0, 0.01)'
    //this.scene.background = 'rgba(255,255,255,0)'
    this.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 2000)
    this.light = new THREE.DirectionalLight(0xffffff, 0.5)
    this.aLight = new THREE.AmbientLight(0xffffff, 0)
    this.arena = new Ground()
    this.models = []
    this.hero = null
    this.enemy = null
    this.hud = new HUD()
    this.loaded = false

    this.animationFrame = 0
    this.startAnimation = false
    this.endAnimation = false
    this.syncAnimation = false

    this.heroParticle = new ParticleCubeSystem(CONST.HERO_COLOR, CONST.HERO_LENGTH, CONST.HERO_LENGTH, CONST.HERO_LENGTH)
    this.enemyParticle = new ParticleCubeSystem(CONST.ENEMY_COLOR, CONST.HERO_LENGTH, CONST.HERO_LENGTH, CONST.HERO_LENGTH)

    this.initNetwork()
  }

  // Stage Setup
  initNetwork(){
    let self = this
    network.onBrick = ((res)=>{
      if(gamestatus.host){
        self.addBlockToSelf(res.row + 2, res.dis)
      }
      else{
        self.addBlockToSelf(res.row, res.dis)
      }      
    })
    network.onWin = ((res)=>{
      gamestatus.enemyHit = true
    })

    network.onTransfer = ((res)=>{
      if(res.info === 'restart'){
        gamestatus.gameOn = true
        gamestatus.frame = 0
        gamestatus.absDistance = 0
      }
      else if(res.info === 'danger'){
        if(self.enemy === null){
          return
        }
        else{
          gamestatus.enemyWillHit = true
        }
      }
      else if(res.info === 'frame'){
        if(gamestatus.heroHit || gamestatus.enemyHit){
          return
        }
        else{
          let otherfrm = res.frm
          while(otherfrm - gamestatus.frame > 3){
            console.log('force update')
            self.updateGame()
          }
        }
      }
      else if(res.info === 'pause'){
        console.log(`remote pause: ${res.pause}`)
        self.switchPause(res.pause)
      }
    })
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

    this.light.castShadow = true
    this.light.position.set(0, 0, 400)
    this.light.shadow.camera.near = 0.5
    this.light.shadow.camera.far = 500
    this.light.shadow.camera.left = -220
    this.light.shadow.camera.bottom = -500
    this.light.shadow.camera.right = 220
    this.light.shadow.camera.top = 500
    this.light.target.position.set(0, 0, 0)

    this.camera.position.z = INITIAL_CAMERA.z
    this.camera.position.y = INITIAL_CAMERA.y
    this.camera.rotateX(INITIAL_CAMERA.rotX)
    
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
      if(gamestatus.host){
        network.sendTransfer({
          info: 'restart'
        }, ()=>{
          gamestatus.gameOn = true
        })
      }
      this.hud.show()
      //this.hud.showText('开始')
    }
    if(this.animationFrame > CONST.GAME_START_FRAME){
      this.camera.position.z += (FINAL_CAMERA.z - INITIAL_CAMERA.z) / CONST.GAME_START_FRAME
      this.camera.position.y += (FINAL_CAMERA.y - INITIAL_CAMERA.y) / CONST.GAME_START_FRAME
      this.camera.rotateX((FINAL_CAMERA.rotX - INITIAL_CAMERA.rotX) /CONST.GAME_START_FRAME)
      if(!this.hud.fullyInit[0] || !this.hud.fullyInit[1]){
        this.hud.tryToInit()
      }
    }  
  }
  initEndAnimation(){
    this.animationFrame = 0
    this.endAnimation = true
    if(gamestatus.enemyHit){
      this.enemy.hide()
      this.enemyParticle.initToScene(this.scene, this.enemy.speedX, -gamestatus.speed / 2, this.enemy.speedZ, this.enemy.x, this.enemy.y, this.enemy.z)
    }
    else {
      this.hero.hide()
      this.heroParticle.initToScene(this.scene, this.hero.speedX, -gamestatus.speed / 2, this.hero.speedZ, this.hero.x, this.hero.y, this.hero.z)
    }
  }
  updateEndAnimation(){
    if(this.animationFrame === CONST.PARICLE_LIFESPAN){
      this.endAnimation = false
      
      this.reset()
      gamestatus.switchToLobby = true
      
    }
    if(gamestatus.heroHit){
      this.heroParticle.playAnimation()
    }
    else{
      this.enemyParticle.playAnimation()
    }
  }
  initSyncAnimation(){
    this.syncAnimation = true
    this.aLight.intensity = 20
    this.animationFrame = 0
  }
  updateSyncAnimation(){
    if(this.animationFrame === CONST.SWITCH_SHORT_FRAME){
      this.aLight.intensity = 0.5
      this.animationFrame = 0
      this.syncAnimation = false
    }
    this.aLight.intensity -= 1/CONST.SWITCH_SHORT_FRAME
    this.animationFrame += 1
  }
  setUpRenderer(renderer){
    renderer.setScissor(1200, 0, 1920, 1080)
    renderer.setViewport(600, 0, 1920, 1080)
  }
  
  // Game Setup
  initCharacters(){
    this.hero = new Hero()
    this.enemy = new Enemy()
    if(gamestatus.host){
      this.hero.init(2, this.scene)
      this.enemy.init(1, this.scene)
    }
    else{
      this.hero.init(1, this.scene)
      this.enemy.init(2, this.scene)
    }
  }   
  cleanCharacters(){
    this.hero.removeFromScene(this.scene)
    this.enemy.removeFromScene(this.scene)
    this.hero.discard()
    this.enemy.discard()
  }  
  reset(){
    gamestatus.blocks.forEach((row) => {
      row.forEach((item)=>{
        item.update(600)
      })
    })
    if(gamestatus.heroHit){
      this.heroParticle.removeFromScene(this.scene)
    }
    else{
      this.enemyParticle.removeFromScene(this.scene)
    }
    this.setUpRenderer = function(renderer){
      renderer.setScissor(1200, 0, 1920, 1080)
      renderer.setViewport(600, 0, 1920, 1080)
    }
    this.cleanCharacters()
  }

  // In-game
  switchPause(pause){
    gamestatus.pause = pause
  }
  addBlockToSelf(row, absdis){
    let block = gamestatus.pool.getItemByClass('block', Block)
    block.init(row, this.scene, absdis - gamestatus.absDistance)
  }
  addBlockToEnemy(x){
    if(this.hero.blockPonits < 1){
      return
    }
    console.log(x)
    let row
    if(x < window.innerWidth / 4){
      row = 0
    }
    else if(x < window.innerWidth / 2){
      row = 1
    }
    else if(x < window.innerWidth *3 / 4){
      row = 2
    }
    else{
      row = 3
    }
    if(
        gamestatus.blocks[row].length > 0 && 
        gamestatus.blocks[row][gamestatus.blocks[row].length - 1].y > -CONST.BLOCK_MIN_DISTANCE
      ){
      return
    }
    let self = this
    let block = null

    if(gamestatus.host){
      self.hero.blockPonits -= 1
      block = gamestatus.pool.getItemByClass('block', Block)
      block.init(row, this.scene)
      network.sendBrick({
        "self": false,
        "row": row,
        "dis": gamestatus.absDistance,
        "frm": gamestatus.frame
      }, (()=>{
        
      }))
    }
    else{
      self.hero.blockPonits -= 1
      block = gamestatus.pool.getItemByClass('block', Block)
      block.init(row, this.scene)
      network.sendBrick({
        "self": false,
        "row": row - 2,
        "dis": gamestatus.absDistance,
        "frm": gamestatus.frame
      }, (()=>{
        
      }))
    }
    
  }
  updateGame(){
    gamestatus.frame += 1
    gamestatus.absDistance += gamestatus.speed
    this.arena.update(gamestatus.speed)
    gamestatus.blocks.forEach((row) => {
      row.forEach((item)=>{
        item.update(gamestatus.speed)
      })
    })
    this.hero.update()
    this.enemy.sync()
    if(gamestatus.heroHit === true || gamestatus.enemyHit === true){
      this.initEndAnimation()
      gamestatus.gameOn = false
      return
    }
  }

  // Basics
  render(renderer){
    if(!this.loaded){
      return
    }
    this.setUpRenderer(renderer)
    renderer.render(this.scene, this.camera)
    this.hud.render(renderer)
  }
  loop(){
    if(this.startAnimation){
      this.updateStartAnimation()
      return
    }
    if(this.endAnimation){
      this.updateEndAnimation()
      return
    }
    if(this.syncAnimation){
      this.updateSyncAnimation()
      return
    }
    if(gamestatus.pause || !gamestatus.gameOn){
      return
    }
    if(gamestatus.frame % 60 === 30){
      network.sendTransfer({
        'info': 'frame',
        'frm': gamestatus.frame
      })
    }
    this.updateGame()
  }
  handleTouchEvents(res){
    console.log(res)
    console.log(this.startAnimation || gamestatus.heroHit || gamestatus.enemyHit || !gamestatus.gameOn || gamestatus.pause)
    if(this.startAnimation || gamestatus.heroHit || gamestatus.enemyHit || !gamestatus.gameOn || gamestatus.pause){
      return
    }
    console.log(res.type)
    console.log(gamestatus.heroSide)
    if(res.type === gamestatus.heroSide){  
      console.log(`swipe: ${res.swipe}`)    
      this.hero.addMove(res.swipe)
    }
    else if(res.endY > window.innerHeight / 4 * 3 && res.endType !== gamestatus.heroSide){
      this.addBlockToEnemy(res.endX)
    }
  }
}