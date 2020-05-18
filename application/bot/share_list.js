  const ShareListModel  = require('../models/controller/share_list')
  const WebConfig = require('../config/main')
  const {hex_md5} = require('../libraries/md5')
  const JDApi     = require('../api/jd/api.jd.com')
  const log       = require('../libraries/logger')()

  const {
    //Wechaty,
    //config,
    UrlLink,
    //Friendship
  }           = require('wechaty')

  var member = {} //会员

  // 持久化愿望列表
  async function save(contact, params) {
    try {
      var avatar = await contact.avatar()

      params.wechatId = contact.id || ''
      params.wechatName = contact.name() || ''
      params.wechatAvatar = avatar.remoteUrl || '' 
      params.promotionUrl = await JDApi.getPromotionUrl(params.shareUrl) || ''
      params.userKey = createUserKey(contact.id)
      //log.debug("保存之前的params", params)
  
      var insertResult = await ShareListModel.insertShareList(params)
      //log.debug("haha:", insertResult)
  
      // 保存当前用户的id及分享列表的id
      member.member_id = insertResult.member_id || ''
      member.shareList_id = insertResult.shareList_id || ''
      //log.info("insert result:", insertResult)
    } catch(e) {
      log.error(e)
    }    
  }

  // 生成userkey
  function createUserKey (wechat_id) {
    if (!wechat_id) return ''
    return hex_md5(WebConfig.token + wechat_id)
  }

  // 创建用于愿望列表的链接
  function createUrl(msg) {
    var contact = msg.from()
    //log.info(member)

    // 生成分享的愿望列表链接
    return new UrlLink ({
        description : WebConfig.share_list_desc,
        thumbnailUrl: WebConfig.share_list_icon,
        title       : (contact.name() ? contact.name() + "的": "曼泽") + '心愿单',
        //url         : WebConfig.share_list_url + "?user_id=" + member.member_id + "&key=" + hex_md5(member.member_id + contact.id)
        url         : WebConfig.share_list_url + "?key=" + createUserKey(contact.id)
    })
  }

  let ShareList = {
      save,
      createUrl
  }

  module.exports = ShareList