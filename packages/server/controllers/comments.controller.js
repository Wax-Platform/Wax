const { useTransaction, logger, Identity, User } = require('@coko/server')

const {
  notify,
  notificationTypes: { EMAIL },
} = require('@coko/server/src//services')

const { mentionNotification } = require('./helpers/emailTemplates')
const { Comments, Book } = require('../models').models

const BASE_MESSAGE = '[COMMENTS CONTROLLER]'

const getComments = async (bookId, componentId) => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} getComments:`
  logger.info(
    `${CONTROLLER_MESSAGE} Getting comments for book ${bookId}, bookComponent ${componentId}`,
  )

  try {
    const comments = await Comments.findOne({
      bookId,
      componentId,
    })

    return comments ? { ...comments, chapterId: comments.componentId } : null
  } catch (error) {
    logger.error(`${CONTROLLER_MESSAGE} getComments: ${error.message}`)
    throw new Error(error)
  }
}

const addComments = async (bookId, componentId, content, options = {}) => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} addComment:`
  logger.info(
    `${CONTROLLER_MESSAGE} adding comment for book ${bookId}, bookComponent ${componentId}`,
  )
  const { trx } = options

  return useTransaction(
    async tr => {
      const comments = await Comments.findOne({
        bookId,
        componentId,
      })

      if (comments) {
        return Comments.patchAndFetchById(comments.id, {
          content,
        })
      }

      return Comments.insert(
        {
          bookId,
          componentId,
          content,
        },
        { trx: tr },
      )
    },
    { trx, passedTrxOnly: true },
  )
}

const notifyMentions = async (data, user) => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} notifyMentions:`

  const { bookId, chapterId, ids, text } = data
  logger.info(
    `${CONTROLLER_MESSAGE} Notifying mentioned users for book ${bookId}, chapter ${chapterId}`,
  )

  try {
    const book = await Book.query()
      .leftJoin('book_translation', 'book_translation.book_id', 'book.id')
      .leftJoin('book_component', 'book_component.book_id', 'book.id')
      .leftJoin(
        'book_component_translation',
        'book_component_translation.book_component_id',
        'book_component.id',
      )
      .select(
        'book_translation.title as bookTitle',
        'book_component_translation.title as chapterTitle',
      )
      .findOne({ 'book.id': bookId, 'book_component.id': chapterId })

    const mentioner = await User.findById(user)

    await Promise.all(
      ids.map(async userId => {
        const userIdentity = await Identity.findOne({
          userId,
        })

        const email = mentionNotification({
          email: userIdentity?.email,
          mentioner: `${mentioner.givenNames} ${mentioner.surname}`,
          bookTitle: book.bookTitle,
          bookId,
          chapterId,
          chapterTitle: book.chapterTitle || 'Untitled chapter',
          text,
        })

        await notify(EMAIL, email)
      }),
    )

    return true
  } catch (error) {
    logger.error(`${CONTROLLER_MESSAGE} getComments: ${error.message}`)
    throw new Error(error)
  }
}

module.exports = {
  getComments,
  addComments,
  notifyMentions,
}
