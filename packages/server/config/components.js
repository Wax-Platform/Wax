module.exports = [
  // models from coko server
  '@coko/server/src/models/user',
  '@coko/server/src/models/identity',
  '@coko/server/src/models/team',
  '@coko/server/src/models/teamMember',

  // local models
  //   './models/question',
  //   './models/questionVersion',
  //   './models/team',
  './models/user',
  './models/doc',
  './models/resourceTree',
  './models/settings',
  './models/embeddings',
  './models/document',
  './models/aiDesignerMisc',
  './models/template',
  './models/snippets',
  // local api
  './api',
  './api/rest/chatgpt',
]
