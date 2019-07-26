/**
  * @param{x, y, x} (x, y, z) 物体正方体最左、下、底点的坐标
 */
export default class Sprite {
  constructor (model, lengthX = 0, lengthY = 0, lengthZ = 0, x = 0, y = 0, z = 0) {
    this.model = model
    this.x = x
    this.y = y
    this.z = z
    this.lengthX = lengthX
    this.lengthY = lengthY
    this.lengthZ = lengthZ
    this.boundScene = false
    this.model.visible = false
    this.visible = false
  }

  /**
   * 简单的碰撞检测定义，二维
   * @param{Sprite} sp: Sptite的实例
   */
  is2DCollideWith (sp) {
    if (sp === null) { return false }

    if (!this.visible || !sp.visible) { return false }

    const spXMin = sp.x
    const spXMax = spXMin + sp.lengthX
    const spYMin = sp.y
    const spYMax = spYMin + sp.lengthY

    const xMin = this.x
    const xMax = xMin + this.lengthX
    const yMin = this.y
    const yMax = yMin + this.lengthY

    let xCollide = false
    let yCollide = false

    if (spXMin < xMax && spXMax > xMin) {
      xCollide = true
    }
    if (spYMax > yMin && spYMin < yMax) {
      yCollide = true
    }
    return (xCollide && yCollide)
  }

  /**
   * 简单的碰撞检测定义，三维
   * @param{Sprite} sp: Sptite的实例
   */
  is3DCollideWith (sp) {
    if (sp === null) { return false }
    const spZBottom = sp.z
    const spZTop = spZBottom + sp.lengthZ
    const zBottom = this.z
    const zTop = zBottom + this.lengthZ
    return (this.is2DCollideWith(sp) && spZBottom <= zTop && zBottom <= spZTop)
  }

  isCollideWithRect (rectX, rectY, rectLX, rectLY) {
    if (!this.visible || !sp.visible) { return false }
    const xMin = this.x
    const xMax = xMin + this.lengthX
    const yMin = this.y
    const yMax = yMin + this.lengthY
    let xCollide = false
    let yCollide = false

    if (rectX < xMax && rectX + rectLX > xMin) {
      xCollide = true
    }
    if (rectY < yMax && rectY + rectLY > yMin) {
      yCollide = true
    }

    return (xCollide && yCollide)
  }

  show () {
    this.visible = true
    this.model.visible = true
  }

  hide () {
    this.visible = false
    this.model.visible = false
  }

  initToScene (scene, x = this.x, y = this.y, z = this.z) {
    this.x = x
    this.y = y
    this.z = z
    scene.add(this.model)
    this.model.position.x = this.x + this.lengthX / 2
    this.model.position.y = this.y + this.lengthY / 2
    this.model.position.z = this.z + this.lengthZ / 2
    this.boundScene = true
    this.show()
  }

  removeFromScene (scene) {
    if (!this.boundScene) {
      console.error('not attached to any scene')
      return
    }
    this.hide()
    scene.remove(this.model)
    this.boundScene = false
  }

  discard () {
    if (this.boundScene) {
      console.error('still attached to a scene')
    }
    this.model.material.dispose()
    this.model.geometry.dispose()
    this.model = null
  }
}
