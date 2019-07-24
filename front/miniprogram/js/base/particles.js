import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'

export default class ParticleCubeSystem {
  constructor(color, lengthX, lengthY, lengthZ, x = 0, y = 0, z = 0){
    this.frame = 0
    this.finished = false
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
  reset(vx = 0, vy = 0, vz = 0){
    this.particles.forEach((par)=>{
      par.position.x = this.x + Math.random() * this.lengthX
      par.position.y = this.y + Math.random() * this.lengthY
      par.position.z = this.z + Math.random() * this.lengthZ
    })
    this.speed.forEach((v)=>{
      v.x = vx * Math.random()
      v.y = vy * Math.random()
      v.z = vz * Math.random()
    })
    this.frame = 0
  }
  initToScene(scene, vx, vy, vz, x = this.x, y = this.y, z = this.z){
    this.x = x
    this.y = y
    this.z = z
    this.reset(vx, vy, vz)
    this.particles.forEach((par)=>{
      scene.add(par)
    })
  }
  removeFromScene(scene){
    this.particles.forEach((par)=>{
      scene.remove(par)
    })
  }
  playAnimation(){
    if(this.frame === CONST.PARICLE_LIFESPAN){
      this.finished = true
      return
    }
    for(let i = 0; i < this.particles.length; ++i){
      this.particles[i].position.x += this.speed[i].x
      this.particles[i].position.y += this.speed[i].y
      this.particles[i].position.z += this.speed[i].z
      this.speed[i].z -= CONST.GRAVITY
    }
    this.frame += 1
  }
}