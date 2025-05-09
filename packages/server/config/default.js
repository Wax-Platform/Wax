const path = require('path')

const components = require('./components')
const vanillaAuthorizations = require('./modules/vanillaAuthorizations')
const booksprintsAuthorizations = require('./modules/booksprintAuthorizations')
const bbVanilla = require('./modules/bookBuilderVanilla')
const bbOEN = require('./modules/bookBuilderOEN')
const bbBooksprints = require('./modules/bookBuilderBooksprints')
const oenTeams = require('./modules/oenTeams')
const vanillaTeams = require('./modules/vanillaTeams')
const podTeams = require('./modules/podTeams')
const vanillaFilters = require('./modules/vanillaFilters')
const podFilters = require('./modules/podFilters')
const booksprintTeams = require('./modules/booksprintTeams')
const vanillaPermissions = require('./permissions/vanilla.permissions')
const booksprintPermissions = require('./permissions/booksprint.permissions')
const oenPermissions = require('./permissions/oen.permissions')
const podPermissions = require('./permissions/pod.permissions')

const flavour =
  process.env.WAX_FLAVOUR && process.env.WAX_FLAVOUR === 'BOOKSPRINTS'
    ? 'BOOKSPRINTS'
    : 'VANILLA'

const featureBookStructureEnabled =
  (process.env.FEATURE_BOOK_STRUCTURE &&
    JSON.parse(process.env.FEATURE_BOOK_STRUCTURE)) ||
  false

const featurePODEnabled =
  (process.env.FEATURE_POD && JSON.parse(process.env.FEATURE_POD)) || false

let bookBuilder
let flavorPermissions = vanillaPermissions

if (!featureBookStructureEnabled) {
  if (flavour === 'BOOKSPRINTS') {
    bookBuilder = bbBooksprints
    flavorPermissions = booksprintPermissions
  } else {
    bookBuilder = bbVanilla
  }
} else {
  flavorPermissions = oenPermissions
  bookBuilder = bbOEN
}

let flavorTeams = oenTeams

if (!featureBookStructureEnabled) {
  flavorTeams = flavour === 'BOOKSPRINTS' ? booksprintTeams : vanillaTeams
}

let filters = vanillaFilters

if (featurePODEnabled) {
  flavorTeams = podTeams
  flavorPermissions = podPermissions
  filters = podFilters
}

module.exports = {
  authorization:
    flavour === 'BOOKSPRINTS'
      ? booksprintsAuthorizations
      : vanillaAuthorizations,
  bookBuilder,
  'passwordReset': {
    pathToPage: '/password-reset',
  },
  featureBookStructure: false,
  flavour,
  featureUploadDOCXFiles: true,
  permissions: flavorPermissions,
  filters,
  components,
  useGraphQLServer: true,
  useFileStorage: true,
  graphiql: true,
  tokenExpiresIn: '360 days',
  port: 3000,
  emailVerificationTokenExpiry: {
    amount: 24,
    unit: 'hours',
  },
  passwordResetTokenExpiry: {
    amount: 24,
    unit: 'hours',
  },
  pool: { min: 0, max: 100, idleTimeoutMillis: 1000 },
  // cron: {
  //   path: path.join(__dirname, '..', 'services', 'cron.service.js'),
  // },
  mailer: {
    from: 'nobody@cokotest.com',
    transport: {
      host: 'smtp.ethereal.email',
      auth: {
        user: 'trinity.rosenbaum91@ethereal.email',
        pass: 'e4v9TTA2sEfA3JQAc2',
      },
    },
  },
  teams: flavorTeams,
  tempDirectoryCleanUp: true,
  db: {
    host: 'db',
    database: 'wax_dev',
    user: 'dev_user',
    password: 'dev_user_password',
  },
  onStartup: [
    {
      label: 'Seed Admin',
      execute: async () => {
        const seedAdmin = require('../scripts/seeds/admin')
        const adminUser = config.get('admin')
        await seedAdmin({ ...adminUser })
      },
    },
    {
      label: 'Seed Application Parameters',
      execute: async () => {
        const seedApplicationParameters = require('../scripts/seeds/applicationParameters')
        await seedApplicationParameters()
      },
    },
    {
      label: 'Seed Templates',
      execute: async () => {
        const seedTemplates = require('../scripts/seeds/templates')
        await seedTemplates()
      },
    },
    {
      label: 'Clean up Locks',
      execute: async () => {
        const { cleanUpLocks } = require('../../services/bookComponentLock.service')
        await cleanUpLocks()
      },
    },
    {
      label: 'Start YJS Service',
      execute: async () => {
        const { startWSServer } = require('../../startWebSocketServer')
        await startWSServer()
      },
    },
    {
      label: 'Check Scripts Validation',
      execute: async () => {
        const config = require('config')
        const isEmpty = require('lodash/isEmpty')
        
        const hasScripts =
          config.has('export') &&
          config.has('export.scripts') &&
          !isEmpty(config.get('export.scripts'))
        
        try {
          if (hasScripts) {
            const scripts = config.get('export.scripts')
            const errors = []
      
            for (let i = 0; i < scripts.length; i += 1) {
              for (let j = i + 1; j < scripts.length; j += 1) {
                if (
                  scripts[i].label === scripts[j].label &&
                  scripts[i].filename !== scripts[j].filename &&
                  scripts[i].scope === scripts[j].scope
                ) {
                  errors.push(
                    `your have provided the same label (${scripts[i].label}) for two different scripts`,
                  )
                }
      
                if (
                  scripts[i].label === scripts[j].label &&
                  scripts[i].filename === scripts[j].filename &&
                  scripts[i].scope === scripts[j].scope
                ) {
                  errors.push(
                    `your have declared the script with label (${scripts[i].label}) twice`,
                  )
                }
              }
            }
      
            if (errors.length !== 0) {
              throw new Error(errors)
            }
          }
        } catch (e) {
          throw new Error(e)
        }
      },
    },
  ],
}
