import './js/libs/weapp-adapter'
import './js/libs/symbol'

import Game from './js/main'

const openDataContext = wx.getOpenDataContext()
const sharedCanvas = openDataContext.canvas
sharedCanvas.width = 1450
sharedCanvas.height = 800

new Game()
