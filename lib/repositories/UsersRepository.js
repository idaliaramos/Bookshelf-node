const { camelizeKeys } = require('humps');
//UsersRepository adds users to the database with the atributes
class UsersRepository {
  constructor({ db }) {
    this._db = db;
  }
  //adding user to db
  createUser(attributes) {
    return this._db('users').insert(attributes, '*').then(results => {
      //removing the hashed_password for safety
      delete results[0].hashed_password;
      return camelizeKeys(results[0]);
    });
  }
}
module.exports = UsersRepository;
