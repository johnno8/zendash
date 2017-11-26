'use strict'

const metrics = require('../../lib/metrics/metrics')
const monthlyFormat = require('../../lib/exporter/monthlyFormat')
const exporter = require('../../lib/exporter/exporter')
const models = require('../../models')
const async = require('async')
const moment = require('moment')
require('dotenv').config()

exports.welcome = {
  auth: false,

  handler: (request, reply) => {
    reply.view('login', {
      title: 'Log In'
    })
  }
}

exports.login = {
  auth: 'google',

  handler: (request, reply) => {
    if (request.auth.isAuthenticated && request.auth.credentials.profile.raw.hd === 'nearform.com') {
      request.cookieAuth.set(request.auth.credentials.profile)
      // console.log('request.auth.credentials: ' + JSON.stringify(request.auth.credentials, null, 2))

      // let d = new Date()
      // let dstr = '' + d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) +
      //     ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' +
      //     ('0' + d.getSeconds()).slice(-2)
      // logToFile('' + request.auth.credentials.profile.email + ' logged in ' + dstr + '\n')
      return reply.redirect('/home')
    } else {
      // reply('Not logged in').code(401)
      let errors = []
      if (request.auth.isAuthenticated && request.auth.credentials.profile.raw.hd !== 'nearform.com') {
        errors.push({message: 'nearform email required for login'})
      } else {
        errors.push({message: 'Invalid credentials'})
      }
      reply.view('login', {
        title: 'login error',
        errors: errors
      })
    }
  }
}

exports.main = {

  auth: {
    strategies: ['zendash-cookie', 'google']
  },

  handler: (request, reply) => {
    let d = new Date()
    let currentMonth = d.getMonth() + 1
    let currentYear = d.getFullYear()
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let thisMonthsMetrics = {}
    let historicMonthsList

    async.series([
      function (callback) {
        monthlyFormat((err, monthList) => {
          if (err) return callback(err)
          historicMonthsList = monthList
          callback()
        })
      },
      function (callback) {
        async.parallel([
          function (callback) {
            models.Ticket.findAll({
              where: {
                created_month: currentMonth,
                created_year: currentYear
              }
            }).then(thisMonthsTickets => {
              let percentage
              thisMonthsMetrics = metrics.getMetrics(thisMonthsTickets)
              thisMonthsMetrics.unresolved = metrics.getUnresolved(thisMonthsTickets)

              if (thisMonthsMetrics.unresolved > 0) {
                percentage = (thisMonthsMetrics.unresolved / thisMonthsMetrics.numTickets) * 100
                thisMonthsMetrics.unresolvedPercent = Math.round(percentage * Math.pow(10, 2)) / Math.pow(10, 2)
              } else {
                thisMonthsMetrics.unresolvedPercent = 0
              }

              callback()
            }).catch(err => {
              callback(err)
            })
          },
          function (callback) {
            models.Ticket.findAll().then(allTickets => {
              thisMonthsMetrics.avgReplyAllTime = metrics.getAvgReplyTime(allTickets)
              thisMonthsMetrics.avgResAllTime = metrics.getAvgResolutionTime(allTickets)
              callback()
            }).catch(err => {
              return callback(err)
            })
          }
        ], callback)  // close parallel
      }
    ], function (err) {
      if (err) return (err)
      reply.view('home', {
        title: 'Current Metrics',
        data: thisMonthsMetrics,
        month: months[currentMonth - 1],
        year: currentYear,
        dropdownData: historicMonthsList
      })
    }) // close series
  }
}

exports.update = {
  handler: (request, reply) => {
    exporter.ticketsUpdate((err, tickets) => {
      if (err) return (err)
      if (tickets) {
        async.eachSeries(tickets,
            (ticket, callback) => {
              models.Ticket.upsert({
                id: ticket.id,
                instigator: ticket.via.source.from.name,
                // created_day: ticket.created_day,
                created_day: moment(ticket.created_at).date(),
                // created_month: ticket.created_month, //moment(ticket.created_at).month() + 1
                created_month: moment(ticket.created_at).month() + 1,
                // created_year: ticket.created_year,
                created_year: moment(ticket.created_at).year(),
                subject: ticket.subject,
                description: ticket.description,
                status: ticket.status,
                replies: ticket.metric_set.replies,
                solved_at: ticket.metric_set.solved_at,
                reply_time_absolute: ticket.metric_set.reply_time_in_minutes.calendar,
                reply_time_business: ticket.metric_set.reply_time_in_minutes.business,
                first_res_time_absolute: ticket.metric_set.first_resolution_time_in_minutes.calendar,
                first_res_time_business: ticket.metric_set.first_resolution_time_in_minutes.business,
                full_res_time_absolute: ticket.metric_set.full_resolution_time_in_minutes.calendar,
                full_res_time_business: ticket.metric_set.full_resolution_time_in_minutes.business
              }, {
                where: {
                  id: ticket.id
                }
              }).then(() => {
                callback(null)
              }).catch((err) => {
                callback(err)
              })
            }, err => {
              if (err) return err
              reply.redirect('/home')
            }
        )
      } else {
        console.log('no tickets updated')
        reply.redirect('/home')
      }
    })
  }
}

