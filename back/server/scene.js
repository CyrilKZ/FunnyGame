var team = require('./team');

function open(openid, wssSocket) {
    let user = team.userHandler.users[openid];
    if (user) {
        user.setSocket(wssSocket);
        return user;
    }
    else {
        return false;
    }
}

function ready(user, data) {
    user.setReady(data.state);
    let companion = user.companion;
    companion.socket.send(JSON.stringify(data), (err) => {
        if (err) {
            console.log(`[ERROR]: ${err}`);
        }
    });
    if (user.team.checkReady()) {
        user.socket.send('{"msg":"start"}', (err) => {
            console.log({ "msg": "start" });
            if (err) {
                console.log(`[ERROR]: ${err}`);
            }
        });
        user.companion.socket.send('{"msg":"start"}', (err) => {
            if (err) {
                console.log(`[ERROR]: ${err}`);
            }
        });
    }
}

function forwardData(user, data) {
    let companion = user.companion;
    // if(companion){
    companion.socket.send(JSON.stringify(data), (err) => {
        if (err) {
            console.log(`[ERROR]: ${err}`);
        }
        else{
            console.log('Forwarded');
        }
    });
    // }
}

function fail(user, data) {
    let companion = user.companion;
    // if(companion){
    companion.socket.send('{"msg":"win"}', (err) => {
        if (err) {
            console.log(`[ERROR]: ${err}`);
        }
    });
    // }
}

function restart(user, data) {
    user.team.restart();
}


module.exports = {
    'open': open,
    'ready': ready,
    'brick': forwardData,
    'action': forwardData,
    'fail': fail,
    'restart': restart
}
