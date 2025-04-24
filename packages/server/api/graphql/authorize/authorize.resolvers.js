const map = require('lodash/map')
const config = require('config')

const { Book, BookComponent, BookComponentState, ApplicationParameter } =
  require('../../../models').models

const { permissions, teams } = config.get('authorization')

const {
  canAddBooks,
  canAssignMembers,
  canRemoveTeamMember,
  canViewAddTeamMember,
  canViewFragmentEdit,
  editor,
  dashboard,
  bookBuilder,
  workFlowStages,
} = permissions

const flatPermissions = {}

Object.keys(permissions).forEach(key => {
  if (typeof permissions[key] === 'object') {
    const innerObject = Object.keys(permissions[key]).map(
      key2 => (flatPermissions[key2] = permissions[key][key2]),
    )

    return innerObject
  }

  return (flatPermissions[key] = permissions[key])
})

const executeMultipleAuthorizeRules = async (ctx, value, rules) => {
  const permissionsResult = await Promise.all(
    map(rules, (_, key) => {
      return flatPermissions[key](ctx, value)
        .then(result => {
          return { [key]: result }
        })
        .catch(() => {
          return { [key]: false }
        })
    }),
  )

  return permissionsResult.reduce((r, c) => Object.assign(r, c), {})
}

const getDashBoardRules = async (_, __, ctx) => {
  await ctx.connectors.UserLoader.model.userTeams.clear()

  const { result: books } = await Book.find({ deleted: false })

  const canAddBook = await executeMultipleAuthorizeRules(
    ctx,
    {},
    { canAddBooks },
  )

  const assignMembers = await executeMultipleAuthorizeRules(
    ctx,
    {},
    { canAssignMembers },
  )

  const bookRules = await Promise.all(
    map(books, async value => {
      const data = await executeMultipleAuthorizeRules(ctx, value, dashboard)

      return { id: value.id, ...data }
    }),
  )

  return {
    bookRules,
    canAddBooks: canAddBook.canAddBooks,
    canAssignMembers: assignMembers.canAssignMembers,
  }
}

const getBookBuilderRules = async (_, args, ctx) => {
  const { result: bookBuilderAppConfig } = await ApplicationParameter.find({
    context: 'bookBuilder',
    area: 'stages',
  })

  await ctx.connectors.UserLoader.model.userTeams.clear()
  const book = await Book.findById(args.id)

  const { result: bookComponents } = await BookComponent.find({
    deleted: false,
    bookId: args.id,
  })

  const bookComponentsIds = bookComponents.map(component => component.id)

  const bookComponentState = await BookComponentState.query().whereIn(
    'book_component_id',
    bookComponentsIds,
  )

  const canViewAddTeamMembers = await executeMultipleAuthorizeRules(
    ctx,
    {},
    { canViewAddTeamMember },
  )

  const teamRoles = await Promise.all(
    map(Object.keys(teams), async role => {
      const rules = await executeMultipleAuthorizeRules(
        ctx,
        { id: book.id, role },
        {
          canRemoveTeamMember,
        },
      )

      return { role, ...rules }
    }),
  )

  const bookComponentRules = await executeMultipleAuthorizeRules(
    ctx,
    book,
    bookBuilder,
  )

  const result = {
    id: book.id,
    canViewAddTeamMember: canViewAddTeamMembers.canViewAddTeamMember,
    teamRoles,
    ...bookComponentRules,
  }

  result.bookComponentStateRules = await Promise.all(
    map(bookComponentState, async value => {
      // console.log('value for canViewFragments edit  >>>>>>>>>>>>>>>>>');
      // console.log(value);
      const stage = await Promise.all(
        map(bookBuilderAppConfig[0].config, async v => {
          const rules = await executeMultipleAuthorizeRules(
            ctx,
            {
              bookId: book.id,
              type: v.type,
              currentValues: value.workflowStages,
            },
            workFlowStages,
          )

          return { type: v.type, ...rules }
        }),
      )

      const canViewFragmentEdits = await executeMultipleAuthorizeRules(
        ctx,
        { bookId: book.id, ...value },
        { canViewFragmentEdit },
      )

      return {
        id: value.id,
        bookComponentId: value.bookComponentId,
        canViewFragmentEdit: canViewFragmentEdits.canViewFragmentEdit,
        stage,
      }
    }),
  )

  // console.log(result);

  return result
}

const getWaxRules = async (_, args, ctx) => {
  await ctx.connectors.UserLoader.model.userTeams.clear()
  const bookComponent = await BookComponent.findById(args.id)

  const { workflowStages } = await BookComponentState.findOne({
    bookComponentId: bookComponent.id,
  })

  bookComponent.workflowStages = workflowStages

  const data = await executeMultipleAuthorizeRules(ctx, bookComponent, editor)

  return { ...data }
}

module.exports = {
  Query: {
    getWaxRules,
    getDashBoardRules,
    getBookBuilderRules,
  },
}
