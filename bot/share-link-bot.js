/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
  const {
    Wechaty,
    config,
    UrlLink,
    Friendship
  }           = require('wechaty')

  const {FileBox} = require('file-box')
  const qrTerm    = require('qrcode-terminal')  
  //const xmlReader = require('xmlreader')
  const Validator = require('./validator')
  const ShareList = require('./share_list')
  const WebConfig = require('../web/config/mz_config')
  const MessageType = require('./message_type')
  
  /**
   *
   * 1. Declare your Bot!
   *
   */
  const bot = new Wechaty({
    profile : config.default.DEFAULT_PROFILE,
  })
  
  /**
   *
   * 2. Register event handlers for Bot
   *
   */
  bot
  .on('logout', onLogout)
  .on('login',  onLogin)
  .on('scan',   onScan)
  .on('error',  onError)
  .on('message', onMessage)
  .on('friendship', onFriendship)
  
  /**
   *
   * 3. Start the bot!
   *
   */
  bot.start()
  .catch(async e => {
    console.error('Bot start() fail:', e)
    await bot.stop()
    process.exit(-1)
  })
  
  /**
   *
   * 4. You are all set. ;-]
   *
   */
  
  /**
   *
   * 5. Define Event Handler Functions for:
   *  `scan`, `login`, `logout`, `error`, and `message`
   *
   */
  function onScan (qrcode, status) {
    qrTerm.generate(qrcode, { small: true })
  
    // Generate a QR Code online via
    // http://goqr.me/api/doc/create-qr-code/
    const qrcodeImageUrl = [
      'https://api.qrserver.com/v1/create-qr-code/?data=',
      encodeURIComponent(qrcode),
    ].join('')
  
    console.log(`[${status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `)
  }
  
  function onLogin (user) {
    console.log(`${user.name()} login`)
    bot.say('Wechaty login').catch(console.error)
  }
  
  function onLogout (user) {
    console.log(`${user.name()} logouted`)
  }
  
  function onError (e) {
    console.error('Bot error:', e)
    /*
    if (bot.logonoff()) {
      bot.say('Wechaty error: ' + e.message).catch(console.error)
    }
    */
  }
  
  /**
   *
   * 6. The most important handler is for:
   *    dealing with Messages.
   *
   */
  async function onMessage (msg) {
    //console.log(msg.toString())
    console.log((new Date()).toLocaleTimeString(), msg.toString())
    //console.log(msg.text())
    console.log(msg.type())
    console.log(bot.Message.Type)
  
    // 超时
    if (msg.age() > 60) {
        console.log('Message discarded because its TOO OLD(than 1 minute)')
        return
    }

    //联系人
    var contact = msg.from() 
    console.log(contact)

    if (msg.type() != bot.Message.Type.Video && msg.type() != bot.Message.Type.MiniProgram)
      return

    var _messageType

    // 根据不同的消息类型进行处理
    switch (msg.type()) {
      /**
       *
       * 消息类型：分享链接\小程序
       *
       */
      case bot.Message.Type.Video:
        _messageType = "ShareLink"
        break
      case bot.Message.Type.MiniProgram:
        _messageType = "MiniProgram"
        break
    }

     // 解析xml消息
     var data = await MessageType[_messageType].parseXml(msg.text())
     console.log(data)

     // 保存至数据库
     await ShareList.save(contact, data)

     // 生成分享链接
     let urlLink = ShareList.createUrl(msg, data)
     console.log(urlLink)

     // 回复分享链接
     await msg.say(urlLink) 

  }


  // Friendship Event will emit when got a new friend request, or friendship is confirmed.
  async function onFriendship (friendship) {
    console.log("onFriendShip event emit...")

    try {
      const contact = friendship.contact()  //获取联系人信息
      
      switch (friendship.type()) { 
        
        // 1. receive new friendship request from new contact
        case Friendship.Type.Receive:
          // 获取验证信息
          console.log(`Request from ${contact.name()}:`, friendship.hello())

          // 校验验证信息
          if (!Validator.checkFriendConfirm(friendship.hello())) return

          // 通过请求
          let result = await friendship.accept()
          console.log(result)

          if (result) {
            console.log(`Request from ${contact.name()} is accept succesfully!`)
          } else {
            console.log(`Request from ${contact.name()} failed to accept!`)
          }

          break

        // 2. confirm friendship
        case Friendship.Type.Confirm: 
          console.log(`new friendship confirmed with ${contact.name()}`)

          /**
           *  reply image(qrcode image)
           */
          const fileBox1 = FileBox.fromFile('../web/public/images/reply.jpg')
          await contact.say(fileBox1)  

          //await contact.say("欢迎使用曼泽愿望机器人！")
          //await contact.say("只要您把常购买的商品链接分享给我，我就会给您定制一份属于您的购买愿望列表！")
          //await contact.say("您可以随时把链接分享给亲人、朋友或发放到朋友圈！")

          break
      }

    } catch (e) {
      console.error(e)
    }
  }

  
  /**
   *
   * 7. Output the Welcome Message
   *
   */
  const welcome = `
  | __        __        _           _
  | \\ \\      / /__  ___| |__   __ _| |_ _   _
  |  \\ \\ /\\ / / _ \\/ __| '_ \\ / _\` | __| | | |
  |   \\ V  V /  __/ (__| | | | (_| | |_| |_| |
  |    \\_/\\_/ \\___|\\___|_| |_|\\__,_|\\__|\\__, |
  |                                     |___/
  
  =============== Powered by Wechaty ===============
  -------- https://github.com/chatie/wechaty --------
            Version: ${bot.version(true)}
  
  I'm a bot, my superpower is talk in Wechat.
  
  If you send me a share-link, I will reply you a link list!
  __________________________________________________
  
  Hope you like it, and you are very welcome to
  upgrade me to more superpowers!
  
  Please wait... I'm trying to login in...
  
  `
  console.log(welcome)
  