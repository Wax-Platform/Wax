const { rule, deny, allow } = require('@coko/server/authorization')

const {
  isAuthenticated,
  isAdmin,
  getUserStatus,
  getBookSpecificTeam,
  hasMembershipInTeam,
} = require('./helpers/helpers')

const isOwner = async (userId, bookId) => {
  try {
    /* eslint-disable global-require */
    const User = require('../../models/user/user.model')
    /* eslint-enable global-require */
    return User.hasRoleOnObject(userId, 'owner', bookId)
  } catch (e) {
    throw new Error(e.message)
  }
}

const isCollaborator = async (userId, bookId) => {
  try {
    /* eslint-disable global-require */
    const User = require('../../models/user/user.model')
    /* eslint-enable global-require */
    return User.hasRoleOnObject(userId, 'collaborator', bookId)
  } catch (e) {
    throw new Error(e.message)
  }
}

const canEditBookAndRelevantAssets = async (userId, bookId) => {
  try {
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const isAdminUser = await isAdmin(userId)

    if (isAdminUser) {
      return true
    }

    const isOwnerUser = await isOwner(userId, bookId)

    if (isOwnerUser) {
      return true
    }

    const isCollaboratorUser = await isCollaborator(userId, bookId)

    if (isCollaboratorUser) {
      const collaboratorTeam = await getBookSpecificTeam(bookId, 'collaborator')
      const status = await getUserStatus(collaboratorTeam.id, userId)

      if (status === 'write') {
        return true
      }
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const hasAnyRoleOnObject = async (userId, bookId) => {
  try {
    const belongsToOwnerTeam = await isOwner(userId, bookId)

    if (belongsToOwnerTeam) {
      return true
    }

    const belongsToCollaboratorTeam = await isCollaborator(userId, bookId)

    if (belongsToCollaboratorTeam) {
      return true
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
}

const isOwnerOrBelongsToObjectTeam = async (userId, bookId) => {
  try {
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

    return isOwnerOrBelongsToObjectTeam(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
}

const isAuthenticatedRule = rule()(async (parent, args, ctx, info) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false
    return isAuthenticated(userId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const createBookRule = rule()(async (parent, args, ctx, info) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    return isAuthenticatedUser
  } catch (e) {
    throw new Error(e.message)
  }
})

const modifyBooksInDashboardRule = rule()(
  async (parent, { id: bookId }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      const isAuthenticatedUser = await isAuthenticated(userId)

      if (!isAuthenticatedUser) {
        return false
      }

      const belongsToAdminTeam = await isAdmin(userId)

      if (belongsToAdminTeam) {
        return true
      }

      const belongsToBookOwnerTeam = await isOwner(userId, bookId)

      return belongsToBookOwnerTeam
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const interactWithExportProfileRule = rule()(
  async (parent, { id }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      const isAuthenticatedUser = await isAuthenticated(userId)

      if (!isAuthenticatedUser) {
        return false
      }

      /* eslint-disable global-require */
      const ExportProfile = require('../../models/exportProfile/exportProfile.model')
      /* eslint-enable global-require */
      const exportProfile = await ExportProfile.findById(id)

      const { bookId } = exportProfile

      const belongsToAdminTeam = await isAdmin(userId)

      if (belongsToAdminTeam) {
        return true
      }

      const belongsToBookOwnerTeam = await isOwner(userId, bookId)

      return belongsToBookOwnerTeam
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const createExportProfileRule = rule()(
  async (parent, { input: { bookId } }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      const isAuthenticatedUser = await isAuthenticated(userId)

      if (!isAuthenticatedUser) {
        return false
      }

      const belongsToAdminTeam = await isAdmin(userId)

      if (belongsToAdminTeam) {
        return true
      }

      const belongsToBookOwnerTeam = await isOwner(userId, bookId)

      return belongsToBookOwnerTeam
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const getBookRule = rule()(async (_, { id: bookId }, ctx) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false
    /* eslint-disable global-require */
    const Book = require('../../models/book/book.model')
    const book = await Book.findOne({ id: bookId })

    if (!book) {
      return new Error(`book with id: ${bookId} does not exist`)
    }

    if (book.deleted) {
      return new Error(`book with id: ${bookId} has been deleted`)
    }

    return canInteractWithBookAndRelevantAssets(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const uploadFilesRules = rule()(
  async (parent, { entityId: bookId }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false
      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const getBookComponentRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

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

const updateMetadataRule = rule()(async (parent, { bookId }, ctx, info) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false

    if (!bookId) {
      throw new Error('book id should be provided')
    }

    return canEditBookAndRelevantAssets(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const exportBookRule = rule()(
  async (parent, { input: { bookId, fileExtension } }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      if (!bookId) {
        throw new Error('book id should be provided')
      }

      if (!fileExtension) {
        return canInteractWithBookAndRelevantAssets(userId, bookId)
      }

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const ingestWordFileRule = rule()(
  async (parent, { bookComponentFiles }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false
      const { bookId } = bookComponentFiles[0]

      if (!bookId) {
        throw new Error('book id should be provided')
      }

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const addBookComponentRule = rule()(
  async (parent, { input: { bookId } }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      if (!bookId) {
        throw new Error('book id should be provided')
      }

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const deleteBookComponentRule = rule()(
  async (parent, { input: { id: bookComponentId } }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateTrackChangesRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const setBookComponentStatusRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateBookComponentOrderRule = rule()(
  async (parent, { targetDivisionId }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      if (!targetDivisionId) {
        throw new Error('targetDivision id should be provided')
      }

      /* eslint-disable global-require */

      const Division = require('../../models/division/division.model')
      /* eslint-enable global-require */
      const division = await Division.findById(targetDivisionId)
      const { bookId } = division

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const unlockBookComponentRule = rule()(
  async (parent, { input: { id: bookComponentId, lock } }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      const belongsToAdminTeam = await isAdmin(userId)

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
  },
)

const updateContentRule = rule()(
  async (parent, { input: { id } }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      if (!id) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(id)
      const { bookId } = bookComponent

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const renameBookComponentRule = rule()(
  async (parent, { input: { id } }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      if (!id) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(id)
      const { bookId } = bookComponent

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const interactWithBookComponentRule = rule()(
  async (parent, { id: bookComponentId }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      if (!bookComponentId) {
        throw new Error('bookComponent id should be provided')
      }

      /* eslint-disable global-require */
      const BookComponent = require('../../models/bookComponent/bookComponent.model')
      /* eslint-enable global-require */
      const bookComponent = await BookComponent.findById(bookComponentId)
      const { bookId } = bookComponent

      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateTeamMemberStatusRule = rule()(
  async (parent, { teamMemberId }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false

      const isAuthenticatedUser = await isAuthenticated(userId)

      if (!isAuthenticatedUser) {
        return false
      }

      const belongsToAdminTeam = await isAdmin(userId)

      if (belongsToAdminTeam) {
        return true
      }

      /* eslint-disable global-require */
      const TeamMember = require('../../models/teamMember/teamMember.model')

      const Team = require('../../models/team/team.model')
      /* eslint-enable global-require */
      const teamMember = await TeamMember.findById(teamMemberId)
      const { teamId } = teamMember
      const team = await Team.findById(teamId)

      const { objectId } = team

      if (!objectId) {
        throw new Error('book id should be provided')
      }

      return isOwner(userId, objectId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const addTeamMembersRule = rule()(async (parent, { teamId }, ctx, info) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false
    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const belongsToAdminTeam = await isAdmin(userId)

    if (belongsToAdminTeam) {
      return true
    }

    /* eslint-disable global-require */
    const Team = require('../../models/team/team.model')
    /* eslint-enable global-require */
    const team = await Team.findById(teamId)
    const { objectId } = team

    if (!objectId) {
      throw new Error('team object id is needed')
    }

    return isOwner(userId, objectId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const renameBookRule = rule()(async (parent, { id: bookId }, ctx, info) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false

    return canEditBookAndRelevantAssets(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const updateSubtitleRule = rule()(async (parent, { id: bookId }, ctx, info) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false

    return canEditBookAndRelevantAssets(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const getBookExportProfilesRule = rule()(async (_, { bookId }, ctx, __) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false

    return canInteractWithBookAndRelevantAssets(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const teamRule = rule()(async (parent, { id: teamId }, ctx, info) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false

    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const isAdminUser = await isAdmin(userId)

    if (isAdminUser) {
      return true
    }

    return hasMembershipInTeam(userId, teamId)
  } catch (e) {
    throw new Error(e.message)
  }
})

// const teamsRule = rule()(async (parent, __, ctx, info) => {
//   try {
//     const { user: userId } = ctx

//     const isAuthenticatedUser = await isAuthenticated(userId)

//     if (!isAuthenticatedUser) {
//       return false
//     }

//     return isAdmin(userId)
//   } catch (e) {
//     throw new Error(e.message)
//   }
// })

const getObjectTeamsRule = rule()(async (parent, { objectId }, ctx, info) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false

    return canInteractWithBookAndRelevantAssets(userId, objectId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const uploadBookThumbnailRule = rule()(
  async (parent, { bookId }, ctx, info) => {
    try {
      const { user: userId } = ctx
      if (!userId) return false
      return canEditBookAndRelevantAssets(userId, bookId)
    } catch (e) {
      throw new Error(e.message)
    }
  },
)

const updateApplicationParametersRule = rule(async (_, __, ctx) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false

    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const isAdminUser = await isAdmin(userId)

    if (isAdminUser) {
      return true
    }

    return false
  } catch (e) {
    throw new Error(e.message)
  }
})

const uploadToLuluRule = rule()(async (_, { id: exportProfileId }, ctx) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false

    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    /* eslint-disable global-require */
    const ExportProfile = require('../../models/exportProfile/exportProfile.model')
    /* eslint-enable global-require */
    const exportProfile = await ExportProfile.findById(exportProfileId)

    const { bookId } = exportProfile

    return isOwner(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const updateBookSettingsRule = rule()(async (parent, { bookId }, ctx, info) => {
  try {
    const { user: userId } = ctx
    if (!userId) return false

    const isAuthenticatedUser = await isAuthenticated(userId)

    if (!isAuthenticatedUser) {
      return false
    }

    const isAdminUser = await isAdmin(userId)

    if (isAdminUser) {
      return true
    }

    return isOwner(userId, bookId)
  } catch (e) {
    throw new Error(e.message)
  }
})

const permissions = {
  Query: {
    '*': deny,
    chatGPT: isAuthenticatedRule,
    openAi: isAuthenticatedRule,
    ragSearch: isAuthenticatedRule,
    getDocuments: isAuthenticatedRule,
    getChapterComments: isAuthenticatedRule,
    currentUser: isAuthenticatedRule,
    getApplicationParameters: allow,
    getBook: getBookRule,
    getBookComponent: getBookComponentRule,
    getBooks: isAuthenticatedRule,
    getBookExportProfiles: getBookExportProfilesRule,
    getObjectTeams: getObjectTeamsRule,
    getPagedPreviewerLink: isAuthenticatedRule,
    getSpecificTemplates: isAuthenticatedRule,
    team: teamRule,
    teams: isAuthenticatedRule,
    getInvitations: isAuthenticatedRule,
    getTemplates: isAdmin,
  },
  Mutation: {
    '*': deny,
    addComment: addTeamMembersRule,
    addTeamMembers: addTeamMembersRule,
    createBook: createBookRule,
    createExportProfile: createExportProfileRule,
    createOAuthIdentity: isAuthenticatedRule,
    addTemplate: isAdmin,
    refreshTemplate: isAdmin,
    disableTempalte: isAdmin,
    enableTempalte: isAdmin,
    deleteBook: modifyBooksInDashboardRule,
    deleteExportProfile: interactWithExportProfileRule,
    exportBook: exportBookRule,
    ingestWordFile: ingestWordFileRule,
    ketidaLogin: allow,
    ketidaRequestVerificationEmail: allow,
    lockBookComponent: interactWithBookComponentRule,
    podAddBookComponent: addBookComponentRule,
    podDeleteBookComponent: deleteBookComponentRule,
    podLockBookComponent: interactWithBookComponentRule,
    removeTeamMember: isAuthenticatedRule,
    renameBook: renameBookRule,
    renameBookComponent: renameBookComponentRule,
    resetPassword: allow,
    searchForUsers: isAuthenticatedRule,
    sendPasswordResetEmail: allow,
    setBookComponentStatus: setBookComponentStatusRule,
    signUp: allow,
    unlockBookComponent: unlockBookComponentRule,
    updateBookComponentsOrder: updateBookComponentOrderRule,
    updateBookSettings: updateBookSettingsRule,
    updateContent: updateContentRule,
    updateExportProfile: interactWithExportProfileRule,
    updatePODMetadata: updateMetadataRule,
    updateSubtitle: updateSubtitleRule,
    updateApplicationParameters: updateApplicationParametersRule,
    updateTeamMemberStatus: updateTeamMemberStatusRule,
    updateTrackChanges: updateTrackChangesRule,
    uploadBookThumbnail: uploadBookThumbnailRule,
    uploadFiles: uploadFilesRules,
    uploadToLulu: uploadToLuluRule,
    verifyEmail: allow,
    sendInvitations: isAuthenticatedRule,
    handleInvitation: allow,
    deleteInvitation: isAuthenticatedRule,
    updateInvitation: isAuthenticatedRule,
  },
}

module.exports = permissions
