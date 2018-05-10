const Database = require('arangojs').Database;

class Model{
    init(uri) {
        this.db = new Database('http://127.0.0.1:8529');
    }
}

model = new Model();

module.exports = model;
