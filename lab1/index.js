const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const { authenticateJWT, generateAccessToken } = require('./jwt');

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'yeva.login',
        password: 'yeva.password',
        username: 'Yeva',
    }
];

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', authenticateJWT, (req, res) => {
    if (req.user) {
        return res.json({
            username: req.user,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => {
        if (user.login == login && user.password == password) {
            return true;
        }
        return false;
    });

    if (user) {
        const accessToken = generateAccessToken(user.username);
        res.json({ accessToken });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
