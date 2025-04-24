const fs = require('fs')
const path = require('path')
const resolvers = require('./user.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'user.graphql'), 'utf-8'),
}
