const axios = require("axios");
const crypto = require('crypto');
require('dotenv').config();

const getAccesstoken = () => {
  const data = {
    audience: process.env.AUDIENCE,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'client_credentials',
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

exports.signup = async (req, res) => {
  const token = await getAccesstoken();

  const data = {
      email: req.body.email,
      user_metadata: {},
      blocked: false,
      email_verified: false,
      app_metadata: {},
      given_name: req.body.given_name,
      family_name: req.body.family_name,
      name: req.body.given_name + ' ' + req.body.family_name,
      username: req.body.username,
      nickname: req.body.username,
      user_id: crypto.randomUUID(),
      connection: 'Username-Password-Authentication',
      password: req.body.password,
      verify_email: false,
  }

  axios({
    method: 'post',
    url: 'https://dev-trdcad7ah6lwjnqk.us.auth0.com/api/v2/users',
    data,
    headers: {
      Authorization: 'Bearer ' + token
    }
  }).then((response) => {
    const username = response.data.username;

    return res.status(200).send(`${username} successfully registered`);
  }).catch((error) => {
    console.log(error);
    return res.status(500).send({ message: error.message });
  });
};

exports.signin = async (req, res) => {
  const data = {
    audience: process.env.AUDIENCE,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'password',
    username: req.body.username,
    password: req.body.password,
    scope: 'offline_access'
  }

  axios({
    method: 'post',
    url: 'https://dev-trdcad7ah6lwjnqk.us.auth0.com/oauth/token',
    data,
  }).then((response) => {
    const access_token = response.data.access_token;
    const refresh_token = response.data.refresh_token;

    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;
    return res.status(200).send({
      username: data.username,
    });
  }).catch((error) => {
    return res.status(500).send({ message: error.message });
  });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({
      message: "You've been signed out!"
    });
  } catch (err) {
    this.next(err);
  }
};

exports.test = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.testUser = (req, res) => {
  console.log('Current token: ' + req.session.access_token);
  res.json({
    data: req.data,
    message: 'Hello from a private endpoint! You need to be authenticated to see this.'
  });
};
