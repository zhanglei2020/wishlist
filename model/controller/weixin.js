/**
 * 微信接口
 */


const request = require('request');
let $sql = require('../sqlfun');//sql语句
let requestData = '';

module.exports = {

  getJSAPIParameter(req, res) {
    var params = req.body;
    var ws = $sql.goingNow.getJSAPIParameter+params.ws;

    // console.log('reqeustHeder:',ws);
    // console.log('reqeust:',req.body);

    request.post({url: ws, form: {url: params.url}}, (error, response, body) => {
      if(!error && response.statusCode == 200){
        var valueData = JSON.parse(body).value;
        res.json(valueData.parameter);
      } else {
        console.error('error:', error);
      }
      res.end('is over');
    })
  },

};


