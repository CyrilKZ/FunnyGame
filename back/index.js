var fs = require('fs')
var Server = require('./server')
var path = require('path')

var keypath = path.join(__dirname, 'server.pem')
var certpath = path.join(__dirname, 'server.crt')

var options = {
  key: fs.readFileSync(keypath),
  cert: fs.readFileSync(certpath)
}

Server(options, 443)
