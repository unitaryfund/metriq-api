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
    ], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dataTypes', null, {})
  }
}
