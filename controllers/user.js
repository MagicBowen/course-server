const logger = require('../logger').logger('user');
const model = require('../models/model');

async function postDuerosUser(ctx, next) {
    const openId = ctx.request.body.openid;
    const duerosId = ctx.request.body.duerosId;
    await model.createDuerosUser(openId, duerosId, (err) => {
        if(err) {
            logger.error('Add duerosId err: ' + err);
            ctx.response.status = 404;
        } else {
            ctx.response.status = 200;
        }
    });
}

module.exports = {
    'POST /dueros_user': postDuerosUser,
};