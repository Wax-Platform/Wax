const { rule } = require('@coko/server/authorization')
const { indexOf } = require('lodash/indexOf')

const {
  isAuthenticated,
  isAdmin,
  isGlobalSpecific,
  hasEditAccessBasedOnRoleAndStage,
} = require('./helpers/helpers')

const editAccessMatrix = {
  author: [{ type: 'review', label: 'Review', value: 0 }],
  copyEditor: [
    { type: 'edit', label: 'Edit', value: 0 },
    { title: 'Clean Up', type: 'clean_up', value: 0 },
  ],
}

const isAuthor = async (userId, bookId) => {
  try {
    /* eslint-disable global-require */
    const User = require('../../models/user/user.model')
    /* eslint-enable global-require */
    return User.hasRoleOnObject(userId, 'author', bookId)
  } catch (e) {
    throw new Error(e.message)
  }
}

const isProductionEditor = async (userId, bookId) => {
  try {
    /* eslint-disable global-require */
    const User = require('../../models/user/user.model')
    /* eslint-enable global-require */
    return User.hasRoleOnObject(userId, 'productionEditor', bookId)
  } catch (e) {
    throw new Error(e.message)
  }
}

const isCopyEditor = async (userId, bookId) => {
  try {
    /* eslint-disable global-require */
    const User = require('../../models/user/user.model')
    /* eslint-enable global-require */
    return User.hasRoleOnObject(userId, 'copyEditor', bookId)
  } catch (e) {
    throw new Error(e.message)
  }
}

