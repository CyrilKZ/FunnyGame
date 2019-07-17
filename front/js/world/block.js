import Sprite from '../base/sprite'
import DataBus from '../databus'
import * as THREE from '../libs/three.min'

const BLOCK_X = 110
const BLOCK_Y = 8
const BLOCK_Z = 12
const OFFSET = 10

let databus = new DataBus()



export default class Block extends Sprite{
  constructor(){
    super(BLOCK_X, BLOCK_Y, BLOCK_Z)
    let geometry = new THREE.CubeGeometry(BLOCK_X - OFFSET*2, BLOCK_Y, BLOCK_Z)
    let metarial = new THREE.MeshLambertMaterial({ color: 0xccddee })
    this.model = new THREE.Mesh(geometry, metarial)  
  }
  init(row){    
    this.y = 40
    this.x = (row - 2) * BLOCK_X
    this.z = 0
    this.row = row
    this.model.receiveShadow = true
    this.model.position.set(this.x + BLOCK_X / 2, this.y + BLOCK_Y / 2, this.z + BLOCK_Z / 2)
    this.model.visible = true
    this.visible = true
  }
  setInvisible(){
    this.visible = false
    this.model.visible = false
  }

  update(speed) {
    this.y -= speed
    this.model.position.y -= speed
    if( this.y < -550){
      databus.removeBlocks(this)
    }
  }
}