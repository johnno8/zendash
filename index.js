'use strict'

const Hapi = require('hapi')
const Bell = require('bell')
const AuthCookie = require('hapi-auth-cookie')
const models = require('./models')
const initdb = require('./lib/db/initdb')
require('dotenv').config()

const server = new Hapi.Server()

server.connection({ port: 4000, host: process.env.ZEN_HOST || 'localhost' })

server.register([Bell, AuthCookie, require('inert'), require('vision')], (err) => {
  if (err) {
    throw err
  }

  const authCookieOptions = {
    password: process.env.COOKIE_PASSWORD,
    cookie: 'zendash-auth',
    isSecure: false
  }

  server.auth.strategy('zendash-cookie', 'cookie', authCookieOptions)

  const bellAuthOptions = {
    provider: 'google',
    password: process.env.BELL_PASSWORD,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    isSecure: false
  }

  server.auth.strategy('google', 'bell', bellAuthOptions)

  server.auth.default('zendash-cookie')

  server.views({
    engines: {
      hbs: require('handlebars')
    },
    relativeTo: __dirname,
    path: './app/views',
    layoutPath: './app/views/layout',
    partialsPath: './app/views/partials',
    helpersPath: './app/views/helpers',
    layout: true,
    isCached: false
  })

  server.route(require('./routes'))

  models.sequelize.sync({ force: true }).then(function () {
    initdb.initialise((err) => {
      if (err) console.log('db init error')
      server.start((err) => {
        if (err) {
          throw err
        }
        console.log(`Server running at: ${server.info.uri}`)
      })
    })
  })
})
