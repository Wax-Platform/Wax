import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { GET_ENTIRE_BOOK, GET_BOOK_COMPONENT, GET_BOOKS } from '../graphql'
import AiPDFDesigner from '../ui/AiPDFDesigner/AiPDFDesigner'
import { CssAssistantContext } from '../ui/AiPDFDesigner/hooks/CssAssistantContext'

const AiPDFDesignerPage = ({ bookId }) => {
  const { bookComponentId } = useParams()
  const { setPassedContent } = useContext(CssAssistantContext)
 
  const [bookTitle, setBookTitle] = useState('')

  const { data: bookQueryData } = useQuery(GET_ENTIRE_BOOK, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    variables: {
      id: bookId,
    },
  })

  const [getDivision] = useLazyQuery(GET_BOOK_COMPONENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (bookQueryData?.getBook?.divisions[1]) {
      setBookTitle(bookQueryData?.getBook.title)
      // templatesData && console.log(templatesData)

      // const chaptersIds = bookQueryData.getBook.divisions[1].bookComponents.map(
      //   division => division.id,
      // )

      // console.log(chaptersIds)
      const chaptersIds = [bookComponentId]
      
      setPassedContent('')
      Promise.all(
        chaptersIds.map((chapterId, i) =>
          getDivision({ variables: { id: chapterId } })
            .then(
              ({ data: chapter }) =>
                `<div class="chapter chapter-${i + 1}">${
                  chapter.getBookComponent.content
                }</div>`,
            )
            .catch(e => {
              throw new Error(e)
            }),
        ),
      ).then(chaptersContent => {
        setPassedContent(chaptersContent.join(''))
      })
    }
  }, [bookQueryData])

  return <AiPDFDesigner bookTitle={bookTitle} />
}

// eslint-disable-next-line react/function-component-definition
export default props => {
  const { loading, data: dataBooks } = useQuery(GET_BOOKS, {
    fetchPolicy: 'network-only',
    variables: {
      options: {
        archived: false,
        orderBy: {
          column: 'title',
          order: 'asc',
        },
        page: 0,
        pageSize: 10,
      },
    },
  })

  if (loading) return null

  const [book] = dataBooks.getBooks.result

  return <AiPDFDesignerPage {...props} bookId={book.id} />
}
