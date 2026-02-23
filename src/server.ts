import app from './app';
import pool from './config/database';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔄 Attempting to connect to database...');
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 RESEATO API Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
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