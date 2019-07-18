# API接口文档

## 登录
请求

```
GET https://game.lbjthu.tech:10443/login?openid={Open ID}
```

返回
```
Welcome
```

## 退出
请求

```
GET https://game.lbjthu.tech:10443/logout?openid={Open ID}
```

返回
```
Bye
```

## 新建房间
请求

```
POST https://game.lbjthu.tech:10443/team/create
```

```json
{
    'openid': ''
}
```

返回
```json
{
    'result': 0 //0为成功,非0为失败,
    'team_id': 'asdfghhjkl'
}
```

## 进入房间
请求

```
POST https://game.lbjthu.tech:10443/team/join
```

```json
{
    'openid': 'asdfghjkl',
    'teamid': 'asdfghjkl'
}
```

成功返回
```
{
    'result': 0 //0为成功,非0为失败
}
```

## 退出房间
请求

```
POST https://game.lbjthu.tech:10443/team/exit
```

```json
{
    'openid': 'asdfghjkl',
    'teamid': 'asdfghjkl'
}
```

返回
```json
{
    'result': 0 //0为成功,非0为失败
}
```