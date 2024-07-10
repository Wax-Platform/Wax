const fs = require('fs')
const path = require('path')
const resolvers = require('./aiService.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'aiService.graphql'), 'utf-8'),
}
