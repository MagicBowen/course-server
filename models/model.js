var model = (process.env.NODE_ENV === 'production')? require('./arango-model') : require('./mem-model');

module.exports = model;
