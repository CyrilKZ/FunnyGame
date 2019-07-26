var team = require('./team')

function open (openid, wssSocket) {
  const user = team.userHandler.users[openid]
  if (user) {
    user.setSocket(wssSocket)
    if (user.companion) {
      user.socket.send(JSON.stringify({
        msg: 'join',
        userinfo: user.companion.info
      }), (err) => {
        if (err) {
          console.log(`[ERROR]: ${err}`)
        }
      })
      user.socket.send(JSON.stringify({
        msg: 'ready',
        state: user.companion.ready
      }), (err) => {
        if (err) {
          console.log(`[ERROR]: ${err}`)
        }
      })
      user.socket.send(JSON.stringify({
        msg: 'pause',
        state: user.companion.pause
      }), (err) => {
        if (err) {
          console.log(`[ERROR]: ${err}`)
        }
      })
    }
    return user
  } else {
    return false
  }
}

function ready (user, data) {
  user.setReady(data.state)
  if (user.companion) {
    if (user.companion.pause) {
      user.companion.msgBuffer.push(data)
    } else {
      user.companion.socket.send(JSON.stringify(data), (err) => {
        if (err) {
          console.log(`[ERROR]: ${err}`)
        }
      })
    }
  }

  if (user.team.checkReady()) {
    user.team.start()
  }
}

function forwardData (user, data) {
  const companion = user.companion
  if (companion) {
    if (companion.pause) {
      companion.msgBuffer.push(data)
    } else {
      companion.socket.send(JSON.stringify(data), (err) => {
        if (err) {
          console.log(`[ERROR]: ${err}`)
        } else {
          console.log('Forwarded')
        }
      })
    }
  }
}

function fail (user, data) {
  user.team.reset()
  const companion = user.companion
  if (companion) {
    if (companion.pause) {
      companion.msgBuffer.push({ msg: 'win' })
    } else {
      console.log('{"msg":"win"}')
      companion.socket.send('{"msg":"win"}', (err) => {
        if (err) {
          console.log(`[ERROR]: ${err}`)
        }
      })
    }
  }
}

function pause (user, data) {
  user.setPause(data.state)
  if (data.state === false) {
    // clearTimeout(user.timeobj);
    for (const msg of user.msgBuffer) {
      user.socket.send(JSON.stringify(msg), (err) => {
        if (err) {
          console.log(`[ERROR]: ${err}`)
        }
      })
    }
    user.msgBuffer = []

    if (user.team.checkReady()) {
      user.team.start()
    }
  } else {
    // user.timeobj = setTimeout(function(){
    //     if(user){
    //         team.teamHandler.exit(user.id);
    //     }
    // }, 300000);
  }

  const companion = user.companion
  if (companion) {
    if (companion.pause) {
      companion.msgBuffer.push(data)
    } else {
      companion.socket.send(JSON.stringify(data), (err) => {
        if (err) {
          console.log(`[ERROR]: ${err}`)
        }
      })
    }
  }
}

module.exports = {
  open: open,
  ready: ready,
  brick: forwardData,
  action: forwardData,
  transfer: forwardData,
  fail: fail,
  pause: pause
}
