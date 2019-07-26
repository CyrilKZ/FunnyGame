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
    this.slipSound2.src = 'resources/slip1.wav'

    this.breakSound = wx.createInnerAudioContext()
    this.breakSound.src = 'resources/break.wav'

    this.bgm = wx.createInnerAudioContext()
    this.bgm.src = 'resources/bgm.mp3'
    this.bgm.autoplay = true
    this.bgm.loop = true
    this.bgm.volume = 0.8
  }
}
