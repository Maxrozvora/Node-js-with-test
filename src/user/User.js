const Sequalize = require('sequelize');
const sequalize = require('../config/database');

const Model = Sequalize.Model;
class User extends Model {}
User.init(
    {
        username: {
            type: Sequalize.STRING,
        },
        email: {
            type: Sequalize.STRING,
        },
        password: {
            type: Sequalize.STRING,
        },
        inactive: {
            type: Sequalize.BOOLEAN,
            defaultValue: true,
        },
        activationToken: {
            type: Sequalize.STRING,
        }
    },
    {
        sequelize: sequalize,
        modelName: 'user',
}
);

module.exports = User;