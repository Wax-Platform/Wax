const fs = require('fs')
const path = require('path')
const resolvers = require('./team.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'team.graphql'), 'utf-8'),
}
