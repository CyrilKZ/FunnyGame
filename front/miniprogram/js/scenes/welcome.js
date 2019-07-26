import GameStatus from '../status'
import UI from '../base/ui'
import Network from '../base/network'
import Button from '../world/button'
import DisplayBox from '../base/displaybox'
import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'

let gamestatus = new GameStatus()
let network = new Network()
export default class WelcomeScene extends UI {
  constructor() {
    super('resources/startbg.png')
    this.handlingAuth = false
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        console.log('called cloud function')
        gamestatus.openID = res.result.openid
        wx.postMessage({
            command: 'init',
            openid: res.result.openid
          })
      },
      fail: err => {
        console.error('get openid failed with error', err)
      }
    })
    gamestatus.initialQuery = wx.getLaunchOptionsSync().query.teamid
    this.setUpScene()
  }
  setUpScene() {
    this.doWeHaveToUseThis = wx.createUserInfoButton({
      type: 'image',
      image: 'resources/start.png',
      style: {
        left: 705 * window.innerWidth / 1920,
        top: 630 * window.innerHeight / 1080,
        width: 510 * window.innerWidth / 1920,
        height: 154 * window.innerHeight / 1080
      }
    })
    this.doWeHaveToUseThis.onTap((info) => {
      this.handleAuthorizeEvent(info)
    })

    this.welcomed = false

    this.buttonsSet = false
    this.btnRanklist = new Button('resources/rank_button.png', 122, 169, 581, -460)
    this.btnHelp = new Button('resources/help_button.png', 122, 169, 756, -460)
    this.btnBack = new Button('resources/back_button.png', 100, 100, -690, 275, 3)
    this.tryToInitButtons()

    this.helpBox = new DisplayBox('resources/helpbg.png', 1450, 800, -725, -400, 2, true)
  }
  fail(res){
    console.log(res)
    wx.showToast({
      title: res.errMsg,
      icon: 'none'
    })
  }

  tryToInitButtons() {
    if (!this.loaded) {
      return
    }
    if (this.btnRanklist.loaded && !this.btnRanklist.boundScene) {
      this.btnRanklist.init(this.scene)
      this.btnRanklist.showButton()
    }

    if (this.btnHelp.loaded && !this.btnHelp.boundScene) {
      this.btnHelp.init(this.scene)
      this.btnHelp.showButton()
    }

    if (this.btnBack.loaded && !this.btnBack.boundScene) {
      this.btnBack.init(this.scene)
      this.btnBack.hideButton()
    }

    this.buttonsSet = this.buttonsSet || (this.btnRanklist.boundScene && this.btnBack.boundScene)
  }
  handleAuthorizeEvent(res) {
    if (this.handlingAuth) {
      return
    }
    let self = this
    this.handlingAuth = true
    let shareData = gamestatus.initialQuery
    if(shareData === undefined || shareData === ''){
      shareData = gamestatus.onshowQuery
    }
    gamestatus.setSelfInfo(JSON.parse(res.rawData))
    console.log(shareData)
    if (shareData === undefined || shareData === '') {
      console.log('host')
      gamestatus.host = true
      network.login(gamestatus.openID, gamestatus.selfInfo, ()=>{
        network.createTeam(gamestatus.openID, (res)=>{
          gamestatus.lobbyID = res.teamid
          network.initSocket(()=>{
            gamestatus.socketOn = true
            network.sendOpenid(gamestatus.openID, () => {
              self.animation = true
              self.doWeHaveToUseThis.hide()
              self.handlingAuth = false
              self.welcomed = true
              //network.sendPause(false)
            }, self.fail)
          }, self.fail)
        }, self.fail)
      }, self.fail)
    }
    else {
      gamestatus.host = false
      gamestatus.lobbyID = shareData
      network.login(gamestatus.openID, gamestatus.selfInfo, ()=>{
        console.log(gamestatus.openID)
        console.log(gamestatus.lobbyID)
        network.joinTeam(gamestatus.openID, gamestatus.lobbyID ,(res)=>{
          console.log('gest')
          network.initSocket(() => {
            gamestatus.socketOn = true
            network.sendOpenid(gamestatus.openID, () => {
              self.animation = true
              self.doWeHaveToUseThis.hide()
              self.handlingAuth = false
              self.welcomed = true
              //network.sendPause(false)
            }, self.fail)
          }, self.fail)
        }, self.fail)
      }, self.fail)
    }
  }
  showRanklist() {
    let openDataContext = wx.getOpenDataContext()
    let sharedCanvas = openDataContext.canvas
    let texture = new THREE.CanvasTexture(sharedCanvas)
    this.rankList = new DisplayBox(texture, 1450, 800, -725, -400, 2, true)
    this.rankList.initToScene(this.scene)
  }

  loop() {
    if (!this.loaded) {
      return
    }
    if (this.animation) {
      this.fade()
    }
    this.tryToInitButtons()
  }
  fade() {
    this.frame += 1
    this.light.intensity += 4 / CONST.SWITCH_SHORT_FRAME
    this.aLight.intensity += 4 / CONST.SWITCH_SHORT_FRAME
    if (this.frame === CONST.SWITCH_SHORT_FRAME) {
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
      this.btnHelp.hideButton()
      this.btnBack.showButton()
      this.showRanklist()
    }
    else if (this.btnBack.checkTouch(endX, endY, initX, initY)) {
      this.btnBack.hideButton()
      this.doWeHaveToUseThis.show()
      this.btnRanklist.showButton()
      this.btnHelp.showButton()
      this.helpBox.hide()
      this.rankList.hide()
    }
    else if (this.btnHelp.checkTouch(endX, endY, initX, initY)) {
      this.doWeHaveToUseThis.hide()
      this.btnRanklist.hideButton()
      this.btnHelp.hideButton()
      this.btnBack.showButton()
      this.helpBox.initToScene(this.scene)
      this.helpBox.show()
    }
  }
}