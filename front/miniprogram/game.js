import './js/libs/weapp-adapter'
import './js/libs/symbol'

import Game from './js/main'

let openDataContext = wx.getOpenDataContext()
let sharedCanvas = openDataContext.canvas
sharedCanvas.width = 1450
sharedCanvas.height = 800

openDataContext.postMessage({
  command: 'render'
})

new Game()