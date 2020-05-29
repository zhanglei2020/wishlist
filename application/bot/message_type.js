const xmlReader = require('xmlreader')
const Validator = require('./validator')
const JD_Website = require('../api/jd/jd.com')
const log = require('../libraries/logger')()

//解析分享链接xml文件，获取title、description等信息
function parseXmlOfShareLink (xml) {
    return new Promise ((resolve, reject) => {
        xmlReader.read(xml, async (error, xmlResponse) => {
            try {
                if(error) throw(error)            

                // 获取appmsg
                let res = xmlResponse.msg.appmsg
                if (!res) throw("解析分享的小程序未获取到正确的信息！")

                // 获取url等信息
                let url = res.url.text() || ""
                let title = res.title.text() || ""
                let description = res.des.text() || ""
                //log.info(url)
                //log.info("jd 检查结果：", Validator.checkUrlIsJD(url))

                //检查是否合格的链接
                if (!Validator.checkUrlIsJD(url)) throw("错误的京东链接地址！")
                
                //获取产品id
                let product_id = Validator.getProductId(url)
                //log.info(product_id)
                if (!product_id) throw("未获取到商品ID！")

                //分析并生成新的url
                let share_url = Validator.createProductUrlOfJD(product_id)
                //log.info("request url:", share_url)
                if (!share_url) throw("生成新的京东链接发生错误！")
                
                // 分析网页提取价格及图片等信息
                let info = await JD_Website.parseHtml(share_url)
                //log.info(info)
                if (!info) throw("分析网页信息发生错误！")
                if (!info.price && !info.image) throw ("京东页面无法抓取到价格和图片信息！")
                
                resolve({
                    title        : title,
                    description  : description,
                    shareUrl     : share_url,
                    productId    : product_id,
                    price        : info.price || '',
                    image        : info.image || ''
                })
            } catch (e) {
                log.error(e)
                resolve(false)
            }
        })
    })
}


//解析小程序xml文件，获取title、description等信息
function parseXmlOfMiniProgram (xml) {
    //log.debug("小程序xml：", xml)
    return new Promise ((resolve, reject) => {
        xmlReader.read(xml, (error, xmlResponse) => {
            try {
                if(error) throw(error);
            
                // 获取appmsg
                let res = xmlResponse.msg.appmsg
                if (!res) throw("解析分享的小程序未获取到正确的信息！")
                //log.debug("1..............")
                
                //检查是否合格的链接
                let share_url = res.url && res.url.text() || ''
                log.info(share_url)
                if (!Validator.checkUrlIsJD(share_url)) throw("错误的京东链接地址！")
                //log.debug("2..............")
                
                // 获取shareinfo
                let shareInfo = res.weappinfo && res.weappinfo.pagepath && res.weappinfo.pagepath.text()
                //log.info(shareInfo)
                if (!res) throw("解析分享的小程序未获取到商品信息！")
                //log.debug("3..............")

                // 获取产品id
                let product_id = Validator.getProductId(shareInfo)
                let price = Validator.getProductPrice(shareInfo)
                let picture = Validator.getProductPic(shareInfo)

                // 未获取到抛出异常
                if (!product_id) throw("未获取到商品ID！")
                //log.debug("5..............")

                //分析并生成新的url
                let new_url = Validator.createProductUrlOfJD(product_id)
                if (!new_url) throw("生成新的京东链接发生错误！")
                //log.debug("6..............")

                // 获取标题和描述
                let title = res.title && res.title.text() || ""          
                let description = res.des && res.des.text() || ""        
                                
                resolve({
                    title        : title,
                    description  : description,
                    shareUrl     : share_url,
                    productId    : product_id,
                    price        : price || '',
                    image        : picture || ''            
                })
            } catch (e) {
                log.error(e)
                resolve(false)
            }
        })
    })
}


var MesageType = {
    ShareLink : {
        parseXml : parseXmlOfShareLink
    },
    MiniProgram : {
        parseXml : parseXmlOfMiniProgram
    }
}

module.exports = MesageType