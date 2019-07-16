import DataBus from './databus'
import Block from './world/block'
import Hero from './world/hero'

import * as THREE from './libs/three.min'

const PLANE_WIDTH = 440
const PLANE_LENGTH = 1000
const BASELINE_POS = -250
const CAMERA_Z = 250
const CAMERA_Y = -250
const CAMERA_ROT_X = Math.PI / 6

let gameCtx = canvas.getContext('webgl')
let gameScene = new THREE.Scene()
let gameCamera = new THREE.PerspectiveCamera(60, 16 / 9,1, 1000)
let gameRenderer = new THREE.WebGLRenderer(gameCtx)
let databus = new DataBus()
let light = new THREE.DirectionalLight(0xffffff, 1)
let aLight = new THREE.AmbientLight(0xffffff, 0.5)


export default class Game {
  constructor() {
    this.aniID = 0
    canvas.appendChild(gameRenderer.domElement)
    let geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_LENGTH, 1, 1)
    let material = new THREE.MeshLambertMaterial({ color: 0xeeffee })
    this.ground = new THREE.Mesh(geometry, material)
    let baselineGeo = new THREE.CubeGeometry(PLANE_WIDTH, 0.1, 0.1)
    let baselineMat = new THREE.MeshLambertMaterial({color: 0x000000})
    this.baseline = new THREE.Mesh(baselineGeo, baselineMat)
    gameRenderer.setSize(1920, 1080)
    light.position.set(0, 2, 1).normalize()
    this.ground.position.set(0, 0 ,0)
    this.baseline.position.set(0, BASELINE_POS, 0)
    this.hero = new Hero()
    this.hero.initSelf(1)
    this.hero.initEvent()
    gameCamera.position.z = CAMERA_Z
    gameCamera.position.y = CAMERA_Y
    gameCamera.rotateX(CAMERA_ROT_X)
    gameScene.add(this.ground)
    gameScene.add(this.baseline)
    gameScene.add(light)
    gameScene.add(aLight)
    gameScene.add(this.hero.model)
    this.restart()
  }
  restart(){
    databus.reset()

    this.bindLoop = this.loop.bind(this)
    window.cancelAnimationFrame(this.aniID)
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
  loop() {
    databus.frame++
    if(databus.frame % 40 === 0){
      let block = databus.pool.getItemByClass('block', Block)
      block.init(Math.round(Math.random() * 3), 1)
      databus.blocks[block.row].push(block)
      gameScene.add(block.model)
    }
    databus.blocks.forEach((row)=>{
      row.forEach((item)=>{
        item.update()
      })
    })
    this.hero.update()
    this.render()
    //console.log(databus.frame)
  }
  render() {
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
      )
    gameRenderer.render(gameScene, gameCamera)
  }

}