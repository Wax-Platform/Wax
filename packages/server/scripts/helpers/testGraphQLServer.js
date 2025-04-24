/* eslint-disable import/no-extraneous-dependencies */
const {
  ApolloServer,
  // ForbiddenError,
  // UserInputError,
  // AuthenticationError,
  // ApolloError,
} = require('apollo-server-express')

const isEmpty = require('lodash/isEmpty')
const config = require('config')

// const logger = require('@pubsweet/logger')
// const errors = require('@pubsweet/errors')
const connectors = require('pubsweet-server/src/connectors')
const loaders = require('pubsweet-server/src/graphql/loaders')
const helpers = require('pubsweet-server/src/helpers/authorization')
const schema = require('pubsweet-server/src/graphql/schema')

const { applyMiddleware } = require('graphql-middleware')
const { shield } = require('graphql-shield')

// const hostname = config.has('pubsweet-server.hostname')
//   ? config.get('pubsweet-server.hostname')
//   : 'localhost'

const extraApolloConfig = config.has('pubsweet-server.apollo')
  ? config.get('pubsweet-server.apollo')
  : {}

const testGraphQLServer = testUserContext => {
  if (process.env.NODE_ENV !== 'test' && testUserContext) {
    throw new Error(
      'Do not pass a test user context unless you are running a test suite',
    )
  }

  const createdLoaders = loaders()

  const middleware = []
  const permissions = config.has('permissions') && config.get('permissions')

  if (!isEmpty(permissions)) {
    const authorizationMiddleware = shield(permissions, { debug: true })
    middleware.push(authorizationMiddleware)
  }

  const schemaWithMiddleWare = applyMiddleware(schema, ...middleware)

  return new ApolloServer({
    schema: schemaWithMiddleWare,
    context: () => ({
      helpers,
      connectors,
      user: testUserContext,
      loaders: createdLoaders,
    }),
    // formatError: err => {
    //   const error = isEmpty(err.originalError) ? err : err.originalError

    //   logger.error(error.message, { error })

    //   const isPubsweetDefinedError = Object.values(errors).some(
    //     pubsweetError => error instanceof pubsweetError,
    //   )

    //   const isGraphqlDefinedError = [
    //     ForbiddenError,
    //     UserInputError,
    //     AuthenticationError,
    //     ApolloError,
    //   ].some(graphqlError => error instanceof graphqlError)

    //   // err is always a GraphQLError which should be passed to the client
    //   if (
    //     !isEmpty(err.originalError) &&
    //     !isPubsweetDefinedError &&
    //     !isGraphqlDefinedError
    //   )
    //     return {
    //       name: 'Server Error',
    //       message: 'Something went wrong! Please contact your administrator',
    //     }

    //   if (isGraphqlDefinedError) return error

    //   return {
    //     name: error.name || 'GraphQLError',
    //     message: error.message,
    //     extensions: {
    //       code: err.extensions.code,
    //     },
    //   }
    // },
    ...extraApolloConfig,
  })
}

// module.exports = testGraphQLServer

// const testGraphQLServer = require('../../../graphqlServer')

module.exports = testGraphQLServer
