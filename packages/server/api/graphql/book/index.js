const fs = require('fs')
const path = require('path')
const resolvers = require('./book.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'book.graphql'), 'utf-8'),
}
