const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const migrationsDir = path.join(__dirname, 'migrations');

async function migrate() {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		// Create migrations table if it doesn't exist
		await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

		// Get list of applied migrations
		const appliedMigrations = (await client.query('SELECT filename FROM migrations ORDER BY filename')).rows.map(row => row.filename);
		const migrationFiles = fs.readdirSync(migrationsDir)
			.filter(file => file.endsWith('.sql'))
			.sort();

		console.log(`Found ${migrationFiles.length} migration files`);

		for (const file of migrationFiles) {
			if (appliedMigrations.includes(file)) {
				console.log(`Migration ${file} already applied, skipping...`);
				continue;
			}

			const filePath = path.join(migrationsDir, file);
			const sql = fs.readFileSync(filePath, 'utf8');

			console.log(`Applying migration: ${file}`);
			try {
				await client.query(sql);
				await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
				console.log(`✓ Migration ${file} applied successfully`);
			} catch (error) {
				console.error(`✗ Failed to apply migration ${file}:`, error.message);
				throw error;
			}
		}

		await client.query('COMMIT');
		console.log('All migrations applied successfully!');
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error applying migrations:', error);
		process.exit(1);
	} finally {
		client.release();
	}
}

migrate().catch(err => {
	console.error('Migration script failed:', err);
	process.exit(1);
});

