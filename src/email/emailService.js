const transporter = require('../config/emailTransporter');

const sendActivationEmail = async (email, activationToken) => {    
    await transporter.sendMail({
      from: 'Service Email',
      to: email,
      subject: 'Please activate your account',
      html: 'Please activate your account ' + activationToken,
    });
};

module.exports = {
    sendActivationEmail,
};