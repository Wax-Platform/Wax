#!/usr/bin/env node

const seedApplicationParameters = require('../seeds/applicationParameters')

const run = async () => {
  try {
    return seedApplicationParameters()
  } catch (e) {
    throw new Error(e.message)
  }
}

run()
