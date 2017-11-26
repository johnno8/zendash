/**
 * Created by johnokeeffe on 27/02/2017.
 */
'use strict'

const exporter = require('../exporter/exporter')
const models = require('../../models')
const moment = require('moment')

function initialise (callback) {
  exporter.ticketsExport((err, tickets) => {
    if (err) console.log(err)

    tickets.forEach((elem) => {
      let month = moment(elem.created_at).month() + 1
      let year = moment(elem.created_at).year()
      let day = moment(elem.created_at).date()
      models.Ticket.create({
        id: elem.id,
        instigator: elem.via.source.from.name,
        created_day: day,
        created_month: month,
        created_year: year,
        subject: elem.subject,
        description: elem.description,
        status: elem.status,
        replies: elem.metric_set.replies,
        solved_at: elem.metric_set.solved_at,
        reply_time_absolute: elem.metric_set.reply_time_in_minutes.calendar,
        reply_time_business: elem.metric_set.reply_time_in_minutes.business,
        first_res_time_absolute: elem.metric_set.first_resolution_time_in_minutes.calendar,
        first_res_time_business: elem.metric_set.first_resolution_time_in_minutes.business,
        full_res_time_absolute: elem.metric_set.full_resolution_time_in_minutes.calendar,
        full_res_time_business: elem.metric_set.full_resolution_time_in_minutes.business
      }).then(function () {
        console.log('ticket saved to db')
      })
    })
    callback(null)
  })// close exporter
}

module.exports = {
  initialise
}
