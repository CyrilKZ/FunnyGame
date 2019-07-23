import * as CONST from '../libs/constants'
import GameStatus from '../status'

let gamestatus = new GameStatus()

export default class Block extends Sprite{
  constructor(){
    let geometry = new THREE.CubeGeometry(BLOCK_X - OFFSET*2, BLOCK_Y, BLOCK_Z)
    let metarial = new THREE.MeshLambertMaterial({ color: 0xccddee })
    let model = new THREE.Mesh(geometry, metarial)
    model.receiveShadow = true
    super(model, CONST.BLOCK_LENGTHX, CONST.BLOCK_LENGTHY, CONST.BLOCK_LENGTHZ)
  }
  init(row, scene, y = 0){
    this.row = row    
    let x = (row - 2) * CONST.ROW_WIDTH + CONST.BLOCK_OFFSET
    this.initToScene(scene, x, y, 0)
    gamestatus.blocks[row].push(this)
  }
  update(speed) {
    this.y -= speed
    this.model.position.y -= speed
    if( this.y < -550){
      gamestatus.removeBlock(this)
    }
  }
}