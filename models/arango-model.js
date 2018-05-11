const logger = require('../logger').logger('arango-model');
const Database = require('arangojs').Database;
const config = require('../config.json');

class Model{
    init() {
        this.db = new Database(config.arango_uri);
        this.db.useDatabase(config.db);
        this.db.useBasicAuth(config.username, config.password);
        this.courseCollection = this.db.collection('courseTable');
        this.idCollection = this.db.collection('userIds');
    }

    getPhone(openId, callback) {

    }

    addPhone(openId, phone, callback) {

    }

    modifyPhone(openId, phone, callback) {

    }

    deletePhone(openId, callback) {

    }

    getCourse(openId, callback) {

    }

    addCourse(openId, course, callback) {

    }

    modifyCourse(openId, course, callback) {

    }

    deleteCourse(openId, callback) {

    }
}

model = new Model();

module.exports = model;
