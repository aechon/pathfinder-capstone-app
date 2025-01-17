'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Vehicle.belongsTo(models.User, {foreignKey: 'userId'});
    }
  }
  Vehicle.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mpg: {
      type: DataTypes.INTEGER,
    },
    tankSize: {
      type: DataTypes.INTEGER,
    },
    range: {
      type: DataTypes.INTEGER,
    },
  }, {
    sequelize,
    modelName: 'Vehicle',
  });
  return Vehicle;
};