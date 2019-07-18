import Pool from './base/pool'
let instance
const LEFT = 1
const RIGHT = 2
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
    this.step    = 0
    this.speed   = 1
    this.accel   = 1 / 10000
    this.blocks  = [[],[],[],[]]
    this.gameOver    = false
    this.heroWillHit = false
    this.heroSide    = 0
    this.heroHit     = false
    this.enemyHit    = false
    this.eneyWillHit = false
    this.eneySide    = 0
  }
  setHeroSide(row){
    this.heroSide = row < 2 ? LEFT:RIGHT
    //console.log(this.heroSide)
  }

  removeBlocks(block){
    let temp = this.blocks[block.row].shift()
    temp.setInvisible()
    this.pool.recover('block',block)
  }

}