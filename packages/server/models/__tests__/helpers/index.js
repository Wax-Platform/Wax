const { db } = require('@coko/server')

const dbCleaner = async () => {
  const query = await db.raw(
    `SELECT tablename FROM pg_tables WHERE schemaname='public'`,
  )

  const { rows } = query

  if (rows.length > 0) {
    await Promise.all(
      rows.map(row => {
        const { tablename } = row

        if (tablename !== 'migrations') {
          return db.raw(`truncate table ${tablename} cascade`)
        }

        return true
      }),
    )
  }
}

module.exports = { dbCleaner }
