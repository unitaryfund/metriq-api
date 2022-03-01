// resultArchitectureRefModel.js

'use strict'
module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('resultArchitectureRef', {}, {})
  Model.associate = function (db) {
    db.user.hasMany(db.resultArchitectureRef)
    db.resultArchitectureRef.belongsTo(db.result)
    db.resultArchitectureRef.belongsTo(db.architecture)
  }
  return Model
}
