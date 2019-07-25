# API接口

## 登录
请求

```
POST https://game.lbjthu.tech/login
```

```json
{
    "openid":"",
    "userinfo":{
        // 用户数据
    }
}
```

返回
```
Welcome
```


## 新建房间
请求

```
POST https://game.lbjthu.tech/team/create
```

```json
{
    "openid": ""
}
```

返回
```json
{
    "result": 0, //0为成功,非0为失败,
    "teamid": ""
}
```

## 进入房间
请求

```
POST https://game.lbjthu.tech/team/join
```

```json
{
    "openid": "",
    "teamid": ""
}
```

成功返回
```
{
    "result": 0 //0为成功,非0为失败
}
```

## 退出房间
请求

```
POST https://game.lbjthu.tech:10443/team/exit
```

```json
{
    "openid": "",
    "teamid': ""
}
```

返回
```json
{
    "result": 0 //0为成功,非0为失败
}
```

# WebSocket接口

# WebSocket接口文档

测试地址：wss://game.lbjthu.tech:10443/

## 连接流程
- Client:发起连接
- Client:发送openid鉴权
- Client:发送ready指令
- Server:发送开始指令
- Client/Server:交换数据

## openid鉴权

```json
{
    "msg":"open",
    "openid":""
}
```

## 准备
```json
{
    "msg":"ready",
    "state":true    // true-准备,false-取消准备
}
```

## 暂停
```json
{
    "msg":"pause",
    "state":true    // true-暂停,false-取消暂停
}
```

## 客户端上传数据
### 添加砖块
```json
{
    "msg":"brick",
    "self": true,   // true-添加到己方,false-添加到对方
    "row": 0,   // 0/1
    "dis": 0    // 
}
```

### 本机动作
```json
{
    "msg":"action",
    "pos":"",   // 绝对距离
    "dir": 0, // 1-左,2-右,3-上
    "safe": true
}
```


### 本机失败
```json
{
    "msg":"fail"
}
```

### 本机重开
```json
{
    "msg":"restart"
}
```

## 服务器广播数据
### 对方加入房间
```json
{
    "msg":"join",
    "userinfo":{
        //对方用户数据
    }
}
```

### 对方准备
```json
{
    "msg":"ready",
    "state":true    // true-准备,false-取消准备
}
```

## 游戏开始
```json
{
    "msg":"start"
}
```

### 本机获胜
```json
{
    "msg":"win"
}
```

### 添加砖块
```json
{
    "msg":"brick",
    "self": true,   // true-添加到对方,false-添加到己方
    "row": 0,   // 0/1
    "dis": 0    // 
}
```

### 对方动作
```json
{
    "msg":"action",
    "pos":"",   // 绝对距离
    "dir": 0, // 1-左,2-右,3-上
    "safe": true
}
```
