'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('submissions', 'publishedAt', {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.DataTypes.NOW
    }).then(function () {
      return queryInterface.sequelize.query('UPDATE submissions SET "publishedAt"="createdAt";')
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('submissions', 'publishedAt')
  }
}
