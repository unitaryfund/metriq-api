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
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
          name: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          friendlyName: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          friendlyType: {
            type: Sequelize.TEXT,
            allowNull: false
          }
        }, { transaction: t }),
        queryInterface.createTable('platforms', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
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
        queryInterface.createTable('platformDataTypes', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
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
          platformId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'platforms', key: 'id' }
          }
        }, { transaction: t }),
        queryInterface.createTable('platformDataTypeValues', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
          value: {
            type: Sequelize.TEXT,
            allowNull: false
          },
          platformDataTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'platformDataTypes', key: 'id' }
          }
        }, { transaction: t }),
        queryInterface.createTable('resultPlatformRefs', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
          deletedAt: Sequelize.DATE,
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
          platformId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'platforms', key: 'id' }
          }
        }, { transaction: t })
      ])
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable('resultPlatformRefs', { transaction: t }),
        queryInterface.dropTable('platformDataTypeValues', { transaction: t }),
        queryInterface.dropTable('platformDataTypes', { transaction: t }),
        queryInterface.dropTable('platforms', { transaction: t }),
        queryInterface.dropTable('dataTypes', { transaction: t })
      ])
    })
  }
}
