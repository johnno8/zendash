/**
 * Created by johnokeeffe on 02/03/2017.
 */
'use strict'

module.exports = function (sequelize, DataTypes) {
  var Ticket = sequelize.define('Ticket', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    instigator: DataTypes.STRING,
    created_day: DataTypes.INTEGER,
    created_month: DataTypes.INTEGER,
    created_year: DataTypes.INTEGER,
    subject: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: DataTypes.STRING,
    replies: DataTypes.INTEGER,
    solved_at: DataTypes.STRING,
    reply_time_absolute: DataTypes.INTEGER,
    reply_time_business: DataTypes.INTEGER,
    first_res_time_absolute: DataTypes.INTEGER,
    first_res_time_business: DataTypes.INTEGER,
    full_res_time_absolute: DataTypes.INTEGER,
    full_res_time_business: DataTypes.INTEGER
  })
  return Ticket
}
