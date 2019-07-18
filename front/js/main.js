import DataBus from './databus'
import Block from './world/block'
import Hero from './world/hero'
import TouchEvent from './runtime/touch'
import GameStage from './gamestage'


import * as THREE from './libs/three.min'


const SCREEN_WIDTH = 1920
const SCREEN_HEIGHT = 1080

let ctx = canvas.getContext('webgl')
let renderer = new THREE.WebGLRenderer(ctx)
let touchevents = new TouchEvent()


export default class Game {
  constructor() {
    this.aniID = 0
    this.initTouchEvents()
    canvas.appendChild(renderer.domElement)
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
    renderer.shadowMapEnabled = true
    


    this.currentStage = new GameStage()
    this.restart()

  }

  restart(){  
    this.currentStage.restart()
    this.bindLoop = this.loop.bind(this)
    window.cancelAnimationFrame(this.aniID)
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  

  loop() {
    this.currentStage.loop()
    this.render()
    
  }
  render() {
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
      )
    //console.log(renderer)
    this.currentStage.render(renderer)
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
        this.currentStage.handleTouchEvents(res)        
      })
    }))
  }

}