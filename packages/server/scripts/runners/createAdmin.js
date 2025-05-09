#!/usr/bin/env node
const config = require('config')

const seedAdmin = require('../seeds/admin')

const adminUser = config.get('admin')

const run = async () => {
  try {
    return seedAdmin({
      ...adminUser,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

run()
