/* eslint-disable no-console */
const { exec } = require('child_process')
const fs = require('fs')

const execCommand = (command, jobId) => {
  return new Promise((resolve, reject) => {
    // Create writable streams for logs
    const logStream = fs.createWriteStream(`/tmp/output-${jobId}.log`, {
      flags: 'a',
    })

    const errorStream = fs.createWriteStream(`/tmp/error-${jobId}.log`, {
      flags: 'a',
    })

    console.log('Executing command:', command)

    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error executing command:', error)
        reject(stderr || error.message)
      } else {
        console.log('stdout:', stdout)
        console.log('stderr:', stderr)
        console.log('Command executed successfully')
        resolve(stdout)
      }
    })

    // Pipe stdout to the log file
    process.stdout.pipe(logStream)

    // Pipe stderr to the error log file
    process.stderr.pipe(errorStream)

    // Optionally, log stderr to the console as well
    process.stderr.on('data', data => {
      // console.error(`stderr: ${data}`)
    })
  })
}

module.exports = {
  execCommand,
}
