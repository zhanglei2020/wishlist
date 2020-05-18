const config      = require('../../config/api')
const localConfig = config.wechat
const requestWeb  = require('../api')
const proxy       = require('./proxy')
const log         = require('../../libraries/logger')()

// 获取用户openid
async function getOpenid(req, res) {
    try {
        // 获取当前地址
        let redirect_uri = proxy.getCurrentUrl(req) //req.protocol + '://' + req.get('host') + req.originalUrl
        //log.debug(redirect_uri)

        // 获取微信code地址
        let wechatCodeUrl = buildWechatCodeUrl(redirect_uri)
        log.info(wechatCodeUrl)

        // 如果code存在则重定向到微信授权页
        if (!req.query.code) {
            //res.writeHead(301, {'Location' : wechatCodeUrl})
            res.redirect(wechatCodeUrl)            
            res.end()
            log.info("当前请求已重定向至微信授权地址：", authUrl)

            // 返回REDIRECT，通知调用方已发送重定向指令
            return "REDIRECT"
        }

        // 获取code
        let code = req.query.code

        // 通过code创建接口链接
        let wechatAuthUrl = buildWechatAuthUrl(code)    
        log.info(wechatAuthUrl)

        // 访问微信接口获取openid
        let response = await requestWeb(wechatAuthUrl)
        response = JSON.parse(response)
        log.info(response)

        return response.openid || '' 
        
    } catch(e) {
      log.error(e)      
    }
}

// 创建获取微信code的链接
function buildWechatCodeUrl (rediretUrl) {
    rediretUrl = encodeURIComponent(rediretUrl)
    let objUrlParam = {
        appid : localConfig.app_id, //"wx307723442b554285",
        redirect_uri : rediretUrl,
        response_type : "code",
        scope : "snsapi_base",
        state : "cmm#wechat_redirect"
    }
    let baseWechatGetCodeUrl = localConfig.base_code_url //"https://open.weixin.qq.com/connect/oauth2/authorize"
    return baseWechatGetCodeUrl + joinUrlParams(objUrlParam)
}

// 创建获取微信授权的链接，可返回openid
function buildWechatAuthUrl (code) {
    let objUrlParam = {
        appid  : localConfig.app_id, //"wx307723442b554285",
        secret : localConfig.app_secret, //"21eba4e539047dafc14ced45566e48a8",
        code   : code,
        grant_type : "authorization_code"
    }
    let baseWechatAuthUrl = localConfig.base_authvvb_url //"https://api.weixin.qq.com/sns/oauth2/access_token"
    return baseWechatAuthUrl + joinUrlParams(objUrlParam)
}

// 拼接所有url参数名和值，把secret拼到字符串的2端，用于生成签名
function joinUrlParams (objParams) {
    let str = ""
    for (const key in objParams) {
        //log.info(key)
        str += (!str ? "?" : "&" ) + key + '=' + objParams[key]        
    }
    //log.info(str)
    return str;
}


let local = {
    getOpenid
}

module.exports = local