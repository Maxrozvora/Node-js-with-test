const { createTransport } = require('nodemailer');
const { stubTransport } = require('nodemailer-stub');

const transporter = createTransport(stubTransport);

module.exports = transporter;