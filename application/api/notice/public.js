const log          = require('../../libraries/logger')()
const NoticeModel  = require('../../models/notice/notice_model')
const config       = require('../../config/main')


// 替换模板中的变量
function replaceTemplate(str, params) {
    if (!str || !params) return false
    let v1 = [], v2 = []
    // 查询需要替换的变量名
    let patt = new RegExp("\\$\{([a-zA-Z]+)\}", "g")
    //console.log("a:", patt.exec(str))
    console.log("str:", str)
    console.log("params:", params)
    // 循环调用正则匹配，直到返回null为止
    while ((result = patt.exec(str)) != null) {
        console.log("result:", result)
        // 去重
        if(v1.indexOf(result[0]) < 0) {
            v1.push(result[0])
            v2.push(result[1])
        }
    }
    console.log('v1:', v1)
    console.log('v2:', v2)

    // 把v1替换成v2对应的值
    for (const key in v2) {
        console.log(v2[key])
        if (params[v2[key]]) {           
            str = str.replace(v1[key], params[v2[key]])
            console.log('str:',str)
        }
    }
    return str
}

// 根据模板中设定的策略，确定是否发送提醒消息，例如发送间隔，发送的时间，每天发送最大的次数
async function checkIfSendNotice(event_name, template) {
    if (!event_name || !template || typeof template != "object") return false

    // 获取当前时间
    let now = new Date()
    let now_time = Math.round(now.getTime() / 1000)

    // 获取上次发送的时间
    let last_time = 0
    let params = {
        event: event_name,
        msg_type: template.type
    }
    log.info(params)
    let result = await NoticeModel.getLastData(params)
    if (result.code != 0 || result.data.length == 0) {
        log.error("未查到最近发送提醒的记录！")      
    } else {
        log.info("最近消息记录：", result.data)
        last_time = result.data[0].send_time
    }
    log.info("当前时间：", now_time)
    log.info("上次发送时间：", last_time)
    log.info("当前间隔：", now_time-last_time, "秒")

    // 获取策略的间隔时间，默认90分钟
    let interval = template.interval * 60 || 0
    log.info("当前发送提醒最小间隔时间：", interval, "秒")

    // 如果当前时间和最近发送时间的差小于间隔时间，不允许发送
    if (now_time - last_time < interval) return false
    //return true

    // 检查工作时间，默认''
    let strWorkPeriod = template.workPeriod || ''
    if (strWorkPeriod) {
        let pos = strWorkPeriod.indexOf("-")
        let startHour = strWorkPeriod.slice(0, pos)
        let endHour = strWorkPeriod.slice(pos+ 1)
        log.info("开始小时：", startHour, "，结束小时：", endHour)

        // 如果有时区，当前时间减去偏移时间
        let offset = config.timezone_offset || 0
        let nowHour = now.getHours() + Math.round(offset / 60)
        if (nowHour > 24) nowHour = nowHour - 24
        log.info("现在小时:", nowHour)

        // 检查当前时间若在工作小时之外，则不允许发送
        if (nowHour < startHour || nowHour > endHour) return false
    }

    return true
}

// 保存消息
function saveNoticeLog(data) {

}

module.exports = {
    replaceTemplate,
    checkIfSendNotice
}