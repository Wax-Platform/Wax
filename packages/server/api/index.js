const merge = require('lodash/merge')
const user = require('./user')
const doc = require('./doc')
const resourceTree = require('./resourceTree')
const aiService = require('./aiService')
const document = require('./document')
const template = require('./template')

module.exports = {
  typeDefs: [
    user.typeDefs,
    doc.typeDefs,
    resourceTree.typeDefs,
    aiService.typeDefs,
    document.typeDefs,
    template.typeDefs,
  ].join(' '),
  resolvers: merge(
    {},
    user.resolvers,
    doc.resolvers,
    resourceTree.resolvers,
    aiService.resolvers,
    document.resolvers,
    template.resolvers,
  ),
}
