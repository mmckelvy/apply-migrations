# Apply migrations
Simple, predictable migrations for [node-pg](https://node-postgres.com/).

## Install
```
npm install @mmckelvy/apply-migrations --save
```

## Usage
Create a directory and add your migrations as `.sql` files.  The naming convention for your files is as follows:

```
<order number>[separator]<migration name>.sql
```

Examples of valid filenames:

```
1_base-schema.sql <-- Best practice

2-adjust-column.sql
v003_drop-constraint.sql
4add-3-columns.sql
```

**The only thing that matters is the first number that appears in the filename.**  That will be used to sort the migration files in ascending order.  Using a separator such as `_` is optional, but encouraged for your own readability.

Once you have your directory with your migration files set up, in a separate file import the `applyMigrations` function and apply your migrations:

```
const { Pool } = require('pg');
const applyMigrations = require('@mmckelvy/apply-migrations');

// an instance of a typical node-pg pool.
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
  src: `${__dirname}/src` // assumes your migration directory is called 'src'
});

```

## Test
```
npm test
```

