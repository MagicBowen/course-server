const logger = require('../logger').logger('mem-model');

class Model{
    init() {
        this.course = {};
        this.ids = {};
        logger.info('Init memory model successful!');
    }

    getPhone(openId, callback) {
        var err;
        if ((!this.ids[openId]) || (!this.ids[openId].phone)) {
            err = `Not found phone for openId ${openId}`;
        }
        callback(err, this.ids[openId].phone);
    }

    addPhone(openId, phone, callback) {
        this.ids[openId] = {openid : openId, phone: phone};
        callback(null);
    }

    modifyPhone(openId, phone, callback) {
        this.ids[openId] = {openid : openId, phone: phone};
        callback(null);
    }

    removePhone(openId, callback) {
        this.ids[openId].phone = null;
        callback(null);
    }

    getCourse(openId, callback) {
        var course = this.course[openId];
        var err = course ? null : `Not found course for openId ${openId}`;
        callback(err, course);
    }

    addCourse(openId, course, callback) {
        this.course[openId] = course;
        if (!this.ids[openId]) {
            this.ids[openId] = {openid : openId}
        }
        callback(null);
    }

    modifyCourse(openId, course, callback) {
        this.course[openId] = course;
        callback(null);
    }

    removeCourse(openId, callback) {
        this.course[openId] = null;
        callback(null);
    }
}

model = new Model();

module.exports = model;
