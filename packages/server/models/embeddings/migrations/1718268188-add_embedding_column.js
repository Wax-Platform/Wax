exports.up = knex => {
  return knex.raw(`
    ALTER TABLE embeddings
    ADD COLUMN embedding VECTOR(1536);
  `)
}

exports.down = knex => {
  return knex.raw(`
    ALTER TABLE embeddings
    DROP COLUMN embedding;
  `)
}
