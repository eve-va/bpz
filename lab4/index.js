const express = require('express');
const bodyParser = require('body-parser');
const port = 3000;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    if (req.session.username) {
        return res.json({
            username: req.session.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

// app.get('/logout', (req, res) => {
//     sessions.destroy(req, res);
//     res.redirect('/');
// });

/*
var request = require("request");

var options = { method: 'POST',
  url: 'https://YOUR_DOMAIN/oauth/token',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form:
   { grant_type: 'password',
     username: 'USERNAME',
     password: 'PASSWORD',
     audience: 'API_IDENTIFIER',
     scope: 'SCOPE',
     client_id: 'YOUR_CLIENT_ID',
     client_secret: 'YOUR_CLIENT_SECRET' }
   };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
*/

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (user) {
        const accessToken = generateAccessToken(user.username);
        res.json({ accessToken });
    }

    res.status(401).send();


    if (user) {
        req.session.username = user.username;
        req.session.login = user.login;

        res.json({ token: req.sessionId });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
