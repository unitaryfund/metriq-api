'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('dataTypes', [
      { name: 'DECIMAL', friendlyName: 'Decimal (high-precision)' },
      // { name: 'BLOB', friendlyName: 'File ("blob")' },
      { name: 'STRING', friendlyName: 'String' },
      { name: 'CHAR', friendlyName: 'Character' },
      { name: 'TEXT', friendlyName: 'Text' },
      { name: 'CITEXT', friendlyName: 'Text (case-insenstive)' },
      { name: 'TINYINT', friendlyName: 'Integer (8-bit)' },
      { name: 'SMALLINT', friendlyName: 'Integer (16-bit)' },
      { name: 'INTEGER', friendlyName: 'Integer (32-bit)' },
      { name: 'BIGINT', friendlyName: 'Integer (64-bit)' },
      { name: 'BOOLEAN', friendlyName: 'Boolean (true/false)' },
      { name: 'DATE', friendlyName: 'Date and time' },
      { name: 'DATEONLY', friendlyName: 'Date' },
      // { name: 'REAL', friendlyName: 'Number (32-bit floating point)' },
      { name: '\'DOUBLE PRECISION\'', friendlyName: 'Number (64-bit floating point)' },
      { name: 'FLOAT', friendlyName: 'Number (32-bit floating point)' },
      { name: 'GEOMETRY', friendlyName: 'Geometry (SQL type)' },
      { name: 'GEOGRAPHY', friendlyName: 'Geography (SQL type)' }
      // { name: 'HSTORE', friendlyName: 'Key-value pair' },
      // { name: 'ENUM', friendlyName: 'Enumeration' }
    ], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dataTypes', null, {})
  }
}
