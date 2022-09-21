'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'twitterHandle', {
      type: Sequelize.DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'twitterHandle')
  }
}
