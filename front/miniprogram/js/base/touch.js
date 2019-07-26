import * as CONST from '../libs/constants'
const SCREEN_WIDTH = window.innerWidth
// const SCREEN_HEIGHT = 1080

export default class TouchEvents {
  constructor () {
    this.touchMap = new Map()
  }

  addEvent (e) {
    const x = e.clientX
    // console.log(x)
    const y = e.clientY
    let type = CONST.DIR_RIGHT
    if (x < SCREEN_WIDTH / 2) {
      type = CONST.DIR_LEFT
    }
    const info = {
      initX: x,
      initY: y,
      endX: x,
      endY: y,
      type: type
    }
    this.touchMap.set(e.identifier, info)
  }

  followUpEvent (e) {
    const x = e.clientX
    const y = e.clientY
    const info = this.touchMap.get(e.identifier)
    if (info === undefined) {
      return
    }
    info.endX = x
    info.endY = y
    this.touchMap.set(e.identifier, info)
  }

  removeEvent (e) {
    const info = this.touchMap.get(e.identifier)
    if (info === undefined) {
      return null
    }
    this.touchMap.delete(e.identifier)
    const res = {
      initX: info.initX,
      initY: info.initY,
      endX: info.endX,
      endY: info.endY,
      dX: info.endX - info.initX,
      dY: info.endY - info.initY,
      swipe: 0,
      type: info.type,
      endType: 0
    }
    if (Math.abs(res.dX) > Math.abs(res.dY)) {
      if (res.dX > 0) {
        res.swipe = CONST.DIR_RIGHT
      } else if (res.dX < 0) {
        res.swipe = CONST.DIR_LEFT
      }
    } else {
      if (res.dY < 0) {
        res.swipe = CONST.DIR_UP
      } else {
        res.swipe = 0
      }
    }
    if (res.endX < innerWidth / 2) {
      res.endType = CONST.DIR_LEFT
    } else {
      res.endType = CONST.DIR_RIGHT
    }
    return res
  }

  reset () {
    this.touchMap.clear()
  }
}
