import GameStatus from '../status'
import UI from '../base/ui'
import Network from '../base/network'

let gamestatus = new GameStatus()
let network = new Network()
export default class WelcomeScene extends UI {
  constructor(){
    super('resources/welcome.png')
    this.handlingAuth = false
    this.setUpScene()
  }
  setUpScene(){
    this.doWeHaveToUseThis = wx.createUserInfoButton({
      type: 'text',
      text: '开始游戏',
      style: {
        left: window.innerWidth / 2  - 250,
        top: window.innerHeight / 2 + 100,
        width: 200,
        height: 40,
        lineHeight: 40,
        backgroundColor: '#ffffff',
        color: '#000000',
        textAlign: 'center',
        fontSize: 16,
        borderRadius: 4
      }
    })
    this.doWeHaveToUseThis.onTap((info) => {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          console.log('called cloud function')
          status.openID = res.result.openid
          this.handleAuthorizeEvent(info)
        },
        fail: err => {
          console.error('get openid failed with error', err)
        }
      })      
    })
  }
  fail(res){
    console.log(`fail info: ${res}`)
  }
  handleAuthorizeEvent(res){
    if(this.handlingAuth){
      return
    }
    this.handlingAuth = true
    let shareData = wx.getLaunchOptionsSync().query.teamid
    gamestatus.setSelfInfo(JSON.parse(res.rawData))
    console.log(shareData)
    if(shareData === undefined){
      console.log('host')
      gamestatus.host = true
      network.login(gamestatus.openID, gamestatus.selfInfo, ()=>{
        network.createTeam(gamestatus.openID, (res)=>{
          gamestatus.roomID = res.teamid
          network.initSocket(()=>{
            gamestatus.socketOn = true
            network.sendOpenid(gamestatus.openID, ()=>{
              this.animation = true
              this.doWeHaveToUseThis.hide()
            }, this.fail)
          }, this.fail)
        }, this.fail)
      }, this.fail)
    }
    else{
      gamestatus.host = false
      gamestatus.roomID = shareData
      network.login(gamestatus.openID, gamestatus.selfInfo, ()=>{
        console.log(gamestatus.openID)
        console.log(gamestatus.roomID)
        network.joinTeam(gamestatus.openID, gamestatus.roomID ,(res)=>{
          console.log('gest')
          network.initSocket(()=>{
            gamestatus.socketOn = true
            network.sendOpenid(gamestatus.openID, ()=>{
              this.animation = true
              this.doWeHaveToUseThis.hide()
            }, this.fail)
          }, this.fail)
        }, this.fail)
      }, this.fail)
    }
  }
  loop(){
    if(!this.loaded){
      return
    }
    if(this.animation){
      this.fade()
    }
  }
  fade(){
    this.frame += 1
    this.light.intensity -= 0.5 / CONST.SWITCH_SHORT_FRAME
    if(this.frame === CONST.SWITCH_SHORT_FRAME){
      this.animation = false
      gamestatus.switchToLobby = true
      this.display = false
    }
  }
}