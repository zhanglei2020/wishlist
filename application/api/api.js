const request = require("request")
const log     = require('../libraries/logger')()

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


module.exports = requestWebsite