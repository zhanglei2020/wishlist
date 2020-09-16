const request = require("request")
const log     = require('../libraries/logger')()

// 发起请求，目前支持POST、GET
function requestWebsite (request_url, post_params, http_method) {

    try {
        if (!request_url) throw ("url地址为空")
        if (post_params && typeof post_params != "object") throw ("Post参数必须为对象")

        // 整理参数
        var params = (http_method == "POST") ? {url: request_url, form   : post_params} : request_url
        var http_method = (http_method == "POST") ? 'post' : 'get'

         // 返回结果
         return new Promise ((resolve, reject) => {
            request[http_method](params, function (err, res, body) {
                if (err) {
                    log.error("请求网络地址发生错误：", http_method, request_url, err)
                    reject(err)
                }
                //log.debug("statusCode :", res.statusCode)
                //log.debug(body)
                resolve(body)
            })
        }).catch((error) => {
            log.error("获取网络地址返回内容出错：", http_method, request_url, error)
            return false
        })

    } catch (e) {
        log.error("请求网络地址失败：", http_method, request_url, e)
        return false
    }    
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

// 当请求返回重定向时，继续请求到重定向的地址，最多允许跳转3次
async function requestWebsiteAndRedirect(request_url, post_params, http_method) {
    log.info(request_url)
    //let response = await requestWebsite(request_url, post_params, http_method)
    //log.info("response :", response)
}


module.exports = {
    requestWebsite, joinUrlParams, requestWebsiteAndRedirect
}