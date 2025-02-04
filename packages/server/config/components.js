module.exports = [
  // models from coko server
  '@coko/server/src/models/user',
  '@coko/server/src/models/identity',
  '@coko/server/src/models/team',
  '@coko/server/src/models/teamMember',
  '@coko/server/src/models/file',

  // local models
  './models/user',
  './models/doc',
  './models/resourceTree',
  './models/embeddings',
  './models/document',
  './models/template',
  // local api
  './api',
  './api/rest/chatgpt',
]
