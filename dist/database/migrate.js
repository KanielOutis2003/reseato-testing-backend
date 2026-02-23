"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database"));
const migrate = async () => {
    const client = await database_1.default.connect();
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
        const migrationsDir = path_1.default.join(__dirname, 'migrations');
        const files = fs_1.default.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        // Get executed migrations
        const { rows: executedMigrations } = await client.query('SELECT name FROM migrations');
        const executedNames = executedMigrations.map(row => row.name);
        // Run new migrations
        for (const file of files) {
            if (!executedNames.includes(file)) {
                console.log(`▶️  Running migration: ${file}`);
                const filePath = path_1.default.join(migrationsDir, file);
                const sql = fs_1.default.readFileSync(filePath, 'utf-8');
                await client.query('BEGIN');
                try {
                    await client.query(sql);
                    await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
                    await client.query('COMMIT');
                    console.log(`✅ Completed: ${file}`);
                }
                catch (err) {
                    await client.query('ROLLBACK');
                    console.error(`❌ Failed: ${file}`);
                    throw err;
                }
            }
            else {
                console.log(`⏭️  Skipping: ${file} (already executed)`);
            }
        }
        console.log('✨ All migrations completed successfully');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
    finally {
        client.release();
        await database_1.default.end();
    }
};
migrate();
//# sourceMappingURL=migrate.js.map