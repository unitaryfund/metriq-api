module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('platforms', 'providerId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'providers', key: 'id' }
          }, { transaction: t }),
        queryInterface.addColumn('platforms', 'architectureId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'architectures', key: 'id' }
          }, { transaction: t })
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('platforms', 'architectureId', { transaction: t }),
        queryInterface.removeColumn('platforms', 'providerId', { transaction: t })
      ])
    })
  }
}
