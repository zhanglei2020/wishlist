const publicModel = require('../public_model')
const log         = require('../../libraries/logger')()

// 表名
const table  = 't_share_list'

// 各字段的基本属性，用于验证
const fields = {
    id: {
        name  : "主键",
        type  : 'number', 
        length: 11
    },
    type: {
        name    : "商品类型",
        type    : 'number',
        length  : 11,
        required: true
    },
    title: {
        name    : "商品名称",
        type    : 'string', 
        length  : 200,
        required: true
    },
    desc: {
        name    : "商品描述",
        type    : 'string', 
        length  : 400,
        required: true
    },
    url: {
        name    : "商品url",
        type    : 'string',
        length  : 400,
        required: true
    },
    promotion_url: {
        name    : "商品推广链接",
        type    : 'string', 
        length  : 400
    },
    img_url: {
        name    : "图片链接",
        type    : 'string', 
        length  : 400
    },
    price: {
        name    : "图片链接",
        type    : 'number', 
        length  : 12
    },
    product_id: {
        name    : "商品ID",
        type    : 'string', 
        length  : 45
    },
    status: {
        name    : "商品状态",
        type    : 'number', 
        length  : 2
    }
}

// 初始化对象
let share_list = new publicModel.create(table, fields)
//console.log(notice)

module.exports = share_list