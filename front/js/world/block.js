import Sprite from '../base/sprite'
import DataBus from '../databus'
import * as THREE from '../libs/three.min'

const BLOCK_X = 10
const BLOCK_Y = 0.5
const BLOCK_Z = 1
const OFFSET = 1

let databus = new DataBus()

const __ = {
  speed: Symbol('speed')
}

export default class Block extends Sprite{
  constructor(){
    super(BLOCK_X, BLOCK_Y, BLOCK_Z)
    
    
  }
  init(row, speed){
    let geometry = new THREE.CubeGeometry(BLOCK_X - OFFSET*2, BLOCK_Y, BLOCK_Z)
    let metarial = new THREE.MeshLambertMaterial({ color: 0xccddee })
    this.model = new THREE.Mesh(geometry, metarial)
    this.y = 40
    this.x = (row - 2) * BLOCK_X
    this.speed = speed
    this[__.speed] = speed
    this.model.position.set(this.x + BLOCK_X / 2, this.y + BLOCK_Y / 2, this.z + BLOCK_Z / 2)
    this.model.visible = true
    this.visible = true
  }
  setInvisible(){
    this.visible = false
    this.model.visible = false
  }

  update() {
    // if(!this.visible){
    //   return
    // }
    // if(speed !== null){
    //   this[__.speed] = speed
    // }
    this.y -= this.speed
    this.model.position.y -= this.speed
    //console.log(this.model.position.y)
    if( this.y < -25){
      databus.removeBlocks(this)
    }
  }
}