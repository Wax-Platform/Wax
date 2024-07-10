const { BaseModel } = require('@coko/server')

class Settings extends BaseModel {
  static get tableName() {
    return 'settings_table'
  }

  constructor(properties) {
    super(properties)
    this.type = 'settings'
  }

  static async getSettings() {
    try {
      return await this.query().first()
    } catch (err) {
      console.error(err)
      throw new Error(err)
    }
  }

  static get schema() {
    return {
      type: 'object',
      required: ['gui', 'editor', 'snippetsManager', 'chat'],
      properties: {
        gui: {
          type: 'object',
          properties: {
            showChatBubble: { type: 'boolean' },
            advancedTools: { type: 'boolean' },
          },
          required: ['showChatBubble', 'advancedTools'],
        },
        editor: {
          type: 'object',
          properties: {
            displayStyles: { type: 'boolean', default: true },
            enableSelection: { type: 'boolean', default: true },
            contentEditable: { type: 'boolean' },
            enablePaste: { type: 'boolean' },
            selectionColor: {
              type: 'object',
              properties: {
                bg: { type: 'string' },
                border: { type: 'string' },
              },
              required: ['bg', 'border'],
            },
          },
          required: ['contentEditable', 'enablePaste', 'selectionColor'],
        },
        snippetsManager: {
          type: 'object',
          properties: {
            enableSnippets: { type: 'boolean' },
            showCssByDefault: { type: 'boolean' },
            createNewSnippetVersions: { type: 'boolean' },
            markNewSnippet: { type: 'boolean' },
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
                required: [
                  'className',
                  'elementType',
                  'description',
                  'classBody',
                ],
              },
            },
          },
          required: [
            'enableSnippets',
            'showCssByDefault',
            'createNewSnippetVersions',
            'markNewSnippet',
            'snippets',
          ],
        },
        chat: {
          type: 'object',
          properties: {
            historyMax: { type: 'integer' },
          },
          required: ['historyMax'],
        },
        preview: {
          livePreview: { type: 'boolean' },
        },
      },
    }
  }
}

module.exports = Settings
