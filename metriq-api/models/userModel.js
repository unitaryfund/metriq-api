// userModel.js

'use strict'

const { v4: uuidv4 } = require('uuid')
const recoveryExpirationMinutes = 30
const millisPerMinute = 60000

module.exports = function (sequelize, DataTypes) {
  const Model = sequelize.define('user', {
    username: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    usernameNormal: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    affiliation: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    },
    name: {
      type: DataTypes.TEXT,
      defaultValue: '',
      allowNull: false
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    clientToken: {
      type: DataTypes.TEXT
    },
    recoveryToken: {
      type: DataTypes.TEXT
    },
    clientTokenCreated: {
      type: DataTypes.DATE
    },
    recoveryTokenExpiration: {
      type: DataTypes.DATE
    },
    isSubscribedToNewSubmissions: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    twitterHandle: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    }
  }, {})
  Model.associate = function (db) {
    db.user.hasMany(db.task)
    db.task.belongsTo(db.task)
  }
  Model.generateRecovery = function () {
    this.recoveryToken = uuidv4()
    this.recoveryTokenExpiration = new Date((new Date()).getTime() + recoveryExpirationMinutes * millisPerMinute)
  }
  return Model
}
