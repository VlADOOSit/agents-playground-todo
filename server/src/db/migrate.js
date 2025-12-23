const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const migrationsDir = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz DEFAULT now()
    )
  `);
}

function getMigrationFiles() {
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function getAppliedMigrations() {
  const result = await pool.query('SELECT filename FROM migrations');
  return new Set(result.rows.map((row) => row.filename));
}

async function applyMigration(filename) {
  const filePath = path.join(migrationsDir, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query('INSERT INTO migrations(filename) VALUES ($1)', [filename]);
    await pool.query('COMMIT');
    console.log(`Applied migration ${filename}`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`Failed to apply migration ${filename}`, error);
    throw error;
  }
}

async function runMigrations() {
  await ensureMigrationsTable();

  const migrationFiles = getMigrationFiles();
  const appliedMigrations = await getAppliedMigrations();

  for (const file of migrationFiles) {
    if (appliedMigrations.has(file)) {
      continue;
    }

    await applyMigration(file);
  }

  console.log('Migrations complete.');
}

runMigrations()
  .catch((error) => {
    console.error('Migration failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
