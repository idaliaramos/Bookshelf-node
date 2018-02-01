const {
  PGHOST,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  DATABASE_URL
} = require('./env');

module.exports = {
  [process.env.NODE_ENV]: {
    client: 'pg',
    connection: {
      host: PGHOST,
      database: PGDATABASE,
      user: PGUSER,
      password: PGPASSWORD
    }
  },
  production: {
    client: 'pg',
    connection: {
      database: DATABASE_URL,
      user: PGUSER,
      password: PGPASSWORD
    }
  }
};
