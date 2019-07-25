import Pool from './base/pool'
import * as THREE from './libs/three.min'
import MAIN_FONT from '../resources/font'
//import * as CONST from './libs/constants'

let instance
export default class GameStatus {
  constructor(){
    if(instance){
      return instance
    }
    instance = this
    this.pool = new Pool()

    this.font = new THREE.FontLoader().parse(MAIN_FONT)
    this.init()
    this.reset()
  }
  init(){
    this.switchToLobby = false
    this.switchToGame = false
    this.switchToResult = false

    this.host = false

    this.selfInfo = {
      nickName: '',
      picUrl:''
    }
    this.heroSide = 0

    this.enemyInfo = {
      nickName: '',
      picUrl:''
    }
    this.enemySide = 0

    this.roomID = ''
    this.openID = ''
    this.socketOn = false

    this.selfReady = false
    this.enemyReady = false

    
  }
  reset(){
    this.frame   = 0
    this.aniFrame = 0
    this.score   = 0
    this.step    = 0
    this.speed   = 1
    this.accel   = 0
    this.blocks  = [[],[],[],[]]
    this.gameOver    = false
    this.heroWillHit = false
    this.heroSide    = 0
    this.heroHit     = false
    this.enemyHit    = false
    this.enemyWillHit = false
    this.enemySide    = 0

    this.gameOn = false
    this.pause = false
    this.absDistance = 0
  }
  removeBlock(block){
    let temp = this.blocks[block.row].shift()
    temp.hide()
    this.pool.recover('block',block)
  }

  setSelfInfo(info){
    this.selfInfo.nickName = info.nickName
    this.selfInfo.picUrl = info.avatarUrl
  }
  setEnemyInfo(info){
    this.enemyInfo.nickName = info.nickName
    this.enemyInfo.picUrl = info.picUrl
  }
}
