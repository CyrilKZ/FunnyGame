import Sprite from '../base/sprite'
import GameStatus from '../status'
import Network from '../base/network'
import * as THREE from '../libs/three.min'
import * as CONST from '../libs/constants'
import SoundPlayer from '../base/soundplayer'

const gamestatus = new GameStatus()
const network = new Network()
const sound = new SoundPlayer()

export default class Enemy extends Sprite {
  constructor () {
    const geometry = new THREE.BoxGeometry(CONST.HERO_LENGTH, CONST.HERO_LENGTH, CONST.HERO_LENGTH)
    const metarial = new THREE.MeshLambertMaterial({ color: CONST.ENEMY_COLOR })
    const model = new THREE.Mesh(geometry, metarial)
    model.castShadow = true
    super(model, CONST.HERO_LENGTH, CONST.HERO_LENGTH, CONST.HERO_LENGTH)

    this.row = 0
    this.moving = false
    this.movingframe = 0
    this.direction = CONST.DIR_NONE
    this.speedX = 0
    this.speedZ = 0
    this.canJumpSave = true
    this.canMoveSave = true
    this.localJumpSafe = true
    this.localMoveSafe = true
    this.isJumpSafe = true
    this.isMoveSafe = true
    this.blockAhead = null
    this.blockAround = null
    this.moves = []
    this.diffFrame = 0
  }

  init (row, scene) {
    this.row = row
    const x = (row - 2) * CONST.ROW_WIDTH + CONST.HERO_OFFSET
    this.initToScene(scene, x, CONST.HERO_BASELINE, 0)
    gamestatus.enemySide = row < 2 ? CONST.DIR_LEFT : CONST.DIR_RIGHT
    const self = this
    network.onAction = (res) => {
      console.log(`action received ${res}`)
      console.log(JSON.stringify(res))
      console.log(res.dir)
      console.log(res.safe)
      self.addToMove(res.dir, res.safe, res.frm)
    }
  }

  sync () {
    this.update()
    if (!this.moving) {
      return
    }
    if (this.direction === CONST.DIR_UP) {
      if (!this.localJumpSafe && this.isJumpSafe) {
        if (this.diffFrame > CONST.HERO_TOTAL_FZ / 2) {
          this.update()
          this.update()
          this.diffFrame -= 2
        } else {
          this.update()
          this.diffFrame -= 1
        }
      }
    } else {
      if (!this.localMoveSafe && this.isMoveSafe) {
        if (this.diffFrame > CONST.HERO_TOTAL_FX / 2) {
          this.update()
          this.update()
          this.diffFrame -= 2
        } else {
          this.update()
          this.diffFrame -= 1
        }
      }
    }
  }

  checkJumpSafe () {
    if (this.blockAhead === null) {
      this.localJumpSafe = true
      return
    }
    const block = this.blockAhead
    const vx = gamestatus.speed
    const a = gamestatus.accel
    let t = (CONST.HERO_JUMPINGSPEED + Math.sqrt(CONST.HERO_JUMPINGSPEED * CONST.HERO_JUMPINGSPEED - 2 * block.lengthZ * CONST.GRAVITY)) / CONST.GRAVITY
    const minUnsafePos = block.y - vx * t - a * t * t / 2 - 1 // front of the brick hit back of the hero
    t = CONST.HERO_TOTAL_FZ
    const maxUnsafePos = block.y - block.lengthY - vx * t + a * t * t / 2 + 1 // hit the foot of the brick
    if (minUnsafePos > this.y - this.lengthY && maxUnsafePos < this.y) {
      this.localJumpSafe = false
      return
    }
    this.localJumpSafe = true
  }

  checkMoveSafe () {
    if (this.blockAround === null) {
      this.localMoveSafe = true
      return
    }
    const block = this.blockAround
    const a = gamestatus.accel
    const v = gamestatus.speed
    const t1 = CONST.HERO_TOTAL_FX
    const s1 = v * t1 + a * t1 * t1 / 2
    const t2 = CONST.HERO_TOTAL_FX / 2
    const s2 = v * t2 + a * t2 * t2 / 2
    const distance1 = block.y - block.lengthY - this.y // move in
    const distance2 = block.y - this.y // move out
    if (s1 > distance1 && s2 < distance2) {
      this.localMoveSafe = false
      return
    }
    this.localMoveSafe = true
  }

  addToMove (direction, safe, frame) {
    this.moves.push({
      direction: direction,
      safe: safe,
      frame: frame
    })
    console.log(this.moves[this.moves.length - 1])
  }

