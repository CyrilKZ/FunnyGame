var request = require('urllib-sync').request;
var path = require('path'); //系统路径模块
var fs = require('fs'); //文件模块
var qs = require('querystring');

// 获取AccessToken
let accessToken = function () { };
accessToken.token = '';
accessToken.expire = -1;
accessToken.get = function () {
    if (this.expire > Date.parse(new Date())) {
        return this.token;
    }

    let file = path.join(__dirname, 'app-config.json');
    let data = fs.readFileSync(file);
    app = JSON.parse(data);
    query = qs.stringify({
        'grant_type': 'client_credential',
        'appid': app.AppID,
        'secret': app.AppSecret
    });
    let res = request('https://api.weixin.qq.com/cgi-bin/token?' + query);
    token = JSON.parse(res.data);
    this.token = token.access_token;
    this.expire = Date.parse(new Date()) + token.expires_in * 1000;
    return this.token;
}

// 用户管理
var userHandler = function () { };
userHandler.users = {};
userHandler.login = function (openid) {
    if(this.users[openid]){
        this.logout(openid);
    }

    this.users[openid] = new User(openid);
}

userHandler.logout = function (openid) {
    let user = this.users[openid];
    if(user.team){
        user.team.delUser(user);
    }
    delete this.users[openid];
}

// 用户类
class User {
    constructor(openid) {
        this.id = openid;
        this.team = undefined;
        this.companion = undefined;
        this.socket = undefined;
        this.ready = false;
    }

    setSocket(wssSocket){
        this.socket = wssSocket;
    }

    setReady(bool){
        this.ready = bool;
    }

    reset(){
        this.ready = false;
    }
}

// Team管理
var teamHandler = function () { };
teamHandler.teams = [];
teamHandler.create = function (openid) {
    let user = userHandler.users[openid];
    let teamid = this.teams.length;
    let newteam = new Team(user, teamid);
    this.teams[teamid] = newteam;
    user.team = newteam;
    return teamid;
}

teamHandler.join = function (openid, teamid, userinfo){
    let team = this.teams[teamid];
    let user = userHandler.users[openid];
    if(!team){
        return false;
    }
    if(!user){
        return false;
    }

    if(team.addUser(user)){
        let socket = user.companion.socket;
        if(socket){
            socket.send(JSON.stringify(userinfo), (err) => {
                if (err) {
                    console.log(`[ERROR]: ${err}`);
                }
            });
        }
        return true;
    }
    else{
        return false;
    }
}

teamHandler.exit = function (openid, teamid){
    let team = this.teams[teamid];
    let user = userHandler.users[openid];
    team.delUser(user);
}

teamHandler.destroy = function (team) {
    delete this.teams[team.id];
}

// Team类
class Team {
    constructor(user, id) {
        this.id = id;
        this.users = [ user ];
        user.team = this;
    }

    restart(){
        for(let user of this.users){
            user.reset();
        }
    }

    addUser(user) {
        if (this.users.length === 1) {
            user.team = this;
            this.users[0].companion = user;
            user.companion = this.users[0];
            this.users[1] = user;
            return true;
        }
        else {
            return false;
        }
    }

    delUser(user) {
        let index = this.users.indexOf(user);
        user.team = undefined;
        user.companion = undefined;
        this.users.splice(index, 1);
        if (this.users.length === 0) {
            teamHandler.destroy(this);
        }
        else{
            this.users[0].companion = undefined;
        }
    }

    checkReady(){
        if(this.users.length !== 2){
            return false;
        }

        for(let user of this.users){
            if(user.ready === false){
                return false;
            }
        }
        return true;
    }
}

module.exports = {
    'token': accessToken,
    'teamHandler' : teamHandler,
    'userHandler' : userHandler,
}