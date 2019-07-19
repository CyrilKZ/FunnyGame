import Sprite from '../base/sprite'
import DataBus from '../databus'
import GameStore from '../gamestore'
import Network from '../network'
import * as THREE from '../libs/three.min'

const HERO_RADIUS = 7
const HERO_BASELINE = -450
const ROW_WIDTH = 110
const MOVING_SPEED = 10
const JUMPING_SPEED = 8
const GRAVITY = 0.5
const NO_MOVE = 0
const MOVE_UP = 3
const MOVE_LEFT = 1
const MOVE_RIGHT = 2
const TOTALFRAME_X = ROW_WIDTH / MOVING_SPEED
const TOTALFRAME_Z = 2 * JUMPING_SPEED / GRAVITY


let databus = new DataBus()
let store = new GameStore()
let network = new Network()

export default class Enemy extends Sprite {
  constructor() {
    super(2 * HERO_RADIUS, 2 * HERO_RADIUS, 2 * HERO_RADIUS)
  }
  initEnemy(row) {
    let geometry = new THREE.BoxGeometry(2 * HERO_RADIUS, 2 * HERO_RADIUS, 2 * HERO_RADIUS)
    let metarial = new THREE.MeshLambertMaterial({ color: 0xee22ff })
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

    let self = this
    network.onAction((res)=>{
      self.addToMove(res.dir, res.safe)
    })
  }

  addToMove(direction, safe){
    this.moves.push({
      direction: direction,
      safe: safe
    })
  }

  move() {
    if (this.moving === true) {
      return
    }
    let nextMove = null
    if(this.moves.length > 0){
      nextMove = this.moves.shift()
    }
    if(nextMove === null){
      return
    }
    let direction = nextMove.direction
    let safe = nextMove.safe
    switch (direction) {
      case MOVE_LEFT:
        if (this.row === 0 || this.row === 2) {
          return
        }
        this.moving = true
        this.direction = MOVE_LEFT
        this.speedX = -MOVING_SPEED
        this.isMoveSafe = safe
        this.findBlockAround()
        break
      case MOVE_RIGHT:
        if (this.row === 1 || this.row === 3) {
          return
        }
        this.moving = true
        this.direction = MOVE_RIGHT
        this.speedX = MOVING_SPEED
        this.isMoveSafe = safe
        this.findBlockAround()
        break
      case MOVE_UP:
        this.moving = true
        this.direction = MOVE_UP
        this.speedZ = JUMPING_SPEED
        this.isJumpSafe = safe
        break
      default:
        return
    }
  }

  findBlockAhead(){
    for (let i = 0; i < databus.blocks[this.row].length; ++i) {
      if (databus.blocks[this.row][i].y > this.y  - this.lengthY + 1) {
        this.blockAhead = databus.blocks[this.row][i]
        break
      }
    }
  }
  setSaveInfo(canJumpSave, canMoveSave){
    this.canJumpSave = canJumpSave
    this.canMoveSave = canMoveSave
  }

  findBlockAround(){
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
    return
  }

  setEnemyHit(){
    databus.enemyHit = true
  }

  update() {
    this.move()
    if (this.moving) {
      if (this.direction === MOVE_UP) {
        if (this.movingframe === TOTALFRAME_Z) {
          this.movingframe = 0
          this.moving = false
          this.direction = NO_MOVE
          this.z = 0
          this.speedZ = 0
          this.model.position.z = this.z + HERO_RADIUS
          if(!(this.canJumpSave && this.isJumpSafe)){
            if(this.is3DCollideWith(this.blockAhead)){
              //databus.enemyHit = true
            }
          }
        }
        else {
          this.movingframe += 1
          this.z += this.speedZ
          this.speedZ -= GRAVITY
          this.model.position.z = this.z + HERO_RADIUS
        }
        if(!(this.canJumpSave && this.isJumpSafe)){
          if(this.is3DCollideWith(this.blockAhead)){
            //databus.enemyHit = true
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
          if(!(this.canMoveSave && this.isMoveSafe)){
            
            if(this.is2DCollideWith(this.blockAround)){
              //databus.enemyHit = true
            }            
          }
        }
        else {
          this.movingframe += 1
          this.x += this.speedX
          this.model.position.x += this.speedX
          if(!(this.canMoveSave && this.isMoveSafe)){
            
            if(this.is2DCollideWith(this.blockAround)){
              //databus.enemyHit = true
            }            
          }
        }
      }
    }
    else{
      if(this.is2DCollideWith(this.blockAhead)){
        //databus.enemyHit = true
      }
      
    }
    this.findBlockAhead()
    if((!this.isJumpSafe) || (!this.isMoveSafe) || ((!this.canJumpSave)&&(!this.canMoveSave))){
      databus.enemyWillHit = true
    }    
  }
}