exports.up = async knex => {
  const tableExists = await knex.schema.hasTable('teams')

  if (tableExists) {
    return knex.schema
      .table('teams', table => {
        table.renameColumn('name', 'displayName')
      })
      .then(() =>
        knex.raw(`ALTER TABLE teams ALTER COLUMN display_name SET NOT NULL;`),
      )
  }

  return false
}

exports.down = async knex => {
  const tableExists = await knex.schema.hasTable('teams')

  if (tableExists) {
    return knex.schema
      .table('teams', table => {
        table.renameColumn('displayName', 'name')
      })
      .then(() =>
        knex.raw(`ALTER TABLE teams ALTER COLUMN name DROP NOT NULL;`),
      )
  }

  return false
}
