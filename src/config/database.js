import { Sequelize } from 'sequelize';
import config from './config.js';
import logger from '../utils/logger.js';

// Initialize Sequelize instance using database configuration
export const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    logging: config.database.logging,
    pool: config.database.pool
  }
);

/**
 * Test the database connection.
 * Tries to authenticate and returns true if successful.
 */
export const testConnection = async () => {
  try {
    // Attempt to connect to the database
    await sequelize.authenticate();
    logger.info('Database connected');
    return true;
  } catch (error) {
    // Log connection errors
    logger.error('Database connection failed:', error);
    throw error;
  }
};

/**
 * Synchronize all models with the database.
 * Uses "alter" in development to auto-update schema.
 */
export const syncDatabase = async () => {
  try {
    // Enable alter mode only in development environment
    const useAlter = config.nodeEnv === 'development';
    try {
      // Sync database models
      await sequelize.sync({ alter: useAlter });
      logger.info('Database synced');
    } catch (err) {
      // Handle specific MySQL error when too many keys exist
      if (err && err.parent && err.parent.code === 'ER_TOO_MANY_KEYS') {
        logger.warn('Database sync alter failed due to too many keys; retrying without alter to avoid crash', { error: err.message });
        // Retry without "alter" to prevent crash
        await sequelize.sync({ alter: false });
        logger.info('Database synced (without alter)');
      } else {
        throw err;
      }
    }
  } catch (error) {
    // Log any other sync error
    logger.error('Database sync failed:', error);
    throw error;
  }
};

// Export default Sequelize instance for use across the app
export default sequelize;
