/**
 * Created by asd on 2016/12/22.
 */

var path = require('path');
var express = require('express');
var session = require('express-session');
var routes = require('./routes');
var config = require('config-lite');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
var pkg = require('./package');
var app = express();

//设置模板引擎
app.set('view engine', 'ejs');

//设置模板目录
app.set('views', path.join(__dirname, 'views'));

//设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// session 中间件
app.use(session({
    name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    cookie: {
        maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
    },
    store: new MongoStore({// 将 session 存储到 mongodb
        url: config.mongodb// mongodb 地址
    })
}));

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/upload'),// 上传文件目录
    keepExtensions: true// 保留后缀
}));

//flash中间件
app.use(flash());

//设置模板全局常量
app.locals.thissite = {
    title: pkg.name,
    description: pkg.description
};

//设置模板必须三个常量
app.use(function(req, res, next){
    res.locals.user = req.session.user;
    res.website = req.flash('site').toString();
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

//路由
routes(app);

app.listen(3000, function(){
    console.log('node is listenning at port 3000');
});