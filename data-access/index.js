const { Pool } = require("pg");
const keys = require("../config/keys");

// TODO: We need to accomodate for different databases per client
const pool = new Pool({
  user: keys.DB_USER,
  host: keys.DB_HOST,
  database: keys.DB_DATABASE,
  password: keys.DB_PASSWORD,
  port: keys.DB_PORT,
  max: 20
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },

  getPool: () => {
    return pool;
  }

  /*
  query: (text, params, callback) => {
    return pool.connect().then(client => {
      return client.query(text, params, callback);
    });
  }
  */

  /*
  query: (text, params, callback) => {
    return pool.connect().then(client => {
      return client
        .query(text, params, callback)
        .then(res => {
          client.release();
          return res;
        })
        .catch(e => {
          client.release();
          return e;
        });
    });
  }
  */
};
