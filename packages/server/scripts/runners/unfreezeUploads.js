#!/usr/bin/env node

const unfreezeUploading = require('../helpers/unfreezeUploads')

const run = async () => {
  try {
    return unfreezeUploading()
  } catch (e) {
    throw new Error(e.message)
  }
}

run()
