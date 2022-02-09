'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'affiliation', {
      type: Sequelize.DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'affiliation')
  }
}
