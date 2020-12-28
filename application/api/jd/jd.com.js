const api       = require('../api')
const JDApi     = require('./api.jd.com')
const log       = require('../../libraries/logger')()

// 分析Html页面
async function parseHtml(request_url) {
    if(!request_url) return false
    //请求网页
    let html = await api.requestWebsite(request_url)
    //log.debug("html:\n", html)
    if (!html) return {}

    // 从页面中获取价格
    let price = getPriceFromPage(html)
    log.info("price：", price)
    let image = getImageFromPage(html)
    log.info("image：", image)

    let data = {
        price : price,
        image : image
    }

    return data
}


// 在页面中获取价格
function getPriceFromPage (html) {
    //去除换行符
    html = html.replace(/[\n\r]/g, "")
    //log.debug("str:", str)

    // 查找含有价格的字符串
    var patten = /window\._itemInfo\s*=[\s\S]*['"]price['"]:\s*({[\s\S]*?}),\s*['"]stock['"]/i
    var result = patten.exec(html)
    //log.debug("正则匹配：", result)

    if (!result || !result[1]) return ""
    var str = result[1]
    log.info("JSON 字符串:", str) 

    // 转换成json对象
    try {
        var price = JSON.parse(str)
    } catch (e) {
        log.error(e)
        return ""
    }

    if (price && price.p) return price.p
    return ""    
}


// 在页面中获取产品图
function getImageFromPage (html) {
    var patten = /<img id=['"]firstImg['"].*src=['"]([0-9a-zA-Z\/\.-_]+\.(jpg|png|gif))!.*['"].*\/>/i
    var result = patten.exec(html)
    //log.debug(result)
    if (result && result[1]) return result[1]
    else return ""
}

module.exports =  {
    parseHtml, 
    getPromotionUrl : JDApi.getPromotionUrl
}
