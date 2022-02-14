'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('methods', 'methodId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'methods',
          key: 'id'
        }
      }
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('methods', 'methodId')
  }
}
