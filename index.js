const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const diffArrays = require('@mmckelvy/diff-arrays');
const { query } = require('@mmckelvy/pg-query');

const versionSort = require('./version-sort');

module.exports = async function applyMigrations({ db }) {
  const pool = new Pool(db);
  const migrationDir = path.join(__dirname, '../src');

  const allMigrations = fs.readdirSync(migrationDir);
  let appliedMigrations;

  try {
    appliedMigrations = await queryDb({
      pool,
      sql: `${__dirname}/get-migrations.sql`
    });

    console.log('Migrations already applied:\n');
    console.log(appliedMigrations);

  } catch (err) {
    appliedMigrations = [];
  }

  const pendingMigrations = diffArrays(
    allMigrations,
    appliedMigrations.map(m => m.filename)
  );

  versionSort(pendingMigrations, {inPlace: true});

  if (!pendingMigrations.length) {
    console.log('No migrations to apply.');

    await pool.end();
    return;
  }

  for (const migration of pendingMigrations) {
    // apply the migration
    await query({
      pool,
      sql: `${migrationDir}/${migration}`
    });

    // update the migration table in the db
    await query({
      pool,
      sql: `${__dirname}/record-migration.sql`,
      values: {
        filename: migration
      }
    });

    console.log(`Migration ${migration} applied.`);
  }

  pool.end().then(() => console.log('Ended the migrations pool'));
};