'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable('architectures', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          name: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          fullName: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false
          }
        }, { transaction: t }),
        queryInterface.createTable('resultArchitectureRefModels', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
          },
          resultId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'results', key: 'id' }
          },
          architectureId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'architectures', key: 'id' }
          }
        }, { transaction: t })
      ])
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable('resultArchitectureRefModel'),
        queryInterface.dropTable('architecture')
      ])
    })
  }
}
