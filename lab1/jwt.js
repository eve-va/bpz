const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (username) => {
    return jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: 3600 });
}

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

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