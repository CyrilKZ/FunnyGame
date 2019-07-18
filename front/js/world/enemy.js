import Sprite from '../base/sprite'
import DataBus from '../databus'
import * as THREE from '../libs/three.min'

const HERO_RADIUS = 8
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

export default class Enemy extends Sprite {
  constructor() {
    super(2 * HERO_RADIUS, 2 * HERO_RADIUS, 2 * HERO_RADIUS)
  }
  initEnemy(row) {
    let geometry = new THREE.IcosahedronGeometry(HERO_RADIUS, 2)
    let metarial = new THREE.MeshLambertMaterial({ color: 0xee22ff })
    this.model = new THREE.Mesh(geometry, metarial)
    this.row = row
    this.x = (row - 2) * ROW_WIDTH + ROW_WIDTH / 2 - HERO_RADIUS
    this.y = HERO_BASELINE
    this.z = 0
    this.movingframe = 0
    this.model.position.set(this.x + HERO_RADIUS, this.y + HERO_RADIUS, this.z + HERO_RADIUS)
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
  }

  move(direction, safe) {
    if (this.moving === true) {
      return
    }
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
      if (databus.blocks[this.row][i].y > this.y) {
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
    return
  }

  setEnemyHit(){
    databus.enemyHit = true
  }

  update() {
    //console.log('update')
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
              databus.enemyHit = true
              //console.log('hit when jumping')
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
            databus.enemyHit = true
            //console.log('hit when jumping')
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
              databus.enemyHit = true
              //console.log('hit when moving')
            }            
          }
        }
        else {
          this.movingframe += 1
          this.x += this.speedX
          this.model.position.x += this.speedX
          if(!(this.canMoveSave && this.isMoveSafe)){
            
            if(this.is2DCollideWith(this.blockAround)){
              databus.enemyHit = true
              //console.log('hit when moving')
            }            
          }
        }
      }
    }
    else{
      if(this.is2DCollideWith(this.blockAhead)){
        databus.enemyHit = true
        //console.log('direct hit')
      }
      
    }
    this.findBlockAhead()
    if((!this.isJumpSafe) || (!this.isMoveSafe) || ((!this.canJumpSave)&&(!this.canMoveSave))){
      databus.enemyWillHit = true
    }    
  }
}