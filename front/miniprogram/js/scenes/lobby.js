import * as CONST from '../libs/constants'
import * as THREE from '../libs/three.min'
import GameStatus from '../status'
import UI from '../base/ui'
import Button from '../world/button'
import DisplayBox from '../base/displaybox'
import Network from '../base/network'

const gamestatus = new GameStatus()
const network = new Network()
export default class LobbyScene extends UI {
  constructor () {
    super('resources/lobbybg.png')

    this.enemyJoined = false
    this.isSetUp = false
    this.buttonsSet = false
    this.selfPhotoSet = false
    this.enemyPhotoSet = false

    this.imReady = new Button('resources/ready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, -375)
    this.imNotReady = new Button('resources/notready.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -800, -375)
    this.exitButton = new Button('resources/exit.png', CONST.READY_BUTTON_LX, CONST.READY_BUTTON_LY, -250, -375)
    this.inviteButton = new Button('resources/invite.png', CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -118, 5)
    this.selfPhoto = null

    this.othersReady = new DisplayBox('resources/onready.png', 170, 147, -50, -50, 2)
    this.selfReady = new DisplayBox('resources/onready.png', 170, 147, -660, -50, 2)
    this.enemyPhoto = null

    this.enemyName = null
    this.selfName = null

    this.tryToInitButtons()
  }

  tryToInitButtons () {
    if (!this.loaded) {
      return
    }
    if (this.imReady.loaded && !this.imReady.boundScene) {
      this.imReady.init(this.scene)
      this.imReady.hideButton()
    }
    if (this.imNotReady.loaded && !this.imNotReady.boundScene) {
      this.imNotReady.init(this.scene)
    }
    if (this.inviteButton.loaded && !this.inviteButton.boundScene) {
      this.inviteButton.init(this.scene)
    }
    if (this.exitButton.loaded && !this.exitButton.boundScene) {
      this.exitButton.init(this.scene)
    }
    this.buttonsSet = this.buttonsSet || (this.imReady.boundScene && this.imNotReady.boundScene && this.inviteButton.boundScene && this.exitButton.boundScene)
  }

  readySelf () {
    const self = this
    if (!this.selfReady.boundScene) {
      this.selfReady.initToScene(this.scene)
    }
    this.selfReady.show()

    console.log('ready')
    console.log(self.enemyJoined)

    network.sendReady(true, () => {
      gamestatus.selfReady = true
      self.imNotReady.hideButton()
      self.imReady.showButton()
    })
  }

  unreadySelf () {
    if (this.selfReady.boundScene) {
      this.selfReady.hide()
    }

    const self = this
    network.sendReady(false, () => {
      gamestatus.selfReady = false
      self.imReady.hideButton()
      self.imNotReady.showButton()
    })
  }

  setEnemyReady (ready) {
    gamestatus.enemyReady = ready
    if (!this.othersReady.boundScene) {
      this.othersReady.initToScene(this.scene)
    }
    if (ready) {
      this.othersReady.show()
    } else {
      this.othersReady.hide()
    }
  }

  tryShowSelfInfo () {
    if (this.selfPhotoSet) {
      return
    }
    if (gamestatus.selfInfo.picUrl === '') {
      return
    }

    if (gamestatus.selfInfo.texture) {
      this.selfPhoto = new DisplayBox(gamestatus.selfInfo.texture, CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -725, 5, 1)
      this.renderSelfName()
      this.selfPhoto.initToScene(this.scene)
      this.selfPhotoSet = true
    }
  }

  tryShowEnemyInfo () {
    if (this.enemyPhotoSet) {
      return
    }
    if (gamestatus.enemyInfo.picUrl === '') {
      return
    }

    if (gamestatus.enemyInfo.texture) {
      this.enemyPhoto = new DisplayBox(gamestatus.enemyInfo.texture, CONST.PHOTO_SIZE, CONST.PHOTO_SIZE, -118, 5, 1)
      this.enemyPhoto.initToScene(this.scene)
      this.enemyPhotoSet = true
      this.enemyJoined = true
      this.inviteButton.hideButton()
      this.renderEnemyName()
    }
  }

  renderSelfName () {
    const canvas = wx.createCanvas()
    canvas.width = 400
    canvas.height = 100
    const context = canvas.getContext('2d')

    context.fillStyle = '#000'
    context.font = '54px 微软雅黑'
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.fillText(gamestatus.selfInfo.nickName, 200, 50, 400)

    const texture = new THREE.CanvasTexture(canvas)
    this.selfName = new DisplayBox(texture, canvas.width, canvas.height, -830, -130)
    this.selfName.initToScene(this.scene)
  }

  renderEnemyName () {
    const canvas = wx.createCanvas()
    canvas.width = 400
    canvas.height = 100
    const context = canvas.getContext('2d')

    context.fillStyle = '#000'
    context.font = '54px 微软雅黑'
    context.textBaseline = 'middle'
    context.textAlign = 'center'
    context.fillText(gamestatus.enemyInfo.nickName, 200, 50, 400)

    const texture = new THREE.CanvasTexture(canvas)
    this.enemyName = new DisplayBox(texture, canvas.width, canvas.height, -220, -130)
    this.enemyName.initToScene(this.scene)
  }

  inviteEnemy () {
    console.log('invite')
    wx.shareAppMessage({
      title: '快来加入我的游戏',
      query: 'teamid=' + gamestatus.lobbyID.toString()
    })
  }

  enemyLeave () {
    if (this.enemyPhoto && this.enemyPhoto.boundScene) {
      this.enemyPhoto.removeFromScene(this.scene)
      this.enemyPhoto.discard()
      if (this.enemyName.boundScene) {
        this.enemyName.removeFromScene(this.scene)
      }
    }
    this.enemyPhotoSet = false

    gamestatus.clearEnemyInfo()

    this.inviteButton.showButton()
    this.enemyJoined = false
    gamestatus.host = true
  }

  update () {
    if (!this.buttonsSet) {
      this.tryToInitButtons()
    }
    if (!this.selfPhotoSet) {
      this.tryShowSelfInfo()
    }
    if (!this.enemyPhotoSet) {
      this.tryShowEnemyInfo()
    }
    this.isSetUp = this.isSetUp || (this.buttonsSet && this.selfPhotoSet && this.enemyPhotoSet)
  }

  initStartAnimation () {
    this.startAnimation = true
    this.light.intensity = 2
    this.animationFrame = 0
  }

  exit () {
    this.unreadySelf()
    const self = this
    network.exitTeam(gamestatus.openID, gamestatus.lobbyID, () => {
      gamestatus.clearEnemyInfo()
      gamestatus.socketOn = false
      gamestatus.host = true
      gamestatus.restart = true
      gamestatus.lobbyID = ''
      gamestatus.initialQuery = ''
      gamestatus.onshowQuery = ''
      self.enemyLeave()
    })
  }

  updateStartAnimation () {
    if (this.animationFrame === CONST.SWITCH_SHORT_FRAME) {
      this.light.intensity = 0
      this.startAnimation = false
      this.animationFrame = 0
      this.unreadySelf()
      return
    }
    this.light.intensity -= 2 / CONST.SWITCH_SHORT_FRAME
    this.animationFrame += 1
  }

  initEndAnimation () {
    this.endAnimation = true
    this.light.intensity = 0
    this.animationFrame = 0
  }

  updateEndAnimation () {
    if (this.animationFrame === CONST.SWITCH_SHORT_FRAME) {
      this.light.intensity = 2
      this.endAnimation = false
      this.animationFrame = 0
      gamestatus.switchToGame = true
      return
    }
    this.light.intensity += 2 / CONST.SWITCH_SHORT_FRAME
    this.animationFrame += 1
  }

  loop () {
    this.update()
    if (this.startAnimation) {
      this.updateStartAnimation()
    } else if (this.endAnimation) {
      this.updateEndAnimation()
    } else if (gamestatus.enemyDisconnect) {
      this.setEnemyReady(false)
      this.enemyLeave()
      gamestatus.enemyDisconnect = false
    }
  }

  restore () {
    this.light.intensity = 0
    this.aLight.intensity = 1
    this.display = true
  }

  handleTouchEvents (res) {
    if (!this.buttonsSet || this.startAnimation || this.endAnimation) {
      return
    }
    const endX = res.endX
    const endY = res.endY
    const initX = res.initX
    const initY = res.initY
    if (this.imReady.checkTouch(endX, endY, initX, initY)) {
      this.unreadySelf()
    } else if (this.imNotReady.checkTouch(endX, endY, initX, initY)) {
      this.readySelf()
    } else if (this.inviteButton.checkTouch(endX, endY, initX, initY)) {
      this.inviteEnemy()
    } else if (this.exitButton.checkTouch(endX, endY, initX, initY)) {
      this.exit()
    }
  }
}
