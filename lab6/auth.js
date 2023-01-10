const axios = require('axios');
require('dotenv').config();

const authorize = (code) => {
  let options = {
    method: 'post',
    url: `${process.env.ISSUER_BASE_URL}/oauth/token`,
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    data: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
      redirect_uri: 'http://localhost:3000/callback',
    })
  };

  return axios.request(options).then(function (response) {
    const access_token = response.data.access_token;
    return access_token;
  }).catch(function (error) {
    console.error(error);
  });
};

module.exports = { authorize };