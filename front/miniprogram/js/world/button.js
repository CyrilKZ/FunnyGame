import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'
import DisplayBox from '../base/displaybox'

export default class Button extends DisplayBox{
  constructor(url, lengthX = 0, lengthY = 0, x = 0, y = 0, z = 1){
    super(url, lengthX, lengthY, x, y, z)
    this.available = false
    this.hitBoxLeft = 0
    this.hitBoxRight = 0
    this.hitBoxUp = 0
    this.hitBoxDown = 0
  }
  init(scene, x = this.x, y = this.y, z = this.z){
    if(!this.loaded){
      console.log(`loading`)
      return
    }
    if(this.boundScene){
      return
    }
    this.initToScene(scene, x, y, z)
    
    let screenlx = this.lengthX * window.innerWidth / CONST.SCREEN_X
    let screenly = this.lengthY * window.innerHeight / CONST.SCREEN_Y
    this.hitBoxLeft = (x + CONST.SCREEN_X / 2) * window.innerWidth / CONST.SCREEN_X
    this.hitBoxDown = (CONST.SCREEN_Y / 2 - y) * window.innerHeight / CONST.SCREEN_Y
    this.hitBoxRight = this.hitBoxLeft + screenlx
    this.hitBoxUp = this.hitBoxDown - screenly
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
  checkTouch(screenEndX, screenEndY, screenInitX, screenInitY){
    //console.log(this.available)
    if(!this.available){
      return false
    }
    if(this.hitBoxLeft < screenEndX && screenEndX < this.hitBoxRight && this.hitBoxDown > screenEndY && screenEndY > this.hitBoxUp
      && this.hitBoxLeft < screenInitX && screenInitX < this.hitBoxRight && this.hitBoxDown > screenInitY && screenInitY > this.hitBoxUp){
      return true
    }
    return false
  }
}