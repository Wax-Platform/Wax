import React, { useEffect, useState } from 'react'
import { useCurrentUser } from '@coko/client'
import { useDocumentContext } from '../../dashboard/hooks/DocumentContext'
import styled from 'styled-components'

const Link = styled.a`
  align-items: center;
  color: ${p => (p.$disabled ? `#aaa` : `currentColor`)};
  cursor: ${p => (p.$disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  padding: 0 10px;

  svg {
    height: 32px;
    width: 32px;
  }
`

const JitsiMeetLink = ({ domain = 'meet.jit.si' }) => {
  const [meetingLink, setMeetingLink] = useState('')
  const { currentDoc } = useDocumentContext()
  const { currentUser } = useCurrentUser()
  const { displayName } = currentUser || {}

  useEffect(() => {
    const roomName = `${currentDoc?.title}-${currentDoc?.id}`
    const url = new URL(`https://${domain}/${roomName}`)
    if (displayName) {
      url.hash = `userInfo.displayName="${displayName}"`
    }
    setMeetingLink(url.toString())
  }, [currentDoc, domain, displayName])

  return (
    <Link
      $disabled={!currentDoc?.id}
      href={currentDoc?.id ? meetingLink : '#'}
      target="_blank"
      rel="noreferrer"
    >
      <svg fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path
          clipRule="evenodd"
          d="m16.5815 33.2759c0-2.2092 1.7909-4 4-4h40.4861c2.2091 0 4 1.7908 4 4v9.5558l13.851-7.9969c2-1.1547 4.5.2887 4.5 2.5981v25.1346c0 2.3094-2.5 3.7528-4.5 2.5981l-13.851-7.9969v9.5555c0 2.2092-1.7909 4-4 4h-40.4861c-2.2091 0-4-1.7908-4-4zm8.1661 28.0581c-.8285 0-1.5.6716-1.5 1.5s.6715 1.5 1.5 1.5h3.7603c.8285 0 1.5-.6716 1.5-1.5s-.6715-1.5-1.5-1.5z"
          fill="rgb(0,0,0)"
          fillRule="evenodd"
        />
      </svg>
    </Link>
  )
}

export default JitsiMeetLink
