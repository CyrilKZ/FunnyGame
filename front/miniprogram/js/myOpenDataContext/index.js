// js/openDataContext/index.js
let sharedCanvas = wx.getSharedCanvas()
let context = sharedCanvas.getContext('2d')

const image = wx.createImage()
image.onload = function () {
  // context.drawImage(image, 0, 0)
}
image.src = 'resources/ranklist.png'

wx.onMessage(data => {
  let fun = {
    render: render,
    update: update
  }
  fun[data.command](data)
})

function update(data){
  wx.getUserCloudStorage({
    keyList: ['score'],
    success: res => {
      let oldScore = res.KVDataList[0].value - 0
      if(oldScore < data.score){
        wx.setUserCloudStorage({
          KVDataList: [{ key: 'score', value: `${data.score}`}],
          success: res => {
            console.log(res)
          },
          fail: res => {
            console.log(res)
          }
        });
        render()
      }
    }
  })
}


function render(data) {
  context.height = context.height;
  context.drawImage(image, 0, 0);
  wx.getFriendCloudStorage({
    keyList: ['score'],
    success: res => {
      drawRankList(res.data)
    }
  })
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
      const image = wx.createImage()
      image.onload=function(){
        context.drawImage(image, x + 125, y + 12.5, 100, 100)
      }
      image.src = item.avatarUrl

      context.font = "42px 微软雅黑"
      context.fillStyle = "#FFF"
      context.textBaseline = 'top'
      context.fillText(index + 1, x + 50, y + 30)
      context.fillText(item.nickname, x + 250, y + 30, 250)
      context.fillText(item.KVDataList[0].value, x + 550, y + 30, 159)
    }
  })
}