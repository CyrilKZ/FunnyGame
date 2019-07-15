var fs = require('fs');

var keypath = __dirname + '/private.pem';
var certpath = __dirname + '/server.crt';

var options = {
    key: fs.readFileSync(keypath),
    cert: fs.readFileSync(certpath)
};

var Server = require('./server');
var Scene = require('./scene');

var sever = new Server(options, 10443);