  move () {
    if (this.moving === true) {
      return
    }
    let nextMove = null
    if (this.moves.length > 0) {
      nextMove = this.moves.shift()
    } else {
      return
    }
    sound.slipSound.stop()
    sound.slipSound.play()
    const direction = nextMove.direction
    const safe = nextMove.safe
    this.diffFrame = nextMove.frame - gamestatus.frame
    switch (direction) {
      case CONST.DIR_LEFT:
        if (this.row === 0 || this.row === 2) {
          return
        }
        this.moving = true
        this.direction = CONST.DIR_LEFT
        this.speedX = -CONST.HERO_MOVINGSPEED
        this.isMoveSafe = safe
        this.findBlockAround()
        this.checkMoveSafe()
        break
      case CONST.DIR_RIGHT:
        if (this.row === 1 || this.row === 3) {
          return
        }
        this.moving = true
        this.direction = CONST.DIR_RIGHT
        this.speedX = CONST.HERO_MOVINGSPEED
        this.isMoveSafe = safe
        this.findBlockAround()
        this.checkMoveSafe()
        break
      case CONST.DIR_UP:
        this.moving = true
        this.direction = CONST.DIR_UP
        this.speedZ = CONST.HERO_JUMPINGSPEED
        this.isJumpSafe = safe
        this.checkJumpSafe()
        break
      default:
    }
  }

  findBlockAhead () {
    this.blockAhead = null
    for (let i = 0; i < gamestatus.blocks[this.row].length; ++i) {
      if (gamestatus.blocks[this.row][i].y > this.y - this.lengthY + 1) {
        this.blockAhead = gamestatus.blocks[this.row][i]
        break
      }
    }
  }

  findBlockAround () {
    this.blockAround = null
    if (this.direction === CONST.DIR_LEFT) {
      for (let i = 0; i < gamestatus.blocks[this.row - 1].length; ++i) {
        if (gamestatus.blocks[this.row - 1][i].y > this.y) {
          this.blockAround = gamestatus.blocks[this.row - 1][i]
          break
        }
      }
    } else {
      for (let i = 0; i < gamestatus.blocks[this.row + 1].length; ++i) {
        if (gamestatus.blocks[this.row + 1][i].y > this.y) {
          this.blockAround = gamestatus.blocks[this.row + 1][i]
          break
        }
      }
    }
  }

  setEnemyHit () {
    gamestatus.enemyHit = true
  }

  update () {
    this.move()
    if (this.moving) {
      if (this.direction === CONST.DIR_UP) {
        if (this.movingframe >= CONST.HERO_TOTAL_FZ) {
          this.movingframe = 0
          this.moving = false
          this.direction = CONST.DIR_NONE
          this.z = 0
          this.speedZ = 0
          this.model.position.z = this.z + CONST.HERO_RADIUS
          if (!(this.canJumpSave && this.isJumpSafe)) {
            if (this.is3DCollideWith(this.blockAhead)) {
              gamestatus.enemyHit = true
            }
          }
        } else {
          this.movingframe += 1
          this.z += this.speedZ
          this.speedZ -= CONST.GRAVITY
          this.model.position.z = this.z + CONST.HERO_RADIUS
        }
        if (!(this.canJumpSave && this.isJumpSafe)) {
          if (this.is3DCollideWith(this.blockAhead)) {
            gamestatus.enemyHit = true
          }
        }
      } else {
        if (this.movingframe >= CONST.HERO_TOTAL_FX) {
          this.movingframe = 0
          if (this.direction === CONST.DIR_LEFT) {
            this.row -= 1
          } else {
            this.row += 1
          }
          this.x = (this.row - 2) * CONST.ROW_WIDTH + CONST.ROW_WIDTH / 2 - CONST.HERO_RADIUS
          this.model.position.x = this.x + CONST.HERO_RADIUS
          this.moving = false
          this.direction = CONST.DIR_NONE
          this.speedX = 0
          if (!(this.canMoveSave && this.isMoveSafe)) {
            if (this.is2DCollideWith(this.blockAround)) {
              gamestatus.enemyHit = true
            }
          }
        } else {
          this.movingframe += 1
          this.x += this.speedX
          this.model.position.x += this.speedX
          if (!(this.canMoveSave && this.isMoveSafe)) {
            if (this.is2DCollideWith(this.blockAround)) {
              gamestatus.enemyHit = true
            }
          }
        }
      }
    }
    if (gamestatus.enemyWillHit && this.is3DCollideWith(this.blockAhead)) {
      gamestatus.enemyHit = true
    }
    this.findBlockAhead()
    if ((!this.isJumpSafe) || (!this.isMoveSafe)) {
      gamestatus.enemyWillHit = true
    }
  }
}
