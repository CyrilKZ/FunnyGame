import Sprite from '../base/sprite'
import DataBus from '../databus'
import GameStore from '../gamestore'
import Network from '../network'

import * as THREE from '../libs/three.min'

const HERO_RADIUS = 7
const HERO_BASELINE = -450
const ROW_WIDTH = 110
const MOVING_SPEED = 8
const JUMPING_SPEED = 9
const GRAVITY = 0.4
const NO_MOVE = 0
const MOVE_UP = 3
const MOVE_LEFT = 1
const MOVE_RIGHT = 2
const TOTALFRAME_X = ROW_WIDTH / MOVING_SPEED
const TOTALFRAME_Z = 2 * JUMPING_SPEED / GRAVITY
const ENERGY_LIMIT = 100
const ENERGY_REWARD = 50

let databus = new DataBus()
let store = new GameStore()
let network = new Network()

export default class Hero extends Sprite {
  constructor() {
    super(2 * HERO_RADIUS, 2 * HERO_RADIUS, 2 * HERO_RADIUS)
  }
  initSelf(row) {
    let geometry = new THREE.BoxGeometry(2 * HERO_RADIUS, 2 * HERO_RADIUS, 2 * HERO_RADIUS)
    let metarial = new THREE.MeshLambertMaterial({ color: 0x2bae85 })
    this.model = new THREE.Mesh(geometry, metarial)
    this.row = row
    this.x = (row - 2) * ROW_WIDTH + ROW_WIDTH / 2 - HERO_RADIUS
    this.y = HERO_BASELINE
    this.z = 0
    this.movingframe = 0
    this.model.position.set(this.x + HERO_RADIUS, this.y - HERO_RADIUS, this.z + HERO_RADIUS)
    this.model.castShadow = true
    this.model.visible = true
    this.visible = true
    this.moving = false
    this.direction = NO_MOVE
    this.speedX = 0
    this.speedZ = 0
    this.canJumpSave = true
    this.canMoveSave = true
    this.isJumpSafe = true
    this.isMoveSafe = true
    this.blockAhead = null
    this.blockAround = null
    this.moves = []
    this.blockPonits = 10
    this.energy = 0
  }

  addMove(direction){
    if(this.moves.length < 2){
      this.moves.push(direction)
    }
  }

  updateMove() {
    if (this.moving === true) {
      return
    }
    
    let direction
    if(this.moves.length > 0){
      direction = this.moves.shift()
    }
    else{
      return
    }
    let safe = true
    this.scanBlockAhead()
    switch (direction) {
      case MOVE_LEFT:
        if (this.row === 0 || this.row === 2) {
          return
        }
        this.moving = true
        this.direction = MOVE_LEFT
        this.speedX = -MOVING_SPEED
        this.checkMoveSafe()
        if(!this.isMoveSafe){
          safe = false
        }
        break
      case MOVE_RIGHT:
        if (this.row === 1 || this.row === 3) {
          return
        }
        this.moving = true
        this.direction = MOVE_RIGHT
        this.speedX = MOVING_SPEED
        this.checkMoveSafe()
        if(!this.isMoveSafe){
          console.log('move is unsafe')
          safe = false
        }
        break
      case MOVE_UP:
        this.moving = true
        this.direction = MOVE_UP
        this.speedZ = JUMPING_SPEED
        this.checkJumpSafe()
        if(!this.isJumpSafe){
          console.log('jump is unsafe')
          safe = false
        }
        break
      default:
        return
    }
    network.sendAction({
      "frm": databus.frame,
      "pos": databus.absDistance,
      "dir": direction,
      "safe": safe
    }, ()=>{
      //console.log(safe)
    }, ()=>{
      console.log('fail')
    })
  }

  scanBlockAhead(){
    this.blockAhead = null
    for (let i = 0; i < databus.blocks[this.row].length; ++i) {
      if (databus.blocks[this.row][i].y > this.y - this.lengthY + 1) {
        this.blockAhead = databus.blocks[this.row][i]
        break
      }
    }
  }
  updateSaveInfo(){
    if(!this.moving){
      this.scanBlockAhead()
    }
    else{
      return
    }  
    if(this.blockAhead === null){
      return
    }
    let block = this.blockAhead
    let t = (JUMPING_SPEED - Math.sqrt(JUMPING_SPEED * JUMPING_SPEED - 2 * block.lengthZ * GRAVITY))/GRAVITY// 建议重修物理，wdnmd
    let a = databus.accel
    let v = databus.speed
    let minDistance = v * t + a * t * t/2
    let distance = block.y - block.lengthY - this.y + 1
    if(minDistance > distance){
      console.log('jump unsavable')
      this.canJumpSave = false
    }
    else{
      this.canJumpSave = true
    }    
    t = 52 / MOVING_SPEED - 1
    minDistance = v * t + a * t* t/2
    if(minDistance > distance){
      console.log(`move half time: ${t}, will hit`)
      this.canMoveSave = false
    }
    else{
      this.canMoveSave = true
    }
  }

