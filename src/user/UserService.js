const User = require('./User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const EmailService = require('../email/emailService');
const sequalize = require('../config/database');
const EmailException = require('../email/EmailException');


const generateActivationToken = async (length) => {
    return await crypto.randomBytes(length).toString('hex').substring(0, length);
}


const save = async ({ username, email, password }) => {
    const hash = await bcrypt.hash(password, 10);
    const activationToken = await generateActivationToken(16);
    const transaction = await sequalize.transaction();
    const user = { username, email, password: hash, activationToken };
    await User.create(user, { transaction });
    try {      
      await EmailService.sendActivationEmail(email, activationToken);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new EmailException();
    }
}

const findByEmail = async email => {
  return await User.findOne({ where: { email } });
}


module.exports = {
    save,
    findByEmail,
}