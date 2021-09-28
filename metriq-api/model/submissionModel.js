// submissionModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User

class Submission extends Model {
  async delete () {
    await Submission.destroy({ where: { id: this.id } })
  }
}
Submission.init({
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  nameNormal: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  contentUrl: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thumbnailUrl: {
    type: DataTypes.TEXT
  },
  approvedAt: {
    type: DataTypes.DATE
  }
}, { sequelize, modelName: 'submission' })

Submission.belongsTo(User)
User.hasMany(Submission)

module.exports.Submission = Submission
