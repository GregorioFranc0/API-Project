'use strict';
const {
  Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {

    static async createSpot({ ownerId, address, city, state, country, lat, lng, name, description, price, previewImage }) {
      const spot = await Spot.create({
        // id,
        ownerId,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
        previewImage
      });
      return await Spot('currentSpot').findByPk(spot.id)
    }

    static associate(models) {
      // define association here
      // Spot.belongsTo(models.Spot, { foreignKey: "id", as: "id", onDelete: "CASCADE", hooks: true })

      Spot.belongsTo(models.User, { foreignKey: 'ownerId', as: 'Owner' })
      Spot.hasMany(models.Booking, { foreignKey: 'spotId', onDelete: "CASCADE", hooks: true })
      Spot.hasMany(models.Review, { foreignKey: 'reviewId', onDelete: "CASCADE", hooks: true })
      Spot.hasMany(models.SpotImage, {
        foreignKey: 'id', as: "SpotImages",
        onDelete: "CASCADE", hooks: true,
        constraints: false,

      })
    }
  }
  Spot.init({
    id: {
      type: sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      references: {
        model: "Spots",
        key: "id"
      },
      onDelete: "CASCADE",
      // hooks: true
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // unique: true
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: {
      type: DataTypes.FLOAT,
      validate: {
        min: -90,
        max: 90
      }
    },
    lng: {
      type: DataTypes.FLOAT,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // avgRating: {
    //   type: DataTypes.FLOAT,
    //   allowNull: false,

    // },
    // previewImage: {
    //   type: DataTypes.STRING,
    //   allowNull: false
    // }
  }, {
    sequelize,
    modelName: 'Spot',
    // scopes: {
    //   currentSpot: {
    //     attributes: { exclude: ['avgRating', 'previewImage'] }
    //   },
    // }
  });
  return Spot;
};
