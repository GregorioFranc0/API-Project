'use strict';
const {
  Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {

    static async createSpot({ ownerId, address, city, state, country, lat, lng, name, description, price, previewImage }) {
      const spot = await Spot.create({
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
      return await Spot.scope('currentSpot').findByPk(spot.id)
    }

    static associate(models) {
      // define association here
      Spot.belongsTo(models.User, { foreignKey: 'ownerId', as: 'Owner', onDelete: "CASCADE" })
      Spot.hasMany(models.Booking, { foreignKey: 'spotId', onDelete: "CASCADE", hooks: true })
      Spot.hasMany(models.Review, { foreignKey: 'spotId', onDelete: "CASCADE", hooks: true })
      Spot.hasMany(models.SpotImage, {
        foreignKey: 'imageId',
        onDelete: "CASCADE", hooks: true,
        constraints: false,
        scope: {
          imageType: 'Spot'
        }
      })
    }
  }
  Spot.init({
    // id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   unique: true,
    //   primaryKey: true
    // },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
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
    scopes: {
      currentSpot: {
        attributes: { exclude: ['avgRating', 'previewImage'] }
      },
    }
  });
  return Spot;
};
