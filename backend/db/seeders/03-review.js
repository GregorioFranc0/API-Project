'use strict';

let options = {};
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
    options.tableName = "Reviews"
    await queryInterface.bulkInsert(options, [
      {
        review: '10/10, would stay again',
        stars: 5,
        userId: 3,
        spotId: 2,
      },
      {
        review: 'pretty good.',
        stars: 4,
        userId: 2,
        spotId: 2,
      },
      {
        review: "not bad!",
        stars: 4,
        userId: 1,
        spotId: 3,
      },
      {
        review: "i've stayed at better places.",
        stars: 3.5,
        userId: 1,
        spotId: 3,
      },
      {
        review: 'it was alright.',
        stars: 3,
        userId: 3,
        spotId: 3,
      },
      {
        review: 'meh.',
        stars: 2,
        userId: 1,
        spotId: 2,
      }
    ], options)

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = "Reviews"
    await queryInterface.bulkDelete(options, {
      where: Review.findAll()
    })
  }
};
