const merge = require('lodash/merge')
const user = require('./user')
const doc = require('./doc')
const resourceTree = require('./resourceTree')
const aiService = require('./aiService')
const settings = require('./settings')
const document = require('./document')
const aiDesignerMisc = require('./aiDesignerMisc')
const template = require('./template')

module.exports = {
  typeDefs: [
    user.typeDefs,
    doc.typeDefs,
    resourceTree.typeDefs,
    aiService.typeDefs,
    // settings.typeDefs,
    document.typeDefs,
    aiDesignerMisc.typeDefs,
    template.typeDefs,
  ].join(' '),
  resolvers: merge(
    {},
    user.resolvers,
    doc.resolvers,
    resourceTree.resolvers,
    aiService.resolvers,
    // settings.resolvers,
    document.resolvers,
    aiDesignerMisc.resolvers,
    template.resolvers,
  ),
}
