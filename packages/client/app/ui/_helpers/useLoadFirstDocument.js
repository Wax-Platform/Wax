import { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { findFirstDocument } from '../dashboard/DocTreeManager/utils'
import { useDocumentContext } from '../dashboard/hooks/DocumentContext'

const useLoadFirstDocument = getDocTreeData => {
  const history = useHistory()
  // const { setCurrentDoc } = useDocumentContext()
  const { docIdentifier } = useParams()

  useEffect(async () => {
    if (!docIdentifier) {
      // // const { data } = await getDocTreeData()
      // // const allData = JSON.parse(data.getDocTree)
      // // const firstDoc = findFirstDocument(allData)
      // const identifier = Array.from(Array(20), () =>
      //   Math.floor(Math.random() * 36).toString(36),
      // ).join('')
      // history.push(`/${identifier}`, { replace: true })
      // return true
    }
  }, [])

  return docIdentifier
}

export default useLoadFirstDocument
