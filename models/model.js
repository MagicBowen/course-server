const Database = require('arangojs').Database;
const logger = require('../logger').logger('model');

class Model{
    init(uri) {
        this.db = new Database(uri);
        this.db.useBasicAuth('root', 'KingDom1234');
        this.db.useDatabase('waterDrop');
        this.collection = this.db.collection('courseTable');
    }
}

model = new Model();

module.exports = model;
