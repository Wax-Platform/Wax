const express = require('express')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const { processJob } = require('./worker')

const app = express()
const PORT = process.env.PORT || 4040

// Helper function to get content type based on output format
const getContentType = outputType => {
  const contentTypes = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    html: 'text/html',
    md: 'text/markdown',
    txt: 'text/plain',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    epub: 'application/epub+zip',
    tex: 'application/x-tex',
    latex: 'application/x-latex',
  }

  return contentTypes[outputType] || 'application/octet-stream'
}

// Manual CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  next()
})

// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check request received')
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// POST route to trigger pandoc conversion
app.post('/convert', async (req, res) => {
  try {
    const {
      fileContent,
      fileName,
      outputType = 'pdf',
      extension = 'html',
    } = req.body

    // Validate required fields
    if (!fileContent || !fileName) {
      return res.status(400).json({
        error: 'Missing required fields: fileContent and fileName are required',
      })
    }

    // Generate unique job ID
    const jobId = uuidv4()

    // Create temporary input file path
    const tempInputPath = `/tmp/input-${jobId}.${extension}`

    // Write file content to temporary file
    fs.writeFileSync(tempInputPath, fileContent, 'utf8')

    const job = {
      jobId,
      outputType,
      timestamp: new Date().toISOString(),
      tempInputPath,
    }

    // Process the job and get the output file path
    const outputFilePath = await processJob(job)

    console.log('Output file path:', outputFilePath)
    if (!outputFilePath || !fs.existsSync(outputFilePath)) {
      return res.status(500).json({
        error: 'Conversion failed',
        message: 'Failed to generate output file',
      })
    }

    // Read the file content
    const convertedFileContent = fs.readFileSync(outputFilePath)
    const fileSize = fs.statSync(outputFilePath).size

    // Clean up temporary files
    try {
      if (fs.existsSync(outputFilePath)) {
        fs.unlinkSync(outputFilePath)
      }

      if (fs.existsSync(tempInputPath)) {
        fs.unlinkSync(tempInputPath)
      }
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError)
    }

    // Return JSON response with file data
    const outputFileName = `${fileName}.${outputType}`
    res.status(200).json({
      status: 'success',
      message: 'Document converted successfully',
      fileName: outputFileName,
      fileSize,
      contentType: getContentType(outputType),
      fileContent: convertedFileContent.toString('base64'), // Base64 encoded for JSON transmission
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error processing conversion request:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  })
})

// Start the server
app.listen(PORT, () => {
  // console.log(`Pandoc HTTP server listening on port ${PORT}`)
  // console.log(`Health check: http://localhost:${PORT}/health`)
  // console.log(
  //   `Convert endpoint: POST http://localhost:${PORT}/convert (returns JSON with base64 file content)`,
  // )
  // console.log('CORS enabled for all origins')
})

// Graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0)
})

process.on('SIGINT', () => {
  process.exit(0)
})

module.exports = app
