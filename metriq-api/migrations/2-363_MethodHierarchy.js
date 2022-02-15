'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('methods', 'methodId',
          {
            type: Sequelize.INTEGER,
            references: {
              model: 'methods',
              key: 'id'
            }
          },
          { transaction: t }
        ),
        queryInterface.addColumn('tasks', 'isHideChart',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
          },
          { transaction: t }
        )
      ])
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('tasks', 'isHideChart'),
        queryInterface.removeColumn('methods', 'methodId')
      ])
    })
  }
}
