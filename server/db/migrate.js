const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const migrationsDir = path.join(__dirname, 'migrations');

async function migrate() {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

		const appliedMigrations = (await client.query('SELECT filename FROM migrations ORDER BY filename')).rows.map(row => row.filename);
		const migrationFiles = fs.readdirSync(migrationsDir).sort();

		for (const file of migrationFiles) {
			if (!file.endsWith('.sql')) continue;
			if (appliedMigrations.includes(file)) continue;

			const filePath = path.join(migrationsDir, file);
			const sql = fs.readFileSync(filePath, 'utf8');

			console.log(`Applying migration: ${file}`);
			await client.query(sql);
			await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
		}

		await client.query('COMMIT');
		console.log('Migrations applied successfully!');
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error applying migrations:', error);
	} finally {
		client.release();
	}
}

migrate().catch(err => {
	console.error('Migration script failed:', err);
	process.exit(1);
});

