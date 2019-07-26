import Pool from './base/pool'
import * as THREE from './libs/three.min'
import MAIN_FONT from '../resources/font'
import Network from './base/network'
//import * as CONST from './libs/constants'
let network = new Network()

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
    this.restart = false
    this.switchToLobby = false
    this.switchToGame = false
    this.switchToResult = false

    
    this.host = true

    this.selfInfo = {
      nickName: '',
      picUrl:'',
      image: null,
      texture: null
    }

    this.enemyInfo = {
      nickName: '',
      picUrl:'',
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
  reset(){
    this.frame   = 0
    this.aniFrame = 0
    this.step    = 0
    this.speed   = 1
    this.accel   = 0
    this.blocks  = [[],[],[],[]]
    this.heroWillHit = false
    this.heroSide    = 0
    this.heroHit     = false
    this.enemyHit    = false
    this.enemyWillHit = false
    this.enemySide    = 0
    

    this.selfScore   = 0
    this.enemyScore  = 0
    
    this.absDistance = 0
  }
  removeBlock(block){
    let temp = this.blocks[block.row].shift()
    temp.hide()
    this.pool.recover('block',block)
  }
  recycleAllBlock(){
    for(let i = 0; i < 4; ++i){
      while(this.blocks[i].length > 0){
        let temp = this.blocks[i].shift()
        temp.hide()
        this.pool.recover('block', temp)
      }
    }
  }
  setSelfInfo(info){
    this.selfInfo.nickName = info.nickName
    this.selfInfo.picUrl = info.avatarUrl
    this.selfInfo.image = wx.createImage()
    this.selfInfo.image.src = this.selfInfo.picUrl
    let loader = new THREE.TextureLoader()
    let self = this
    loader.load(
      self.selfInfo.picUrl,
      function(texture){
        self.selfInfo.texture = texture
      }
    )
  }

  clearEnemyInfo(){
    this.enemyInfo = {
      nickName: '',
      picUrl:'',
      image: null,
      texture: null
    }
  }

  setEnemyInfo(info){
    this.enemyInfo.nickName = info.nickName
    this.enemyInfo.picUrl = info.picUrl
    this.enemyInfo.image = wx.createImage()
    this.enemyInfo.image.src = this.enemyInfo.picUrl
    let loader = new THREE.TextureLoader()
    let self = this
    loader.load(
      self.enemyInfo.picUrl,
      function(texture){
        self.enemyInfo.texture = texture
      }
    )
  }


  joinLobby(lobbyid){
    let self = this
    let fail = function(res){
      wx.showToast({
        title:res.errMsg,
        icon:'none'
      })
    }
    network.joinTeam(this.openID, lobbyid, (res)=>{
      if(res.result === 0){
        self.host = false
        network.initSocket(()=>{
          self.socketOn = true
          network.sendOpenid(self.openID,()=>{
            network.sendPause(false, ()=>{
              self.lobbyID = lobbyid
            },fail)
          },fail)
        },fail)
      }
    })
  }
}
