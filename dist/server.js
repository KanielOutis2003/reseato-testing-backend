"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const migrate_1 = __importDefault(require("./database/migrate"));
const PORT = process.env.PORT || 5000;
// Verify critical environment variables
if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is missing! Please set it in your environment variables.');
    process.exit(1);
}
if (!process.env.DATABASE_URL && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD)) {
    console.error('❌ Database configuration is missing! Please set DATABASE_URL or discrete DB variables.');
    process.exit(1);
}
const startServer = async () => {
    try {
        console.log('🔄 Attempting to connect to database...');
        // Test database connection
        await database_1.default.query('SELECT NOW()');
        console.log('✅ Database connection established');
        // Run migrations
        console.log('🔄 Running database migrations...');
        await (0, migrate_1.default)();
        console.log('✅ Database migrations completed');
        // Start server
        app_1.default.listen(PORT, () => {
            console.log(`🚀 RESEATO API Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error instanceof Error ? error.message : error);
        if (error instanceof Error && 'stack' in error) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};
startServer().catch(err => {
    console.error('❌ Unhandled startup error:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map