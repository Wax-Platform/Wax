const crypto = require('crypto')
const { logger, fileStorage } = require('@coko/server')

const {
  aiService,
  generateImages,
  getImageStreamFromURL,
  ragSearch,
} = require('../../controllers/aiService.controller')

const openAiResolver = async (_, { input, history, format, system, model }) => {
  return aiService({ input, history, format, system, apiAndModel: model })
}

const ragSearchResolver = async (_, vars) => {
  return ragSearch(vars)
}

const generateImagesResolver = async (_, { input, format }) => {
  const images = await generateImages({ input, format })
  const { url } = images.data[0]
  const { stream } = await getImageStreamFromURL(url)

  const hashedFilename = crypto.randomBytes(6).toString('hex')

  const uploadedImage = await fileStorage.upload(
    stream,
    `dallE_${hashedFilename}.png`,
    { forceObjectKeyValue: `dallE${hashedFilename}.png` },
  )

  const uploadedImageKey = uploadedImage[0].key
  const s3url = await fileStorage.getURL(uploadedImageKey)
  logger.info(s3url)

  return { s3url, imageKey: uploadedImageKey }
}

const getImageUrlResolver = async (_, { imagekey }) => {
  const url = await fileStorage.getURL(imagekey)
  return url
}

const getGeneratedImagesResolver = async (_, { size, order = 'DESC' }) => {
  const sizeFilters = ['small', 'medium', 'full']
  const all = await fileStorage.list()
  const sortedByDate = (a, b) => new Date(a.modified) - new Date(b.modified)

  const sortedWithCustomOrder = (a, b) =>
    order === 'ASC' ? sortedByDate(b, a) : sortedByDate(a, b)

  const allImagesKeys = all.Contents.map(
    img => img.Key.startsWith('dallE') && img,
  ).filter(Boolean)

  // TODO: add the desctiption(caption) here
  const imagesData = await Promise.all(
    allImagesKeys.map(async img => {
      const key = img.Key
      const sizeWithExt = img.Key.split('_')?.pop() ?? ''
      const url = await fileStorage.getURL(img.Key)
      const modified = new Date(img.LastModified).toLocaleString()

      return {
        url,
        key,
        modified,
        ...(sizeWithExt ? { size: sizeWithExt.replace('.png', '') } : {}),
      }
    }),
  )

  return !sizeFilters.includes(size)
    ? imagesData.filter(img => !img.size).sort(sortedWithCustomOrder)
    : imagesData.filter(img => img.size === size).sort(sortedWithCustomOrder)
}

module.exports = {
  Query: {
    aiService: openAiResolver,
    generateImages: generateImagesResolver,
    ragSearch: ragSearchResolver,
    getImageUrl: getImageUrlResolver,
    getGeneratedImages: getGeneratedImagesResolver,
  },
}
