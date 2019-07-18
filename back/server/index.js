var https = require('https');
var ws = require('ws');
var express = require('express');
var bodyParser = require('body-parser');
var team = require('./team');

var app = express();
app.use(bodyParser.json());  //body-parser 解析json格式数据

class Server {
    constructor(options, port) {
        this.httpsServer = https.createServer(options, app).listen(port);
        this.wssServer = new ws.Server({ server: this.httpsServer });
        this.wssServer.on('connection', this.wssHandler);
    }

    wssHandler(wssSocket) {
        wssSocket.on('message', function (msg) {
            console.log(`[SERVER] Received: ${message}`);
            ws.send(`ECHO: ${message}`, (err) => {

            });
        });
    }
}

app.get('/login', function (req, res) {
    team.userHandler.login(req.query.openid);
    res.status(200).send('Welcome');
});

app.get('/logout', function (req, res) {
    team.userHandler.logout(req.query.openid);
    res.status(200).send('Bye');
});

app.post('/team/create', function (req, res) {
    let teamid = team.teamHandler.create(req.body.openid);
    res.json({
        'result': 0,
        'teamid': teamid
    });
});

app.post('/team/join', function (req, res) {
    team.teamHandler.join(req.body.openid, req.body.teamid);
    res.json({
        'result' : 0
    });
});

app.post('/team/exit', function (req, res) {
    team.teamHandler.exit(req.body.openid, req.body.teamid);
    res.json({
        'result' : 0
    });
});

module.exports = Server;