'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Detour extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Detour.belongsTo(models.Trip, {foreignKey: 'tripId'});
    }
  }
  Detour.init({
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING
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
    // originWaypoint: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false
    // },
    // stopNumber: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false
    // }
  }, {
    sequelize,
    modelName: 'Detour',
  });
  return Detour;
};