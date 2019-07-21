import DataBus from '../databus'
import GameStore from '../gamestore'
import * as THREE from '../libs/three.min'
import Network from '../network'
import Stage from '../base/stage';


const PLANE_WIDTH = 1920
const PLANE_LENGTH = 1080


const ANIMATION_FRAME = 40
const CAMERA_Z = 100
let databus = new DataBus()
let store = new GameStore()
let network = new Network()

export default class WelcomeStage extends Stage{
  constructor(){
    super(
      new THREE.OrthographicCamera(-PLANE_WIDTH/2, PLANE_WIDTH/2, PLANE_LENGTH/2, -PLANE_LENGTH/2, 1, 1000),
      new THREE.DirectionalLight(0xffffff, 0.5),
      new THREE.AmbientLight(0xeeeeee, 0.5),
    )
    this.setUpScene()
  }
  setUpScene(){
    this.camera.position.z = CAMERA_Z
    this.light.position.set(0, 0, 100)
    let geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_LENGTH, 1, 1)
    let texture = new THREE.TextureLoader().load( 'resources/startbg.png' )
    let material = new THREE.MeshLambertMaterial({ map: texture })
    this.backgound = new THREE.Mesh(geometry, material)
    this.scene.add(this.backgound)
    this.scene.add(this.light)
    this.scene.add(this.aLight)
    this.doWeHaveToUseThis = wx.createUserInfoButton({
      type: 'text',
      text: '开始游戏',
      style: {
        left:  window.innerWidth / 2  - 100,
        top: window.innerHeight / 2 - 20,
        width: 200,
        height: 40,
        lineHeight: 40,
        backgroundColor: '#000000',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: 16,
        borderRadius: 4
      }
    })
    this.fail = function(err){
      console.log(err)
    }
    this.doWeHaveToUseThis.onTap((res) => {
      wx.cloud.callFunction({
        name: 'login',
        success: res => {
          store.openID = res.result.openid
          this.handleAuthorizeEvent(res)
        },
        fail: err => {
          console.error('get openid failed with error', err)
        }
      })      
    })
  }
  
  handleAuthorizeEvent(res){
    let shareData = wx.getLaunchOptionsSync().query.teamid
    store.setSelfInfo(JSON.parse(res.rawData))
    if(shareData === undefined){
      console.log('host')
      store.host = true
      network.login(store.openID, store.selfInfo, ()=>{
        network.createTeam(store.openID, (res)=>{
          network.initSocket(()=>{
            network.sendOpenid(store.openID, ()=>{
              this.animation = true
            }, this.fail)
          }, this.fail)
        }, this.fail)
      }, this.fail)
    }
    else{
      store.host = false
      store.roomID = shareData
      network.login(store.openID, ()=>{
        network.joinTeam(store.openID, store.roomID ,(res)=>{
          console.log('gest')
          network.initSocket(()=>{
            network.sendOpenid(store.openID, ()=>{
              self.animation = true
            }, self.fail)
          }, self.fail)
        }, self.fail)
      }, self.fail)
    }
    
    this.doWeHaveToUseThis.hide()

  }

  loop(){
    if(this.animation === false){
      return
    }
    databus.frame += 1
    this.light.intensity -= 1 / ANIMATION_FRAME
    if(databus.frame === ANIMATION_FRAME){
      this.animation = false
      store.startFlag = true
    }
  }
  render(renderer){
    renderer.render(this.scene, this.camera)
  }
}