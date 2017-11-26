require('dotenv').config()

module.exports = {
  zenToken: process.env.ZENDESK_TOKEN,
  username: process.env.USERNAME,
  remoteUri: process.env.REMOTE_URI,
  pg: {
    name: process.env.PG_NAME || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    dialect: process.env.DIALECT || 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  }
}
