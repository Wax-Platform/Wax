const fs = require('fs')
const path = require('path')
const resolvers = require('./openAi.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'openAi.graphql'), 'utf-8'),
}
