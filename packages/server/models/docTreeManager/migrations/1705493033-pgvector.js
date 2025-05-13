exports.up = async knex => {
  return knex.raw(`CREATE EXTENSION IF NOT EXISTS "vector";`)
}

exports.down = async knex => {
  return knex.raw(`DROP EXTENSION IF EXISTS "vector";`)
}
