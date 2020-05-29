/*
    校验器，检查输入是否符合要求，符合返回true，不符合返回false
    小程序：
    京东  appid：wx91d27dbf599dff74
    拼多多appid：wx32540bd863b27570

*/


let Validator = {
    //检查是否为京东的链接
    checkUrlIsJD : (inputUrl) => {
        if (/\.jd\.(com|hk)\//i.test(inputUrl)) return true

        return (/appid=wx91d27dbf599dff74/i.test(inputUrl))
    },

    //检查好友申请信息
    checkFriendConfirm : (inputUrl) => {
        return /(wishlist|心愿单)/i.test(inputUrl)
    },

    //生成京东商品的链接
    createProductUrlOfJD : (productId) => {
        return "https://item.m.jd.com/product/" + productId + ".html"
    },

    //获取链接中的item_id
    getProductId : (inputUrl) => {
        //模板：https://item.m.jd.com/product/100010573596.html
        var patten = /([0-9]+)\.html/i
        var result = patten.exec(inputUrl)
        if (result && result[1]) return result[1]

        //模板：https://wqitem.jd.com/item/view?sku=60745631294
        var patten = /sku=([0-9]+)/i
        var result = patten.exec(inputUrl)
        if (result && result[1]) return result[1]

        //返回：未找到
        return false
    },

    //获取链接中的价格
    getProductPrice : (inputUrl) => {
        //模板：price=37.80
        var patten = /price=([0-9\.]+)/i
        var result = patten.exec(inputUrl) 
        if (result && result[1]) return result[1]

        //返回：未找到
        return false
    },

    //获取链接中的图片地址
    getProductPic : (inputUrl) => {
        //模板：cover=https://img13.360buyimg.com/n1/s750x750_jfs/t1/20890/33/14009/547654/5ca2accbEd7a4597d/7d0a6c4e9f57cc16.jpg
        var patten = /cover=([0-9a-zA-Z:\/\._]+\.jpg)/i
        var result = patten.exec(inputUrl) 
        if (result && result[1]) return result[1]

        //返回：未找到
        return false
    }

}

module.exports = Validator;