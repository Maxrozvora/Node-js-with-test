const { createTransport } = require('nodemailer');

const transporter = createTransport({
    host: 'localhost',
    port: 2525,
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;