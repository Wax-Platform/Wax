const map = require('lodash/map')
const find = require('lodash/find')
const pullAll = require('lodash/pullAll')
const Loader = require('../loader')
const BookComponent = require('../../bookComponent/bookComponent.model')
const Division = require('../../division/division.model')

const DivisionLoader = {
  bookComponents: new Loader(async divisionId => {
    // eslint-disable-next-line no-return-await
    const division = await Division.findById(divisionId)
    const bookComponentsOrder = division.bookComponents

    const bookComponents = await BookComponent.query()
      .select('book_component.*', 'book_component_translation.title')
      .innerJoin(
        'book_component_translation',
        'book_component.id',
        'book_component_translation.book_component_id',
      )
      .where('book_component_translation.language_iso', 'en')
      .where('book_component.division_id', divisionId)
      .andWhere('book_component.deleted', false)

    const ordered = map(bookComponentsOrder, bookComponentId => {
      return find(bookComponents, { id: bookComponentId })
    })

    return pullAll(ordered, [undefined])
  }),
}

module.exports = DivisionLoader
