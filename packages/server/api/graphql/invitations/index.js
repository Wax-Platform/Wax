const fs = require('fs')
const path = require('path')
const resolvers = require('./invitations.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'invitations.graphql'),
    'utf-8',
  ),
}
