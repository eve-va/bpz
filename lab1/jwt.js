const jwt = require('jsonwebtoken');
require('dotenv').config();

//used to generate secret
//const crypto = require('crypto');
//const secret = crypto.randomBytes(64).toString('hex');

const generateAccessToken = (username) => {
    return jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: 3600 });
}

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('headers ' + req.headers.authorization);

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        next();
    }
};

module.exports = {generateAccessToken, authenticateJWT};