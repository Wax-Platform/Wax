const { logger, useTransaction } = require('@coko/server')
const { createFile } = require('@coko/server')
const { ChatChannel, ChatMessage, File, User } = require('@coko/server/src/models')
const { getFileUrl } = require('./file.controller')
const CokoNotifier = require('../services/notify')

const BASE_MESSAGE = '[CHAT CONTROLLER]'

const globalTimeouts = {}

const createChatChannel = async (input = {}, options = {}) => {
  const { relatedObjectId, chatType } = input
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} createChatChannel:`
  logger.info(
    `${CONTROLLER_MESSAGE} Create chat channel for question ${relatedObjectId}`,
  )

  try {
    return useTransaction(
      async tr => {
        return ChatChannel.insert({ relatedObjectId, chatType }, { trx: tr })
      },
      { trx: options.trx, passedTrxOnly: true },
    )
  } catch (error) {
    logger.error(`${CONTROLLER_MESSAGE} createChatChannel: ${error.message}`)
    throw new Error(error)
  }
}

const sendMessage = async (
  chatChannelId,
  content,
  userId,
  mentions = [],
  attachments = [],
  options = {},
) => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} sendMessage:`

  try {
    const { trx, ...restOptions } = options
    const attachmentData = await Promise.all(attachments)

    const newMessage = await useTransaction(
      async tr => {
        logger.info(
          `${CONTROLLER_MESSAGE} creating a new message for chat channel with id ${chatChannelId}`,
        )

        const chatMessage = await ChatMessage.insert(
          { chatChannelId, userId, content, mentions },
          { trx: tr, ...restOptions },
        )

        return chatMessage
      },
      { trx, passedTrxOnly: true },
    )

    const notifier = new CokoNotifier()

    mentions.forEach(mention => {
      // setup a timeout to send emails with delay (and possibility of being canceled)
      globalTimeouts[`${mention}-${chatChannelId}`] = setTimeout(() => {
        notifier.notify(
          'waxPlatform.chatMention',
          { mention, newMessage },
          'email',
        )
      }, 10000)
    })

    const uploadedAttachments = await Promise.all(
      attachmentData.map(async attachment => {
        const stream = attachment.createReadStream()

        const storedFile = await createFile(
          stream,
          attachment.filename,
          null,
          null,
          [],
          newMessage.id,
        )

        return storedFile
      }),
    )

    const attachmentsWithUrl = await Promise.all(
      uploadedAttachments.map(async file => {
        const url = getFileUrl(file, 'medium')
        return {
          url,
          name: file.name,
        }
      }),
    )

    return { ...newMessage, attachments: attachmentsWithUrl }
  } catch (e) {
    logger.error(`${CONTROLLER_MESSAGE} ${e.message}`)
    throw new Error(e)
  }
}

const getMessage = async messageId => {
  return ChatMessage.query().findById(messageId)
}

const getMessages = async (channelId, options = {}) => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} getMessages:`
  logger.info(`${CONTROLLER_MESSAGE} Getting messages for channel ${channelId}`)

  try {
    return (
      await ChatMessage.query(options.trx).where('chatChannelId', channelId)
    ).map(({ id, created, content, userId, mentions }) => ({
      id,
      content,
      created,
      userId,
      mentions,
    }))
  } catch (error) {
    logger.error(`${CONTROLLER_MESSAGE} getMessages: ${error.message}`)
    throw new Error(error)
  }
}

const getMessageAuthor = async ({ id, userId }, options = {}) => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} getMessageAuthor:`
  logger.info(`${CONTROLLER_MESSAGE} Getting author for message ${id}`)

  try {
    return User.findById(userId)
  } catch (error) {
    logger.error(`${CONTROLLER_MESSAGE} getMessageAuthor: ${error.message}`)
    throw new Error(error)
  }
}

const getAttachments = async ({ id }) => {
  const files = await useTransaction(trx => {
    return File.query(trx)
      .select('files.name', 'files.storedObjects')
      .where({ objectId: id })
  })

  const filesWithUrl = await Promise.all(
    files.map(async file => {
      const url = getFileUrl(file, 'medium')
      return {
        url,
        name: file.name,
      }
    }),
  )

  return filesWithUrl
}

const getChatChannel = async (id, options = {}) => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${BASE_MESSAGE} getChatChannel: fetching chat Channel with id ${id}`,
        )
        return ChatChannel.query(tr).findById(id)
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${BASE_MESSAGE} getChatChannel: ${e.message}`)
    throw new Error(e)
  }
}

const getChatChannels = async (where = {}, options = {}) => {
  const { trx, ...rest } = options
  const result = await ChatChannel.query(trx).where(where)
  return result
}

const cancelEmailNotification = (userId, chatChannelId) => {
  clearTimeout(globalTimeouts[`${userId}-${chatChannelId}`])
  return true
}

module.exports = {
  createChatChannel,
  getAttachments,
  getMessages,
  getMessageAuthor,
  sendMessage,
  getMessage,
  cancelEmailNotification,
  getChatChannel,
  getChatChannels,
}