#!/usr/bin/env node

const seedGlobalTeams = require('../seeds/globalTeams')

const run = async () => {
  try {
    return seedGlobalTeams()
  } catch (e) {
    throw new Error(e.message)
  }
}

run()
