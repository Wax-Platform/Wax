exports.up = async (knex) => {
  await knex.schema.createTable('book_component', (table) => {
    // base
    table.uuid('id').primary();
    table.text('type').notNullable();
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('updated', { useTz: true });

    // ketida base
    table.boolean('deleted').defaultTo(false);

    // foreign
    table
      .uuid('book_id')
      .notNullable()
      .references('id')
      .inTable('book');
    table
      .uuid('division_id')
      .notNullable()
      .references('id')
      .inTable('division');

    // own
    table.boolean('archived').defaultTo(false);
    table.text('component_type');
    table.jsonb('pagination').notNullable();
    table.uuid('reference_id').notNullable();

    // own -> counters
    table.integer('equation_counter');
    table.integer('figure_counter');
    table.integer('note_counter');
    table.integer('page_counter');
    table.integer('table_counter');
    table.integer('word_counter');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('book_component');
};

