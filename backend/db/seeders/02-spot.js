'use strict';

const { User } = require('../models');
const bcrypt = require("bcryptjs");

let options = {};
options.tableName = "Spots";
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Spots";

    await queryInterface.bulkInsert(options, [
      {
        id: 1,
        ownerId: 1,

        address: '123 Disney Lane',
        city: 'San Francisco',
        state: 'California',
        country: 'United States of America',
        lat: '37.7645358',
        lng: '-122.4730327',
        name: 'AA',
        description: 'Place where web developers are',
        price: 123,
        // avgRating: 4.5,
        // previewImage: 'https://miro.medium.com/v2/resize:fit:1200/1*E_VqdthX1vuTH2Usax9i2g.jpeg'
      },
      {
        id: 2,
        ownerId: 2,

        address: '456 Tranquility Lane',
        city: 'Washington DC',
        state: 'Washington DC',
        country: 'USA',
        lat: '33.245443',
        lng: '-123.445459',
        name: 'Tranquility Lane',
        description: 'Place where dreams come true',
        price: 280,
        // avgRating: 5,
        // previewImage: 'https://images.fallout.wiki/f/f8/TL_aerial_view.jpg'
      },
      {
        id: 3,
        ownerId: 3,

        address: '265 Andale Lane',
        city: 'Andale',
        state: 'Virginia',
        country: 'USA',
        lat: '65.430423',
        lng: '-101.249554',
        name: 'Wilks House',
        description: 'Place where comfort rules',
        price: 199,
        // avgRating: 4,
        // previewImage: 'https://static.wikia.nocookie.net/fallout/images/b/b9/Andale.jpg/revision/latest?cb=20120813221138'
      },
      // {
      //   id: 4,
      //   ownerId: 4,
      //   address: '101 DC Avenue',
      //   city: 'Washington',
      //   state: 'DC',
      //   country: 'USA',
      //   lat: '100.293443',
      //   lng: '-34.349393',
      //   name: 'Vault 101',
      //   description: 'Where you stay secure',
      //   price: 199,
      //   avgRating: 5,
      //   previewImage: 'https://static.wikia.nocookie.net/fallout/images/a/a1/Vault_101_entrance_ext.jpg/revision/latest?cb=20210605064850'
      // }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(options);
  }
};
