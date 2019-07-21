import DataBus from '../databus'
import GameStore from '../gamestore'
import Stage from '../base/stage'
import * as THREE from '../libs/three.min'
import Network from '../network'
import Button from '../base/button'

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
    )
    this.selfReady = false
    this.enemyReady = false
    this.animation = false
    this.selfPic = null
    this.otherPic = null
    this.imReady = null
    this.imNotReady = null
    this.othersReady = null
    this.othersNotReady = null
    this.setUpScene()
  }
  setUpScene(){
    // setting up background and camera
    this.camera.position.z = CAMERA_Z
    this.light.position.set(0, 0, 100)
    let geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_LENGTH, 1, 1)
    let texture = new THREE.TextureLoader().load( 'resources/startbg.png' )
    let material = new THREE.MeshLambertMaterial({ map: texture })
    this.backgound = new THREE.Mesh(geometry, material)
    this.scene.add(this.backgound)

    //setting up buttons
    this.imReady = new Button('resources/ready.png', 600, 200)
    this.imNotReady = new Button('resources/notready.png', 600, 200)
    this.othersReady = new Button('resources/ready.png', 600, 200)
    this.imReady.initButton(200, 600)
    this.imNotReady.initButton(200, 600)
    this.othersReady.initButton(1120, 600)


    this.scene.add(this.imReady.model)
    this.scene.add(this.imNotReady.model)

  }
  restart(){
    this.selfReady = false
    this.enemyReady = false
    this.animation = false
    this.light.intensity = 1
    databus.reset()
    this.showSelfInfo()
  }
  startFading(){
    this.animation = true
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
    if(this.animation === false){
      return
    }
    databus.frame += 1
    this.light.intensity -= 1 / ANIMATION_FRAME
    if(databus.frame === ANIMATION_FRAME){
      this.animation = false
      store.gameFlag = true
    }
  }
}