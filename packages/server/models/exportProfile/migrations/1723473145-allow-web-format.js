const { logger } = require('@coko/server')

exports.up = async knex => {
  try {
    // create new enum type to support web format, alter `format` column to use new type, delete old type
    return knex.raw(`
        CREATE TYPE export_profile_format_type_temp AS ENUM ('pdf', 'epub', 'web');
        ALTER TABLE export_profiles
          ALTER COLUMN format TYPE export_profile_format_type_temp USING format::text::export_profile_format_type_temp;
        DROP TYPE IF EXISTS export_profile_format_type;
        ALTER TYPE export_profile_format_type_temp RENAME TO export_profile_format_type;
        `)
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Export Profiles: Alter column 'format' to add value web failed`,
    )
  }
}

exports.down = async knex => {
  try {
    return knex.raw(`
        CREATE TYPE export_profile_format_type_temp AS ENUM ('pdf', 'epub');
        ALTER TABLE export_profiles
          ALTER COLUMN format DROP DEFAULT,
          ALTER COLUMN format TYPE export_profile_format_type_temp USING format::text::export_profile_format_type_temp;
        DROP TYPE IF EXISTS export_profile_format_type;
        ALTER TYPE export_profile_format_type_temp RENAME TO export_profile_format_type_temp;
      `)
  } catch (e) {
    logger.error(e)
    throw new Error(
      `Migration: Export Profiles: Alter column 'format' to remove value web failed`,
    )
  }
}
