//const ShareUrlModel = require('../../models/controller/share_list')
const log           = require('./logger')()
const config        = require('../config/main')
//const Wechat        = require('../../api/wechat/wechat')

// 获取分享链接或图片链接的基本部分，不包括参数
function getShareUrl (page_name, url_name) {
    if (!page_name || !config || !config.share_info[page_name]) return false
    
    let url = (config.http_protocol || '')+ "://"+ (config.bot_server || '')+ (config.http_port ? (":"+ config.http_port) : '')
    url += config.share_info[page_name][url_name]
    log.debug("base url:", url)

    return url
}

// 获取分享文字，包括标题，描述等，替换变量
function getShareText (page_name, text_name, params) {
    if (!page_name || !config || !config.share_info[page_name] || !config.share_info[page_name][text_name]) return false

    return replaceValue(config.share_info[page_name][text_name], params)
}

// 替换模板中的变量
function replaceValue(str, params) {
    if (!str) return false
    if (!params) return str //如果参数不存在，则返回原来的字符串
    let v1 = [], v2 = []
    // 查询需要替换的变量名
    let patt = new RegExp("\\$\{([a-zA-Z]+)\}", "g")
    //console.log(patt.exec(str))
    // 循环调用正则匹配，直到返回null为止
    while ((result = patt.exec(str)) != null) {
        //console.log(result)
        // 去重
        if(v1.indexOf(result[0]) < 0) {
            v1.push(result[0])
            v2.push(result[1])
        }
    }
    //console.log(v1)
    //console.log(v2)

    // 把v1替换成v2对应的值
    for (const key in v2) {
        //console.log(v2[key])
        if (params[v2[key]]) {
            str = str.replace(v1[key], params[v2[key]])
            //console.log(str)
        }
    }
    return str
}


module.exports = {
    getShareUrl, 
    getShareText
}