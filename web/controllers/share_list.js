const ShareUrlModel = require('../../model/controller/share_list')
const {hex_md5} = require('../library/md5');
const {log}     = require('brolog')
const config    = require('../config/mz_config')
const Wechat    = require('../library/wechat');
//const JDApi     = require('../../bot/website/api.jd.com');

// 列表页
async function index (req, res) {
    var result, input = req.query
    
    try {
        // 校验参数
        if (!input.user_id || !input.key) throw ("参数错误")

        // 获取wechatId
        result = await ShareUrlModel.getMemberByUserId(input)
        if (result.code != 0 || result.data.length == 0) throw ("用户不存在")
        let member = result.data[0]

        // 验证传入参数
        let wechatId = member.wechat_id 
        let verify = hex_md5(input.user_id + wechatId)
        log.info("用户参数校验值：", verify)
        if (input.key != verify) throw ("用户参数非法！")
        //member.user_key = verify

        let response = await ShareUrlModel.getLinkByUser(input)
        if (response.code != 0 || response.data.length == 0) throw ("心愿单为空")
        //console.log(response)

        // 传给ejs模板的参数
        var data = {
            //session: req.session,
            config: config,
            member: member, 
            shareList: response.data,
            share : {}
        }
        //console.log(data)

        // 显示列表页
        res.render("share_link/index.ejs", data, async (err1, str1) => {
            // 获取微信分享的相关参数
            response = await Wechat.getShareData()
            data.share = response || {}
            //console.log("data:", data)

            res.render("wechat_share/share.ejs", data, (err2, str2) => {
                //console.log(str2)
                res.send(str1 + str2)
            })
        })

        // 获取微信分享的相关参数
        response = await Wechat.getAccessToken()
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

        let response = await ShareUrlModel.deleteShareList(input.item_id, req.session.user.user_id)
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


var ShareLink = {
    index, del
    //detail : detail
}

module.exports = ShareLink