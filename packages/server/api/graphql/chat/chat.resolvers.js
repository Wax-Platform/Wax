const { subscriptionManager } = require('@coko/server')
const { actions } = require('../../../controllers/constants')
const CokoNotifier = require('../../../services/notify')
// const { pubsubManager } = require('@coko/server')
// const { getPubsub } = pubsubManager

const {
  createChatThread,
  getMessages,
  getMessageAuthor,
  getAttachments,
  sendMessage,
  getMessage,
  cancelEmailNotification,
} = require('../../../controllers/chat.controllers')

const createChatThreadResolver = async (_, { input }) => {
  return createChatThread(input)
}

const messagesResolver = async thread => {
  return getMessages(thread.id)
}

const messageResolver = async messageId => {
  return getMessage(messageId)
}

const userResolver = async message => {
  return getMessageAuthor(message)
}

const attachmentResolver = async message => {
  return getAttachments(message)
}

const sendMessageResolver = async (_, { input }, ctx) => {
  try {
    const { chatThreadId, content, userId, mentions, attachments } = input

    const message = await sendMessage(
      chatThreadId,
      content,
      userId,
      mentions,
      attachments,
    )

    // const pubsub = await getPubsub()
    subscriptionManager.publish(
      `${actions.MESSAGE_CREATED}.${chatThreadId}`,
      message.id,
    )

    // send notification to all mentioned users
    const notifier = new CokoNotifier()

    mentions.forEach(mention => {
      notifier.notify(
        'waxPlatform.chatMention',
        {
          mention,
          message,
        },
        'notification',
      )
    })

    return message
  } catch (e) {
    throw new Error(e)
  }
}

const cancelEmailNotificationResolver = (_, { chatThreadId }, ctx) => {
  return cancelEmailNotification(ctx.user, chatThreadId)
}

module.exports = {
  ChatThread: {
    messages: messagesResolver,
  },
  ChatMessage: {
    user: userResolver,
    attachments: attachmentResolver,
  },
  Mutation: {
    sendMessage: sendMessageResolver,
    createChatThread: createChatThreadResolver,
    cancelEmailNotification: cancelEmailNotificationResolver,
  },
  Subscription: {
    messageCreated: {
      resolve: async messageId => {
        if (messageId) {
          return messageResolver(messageId)
        }

        return null
      },
      subscribe: async (_payload, vars) => {
        // const pubsub = await getPubsub()

        return subscriptionManager.asyncIterator(
          `${actions.MESSAGE_CREATED}.${vars.chatThreadId}`,
        )
      },
    },
  },
}
