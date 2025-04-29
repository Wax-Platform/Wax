import React from 'react'
import { useHistory } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { useCurrentUser } from '@coko/client'
import { InitBook } from '../ui'
import { CREATE_BOOK, GET_TREE_MANAGER_AND_SHARED_DOCS } from '../graphql'
import { showGenericErrorModal } from '../helpers/commonModals'
import { findFirstDocument } from '../ui/DocTreeManager/utils'

const CreateBook = () => {
  const history = useHistory()
  const { currentUser, setCurrentUser } = useCurrentUser()

  const { loading, data: documents } = useQuery(
    GET_TREE_MANAGER_AND_SHARED_DOCS,
  )

  const [createBook] = useMutation(CREATE_BOOK, {
    onError: () => {
      return showGenericErrorModal()
    },
  })

  const createBookHandler = () => {
    const variables = { input: { addUserToBookTeams: ['owner'] } }

    return createBook({ variables }).then(res => {
      const { data } = res
      const { createBook: createBookData } = data
      const { newUserTeam } = createBookData

      setCurrentUser({
        ...currentUser,
        teams: [...currentUser.teams, newUserTeam],
      })

      history.push({ pathname: `/` })
    })
  }

  const onCreateBook = () => {
    return createBookHandler('rename')
  }

  if (loading) return null

  const root = JSON.parse(documents.getDocTree)

  const firstDocument = findFirstDocument(root)

  if (firstDocument) {
    history.push(`/document/${firstDocument?.bookComponentId}`, {
      replace: true,
    })
    return true
  }

  return <InitBook onCreateBook={onCreateBook} />
}

export default CreateBook
