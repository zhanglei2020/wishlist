const xmlReader = require('xmlreader')
const Validator = require('./validator');
const JD_Website = require('./website/jd.com')

//解析分享链接xml文件，获取title、description等信息
function parseXmlOfShareLink (xml) {
    return new Promise ((resolve, reject) => {
        xmlReader.read(xml, async (error, xmlResponse) => {
            if(error){  
                console.log(error)  
                reject(error);
            }

            try {
                var url = xmlResponse.msg.appmsg.url.text() || ""
                var title = xmlResponse.msg.appmsg.title.text() || ""
                var description = xmlResponse.msg.appmsg.des.text() || ""
            } catch (e) {
                console.log("xml消息中指定的属性不存在！")
                reject(e)
            }

            //检查是否合格的链接
            if (!Validator.checkUrlIsJD(url)) reject("error url");
            
            //获取产品id
            let product_id = Validator.getProductId(url)

            //分析并生成新的url
            let share_url = Validator.createProductUrlOfJD(product_id)
            console.log("request url:", share_url)
            
            // 分析网页提取价格及图片等信息
            let info = await JD_Website.parseHtml(share_url)
            console.log(info)
            
            resolve({
                title        : title,
                description  : description,
                shareUrl     : share_url,
                productId    : product_id,
                price        : info.price || '',
                image        : info.image || ''
            })
        })
    })
}


//解析小程序xml文件，获取title、description等信息
function parseXmlOfMiniProgram (xml) {
    //console.log("小程序xml：", xml)
    return new Promise ((resolve, reject) => {
        xmlReader.read(xml, (error, xmlResponse) => {
            if(error){  
                console.log(error)  
                reject(error);
            }

            try {
                var res = xmlResponse.msg.appmsg
                var shareInfo = res.weappinfo.pagepath && res.weappinfo.pagepath.text() || ""
                var title = res.title && res.title.text() || ""
                var share_url = res.url && res.url.text() || ''

                //检查是否合格的链接
                if (!Validator.checkUrlIsJD(share_url)) reject("error url");

                console.log(shareInfo)
                var description = res.des && typeof res.des.text == 'function' && res.des.text() || ""
                
                //获取产品id
                var product_id = Validator.getProductId(shareInfo)
                var price = Validator.getProductPrice(shareInfo)
                var picture = Validator.getProductPic(shareInfo)

                //分析并生成新的url
                share_url = Validator.createProductUrlOfJD(product_id)

            } catch (e) {
                console.log("xml消息中指定的属性不存在！")
                reject(e)
            }                        
            
            resolve({
                title        : title,
                description  : description,
                shareUrl     : share_url,
                productId    : product_id,
                price        : price,
                image        : picture
            })
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