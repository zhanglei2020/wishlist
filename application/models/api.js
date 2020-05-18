const models   = require('../config/db');//数据库链接信息
const DB_MYSQL = require('mysql');
const log      = require('../libraries/logger')()

// 连接数据库
const pool = DB_MYSQL.createPool({
  host: models.database.HOST,
  user: models.database.USERNAME,
  password: models.database.PASSWORD,
  database: models.database.DATABASE,
  port: models.database.PORT
});


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
        return
      }

      log.info('SQL参数：', options)
      var query = connection.query(sql, options, (error, results, fields) => {
        //释放连接
        connection.release();

        if (error) {
          log.error(error)
          return
          //reject(error)
        }        

        if(!results || typeof results === 'undefined')
          var res = {code: 1, message: '数据库读取数据失败'}
        else
          var res = {code: 0, data: results}        
        //log.info(res)        

        //事件驱动回调
        //callback(error, res, fields);
        resolve(res)
      })
      log.info('SQL语句：', query.sql);
      
    })
  })
  
}


module.exports= query

