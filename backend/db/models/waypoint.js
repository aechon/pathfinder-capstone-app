'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Waypoint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Waypoint.belongsTo(models.Trip, {foreignKey: 'trip_id'});
    }
  }
  Waypoint.init({
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    lat: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -90,
      max: 90
    },
    lng: {
      type: DataTypes.NUMERIC,
      allowNull: false,
      min: -180,
      max: 180
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Waypoint',
  });
  return Waypoint;
};