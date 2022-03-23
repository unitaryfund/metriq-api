'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable('dataTypes', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          name: {
            type: Sequelize.TEXT,
            allowNull: false
          }
        }, { transaction: t }),
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
        queryInterface.createTable('architectureDataTypes', {
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
          },
          dataTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'dataTypes', key: 'id' }
          },
          architectureId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'architectures', key: 'id' }
          }
        }, { transaction: t }),
        queryInterface.createTable('architectureDataTypeValues', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          value: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          architectureDataTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'architectureDataTypes', key: 'id' }
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
        queryInterface.dropTable('resultArchitectureRefModel', { transaction: t }),
        queryInterface.dropTable('architectureDataTypeValues', { transaction: t }),
        queryInterface.dropTable('architectureDataTypes', { transaction: t }),
        queryInterface.dropTable('architecture', { transaction: t }),
        queryInterface.dropTable('dataTypes', { transaction: t })
      ])
    })
  }
}