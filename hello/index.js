const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

const httpPort = 8080;
const healthPort = 8181;
const version = "1.0.0";

// --- Health Check Endpoints ---
app.get('/healthz', (req,res) => {
    res.status(200).send('OK\n');
})

app.get('/readiness', (req, res) => {
    res.status(200).send('OK\n'); 
});

app.get('/healthz/status', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/readiness/status', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// --- JWT Authentication Middleware --- 
const jwtSecret = process.env.JWT_SECRET;
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

// --- Application Endpoints ---
app.get('/', (req, res) => {
  res.send('Hello, world!\n');
});

app.get('/secure', authenticateJWT, (req, res) => {
  res.send('Hello, secure world!\n');
});

app.get('/version', (req, res) => {
  res.send(`Version: ${version}\n`);
});

// --- Start Servers ---
const httpServer = app.listen(httpPort, () => {
  console.log(`HTTP server listening on port ${httpPort}`);
});

const healthServer = app.listen(healthPort, () => {
  console.log(`Health server listening on port ${healthPort}`);
});

// --- Graceful Shutdown ---
process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down...');

  httpServer.close(() => {
    console.log('HTTP server closed.');
  });

  healthServer.close(() => {
    console.log('Health server closed.');
    process.exit(0); 
  });
});


