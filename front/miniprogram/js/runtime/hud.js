import * as THREE from '../libs/three.min'
import DataBus from '../databus'
import GameStore from '../gamestore'

let databus = new DataBus()
let store = new store()

let instance

export default class HUD {
  constructor(){
    if(instance){
      return instance
    }
    instance = this
  }
}