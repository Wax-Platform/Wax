const {
  logger,
  clientUrl,
  sendEmail,
  Identity,
  ChatChannel,
} = require('@coko/server')

const config = require('config')
// eslint-disable-next-line import/no-extraneous-dependencies
// const mailer = require('@pubsweet/component-send-email')

const { User } = require('../../../models').models

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
    const { mention, newMessage: { userId, chatChannelId } = {} } = context
    const mentionedUserIdentity = await Identity.findOne({ userId: mention })
    const sender = await User.findById(userId)
    const senderDisplayName = await User.getDisplayName(sender)
    const { relatedObjectId } = await ChatChannel.findById(chatChannelId)
    const link = `${clientUrl}/document/${relatedObjectId}`

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
