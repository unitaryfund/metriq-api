'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable('submissionSubscriptions', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
          },
          submissionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'submissions', key: 'id' }
          }
        }, { transaction: t }),
        queryInterface.createTable('taskSubscriptions', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
          },
          taskId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'tasks', key: 'id' }
          }
        }, { transaction: t }),
        queryInterface.createTable('methodSubscriptions', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
          },
          methodId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'methods', key: 'id' }
          }
        }, { transaction: t }),
        queryInterface.createTable('platformSubscriptions', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
          },
          platformId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'platforms', key: 'id' }
          }
        }, { transaction: t }),
        queryInterface.createTable('tagSubscriptions', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
          },
          tagId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'tags', key: 'id' }
          }
        }, { transaction: t })
      ])
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable('tagSubscriptions', { transaction: t }),
        queryInterface.dropTable('platformSubscriptions', { transaction: t }),
        queryInterface.dropTable('methodSubscriptions', { transaction: t }),
        queryInterface.dropTable('taskSubscriptions', { transaction: t }),
        queryInterface.dropTable('submissionSubscriptions', { transaction: t })
      ])
    })
  }
}
