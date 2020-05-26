/**
 *  微信通知服务
 *  通过此服务发送企业通知消息，使用Get方式
 *  参数：touser=用户名，content=消息内容（GBK编码）
 *
 */
const log          = require('../../libraries/logger')()
const config       = require('../../config/api')
const wechatConfig = config.wechat_notice
const noticeConfig = require('../../config/notice')
const noticeLog    = require('../../models/controller/sended_notice')
const api          = require('../api')
const urlencode    = require('urlencode')
const public       = require('./public')

//const msg_type = 'wechat'

// 根据指定的组名或接收人名或邮件地址，获得接收人array
function getReceiverList(receiver_name) {
    if (!receiver_name) return false
    var receiver_list = []

    if (!noticeConfig || !noticeConfig.receivers) return false

    // 检查是否组名称
    if (noticeConfig.groups[receiver_name]) {
        let groups = noticeConfig.groups[receiver_name]
        log.info(groups)
        
        for (const key in groups) {
            //console.log(noticeConfig.receivers[groups[key]])
            if (!noticeConfig.receivers[groups[key]] || !noticeConfig.receivers[groups[key]].wechat_notice_user) break
            let user = noticeConfig.receivers[groups[key]].wechat_notice_user       
            receiver_list.push(user)
        }
        return receiver_list || false
    }

    // 检查是否接收人名称
    if (!noticeConfig.receivers[receiver_name] || !noticeConfig.receivers[receiver_name].wechat_notice_user) return false
    return [noticeConfig.receivers[receiver_name].wechat_notice_user]
}

// 发送微信企业通知
async function send(receiver_name, template_name, _params, event_name) {
    try {
        if (!receiver_name || !template_name) throw ("邮件接收人或模板或标题不能为空！")
        if (!noticeConfig || !noticeConfig.templates || !noticeConfig.templates[template_name])
            throw ("配置文件中找不到指定的模板")

        // 获取接收人参数
        let receivers = getReceiverList(receiver_name)
        log.info(receivers)
        if (!receivers) throw ('找不到指定的接收人')

        // 获取模板
        let template = noticeConfig.templates[template_name]
        log.info("微信模板：", template)

        // 根据模板的参数确定是否发送消息
        if (!await public.checkIfSendNotice(event_name, template)) throw ("根据当前设定的发送提醒策略，本次wechat提醒取消。。。")

        // 参数
        let request_url = wechatConfig.service_url, _request_url = ''
        let content = public.replaceTemplate(template.content, _params)
        let params = {
            content: urlencode(content, "gbk")
        }

        // 循环每一个接收人，发送通知
        for (const key in receivers) {
            params.touser = receivers[key]
            _request_url = request_url + api.joinUrlParams(params)
            log.info(_request_url)

            // send wechat enterprise notice
            let result = api.requestWebsite(_request_url)
            //log.info(result)
        }

        // 保存消息
        let data = {
            event: event_name,
            msg_type: template.type,
            receivers: receivers.join(","),
            content: content
        }
        log.info(data)
        noticeLog.insertSendedNotice(data)

        return {code: 1, msg: "ok"}
    } catch(e) {
        log.error(e)
        return false
    }
}

var wechatNotice = {
    send
}

//send("admin", "offlineWechat")
module.exports = wechatNotice