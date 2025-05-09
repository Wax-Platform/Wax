const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('book')

    if (!tableExists) return

    const hasColumnPodMetadata = await knex.schema.hasColumn('book', 'pod_metadata')

    if (!hasColumnPodMetadata) return

    // Patch rows where ISBN is not empty
    await knex('book')
      .whereRaw("TRIM(pod_metadata->>'isbn') != ''")
      .update({
        pod_metadata: knex.raw(
          `jsonb_set(
            pod_metadata,
            '{isbns}',
            jsonb_build_array(
              jsonb_build_object('label', '', 'isbn', pod_metadata->'isbn')
            )
          )`
        ),
      })

    // Patch rows where ISBN is empty
    await knex('book')
      .whereRaw("TRIM(pod_metadata->>'isbn') = ''")
      .update({
        pod_metadata: knex.raw(
          `jsonb_set(pod_metadata, '{isbns}', '[]'::jsonb)`
        ),
      })

    // Remove original `isbn` field from pod_metadata
    await knex('book').update({
      pod_metadata: knex.raw(`pod_metadata - 'isbn'`),
    })

  } catch (e) {
    logger.error(e)
    throw new Error('Migration: Book: conversion to ISBN lists failed')
  }
}

exports.down = async () => {}
