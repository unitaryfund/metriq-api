// methodModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes, Deferrable } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User

class Method extends Model {}
Method.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
      deferrable: Deferrable.INITIALLY_IMMEDIATE
    }
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fullName: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, { sequelize, modelName: 'method' })

Method.delete = async function () {
  await Method.destroy({ where: { id: this.id } })
}

module.exports.Method = Method
