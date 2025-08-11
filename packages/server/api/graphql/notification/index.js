const fs = require('fs')
const path = require('path')

const notificationResolvers = require('./notification.resolvers')

module.exports = {
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'notification.graphql'),
    'utf-8',
  ),
  resolvers: notificationResolvers,
}
