const fs = require('fs')
const path = require('path')
const resolvers = require('./exportProfile.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'exportProfile.graphql'),
    'utf-8',
  ),
}
