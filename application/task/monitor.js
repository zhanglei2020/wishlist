
const log            = require('../libraries/logger')("web")
const HeartBeatModel = require('../models/heartbeat/heartbeat_model')
const notice         = require('../api/notice/notice')
const exec = require("child_process").exec


// 读取心跳信息
async function getHeartbeatInfo() {
    try {
        // 读取心跳信息
        let response = await HeartBeatModel.getHeartBeat()
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
        if (period > 10) {
            await notice.send("offline", {time: period + '分钟', url: "https://wishlist.manze.com/mzs/wechaty/qrcode"})

            let last_qr_time = response.data[0].qr_code_time
            let qr_period = Math.round((now - last_qr_time) / 60) //超时分钟数
            log.info(now)
            log.info(last_qr_time)
            log.info("二维码上次刷新距现在：", qr_period, "分钟！")
            if (qr_period > 15) {
                log.info("二维码超过", qr_period, "分钟未刷新，重新启动wishlist！")
                restartBot()
            }
        }

    } catch(e) {
        log.info(e) 
    }

    //10秒之后自动退出
    setTimeout(function(){process.exit(-1)},10000)
}

// 重启wishlist机器人
async function restartBot () {
    let stop = "ps -ef|grep bot.js|awk '{print $2}'|xargs kill -9"
    let start = "/usr/local/bin/node /opt/wishlist/application/bot/wish-list-bot.js > /tmp/bot.log &"
    await exec(stop, function(error, stdout, stderr) {
        console.log('stdout:', stdout)
        console.log('stderr:', stderr)
    });
    await exec(start, function(error, stdout, stderr) {
        console.log('stdout:', stdout)
        console.log('stderr:', stderr)
    });
}

getHeartbeatInfo()
//process.exit(-1)
