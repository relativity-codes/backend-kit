/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');
module.exports = {
  async up(queryInterface, Sequelize) {
    // const [nigeria] = await queryInterface.sequelize.query(
    //   "SELECT id FROM location_countries WHERE name = 'Nigeria' LIMIT 1"
    // );

    // let locationCountryId;
    // // Make sure we found the record before proceeding.
    // if (nigeria && nigeria.length > 0) {
    //    locationCountryId = nigeria[0].id;
    // } else {
    //   console.log('Country "Nigeria" not found!');
    //   return;
    // }

    // The state data to seed
    const statesData = [
      { state: 'Abia', capital: 'Umuahia', coordinates: [7.524724, 5.43089] },
      { state: 'Adamawa', capital: 'Yola', coordinates: [12.438058, 9.325049] },
      { state: 'Akwa Ibom', capital: 'Uyo', coordinates: [7.872159, 4.929986] },
      { state: 'Anambra', capital: 'Awka', coordinates: [7.006839, 6.275765] },
      { state: 'Bauchi', capital: 'Bauchi', coordinates: [9.844166, 10.31583] },
      {
        state: 'Bayelsa',
        capital: 'Yenagoa',
        coordinates: [5.898713, 4.867776],
      },
      { state: 'Benue', capital: 'Makurdi', coordinates: [8.836275, 7.35082] },
      {
        state: 'Borno',
        capital: 'Maiduguri',
        coordinates: [12.978912, 11.509747],
      },
      {
        state: 'Cross River',
        capital: 'Calabar',
        coordinates: [8.660056, 6.167031],
      },
      { state: 'Delta', capital: 'Asaba', coordinates: [5.898713, 5.532462] },
      {
        state: 'Ebonyi',
        capital: 'Abakaliki',
        coordinates: [7.959286, 6.17797],
      },
      { state: 'Enugu', capital: 'Enugu', coordinates: [7.510332, 6.452667] },
      { state: 'Edo', capital: 'Benin city', coordinates: [5.898713, 6.54381] },
      {
        state: 'Ekiti',
        capital: 'Ado Ekiti',
        coordinates: [5.31025, 7.665581],
      },
      {
        state: 'FCT-Abuja',
        capital: 'Abuja',
        coordinates: [7.179025, 8.855683],
      },
      { state: 'Gombe', capital: 'Gombe', coordinates: [11.16666, 10.283333] },
      { state: 'Imo', capital: 'Owerri', coordinates: [6.920913, 5.521453] },
      { state: 'Jigawa', capital: 'Dutse', coordinates: [8.940058, 12.570031] },
      {
        state: 'Kaduna',
        capital: 'Kaduna',
        coordinates: [7.433332, 10.516667],
      },
      { state: 'Kano', capital: 'Kano', coordinates: [8.591956, 12.002179] },
      { state: 'Katsina', capital: 'Katsina', coordinates: [7.6, 12.983333] },
      {
        state: 'Kebbi',
        capital: 'Birnin Kebbi',
        coordinates: [4.069545, 11.678124],
      },
      { state: 'Kogi', capital: 'Lokoja', coordinates: [6.578338, 7.561891] },
      { state: 'Kwara', capital: 'Ilorin', coordinates: [4.5624426, 8.984799] },
      { state: 'Lagos', capital: 'Ikeja', coordinates: [3.379205, 6.524379] },
      {
        state: 'Nasarawa',
        capital: 'Lafia',
        coordinates: [8.308844, 8.570515],
      },
      { state: 'Niger', capital: 'Minna', coordinates: [8.675277, 9.081999] },
      { state: 'Ogun', capital: 'Abeokuta', coordinates: [3.258362, 6.909833] },
      { state: 'Ondo', capital: 'Akure', coordinates: [4.833333, 7.083333] },
      { state: 'Osun', capital: 'Osogbo', coordinates: [4.562442, 7.587584] },
      { state: 'Oyo', capital: 'Ibadan', coordinates: [3.933, 7.85] },
      { state: 'Plateau', capital: 'Jos', coordinates: [9.8965, 8.8583] },
      {
        state: 'Rivers',
        capital: 'Port-harcout',
        coordinates: [6.920913, 4.858076],
      },
      {
        state: 'Sokoto',
        capital: 'Sokoto',
        coordinates: [5.233333, 13.066667],
      },
      { state: 'Taraba', capital: 'Jalingo', coordinates: [10.9807, 7.986875] },
      {
        state: 'Yobe',
        capital: 'Damaturu',
        coordinates: [11.706829, 12.187141],
      },
      {
        state: 'Zamfara',
        capital: 'Gusau',
        coordinates: [6.2375947, 12.184415],
      },
    ];

    // Format the data and insert
    const formattedStates = statesData.map((stateData) => ({
      id: uuidv4(),
      title: stateData.state,
      userId: '17946ebe-487f-468a-894f-84e86160de4e',
      // coordinate: `${stateData.coordinates[0]}, ${stateData.coordinates[1]}`,
      // locationCountryId: locationCountryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert data into the table
    await queryInterface.bulkInsert('states', formattedStates, {});
  },

  async down(queryInterface, Sequelize) {
    // Revert the seeding action by deleting all the rows from the table
    await queryInterface.bulkDelete('states', null, {});
  },
};
// module.exports = {};
