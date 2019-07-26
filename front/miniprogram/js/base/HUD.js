import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'
import GameStatus from '../status'
import DisplayBox from '../base/displaybox'

const gamestatus = new GameStatus()

export default class HUD {
  constructor () {
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-CONST.SCREEN_X / 2, CONST.SCREEN_X / 2, CONST.SCREEN_Y / 2, -CONST.SCREEN_Y / 2, 1, 1000)

    this.scene.background = 'rgba(0,0,0, 0)'
    this.camera.position.z = 100

    this.visible = false

    this.selfPhoto = null
    this.selfPhotoSet = false

    this.enemyPic = null
    this.enemyPicSet = false

    this.frame = 0

    this.fullyInit = [false, false, false]
    this.loaded = false

    this.manaIcons = []
    this.manaGeometry = new THREE.PlaneGeometry(CONST.HUD_MANA_SIZE, CONST.HUD_MANA_SIZE, 1, 1)
    this.manaMaterial = new THREE.MeshBasicMaterial({ color: 0x15559a })

    this.enemyBorderLeft = new DisplayBox(
      'resources/hudbar_orange_left.png',
      CONST.HUD_LENGTHX,
      CONST.HUD_LENGTHY,
      -960,
      540 - CONST.HUD_TOP_MAGIN - CONST.HUD_LENGTHY,
      1,
      true
    )
    this.enemyBorderRight = new DisplayBox(
      'resources/hudbar_orange_right.png',
      CONST.HUD_LENGTHX,
      CONST.HUD_LENGTHY,
      960 - CONST.HUD_LENGTHX,
      540 - CONST.HUD_TOP_MAGIN - CONST.HUD_LENGTHY,
      1,
      true
    )
    this.selfBorderLeft = new DisplayBox(
      'resources/hudbar_green_left.png',
      CONST.HUD_LENGTHX,
      CONST.HUD_LENGTHY,
      -960,
      540 - CONST.HUD_TOP_MAGIN - CONST.HUD_LENGTHY,
      1,
      true
    )
    this.selfBorderRight = new DisplayBox(
      'resources/hudbar_green_right.png',
      CONST.HUD_LENGTHX,
      CONST.HUD_LENGTHY,
      960 - CONST.HUD_LENGTHX,
      540 - CONST.HUD_TOP_MAGIN - CONST.HUD_LENGTHY,
      1,
      true
    )
  }

  tryShowSelfInfo () {
    if (this.selfPhotoSet) {
      return
    }
    if (gamestatus.selfInfo.picUrl === '') {
      return
    }
    if (gamestatus.selfInfo.texture) {
      this.selfPhoto = new DisplayBox(gamestatus.selfInfo.texture, CONST.HUD_PHOTO_SIZE, CONST.HUD_PHOTO_SIZE, 0, 0, 2, true)
      this.selfPhoto.initToScene(this.scene)
      this.selfPhotoSet = true
    }
    if (!this.selfBorderLeft.boundScene) {
      this.selfBorderLeft.initToScene(this.scene)
      this.selfBorderLeft.hide()
    }
    if (!this.selfBorderRight.boundScene) {
      this.selfBorderRight.initToScene(this.scene)
      this.selfBorderRight.hide()
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
      this.enemyPhoto = new DisplayBox(gamestatus.enemyInfo.texture, CONST.HUD_PHOTO_SIZE, CONST.HUD_PHOTO_SIZE, 0, 0, 2, true)
      this.enemyPhoto.initToScene(this.scene)
      this.enemyPhotoSet = true
    }
    if (!this.enemyBorderLeft.boundScene) {
      this.enemyBorderLeft.initToScene(this.scene)
      this.enemyBorderLeft.hide()
    }
    if (!this.enemyBorderRight.boundScene) {
      this.enemyBorderRight.initToScene(this.scene)
      this.enemyBorderRight.hide()
    }
  }

  tryToInit () {
    if (this.loaded) {
      return
    }
    if (this.enemyPhotoSet) {
      if (!this.fullyInit[0]) {
        this.fullyInit[0] = true
        if (gamestatus.heroSide === CONST.DIR_RIGHT) {
          this.enemyPhoto.resetPos(-960 + CONST.HUD_PIC_MARGIN, 540 - CONST.HUD_TOP_MAGIN - CONST.HUD_PHOTO_SIZE, 2)
          this.enemyBorderLeft.show()
          this.enemyBorderRight.hide()
        } else {
          this.enemyPhoto.resetPos(960 - CONST.HUD_PIC_MARGIN - CONST.HUD_PHOTO_SIZE, 540 - CONST.HUD_TOP_MAGIN - CONST.HUD_PHOTO_SIZE, 2)
          this.enemyBorderRight.show()
          this.enemyBorderLeft.hide()
        }
      }
    } else {
      this.tryShowEnemyInfo()
    }
    if (this.selfPhotoSet) {
      if (!this.fullyInit[1]) {
        this.fullyInit[1] = true
        if (gamestatus.heroSide === CONST.DIR_RIGHT) {
          this.selfPhoto.resetPos(960 - CONST.HUD_PIC_MARGIN - CONST.HUD_PHOTO_SIZE, 540 - CONST.HUD_TOP_MAGIN - CONST.HUD_PHOTO_SIZE, 2)
          this.selfBorderRight.show()
          this.selfBorderLeft.hide()
        } else {
          this.selfPhoto.resetPos(-960 + CONST.HUD_PIC_MARGIN, 540 - CONST.HUD_TOP_MAGIN - CONST.HUD_PHOTO_SIZE, 2)
          this.selfBorderLeft.show()
          this.selfBorderRight.hide()
        }
      }
    } else {
      this.tryShowSelfInfo()
    }
    if (!this.fullyInit[2]) {
      const geometry = this.manaGeometry
      const material = this.manaMaterial
      if (gamestatus.heroSide === CONST.DIR_RIGHT) {
        for (let i = 0; i < 10; ++i) {
          const model = new THREE.Mesh(geometry, material)
          model.position.x = 950 - i * (CONST.HUD_MANA_SIZE + 1) - CONST.HUD_MANA_SIZE / 2
          model.position.y = 540 - 260 - CONST.HUD_MANA_SIZE / 2
          model.position.z = 4
          this.manaIcons.push(model)
          this.scene.add(model)
          model.visible = false
        }
      } else {
        for (let i = 0; i < 10; ++i) {
          const model = new THREE.Mesh(geometry, material)
          model.position.x = -950 + i * (CONST.HUD_MANA_SIZE + 1) + CONST.HUD_MANA_SIZE / 2
          model.position.y = 540 - 260 - CONST.HUD_MANA_SIZE / 2
          model.position.z = 4
          this.manaIcons.push(model)
          this.scene.add(model)
          model.visible = false
        }
      }
      this.fullyInit[2] = true
    }
    this.loaded = this.fullyInit[0] && this.fullyInit[1] && this.fullyInit[2]
  }

  clean () {
    if (this.enemyPhoto) {
      if (this.enemyPhoto.boundScene) {
        this.enemyPhoto.removeFromScene(this.scene)
      }
      this.enemyPhoto.discard()
      this.enemyPhoto = null
    }
    this.enemyPhotoSet = false
    this.enemyBorderLeft.hide()
    this.enemyBorderRight.hide()

    if (this.selfPhoto) {
      if (this.selfPhoto.boundScene) {
        this.selfPhoto.removeFromScene(this.scene)
      }
      this.selfPhoto.discard()
      this.selfPhoto = null
    }
    this.selfPhotoSet = false
    this.selfBorderLeft.hide()
    this.selfBorderRight.hide()

    this.hideAllMana()

    this.visible = false
    this.fullyInit = [false, false, false]
    this.loaded = false
  }

  show () {
    this.visible = true
  }

  hide () {
    this.visible = false
  }

  hideAllMana () {
    this.manaIcons.forEach((icon) => {
      icon.visible = false
    })
  }

  updateMana (count) {
    for (let i = 0; i < 10; ++i) {
      if (i < count) {
        this.manaIcons[i].visible = true
      } else {
        this.manaIcons[i].visible = false
      }
    }
  }

  showText (s) {
    wx.showToast({
      title: s
    })
  }

  update (point) {
    if (!this.visible || !this.loaded) {
      return
    }
    this.updateMana(point)
  }

  render (renderer) {
    if (!this.visible || !this.loaded) {
      return
    }
    console.log('showing hud')

    if (gamestatus.host) {
      // left photo
      renderer.setScissor(0, 1080 - CONST.HUD_TOP_MAGIN - CONST.HUD_LENGTHY, CONST.HUD_LENGTHX, CONST.HUD_LENGTHY)
      renderer.setViewport(0, 0, 1920, 1080)
      renderer.render(this.scene, this.camera)

      // right photo
      renderer.setScissor(CONST.SCREEN_X - CONST.HUD_LENGTHX, 1080 - CONST.HUD_TOP_MAGIN - CONST.HUD_LENGTHY, CONST.HUD_LENGTHX, CONST.HUD_LENGTHY)
      renderer.setViewport(0, 0, 1920, 1080)
      renderer.render(this.scene, this.camera)
    } else {
      // left photo
      renderer.setScissor(0, 1080 - CONST.HUD_TOP_MAGIN - CONST.HUD_LENGTHY, CONST.HUD_LENGTHX, CONST.HUD_LENGTHY)
      renderer.setViewport(0, 0, 1920, 1080)
      renderer.render(this.scene, this.camera)

      // right photo
      renderer.setScissor(CONST.SCREEN_X - CONST.HUD_LENGTHX, 1080 - CONST.HUD_TOP_MAGIN - CONST.HUD_LENGTHY, CONST.HUD_LENGTHX, CONST.HUD_LENGTHY)
      renderer.setViewport(0, 0, 1920, 1080)
      renderer.render(this.scene, this.camera)
    }
  }
}
