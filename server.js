'use strict';

require('./env');

const express = require('express');
const app = express();

app.disable('x-powered-by');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

switch (process.env.NODE_ENV) {
  case 'development':
    app.use(morgan('dev'));
    break;
  case 'production':
    app.use(morgan('short'));
    break;
  default:
}

app.use(bodyParser.json());
app.use(cookieParser());

const path = require('path');

app.use(express.static(path.join('public')));

// CSRF protection
app.use((request, response, next) => {
  if (/json/.test(request.get('Accept'))) {
    next();
    return;
  }
  response.sendStatus(406);
});
//set routes for app
const books = require('./routes/books');
const favorites = require('./routes/favorites');
const token = require('./routes/token');
const users = require('./routes/users');

app.use(books);
app.use(favorites);
app.use(token);
app.use(users);

app.use((request, response) => {
  response.sendStatus(404);
});

app.use((error, request, response, next) => {
  if (error.output && error.output.statusCode) {
    response
      .status(error.output.statusCode)
      .set('Content-Type', 'text/plain')
      .send(error.message);
    return;
  }

  console.error(error.stack); // eslint-disable-line no-console
  response.sendStatus(500);
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  if (process.env.NODE_ENV === 'test') return;
  console.log(`Listening on port ${port}`); // eslint-disable-line no-console
});

module.exports = app;
