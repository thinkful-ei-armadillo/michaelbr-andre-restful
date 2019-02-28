/* global supertest */
const knexFn = require('knex');
const app = require('../src/app');
const bookmarks = require('./fixtures');
const { PORT } = require('../src/config');

const tableName = 'bookmarks';

describe('Testing bookmarks endpoints...', () => {
  let db;

  before((next) => {
    db = knexFn({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });

    db(tableName).truncate()

    app.set('db', db);

    app.listen(PORT, () => {
      next();
      console.log(`Server listening at http://localhost:${PORT}`);
    });
  });

  beforeEach((next) => {
    db.into(tableName).insert(bookmarks);
    next();
  });

  afterEach((next) => {
    db(tableName).truncate();
    next();
  });

  after(() => db.destroy());

  
  it('GET /bookmarks returns something', (next) => {
    supertest(app)
      .get('/bookmarks')
      .expect(200, next);
  });

  it('DELETE /bookmarks should delete bookmark', (next) => {
    db.select('*').from('bookmarks')
      .then(res => {
        supertest(app)
          .delete(`/bookmarks/${res[0].id}`)
          .expect(204, next);
      });
  });

  it('UPDATE /bookmarks should update bookmark', (next) => {
    const title = {
      title: '2MDN',
      url: '4https://developer.mozilla.org',
      description: 'The4 only place to find web documentation',
      rating: 4
    }

    supertest(app)
      .patch('/bookmarks/3')
      .send(title)
      .expect(204, next);
  });

  it('INSERT /bookmark should insert a new bookmark', (next) => {
    const newBookmark = {
      title: '2MDN',
      url: '4https://developer.mozilla.org',
      description: 'The4 only place to find web documentation',
      rating: 4
    }

    supertest(app)
      .post('/bookmarks')
      .send(newBookmark)
      .expect(204, next);
  })

});