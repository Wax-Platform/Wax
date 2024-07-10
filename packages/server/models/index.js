const User = require('./user/user.model')
const Doc = require('./doc/doc.model')
const Document = require('./document/document.model')
const Embedding = require('./embeddings/embedding.model')
const Settings = require('./settings/settings.model')

module.exports = {
  User,
  Doc,
  Settings,
  Embedding,
  Document,
}
