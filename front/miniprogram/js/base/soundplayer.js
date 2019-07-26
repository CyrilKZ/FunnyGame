let instance

export default class SoundPlayer{
  constructor(){
    if(instance){
      return instance
    }
    instance = this
    this.slipSound = wx.createInnerAudioContext()
    this.slipSound.src = 'resources/slip.wav'

    this.breakSound = wx.createInnerAudioContext()
    this.breakSound.src = 'resources/break.wav'

    this.bubbleSound = wx.createInnerAudioContext()
    this.bubbleSound.src = 'resources/block.wav'
  }
}