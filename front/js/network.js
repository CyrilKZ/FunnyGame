export default class Network {
  constructor() {
    this.url = 'https://game.lbjthu.tech:10443/'
  }
  login(openid, sucess, fail) {
    let options = {
      'url': this.url + 'login',
      'data':{
        'openid' : openid
      },
      'method': 'GET',
      'success' : function(res){
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

  exitTeam(openid, sucess, fail) {
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

  joinTeam(openid, sucess, fail) {
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
}