'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('providers', [
      { name: 'Amazon', fullName: 'Amazon', description: '', userId: 1 },
      { name: 'AMD', fullName: 'AMD', description: '', userId: 1 },
      { name: 'Arm', fullName: 'Arm', description: '', userId: 1 },
      { name: 'D-Wave', fullName: 'D-Wave', description: '', userId: 1 },
      { name: 'ETH', fullName: 'ETH', description: '', userId: 1 },
      { name: 'Google', fullName: 'Google', description: '', userId: 1 },
      { name: 'IBMQ', fullName: 'IBMQ', description: '', userId: 1 },
      { name: 'Intel', fullName: 'Intel', description: '', userId: 1 },
      { name: 'IonQ', fullName: 'IonQ', description: '', userId: 1 },
      { name: 'Microsoft', fullName: 'Microsoft', description: '', userId: 1 },
      { name: 'NVIDIA', fullName: 'NVIDIA', description: '', userId: 1 },
      { name: 'Quandela', fullName: 'Quandela', description: '', userId: 1 },
      { name: 'Quantinumm', fullName: 'Quantinuum', description: '', userId: 1 },
      { name: 'QCI', fullName: 'Quantum Computing Inc.', description: '', userId: 1 },
      { name: 'Rigetti', fullName: 'Rigetti', description: '', userId: 1 },
      { name: 'Xanadu', fullName: 'Xanadu', description: '', userId: 1 },
      { name: 'Other', fullName: 'Other', description: '', userId: 1 }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('providers', null, {})
  }
}
