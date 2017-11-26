'use strict'

const ZenMetrics = require('./app/controllers/zenMetrics')
const Assets = require('./app/controllers/assets')

module.exports = [
  { method: 'GET', path: '/', config: ZenMetrics.welcome },
  { method: 'GET', path: '/login', config: ZenMetrics.login },
  { method: 'GET', path: '/home', config: ZenMetrics.main },
  { method: 'POST', path: '/showmonth', config: ZenMetrics.showMonth },
  { method: 'GET', path: '/getTickets', config: ZenMetrics.getTickets },
  { method: ['GET', 'POST'], path: '/ticket/{id}', config: ZenMetrics.displayTicket },
  { method: 'GET', path: '/getMetrics', config: ZenMetrics.getMetrics },
  { method: 'GET', path: '/update', config: ZenMetrics.update },
  { method: 'GET', path: '/logout', config: ZenMetrics.logout },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory
  }
]
