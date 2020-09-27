const { Pool } = require('pg');
const applyMigrations = require('@mmckelvy/apply-migrations');

(async () => {
  const pool = new Pool({
    host: 'localhost',
    database: db,
    port: 5432,
    user: process.env.USER,
    password: null,
    max: 10
  });

  await applyMigrations({
    pool,
    src: `${__dirname}/src`
  });

  await pool.end();
})();
