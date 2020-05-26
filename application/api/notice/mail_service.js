const nodemailer   = require('nodemailer')
const log          = require('../../libraries/logger')()
const config       = require('../../config/api')
const mailConfig   = config.mail
const noticeConfig = require('../../config/notice')
const noticeLog    = require('../../models/controller/sended_notice')
const public       = require('./public')
//const noticeConfig = require('../../config/notice')

//const msg_type = 'mail'

let transporter = nodemailer.createTransport({
    //service: 'qq', // no need to set host or port etc.
    host: mailConfig.host,
    port: mailConfig.port,
    secureConnection: false,
    auth: {
        user: mailConfig.account,
        pass: mailConfig.password
    }
})


// 根据指定的组名或接收人名或邮件地址，获得接收人array
function getReceiverList(receiver_name) {
    if (!receiver_name) return false
    var receiver_list = []

    // 检查是否邮件地址
    let patten = new RegExp("[a-zA-Z0-9]+@([a-zA-Z0-9]+\.)+[a-zA-Z0-9]+")
    let result = patten.test(receiver_name)
    //log.info(result)
    if (result) return [receiver_name]

    if (!noticeConfig || !noticeConfig.receivers) return false

    // 检查是否组名称
    if (noticeConfig.groups[receiver_name]) {
        let groups = noticeConfig.groups[receiver_name]
        log.info(groups)
        
        for (const key in groups) {
            //console.log(noticeConfig.receivers[groups[key]])
            if (!noticeConfig.receivers[groups[key]] || !noticeConfig.receivers[groups[key]].mail) break
            let mail = noticeConfig.receivers[groups[key]].mail
            //console.log(mail)
            //console.log(mail.constructor)
            if (mail.constructor === Array) {
                //console.log(key)
                receiver_list = receiver_list.concat(mail)
            }
            else receiver_list.push(mail)
        }
        return receiver_list || false
    }

    // 检查是否接收人名称
    if (!noticeConfig.receivers[receiver_name] || !noticeConfig.receivers[receiver_name].mail) return false
    let mail = noticeConfig.receivers[receiver_name].mail
    return mail.constructor === Array ? mail : [mail]
}

//replaceTemplate('曼泽心愿机${time}器人已经${name}掉线超过${time}，请尽快处理！', {time: "10分钟", name: "diablo"})
//send('admin', 'offlineMail', {time: "10分钟"})

// 发送邮件
async function send(receiver_name, template_name, params, event_name) {
    //console.log(noticeConfig.receivers[receiver_name].mail)
    try {
        if (!receiver_name || !template_name) throw ("邮件接收人或模板或标题不能为空！")        
        //if (!noticeConfig || !noticeConfig.receivers || !noticeConfig.receivers[receiver_name] || !noticeConfig.receivers[receiver_name].mail)
            //throw ("配置文件中找不到指定的接收人")
        if (!noticeConfig || !noticeConfig.templates || !noticeConfig.templates[template_name])
            throw ("配置文件中找不到指定的模板")

        // 获取接收人参数
        let mailto = getReceiverList(receiver_name)
        log.info(mailto)
        if (!mailto) throw('找不到指定的接收人')

        // 获取模板
        let template = noticeConfig.templates[template_name]
        log.info("邮件模板：", template)

        // 根据模板的参数确定是否发送消息
        if (!await public.checkIfSendNotice(event_name, template)) throw("根据当前设定的发送提醒策略，本次mail提醒取消。。。")

        // 获取发送内容
        let contentOption = {}
        //console.log(public)
        if (template.format == 'text') contentOption = {text: public.replaceTemplate(template.text, params) || ''}
        else if (template.format == 'html') contentOption = {html: public.replaceTemplate(template.html, params) || ''}

        // 整理参数
        let mailOptions = {
            from: (mailConfig.sender || '') + " " + mailConfig.account, // sender address
            to: mailto.join(", "), // list of receivers
            subject: template.subject, // Subject line
            // 发送text或者html格式
            // text: '', // plain text body
            //html: template.'<b>Hi， 曼泽心愿机器人已经掉线超过3分钟，请尽快处理！</b>', // html body
            // 附件
            /*
            attachments:[
                {
                    filename: "text",
                    path: ""
                }

            ]
            */
        }

        // 合并参数
        Object.assign(mailOptions, contentOption)
        log.info(mailOptions)

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                log.error(error)
                return false
            }
            log.info('Message sent: %s', info.messageId)

            // 保存提醒消息
            let data = {
                event: event_name,
                msg_type: template.type,
                receivers: mailto.join(", "),
                content: contentOption.html || contentOption.text || ''
            }
            log.info(data)
            noticeLog.insertSendedNotice(data)

            return {code: 1, msg: "ok"}
            // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
        })



    } catch(e) {
        log.error(e)
        return false
    }
}

var mail = {
    send
}

module.exports = mail