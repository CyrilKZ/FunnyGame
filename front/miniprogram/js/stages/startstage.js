import DataBus from '../databus'
import GameStore from '../gamestore'
import Stage from '../base/stage'
import * as THREE from '../libs/three.min'
import Network from '../network'


const PLANE_WIDTH = 1920
const PLANE_LENGTH = 1080
const AVATAR_SIZE = 240
const AVATAR_POS_LEFT = 500
const AVATAR_POS_TOP = 100

const ANIMATION_FRAME = 40
const CAMERA_Z = 100
let databus = new DataBus()
let store = new GameStore()
let network = new Network()

export default class StartStage extends Stage{
  constructor(){
    super(
      new THREE.OrthographicCamera(-PLANE_WIDTH/2, PLANE_WIDTH/2, PLANE_LENGTH/2, -PLANE_LENGTH/2, 1, 1000),
      new THREE.DirectionalLight(0xffffff, 0.5),
      new THREE.AmbientLight(0xeeeeee, 0.5),
      this.setUpScene()
    )
    this.selfReady = false
    this.enemyReady = false
    this.startAnimation = false
    this.selfPic = null
    this.otherPic = null
  }
  setUpScene(){
    this.camera.position.z = CAMERA_Z
    this.light.position.set(0, 0, 100)
    let geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_LENGTH, 1, 1)
    let texture = new THREE.TextureLoader().load( './resources/startbg.png' )
    let material = new THREE.MeshLambertMaterial({ map: texture })
    this.backgound = new THREE.Mesh(geometry, material)
    this.scene.add(this.backgound)

    let self = this
    network.onStart = (()=>{
      self.startAnimation = true
    })
    
  }
  restart(){
    this.selfReady = false
    this.enemyReady = false
    this.startAnimation = false
    this.light.intensity = 1
    databus.reset()
    this.showSelfInfo()
  }

  showSelfInfo(){
    let geometry = new THREE.PlaneGeometry(AVATAR_SIZE, AVATAR_SIZE, 1, 1)
    let texture = new THREE.TextureLoader().load(store.selfInfo.picUrl)
    let material = new THREE.MeshLambertMaterial({ map: texture })
    this.selfPic = new THREE.Mesh(geometry, material)
    this.selfPic.position.set(-AVATAR_POS_LEFT, AVATAR_POS_TOP ,1)
    this.scene.add(this.selfPic)
  }

  

  handleTouchEvents(res){
    network.sendReady(true, ()=>{
      this.selfReady = true
    })

  }
  setEnemyStatus(status){
    this.enemyReady = status
  }
  loop(){
    if(this.startAnimation === false){
      return
    }
    databus.frame += 1
    this.light.intensity -= 1 / ANIMATION_FRAME
    if(databus.frame === ANIMATION_FRAME){
      this.startAnimation = false
      store.gameFlag = true
    }
  }
}