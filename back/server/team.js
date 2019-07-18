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
    this.users[openid] = new User(openid);
}

userHandler.logout = function (openid) {
    delete this.users[openid];
}

// 用户类
class User {
    constructor(openid) {
        this.id = openid;
        this.team = undefined;
        this.role = -1;
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
}

teamHandler.join = function (openid, teamid){
    let team = this.teams[teamid];
    let user = userHandler.users[openid];
    team.addUser(user);
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
        this.users = [];
        this.users[0] = user;
        user.role = 0;
    }

    addUser(user) {
        if (this.users.length === 1) {
            user.role = 1;
            this.users[1] = user;
            return true;
        }
        else {
            return false;
        }
    }

    delUser(user) {
        this.users.splice(user.role, user.role);
        if (this.users.length === 0) {
            teamHandler.destroy(this);
        }
        else {
            this.users[0].role = 0;
        }
    }
}

module.exports = {
    'token': accessToken,
    'teamHandler' : teamHandler,
    'userHandler' : userHandler,
}