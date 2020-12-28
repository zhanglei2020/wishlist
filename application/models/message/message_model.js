const publicModel = require('../public_model')
const log         = require('../../libraries/logger')()

// 表名
const table  = 't_received_message'

// 各字段的基本属性，用于验证
const fields = {
    id: {
        name  : "主键",
        type  : 'number', 
        length: 11
    },
    contact: {
        name    : "微信昵称",
        type    : 'string',
        length  : 128,
        required: true
    },
    contact_id: {
        name  : "微信ID",
        type  : 'string', 
        length: 128,
        required: true
    },
    message: {
        name  : "消息内容",
        type  : 'string', 
        length: 2000,
        required: true
    },
    type: {
        name  : "消息类别",
        type  : 'number',
        length: 2
    },
    received_time: {
        name  : "消息接收时间",
        type  : 'date', 
        length: 20
    }
}

// 初始化对象
let message = new publicModel.create(table, fields)
//console.log(message)

module.exports = message