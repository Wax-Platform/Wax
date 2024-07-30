const { BaseModel, modelTypes, logger } = require('@coko/server')
const { string, arrayOfIds } = modelTypes
const defaultSnippets = require('./helpers/defaultSnippets')
const defaultTemplates = require('./helpers/defaultTemplates')

class AiDesignerMisc extends BaseModel {
  constructor(props) {
    super(props)
    this.type = 'aidmisc'
  }

  static get tableName() {
    return 'aidmisc_table'
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        userId: string,
        templates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              relatedDocs: arrayOfIds,
              name: { type: 'string' },
              css: { type: 'string' },
            },
            required: ['name', 'css'],
          },
        },
        snippets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              className: { type: 'string' },
              elementType: { type: 'string' },
              description: { type: 'string' },
              classBody: { type: 'string' },
            },
            required: ['className', 'elementType', 'description', 'classBody'],
          },
        },
      },
    }
  }

  static async findByUserIdOrCreate({ userId, docId }) {
    logger.info(`USERID: ${userId}`)
    let record
    try {
      record = await this.query().where({ userId }).first()
    } catch (error) {
      logger.info(error)
    }
    try {
      record = await this.insert({
        userId,
        templates: defaultTemplates(docId),
        snippets: defaultSnippets,
      })
    } catch (error) {
      logger.info(error)
    }

    return record
  }

  static async updateSnippets(userId, newSnippets) {
    const recordToUpdate = await this.query().where({ userId }).first()

    if (!recordToUpdate) {
      throw new Error('No AiDesignerMisc record found for the given userId.')
    }

    const updatedSnippets = [...recordToUpdate.snippets]
    newSnippets.forEach(newSnippet => {
      const index = updatedSnippets.findIndex(
        snippet => snippet.className === newSnippet.className,
      )
      if (index !== -1) {
        updatedSnippets[index] = newSnippet
      } else {
        updatedSnippets.push(newSnippet)
      }
    })

    return this.query()
      .update({ snippets: updatedSnippets })
      .where({ userId })
      .returning('*')
  }
}

module.exports = AiDesignerMisc
