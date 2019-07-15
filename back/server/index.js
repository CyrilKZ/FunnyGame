var https = require('https');
var ws = require('ws');

class Server {
    constructor(options, port) {
        this.httpsServer = https.createServer(options, this.httpsHandler).listen(port);
        this.wssServer = new ws.Server({ server: this.httpsServer });
        this.wssServer.on('connection', this.wssHandler);
    }

    httpsHandler(req, res){
        res.writeHead(403);
        res.end("This is a WebSockets server!\n");
    }

    wssHandler(wssSocket){
        wssSocket.on('message', function (msg) {
            console.log(`[SERVER] Received: ${message}`);
            ws.send(`ECHO: ${message}`, (err) => {

            });
        });
    }
}

module.exports = Server;