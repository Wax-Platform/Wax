const path = require('path')
const components = require('./components')
const permissions = require('./permissions')

module.exports = {
  authsome: {
    mode: path.join(__dirname, 'authsome.js'),
  },
  'password-reset': {
    path: 'password-reset',
  },
  mailer: {
    from: 'info@wax.net',
    path: path.join(__dirname, 'mailer'),
  },
  permissions,
  pubsweet: {
    components,
  },
  'pubsweet-client': {
    API_ENDPOINT: '/api',
  },
  'pubsweet-server': {
    db: {},
    useGraphQLServer: true,
    useJobQueue: false,
    serveClient: false,
    useFileStorage: false,
    graphiql: true,
    emailVerificationTokenExpiry: {
      amount: 24,
      unit: 'hours',
    },
    passwordResetTokenExpiry: {
      amount: 24,
      unit: 'hours',
    },
    port: 3000,
    protocol: 'http',
    host: 'localhost',
    uploads: 'uploads',
    pool: { min: 0, max: 10, idleTimeoutMillis: 1000 },
    useFileStorage: true,
  },
  teams: {
    global: {
      admin: {
        displayName: 'Admin',
        role: 'admin',
      },
    },
    nonGlobal: {
      author: {
        displayName: 'Author',
        role: 'author',
      },
      viewer: {
        displayName: 'Viewer',
        role: 'viewer',
      },
    },
  },

  schema: {},
  validations: path.join(__dirname, 'modules', 'validations'),
}
