'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('dataTypes', [
      { name: 'DECIMAL' },
      { name: 'BLOB' },
      { name: 'STRING' },
      { name: 'CHAR' },
      { name: 'TEXT' },
      { name: 'CITEXT' },
      { name: 'TINYINT' },
      { name: 'SMALLINT' },
      { name: 'INTEGER' },
      { name: 'BIGINT' },
      { name: 'BOOLEAN' },
      { name: 'DATE' },
      { name: 'DATEONLY' },
      { name: 'REAL' },
      { name: '\'DOUBLE PRECISION\'' },
      { name: 'FLOAT' },
      { name: 'GEOMETRY' },
      { name: 'GEOGRAPHY' },
      { name: 'HSTORE' },
      { name: 'ENUM' }
    ], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dataTypes', null, {})
  }
}
