const { logger, useTransaction } = require('@coko/server')
const indexOf = require('lodash/indexOf')
const find = require('lodash/find')

const { Division, Book } = require('../models').models

const {
  getApplicationParameters,
} = require('./applicationParameter.controller')

const {
  getBookComponent,
  updateBookComponent,
} = require('./bookComponent.controller')

const { reorderArray } = require('../utilities/generic')

const createDivision = async (divisionData, options = {}) => {
  try {
    const { trx } = options
    logger.info(
      `>>> creating division ${divisionData.label} for the book with id ${divisionData.bookId}`,
    )

    return useTransaction(
      async tr => Division.insert(divisionData, { trx: tr }),
      {
        trx,
      },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const getDivision = async (divisionId, options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> fetching division with id ${divisionId}`)

    const division = await useTransaction(
      async tr =>
        Division.findOne({ id: divisionId, deleted: false }, { trx: tr }),
      { trx, passedTrxOnly: true },
    )

    if (!division) {
      throw new Error(`division with id: ${divisionId} does not exist`)
    }

    return division
  } catch (e) {
    throw new Error(e)
  }
}

const updateDivision = async (divisionId, patch, options = {}) => {
  try {
    const { trx } = options
    logger.info(`>>> updating division with id ${divisionId}`)

    return useTransaction(
      async tr => Division.patchAndFetchById(divisionId, patch, { trx: tr }),
      {
        trx,
      },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const updateBookComponentOrder = async (
  targetDivisionId,
  bookComponentId,
  index,
  options = {},
) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const applicationParameters = await getApplicationParameters(
          'bookBuilder',
          'divisions',
          { trx: tr },
        )

        const [{ config: divisions }] = applicationParameters

        const bookComponent = await getBookComponent(bookComponentId, {
          trx: tr,
        })

        const sourceDivision = await getDivision(bookComponent.divisionId, {
          trx: tr,
        })

        const found = indexOf(sourceDivision.bookComponents, bookComponentId)

        if (sourceDivision.id === targetDivisionId) {
          const updatedBookComponents = reorderArray(
            sourceDivision.bookComponents,
            bookComponentId,
            index,
            found,
          )

          await updateDivision(
            sourceDivision.id,
            {
              bookComponents: updatedBookComponents,
            },
            { trx: tr },
          )
        } else {
          sourceDivision.bookComponents.splice(found, 1)
          await updateDivision(
            sourceDivision.id,
            {
              bookComponents: sourceDivision.bookComponents,
            },
            { trx: tr },
          )

          const targetDivision = await getDivision(targetDivisionId, {
            trx: tr,
          })

          const updatedTargetDivisionBookComponents = reorderArray(
            targetDivision.bookComponents,
            bookComponentId,
            index,
          )

          const updatedDivision = await updateDivision(
            targetDivision.id,
            {
              bookComponents: updatedTargetDivisionBookComponents,
            },
            { trx: tr },
          )

          const divisionConfig = find(divisions, {
            name: updatedDivision.label,
          })

          await updateBookComponent(
            bookComponentId,
            {
              divisionId: targetDivision.id,
              componentType: divisionConfig.defaultComponentType,
            },
            { trx: tr },
          )
        }

        return Book.findById(sourceDivision.bookId, { trx: tr })
      },
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

const updateBookComponentsOrder = async (
  targetDivisionId,
  bookComponents,
  options = {},
) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const updatedDivision = await updateDivision(
          targetDivisionId,
          {
            bookComponents,
          },
          { trx: tr },
        )

        return Book.findById(updatedDivision.bookId, { trx: tr })
      },
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  createDivision,
  updateBookComponentOrder,
  updateBookComponentsOrder,
  getDivision,
}
