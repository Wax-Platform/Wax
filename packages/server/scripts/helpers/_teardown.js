const { db } = require('@coko/server')

module.exports = async () => {
  db.destroy()
}
