import Sprite from '../base/sprite'
import DataBus from '../databus'
import * as THREE from '../libs/three.min'

const HERO_RADIUS = 7
const HERO_BASELINE = -450
const ROW_WIDTH = 110
const MOVING_SPEED = 10
const JUMPING_SPEED = 9
const GRAVITY = 0.5
const NO_MOVE = 0
const MOVE_UP = 3
const MOVE_LEFT = 1
const MOVE_RIGHT = 2
const TOTALFRAME_X = ROW_WIDTH / MOVING_SPEED
const TOTALFRAME_Z = 2 * JUMPING_SPEED / GRAVITY
const ENERGY_LIMIT = 100
const ENERGY_REWARD = 50

let databus = new DataBus()

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
    this.scanBlockAhead()
    switch (direction) {
      case MOVE_LEFT:
        if (this.row === 0 || this.row === 2) {
          return
        }
        this.moving = true
        this.direction = MOVE_LEFT
        this.speedX = -MOVING_SPEED
       // midX = -MOVING_SPEED * TOTALFRAME_X + this.x
        this.checkMoveSafe()
        break
      case MOVE_RIGHT:
        if (this.row === 1 || this.row === 3) {
          return
        }
        this.moving = true
        this.direction = MOVE_RIGHT
        this.speedX = MOVING_SPEED
        //midX = MOVING_SPEED * TOTALFRAME_X + this.x
        this.checkMoveSafe()
        break
      case MOVE_UP:
        this.moving = true
        this.direction = MOVE_UP
        this.speedZ = JUMPING_SPEED
        this.checkJumpSafe()
        break
      default:
        return
    }
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
    if(this.blockAhead === null){
      return
    }
    let block = this.blockAhead
    let t = Math.sqrt(2 * block.lengthZ / GRAVITY)
    let a = databus.accel
    let v = databus.speed
    let minDistance = v * t + a * t * t/2
    let distance = block.y - block.lengthY - this.y
    if(minDistance > distance){
      this.canJumpSave = false
    }    
    t = TOTALFRAME_X / 2
    minDistance = v * t + a * t* t/2
    if(minDistance > distance){
      this.canMoveSave = false
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
    let t = Math.sqrt(2 * (JUMPING_SPEED * JUMPING_SPEED) / (GRAVITY * GRAVITY) - 2 * block.lengthZ / GRAVITY)
    let minUnsafeDistance = vx * t + a * t * t / 2
    t = TOTALFRAME_Z
    let maxUnsafeDistance = vx * t + a * t * t / 2 + block.lengthY
    if(minUnsafeDistance < block.y && block.y < maxUnsafeDistance){
      this.isJumpSafe = false
      return
    }
    this.isJumpSafe = true
    return
  }

  checkMoveSafe(){
    this.blockAround = null    
    //console.log(this.row)
    if(this.direction === MOVE_LEFT){
      for (let i = 0; i < databus.blocks[this.row-1].length; ++i) {
        if (databus.blocks[this.row-1][i].y > this.y) {
          this.blockAround = databus.blocks[this.row-1][i]
          //console.log(this.blockAround)
          break
        }
      }
    }
    else{
      for (let i = 0; i < databus.blocks[this.row+1].length; ++i) {
        if (databus.blocks[this.row+1][i].y > this.y) {
          this.blockAround = databus.blocks[this.row+1][i]
          //console.log(this.blockAround)
          break
        }
      }
    }
    if(this.blockAround === null){
      this.isMoveSafe = false
      return
    }
    let block = this.blockAround
    let a = databus.accel
    let v = databus.speed
    let t1 = TOTALFRAME_X
    let s1 = v * t1 + a * t1* t1/2
    let t2 = TOTALFRAME_X/2
    let s2 = v * t2 + a * t2* t2/2
    let distance1 = block.y - block.lengthY - this.y      // move in
    let distance2 = block.y - this.y                      // move out
    if(s1 > distance1 && s2 < distance2){
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
          this.movingframe = 0
          this.moving = false
          this.direction = NO_MOVE
          this.z = 0
          this.speedZ = 0
          this.model.position.z = this.z + HERO_RADIUS
          if(this.blockAhead !==null && this.y - this.lengthY >= this.blockAhead.y){
            console.log(this.blockAhead.y)
            console.log('jump dodge')
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
          }
        }
      }
      else {
        if (this.movingframe === TOTALFRAME_X) {
          this.movingframe = 0
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
              databus.heroHit = true
            }            
          }
        }
      }
    }
    else{
      if(this.is2DCollideWith(this.blockAhead)){
        databus.heroHit = true
        //console.log('direct hit')
      }
    }
    this.updateSaveInfo()
    if((!this.isJumpSafe) || (!this.isMoveSafe) || ((!this.canJumpSave)&&(!this.canMoveSave))){
      databus.heroWillHit = true
      //console.log('will hit')
    }
    this.energy += 1
    if(this.energy > ENERGY_LIMIT){
      this.energy -= ENERGY_REWARD
      this.blockPonits += 1
    }
  }
}