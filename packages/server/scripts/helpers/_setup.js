const { migrate } = require('@coko/server')

// Ideally, instead of running a single worker, we should be spinning up
// one db per worker, so that the tests run in parallel without interfering
// with each other

// See following article:
// https://walrus.ai/blog/2020/04/testing-database-interactions-with-jest/

module.exports = async jestConfig => {
  await migrate()
}
