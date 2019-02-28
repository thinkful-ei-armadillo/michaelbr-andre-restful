const app = require('./app');
const { PORT } = require('./config');
const knexFn = require('knex');

const db = knexFn({
  client: 'pg',
  connection: process.env.DB_URL,
});

app.set('db',db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});