const Express   = require('express')
const Router    = Express.Router()
const ShareLink = require('./controllers/share_list')
const user      = require('./controllers/user')
//const Validator = require('./validator')
const {log}     = require('brolog')

// 愿望列表
Router.get('/share_list/:action', async (req, res) => {
  log.info("request 请求action：", req.params)
  log.info("request 请求参数：", req.query)
  
  try {
    //console.log("log level", log.level())
    log.info("登录前cookie：", req.session.cookie)
    log.info("登陆前SessionId：", req.sessionID)
    log.info("登录前Session：", req.session.user)

    //尝试获取openid
    let openid = await user.getOpenid(req, res)
    if (openid && openid == "REDIRECT") return
    //res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize")
    
    return false

    // 登录（根据sessionid查询是否有用户）
    await user.autoLogin(req)
    log.info("登录后Session：", req.session.user)
    
    // 设置本次请求的全局变量
    res.locals.user = req.session.user

    //接口校验result
    //let result = Validator(req.query)
    //if (result.code !=0) throw result.msg
  
    // 路由到指定方法
    await ShareLink[req.params.action](req, res)
  } catch(e) {
    log.error(e)
    res.send("您访问的页面不存在！")
  }
}); 

module.exports = Router
