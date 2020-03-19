function init (div) {
    var html = "";

    html += "<!DOCTYPE html>";
    html += '<html>';
    html += '<head>';
    html += '<meta charset="UTF-8">';
    html += '<title>曼泽愿望列表</title>';
    html += '<base href="">';
    html += '<link href="" rel="stylesheet">';
    html += '</head>';
    html += '<body>';
    html += '<div>';

    html += div;

    html += '</div>';
    html += '<script type="text/javascript" charset="utf-8" src=""></script>';
    html += '</body>';
    html += '';
    html += '</html>';

    return html
}


function index (data) {
    //检查数据
    if (!Array.isArray(data)) return init("数据错误")
    if (Array.isArray(data) && data.length == 0) return init("列表为空")

    var div = "";
    div += "<div><img src='"+ data[0].wechat_avatar + "' style='width:32px;'/>" + data[0].wechat_name + "的愿望列表如下：</div>"
    div += "<table><tr>"
    div += "<td>id</td>"
    div += "<td>标题</td>"
    div += "<td>价格</td>"
    div += "<td>描述</td>"
    div += "</tr>"


    data.forEach(element => {
        div += "<tr><td>" + element.id + "</td>"
        div += "<td>" + (element.img_url ? "<img src='" + element.img_url+ "'/>" : "") + "<a href='" + element.url + "'>" + element.title + "</td>"
        div += "<td>" + element.price + "</td>"
        div += "<td>" + element.desc + "</td>"
        div += "</tr>"        
    });

    div += "</table>"

    return init(div)
}


module.exports = index