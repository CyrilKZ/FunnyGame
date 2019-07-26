import GameScene from './scenes/gamescene'
import WelcomScene from './scenes/welcome'
import * as THREE from './libs/three.min'
import * as CONST from './libs/constants'
import GameStatus from './status'
import LobbyScene from './scenes/lobby'
import TouchEvents from './base/touch'
import Network from './base/network'

const ctx = canvas.getContext('webgl')
const renderer = new THREE.WebGLRenderer({
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

const gamestatus = new GameStatus()
const touchevents = new TouchEvents()
const network = new Network()

export default class Game {
  constructor () {
    this.aniID = 0
    this.gameScene = new GameScene()

    this.stages = [
      new WelcomScene(),
      new LobbyScene()
    ]
    this.currentStage = CONST.STAGE_WELCOME
    this.initTouchEvents()

    wx.setKeepScreenOn({
      keepScreenOn: true
    })
    const self = this
    network.onJoin = function (data) {
      console.log(data.userinfo)
      gamestatus.setEnemyInfo(data.userinfo)
    }
    network.onStart = function () {
      if (gamestatus.gameOn) {
        return
      }
      self.stages[CONST.STAGE_LOBBY].initEndAnimation()
      self.gameScene.initCharacters()
    }
    network.onReady = function (data) {
      self.stages[CONST.STAGE_LOBBY].setEnemyReady(data.state)
    }
    network.onExit = function (data) {
      console.log('exit')
      gamestatus.pause = false
      gamestatus.enemyDisconnect = true
    }
    network.onClose = function () {
      gamestatus.socketOn = false
    }
    network.onPause = function (data) {
      gamestatus.pause = data.state
      if (data.state) {
        // 对方暂停连接
        if (gamestatus.gameOn) {
          wx.showLoading({
            title: '对方已断开连接',
            icon: 'loading'
          })
        }
        return
      }
      // 对方重连
      if (gamestatus.gameOn) {
        wx.hideLoading()
      }
    }
    wx.onHide(function () {
      if (self.currentStage === CONST.STAGE_LOBBY) {
        // 取消自身准备状态
        self.stages[CONST.STAGE_LOBBY].unreadySelf()
      }
      if (gamestatus.socketOn) {
        network.sendPause(true, () => {
          gamestatus.pause = true
        })
      }
    })
    wx.onShow(function (obj) {
      const fail = function () {
        wx.showToast({
          title: '连接失败',
          icon: 'none'
        })
        gamestatus.restart = true
      }

      gamestatus.onshowQuery = obj.query.teamid
      const shareData = obj.query.teamid
      console.log(`sharedata: ${shareData}`)
      if (self.currentStage === CONST.STAGE_LOBBY) {
        // 重连进入房间界面
        if (shareData && shareData !== gamestatus.lobbyID) {
          wx.showToast({
            title: '请先退出房间!',
            icon: 'none'
          })
        }
        network.initSocket(() => {
          network.sendOpenid(gamestatus.openID, () => {
            network.sendPause(false, () => {
              gamestatus.socketOn = true
              gamestatus.pause = false
            }, fail)
          }, fail)
        }, fail)
      } else if (self.currentStage !== CONST.STAGE_WELCOME) {
        network.initSocket(() => {
          network.sendOpenid(gamestatus.openID, () => {
            network.sendPause(false, () => {
              wx.showToast({
                title: '连接成功'
              })
              gamestatus.socketOn = true
              gamestatus.pause = false
            }, fail)
          }, fail)
        }, fail)
      }
    })
    wx.onNetworkStatusChange(function (res) {
      gamestatus.restart = true
      self.stages[CONST.STAGE_LOBBY].enemyLeave()
      gamestatus.lobbyID = ''
      gamestatus.initialQuery = ''
      gamestatus.onshowQuery = ''
      gamestatus.clearEnemyInfo()
      gamestatus.socketOn = false
      gamestatus.host = true
    })
    this.restart()
  }

  restart () {
    this.frame = 0
    this.bindLoop = this.loop.bind(this)
    window.cancelAnimationFrame(this.aniID)
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  loop () {
    if (gamestatus.restart) {
      gamestatus.restart = false
      this.stages[0].restart()
      this.stages[1].restart()
      this.gameScene.reboot()
      this.currentStage = CONST.STAGE_WELCOME
      this.stages[CONST.STAGE_WELCOME].doWeHaveToUseThis.show()
      gamestatus.reset()
    }
    if (gamestatus.switchToLobby) {
      this.stages[CONST.STAGE_LOBBY].restore()
      this.stages[CONST.STAGE_LOBBY].initStartAnimation()
      this.gameScene.resetRenderer()
      this.gameScene.initSyncAnimation()
      this.currentStage = CONST.STAGE_LOBBY
      gamestatus.switchToLobby = false
    } else if (gamestatus.switchToGame) {
      this.stages[CONST.STAGE_LOBBY].unreadySelf()
      this.currentStage = CONST.STAGE_GAME
      this.gameScene.initStartAnimation()
      gamestatus.switchToGame = false
    }

    if (!this.gameScene.loaded) {
      this.gameScene.tryToSetUp()
    } else {
      this.gameScene.loop()
    }
    this.stages.forEach((stage) => {
      stage.loop()
    })

    this.render()
  }

  render () {
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
    if (this.currentStage !== CONST.STAGE_GAME) {
      this.stages[this.currentStage].render(renderer)
    }
    this.gameScene.render(renderer)
  }

  handleTouchEvents (res) {
    if (this.currentStage !== CONST.STAGE_GAME) {
      this.stages[this.currentStage].handleTouchEvents(res)
    } else {
      this.gameScene.handleTouchEvents(res)
    }
  }

  initTouchEvents () {
    touchevents.reset()
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      e.touches.forEach((item) => {
        touchevents.addEvent(item)
      })
    })
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      e.touches.forEach((item) => {
        touchevents.followUpEvent(item)
      })
    })
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      e.changedTouches.forEach((item) => {
        const res = touchevents.removeEvent(item)
        console.log(res)
        this.handleTouchEvents(res)
      })
    })
  }
}
