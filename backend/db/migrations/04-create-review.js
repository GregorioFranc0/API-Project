'use strict';
let options = {};
options.tableName = "Reviews";
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
};
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id"
        }

      },
      spotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Spots",
          key: 'id'
        },
        onDelete: "CASCADE",
        hooks: true
      },
      review: {
        type: Sequelize.STRING
      },
      reviewId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Reviews",
          key: "id"
        },
        imageId: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
      },
      stars: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    }, options);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reviews', options);
  }
};
