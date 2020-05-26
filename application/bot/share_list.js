  const ShareListModel  = require('../models/controller/share_list')
  const WebConfig = require('../config/main')
  const {hex_md5} = require('../libraries/md5')
  const JDApi     = require('../api/jd/api.jd.com')
  const shareInfo = require('../libraries/share_info')
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

    //获取分享的标题、描述等信息
    let params = {name: contact.name()}

    // 生成分享的愿望列表链接
    return new UrlLink ({
        description : shareInfo.getShareText("wish_list", "desc", params),
        thumbnailUrl: shareInfo.getShareUrl("wish_list", "icon"),
        title       : shareInfo.getShareText("wish_list", "title", params),
        url         : shareInfo.getShareUrl("wish_list", "base_url") + "?key=" + createUserKey(contact.id)
    })
  }

  let ShareList = {
      save,
      createUrl
  }

  module.exports = ShareList