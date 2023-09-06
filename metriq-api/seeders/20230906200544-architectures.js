'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('architectures', [
      { name: 'Atoms', fullName: 'Atoms', description: '', userId: 1 },
      { name: 'Ions', fullName: 'Ions', description: '', userId: 1 },
      { name: 'Photonics', fullName: 'Photonics', description: '', userId: 1 },
      { name: 'Spins', fullName: 'Spins', description: '', userId: 1 },
      { name: 'Superconducting Circuits', fullName: 'Superconducting Circuits', description: '', userId: 1 },
      { name: 'Classical', fullName: 'Classical', description: '', userId: 1 }
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('architectures', null, {})
  }
}
