'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('dataTypes', [
      { name: 'BOOLEAN', friendlyName: 'Boolean (true/false)', friendlyType: 'bool' },
      { name: 'TEXT', friendlyName: 'Text', friendlyType: 'string' },
      { name: 'CITEXT', friendlyName: 'Text (case-insenstive)', friendlyType: 'string' },
      { name: 'BIGINT', friendlyName: 'Integer', friendlyType: 'int' },
      { name: '\'DOUBLE PRECISION\'', friendlyName: 'Number (64-bit floating point)', friendlyType: 'number' },
      { name: 'DECIMAL', friendlyName: 'Decimal (high-precision)', friendlyType: 'number' },
      { name: 'DATE', friendlyName: 'Date and time', friendlyType: 'datetime' },
      { name: 'DATEONLY', friendlyName: 'Date', friendlyType: 'date' }
      // { name: 'BLOB', friendlyName: 'File ("blob")' },
      // { name: 'STRING', friendlyName: 'String', friendlyType: 'string' },
      // { name: 'CHAR', friendlyName: 'Character', friendlyType: 'char' },
      // { name: 'TINYINT', friendlyName: 'Integer (8-bit)', friendlyType: 'int' },
      // { name: 'SMALLINT', friendlyName: 'Integer (16-bit)', friendlyType: 'int'},
      // { name: 'INTEGER', friendlyName: 'Integer (32-bit)', friendlyType: 'int' },
      // { name: 'FLOAT', friendlyName: 'Number (32-bit floating point)', friendlyType: 'number' },
      // { name: 'REAL', friendlyName: 'Number (32-bit floating point)' },
      // { name: 'GEOMETRY', friendlyName: 'Geometry (SQL type)' },
      // { name: 'GEOGRAPHY', friendlyName: 'Geography (SQL type)' }
      // { name: 'HSTORE', friendlyName: 'Key-value pair' },
      // { name: 'ENUM', friendlyName: 'Enumeration' }
    ], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dataTypes', null, {})
  }
}
