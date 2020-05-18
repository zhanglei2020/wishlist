const Express   = require('express')
const Router    = Express.Router()
const ShareLink = require('./controllers/share_list')
const User      = require('./controllers/user')
const log       = require('../libraries/logger')()

// 愿望列表
Router.get('/share_list/:action', async (req, res) => {
  log.info("request 请求action：", req.params)
  log.info("request 请求参数：", req.query)
  
  try {
    log.info("登录前cookie：", req.session.cookie)
    log.info("登陆前SessionId：", req.sessionID)
    log.info("登录前Session：", req.session.user)

    //req.session.user = {}
    //尝试获取openid
    //let openid = await wechat.getOpenid(req, res)
    //if (openid && openid == "REDIRECT") return

    // 登录（根据sessionid查询是否有用户）
    let result = await User.autoLogin(req, res)
    log.info("登录后Session：", req.session.user)
    if (result && result == 'REDIRECT') return
    
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
