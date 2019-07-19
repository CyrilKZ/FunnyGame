let instance

export default class GameStore {
  constructor(){
    if(instance){
      return instance
    }
    instance = this
    this.reset()
  }
  reset(){
    this.startFlag = false
    this.gameFlag = false
    this.endFlag = false

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

    this.left = 1
    this.right = 2
    this.top = 3
    this.sceneLengthX = 1920
    this.sceneLengthY = 1080

    this.welcome = 0
    this.start = 1
    this.game = 2
    this.end = 3
  }
  setSelfInfo(info){
    this.selfInfo.nickName = info.nickName
    this.selfInfo.picUrl = info.avatarUrl
    console.log(this.selfInfo.picUrl)
  }

}