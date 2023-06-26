const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    // Check jwt exits & is verified
    if(token) {
        jwt.verify(token, 'I send you secret code!', (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.redirect('/login');
            }
            else {
                console.log(decodedToken);
                next();
            }
        })
    }else {
        res.redirect('/login');
    }
}

// Check current user
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, 'I send you secret code!', async (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            }
            else {
                console.log(decodedToken)
                let user = await User.findById(decodedToken.id);
                res.locals.user = user
                next();
            }
        })
    }else {
        res.locals.user = null;
        next();
    }

}

module.exports = { requireAuth, checkUser };