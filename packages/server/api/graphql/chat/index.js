const fs = require('fs')
const path = require('path')

const chatResolvers = require('./chat.resolvers')

module.exports = {
  typeDefs: fs.readFileSync(path.join(__dirname, 'chat.graphql'), 'utf-8'),
  resolvers: chatResolvers,
}
