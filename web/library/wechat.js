const config     = require("../config/mz_config")
const {hex_md5}  = require("./md5")
const requestWeb = require('../../bot/website/website')


// 生成微信服务URL
function createWechatServiceUrl (service) {
    let wechatHost = config.wechat_service_host
    let wechatName = config.wechat_service_name
    let wechatSecret = config.wechat_service_secret
    let now = Math.round(new Date().getTime()/1000)
    let sign = hex_md5('name=' + wechatName + 'secret=' + wechatSecret + 'timestamp=' + now)
    
    return wechatHost + 'ws/wechat_service/' + service + "/name/" + wechatName + '/secret/' + wechatSecret + '/timestamp/' + now + '/sign/' + sign
}


// 获取接口返回的用于分享的验证参数
async function getShareData () {
    try {
        let wechatServiceUrl = createWechatServiceUrl("getJSAPIParameter")
        console.log(wechatServiceUrl)

        let response = await requestWeb(wechatServiceUrl)
        console.log(response)

        if (!response) throw ("获取验证参数失败")

        let data = JSON.parse(response)
        if (data.code != 0 || !data.value || !data.value.parameter) throw(data.value || "返回数据格式错误")

        // return
        return data.value.parameter    

    } catch(e) {
        console.log(e)
        return false
    }
}


// 获取openid
async function getAccessToken () {
    try {
        let wechatServiceUrl = createWechatServiceUrl("getAccessToken")
        console.log(wechatServiceUrl)

        let response = await requestWeb(wechatServiceUrl)
        console.log(response)

        if (!response) throw ("获取验证参数失败")

        let data = JSON.parse(response)
        if (data.code != 0 || !data.value || !data.value.parameter) throw(data.value || "返回数据格式错误")

        // return
        return data.value.parameter    

    } catch(e) {
        console.log(e)
        return false
    }
}

let wechat = {
    getShareData,
    getAccessToken
}

module.exports = wechat
