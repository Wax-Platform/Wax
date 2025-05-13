const { subscriptionManager, logger } = require('@coko/server')

const { BOOK_COMPONENT_ORDER_UPDATED } = require('./constants')

const { BOOK_UPDATED } = require('../book/constants')

const { models } = require('../../../models/dataloader')

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
    logger.info(
      'division resolver: executing updateBookComponentOrder use case',
    )

    const book = await updateBookComponentOrder(
      targetDivisionId,
      bookComponentId,
      index,
    )

    subscriptionManager.publish(BOOK_COMPONENT_ORDER_UPDATED, {
      bookComponentOrderUpdated: book.id,
    })

    subscriptionManager.publish(BOOK_UPDATED, {
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
    logger.info(
      'division resolver: executing updateBookComponentsOrder use case',
    )

    const book = await updateBookComponentsOrder(
      targetDivisionId,
      bookComponents,
    )

    subscriptionManager.publish(BOOK_COMPONENT_ORDER_UPDATED, {
      bookComponentOrderUpdated: book.id,
    })

    subscriptionManager.publish(BOOK_UPDATED, {
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
      const DivisionLoader = models.find(
        md => md.modelName === 'DivisionLoader',
      )

      await DivisionLoader.model.bookComponents.clear()

      return DivisionLoader.model.bookComponents.load(divisionId)
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
        return subscriptionManager.asyncIterator(BOOK_COMPONENT_ORDER_UPDATED)
      },
    },
  },
}
