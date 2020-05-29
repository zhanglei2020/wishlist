// sql语句
var sqlMap = {
  wishList: {
    insertMember     : "INSERT INTO t_member (`wechat_id`, `wechat_name`, `wechat_avatar`, `user_key`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE wechat_name=VALUES(wechat_name), wechat_avatar=VALUES(wechat_avatar), user_key=VALUES(user_key)",
    insertShareList  : "INSERT INTO t_share_list ( `title`, `desc`, `url`, `promotion_url`, `product_id`, price, img_url) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `desc`=VALUES(`desc`), price=VALUES(price), title=VALUES(title), img_url=VALUES(img_url), promotion_url=VALUES(promotion_url)",
    insertMemberList : "INSERT INTO t_member_share_list (`member_id`, `share_list_id`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `member_id`=`member_id`",
    updateShareListById   : "UPDATE t_share_list t SET t.price = ?, t.img_url = ?, t.promotion_url = ? where id = ?",
    updateMemberSessionId : "UPDATE t_member t SET t.session_id = ? where id = ?",
    updateMemberOpenId    : "UPDATE t_member t SET t.open_id = ? where id = ?",
    getMemberById    : "SELECT * FROM  t_member WHERE id = ?",
    getMemberByUserKey    : "SELECT * FROM  t_member WHERE user_key = ?",
    getMemberByWechatId   : "SELECT * FROM  t_member WHERE wechat_id = ?",
    getMemberBySessionId  : "SELECT * FROM  t_member WHERE session_id = ?",
    getMemberByOpenId     : "SELECT * FROM  t_member WHERE open_id = ?",
    getMemberByWechatName : "SELECT * FROM  t_member WHERE wechat_name = ?",
    getShareListById      : "SELECT t.*, unix_timestamp(t.modified_time) as updated_time FROM  t_share_list t WHERE t.id = ?",
    getListByProductId    : "SELECT * FROM  t_share_list WHERE product_id = ?",
    getShareListByUser    : "SELECT * FROM  v_share_list WHERE member_id = ? ORDER BY IF(price>0,1,price) DESC,id ASC",
    deleteShareList : "DELETE from t_member_share_list where id = ? and member_id = ?"
    
  },
  heartbeat: {
    insertOrUpdateHeartbeat : "INSERT INTO t_heartbeat (id, bot_id, data, beat_time) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE bot_id=VALUES(bot_id), data=VALUES(data), beat_time=VALUES(beat_time)",
    getHeartbeatById: "SELECT * FROM t_heartbeat WHERE id = ?"
  },
  message: {
    insertMessage: "INSERT INTO t_received_message (contact, contact_id, message, type) VALUES (?,?,?,?)"
  },
  notice: {
    insertSendedNotice : "INSERT INTO t_sended_notice (event, msg_type, receivers, content, send_time) VALUES (?,?,?,?,?) ",
    getLastSendedNotice: "SELECT * FROM t_sended_notice WHERE event=? AND msg_type=? ORDER BY id DESC limit 1"
  }
}

module.exports = sqlMap;

