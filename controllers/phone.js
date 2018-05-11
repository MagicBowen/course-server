const logger = require('../logger').logger('phone');
const model = require('../models/model');

async function getPhone(ctx, next) {
    const openId = ctx.request.query.openid;
    await model.getPhone(openId, (err, phone) => {
        if(err) {
            logger.error('Get phone err: ' + err);
            ctx.response.status = 404;
        } else {
            ctx.response.type = "application/json";
            ctx.response.body = {phone : phone};
            ctx.response.status = 200;
        }
    });
}

async function postPhone(ctx, next) {
    const openId = ctx.request.body.openid;
    const phone = ctx.request.body.phone;
    await model.addPhone(openId, phone, (err) => {
        if(err) {
            logger.error('Add phone err: ' + err);
            ctx.response.status = 404;
        } else {
            ctx.response.status = 200;
        }
    });
}

async function putPhone(ctx, next) {
    const openId = ctx.request.body.openid;
    const phone = ctx.request.body.phone;
    await model.modifyPhone(openId, phone, (err) => {
        if(err) {
            logger.error('Update phone err: ' + err);
            ctx.response.status = 404;
        } else {
            ctx.response.status = 200;
        }
    });
}

async function deletePhone(ctx, next) {
    const openId = ctx.request.query.openid;
    await model.removePhone(openId, (err) => {
        if(err) {
            logger.error('delete phone err: ' + err);
            ctx.response.status = 404;
        } else {
            ctx.response.status = 200;
        }
    });
}

module.exports = {
    'GET /phone' : getPhone,
    'POST /phone': postPhone,
    'PUT /phone' : putPhone,
    'DELETE /phone' : deletePhone
};