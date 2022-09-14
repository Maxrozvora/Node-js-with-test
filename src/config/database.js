const Sequalize = require('sequelize');
const config = require('config');

const { database, username, password, dialect, storage, logging } = config.get('database')

const sequalize = new Sequalize(database, username, password, {
    dialect,
    storage,
    logging
});

module.exports = sequalize;