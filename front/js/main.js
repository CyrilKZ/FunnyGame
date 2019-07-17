import DataBus from './databus'
import Block from './world/block'
import Hero from './world/hero'
import TouchEvent from './runtime/touch'

import * as THREE from './libs/three.min'

const PLANE_WIDTH = 440
const PLANE_LENGTH = 1000
const BASELINE_POS = -250
const CAMERA_Z = Math.round(250 * Math.sqrt(3))
const CAMERA_Y = -750
const CAMERA_ROT_X = Math.PI / 4
const LEFT = 1
const RIGHT = 2
const TOUCHBAR = 300
const SCREEN_WIDTH = 1920
const SCREEN_HEIGHT = 1080

let gameCtx = canvas.getContext('webgl')
let gameScene = new THREE.Scene()
let gameCamera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 2000)
let gameRenderer = new THREE.WebGLRenderer(gameCtx)
let databus = new DataBus()
let touchevents = new TouchEvent()
let light = new THREE.DirectionalLight(0xffffff, 0.5)
let aLight = new THREE.AmbientLight(0xeeeeee, 0.5)



export default class Game {
  constructor() {
    this.aniID = 0
    this.initTouchEvents()
    canvas.appendChild(gameRenderer.domElement)
    
    this.models = []
    this.hero = null
    
    //this.setHeroPos(RIGHT)
    this.setUpScene()
    this.restart()
    
    
  }

  addModel(model){
    this.models.push(model)
    gameScene.add(model)
  }
  clearModels(){
    this.models.forEach((item)=>{
      gameScene.remove(item)
      item.geometry.dispose()
      item.material.dispose()
    })
    this.models = []
    if(this.hero === null || this.hero === undefined){
      return
    }
    gameScene.remove(this.hero.model)
    this.hero.model.geometry.dispose()
    this.hero.model.material.dispose()
    delete(this.hero)
    this.hero = null
  }

  setUpScene(){
    let geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_LENGTH, 1, 1)
    let material = new THREE.MeshLambertMaterial({ color: 0xeeffee })
    this.ground = new THREE.Mesh(geometry, material)
    let baselineGeo = new THREE.CubeGeometry(PLANE_WIDTH, 0.1, 0.1)
    let baselineMat = new THREE.MeshLambertMaterial({ color: 0x000000 })
    this.baseline = new THREE.Mesh(baselineGeo, baselineMat)
    this.ground.position.set(0, 0, 0)
    this.baseline.position.set(0, BASELINE_POS, 0)
    gameRenderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
    gameRenderer.shadowMapEnabled = true
    light.castShadow = true
    this.ground.receiveShadow = true
    light.position.set(0, 0, 100)
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 500
    light.shadow.camera.left = -220
    light.shadow.camera.bottom = -500
    light.shadow.camera.right = 220
    light.shadow.camera.top = 500
    light.target.position.set(0, 0, 0).normalize()
    gameCamera.position.z = CAMERA_Z
    gameCamera.position.y = CAMERA_Y
    gameCamera.rotateX(CAMERA_ROT_X)
    gameScene.add(this.ground)
    gameScene.add(this.baseline)
    gameScene.add(light)
    gameScene.add(aLight)    
  }


  restart(){  
    databus.reset()
    this.clearModels()
    this.hero = new Hero()
    this.hero.initSelf(2)
    databus.setHeroSide(2)
    gameScene.add(this.hero.model)
    this.bindLoop = this.loop.bind(this)
    window.cancelAnimationFrame(this.aniID)
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  

  loop() {
    if(databus.heroHit === true){
      return
    }
    //console.log(databus.frame)
    databus.frame++
    if(databus.frame % 40 === 0){
      let block = databus.pool.getItemByClass('block', Block)
      block.init(Math.round(Math.random() * 3), 1)
      databus.blocks[block.row].push(block)
      this.addModel(block.model)
    }
    databus.blocks.forEach((row)=>{
      row.forEach((item)=>{
        //console.log(databus.speed)
        item.update(databus.speed)
      })
    })
    databus.speed += databus.accel
    this.hero.update()
    this.render()
    
  }
  render() {
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
      )
    gameRenderer.render(gameScene, gameCamera)
  }

  initTouchEvents(){
    touchevents.reset()
    canvas.addEventListener('touchstart', ((e)=>{
      e.preventDefault()
      e.touches.forEach((item)=>{
        touchevents.addEvent(item)
      })
    }))
    canvas.addEventListener('touchmove',((e)=>{
      e.preventDefault()
      e.touches.forEach((item)=>{
        touchevents.followUpEvent(item)
      })
    }))
    canvas.addEventListener('touchend', ((e)=>{
      e.preventDefault()
      e.changedTouches.forEach((item)=>{
        let res = touchevents.removeEvent(item)
        //console.log(res.type)
        //console.log(databus.heroSide)
        if(res.type === databus.heroSide){ 
          console.log(res.swipe)        
          this.hero.move(res.swipe)
        }
        if(databus.heroHit === true){
          this.restart()
        }
      })
    }))
  }

}