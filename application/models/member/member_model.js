const publicModel = require('../public_model')
const log         = require('../../libraries/logger')()

// 表名
const table  = 't_member'

// 各字段的基本属性，用于验证
const fields = {
    id: {
        name  : "主键",
        type  : 'number', 
        length: 11
    },
    user_key: {
        name    : "用户key值，每个用户唯一",
        type    : 'string',
        length  : 64,
        required: true
    },
    wechat_id: {
        name    : "微信id，唯一值",
        type    : 'string', 
        length  : 64,
        required: true
    },
    wechat_name: {
        name    : "微信名称",
        type    : 'string', 
        length  : 64,
        required: true
    },
    wechat_avatar: {
        name    : "微信头像",
        type    : 'string',
        length  : 200,
        required: true
    },
    session_id: {
        name    : "session值",
        type    : 'string', 
        length  : 64
    },
    open_id: {
        name    : "微信openid",
        type    : 'string', 
        length  : 64
    }
}

// 初始化对象
let member = new publicModel.create(table, fields)
//console.log(notice)

module.exports = member