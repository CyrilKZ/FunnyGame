/**
 * 游戏基础的精灵类
 */

//var THREE = require('../libs/three.min.js')

/** 
  * @param{x, y, x} (x, y, z) 物体正方体最左、下、右点的坐标
 */
export default class Sprite {
  constructor(lengthX = 0, lengthY = 0, lengthZ = 0, x = 0, y = 0, z = 0) {
    this.lengthX = lengthX
    this.lengthY = lengthY
    this.lengthZ = lengthZ
    this.x = x
    this.y = y
    this.z = z
    this.visible = false
  }


  /**
   * 简单的碰撞检测定义，二维
   * @param{Sprite} sp: Sptite的实例
   */
  is2DCollideWith(sp) {
    if ( !this.visible || !sp.visible )
      return false

    let spXLeft = sp.x
    let spXRight = spXLeft + sp.lengthX
    let spYBack = sp.y
    let spYFront = spYBack - sp.lengthY

    let xLeft = this.x
    let xRight = xLeft + this.lengthX
    let yBack = this.y
    let yFront = yBack - this.lengthY

    let xCollide = false
    let yCollide = false

    if(spXLeft < xRight && spXRight > xLeft){
      xCollide = true
    }
    if(spYBack < yFront && spYFront > yBack){
      yCollide = true
    }
    return (xCollide && yCollide)
  }
  /**
   * 简单的碰撞检测定义，三维
   * @param{Sprite} sp: Sptite的实例
   */
  is3DCollideWith(sp) {
    let spZBottom = sp.z
    let spZTop = spZBottom + sp.lengthZ
    let zBottom = this.z
    let zTop = zBottom + this.lengthZ
    return (this.is2DCollideWith(sp) && spZBottom > zTop && zBottom > spZTop)
  }
}
