/* eslint-disable global-require */
const {
  isAuthenticated,
  isAdmin,
  isGlobalSpecific,
  // hasEditAccessBasedOnRoleAndStage,
} = require('../permissions/helpers/helpers')

const canAddBooks = async ctx => {
  try {
    const { userId } = ctx
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    return isGlobalSpecific(userId, 'productionEditor')
  } catch (e) {
    throw new Error(e.message)
  }
}

const canAssignMembers = async (ctx, args) => {
  try {
    const { userId } = ctx
    const bookId = args.bookId || args.id

    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    if (bookId) {
      const User = require('../../models/user/user.model')
      return User.hasRoleOnObject(userId, 'productionEditor', bookId)
    }

    return isGlobalSpecific(userId, 'productionEditor')
  } catch (e) {
    throw new Error(e.message)
  }
}

const canInteractWithBooks = async (ctx, args) => {
  try {
    const { userId } = ctx
    const bookId = args.bookId || args.id

    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    const belongsToGlobalProductionEditorTeam = await isGlobalSpecific(
      userId,
      'productionEditor',
    )

    if (belongsToGlobalProductionEditorTeam) return true

    const User = require('../../models/user/user.model')
    return User.hasRoleOnObject(userId, 'productionEditor', bookId)
  } catch (e) {
    throw new Error(e.message)
  }
}

const canRemoveTeamMember = async (ctx, args) => {
  try {
    const { userId } = ctx
    const bookId = args.bookId || args.id
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    const belongsToGlobalProductionEditorTeam = await isGlobalSpecific(
      userId,
      'productionEditor',
    )

    if (belongsToGlobalProductionEditorTeam) return true

    const User = require('../../models/user/user.model')

    return User.hasRoleOnObject(userId, 'productionEditor', bookId)
  } catch (e) {
    throw new Error(e.message)
  }
}

const canViewAddTeamMember = async ctx => {
  return true
}

