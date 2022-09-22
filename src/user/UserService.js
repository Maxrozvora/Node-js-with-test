const User = require('./User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendActivationEmail } = require('../email/emailService');


const generateActivationToken = async (length) => {
    return await crypto.randomBytes(length).toString('hex').substring(0, length);
}


const save = async ({ username, email, password }) => {
    const hash = await bcrypt.hash(password, 10);
    const activationToken = await generateActivationToken(16);
    await User.create({
      username,
      email,
      password: hash,
      activationToken,
    });
    await sendActivationEmail(email, activationToken);    
}

const findByEmail = async email => {
  return await User.findOne({ where: { email } });
}


module.exports = {
    save,
    findByEmail,
}