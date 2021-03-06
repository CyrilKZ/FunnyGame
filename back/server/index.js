var https = require('https')
var ws = require('ws')
var express = require('express')
var bodyParser = require('body-parser')
var team = require('./team')
var scene = require('./scene')

var app = express()
app.use(bodyParser.json()) // body-parser 解析json格式数据

class Server {
  constructor (options, port) {
    this.httpsServer = https.createServer(options, app).listen(port)
    const wss = new ws.Server({ server: this.httpsServer })
    wss.on('connection', wssHandler)
    this.wssServer = wss
    setInterval(function ping () {
      wss.clients.forEach(function each (ws) {
        if (ws.isAlive === false) {
          const user = ws.user
          if (user) {
            if (!user.pause) {
              team.teamHandler.exit(user.id)
              team.userHandler.logout(user.id)
              console.log('logout')
            }
            console.log('close')
          }
          ws.terminate()
        }

        ws.isAlive = false
        ws.ping()
      })
    }, 1000)
  }
}

app.get('/reset', function (req, res) {
  team.userHandler.users = {}
  team.teamHandler.teams = []
  res.status(200).send('Finished')
})

app.post('/login', function (req, res) {
  team.userHandler.login(req.body.openid, req.body.userinfo)
  res.status(200).send('Welcome')
})

app.post('/team/create', function (req, res) {
  const teamid = team.teamHandler.create(req.body.openid)
  res.json({
    result: 0,
    teamid: teamid
  })
})

app.post('/team/join', function (req, res) {
  if (team.teamHandler.join(req.body.openid, req.body.teamid)) {
    res.json({
      result: 0
    })
  } else {
    res.json({
      result: 1
    })
  }
})

app.post('/team/exit', function (req, res) {
  team.teamHandler.exit(req.body.openid)
  team.userHandler.logout(req.body.openid)
  res.json({
    result: 0
  })
})

function wssHandler (wssSocket) {
  let user

  console.log('open')
  wssSocket.isAlive = true

  wssSocket.on('pong', function () {
    this.isAlive = true
  })
  wssSocket.on('message', function (msg) {
    const data = JSON.parse(msg)
    if (user) {
      console.log(`${user.id}: ${msg}`)
      scene[data.msg](user, data)
    } else {
      if (data.msg === 'open') {
        user = scene.open(data.openid, wssSocket)
        wssSocket.user = user
      } else {
        console.log(`[SERVER] Received: ${msg}`)
        wssSocket.send(`Unauthorized:${data.msg}`)
      }
    }
  })
  wssSocket.on('close', function (msg) {
    if (!user.pause) {
      team.teamHandler.exit(user.id)
      team.userHandler.logout(user.id)
      console.log('logout')
    }
    console.log('close')
  })
}

module.exports = Server
