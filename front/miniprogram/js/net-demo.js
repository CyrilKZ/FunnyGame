import Network from './network'

export default class netDemo {
  constructor() {
    let self = this
    this.network = new Network()
    this.success = function() {}
    this.fail = function(err) {
      console.log(err)
    }
    this.openid = '1'
    this.network.login(this.openid, () => {
      self.network.createTeam(this.openid, (res) => {
        let teamid = res.teamid
        self.network.initSocket(() => {
          console.log('success: init socket')
          self.network.sendOpenid(self.openid, () => {
            console.log('success: send openid')
            self.network.sendReady(true, ()=>{
              console.log('success: send ready')
            })
          }, self.fail)
        }, self.fail)
      }, self.fail)
    }, this.fail)
    this.network.onStart = (data) => {
      console.log(`onStart: ${data}`)
      self.network.sendAction({
        "pos": 0,
        "dir": 0,
        "safe": true
      })
      self.network.sendBrick({
        "self": true,   // true-添加到己方,false-添加到对方
        "row": 0,
        "dis": 0
      })
    }
  }
}