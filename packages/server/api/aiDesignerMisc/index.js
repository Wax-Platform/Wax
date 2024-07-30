const fs = require('fs')
const path = require('path')
const resolvers = require('./aiDesignerMisc.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'aiDesignerMisc.graphql'),
    'utf-8',
  ),
}
