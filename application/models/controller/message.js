/*
 * 消息表，用来保存当前机器人收到的消息
 */

const query  = require('../api');
const $sql   = require('../sqlfun');   //sql语句
//const log    = require('../../libraries/logger')()


// 插入或更新心跳信息
async function insertMessage (params) {
    if (!params || typeof params != "object") return false

    // 获取sql
    let sql_name = $sql.message.insertMessage

    // 组织数据
    let data = [
        params.contact, params.contact_id, params.message, params.type
    ]

    // 保存
    await query(sql_name, data)
    //log.debug("list:", list)
    //return result
}


module.exports = {
    insertMessage
}