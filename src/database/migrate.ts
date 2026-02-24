import fs from 'fs';
import path from 'path';
import pool from '../config/database';

const migrate = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting migration...');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of migration files
    let migrationsDir = path.join(__dirname, 'migrations');
    
    // Check if migrations dir exists in current location (dist), if not check src
    if (!fs.existsSync(migrationsDir)) {
      migrationsDir = path.join(process.cwd(), 'src', 'database', 'migrations');
      console.log(`📂 Migrations not found in dist, checking: ${migrationsDir}`);
    } else {
      console.log(`📂 Found migrations in: ${migrationsDir}`);
    }

    if (!fs.existsSync(migrationsDir)) {
      console.error(`❌ Migrations directory not found at: ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Get executed migrations
    const { rows: executedMigrations } = await client.query(
      'SELECT name FROM migrations'
    );
    const executedNames = executedMigrations.map(row => row.name);

    // Run new migrations
    for (const file of files) {
      if (!executedNames.includes(file)) {
        console.log(`▶️  Running migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          console.log(`✅ Completed: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`❌ Failed: ${file}`);
          throw err;
        }
      } else {
        console.log(`⏭️  Skipping: ${file} (already executed)`);
      }
    }

    console.log('✨ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    // Only close pool if running as a standalone script
    if (require.main === module) {
      await pool.end();
    }
  }
};

if (require.main === module) {
  migrate();
}

export default migrate;
