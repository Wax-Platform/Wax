const fs = require('fs')
const path = require('path')

const userResolvers = require('./user.resolvers')

module.exports = {
  typeDefs: fs.readFileSync(path.join(__dirname, 'user.graphql'), 'utf-8'),
  resolvers: userResolvers,
}
