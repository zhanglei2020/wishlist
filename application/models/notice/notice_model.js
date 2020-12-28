const publicModel = require('../public_model')
const log         = require('../../libraries/logger')()

// 表名
const table  = 't_sended_notice'

// 各字段的基本属性，用于验证
const fields = {
    id: {
        name  : "主键",
        type  : 'number', 
        length: 11
    },
    event: {
        name    : "事件名称",
        type    : 'string',
        length  : 45,
        required: true
    },
    msg_type: {
        name    : "通知消息类型（微信、短信、邮件等）",
        type    : 'string', 
        length  : 45,
        required: true
    },
    receivers: {
        name    : "接收者，多个用逗号分隔",
        type    : 'string', 
        length  : 512,
        required: true
    },
    content: {
        name    : "消息内容",
        type    : 'string',
        length  : 1024,
        required: true
    },
    send_time: {
        name    : "消息发送时间",
        type    : 'date', 
        length  : 20,
        required: true
    }
}

// 初始化对象
let notice = new publicModel.create(table, fields)
//console.log(notice)

// 获取最近的通知消息
notice.getLastData = function (where) {
    let params = {}
    // 加入where条件
    if (where) params.where = where
    // 取最新的一条记录
    params.orderBy = 'id DESC'
    params.limit = 1

    return notice.getData(params)
}

module.exports = notice