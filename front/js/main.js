import DataBus from './databus'
import Block from './world/block'
import Hero from './world/hero'
import TouchEvent from './runtime/touch'
import GameStage from './stages/gamestage'
import StartStage from './stages/startstage'
import EndStage from './stages/endstage'

import * as THREE from './libs/three.min'

let databus = new DataBus()

const SCREEN_WIDTH = 1920
const SCREEN_HEIGHT = 1080
const GAME = 2
const START = 1
const END = 3
let ctx = canvas.getContext('webgl')
let renderer = new THREE.WebGLRenderer(ctx)
let touchevents = new TouchEvent()



export default class Game {
  constructor() {
    //console.log(d2Ctx)
    this.aniID = 0
    this.initTouchEvents()
    canvas.appendChild(renderer.domElement)
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
    renderer.shadowMapEnabled = true
    
    this.gameStage = new GameStage()
    this.startStage = new StartStage()
    this.endStage = new EndStage()
    console.log(this.endStage)
    this.currentStage = START
    this.restart()

  }

  restart(){  
    switch (this.currentStage) {
      case START:
        this.startStage.restart()
        break
      case GAME:
        this.gameStage.restart()
        break
      case END:
        this.endStage.restart()
        break
      default:
        break
    }
    this.bindLoop = this.loop.bind(this)
    window.cancelAnimationFrame(this.aniID)
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  

  loop() {
    if(databus.gameFlag){
      console.log('switch')
      this.currentStage = GAME
      databus.gameFlag = false
      this.gameStage.restart()
      //renderer.clear()
    }
    else if(databus.endFlag){
      console.log('switch')
      this.currentStage = END
      databus.endFlag = false
      this.endStage.restart()
      //renderer.clear()
    }
    switch (this.currentStage) {
      case START:
        this.startStage.loop()
        break
      case GAME:
        this.gameStage.loop()
        break
      case END:
        this.endStage.loop()
      default:
        break
    }
    this.render()
    
  }
  render() {
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
      )
      switch (this.currentStage) {
        case START:
          this.startStage.render(renderer)
          break
        case GAME:
          this.gameStage.render(renderer)
          break
        case END:
          this.endStage.render(renderer)
        default:
          break
      }
  }
  handleTouchEvents(res){
    switch (this.currentStage) {
      case START:
        this.startStage.handleTouchEvents(res)
        break
      case GAME:
        this.gameStage.handleTouchEvents(res)
        break
      case END:
        this.endStage.handleTouchEvents(res)
        break
      default:
        break
    }
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
        this.handleTouchEvents(res)        
      })
    }))
  }

}