'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Trip extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Trip.belongsTo(models.User, {foreignKey: 'userId'});

      Trip.hasMany(models.Waypoint, {
        foreignKey: 'tripId',
        onDelete: 'CASCADE',
        hooks: true
      });

      Trip.hasMany(models.Detour, {
        foreignKey: 'tripId',
        onDelete: 'CASCADE',
        hooks: true
      });
    }
  }
  Trip.init({
    // name: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   len: [1, 50]
    // },
    // description: {
    //   type: DataTypes.STRING
    // },
    startAddress: {
      type: DataTypes.STRING
    },
    startLat: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -90,
      max: 90
    },
    startLng: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -180,
      max: 180
    },
    endAddress: {
      type: DataTypes.STRING
    },
    endLat: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -90,
      max: 90
    },
    endLng: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -180,
      max: 180
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    distance: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Trip',
  });
  return Trip;
};