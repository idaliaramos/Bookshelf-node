const express = require('express');
const router = express.Router();
const knex = require('../knex');
// const humps = require('lodash-humps');
const { camelizeKeys } = require('humps');
//verify book id, if not id responds with not found, if there is a book then it will
//attach the book to the request
function verifyId(req, res, next) {
  // TODO: req.book = bookYouGetFromDatabase;
  knex('books').where('id', req.params.id).first().then(book => {
    if (!book) {
      res.set('Content-Type', 'text/plain');
      res.status(404).send('Not Found');
      return;
    }
    req.book = book;
    next();
  });
}
//verifies that the body for the book contains all the information needed
function verifyBody(req, res, next) {
  if (!req.body.title) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Title must not be blank');
    return;
  }
  if (!req.body.author) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Author must not be blank');
    return;
  }
  if (!req.body.genre) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Genre must not be blank');
    return;
  }

  if (!req.body.description) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Description must not be blank');
    return;
  }
  if (!req.body.coverUrl) {
    res.set('Content-Type', 'text/plain');
    res.status(400).send('Cover URL must not be blank');
    return;
  }

  next();
}
//route that returns all of the books ordered by title
router.get('/books', function(req, res, next) {
  return knex('books')
    .orderBy('title')
    .then(result => {
      res.json(camelizeKeys(result));
      res.status(200);
    })
    .catch(err => {
      next(err);
    });
});
//gets the book by the id specified
router.get('/books/:id(\\d+)', verifyId, (req, res, next) => {
  return knex('books')
    .where('id', req.params.id)
    .first()
    .then(book => {
      // TODO: Need logic here to check if book exists
      res.status(200);
      // res.set('Accept', 'application/json');
      res.json(camelizeKeys(book)); // req.book
    })
    .catch(err => {
      next(err);
    });
});
// posts to the books with the attributes provided
router.post('/books', verifyBody, (req, res, next) => {
  let attributes = {
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    description: req.body.description,
    cover_url: req.body.coverUrl
  };

  return knex('books')
    .insert(attributes, '*')
    .then(book => {
      res.status(200);
      return res.send(camelizeKeys(book[0]));
    })
    .catch(err => {
      next(err);
    });
});
//edits the book with the id specified
router.patch('/books/:id(\\d+)', verifyId, (req, res, next) => {
  let attributes = {
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    description: req.body.description,
    cover_url: req.body.coverUrl
  };
  const id = req.params.id;

  return knex('books')
    .where({ id })
    .then(books => {
      return knex('books').update(attributes, '*').where('id', req.params.id);
    })
    .then(books => {
      res.status(200);
      res.json(camelizeKeys(books[0]));
    });
});
//deletes books with the id specified
router.delete('/books/:id(\\d+)', verifyId, (req, res, next) => {
  return (
    knex('books')
      .del()
      .where('id', req.params.id)
      // })
      .then(() => {
        delete req.book.id;
        res.json(camelizeKeys(req.book));
        res.status(200);
      })
      .catch(err => {
        next(err);
      })
  );
});

module.exports = router;
