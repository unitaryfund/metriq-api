'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('providers', [
      { name: 'IBMQ', fullName: 'IBMQ', description: '', userId: 1 },
      { name: 'Rigetti', fullName: 'Rigetti', description: '', userId: 1 },
      { name: 'IonQ', fullName: 'IonQ', description: '', userId: 1 },
      { name: 'ETH', fullName: 'ETH', description: '', userId: 1 },
      { name: 'NVIDIA', fullName: 'NVIDIA', description: '', userId: 1 },
      { name: 'Other', fullName: 'Other', description: '', userId: 1 }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('providers', null, {})
  }
}
