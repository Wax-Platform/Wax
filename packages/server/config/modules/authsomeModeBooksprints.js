const findIndex = require('lodash/findIndex')
const transform = require('lodash/transform')
const isEqual = require('lodash/isEqual')
const isObject = require('lodash/isObject')

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
      (await this.isAssignedProductionEditor(Book))

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

    const condition = await this.isGlobalProductionEditor()

    return condition
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
      ['isAssignedProductionEditor'],
      collection,
    )

    return permissions
  }

  async canCreateBook() {
    await this.getUser()

    const condition = await this.isGlobalProductionEditor()

    return condition
  }

  async canInteractWithBooks() {
    await this.getUser()
    let collection

    if (this.object.current) {
      collection = this.object.current //eslint-disable-line
    } else {
      collection = this.object
    }

    if (collection) {
      const condition =
        (await this.isAuthor(collection)) ||
        (await this.isAssignedProductionEditor(collection))

      return condition
    }

    return false
  }

  async canDeleteCollection() {
    this.user = await this.context.models.User.findOne({ id: this.userId })
    let current

    if (this.object.current) {
      current = this.object.current // eslint-disable-line
    } else {
      current = this.object
    }

    const collection = await this.findBookByObject(current)

    if (collection) {
      const condition = await this.isAssignedProductionEditor(collection)
      return condition
    }

    return false
  }

  async canBroadcastEvent() {
    await this.getUser()
    return this.hasMembership(this.object)
  }

  async canInteractWithBookComponents() {
    await this.getUser()
    const collection = this.object

    const permissions = await this.checkTeamMembers(
      ['isAssignedProductionEditor', 'isAuthor'],
      collection,
    )

    return permissions
  }

  /* eslint-disable class-methods-use-this */
  getStageType({ workflowStages }, type) {
    return (workflowStages || []).find(stage => stage.type === type) || {}
  }

  async canInteract() {
    await this.getUser()
    const collection = this.object

    const permissions =
      collection && (await this.isAssignedProductionEditor(collection))

    return permissions
  }

  async canUpdateBook() {
    await this.getUser()
    const { current } = this.object

    // const diff = Object.assign(KetidaMode.difference(update, current), {
    //   workflowStages: differenceWith(
    //     update.workflowStages,
    //     current.workflowStages,
    //     isEqual,
    //   ),
    // })

    let collection = { id: current.bookId }

    if (current.type === 'bookComponentState') {
      const { bookId } = await this.context.models.BookComponent.findOne({
        id: current.bookComponentId,
      })

      collection = { id: bookId }
    }

    if (collection) {
      if (await this.isAssignedProductionEditor(collection)) {
        return true
      }

      if (await this.isAuthor(collection)) {
        return true
      }
    }

    return false
  }

  async canFragmentEdit() {
    await this.getUser()

    const isCleaningUpSate =
      this.getStageType(this.object, 'clean_up').value === 0

    const book = { id: this.object.bookId }

    if (book) {
      if (await this.isAssignedProductionEditor(book)) {
        return true
      }

      if ((await this.isAuthor(book)) && !isCleaningUpSate) {
        return true
      }
    }

    return false
  }

  async canChangeProgress() {
    await this.getUser()
    // const progressType = this.object.type

    const collection = { id: this.object.bookId }

    if (collection) {
      if (await this.isAssignedProductionEditor(collection)) {
        return true
      }
    }

    return false
  }

  async canChangeProgressLeft() {
    await this.getUser()

    const collection = { id: this.object.bookId }

    if (collection) {
      if (await this.isAssignedProductionEditor(collection)) {
        return true
      }
    }

    return false
  }

  async canChangeProgressRight() {
    await this.getUser()

    const collection = { id: this.object.bookId }

    if (collection) {
      if (await this.isAssignedProductionEditor(collection)) {
        return true
      }
    }

    return false
  }

  async canViewTeamManager() {
    await this.getUser()
    const collection = this.object

    const permissions =
      collection &&
      ((await this.isAssignedProductionEditor(collection)) ||
        (await this.isGlobalProductionEditor()))

    return permissions
  }

  async canInteractWithEditor() {
    this.user = await this.context.models.User.find(this.userId)
    const fragment = this.object
    const isCleaningUp = fragment.progress.clean_up === 0
    const collection = await this.findBookByObject(this.object)

    if (collection) {
      if (await this.isAssignedProductionEditor(collection)) {
        return 'full'
      }

      if ((await this.isAuthor(collection)) && !isCleaningUp) {
        return 'full_without_tc'
      }
    }

    return 'selection_without_tc'
  }

  async canRemoveTeamMember() {
    await this.getUser()

    if (this.object) {
      return (
        this.isAssignedProductionEditor(this.object) &&
        this.object.role !== 'productionEditor'
      )
    }

    return true
  }

  async canGo() {
    await this.getUser()
    const collection = await this.findBookByObject(this.object)

    if (collection) {
      return (
        this.isAssignedProductionEditor(collection) || this.isAuthor(collection)
      )
    }

    return false
  }

  async canEditFull() {
    await this.getUser()
    const bookComponent = this.object

    const isCleanUpSate =
      this.getStageType(bookComponent, 'clean_up').value === 0

    const collection = { id: bookComponent.bookId }

    if (await this.isAssignedProductionEditor(collection)) {
      return true
    }

    if ((await this.isAuthor(collection)) && !isCleanUpSate) {
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
    // return user && user.admin
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
  DELETE: (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)

    // DELETE /api/collections/:id
    if (object && object.type === 'collection') {
      return mode.canDeleteCollection()
    }

    // DELETE /api/fragments/:id
    if (object && object.type === 'fragment') {
      return mode.canInteractWithFragments()
    }

    // DELETE /api/teams/:id
    if (object && object.type === 'team') {
      return mode.canUpdateTeam()
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
  'can access book': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canReadBook()
  },
  'can delete books': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithBooks()
  },
  'can view teamManager': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canViewTeamManager()
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
    return mode.canInteract()
  },
  'can view alignmentTool': (userId, operation, object, context) => {
    // DONE
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteract()
  },
  'can view fragmentEdit': (userId, operation, object, context) => {
    // TODO
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canFragmentEdit()
  },
  'can reorder bookComponents': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithFragments()
  },
  'can view stateList': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteract()
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
    return mode.canInteract()
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
  'can interact with editor': (userId, operation, object, context) => {
    const mode = new KetidaMode(userId, operation, object, context)
    return mode.canInteractWithEditor()
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
