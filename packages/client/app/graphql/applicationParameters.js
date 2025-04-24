/* eslint-disable import/prefer-default-export */
import { gql } from '@apollo/client'

const APPLICATION_PARAMETERS = gql`
  query ApplicationParameters($context: String, $area: String) {
    getApplicationParameters(context: $context, area: $area) {
      id
      context
      area
      config
    }
  }
`

const UPDATE_APPLICATION_PARAMETERS = gql`
  mutation UpdateApplicationParameters($input: updateParametersInput!) {
    updateApplicationParameters(input: $input) {
      id
    }
  }
`

const UPLOAD_TRANSLATION = gql`
  mutation UploadTranslation($file: Upload, $code: String) {
    uploadTranslation(file: $file, code: $code)
  }
`

export {
  APPLICATION_PARAMETERS,
  UPDATE_APPLICATION_PARAMETERS,
  UPLOAD_TRANSLATION,
}
