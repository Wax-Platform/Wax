/* eslint-disable class-methods-use-this */
const clone = require('lodash/clone')

const email = require('./email')
const notificationServices = require('./notification')

const validNotifications = ['email', 'notification']

/*
  Creates a notifier service to send (for now only email) notifications 
  By default it registers all types in the mapper object and that have handlers in './email'

  New types of notifications can be added on the fly when initializing the service by passing an arg:

  {
    'notification_key': {
      notifyBy: Array<string>, e.g. ['email']
      email: (Async)Function, must return object with following fields { from, html, subject, text, to }
    }
  }

  to fire the notification call the .notify(notification_key, context) method of the instance
*/

class CokoNotifier {
  constructor(additionalNotificationTypes) {
    Object.keys(this.mapper).forEach(type => {
      this.mapper[type].notifyBy.forEach(notificationType => {
        switch (notificationType) {
          case 'email':
            this.mapper[type].email = email.handlers[type]
            break
          case 'notification':
            this.mapper[type].notification = notificationServices.handlers[type]
            break
          default:
            break
        }
      })
    })

    this.mapper = {
      ...this.mapper,
      ...additionalNotificationTypes,
    }
  }

  // register known types of notifications with field notifyBy as array with notification types (email, in-app notification, etc)
  mapper = {
    'hhmi.chatMention': {
      notifyBy: ['email', 'notification'],
    },
    // ...
  }

  runType = (type, context, method = null) => {
    if (!this.mapper[type] || !Array.isArray(this.mapper[type].notifyBy))
      throw new Error(`Notification type ${type} not recognized`)

    let notificationMethods

    if (method) {
      // notify only via requested methods
      notificationMethods = clone(method)

      if (!Array.isArray(notificationMethods)) {
        if (typeof notificationMethods === 'string') {
          notificationMethods = [notificationMethods]
        }
      }
    } else {
      // send notifications via all registered methods for notification type
      notificationMethods = this.mapper[type].notifyBy
    }

    notificationMethods.forEach(async _method => {
      if (!validNotifications.includes(_method))
        throw new Error(`${_method} is not a valid notification`)

      // const notificationData = await this.mapper[type][method](context)
      let emailData

      switch (_method) {
        case 'email':
          emailData = await this.mapper[type].email(context)
          email.sendEmail(emailData)
          break
        case 'notification':
          await this.mapper[type].notification(context)
          break
        default:
          throw Error('Notification type not defined')
      }
    })
  }

  notify = (notifyTypes, context, method) => {
    let types = clone(notifyTypes)

    if (!Array.isArray(notifyTypes)) {
      if (typeof notifyTypes === 'string') {
        types = [notifyTypes]
      } else {
        throw new Error('Invalid types format provided to notify')
      }
    }

    types.forEach(type => this.runType(type, context, method))
  }
}

module.exports = CokoNotifier
