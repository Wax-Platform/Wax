/* eslint-disable camelcase */
const { encoding_for_model } = require('@dqbd/tiktoken')
const { callOn } = require('../../utilities/utils')

const getTokens = ({
  input, // array of texts
  model = 'text-embedding-ada-002',
}) => {
  const encoder = encoding_for_model(model)

  const tokens = input
    .map(text => encoder.encode(text).length)
    .reduce((acc, curr) => acc + curr, 0)

  encoder.free()
  return tokens
}

const jsonBlockString = shape =>
  `RESPONSE: Your responses must be formatted as a stringified JSON object with the following structure:\n\`\`\`json\n${shape}\n\`\`\`\n`

const responseShape = ({ shape, type = 'text' }) =>
  ({
    json_object: jsonBlockString(shape),
    text: shape ?? '\n',
  }[type])

/**
 * @typedef {Object} SystemMessage
 * @property {string} role - Role of the assistant.
 * @property {string} task - Task to be performed.
 * @property {?string} context - Additional context for the task.
 * @property {{type: ('json'|'text'), shape: (string|{[key: string]: any})}} response - Expected response format.
 *   - When type is 'json', shape must be a stringified JSON object representing the structure of the expected response.
 *   - When type is 'text', shape should be a plain text string.
 * @property {Array<string>} notes - Additional notes or instructions.
 * @property {?string} text - Custom text to override the default prompt generation.
 *
 * Generates a formatted prompt for a given task, including details about the role, context, expected response format, and additional notes.
 * Utilizes a helper function {@linkcode responseShape} to define the structure of the expected response.
 *
 * @param {SystemMessage} options - Options for generating the prompt.
 * @returns {string} Formatted prompt string.
 */

const systemInputTransform = ({
  task,
  role,
  context,
  response,
  notes,
  text,
}) => {
  return (
    text ??
    `ROLE: ${role}\nTASK: ${task}
${
  context ? `\nBEGIN CONTEXT BLOCK:\n${context}\nEND CONTEXT BLOCK\n\n` : '\n'
}${responseShape(response)}
${notes?.length > 0 ? `**Note:**\n\n${notes.map(note => `\t- ${note}`)}` : ''}
`
  )
}

const userInputTransform = msgs => {
  const contentTransform = {
    text: (type, input) => ({ type, [type]: input }),
    image_url: (type, input) => ({ type, [type]: { url: input } }),
    default: (type, input) => ({ type, [type]: input }),
  }

  const messagesEntries = Object.entries(msgs)

  const content = messagesEntries.flatMap(([type, inputSrc]) =>
    inputSrc.map(input => callOn(type, contentTransform, [type, input])),
  )

  return content
}

const userPrompt = userInput => {
  const content = userInputTransform(userInput)
  return { role: 'user', content }
}

const systemPrompt = system => {
  const content = systemInputTransform(system)
  return { role: 'system', content }
}

module.exports = {
  getTokens,
  userPrompt,
  systemPrompt,
}
