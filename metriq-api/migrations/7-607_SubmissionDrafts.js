'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('submissions', 'publishedAt', {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.DataTypes.NOW
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('submissions', 'publishedAt')
  }
}
