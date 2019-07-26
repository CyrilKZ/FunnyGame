import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'
import GameStatus from '../status'

const bg2 = wx.createImage()
bg2.src = 'resources/finishbg.png'

const winner = wx.createImage()
winner.src = 'resources/winner.png'

const gamestatus = new GameStatus()

export default class ResultPanel {
  constructor () {
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-CONST.SCREEN_X / 2, CONST.SCREEN_X / 2, CONST.SCREEN_Y / 2, -CONST.SCREEN_Y / 2, 1, 2000)
    this.aLight = new THREE.AmbientLight(0xffffff, 0.5)

    this.camera.position.z = 100
    // this.scene.add(this.aLight)
    this.ground = null
    this.texture = null
    this.visible = false
  }

  preInit () {
    const data = {
      win: gamestatus.enemyHit,
      thisUser: { // 本机用户
        nickname: gamestatus.selfInfo.nickName,
        avatar: gamestatus.selfInfo.image,
        score: gamestatus.selfScore
      },
      thatUser: { // 对方用户
        nickname: gamestatus.enemyInfo.nickName,
        avatar: gamestatus.enemyInfo.image,
        score: gamestatus.enemyScore
      }
    }
    const canvas = wx.createCanvas()
    canvas.width = 1450
    canvas.height = 800
    const context = canvas.getContext('2d')
    context.drawImage(bg2, 0, 0)
    context.drawImage(data.thisUser.avatar, 20, 325, 150, 150)
    context.drawImage(data.thatUser.avatar, 745, 325, 150, 150)
    context.font = '42px 微软雅黑'
    context.fillStyle = '#FFF'
    context.textBaseline = 'top'
    context.fillText(data.thisUser.nickname, 205, 325, 250)
    context.fillText(data.thatUser.nickname, 930, 325, 250)
    context.textBaseline = 'middle'
    context.font = '72px 微软雅黑'
    context.fillText(data.thisUser.score, 525, 400, 200)
    context.fillText(data.thatUser.score, 1250, 400, 200)
    if (data.win) {
      context.drawImage(winner, 205, 405)
    } else {
      context.drawImage(winner, 930, 405)
    }
    console.log(`pre init complete`)
    this.texture = new THREE.CanvasTexture(canvas)
  }

  init () {
    const geometry = new THREE.PlaneGeometry(CONST.PANEL_WIDTH, CONST.PANEL_HEIGHT, 1, 1)
    const material = new THREE.MeshBasicMaterial({ map: this.texture })
    this.ground = new THREE.Mesh(geometry, material)
    this.scene.add(this.ground)
  }

  reset () {
    this.scene.remove(this.ground)
    this.ground = null
    this.texture = null
  }

  show () {
    this.visible = true
  }

  hide () {
    this.visible = false
  }

  // render
  setupRenderer (renderer) {
    renderer.setScissor((CONST.SCREEN_X - CONST.PANEL_WIDTH) / 2, (CONST.SCREEN_Y - CONST.PANEL_HEIGHT) / 2, CONST.PANEL_WIDTH, CONST.PANEL_HEIGHT)
    renderer.setViewport(0, 0, 1920, 1080)
  }

  render (renderer) {
    if (!this.visible) {
      return
    }
    this.setupRenderer(renderer)
    renderer.render(this.scene, this.camera)
  }
}
