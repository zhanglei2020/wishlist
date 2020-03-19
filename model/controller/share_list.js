/*
 * 分享列表
 */
const query  = require('../api');
const $sql   = require('../sqlfun');//sql语句
const {log}  = require('brolog')

module.exports = {

    //新增分享链接记录
    async insertShareList (params) {
        if (!params) return false;

        var sql1 = $sql.wishList.insertShareList
        var sql2 = $sql.wishList.insertMember
        var sql3 = $sql.wishList.insertMemberList
        var shareList, member, shareListId, memberId
        //var params = req.query;
        //console.log('params::', params)

        //组织数据参数
        let memerData = [
            params.wechatId,
            params.wechatName || '',
            params.wechatAvatar || '',
        ]

        let shareListData = [
            params.title || '',
            params.description || '',
            params.shareUrl || '',
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
        
        //console.log("slist:", shareList)
        //console.log("params:", params)
        //当数据变化时更新商品数据
        if (!shareList || (shareList && (shareList.title != params.title || shareList.img_url != params.image || shareList.desc != params.description || shareList.price != parseFloat(params.price)))) {
            let result = await query(sql1, shareListData)
            //console.log("insert sharelist result:", result)
            if (result.code != 0) throw "心愿列表新增不成功！"
            else if (result.code == 0 && !shareListId) shareListId = result.data.insertId
            
        }
        //console.log(shareListId)

        //查询会员是否存在
        response = await query($sql.wishList.getMemberByWechatId, [params.wechatId])
        if (response.code == 0 && response.data.length > 0) {
            member = response.data[0]
            memberId = member.id
        }

        //console.log("member:", member)
        //当数据变化时更新会员数据
        if (!member || (member && (member.wechat_name != params.wechatName || member.wechat_avatar != params.wechatAvatar))) {
            let result = await query(sql2, memerData)
            if (result.code != 0) throw "会员新增不成功！"
            else if (result.code == 0 && !memberId) memberId = result.data.insertId            
        }
        //console.log(memberId)

        //保存关联关系
        response = await query(sql3, [memberId, shareListId])
        //response.member_id = memberId, response.shareList_id = shareListId
        response.member_id = memberId
        //console.log("union:", response)
        return response
    },

    // 更新会员
    async updateMember(id, params) {
        if (!id || !params || !params.session_id) return false
        var sql = $sql.wishList.updateMember
        var data = [params.session_id, id]

        let result = await query(sql, data);
        //console.log("list:", list)

        return result;        
    },

    //获取当前用户所有的分享链接列表
    async getLinkByUser(params) {
        var sql = $sql.wishList.getShareListByUser
        var data = [params.user_id]

        //console.log(sql)
        //console.log(data)
        let list = await query(sql, data);

        return list;        
    },

    //获取当前用户
    async getMemberByUserId(params) {
        var sql = $sql.wishList.getMemberById
        var data = [params.user_id]

        //console.log(sql)
        //console.log(data)
        let list = await query(sql, data);

        return list;        
    },

    //获取当前用户
    async getMemberBySessionId(params) {
        var sql = $sql.wishList.getMemberBySessionId
        var data = [params.session_id]

        //console.log(sql)
        //console.log(data)
        let list = await query(sql, data);

        return list;
    },

    //删除分享列表
    async deleteShareList(id, user_id) {
        var sql = $sql.wishList.deleteShareList
        var data = [id, user_id]

        //console.log(sql)
        //console.log(data)
        var result = await query(sql, data);

        return result;        
    },

};
