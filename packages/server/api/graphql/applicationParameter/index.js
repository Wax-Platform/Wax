const fs = require('fs')
const path = require('path')

const resolvers = require('./applicationParameter.resolvers')

module.exports = {
  resolvers,
  typeDefs: fs.readFileSync(
    path.join(__dirname, 'applicationParameter.graphql'),
    'utf-8',
  ),
}
