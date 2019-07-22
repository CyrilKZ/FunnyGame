// js/openDataContext/index.js
wx.onMessage(data => {
  if (data.command === 'render') {
    // ... 重绘 sharedCanvas
    let sharedCanvas = wx.getSharedCanvas()
    let context = sharedCanvas.getContext('2d')
    context.fillStyle = '#66CCFF'
    context.fillRect(0, 0, 100, 100)
  }
})