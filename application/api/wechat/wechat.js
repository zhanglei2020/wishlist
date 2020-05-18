const config  = require("../../config/api")
const local   = require("./local")
const proxy   = require("./proxy")
const log     = require('../../libraries/logger')()
//const {hex_md5}  = require("../../libraries/md5")
//const requestWeb = require('../../api/api')

// 初始化
var wechat = {}

// 确定当前访问API的模式：本地(local)或代理(proxy)
function confirmAccessMode () {
    //log.debug(config.wechat)
    let mode = config.wechat.access_mode

    // 模式为local时，使用local的方法
    if (mode == 'local') wechat = local
    else if (mode == 'proxy') wechat = proxy

    // 无论哪种模式都使用local.getOpenid方法
    //wechat.getOpenid = local.getOpenid
    
}

// 确定访问模式
confirmAccessMode()
//log.debug(wechat)

module.exports = wechat
