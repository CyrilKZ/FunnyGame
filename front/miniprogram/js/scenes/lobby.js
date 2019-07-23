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

    this.imReady = new Button('resources/ready.png', this.readySelf, CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, 200)
    this.imNotReady = new Button('resources/notready.png', this.unreadySelf, CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, 200)
    this.selfPhoto = null

    this.othersReady = new DisplayBox('resources/ready.png', this.readySelf, CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, -500, 1)
    this.othersNotReady = new DisplayBox('resources/notready.png', this.readySelf, CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, -500, 1)
    this.inviteButton = new Button('resources/invite.png', this.inviteEnemy, CONST.PHOTO_SIZE, CONST/PHOTO_SIZE, -800, -200)
    this.enemyPhoto = null

    this.enemyJoined = false
    this.isSetUp = false
    this.buttonsSet = false
    this.selfPhotoSet = false
    this.enemyPhotoSet = false
    this.tryToInitButtons()
  }
  tryToInitButtons(){
    if(!this.loaded){
      return
    }
    if(this.imReady.loaded && !this.imReady.boundScene){
      this.imReady.init(this.scene)
    }
    if(this.imNotReady.loaded && !this.imNotReady.boundScene){
      this.imNotReady.init(this.scene)
    }
    if(this.inviteButton.loaded && !this.inviteButton.boundScene){
      this.inviteButton.init(this.scene)
    }
    this.isSetUp = this.isSetUp || (this.imReady.boundScene && this.imNotReady.boundScene && this.inviteButton.boundScene)
  }
  readySelf(){
    if(!this.enemyJoined){
      return
    }
    network.sendReady(true, ()=>{
      gamestatus.selfReady = true
      this.imNotReady.hideButton()
      this.imReady.showButton()
    })
  }
  unreadySelf(){
    if(!this.enemyJoined){
      return
    }
    network.sendReady(false, ()=>{
      gamestatus.selfReady = false
      this.imReady.hideButton()
      this.imNotReady.showButton()
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
    this.selfPhoto = new DisplayBox(gamestatus.selfInfo.picUrl, CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, 800, 500, 1)
  }
  tryShowEnemyInfo(){
    if(this.enemyPhotoSet){
      return
    }
    if(gamestatus.enemyInfo.picUrl === ''){
      return
    }
    if(this.enemyInfo){
      if(this.enemyPhoto.boundScene){
        this.enemyPhotoSet = true
        return
      }
      if(this.enemyPhoto.loaded){
        this.enemyPhoto.initToScene(this.scene)
        return
      }
    }
    this.enemyPhoto = new DisplayBox(gamestatus.enemyInfo.picUrl, CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, 800, -200, 1)
  }
  inviteEnemy(){
    this.enemyJoined = false
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
  enemyJoin(){
    this.tryShowEnemyInfo()
    this.inviteButton.hideButton()
    this.enemyJoined = true
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
  }
  loop(){
    if(!this.isSetUp){
      return
    }
    this.update()
    if(this.animation){
      this.fade()
    }
  }
  fade(){
    this.frame += 1
    this.light.intensity -= 0.5 / CONST.SWITCH_SHORT_FRAME
    if(this.frame === CONST.SWITCH_SHORT_FRAME){
      this.frame = 0
      this.animation = false
      gamestatus.switchToGame = true
      this.display = false
    }
  }
  restore(){
    this.light.intensity = 0.5
  }
}