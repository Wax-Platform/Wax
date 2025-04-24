const fs = require('fs')
const path = require('path')
const resolvers = require('./bookComponent.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'bookComponent.graphql'),
    'utf-8',
  ),
}
