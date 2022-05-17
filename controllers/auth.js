const {validationResult} = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mailService = require('../services/mailing');

exports.signup = (req, res, next) => {
    // Check for User Input Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    // Creating Verification Code for User
    const code = Math.floor(Math.random() * 100000 + 100000);
    // Hashing Password of User to save the Hashed Value in Database
    bcrypt
        .hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                verificationCode: code
            });
            return user.save();
        })
        .then(user => {
            // Sending Email with Verification Code to User
            mailService.sendVerificationCodeToNewUsers(user);
            res.status(201).json({
                message: 'User created!',
                userId: user._id,
                code: code
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
exports.login = (req, res, next) => {
    // Check for User Input Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    // Check If this Email Exists and Verified
    User.findOne({email: email})
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found.');
                error.statusCode = 401;
                throw error;
            }
            if (user.isVerified == false) {
                const error = new Error('Your Email is not Verified yet, Please Verify it');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            // Check if the Entered Password is Correct
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }
            // Generating the JWToken for Authenticated User
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                'somesupersecretsecret',
                {expiresIn: '1h'}
            );
            res.status(200).json({token: token, userId: loadedUser._id.toString()});
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
exports.verify = (req, res, next) => {
     // Check for User Input Validation
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         const error = new Error('Validation failed.');
         error.statusCode = 422;
         error.data = errors.array();
         throw error;
     }
    const email = req.body.email;
    const verificationCode = req.body.code;
    // Check that Email already Exists and not Verified
    User.findOne({email: email})
        .then(user => {
            if (!user) {
                const error = new Error('A user with this email could not be found.');
                error.statusCode = 401;
                throw error;
            }
            if (user.isVerified == true) {
                return res.status(400).json({message: "User is already verified, please login"});
            }
            if (user.verificationCode != verificationCode) {
                return res.status(400).send({message: "Invalid Verification code"});
            }
            // Verify user
            return User.findOneAndUpdate({_id: user._id}, {isVerified: true});
        })
        .then((user)=>{
            res.status(200).send("User is verified, Please login");
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}
