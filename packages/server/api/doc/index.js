const fs = require('fs')
const path = require('path')

const docResolvers = require('./doc.resolvers')

module.exports = {
  typeDefs: fs.readFileSync(path.join(__dirname, 'doc.graphql'), 'utf-8'),
  resolvers: docResolvers,
}
