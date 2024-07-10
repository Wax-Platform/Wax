const fs = require('fs')
const path = require('path')
const resolvers = require('./settings.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'settings.graphql'), 'utf-8'),
}
