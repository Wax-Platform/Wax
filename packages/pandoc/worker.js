/* eslint-disable no-console */

const fs = require('fs')

const { execCommand } = require('./helpers')

// Function to process jobs
const processJob = async job => {
  const { jobId, outputType, tempInputPath } = job

  const tempOutputPath = `/tmp/converted-${jobId}.${outputType}`

  // Run Pandoc conversion
  try {
    await execCommand(`pandoc ${tempInputPath} -o ${tempOutputPath}`, jobId)
    return tempOutputPath
  } catch (error) {
    console.error('Error processing job:', error)
  } finally {
    // Cleanup temp files
    if (fs.existsSync(`/tmp/output-${jobId}.log`))
      fs.unlinkSync(`/tmp/output-${jobId}.log`)
    if (fs.existsSync(`/tmp/error-${jobId}.log`))
      fs.unlinkSync(`/tmp/error-${jobId}.log`)
    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath)
  }
}

module.exports = {
  processJob,
}