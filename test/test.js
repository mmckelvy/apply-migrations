const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const { Pool } = require('pg');
const test = require('ava');

const applyMigrations = require('../index');

const db = 'migrations-test';

test.before(async (t) => {
  try {
    // Spin up a db and the pool
    await execAsync(`createdb ${db}`);

    t.context.pool = new Pool({
      host: 'localhost',
      database: db,
      port: 5432,
      user: process.env.USER,
      password: null,
      max: 10
    });

  } catch (err) {
    console.log(err);
    console.log('Could not create db migrations-test');
  }
});

test('From a blank slate', async (t) => {
  await applyMigrations({
    pool: t.context.pool,
    src: `${__dirname}/src`
  });

  // verify that base-schema was recorded
  const results = await t.context.pool.query({
    text: `select filename from migration`
  });

  t.is(results.rows[0].filename, '1_base-schema.sql');
});

test.after.always('Clean up the db', async (t) => {
  await t.context.pool.end();
  await execAsync(`dropdb ${db}`);
  console.log(`${db} dropped.`);
});