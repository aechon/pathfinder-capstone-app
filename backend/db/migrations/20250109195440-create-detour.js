'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Detours', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tripId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        reference: {
          model: 'Trips',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(256)
      },
      type: {
        type: Sequelize.STRING
      },
      lat: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      lng: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      // originWaypoint: {
      //   allowNull: false,
      //   type: Sequelize.INTEGER,
      //   reference: {
      //     model: 'Waypoints',
      //     key: 'id'
      //   }
      // },
      // stopNumber: {
      //   allowNull: false,
      //   type: Sequelize.INTEGER
      // },
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
    options.tableName = 'Detours';
    await queryInterface.dropTable(options);
  }
};