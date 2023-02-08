'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('results', 'standardError',
          {
            type: Sequelize.FLOAT,
            allowNull: true
          },
          { transaction: t }
        ),
        queryInterface.addColumn('results', 'sampleSize',
          {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          { transaction: t }
        )
      ])
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('results', 'sampleSize', { transaction: t }),
        queryInterface.removeColumn('results', 'standardError', { transaction: t })
      ])
    })
  }
}
