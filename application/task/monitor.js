
const log            = require('../libraries/logger')("web")
const HeartBeatModel = require('../models/controller/heartbeat')
//const mail           = require('../api/notice/mail_service')
//const wechatNotice   = require('../api/notice/wechat_service')
const notice         = require('../api/notice/notice')
//const Url       = require("url")
//const config    = require('../../config/main')
//const api= require('../api')
//const {hex_md5}      = require('../../libraries/md5')

// 读取心跳信息
async function getHeartbeatInfo() {
    try {
        // 读取心跳信息
        let response = await HeartBeatModel.getHeartbeat()
        log.info(response)
        if (response.code != 0 || response.data.length == 0) throw ("未找到心跳信息！")

        // 检查上次的心跳的超时时间，单位：秒
        let last_time = response.data[0].beat_time
        log.info(last_time)
        let now = Math.round(new Date().getTime() / 1000)
        log.info(now)
        let period = Math.round((now - last_time) / 60) //超时分钟数
        log.info(period)


        // 超过3分钟发出报警
        if (period > 180) {
            //mail.send()
            //wechatNotice.send()
            await notice.send("offline", {time: period + '分钟'})
        }
        //Notice.send("all", "offline")

    } catch(e) {
        log.info(e) 
    }

    //10秒之后自动退出
    setTimeout(function(){process.exit(-1)},10000);
}

getHeartbeatInfo()
//process.exit(-1)
