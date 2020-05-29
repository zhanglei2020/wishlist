const ShareListModel = require('../../models/controller/share_list')
const log           = require('../../libraries/logger')()
const shareInfo     = require('../../libraries/share_info')
const config        = require('../../config/main')
const Wechat        = require('../../api/wechat/wechat')
const jd            = require('../../api/jd/jd.com')
const pdd           = require('../../api/pdd/pdd.com')
const api = {jd, pdd}
//const Validator = require('../../bot/validator')

// 列表页
async function index (req, res) {
    var result, input = req.query
    
    try {
        // 校验参数
        if (!input.key) throw ("参数错误")

        // 获取wechatId
        result = await ShareListModel.getMemberByUserKey(input)
        log.debug(result)

        if (result.code != 0 || result.data.length == 0) throw ("用户不存在")
        let member = result.data[0]

        // 验证传入参数
        //let wechatId = member.wechat_id 
        //let verify = hex_md5(input.user_id + wechatId)
        //log.info("用户参数校验值：", verify)
        //if (input.key != verify) throw ("用户参数非法！")
        //member.user_key = verify

        let response = await ShareListModel.getLinkByUser({user_id: member.id})
        if (response.code != 0 || response.data.length == 0) throw ("心愿单为空")
        //log.info(response)

        //获取分享的标题、描述等信息
        let params = {name: member.wechat_name}
        let _share_info = {
            img: shareInfo.getShareUrl("wish_list", "icon"),
            title:  shareInfo.getShareText("wish_list", "title", params),
            friend_title:  shareInfo.getShareText("wish_list", "friend_title", params),
            desc:  shareInfo.getShareText("wish_list", "desc", params),
        }
        log.info("share info:", _share_info)

        // 传给ejs模板的参数
        var data = {
            //session: req.session,
            //config   : config,
            member   : member, 
            shareList: response.data,
            shareInfo: _share_info,
            share    : {}
        }
        //log.info(data)

        // 显示列表页
        res.render("share_link/index.ejs", data, async (err1, str1) => {
            if(err1) log.error(err1)
            // 获取微信分享的相关参数
            //response = await Wechat.getShareData(req)
            data.share = response || {}
            //log.info("share data:", data.share)

            res.render("wechat_share/share.ejs", data, (err2, str2) => {
                if(err2) log.error(err2)
                //log.info(str2)
                res.send((str1 || '') + (str2 || ''))
            })
        })

        // TODO 获取微信分享的相关参数
        //response = await Wechat.getUserInfo("oOYQ4uHf-5Z_ilqC6WLXltPtnV04")
        //log.info(response)
        //res.render("wechat_share/share.ejs")
    } catch (e) {
        log.error(e)
        // 显示邀请页
        res.render("share_link/invite.ejs")
    }
}

// 删除分享列表
async function del (req, res) {
    var result, input = req.query
    
    try {
        //校验参数
        if (!input.item_id) throw ("参数错误")
        if (!req.session.user) throw ("对不起，您没有权限！")

        let response = await ShareListModel.deleteShareList(input.item_id, req.session.user.user_id)
        log.info("删除分析列表结果：", response)
        if (response.code != 0 || response.data.affectedRows == 0) throw ("对不起，删除失败！")

        //返回数据
        var result = {code: 0}
        //log.info("", data)
       
    } catch (e) {
        log.error(e)
        var result = {code: 1, msg: e}
    }

    res.json(result)
}

// 点击链接时自动更新数据
async function click(req, res) {
    try {
        let input = req.query
        //校验参数
        if (!input.item_id) throw ("未找到商品ID")

        // 检查并更新商品数据
        let result = await checkAndUpdateProduct(input.item_id)
        if (!result) throw ("商品("+ input.item_id+ ")信息无需更新或发生错误！")

        // 记录
        log.info("更新商品信息("+ input.item_id+ ")成功！")
        var response = {code: 0}

    } catch (e) {
        log.error(e)
        var response = {code: 1, msg: e}
    }

    res.json(response)
}

// 检查并更新商品数据
async function checkAndUpdateProduct (item_id) {
    try {
        if (!item_id) throw ("商品ID不能为空！")

        // 查询商品数据
        let result = await ShareListModel.getShareListById({id: item_id})
        log.info("商品信息：", result)
        if (result.code !=0 || result.data.length == 0) throw ("商品不存在！")

        // 获取数据
        let product = result.data[0]
        log.info(product)

        // 检查上次更新时间是否在24小时之内
        let now = Math.round(new Date().getTime() / 1000)
        log.info("距上次更新有", Math.round((now - product.updated_time) / 3600), "小时")
        if (now - product.updated_time < config.product_update_interval * 3600)
            throw ("未超过更新周期，本次不更新！")

        // 确定产品类型，调用对应api的方法
        if (!config.product_type || !config.product_type[product.type]) throw ("配置文件中未找到对应的产品类型")
        let method_name = config.product_type[product.type]
        log.info("method name:", method_name)

        // 调用对应的方法获取信息
        if (!api[method_name]) throw ("未找到对应的产品方法")
        log.info(product.url)
        result = await api[method_name].parseHtml(product.url)
        if (!result) throw("未获取到页面数据")

        // 获取推广url
        let promotion_url = await api[method_name].getPromotionUrl(product.url)

        // 更新数据
        let data = {
            price: result.price,
            img_url: result.image,
            promotion_url: promotion_url
        }
        log.info(data)
        await ShareListModel.updateShareList(item_id, data)
        //当数据变化时更新商品数据
        
        //log.debug(shareListId)
        return true       

    } catch (e) {
        log.error(e)
        return false
    }
}


var ShareLink = {
    index, del, click
    //detail : detail
}

module.exports = ShareLink