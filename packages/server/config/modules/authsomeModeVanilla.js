const findIndex = require('lodash/findIndex')
const transform = require('lodash/transform')
const isEqual = require('lodash/isEqual')
const isObject = require('lodash/isObject')
const differenceWith = require('lodash/differenceWith')

class KetidaMode {
  /**
   * Creates a new instance of KetidaMode
   *
   * @param {string} userId A user's UUID
   * @param {string} operation The operation you're authorizing for
   * @param {any} object The object of authorization
   * @param {any} context Context for authorization, e.g. database access
   * @returns {string}
   */
  constructor(userId, operation, object, context) {
    this.userId = userId
    this.operation = KetidaMode.mapOperation(operation)
    this.object = object
    this.context = context
    this.backend = true
  }

  /**
   * Maps operations from HTTP verbs to semantic verbs
   *
   * @param {any} operation
   * @returns {string}
   */
  static mapOperation(operation) {
    const operationMap = {
      GET: 'read',
      POST: 'create',
      PATCH: 'update',
      DELETE: 'delete',
    }

    return operationMap[operation] ? operationMap[operation] : operation
  }
  /* eslint-disable */
  static difference(object, base) {
    const changes = (object, base) =>
      transform(object, (result, value, key) => {
        if (!isEqual(value, base[key])) {
          result[key] =
            isObject(value) && isObject(base[key])
              ? changes(value, base[key])
              : value
        }
      })
    return changes(object, base)
  }

  /* eslint-enable */
  async isTeamMember(teamType, object) {
    let membershipCondition

    if (object) {
      if (!this.backend) {
        membershipCondition = team =>
          team.role === teamType &&
          team.object &&
          team.object.objectId === object.id
      } else {
        membershipCondition = team =>
          team.role === teamType && team.objectId === object.id
      }
    } else {
      membershipCondition = team => team.role === teamType && team.global
    }

    const memberships = await Promise.all(
      (this.user.teams || []).map(async team => membershipCondition(team)),
    )

    return memberships.includes(true)
  }

  async getUser() {
    if (this.backend) {
      this.user = await this.context.models.UserLoader.userTeams.load(
        this.userId,
      )
    } else {
      this.user = await this.context.models.User.findOne({ id: this.userId })
    }
  }

  async checkTeamMembers(team, object) {
    const permission = await Promise.all(team.map(t => this[t](object)))
    return permission.includes(true)
  }

  async hasMembership(object) {
    let collection

    if (object.collection) {
      collection = object.collection //eslint-disable-line
    } else {
      collection = object
    }

    const membershipCondition = team =>
      !team.global && team.object.id === collection.id

    const memberships = await Promise.all(
      this.user.teams.map(async teamId => {
        const teamFound = await this.context.models.Team.findOne({
          id: teamId.id,
        })

        if (teamFound) {
          return membershipCondition(teamFound)
        }

        return false
      }),
    )

    return memberships.includes(true)
  }

  isAuthor(object) {
    return this.isTeamMember('author', object)
  }

  isAssignedCopyEditor(object) {
    return this.isTeamMember('copyEditor', object)
  }

  isAssignedProductionEditor(object) {
    return this.isTeamMember('productionEditor', object)
  }

  async isGlobalProductionEditor() {
    return this.isTeamMember('productionEditor')
  }

  async findBookByObject(object) {
    let id

    if (object.collection) {
      id = object.collection.id //eslint-disable-line
    } else if (object.bookId && object.type) {
      id = object.bookId
    } else {
      switch (object.type) {
        case 'fragment':
          id = object.book
          break
        case 'team':
          id = object.object.id //eslint-disable-line
          break
        default: //eslint-disable-line
          id = object.id
          break
      }
    }

    if (id) {
      return this.context.models.Book.findOne({ id })
    }

    return undefined
  }

  async canReadBook() {
    await this.getUser()
    let bookId

    if (this.object.type === 'bookComponent') {
      bookId = this.object.bookId
    } else {
      bookId = this.object.id
    }

    const Book = await this.context.models.Book.findOne({ id: bookId })

    const permission =
      (await this.isAuthor(Book)) ||
      (await this.isAssignedCopyEditor(Book)) ||
      (await this.isAssignedProductionEditor(Book)) ||
      (await this.isGlobalProductionEditor())

    return permission
  }

