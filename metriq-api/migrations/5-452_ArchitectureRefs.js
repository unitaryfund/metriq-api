'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('results', 'submissionPlatformRefId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'submissionPlatformRefs', key: 'id' }
          },
          { transaction: t }),
        queryInterface.addColumn('platforms', 'platformId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'platforms', key: 'id' }
          },
          { transaction: t })
      ])
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('platforms', 'platformId', { transaction: t }),
        queryInterface.removeColumn('results', 'submissionPlatformRefId', { transaction: t })
      ])
    })
  }
}
