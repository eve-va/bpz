const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config();

const users = [
    {
        username: 'Yeva',
        email: 'yeva.vakhtina1@gmail.com',
        //password: 'password.yeva',
        password: '$2a$08$aXeoStpzf/g7VTr7dihoT.dQA/EjjG5Ed9hCITviuQyl6cPiXUi62',
    },
];

exports.signup = async (req, res) => {
  try {
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    };
    
    users.push(user);
    const token = jwt.sign({ username: user.username }, process.env.TOKEN_SECRET, {
      expiresIn: 3600,
    });

    req.session.token = token;
    res.send({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = users.find(x => x.username === req.body.username);

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        message: "Invalid Password!",
      });
    }

    const token = jwt.sign({ username: user.username }, process.env.TOKEN_SECRET, {
      expiresIn: 3600,
    });
    req.session.token = token;

    return res.status(200).send({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
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
  res.status(200).send(`Hello, ${req.username}`);
};