const canViewFragmentEdit = async (ctx, args) => {
  try {
    const { userId } = ctx
    const { workflowStages } = args
    const bookId = args.bookId || args.id
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    if (bookId) {
      const User = require('../../models/user/user.model')

      const belongsToBookProductionEditorTeam = await User.hasRoleOnObject(
        userId,
        'productionEditor',
        bookId,
      )

      if (belongsToBookProductionEditorTeam) return true

      const isEditingSate =
        workflowStages.find(stage => stage.type === 'edit').value === 0

      const isReviewingSate =
        workflowStages.find(stage => stage.type === 'review').value === 0

      const isCleaningUpSate =
        workflowStages.find(stage => stage.type === 'clean_up').value === 0

      if (
        (isEditingSate || isCleaningUpSate) &&
        (await User.hasRoleOnObject(userId, 'copyEditor', bookId))
      ) {
        return true
      }

      if (
        isReviewingSate &&
        (await User.hasRoleOnObject(userId, 'author', bookId))
      ) {
        return true
      }
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canEditFull = async (ctx, args) => {
  try {
    const { userId } = ctx
    const { workflowStages } = args
    const bookId = args.bookId || args.id
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    if (bookId) {
      const User = require('../../models/user/user.model')

      if (await User.hasRoleOnObject(userId, 'productionEditor', bookId)) {
        return true
      }

      const isEditingSate =
        workflowStages.find(stage => stage.type === 'edit').value === 0

      const isCleaningUpSate =
        workflowStages.find(stage => stage.type === 'clean_up').value === 0

      if (
        (isEditingSate || isCleaningUpSate) &&
        (await User.hasRoleOnObject(userId, 'copyEditor', bookId))
      ) {
        return true
      }
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canEditReview = async (ctx, args) => {
  const { userId } = ctx
  const { workflowStages } = args
  const isAuthenticatedUser = await isAuthenticated(userId)
  const bookId = args.bookId || args.id

  if (!isAuthenticatedUser) {
    return false
  }

  const belongsToAdminTeam = await isAdmin(userId)

  if (belongsToAdminTeam) {
    return true
  }

  if (bookId) {
    const isReviewingSate =
      workflowStages.find(stage => stage.type === 'review').value === 0

    const User = require('../../models/user/user.model')

    if (
      !(await canEditFull(ctx, args)) &&
      (await User.hasRoleOnObject(userId, 'author', bookId)) &&
      isReviewingSate
    ) {
      return true
    }
  }

  return false
}

const canEditSelection = async (ctx, args) => {
  if (!(await canEditFull(ctx, args)) && !(await canEditReview(ctx, args))) {
    return true
  }

  return false
}

const canAccessBook = async (ctx, args) => {
  try {
    const { userId } = ctx
    const { type } = args

    const bookId = type === 'bookComponent' ? args.bookId : args.id
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    const User = require('../../models/user/user.model')

    if (
      (await User.hasRoleOnObject(userId, 'author', bookId)) ||
      (await User.hasRoleOnObject(userId, 'copyEditor', bookId)) ||
      (await User.hasRoleOnObject(userId, 'productionEditor', bookId)) ||
      (await isGlobalSpecific(userId, 'productionEditor'))
    ) {
      return true
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canToggleTrackChanges = async (ctx, args) => {
  try {
    const { userId } = ctx
    const bookId = args.bookId || args.id
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    const User = require('../../models/user/user.model')

    if (
      bookId &&
      ((await User.hasRoleOnObject(userId, 'author', bookId)) ||
        (await User.hasRoleOnObject(userId, 'copyEditor', bookId)))
    ) {
      return true
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canInteractWithBookComponents = async (ctx, args) => {
  try {
    const { userId } = ctx
    const bookId = args.bookId || args.id
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    const User = require('../../models/user/user.model')

    if (
      (await User.hasRoleOnObject(userId, 'copyEditor', bookId)) ||
      (await User.hasRoleOnObject(userId, 'productionEditor', bookId)) ||
      (await isGlobalSpecific(userId, 'productionEditor'))
    ) {
      return true
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canChangeProgress = async (ctx, args) => {
  try {
    const { userId } = ctx
    const { type: progressType } = args
    const bookId = args.bookId || args.id
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    if (bookId) {
      const User = require('../../models/user/user.model')

      if (await User.hasRoleOnObject(userId, 'productionEditor', bookId)) {
        return true
      }

      if (await User.hasRoleOnObject(userId, 'copyEditor', bookId)) {
        let condition = false

        switch (progressType) {
          case 'file_prep':
          case 'edit':
          case 'review':
          case 'clean_up':
            condition = true
            break

          case 'page_check':
          case 'final':
            condition = false
            break

          default:
            return condition
        }

        return condition
      }

      if (await User.hasRoleOnObject(userId, 'author', bookId)) {
        let condition = false

        switch (progressType) {
          case 'review':
            condition = true
            break

          default:
            return condition
        }

        return condition
      }
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canChangeProgressLeft = async (ctx, args) => {
  try {
    const { userId } = ctx
    const { currentValues: workFlowStages, type: progressType } = args
    const bookId = args.bookId || args.id
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    const reviewValue =
      workFlowStages.find(stage => stage.type === 'review').value === 0

    // const fileprepValue =
    //   workFlowStages.find(stage => stage.type === 'file_prep').value === 0

    const editValue =
      workFlowStages.find(stage => stage.type === 'edit').value === 0

    const cleanupValue =
      workFlowStages.find(stage => stage.type === 'clean_up').value === 0

    if (bookId) {
      const User = require('../../models/user/user.model')

      if (await User.hasRoleOnObject(userId, 'productionEditor', bookId)) {
        return true
      }

      if (await User.hasRoleOnObject(userId, 'copyEditor', bookId)) {
        let condition = false

        switch (progressType) {
          case 'file_prep': {
            if (editValue) {
              return true
            }

            break
          }

          case 'edit': {
            if (reviewValue) {
              condition = true
            }

            break
          }

          case 'review': {
            if (cleanupValue) {
              condition = true
            }

            break
          }

          case 'clean_up': {
            condition = false

            break
          }

          case 'page_check':
            break

          case 'final': {
            condition = false
            break
          }

          default: {
            return condition
          }
        }

        return condition
      }

      if (await User.hasRoleOnObject(userId, 'author', bookId)) {
        return false
      }
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canChangeProgressRight = async (ctx, args) => {
  try {
    const { userId } = ctx
    const { currentValues: workflowStages, type: progressType } = args
    const bookId = args.bookId || args.id
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    const reviewValue =
      workflowStages.find(stage => stage.type === 'review').value === 0

    const editValue =
      workflowStages.find(stage => stage.type === 'edit').value === 0

    const cleanupValue =
      workflowStages.find(stage => stage.type === 'clean_up').value === 0

    const fileprepValue =
      workflowStages.find(stage => stage.type === 'file_prep').value === 0

    if (bookId) {
      const User = require('../../models/user/user.model')

      if (await User.hasRoleOnObject(userId, 'productionEditor', bookId)) {
        return true
      }

      if (await User.hasRoleOnObject(userId, 'copyEditor', bookId)) {
        let condition = false

        switch (progressType) {
          case 'file_prep': {
            if (fileprepValue) {
              return true
            }

            break
          }

          case 'edit': {
            if (editValue) {
              condition = true
            }

            break
          }

          case 'review': {
            if (reviewValue) {
              condition = true
            }

            break
          }

          case 'clean_up': {
            if (cleanupValue) {
              condition = true
            }

            break
          }

          case 'page_check':
            condition = false
            break

          case 'final': {
            condition = false
            break
          }

          default: {
            return condition
          }
        }

        return condition
      }

      if (await User.hasRoleOnObject(userId, 'author', bookId)) {
        let condition = false

        switch (progressType) {
          case 'review': {
            if (reviewValue) {
              condition = true
            }

            break
          }

          default: {
            return condition
          }
        }

        return condition
      }
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = {
  permissions: {
    canAddBooks,
    canAssignMembers,
    dashboard: {
      canRenameBooks: canInteractWithBooks,
      canDeleteBooks: canInteractWithBooks,
      canArchiveBooks: canInteractWithBooks,
    },
    canViewAddTeamMember,
    canRemoveTeamMember,
    canViewFragmentEdit, // check also kdk/server/controllers/bookComponent.controller.js:708
    editor: {
      canEditFull,
      canEditSelection,
      canEditReview,
      canAccessBook,
      canToggleTrackChanges,
    },
    bookBuilder: {
      canViewTeamManager: canInteractWithBooks,
      canViewAddComponent: canInteractWithBookComponents,
      canViewUploadButton: canInteractWithBookComponents,
      canViewAlignmentTool: canInteractWithBookComponents,
      canViewDeleteAction: canInteractWithBookComponents,
      canViewStateList: async () => {
        return true
      },
      canAccessBook,
      canReorderBookComponent: canInteractWithBookComponents,
      canViewMultipleFilesUpload: canInteractWithBookComponents,
      exportBook: async () => {
        return true
      },
      downloadEPUB: async () => {
        return true
      },
    },
    workFlowStages: {
      canChangeProgressList: canChangeProgress,
      canChangeProgressListRight: canChangeProgressRight,
      canChangeProgressListLeft: canChangeProgressLeft,
    },
  },
  teams: {
    productionEditor: {
      name: 'Production Editor',
      role: 'productionEditor',
      color: {
        addition: '#0c457d',
        deletion: '#0c457d',
      },
      weight: 1,
    },
    copyEditor: {
      name: 'Copy Editor',
      role: 'copyEditor',
      color: {
        addition: '#0ea7b5',
        deletion: '#0ea7b5',
      },
      weight: 2,
    },
    author: {
      name: 'Author',
      role: 'author',
      color: {
        addition: '#e8702a',
        deletion: '#e8702a',
      },
      weight: 3,
    },
  },
}
