const fs = require('fs')
const path = require('path')

const docTreeResolvers = require('./resourceTree.resolvers')

module.exports = {
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'resourceTree.graphql'),
    'utf-8',
  ),
  resolvers: docTreeResolvers,
}
