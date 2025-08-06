const { logger } = require('@coko/server')

const { createChatChannel } = require('../../../controllers/chat.controllers')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('book_component')
    if (!tableExists) return

    const bookComponents = await knex('book_component')

    bookComponents.map(async bookComponent => {
      const hasChatChannel = await knex('chat_channels').where({
        related_object_id: bookComponent.id,
      })

      if (hasChatChannel.length === 0) {
        await createChatChannel({
          relatedObjectId: bookComponent.id,
          chatType: 'waxPlatformChat',
        })
      }
    })
  } catch (e) {
    logger.error(
      'Book Component: migration adding chat_channel_id field for table chat_channels failed!',
    )
    throw new Error(e)
  }
}

exports.down = knex => {}
