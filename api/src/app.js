require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const BookmarksService = require('./bookmarksService');

const app = express();
const router = express.Router();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(router);


app.use(function handleToken(req, res, next) {
  let authToken = req.get('Authorization').split(' ')[1];
  let apiKey = process.env.API_KEY;

  if (authToken !== apiKey) {
    return res.status(401).send('Unauthorized');
  }

  next();
});

app.use(function errorHandler(error, req, res) {
  let response;

  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});


// endpoints
router.route('/api/bookmarks')
  .get((req, res, next) => {
    return BookmarksService.getAll(req.app.get('db'))
      .then(result => {
        return res.json(result);
      })
      .catch(next);
  })
  .patch(express.json(), (req, res) => {
    return res.status(400).send('Please add an id to update');
  })
  .post(express.json(), (req, res) => {
    const { title, url, description, rating } = req.body;
    const bookmark = { title, url, description, rating };

    BookmarksService.insert(req.app.get('db'), bookmark)
      .then(result => {
        res.status(204).location(`http://localhost:8000/api/bookmarks/${result.id}`).end();
      });
  });

router.route('/api/bookmarks/:id')
  .get((req, res) => {
    BookmarksService.getById(req.app.get('db'), req.params.id)
      .then(result => {
        if (result[0]) {
          res.json(result[0]);
        } else {
          res.status(404).send('Bookmark not found');
        }
      });
  })
  .delete((req, res, next) => {
    BookmarksService.delete(req.app.get('db'), Number(req.params.id))
      .then((results) => {
        if (results > 0)
          res.status(204).end();
        else
          res.status(404).send('Bookmark not found');
      })
      .catch(next);
  })
  .patch(express.json(), (req,res,next) => {
    BookmarksService.getById(req.app.get('db'), req.params.id)
      .then(results => {
        const {title: newTitle, description: newDes, url: newUrl, rating: newRating} = req.body;
        const {title, description, url, rating} = results;
        const bookmark = {
          title: newTitle || title,
          description: newDes || description,
          url: newUrl || url,
          rating: newRating || rating
        };

        if(newTitle === '' || newDes === '' || newUrl === '' || newRating === '') {
          return res.status(400).end();
        }

        BookmarksService.update(req.app.get('db'), req.params.id, bookmark)
          .then(results => {
            if(results > 0)
              res.status(204).end();
            else  
              res.status(400).send('User error');
          })
          .catch(next);
      })
      .catch(next);
  });

module.exports = app;