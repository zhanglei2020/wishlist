const mainConfig = require('../../config/main')
const wechatConfig = require('../../config/api')
const proxyConfig= wechatConfig.wechat_proxy
const {hex_md5}  = require("../../libraries/md5")
const requestWeb = require('../api')
const Url        = require("url")
const log        = require('../../libraries/logger')()


// 获取接口返回的用于分享的验证参数
async function getShareData (request) {
    //log.info(request)
    let location = getCurrentUrl(request)
    //log.debug("当前页面url：", location)

    // 请求服务接口
    let response = await requestWechatProxy("getJSAPIParameter", {url : location}, "POST")
    log.info("share_parameter", response)

    // return
    return response.parameter || ""
}

// 获取AccessToken
async function getAccessToken () {
    let response = await requestWechatProxy("getAccessToken")
    // return
    return response.access_token || ''
}

// 获取Userinfo
async function getUserInfo (openid) {
    let response = await requestWechatProxy("getUserInfo", {openid : openid}, "POST")
    // return
    return response.user || ''
}

// 获取用户openid
async function getOpenid(req, res) {
    //log.debug(req.query)
    // 如果get参数中有openid，直接返回
    if (req.query.openid) return req.query.openid

    // 重定向到微信授权页
    let authUrl = await getAuthUrl(req)
    res.redirect(authUrl)    
    res.end()
    log.info("当前请求已重定向至微信授权地址：", authUrl)

    // 返回REDIRECT，通知调用方已发送重定向指令
    return "REDIRECT"
}

// 获取授权地址
async function getAuthUrl (request) {
    let data = {
        url   : filterUrl(getCurrentUrl(request)),
        scope : "snsapi_base"
    }
    //log.debug(data)

    //发送请求
    let response = await requestWechatProxy("getWechatAuthUrl", data, "POST")
    //log.debug(response.auth_url)

    // 返回
    return response.auth_url || ''
}


// 访问微信API接口，并返回数据
async function requestWechatProxy (serviceName, params, httpMethod) {
    try {
        let wechatServiceUrl = createWechatProxyUrl(serviceName)
        log.info(wechatServiceUrl)

        let response = await requestWeb(wechatServiceUrl, params, httpMethod)
        log.info(response)
        if (!response) throw ("获取验证参数失败！")

        // 返回结果转换成json对象
        let data = JSON.parse(response)
        //log.debug(data)

        // code不为0时，接口返回错误
        if (data.code != 0 ) throw ("微信服务接口返回错误：" + data.value.exception || '')

        // 返回
        return data.value
    } catch(e) {
        log.error(e)
        return false
    }
}

// 生成微信服务URL
function createWechatProxyUrl (service) {
    let wechatHost = proxyConfig.server_host
    let wechatName = proxyConfig.service_name
    let wechatSecret = proxyConfig.service_secret
    let now = Math.round(new Date().getTime()/1000)
    let sign = hex_md5('name=' + wechatName + 'secret=' + wechatSecret + 'timestamp=' + now)
    
    return wechatHost + 'ws/wechat_service/' + service + "/name/" + wechatName + '/secret/' + wechatSecret + '/timestamp/' + now + '/sign/' + sign
}

// 获取当前页面url
function getCurrentUrl (request) {
    if (!request) return ""
    return mainConfig.http_protocol + '://' + mainConfig.bot_server + (mainConfig.http_port && (":" + mainConfig.http_port)) + request.originalUrl
}


// 把当前url中的openid、id_t参数去掉，重新生成url
function filterUrl (input_url) {
    if (!input_url) return ""
    //let cur_url = Wechat.getCurrentUrl(request)
    // 把url转换为对象
    let url_obj = Url.parse(input_url, true)
    //log.debug(url_obj)

    // 删除对象中的openid、id_t参数
    delete url_obj.query.openid
    delete url_obj.query.id_t
    //log.debug(url_obj)

    // 创建新的对象
    let new_obj = {
        protocol: url_obj.protocol,
        host: url_obj.host,
        //port: url_obj.port,
        pathname: url_obj.pathname,
        query : url_obj.query
    }
    //log.debug(new_obj)

    // 对象转为链接
    return Url.format(new_obj)
}

let proxy = {
    getShareData,
    getAccessToken,
    getUserInfo,
    getOpenid,
    getAuthUrl,
    getCurrentUrl,
    filterUrl
}

module.exports = proxy
