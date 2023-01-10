const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const auth = require('./auth');
const crypto = require('crypto');

const port = 3000;
const currentState = crypto.randomUUID().slice(0, 6);
const authUrl = `${process.env.ISSUER_BASE_URL}/authorize?response_type=code&audience=${process.env.AUDIENCE}&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&scope=openid%20name%20email&state=${currentState}`;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';

class Session {
    #sessions = {}

    constructor() {
        try {
            this.#sessions = fs.readFileSync('./sessions.json', 'utf8');
            this.#sessions = JSON.parse(this.#sessions.trim());

            console.log(this.#sessions);
        } catch(e) {
            this.#sessions = {};
        }
    }

    #storeSessions() {
        fs.writeFileSync('./sessions.json', JSON.stringify(this.#sessions), 'utf-8');
    }

    set(key, value) {
        if (!value) {
            value = {};
        }
        this.#sessions[key] = value;
        this.#storeSessions();
    }

    get(key) {
        return this.#sessions[key];
    }

    destroy(req) {
        const sessionId = req.sessionId;
        delete this.#sessions[sessionId];
        this.#storeSessions();
    }
}

const sessions = new Session();

app.get('/callback', async (req, res) => {
  res.sendFile(path.join(__dirname+'/callback.html'));
})

app.get('/authorize', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (state !== currentState) {
      return res.status(401).end();
    }
    const token = await auth.authorize(code);

    if (token) {
      try {
        const key = fs.readFileSync('./key.pem', 'utf8');
        const decoded = jwt.verify(token, key);
        sessions.set(token, {})
        return res.json({ token });
      } catch (err) {
        console.error(err);
        return res.status(401).end();
      }
    }

    return res.status(401).end();
  } catch (err) {
    console.error(err);
    return res.status(401).end();
  }
})

app.use(async (req, res, next) => {
    let currentSession;
    let sessionId = req.get(SESSION_KEY);

    if (sessionId) {
        const key = fs.readFileSync('./key.pem', 'utf8');
        try {
          jwt.verify(sessionId, key);
        } catch (err) {
          console.error(err);
          return res.status(401).end();
        }
        currentSession = sessions.get(sessionId);
    }

    req.session = currentSession;
    req.sessionId = sessionId;

    next();
});

app.get('/', (req, res) => {
    if (req.session) {
        return res.json({
            logout: `http://localhost:${port}/logout`
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', async (req, res) => {
    res.redirect('/');
});

app.get('/login', async (req, res) => {
  return res.redirect(authUrl);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
