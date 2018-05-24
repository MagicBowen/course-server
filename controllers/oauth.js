var axios = require('axios')

const config = require('../config.json');

var oauth = async (ctx) => {
    console.log(ctx.query)
    var result = await axios.get('https://api.weixin.qq.com/sns/jscode2session',
        {
            params: {
                appid: config.appid,
                secret: config.secret,
                js_code: ctx.query.code,
                grant_type: 'authorization_code'
            }
        }
    )

    ctx.response.type = "application/json";
    ctx.response.status = 200;
    ctx.response.body.data = result.data;
}

module.exports = {
    'GET /openid' : oauth
};