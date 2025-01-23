import { InMemoryCache } from '@apollo/client'
import { startClient } from '@coko/client'
import routes from './routes'
import theme from './theme'

const cache = new InMemoryCache({
  typePolicies: {
    Resource: {
      fields: {
        children: {
          merge(existing = [], incoming) {
            return incoming
          },
        },
      },
    },
  },
})

const makeApolloConfig = originalConfig => {
  return {
    ...originalConfig,
    cache,
  }
}

const options = {
  makeApolloConfig,
}

const { CLIENT_SHOW_EMAIL_LOGIN_OPTION } = process.env

startClient(routes(CLIENT_SHOW_EMAIL_LOGIN_OPTION === 'true'), theme, options)
