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
      Trip.belongsTo(models.User, {foreignKey: 'user_id'});

      Trip.hasMany(models.Waypoint, {
        foreignKey: 'trip_id',
        onDelete: 'CASCADE',
        hooks: true
      });

      Trip.hasMany(models.Detour, {
        foreignKey: 'trip_id',
        onDelete: 'CASCADE',
        hooks: true
      });
    }
  }
  Trip.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      len: [1, 50]
    },
    description: {
      type: DataTypes.STRING
    },
    start_address: {
      type: DataTypes.STRING
    },
    start_lat: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -90,
      max: 90
    },
    start_lng: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -180,
      max: 180
    },
    end_address: {
      type: DataTypes.STRING
    },
    end_lat: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -90,
      max: 90
    },
    end_lng: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -180,
      max: 180
    },
    user_id: {
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