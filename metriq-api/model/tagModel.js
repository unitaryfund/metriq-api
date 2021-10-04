// tagModel.js

const config = require('../config')
const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = new Sequelize(config.pgConnectionString)
const User = require('./userModel').User

class Tag extends Model {
  async delete () {
    await Tag.destroy({ where: { id: this.id } })
  }
}
Tag.init({
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, { sequelize, modelName: 'tag' })

User.hasMany(Tag)

module.exports.Tag = Tag
