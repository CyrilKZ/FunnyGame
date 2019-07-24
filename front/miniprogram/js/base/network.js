let instance

export default class Network {
  constructor() {
    if (instance) {
      return instance
    }
    instance = this

    this.url = 'https://game.lbjthu.tech:10443/'
    this.wssUrl = 'wss://game.lbjthu.tech:10443/'
    this.socket = undefined

    // data格式见https://github.com/CyrilKZ/FunnyGame/blob/lbj-back/back/wss.md#%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%B9%BF%E6%92%AD%E6%95%B0%E6%8D%AE
    this.onStart = function (data) { console.log(`onStart: ${data}`) }
    this.onWin = function (data) { console.log(`onWin: ${data}`) }
    this.onBrick = function (data) { console.log(`onBrick: ${data}`) }
    this.onAction = function (data) { console.log(`onAction: ${data}`) }
    this.onTransfer = function (data) { console.log(`onTransfer: ${data}`) }
    this.onJoin = function (data) { console.log(`onJoin: ${data}`) }
    this.onReady = function (data) { console.log(`onReady: ${data}`) }
    this.onClose = function (data) { console.log(`onClose`) }
  }

  login(openid, userinfo, sucess, fail) {
    let options = {
      'url': this.url + 'login',
      'data': {
        'openid': openid,
        'userinfo': userinfo
      },
      'method': 'POST',
      'success': function (res) {
        sucess(res.data)  // 正常data为'Welcome'
      },
      'fail': fail
    }
    wx.request(options)
  }

  logout(openid, sucess, fail) {
    let options = {
      'url': this.url + 'logout',
      'data': {
        'openid': openid
      },
      'method': 'GET',
      'success': function (res) {
        sucess(res.data)  // 正常data为'Bye'
      },
      'fail': fail
    }
    wx.request(options)
  }

  createTeam(openid, sucess, fail) {
    let options = {
      'url': this.url + 'team/create',
      'data': {
        'openid': openid
      },
      'method': 'POST',
      'success': function (res) {
        sucess(res.data)  //data见https://github.com/CyrilKZ/FunnyGame/blob/lbj-back/back/api.md#%E6%96%B0%E5%BB%BA%E6%88%BF%E9%97%B4
      },
      'fail': fail
    }
    wx.request(options)
  }

  exitTeam(openid, teamid, sucess, fail) {
    let options = {
      'url': this.url + 'team/exit',
      'data': {
        'openid': openid,
        'teamid': teamid
      },
      'method': 'POST',
      'success': function (res) {
        sucess(res.data)  //data见https://github.com/CyrilKZ/FunnyGame/blob/lbj-back/back/api.md#%E9%80%80%E5%87%BA%E6%88%BF%E9%97%B4
      },
      'fail': fail
    }
    wx.request(options)
  }

  joinTeam(openid, teamid, sucess, fail) {
    let options = {
      'url': this.url + 'team/join',
      'data': {
        'openid': openid,
        'teamid': teamid
      },
      'method': 'POST',
      'success': function (res) {
        sucess(res.data)  //data见https://github.com/CyrilKZ/FunnyGame/blob/lbj-back/back/api.md#%E8%BF%9B%E5%85%A5%E6%88%BF%E9%97%B4
      },
      'fail': fail
    }
    wx.request(options)
  }

  initSocket(success, fail) {
    this.socket = wx.connectSocket({
      'url': this.wssUrl,
      'fail': fail
    })
    this.socket.onOpen(success)
    let self = this
    this.socket.onMessage((res) => {
      self.onMessage(res.data)
    })
    this.socket.onClose(this.onClose)
  }

  onMessage(msg) {
    //console.log(msg)
    let data = JSON.parse(msg)
    let fun = {
      'start': this.onStart,
      'brick': this.onBrick,
      'win': this.onWin,
      'action': this.onAction,
      'transfer': this.onTransfer,
      'join': this.onJoin,
      'ready':this.onReady
    }
    fun[data.msg](data)
  }

  sendOpenid(openid, success, fail) {
    this.socket.send({
      'data': JSON.stringify({
        'msg': 'open',
        'openid': openid
      }),
      'success': success,
      'fail': fail
    })
  }

  sendReady(state, success, fail) {
    this.socket.send({
      'data': JSON.stringify({
        'msg': 'ready',
        'state': state
      }),
      'success': success,
      'fail': fail
    })
  }

  sendBrick(data, success, fail) {
    data['msg'] = 'brick'
    this.socket.send({
      'data': JSON.stringify(data),
      'success': success,
      'fail': fail
    })
  }

  sendAction(data, success, fail) {
    data['msg'] = 'action'
    this.socket.send({
      'data': JSON.stringify(data),
      'success': success,
      'fail': fail
    })
  }

  sendFail(success, fail) {
    this.socket.send({
      'data': JSON.stringify({
        'msg': 'fail',
      }),
      'success': success,
      'fail': fail
    })
  }

  sendRestart(success, fail) {
    this.socket.send({
      'data': JSON.stringify({
        'msg': 'restart',
      }),
      'success': success,
      'fail': fail
    })
  }

  sendTransfer(data, success, fail) {
    data['msg'] = 'transfer'
    this.socket.send({
      'data': JSON.stringify(data),
      'success': success,
      'fail': fail
    })
  }
}