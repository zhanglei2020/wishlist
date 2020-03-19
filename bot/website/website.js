const request = require("request")

function requestWebsite (request_url, http_method) {  

    try {
        if (!request_url) throw ("url地址为空")

        var params = ""
        //http_method = http_method || "GET"

        if (http_method == "POST") {
            params = {
                url: request_url,
                //method: http_method,
                //json: true
                form : {
                    user : "tom"
                }
            }
        }
       
        return new Promise ((resolve, reject) => {
            request.get(request_url, function (err, res, body) {
                if (err) reject(err)
                //console.log(body)
                resolve(body)
            })
        })

    } catch (e) {
        console.log(e)
    }    
}


module.exports = requestWebsite