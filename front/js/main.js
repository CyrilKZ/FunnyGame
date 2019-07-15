import DataBus from './databus'
import Block from './world/block'
import * as THREE from './libs/three.min'

let gameCtx = canvas.getContext('webgl')
let gameScene = new THREE.Scene()
let gameCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight,1, 1000)
let gameRenderer = new THREE.WebGLRenderer(gameCtx)
let databus = new DataBus()
let light = new THREE.DirectionalLight(0xffffff, 1)
let aLight = new THREE.AmbientLight(0xffffff, 0.5)


export default class Game {
  constructor() {
    this.aniID = 0
    canvas.appendChild(gameRenderer.domElement)
    let geometry = new THREE.PlaneGeometry(40, 100, 1, 1)
    let material = new THREE.MeshLambertMaterial({ color: 0xffffff })
    this.ground = new THREE.Mesh(geometry, material)
    let baselineGeo = new THREE.CubeGeometry(40, 0.1, 0.1)
    let baselineMat = new THREE.MeshLambertMaterial({color: 0x000000})
    this.baseline = new THREE.Mesh(baselineGeo, baselineMat)
    gameRenderer.setSize(window.innerWidth, window.innerHeight)
    light.position.set(0, 2, 1).normalize()
    this.ground.position.set(0,10,0)
    this.baseline.position.set(0, -20, 0)
    //this.ground.castShadow = true
    //this.ground.receiveShadow = true
    gameCamera.position.z = 25
    gameCamera.position.y = -25
    gameCamera.rotateX(Math.PI / 6)
    gameScene.add(this.ground)
    gameScene.add(this.baseline)
    gameScene.add(light)
    gameScene.add(aLight)
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
      block.init(Math.round(Math.random() * 3), 0.1)
      databus.blocks.push(block)
      gameScene.add(block.model)
    }
    databus.blocks.forEach((item)=>{
      item.update()
    })
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