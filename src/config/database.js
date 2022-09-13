const Sequalize = require('sequelize');

const sequalize = new Sequalize('hoaxify', 'my-user-db', 'my-password-db', {
    dialect: 'sqlite',
    storage: './database.sqlite',
});

module.exports = sequalize;