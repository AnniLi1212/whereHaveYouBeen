const express = require('express');
const router = express.Router();
const { signUp,login } = require('../user/loginService');
const {BadRequestError} = require('../middleware/error_handler');

router.post('/signup',async (req, res, next) => {
    try {
        const { user_name, password, email } = req.body;

        // TODO: validate these fields
        if(false) {
            new BadRequestError('Invalid input');
        }

        const userkey = await signUp(user_name, password, email);
        res.status(201).json(
            { 
                message: 'User registered successfully!',
                userkey
            });
    } catch (error) {
        next(error);
    }
});

router.post('/login',async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // TODO: validate these fields
        if(false) {
            new BadRequestError('Invalid input');
        }

        const userkey = await login(email, password);
        res.status(200).json(
            { 
                message: 'User logged in successfully!',
                userkey
            });
    } catch (error) {
        next(error);
    }
});

module.exports = router;