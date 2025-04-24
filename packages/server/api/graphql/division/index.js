const fs = require('fs')
const path = require('path')
const resolvers = require('./division.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'division.graphql'), 'utf-8'),
}
