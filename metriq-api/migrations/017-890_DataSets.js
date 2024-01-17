module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('platforms', 'isDataSet',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
