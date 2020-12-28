const connection = require('./connection')
const log        = require('../libraries/logger')()
const database   = connection.default


// 临时保存sql各个部分
var objSql = {
    select : '',
    where  : '',
    from   : '',
    join   : '',
    orderBy: '',
    groupBy: '',
    limit  : '',
    insert : '',
    update : '',
    remove : ''
}


/**
 * 校验字段是否符合要求
 * @param {object} data 需要检查的字段对象
 * @param {object} template 要符合的字段要求模板
 * @param {boolean} isRequired 是否检查必填项，默认false-不检查
 * @return {boolean} true-通过，false-未通过
 */
function validate(data, template, isRequired) {
    try {
        if (!data || !template) throw ("字段校验时传入的参数不能为空！")
        if (typeof data !== 'object' || typeof template !== 'object') throw ("字段校验时输入的参数不是对象！")
        isRequired = (isRequired) ? true : false

        // 循环待检测的值
        for (const key in data) {
            if (!template.hasOwnProperty(key)) throw ("字段["+ key+ "]名称不正确或该字段不在模板列表中！")
            if (data[key].toString().length > template[key].length) throw ("字段["+ key+ "]长度为("+ data[key].toString().length+ ")，超出限制("+ template[key].length+ ")！")
        }

        // 循环模板
        if (isRequired) {
            for (const key2 in template) {
                if (template[key2].required && !data.hasOwnProperty(key2)) throw ("字段["+ key2+ "]要求必填，但参数中未找到！") 
            }           
        }

        // 返回检查通过
        return true
    } catch (e) {
        log.error(e)
        return false
    }
}


/**
 * 拼接where条件
 * @param {object} conditions where条件，条件之间默认以AND相连
 * @param {boolean} escape 是否转义
 * @param 返回当前对象
 */
function where (conditions, escape) {
    if (!conditions || typeof conditions != "object") return this
    escape = (escape == undefined)? true: !!escape

    let prefix = " WHERE ", sql = ""
    for (const key in conditions) {
        //去除2边空格
        let _key = key.trim()
        //获取字段ming
        if (escape) {
            let result = _key.match(/([a-zA-Z0-9_\-]+)[ <>=!]?/)
            //old_column = result[1]
            //new_column = '`'+ result[1]+ '`'
            _key = _key.replace(result[1], '`'+ result[1]+ '`')
        }        
        //console.log(_key)
        sql += (sql? " AND ": "") + _key + (_key.search(/(=|>|<|like)/i) < 0? " = " : " ") + "'" + conditions[key] + "'"
    }
    objSql.where = prefix + sql
    //console.log(objSql.where)

    return this
}


/**
 * 手工编写where子句
 * @param {string} custom_sql 手工编写的Where子句
 */
function where_free (custom_sql) {
    if (!custom_sql || typeof columns != "string") return false
    objSql.where = ' WHERE ' + custom_sql

    return this
}


/**
 * 手工编写where子句
 * @param {string} column 字段名
 * @param {array}  values 字段取值
 * @param {boolean} and_or 连接符：true-AND, false-OR
 * @param {boolean} in_not IN/NOT IN
 * @param {boolean} escape 是否转义
 */
function where_in_sql (column, values, and_or, in_not, escape) {
    if (!column || !values) return false
    if (values && values.constructor !== Array) return false
    escape = (escape == undefined)? true: !!escape

    let where = (escape?'`':'')+ column + (escape?'`':'')+ (in_not? '': ' NOT')+ ' IN ('+ values.join(",")+ ')'
    if (objSql.where) objSql.where += (and_or? ' AND ': ' OR ')+ where
    else objSql.where = ' WHERE '+ where

    return true
}


/**
 * 查询当前字段在某几个给定值之内
 * @param {string} column 字段名
 * @param {array} values 字段取值
 * @param {boolean} escape 是否转义
 */
function where_in (column, values, escape) {
    //if (!column || !values) return false
    //if (values && values.constructor !== Array) return false
    where_in_sql(column, values, true, true, escape)
    return this
}


/**
 * 查询当前字段不在某几个给定值之内
 * @param {string} column 字段名
 * @param {array} values 字段取值
 * @param {boolean} escape 是否转义
 */
function where_not_in (column, values, escape) {
    where_in_sql(column, values, true, false, escape)
    return this
}


/** 
 * 查询当前字段在某几个给定值之内，用OR连接
 * @param {string} column 字段名
 * @param {array} values 字段取值
 * @param {boolean} escape 是否转义
 */
