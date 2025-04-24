const fs = require('fs')
const path = require('path')
const resolvers = require('./authorize.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'authorize.graphql'), 'utf-8'),
}
