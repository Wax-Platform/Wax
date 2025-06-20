const merge = require('lodash/merge')
const applicationParameter = require('./applicationParameter')
const book = require('./book')
const bookComponent = require('./bookComponent')
const bookCollection = require('./bookCollection')
const customTag = require('./customTag')
const division = require('./division')
const team = require('./team')
const user = require('./user')
const template = require('./template')
const file = require('./file')
const systemInfo = require('./systemInfo')
const exportProfile = require('./exportProfile')
const openAi = require('./openAi')
const invitations = require('./invitations')
const document = require('./document')
const comments = require('./comments')
const docTree = require('./docTree')
const fileManager = require('./fileManager')

module.exports = {
  typeDefs: [
    applicationParameter.typeDefs,
    book.typeDefs,
    bookComponent.typeDefs,
    bookCollection.typeDefs,
    customTag.typeDefs,
    division.typeDefs,
    file.typeDefs,
    team.typeDefs,
    user.typeDefs,
    template.typeDefs,
    systemInfo.typeDefs,
    exportProfile.typeDefs,
    openAi.typeDefs,
    invitations.typeDefs,
    document.typeDefs,
    comments.typeDefs,
    docTree.typeDefs,
    fileManager.typeDefs,
  ].join(' '),
  resolvers: merge(
    {},
    applicationParameter.resolvers,
    book.resolvers,
    bookComponent.resolvers,
    bookCollection.resolvers,
    customTag.resolvers,
    division.resolvers,
    file.resolvers,
    team.resolvers,
    template.resolvers,
    user.resolvers,
    systemInfo.resolvers,
    exportProfile.resolvers,
    openAi.resolvers,
    invitations.resolvers,
    document.resolvers,
    comments.resolvers,
    docTree.resolvers,
    fileManager.resolvers,
  ),
}
