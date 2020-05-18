/*重新封装layer，提供msg、confirm等方法*/
(function (win) {
    win.layer.msg = function (content) {
        //提示
        layer.open({
            content: content
            ,skin: 'msg'
            ,time: 2 //2秒后自动关闭
        });
    };
    win.layer.confirm = function (content, callback) {
        layer.open({
            content: content
            ,btn: ['确定', '取消']
            ,skin: 'footer'
            ,yes: function(index){
                layer.close(index);
                callback(index);
            }
        });
    };
    win.layer.alert = function (content) {
        //信息框
        layer.open({
            content: content
            ,btn: '我知道了'
        });
    }
})(window);