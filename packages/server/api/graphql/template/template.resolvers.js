const { logger, pubsubManager } = require('@coko/server')
const config = require('config')

const {
  TEMPLATE_CREATED,
  TEMPLATE_DELETED,
  TEMPLATE_UPDATED,
} = require('./constants')

const {
  getTemplates,
  getTemplate,
  getSpecificTemplates,
  createTemplate,
  cloneTemplate,
  updateTemplate,
  deleteTemplate,
  updateTemplateCSSFile,
  getExportScripts,
  addTemplate,
  refreshTemplate,
  disableTemplate,
  enableTemplate,
  removeTemplate,
} = require('../../../controllers/template.controller')

const { getEntityFiles } = require('../../../controllers/file.controller')

const exporter = require('../../../controllers/helpers/exporter')

const getTemplatesHandler = async (
  _,
  { ascending, sortKey, target, notes },
  ctx,
) => {
  try {
    logger.info('template resolver: use case getTemplates')
    return getTemplates(ascending, sortKey, target, notes)
  } catch (e) {
    throw new Error(e)
  }
}

const getTemplateHandler = async (_, { id }, ctx) => {
  logger.info('template resolver: use case getTemplate')
  return getTemplate(id)
}

const getSpecificTemplatesHandler = (_, { where }, ctx) => {
  try {
    const { target, trimSize, name } = where
    logger.info('template resolver: use case getSpecificTemplates')
    return getSpecificTemplates(target, trimSize, name)
  } catch (e) {
    throw new Error(e)
  }
}

const createTemplateHandler = async (_, { input }, ctx) => {
  try {
    const {
      name,
      author,
      files,
      target,
      trimSize,
      thumbnail,
      notes,
      exportScripts,
    } = input

    const pubsub = await pubsubManager.getPubsub()

    logger.info('template resolver: use case createTemplate')

    const newTemplate = await createTemplate(
      name,
      author,
      files,
      target,
      trimSize,
      thumbnail,
      notes,
      exportScripts,
    )

    pubsub.publish(TEMPLATE_CREATED, {
      templateCreated: newTemplate.id,
    })

    logger.info('New template created msg broadcasted')
    return newTemplate
  } catch (e) {
    throw new Error(e)
  }
}

const cloneTemplateHandler = async (_, { input }, ctx) => {
  try {
    logger.info('template resolver: use case cloneTemplate')
    const pubsub = await pubsubManager.getPubsub()
    const { id, bookId, name, cssFile, hashed } = input
    const newTemplate = await cloneTemplate(id, name, cssFile, hashed)

    pubsub.publish(TEMPLATE_CREATED, {
      templateCreated: updateTemplate.id,
    })
    logger.info('New template created msg broadcasted')

    return exporter(
      bookId,
      newTemplate.id,
      'pagedjs',
      undefined,
      newTemplate.notes,
      ctx,
    )
  } catch (e) {
    throw new Error(e)
  }
}

const updateTemplateHandler = async (_, { input }, ctx) => {
  try {
    logger.info('template resolver: use case updateTemplates')
    const pubsub = await pubsubManager.getPubsub()
    const updatedTemplate = await updateTemplate(input)

    pubsub.publish(TEMPLATE_UPDATED, {
      templateUpdated: updatedTemplate.id,
    })

    logger.info('Template updated msg broadcasted')

    return updatedTemplate
  } catch (e) {
    throw new Error(e)
  }
}

const deleteTemplateHandler = async (_, { id }, ctx) => {
  try {
    logger.info('template resolver: use case deleteTemplate')
    const pubsub = await pubsubManager.getPubsub()
    const deletedTemplate = await deleteTemplate(id)

    pubsub.publish(TEMPLATE_DELETED, {
      templateDeleted: deletedTemplate.id,
    })
    logger.info('Template deleted msg broadcasted')
    return id
  } catch (e) {
    throw new Error(e)
  }
}

