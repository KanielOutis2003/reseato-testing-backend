"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
let pool;
if (process.env.DATABASE_URL) {
    try {
        const u = new URL(process.env.DATABASE_URL);
        const host = `${u.hostname}:${u.port || '5432'}`;
        console.log(`🔌 DB config: using DATABASE_URL -> ${host} ssl=${isProduction ? 'on' : 'off'}`);
    }
    catch {
        console.log(`🔌 DB config: using DATABASE_URL (host parse failed) ssl=${isProduction ? 'on' : 'off'}`);
    }
    pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
}
else {
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432');
    console.log(`🔌 DB config: using discrete vars -> ${host}:${port} ssl=${isProduction ? 'on' : 'off'}`);
    pool = new pg_1.Pool({
        host,
        port,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
}
pool.on('connect', () => {
    console.log('✅ Database connected');
});
pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1);
});
exports.default = pool;
//# sourceMappingURL=database.js.map