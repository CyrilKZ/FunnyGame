import DataBus from '../databus'
import GameStore from '../gamestore'
import Network from '../network'
import * as THREE from '../libs/three.min'

const PLANE_WIDTH = 1920
const PLANE_LENGTH = 1080
const ANIMATION_FRAME = 40
const CAMERA_Z = 100
let databus = new DataBus()
let store = new GameStore()
let network = new Network()

export default class EndStage {
  constructor(){
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-PLANE_WIDTH/2, PLANE_WIDTH/2, PLANE_LENGTH/2, -PLANE_LENGTH/2, 1, 1000)
    this.light = new THREE.DirectionalLight(0xffffff, 0.5)
    this.aLight = new THREE.AmbientLight(0xeeeeee, 0.5)



    this.selfReady = false
    this.enemyReady = false
    this.startAnimation = false


    this.setUpScene()

    let self = this

    // network.onStart = (()=>{
    //   self.startAnimation = true
    // })
  }
  setUpScene(){
    this.camera.position.z = CAMERA_Z
    this.light.position.set(0, 0, 100)
    let geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_LENGTH, 1, 1)
    let texture = new THREE.TextureLoader().load( './resources/startbg.png' )
    let material = new THREE.MeshLambertMaterial({ map: texture })
    this.backgound = new THREE.Mesh(geometry, material)
    this.scene.add(this.backgound)
    this.scene.add(this.light)
    this.scene.add(this.aLight)
  }
  restart(){
    this.selfReady = false
    this.enemyReady = false
    this.startAnimation = false
    this.light.intensity = 1
    databus.reset()
  }

  handleTouchEvents(res){
    // if in range
    console.log(res)
    network.sendReady(true)
    //this.startAnimation = true
  }
  setEnemyStatus(status){
    this.enemyReady = status
  }
  loop(){
    //console.log(this.startAnimation)
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
  render(renderer){
    renderer.render(this.scene, this.camera)
  }
}