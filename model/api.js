const models = require('./db');//数据库链接信息
const DB_MYSQL = require('mysql');
const {log}     = require('brolog')

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
  return new Promise ((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error){
        //callback(error, null, null);
        reject(error)
      } else {
        log.info('SQL参数：', options)
        var query = connection.query(sql, options, (error, results, fields) => {
          if (error) {
            log.error(error)
            reject(error)
          } 
  
          if(typeof results === 'undefined') {
            var res = {code: 1, message: '数据库读取数据失败'}
          }else{
            var res = {code: 0, data: results}
          }
          //console.log(res)
  
          //释放连接
          connection.release();

          //事件驱动回调
          //callback(error, res, fields);
          resolve(res)

        })  
        log.info('SQL语句：', query.sql);
      }
    })
  })
  
};


module.exports= query;

