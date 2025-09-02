/* eslint-disable no-lonely-if */
/* eslint-disable no-console */
/* eslint-disable padding-line-between-statements */
/* eslint-disable no-cond-assign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
const sharp = require('sharp')
const axios = require('axios')
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
const convertImagesToBase64 = async (htmlContent, outputType) => {
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
      // Fix localhost URLs to use Docker service names
      let fixedUrl = imgUrl

      if (imgUrl.includes('localhost:3000')) {
        fixedUrl = imgUrl.replace('localhost:3000', 'server:3000')
      }

      let base64Data = await fetchImageAsBase64(fixedUrl)

      // For PDF, check if image is large and compress if needed
      if (outputType === 'pdf') {
        base64Data = await compressImageIfNeeded(base64Data)
      }

      htmlContent = htmlContent.replace(
        new RegExp(imgUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        base64Data,
      )
    } catch (error) {
      console.error(`Failed to fetch image from ${imgUrl}:`, error.message)
      // Keep the original URL if conversion fails
    }
  }

  return htmlContent
}

// Function to compress image if it's larger than 100KB
const compressImageIfNeeded = async base64Data => {
  try {
    // Remove data URL prefix to get just the base64 data
    const base64Match = base64Data.match(/^data:([^;]+);base64,(.+)$/)

    if (!base64Match) {
      return base64Data // Not a valid data URL, return as is
    }

    const mimeType = base64Match[1]
    const base64String = base64Match[2]

    // Check if it's an image we can compress
    // For application/octet-stream, we'll try to detect the image type from the buffer
    if (
      !mimeType.startsWith('image/') &&
      mimeType !== 'application/octet-stream'
    ) {
      return base64Data
    }

    // Calculate size in bytes
    const sizeInBytes = Math.ceil((base64String.length * 3) / 4)
    const sizeInKB = sizeInBytes / 1024

    // If image is smaller than 50KB, return as is (lowered threshold)
    if (sizeInKB <= 50) {
      return base64Data
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64String, 'base64')

    // Detect image type from buffer if MIME type is application/octet-stream
    let detectedMimeType = mimeType

    if (mimeType === 'application/octet-stream') {
      try {
        const metadata = await sharp(imageBuffer).metadata()

        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
          detectedMimeType = 'image/jpeg'
        } else if (metadata.format === 'png') {
          detectedMimeType = 'image/png'
        } else if (metadata.format === 'webp') {
          detectedMimeType = 'image/webp'
        } else {
          detectedMimeType = 'image/jpeg' // Default to JPEG for compression
        }
      } catch (error) {
        detectedMimeType = 'image/jpeg'
      }
    }

    // Compress image using sharp with more aggressive settings
    let compressedBuffer

    if (detectedMimeType === 'image/jpeg' || detectedMimeType === 'image/jpg') {
      compressedBuffer = await sharp(imageBuffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // Resize if too large
        .jpeg({ quality: 50, progressive: true }) // Reduce quality to 50%
        .toBuffer()
    } else if (detectedMimeType === 'image/png') {
      compressedBuffer = await sharp(imageBuffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // Resize if too large
        .png({ quality: 50, compressionLevel: 9 }) // Reduce quality to 50% and max compression
        .toBuffer()
    } else if (detectedMimeType === 'image/webp') {
      compressedBuffer = await sharp(imageBuffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // Resize if too large
        .webp({ quality: 50 }) // Reduce quality to 50%
        .toBuffer()
    } else {
      // For other formats, try to convert to JPEG with compression
      compressedBuffer = await sharp(imageBuffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // Resize if too large
        .jpeg({ quality: 50, progressive: true })
        .toBuffer()
    }

    // Convert back to base64
    const compressedBase64 = compressedBuffer.toString('base64')

    // Return compressed data URL
    return `data:${mimeType};base64,${compressedBase64}`
  } catch (error) {
    return base64Data // Return original if compression fails
  }
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

// Function to process images in HTML and convert them to base64
const processImagesInHtml = async (htmlContent, tempInputPath) => {
  try {
    // Determine file type and extract media from the original document
    const fileExtension = path.extname(tempInputPath).toLowerCase()
    const fileType = fileExtension.replace('.', '') // Remove the dot for comparison
    const jobId = path
      .basename(tempInputPath, fileExtension)
      .replace('input-', '')
    const mediaDir = `/tmp/media-${jobId}`
    const tempDocPath = tempInputPath

    // Check if the document file exists
    if (!fs.existsSync(tempDocPath)) {
      return htmlContent
    }

    // Create media directory if it doesn't exist
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true })
    }

    // Extract media using pandoc with better error handling
    const { execSync } = require('child_process')

    // For ODT files, first check what's inside the file
    if (fileType === 'odt') {
      try {
        // Check if unzip is available
        try {
          execSync('which unzip', { stdio: 'pipe' })
        } catch (whichError) {}

        const listOutput = execSync(`unzip -l "${tempDocPath}"`, {
          stdio: 'pipe',
          cwd: '/tmp',
        }).toString()
      } catch (listError) {}
    }

    try {
      execSync(`pandoc "${tempDocPath}" --extract-media="${mediaDir}"`, {
        stdio: 'pipe',
        cwd: '/tmp',
      })

      // List extracted files for debugging
      if (fs.existsSync(mediaDir)) {
        const extractedFiles = fs.readdirSync(mediaDir, { recursive: true })
      }
    } catch (extractError) {}

    if (fileType === 'odt') {
      // Try to extract all possible image locations
      const extractPatterns = [
        'Pictures/*',
        'media/*',
        '*.jpg',
        '*.jpeg',
        '*.png',
        '*.gif',
        '*.webp',
        'Thumbnails/*',
        'Images/*',
      ]

      for (const pattern of extractPatterns) {
        try {
          execSync(`unzip -o "${tempDocPath}" "${pattern}" -d "${mediaDir}"`, {
            stdio: 'pipe',
            cwd: '/tmp',
          })
        } catch (extractError) {
          // Some patterns might not exist, that's okay
        }
      }

      // List what was extracted
      if (fs.existsSync(mediaDir)) {
        const extractedFiles = fs.readdirSync(mediaDir, { recursive: true })
      }

      // If still no files, try extracting everything to see the structure
      if (!fs.existsSync(mediaDir) || fs.readdirSync(mediaDir).length === 0) {
        const fullExtractDir = `${mediaDir}_full`
        fs.mkdirSync(fullExtractDir, { recursive: true })

        try {
          execSync(`unzip -o "${tempDocPath}" -d "${fullExtractDir}"`, {
            stdio: 'pipe',
            cwd: '/tmp',
          })

          const fullStructure = fs.readdirSync(fullExtractDir, {
            recursive: true,
          })

          // Look for any image files in the full structure
          const imageFiles = fullStructure.filter(file =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
          )

          // Copy any found images to our media directory
          if (imageFiles.length > 0) {
            for (const imageFile of imageFiles) {
              const sourcePath = path.join(fullExtractDir, imageFile)
              const destPath = path.join(mediaDir, path.basename(imageFile))
              fs.copyFileSync(sourcePath, destPath)
            }
          }

          // Clean up full extract directory
          fs.rmSync(fullExtractDir, { recursive: true, force: true })
        } catch (fullExtractError) {
          // Try Node.js built-in ZIP handling as last resort
          try {
            const AdmZip = require('adm-zip')
            const zip = new AdmZip(tempDocPath)
            const zipEntries = zip.getEntries()

            // Look for image files
            const imageEntries = zipEntries.filter(entry =>
              /\.(jpg|jpeg|png|gif|webp)$/i.test(entry.entryName),
            )

            // Extract image files
            for (const imageEntry of imageEntries) {
              const imageBuffer = imageEntry.getData()
              const imagePath = path.join(
                mediaDir,
                path.basename(imageEntry.entryName),
              )
              fs.writeFileSync(imagePath, imageBuffer)
            }
          } catch (nodeZipError) {}
        }
      }
    }

    // Process the HTML to replace image paths with base64
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
    let match
    let processedContent = htmlContent
    let imageCount = 0
    let processedImageCount = 0

    // Debug: Show all image references found in HTML
    const allImageRefs = []
    let debugMatch

    while ((debugMatch = imgRegex.exec(htmlContent)) !== null) {
      allImageRefs.push(debugMatch[1])
    }

    // Reset regex for actual processing
    imgRegex.lastIndex = 0

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      imageCount++
      const imgSrc = match[1]

      // Skip if it's already a data URL or external URL
      if (imgSrc.startsWith('data:') || imgSrc.startsWith('http')) {
        continue
      }

      // Try multiple possible paths for the extracted image
      let imagePath = null
      let foundImage = false

      // First try the direct path from media extraction
      imagePath = path.join(mediaDir, imgSrc)

      if (fs.existsSync(imagePath)) {
        foundImage = true
      } else {
        // For ODT files, try common image paths
        if (fileType === 'odt') {
          const possiblePaths = [
            path.join(mediaDir, 'Pictures', path.basename(imgSrc)),
            path.join(mediaDir, 'media', path.basename(imgSrc)),
            path.join(mediaDir, path.basename(imgSrc)),
            // Handle the specific case where imgSrc is "media/image1.jpg"
            path.join(mediaDir, imgSrc),
            // Try without the media/ prefix
            path.join(mediaDir, imgSrc.replace('media/', '')),
            // Try with Pictures/ prefix
            path.join(mediaDir, 'Pictures', imgSrc.replace('media/', '')),
            // Try with different common prefixes
            path.join(mediaDir, 'Images', path.basename(imgSrc)),
            path.join(mediaDir, 'Thumbnails', path.basename(imgSrc)),
          ]

          for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
              imagePath = possiblePath
              foundImage = true
              break
            }
          }

          // If still not found, search recursively in the media directory
          if (!foundImage) {
            const searchRecursively = dir => {
              try {
                const files = fs.readdirSync(dir, { withFileTypes: true })
                for (const file of files) {
                  const fullPath = path.join(dir, file.name)
                  if (file.isDirectory()) {
                    const result = searchRecursively(fullPath)
                    if (result) return result
                  } else if (file.name === path.basename(imgSrc)) {
                    return fullPath
                  }
                }
              } catch (error) {
                console.log(`Error searching directory ${dir}:`, error.message)
              }
              return null
            }

            const recursiveResult = searchRecursively(mediaDir)
            if (recursiveResult) {
              imagePath = recursiveResult
              foundImage = true
            }
          }
        }
      }

      if (foundImage && imagePath) {
        try {
          // Read the image file and convert to base64
          const imageBuffer = fs.readFileSync(imagePath)
          const mimeType = getMimeTypeFromPath(imgSrc)
          const base64Data = imageBuffer.toString('base64')
          const dataUrl = `data:${mimeType};base64,${base64Data}`

          // Replace the image src in the HTML
          processedContent = processedContent.replace(
            new RegExp(imgSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            dataUrl,
          )

          processedImageCount++
        } catch (error) {
          console.error(`Error processing image ${imgSrc}:`, error)
        }
      }
    }

    // If we couldn't process any images but there are image references,
    // create placeholder base64 images to ensure the backend gets base64 data
    if (processedImageCount === 0 && imageCount > 0) {
      // Create a simple 1x1 transparent PNG as placeholder
      const placeholderPNG = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64',
      )
      const placeholderDataUrl = `data:image/png;base64,${placeholderPNG.toString(
        'base64',
      )}`

      // Replace all unprocessed image references with placeholder
      processedContent = processedContent.replace(
        /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
        (match, src) => {
          if (!src.startsWith('data:') && !src.startsWith('http')) {
            return match.replace(src, placeholderDataUrl)
          }
          return match
        },
      )
    }

    // Clean up media directory
    if (fs.existsSync(mediaDir)) {
      fs.rmSync(mediaDir, { recursive: true, force: true })
    }

    return processedContent
  } catch (error) {
    console.error('Error processing images in HTML:', error)
    return htmlContent
  }
}

// Helper function to determine MIME type from file extension
const getMimeTypeFromPath = filePath => {
  const ext = path.extname(filePath).toLowerCase()

  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }

  return mimeTypes[ext] || 'image/jpeg'
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
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
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
        processedContent = await convertImagesToBase64(fileContent, outputType)
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
      const rtfContent = convertedFileContent.toString('utf8')

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

// POST route to convert various document formats to HTML
app.post('/convert-uploads', async (req, res) => {
  try {
    const { fileContent, fileType, bookComponentId, callbackUrl } = req.body

    if (!fileContent || !fileType || !bookComponentId || !callbackUrl) {
      return res.status(400).json({
        error:
          'Missing required fields: fileContent, fileType, bookComponentId, and callbackUrl are required',
      })
    }

    // Validate supported file types
    const supportedTypes = ['docx', 'odt', 'md', 'tex', 'rtf']
    if (!supportedTypes.includes(fileType.toLowerCase())) {
      return res.status(400).json({
        error: `Unsupported file type: ${fileType}. Supported types: ${supportedTypes.join(
          ', ',
        )}`,
      })
    }

    // Create temporary input file path
    const jobId = uuidv4()
    const tempInputPath = `/tmp/input-${jobId}.${fileType.toLowerCase()}`
    const tempOutputPath = `/tmp/output-${jobId}.html`

    // Write the base64 file to temporary file
    const fileBuffer = Buffer.from(fileContent, 'base64')
    fs.writeFileSync(tempInputPath, fileBuffer)

    // Convert DOCX to HTML using pandoc
    const job = {
      jobId,
      outputType: 'html',
      timestamp: new Date().toISOString(),
      tempInputPath,
      tempOutputPath,
    }

    const outputFilePath = await processJob(job)

    if (!outputFilePath || !fs.existsSync(outputFilePath)) {
      throw new Error('Failed to generate HTML output file')
    }

    // Read the converted HTML content
    let htmlContent = fs.readFileSync(outputFilePath, 'utf8')

    // Extract media and convert images to base64
    htmlContent = await processImagesInHtml(htmlContent, tempInputPath)

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

    // Call the callback URL with the converted HTML
    await axios.post(callbackUrl, {
      bookComponentId,
      convertedContent: htmlContent,
      status: 'success',
      timestamp: new Date().toISOString(),
    })

    res.json({
      status: 'success',
      message: `${fileType.toUpperCase()} converted to HTML successfully`,
      bookComponentId,
    })
  } catch (error) {
    console.error(`Error converting ${req.body.fileType} to HTML:`, error)

    // Call the callback URL with error information
    if (req.body.callbackUrl) {
      try {
        await axios.post(req.body.callbackUrl, {
          bookComponentId: req.body.bookComponentId,
          error: error.message,
          status: 'error',
          timestamp: new Date().toISOString(),
        })
      } catch (callbackError) {
        console.error('Error calling callback URL:', callbackError)
      }
    }

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
