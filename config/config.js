/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
// config/config.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
// const { createLogger, format, transports } = require('winston');

// const logger = createLogger({
//   level: 'info',
//   format: format.combine(format.timestamp(), format.json()),
//   transports: [new transports.File({ filename: 'sequelize.log' })],
// });

// const __dirname = path.resolve();
console.log('Environment:', process.env.NODE_ENV);

const dbConfig = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    port: process.env.DEV_DB_PORT,
    dialect: process.env.DEV_DB_DIALECT,
    // dialectModule: require('pg'),
    dialectOptions: {
      // cockroachdbTelemetryDisabled: true,
      bigNumberStrings: true,
      connectTimeout: 10000,
      timeout: 10000,
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false, // This allows self-signed certificates
      //   // Ensure the correct file path is used
      //   ca: process.env.CA_MAIN_CERTIFICATE_PATH
      //     ? fs.readFileSync(
      //       path.join(__dirname, process.env.CA_MAIN_CERTIFICATE_PATH),
      //     ).toString()
      //     : null,
      // },
    },
    logging: console.log,
  },
  test: {
    username: process.env.CI_DB_USERNAME,
    password: process.env.CI_DB_PASSWORD,
    database: process.env.CI_DB_NAME,
    host: process.env.CI_DB_HOSTNAME,
    port: process.env.CI_DB_PORT,
    dialect: process.env.CI_DB_DIALECT,
    // dialectModule: require('pg'),
    dialectOptions: {
      // cockroachdbTelemetryDisabled: true,
      bigNumberStrings: true,
      connectTimeout: 10000,
      timeout: 10000,
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false, // This allows self-signed certificates
      //   // Ensure the correct file path is used
      //   ca: process.env.CA_MAIN_CERTIFICATE_PATH
      //     ? fs.readFileSync(
      //       path.join(__dirname, process.env.CA_MAIN_CERTIFICATE_PATH),
      //     ).toString()
      //     : null,
      // },
    },
    logging: console.log,
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT,
    dialect: process.env.PROD_DB_DIALECT,
    // dialectModule: require('pg'),
    dialectOptions: {
      // cockroachdbTelemetryDisabled: true,
      bigNumberStrings: true,
      connectTimeout: 10000,
      timeout: 10000,
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false, // This allows self-signed certificates
      //   // Ensure the correct file path is used
      //   ca: process.env.CA_MAIN_CERTIFICATE_PATH
      //     ? fs.readFileSync(
      //       path.join(__dirname, process.env.CA_MAIN_CERTIFICATE_PATH),
      //     ).toString()
      //     : null,
      // },
    },
    logging: console.log,
  },
};

let config;
switch (process.env.NODE_ENV) {
  case 'development':
    config = dbConfig.development;
    break;
  case 'test':
    config = dbConfig.test;
    break;
  case 'production':
    config = dbConfig.production;
    break;
  default:
    config = dbConfig.production; // default to production
    break;
}

// Export the configuration using CommonJS style
module.exports = config;
