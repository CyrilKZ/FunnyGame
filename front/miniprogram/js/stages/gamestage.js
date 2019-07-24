import Stage from '../base/stage'
import DataBus from '../databus'
import GameStore from '../gamestore'
import Network from '../network'
import Block from '../world/block'
import Hero from '../world/hero'
import Enemy from '../world/enemy'

import * as THREE from '../libs/three.min'

const PLANE_WIDTH = 440
const PLANE_LENGTH = 1000
const BASELINE_POS = -250
const CAMERA_Z = Math.round(250 * Math.sqrt(3))
const CAMERA_Y = -750
const CAMERA_ROT_X = Math.PI / 4
const ANIMATION_FRAME = 100
const BLOCK_MIN_DISTANCE = 64


let databus = new DataBus()
let store = new GameStore()
let network = new Network()

export default class GameStage extends Stage{
  constructor() {
    super(
      new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 2000),
      new THREE.DirectionalLight(0xffffff, 0.5),
      new THREE.AmbientLight(0xeeeeee, 0.5),
    )

    this.models = []
    this.hero = null
    this.enemy = null
    this.gameOn = false
    
    let self = this
    this.setUpScene()


    network.onBrick = ((res)=>{
      console.log(`brick info: ${res}`)
      console.log(JSON.stringify(res))
      console.log(res.row)
      console.log(res.dis)
      if(store.host){
        self.addBlockToSelf(res.row + 2, res.dis)
      }
      else{
        self.addBlockToSelf(res.row, res.dis)
      }      
    })
    network.onWin = ((res)=>{
      databus.enemyHit = true
    })

    network.onTransfer = ((res)=>{
      if(res.info === 'restart'){
        self.gameOn = true
      }
      else if(res.info === 'danger'){
        if(self.enemy === null){
          return
        }
        else{
          databus.enemyWillHit = true
        }
      }
      else if(res.info === 'frame'){
        if(databus.heroHit || databus.enemyHit){
          return
        }
        else{
          let otherfrm = res.frm
          while(otherfrm - databus.frame > 3){
            console.log('force update')
            self.updateWorld()
          }
        }
      }
      else if(res.info === 'pause'){
        console.log(`remote pause: ${res.pause}`)
        self.switchPause(res.pause)
      }
    })

