'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'isSubscribedToNewSubmissions', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'isSubscribedToNewSubmissions')
  }
}
