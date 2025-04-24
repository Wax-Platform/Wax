exports.up = knex => {
  return knex.raw(`
    CREATE INDEX embeddings_embedding_idx
    ON embeddings USING hnsw (embedding vector_cosine_ops)
    WITH (m = 24, ef_construction = 200);
  `)
}

exports.down = knex => {
  return knex.raw('DROP INDEX embeddings_embedding_idx')
}
