const sql    = require('./sql_builder')
const log    = require('../libraries/logger')()


/**
 * 校验字段是否符合要求
 * @param {object} data 需要检查的字段对象
 * @param {object} fields 要符合的字段要求模板
 * @param {boolean} isRequired 是否检查必填项，默认false-不检查
 * @throws {exception}
 */
function _validate (data, fields, isRequired) {
    //console.log(fields)
    if (!data) throw ("输入不能为空！")
    if (!sql.validate(data, fields, isRequired)) throw ("输入的值不符合要求，请修改！")
}


/**
 * 插入数据
 * @param {object} data 待插入的数据对象
 * @return {object|boolean}
 */
async function insertData (data) {
    try {
        //console.log(this.table)
        // 检查输入值，不校验必填
        _validate(data, this.fields, true)

        // 执行sql
        let result = await sql.insert(this.table, data)
        return result
        
    } catch (e) {
        log.error(e)
        return false
    }
}



/**
 * 更新数据
 * @param {number} item_id 待更新的数据id
 * @param {object} data 待更新的数据对象
 * @return {object|boolean}
 */
async function updateData (item_id, data) {
    try {
        // 检查输入值，不校验必填
        _validate(data, this.fields)

        // 执行sql
        let result = await sql.update(this.table, {id: item_id}, data)
        return result

    } catch (e) {
        log.error(e)
        return false
    }
}


/**
 * 插入或更新数据
 * @param {object} data 待插入的数据对象
 * @return {object|boolean}
 */
async function insertOrUpdateData (data) {
    try {
        // 检查输入值，不校验必填
        _validate(data, this.fields)

        // 执行sql
        let result = await sql.insert_update(this.table, data, ["wechat_id"])
        return result

    } catch (e) {
        log.error(e)
        return false
    }
}


/**
 * 删除数据
 * @param {number} item_id 待删除的数据id
 * @return {object|boolean}
 */
async function deleteData (item_id) {
    try {
        if (!item_id) throw ("输入不能为空！")

        // 检查输入值，不校验必填
        //_validate(data)

        // 执行sql
        let result = await sql.remove(this.table, {id: item_id})
        return result

    } catch (e) {
        log.error(e)
        return false
    }
}


/**
 * 批量删除数据
 * @param {object} where 查询条件
 * @return {object|boolean}
 */
async function deleteDataBatch (where) {
    try {
        if (!where) throw ("where条件不能为空！")

        // 检查输入值，不校验必填
        //_validate(data)

        // 执行sql
        let result = await sql.remove(this.table, where)
        return result

    } catch (e) {
        log.error(e)
        return false
    }
}


/**
 * 根据查询条件获取数据
 * @param {object} params 包括查询的字段、where条件、分组、排序、返回的记录数等
 * @return {object|boolean}
 */
async function getData (params) {
    try {
        //console.log(params)
        //if (!params) throw ("参数不能为空")
        params = params || {}
        //if (!item_id) throw ("输入不能为空！")
        // 检查输入值，不校验必填
        //_validate(data)
        let select = params.select || ''
        let where = params.where || ''
        let groupBy = params.groupBy || ''
        let orderBy = params.orderBy || ''
        let limit = params.limit || ''
        let offset = params.offset || ''

        // 执行sql
        sql.select(select).where(where).groupBy(groupBy).orderBy(orderBy, false).limit(limit, offset)
        let result = await sql.get(params.from || this.table)

        return result
    } catch (e) {
        log.error(e)
        return false
    }
}


/**
 * 创建公用的对象，包含了新增、修改、删除、查询等方法
 * @param {object} params 包括查询的字段、where条件、分组、排序、返回的记录数等
 * @return {object|boolean}
 */
function create(_table, _fields) {
    // 初始化table、field等参数
    this.table = _table
    this.fields = _fields
    
    // 定义公开的方法
    this.insertData = insertData
    this.deleteData = deleteData
    this.updateData = updateData
    this.getData    = getData
    this.insertOrUpdateData = insertOrUpdateData
    this.deleteDataBatch    = deleteDataBatch
}

module.exports = {
    create
}