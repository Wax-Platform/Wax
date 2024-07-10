import { startClient } from '@coko/client'

import routes from './routes'
import theme from './theme'
// import makeApolloConfig from './apolloConfig'

const options = {
  // makeApolloConfig,
}

const { CLIENT_SHOW_EMAIL_LOGIN_OPTION } = process.env

startClient(routes(CLIENT_SHOW_EMAIL_LOGIN_OPTION === 'true'), theme, options)
