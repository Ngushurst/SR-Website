/*
 * ==========================
 * ||                      ||
 * ||      Server file     ||
 * ||                      ||
 * ==========================
 *
 * This is the primary file for the server. It handles the various routes, and is used to initate the server.
 * Run it from the node command line by calling 'npm start'.
 * 
 * The server can be built into an executable with 'pkg server.js'. Does not include config.js, file store, or database.
 * */
const cluster = require('cluster');
//const compression = require('compression'); // Express middleware - https://www.npmjs.com/package/compression
const CONSTANTS = require('./src/constants');
const cpu_count = require('os').cpus().length;
const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const log = require('./src/log');
const path = require('path');

const Article = require('./src/article');
const User = require('./src/user');

const config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json')); // Do not use path. Using path will cause pkg to pull in the config file.

/*
 * ==========================
 * ||                      ||
 * ||         MAIN         ||
 * ||                      ||
 * ==========================
 * This next bit is the part that runs.
 * Boots up the server and runs it until stopped externally.
 *
 * */
let message; // Message to print/log
if (cluster.isMaster) { // Used to set up worker instances and perform server-wide operations.
  // Log an error if any process fails.
  cluster.on('unhandledRejection', (error) => {
    log, error({ err: error }, 'process');
  })
  for (let i = 0; i < cpu_count; i++) {
    cluster.fork(); // start child proceses on each core.
  }
  cluster.on('exit', (worker, code, signal) => {
    if (code) {
      message = `SR-Server exited with code: ${code}`;
      if (code === 1) { // An unahandled error occured, causing the server to close.
        console.log(message);
        log.error(message);
        cluster.fork(); // boot up another server instance
      } else if (code === 3221225786) { // Master received SIGINT response
        // Shut down worker instance.
      } else { // Something happened to close the process. Log the issued code.
        log.info(`SR-Server exited with an unrecognized code: ${code}`);
      }
    } else if (signal) {
      message = `SR-Server killed with signal: ${signal}`;
      log.info(message);
      console.log(message);
    }
  });
  process.on('SIGINT', function () { // Handling for ctrl-c in console.
    message = 'Shutdown command received. Goodbye~';
    console.log(message);
    log.info(message);
  });
} else { // Starting worker instance.
  message = `Starting SR worker instance on: ${process.pid}`;
  log.info(message);
  console.log(message);
  start_instance(); // Prepare the instance for receiving traffic
}

/*
 * ==========================
 * ||                      ||
 * ||   Helper Functions   ||
 * ||                      ||
 * ==========================
 * 
 * Typically express midleware for direct use in this file.
 * 
 * */

/**
 * Boots up a server for a worker instance, defining the available API calls
 * and routes available.
 * */
