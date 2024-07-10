exports.up = knex => {
  return knex.schema
    .createTable('embeddings_table', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.text('stored_object_key')
      table.text('section')
      table.text('type')
      table
        .timestamp('updated', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
    })
    .then(() => {
      return knex.raw(`
        ALTER TABLE embeddings_table
        ADD COLUMN embedding VECTOR(1536);
      `)
    })
    .then(() => {
      return knex.raw(`
        CREATE INDEX embeddings_embedding_idx
        ON embeddings_table USING hnsw (embedding vector_cosine_ops)
        WITH (m = 24, ef_construction = 200);
      `)
    })
}

exports.down = knex => {
  return knex.schema.dropTable('embeddings_table').then(() => {
    return knex.raw('DROP INDEX embeddings_embedding_idx')
  })
}
