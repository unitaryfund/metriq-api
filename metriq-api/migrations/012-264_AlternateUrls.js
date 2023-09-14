'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('submissions', 'codeUrl',
          {
            type: Sequelize.TEXT,
            allowNull: true
          }, { transaction: t }),
        queryInterface.addColumn('submissions', 'supplementUrl',
          {
            type: Sequelize.TEXT,
            allowNull: true
          }, { transaction: t })
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('submissions', 'supplementUrl', { transaction: t }),
        queryInterface.removeColumn('submissions', 'codeUrl', { transaction: t })
      ])
    })
  }
}
