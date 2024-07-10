const fs = require('fs')
const path = require('path')
const resolvers = require('./document.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'document.graphql'), 'utf-8'),
}
