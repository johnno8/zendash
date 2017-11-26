/**
 * Created by johnokeeffe on 27/02/2017.
 */
'use strict'

module.exports = function (sequelize, DataTypes) {
  var Metric = sequelize.define('Metric', {
    year: DataTypes.INTEGER,
    month: DataTypes.INTEGER,
    numTickets: DataTypes.INTEGER,
    avgReply: DataTypes.INTEGER,
    avgRes: DataTypes.INTEGER
  })
  return Metric
}
