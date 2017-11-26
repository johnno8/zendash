/**
 * Created by johnokeeffe on 13/06/2017.
 */
'use strict'

module.exports = function (sequelize, DataTypes) {
  const UpdateTime = sequelize.define('UpdateTime', {
    id: { type: DataTypes.STRING, primaryKey: true },
    last_update_at: DataTypes.INTEGER
  })
  return UpdateTime
}
