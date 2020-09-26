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

    t.context.migrationsPool = new Pool({
      host: 'localhost',
      database: db,
      port: 5432,
      user: process.env.USER,
      password: null,
      max: 10
    });

    t.context.testPool = new Pool({
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
    pool: t.context.migrationsPool,
    src: `${__dirname}/src`
  });

  // verify that base-schema was recorded
  const results = await t.context.testPool.query({
    text: `select filename from migration`
  });

  t.is(results.rows[0].filename, '1_base-schema.sql');
});

test.after.always('Clean up the db', async (t) => {
  await t.context.testPool.end();
  console.log('Ended the test pool.');

  await execAsync(`dropdb ${db}`);
  console.log(`Database ${db} dropped.`);
});