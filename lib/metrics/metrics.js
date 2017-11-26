'use strict'

const async = require('async')
const monthlyFormat = require('../exporter/monthlyFormat')
const models = require('../../models')

function getMetrics (monthsTickets) {
  return {
    numTickets: monthsTickets.length,
    avgReply: getAvgReplyTime(monthsTickets),
    avgRes: getAvgResolutionTime(monthsTickets)
  }
}

function getAvgReplyTime (tickets) {
  let total = 0
  let count = 0
  tickets.forEach((t) => {
    if (t.reply_time_absolute != null) {
      total += t.reply_time_absolute
      count++
    }
  })
  if (total === 0 || count === 0) {
    return 0
  } else {
    return Math.floor(total / count)
  }
}

function getAvgResolutionTime (tickets) {
  let total = 0
  let count = 0
  tickets.forEach((t) => {
    if (t.full_res_time_absolute != null) {
      total += t.full_res_time_absolute
      count++
    }
  })

  if (total === 0 || count === 0) {
    return 0
  } else {
    return Math.floor(total / count)
  }
}

function getUnresolved (tickets) {
  let count = 0
  tickets.forEach((t) => {
    // console.log('status: ' + t.status)
    if (t.status === 'open' || t.status === 'pending' || t.status === 'new' || t.status === 'hold') count++
  })
  return count
}

// returns array of monthsMetric objects, each object containing calculated metrics for one month
function getMetricsArray (cb) {
  let allMonthsMetrics = []
  let months

  // calls f1 first, when it returns then f2 is called. When f2 is finished executing and all callbacks have returned
  // then f3 is called i.e. all data is returned before page is rendered
  async.series([
    // f1
    function (callback) {
      monthlyFormat((err, monthList) => {
        if (err) return callback(err)
        months = monthList
        callback()
      })
    },
    // f2
    function (callback) {
      async.forEach(months,
          (item, callback) => {
            models.Ticket.findAll({
              where: {
                created_month: item.month,
                created_year: item.year
              }
            }).then((monthsTickets) => {
              if (monthsTickets.length > 0) {
                let monthsMetrics = getMetrics(monthsTickets)
                monthsMetrics.index = item.index
                monthsMetrics.year = monthsTickets[0].created_year
                monthsMetrics.month = monthsTickets[0].created_month
                allMonthsMetrics.push(monthsMetrics)
                console.log(monthsMetrics)
                console.log(monthsMetrics.month + '/' + monthsMetrics.year + '\'s' + ' metrics added to array')
                console.log(allMonthsMetrics.length + ' elements in array')
              } else {
                let monthsMetrics = {}
                monthsMetrics.numTickets = 0
                monthsMetrics.avgReply = 0
                monthsMetrics.avgRes = 0
                monthsMetrics.index = item.index
                monthsMetrics.year = item.year
                monthsMetrics.month = item.month
                allMonthsMetrics.push(monthsMetrics)
                console.log(monthsMetrics)
                console.log(monthsMetrics.month + '/' + monthsMetrics.year + '\'s' + ' metrics added to array')
                console.log(allMonthsMetrics.length + ' elements in array')
              }
              callback()
            })
          }, (err) => {
            if (err) return callback(err)
            callback()
          }
      )
    }
  ], function (err) {  // f3
    if (err) return err
    cb(null, allMonthsMetrics)
  })
}

// returns an array of the last six month names starting from this month
function getLastSixMonths (metricsArray) {
  let monthNames = [ '\'Jan\'', '\'Feb\'', '\'March\'', '\'April\'', '\'May\'', '\'June\'', '\'July\'', '\'Aug\'', '\'Sept\'', '\'Oct\'', '\'Nov\'', '\'Dec\'' ]

  let lastSixMonths = [ monthNames[ metricsArray[0].month - 1 ], monthNames[ metricsArray[1].month - 1 ],
    monthNames[ metricsArray[2].month - 1 ], monthNames[ metricsArray[3].month - 1 ],
    monthNames[ metricsArray[4].month - 1 ], monthNames[ metricsArray[5].month - 1 ] ]

  return lastSixMonths
}

module.exports = {
  getAvgReplyTime,
  getAvgResolutionTime,
  getUnresolved,
  getMetricsArray,
  getMetrics,
  getLastSixMonths
}

