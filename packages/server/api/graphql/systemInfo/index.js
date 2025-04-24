const fs = require('fs')
const path = require('path')
const resolvers = require('./systemInfo.resolver')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'systemInfo.graphql'),
    'utf-8',
  ),
}
