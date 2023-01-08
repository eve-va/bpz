const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
require('dotenv').config();

const { verifyToken } = require("./jwt");
const utils = require("./utils.js");

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "BPZ",
    secret: process.env.COOKIE_SECRET,
    httpOnly: true
  })
);

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Content-Type, Accept"
  );
  next();
});

app.get("/api/test/", utils.test);
app.get("/api/test/user", verifyToken, utils.testUser);

app.post("/api/auth/signup", utils.signup);
app.post("/api/auth/signin", utils.signin);
app.post("/api/auth/signout", utils.signout);

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
