const RESTEndpoints = require('./RESTEndpoints')

module.exports = {
  server: () => app => RESTEndpoints(app),
}
