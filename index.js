const path = require('path');
const fs = require('fs');
const diffArrays = require('@mmckelvy/diff-arrays');
const { query } = require('@mmckelvy/pg-query');

const versionSort = require('./version-sort');

module.exports = async function applyMigrations({ pool, src }) {
  const allMigrations = fs.readdirSync(src);
  let appliedMigrations;

  try {
    /*
    Capture any applied migrations.
    If this is the first time this script is run
    there won't be a migrations table so this will throw an error
    that we'll need to catch.
    */
    try {
      const results = await query({
        pool,
        sql: `${__dirname}/get-migrations.sql`
      });

      appliedMigrations = results.rows;

      console.log('Migrations already applied:\n');
      console.log(appliedMigrations);

    } catch (err) {
      appliedMigrations = [];
    }

    /*
    Set up and sort any pending migrations.
    */
    const pendingMigrations = diffArrays(
      allMigrations,
      appliedMigrations.map(m => m.filename)
    );

    versionSort(pendingMigrations, {inPlace: true});

    // No migrations, bail.
    if (!pendingMigrations.length) {
      console.log('No migrations to apply.');

      await pool.end();
      console.log('Ended the migration pool.');
      return;
    }

    /*
    Apply any pending migrations.
    */
    for (const migration of pendingMigrations) {
      // We want to log any migration failure, so we'll
      // wrap each attempt in a try/catch
      try {
        // apply the migration
        await query({
          pool,
          sql: `${src}/${migration}`
        });

        // update the migration table in the db
        await query({
          pool,
          sql: `${__dirname}/record-migration.sql`,
          values: {
            filename: migration
          }
        });

        console.log(`${migration} applied.`);

      } catch (err) {
        console.log(`${migration} FAILED.`);
        // pass control to the main error handler.
        throw err;
      }

      /*
      Success. End the pool and log the results.
      */

      await pool.end();
      console.log('Ended the migration pool.');
    }

  // Main error handler
  } catch (err) {
    console.log('There was a problem with the migrations:\n');
    console.log(err);
    await pool.end();
    console.log('Ended the migration pool.');
  }
};
