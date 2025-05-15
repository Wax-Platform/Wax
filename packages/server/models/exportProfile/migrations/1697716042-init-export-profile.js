const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    return knex.schema.createTable('export_profiles', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
      table.text('type').notNullable()
      table.text('displayName').notNullable()

      table
        .uuid('bookId')
        .notNullable()
        .references('id')
        .inTable('book')
        .onDelete('CASCADE')

      table
        .uuid('templateId')
        .notNullable()
        .references('id')
        .inTable('template')

      table
        .jsonb('includedComponents')
        .notNullable()
        .defaultTo({ toc: true, copyright: true, titlePage: true })
      table
        .enu('format', ['epub', 'pdf'], {
          useNative: true,
          enumName: 'export_profile_format_type',
        })
        .notNullable()
      table
        .enu('trimSize', ['8.5x11', '6x9', '5.5x8.5', '5.8x8.3', '8.3x11.7'], {
          useNative: true,
          enumName: 'export_profile_trim_size_type',
        })
        .nullable()
        .defaultTo(null)
      table.jsonb('providerInfo').defaultTo([])
      table.boolean('deleted').defaultTo(false)
    })
  } catch (e) {
    logger.error(e)
    throw new Error(`Migration: Export Profiles: initial migration failed`)
  }
}

exports.down = async knex => knex.schema.dropTable('export_profiles')
