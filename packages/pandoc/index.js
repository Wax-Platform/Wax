const express = require('express')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const https = require('https')
const http = require('http')
const { processJob } = require('./worker')

const app = express()
const PORT = process.env.PORT || 4040

// Function to fetch image and convert to base64
const fetchImageAsBase64 = url => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http

    protocol
      .get(url, response => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: ${response.statusCode}`))
          return
        }

        const chunks = []
        response.on('data', chunk => {
          chunks.push(chunk)
        })

        response.on('end', () => {
          const buffer = Buffer.concat(chunks)
          const contentType = response.headers['content-type'] || 'image/png'
          const base64 = buffer.toString('base64')
          resolve(`data:${contentType};base64,${base64}`)
        })
      })
      .on('error', error => {
        console.error(`Error fetching image from ${url}:`, error.message)
        reject(error)
      })
  })
}

// Function to convert all image URLs in HTML to base64
const convertImagesToBase64 = async htmlContent => {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  const imgUrls = []
  let match

  // Extract all image URLs
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const imgUrl = match[1]
    if (imgUrl && !imgUrl.startsWith('data:')) {
      imgUrls.push(imgUrl)
    }
  }

  // Fetch and convert each image
  for (const imgUrl of imgUrls) {
    try {
      const base64Data = await fetchImageAsBase64(imgUrl)
      htmlContent = htmlContent.replace(
        new RegExp(imgUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        base64Data,
      )
      console.log(`Successfully converted image: ${imgUrl}`)
    } catch (error) {
      console.error(`Failed to convert image ${imgUrl}:`, error.message)
      // Keep the original URL if conversion fails
    }
  }

  return htmlContent
}

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

// Function to clean HTML content by removing only broken images
const cleanHtmlContent = (htmlContent, outputType) => {
  if (outputType === 'pdf') {
    let cleanedContent = htmlContent

    // Remove specific problematic patterns

    // 1. Remove expired DigitalOcean Spaces URLs
    cleanedContent = cleanedContent.replace(
      /<img[^>]*src=["'][^"']*nyc3\.digitaloceanspaces\.com[^"']*["'][^>]*>/gi,
      '<!-- Expired DigitalOcean image removed -->',
    )

    // 2. Remove any img tags with X-Amz-Expires (expired URLs)
    cleanedContent = cleanedContent.replace(
      /<img[^>]*src=["'][^"']*X-Amz-Expires[^"']*["'][^>]*>/gi,
      '<!-- Expired URL image removed -->',
    )

    // 3. Remove corrupted base64 images (those that are too short or malformed)
    cleanedContent = cleanedContent.replace(
      /<img[^>]*src=["']data:image\/[^;]+;base64,[A-Za-z0-9+/]{0,50}[^"']*["'][^>]*>/gi,
      '<!-- Corrupted base64 image removed -->',
    )

    // 4. Remove ProseMirror separator images
    cleanedContent = cleanedContent.replace(
      /<img[^>]*class="[^"]*ProseMirror-separator[^"]*"[^>]*>/gi,
      '<!-- ProseMirror separator removed -->',
    )

    return cleanedContent
  }

  return htmlContent
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

    // Convert images to base64 if the content is HTML (but not for RTF)
    let processedContent = fileContent
    if (extension === 'html' || extension === 'htm') {
      try {
        console.log('Converting images to base64...')
        processedContent = await convertImagesToBase64(fileContent)
        console.log('Image conversion completed')
      } catch (error) {
        console.error('Error converting images:', error)
        // Continue with original content if image conversion fails
      }
    }

    // Clean HTML content by removing broken images
    processedContent = cleanHtmlContent(processedContent, outputType)

    // Create temporary input file path
    const tempInputPath = `/tmp/input-${jobId}.${extension}`

    // Write processed file content to temporary file
    fs.writeFileSync(tempInputPath, processedContent, 'utf8')

    const job = {
      jobId,
      outputType,
      timestamp: new Date().toISOString(),
      tempInputPath,
    }

    // Process the job and get the output file path
    const outputFilePath = await processJob(job)

    if (!outputFilePath || !fs.existsSync(outputFilePath)) {
      return res.status(500).json({
        error: 'Conversion failed',
        message: 'Failed to generate output file',
      })
    }

    // Read the file content
    let convertedFileContent = fs.readFileSync(outputFilePath)

    // For RTF, ensure we have a complete RTF document
    if (outputType === 'rtf') {
      console.log('=== PROCESSING RTF IN INDEX.JS ===')
      const rtfContent = convertedFileContent.toString('utf8')

      console.log(
        'Original RTF content starts with:',
        rtfContent.trim().substring(0, 50),
      )
      console.log('Original RTF content length:', rtfContent.length)

      // Always add RTF header and footer to ensure complete RTF document
      const rtfHeader =
        '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\n{\\colortbl ;\\red0\\green0\\blue0;}\n\\f0\\fs24 '
      const rtfFooter = '}'
      const completeRTF = rtfHeader + rtfContent + rtfFooter
      convertedFileContent = Buffer.from(completeRTF, 'utf8')
    }

    const fileSize = convertedFileContent.length

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
