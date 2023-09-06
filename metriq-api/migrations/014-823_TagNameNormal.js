'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('tags', 'nameNormal',
          {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: ''
          }, { transaction: t })
      ])
    })
      .then(function (result) {
        return queryInterface.sequelize.query('UPDATE tags SET "nameNormal"=LOWER("name")')
      })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('tags', 'nameNormal', { transaction: t })
      ])
    })
  }
}
