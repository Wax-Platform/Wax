import { gql } from '@apollo/client'

export const CREATE_CHAT_CHANNEL = gql`
  mutation CreateChatChannel($input: ChatChannelFilter!) {
    createChatChannel(input: $input) {
      id
    }
  }
`

export const GET_CHAT_CHANNEL = gql`
  query chatChannel($id: ID!) {
    chatChannel(id: $id) {
      id
      created
      updated
      chatType
      relatedObjectId
      messages {
        id
        content
        created
        user {
          id
          displayName
        }
        mentions
        attachments {
          id
          name
          url(size: medium)
        }
      }
    }
  }
`

export const FILTER_CHAT_CHANNELS = gql`
  query ChatChannels($filter: ChatChannelFilter) {
    chatChannels(filter: $filter) {
      result {
        id
        created
        updated
        chatType
        relatedObjectId
        messages {
          id
          content
          created
          user {
            id
            displayName
          }
          mentions
          attachments {
            id
            name
            url(size: medium)
          }
        }
      }
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendChatMessageInput!) {
    sendChatMessage(input: $input) {
      id
      chatChannelId
      content
      isDeleted
      mentions
      attachments {
        id
        name
        url(size: medium)
      }
    }
  }
`

export const MESSAGE_CREATED_SUBSCRIPTION = gql`
  subscription MessageCreated($chatChannelId: ID!) {
    messageCreated(chatChannelId: $chatChannelId) {
      id
      chatChannelId
      content
      created
      user {
        id
        displayName
      }
      mentions
      attachments {
        id
        name
        url(size: medium)
      }
    }
  }
`

export const CANCEL_EMAIL_NOTIFICATION = gql`
  mutation cancelEmailNotification($chatChannelId: ID!) {
    cancelEmailNotification(chatChannelId: $chatChannelId)
  }
`
