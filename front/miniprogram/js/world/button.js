import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'
import DisplayBox from '../base/displaybox'

export default class Button extends DisplayBox{
  constructor(url, onTouch, lengthX = 0, lengthY = 0, x = 0, y = 0){
    super(url, lengthX, lengthY, x, y, 1)
    this.available = false
    this.hitBoxLeft = 0
    this.hitBoxRight = 0
    this.hitBoxUp = 0
    this.hitBoxDown = 0
    this.onTouch = onTouch
  }
  init(scene, x = this.x, y = this.y){
    if(!this.loaded){
      console.log(`loading`)
      return
    }
    if(this.boundScene){
      return
    }
    this.initToScene(scene, x, y, 1)
    let screenlx = this.lengthX * window.innerWidth / CONST.SCREEN_X
    let screenly = this.lengthY * window.innerHeight / CONST.SCREEN_Y
    this.hitBoxLeft = x * window.innerWidth / CONST.SCREEN_X
    this.hitBoxDown = x * window.innerHeight / CONST.SCREEN_Y
    this.hitBoxRight = this.hitBoxLeft + screenlx
    this.hitBoxUp = this.hitBoxRight + screenly
    this.showButton()  
  }
  showButton(){
    this.show()
    this.available = true
  }
  hideButton(){
    this.hide()
    this.available = false
  }
  checkTouch(sx, sy){
    if(!this.available){
      return
    }
    if(this.hitBoxLeft < sx && sx < this.hitBoxRight && this.hitBoxDown < sy && sy < this.hitBoxUp){
      return this.onTouch()
    }
    return
  }
  onTouch(){
    return
  }
}