/*
 * 心跳表，用来保存当前wechaty服务状态
 */

const query  = require('../api');
const $sql   = require('../sqlfun');   //sql语句
const log    = require('../../libraries/logger')()


// 插入或更新心跳信息
async function insertOrUpdateHeartbeat (params) {
    if (!params || typeof params != "object") return false

    let sql_name = $sql.heartbeat.insertOrUpdateHeartbeat
    let data = [
        params.id, params.bot_id, params.data, params.beat_time
    ]

    let result = await query(sql_name, data)
    //log.debug("list:", list)

    return result
}


module.exports = {
    insertOrUpdateHeartbeat
}