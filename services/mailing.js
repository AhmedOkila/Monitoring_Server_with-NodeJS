require('dotenv').config()
const nodemailer = require('nodemailer');
exports.sendVerificationCodeToNewUsers = (user) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_MAIL,
            pass: process.env.ADMIN_PASSWORD
        }
    });

    let mailOptions = {
        from: 'am9514986@gmail.com',
        to: user.email,
        subject: 'Verify your Account',
        text: `Hi ${user.email} Please Verify your Account Using Verification Code ${user.verificationCode}`
    };

    transporter.sendMail(mailOptions,  (error, info) =>{
        if (error) {
            const error = new Error('Email Failed to be sent to User');
            error.statusCode = 500;
            throw error;
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

exports.downCheckNotification = (user)=>{
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_MAIL,
            pass: process.env.ADMIN_PASSWORD
        }
    });

    let mailOptions = {
        from: 'am9514986@gmail.com',
        to: user.email,
        subject: 'Your URL Check is Down',
        text: `Hi ${user.email} Your URL is Down Right Now, Please Check it`
    };

    transporter.sendMail(mailOptions,  (error, info) =>{
        if (error) {
            const error = new Error('DownTime Notification Failed to be sent to User');
            error.statusCode = 500;
            throw error;
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

exports.upCheckNotificationAfterDown = (user)=>{
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_MAIL,
            pass: process.env.ADMIN_PASSWORD
        }
    });

    let mailOptions = {
        from: 'am9514986@gmail.com',
        to: user.email,
        subject: 'Your URL check is Back',
        text: `Hi ${user.email} Your URL is UP again, Thanks for your quick Response`
    };

    transporter.sendMail(mailOptions,  (error, info) =>{
        if (error) {
            const error = new Error('UPTime Notification Failed to be sent to User');
            error.statusCode = 500;
            throw error;
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

