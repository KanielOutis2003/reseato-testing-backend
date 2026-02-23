"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        console.log('🔄 Attempting to connect to database...');
        // Test database connection
        await database_1.default.query('SELECT NOW()');
        console.log('✅ Database connection established');
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