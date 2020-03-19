const ShareListModel = require('../../model/controller/share_list')
const {hex_md5} = require('../library/md5')
const {log}     = require('brolog')

async function autoLogin(req) {
    try {
        // 已经登录直接返回
        //if (req.session.user && req.session.user.user_id) return

        // sessionId 不存在抛出异常
        if (!req.sessionID) throw ("NullSessionId")
    
        // 根据session_id 查询用户信息
        let result = await ShareListModel.getMemberBySessionId({session_id: req.sessionID})

        // 用户存在，设置sessiion
        if (result.code == 0 && result.data.length > 0) {
            setUserSession(req, result.data[0])
        } else {
            params = req.query
            //校验参数
            if (!params.user_id || !params.key) throw ("ErrorParams")
        
            // 以分享的用户身份做为当前用户自动登录
            result = await ShareListModel.getMemberByUserId(params)
            if (result.code != 0 || result.data.length == 0) throw ("NullMember")
    
            // session_id保存到数据库
            if (result.data[0].session_id) throw ("SessionIdAlreadyExists")
    
            await ShareListModel.updateMember(result.data[0].id, {session_id: req.sessionID})
            setUserSession(req, result.data[0])
        }
    } catch(e) {
      log.error(e)
      setUserSession(req, {})
    }  
}
  
function setUserSession(req, data) {
    req.session.user = {
        user_id       : data.id || '',
        wechat_id     : data.wechat_id || '',
        wechat_name   : data.wechat_name || '',
        wecaht_avatar : data.wechat_avatar || '',
        user_key      : data.id ? hex_md5(data.id + data.wechat_id) : '',
    }
}

let user = {
    autoLogin,
    setUserSession
}

module.exports = user