import Pool from './base/pool'
import * as THREE from './libs/three.min'
import Network from './base/network'
// import * as CONST from './libs/constants'
const network = new Network()

let instance
export default class GameStatus {
  constructor () {
    if (instance) {
      return instance
    }
    instance = this
    this.pool = new Pool()

    this.init()
    this.reset()
  }

  init () {
    this.restart = false
    this.switchToLobby = false
    this.switchToGame = false
    this.switchToResult = false

    this.host = true

    this.selfInfo = {
      nickName: '',
      picUrl: '',
      image: null,
      texture: null
    }

    this.enemyInfo = {
      nickName: '',
      picUrl: '',
      image: null,
      texture: null
    }

    this.lobbyID = ''
    this.openID = ''
    this.socketOn = false

    this.selfReady = false
    this.enemyReady = false

    this.initialQuery = ''
    this.onshowQuery = ''

    this.gameOn = false
    this.pause = false
    this.enemyDisconnect = false
  }

  reset () {
    this.frame = 0
    this.aniFrame = 0
    this.step = 0
    this.speed = 1.2
    this.accel = 0
    this.blocks = [[], [], [], []]
    this.heroWillHit = false
    this.heroSide = 0
    this.heroHit = false
    this.enemyHit = false
    this.enemyWillHit = false
    this.enemySide = 0

    this.selfScore = 0
    this.enemyScore = 0

    this.absDistance = 0
  }

  removeBlock (block) {
    const temp = this.blocks[block.row].shift()
    temp.hide()
    this.pool.recover('block', block)
  }

  recycleAllBlock () {
    for (let i = 0; i < 4; ++i) {
      while (this.blocks[i].length > 0) {
        const temp = this.blocks[i].shift()
        temp.hide()
        this.pool.recover('block', temp)
      }
    }
  }

  setSelfInfo (info) {
    this.selfInfo.nickName = info.nickName
    this.selfInfo.picUrl = info.avatarUrl
    this.selfInfo.image = wx.createImage()
    this.selfInfo.image.src = this.selfInfo.picUrl
    const loader = new THREE.TextureLoader()
    const self = this
    loader.load(
      self.selfInfo.picUrl,
      function (texture) {
        self.selfInfo.texture = texture
      }
    )
  }

  clearEnemyInfo () {
    this.enemyInfo = {
      nickName: '',
      picUrl: '',
      image: null,
      texture: null
    }
  }

  setEnemyInfo (info) {
    this.enemyInfo.nickName = info.nickName
    this.enemyInfo.picUrl = info.picUrl
    this.enemyInfo.image = wx.createImage()
    this.enemyInfo.image.src = this.enemyInfo.picUrl
    const loader = new THREE.TextureLoader()
    const self = this
    loader.load(
      self.enemyInfo.picUrl,
      function (texture) {
        self.enemyInfo.texture = texture
      }
    )
  }

  joinLobby (lobbyid) {
    const self = this
    const fail = function (res) {
      wx.showToast({
        title: res.errMsg,
        icon: 'none'
      })
    }
    network.joinTeam(this.openID, lobbyid, (res) => {
      if (res.result === 0) {
        self.host = false
        network.initSocket(() => {
          self.socketOn = true
          network.sendOpenid(self.openID, () => {
            network.sendPause(false, () => {
              self.lobbyID = lobbyid
            }, fail)
          }, fail)
        }, fail)
      }
    })
  }
}
