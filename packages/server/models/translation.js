const Base = require('./ketidaBase')
const { language } = require('./helpers').schema

class Translation extends Base {
  $beforeInsert() {
    super.$beforeInsert()

    if (typeof this.languageIso === 'string') {
      if (this.languageIso.length !== 2) {
        throw new Error('Language ISOs must be two character long')
      }

      this.languageIso = this.languageIso.toLowerCase()
    }
  }

  static get schema() {
    return {
      type: 'object',
      required: ['languageIso'],
      properties: {
        languageIso: language,
      },
    }
  }
}

module.exports = Translation