exports.showMonth = {

  handler: (request, reply) => {
    console.log('showMonth payload: ' + JSON.stringify(request.payload, null, 2))
    let requestedMonth = Number(request.payload.month)
    let requestedYear = Number(request.payload.year)
    console.log('current month: ' + requestedMonth)
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let thisMonthsMetrics = {}
    let historicMonthsList
    let currentDate = new Date()
    let startDate = { month: 9, year: 2016 }
    console.log('requestedMonth: ' + requestedMonth)
    console.log('requestedYear: ' + requestedYear)
    console.log('startDate month: ' + startDate.month)
    console.log('startDate year: ' + startDate.year)

    // if requested month is before Zendesk was in use or is in the future
    if ((requestedMonth > (currentDate.getMonth() + 1) && requestedYear >= currentDate.getFullYear()) || (requestedYear > currentDate.getFullYear()) || (requestedMonth < startDate.month && requestedYear === startDate.year)) {
      monthlyFormat((err, monthList) => {
        if (err) console.log(err)
        historicMonthsList = monthList
        console.log('if statement requestedMonth: ' + requestedMonth + ', requestedYear: ' + requestedYear)
        console.log('if statement startDate month: ' + startDate.month + ', startDate year: ' + startDate.year)
        console.log('if statement current month: ' + (currentDate.getMonth() + 1) + ', current year: ' + currentDate.getFullYear())
        reply.view('home', {
          title: 'Current Metrics',
          data: null,
          month: months[requestedMonth - 1],
          year: requestedYear,
          dropdownData: historicMonthsList
        })
      })
    } else {
      async.series([
        function (callback) {
          monthlyFormat((err, monthList) => {
            if (err) return callback(err)
            historicMonthsList = monthList
            callback()
          })
        },
        function (callback) {
          async.parallel([
            function (callback) {
              models.Ticket.findAll({
                where: {
                  created_month: requestedMonth,
                  created_year: requestedYear
                }
              }).then(thisMonthsTickets => {
                thisMonthsMetrics = metrics.getMetrics(thisMonthsTickets)
                thisMonthsMetrics.unresolved = metrics.getUnresolved(thisMonthsTickets)
                let percentage = (thisMonthsMetrics.unresolved / thisMonthsMetrics.numTickets) * 100
                thisMonthsMetrics.unresolvedPercent = Math.round(percentage * Math.pow(10, 2)) / Math.pow(10, 2)
                callback()
              }).catch(err => {
                callback(err)
              })
            },
            function (callback) {
              models.Ticket.findAll().then(allTickets => {
                thisMonthsMetrics.avgReplyAllTime = metrics.getAvgReplyTime(allTickets)
                thisMonthsMetrics.avgResAllTime = metrics.getAvgResolutionTime(allTickets)
                callback()
              }).catch(err => {
                return callback(err)
              })
            }
          ], callback)  // close parallel
        }
      ], function (err) {
        if (err) return (err)
        console.log(typeof currentDate.getFullYear())
        reply.view('home', {
          title: 'Current Metrics',
          data: thisMonthsMetrics,
          month: months[requestedMonth - 1],
          year: requestedYear,
          dropdownData: historicMonthsList
        })
      }) // close series
    }
  }
}

exports.getTickets = {

  handler: (request, reply) => {
    models.Ticket.findAll().then(function (tickets) {
      reply.view('zen_report', {
        title: 'Zendesk tickets',
        tickets: tickets.sort(function (a, b) {
          return b.id - a.id
        })
      })
    })
  }
}

exports.displayTicket = {

  handler: (request, reply) => {
    let id = request.params.id

    models.Ticket.findAll({
      where: { id: id }
    }).then(tickets => {
      reply.view('viewTicket', {
        title: 'View Ticket',
        tickets: tickets
      })
    }).catch(err => {
      console.log(err)
    })
  }
}

exports.getMetrics = {

  handler: (request, reply) => {
    metrics.getMetricsArray((err, allMetrics) => {
      if (err) console.log(err)
      console.log('metrics array: ' + JSON.stringify(allMetrics, null, 2))
      const sortedMetrics = allMetrics.sort(function (a, b) {
        return b.index - a.index
      })
      console.log('sorted metrics: ' + JSON.stringify(sortedMetrics, null, 2))
      const lastSixMonths = metrics.getLastSixMonths(sortedMetrics)
      console.log('last six months: ' + JSON.stringify(lastSixMonths, null, 2))

      reply.view('zen_metric_report', {
        title: 'Zendesk Metrics',
        metrics: sortedMetrics,
        monthList: lastSixMonths.reverse(),
        // number of tickets for previous 6 months
        graph1Data: [ sortedMetrics[0].numTickets, sortedMetrics[1].numTickets, sortedMetrics[2].numTickets,
          sortedMetrics[3].numTickets, sortedMetrics[4].numTickets, sortedMetrics[5].numTickets ].reverse(),
        // average reply last_update_at for previous 6 months
        graph2Data: [ sortedMetrics[0].avgReply, sortedMetrics[1].avgReply, sortedMetrics[2].avgReply,
          sortedMetrics[3].avgReply, sortedMetrics[4].avgReply, sortedMetrics[5].avgReply ].reverse(),
        // average response last_update_at for previous 6 months
        graph3Data: [ sortedMetrics[0].avgRes, sortedMetrics[1].avgRes, sortedMetrics[2].avgRes,
          sortedMetrics[3].avgRes, sortedMetrics[4].avgRes, sortedMetrics[5].avgRes ].reverse()
      })
    })
  }
}

exports.logout = {

  handler: (request, reply) => {
    request.cookieAuth.clear()
    reply.redirect('/')
  }
}