const addTemplateHandler = async (_, { url }) => {
  try {
    logger.info('template resolver: add new template')
    const newTemplates = await addTemplate(url)
    return newTemplates
  } catch (e) {
    throw new Error(e)
  }
}

const refreshTemplateHandler = async (_, { url }) => {
  try {
    logger.info('template resolver: refresh template')
    const newTemplates = await refreshTemplate(url)
    return newTemplates
  } catch (e) {
    throw new Error(e)
  }
}

const disableTemplateHandler = async (_, { url }) => {
  try {
    logger.info('template resolver: disable template')
    const newTemplates = await disableTemplate(url)
    return newTemplates
  } catch (e) {
    throw new Error(e)
  }
}

const enableTemplateHandler = async (_, { url }) => {
  try {
    logger.info('template resolver: enable template')
    const newTemplates = await enableTemplate(url)
    return newTemplates
  } catch (e) {
    throw new Error(e)
  }
}

const updateTemplateCSSFileHandler = async (_, { input }, ctx) => {
  try {
    logger.info('template resolver: use case updateTemplateCSSFile')
    const { id, data, hashed, bookId } = input

    const pubsub = await pubsubManager.getPubsub()
    const currentTemplate = await updateTemplateCSSFile(id, data, hashed)

    pubsub.publish(TEMPLATE_UPDATED, {
      templateUpdated: currentTemplate.id,
    })
    logger.info('Template updated msg broadcasted')

    return exporter(
      bookId,
      currentTemplate.id,
      'pagedjs',
      undefined,
      currentTemplate.notes,
      ctx,
    )
  } catch (e) {
    throw new Error(e)
  }
}

const getExportScriptsHandler = async (_, { scope }, ctx) => {
  try {
    logger.info('export script resolver: executing getExportScripts use case')
    return getExportScripts(scope)
  } catch (e) {
    throw new Error(e)
  }
}

const lastUpdatedResolver = async template => {
  const relatedFiles = await getEntityFiles(template.id)

  if (relatedFiles.length) {
    return relatedFiles.reduce(
      (latest, file) => (file?.updated > latest ? file?.updated : latest),
      relatedFiles[0].updated,
    )
  }

  return null
}

const canBeDeletedResolver = async template => {
  // templates that don't exist in the initial config can be deleted
  return config.get('templates').findIndex(t => t.url === template.url) === -1
}

const removeTemplateHandler = async (_, { url }) => {
  return removeTemplate(url)
}

module.exports = {
  Query: {
    getTemplates: getTemplatesHandler,
    getTemplate: getTemplateHandler,
    getSpecificTemplates: getSpecificTemplatesHandler,
    getExportScripts: getExportScriptsHandler,
  },
  Mutation: {
    createTemplate: createTemplateHandler,
    cloneTemplate: cloneTemplateHandler,
    updateTemplate: updateTemplateHandler,
    updateTemplateCSSFile: updateTemplateCSSFileHandler,
    deleteTemplate: deleteTemplateHandler,
    addTemplate: addTemplateHandler,
    refreshTemplate: refreshTemplateHandler,
    disableTemplate: disableTemplateHandler,
    enableTemplate: enableTemplateHandler,
    removeTemplate: removeTemplateHandler,
  },
  Template: {
    async files(template, _, ctx) {
      const files = await template.getFiles()
      return files
    },
    async thumbnail(template, _, ctx) {
      try {
        return template.getThumbnail()
      } catch (error) {
        logger.error(error)
        return null
      }
    },
    lastUpdated: lastUpdatedResolver,
    canBeDeleted: canBeDeletedResolver,
  },
  Subscription: {
    templateCreated: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(TEMPLATE_CREATED)
      },
    },
    templateDeleted: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(TEMPLATE_DELETED)
      },
    },
    templateUpdated: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(TEMPLATE_UPDATED)
      },
    },
  },
}
