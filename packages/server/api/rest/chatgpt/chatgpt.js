const { logger } = require('@coko/server')
const axios = require('axios')

module.exports = app => {
  app.post('/api/askChatGpt', async (req, res, next) => {
    const body = { ...req.body }

    const { CHATGPT_URL, CHATGPT_KEY } = process.env

    try {
      const response = await axios.post(
        CHATGPT_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: body.prompt,
            },
          ],
          temperature: 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CHATGPT_KEY}`,
          },
        },
      )

      res.end(response.data.choices[0].message.content)
    } catch (e) {
      logger.error(e)
      throw new Error(e)
    }
  })
}
