import * as THREE from '../libs/three.min'
import GameStore from '../gamestore'

let store = new GameStore

export default class Button{
  constructor(picUrl = '', lengthX = 0, lengthY = 0){
    let geometry = new THREE.PlaneGeometry(lengthX, lengthY, 1, 1)
    let texture = new THREE.TextureLoader().load(picUrl)
    let material = new THREE.MeshLambertMaterial({ map: texture })
    this.model = new THREE.Mesh(geometry, material)
    this.model.visible = false
    this.x = 0
    this.y = 0
    this.lengthX = lengthX
    this.lengthY = lengthY
    this.hitBoxLeft = 0
    this.hitBoxRight = 0
    this.hitBoxUp = 0
    this.hitBoxDown = 0
    this.available = false
  }
  initButton(x = 0, y = 0){
    this.x = x
    this.y = y
    this.model.position.x = this.x - store.sceneLengthX / 2 + this.lengthX / 2
    this.model.position.y = this.y - store.sceneLengthY / 2 + this.lengthY / 2
    this.model.position.z = 1
    let screenlx = this.lengthX * window.innerWidth / store.sceneLengthX
    let screenly = this.lengthY * window.innerHeight / store.sceneLengthY
    this.hitBoxLeft = x * window.innerWidth / store.sceneLengthX
    this.hitBoxDown = x * window.innerHeight / store.sceneLengthY
    this.hitBoxRight = this.hitBoxLeft + screenlx
    this.hitBoxUp = this.hitBoxRight + screenly
    this.available = true
  }
  checkHit(sx = 0, sy = 0){
    if(!this.available){
      return false
    }
    if(this.hitBoxLeft < sx && sx < this.hitBoxRight && this.hitBoxDown < sy && sy < this.hitBoxUp){
      return true
    }
    return false
  }
  hide(){
    this.model.visible = false
    this.available = false
  }
  show(){
    this.model.visible = true
    this.available = true
  }
}