import React from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { useCurrentUser } from '@coko/client'
import styled from 'styled-components'
import { GET_BOOK, RENAME_BOOK } from '../graphql'
import { isOwner, hasEditAccess, isAdmin } from '../helpers/permissions'
import {
  showUnauthorizedActionModal,
  showGenericErrorModal,
} from '../helpers/commonModals'

import { BookTitle } from '../ui/createBook'
import Spin from '../ui/common/Spin'

const StyledSpin = styled(Spin)`
  display: grid;
  height: calc(100% - 48px);
  place-content: center;
`

const Loader = () => <StyledSpin spinning />

const BookTitlePage = () => {
  const { bookId } = useParams()
  const history = useHistory()
  const { currentUser } = useCurrentUser()
  const redirectToDashboard = () => history.push('/dashboard')

  const { loading, data: queryData } = useQuery(GET_BOOK, {
    fetchPolicy: 'network-only',
    variables: {
      id: bookId,
    },
  })

  const [renameBook, { loading: renameBookLoading }] = useMutation(
    RENAME_BOOK,
    {
      onCompleted: () => history.replace(`/books/${bookId}/producer`), // replace instead of push. this will take user to dashboard when click back instead of return to the rename page
      onError: err => {
        if (err.toString().includes('Not Authorised')) {
          return showUnauthorizedActionModal(true, redirectToDashboard)
        }

        return showGenericErrorModal(redirectToDashboard)
      },
    },
  )

  const canRename = currentUser
    ? isAdmin(currentUser) ||
      isOwner(bookId, currentUser) ||
      hasEditAccess(bookId, currentUser)
    : false

  const onClickContinue = title => {
    if (!canRename) {
      return showUnauthorizedActionModal(true, redirectToDashboard)
    }

    return renameBook({ variables: { id: bookId, title } })
  }

  if ((!currentUser && loading) || renameBookLoading) return <Loader />

  if (!canRename && !loading && !renameBookLoading) {
    showUnauthorizedActionModal(true, redirectToDashboard)
  }

  return (
    <BookTitle
      canRename={canRename}
      onClickContinue={onClickContinue}
      title={queryData?.getBook?.title || ''}
    />
  )
}

export default BookTitlePage