function or_where_in (column, values, escape) {
    where_in_sql(column, values, false, true, escape)
    return this
}


/** 
 * 查询当前字段不在某几个给定值之内，用OR连接
 * @param {string} column 字段名
 * @param {array} values 字段取值
 * @param {boolean} escape 是否转义
 */
function or_where_not_in (column, values, escape) {
    where_in_sql(column, values, false, false, escape)
    return this
}


/** 
 * 拼接select字段
 * @param {string} columns 字段名
 * @param {boolean} escape 是否转义
 */
function select (columns, escape) {
    if (columns && typeof columns != "string") return this
    columns = columns || '*'
    escape = (escape == undefined)? true: !!escape 
    //console.log(columns)
    //console.log(objSql)
    if (escape) {
        let _columns = columns.split(',')
        //_columns = _columns.trim()
        _columns.forEach((element, index) => {
            console.log(element)
            if (element != '*') _columns[index] = '`' + element.trim() + '`'            
        })
        console.log(_columns)
        columns = _columns.join(',')
    }

    objSql.select = 'SELECT '+ columns
    console.log(columns)

    return this
}


/** 
 * 拼接order by排序
 * @param {string} order 排序列
 * @param {boolean} escape 是否转义
 */
function orderBy (order, escape) {
    if (!order || typeof order != "string") return this
    escape = (escape == undefined)? true: !!escape

    objSql.orderBy = ' ORDER BY '+ (escape?'`':'')+ order+ (escape?'`':'')
    console.log(objSql.orderBy)

    return this

}


/** 
 * 拼接group by分组
 * @param {string} group 分组列
 * @param {boolean} escape 是否转义
 */
function groupBy (group, escape) {
    if (!group || typeof group != "string") return this
    escape = (escape == undefined)? true: !!escape 

    objSql.groupBy = ' GROUP BY '+ (escape?'`':'')+ group + (escape?'`':'')
    console.log(objSql.groupBy)

    return this
}


/** 
 * 拼接from表
 * @param {string} table 表名
 * @param {boolean} escape 是否转义
 */
function from (table, escape) {
    if (!table || typeof table != "string") return this
    escape = (escape == undefined)? true: !!escape 

    if (escape) {
        table = '`' + table + '`'
    }
    objSql.from = ' FROM ' + table
    console.log(objSql.from)

    return this
}


/** 
 * 拼接limit
 * @param {number} limit 最大行数
 * @param {number} offset 偏移量
 */
function limit (limit, offset) {
    if (!limit && !offset) return this
    limit = limit || 0
    offset = offset || 0
    objSql.limit = ' LIMIT ' + offset + ', ' + limit
    console.log(objSql.limit)

    return this
}


/** 
 * 清除sql对象中的数据
 */
function clear () {
    for (const key in objSql) {
        objSql[key] = ''
    }
}


/** 
 * 获取查询结果
 * @param {string} table 表名
 */
async function get (table) {
    if (table) from(table)
    //console.log(objSql)

    let sql = objSql.select+ objSql.from+ objSql.where+ objSql.groupBy+ objSql.orderBy+ objSql.limit
    clear()
    //log.info(sql)

    let result = await database.query(sql)
    //log.info(result)

    return result
}


/** 
 * 执行自定义的sql
 * @param {string} sql_str 自定义sql字符串
 */
async function query (sql_str) {
    if (!sql_str) return false

    let result = await database.query(sql_str)
    //log.info(result)

    return result
}


/**
 * 拼接往表中插入数据的sql
 * @param {string} table 表名
 * @param {object} data 待插入的数据对象
 * @param {boolean} escape 是否转义
 * @return {string|boolean} 成功返回sql字符串，错误返回false
 */
function insert_sql (table, data, escape) {
    if (!table || !data || typeof data != "object") return false
    escape = (escape == undefined)? true: !!escape

    let insert = values = ''
    for (const key in data) {        
        insert += (!insert ? "" : ", ") + (escape?'`':'') + key + (escape?'`':'')
        values += (!values ? "" : ", ") + '\'' + data[key] + '\''
    }
    insert = ' (' + insert + ')'
    values = ' VALUES (' + values + ')'
    table = (escape?'`':'') + table + (escape?'`':'')
    let sql = 'INSERT INTO ' + table + insert + values
    //log.info(sql)

    return sql
}


