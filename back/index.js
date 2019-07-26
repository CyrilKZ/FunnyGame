var fs = require('fs');
var Server = require('./server');

var keypath = __dirname + '/server.pem';
var certpath = __dirname + '/server.crt';

var options = {
    key: fs.readFileSync(keypath),
    cert: fs.readFileSync(certpath)
};

var sever = new Server(options, 443);