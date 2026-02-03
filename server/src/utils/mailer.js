const nodemailer = require('nodemailer');

console.log('[Mailer] Initializing...');
console.log('[Mailer] Host:', process.env.SMTP_HOST);
console.log('[Mailer] User:', process.env.SMTP_USER);
console.log('[Mailer] Secure:', String(process.env.SMTP_SECURE || 'false') === 'true');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || 'false') === 'true', // true เฉพาะพอร์ต 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, bcc, subject, html, text }) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM || '"PR" <noreply@example.com>',
    to, bcc, subject, html, text,
  });
}

module.exports = { sendMail };
