const User = require('./User');
const bcrypt = require('bcrypt');

const save = async ({ username, email, password }) => {
    const hash = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hash,
    });
}


module.exports = {
    save,
}