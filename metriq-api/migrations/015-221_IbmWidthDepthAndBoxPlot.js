'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.changeColumn('results', 'qubitCount',
          {
            type: Sequelize.FLOAT,
            allowNull: true
          }, { transaction: t }),
        queryInterface.changeColumn('results', 'circuitDepth',
          {
            type: Sequelize.FLOAT,
            allowNull: true
          }, { transaction: t }),
        queryInterface.addColumn('results', 'quartile0',
          {
            type: Sequelize.FLOAT,
            allowNull: true
          }, { transaction: t }),
        queryInterface.addColumn('results', 'quartile1',
          {
            type: Sequelize.FLOAT,
            allowNull: true
          }, { transaction: t }),
        queryInterface.addColumn('results', 'quartile2',
          {
            type: Sequelize.FLOAT,
            allowNull: true
          }, { transaction: t }),
        queryInterface.addColumn('results', 'quartile3',
          {
            type: Sequelize.FLOAT,
            allowNull: true
          }, { transaction: t }),
        queryInterface.addColumn('results', 'quartile4',
          {
            type: Sequelize.FLOAT,
            allowNull: true
          }, { transaction: t })
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('results', 'quartile4', { transaction: t }),
        queryInterface.removeColumn('results', 'quartile3', { transaction: t }),
        queryInterface.removeColumn('results', 'quartile2', { transaction: t }),
        queryInterface.removeColumn('results', 'quartile1', { transaction: t }),
        queryInterface.removeColumn('results', 'quartile0', { transaction: t }),
        queryInterface.changeColumn('results', 'qubitCount',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          }, { transaction: t }),
        queryInterface.changeColumn('results', 'circuitDepth',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          }, { transaction: t })
      ])
    })
  }
}
