const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

//Handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: ''}; 

    // Incorrect email
    if(err.message === 'incorrect email'){
        errors.email = 'That email is not registered!'
    }

    // Incorrect password
    if(err.message === 'incorrect password'){
        errors.password = 'That password is incorrect!'
    }

    // Duplicate key errors
    if(err.code === 11000){
        errors.email = 'That email is already registered!';
        return errors;
    }

    // Validation errors
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        })
    }
    
    return errors;
}

// Using JWT (jsonwebtoken)
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign( {id}, 'I send you secret code!', {
        expiresIn: maxAge
    });
}

//login GET Method
signup_get = async (req, res, next) => {
    res.render('signup');
}

//login GET Method
login_get = async (req, res, next) => {
    res.render('login');
}

//signup POST Method
signup_post = async (req, res, next) => {
    
    //Accepting user input datas
    const { name, email, password, confirm_password } = req.body;

    try{
        // Validation error messages 
        const errors = validationResult(req);
        if(errors.isEmpty()){
            errors.array().forEach(error => {
                req.flash('error', error.msg);
            });
            res.render('signup');
            return;
        }

        const user = await User.create({ name, email, password, confirm_password });
        
        // Save user's jwt token on browser
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.redirect('/login');
        // res.status(201).json({ user: user._id });
    }catch(err){
        const errors = handleErrors(err);
        res.status(400).json({ errors });
        console.log(errors);
    }

}

//Login POST method
login_post = async (req, res, next) => {
    const { email, password } = req.body;
    
    try{
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        // res.status(200).json({ user: user._id });
        res.redirect('/')
    }catch(err){
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

// Logout GET method
logout_get = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}

module.exports = {
    signup_get,
    login_get,
    signup_post,
    login_post,
    logout_get
}
