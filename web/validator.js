let config = require('./config/mz_config');
let Md5 = require('./library/md5');


/**
 * 按数组值进行正序排列，并对象转字符串
 */
let sortObj = (obj)=>{
  var arr = [];
  for (var i in obj) {
    arr.push([obj[i], i]);
  };
  arr.sort();
  var len = arr.length,
    newString = '';
  for (var i = 0; i < len; i++) {
    newString += arr[i][0];
  }
  return newString;
}


/**
 * 生成签名
 */
let makeSign = (obj)=>{
  var str = sortObj(obj);
  var signature = Md5.hex_md5(str);

  return signature.toUpperCase();
}


var validator = (obj, res) =>{
  console.log('req>>>>>>>',obj.timeStamp)
  let newTimestamp = Date.parse(new Date())/1000;
  var result = {code:0};

  if(!obj || !obj.timeStamp || !obj.randomStr || !obj.signature){

    result = {code:-1,message:'校验未通过，请求接口失败'};

  }else if(newTimestamp - obj.timeStamp >60){//验证时间不能超过5分钟

    result = {code:-1,message:'校验未通过，请求验证超时'};

  }else{//验证签名
    var signature = makeSign({ timeStamp: obj.timeStamp, randomStr: obj.randomStr, token: config.token });//签名;

    if(signature != obj.signature) {
      result = {code: -1, message: '校验未通过,签名失败'};
    }
  }

    return result;
};


module.exports= validator;
