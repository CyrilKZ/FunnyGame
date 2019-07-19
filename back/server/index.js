var https = require('https');
var ws = require('ws');
var express = require('express');
var bodyParser = require('body-parser');
var team = require('./team');
var scene = require('./scene');

var app = express();
app.use(bodyParser.json());  //body-parser 解析json格式数据

class Server {
    constructor(options, port) {
        this.httpsServer = https.createServer(options, app).listen(port);
        this.wssServer = new ws.Server({ server: this.httpsServer });
        this.wssServer.on('connection', wssHandler);
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
        'result': 0
    });
});

app.post('/team/exit', function (req, res) {
    team.teamHandler.exit(req.body.openid, req.body.teamid);
    res.json({
        'result': 0
    });
});

function wssHandler(wssSocket) {
    let user = undefined;
    wssSocket.on('message', function (msg) {
        let data = JSON.parse(msg);
        if(user){
            scene[data.msg](user, data);
        }
        else{
            if(data.msg === 'open'){
                user = scene.open(data.openid, wssSocket);
            }
            else{
                console.log(`[SERVER] Received: ${msg}`);
                wssSocket.send(`Unauthorized:${data.msg}`);
            }
        }
    });
}

module.exports = Server;