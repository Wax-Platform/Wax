const { logger } = require('@coko/server')

const { Notification } = require('../models')
const { labels } = require('./constants')

const BASE_MESSAGE = `${labels.NOTIFICATION_CONTROLLERS}:`

const getUserNotifications = async (userId, notificationType, options) => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} getUserNotifications:`

  try {
    return Notification.filterUserNotifications(
      userId,
      notificationType,
      options,
    )
  } catch (e) {
    logger.error(`${CONTROLLER_MESSAGE} ${e.message}`)
    throw new Error(e)
  }
}

const getUnreadNotificationsCountForUser = async (userId, options) => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} getUnreadNotificationsCountForUser:`

  try {
    return Notification.getUserUnreadNotifications(userId, options)
  } catch (e) {
    logger.error(`${CONTROLLER_MESSAGE} ${e.message}`)
    throw new Error(e)
  }
}

const getNotification = async notificationId => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} getNotification:`

  try {
    return Notification.query().findById(notificationId)
  } catch (e) {
    logger.error(`${CONTROLLER_MESSAGE} ${e.message}`)
    throw new Error(e)
  }
}

const markNotifications = async (read, notificationIds, options) => {
  const CONTROLLER_MESSAGE = `${BASE_MESSAGE} markNotifications:`

  try {
    return Notification.markAs(
      {
        read,
        notificationIds,
      },
      options,
    )
  } catch (e) {
    logger.error(`${CONTROLLER_MESSAGE} ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  getUserNotifications,
  getUnreadNotificationsCountForUser,
  getNotification,
  markNotifications,
}
