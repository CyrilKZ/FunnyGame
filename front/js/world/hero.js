import Sprite from '../base/sprite'
import DataBus from '../databus'
import * as THREE from '../libs/three.min'

const HERO_RADIUS = 6
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

export default class Hero extends Sprite{
  constructor(){
    super(2* HERO_RADIUS, 2 * HERO_RADIUS, 2 * HERO_RADIUS)
  }
  initSelf(row){
    let geometry = new THREE.IcosahedronGeometry(HERO_RADIUS, 2)
    let metarial = new THREE.MeshLambertMaterial({color: 0xeeddcc})
    this.model = new THREE.Mesh(geometry, metarial)
    this.row = row
    this.x = (row- 2) * ROW_WIDTH
    this.y = HERO_BASELINE
    this.z = 0
    this.movingframe = 0
    this.model.position.set(this.x + ROW_WIDTH / 2, this.y + HERO_RADIUS, this.z + HERO_RADIUS)
    this.model.castShadow = true
    this.model.visible = true  
    this.visible = true
    this.moving = false
    this.direction = NO_MOVE
    this.speedX = 0
    this.speedZ = 0
  }

  move(direction){
    if(this.moving === true){
      return
    }
    switch(direction){
      case MOVE_LEFT:
        if(this.row === 0 || this.row === 2){
          return
        }
        this.moving = true
        this.direction = MOVE_LEFT
        this.speedX = -MOVING_SPEED
        break
      case MOVE_RIGHT:
        if(this.row === 1 || this.row === 3){
          return
        }
        this.moving = true
        this.direction = MOVE_RIGHT
        this.speedX = MOVING_SPEED
        break
      case MOVE_UP:
        this.moving = true
        this.direction = MOVE_UP
        this.speedZ = JUMPING_SPEED
        break
      default:
        break
    }
  }

  update(){
    //console.log(this.moving)
    if(this.moving){
      if(this.direction === MOVE_UP){
        if(this.movingframe === TOTALFRAME_Z){
          this.movingframe = 0
          this.moving = false
          this.direction = NO_MOVE
          this.z = 0
          this.speedZ = 0
          this.model.position.z = 0
        }
        else{
          this.movingframe += 1
          this.z += this.speedZ
          this.speedZ -= GRAVITY
          this.model.position.z = this.z + HERO_RADIUS
        }
      }
      else{
        if(this.movingframe === TOTALFRAME_X){
          this.movingframe = 0
          if(this.direction === MOVE_LEFT){
            this.row -= 1            
          }
          else{
            this.row += 1
          }
          this.x = (this.row - 2) * ROW_WIDTH
          this.model.position.x = this.x + ROW_WIDTH/2
          this.moving = false
          this.direction = NO_MOVE
          this.speedX = 0
        }
        else{
          this.movingframe += 1
          this.x += this.speedX
          this.model.position.x += this.speedX
        }
      }
    }
  }
  // checkIsTouchValid(y){
  //   return y > 200
  // }
  // initEvent(){
  //   canvas.addEventListener('touchstart', ((e)=>{
  //     e.preventDefault()
  //     let y = e.touches[0].clientY
  //     if(this.checkIsTouchValid(y)){
  //       this.move(MOVE_UP)
  //     }
  //   }).bind(this))
  // }
}