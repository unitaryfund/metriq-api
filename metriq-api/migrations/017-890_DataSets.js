module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('platforms', 'isDataSet',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
          }, { transaction: t }),
        queryInterface.addColumn('results', 'submissionDataSetRefId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'submissionPlatformRefs', key: 'id' }
          }, { transaction: t })
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('platforms', 'isDataSet', { transaction: t })
      ])
    })
  }
}
