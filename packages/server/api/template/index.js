const fs = require('fs')
const path = require('path')

const templateResolvers = require('./template.resolvers')

module.exports = {
  typeDefs: fs.readFileSync(path.join(__dirname, 'template.graphql'), 'utf-8'),
  resolvers: templateResolvers,
}