  checkJumpSafe(){
    if(this.canJumpSave === false){
      this.isJumpSafe = false
      return
    }
    if(this.blockAhead === null){
      this.isJumpSafe = true
      return
    }    
    let block = this.blockAhead
    let vx = databus.speed
    let a = databus.accel
    let t = (JUMPING_SPEED + Math.sqrt(JUMPING_SPEED * JUMPING_SPEED - 2 * block.lengthZ * GRAVITY))/GRAVITY
    let minUnsafePos =  block.y - vx * t - a * t * t / 2 - 1                        //front of the brick hit back of the hero
    t = TOTALFRAME_Z
    let maxUnsafePos = block.y - block.lengthY - vx * t - a * t * t / 2 + 1       //hit the foot of the brick
    if(minUnsafePos > this.y - this.lengthY && maxUnsafePos < this.y){
      this.isJumpSafe = false
      return
    }
    this.isJumpSafe = true
    return
  }

  checkMoveSafe(){
    this.blockAround = null    
    if(this.direction === MOVE_LEFT){ 
      for (let i = 0; i < databus.blocks[this.row-1].length; ++i) {
        if (databus.blocks[this.row-1][i].y > this.y) {
          this.blockAround = databus.blocks[this.row-1][i]
          break
        }
      }
    }
    else{
      for (let i = 0; i < databus.blocks[this.row+1].length; ++i) {
        if (databus.blocks[this.row+1][i].y > this.y) {
          this.blockAround = databus.blocks[this.row+1][i]
          break
        }
      }
    }
    if(this.blockAround === null){
      this.isMoveSafe = true
      return
    }
    let block = this.blockAround
    let a = databus.accel
    let v = databus.speed
    let t1 = TOTALFRAME_X
    let s1 = v * t1 + a * t1* t1/2
    let t2 = 65 / MOVING_SPEED - 1
    let s2 = v * t2 + a * t2* t2/2
    let distance1 = block.y - block.lengthY - this.y      // move in
    let distance2 = block.y - this.y + this.lengthY                      // move out
    if(s1 > distance1 && s2 < distance2){
      console.log('unsafe move')
      console.log(`s1: ${s1}`)
      console.log(`s2: ${s2}`)
      console.log(`dis1: ${distance1}`)
      console.log(`dis2: ${distance2}`)
      this.isMoveSafe = false
      return
    }
    this.isMoveSafe = true
    return
  }

  update() {
    this.updateMove()
    if (this.moving) {
      if (this.direction === MOVE_UP) {
        if (this.movingframe === TOTALFRAME_Z) {
          if(this.heroWillHit == true){
            this.heroHit = true
            network.sendFail(()=>{
              console.log('fail')
            }, ()=>{
              console.log('didnt send')
            })
          }
          this.movingframe = 0
          this.moving = false
          this.direction = NO_MOVE
          this.z = 0
          this.speedZ = 0
          this.model.position.z = this.z + HERO_RADIUS
          if(this.blockAhead !==null && this.y - this.lengthY >= this.blockAhead.y){
            this.energy += ENERGY_REWARD
          }
          this.scanBlockAhead()
        }
        else {
          this.movingframe += 1
          this.z += this.speedZ
          this.speedZ -= GRAVITY
          this.model.position.z = this.z + HERO_RADIUS
        }
        if(!(this.canJumpSave && this.isJumpSafe)){
          if(this.is3DCollideWith(this.blockAhead)){

            databus.heroHit = true
            network.sendFail(()=>{
              console.log('fail')
            }, ()=>{
              console.log('didnt send')
            })
          }
        }
      }
      else {
        if (this.movingframe === TOTALFRAME_X) {
          this.movingframe = 0
          if(this.heroWillHit == true){
            this.heroHit = true
            network.sendFail(()=>{
              console.log('fail')
            }, ()=>{
              console.log('didnt send')
            })
          }
          if (this.direction === MOVE_LEFT) {
            this.row -= 1
          }
          else {
            this.row += 1
          }
          this.x = (this.row - 2) * ROW_WIDTH + ROW_WIDTH / 2 - HERO_RADIUS
          this.model.position.x = this.x + HERO_RADIUS
          this.moving = false
          this.direction = NO_MOVE
          this.speedX = 0
          this.scanBlockAhead()
        }
        else {
          this.movingframe += 1
          this.x += this.speedX
          this.model.position.x += this.speedX
          if(!(this.canMoveSave && this.isMoveSafe)){
            
            if(this.is2DCollideWith(this.blockAround)){
              network.sendFail(()=>{
                console.log('fail')
              }, ()=>{
                console.log('didnt send')
              })
              databus.heroHit = true
            }            
          }
        }
      }
    }
    else{
      if(this.is2DCollideWith(this.blockAhead)){
        network.sendFail(()=>{
          console.log('fail')
        }, ()=>{
          console.log('didnt send')
        })
        databus.heroHit = true
      }
    }
    this.updateSaveInfo()
    if((!this.isJumpSafe) || (!this.isMoveSafe) || (!this.canJumpSave && !this.canMoveSave)){
      network.sendTransfer({
        'info': 'danger'
      }, ()=>{
        databus.heroWillHit = true
      })      
    }
    this.energy += 1
    if(this.energy > ENERGY_LIMIT){
      this.energy -= ENERGY_REWARD
      this.blockPonits += 1
    }
  }
}