'use strict'

const moment = require('moment')

module.exports = function (callback) {
  let startDate = moment('2016-10-01')
  let now = moment()
  let monthsArr = []
  let index = 1

  while (startDate < now) {
    monthsArr.push({
      index: index,
      month: startDate.month() + 1,
      year: startDate.year()
    })
    startDate.add(1, 'month')
    index++
  }

  // console.log(monthsArr)

  callback(null, monthsArr)
}
