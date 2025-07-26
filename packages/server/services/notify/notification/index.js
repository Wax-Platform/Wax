const { logger } = require('@coko/server')
const { subscriptionManager } = require('@coko/server')

const { Notification } = require('../../../models')

const chatMention = async data => {
  try {
    const {
      mention,
      message: { id, userId, content, created },
    } = data

    const notificationContent = {
      from: userId,
      content,
      date: created,
    }

    const newNotification = await Notification.createNotification({
      notification_type: 'mention',
      user_id: mention,
      object_id: id,
      content: notificationContent,
    })

    subscriptionManager.publish(
      `NEW_NOTIFICATION.${mention}`,
      newNotification.id,
    )
  } catch (e) {
    logger.error('Failed to send notification for chat mention')
    throw new Error(e)
  }
}

module.exports = {
  handlers: {
    'hhmi.chatMention': chatMention,
  },
}
