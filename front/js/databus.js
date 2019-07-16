import Pool from './base/pool'
let instance

export default class DataBus {
  constructor() {
    if(instance){
      return instance
    }

    instance = this
    this.pool = new Pool()
    this.reset()
  }
  reset(){
    this.frame   = 0
    this.score   = 0
    this.blocks  = [[],[],[],[]]
  }

  removeBlocks(block){
    let temp = this.blocks[block.row].shift()
    temp.setInvisible()
    this.pool.recover('block',block)
  }

}