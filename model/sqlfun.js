// sql语句
var sqlMap = {
  wishList: {
    insertMember     : "INSERT INTO t_member (`wechat_id`, `wechat_name`, `wechat_avatar`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE wechat_name=VALUES(wechat_name),wechat_avatar=VALUES(wechat_avatar)",
    insertShareList  : "INSERT INTO t_share_list ( `title`, `desc`, `url`, `promotion_url`, `product_id`, price, img_url) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `desc`=VALUES(`desc`), price=VALUES(price), title=VALUES(title), img_url=VALUES(img_url), promotion_url=VALUES(promotion_url)",
    insertMemberList : "INSERT INTO t_member_share_list (`member_id`, `share_list_id`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `member_id`=`member_id`",
    updateMember     : "UPDATE t_member t SET t.session_id = ? where id = ?",
    getMemberById    : "SELECT * FROM  t_member WHERE id = ?",
    getMemberByWechatId   : "SELECT * FROM  t_member WHERE wechat_id = ?",
    getMemberBySessionId  : "SELECT * FROM  t_member WHERE session_id = ?",
    getListById           : "SELECT * FROM  t_share_list WHERE id = ?",
    getListByProductId    : "SELECT * FROM  t_share_list WHERE product_id = ?",
    getShareListByUser    : "SELECT * FROM  v_share_list WHERE member_id = ?",
    deleteShareList : "DELETE from t_member_share_list where id = ? and member_id = ?"
    
  },

}

module.exports = sqlMap;

