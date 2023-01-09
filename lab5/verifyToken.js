const fs = require('fs');
const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const axios = require('axios');

const refreshToken = (refresh_token) => {
    const data = {
      refresh_token,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'refresh_token',
    }
  
    return axios({
      method: 'post',
      url: 'https://dev-trdcad7ah6lwjnqk.us.auth0.com/oauth/token',
      data,
    }).then((response) => {
      return response.data.access_token;
    }).catch((error) => {
      console.log(error);
    });
  }

exports.verifyToken = async (req, res, next) => {
    const key = fs.readFileSync('./key.pem', 'utf8');
    const access_token = req.session.access_token;

    if (!access_token) {
        return res.status(403).send({
            message: "No token provided!",
        });
    }

    const { exp } = jwtDecode(access_token);
    const currentTime = Date.now().valueOf() / 1000;
    
    console.log('time:' + Math.abs(currentTime - exp));

    if (Math.abs(currentTime - exp) < 86380) {
        const refresh_token = req.session.refresh_token;
        const new_access_token = await refreshToken(refresh_token);
        console.log('Old token: ' + req.session.access_token);
        req.session.access_token = new_access_token;
        console.log('New token: ' + req.session.access_token);
        next();
    }

    try {
        const decoded = jwt.verify(access_token, key);
        req.data = decoded.data;
        next();
    } catch (err) {
        return res.status(401).send({
            message: "Unauthorized!",
        });
    }
}
