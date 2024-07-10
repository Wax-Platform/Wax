/* eslint-disable global-require */

module.exports = {
  server: () => app => require('./chatgpt')(app),
}
