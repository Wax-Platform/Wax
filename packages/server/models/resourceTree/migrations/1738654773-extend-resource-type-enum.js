exports.up = async knex => {
  // Drop the existing check constraint
  await knex.schema.raw(`
    ALTER TABLE resource_tree DROP CONSTRAINT IF EXISTS resource_tree_resource_type_check;
  `)

  // Alter the resourceType column to text
  await knex.schema.alterTable('resource_tree', table => {
    table.text('resourceType').alter()
  })
}

exports.down = async knex => {
  // Alter the resourceType column back to enum with the original values
  await knex.schema.alterTable('resource_tree', table => {
    table.enu('resourceType', ['doc', 'dir', 'root', 'sys']).alter()
  })

  // Add the check constraint back
  await knex.schema.raw(`
    ALTER TABLE resource_tree ADD CONSTRAINT resource_tree_resource_type_check CHECK (resourceType IN ('doc', 'dir', 'root', 'sys'));
  `)
}
