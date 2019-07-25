import * as CONST from '../libs/constants'
import * as THREE from '../libs/three.min'
import GameStatus from '../status'
import UI from '../base/ui'
import Button from '../world/button'
import DisplayBox from '../base/displaybox';
import Network from '../base/network';

let gamestatus = new GameStatus()
let network = new Network()
export default class LobbyScene extends UI {
  constructor(){
    super('resources/lobbybg.png')

    this.enemyJoined = false
    this.isSetUp = false
    this.buttonsSet = false
    this.selfPhotoSet = false
    this.enemyPhotoSet = false

    this.imReady = new Button('resources/ready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -775, -375)
    this.imNotReady = new Button('resources/notready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -775, -375)
    this.exitButton = new Button('resources/exit.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -275, -375)
    this.inviteButton = new Button('resources/invite.png', CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -118, 5)
    this.selfPhoto = null

    this.othersReady = new DisplayBox('resources/onready.png', 170, 147, -50, -50, 2)
    this.selfReady = new DisplayBox('resources/onready.png', 170, 147, -660, -50, 2)
    this.enemyPhoto = null
    
    this.tryToInitButtons()
  }
  tryToInitButtons(){
    if(!this.loaded){
      return
    }
    if(this.imReady.loaded && !this.imReady.boundScene){
      this.imReady.init(this.scene)
      this.imReady.hideButton()
    }
    if(this.imNotReady.loaded && !this.imNotReady.boundScene){
      this.imNotReady.init(this.scene)
    }
    if(this.inviteButton.loaded && !this.inviteButton.boundScene){
      this.inviteButton.init(this.scene)
    }
    if(this.exitButton.loaded && !this.exitButton.boundScene){
        this.exitButton.init(this.scene)
      }
    this.buttonsSet = this.buttonsSet || (this.imReady.boundScene && this.imNotReady.boundScene && this.inviteButton.boundScene && this.exitButton.boundScene)
  }
  readySelf(){
    let self = this
    this.selfReady.initToScene(this.scene)
    this.selfReady.show()

    console.log('ready')
    console.log(self.enemyJoined)
    // if(!self.enemyJoined){
    //   return
    // }
    
    network.sendReady(true, ()=>{
      gamestatus.selfReady = true
      self.imNotReady.hideButton()
      self.imReady.showButton()
    })
  }
  unreadySelf(){
    this.selfReady.hide()
    let self = this
    // if(!self.enemyJoined){
    //   return
    // }

    network.sendReady(false, ()=>{
      gamestatus.selfReady = false
      self.imReady.hideButton()
      self.imNotReady.showButton()
    })
  }
  setEnemyReady(ready){
    gamestatus.enemyReady = ready
    if(ready){
      this.othersReady.initToScene(this.scene)
      this.othersReady.show()
    }
    else{
      this.othersReady.hide()
    }
  }
  tryShowSelfInfo(){  
    if(this.selfPhotoSet){
      return
    }
    if(gamestatus.selfInfo.picUrl === ''){
      return
    }

    if(gamestatus.selfInfo.texture){
      this.selfPhoto = new DisplayBox(gamestatus.selfInfo.texture, CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -725, 5, 1)
      this.renderSelfName()
      this.selfPhoto.initToScene(this.scene)
      this.selfPhotoSet = true
    }
  }
  tryShowEnemyInfo(){
    if(this.enemyPhotoSet){
      return
    }
    if(gamestatus.enemyInfo.picUrl === ''){
      return
    }

    if(gamestatus.enemyInfo.texture){
      this.enemyPhoto = new DisplayBox(gamestatus.enemyInfo.texture, CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -118, 5, 1)
      this.enemyPhoto.initToScene(this.scene)
      this.enemyPhotoSet = true
      this.enemyJoined = true
      this.inviteButton.hideButton()
      this.renderEnemyName()
    }
  }

  renderSelfName(){
    let canvas = wx.createCanvas()
    canvas.width = 400
    canvas.height = 100
    let context = canvas.getContext('2d')

    context.fillStyle = "#000"
    context.font = "54px 微软雅黑"
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.fillText(gamestatus.selfInfo.nickName, 200, 50, 400)

    let texture = new THREE.CanvasTexture(canvas)
    let displayBox = new DisplayBox(texture, canvas.width, canvas.height, -830, -150)
    displayBox.initToScene(this.scene)
  }

  renderEnemyName() {
    let canvas = wx.createCanvas()
    canvas.width = 400
    canvas.height = 100
    let context = canvas.getContext('2d')

    context.fillStyle = "#000"
    context.font = "54px 微软雅黑"
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.fillText(gamestatus.enemyInfo.nickName, 200, 50, 400)

    let texture = new THREE.CanvasTexture(canvas)
    let displayBox = new DisplayBox(texture, canvas.width, canvas.height, -220, -150)
    displayBox.initToScene(this.scene)
  }

  inviteEnemy(){
    console.log('invite')
    wx.shareAppMessage({
      query: 'teamid=' + gamestatus.roomID.toString()
    })
  }

  enemyLeave(){
    this.enemyPhoto.removeFromScene(this.scene)
    this.enemyPhotoSet = false
    this.enemyPhoto.discard()
    gamestatus.enemyInfo = {
      nickName: '',
      picUrl: ''
    }
    renderEnemyName()
    this.inviteButton.showButton()   
    this.enemyJoined = false
  }
  update(){
    if(!this.buttonsSet){
      this.tryToInitButtons()
    }
    if(!this.selfPhotoSet){
      this.tryShowSelfInfo()
    }
    if(!this.enemyPhotoSet){
      this.tryShowEnemyInfo()
    }
    this.isSetUp = this.isSetUp || (this.buttonsSet && this.selfPhotoSet && this.enemyPhotoSet)
  }

  initStartAnimation(){
    this.startAnimation = true
    this.light.intensity = 20
    this.animationFrame = 0
  }
  
  exit(){

  }

  updateStartAnimation(){
    if(this.animationFrame === CONST.SWITCH_SHORT_FRAME){
      this.light.intensity = 0
      this.startAnimation = false
      this.animationFrame = 0
      return
    }
    this.light.intensity -= 20 / CONST.SWITCH_SHORT_FRAME
    this.animationFrame += 1
  }

  initEndAnimation(){
    this.endAnimation = true
    this.light.intensity = 0
    this.animationFrame = 0
  }
  updateEndAnimation(){
    if(this.animationFrame === CONST.SWITCH_SHORT_FRAME){
      this.light.intensity = 20
      this.endAnimation = false
      this.animationFrame = 0
      gamestatus.switchToGame = true
      return
    }
    this.light.intensity += 20 / CONST.SWITCH_SHORT_FRAME
    this.animationFrame += 1
  }

  loop(){
    this.update()
    if(this.startAnimation){
      this.updateStartAnimation()
    }
    else if(this.endAnimation){
      this.updateEndAnimation()
    }
  }
  restore(){
    this.light.intensity = 0
    this.aLight.intensity = 1
    this.display = true
  }
  handleTouchEvents(res){
    if(!this.buttonsSet || this.startAnimation || this.endAnimation){
      return
    }
    let endX = res.endX
    let endY = res.endY
    let initX = res.initX
    let initY = res.initY
    if(this.imReady.checkTouch(endX, endY, initX, initY)){
      this.unreadySelf()
    }
    else if(this.imNotReady.checkTouch(endX, endY, initX, initY)){
      this.readySelf()
    }
    else if(this.inviteButton.checkTouch(endX, endY, initX, initY)){
      this.inviteEnemy()
    }
    else if(this.exitButton.checkTouch(endX, endY, initX, initY)){
        this.exit()
      }
  }
}