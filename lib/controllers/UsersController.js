const knex = require('../../knex');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const { JWT_KEY } = require('../../env');
class UsersController {
  constructor({ usersRepository }) {
    this._usersRepository = usersRepository;
    this.createUser = this.createUser.bind(this);
  }
  //Creating a user
  createUser(req, res, next) {
    const { firstName, lastName, email, password } = req.body;
    //check that email is unique, if not this sends a response back
    function validateEmail(req, res, next) {
      knex('users').where('email', req.body.email).first().then(email => {
        //if email exists already, exits with 400 and a message
        if (email) {
          res.set('Content-Type', 'text/plain');
          res.status(400).send('Email already exists');
          return;
        }
        req.email = email;
        next();
      });
    }
    //verifies the information  was complete
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
    }

    validateEmail(req, res, next);
    verifyBody(req, res, next);
    // if all succeeds it will encrypt the password using bcrypt, and will NOT store plain text password
    return bcrypt
      .hash(password, saltRounds)
      .then(hashed_password => {
        return this._usersRepository.createUser({
          hashed_password,
          first_name: firstName,
          last_name: lastName,
          email
        });
      })
      .then(user => {
        let cert = JWT_KEY;
        let token = jwt.sign({ id: user.id }, cert);
        res.cookie('token', token, { httpOnly: true });
        res.json(user);
      })
      .catch(error => {
        console.log(error.message);
        res.status(404);
      });
  }
}

module.exports = UsersController;
