const fs = require('fs')
const path = require('path')

const docTreeResolvers = require('./docTree.resolvers')

module.exports = {
  typeDefs: fs.readFileSync(path.join(__dirname, 'docTree.graphql'), 'utf-8'),
  resolvers: docTreeResolvers,
}
