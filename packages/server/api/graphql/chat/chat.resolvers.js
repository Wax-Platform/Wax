const { subscriptionManager } = require('@coko/server')
const { actions } = require('../../../controllers/constants')
const CokoNotifier = require('../../../services/notify')
// const { pubsubManager } = require('@coko/server')
// const { getPubsub } = pubsubManager

const {
  createChatChannel,
  getMessages,
  getMessageAuthor,
  getAttachments,
  sendMessage,
  getMessage,
  cancelEmailNotification,
} = require('../../../controllers/chat.controllers')

const createChatChannelResolver = async (_, { input }) => {
  return createChatChannel(input)
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

const sendChatMessageResolver = async (_, { input }, ctx) => {
  try {
    const { chatChannelId, content, userId, mentions, attachments } = input

    const message = await sendMessage(
      chatChannelId,
      content,
      userId,
      mentions,
      attachments,
    )

    // const pubsub = await getPubsub()
    subscriptionManager.publish(
      `${actions.MESSAGE_CREATED}.${chatChannelId}`,
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

const cancelEmailNotificationResolver = (_, { chatChannelId }, ctx) => {
  return cancelEmailNotification(ctx.user, chatChannelId)
}

module.exports = {
  ChatChannel: {
    messages: messagesResolver,
  },
  ChatMessage: {
    user: userResolver,
    attachments: attachmentResolver,
  },
  Mutation: {
    sendChatMessage: sendChatMessageResolver,
    createChatChannel: createChatChannelResolver,
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
          `${actions.MESSAGE_CREATED}.${vars.chatChannelId}`,
        )
      },
    },
  },
}
