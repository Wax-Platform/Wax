const { rule } = require('@coko/server/authorization')

const permissions = {
  Mutation: {
    deleteUsers: rule()(async (_, args, ctx) => {
      // allow only if current user is not in the list of ids to delete
      return args.ids.indexOf(ctx.user) === -1
    }),
    deactivateUsers: rule()(async (_, args, ctx) => {
      // allow only if current user is not in the list of ids to deactivate
      return args.ids.indexOf(ctx.user) === -1
    }),
  },
}

module.exports = permissions
