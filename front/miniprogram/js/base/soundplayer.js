let instance

export default class SoundPlayer {
  constructor () {
    if (instance) {
      return instance
    }
    instance = this
    this.slipSound1 = wx.createInnerAudioContext()
    this.slipSound1.src = 'resources/slip1.wav'

    this.slipSound2 = wx.createInnerAudioContext()
    this.slipSound2.src = 'resources/slip2.wav'

    this.breakSound = wx.createInnerAudioContext()
    this.breakSound.src = 'resources/break.wav'
  }
}
