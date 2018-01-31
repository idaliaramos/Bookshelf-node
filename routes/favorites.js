const express = require('express');
const knex = require('../knex');
const router = express.Router();
const { camelizeKeys } = require('humps');
const { JWT_KEY } = require('../env');
var jwt = require('jsonwebtoken');
const boom = require('boom');
// router.use((req, res, next) => {
//   console.log('cookie =', req.cookies);
//   const token = req.cookies.token;
//   if (!token) {
//     res.status(400).send('NOT AUTHOTI');
//   }
//   next();
// });
function checkBook(req, res, next) {
  if (isNaN(parseInt(req.query.bookId))) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Book ID must be an integer');
    return;
  }
  next();
}
function authorize(req, res, next) {
  jwt.verify(req.cookies.token, JWT_KEY, (err, payload) => {
    if (err) {
      res.set('Content-Type', 'text/plain');
      res.sendStatus(401).send('Unauthorized');
      return;
    }

    req.tokenUserId = payload.id;
    next();
  });
}
router.get('/favorites', authorize, (req, res, next) => {
  return knex
    .select(
      'favorites.id',
      'book_id',
      'favorites.user_id',
      'books.created_at',
      'books.updated_at',
      'author',
      'description',
      'cover_url',
      'genre',
      'title'
    )
    .from('favorites')
    .innerJoin('books', 'books.id', 'favorites.book_id')
    .then(result => {
      console.log('result =', camelizeKeys(result));
      return res.status(200).json(camelizeKeys(result));
    })
    .catch();
});
router.get('/favorites/check', checkBook, authorize, (req, res, next) => {
  console.log('in the FAVORITES CHECK', '<<<<<<<<<<<<<<<<<<<<<<');
  let bookId = req.query.bookId;
  const token = req.cookies.token;
  let cert = JWT_KEY;
  const decoded = jwt.verify(token, cert);
  let userId = decoded.id;
  // console.log(typeof parseInt(bookId), '<<<<<<<<<<<<<<<<<<<<<<<<');
  knex('favorites')
    .where({ user_id: userId, book_id: bookId })
    .first()
    .then(result => {
      if (!result) {
        res.status(200);
        res.send(false);
        // res.set('Content-Type', 'text/plain');
        // res.status(400).send('Bad email or password');
        return;
      }
      if (result) {
        res.status(200).json(true);
      }
    });
});

router.post('/favorites', authorize, (req, res, next) => {
  const token = req.cookies.token;
  const userId = jwt.verify(token, JWT_KEY).id;
  const bookId = req.body.bookId;
  console.log(req.query, 'this is the req.query');
  //favorites of book with not interger
  if (isNaN(parseInt(req.body.bookId))) {
    return next(boom.create(400, 'Book ID must be an integer'));
    //one response only can take send, you are sending status code and text before
  }
  //TODO: come back to this part
  //  POST /favorites with unknown bookId

  // if (req.body.bookId !== req.params.bookId) {
  //   console.log('i am here');
  //   return next(boom.create(404, 'Book not found'));
  // }
  // console.log(userId, bookId, 'ids are ');
  knex('favorites')
    .returning(['id', 'user_id', 'book_id'])
    .insert({ user_id: userId, book_id: bookId })
    .then(function(result) {
      res.status(200).json(camelizeKeys(result[0]));
    })
    .catch(error => {
      next(error);
    });
});

router.delete('/favorites', authorize, (req, res, next) => {
  let bookId = req.body.bookId;
  if (isNaN(bookId)) {
    res.set('Applicaton', 'application/json/');
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Book ID must be an integer');
    return;
  }
  knex('favorites').where('book_id', bookId).then(favorites => {
    if (favorites.length === 0) {
      res.set('Applicaton', 'application/json/');
      res.set('Content-Type', 'text/plain');
      res.status(404).send('Favorite not found');
      return;
    }
    knex('favorites')
      .where('book_id', bookId)
      .returning(['book_id', 'user_id'])
      .del()
      .then(favoriteDel => {
        res.json(camelizeKeys(favoriteDel[0]));
      });
  });
});
module.exports = router;
