const { pubsubManager, logger } = require('@coko/server')

const { BOOK_COMPONENT_ORDER_UPDATED } = require('./constants')

const { BOOK_UPDATED } = require('../book/constants')

const {
  updateBookComponentOrder,
  updateBookComponentsOrder,
  getDivision,
} = require('../../../controllers/division.controller')

const updateBookComponentOrderHandler = async (
  _,
  { targetDivisionId, bookComponentId, index },
  ctx,
) => {
  try {
    const pubsub = await pubsubManager.getPubsub()
    logger.info(
      'division resolver: executing updateBookComponentOrder use case',
    )

    const book = await updateBookComponentOrder(
      targetDivisionId,
      bookComponentId,
      index,
    )

    pubsub.publish(BOOK_COMPONENT_ORDER_UPDATED, {
      bookComponentOrderUpdated: book.id,
    })

    pubsub.publish(BOOK_UPDATED, {
      bookUpdated: book.id,
    })

    return book
  } catch (e) {
    throw new Error(e)
  }
}

const updateBookComponentsOrderHandler = async (
  _,
  { targetDivisionId, bookComponents },
  ctx,
) => {
  try {
    const pubsub = await pubsubManager.getPubsub()
    logger.info(
      'division resolver: executing updateBookComponentsOrder use case',
    )

    const book = await updateBookComponentsOrder(
      targetDivisionId,
      bookComponents,
    )

    pubsub.publish(BOOK_COMPONENT_ORDER_UPDATED, {
      bookComponentOrderUpdated: book.id,
    })

    pubsub.publish(BOOK_UPDATED, {
      bookUpdated: book.id,
    })

    return book
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  Mutation: {
    updateBookComponentOrder: updateBookComponentOrderHandler,
    updateBookComponentsOrder: updateBookComponentsOrderHandler,
  },
  Division: {
    async bookComponents(divisionId, _, ctx) {
      await ctx.connectors.DivisionLoader.model.bookComponents.clear()

      return ctx.connectors.DivisionLoader.model.bookComponents.load(divisionId)
    },
    async label(divisionId, _, ctx) {
      const dbDivision = await getDivision(divisionId)
      return dbDivision.label
    },
    async id(divisionId, _, ctx) {
      return divisionId
    },
  },
  Subscription: {
    bookComponentOrderUpdated: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(BOOK_COMPONENT_ORDER_UPDATED)
      },
    },
  },
}