    wx.onHide(function(){
      if(!store.socketOn){
        return
      }
      network.sendTransfer({
        info:'pause',
        pause: true
      },()=>{
        console.log('pause')
        databus.pause = true
      })
    })
    wx.onShow(function(){
      if(!store.socketOn){
        return
      }
      network.sendTransfer({
        info:'pause',
        pause: false
      },()=>{
        databus.pause = false
        console.log('pause')
      })
    })
  }

  switchPause(pause){
    databus.pause = pause
  }
  
  setUpScene(){
    let geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_LENGTH, 1, 1)
    let material = new THREE.MeshLambertMaterial({ color: 0xfefefe })
    this.ground = new THREE.Mesh(geometry, material)
    let baselineGeo = new THREE.CubeGeometry(PLANE_WIDTH, 0.1, 0.1)
    let baselineMat = new THREE.MeshLambertMaterial({ color: 0x000000 })
    this.baseline = new THREE.Mesh(baselineGeo, baselineMat)
    this.ground.position.set(0, 0, 0)
    this.baseline.position.set(0, BASELINE_POS, 0)
    
    this.light.castShadow = true
    this.ground.receiveShadow = true
    this.light.position.set(0, 0, 120)
    this.light.shadow.camera.near = 0.5
    this.light.shadow.camera.far = 500
    this.light.shadow.camera.left = -220
    this.light.shadow.camera.bottom = -500
    this.light.shadow.camera.right = 220
    this.light.shadow.camera.top = 500
    this.light.target.position.set(0, 0, 0).normalize()
    this.camera.position.z = CAMERA_Z
    this.camera.position.y = CAMERA_Y
    this.camera.rotateX(CAMERA_ROT_X)
    this.scene.add(this.ground)
    this.scene.add(this.baseline)  
  }

  addModel(model){
    this.models.push(model)
    this.scene.add(model)
  }
  clearModels(){
    this.models.forEach((item)=>{
      this.scene.remove(item)
      item.geometry.dispose()
      item.material.dispose()
    })
    this.models = []
    if(this.hero === null || this.hero === undefined){
      return
    }
    this.scene.remove(this.hero.model)
    this.hero.model.geometry.dispose()
    this.hero.model.material.dispose()
    delete(this.hero)
    this.hero = null

    this.scene.remove(this.enemy.model)
    this.enemy.model.geometry.dispose()
    this.enemy.model.material.dispose()
    delete(this.enemy)
    this.light.intensity = 0.5
  }



  restart(){  
    this.animationOn = false
    databus.reset()
    this.clearModels()
    this.hero = new Hero()
    let self = this
    if(store.host){
      this.hero.initSelf(2)
      databus.setHeroSide(2)
      this.scene.add(this.hero.model)
      this.enemy = new Enemy()
      this.enemy.initEnemy(1)
      databus.setEnemySide(1)
      this.scene.add(this.enemy.model)
      network.sendTransfer({
        info:'restart'
      }, ()=>{
        self.gameOn = true
      })
    }
    else{
      this.hero.initSelf(1)
      databus.setHeroSide(1)
      this.scene.add(this.hero.model)
      this.enemy = new Enemy()
      this.enemy.initEnemy(2)
      databus.setEnemySide(2)
      this.scene.add(this.enemy.model)
    } 
  }

  

  updateWorld(){
    databus.frame += 1
    databus.absDistance += databus.speed
    databus.blocks.forEach((row)=>{
      row.forEach((item)=>{
        item.update(databus.speed)
      })
    })
    if(databus.speed < 3){
      databus.speed += databus.accel
    }    
    this.hero.update()
    this.enemy.syncMove()
  }

  loop() {
    if(!this.gameOn || databus.pause){
      return
    }

    if(this.animationOn === true){
      if(databus.aniFrame === ANIMATION_FRAME){
        this.animationOn = false
        store.endFlag = true
      }
      databus.aniFrame += 1
      this.light.intensity -= 0.5 / ANIMATION_FRAME
      return
    }

    if(databus.heroHit === true || databus.enemyHit === true){
      databus.anFrame = 0
      this.animationOn = true
      return
    }    
    if(databus.frame % 120 === 60){
      network.sendTransfer({
        'info': 'frame',
        'frm': databus.frame
      })
    }
    this.updateWorld()
  }

  generateRandomBlock(){
    
  }

  addBlockToSelf(row, absdis){
    let block = databus.pool.getItemByClass('block', Block)
    block.init(row, absdis - databus.absDistance)
    databus.blocks[block.row].push(block)
    this.addModel(block.model)
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
        databus.blocks[row].length > 0 && 
        databus.blocks[row][databus.blocks[row].length - 1].y > -BLOCK_MIN_DISTANCE
      ){
      return
    }
    let self = this
    let block = null

    if(store.host){
      self.hero.blockPonits -= 1
      block = databus.pool.getItemByClass('block', Block)
      block.init(row)
      databus.blocks[block.row].push(block)
      self.addModel(block.model)
      network.sendBrick({
        "self": false,
        "row": row,
        "dis": databus.absDistance,
        "frm": databus.frame
      }, (()=>{
        
      }))
    }
    else{
      self.hero.blockPonits -= 1
      block = databus.pool.getItemByClass('block', Block)
      block.init(row)
      databus.blocks[block.row].push(block)
      self.addModel(block.model)
      network.sendBrick({
        "self": false,
        "row": row - 2,
        "dis": databus.absDistance,
        "frm": databus.frame
      }, (()=>{
        
      }))
    }
    
  }

  handleTouchEvents(res){
    if(this.animationOn || databus.heroHit ||databus.enemyHit || !this.gameOn || this.pause){
      return
    }
    if(res.type === databus.heroSide){      
      this.hero.addMove(res.swipe)
    }
    else if(res.endY > window.innerHeight / 4 * 3 && res.endType !== databus.heroSide){
      {
        this.addBlockToEnemy(res.endX)
      }
    }
  }
}