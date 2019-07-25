import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'

export default class ParticleCubeSystem {
  constructor(color, lengthX, lengthY, lengthZ, x = 0, y = 0, z = 0){
    this.lengthX = lengthX
    this.lengthY = lengthY
    this.lengthZ = lengthZ
    this.x = x
    this.y = y
    this.z = z
    this.particles = []
    this.speed = []
    let geometry = new THREE.BoxGeometry(1, 1, 1)
    let material = new THREE.MeshLambertMaterial({color: color})
    for(let i = 0; i < CONST.PATICLE_NUMBER; ++i){
      this.particles.push(new THREE.Mesh(geometry, material))
      this.speed.push({
        x: 0,
        y: 0,
        z: 0
      })
    }
  }
  reset(){
    this.particles.forEach((par)=>{
      par.postion.x = this.x + (2 * Math.random() - 1) * CONST.HERO_RADIUS
      par.postion.y = this.y + (2 * Math.random() - 1) * CONST.HERO_RADIUS
      par.postion.z = this.z + (2 * Math.random() - 1) * CONST.HERO_RADIUS
    })
  }
}