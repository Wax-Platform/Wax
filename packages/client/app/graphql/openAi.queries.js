/* eslint-disable import/prefer-default-export */
import { gql } from '@apollo/client'

const USE_CHATGPT = gql`
  query OpenAi(
    $input: UserMessage!
    $history: [OpenAiMessage]
    $system: SystemMessage
    $format: String
  ) {
    openAi(input: $input, history: $history, format: $format, system: $system)
  }
`

const RAG_SEARCH = gql`
  query RagSearch(
    $input: UserMessage!
    $history: [OpenAiMessage]
    $embeddingOptions: EmbeddingOptions
    $system: SystemMessage
    $bookId: String!
  ) {
    ragSearch(
      input: $input
      history: $history
      embeddingOptions: $embeddingOptions
      system: $system
      bookId: $bookId
    )
  }
`

export { USE_CHATGPT, RAG_SEARCH }
