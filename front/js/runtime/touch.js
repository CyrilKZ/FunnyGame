const SCREEN_WIDTH = window.innerWidth
//const SCREEN_HEIGHT = 1080
const LEFT = 1
const RIGHT = 2
const TOP = 3

export default class TouchEvents {
  constructor(){
    this.touchMap = new Map()
  }
  addEvent(e){
    let x = e.clientX
    //console.log(x)
    let y = e.clientY
    let type = RIGHT
    if(x < SCREEN_WIDTH / 2){
      type = LEFT
    }
    let info = {
      initX: x,
      initY: y,
      endX:  x,
      endY:  y,
      type: type
    }
    this.touchMap.set(e.identifier, info)  
  }
  followUpEvent(e){
    let x = e.clientX
    let y = e.clientY
    let info = this.touchMap.get(e.identifier)
    if(info === undefined){
      return
    }
    info.endX = x
    info.endY = y
    this.touchMap.set(e.identifier, info)
  }
  removeEvent(e){
    let info = this.touchMap.get(e.identifier)
    //console.log(info)
    if(info === undefined){
      return null
    }
    this.touchMap.delete(e.identifier)
    let res = {
      endX: info.endX,
      endY: info.endY,
      dX: info.endX - info.initX,
      dY: info.endY - info.initY,
      swipe: 0,
      type: info.type,
      endType: 0
    }
    if(Math.abs(res.dX) > Math.abs(res.dY)){
      if(res.dX > 0){
        res.swipe = RIGHT
      }
      else if (res.dX < 0){
        res.swipe = LEFT
      }
    }
    else {
      if(res.dY < 0){
        res.swipe = TOP
      }
      else{
        res.swipe = 0
      }
    }
    if(res.endX < innerWidth / 2){
      res.endType = LEFT
    }
    else{
      res.endType = RIGHT
    }
    return res
  }
  reset(){
    this.touchMap.clear()
  }
}