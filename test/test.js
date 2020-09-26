const { Pool } = require('pg');
const test = require('ava');

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const applyMigrations = require('../index');

const db = 'migrations-test';

test.before(async (t) => {
  try {
    // Spin up a db and the pool
    await execAsync(`createdb ${db}`);
    console.log(`Database ${db} created.`);

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
    console.log('Failed at setup.');
  }
});

// Simple base case.
test('applyMigrations - Case 1', async (t) => {
  await applyMigrations({
    pool: t.context.pool,
    src: `${__dirname}/src`
  });

  const results = await t.context.pool.query({
    text: `select filename from migration`
  });

  // verify that base-schema was recorded
  t.is(results.rows[0].filename, '1_base-schema.sql');

  // verify ONLY the base-schema migration was applied.
  t.is(results.rows.length, 1);
});

test.after.always('Clean up the db', async (t) => {
  await t.context.pool.end();
  console.log('Ended the migrations pool.');

  await execAsync(`dropdb ${db}`);
  console.log(`Database ${db} dropped.`);
});
