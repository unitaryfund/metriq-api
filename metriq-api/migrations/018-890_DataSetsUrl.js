module.exports = {
    up: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.transaction(t => {
        return Promise.all([
          queryInterface.addColumn('platforms', 'url',
            {
              type: Sequelize.TEXT,
              allowNull: false,
              defaultValue: ''
            }, { transaction: t })
        ])
      })
    },
  
    down: (queryInterface, Sequelize) => {
      return queryInterface.sequelize.transaction(t => {
        return Promise.all([
          queryInterface.removeColumn('platforms', 'url', { transaction: t })
        ])
      })
    }
  }
  