"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dns_1 = __importDefault(require("node:dns"));
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
// Force IPv4 resolution to avoid issues with some hosting providers (like Render) connecting to Supabase via IPv6
if (node_dns_1.default.setDefaultResultOrder) {
    node_dns_1.default.setDefaultResultOrder('ipv4first');
}
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
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
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map