import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'
import GameStatus from '../status'
import DisplayBox from '../base/displaybox'

let gamestatus = new GameStatus()

export default class HUD {
  constructor(){
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-CONST.SCREEN_X/2, CONST.SCREEN_X/2, CONST.SCREEN_Y/2, -CONST.SCREEN_Y/2, 1, 1000)
    //this.aLight = new THREE.AmbientLight(0xffffff, 0.5)

    this.scene.background = 'rgba(0,0,0, 0)'
    this.camera.position.z = 100


    this.visible = false
    this.selfPhoto = null
    this.selfBorder = null
    this.selfPotoSet = false
    this.enemyPic = null
    this.enemyPicSet = false
    this.enemyBorder = null
    this.frame = 0
    
    this.fullyInit = [false, false, false]
    this.loaded = false
    
    this.hasText = false
    this.text = null

    this.manaIcons = []
    this. manaGeometry = new THREE.PlaneGeometry(CONST.HUD_MANA_SIZE, CONST.HUD_MANA_SIZE, 1, 1)
    this. manaMaterial = new THREE.MeshBasicMaterial({color: 0xaabbcc})
  }
  tryShowSelfInfo(){  
    if(this.selfPhotoSet){
      return
    }
    if(gamestatus.selfInfo.picUrl === ''){
      return
    }
    if(gamestatus.selfInfo.texture){
      this.selfPhoto = new DisplayBox(gamestatus.selfInfo.texture, CONST.HUD_PHOTO_SIZE, CONST.HUD_PHOTO_SIZE, 0, 0, 0, true)
      this.selfPhoto.initToScene(this.scene)
      this.selfPhotoSet = true
    }
  }
  tryShowEnemyInfo(){
    if(this.enemyPhotoSet){
      return
    }
    if(gamestatus.enemyInfo.picUrl === ''){
      return
    }
    if(gamestatus.enemyInfo.texture){
      this.enemyPhoto = new DisplayBox(gamestatus.enemyInfo.texture, CONST.HUD_PHOTO_SIZE, CONST.HUD_PHOTO_SIZE, 0, 0, 0, true)
      this.enemyPhoto.initToScene(this.scene)
      this.enemyPhotoSet = true
    }
  }
  tryToInit(){
    if(this.loaded){
      return
    }
    if(this.enemyPhotoSet) {
      if(!this.fullyInit[0]){
        this.fullyInit[0] = true
        if(gamestatus.host){
          this.enemyPhoto.resetPos(-860, 440 - CONST.HUD_PHOTO_SIZE, 0)
        }
        else{
          this.enemyPhoto.resetPos(860 - CONST.HUD_PHOTO_SIZE, 440 - CONST.HUD_PHOTO_SIZE, 0)
        }
        let edges = new THREE.EdgesGeometry(this.enemyPhoto.model.geometry)
        this.enemyBorder = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({
            color: 0xaaaaaa,
            linewidth: 2
          })
        )
        this.enemyBorder.position.set(this.enemyPhoto.model.position.x, this.enemyPhoto.model.position.y, this.enemyPhoto.model.position.z)
        this.scene.add(this.enemyBorder)
      }
    }
    else{
      this.tryShowEnemyInfo()
    }
    if(this.selfPhotoSet){ 
      if(!this.fullyInit[1]){
        this.fullyInit[1] = true
        if(gamestatus.host){
          this.selfPhoto.resetPos(860 - CONST.HUD_PHOTO_SIZE, 440 - CONST.HUD_PHOTO_SIZE, 0)
        }
        else{
          this.selfPhoto.resetPos(-860, 440 - CONST.HUD_PHOTO_SIZE, 0)
        }
        let edges = new THREE.EdgesGeometry(this.selfPhoto.model.geometry)
        this.selfBorder = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({
            color: 0xaaaaaa,
            linewidth: 2
          })
        )
        this.selfBorder.position.set(this.selfPhoto.model.position.x, this.selfPhoto.model.position.y, this.selfPhoto.model.position.z)
        this.scene.add(this.selfBorder)
      }
    }
    else{
      this.tryShowSelfInfo()
    }
    if(!this.fullyInit[2]){
      let geometry = this.manaGeometry
      let material = this.manaMaterial
      if(gamestatus.host){
        for(let i = 0 ; i < 5; ++i){
          let model = new THREE.Mesh(geometry, material)
          model.position.x = 860 - i * CONST.HUD_MANA_SIZE - CONST.HUD_MANA_SIZE / 2
          model.position.y = 540 - 260 - CONST.HUD_MANA_SIZE / 2
          this.manaIcons.push(model)
          this.scene.add(model)

          model = new THREE.Mesh(geometry, material)
          model.position.x = 860 - i * CONST.HUD_MANA_SIZE - CONST.HUD_MANA_SIZE / 2
          model.position.y = 540 - 260 - CONST.HUD_MANA_SIZE / 2 - 32
          this.manaIcons.push(model)
          this.scene.add(model)
        }
      }
      else{
        for(let i = 0 ; i < 5; ++i){
          let model = new THREE.Mesh(geometry, material)
          model.position.x = -860 + i * CONST.HUD_MANA_SIZE + CONST.HUD_MANA_SIZE / 2
          model.position.y = 540 - 260 - CONST.HUD_MANA_SIZE / 2
          this.manaIcons.push(model)
          this.scene.add(model)

          model = new THREE.Mesh(geometry, material)
          model.position.x = -860 + i * CONST.HUD_MANA_SIZE + CONST.HUD_MANA_SIZE / 2
          model.position.y = 540 - 260 - CONST.HUD_MANA_SIZE / 2 - 32
          this.manaIcons.push(model)
          this.scene.add(model)
        }
      }
      this.fullyInit[2] = true
    }
    this.loaded = this.fullyInit[0] && this.fullyInit[1] && this.fullyInit[2]
  }
  clean(){
    this.enemyPhoto.removeFromScene(this.scene)
    this.enemyPhoto.discard()
    this.enemyPhoto = null
    this.scene.remove(this.enemyBorder)
    this.enemyBorder.geometry.dispose()
    this.enemyBorder.material.dispose()
    this.enemyBorder = null

    this.selfPhoto.removeFromScene(this.scene)
    this.selfPhoto.discard()
    this.selfPhoto = null
    this.scene.remove(this.selfBorder)
    this.selfBorder.geometry.dispose()
    this.selfBorder.material.dispose()
    this.selfBorder = null

    this.hideAllMana()

    this.visible = false
  }
  show(){
    this.visible = true
  }
  hide(){
    this.visible = false
  }
  hideAllMana(){
    this.manaIcons.forEach((icon)=>{
      icon.visible = false
    })
  }
  updateMana(count){
    for(let i = 0 ; i < 10; ++i){
      if(i < count){
        this.manaIcons[i].visible = true
      }
      else{
        this.manaIcons[i].visible = false
      }
    }    
  }
  showText(s){
    if(!this.visible ||!this.loaded){
      return
    }
    if(!gamestatus.font){
      return
    }
    if(this.text){
      this.scene.remove(this.text)
      this.text.geometry.dispose()
      this.text.material.dispose()
    }
    let geometry = new THREE.TextGeometry(s,{
      font: gamestatus.font,
      size: 40,
      height: 1
    })
    let materil = new THREE.MeshBasicMaterial({color: 0xaaaaaa})
    this.text = new THREE.Mesh(geometry, materil)
    this.scene.add(this.text)
    this.frame = 0
  }
  updateText(){
    this.frame += 1
    if(this.frame === 60){
      this.text.visible = false
    }
  }
  update(point){
    if(!this.visible ||!this.loaded){
      return
    }
    if(this.text){
      this.updateText()
    }
    this.updateMana(point)
  }
  render(renderer){
    return
    if(!this.visible || !this.loaded){
      return
    }
    console.log('showing hud')

    if(gamestatus.host){
      // left photo
      renderer.setScissor(100, 1080 - 262, 162, 164)
      renderer.setViewport(0, 0, 1920, 1080)
      renderer.render(this.scene, this.camera)

      // right photo
      renderer.setScissor(1920 - 262, 1080 - 262 - 64, 162, 164 + 64)
      renderer.setViewport(0, 0, 1920, 1080)
      renderer.render(this.scene, this.camera)
    }
    else{
      // left photo
      renderer.setScissor(100, 1080 - 262 - 64, 162, 164 + 64)
      renderer.setViewport(0, 0, 1920, 1080)
      renderer.render(this.scene, this.camera)

      // right photo
      renderer.setScissor(1920 - 262, 1080 - 262, 162, 164)
      renderer.setViewport(0, 0, 1920, 1080)
      renderer.render(this.scene, this.camera)
    }    
  }
}