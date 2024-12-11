const {
  BaseModel,
  modelJsonSchemaTypes,
  logger,
  useTransaction,
} = require('@coko/server')
const { string } = modelJsonSchemaTypes
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
              docId: string,
              name: string,
              css: string,
            },
            required: ['name', 'css'],
          },
        },
        snippets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              className: string,
              elementType: string,
              description: string,
              classBody: string,
            },
            required: ['className', 'elementType', 'description', 'classBody'],
          },
        },
      },
    }
  }

  static async findByUserIdOrCreate({ userId, docId }, trx) {
    return useTransaction(
      async transaction => {
        let record
        try {
          record = await this.query(transaction).where({ userId }).first()
          logger.info('Record was fetched')
        } catch (error) {
          logger.info(error)
          throw error
        }
        if (!record) {
          try {
            record = await this.query(transaction).insert({
              userId,
              templates: defaultTemplates(docId),
              snippets: defaultSnippets,
            })
            logger.info('Record was created')
          } catch (error) {
            logger.info(error)
            throw error
          }
        }
        return record
      },
      { trx },
    )
  }
  static async updateTemplates({ userId, docId, css, name }) {
    const record = await this.query().where({ userId }).first()
    if (!record) {
      throw new Error('No record found with the given docId.')
    }
    const templates = record.templates
    let index = templates.findIndex(template => template.docId === docId)

    if (!templates[index]) {
      templates.push(defaultTemplates(docId)[0])
      index = templates.length - 1
    }

    if (css || name) {
      css && (templates[index].css = css)
      name && (templates[index].name = name)

      await this.query().where({ userId }).update({ templates })
    }
    return templates[index]
  }

  static async updateSnippets(userId, snippets) {
    const record = await this.query().where({ userId }).first()

    if (!record) {
      throw new Error('No AiDesignerMisc record found for the given userId.')
    }

    await this.query().where({ userId }).update({ snippets })

    return snippets
  }

  static async addSnippet(userId, snippet) {
    const record = await this.query().where({ userId }).first()

    if (!record) {
      throw new Error('No AiDesignerMisc record found for the given userId.')
    }

    const updatedSnippets = [...record.snippets]

    const index = updatedSnippets.findIndex(
      snippet => snippet.className === snippet.className,
    )

    index !== -1
      ? (updatedSnippets[index] = { ...updatedSnippets[index], ...snippet })
      : updatedSnippets.push(snippet)

    await this.query().where({ userId }).update({ snippets: updatedSnippets })
    return updatedSnippets
  }
}

module.exports = AiDesignerMisc
