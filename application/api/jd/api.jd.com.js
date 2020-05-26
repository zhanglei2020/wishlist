const api = require('../api')
const {hex_md5}  = require("../../libraries/md5")
const config     = require("../../config/api")
const mainConfig = require("../../config/main")
const jd_config  = config.jd
const log        = require('../../libraries/logger')()

// 按照字母表顺序排序参数
function sortUrlParams (objParams) {
    let newParams = {};
    Object.keys(objParams).sort().map(key => {
        newParams[key]=objParams[key]
    })
    //log.debug("Sorted Params:", newParams)

    return newParams
}

// 拼接所有url参数名和值，把secret拼到字符串的2端，用于生成签名
function joinUrlParams (objParams) {
    let str = ""
    for (const key in objParams) {
        //log.debug(key)
        str += key + objParams[key]        
    }
    //log.debug(str)

    // 2端增加secret
    let secret = jd_config.app_secret
    return secret + str + secret;
}

// 拼接所有url参数名和值
function convertUrlParams (objParams) {
    let str = ""
    for (const key in objParams) {
        //log.debug(key)
        str += (!str ? "?" : "&" ) + key + '=' + objParams[key]
    }
    //log.debug(str)
    return str;
}

// 使用md5加密字符串生成签名
function encrypUrlParams (strParams, method) {
   return (!method || method == 'md5') ?  hex_md5(strParams).toUpperCase() : strParams;
}

// 生成签名
function buildSign (objParams) {
    // 排序参数
    let sortParams = sortUrlParams(objParams)
    //log.debug(sortParams)

    // 拼接参数成字符串
    let strParams = joinUrlParams(sortParams)
    log.info(strParams)

    // 加密字符串， 默认方法为md5
    return encrypUrlParams(strParams)
}

// 生成请求地址
function buildRequestUrl (productUrl) {
    // 封装参数
    let objParams = {}
    // app_key
    objParams.app_key = jd_config.app_key
    // access_token
    //objParams.access_token = ""
    // method
    objParams.method = "jd.union.open.promotion.common.get"
    // current timestamp
    objParams.timestamp = getCurrentTime('yyyy-MM-dd hh:mm:ss')
    // format
    objParams.format = jd_config.format
    // version
    objParams.v = jd_config.version
    // sign method
    objParams.sign_method = jd_config.sign_method
    // 业务参数 
    let business = {
        promotionCodeReq : {
            siteId : jd_config.site_id,
        materialId : productUrl
        }             
    }
    // param_json
    objParams.param_json = JSON.stringify(business)
    // sign 签名
    objParams.sign = buildSign(objParams)
    //log.info(objParams)

    // base url
    let request_url = jd_config.base_url + convertUrlParams(objParams)
    log.info(request_url)

    // 返回
    return request_url
}

function getCurrentTime (fmt) {
    // 当前服务器时间
    var t = new Date()
    // 服务器时间与本地区时间的差，以分钟为单位
    var offset = mainConfig.timezone_offset
    //log.info(offset)
    // 计算本地区时间
    t = new Date(t.getTime() + offset * 60000)
    //log.info(t)
    var o = {
        "M+": t.getMonth() + 1, //月份
        "d+": t.getDate(), //日
        "h+": t.getHours(), //小时
        "m+": t.getMinutes(), //分
        "s+": t.getSeconds(), //秒
        "q+": Math.floor((t.getMonth() + 3) / 3), //季度
        "S": t.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (t.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


// 请求api，返回推广链接
async function getPromotionUrl (productUrl) {
    //log.debug(productUrl);
    try {
        let requestUrl = buildRequestUrl(productUrl)
        let response = await api.requestWebsite(requestUrl)

        // 解析返回结果
        var result = JSON.parse(response)
        log.info("京东推广链接返回结果:", result)

        // 二次解析
        result = (result.jd_union_open_promotion_common_get_response && result.jd_union_open_promotion_common_get_response.code == 0) ? 
            JSON.parse(result.jd_union_open_promotion_common_get_response.result) : result

        // 获取推广链接
        var url = (result.code && result.code == 200) ? result.data.clickURL : ""
        //log.info(url)
    } catch(e) {
        log.error(e)
        var url = ""
    }    
    return url
}


var JDApi = {
    getPromotionUrl
}

module.exports = JDApi