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
          name
          url
        }
      }
    }
  }
`

export const FILTER_CHAT_CHANNELS = gql`
  query ChatChannels($where: ChatChannelFilter) {
    chatChannels(where: $where) {
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
            name
            url
          }
        }
      }
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendChatMessageInput!) {
    sendMessage(input: $input) {
      id
      chatChannelId
      content
      isDeleted
      mentions
      attachments {
        name
        url
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
        name
        url
      }
    }
  }
`

export const CANCEL_EMAIL_NOTIFICATION = gql`
  mutation cancelEmailNotification($chatChannelId: ID!) {
    cancelEmailNotification(chatChannelId: $chatChannelId)
  }
`
