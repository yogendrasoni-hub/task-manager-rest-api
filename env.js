import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || (isTest ? 'test_super_secret_jwt_key_for_testing_purposes_only_123' : null),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  // Use lower rounds during automated tests to maximize test execution speed
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || (isTest ? 4 : 12),
  dbPath: process.env.DB_PATH || (isTest ? './data/test_task_manager.db' : './data/task_manager.db')
};

if (!config.jwtSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is required.');
}
