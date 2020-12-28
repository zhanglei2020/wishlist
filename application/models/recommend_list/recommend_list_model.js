//const sqlFunc     = require('../sql_builder')
const publicModel = require('../public_model')
const log         = require('../../libraries/logger')()

// 表名
const table  = 't_recommend_list'

// 各字段的基本属性，用于验证
const fields = {
    id: {
        name  : "主键",
        type  : 'number', 
        length: 11
    },
    member_id: {
        name    : "会员ID",
        type    : 'number',
        length  : 11,
        required: true
    },
    template_id: {
        name  : "模板ID",
        type  : 'number', 
        length: 11,
        required: true
    },
    share_title: {
        name  : "定制的分享标题",
        type  : 'string', 
        length: 200,
        required: true
    },
    status: {
        name  : "状态",
        type  : 'number',
        length: 2
    }
}

// 初始化对象
let recommend_list = new publicModel.create(table, fields)
//console.log(recommend_list)

module.exports = recommend_list