const model    = require('../models/model')
const logger = require('../logger').logger('login');

var getLogin = async (ctx, next) => {
    ctx.render('login.html');
};

var postLogin = async (ctx, next) => {
    const creds = ctx.request.body;
    logger.debug(`Authenticating ${JSON.stringify(creds)}`);

    // const user = await model.getUser(creds.username, creds.password);

    const user = await model.getUser(creds.phone, creds.code);

    if(!user) {
        ctx.response.status = 404;
        ctx.response.type = "application/json";
        ctx.response.body = {result : "login_failure", response: "无效的验证码"};
        return
    }

    logger.debug(`User ${user.id} Login Success!`);
    ctx.session.userId = user.id;

    // If we were sent here from grant page, redirect back
    if(ctx.session.hasOwnProperty('query') && ctx.session.query !== null) {
        ctx.response.type = "application/json";
        ctx.response.body = {result : "redirect_to_auth"};
        return;
    }

    // If not do whatever you fancy
    ctx.response.type = "application/json";
    ctx.response.body = {result : "ok"};
};

var logout = async (ctx, next) => {
    ctx.session.userId = null;
    ctx.redirect('/login');
};

const sms = require("gaoxin_sms_gateway/dist").default;

var generateCode = function() {
    const rand = Math.round(Math.random()*1000000)
    return `${rand}`.padStart(6, '0')
}

var requestCode = async (ctx, next) => {
    const phone = ctx.request.body.phone;
    const code = generateCode()
    model.addUser(phone, code)
    sms(phone, code, "230", "xdkj_hy", "xdkj123456")
    ctx.response.type = "application/json";
    ctx.response.body = {result: 200, response : "ok"};
};

module.exports = {
    'GET /login': getLogin,
    'POST /login': postLogin,
    'GET /logout': logout,
    'POST /request/code': requestCode
};