const assign = require('lodash/assign')
const { logger, useTransaction } = require('@coko/server')

const { BookComponentState, BookComponent, BookComponentTranslation } =
  require('../../models').models

const bookComponentCreator = async (
  bookId,
  componentType,
  divisionId,
  title,
  workflowStages,
  options = {},
) => {
  try {
    const { languageIso, bookComponentId, trx } = options
    return useTransaction(
      async tr => {
        let newBookComponent
        logger.info(
          `>>> creating book component for book with id ${bookId} inside division with id ${divisionId}`,
        )

        if (bookComponentId) {
          logger.info(`>>> enforcing book component id ${bookComponentId}`)
          newBookComponent = await BookComponent.insert(
            {
              bookId,
              id: bookComponentId,
              componentType,
              divisionId,
              pagination: {
                left: false,
                right: false,
              },
              archived: false,
              deleted: false,
            },
            { trx: tr },
          )
        } else {
          newBookComponent = await BookComponent.insert(
            {
              bookId,
              componentType,
              divisionId,
              pagination: {
                left: false,
                right: false,
              },
              archived: false,
              deleted: false,
            },
            { trx: tr },
          )
        }

        logger.info(`>>> book component created with id ${newBookComponent.id}`)

        logger.info(
          `>>> creating book component translation for book component with id ${newBookComponent.id}`,
        )

        const bookComponentTranslation = await BookComponentTranslation.query(
          tr,
        ).insert({
          bookComponentId: newBookComponent.id,
          languageIso: languageIso || 'en',
          title,
        })

        logger.info(
          `>>> book component translation created with id ${bookComponentTranslation.id}`,
        )

        let bookComponentWorkflowStages

        if (workflowStages) {
          logger.info(
            `>>> creating book component workflow stages for book component with id ${newBookComponent.id}`,
          )
          bookComponentWorkflowStages = {
            workflowStages: workflowStages.map(stage => {
              let value = -1

              if (stage.type === 'upload') {
                value = 1
              }

              if (stage.type === 'file_prep') {
                value = 0
              }

              return {
                type: stage.type,
                label: stage.title,
                value,
              }
            }),
          }
        }

        logger.info(
          `>>> creating book component state for book component with id ${newBookComponent.id}`,
        )

        const bookComponentState = await BookComponentState.insert(
          assign(
            {},
            {
              bookComponentId: newBookComponent.id,
              trackChangesEnabled: false,
              uploading: false,
              includeInToc: true,
            },
            bookComponentWorkflowStages,
          ),
          { trx: tr },
        )

        logger.info(`>>> book component state with id ${bookComponentState.id}`)
        return newBookComponent
      },
      { trx },
    )
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = bookComponentCreator
