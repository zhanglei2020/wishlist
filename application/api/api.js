const request = require("request")
const log     = require('../libraries/logger')()

// 发起请求，目前支持POST、GET
function requestWebsite (request_url, post_params, http_method) {

    try {
        if (!request_url) throw ("url地址为空")
        if (post_params && typeof post_params != "object") throw ("Post参数必须为对象")

        var params = ""

        // Post 请求
        if (http_method == "POST") {
            params = {
                url    : request_url,
                form   : post_params
            }

            // 返回结果
            return new Promise ((resolve, reject) => {
                request.post(params, function (err, res, body) {
                    if (err) reject(err)
                    //log.error(body)
                    resolve(body)
                })
            }).catch((error) => {
                log.error(error)
            })
        }
       
        // Get请求，返回结果
        return new Promise ((resolve, reject) => {
            request.get(request_url, function (err, res, body) {
                if (err) reject(err)
                //log.debug(res)
                //log.debug(body)
                resolve(body)
            })
        }).catch((error) => {
            log.error(error)
        })

    } catch (e) {
        log.error(e)
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
function requestWebsiteAndRedirect(request_url, post_params, http_method) {

    //let response = await requestWebsite(request_url, post_params, http_method)
}


module.exports = {
    requestWebsite, joinUrlParams
}