#!/usr/bin/env node

const deleteTemplates = require('../helpers/deleteTemplates')

const run = async () => {
  try {
    return deleteTemplates()
  } catch (e) {
    throw new Error(e.message)
  }
}

run()
