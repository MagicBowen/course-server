const Database = require('arangojs').Database;
const logger = require('../logger').logger('model');
const config = require('../config.json');

class Model{
    init() {
        this.db = new Database(config.arango_uri);
        this.db.useDatabase(config.db);
        this.db.useBasicAuth(config.username, config.password);
        this.courseCollection = this.db.collection('courseTable');
        this.idCollection = this.db.collection('userIds');
    }
}

model = new Model();

module.exports = model;
