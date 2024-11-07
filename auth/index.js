const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

// Replace with your actual user data store
const users = {
  "testuser": {
    "username": "testuser",
    "email": "testuser@example.com",
    "passwordHash": "$2b$08$VqP4NNRihosU849xMdWCfuF/xsXzshSUmp3xS03AtvJFenSuMD95y" // Example hash for "password"
  }
};

const secret = 'your-secret-key'; // Replace with your actual secret key

app.post('/login', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('Authorization failed');
  }

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

  const user = users[username];
  if (!user) {
    return res.status(401).send('Authorization failed');
  }

  bcrypt.compare(password, user.passwordHash, (err, result) => {
    if (err || !result) {
      return res.status(401).send('Authorization failed');
    }

    const token = jwt.sign({
      exp: Math.floor(Date.now() / 1000) + (1 * 60), // 1 minute
      iss: 'auth.service',
      iat: Math.floor(Date.now() / 1000),
      email: user.email,
      sub: user.username
    }, secret);

    res.json({ token });
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// Authorization: Basic dGVzdHVzZXI6cGFzc3dvcmQ=
