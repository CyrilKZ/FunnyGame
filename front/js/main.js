import DataBus from './databus'
import GameStore from './gamestore'
import Block from './world/block'
import Hero from './world/hero'
import TouchEvent from './runtime/touch'
import GameStage from './stages/gamestage'
import StartStage from './stages/startstage'
import EndStage from './stages/endstage'
import WelcomeStage from './stages/welcome'
import netDemo from './net-demo'

import * as THREE from './libs/three.min'

let databus = new DataBus()
let store = new GameStore()

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

    //this.netDemo = new netDemo()
    this.welcomeStage = new WelcomeStage()
    this.gameStage = new GameStage()
    this.startStage = new StartStage()
    
    this.endStage = new EndStage()
    console.log(this.endStage)
    this.currentStage = store.welcome
    this.restart()
    wx.showShareMenu({
      withShareTicket: true
    })
    wx.onShareAppMessage(() => {
      console.log('????')
      console.log(store.roomID)
      return {
        query: store.roomID
      }
    })
  }

  restart(){  
    // switch (this.currentStage) {
    //   case store.start:
    //     this.startStage.restart()
    //     break
    //   case store.game:
    //     this.gameStage.restart()
    //     break
    //   case store.end:
    //     this.endStage.restart()
    //     break
    //   default:
    //     break
    // }
    this.bindLoop = this.loop.bind(this)
    window.cancelAnimationFrame(this.aniID)
    this.aniID = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  

  loop() {
    if(store.startFlag){
      console.log('switch')
      this.currentStage = store.start
      store.startFlag = false
      this.startStage.restart()
    }
    else if(store.gameFlag){
      console.log('switch')
      this.currentStage = store.game
      store.gameFlag = false
      this.gameStage.restart()
      //renderer.clear()
    }
    else if(databus.endFlag){
      console.log('switch')
      this.currentStage = store.end
      store.endFlag = false
      this.endStage.restart()
      //renderer.clear()
    }
    switch (this.currentStage) {
      case store.welcome:
        this.welcomeStage.loop()
        break
      case store.start:
        this.startStage.loop()
        break
      case store.game:
        this.gameStage.loop()
        break
      case store.end:
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
        case store.welcome:
          this.welcomeStage.render(renderer)
          break
        case store.start:
          this.startStage.render(renderer)
          break
        case store.game:
          this.gameStage.render(renderer)
          break
        case store.end:
          this.endStage.render(renderer)
        default:
          break
      }
  }
  handleTouchEvents(res){
    switch (this.currentStage) {
      case store.start:
        this.startStage.handleTouchEvents(res)
        break
      case store.game:
        this.gameStage.handleTouchEvents(res)
        break
      case store.end:
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