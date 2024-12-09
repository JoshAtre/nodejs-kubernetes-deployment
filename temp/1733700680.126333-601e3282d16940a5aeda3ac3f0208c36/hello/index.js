const express = require('express');
const jwt = require('jsonwebtoken');
const pino = require('pino');
const axios = require('axios');
const config = require('config')

const app = express();
const logger = pino({
  level: 'debug'
});

const backendHostname = config.get("backend.host")
const backendPort = config.get("backend.port")
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
const jwtSecret = 'your-secret-key';
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  logger.debug(`Received auth header: ${authHeader}`)

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    logger.debug(`Token: ${token}`)

    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        logger.debug(`JWT validation failed: ${err}`)
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
  const authHeader = req.headers.authorization;
  axios.get(`http://${backendHostname}:${backendPort}/mybackendapi`, { 'headers': { 'Authorization': authHeader} })
  .then((response) => {
    res.send(response.data + " :1")
  })
  .catch((error) => {
    console.log(error.code)
    console.error(error);
    if (error.code && (error.code == "ECONNREFUSED" || error.code == "ENOTFOUND")) {
      res.sendStatus(503)
    }
    if (error.response) {
      statusCode = error.response.status
      console.log(`Status code = ${statusCode}`)
      switch (statusCode) {
        case 401:
        case 403:
          res.send(statusCode)
          break
        default:
          res.send(statusCode)
      }
    }
  });
});

app.get('/version', (req, res) => {
  res.send(`Version: ${version}\n`);
});

// --- Start Servers ---
const httpServer = app.listen(httpPort, () => {
  logger.info(`HTTP server listening on port ${httpPort}`);
});

const healthServer = app.listen(healthPort, () => {
  logger.info(`Health server listening on port ${healthPort}`);
});

// --- Graceful Shutdown ---
process.on('SIGINT', () => {
  logger.info('SIGINT signal received. Shutting down...');

  httpServer.close(() => {
    logger.info('HTTP server closed.');
  });

  healthServer.close(() => {
    logger.info('Health server closed.');
    process.exit(0); 
  });
});
