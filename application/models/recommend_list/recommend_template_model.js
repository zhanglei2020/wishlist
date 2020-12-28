//const sqlFunc     = require('../sql_builder')
const publicModel = require('../public_model')
const log         = require('../../libraries/logger')()

// 表名
const table  = 't_recommend_template'

// 各字段的基本属性，用于验证
const fields = {
    id: {
        name  : "主键",
        type  : 'number', 
        length: 11
    },
    name: {
        name    : "模板名称",
        type    : 'string',
        length  : 64,
        required: true
    },
    code: {
        name  : "模板编码",
        type  : 'string', 
        length: 64,
        required: true
    },
    description: {
        name  : "模板描述",
        type  : 'string', 
        length: 200,
        required: true
    },
    status: {
        name  : "模板状态：1-正常，2-不可用",
        type  : 'number',
        length: 11
    },
    creator: {
        name  : "创建人",
        type  : "string",
        length: 64
    }

}

// 创建对象
let recommend_template = new publicModel.create(table, fields)
//console.log(recommend_template)

module.exports = recommend_template