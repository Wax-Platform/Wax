const fs = require('fs')
const path = require('path')
const resolvers = require('./fileManager.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'fileManager.graphql'),
    'utf-8',
  ),
}
