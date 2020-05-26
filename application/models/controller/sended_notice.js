/*
 * 已发送通知表，用来保存当前已经发出的通知提醒消息
 */

const query  = require('../api');
const $sql   = require('../sqlfun');   //sql语句
const log    = require('../../libraries/logger')()


// 插入已发送通知
async function insertSendedNotice (params) {
    if (!params || typeof params != "object") return false

    // 获取sql
    let sql_name = $sql.notice.insertSendedNotice

    // 组织数据
    let data = [
        params.event || '', 
        params.msg_type || '', 
        params.receivers || '', 
        params.content || '', 
        Math.round(new Date().getTime() / 1000)
    ]
    log.info(data)

    // 保存
    await query(sql_name, data)
    //log.debug("list:", list)
    //return result
}


// 查询最近的通知
async function getSendedNotice (params) {
    if (!params || typeof params != "object") return false

    // 获取sql
    let sql_name = $sql.notice.getLastSendedNotice

    // 组织数据
    let data = [
        params.event || '', 
        params.msg_type || ''
    ]
    log.info(data)

    // 保存
    let list = await query(sql_name, data)
    //log.debug("list:", list)
    return list
}


module.exports = {
    insertSendedNotice,
    getSendedNotice
}