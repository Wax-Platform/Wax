exports.up = async knex => {
  await knex.schema.createTable('application_parameter', table => {
    table.uuid('id').primary().notNullable()
    table.text('type').notNullable()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true })
    table.text('context').notNullable()
    table.text('area').notNullable()
    table.jsonb('config')

    table.index('context', 'application_parameter_context_index')
    table.index('area', 'application_parameter_area_index')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('application_parameter')
}
