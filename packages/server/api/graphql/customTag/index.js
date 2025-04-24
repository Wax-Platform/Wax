const fs = require('fs')
const path = require('path')
const resolvers = require('./customTag.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'customTag.graphql'), 'utf-8'),
}
