const { id, boolean, object, string } = require('../helpers').schema
const Base = require('../ketidaBase')

const { applyListQueryOptions } = require('./helpers')

class Notification extends Base {
  static get tableName() {
    return 'notifications'
  }

  constructor(properties) {
    super(properties)
    this.type = 'notification'
  }

  static get schema() {
    return {
      properties: {
        notification_type: string,
        user_id: id,
        object_id: id,
        content: object,
        read: boolean,
      },
    }
  }

  static async createNotification(data) {
    try {
      return Notification.insert(data)
    } catch (e) {
      console.error('Notification model: notification creation failed', e)
      throw new Error(e)
    }
  }

  static async filterUserNotifications(userId, notificationType, options = {}) {
    try {
      const { read } = options

      const query = Notification.query(options.trx).where({
        userId,
        notificationType,
      })

      if (typeof read === 'boolean') {
        query.where({ read })
      }

      return applyListQueryOptions(query, options)
    } catch (e) {
      console.error('Notification model: filter failed', e)
      throw new Error(e)
    }
  }

  static async getUserUnreadNotifications(userId, options = {}) {
    try {
      return Notification.query(options.trx)
        .select('notification_type')
        .where({
          userId,
          read: false,
        })
        .count('notification_type')
        .groupBy('notification_type')
    } catch (e) {
      console.error('Notification model: unread notification count failed', e)
      throw new Error(e)
    }
  }

  static async markAs(data, options = {}) {
    const { notificationIds, read } = data

    try {
      const rowsAffected = await Notification.query(options.trx)
        .patch({ read })
        .whereIn('id', notificationIds)

      return rowsAffected === notificationIds.length
    } catch (e) {
      console.error(
        `Notification model: failed to mark notifications as ${
          read && 'un'
        }read`,
        e,
      )
      throw new Error(e)
    }
  }
}

module.exports = Notification