  /* eslint-disable */
  async canReadBookCollection() {
    return true
  }

  async canCreateUser() {
    return {
      filter: data => {
        delete data.password
        return data
      },
    }
  }

  /**
   * Checks if a user can list users
   *
   * @returns {boolean}
   */
  async canListUsers() {
    if (!this.isAuthenticated()) {
      return false
    }

    return true
  }

  async canReadUser() {
    return true
  }

  /* eslint-enable */

  async canListTeams() {
    await this.getUser()
    return true
  }

  belongsToTeam(teamId) {
    return this.user.teams.map(team => team.id).includes(teamId)
  }

  async canReadTeam() {
    await this.getUser()
    return this.belongsToTeam(this.object.id)
  }

  async canCreateTeam() {
    await this.getUser()
    return this.isGlobalProductionEditor()
  }

  async canUpdateTeam() {
    await this.getUser()
    let current

    if (this.object.current) {
      current = this.object.current //eslint-disable-line
    } else {
      current = this.object
    }

    const collection = { id: current.objectId }

    const permissions = await this.checkTeamMembers(
      ['isAssignedProductionEditor', 'isGlobalProductionEditor'],
      collection,
    )

    return permissions
  }

  async canCreateBook() {
    await this.getUser()
    return this.isGlobalProductionEditor()
  }

  async canInteractWithBooks() {
    await this.getUser()
    let collection

    if (this.object.current) {
      collection = this.object.current //eslint-disable-line
    } else {
      collection = this.object
    }

    const foundTeam =
      this.user.teams.find(
        team =>
          team.role === 'productionEditor' &&
          team &&
          team.objectId === collection.id,
      ) || false

    const permission = foundTeam || (await this.isGlobalProductionEditor())
    return permission
  }

  async canBroadcastEvent() {
    await this.getUser()
    return this.hasMembership(this.object)
  }

  async canInteractWithBookComponents() {
    await this.getUser()
    const collection = this.object

    const permissions =
      (await this.checkTeamMembers(
        ['isAssignedProductionEditor', 'isAssignedCopyEditor'],
        collection,
      )) || (await this.isGlobalProductionEditor())

    return permissions
  }

  /* eslint-disable class-methods-use-this */
  getStageType({ workflowStages }, type) {
    return (workflowStages || []).find(stage => stage.type === type) || {}
  }

