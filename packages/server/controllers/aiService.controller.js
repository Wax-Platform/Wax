/* eslint-disable no-await-in-loop */
const { post, get } = require('axios')
const { logger } = require('@coko/server')
const stream = require('stream')
const { getTokens, systemPrompt, userPrompt } = require('../api/helpers')
const { Embedding } = require('../models')
const { getFileContents } = require('./document.controller')

const { stringify } = JSON

const { OPENAI_API_KEY = '', MISTRAL_API_KEY = '' } = process.env
const EMBEDDINGS_ENDPOINT = 'https://api.openai.com/v1/embeddings'
const EMBEDDINGS_MODEL = 'text-embedding-3-small'

const models = {
  openAi: {
    apiKey: OPENAI_API_KEY,
    completions: {
      'gpt-4o': 'https://api.openai.com/v1/chat/completions',
      'o3-mini': 'https://api.openai.com/v1/chat/completions',
    },
    embeddings: {
      'text-embedding-3-small': 'https://api.openai.com/v1/embeddings',
    },
    images: {
      'dall-e-3': 'https://api.openai.com/v1/images/generations',
    },
  },
  mistral: {
    apiKey: MISTRAL_API_KEY,
    completions: {
      'mistral-large-latest': 'https://api.mistral.ai/v1/chat/completions',
      'mistral-small-latest': 'https://api.mistral.ai/v1/chat/completions',
      'open-mixtral-8x22b': 'https://api.mistral.ai/v1/chat/completions',
    },
  },
}

const getModel = (api, model, purpose) => {
  const { apiKey } = models[api]
  return {
    endpoint: models[api][purpose][model],
    apiKey: apiKey ?? '',
    headers: {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    },
  }
}

const HEADERS = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  },
}

const aiService = async ({
  input,
  history = [],
  format = 'json_object',
  system: passedSystem = { text: `You're a helpful assistant` },
  apiAndModel = ['openAi', 'gpt-4o'],
}) => {
  const [api, model] = apiAndModel
  const { headers, endpoint, apiKey } = getModel(api, model, 'completions')

  try {
    if (!apiKey) throw new Error('Missing access key')
    const system = systemPrompt(passedSystem)
    const userInput = userPrompt(input)

    const messages = [system, ...history, userInput]

    const ctxWindow = getTokens({
      input: [
        input.text.join('\n'),
        input?.image_src?.join('\n') || '',
        ...history.map(rec => rec.content),
        system.content,
      ],
      model: 'gpt-4',
    })

    logger.info(
      `\x1b[33mQuerying AI using: \x1b[32m${model}, \x1b[33m tokens: ${`\x1b[3${
        ctxWindow < 30000 ? '2' : '1'
      }m`}${ctxWindow} `,
    )

    const payload = {
      model,
      messages,
      response_format: { type: format },
      max_tokens: 4096,
      temperature: 0,
    }

    const response = await post(endpoint, payload, headers)

    return stringify(response.data.choices[0])
  } catch (e) {
    console.error('openAi:', e)
    throw new Error(e)
  }
}

const generateImages = async ({
  input,
  apiAndModel = ['openAi', 'dall-e-3'],
}) => {
  const [api, model] = apiAndModel
  const { headers, endpoint, apiKey } = getModel(api, model, 'images')

  try {
    logger.info(`\x1b[33mGenerating image using: \x1b[32m${model} `)

    if (!apiKey) {
      throw new Error('Missing access key')
    }

    const payload = {
      model,
      prompt: input,
      n: 1,
      size: '1024x1024',
      // response_format: format, // there's an issue with this
    }

    const response = await post(endpoint, payload, headers)
    return response.data
  } catch (e) {
    console.error('aiService:', e)
    throw new Error(e)
  }
}

const generateEmbeddings = async (
  input,
  retries = 3,
  delay = 5000,
  apiAndModel = ['openAi', 'text-embedding-3-small'],
) => {
  const tokens = getTokens({
    input: [input],
  })

  logger.info(
    `\x1b[33mGenerating embedding using: \x1b[32m${EMBEDDINGS_MODEL}, \x1b[33m tokens: \x1b[32m${tokens}`,
  )

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('Missing access key')
    }

    let response

    const payload = {
      model: EMBEDDINGS_MODEL,
      input,
    }

    // eslint-disable-next-line no-plusplus
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        response = await post(EMBEDDINGS_ENDPOINT, payload, HEADERS)
        break
      } catch (error) {
        if (error.response && error.response.status === 429) {
          await new Promise(resolve => {
            setTimeout(resolve, delay)
          })
        } else if (attempt < retries) {
          await new Promise(resolve => {
            setTimeout(resolve, delay)
          })
        } else {
          throw error
        }
      }
    }

    return stringify(response.data)
  } catch (e) {
    console.error('aiService:', e)
    throw new Error(e)
  }
}

const getImageStreamFromURL = async url => {
  try {
    const response = await get(url, { responseType: 'arraybuffer' })
    const base64 = Buffer.from(response.data, 'binary').toString('base64')

    const buffer = Buffer.from(base64, 'base64')

    const passThroughStream = new stream.PassThrough()

    passThroughStream.end(buffer)
    return { stream: passThroughStream, base64 }
  } catch (error) {
    logger.error('Error fetching image:', error)
    return ''
  }
}

const ragSearch = async ({
  input,
  history,
  embeddingOptions = {},
  system: passedSystem = [],
  resultsOnly,
}) => {
  logger.info(`\x1b[32mGenerating RAG query`)

  const resultedEmbeddingData = await generateEmbeddings(input.text.join('\n'))
  const { data } = JSON.parse(resultedEmbeddingData)
  const [userInputEmbedding] = data

  const embeddingsFound = await Embedding.indexedSimilaritySearch({
    embedding: userInputEmbedding.embedding,
    ...embeddingOptions,
  })

  const embeddingsContent = await Promise.all(
    embeddingsFound.map(m => getFileContents(m.storedObjectKey)),
  )

  if (resultsOnly) return stringify(embeddingsContent)

  const system = { ...passedSystem, context: embeddingsContent }

  const queryOpenAi = await aiService({
    input,
    history,
    system,
    format: system.response.type,
  })

  return queryOpenAi
}

module.exports = {
  aiService,
  generateEmbeddings,
  generateImages,
  ragSearch,
  getImageStreamFromURL,
}
