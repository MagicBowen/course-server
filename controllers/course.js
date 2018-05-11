const logger = require('../logger').logger('course');
const model = require('../models/model');

async function getCourse(ctx, next) {
    const openId = ctx.request.query.openid;
    await model.getCourse(openId, (err, course) => {
        if(err) {
            logger.error('Get course err: ' + err);
            ctx.response.status = 404;
        } else {
            ctx.response.type = "application/json";
            ctx.response.body = { courseTable : course };
            ctx.response.status = 200;
        }
    });
}

async function postCourse(ctx, next) {
    const openId = ctx.request.body.openid;
    const course = ctx.request.body.courseTable;
    await model.addCourse(openId, course, (err) => {
        if(err) {
            logger.error('Add course err: ' + err);
            ctx.response.status = 404;
        } else {
            ctx.response.status = 200;
        }
    });
}

async function putCourse(ctx, next) {
    const openId = ctx.request.body.openid;
    const course = ctx.request.body.courseTable;
    await model.modifyCourse(openId, course, (err) => {
        if(err) {
            logger.error('Update course err: ' + err);
            ctx.response.status = 404;
        } else {
            ctx.response.status = 200;
        }
    });
}

async function deleteCourse(ctx, next) {
    const openId = ctx.request.query.openid;
    await model.removeCourse(openId, (err) => {
        if(err) {
            logger.error('delete course err: ' + err);
            ctx.response.status = 404;
        } else {
            ctx.response.status = 200;
        }
    });
}

module.exports = {
    'GET /course' : getCourse,
    'POST /course': postCourse,
    'PUT /course' : putCourse,
    'DELETE /course' : deleteCourse
};