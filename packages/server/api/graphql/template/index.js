const fs = require('fs')
const path = require('path')
const resolvers = require('./template.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(path.join(__dirname, 'template.graphql'), 'utf-8'),
}
