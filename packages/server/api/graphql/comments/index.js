const fs = require('fs')
const path = require('path')
const resolvers = require('./comments.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'comments.graphql'), 'utf-8'),
}
