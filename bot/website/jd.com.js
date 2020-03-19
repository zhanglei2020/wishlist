const requestWeb = require('./website')

// 分析Html页面
async function parseHtml(request_url) {
    //请求网页
    let html = await requestWeb(request_url)
    //console.log("html:\n", html)
    if (!html) return {}

    // 从页面中获取价格
    let price = getPriceFromPage(html)
    console.log("price：", price)
    let image = getImageFromPage(html)
    console.log("image：", image)

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
    //console.log("str:", str)

    // 查找含有价格的字符串
    var patten = /window\._itemInfo\s*=[\s\S]*['"]price['"]:\s*({[\s\S]*?}),\s*['"]stock['"]/i
    var result = patten.exec(html)
    //console.log(result)
    if (!result || !result[1]) return ""
    var str = result[1]
    //console.log("result:", str) 

    // 转换成json对象
    try {
        var price = JSON.parse(str)
    } catch (e) {
        console.log(e)
        return ""
    }

    if (price && price.p) return price.p
    return ""    
}


// 在页面中获取产品图
function getImageFromPage (html) {
    var patten = /<img id=['"]firstImg['"].*src=['"]([0-9a-zA-Z\/\.-_]+\.(jpg|png|gif))!.*['"].*\/>/i
    var result = patten.exec(html)
    //console.log(result)
    if (result && result[1]) return result[1]
    else return ""
}


var JDWebsite = {
    parseHtml
}



module.exports = JDWebsite