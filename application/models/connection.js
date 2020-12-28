const db_config = require('../config/db')   //数据库链接信息
const mysql     = require('mysql')
const log       = require('../libraries/logger')()


// 连接数据库
let setting = db_config.database
const pool = mysql.createPool({
  host     : setting.HOST,
  user     : setting.USERNAME,
  password : setting.PASSWORD,
  database : setting.DATABASE,
  port     : setting.PORT
})


/**
 * 通用方法
 * @param sql
 * @param options
 * @param callback
 */
var query = (sql, options=null) => {
    if (!sql) return false
    
    return new Promise ((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error){
                //callback(error, null, null);
                //reject(error)
                log.error(error)
                resolve({code: 2, message: '数据库连接失败！'})
                return
            }

            //log.info('SQL参数：', options)
            log.info('SQL语句：', sql);
            connection.query(sql, options, (error, results, fields) => {
                //释放连接
                connection.release();
                let response = {}

                // 确定返回结果
                if (error) {
                    log.error("SQL执行错误：", error)
                    response = {code: 1, message: 'SQL执行失败！'}
                    //resolve(res)
                    //return
                    //reject(error)
                } else if (!results || typeof results === 'undefined') {
                    response = {code: 1, message: 'SQL未获取到执行结果！'}
                } else {
                    response = {code: 0, data: results}
                }
                //log.info("----------------") 

                //事件驱动回调
                //callback(error, res, fields);
                resolve(response)
            })
        })
    })
}


module.exports = {
    default: {query}
}

