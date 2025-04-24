#!/usr/bin/env node

const seedTemplates = require('../seeds/templates')

const run = async () => {
  try {
    return seedTemplates()
  } catch (e) {
    throw new Error(e.message)
  }
}

run()