function start_instance() {
  // set up constants
  const app = express(); // router used for distributing pages some resources.
  const port = config.config.server_port;
  const staffApi = express.Router(); // router used for all staff-only APIs
  // set up handlers
  const articleHandler = new Article();
  const userHandler = new User();
  // set up express middleware
  app.use(logAction);
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  //app.use(compression); // supposedly compresses the response to increase network performance at the expense of some server work.

  // V MANDATORY V for getting the app to send. If you don't set up the express.static, it'll just send the html files on their own without the rest of the react app or styling.
  app.use(express.static(path.join(__dirname, '../client/build'))); // Regular website
  app.use(express.static(path.join(__dirname, '../admin/build'))); // Staff site

  // Set up the routes

  //app.get('/static/steam_parser/formatting_help', (req, res) => { res.sendFile(path.join(__dirname, "/static_pages/text_formatting/text_formatting.html")) });
  //serve index.html
  app.get('/', (req, res) => { res.sendFile(path.join(__dirname, "../client/build/index.html")) });
  app.get('/admin/', (req, res) => { res.sendFile(path.join(__dirname, "../admin/build/index.html")) });

  // Set up API definitions
  // ----------------------

  // Client APIs
  // -----------
  // Client APIs generally have restricted visibility to data,
  // and can only view published information.

  app.get('/articles', articleHandler.getPublishedArticles);
  app.get('/articles/:id', articleHandler.getPublishedArticle);
  app.get('/categories/:id', articleHandler.getCategories);

  // Staff APIs
  // ----------
  // Staff members will require a login, but can access more
  // information depending on what privileges they have.

  // Articles
  staffApi.delete('/articles/:id', authenticate, articleHandler.deleteArticle);
  staffApi.get('/articles', authenticate, articleHandler.getArticles);
  staffApi.get('/articles/:id/history', authenticate, articleHandler.getArticleHistory);
  staffApi.get('/articles/:id', authenticate, articleHandler.getArticle);
  staffApi.post('/articles', authenticate, articleHandler.addArticle);
  staffApi.put('/articles/:id/edit', authenticate, articleHandler.editArticle);
  staffApi.put('/articles/:id/publish', authenticate, articleHandler.publishArticle);

  // Article Categories
  staffApi.delete('/categories/:id', authenticate, articleHandler.deleteCategory);
  staffApi.get('/categories', authenticate, articleHandler.getCategories);
  staffApi.post('/categories', authenticate, articleHandler.addCategory);
  staffApi.put('/categories/:id', authenticate, articleHandler.editCategory);

  // Log in/out
  staffApi.post('/sign_in', userHandler.signIn);
  staffApi.post('/sign_out', userHandler.signOut);

  // User Accounts
  staffApi.post('/users', authenticate, userHandler.addUser);
  staffApi.put('/users/:id/autobiography', authenticate, userHandler.editAutobiography);
  staffApi.put('/users/:id/pfp', authenticate, userHandler.editProfilePicture);
  staffApi.put('/users/:id', authenticate, userHandler.editUser);
  staffApi.get('/users', authenticate, userHandler.getUsers);
  staffApi.post('/users/first', userHandler.addUser);
  staffApi.get('/users/:id/history', authenticate, userHandler.getUserHistory);

  staffApi.post('/users/password/reset', authenticate, userHandler.resetPassword);
  staffApi.post('/users/password/reset_request', userHandler.requestPasswordReset);

  // User Roles
  staffApi.delete('/roles/:id', authenticate, userHandler.deleteRole);
  staffApi.get('/roles', authenticate, userHandler.getRoles);
  staffApi.get('/roles/:id/history', authenticate, userHandler.getRoleHistory);
  staffApi.post('/roles', authenticate, userHandler.addRole);
  staffApi.put('/roles/:id', authenticate, userHandler.editRole);

  app.use('/admin', staffApi); // All staff APIs must be in the form of url/admin/*

  // Start server
  app.listen(port, () => console.log(`SR worker instance is listening on port: ${port}`));
};


/*
 * Checks a the request for a login token. Verifies that the token
 * is both present and valid before progressing to the next action.
 * */
function authenticate(req, res, next) {
  let token = req.headers.authorization;
  if (token) {
    token = (token.startsWith('Bearer ')) ? token.slice(7, token.length) : token; // Remove extra text at the front.
    jwt.verify(token, config.config.secret, (error, decoded) => {
      if (error) { // Authentication failed. See documentation for error types: https://www.npmjs.com/package/jsonwebtoken
        if (error.message === 'invalid token') { // Object is not a json web token
          return res.status(440).json({ message: 'Invalid token.' });
        } else { // Recognized token that has expired.
          return res.status(440).json({ message: 'Session timed out.' })
        }
      } else { // Token is valid.
        req.decodedToken = decoded; // Attach contents for req for later use.
        next(); // Advance to the next middleware function.
      }
    });
  } else { // No authentication provided
    return res.status(400).json({ message: 'Authorization token not supplied.' });
  }
}

/*
 * Action logging middleware. Logs and times every valid request to the server.
 * Sets up handlers for timeout in the req object and successful completion in the res object.
 * */
function logAction(req, res, next) {
  const start = Date.now();
  req.on('timeout', () => { // Indicate that the request timed out.
    log.error({ err: `Request timed out: ${req.method} ${req.originalUrl}` }, 'server.logAction');
  });
  res.on('finish', () => { // Request finished successfully.
    const duration = Date.now() - start;
    log.info({ duration }, `${ req.method } ${ req.originalUrl }`);
    console.log(`${req.method} ${req.originalUrl} time(ms) ${duration}`);
  });
  next(); // proceed to next middleware
}