const { openAi, embeddings } = require('../../../controllers/openAi.controller')
const { getFileContents } = require('../../../controllers/document.controller')
const { Embedding } = require('../../../models').models

const openAiResolver = async (_, { input, history, format, system }) => {
  return openAi({ input, history, format, system })
}

const ragSearchResolver = async (
  _,
  { input, history, embeddingOptions = {}, system: passedSystem, bookId },
) => {
  const resultedEmbeddingData = await embeddings(input.text.join('\n'))
  const { data } = JSON.parse(resultedEmbeddingData)
  const { embedding } = data[0]

  const embeddingsFound = await Embedding.indexedSimilaritySearch({
    bookId,
    embedding,
    ...embeddingOptions,
  })

  // TODO: upload the file also and store its key on document
  const embeddingsContent = await Promise.all(
    embeddingsFound.map(m => getFileContents(m.storedObjectKey)),
  )

  const system = { ...passedSystem, context: embeddingsContent }

  const queryOpenAi = await openAi({
    input,
    history,
    system,
  })

  return queryOpenAi
}

module.exports = {
  Query: {
    openAi: openAiResolver,
    ragSearch: ragSearchResolver,
  },
}
