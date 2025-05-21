/* eslint-disable react/prop-types */

import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { GET_ENTIRE_BOOK, GET_BOOK_COMPONENT, GET_BOOKS } from '../graphql'
import AiPDFDesigner from '../ui/AiPDFDesigner/AiPDFDesigner'
import { CssAssistantContext } from '../ui/AiPDFDesigner/hooks/CssAssistantContext'
import YjsContext from '../ui/provider-yjs/YjsProvider'

export default () => {
  const { bookComponentId } = useParams()
  const { setPassedContent } = useContext(CssAssistantContext)
  const { wsProvider } = useContext(YjsContext)
  let content = ''
  const [bookTitle, setBookTitle] = useState('')

  const [getDivision] = useLazyQuery(GET_BOOK_COMPONENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
  })

  useEffect(()=> {
    if (wsProvider) {
      wsProvider?.disconnect()
    }
    setPassedContent('')
    getDivision({ variables: { id: bookComponentId } })
      .then(({ data: chapter }) => {
        content = chapter.getBookComponent.content
        setBookTitle(chapter.getBookComponent.title)

        setPassedContent(
          `<div class="chapter chapter-1">${content}</div>`
        )
      })
      .catch(e => {
        setPassedContent('')
        throw new Error(e)
      })
  },[])

  return <AiPDFDesigner bookTitle={bookTitle} />
}

