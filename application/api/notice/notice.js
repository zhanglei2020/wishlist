/**
 *  通知服务
 *  通过此服务可以发送通知提醒
 *  config文件为config/notice.json，里边定义了接收人/组，发送模板
 *
 */
const log          = require('../../libraries/logger')()
const noticeConfig = require('../../config/notice')
const api          = require('../api')
const mail         = require('./mail_service')
const sms          = require('./sms_service')
const wechat       = require('./wechat_service')
//const urlencode    = require('urlencode')
//const wechatConfig = config.wechat_notice
const func = {mail,sms,wechat}

// 发送通知提醒
async function send (eventName, params) {
    if (!eventName) return false
    if (!noticeConfig.events || !noticeConfig.events[eventName]) return false

    // 获取当前通知事件对应的接收人
    let receivers = noticeConfig.events[eventName].receivers

    // 获取当前通知事件对应的发送模板
    let templates = noticeConfig.events[eventName].templates

    // 根据不同的模板发送消息
    for (const key in templates) {
        // 检查模板在配置文件中是否存在
        if (!noticeConfig || !noticeConfig.templates || !noticeConfig.templates[templates[key]] || !noticeConfig.templates[templates[key]].type)
            break
        let method = noticeConfig.templates[templates[key]].type
        log.info(method)
        try {
            //let func = 'await '+ method + '.send(receivers, templates[key], params, eventName)'
            log.info(func)
            await func[method].send(receivers, templates[key], params, eventName)
        } catch(e) {
            log.error(e)
            return false
        }        
        //mail.send(templates[key])
    }

}

module.exports = {send}
