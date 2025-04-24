const fs = require('fs')
const path = require('path')
const resolvers = require('./file.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'file.graphql'), 'utf-8'),
}
