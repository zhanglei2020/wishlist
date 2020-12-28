const publicModel = require('../public_model')
const log         = require('../../libraries/logger')()

// 表名
const table  = 't_member_share_list'

// 各字段的基本属性，用于验证
const fields = {
    id: {
        name  : "主键",
        type  : 'number', 
        length: 11
    },
    member_id: {
        name    : "会员id",
        type    : 'number', 
        length  : 11,
        required: true
    },
    share_list_id: {
        name    : "分享列表id",
        type    : 'number', 
        length  : 11,
        required: true
    }
}

// 初始化对象
let relation = new publicModel.create(table, fields)
//console.log(notice)

module.exports = relation