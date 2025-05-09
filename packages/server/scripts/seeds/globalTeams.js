const { logger, useTransaction } = require('@coko/server')
const config = require('config')
const Team = require('../../models/team/team.model')

const seedGlobalTeams = async () => {
  try {
    logger.info('Seeding global teams...')

    if (!config.has('teams.global')) {
      logger.info('No global teams declared in config')
    }

    const configGlobalTeams = config.get('teams.global')
    return useTransaction(async trx =>
      Promise.all(
        configGlobalTeams.map(async teamData => {
          const exists = await Team.findOne(
            {
              global: true,
              role: teamData.role,
            },
            { trx },
          )

          if (exists) {
            logger.info(`Global team "${teamData.role}" already exists`)
            return false
          }

          logger.info(`Added global team "${teamData.role}"`)
          return Team.insert(
            {
              ...teamData,
              global: true,
            },
            { trx },
          )
        }),
      ),
    )
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = seedGlobalTeams
