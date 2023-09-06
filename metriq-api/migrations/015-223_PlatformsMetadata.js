module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable('providers',
          {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
            deletedAt: Sequelize.DATE,
            userId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'users', key: 'id' }
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
        queryInterface.createTable('architectures',
          {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
            deletedAt: Sequelize.DATE,
            userId: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: { model: 'users', key: 'id' }
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
          }, { transaction: t })
      ])
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable('architectures', { transaction: t }),
        queryInterface.dropTable('providers', { transaction: t })
      ])
    })
  }
}
