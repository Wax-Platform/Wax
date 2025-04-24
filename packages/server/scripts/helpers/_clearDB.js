const { db } = require('@coko/server')

const dbCleaner = async () => {
  const query = await db.raw(
    `SELECT tablename FROM pg_tables WHERE schemaname='public'`,
  )

  const { rows } = query

  if (rows.length > 0) {
    await Promise.all(
      rows.map(async row => {
        const { tablename } = row

        if (tablename !== 'migrations') {
          await db.raw(`TRUNCATE TABLE ${tablename} CASCADE`)
        }

        return true
      }),
    )
  }
}

module.exports = dbCleaner
