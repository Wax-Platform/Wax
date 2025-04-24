const Loader = require('../loader')
const BookComponentState = require('../../bookComponentState/bookComponentState.model')

const BookComponentStateLoader = {
  state: new Loader(async bookComponentId =>
    BookComponentState.findOne({ bookComponentId }),
  ),
}

module.exports = BookComponentStateLoader
