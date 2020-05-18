//加载log4js模块
const log4js = require('log4js')
//加载log4js缺省配置
const logConfig = require('../config/logger')

//定义服务,包括web\bot等
let services = logConfig.services || []

// 处理配置文件中的filename
function handelConfig(jsonConfig, servieName) {
    for (const key1 in jsonConfig) {
        for (const key2 in jsonConfig[key1]) {
            if (key2 == 'filename') {
                jsonConfig[key1][key2] = function (str) {
                    let pos = str.lastIndexOf("/")
                    return str.slice(0, pos+1) + servieName + "-" + str.slice(pos+1)
                }(jsonConfig[key1][key2])
            }
        }
    }
    return jsonConfig
}


//获取日志实例
const log = (service) => {
    if (!logConfig || !logConfig.default || !logConfig.default.appenders) return false

    try {
        //处理配置
        let _config = handelConfig(logConfig.default.appenders, service.name)
        //console.log(_config)        

        //配置日志
        log4js.configure(logConfig.default)

        //返回实例
        return log4js.getLogger(service.category)
    } catch (e) {
        console.log(e)
        return false
    }
}


//设置输出级别，具体输出级别有8个，ALL<TRACE<DEBUG<INFO<WARN<ERROR<FATAL<MARK<OFF
//log.setLevel('INFO')

// 初始化logger
var logger = false

const out = function (serviceName) {
    // 若实例已经存在直接返回
    if (logger) return logger

    // serviceName不存在时，优先配置中的serviceName，若还不存在则默认为web
    serviceName = serviceName || 'web'
    //console.log("logger serviceName:", serviceName)

    // 通过serviceName实例化logger
    for (const key in services) {
        if (serviceName == services[key].name) {
            logger = log(services[key])
            return logger
        }            
    }
    return false
}
//console.log(out)

module.exports = out