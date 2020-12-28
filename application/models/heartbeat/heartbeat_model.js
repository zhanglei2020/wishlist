const publicModel = require('../public_model')
const mainConfig  = require('../../config/main')
const log         = require('../../libraries/logger')()

// 表名
const table  = 't_heartbeat'

// 各字段的基本属性，用于验证
const fields = {
    id: {
        name  : "主键",
        type  : 'number', 
        length: 11
    },
    bot_id: {
        name    : "机器人ID",
        type    : 'string',
        length  : 45,
        required: true
    },
    data: {
        name  : "心跳数据",
        type  : 'string', 
        length: 128,
        required: true
    },
    qr_code_login: {
        name  : "二维码地址",
        type  : 'string', 
        length: 512,
        required: false
    },
    beat_time: {
        name  : "定制的分享标题",
        type  : 'number', 
        length: 11,
        required: true
    },
    qr_code_time: {
        name  : "二维码刷新时间",
        type  : 'number', 
        length: 11,
        required: true
    }
}

// 初始化对象
let heartbeat = new publicModel.create(table, fields)
//console.log(heartbeat)

// 获取当前的心跳信息
heartbeat.getHeartBeat = function () {
    let where = {
        where: {id: mainConfig.heartbeat_id || 1}
    }
    return heartbeat.getData(where)
}

module.exports = heartbeat