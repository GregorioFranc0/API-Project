'use strict';

const { User, Spot, Booking } = require('../models');
const bcrypt = require("bcryptjs");
let options = {};
options.tableName = "Bookings";
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 1,
        startDate: new Date("2022-11-10"),
        endDate: new Date('2022-11-12'),
      },
      {
        spotId: 2,
        userId: 2,
        startDate: new Date("2020-05-19"),
        endDate: new Date('2020-05-25'),
      },
      {
        spotId: 3,
        userId: 3,
        startDate: new Date("2021-06-03"),
        endDate: new Date('2021-06-06'),
      },
      {
        spotId: 3,
        userId: 3,
        startDate: new Date("2023-04-15"),
        endDate: new Date('2023-04-25'),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Bookings"
    await queryInterface.bulkDelete(options, {
      where: Booking.findAll()
    })
  }
};