  async canUpdateBook() {
    await this.getUser()
    const { current, update } = this.object
    const wasEditingSate = this.getStageType(current, 'edit').value === 0
    const wasReviewingSate = this.getStageType(current, 'review').value === 0
    const wasCleaningUpSate = this.getStageType(current, 'clean_up').value === 0

    const diff = Object.assign(KetidaMode.difference(update, current), {
      workflowStages: differenceWith(
        update.workflowStages,
        current.workflowStages,
        isEqual,
      ),
    })

    let collection = { id: current.bookId }

    if (current.type === 'bookComponentState') {
      const { bookId } = await this.context.models.BookComponent.findOne({
        id: current.bookComponentId,
      })

      collection = { id: bookId }
    }

    if (collection) {
      if (await this.isAssignedProductionEditor(collection)) {
        // TODO
        // if (
        //   current.lock !== null &&
        //   diff.lock !== undefined &&
        //   current.lock.editor.userId !== this.user.id
        // ) {
        //   return false
        // }
        return true
      }

      if (await this.isAssignedCopyEditor(collection)) {
        if (Object.keys(diff).length === 1) {
          // TODO
          // if (
          //   (diff.lock !== undefined || update.lock !== undefined) &&
          //   (wasEditingSate || wasCleaningUpSate) &&
          //   (current.lock === null ||
          //     current.lock.editor.userId === this.user.id)
          // ) {
          //   return true
          // }

          if (diff.uploading !== undefined || diff.pagination !== undefined) {
            return true
          }

          if (
            (this.getStageType(diff, 'edit').value === 1 ||
              this.getStageType(diff, 'edit').value === -1) &&
            wasEditingSate
          ) {
            return true
          }

          if (
            this.getStageType(diff, 'review').value === 1 ||
            this.getStageType(diff, 'review').value === 0 ||
            this.getStageType(diff, 'review').value === -1
          ) {
            return true
          }

          if (
            this.getStageType(diff, 'clean_up').value === 1 ||
            this.getStageType(diff, 'clean_up').value === 0 ||
            this.getStageType(diff, 'clean_up').value === -1
          ) {
            return true
          }

          if (
            this.getStageType(diff, 'page_check').value === 0 ||
            this.getStageType(diff, 'page_check').value === -1
          ) {
            return true
          }

          if (
            (diff.trackChangesEnabled === true ||
              diff.trackChangesEnabled === false) &&
            (wasEditingSate || wasReviewingSate || wasCleaningUpSate)
          ) {
            return true
          }

          if (diff.content) {
            return true
          }
        }

        if (Object.keys(diff).length === 2) {
          if (
            diff.deleted !== undefined ||
            diff.uploading !== undefined ||
            diff.pagination !== undefined
          ) {
            return true
          }

          if (diff.content && diff.title !== undefined) {
            return true
          }

          if (
            (diff.trackChangesEnabled === true ||
              diff.trackChangesEnabled === false) &&
            (wasEditingSate || wasReviewingSate || wasCleaningUpSate)
          ) {
            return true
          }
        }

        return false
      }

      if (await this.isAuthor(collection)) {
        if (Object.keys(diff).length === 1) {
          // TODO
          // if (
          //   (diff.lock !== undefined || update.lock !== undefined) &&
          //   wasReviewingSate &&
          //   (current.lock === null ||
          //     current.lock.editor.userId === this.user.id)
          // ) {
          //   return true
          // }
          if (
            (this.getStageType(diff, 'review').value === 1 ||
              this.getStageType(diff, 'review').value === -1) &&
            wasReviewingSate
          ) {
            return true
          }

          if (diff.content) {
            return true
          }
        }

        if (Object.keys(diff).length === 2) {
          if (diff.content && diff.title !== undefined) {
            return true
          }
        }

        return false
      }

      return false
    }

    return false
  }

  // async canBroadcastFragmentPatchEvent() {
  //   await this.getUser()

  //   const foundFragment = await this.context.models.Fragment.find(
  //     this.object.fragment.id,
  //   )

  //   const collection = await this.findBookByObject(foundFragment)
  //   return foundFragment && collection && this.hasMembership(collection)
  // }

  async canFragmentEdit() {
    await this.getUser()

    const isEditingSate = this.getStageType(this.object, 'edit').value === 0
    const isReviewingSate = this.getStageType(this.object, 'review').value === 0

    const isCleaningUpSate =
      this.getStageType(this.object, 'clean_up').value === 0

    const book = { id: this.object.bookId }

    if (book) {
      if (await this.isAssignedProductionEditor(book)) {
        return true
      }

      if (
        (await this.isAssignedCopyEditor(book)) &&
        (isEditingSate || isCleaningUpSate)
      ) {
        return true
      }

      if ((await this.isAuthor(book)) && isReviewingSate) {
        return true
      }
    }

    return false
  }

