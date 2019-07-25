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

    this.imReady = new Button('resources/ready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -825, 300)
    this.imNotReady = new Button('resources/notready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -820, -300)
    this.exitButton = new Button('resources/exit.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -820, -450)
    this.inviteButton = new Button('resources/invite.png', CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -118, 5)
    this.selfPhoto = null

    this.othersReady = new DisplayBox('resources/ready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, -500, 1)
    this.othersNotReady = new DisplayBox('resources/notready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, -500, 1)
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
      this.othersReady.show()
      this.othersNotReady.hide()
    }
    else{
      this.othersNotReady.show()
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
      this.selfPhoto.initToScene(this.scene)
      this.selfPhotoSet = true
    }
    this.renderName()
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
    }
  }

  renderName(){
    let canvas = wx.createCanvas()
    canvas.width = 100
    canvas.height = 200
    let context = canvas.getContext('2d')
    context.fillStyle = "#FFF"
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = "#000"
    context.font = "48px 微软雅黑"
    context.textBaseline = 'middle'
    context.fillText(gamestatus.selfInfo.nickName, 0, 50, 250)
    if (gamestatus.enemyInfo.picUrl === ''){

    }

    let texture = new THREE.CanvasTexture(canvas)
    let material = new THREE.MeshLambertMaterial({
      map: texture
    })
    let geometry = new THREE.PlaneGeometry(canvas.width, canvas.height, 1, 1)
    let mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
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