import { startClient } from '@coko/client'

import routes from './routes'
import theme from './theme'
// import makeApolloConfig from './apolloConfig'

const options = {
  // makeApolloConfig,
}

startClient(routes, theme, options)
