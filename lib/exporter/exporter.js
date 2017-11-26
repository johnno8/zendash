'use strict'

const zendesk = require('node-zendesk')
const config = require('../../config')
const models = require('../../models')
const shortid = require('shortid')
const async = require('async')
const startTime = 1472688000

const client = zendesk.createClient({
  username: config.username,
  token: config.zenToken,
  remoteUri: config.remoteUri
})

client.tickets.sideLoad = ['metric_sets']

const ticketsExport = function (callback) {
  function getTickets () {
    console.log('\n\n\n\nstartTime: ' + startTime + '\n\n\n\n')
    client.tickets.incremental(startTime, (err, statusList, body, responseList, resultList) => {
      if (err) {
        console.log(err)
        return
      }
      models.UpdateTime.create({
        id: shortid.generate(),
        last_update_at: resultList.end_time
      }).then(() => {
        console.log('updateTime ' + resultList.end_time + 'saved to db')
      })

      // console.log('\n\n\n\nstartTime2: ' + startTime + '\n\n\n\n')
      // console.log('\n\n\n\nresponseList: ' + JSON.stringify(responseList, null, 2) + '\n\n\n\n')
      // console.log('\n\n\n\nresultList: ' + JSON.stringify(resultList, null, 2) + '\n\n\n\n')
      // console.log('\n\n\n\nresultList.end_time: ' + resultList.end_time + '\n\n\n\n')
      callback(null, body)
    })
  }

  getTickets()
}

const ticketsUpdate = function (callback) {
  let newUpdateTime
  let updatedTickets = []

  async.series([
    function (callback) { // 1st series function
      models.UpdateTime.findAll({
        limit: 1,
        order: [ [ 'createdAt' ] ]
      }).then(entries => {
        console.log('last_update_at: ' + JSON.stringify(entries[0].last_update_at, null, 2))
        client.tickets.incremental(entries[0].last_update_at, (err, statusList, body, responseList, resultList) => {
          if (err) {
            console.log(err)
            return callback(err)
          }
          console.log('\n\n\n\nnew updateTime: ' + resultList.end_time + '\n\n\n\n')
          updatedTickets = body
          newUpdateTime = resultList.end_time
          callback()
        })
      })
    },
    function (callback) { // 2nd series function
      models.UpdateTime.create({id: shortid.generate(), last_update_at: newUpdateTime}).then(() => {
        console.log('new last_update_at record created: ' + newUpdateTime)
        callback()
      }).catch(err => {
        callback(err)
      })
    }
  ], function (err) { // final function, called after series functions have returned
    if (err) return (err)
    callback(null, updatedTickets)
  })
}

module.exports = { ticketsExport, ticketsUpdate }
