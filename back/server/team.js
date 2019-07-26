// 用户类
class User {
  constructor (openid, userinfo) {
    this.id = openid
    this.info = userinfo
    this.msgBuffer = []
    this.pause = false
    this.timeobj = undefined
    this.team = undefined
    this.companion = undefined
    this.socket = undefined
    this.ready = false
  }

  setSocket (wssSocket) {
    this.socket = wssSocket
  }

  setReady (bool) {
    this.ready = bool
  }

  setPause (bool) {
    this.pause = bool
  }

  reset () {
    this.ready = false
  }
}

// Team类
class Team {
  constructor (user, id) {
    this.id = id
    this.users = [user]
    this.started = false
    user.team = this
  }

  reset () {
    this.started = false
    for (const user of this.users) {
      user.reset()
    }
  }

  addUser (user) {
    if (this.users.length === 1) {
      user.team = this
      this.users[0].companion = user
      user.companion = this.users[0]
      this.users[1] = user
      return true
    } else {
      return false
    }
  }

  delUser (user) {
    const index = this.users.indexOf(user)
    user.team = undefined
    user.companion = undefined
    this.users.splice(index, 1)
    if (this.users.length === 0) {
      teamHandler.destroy(this)
    } else {
      this.users[0].companion = undefined
    }
  }

  checkReady () {
    if (this.started === true) {
      return false
    }

    if (this.users.length !== 2) {
      return false
    }

    for (const user of this.users) {
      if (user.ready === false || user.pause === true) {
        return false
      }
    }
    return true
  }

  start () {
    this.started = true
    for (const user of this.users) {
      user.socket.send('{"msg":"start"}', (err) => {
        console.log({ msg: 'start' })
        if (err) {
          console.log(`[ERROR]: ${err}`)
        }
      })
    }
  }
}

// 用户管理
var userHandler = {
  users: {},
  login: function (openid, userinfo) {
    if (this.users[openid] === undefined) {
      this.users[openid] = new User(openid, userinfo)
    } else {
      this.users[openid].pause = false
      this.users[openid].ready = false
      teamHandler.exit(openid)
    }
  },
  logout: function (openid) {
    const user = this.users[openid]
    if (!user) {
      return false
    }

    if (user.socket) {
      user.socket.close()
    }

    if (user.team) {
      user.team.delUser(user)
    }
    delete this.users[user.id]
  }
}

// Team管理
var teamHandler = {
  teams: [],
  create: function (openid) {
    const user = userHandler.users[openid]
    if (!user) {
      return false
    }

    const teamid = this.teams.length
    const newteam = new Team(user, teamid)
    this.teams[teamid] = newteam
    user.team = newteam
    return teamid
  },
  join: function (openid, teamid) {
    const team = this.teams[teamid]
    const user = userHandler.users[openid]
    if (!team) {
      return false
    }
    if (!user) {
      return false
    }

    if (team.addUser(user)) {
      if (user.companion.pause) {
        user.companion.msgBuffer.push({
          msg: 'join',
          userinfo: user.info
        })
      } else {
        const socket = user.companion.socket
        if (socket) {
          socket.send(JSON.stringify({
            msg: 'join',
            userinfo: user.info
          }), (err) => {
            if (err) {
              console.log(`[ERROR]: ${err}`)
            }
          })
        }
      }
      return true
    } else {
      return false
    }
  },
  exit: function (openid) {
    const user = userHandler.users[openid]
    if (user) {
      if (user.companion) {
        if (user.companion.pause) {
          user.companion.msgBuffer.push({ msg: 'exit' })
        } else {
          console.log('{"msg": "exit"}')
          user.companion.socket.send('{"msg": "exit"}', (err) => {
            if (err) {
              console.log(`[ERROR]: ${err}`)
            }
          })
        }
      }

      if (user.team) {
        user.team.delUser(user)
      }
    }
  },
  destroy: function (team) {
    delete this.teams[team.id]
  }
}

module.exports = {
  teamHandler: teamHandler,
  userHandler: userHandler
}
