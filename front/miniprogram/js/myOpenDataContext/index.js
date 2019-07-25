// js/openDataContext/index.js
let sharedCanvas = wx.getSharedCanvas()
let context = sharedCanvas.getContext('2d')

let initialized = false;

const bg1 = wx.createImage()
bg1.onload = function () {
    if(initialized){
        render()
    }
}
bg1.src = 'resources/ranklist.png'

wx.onMessage(data => {
  let fun = {
    init: init,
    render: render,
    update: update
  }
  fun[data.command](data)
})

let score, openid, rank = 0

function init(data) {
  openid = data.openid
  initialized = true
  wx.getUserCloudStorage({
    keyList: ['score'],
    success: res => {
      score = res.KVDataList[0].value - 0
      render()
    }
  })
}

function update(data) {
  // wx.getUserCloudStorage({
  //   keyList: ['score'],
  //   success: res => {
  //     let oldScore = res.KVDataList[0].value - 0
  if (score < data.score) {
    score = data.score
    wx.setUserCloudStorage({
      KVDataList: [{ key: 'score', value: `${data.score}` }],
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
//   })
// }


function render(data) {
  context.height = context.height;
  context.drawImage(bg1, 0, 0);
  wx.getFriendCloudStorage({
    keyList: ['score'],
    success: res => {
      drawRankList(res.data)
      context.font = "42px 微软雅黑"
      context.fillStyle = "#FFF"
      context.textBaseline = 'middle'
      context.textAlign = "center";
      if (rank === 0) {
        context.fillText('您暂时没有排行信息，点击开始游戏吧', 725, 725, 1000)
      }
      else {
        context.fillText(`您在所有好友中排名第${rank}`, 725, 725, 1000)
      }
    }
  })
}

function drawRankList(data) {
  data.sort((a, b) => { return a.KVDataList[0].value - 0 < b.KVDataList[0].value - 0 })
  let sharedCanvas = wx.getSharedCanvas()
  let context = sharedCanvas.getContext('2d')
  data.forEach((item, index) => {
    if (item.openid === openid) {
      rank = index + 1
    }

    if (index < 8) {
      let x = Math.floor(index / 4) * 725
      let y = 150 + 125 * (index % 4)
      const image = wx.createImage()
      image.onload = function () {
        context.drawImage(image, x + 125, y + 12.5, 100, 100)
      }
      image.src = item.avatarUrl

      context.font = "42px 微软雅黑"
      context.fillStyle = "#FFF"
      context.textBaseline = 'middle'
      context.fillText(index + 1, x + 50, y + 65)
      context.fillText(item.nickname, x + 250, y + 65, 250)
      context.fillText(item.KVDataList[0].value, x + 550, y + 65, 159)
    }
  })
}