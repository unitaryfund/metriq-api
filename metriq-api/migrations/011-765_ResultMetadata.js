'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('results', 'qubitCount',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          }, { transaction: t }),
        queryInterface.addColumn('results', 'circuitDepth',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          }, { transaction: t })
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('results', 'circuitDepth'),
        queryInterface.removeColumn('results', 'qubitCount')
      ])
    })
  }
}
