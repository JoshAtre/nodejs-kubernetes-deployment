const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
var os = require("os");

const app = express();

const jwtSecret = 'your-secret-key';

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);

  }
};

// Secure endpoint
app.get('/mybackendapi', authenticateJWT, (req, res) => {
  res.send(`Hello from ${os.hostname()}!\n`);
});

const port = 9000
app.listen(port, () => {
    console.log(`Backend service listening on port ${port}`);
});
