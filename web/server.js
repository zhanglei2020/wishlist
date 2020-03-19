// node 后端服务器
const express = require('express')
//const ejs = require('ejs')
const app = express()
const routers = require('./router')
const bodyParser = require('body-parser')
const path = require("path")
const session = require("express-session")
const FileStore = require('session-file-store')(session)
const {log}     = require('brolog')

// 创建 session 中间件
const sessionMiddleware = session({ 
  //name: 'session-id',
  store             : new FileStore(),      //数据持久化方式，这里表示本地文件存储
  secret            : 'a4f9eeec8dd87e3db44d196a69ca5d0d.#cat1',      //加密key 可以随意书写
  cookie            : { maxAge: 864000000 },      //两次请求的时间差 即超过这个时间再去访问 session就会失效 单位ms
  saveUninitialized : true,     //是否自动初始化 默认为true
  resave            : true
})

// express加入session中间件
app.use(sessionMiddleware);

// post方法通过body获取参数，需要使用body-parser，否则body为空
app.use(bodyParser.json());

// 设置模板引擎为ejs
app.set("engine", "ejs")

// 改变模板文件目录
//app.set("views", "views")

// 静态文件
app.use(express.static(path.join(__dirname, 'public')))

// 可跨域 ,编码格式
app.all('*', function(request, response, next) {
  //response.header('Access-Control-Allow-Origin','*');
  //response.header('Access-Control-Allow-Headers','X-Requested-With');
  //response.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,OPTIONS');
  //response.header('X-Powered-By','3.2.1');
  //response.header('Content-Type','application/json;charset=utf-8');
  log.info("REQ", "*******************欢迎访问曼泽分享列表********************")

  response.header('Content-Type', 'text/html; charset=utf-8')
  next();
});

// 后端api路由
app.use('/mzs', routers);

// 监听端口
app.listen(9000);
console.log('MANZE ShareList Server success listen at port:9000......');