  async canChangeProgress() {
    await this.getUser()
    const progressType = this.object.type

    const collection = { id: this.object.bookId }

    if (collection) {
      if (await this.isAssignedProductionEditor(collection)) {
        return true
      }

      if (await this.isAssignedCopyEditor(collection)) {
        let condition = false

        switch (progressType) {
          case 'file_prep': {
            condition = true
            break
          }

          case 'edit': {
            condition = true
            break
          }

          case 'review': {
            condition = true
            break
          }

          case 'clean_up': {
            condition = true
            break
          }

          case 'page_check': {
            condition = false
            break
          }

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

      if (await this.isAuthor(collection)) {
        let condition = false

        switch (progressType) {
          case 'review': {
            condition = true
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
  }

  async canChangeProgressLeft() {
    await this.getUser()
    const progressType = this.object.type
    const { currentValues } = this.object

    const reviewValue = this.getStageType(
      { workflowStages: currentValues },
      'review',
    ).value

    const fileprepValue = this.getStageType(
      { workflowStages: currentValues },
      'file_prep',
    ).value

    const editValue = this.getStageType(
      { workflowStages: currentValues },
      'edit',
    ).value

    const cleanupValue = this.getStageType(
      { workflowStages: currentValues },
      'clean_up',
    ).value

    const collection = { id: this.object.bookId }

    if (collection) {
      if (await this.isAssignedProductionEditor(collection)) {
        return true
      }

      if (await this.isAssignedCopyEditor(collection)) {
        let condition = false

        switch (progressType) {
          case 'file_prep': {
            if (fileprepValue === 1) {
              return true
            }

            break
          }

          case 'edit': {
            if (editValue === 1) {
              condition = true
            }

            break
          }

          case 'review': {
            if (reviewValue === 1) {
              condition = true
            }

            break
          }

          case 'clean_up': {
            if (cleanupValue === 1) {
              condition = true
            }

            break
          }

          case 'page_check': {
            condition = false
            break
          }

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

      if (await this.isAuthor(collection)) {
        const condition = false
        return condition
      }
    }

    return false
  }

  async canChangeProgressRight() {
    await this.getUser()
    const progressType = this.object.type
    const { currentValues } = this.object

    const reviewValue = this.getStageType(
      { workflowStages: currentValues },
      'review',
    ).value

    const cleanupValue = this.getStageType(
      { workflowStages: currentValues },
      'clean_up',
    ).value

    const editValue = this.getStageType(
      { workflowStages: currentValues },
      'edit',
    ).value

    const collection = { id: this.object.bookId }

    if (collection) {
      if (await this.isAssignedProductionEditor(collection)) {
        return true
      }

      if (await this.isAssignedCopyEditor(collection)) {
        let condition = false

        switch (progressType) {
          case 'file_prep': {
            condition = false
            break
          }

          case 'edit': {
            if (editValue === 0) {
              condition = true
            }

            break
          }

          case 'review': {
            if (reviewValue === -1 || reviewValue === 0) {
              condition = true
            }

            break
          }

          case 'clean_up': {
            if (cleanupValue === -1 || cleanupValue === 0) {
              condition = true
            }

            break
          }

          case 'page_check': {
            condition = false
            break
          }

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

      if (await this.isAuthor(collection)) {
        let condition = false

        switch (progressType) {
          case 'review': {
            if (reviewValue === 0) {
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
  }

  async canEditFull() {
    await this.getUser()
    const bookComponent = this.object

    const isEditingSate = this.getStageType(bookComponent, 'edit').value === 0

    const isCleanUpSate =
      this.getStageType(bookComponent, 'clean_up').value === 0

    const collection = { id: bookComponent.bookId }

    if (await this.isAssignedProductionEditor(collection)) {
      return true
    }

    if (
      (await this.isAssignedCopyEditor(collection)) &&
      (isEditingSate || isCleanUpSate)
    ) {
      return true
    }

    return false
  }

  async canEditReview() {
    await this.getUser()
    const bookComponent = this.object

    const isReviewingSate =
      this.getStageType(bookComponent, 'review').value === 0

    const collection = { id: bookComponent.bookId }

    if (
      !(await this.canEditFull()) &&
      (await this.isAuthor(collection)) &&
      isReviewingSate
    ) {
      return true
    }

    return false
  }

  async canEditSelection() {
    if (!(await this.canEditFull()) && !(await this.canEditReview())) {
      return true
    }

    return false
  }

  async canToggleTrackChanges() {
    await this.getUser()
    const bookComponent = this.object
    const collection = { id: bookComponent.bookId }

    const permissions = !(await this.checkTeamMembers(
      ['isAuthor', 'isAssignedCopyEditor'],
      collection,
    ))

    return permissions
  }

  /* eslint-disable */
  async canRemoveTeamMember() {
    await this.getUser()
    if (await this.isGlobalProductionEditor()) {
      return true
    }
    if (this.object) {
      return (
        this.isAssignedProductionEditor(this.object) &&
        this.object.role !== 'productionEditor'
      )
    }
    return true
  }
  /* eslint-enable */

  async canGo() {
    await this.getUser()
    const collection = await this.findBookByObject(this.object)

    if (collection) {
      return (
        this.isAssignedProductionEditor(collection) ||
        this.isAssignedCopyEditor(collection) ||
        this.isAuthor(collection)
      )
    }

    return false
  }
}

module.exports = {
  before: async (userId, operation, object, context) => {
    let decision = false
    if (!userId) return decision
    const user = await context.models.UserLoader.userTeams.load(userId)

    if (user) {
      const { teams } = user

      if (teams.length > 0) {
        decision = findIndex(teams, { global: true }) !== -1
      }
    }

    return decision
  },
  create: async (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    mode.backend = true

    if (
      !userId &&
      operation === 'create' &&
      (object === 'User' || object.type === 'user')
    ) {
      const permission = await mode.canCreateUser()
      return permission
    }

    if (object === 'Book') {
      return mode.canCreateBook()
    }

    if (object === 'Team' || object.type === 'team') {
      return mode.canCreateTeam()
    }

    return false
  },
  update: (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    mode.backend = true
    let data

    if (object) {
      if (object.current) {
        data = object.current
      } else {
        data = object
      }
    } else {
      return false
    }

    if (data === 'Book' || data === 'Team' || data === 'BookCollection') {
      return true
    }

    if (data.type === 'book') {
      return mode.canInteractWithBooks()
    }

    if (data.type === 'team') {
      return mode.canUpdateTeam()
    }

    if (data.type === 'bookComponent' || data.type === 'bookComponentState') {
      return mode.canUpdateBook()
    }

    return false
  },
  delete: false,
  read: (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    mode.backend = true

    if (object === 'Book' || object === 'Team' || object === 'BookCollection') {
      return true
    }

    if (object.constructor.name === 'TeamMember') {
      return true
    }

    if (object.type === 'bookCollection') {
      return mode.canReadBookCollection()
    }

    if (object.type === 'book') {
      return mode.canReadBook()
    }

    if (object.type === 'team') {
      return true
    }

    if (object.type === 'user' || object === 'User') {
      return mode.canReadUser()
    }

    return false
  },
  'can view nav links': (userId, operation, object, context) => false,
  'can add books': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canCreateBook()
  },
  'can rename books': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBooks()
  },
  'can archive books': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBooks()
  },
  'can delete books': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBooks()
  },
  'can access book': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canReadBook()
  },
  'can view teamManager': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBooks()
  },
  'can assign members': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBooks()
  },
  'can view addComponent': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBookComponents()
  },
  'can view deleteComponent': (userId, operation, object, context) => {
    // TODO
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBookComponents()
  },
  'can view uploadButton': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBookComponents()
  },
  'can view alignmentTool': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBookComponents()
  },
  'can view fragmentEdit': (userId, operation, object, context) => {
    // TODO
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canFragmentEdit()
  },
  'can view stateList': (userId, operation, object, context) => true, // DONE
  'can reorder bookComponents': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBookComponents()
  },
  'can change progressList': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canChangeProgress()
  },
  'can change progressList left': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canChangeProgressLeft()
  },
  'can change progressList right': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canChangeProgressRight()
  },
  'can use for editing': (userId, operation, object, context) => {
    // TODO
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canFragmentEdit()
  },
  'can view multipleFilesUpload': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBookComponents()
  },
  'can remove team member': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canRemoveTeamMember()
  },
  // TODO: refactor to use productionEditor property of collection
  'collection:create': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return object.collection.owners.includes(userId) || mode.canBroadcastEvent()
  },
  'collection:patch': (userId, operation, object, context) =>
    // const mode = new KetidaMode(userId, operation, object, context)
    true,
  'collection:delete': (userId, operation, object, context) => true,
  'fragment:create': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canBroadcastEvent()
  },
  'fragment:patch': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canBroadcastFragmentPatchEvent()
  },
  'can go': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canGo()
  },
  'fragment:delete': (userId, operation, object, context) => true,
  // it is important all the clients to get notified when crud is happening on
  // the team resource in order for the authsome to work properly
  'team:create': (userId, operation, object, context) => true,
  'team:delete': (userId, operation, object, context) => true,
  'team:patch': (userId, operation, object, context) => true,
  'can view add team member': (userId, operation, object, context) =>
    // if (object === 'Production Editor') {
    //   return false
    // }
    true,
  'can toggle track changes': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canToggleTrackChanges()
  },
  'can edit full': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canEditFull()
  },
  'can edit selection': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canEditSelection()
  },
  'can edit preview': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canEditReview()
  },
  // TODO: protect ink endpoint
}
