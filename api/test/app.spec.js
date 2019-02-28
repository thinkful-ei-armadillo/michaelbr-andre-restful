/* global supertest */
const knexFn = require('knex');
const app = require('../src/app');
const bookmarks = require('./fixtures');
const { PORT } = require('../src/config');
const { expect } = require('chai');

const tableName = 'bookmarks';

describe('Testing bookmarks endpoints...', () => {
  let db;

  before(() => {
    db = knexFn({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });

    app.set('db', db);

    /*app.listen(PORT, () => {
      next();
      //console.log(`Server listening at http://localhost:${PORT}`);
    });*/
  });

  after(() => db.destroy());

  before(() => db(tableName).truncate());

  beforeEach(() => db.into(tableName).insert(bookmarks));
  afterEach(() => db(tableName).truncate());

  
  it('GET /bookmarks returns something', (next) => {
    supertest(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${process.env.API_KEY}`)
      .expect(200, next);
  });

  it('DELETE /bookmarks should delete bookmark', (next) => {
    db.select('*').from('bookmarks')
      .then(res => {
        supertest(app)
          .delete(`/api/bookmarks/${res[0].id}`)
          .set('Authorization', `Bearer ${process.env.API_KEY}`)
          .expect(204, next);
      });
  });

  it('UPDATE /bookmarks should return 204', (next) => {
    const title = {
      title: '2MDN',
      url: '4https://developer.mozilla.org',
      description: 'The4 only place to find web documentation',
      rating: 4
    };

    supertest(app)
      .patch('/api/bookmarks/3')
      .set('Authorization', `Bearer ${process.env.API_KEY}`)
      .send(title)
      .expect(204, next);
  });

  it('UPDATE /bookmarks should update the database table', (next) => {
    const id = 1;
    const bookmark = {
      title: 'TESTMDN',
      url: 'https://developer.mozilla.test',
      description: 'The4 only place to find web documentation testing',
      rating: 3
    };

    supertest(app)
      .patch(`/api/bookmarks/${id}`)
      .set('Authorization', `Bearer ${process.env.API_KEY}`)
      .send(bookmark)
      .end(function(err, res) {
        //console.log('RESPONSE:', res);
        db
          .select('*')
          .from('bookmarks')
          .where('title', bookmark.title)
          .then(result => {
            /*supertest(app)
              .patch(`/api/bookmarks/${id}`)
              .send(title)
              .expect(204, next);*/
    
            expect(result[0]).to.be.include(bookmark);
          });

        next();
      });
  });

  it('UPDATE /bookmarks should require an ID', (next) => {
    supertest(app)
      .patch('/api/bookmarks/')
      .set('Authorization', `Bearer ${process.env.API_KEY}`)
      .expect(400, next);
  });

  it('INSERT /bookmark should insert a new bookmark', (next) => {
    const newBookmark = {
      title: '2MDN',
      url: '4https://developer.mozilla.org',
      description: 'The4 only place to find web documentation',
      rating: 4
    };

    supertest(app)
      .post('/api/bookmarks')
      .set('Authorization', `Bearer ${process.env.API_KEY}`)
      .send(newBookmark)
      .expect(204, next);
  });

});