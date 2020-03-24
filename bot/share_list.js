  const ShareListModel  = require('../model/controller/share_list')
  const WebConfig = require('../web/config/mz_config')
  const {hex_md5} = require('../web/library/md5');

  const {
    //Wechaty,
    //config,
    UrlLink,
    //Friendship
  }           = require('wechaty')

  var member = {} //会员

  // 持久化愿望列表
  async function save(contact, params) {
    var avatar = await contact.avatar()

    params.wechatId = contact.id || ''
    params.wechatName = contact.name() || ''
    params.wechatAvatar = avatar.remoteUrl || '' 

    var insertResult = await ShareListModel.insertShareList(params)
    //console.log("haha:", insertResult)

    // 保存当前用户的id及分享列表的id
    member.member_id = insertResult.member_id || ''
    member.shareList_id = insertResult.shareList_id || ''
    //console.log("insert result:", insertResult)
  }

  // 创建用于愿望列表的链接
  function createUrl(msg) {
    var contact = msg.from()
    //console.log(member)

    // 生成分享的愿望列表链接
    return new UrlLink ({
        description : WebConfig.share_list_desc,
        thumbnailUrl: WebConfig.shareList_icon,
        title       : (contact.name() ? contact.name() + "的": "曼泽") + '心愿单',
        url         : WebConfig.share_list_url + "?user_id=" + member.member_id + "&key=" + hex_md5(member.member_id + contact.id)
    })
  }

  let ShareList = {
      save,
      createUrl
  }

  module.exports = ShareList