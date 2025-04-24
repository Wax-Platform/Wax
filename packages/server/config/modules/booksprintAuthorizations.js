/* eslint-disable global-require */
const {
  isAuthenticated,
  isAdmin,
  isGlobalSpecific,
  // hasEditAccessBasedOnRoleAndStage,
} = require('../permissions/helpers/helpers')

const canAddBooks = async ctx => {
  try {
    const { user: userId } = ctx
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
    const { user: userId } = ctx
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
    const { user: userId } = ctx
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

const canViewAddTeamMember = async () => {
  return true
}

const canRemoveTeamMember = async (ctx, args) => {
  try {
    const { user: userId } = ctx
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

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canViewFragmentEdit = async (ctx, args) => {
  try {
    const { user: userId } = ctx
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

      const isCleaningUpSate =
        workflowStages.find(stage => stage.type === 'clean_up').value === 0

      if (
        !isCleaningUpSate &&
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
    const { user: userId } = ctx
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

      const isCleaningUpSate =
        workflowStages.find(stage => stage.type === 'clean_up').value === 0

      if (
        !isCleaningUpSate &&
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

const canEditReview = async (ctx, args) => {
  try {
    const { user: userId } = ctx
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
  } catch (e) {
    throw new Error(e.message)
  }
}

const canEditSelection = async (ctx, args) => {
  if (!(await canEditFull(ctx, args)) && !(await canEditReview(ctx, args))) {
    return true
  }

  return false
}

const canAccessBook = async (ctx, args) => {
  try {
    const { user: userId } = ctx
    const { type } = args
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    let bookId

    if (type === 'bookComponent') {
      bookId = args.bookId
    } else {
      bookId = args.id
    }

    if (bookId) {
      const User = require('../../models/user/user.model')

      if (
        (await User.hasRoleOnObject(userId, 'author', bookId)) ||
        (await User.hasRoleOnObject(userId, 'productionEditor', bookId))
      ) {
        return true
      }
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canViewTeamManager = async (ctx, args) => {
  try {
    const { user: userId } = ctx
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    if (args.id) {
      const User = require('../../models/user/user.model')

      if (
        (await isGlobalSpecific(userId, 'productionEditor')) ||
        (await User.hasRoleOnObject(userId, 'productionEditor', args.id))
      ) {
        return true
      }
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const canInteractWithBookComponents = async (ctx, args) => {
  try {
    const { user: userId } = ctx
    const { id: bookId } = args // args contains the book object
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

      if (
        (await User.hasRoleOnObject(userId, 'productionEditor', bookId)) ||
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

const canInteract = async (ctx, args) => {
  try {
    const { user: userId } = ctx
    const { id: bookId } = args // args contains the book object
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
      (await User.hasRoleOnObject(userId, 'productionEditor', bookId))
    ) {
      return true
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

// method doesn't exist in authsomeModeBooksprints
const canInteractWithFragments = async () => {
  return true
}

const canChangeProgress = async (ctx, args) => {
  try {
    const { user: userId } = ctx
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
      (await User.hasRoleOnObject(userId, 'productionEditor', bookId))
    ) {
      return true
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
      //   canToggleTrackChanges, no such thing in authsomeModeBooksprints
    },
    bookBuilder: {
      canViewTeamManager,
      canViewAddComponent: canInteractWithBookComponents,
      canViewUploadButton: canInteract,
      canViewAlignmentTool: canInteract,
      canViewDeleteAction: canInteractWithBookComponents,
      canViewStateList: canInteract,
      canAccessBook,
      canReorderBookComponent: canInteractWithFragments,
      canViewMultipleFilesUpload: canInteract,
      exportBook: async () => {
        return true
      },
      downloadEPUB: async () => {
        return true
      },
    },
    workFlowStages: {
      canChangeProgressList: canChangeProgress,
      canChangeProgressListRight: canChangeProgress,
      canChangeProgressListLeft: canChangeProgress,
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
    author: {
      name: 'Author',
      role: 'author',
      color: {
        addition: '#e8702a',
        deletion: '#e8702a',
      },
      weight: 2,
    },
  },
}
