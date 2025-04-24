/* eslint-disable no-await-in-loop */
const axios = require('axios')
const { logger } = require('@coko/server')
const { ApplicationParameter } = require('../models').models
const { callOn } = require('../utilities/utils')
const { getTokens, systemPrompt } = require('../api/graphql/helpers')

const COMPLETIONS_ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const EMBEDDINGS_ENDPOINT = 'https://api.openai.com/v1/embeddings'
const IMAGES_ENDPOINT = 'https://api.openai.com/v1/images/generations'
const DALL_E_MODEL = 'dall-e-3'
const EMBEDDINGS_MODEL = 'text-embedding-3-small'
const GPT_MODEL = 'gpt-4o'

const getHeaders = async () => {
  const CHAT_GPT_KEY = await ApplicationParameter.findOne({
    context: 'bookBuilder',
    area: 'chatGptApiKey',
  })

  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CHAT_GPT_KEY.config}`,
    },
    hasKey: !!CHAT_GPT_KEY?.config,
  }
}

const userMessages = (msgs = {}) => ({
  role: 'user',
  content: Object.entries(msgs).flatMap(([type, inputSrc]) =>
    inputSrc.map(input =>
      callOn(type, {
        text: () => ({ type, [type]: input }),
        image_url: () => ({ type, [type]: { url: input } }),
        default: () => input,
      }),
    ),
  ),
})

const systemMessage = content => ({ role: 'system', content })

const openAi = async ({
  input,
  history = [],
  format = 'json_object',
  system: passedSystem = { text: `You're a helpful assistant` },
}) => {
  try {
    const { headers, hasKey } = await getHeaders()

    if (!hasKey) {
      throw new Error('Missing access key')
    }

    const system = systemMessage(systemPrompt(passedSystem))

    const messages = [system, ...history, userMessages(input)]

    const ctxWindow = getTokens({
      input: [
        input.text.join('\n'),
        input?.image_src?.join('\n') || '',
        ...history.map(rec => rec.content),
        system.content,
      ],
      model: 'gpt-4',
    })

    logger.info(JSON.stringify(userMessages(input)))

    logger.info(`TOKENS: ${ctxWindow}`)

    const payload = {
      model: GPT_MODEL,
      messages,
      response_format: { type: format },
      max_tokens: 4096,
      temperature: 0,
    }

    const response = await axios.post(COMPLETIONS_ENDPOINT, payload, {
      headers,
    })

    logger.info(JSON.stringify(response.data.usage))

    return JSON.stringify(response.data.choices[0])
  } catch (e) {
    throw new Error('openAi:', e)
  }
}

const generateImages = async ({ input, format = 'b64_json' }) => {
  const { headers, hasKey } = await getHeaders()

  try {
    if (!hasKey) {
      throw new Error('Missing access key')
    }

    const payload = {
      model: DALL_E_MODEL,
      prompt: input,
      response_format: { type: format },
      n: 1,
    }

    const response = await axios.post(IMAGES_ENDPOINT, payload, { headers })

    logger.info(JSON.stringify(response.data))

    return JSON.stringify(response.data)
  } catch (e) {
    console.error('openAi:', e)
    throw new Error(e)
  }
}

const embeddings = async (input, retries = 3, delay = 5000) => {
  const { headers, hasKey } = await getHeaders()

  try {
    if (!hasKey) {
      throw new Error('Missing access key')
    }

    let response

    const payload = {
      model: EMBEDDINGS_MODEL,
      input,
    }

    const ctxWindow = getTokens({
      input: [input],
    })

    logger.info(ctxWindow)

    // eslint-disable-next-line no-plusplus
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        response = await axios.post(EMBEDDINGS_ENDPOINT, payload, { headers })
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

    return JSON.stringify(response.data)
  } catch (e) {
    console.error('openAi:', e)
    throw new Error(e)
  }
}

module.exports = { openAi, embeddings, generateImages }
