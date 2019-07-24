// js/openDataContext/index.js
const image = wx.createImage()
image.onload = function () {
  // context.drawImage(image, 0, 0)
}
image.src = 'resources/ranklist.png'

wx.onMessage(data => {
  let fun = {
    render: render
  }
  fun[data.command](data)
})


function render(data) {
  let sharedCanvas = wx.getSharedCanvas()
  let context = sharedCanvas.getContext('2d')
  context.drawImage(image, 0, 0);
  wx.getFriendCloudStorage({
    keyList: ['score', 'maxScore'],
    success: res => {
      drawRankList(res.data)
    }
  })
  context.fillStyle = '#66CCFF'
  context.fillRect(0, 0, 100, 100)

  // context.strokeStyle = '#fff'
  // // context.font = "bold 40px '字体','字体','微软雅黑','宋体'"
  // context.textBaseline = 'hanging'
  // context.fillText('text', 0, 0)
}

function drawRankList(data) {
  data.sort((a, b) => { return a.KVDataList[0].value - 0 < b.KVDataList[0].value - 0 })
  let sharedCanvas = wx.getSharedCanvas()
  let context = sharedCanvas.getContext('2d')
  let total = 0
  data.forEach((item, index) => {
    if(index < 8){
      let x = Math.floor(index / 4) * 725
      let y = 150 + 125 * (index % 4)
      // context.fillStyle = '#66CCFF'
      // context.fillRect(x, y, 100, 100)
      context.font = "42px 微软雅黑"
      context.fillStyle = "#FFF"
      context.textBaseline = 'top'
      context.fillText(item.nickname, x + 200, y + 30)
      context.fillText(item.KVDataList[0].value, x + 400, y + 30)
    }
  })
}