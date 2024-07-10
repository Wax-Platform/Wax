const merge = require('lodash/merge')
const user = require('./user')
const doc = require('./doc')
const docTree = require('./docTree')
const aiService = require('./aiService')
const settings = require('./settings')
const document = require('./document')

module.exports = {
  typeDefs: [
    user.typeDefs,
    doc.typeDefs,
    docTree.typeDefs,
    aiService.typeDefs,
    settings.typeDefs,
    document.typeDefs,
  ].join(' '),
  resolvers: merge(
    {},
    user.resolvers,
    doc.resolvers,
    docTree.resolvers,
    aiService.resolvers,
    settings.resolvers,
    document.resolvers,
  ),
}
