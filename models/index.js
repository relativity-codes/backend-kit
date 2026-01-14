import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import dbConfig from 'config/config';

const config = dbConfig;
let sequelizeConnection;

// Initialize Sequelize with options
if (config.use_env_variable) {
  sequelizeConnection = new Sequelize(config);
} else {
  const sequelizeOptions = {
    database: config.database,
    username: config.username,
    password: config.password,
    dialect: config.dialect,
    dialectOptions: {
      connectTimeout: 60000, // 60 seconds
    },
    host: config.host,
    logging: config.logging,
    models: [path.join(__dirname, '*.model.ts')], // Dynamically loads all models in the current directory
  };
  sequelizeConnection = new Sequelize(sequelizeOptions);
}

const db = {};

db.sequelize = sequelizeConnection;
db.Sequelize = Sequelize;

// Export sequelizeConnection for use in the app
export { sequelizeConnection };

export default db;
