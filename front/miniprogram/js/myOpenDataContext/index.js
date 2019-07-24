// js/openDataContext/index.js
let sharedCanvas = wx.getSharedCanvas()
let context = sharedCanvas.getContext('2d')

const bg1 = wx.createImage()
bg1.onload = function () {
  // renderRanklist()
}
bg1.src = 'resources/ranklist.png'

const bg2 = wx.createImage()
bg2.src = 'resources/finishbg.png'

const winner = wx.createImage()
winner.src = 'resources/winner.png'

wx.onMessage(data => {
  let fun = {
    renderRanklist: renderRanklist,
    renderFinish: renderFinish,
    update: update
  }
  fun[data.command](data)
})


let score
wx.getUserCloudStorage({
  keyList: ['score'],
  success: res => {
    score = res.KVDataList[0].value - 0
  }
})

const ava1 = wx.createImage()
ava1.src = "https://wx.qlogo.cn/mmopen/vi_32/2IBexYdC9MtLt6P5qL5agH5XHICKVFl2sibw5gVeiacnuW7vYCIMkkrZYy51QzxJW7siaJCbKPwOkhGO7CwUGrBdw/132"

const ava2 = wx.createImage()
ava2.src = "https://wx.qlogo.cn/mmopen/vi_32/rK1MfJU53kYRE2OqylL9DFoBdicVicRgykcQWTYmpqRhHa6yJcfEY2oSn2HjfIKATsXibEws5gRZZqO8KazzD2icMw/132"

function renderFinish(data) {
  data = {
    command:'renderFinish',
    win: true,
    thisUser: { //本机用户
      nickname: '骆炳君',
      avatar: ava1,
      score: 1234
    },
    thatUser: { //对方用户
      nickname: 'kayano233',
      avatar: ava2,
      score: 1233
    }
  }

  context.height = context.height;
  context.drawImage(bg2, 0, 0);
  context.drawImage(data.thisUser.avatar, 20, 325, 150, 150)
  context.drawImage(data.thatUser.avatar, 745, 325, 150, 150)
  context.font = "42px 微软雅黑"
  context.fillStyle = "#FFF"
  context.textBaseline = 'top'
  context.fillText(data.thisUser.nickname, 205, 325, 250)
  context.fillText(data.thatUser.nickname, 930, 325, 250)
  context.textBaseline = 'middle'
  context.font = "72px 微软雅黑"
  context.fillText(data.thisUser.score, 525, 400, 200)
  context.fillText(data.thatUser.score, 1250, 400, 200)
  if(data.win){
    context.drawImage(winner, 205, 405)
  }
  else{
    context.drawImage(winner, 930, 405)
  }
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


function renderRanklist(data) {
  context.height = context.height;
  context.drawImage(bg1, 0, 0);
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
      context.textBaseline = 'top'
      context.fillText(index + 1, x + 50, y + 30)
      context.fillText(item.nickname, x + 250, y + 30, 250)
      context.fillText(item.KVDataList[0].value, x + 550, y + 30, 159)
    }
  })
}