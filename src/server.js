import 'dotenv/config';
import app from './app.js';
import { testConnection, syncDatabase } from './config/database.js';
import logger from './utils/logger.js';
import config from './config/config.js';

const startServer = async () => {
  try {
    await testConnection();
    await syncDatabase();
    
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();