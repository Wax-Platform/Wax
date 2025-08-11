const identity = require('@coko/server/src/models/identity')
const applicationParameter = require('./applicationParameter')
const book = require('./book')
const bookCollection = require('./bookCollection')
const bookCollectionTranslation = require('./bookCollectionTranslation')
const bookComponent = require('./bookComponent')
const bookComponentState = require('./bookComponentState')
const bookComponentTranslation = require('./bookComponentTranslation')
const bookSettings = require('./bookSettings')
const bookTranslation = require('./bookTranslation')
const file = require('./file')
const template = require('./template')
const customTag = require('./customTag')
const division = require('./division')
const team = require('./team')
const teamMember = require('./teamMember')
const exportProfile = require('./exportProfile')
const user = require('./user')
const lock = require('./lock')
const serviceCallbackToken = require('./serviceCallbackToken')
const { models } = require('./dataloader')
const invitations = require('./invitations')
const embeddings = require('./embeddings')
const document = require('./document')
const bookComments = require('./bookComments')
const fileManager = require('./fileManager')
const notification = require('./notification')

// const docTreeManager = require('./docTreeManager')
const loader = models.reduce((r, c) => Object.assign(r, c), {})

module.exports = {
  book,
  customTag,
  team,
  teamMember,
  user,
  applicationParameter,
  bookCollection,
  bookCollectionTranslation,
  bookComponent,
  bookComponentState,
  bookComponentTranslation,
  bookSettings,
  bookTranslation,
  exportProfile,
  division,
  file,
  lock,
  loader,
  template,
  serviceCallbackToken,
  invitations,
  document,
  embeddings,
  bookComments,
  fileManager,
  notification,
  identity,
  // docTreeManager,
  models: {
    ApplicationParameter: applicationParameter.model,
    Book: book.model,
    BookCollection: bookCollection.model,
    BookCollectionTranslation: bookCollectionTranslation.model,
    BookComponent: bookComponent.model,
    BookComponentState: bookComponentState.model,
    BookComponentTranslation: bookComponentTranslation.model,
    BookSettings: bookSettings.model,
    BookTranslation: bookTranslation.model,
    CustomTag: customTag.model,
    Division: division.model,
    File: file.model,
    Team: team.model,
    TeamMember: teamMember.model,
    Template: template.model,
    User: user.model,
    Lock: lock.model,
    loader,
    ServiceCallbackToken: serviceCallbackToken.model,
    ExportProfile: exportProfile.model,
    Invitations: invitations.model,
    Document: document.model,
    Embedding: embeddings.model,
    Comments: bookComments.model,
    FileManager: fileManager.model,
    Notification: notification.model,
    Identity: identity.model,
    // DocTreeManager: docTreeManager.model,
  },
}
