import { gql } from '@apollo/client'

export const CALL_AI_SERVICE = gql`
  query AiService(
    $input: UserMessage!
    $history: [OpenAiMessage]
    $system: SystemMessage
    $format: String
    $model: [String]
  ) {
    aiService(
      input: $input
      history: $history
      format: $format
      system: $system
      model: $model
    )
  }
`

export const RAG_SEARCH_QUERY = gql`
  query RagSearch(
    $input: UserMessage!
    $history: [OpenAiMessage]
    $embeddingOptions: EmbeddingOptions
    $system: SystemMessage
    $resultsOnly: Boolean
  ) {
    ragSearch(
      input: $input
      history: $history
      embeddingOptions: $embeddingOptions
      system: $system
      resultsOnly: $resultsOnly
    )
  }
`
export const GENERATE_IMAGES = gql`
  query GenerateImages($input: String!, $format: String) {
    generateImages(input: $input, format: $format) {
      s3url
      imageKey
    }
  }
`
export const GET_IMAGE_URL = gql`
  query GetImageUrl($imagekey: String!) {
    getImageUrl(imagekey: $imagekey)
  }
`
export const GET_IMAGES_URL = gql`
  query GetGeneratedImages($size: String) {
    getGeneratedImages(size: $size) {
      url
      key
      size
      modified
    }
  }
`

export default CALL_AI_SERVICE
