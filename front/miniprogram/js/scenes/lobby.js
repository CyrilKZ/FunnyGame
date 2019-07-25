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
    super('resources/startbg.png')

    this.enemyJoined = false
    this.isSetUp = false
    this.buttonsSet = false
    this.selfPhotoSet = false
    this.enemyPhotoSet = false

    this.imReady = new Button('resources/ready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, 50)
    this.imNotReady = new Button('resources/notready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, 50)
    this.selfPhoto = null

    this.othersReady = new DisplayBox('resources/ready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, -500, 1)
    this.othersNotReady = new DisplayBox('resources/notready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, -500, 1)
    this.inviteButton = new Button('resources/invite.png', CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -800, -300)
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
    this.buttonsSet = this.buttonsSet || (this.imReady.boundScene && this.imNotReady.boundScene && this.inviteButton.boundScene)
  }
  readySelf(){
    let self = this
    console.log('ready')
    console.log(self.enemyJoined)
    if(!self.enemyJoined){
      return
    }
    
    network.sendReady(true, ()=>{
      gamestatus.selfReady = true
      self.imNotReady.hideButton()
      self.imReady.showButton()
    })
  }
  unreadySelf(){
    let self = this
    if(!self.enemyJoined){
      return
    }
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
    if(this.selfPhoto){
      if(this.selfPhoto.boundScene){        
        this.selfPhotoSet = true
        return
      }
      if(this.selfPhoto.loaded){
        this.selfPhoto.initToScene(this.scene)
        return
      }
    }
    else{
      this.selfPhoto = new DisplayBox(gamestatus.selfInfo.picUrl, CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -800, 200, 1)
    }    
  }
  tryShowEnemyInfo(){
    if(this.enemyPhotoSet){
      return
    }
    if(gamestatus.enemyInfo.picUrl === ''){
      return
    }
    if(this.enemyPhoto){
      if(this.enemyPhoto.boundScene){
        this.enemyPhotoSet = true
        return
      }
      if(this.enemyPhoto.loaded){
        console.log(this.enemyPhoto)
        this.enemyPhoto.initToScene(this.scene)
        return
      }
    }
    else{
      this.enemyPhoto = new DisplayBox(gamestatus.enemyInfo.picUrl, CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -800, -300, 1)
      this.enemyJoined = true
      this.inviteButton.hideButton()
    }   
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
    if(this.imNotReady.checkTouch(endX, endY, initX, initY)){
      this.readySelf()
    }
    if(this.inviteButton.checkTouch(endX, endY, initX, initY)){
      this.inviteEnemy()
    }
  }
}