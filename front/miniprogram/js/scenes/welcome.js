import GameStatus from '../status'
import UI from '../base/ui'
import Network from '../base/network'
import Button from '../world/button'
import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'

let gamestatus = new GameStatus()
let network = new Network()
export default class WelcomeScene extends UI {
  constructor(){
    super('resources/startbg.png')
    this.handlingAuth = false
    this.setUpScene()
  }
  setUpScene(){
    this.doWeHaveToUseThis = wx.createUserInfoButton({
      type: 'image',
      image: 'resources/start.png',
      style: {
        left: 608 * window.innerWidth / 1920,
        top: 632 * window.innerHeight / 1080,
        width: 510 * window.innerWidth / 1920,
        height: 154 * window.innerHeight / 1080
      }
    })
    this.doWeHaveToUseThis.onTap((info) => {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          console.log('called cloud function')
          gamestatus.openID = res.result.openid
          this.handleAuthorizeEvent(info)
        },
        fail: err => {
          console.error('get openid failed with error', err)
        }
      })      
    })
    this.buttonsSet = false
    this.btnRanklist = new Button('resources/rank_button.png', 152, 152, 0 , 0)
    this.btnBack = new Button('resources/back_button.png',121, 123,-650,-385)
    this.tryToInitButtons()
  }
  fail(res){
    console.log(`fail info: ${res}`)
  }

  tryToInitButtons() {
    if (!this.loaded) {
      return
    }
    if (this.btnRanklist.loaded && !this.btnRanklist.boundScene) {
      this.btnRanklist.init(this.scene)
      this.btnRanklist.showButton()
    }

    if (this.btnBack.loaded && !this.btnBack.boundScene) {
      this.btnBack.init(this.scene)
      this.btnBack.hideButton()
    }

    this.buttonsSet = this.buttonsSet || (this.btnRanklist.boundScene && this.btnBack.boundScene)
  }
  handleAuthorizeEvent(res){
    if(this.handlingAuth){
      return
    }
    this.handlingAuth = true
    let shareData = wx.getLaunchOptionsSync().query.teamid
    gamestatus.setSelfInfo(JSON.parse(res.rawData))
    console.log(shareData)
    if(shareData === undefined){
      console.log('host')
      gamestatus.host = true
      network.login(gamestatus.openID, gamestatus.selfInfo, ()=>{
        network.createTeam(gamestatus.openID, (res)=>{
          gamestatus.roomID = res.teamid
          network.initSocket(()=>{
            gamestatus.socketOn = true
            network.sendOpenid(gamestatus.openID, ()=>{
              this.animation = true
              this.doWeHaveToUseThis.hide()
            }, this.fail)
          }, this.fail)
        }, this.fail)
      }, this.fail)
    }
    else{
      gamestatus.host = false
      gamestatus.roomID = shareData
      network.login(gamestatus.openID, gamestatus.selfInfo, ()=>{
        console.log(gamestatus.openID)
        console.log(gamestatus.roomID)
        network.joinTeam(gamestatus.openID, gamestatus.roomID ,(res)=>{
          console.log('gest')
          network.initSocket(()=>{
            gamestatus.socketOn = true
            network.sendOpenid(gamestatus.openID, ()=>{
              this.animation = true
              this.doWeHaveToUseThis.hide()
            }, this.fail)
          }, this.fail)
        }, this.fail)
      }, this.fail)
    }
  }
  showRanklist() {
    let openDataContext = wx.getOpenDataContext()
    let sharedCanvas = openDataContext.canvas
    let texture = new THREE.CanvasTexture(sharedCanvas)
    let material = new THREE.MeshLambertMaterial({
      map: texture
    })
    let geometry = new THREE.PlaneGeometry(1450, 800, 1, 1)
    this.rankList = new THREE.Mesh(geometry, material)
    this.scene.add(this.rankList)
  }

  hideRanklist() {
    this.scene.remove(this.rankList)
  }

  loop(){
    if(!this.loaded){
      return
    }
    if(this.animation){
      this.fade()
    }
    this.tryToInitButtons()
  }
  fade(){
    this.frame += 1
    //console.log(this.frame)
    this.light.intensity -= 0.5 / CONST.SWITCH_SHORT_FRAME
    this.aLight.intensity -= 0.5 / CONST.SWITCH_SHORT_FRAME
    if(this.frame === CONST.SWITCH_SHORT_FRAME){
      this.animation = false
      gamestatus.switchToLobby = true
      this.display = false
    }
  }
  handleTouchEvents(res) {
    if (!this.buttonsSet) {
      return
    }
    let endX = res.endX
    let endY = res.endY
    let initX = res.initX
    let initY = res.initY
    if (this.btnRanklist.checkTouch(endX, endY, initX, initY)) {
      this.doWeHaveToUseThis.hide()
      this.btnRanklist.hideButton()
      this.btnBack.showButton()
      this.showRanklist()
    }
    else if (this.btnBack.checkTouch(endX, endY, initX, initY)) {
      this.btnBack.hideButton()
      this.doWeHaveToUseThis.show()
      this.btnRanklist.showButton()
      this.hideRanklist()
    }
  }
}