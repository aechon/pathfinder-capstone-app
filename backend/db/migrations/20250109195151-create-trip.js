'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Trips', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // name: {
      //   allowNull: false,
      //   type: Sequelize.STRING(30)
      // },
      // description: {
      //   type: Sequelize.STRING(1000)
      // },
      startAddress: {
        type: Sequelize.STRING
      },
      startLat: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      startLng: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      endAddress: {
        type: Sequelize.STRING
      },
      endLat: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      endLng: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      duration: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      distance: {
        allowNull: false,
        type: Sequelize.STRING
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        reference: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Trips';
    await queryInterface.dropTable(options);
  }
};