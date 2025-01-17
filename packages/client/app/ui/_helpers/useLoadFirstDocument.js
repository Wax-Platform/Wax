import { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { findFirstDocument } from '../dashboard/DocTreeManager/utils'

const useLoadFirstDocument = (getDocTreeData) => {
  const history = useHistory()
  const { docIdentifier } = useParams()

  useEffect(async () => {
    if (!docIdentifier) {
      const { data } = await getDocTreeData()
      const allData = JSON.parse(data.getDocTree)
      const firstDoc = findFirstDocument(allData)

      if (firstDoc) {
        history.push(`/${firstDoc.identifier}`, { replace: true })
        return true
      } else {
       
          const identifier = Array.from(Array(20), () =>
            Math.floor(Math.random() * 36).toString(36),
          ).join('')
      
          history.push(`/${identifier}`, { replace: true })
          return true
      }
    }
  }, [])


  return docIdentifier
}

export default useLoadFirstDocument