const hasAnyRoleOnObject = async (userId, bookId) => {
  try {
    const belongsToAuthorTeam = await isAuthor(userId, bookId)

    if (belongsToAuthorTeam) {
      return true
    }

    const belongsToProductionEditorTeam = await isProductionEditor(
      userId,
      bookId,
    )

    if (belongsToProductionEditorTeam) {
      return true
    }

    const belongsToCopyEditorTeam = await isCopyEditor(userId, bookId)

    if (belongsToCopyEditorTeam) {
      return true
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const allButTheAuthor = async (userId, bookId) => {
  try {
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

    if (belongsToGlobalProductionEditorTeam) {
      return true
    }

    const belongsToProductionEditorTeam = await isProductionEditor(
      userId,
      bookId,
    )

    if (belongsToProductionEditorTeam) {
      return true
    }

    const belongsToCopyEditorTeam = await isCopyEditor(userId, bookId)

    if (belongsToCopyEditorTeam) {
      return true
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const isGlobalProductionEditorOrBelongsToObjectTeam = async (
  userId,
  bookId,
) => {
  try {
    const belongsToGlobalProductionEditorTeam = await isGlobalSpecific(
      userId,
      'productionEditor',
    )

    if (belongsToGlobalProductionEditorTeam) {
      return belongsToGlobalProductionEditorTeam
    }

    const belongsToAnyObjectTeam = await hasAnyRoleOnObject(userId, bookId)

    return belongsToAnyObjectTeam
  } catch (e) {
    throw new Error(e.message)
  }
}

const canInteractWithBookAndRelevantAssets = async (userId, bookId) => {
  try {
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    return isGlobalProductionEditorOrBelongsToObjectTeam(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
}

const isAuthenticatedRule = rule()(async (parent, args, ctx, info) => {
  try {
    const { userId } = ctx
    return isAuthenticated(userId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const isAdminRule = rule()(async (parent, args, ctx, info) => {
  try {
    const { userId } = ctx
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    return isAdmin(userId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const createBookRule = rule()(async (parent, args, ctx, info) => {
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
})

const modifyBooksInDashboardRule = rule()(
  async (parent, { id: bookId }, ctx, info) => {
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

      const belongsToGlobalProductionEditorTeam = await isGlobalSpecific(
        userId,
        'productionEditor',
      )

      const belongsToBookProductionEditorTeam = await isProductionEditor(
        userId,
        bookId,
      )

      return (
        belongsToGlobalProductionEditorTeam || belongsToBookProductionEditorTeam
      )
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const getBookRule = rule()(async (parent, { id: bookId }, ctx, info) => {
  try {
    const { userId } = ctx

    return canInteractWithBookAndRelevantAssets(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const interactWithBookFilesRule = rule()(
  async (parent, { entityId: bookId }, ctx, info) => {
    try {
      const { userId } = ctx

      return canInteractWithBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateFileRule = rule()(async (parent, { id: fileId }, ctx, info) => {
  try {
    const { userId } = ctx
    /* eslint-disable global-require */
    const File = require('../../models/file/file.model')
    /* eslint-enable global-require */
    const file = await File.findById(fileId)
    const { objectId: bookId } = file

    if (!bookId) {
      throw new Error('file does not contain objectId')
    }

    return canInteractWithBookAndRelevantAssets(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const deleteFilesRule = rule()(async (parent, { ids }, ctx, info) => {
  try {
    const { userId } = ctx
    /* eslint-disable global-require */
    const File = require('../../models/file/file.model')
    /* eslint-enable global-require */
    const files = File.query().whereIn(ids)
    const bookIds = []

    files.forEach(file => {
      if (file.objectId && indexOf(bookIds, file.objectId) === -1) {
        bookIds.push(file.objectId)
      }
    })

    if (bookIds.length === 0) {
      throw new Error('the files that you want to delete should have objectId')
    }

    if (bookIds.length > 1) {
      throw new Error('multiple objectIds detected')
    }

    return canInteractWithBookAndRelevantAssets(userId, bookIds[0])
  } catch (e) {
    throw new Error(e.message)
  }
})

const getBookComponentRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { userId } = ctx

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return canInteractWithBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateMetadataRule = rule()(async (parent, { id: bookId }, ctx, info) => {
  try {
    const { userId } = ctx

    if (!bookId) {
      throw new Error('book id should be provided')
    }

    return canInteractWithBookAndRelevantAssets(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const updateRunningHeadersRule = rule()(
  async (parent, { id: bookId }, ctx, info) => {
    try {
      const { userId } = ctx

      if (!bookId) {
        throw new Error('book id should be provided')
      }

      return canInteractWithBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const exportBookRule = rule()(async (parent, { bookId }, ctx, info) => {
  try {
    const { userId } = ctx

    if (!bookId) {
      throw new Error('book id should be provided')
    }

    return canInteractWithBookAndRelevantAssets(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const ingestWordFileRule = rule()(async (parent, { bookId }, ctx, info) => {
  try {
    const { userId } = ctx

    if (!bookId) {
      throw new Error('book id should be provided')
    }

    return allButTheAuthor(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const addBookComponentRule = rule()(async (parent, { bookId }, ctx, info) => {
  try {
    const { userId } = ctx

    if (!bookId) {
      throw new Error('book id should be provided')
    }

    return allButTheAuthor(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const deleteBookComponentRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { userId } = ctx

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return allButTheAuthor(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updatePaginationRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { userId } = ctx

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return canInteractWithBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateTrackChangesRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { userId } = ctx

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return allButTheAuthor(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateComponentTypeRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { userId } = ctx

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return canInteractWithBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const toggleIncludeInTOCRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { userId } = ctx

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return canInteractWithBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateBookComponentOrderRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { userId } = ctx

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return canInteractWithBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateKetidaTeamMembersRule = rule()(
  async (parent, { teamId }, ctx, info) => {
    try {
      const { userId } = ctx

      /* eslint-disable global-require */
      const Team = require('../../models/team/team.model')
      /* eslint-enable global-require */
      const team = await Team.findById(teamId)
      const { objectId, global } = team

      if (global) {
        return isAdminRule()
      }

      if (!objectId) {
        throw new Error('team object id is needed')
      }

      return allButTheAuthor(userId, objectId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const unlockBookComponentRule = rule()(async (parent, { lock }, ctx, info) => {
  try {
    const { userId } = ctx

    const belongsToAdminTeam = await isAdminRule()

    if (belongsToAdminTeam) {
      return true
    }

    if (!lock) {
      throw new Error('no lock info provided')
    }

    const isAuthenticatedUser = await isAuthenticated(userId)
    return isAuthenticatedUser && userId === lock.userId
  } catch (e) {
    throw new Error(e.message)
  }
})

const interactWithBookComponentRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { userId } = ctx

      const belongsToAdminTeam = await isAdminRule()

      if (belongsToAdminTeam) {
        return true
      }

      const belongsToGlobalProductionEditorTeam = await isGlobalSpecific(
        userId,
        'productionEditor',
      )

      if (belongsToGlobalProductionEditorTeam) {
        return true
      }

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      const belongsToBookProductionEditorTeam = await isProductionEditor(
        userId,
        bookId,
      )

      if (belongsToBookProductionEditorTeam) {
        return true
      }

      const belongsToAuthorTeam = await isAuthor(userId, bookId)

      if (belongsToAuthorTeam) {
        return hasEditAccessBasedOnRoleAndStage(
          'author',
          bookComponentId,
          editAccessMatrix,
        )
      }

      const belongsToCopyEditorTeam = await isCopyEditor(userId, bookId)

      if (belongsToCopyEditorTeam) {
        return hasEditAccessBasedOnRoleAndStage(
          'copyEditor',
          bookComponentId,
          editAccessMatrix,
        )
      }

      return false
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const permissions = {
  Query: {
    '*': false,
    currentUser: isAuthenticatedRule,
    team: isAuthenticatedRule,
    teams: isAuthenticatedRule,
    getObjectTeams: isAuthenticatedRule,
    getApplicationParameters: isAuthenticatedRule,
    getBook: getBookRule,
    getPagedPreviewerLink: isAuthenticatedRule,
    getBookComponent: getBookComponentRule,
    getBookCollection: isAuthenticatedRule,
    getBookCollections: isAuthenticatedRule,
    getCustomTags: isAuthenticatedRule,
    getExportScripts: isAuthenticatedRule,
    getFiles: isAuthenticatedRule,
    getFile: isAuthenticatedRule,
    getSignedURL: isAuthenticatedRule,
    getEntityFiles: interactWithBookFilesRule,
    getSpecificFiles: isAuthenticatedRule,
    getTemplates: isAuthenticatedRule,
    getTemplate: isAuthenticatedRule,
    chatGPT: isAuthenticatedRule,
    openAi: isAuthenticatedRule,
    ragSearch: isAuthenticatedRule,
    getDocuments: isAuthenticatedRule,
  },
  Mutation: {
    '*': false,
    deleteUser: isAuthenticatedRule,
    updateUser: isAuthenticatedRule,
    updatePassword: isAuthenticatedRule,
    updateApplicationParameters: isAuthenticatedRule,
    archiveBook: modifyBooksInDashboardRule,
    createBook: createBookRule,
    renameBook: modifyBooksInDashboardRule,
    deleteBook: modifyBooksInDashboardRule,
    updateMetadata: updateMetadataRule,
    updateRunningHeaders: updateRunningHeadersRule,
    exportBook: exportBookRule,
    ingestWordFile: ingestWordFileRule,
    addBookComponent: addBookComponentRule,
    renameBookComponent: interactWithBookComponentRule,
    deleteBookComponent: deleteBookComponentRule,
    updateWorkflowState: isAuthenticatedRule,
    updatePagination: updatePaginationRule,
    unlockBookComponent: unlockBookComponentRule,
    lockBookComponent: interactWithBookComponentRule,
    updateTrackChanges: updateTrackChangesRule,
    updateContent: interactWithBookComponentRule,
    updateComponentType: updateComponentTypeRule,
    updateUploading: isAuthenticatedRule,
    toggleIncludeInTOC: toggleIncludeInTOCRule,
    addCustomTag: isAuthenticatedRule,
    updateBookComponentOrder: updateBookComponentOrderRule,
    uploadFiles: interactWithBookFilesRule,
    updateFile: updateFileRule,
    deleteFiles: deleteFilesRule,
    updateKetidaTeamMembers: updateKetidaTeamMembersRule,
    searchForUsers: isAuthenticatedRule,
    createTemplate: isAuthenticatedRule,
    cloneTemplate: isAuthenticatedRule,
    updateTemplate: isAuthenticatedRule,
    updateTemplateCSSFile: isAuthenticatedRule,
    deleteTemplate: isAuthenticatedRule,
  },
}

module.exports = permissions
