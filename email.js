'use strict';
const nodemailer = require('nodemailer');
const config = require('config');
const Email = require('email-templates');
const path = require('path');

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport TODO
  let transporter = nodemailer.createTransport({
    host: config.get('mail.host'),
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: config.get('mail.user'), // generated ethereal user
      pass: config.get('mail.password'), // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Admin" <${config.get('mail.user')}>`, // sender address
    to: 'jenniferyao1996@hotmail.com,', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body

    html: 'Embedded image: <img src="cid:unique@kreata.ee"/>', // html body
    attachments: {
      filename: 'logo.jpg',
      path: `${__dirname}/public/images/logo.jpg`,
      cid: 'unique@kreata.ee',
    },
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// 2021 09 22 send image attachment ok
// main() : only for test
// main().catch(console.error);

async function sendResetPwdEmail(url, destinationEmail) {
  let transporter = nodemailer.createTransport({
    host: config.get('mail.host'),
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: config.get('mail.user'), // generated ethereal user
      pass: config.get('mail.password'), // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Admin" <${config.get('mail.user')}>`, // sender address
    to: destinationEmail, // list of receivers
    subject: 'Reset Password ✔', // Subject line
    text: 'Reset Password?', // plain text body
    html: `<b>Reset password?<a href="${url}" target="_blank" rel="noopener noreferrer">click it</a></b>`, // html body
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
async function newResetPassword(name, url, destinationEmail) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: config.get('mail.host'),
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: config.get('mail.user'),
      pass: config.get('mail.password'),
    },
  });

  const email = new Email({
    transport: transporter,
    send: true,
    preview: false,
    juice: true,
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.join(__dirname, './public/images'),
        images: true,
      },
    },
  });

  email
    .send({
      template: path.join(__dirname, './emails/resetpassword'),
      message: {
        from: 'cxxyao2@gmal.com',
        to: destinationEmail,
        attachments: {
          filename: 'logo.jpg',
          path: `${__dirname}/public/images/logo.jpg`,
          cid: 'unique@kreata.ee',
        },
      },
      locals: {
        url: url,
        name: name,
      },
    })
    .then(() => {
      console.log('email has been send');
    })
    .catch((err) => {
      throw err;
    });
}
async function sendOrderDetailEmail(
  customerEmail,
  customerName,
  orderAmount,
  orderTax,
  orderTotal
) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: config.get('mail.host'),
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: config.get('mail.user'),
      pass: config.get('mail.password'),
    },
  });

  const email = new Email({
    transport: transporter,
    send: true,
    preview: false,
    juice: true,
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.join(__dirname, './public/images'),
        images: true,
      },
    },
  });

  email
    .send({
      template: path.join(__dirname, './emails/placeorder'),
      message: {
        from: config.get('mail.user'),
        to: customerEmail,
        attachments: {
          filename: 'logo.jpg',
          path: `${__dirname}/public/images/logo.jpg`,
          cid: 'unique@kreata.ee',
        },
      },
      locals: {
        name: customerName,
        amount: orderAmount,
        tax: orderTax,
        total: orderTotal,
      },
    })
    .then(() => {
      console.log('email has been send');
    })
    .catch((err) => {
      throw err;
    });
}

exports.sendResetPwdEmail = sendResetPwdEmail;
exports.sendOrderDetailEmail = sendOrderDetailEmail;
exports.newResetPassword = newResetPassword;
