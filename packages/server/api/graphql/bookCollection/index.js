const fs = require('fs')
const path = require('path')
const resolvers = require('./bookCollection.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'bookCollection.graphql'),
    'utf-8',
  ),
}
