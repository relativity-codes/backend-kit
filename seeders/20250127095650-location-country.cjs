/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';

/** @type {import('sequelize-cli').Migration} */
// const fs = require('fs');
// const path = require('path');
// const csv = require('csv-parser');
// const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // // // Get the first user from the Users table based on createdAt
    // // const tables = await queryInterface.showAllTables();

    // // Parse the CSV file to get the countries data
    // const countries = await parseCSV();

    // // Map the data to match the LocationCountry model
    // const countriesData = countries.map((country) => {
    //   return {
    //     id: uuidv4(),
    //     name: country.Country,
    //     coordinate: `${country.Latitude}, ${country.Longitude}`,
    //     userId: '9a82a7aa-8c66-4a6f-81b7-028c0026d824', // Use the user's UUID
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   };
    // });

    // // Insert the data into the location_countries table
    // await queryInterface.bulkInsert('location_countries', countriesData, {});
    // console.log('Location countries seeded successfully!');
  },

  async down(queryInterface, Sequelize) {
    // Remove all location_countries if we need to revert this migration
    // await queryInterface.bulkDelete('location_countries', null, {});
  },
};

// Function to parse the CSV file
// function parseCSV() {
//   return new Promise((resolve, reject) => {
//     const results = [];
//     fs.createReadStream(path.join(__dirname, 'countries.csv'))
//       .pipe(csv())
//       .on('data', (data) => results.push(data))
//       .on('end', () => resolve(results))
//       .on('error', (err) => reject(err));
//   });
// }

// module.exports = {};
