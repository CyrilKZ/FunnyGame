import Sprite from '../base/sprite'
import GameStatus from '../status'
import Network from '../base/network'
import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'

let gamestatus = new GameStatus()
let network = new Network()

export default class Hero extends Sprite{
  constructor(){
    let geometry = new THREE.BoxGeometry(CONST.HERO_LENGTH, CONST.HERO_LENGTH, CONST.HERO_LENGTH)
    let metarial = new THREE.MeshLambertMaterial({ color: CONST.HERO_COLOR })
    let model = new THREE.Mesh(geometry, metarial)
    model.castShadow = true
    super(model, CONST.HERO_LENGTH, CONST.HERO_LENGTH, CONST.HERO_LENGTH)

    this.row = 0
    this.moving = false
    this.movingframe = 0
    this.direction = CONST.DIR_NONE
    this.speedX = 0
    this.speedZ = 0
    this.canJumpSave = true
    this.canMoveSave = true
    this.isJumpSafe = true
    this.isMoveSafe = true
    this.moves = []
    this.blockPoints = 10
    this.energy = 0
    this.blockAround = null
    this.blockAhead = null
  }
  init(row, scene){
    this.row = row
    let x = (row - 2) * CONST.ROW_WIDTH + CONST.HERO_OFFSET
    this.initToScene(scene, x, CONST.HERO_BASELINE, 0)
    gamestatus.heroSide = row < 2 ? CONST.DIR_LEFT: CONST.DIR_RIGHT
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
    console.log(`new direction: ${direction}`)
    let safe = true
    this.scanBlockAhead()
    switch (direction) {
      case CONST.DIR_LEFT:
        if (this.row === 0 || this.row === 2) {
          return
        }
        this.moving = true
        this.direction = CONST.DIR_LEFT
        this.speedX = -CONST.HERO_MOVINGSPEED
        this.checkMoveSafe()
        if(!this.isMoveSafe){
          safe = false
        }
        break
      case CONST.DIR_RIGHT:
        if (this.row === 1 || this.row === 3) {
          return
        }
        this.moving = true
        this.direction = CONST.DIR_RIGHT
        this.speedX = CONST.HERO_MOVINGSPEED
        this.checkMoveSafe()
        if(!this.isMoveSafe){
          console.log('move is unsafe')
          safe = false
        }
        break
      case CONST.DIR_UP:
        this.moving = true
        this.direction = CONST.DIR_UP
        this.speedZ = CONST.HERO_JUMPINGSPEED
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
      "frm": gamestatus.frame,
      "pos": gamestatus.absDistance,
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
    for (let i = 0; i < gamestatus.blocks[this.row].length; ++i) {
      if (gamestatus.blocks[this.row][i].y > this.y - this.lengthY + 1) {
        this.blockAhead = gamestatus.blocks[this.row][i]
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
    let t = (CONST.HERO_JUMPINGSPEED - Math.sqrt(CONST.HERO_JUMPINGSPEED * CONST.HERO_JUMPINGSPEED - 2 * block.lengthZ * CONST.GRAVITY))/CONST.GRAVITY// 建议重修物理，wdnmd
    let a = gamestatus.accel
    let v = gamestatus.speed
    let minDistance = v * t + a * t * t/2
    let distance = block.y - block.lengthY - this.y + 1
    if(minDistance > distance){
      console.log('jump unsavable')
      this.canJumpSave = false
    }
    else{
      this.canJumpSave = true
    }    
    t = 52 / CONST.HERO_MOVINGSPEED - 1
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
    let vx = gamestatus.speed
    let a = gamestatus.accel
    let t = (CONST.HERO_JUMPINGSPEED + Math.sqrt(CONST.HERO_JUMPINGSPEED * CONST.HERO_JUMPINGSPEED - 2 * block.lengthZ * CONST.GRAVITY))/CONST.GRAVITY
    let minUnsafePos =  block.y - vx * t - a * t * t / 2 - 1                        //front of the brick hit back of the hero
    t = CONST.HERO_TOTAL_FZ
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
    if(this.direction === CONST.DIR_LEFT){ 
      for (let i = 0; i < gamestatus.blocks[this.row-1].length; ++i) {
        if (gamestatus.blocks[this.row-1][i].y > this.y) {
          this.blockAround = gamestatus.blocks[this.row-1][i]
          break
        }
      }
    }
    else{
      for (let i = 0; i < gamestatus.blocks[this.row+1].length; ++i) {
        if (gamestatus.blocks[this.row+1][i].y > this.y) {
          this.blockAround = gamestatus.blocks[this.row+1][i]
          break
        }
      }
    }
    if(this.blockAround === null){
      this.isMoveSafe = true
      return
    }
    let block = this.blockAround
    let a = gamestatus.accel
    let v = gamestatus.speed
    let t1 = CONST.HERO_TOTAL_FX
    let s1 = v * t1 + a * t1* t1/2
    let t2 = 65 / CONST.HERO_MOVINGSPEED - 1
    let s2 = v * t2 + a * t2* t2/2
    let distance1 = block.y - block.lengthY - this.y      // move in
    let distance2 = block.y - this.y + this.lengthY                      // move out
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
      if (this.direction === CONST.DIR_UP) {
        if (this.movingframe >= CONST.HERO_TOTAL_FZ) {
          if(gamestatus.heroWillHit == true){
            gamestatus.heroHit = true
          }
          this.movingframe = 0
          this.moving = false
          this.direction = CONST.DIR_NONE
          this.z = 0
          this.speedZ = 0
          this.model.position.z = this.z + CONST.HERO_RADIUS
          if(this.blockAhead !==null && this.y - this.lengthY >= this.blockAhead.y){
            this.energy += CONST.HERO_ENERGY_REWARD
            gamestatus.selfScore += CONST.JUMP_SCORE
          }
          this.scanBlockAhead()
        }
        else {
          this.movingframe += 1
          this.z += this.speedZ
          this.speedZ -= CONST.GRAVITY
          this.model.position.z = this.z + CONST.HERO_RADIUS
        }
        if(!(this.canJumpSave && this.isJumpSafe)){
          if(this.is3DCollideWith(this.blockAhead)){

            gamestatus.heroHit = true
 
          }
        }
      }
      else {
        if (this.movingframe >= CONST.HERO_TOTAL_FX) {
          this.movingframe = 0
          if(gamestatus.heroWillHit == true){
            gamestatus.heroHit = true
          }
          if (this.direction === CONST.DIR_LEFT) {
            this.row -= 1
          }
          else {
            this.row += 1
          }
          this.x = (this.row - 2) * CONST.ROW_WIDTH + CONST.ROW_WIDTH / 2 - CONST.HERO_RADIUS
          this.model.position.x = this.x + CONST.HERO_RADIUS
          this.moving = false
          this.direction = CONST.DIR_NONE
          this.speedX = 0
          this.scanBlockAhead()
        }
        else {
          if(this.movingframe === Math.round(CONST.HERO_TOTAL_FX / 2)){
            if(!this.canMoveSave){
              gamestatus.heroHit = true
            }
          }
          this.movingframe += 1
          this.x += this.speedX
          this.model.position.x += this.speedX
          if(!(this.canMoveSave && this.isMoveSafe)){
            
            if(this.is2DCollideWith(this.blockAround)){
              gamestatus.heroHit = true
            }            
          }
        }
      }
    }
    else{
      if(this.is2DCollideWith(this.blockAhead)){
        gamestatus.heroHit = true
      }
    }
    this.updateSaveInfo()
    if((!this.isJumpSafe) || (!this.isMoveSafe) || (!this.canJumpSave && !this.canMoveSave)){
      network.sendTransfer({
        'info': 'danger'
      }, ()=>{
        gamestatus.heroWillHit = true
      })      
    }
    this.energy += 1
    if(this.energy > CONST.HERO_ENERGY_LIMIT){
      this.energy -= CONST.HERO_ENERGY_LIMIT
      this.blockPoints += 1
    }
  }
}