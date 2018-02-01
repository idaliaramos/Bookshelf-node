const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

const { JWT_KEY } = require('../env');

const { camelizeKeys } = require('humps');

function validateEmail(req, res, next) {
  knex('users').where('email', req.body.email).first().then(email => {
    if (email) {
      res.set('Content-Type', 'text/plain');
      res.status(400).send('Email already exists');
      return;
    }
    req.email = email;
    next();
  });
}
function verifyBody(req, res, next) {
  if (!req.body.firstName) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('First Name must not be blank');
    return;
  }
  if (!req.body.lastName) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Last Name must not be blank');
    return;
  }
  if (!req.body.password || req.body.password.length < 8) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Password must be at least 8 characters long');
    return;
  }

  if (!req.body.email) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Email must not be blank');
    return;
  }

  next();
}
router.post('/users', verifyBody, validateEmail, (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  bcrypt
    .hash(password, saltRounds)
    .then(hashed_password => {
      return knex('users').insert(
        {
          hashed_password,
          first_name: firstName,
          last_name: lastName,
          email
        },
        '*'
      );
    })
    .then(results => {
      console.log(results.id, JWT_KEY, 'id', 'jwt', results[0]);
      delete results[0].hashed_password;
      let cert = JWT_KEY;
      let token = jwt.sign({ id: results.id }, cert);
      console.log(req.body.id, 'this is the token');
      //this is true
      res.cookie('token', token, { httpOnly: true });
      return res.json(camelizeKeys(results[0]));
    })
    .catch(err => {
      console.log(err, 'this is the error');
      next(err);
    });
});
module.exports = router;