/** 
 * 拼接插入或更新数据的sql
 * @method insert_update_sql
 * @param {string} table 数据库表名
 * @param {object} data 要插入的数据
 * @param {array} primary 主键名称
 * @param {boolean} escape 是否转义
 * @return {string|boolean} 成功返回sql字符串，错误返回false 
 */
function insert_update_sql (table, data, primary, escape) {
    if (!table || !data || typeof data != "object") return false
    //console.log(primary.constructor)
    if (primary && primary.constructor !== Array) return false
    // 判断是否数组：Array.isArray(primary); Array.prototype.isPrototypeOf(primary); Object.getPrototypeOf(primary) === Array.prototype
    escape = (escape == undefined)? true: !!escape

    // 获取insert部分的sql
    let insert = insert_sql(table, data, escape)

    // 拼写update部分的sql
    let update = ''
    for (const key in data) {
        // 排除主键
        if (primary.indexOf(key) < 0)
            update += (!update ? "" : ", ") + (escape?'`':'') + key + (escape?'`':'') + '= VALUES(' + (escape?'`':'') + key + (escape?'`':'') + ')'
    }
    update = ' ON DUPLICATE KEY UPDATE ' + update

    // 连接2部分sql
    let sql = insert + update
    //console.log(sql)

    // 返回
    return sql
}


/**
 * 往表中插入数据
 * @param {string} table 表名
 * @param {object} data 待插入的数据对象
 * @param {boolean} escape 是否转义
 */
async function insert (table, data, escape) {
    if (!table || !data || typeof data != "object") return false
    escape = (escape == undefined)? true: !!escape

    let sql = insert_sql(table, data, escape)
    clear()
    //log.info(sql)

    let result = await database.query(sql)
    //log.info(result)

    return result
}


/**
 * 往表中插入或更新数据
 * @param {string} table 表名
 * @param {object} data 待插入的数据对象
 * @param {array} primary 主键名称
 * @param {boolean} escape 是否转义
 */
async function insert_update (table, data, primary, escape) {
    if (!table || !data || typeof data != "object") return false
    escape = (escape == undefined)? true: !!escape

    let sql = insert_update_sql(table, data, primary, escape)
    clear()
    //log.info(sql)

    let result = await database.query(sql)
    log.info("SQL执行结果：", result)

    return result
}


/**
 * 更新表中数据
 * @param {string} table 表名
 * @param {object} id 指定待更新的主键名称和值 如{id: 100}
 * @param {object} data 待插入的数据对象
 * @param {boolean} escape 是否转义
 */
async function update (table, id, data, escape) {
    if (!table || !data || !id || typeof data != "object" || typeof id != "object") return false
    escape = (escape == undefined)? true: !!escape

    return update_batch(table, id, data, escape)
}


/**
 * 批量或按条件更新记录
 * @param {string} table 表名
 * @param {object} conditions 更新时的where条件
 * @param {object} data 待插入的数据对象
 * @param {boolean} escape 是否转义
 */
async function update_batch (table, conditions, data, escape) {
    if (!table || !data || typeof data != "object") return false
    if (conditions && typeof conditions != 'object') return false
    escape = (escape == undefined)? true: !!escape

    let sql = column = ''
    for (const key in data) {        
        column += (!column ? "" : ", ") + (escape?'`':'') + key + (escape?'`':'') + ' = "' + data[key] + '"'
    }

    // 拼写where条件
    if (conditions) where(conditions, escape)

    sql = 'UPDATE ' + (escape?'`':'') + table + (escape?'`':'') + ' SET ' + column + objSql.where
    clear()

    let result = await database.query(sql)
    //log.info(result)

    return result
}


/**
 * 批量或按条件删除记录
 * @param {string} table 表名
 * @param {object} conditions 更新时的where条件
 * @param {boolean} escape 是否转义
 */
async function remove (table, conditions, escape) {
    if (conditions && typeof conditions != 'object')
    escape = (escape == undefined)? true: !!escape

    // 拼写from
    if (table) from(table, escape)

    // 拼写where
    if (conditions) where(conditions, escape)

    sql = 'DELETE ' + objSql.from + objSql.where
    clear()

    let result = await database.query(sql)
    //log.info(result)

    return result
}


const sql_func = {
    where, where_free, where_in, or_where_in, where_not_in, or_where_not_in, select, orderBy, groupBy, from, get, insert, update, update_batch, insert_update, remove, limit, query,
    validate
}


module.exports = sql_func