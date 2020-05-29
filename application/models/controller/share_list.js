/*
 * 分享列表
 */
const query  = require('../api')
const $sql   = require('../sqlfun')   //sql语句
const log    = require('../../libraries/logger')()

module.exports = {

    //新增分享链接记录
    async insertShareList (params) {
        if (!params) return false

        var sql1 = $sql.wishList.insertShareList
        var sql2 = $sql.wishList.insertMember
        var sql3 = $sql.wishList.insertMemberList
        var shareList, member, shareListId, memberId
        //var params = req.query
        //log.debug('params::', params)

        //组织数据参数
        let memerData = [
            params.wechatId,
            params.wechatName || '',
            params.wechatAvatar || '',
            params.userKey || ''
        ]

        let shareListData = [
            params.title || '',
            params.description || '',
            params.shareUrl || '',
            params.promotionUrl || '',
            params.productId || '',
            params.price || 0,
            params.image || ''
        ]

        //查询分享链接是否存在
        let response = await query($sql.wishList.getListByProductId, [params.productId])
        if (response.code == 0 && response.data.length > 0) {
            shareList = response.data[0]
            shareListId = shareList.id
        }
        
        //log.debug("slist:", shareList)
        //log.debug("params:", params)
        //当数据变化时更新商品数据
        if (!shareList || (shareList && (shareList.title != params.title || shareList.img_url != params.image || shareList.desc != params.description || shareList.promotion_url != params.promotionUrl || shareList.price != parseFloat(params.price)))) {
            let result = await query(sql1, shareListData)
            //log.debug("insert sharelist result:", result)

            if (result.code != 0) throw "心愿列表新增不成功！"
            else if (result.code == 0 && !shareListId) shareListId = result.data.insertId            
        }
        //log.debug(shareListId)

        //查询会员是否存在
        response = await query($sql.wishList.getMemberByWechatId, [params.wechatId])
        if (response.code == 0 && response.data.length > 0) {
            member = response.data[0]
            memberId = member.id
        }
        //log.debug("member:", member)

        //当数据变化时更新会员数据
        if (!member || (member && (member.wechat_name != params.wechatName || member.wechat_avatar != params.wechatAvatar || member.user_key != params.userKey))) {
            let result = await query(sql2, memerData)
            if (result.code != 0) throw "会员新增不成功！"
            else if (result.code == 0 && !memberId) memberId = result.data.insertId            
        }
        //log.debug(memberId)

        //保存关联关系
        response = await query(sql3, [memberId, shareListId])
        //response.member_id = memberId, response.shareList_id = shareListId
        response.member_id = memberId
        //log.debug("union:", response)

        return response
    },

    // 更新
    async updateShareList(id, params) {
        if (!id || !params || typeof params != "object") return false

        let sql_name = $sql.wishList.updateShareListById
        let data = [
            //params.title || '',
            //params.desc || 0,
            params.price || 0,
            params.img_url || '',
            params.promotion_url || '',
            id
        ]        

        let result = await query(sql_name, data)
        //log.debug("list:", list)

        return result
    },

    // 更新会员
    async updateMember(id, params) {
        if (!id || !params || typeof params != "object") return false

        let sql_name = "", data = []
        for (const key in params) {
            sql_name = $sql.wishList["updateMember" + key]
            data = [params[key], id]
            break
        }

        let result = await query(sql_name, data)
        //log.debug("list:", list)

        return result
    },

    //获取当前用户所有的分享链接列表
    async getShareListById(params) {
        var sql = $sql.wishList.getShareListById
        var data = [params.id]
        //log.debug("查询分享列表。。。", sql)        
        //log.debug(data)

        //查询
        let list = await query(sql, data)

        return list
    },

    //获取当前用户所有的分享链接列表
    async getLinkByUser(params) {
        var sql = $sql.wishList.getShareListByUser
        var data = [params.user_id]
        //log.debug("查询分享列表。。。", sql)        
        //log.debug(data)

        //查询
        let list = await query(sql, data)

        return list
    },

    //获取当前用户
    async getMemberByUserId(params) {
        var sql = $sql.wishList.getMemberById
        var data = [params.user_id]
        //log.debug(sql)
        //log.debug(data)

        //查询
        let list = await query(sql, data)

        return list
    },

    //获取当前用户
    async getMemberByUserKey(params) {
        var sql = $sql.wishList.getMemberByUserKey
        var data = [params.key]
        //log.debug(sql)
        //log.debug(data)

        //查询
        let list = await query(sql, data)

        return list
    },

    //获取当前用户
    async getMemberBySessionId(params) {
        var sql = $sql.wishList.getMemberBySessionId
        var data = [params.session_id]
        //log.debug(sql)
        //log.debug(data)

        //查询
        let list = await query(sql, data)

        return list
    },

     //获取当前用户
     async getMember(params) {
        if (!params || typeof params != "object") return false

        let sql_name = "", data = []
        for (const key in params) {
            sql_name = $sql.wishList["getMemberBy" + key]
            data.push(params[key])
        }
        //log.debug(sql)
        //log.debug(data)

        //查询
        let list = await query(sql_name, data)

        return list
    },

    //删除分享列表
    async deleteShareList(id, user_id) {
        var sql = $sql.wishList.deleteShareList
        var data = [id, user_id]
        //log.debug(sql)
        //log.debug(data)

        //查询
        var result = await query(sql, data)

        return result
    },

}
