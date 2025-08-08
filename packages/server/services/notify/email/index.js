const { logger, clientUrl } = require('@coko/server')

const config = require('config')
// eslint-disable-next-line import/no-extraneous-dependencies
// const mailer = require('@pubsweet/component-send-email')
const { sendEmail } = require('@coko/server')

const { ChatThread } = require('@coko/server/src/models')
const { Identity, User } = require('../../../models')

const send = data => {
  const { attachments, content, subject, text, to } = data

  const emailData = {
    from: config.get('mailer.from'),
    html: `<div>${content}</div>`,
    subject: `${subject}`,
    text: text || content,
    to,
    attachments: attachments || [],
  }

  sendEmail(emailData)
  logger.info(`Email sent to ${to} with subject "${subject}"`)
}

const chatMention = async context => {
  try {
    const { mention, newMessage: { userId, chatThreadId } = {} } = context

    const mentionedUserIdentity = await Identity.findOne({ userId: mention })
    const sender = await User.findById(userId)
    const senderDisplayName = await User.getDisplayName(sender)
    const chatThread = await ChatThread.findById(chatThreadId)
    const link = `${clientUrl}/question/${chatThread?.relatedObjectId}#${chatThread?.chatType}`

    const content = `
        <p>User ${senderDisplayName} mentioned you in a conversation.</p>
        <p>
           Visit the chat by <a href="${link}">clicking this link</a>. 
           If you cannot click the link, copy and paste the following link into your browser.
          <br/>
          ${link}
        </p>
        `

    const text = `
    User ${sender.getDisplayName()} mentioned you in a conversation.
    \nCopy and paste the following link into your browser to visit the chat.
    \n${link} 
    `

    return {
      content,
      text,
      subject: 'You have a new mention',
      to: mentionedUserIdentity.email,
    }
  } catch (e) {
    logger.error(`Failed to create email for mention: ${e}`)
    throw new Error(e)
  }
}

module.exports = {
  sendEmail: send,
  handlers: {
    'waxPlatform.chatMention': chatMention,
  },
}
