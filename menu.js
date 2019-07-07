
var https = require('https');
var request = require('request');
var Promise = require('promise');  //promise用于流程控制，即保证先获取到access_token,在调用创建自定义菜单接口
var config = require('./config');//引入配置文件
var appId = config.appId; 
var appSecret =  config.appSecret;

function getToKen(appId, appSecret) {        

    return new Promise(function (resolve, reject) {

        var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appId + '&secret=' + appSecret;
        request({
            uri : url
        }, function (err, res, data) {
            var result = JSON.parse(data);
            resolve(result.access_token);  //把获取的access_token返回去
        });

    });

}
//menu为创建自定义菜单的具体内容，也就是post到微信服务器的body
var menu = {          
    "button" : [{
            "name" : "我的账号",
            "sub_button" : [{
                    "type" : "click",
                    "name" : "test1",
                    "key" : "V1001_MY_ACCOUNT"
                }, {
                    "type": "scancode_waitmsg", 
                    "name": "扫码带提示", 
                    "key": "rselfmenu_0_0"
                }, {
                    "type": "pic_photo_or_album", 
                    "name": "拍照或者相册发图", 
                    "key": "rselfmenu_1_1"
                }, {
                    "name": "发送位置", 
                    "type": "location_select", 
                    "key": "rselfmenu_2_0"
                }, {
                    "type": "view_limited", 
                    "name": "图文消息", 
                    "media_id": "MEDIA_ID2"
                }
            ]
        }, {
            "type" : "view",
            "name" : "百度一下",
            "url" : "http://www.baidu.com/"
        }
    ]
};

var post_str = new Buffer(JSON.stringify(menu));   //先将menu转成JSON数据格式，在赋给post_srt数组

//调用getToken函数，getToken函数执行完，接下来才执行then函数中的匿名函数,其中，access_token为返回来的参数。
getToKen(appId, appSecret).then(function (access_token) {  
    var post_options = {
        host : 'api.weixin.qq.com',
        port : '443',
        path : '/cgi-bin/menu/create?access_token=' + access_token,
        method : 'POST',
        headers : {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length' : post_str.length
        }
    };

    var post_req = https.request(post_options, function (response) {
            var responseText = [];
            var size = 0;
            response.setEncoding('utf8');
            response.on('data', function (data) {
                responseText.push(data);
                size += data.length;
            });
            response.on('end', function () {
                console.log("responseText=", responseText);
            });
        });

    post_req.write(post_str);// 把menu数据post到微信服务器，剩下的微信自动帮我们搞定了。
    post_req.end();
})