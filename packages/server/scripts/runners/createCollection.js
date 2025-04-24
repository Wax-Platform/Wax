#!/usr/bin/env node

const seedBookCollection = require('../seeds/bookCollection')

const run = async () => {
  try {
    return seedBookCollection()
  } catch (e) {
    throw new Error(e.message)
  }
}

run()
