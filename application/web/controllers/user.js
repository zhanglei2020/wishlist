const ShareListModel = require('../../models/controller/share_list')
const log            = require('../../libraries/logger')()
const Wechat         = require('../../api/wechat/wechat')
//const Url       = require("url")
//const config    = require('../../config/main')
//const api= require('../api')
//const {hex_md5}      = require('../../libraries/md5')

// 自动登录
async function autoLoginBySession(req) {
    try {
        // 已经登录直接返回
        //if (req.session.user && req.session.user.user_id) return

        // sessionId 不存在抛出异常
        if (!req.sessionID) throw ("NullSessionId")
    
        // 根据session_id 查询用户信息
        let result = await ShareListModel.getMember({SessionId: req.sessionID})

        // 用户存在，设置sessiion
        if (result.code == 0 && result.data.length > 0) {
            setUserSession(req, result.data[0])
        } else {
            params = req.query
            //校验参数
            if (!params.user_id || !params.key) throw ("ErrorParams")
        
            // 以分享的用户身份做为当前用户自动登录
            result = await ShareListModel.getMember({UserId : params.user_id})
            if (result.code != 0 || result.data.length == 0) throw ("NullMember")
    
            // session_id保存到数据库
            if (result.data[0].session_id) throw ("SessionIdAlreadyExists")
    
            await ShareListModel.updateMemberSessionId(result.data[0].id, {SessionId: req.sessionID})
            setUserSession(req, result.data[0])
        }
    } catch(e) {
      log.error(e)
      //setUserSession(req)
    }  
}

// 检查当前请求是否微信
function checkIsWechat(req) {
    log.debug(req.headers['user-agent'])
    return /MicroMessenger/i.test(req.headers['user-agent'])
}

// 自动登录
async function autoLogin(req, res) {
    try {
        // 已经登录直接返回
        if (req.session.user && req.session.user.user_id) return

        // 检查是否微信访问，如果不是则使用sessionid登录
        if (!checkIsWechat(req)) {
            autoLoginBySession(req)
            return
        }

        // 检查uri参数是否包含openid和id_t
        //let open_id = ""

        // 检查session中是否有openid，若没有
        if (!req.session.user || !req.session.user.open_id) {
            // 检查get参数中有没有openid，且生成时间在30秒内，如果有把openid记录到session中
            // 然后重定向，去掉地址中的openid及id_t参数
            if (req.query.openid && req.query.openid != "retry" && req.query.id_t && (Math.round(new Date().getTime()/1000)) - req.query.id_t < 30) {
                //let cur_url = Wechat.getCurrentUrl(req)
                //let redirect_url = Wechat.filterUrl(Wechat.getCurrentUrl(req))
                //if (!redirect_url) throw ("未生成不含openid的地址！")
                // res.redirect(redirect_url)
                // setUserSession(req, {open_id: req.query.openid})
                // return "REDIRECT"
            // 否则重新申请微信授权地址
            } else {
                let auth_url = await Wechat.getAuthUrl(req)
                if (!auth_url) throw ("未获取到微信授权地址！")
                res.redirect(auth_url)
                return "REDIRECT"
            }
        }

        // 获取openid
        let open_id = req.query.openid

        // if (req.query.openid) open_id = req.query.openid
        // else if (req.session.user && req.session.user.open_id) open_id = req.session.user.open_id
        // else {
        //     open_id = await Wechat.getOpenid(req, res)
        //     if (!open_id) throw ("获取openId发生错误")
        //     else if (open_id && open_id == "REDIRECT") return "REDIRECT"         
        // }

        // 根据openid查询用户表
        let result = await ShareListModel.getMember({OpenId: open_id})
        //log.info(result)

        // 如果用户存在，则赋值session并退出
        if (result.code == 0 && result.data.length != 0) {
            setUserSession(req, result.data[0])
            return
        }

        // 根据openid查询nickname
        let response = await Wechat.getUserInfo(open_id)

        // 如果不存在抛出异常
        if (!response || !response.nickname) throw ("通过openid未找到用户昵称")

        // 根据nicknam查询用户表
        result = await ShareListModel.getMember({WechatName : response.nickname})
        log.info(result)

        // 如果用户不存在，则赋值session并退出
        if (result.code != 0 || result.data.length == 0) throw ("通过昵称未找到用户信息")

        // 设置session
        result.data[0].open_id = open_id
        setUserSession(req, result.data[0])

        // 更新openid
        await ShareListModel.updateMember(result.data[0].id, {OpenId: open_id})
        
    } catch(e) {
      log.error(e)
      //setUserSession(req)
    }  
}

// 设置用户session
function setUserSession(req, data) {
    if (!req || !req.session || !data) return
    // log.info("data", data)

    if (data.id) data.user_id = data.id

    // 设置允许的属性
    let allow_list = [
        "user_id",
        "user_key",
        "open_id",
        "wechat_id",
        "wechat_name",
        "wecaht_avatar"
    ]

    // 如果属性名不在列表中，则删除该属性
    for (const key in data) {
        if (allow_list.indexOf(key) < 0)
            delete data[key]        
    }

    if (req.session.user) {
        Object.assign(req.session.user, data)
        // if(data.id)            req.session.user.user_id = data.id
        // if(data.wechat_id)     req.session.user.wechat_id = data.wechat_id
        // if(data.wechat_name)   req.session.user.wechat_name = data.wechat_name
        // if(data.wecaht_avatar) req.session.user.wecaht_avatar = data.wecaht_avatar
        // if(data.user_key)      req.session.user.user_key = data.user_key
        // if(data.open_id)       req.session.user.open_id = data.open_id
    } else {
        req.session.user = data
        // req.session.user = {
        //     user_id       : data.id || '',
        //     wechat_id     : data.wechat_id || '',
        //     wechat_name   : data.wechat_name || '',
        //     wecaht_avatar : data.wechat_avatar || '',
        //     user_key      : data.user_key || '',
        //     open_id       : data.open_id || ''
        // }
    }
    log.debug("设置完成后的session：", req.session.user)
}

let user = {
    autoLogin,
    setUserSession
}

module.exports = user