const express = require('express');
const knex = require('../knex');
const router = express.Router();
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { camelizeKeys } = require('humps');
const { JWT_KEY } = require('../env');
var jwte = require('express-jwt');
//
// router.use(
//   jwte({
//     secret: JWT_KEY,
//     requestProperty: 'jwte.payload'
//   }) //req.jwt.payload
//     .unless({
//       path: [{ url: '/token', methods: ['GET'] }]
//path: [{ url: '/token', methods: ['POST'] }]

//     })
// );

function verifyBody(req, res, next) {
  if (req.body.email === '') {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Email must not be blank');
    return;
  }
  if (!req.body.password) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Password must not be blank');
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

function authenticate(req, res, next) {
  return knex('users').where('email', req.body.email).first().then(email => {
    if (!email) {
      res.set('Content-Type', 'text/plain');
      res.status(400).send('Bad email or password');
      return;
    } else {
      //get the id of the email and then check the password
      //if the password matches the bcrypt hash
      //give cookie
    }
    req.email = email;
    next();
  });
}

router.get('/token', (req, res, next) => {
  if (!req.cookies.token) {
    res.json(false);
    return;
  }

  res.json(true);
});

router.post('/token', verifyBody, authenticate, (req, res, next) => {
  //check that pasword matches the username
  let user = {};
  return knex('users')
    .where('email', req.body.email)
    .first()
    .then(userInfo => {
      user.id = userInfo.id;
      user.email = userInfo.email;
      user.firstName = userInfo.first_name;
      user.lastName = userInfo.last_name;
      if (!userInfo.email) {
        res.status(400).send('Bad email or password');
        return;
      }
      return userInfo.hashed_password;
    })
    .then(hashed_password => {
      bcrypt.compare(req.body.password, hashed_password, function(
        err,
        isValid
      ) {
        if (isValid === false) {
          res.set('Content-Type', 'text/plain');
          res.status(400).send('Bad email or password');
          return;
        }
        if (isValid === true) {
          let cert = JWT_KEY;
          let token = jwt.sign({ id: user.id }, cert);
          // console.log(token, 'this is the token');
          //this is true
          res.cookie('token', token, { httpOnly: true }).json(user);
        }
      });
    });
});

router.delete('/token', (req, res, next) => {
  res.clearCookie('token');
  res.send(true);
});

module.exports = router;
