const HeartBeatModel = require('../../models/heartbeat/heartbeat_model')
const log                = require('../../libraries/logger')()
//const Wechat         = require('../../api/wechat/wechat')
//const Url       = require("url")
//const config    = require('../../config/main')
//const api= require('../api')
//const {hex_md5}      = require('../../libraries/md5')

// 自动登录
async function qrcode(req, res) {
    try {
        // 读取心跳信息
        let response = await HeartBeatModel.getHeartBeat()
        log.info(response)
        if (response.code != 0 || response.data.length == 0) throw ("未找到心跳信息！")

        // 检查上次的心跳的超时时间，单位：秒
        let qrcode = response.data[0].qr_code_login
        log.info("Wechaty login qrcode:" + qrcode)
        
        // 返回浏览器
        //res.send("Wechaty login qrcode：" + qrcode)
        let data = {
            qrcode_url: qrcode
        }

        res.render("wechaty/qr_code.ejs", data, (err, str) => {
            if(err) log.error(err)
            //log.info(str2)
            res.send(str || '')
        })

    } catch(e) {
      log.error(e)
      //setUserSession(req)
    }  
}


let Wechaty = {
    qrcode    
}

module.exports = Wechaty