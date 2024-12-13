const path = require('path')
const components = require('./components')
const permissions = require('./permissions')

module.exports = {
  passwordReset: {
    path: 'password-reset',
  },
  mailer: {
    from: 'info@wax.is',
    path: path.join(__dirname, 'mailer'),
  },
  permissions,
  components,
  db: {},

  useGraphQLServer: true,
  port: 3000,
  useFileStorage: true,
  subscriptionsDb: {},
  teams: {
    global: [
      {
        displayName: 'Admin',
        role: 'admin',
      },
    ],
    nonGlobal: [
      {
        displayName: 'Author',
        role: 'author',
      },
      {
        displayName: 'Viewer',
        role: 'viewer',
      },
    ],
  },
  onStartup: [
    {
      label: 'Init',
      execute: async () => {
        const init = require('./startServer')
        return init()
      },
    },
  ],
  emailVerificationTokenExpiry: {
    amount: 24,
    unit: 'hours',
  },
  schema: {},
  validations: path.join(__dirname, 'modules', 'validations'),
}
