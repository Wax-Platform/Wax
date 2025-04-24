const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    // add cover field
    await knex.schema.table('book', table => {
      table.jsonb('cover').defaultTo(null)
    })

    // find books with thumbnail
    const booksWithThumbnails = await knex('book').whereNotNull('thumbnailId')

    // copy thumbnail id to new cover field
    return Promise.all(
      booksWithThumbnails.map(async book => {
        await knex('book')
          .where('id', book.id)
          .update(
            'cover',
            JSON.stringify([
              {
                fileId: book.thumbnailId,
                altText: '',
              },
            ]),
          )
      }),
    )
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: add "cover" failed`)
  }
}

exports.down = async knex => {
  try {
    return knex.schema.table('book', table => {
      table.dropColumn('cover')
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Book: removing cover column failed`)
  }
}
